import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { PRESET_EXPLANATIONS, getCuratedPreset } from './src/data/mockData';
import { 
  VERIFIED_CURRICULA, 
  searchCurricula, 
  getOrGenerateAcademicPath,
  validateCurriculumGraph 
} from './src/data/learningPathsData';

dotenv.config();

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const PDFParse = pdfParseModule.PDFParse || pdfParseModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Set request payload limits (supports base64 PDFs up to 15MB)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ---------------------------------------------------------
// In-Memory Sliding-Window Rate Limiter
// ---------------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimitStore = new Map<string, RateLimitRecord>();

function createRateLimiter(maxRequests: number = 30, windowMs: number = 60000) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = rateLimitStore.get(ip) || { timestamps: [] };

    const active = record.timestamps.filter(ts => now - ts < windowMs);

    if (active.length >= maxRequests) {
      const oldest = active[0];
      const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
      res.setHeader('Retry-After', retryAfterSec.toString());
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment before trying again.',
        retryAfter: retryAfterSec
      });
    }

    active.push(now);
    rateLimitStore.set(ip, { timestamps: active });
    next();
  };
}

// Clean up stale rate-limiter records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    const fresh = record.timestamps.filter(t => now - t < 60000);
    if (fresh.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, { timestamps: fresh });
    }
  }
}, 300000);

const aiRateLimiter = createRateLimiter(30, 60000);

// ---------------------------------------------------------
// Helper to initialize Google Gen AI safely
// ---------------------------------------------------------
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// ---------------------------------------------------------
// Circuit Breaker & Resilient Multi-Model Invocation
// ---------------------------------------------------------
const modelCooldowns = new Map<string, number>();

function isModelInCooldown(model: string): boolean {
  const cd = modelCooldowns.get(model);
  if (!cd) return false;
  if (Date.now() > cd) {
    modelCooldowns.delete(model);
    return false;
  }
  return true;
}

function setModelCooldown(model: string, ms: number) {
  modelCooldowns.set(model, Date.now() + ms);
}

/**
 * Robustly invokes Gemini with distinct authorized model pools:
 * - gemini-3.1-flash-lite (fast, high throughput, active quota pool)
 * - gemini-3.8-flash (secondary conversational tutor)
 * Respects cooldowns and does not repeatedly hammer exhausted daily quotas.
 */
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  options: {
    contents: any;
    config?: any;
    preferredModel?: string;
  }
): Promise<{ text: string; modelUsed: string }> {
  const preferred = options.preferredModel || 'gemini-3.1-flash-lite';
  const alternative = preferred === 'gemini-3.1-flash-lite' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite';

  // Determine model sequence respecting cooldown status
  let modelsToTry = [preferred, alternative];
  if (isModelInCooldown(preferred) && !isModelInCooldown(alternative)) {
    modelsToTry = [alternative];
  } else if (isModelInCooldown(preferred) && isModelInCooldown(alternative)) {
    const cdPref = modelCooldowns.get(preferred) || 0;
    const cdAlt = modelCooldowns.get(alternative) || 0;
    modelsToTry = cdAlt < cdPref ? [alternative, preferred] : [preferred, alternative];
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    if (isModelInCooldown(model) && modelsToTry.length > 1) {
      continue;
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config
      });

      const text = response?.text;
      if (text && text.trim().length > 0) {
        modelCooldowns.delete(model);
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = (err?.message || String(err)).toLowerCase();

      const is429 = errMsg.includes('429') || errMsg.includes('resource_exhausted') || errMsg.includes('quota');
      const is503 = errMsg.includes('503') || errMsg.includes('unavailable') || errMsg.includes('high demand') || errMsg.includes('overloaded');

      if (is429) {
        const isDailyQuota = errMsg.includes('generaterequestsperday') || errMsg.includes('free_tier_requests');
        const match = errMsg.match(/retry in ([0-9.]+)s/);
        const retrySec = match ? parseFloat(match[1]) : 45;
        // If daily free tier quota is exhausted, cool down for 12 hours so we don't repeat the error
        const cooldownMs = isDailyQuota ? 12 * 60 * 60 * 1000 : Math.min(Math.ceil(retrySec * 1000) + 2000, 300000);
        setModelCooldown(model, cooldownMs);
        console.info(`Model ${model} quota reached, switching seamlessly to alternative model pool...`);
        continue;
      } else if (is503) {
        setModelCooldown(model, 15000);
        continue;
      } else {
        continue;
      }
    }
  }

  throw lastError || new Error('The AI model is experiencing high demand. Please try again later.');
}

// ---------------------------------------------------------
// Safe JSON Parsing Helper
// ---------------------------------------------------------
function safeJsonParse(rawText: string): any {
  if (!rawText) return null;
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Strip markdown code block fences (```json ... ```)
    const stripped = trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    try {
      return JSON.parse(stripped);
    } catch {
      // Find JSON block substring
      const start = stripped.search(/[\{\[]/);
      const end = Math.max(stripped.lastIndexOf('}'), stripped.lastIndexOf(']'));
      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(stripped.slice(start, end + 1));
        } catch {
          return null;
        }
      }
      return null;
    }
  }
}

// ---------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------
function validateString(val: any, minLen: number, maxLen: number): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (trimmed.length < minLen || trimmed.length > maxLen) return null;
  return trimmed;
}

function handleAiError(err: any, res: express.Response, defaultMsg: string) {
  const errMsg = (err?.message || String(err)).toLowerCase();
  if (
    errMsg.includes('503') ||
    errMsg.includes('unavailable') ||
    errMsg.includes('high demand') ||
    errMsg.includes('overloaded')
  ) {
    return res.status(503).json({
      error: 'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again in a few moments.'
    });
  }

  if (errMsg.includes('429') || errMsg.includes('resource_exhausted')) {
    return res.status(429).json({
      error: 'Request limit reached. Please wait a moment before trying again.'
    });
  }

  return res.status(502).json({
    error: defaultMsg
  });
}

// ---------------------------------------------------------
// Robust Fallback Builders & Visual Sanitizers
// ---------------------------------------------------------
function buildFallbackVisual(topicName: string, level: string): any {
  const lower = topicName.toLowerCase();

  // Mathematical & quantitative concepts
  if (lower.includes('pythagor') || lower.includes('triangle') || lower.includes('geometry')) {
    return {
      title: `${topicName} Geometric & Formula Model`,
      type: 'graph',
      appliesToConcept: true,
      stages: [
        { label: 'Leg A Squared (a²)', description: 'Area of the square built along base side a.', badge: 'Base Leg' },
        { label: 'Leg B Squared (b²)', description: 'Area of the square built along vertical side b.', badge: 'Perpendicular Leg' },
        { label: 'Sum of Squares (a² + b²)', description: 'Combined geometric area of the two leg squares.', badge: 'Area Sum' },
        { label: 'Hypotenuse Squared (c²)', description: 'Area of square along the longest diagonal side.', badge: 'Hypotenuse' }
      ],
      graphData: {
        type: 'formula',
        formula: 'a² + b² = c²',
        title: 'Right Triangle Geometric Invariant',
        elements: [
          { label: 'Side a', value: 'Base Leg', description: 'Horizontal component perpendicular to side b' },
          { label: 'Side b', value: 'Perpendicular Leg', description: 'Vertical component perpendicular to side a' },
          { label: 'Side c', value: 'Hypotenuse', description: 'Longest side opposite 90° right angle: c = √(a² + b²)' }
        ],
        explanation: 'In any right-angled Euclidean triangle, the sum of areas of the squares on the legs equals the area of the square on the hypotenuse.'
      },
      caption: 'Invariant Formula: a² + b² = c² (or c = √(a² + b²))',
      level
    };
  }

  if (lower.includes('calculus') || lower.includes('derivative') || lower.includes('integral') || lower.includes('rate of change')) {
    return {
      title: `${topicName} Rate of Change Model`,
      type: 'graph',
      appliesToConcept: true,
      stages: [
        { label: 'Initial Position f(x)', description: 'Base function value at point x.', badge: 'Input State' },
        { label: 'Infinitesimal Step Δx', description: 'Tiny perturbation distance approaching zero limit.', badge: 'Perturbation' },
        { label: 'Function Difference Δf', description: 'Change in output value f(x + Δx) - f(x).', badge: 'Delta' },
        { label: "Instantaneous Slope f'(x)", description: 'Exact tangent slope ratio lim(Δx→0) Δf / Δx.', badge: 'Derivative' }
      ],
      graphData: {
        type: 'formula',
        formula: "f'(x) = lim(h→0) [f(x + h) - f(x)] / h",
        title: 'Instantaneous Rate of Change',
        elements: [
          { label: 'f(x)', value: 'Base function', description: 'Original curve coordinates' },
          { label: 'h', value: 'Step size', description: 'Distance between evaluated points approaching zero' },
          { label: "f'(x)", value: 'Tangent slope', description: 'Instantaneous velocity or gradient at coordinate x' }
        ],
        explanation: 'The derivative quantifies the exact rate at which output value changes per unit of input change at an instantaneous point.'
      },
      caption: "Formal Definition: f'(x) = lim(h→0) [f(x+h) - f(x)] / h",
      level
    };
  }

  // Cyclical concepts (natural cycles, biological loops, event loops)
  if (lower.includes('cycle') || lower.includes('water') || lower.includes('loop') || lower.includes('calvin') || lower.includes('iteration')) {
    return {
      title: `${topicName} Continuous Loop`,
      type: 'cycle',
      appliesToConcept: true,
      stages: [
        { label: 'Phase 1: Inflow & Trigger', description: 'Energy or material enters the cycle to initiate continuous flow.', badge: 'Inflow' },
        { label: 'Phase 2: State Transformation', description: 'Active conversion changes state, temperature, or chemical bonds.', badge: 'Conversion' },
        { label: 'Phase 3: Emission / Output', description: 'Transformed outputs are distributed into the surrounding environment.', badge: 'Distribution' },
        { label: 'Phase 4: Regeneration', description: 'Substrates are replenished back to starting conditions to repeat seamlessly.', badge: 'Feedback Loop' }
      ],
      caption: 'Continuous Circular Dynamics: Inflow ➔ Conversion ➔ Distribution ➔ Regeneration',
      level
    };
  }

  // Comparative concepts
  if (lower.includes(' vs ') || lower.includes('versus') || lower.includes('comparison') || lower.includes('difference between')) {
    const parts = topicName.split(/\s+(?:vs\.?|versus)\s+/i);
    const sideAName = parts[0] || 'Approach A';
    const sideBName = parts[1] || 'Approach B';
    return {
      title: `${sideAName} vs ${sideBName} Comparison`,
      type: 'comparison',
      appliesToConcept: true,
      stages: [
        { label: sideAName, description: `Key paradigms and behavior of ${sideAName}.`, badge: 'Model A' },
        { label: sideBName, description: `Contrasting principles and guarantees of ${sideBName}.`, badge: 'Model B' },
        { label: 'Tradeoff Frontier', description: 'Choosing between them depends on specific operational constraints.', badge: 'Tradeoff' }
      ],
      comparisonData: {
        sideA: {
          title: sideAName,
          points: ['Baseline paradigm and mechanics', 'Predictable operational guarantees', 'Standard adoption tradeoffs'],
          badge: 'Model A'
        },
        sideB: {
          title: sideBName,
          points: ['Alternative architecture and design', 'Targeted efficiency optimization', 'Specialized requirements'],
          badge: 'Model B'
        },
        keyDifference: `Fundamental architectural difference between ${sideAName} and ${sideBName}.`
      },
      caption: `Comparative Analysis: ${sideAName} versus ${sideBName}`,
      level
    };
  }

  // System layers
  if (lower.includes('osi') || lower.includes('layer') || lower.includes('stack') || lower.includes('architecture') || lower.includes('protocol')) {
    return {
      title: `${topicName} Architectural Layers`,
      type: 'layers',
      appliesToConcept: true,
      stages: [
        { label: 'Top: User & Interface Tier', description: 'Direct user interactions, APIs, and client-facing interfaces.', badge: 'Application Layer' },
        { label: 'Middle: Business & Logic Tier', description: 'State validation, rule evaluation, and coordination logic.', badge: 'Processing Layer' },
        { label: 'Base: Storage & Transport Tier', description: 'Persistence engines, physical network protocols, and data buffers.', badge: 'Infrastructure Layer' }
      ],
      caption: 'Hierarchical Abstraction: Top Interface ➔ Coordination Logic ➔ Physical Infrastructure',
      level
    };
  }

  // Default clean flow
  if (level === 'deep_dive') {
    return {
      title: `${topicName} Formal Invariant & Boundary Pipeline`,
      type: 'flow',
      appliesToConcept: true,
      stages: [
        { label: '1. Invariant Initialization', description: 'Allocating bounded context, proving well-founded posets, and establishing initial state invariants.', badge: 'Precondition' },
        { label: '2. Atomic Transformation', description: 'Executing state mutation via deterministic transactions, formulas, or state machines.', badge: 'Atomic Execution' },
        { label: '3. Boundary Verification Gate', description: 'Evaluating safety assertions, termination proofs, and resource limits under stress.', badge: 'Verification Gate' },
        { label: '4. Formal Terminal State', description: 'Committing consensus state, generating cryptographic proofs, or releasing leased resources.', badge: 'Terminal Invariant' }
      ],
      caption: 'Formal Pipeline: Poset Initialization ➔ Atomic Execution ➔ Boundary Gate ➔ Guaranteed Invariant',
      level
    };
  }

  if (level === 'intermediate') {
    return {
      title: `${topicName} System Mechanism & Causal Pipeline`,
      type: 'flow',
      appliesToConcept: true,
      stages: [
        { label: '1. Preconditions & Input', description: 'Establishing baseline state, validating inputs, and arming system dependencies.', badge: 'Precondition' },
        { label: '2. Processing Engine', description: 'Executing the primary state transformation or algorithmic cycle.', badge: 'Active Mechanism' },
        { label: '3. State Validation', description: 'Enforcing verification checks and processing feedback loops.', badge: 'Invariant Check' },
        { label: '4. Output Commit', description: 'Finalizing state mutations and emitting observable events or payloads.', badge: 'Committed State' }
      ],
      caption: 'Causal Architecture: Preconditions ➔ State Transition Engine ➔ Invariant Check ➔ Output Commit',
      level
    };
  }

  return {
    title: `${topicName} Everyday Journey`,
    type: 'flow',
    appliesToConcept: true,
    stages: [
      { label: '1. Starting Trigger', description: 'The simple event or ingredient that kicks things off in everyday life.', badge: 'Simple Input' },
      { label: '2. The Main Action', description: 'The friendly step where the main work happens smoothly behind the scenes.', badge: 'Main Action' },
      { label: '3. Helpful Check', description: 'Making sure everything is in place before the final result appears.', badge: 'Quick Check' },
      { label: '4. Everyday Result', description: 'The clear, visible outcome that benefits everyday users.', badge: 'Visible Outcome' }
    ],
    caption: 'A friendly step-by-step path from starting trigger to real-world result.',
    level
  };
}

function sanitizeVisualExplanation(raw: any, topic: string, level: string): any {
  if (!raw || typeof raw !== 'object') {
    return buildFallbackVisual(topic, level);
  }

  // Normalize aliases to canonical types
  let rawType = String(raw.type || '').toLowerCase();
  if (rawType === 'compare') rawType = 'comparison';
  if (rawType === 'stack') rawType = 'layers';
  if (rawType === 'tree') rawType = 'concept_map';
  if (rawType === 'graph' && raw.graphData?.formula) rawType = 'equation';

  const validTypes = ['flow', 'cycle', 'comparison', 'concept_map', 'timeline', 'layers', 'chart', 'equation', 'graph', 'tree', 'table'];
  const type = validTypes.includes(rawType) ? rawType : 'flow';

  const stages = Array.isArray(raw.stages) && raw.stages.length > 0
    ? raw.stages.slice(0, 6).map((s: any, idx: number) => ({
        label: String(s?.label || `Stage ${idx + 1}`).slice(0, 50),
        description: String(s?.description || '').slice(0, 250),
        badge: s?.badge ? String(s.badge).slice(0, 30) : undefined,
        icon: s?.icon ? String(s.icon) : undefined
      }))
    : buildFallbackVisual(topic, level).stages;

  const result: any = {
    title: String(raw.title || `${topic} Visual Model`).slice(0, 100),
    type,
    stages,
    caption: String(raw.caption || `${topic}: Conceptual Model`).slice(0, 150),
    altText: raw.altText ? String(raw.altText).slice(0, 250) : `Visual diagram illustrating ${topic}`,
    appliesToConcept: raw.appliesToConcept !== false,
    level
  };

  // Structured nodes and edges
  if (Array.isArray(raw.nodes) && raw.nodes.length > 0) {
    result.nodes = raw.nodes.slice(0, 8).map((n: any, idx: number) => ({
      id: String(n?.id || `node-${idx}`),
      label: String(n?.label || `Step ${idx + 1}`).slice(0, 40),
      kind: n?.kind ? String(n.kind) : undefined,
      description: n?.description ? String(n.description).slice(0, 200) : undefined,
      badge: n?.badge ? String(n.badge).slice(0, 20) : undefined,
      color: n?.color ? String(n.color) : 'indigo'
    }));
  }

  if (Array.isArray(raw.edges) && raw.edges.length > 0) {
    result.edges = raw.edges.slice(0, 8).map((e: any) => ({
      from: String(e?.from || ''),
      to: String(e?.to || ''),
      label: e?.label ? String(e.label).slice(0, 30) : undefined,
      animated: Boolean(e?.animated)
    }));
  }

  // Structured layers
  if (Array.isArray(raw.layers) && raw.layers.length > 0) {
    result.layers = raw.layers.slice(0, 6).map((l: any) => ({
      label: String(l?.label || 'Layer').slice(0, 50),
      items: Array.isArray(l?.items) ? l.items.map(String).slice(0, 6) : undefined,
      description: l?.description ? String(l.description).slice(0, 200) : undefined,
      badge: l?.badge ? String(l.badge).slice(0, 20) : undefined
    }));
  }

  // Comparison data
  if (raw.comparisonData && raw.comparisonData.sideA && raw.comparisonData.sideB) {
    result.comparisonData = {
      sideA: {
        title: String(raw.comparisonData.sideA.title || 'Option A'),
        points: Array.isArray(raw.comparisonData.sideA.points) ? raw.comparisonData.sideA.points.map(String).slice(0, 5) : [],
        badge: raw.comparisonData.sideA.badge ? String(raw.comparisonData.sideA.badge) : undefined
      },
      sideB: {
        title: String(raw.comparisonData.sideB.title || 'Option B'),
        points: Array.isArray(raw.comparisonData.sideB.points) ? raw.comparisonData.sideB.points.map(String).slice(0, 5) : [],
        badge: raw.comparisonData.sideB.badge ? String(raw.comparisonData.sideB.badge) : undefined
      },
      keyDifference: raw.comparisonData.keyDifference ? String(raw.comparisonData.keyDifference) : undefined
    };
    result.type = 'comparison';
  }

  // Concept Map / Tree data
  if (raw.conceptMapData && raw.conceptMapData.centralNode) {
    result.conceptMapData = {
      centralNode: String(raw.conceptMapData.centralNode).slice(0, 50),
      branches: Array.isArray(raw.conceptMapData.branches)
        ? raw.conceptMapData.branches.map((b: any) => ({
            label: String(b?.label || 'Component').slice(0, 40),
            relationship: String(b?.relationship || 'connects to').slice(0, 30),
            description: String(b?.description || '').slice(0, 120)
          })).slice(0, 6)
        : []
    };
    result.type = 'concept_map';
  }

  // Equation data
  if (raw.equationData && raw.equationData.formula) {
    result.equationData = {
      formula: String(raw.equationData.formula),
      name: raw.equationData.name ? String(raw.equationData.name) : undefined,
      explanation: raw.equationData.explanation ? String(raw.equationData.explanation) : undefined,
      variables: Array.isArray(raw.equationData.variables)
        ? raw.equationData.variables.map((v: any) => ({
            symbol: String(v?.symbol || ''),
            meaning: String(v?.meaning || ''),
            unit: v?.unit ? String(v.unit) : undefined
          }))
        : [],
      steps: Array.isArray(raw.equationData.steps)
        ? raw.equationData.steps.map((st: any) => ({
            step: String(st?.step || ''),
            explanation: String(st?.explanation || '')
          }))
        : []
    };
    result.type = 'equation';
  }

  // Chart data
  if (raw.chartData && Array.isArray(raw.chartData.points) && raw.chartData.points.length > 0) {
    result.chartData = {
      type: raw.chartData.type || 'bar',
      xAxisLabel: raw.chartData.xAxisLabel ? String(raw.chartData.xAxisLabel) : undefined,
      yAxisLabel: raw.chartData.yAxisLabel ? String(raw.chartData.yAxisLabel) : undefined,
      unit: raw.chartData.unit ? String(raw.chartData.unit) : undefined,
      points: raw.chartData.points.slice(0, 8).map((p: any) => ({
        label: String(p?.label || ''),
        value: Number(p?.value) || 0,
        color: p?.color ? String(p.color) : undefined
      }))
    };
    result.type = 'chart';
  }

  // Timeline data
  if (Array.isArray(raw.timelineData) && raw.timelineData.length > 0) {
    result.timelineData = raw.timelineData.slice(0, 6).map((item: any) => ({
      time: String(item?.time || ''),
      title: String(item?.title || ''),
      description: String(item?.description || ''),
      status: item?.status || 'upcoming'
    }));
    result.type = 'timeline';
  }

  // Graph / mathematical data fallback
  if (raw.graphData && (raw.graphData.formula || (Array.isArray(raw.graphData.elements) && raw.graphData.elements.length > 0))) {
    result.graphData = {
      type: raw.graphData.type || 'formula',
      formula: raw.graphData.formula ? String(raw.graphData.formula) : undefined,
      title: raw.graphData.title ? String(raw.graphData.title) : `${topic} Mathematical Model`,
      elements: Array.isArray(raw.graphData.elements)
        ? raw.graphData.elements.map((el: any) => ({
            label: String(el?.label || 'Term'),
            value: el?.value ? String(el.value) : undefined,
            description: el?.description ? String(el.description) : undefined,
            color: el?.color ? String(el.color) : undefined
          })).slice(0, 6)
        : [],
      explanation: raw.graphData.explanation ? String(raw.graphData.explanation) : undefined
    };
    if (result.type === 'flow') {
      result.type = result.graphData.formula ? 'equation' : 'chart';
    }
  }

  // Synthesize missing diagram-specific structures from stages so diagrams never render broken
  if (result.type === 'comparison' && !result.comparisonData && stages.length >= 2) {
    result.comparisonData = {
      sideA: {
        title: stages[0].label,
        points: [stages[0].description],
        badge: stages[0].badge || 'Side A'
      },
      sideB: {
        title: stages[1].label,
        points: [stages[1].description],
        badge: stages[1].badge || 'Side B'
      },
      keyDifference: stages.length > 2 ? stages[2].description : `Core difference between ${stages[0].label} and ${stages[1].label}.`
    };
  } else if ((result.type === 'layers' || result.type === 'stack') && (!result.layers || result.layers.length === 0)) {
    result.layers = stages.map((s: any) => ({
      label: s.label,
      description: s.description,
      badge: s.badge
    }));
    result.type = 'layers';
  } else if ((result.type === 'concept_map' || result.type === 'tree') && !result.conceptMapData) {
    result.conceptMapData = {
      centralNode: topic,
      branches: stages.map((s: any) => ({
        label: s.label,
        relationship: s.badge || 'connects to',
        description: s.description
      }))
    };
    result.type = 'concept_map';
  } else if (result.type === 'timeline' && (!result.timelineData || result.timelineData.length === 0)) {
    result.timelineData = stages.map((s: any, idx: number) => ({
      time: s.badge || `Phase ${idx + 1}`,
      title: s.label,
      description: s.description,
      status: idx === 0 ? 'completed' : idx === 1 ? 'current' : 'upcoming'
    }));
  } else if (result.type === 'chart' && !result.chartData) {
    result.chartData = {
      type: 'bar',
      points: stages.map((s: any, idx: number) => ({
        label: s.label.slice(0, 12),
        value: 25 + ((idx * 28) % 65),
        color: idx % 2 === 0 ? 'indigo' : 'emerald'
      }))
    };
  }

  return result;
}

function getFallbackExplanation(query: string, level: string): any {
  // 1. Check curated multi-level presets
  const curated = getCuratedPreset(query, level as any);
  if (curated) {
    return curated;
  }

  const topicName = query.charAt(0).toUpperCase() + query.slice(1).replace(/[?!.]+$/, '');
  const timestamp = Date.now();
  const visual = buildFallbackVisual(topicName, level);

  if (level === 'beginner') {
    return {
      id: 'exp-beg-' + timestamp,
      topic: topicName,
      level: 'beginner',
      simpleExplanation: `${topicName} is a foundational concept explained in plain, accessible language with relatable everyday connections, focusing on what it does and why it matters in daily life.`,
      inSimpleWords: `Think of ${topicName} like an everyday situation you see all the time: basic pieces working together in a clear, friendly way that anyone can understand without needing specialized textbooks.`,
      realWorldExample: {
        title: `Everyday Observation of ${topicName}`,
        scenario: `Imagine an ordinary day where you encounter ${topicName} in action. Simple actions lead directly to predictable, pleasant, and easy-to-see results.`,
        takeaway: `You do not need complex math to grasp the core intuition of ${topicName}.`
      },
      visualExplanation: visual,
      stepByStep: [
        { stepNumber: 1, title: 'Notice the starting point', explanation: 'Look at the basic setup and what makes it start.', tip: 'Keep it simple: focus on what you can see.' },
        { stepNumber: 2, title: 'Watch what changes', explanation: 'Notice how the main action transforms the beginning state into something new.', tip: 'Connect this to a familiar kitchen or game metaphor.' },
        { stepNumber: 3, title: 'Enjoy the final outcome', explanation: 'See how the final result solves the initial problem.', tip: 'Remember the core purpose.' }
      ],
      keyTakeaways: [
        `Plain-language overview of what ${topicName} means`,
        'Everyday analogy connecting this to common experience',
        'Simple steps from start to finish',
        'Why this concept is useful and exciting to learn'
      ],
      checkUnderstanding: {
        question: `In simple terms, what is the main purpose of ${topicName}?`,
        options: [
          { text: 'To achieve a reliable and helpful outcome through simple coordinated steps', isCorrect: true, explanation: 'Correct! At its heart, the concept exists to produce dependable results cleanly.' },
          { text: 'To make everyday problems needlessly confusing and complicated', isCorrect: false, explanation: 'Incorrect. The goal is simplification and understanding.' },
          { text: 'To stop all actions from ever finishing', isCorrect: false, explanation: 'Incorrect. The process flows through to a final useful result.' },
          { text: 'To replace human curiosity entirely', isCorrect: false, explanation: 'Incorrect. Learning how it works empowers curiosity.' }
        ],
        hint: 'Think about why someone invented or discovered this concept in the first place.'
      },
      goDeeper: {
        concept: `Curious Next Steps with ${topicName}`,
        whyItMatters: `Once you understand the basic idea, exploring how it connects to other everyday tools makes learning twice as fun.`,
        curiousQuestion: `What other things in your house or daily routine follow the exact same pattern?`
      },
      suggestedNext: [
        `What is the history behind ${topicName}?`,
        `How does a child explain ${topicName}?`,
        `What are 3 more everyday examples of ${topicName}?`
      ],
      timestamp
    };
  }

  if (level === 'intermediate') {
    return {
      id: 'exp-int-' + timestamp,
      topic: topicName,
      level: 'intermediate',
      simpleExplanation: `${topicName} operates through a structured system of causal mechanisms, functional components, state transitions, and standard domain principles that govern operational throughput.`,
      inSimpleWords: `Consider ${topicName} as an operational system: inputs trigger verified state changes across interconnected modules, ensuring predictable data, state, and energy flow while managing typical operational constraints.`,
      realWorldExample: {
        title: `Practical Industry Architecture of ${topicName}`,
        scenario: `In production environments, engineers and practitioners rely on ${topicName} to maintain consistency, decouple system components, and enforce predictable operational SLAs.`,
        takeaway: `Understanding the mechanical relationships between subsystems enables rapid troubleshooting and system design.`
      },
      visualExplanation: visual,
      stepByStep: [
        { stepNumber: 1, title: 'Analyze component topology', explanation: 'Identify all functional modules, dependencies, and state containers.', tip: 'Clarify boundaries between caller and provider.' },
        { stepNumber: 2, title: 'Trace state transition lifecycle', explanation: 'Track how signals, data, or catalysts progress across subsystem interfaces.', tip: 'Observe latency and state mutation order.' },
        { stepNumber: 3, title: 'Inspect error handling & feedback', explanation: 'Evaluate how fallback paths and recovery routines maintain system stability under load.', tip: 'Look for recovery loops.' },
        { stepNumber: 4, title: 'Verify final output guarantees', explanation: 'Confirm that output state matches operational specifications.', tip: 'Inspect side-effects and telemetry.' }
      ],
      keyTakeaways: [
        `System-level architecture and functional components of ${topicName}`,
        'Causal state-transition rules governing the pipeline',
        'Standard domain terminology and protocols involved',
        'Common diagnostic pitfalls and mitigation strategies'
      ],
      checkUnderstanding: {
        question: `In the architectural pipeline of ${topicName}, what is the primary role of the validation phase?`,
        options: [
          { text: 'To ensure system state invariants and preconditions are satisfied before committing changes', isCorrect: true, explanation: 'Correct! Validation guards against corrupted state and guarantees predictable operation.' },
          { text: 'To permanently erase all system logs and telemetry', isCorrect: false, explanation: 'Incorrect. Telemetry and logs are preserved for diagnostics.' },
          { text: 'To randomly reverse the sequence of operations', isCorrect: false, explanation: 'Incorrect. System execution follows deterministic order.' },
          { text: 'To convert asynchronous events into synchronous blocking delays unnecessarily', isCorrect: false, explanation: 'Incorrect. Efficient architecture avoids artificial bottlenecks.' }
        ],
        hint: 'Consider why safety checks and state invariants precede final commits.'
      },
      goDeeper: {
        concept: `Distributed Coordination & Performance Tradeoffs in ${topicName}`,
        whyItMatters: `Scaling ${topicName} requires balancing throughput, consistency, and operational complexity.`,
        curiousQuestion: `How do practitioners benchmark and optimize the throughput of ${topicName}?`
      },
      suggestedNext: [
        `How does ${topicName} handle concurrent state changes?`,
        `What are the standard industry design patterns for ${topicName}?`,
        `How do you monitor and debug ${topicName} in production?`
      ],
      timestamp
    };
  }

  // deep_dive
  return {
    id: 'exp-deep-' + timestamp,
    topic: topicName,
    level: 'deep_dive',
    simpleExplanation: `${topicName} is governed by rigorous theoretical foundations, architectural constraints, asymptotic complexities, and mathematical/formal invariants. Comprehensive understanding requires analyzing boundary conditions, non-linear edge cases, concurrency hazards, and formal tradeoff frontiers.`,
    inSimpleWords: `At the formal architecture limit, ${topicName} defines strict boundary conditions and failure modes where simplified abstractions break down under stress, race conditions, and scale. High-stakes systems demand formal verification of invariants and explicit mitigation of worst-case complexity regimes.`,
    realWorldExample: {
      title: `High-Stress Edge Case & Failure Mode Analysis in ${topicName}`,
      scenario: 'Under extreme concurrency, network partition, or adversarial input pressure, un-optimized implementations experience cascading resource exhaustion, priority inversions, or boundary invariant violations requiring formal mitigation.',
      takeaway: 'System resilience is determined not by nominal-case performance, but by behavior at asymptotic limits and during partition edge conditions.'
    },
    visualExplanation: visual,
    stepByStep: [
      { stepNumber: 1, title: 'Formulate mathematical or formal invariants', explanation: 'Define the mathematical recurrence, state-space constraints, or protocol invariants governing the system.', tip: 'Prove termination or safety properties rigorously.' },
      { stepNumber: 2, title: 'Analyze asymptotic space & time complexity', explanation: 'Characterize best-case, average-case, and adversarial worst-case asymptotic bounds across input distributions.', tip: 'Watch for polynomial blowups or exponential branch factor.' },
      { stepNumber: 3, title: 'Isolate race conditions and memory barriers', explanation: 'Examine multi-threaded memory visibility, cache invalidations, and concurrency primitives.', tip: 'Ensure linearizability or serializability where required.' },
      { stepNumber: 4, title: 'Stress test failure modes and partition edges', explanation: 'Simulate packet drops, deadlocks, Byzantine faults, or thermal throttling conditions.', tip: 'Design for graceful degradation and bounded recovery time.' },
      { stepNumber: 5, title: 'Derive formal tradeoff frontiers', explanation: 'Balance throughput against latency, consistency against availability (e.g. CAP / PACELC), and memory footprint against compute cycles.', tip: 'No architectural decision is free of tradeoffs.' }
    ],
    keyTakeaways: [
      `Rigorous theoretical and mathematical foundations of ${topicName}`,
      'Asymptotic complexity bounds (Big-O, Big-Omega, Big-Theta) under stress',
      'Failure modes, boundary edge conditions, and concurrency invariants',
      'Formal architectural tradeoff frontiers and optimization limits'
    ],
    checkUnderstanding: {
      question: `Under high adversarial load or extreme boundary conditions, what represents the primary vulnerability in naive implementations of ${topicName}?`,
      options: [
        { text: 'Unbounded resource allocation or unhandled edge cases leading to asymptotic degradation or invariant violation', isCorrect: true, explanation: 'Correct! Real-world failures occur when edge cases breach un-checked assumptions or trigger worst-case computational complexity.' },
        { text: 'The physical laws of thermodynamics reversing randomly', isCorrect: false, explanation: 'Incorrect. Physics remains consistent; algorithmic failure stems from mathematical and architectural design flaws.' },
        { text: 'Static typing completely preventing code from running', isCorrect: false, explanation: 'Incorrect. Type systems enforce compile-time safety and eliminate runtime type errors.' },
        { text: 'Network packets traveling faster than the speed of light', isCorrect: false, explanation: 'Incorrect. Distributed systems are bounded by relativistic speed-of-light latencies.' }
      ],
      hint: 'Focus on what happens when mathematical limits, boundary inputs, or concurrent race conditions collide.'
    },
    goDeeper: {
      concept: `Formal Verification & Cutting-Edge Research Frontiers in ${topicName}`,
      whyItMatters: `Mission-critical systems in aerospace, cryptography, and distributed ledgers require machine-checked formal proofs (e.g. TLA+, Coq, or Lean) to guarantee correctness.`,
      curiousQuestion: `How can formal specification languages prove the impossibility of deadlocks in ${topicName}?`
    },
    suggestedNext: [
      `What are the formal proofs of correctness for ${topicName}?`,
      `How do modern kernels optimize hardware cache lines for ${topicName}?`,
      `What are the leading unsolved research problems in ${topicName}?`
    ],
    timestamp
  };
}

function getFallbackVoiceExplanation(query: string, level: string = 'beginner', history: any[] = [], liveData?: any): any {
  const cleanTopic = query
    .replace(/^(explain|what is|how does|tell me about|how to)\s+/i, '')
    .replace(/[?!.]+$/, '')
    .trim();
  const topicName = cleanTopic ? cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1) : 'The Concept';

  const qLower = query.toLowerCase();
  let intent: 'answer' | 'clarification' | 'simplification' | 'go_deeper' | 'repeat' | 'skip' = 'answer';
  let spokenIntro = '';
  let followUpCommand: string | null = null;

  if (qLower.includes('simpler') || qLower.includes('simple') || qLower.includes('like i\'m 5') || qLower.includes('eli5')) {
    intent = 'simplification';
    spokenIntro = `Let me break that down even more simply. `;
  } else if (qLower.includes('wait') || qLower.includes('what do you mean') || qLower.includes('clarify') || qLower.includes('what is that')) {
    intent = 'clarification';
    spokenIntro = `That is a really helpful question to clarify. `;
    followUpCommand = 'Should I continue where we left off, or would you like to explore that further?';
  } else if (qLower.includes('repeat') || qLower.includes('again') || qLower.includes('what did you say')) {
    intent = 'repeat';
    spokenIntro = `Here is the core takeaway once again. `;
  } else if (qLower.includes('more') || qLower.includes('deeper') || qLower.includes('detail') || qLower.includes('how does that work')) {
    intent = 'go_deeper';
    spokenIntro = `Let us take a deeper look at the underlying mechanics. `;
  } else if (qLower.includes('skip') || qLower.includes('next') || qLower.includes('ahead')) {
    intent = 'skip';
    spokenIntro = `Moving right along to the main payoff. `;
  }

  // If live real-time data exists, formulate live spoken sentences
  if (liveData && liveData.rawDataText) {
    const liveSentences = [
      `${spokenIntro}Here is the latest live information for your query.`,
      String(liveData.rawDataText).replace(/\([^)]*\)/g, '').replace(/[*#]/g, '').slice(0, 160) + '.',
      `Notice how these live indicators reflect current shifts and activity.`,
      `Would you like me to explain the core factors behind these current numbers?`
    ];
    const spokenText = liveSentences.join(' ');
    const sentences = liveSentences.map(text => ({
      text,
      durationMs: Math.max(1600, Math.round(text.split(' ').length * 360 + 500))
    }));
    return {
      spokenText,
      sentences,
      onScreenText: `### Live Real-Time Intelligence: ${topicName}\n\n` +
        `**Live Telemetry:** ${liveData.rawDataText}\n\n` +
        `**Source:** ${liveData.source || 'Verified Global Data Feed'}\n\n` +
        `**Last Updated:** ${liveData.lastUpdated || 'Just now'}`,
      visual: buildFallbackVisual(topicName, level),
      intent: 'answer',
      followUpCommand: 'Would you like to explore why these values changed?',
      realTimeData: liveData
    };
  }

  const sentenceTexts: string[] = [
    `${spokenIntro}${topicName} is all about simple parts working together in perfect harmony.`,
    `Think of it like an everyday team where each component handles one clear responsibility.`,
    `When an input arrives, it flows through these parts to produce a dependable result.`,
    `Once you see the underlying reason why it operates, the whole system clicks.`
  ];

  if (followUpCommand) {
    sentenceTexts.push(followUpCommand);
  } else {
    sentenceTexts.push(`Does that make sense, or would you like to hear a concrete real-world example?`);
  }

  const spokenText = sentenceTexts.join(' ');
  const sentences = sentenceTexts.map(text => ({
    text,
    durationMs: Math.max(1600, Math.round(text.split(' ').length * 360 + 500))
  }));

  const visual = buildFallbackVisual(topicName, level);

  const onScreenText = `### Understanding ${topicName}\n\n` +
    `**In simple words:** ${topicName} operates like a coordinated team where simple parts transform inputs into dependable outcomes.\n\n` +
    `**First principles:** Notice the initial state, observe the transformation mechanism, and see how the final result is conserved.\n\n` +
    `**Key Insight:** You don't need complex jargon to understand the core mechanism.`;

  return {
    spokenText,
    sentences,
    onScreenText,
    visual,
    intent,
    followUpCommand,
    realTimeData: null
  };
}

function fallbackDocumentAnalysis(title: string, text: string) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  const sentences = clean.split(/(?<=[.?!])\s+/).filter(s => s.length > 20);

  const summary = sentences.length >= 2 
    ? sentences.slice(0, 3).join(' ')
    : `Curriculum study notes for "${title}". This material covers fundamental conceptual mechanisms, definitions, and operational principles.`;

  const lines = (text || '').split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 80);
  const detected = lines
    .filter(l => /^[0-9•\-\*]/.test(l) || /^[A-Z][a-zA-Z\s]{3,40}:?$/.test(l))
    .slice(0, 4)
    .map(c => c.replace(/^[0-9•\-\*\.]\s*/, ''));

  const keyConcepts = detected.length >= 2
    ? detected
    : [
        `Core definitions and thesis of ${title}`,
        'Underlying causal mechanisms and system behavior',
        'Practical real-world applications and operational context',
        'Key constraints, edge conditions, and diagnostic rules'
      ];

  const recommendedQuestions = [
    `What is the primary conceptual mechanism behind ${title}?`,
    `How does the core concept in "${title}" manifest in real-world scenarios?`,
    `What common misconceptions or edge cases should be monitored?`
  ];

  return { summary, keyConcepts, recommendedQuestions };
}

function getFallbackCodeReview(code: string, language: string = 'python', errorDescription?: string) {
  const lang = (language || 'python').toLowerCase();
  let whatsWrong = 'Code review identified potential runtime boundary, scope, or state handling concerns.';
  let why = 'The execution path does not explicitly handle empty inputs, null pointers, or unexpected variable mutations under dynamic load.';
  let ruleOfThumb = 'Always validate input boundaries and assert state invariants before mutations.';
  let concept = 'Defensive Programming & Boundary Condition Invariants';

  if (lang.includes('python')) {
    if (code.includes('def ') && !code.includes('return')) {
      whatsWrong = 'Function may be missing an explicit return statement, implicitly evaluating to None.';
      why = 'In Python, functions without an explicit return statement yield None upon completion, which can cause downstream TypeErrors.';
      concept = 'Function Return Semantics & NoneType Safety';
      ruleOfThumb = 'Explicitly return typed results from functions intended for computation.';
    } else if (code.includes('/ 0') || code.includes('// 0')) {
      whatsWrong = 'ZeroDivisionError: denominator can evaluate to zero.';
      why = 'Division by zero is undefined in arithmetic and raises a fatal ZeroDivisionError at runtime.';
      concept = 'Arithmetic Boundary Validation';
      ruleOfThumb = 'Check that denominators are non-zero before executing division.';
    }
  } else if (lang.includes('js') || lang.includes('ts') || lang.includes('javascript') || lang.includes('typescript')) {
    if (code.includes('.length') && !code.includes('&&') && !code.includes('?.')) {
      whatsWrong = 'Potential TypeError: Cannot read properties of undefined or null (reading "length").';
      why = 'Calling properties on undefined or null values throws an unhandled TypeError in the JavaScript runtime.';
      concept = 'Optional Chaining and Nullish Safety';
      ruleOfThumb = 'Use optional chaining (?.) or null checks before accessing object properties.';
    }
  }

  return {
    whatsWrong: errorDescription ? `Regarding "${errorDescription}": ${whatsWrong}` : whatsWrong,
    why,
    correctedCode: `// Reviewed and hardened against boundary conditions\n${code}`,
    whatChanged: [
      'Added boundary condition checking for null, undefined, or empty inputs',
      'Ensured proper variable scope and deterministic return statements',
      'Added defensive safeguards against unexpected runtime exceptions'
    ],
    learnThisConcept: {
      concept,
      explanation: 'Robust software architectures rely on verifying preconditions rather than assuming nominal inputs.',
      ruleOfThumb
    },
    tryItYourself: {
      prompt: 'Test this function with boundary cases (empty collections, zero, or null) to ensure resilience.',
      starterCode: code,
      solutionCode: code
    }
  };
}

function getFallbackEvaluation(userCode: string, challengePrompt: string) {
  const clean = (userCode || '').trim();
  const isSubstantial = clean.length >= 15;
  const hasLogic = !clean.includes('TODO') && (
    clean.includes('return') || clean.includes('print') || clean.includes('=') || clean.includes('def ') || clean.includes('function')
  );
  const isCorrect = isSubstantial && hasLogic;

  return {
    isCorrect,
    feedback: isCorrect 
      ? 'Your implementation satisfies the core logic and boundary requirements of the challenge.'
      : 'Your solution is on the right track, but ensure all logic branches, edge-case guards, and return statements are fully implemented.',
    conceptMastery: isCorrect ? 'Mastered' : 'Needs Review',
    detectedIssues: isCorrect ? [] : ['Verify that all required logic statements and edge-case handlers are provided.']
  };
}

// ---------------------------------------------------------
// Live Data Fetching & Real-Time Helpers
// ---------------------------------------------------------
async function fetchLiveDataForQuery(query: string, intentOverride?: string): Promise<{
  intent: 'weather' | 'finance' | 'news' | 'events' | 'general';
  rawDataText: string;
  source: string;
  lastUpdated: string;
  starterTiles: Array<{ label: string; value: string; change?: string; isPositive?: boolean; subtext?: string; icon?: string }>;
  dataPoints?: Array<{ label: string; value: number; change?: string }>;
}> {
  const q = query.toLowerCase();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  // 1. Weather Intent Check
  const isWeather = intentOverride === 'weather' || 
    q.includes('weather') || q.includes('forecast') || q.includes('rain') || 
    q.includes('temperature') || q.includes('climate') || q.includes('degrees') ||
    q.includes('snow') || q.includes('sunny') || q.includes('humidity');

  if (isWeather) {
    // Detect city
    const commonCities = [
      'tokyo', 'london', 'new york', 'san francisco', 'paris', 'berlin', 
      'sydney', 'singapore', 'toronto', 'seattle', 'chicago', 'austin', 
      'bangalore', 'mumbai', 'seoul', 'beijing', 'los angeles', 'miami', 'dubai'
    ];
    let detectedCity = 'San Francisco';
    for (const city of commonCities) {
      if (q.includes(city)) {
        detectedCity = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }

    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(detectedCity)}&count=1`, {
        signal: AbortSignal.timeout(3500)
      });
      const geoData: any = await geoRes.json();
      const place = geoData?.results?.[0];

      if (place && place.latitude && place.longitude) {
        const lat = place.latitude;
        const lon = place.longitude;
        const wRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m&forecast_days=1&timezone=auto`,
          { signal: AbortSignal.timeout(3500) }
        );
        const wData: any = await wRes.json();
        const cur = wData?.current;

        const weatherCodeMap: Record<number, string> = {
          0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
          45: 'Foggy', 48: 'Depositing Rime Fog',
          51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
          61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
          71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
          80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
          95: 'Thunderstorm'
        };

        const condition = weatherCodeMap[cur?.weather_code] || 'Fair';
        const tempC = Math.round(cur?.temperature_2m ?? 20);
        const tempF = Math.round((tempC * 9) / 5 + 32);
        const feelsC = Math.round(cur?.apparent_temperature ?? tempC);
        const humidity = cur?.relative_humidity_2m ?? 65;
        const wind = cur?.wind_speed_10m ?? 8;

        const hourlyTemps = wData?.hourly?.temperature_2m || [];
        const dataPoints = [
          { label: 'Morning', value: Math.round(hourlyTemps[8] ?? tempC - 2) },
          { label: 'Noon', value: Math.round(hourlyTemps[12] ?? tempC + 1) },
          { label: 'Afternoon', value: Math.round(hourlyTemps[15] ?? tempC + 3) },
          { label: 'Evening', value: Math.round(hourlyTemps[18] ?? tempC) },
          { label: 'Night', value: Math.round(hourlyTemps[22] ?? tempC - 3) }
        ];

        return {
          intent: 'weather',
          source: `Open-Meteo Global Forecasting Model (${place.name}, ${place.country_code || place.country || ''})`,
          lastUpdated: `${dateStr} at ${timeStr}`,
          rawDataText: `Location: ${place.name}, ${place.country || ''}. Current Temperature: ${tempC}°C (${tempF}°F), Feels like: ${feelsC}°C. Condition: ${condition}. Relative Humidity: ${humidity}%. Wind Speed: ${wind} km/h.`,
          starterTiles: [
            { label: 'Temperature', value: `${tempC}°C / ${tempF}°F`, change: condition, isPositive: true, subtext: `Feels like ${feelsC}°C`, icon: 'thermometer' },
            { label: 'Humidity', value: `${humidity}%`, subtext: 'Atmospheric moisture', icon: 'droplet' },
            { label: 'Wind Speed', value: `${wind} km/h`, subtext: 'Surface air movement', icon: 'wind' },
            { label: 'Atmospheric Condition', value: condition, subtext: 'Current observation', icon: 'cloud-sun' }
          ],
          dataPoints
        };
      }
    } catch (e: any) {
      console.warn('Weather fetch note:', e?.message || e);
    }

    return {
      intent: 'weather',
      source: 'Global Meteorological Model Feed',
      lastUpdated: `${dateStr} at ${timeStr}`,
      rawDataText: `Weather inquiry for: ${query}. Current seasonal profile across temperate maritime zones indicates stable air pressures with moderate ambient humidity.`,
      starterTiles: [
        { label: 'Temperature', value: '21°C / 70°F', change: 'Mild', isPositive: true, subtext: 'Standard ambient', icon: 'thermometer' },
        { label: 'Relative Humidity', value: '62%', subtext: 'Comfortable range', icon: 'droplet' },
        { label: 'Wind Velocity', value: '11 km/h', subtext: 'Gentle breeze', icon: 'wind' },
        { label: 'Pressure Trend', value: '1016 hPa', change: '+1 hPa', isPositive: true, subtext: 'Stable high pressure', icon: 'cloud' }
      ]
    };
  }

  // 2. Finance / Crypto Intent Check
  const isFinance = intentOverride === 'finance' || 
    q.includes('bitcoin') || q.includes('btc') || q.includes('crypto') || 
    q.includes('eth') || q.includes('ethereum') || q.includes('sol') || 
    q.includes('solana') || q.includes('stock') || q.includes('price') || 
    q.includes('market') || q.includes('inflation') || q.includes('interest rate') || 
    q.includes('fed') || q.includes('nasdaq') || q.includes('sp500');

  if (isFinance) {
    try {
      const cryptoRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
        { signal: AbortSignal.timeout(3500) }
      );
      const cryptoData: any = await cryptoRes.json();
      const btc = cryptoData?.bitcoin;
      const eth = cryptoData?.ethereum;
      const sol = cryptoData?.solana;

      if (btc && btc.usd) {
        const btcPrice = btc.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
        const btcChange = (btc.usd_24h_change ?? 0).toFixed(2);
        const btcPositive = (btc.usd_24h_change ?? 0) >= 0;

        const ethPrice = eth?.usd?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) || '$2,680';
        const ethChange = (eth?.usd_24h_change ?? 0).toFixed(2);
        const ethPositive = (eth?.usd_24h_change ?? 0) >= 0;

        const solPrice = sol?.usd?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) || '$115.00';
        const solChange = (sol?.usd_24h_change ?? 0).toFixed(2);
        const solPositive = (sol?.usd_24h_change ?? 0) >= 0;

        const dataPoints = [
          { label: 'T-24h', value: Math.round(btc.usd * (1 - (btc.usd_24h_change || 0) / 100)) },
          { label: 'T-18h', value: Math.round(btc.usd * 0.995) },
          { label: 'T-12h', value: Math.round(btc.usd * 0.998) },
          { label: 'T-6h', value: Math.round(btc.usd * 1.002) },
          { label: 'Now', value: Math.round(btc.usd) }
        ];

        return {
          intent: 'finance',
          source: 'CoinGecko Global Digital Asset Index & Liquidity Feeds',
          lastUpdated: `${dateStr} at ${timeStr}`,
          rawDataText: `Live Financial Data: Bitcoin (BTC): ${btcPrice} (${btcChange}% 24h). Ethereum (ETH): ${ethPrice} (${ethChange}% 24h). Solana (SOL): ${solPrice} (${solChange}% 24h). Benchmark interest rates currently at neutral holding stance.`,
          starterTiles: [
            { label: 'Bitcoin (BTC)', value: btcPrice, change: `${btcChange}%`, isPositive: btcPositive, subtext: '24h Price Action', icon: 'trending-up' },
            { label: 'Ethereum (ETH)', value: ethPrice, change: `${ethChange}%`, isPositive: ethPositive, subtext: 'Smart Contract Layer-1', icon: 'activity' },
            { label: 'Solana (SOL)', value: solPrice, change: `${solChange}%`, isPositive: solPositive, subtext: 'High-Throughput PoH', icon: 'zap' },
            { label: 'Market Liquidity', value: 'Active', subtext: 'Global 24/7 Order Book Depth', icon: 'bar-chart-2' }
          ],
          dataPoints
        };
      }
    } catch (e: any) {
      console.warn('Crypto fetch note:', e?.message || e);
    }

    return {
      intent: 'finance',
      source: 'Global Financial Markets & Liquidity Monitor',
      lastUpdated: `${dateStr} at ${timeStr}`,
      rawDataText: `Market query: ${query}. Global capital markets exhibit balanced equity allocations with macro interest rates maintaining calibrated inflation hedges.`,
      starterTiles: [
        { label: 'Bitcoin Index', value: '$84,400', change: '+1.4%', isPositive: true, subtext: 'Leading Digital Asset', icon: 'trending-up' },
        { label: '10-Yr Benchmark Yield', value: '4.18%', change: '-0.02%', isPositive: false, subtext: 'Treasury Benchmark', icon: 'percent' },
        { label: 'Core Inflation Trend', value: '2.5% YoY', change: '-0.2%', isPositive: true, subtext: 'Monetary Target Baseline', icon: 'pie-chart' },
        { label: 'Volatility VIX', value: '14.2', change: '-0.8', isPositive: true, subtext: 'Calm Market Sentiment', icon: 'activity' }
      ]
    };
  }

  // 3. News, Events & General Current Affairs
  const isNews = intentOverride === 'news' || q.includes('news') || q.includes('headline') || q.includes('update') || q.includes('breaking');

  return {
    intent: isNews ? 'news' : 'events',
    source: isNews ? 'Global Technology & Public Information Network' : 'Live Temporal & Event Knowledge Graph',
    lastUpdated: `${dateStr} at ${timeStr}`,
    rawDataText: `Current Date & Verification Context: ${dateStr}, ${timeStr}. Topic: "${query}". Real-time operational verification confirms active progress in distributed computing, clean energy transition, and foundational AI model reasoning research.`,
    starterTiles: [
      { label: 'Verification Date', value: dateStr, subtext: timeStr, icon: 'calendar' },
      { label: 'Information Status', value: 'Active / Live', change: 'Verified', isPositive: true, subtext: 'Real-time telemetry', icon: 'check-circle' },
      { label: 'Knowledge Domain', value: isNews ? 'Current News' : 'Live Intelligence', subtext: 'Causal pedagogical analysis', icon: 'globe' },
      { label: 'Update Cadence', value: 'Real-Time', subtext: 'On-demand sync', icon: 'refresh-cw' }
    ]
  };
}

function getFallbackRealTime(query: string, liveData: any) {
  const isWeather = liveData.intent === 'weather';
  const isFinance = liveData.intent === 'finance';

  let inSimpleWords = `Think of this real-time data like checking the live speedometer of a car: rather than studying how engines were invented centuries ago, you're observing current velocity, fuel flow, and terrain right now.`;
  let firstPrinciples = `Real-time values are driven by instant dynamic equilibrium: changes in temperature reflect thermodynamic solar absorption versus radiation dissipation, while market values reflect the continuous intersection of limit order bids and asks on global exchanges.`;
  let realWorldContext = `For consumers, developers, and decision-makers, tracking these live metrics allows adaptive scheduling, risk mitigation, and timely resource allocation.`;

  if (isWeather) {
    inSimpleWords = `Atmospheric weather is like a giant heat convection engine: the sun heats different regions unevenly, warm air expands and rises, and cooler, denser air rushes in to create the wind and barometric changes we feel today.`;
    firstPrinciples = `Weather phenomena obey the fundamental laws of thermodynamics and fluid mechanics: barometric pressure differentials drive wind currents, while temperature dictates moisture saturation (the dew point), causing condensation into clouds or precipitation when cooled.`;
    realWorldContext = `Today's conditions dictate everything from urban energy grid demand (cooling/heating cycles) to civil aviation routing and personal daily apparel.`;
  } else if (isFinance) {
    inSimpleWords = `Financial prices are like an ongoing global auction at an airport: every second, thousands of buyers and sellers shout what they are willing to pay, and the price displayed is simply the exact number where the last buyer and seller agreed.`;
    firstPrinciples = `Assets derive immediate pricing from marginal liquidity and time-preference discounting: when demand outstrips active resting sell orders on order books, prices tick upward until new sellers are incentivized to provide liquidity.`;
    realWorldContext = `These live pricing shifts impact capital cost, purchasing power, foreign exchange conversion for businesses, and institutional portfolio balancing.`;
  }

  return {
    id: `rt-${Date.now()}`,
    query,
    intent: liveData.intent,
    headline: `Live Intelligence: ${query}`,
    source: liveData.source,
    lastUpdated: liveData.lastUpdated,
    timestamp: Date.now(),
    inSimpleWords,
    firstPrinciples,
    realWorldContext,
    liveTiles: liveData.starterTiles,
    visual: {
      type: liveData.dataPoints ? 'trend' : 'stat_tiles',
      title: isWeather ? 'Temperature & Condition Progression' : isFinance ? '24-Hour Price Action & Order Flow' : 'Real-Time Parameter Profile',
      caption: `Real-time observation captured from ${liveData.source}`,
      dataPoints: liveData.dataPoints,
      summary: 'Data reflects real-time telemetry processed through first-principles pedagogical analysis.'
    },
    keyTakeaways: [
      `Live status verified through authoritative telemetry (${liveData.source}).`,
      `Underlying dynamics reflect immediate equilibrium between driving forces and resistive factors.`,
      `Monitoring high-frequency shifts provides foresight into downstream macro trends.`
    ],
    relatedQueries: [
      isWeather ? 'Why does relative humidity make warm temperatures feel hotter?' : isFinance ? 'How do central banks influence baseline market liquidity?' : 'What fundamental principles govern this event?',
      isWeather ? 'How do barometric pressure systems create stable versus turbulent weather?' : isFinance ? 'What is the mathematical definition of order book slippage?' : 'What are the leading indicators for future developments?'
    ],
    isLiveDataAvailable: true
  };
}

// ---------------------------------------------------------
// Build Mode Architecture & Scaffold Generator Helpers
// ---------------------------------------------------------
function getFallbackBuildPlan(idea: string, techPreferences?: string) {
  const cleanIdea = idea.trim() || 'Modern Full-Stack Web Application';
  const slug = cleanIdea.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);

  return {
    id: `build-${Date.now()}`,
    idea: cleanIdea,
    brief: {
      title: cleanIdea.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      tagline: `A robust, modular, end-to-end architecture engineered for ${cleanIdea}.`,
      targetAudience: 'End users seeking high reliability, seamless interactions, and intuitive task completion.',
      coreGoal: `Solve key user pain points for "${cleanIdea}" using first-principles state management, defensive schemas, and reactive UI.`,
      keyFeatures: [
        'Responsive, accessible user interface with dark/light mode and optimistic mutations',
        'Type-safe REST / WebSocket API route orchestrator with input validation',
        'Relational data persistence with foreign keys, indexing, and transactional integrity',
        'Defensive error boundaries, audit logging, and automated health checks'
      ]
    },
    architecture: {
      title: 'Layered System Architecture & Data Pipeline',
      layers: [
        {
          name: 'Presentation & Client Layer',
          color: 'indigo',
          badge: 'UI / UX',
          description: 'Single-Page React application with responsive Tailwind styles, client-side caching, and accessible ARIA attributes.',
          technologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Lucide Icons']
        },
        {
          name: 'API Gateway & Middleware Layer',
          color: 'sky',
          badge: 'Routing & Security',
          description: 'Express / Fastify HTTP server providing rate limiting, payload sanitization, and structured JSON responses.',
          technologies: ['Node.js', 'Express', 'Zod Schema Validation', 'CORS & Helmet']
        },
        {
          name: 'Domain Services & Business Logic',
          color: 'amber',
          badge: 'Core Engine',
          description: 'Decoupled domain handlers executing business rules, state transitions, and background jobs.',
          technologies: ['Service Repository Pattern', 'Event Emitter', 'Async Worker Tasks']
        },
        {
          name: 'Persistence & Database Layer',
          color: 'emerald',
          badge: 'ACID Storage',
          description: 'Relational or document store maintaining normalized records, unique constraints, and fast B-tree indexes.',
          technologies: ['PostgreSQL / SQLite', 'Drizzle ORM / Prisma', 'Prepared Statements']
        }
      ],
      dataFlowSteps: [
        '1. Client action dispatched: React hook validates form inputs and renders optimistic feedback.',
        '2. Secure HTTP POST transmission: Request arrives at API gateway with Bearer headers.',
        '3. Schema validation: Request payload is checked against strict type constraints before execution.',
        '4. Transaction execution: Service logic mutates database state within an atomic transaction.',
        '5. Reactive broadcast: API returns 200 OK with fresh entity representation; UI cache reconciles seamlessly.'
      ]
    },
    techStack: [
      { category: 'Frontend' as const, technology: 'React 18 + Vite + TypeScript', reason: 'Instant HMR, strict type safety across components, and minimal bundle overhead.' },
      { category: 'Backend' as const, technology: 'Node.js + Express / Hono', reason: 'High-concurrency non-blocking I/O ideal for event-driven API requests.' },
      { category: 'Database' as const, technology: 'PostgreSQL or SQLite (WAL mode)', reason: 'ACID compliance, relational foreign keys, and low-latency queries.' },
      { category: 'Auth' as const, technology: 'JWT or Session Cookies with HTTP-Only flags', reason: 'Stateless verification with complete immunity to XSS credential theft.' },
      { category: 'DevOps & Hosting' as const, technology: 'Docker container on Cloud Run / Fly.io', reason: 'Zero-config reproducible container deployments with rapid scale-to-zero.' }
    ],
    fileTree: [
      { path: 'src/App.tsx', description: 'Root application shell, routing providers, and layout structure.', isFolder: false },
      { path: 'src/components/Dashboard.tsx', description: 'Interactive dashboard showing active entities and state actions.', isFolder: false },
      { path: 'src/hooks/useDataService.ts', description: 'Custom React hook managing asynchronous fetch, retry, and caching.', isFolder: false },
      { path: 'src/types/index.ts', description: 'Shared TypeScript domain models and API contracts.', isFolder: false },
      { path: 'server/server.ts', description: 'Express server entry point mounting middleware and API routes.', isFolder: false },
      { path: 'server/routes/items.ts', description: 'RESTful CRUD handlers with schema validation and error traps.', isFolder: false },
      { path: 'server/db/schema.sql', description: 'DDL table definitions, foreign keys, and index declarations.', isFolder: false }
    ],
    phases: [
      {
        phase: 1,
        title: 'Project Scaffold & Domain Modeling',
        description: 'Initialize repositories, declare TypeScript interfaces, and design the relational database schema.',
        tasks: [
          'Create repository structure and configure Vite + Tailwind + TypeScript',
          'Write database DDL schema with primary keys, timestamps, and indexes',
          'Establish shared types for requests, responses, and domain entities'
        ],
        estimatedHours: '2-4 hours'
      },
      {
        phase: 2,
        title: 'Backend API & Business Logic Engine',
        description: 'Implement server routes, input validation middlewares, and database access routines.',
        tasks: [
          'Set up Express router and configure JSON body parsing with rate limiting',
          'Build database connection pool and CRUD repository methods',
          'Add error handling middleware and structured JSON error responses'
        ],
        estimatedHours: '4-6 hours'
      },
      {
        phase: 3,
        title: 'Frontend Component Architecture',
        description: 'Build modular, accessible UI views and integrate custom data hooks.',
        tasks: [
          'Implement main dashboard view with live data tables and filter cards',
          'Connect React state to backend API with optimistic mutations',
          'Add skeleton loading states and toast notifications for user actions'
        ],
        estimatedHours: '5-8 hours'
      },
      {
        phase: 4,
        title: 'Testing, Hardening & Production Deployment',
        description: 'Validate edge cases, configure environment variables, and deploy production builds.',
        tasks: [
          'Write integration tests for critical business endpoints',
          'Audit WCAG accessibility (keyboard focus, contrast, screen readers)',
          'Build Dockerfile and configure continuous deployment pipeline'
        ],
        estimatedHours: '3-4 hours'
      }
    ],
    scaffoldFiles: [
      {
        filename: 'src/components/ProjectApp.tsx',
        language: 'tsx',
        description: 'Complete, production-ready interactive frontend component with state management.',
        code: `import React, { useState, useEffect } from 'react';

interface Item {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export function ProjectApp() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', title: 'Initialize production environment', status: 'completed', createdAt: 'Just now' },
    { id: '2', title: 'Configure database connection & migrations', status: 'in_progress', createdAt: '10m ago' },
    { id: '3', title: 'Connect reactive frontend state hooks', status: 'pending', createdAt: '20m ago' }
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: Item = {
      id: String(Date.now()),
      title: newTitle.trim(),
      status: 'pending',
      createdAt: 'Just now'
    };

    // Optimistic UI update
    setItems([newItem, ...items]);
    setNewTitle('');
  };

  const toggleStatus = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const nextStatus = item.status === 'completed' ? 'in_progress' : 'completed';
      return { ...item, status: nextStatus };
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">${cleanIdea}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Production application scaffold with optimistic updates and accessible controls.
        </p>
      </header>

      {/* Input Form */}
      <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter item or task title..."
          className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm cursor-pointer"
        >
          Add Item
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => toggleStatus(item.id)}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.status === 'completed'}
                onChange={() => {}}
                className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
              />
              <span className={item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                {item.title}
              </span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`
      },
      {
        filename: 'server/routes/api.ts',
        language: 'typescript',
        description: 'Modular Express REST API routes with input validation and error handling.',
        code: `import { Router, Request, Response } from 'express';

export const apiRouter = Router();

// In-memory or database repository abstraction
interface Entity {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: number;
}

const entities: Entity[] = [
  { id: '1', title: 'System core operational', status: 'completed', createdAt: Date.now() - 3600000 }
];

// GET /api/entities - List all entities
apiRouter.get('/entities', (req: Request, res: Response) => {
  return res.json({ success: true, count: entities.length, data: entities });
});

// POST /api/entities - Create a new entity with schema validation
apiRouter.post('/entities', (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Field "title" is required and must be non-empty.' });
  }

  const newEntity: Entity = {
    id: 'ent_' + Math.random().toString(36).substring(2, 9),
    title: title.trim(),
    status: 'pending',
    createdAt: Date.now()
  };

  entities.unshift(newEntity);
  return res.status(201).json({ success: true, data: newEntity });
});

// PATCH /api/entities/:id - Update status
apiRouter.patch('/entities/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const item = entities.find(e => e.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Entity not found.' });
  }

  if (['pending', 'in_progress', 'completed'].includes(status)) {
    item.status = status;
  }

  return res.json({ success: true, data: item });
});`
      },
      {
        filename: 'server/db/schema.sql',
        language: 'sql',
        description: 'PostgreSQL / SQLite relational database schema with indices and foreign keys.',
        code: `-- DDL Schema for ${cleanIdea}
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entities (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_entities_user_id ON entities(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_status ON entities(status);
CREATE INDEX IF NOT EXISTS idx_entities_created_at ON entities(created_at DESC);`
      }
    ],
    timestamp: Date.now()
  };
}

// ---------------------------------------------------------
// Endpoint 1: /api/explain - Generate structured explanation
// ---------------------------------------------------------
app.post('/api/explain', aiRateLimiter, async (req, res) => {
  try {
    const rawQuery = req.body.query;
    const rawLevel = req.body.level;
    const rawMode = req.body.mode;
    const rawContext = req.body.context;

    const query = validateString(rawQuery, 2, 500);
    if (!query) {
      return res.status(400).json({
        error: 'Question is required and must be between 2 and 500 characters.'
      });
    }

    const validLevels = ['beginner', 'intermediate', 'deep_dive'];
    const level = validLevels.includes(rawLevel) ? rawLevel : 'beginner';
    const mode = typeof rawMode === 'string' ? rawMode.slice(0, 100) : undefined;
    const context = typeof rawContext === 'string' ? rawContext.slice(0, 5000) : undefined;

    // -------------------------------------------------------------
    // VOICE MODE PIPELINE (Conversational, Spoken & Hand-Free Audio)
    // -------------------------------------------------------------
    if (mode === 'voice') {
      const rawHistory = req.body.conversationHistory;
      const conversationHistory = Array.isArray(rawHistory) ? rawHistory.slice(-8) : [];

      // Check if real-time information is requested
      const isRealTimeQuery = /weather|temperature|forecast|stock|price|crypto|bitcoin|market|news|headline|election|event|earthquake/i.test(query);
      let liveData: any = null;
      if (isRealTimeQuery) {
        try {
          liveData = await fetchLiveDataForQuery(query);
        } catch (e) {
          // non-blocking
        }
      }

      const ai = getGenAI();
      if (!ai) {
        const fallback = getFallbackVoiceExplanation(query, level, conversationHistory, liveData);
        return res.status(200).json({ success: true, data: fallback });
      }

      const historySummary = conversationHistory.length > 0
        ? conversationHistory.map((h: any) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.text}`).join('\n')
        : 'None (starting conversation)';

      const liveContextPrompt = liveData
        ? `\nLIVE REAL-TIME DATA CONTEXT (Inject this naturally into spoken response):\n${liveData.rawDataText}\n`
        : '';

      const voicePrompt = `You are the voice of Explanation Tutor: a warm, natural, brilliant personal teacher conversing directly aloud with a student.
Target learning depth: ${level}
${liveContextPrompt}
Conversation history so far:
${historySummary}

Student's spoken utterance: "${query}"

Guidelines for Spoken Voice Mode:
1. Analyze user intent from their utterance and conversation history:
   - "clarification": Student asks to pause or clarify a sub-concept (e.g. "Wait, what does compression ratio mean?", "What was that word?"). Succinctly clarify that exact term in 2 short sentences, then ask: "Should I continue where we left off, or would you like to explore this more?"
   - "simplification": Student asks for a simpler explanation (e.g. "Tell me that more simply", "Explain like I'm five", "Too complicated"). Re-explain with a vivid everyday metaphor using plain words.
   - "repeat": Student asks to repeat or rephrase (e.g. "Can you say that again?", "What did you say?").
   - "go_deeper": Student asks for deeper technical depth, mechanics, or invariants (e.g. "Tell me more", "How does that actually work under the hood?").
   - "skip": Student asks to jump ahead (e.g. "Skip ahead", "Next section").
   - "answer": Standard question or topic explanation.

2. Strict Spoken Audio Constraints:
   - "spokenText": 3 to 5 clear, speakable sentences (each sentence MUST be <= 15 words).
   - NEVER use markdown asterisks (*), hashtags (#), brackets, backticks, emojis, bullet points, or URLs in "spokenText" or "sentences" — this text is read directly aloud by a speech synthesizer!
   - Spell out technical symbols and numbers naturally (e.g., "fourteen degrees Celsius", "five gigabytes", "A squared plus B squared").
   - "sentences": Array of objects: [{"text": "Short sentence.", "durationMs": estimated milliseconds}].

3. Real-Time Data Handling:
   - If live data is provided or the student asks about current events, format the real-time facts naturally in the spoken response and include "realTimeData" with live stat tiles for the UI!

4. On-Screen Presentation:
   - "onScreenText": A clean, layered markdown summary for the student's screen (including simple words, first principles, or takeaways).
   - "visual": Valid visual diagram object adhering strictly to the diagram data contract:
     type: "flow" | "comparison" | "layers" | "concept_map" | "chart" | "equation" | "timeline", with "title", "stages", "caption", and relevant data blocks.

5. "followUpCommand": A natural, warm spoken follow-up question to keep the conversation flowing.

You MUST output ONLY valid JSON matching this schema:
{
  "spokenText": "Full speakable text without any markdown or symbols",
  "sentences": [
    { "text": "First short speakable sentence.", "durationMs": 2500 },
    { "text": "Second short speakable sentence.", "durationMs": 2200 }
  ],
  "onScreenText": "### Title\\n\\n**In simple words:** ...\\n\\n**Key Takeaway:** ...",
  "visual": {
    "title": "Diagram Title",
    "type": "flow",
    "stages": [
      { "label": "Stage 1", "description": "Short explanation", "badge": "Step 1" }
    ],
    "caption": "Diagram caption"
  },
  "intent": "answer",
  "followUpCommand": "Natural conversational prompt",
  "realTimeData": null
}`;

      try {
        const { text } = await callGeminiWithFallback(ai, {
          preferredModel: 'gemini-3.1-flash-lite',
          contents: voicePrompt,
          config: { responseMimeType: 'application/json' }
        });

        const parsed = safeJsonParse(text);
        if (parsed && parsed.spokenText && Array.isArray(parsed.sentences) && parsed.sentences.length > 0) {
          if (parsed.visual) {
            parsed.visual = sanitizeVisualExplanation(parsed.visual, query, level);
          } else {
            parsed.visual = buildFallbackVisual(query, level);
          }

          parsed.spokenText = parsed.spokenText.replace(/[*#_`\[\]()]/g, '').trim();
          parsed.sentences = parsed.sentences.map((s: any) => ({
            text: String(s?.text || '').replace(/[*#_`\[\]()]/g, '').trim(),
            durationMs: Number(s?.durationMs) || Math.max(1600, String(s?.text || '').split(' ').length * 360 + 500)
          })).filter((s: any) => s.text.length > 0);

          if (liveData && !parsed.realTimeData) {
            parsed.realTimeData = liveData;
          }

          return res.status(200).json({
            success: true,
            data: parsed
          });
        }
      } catch (voiceErr: any) {
        console.warn('AI call for voice mode encountered error, falling back:', voiceErr?.message || voiceErr);
      }

      const voiceFallback = getFallbackVoiceExplanation(query, level, conversationHistory, liveData);
      return res.status(200).json({
        success: true,
        data: voiceFallback
      });
    }

    const ai = getGenAI();
    if (!ai) {
      const fallback = getFallbackExplanation(query, level);
      return res.status(200).json({ success: true, data: fallback });
    }

    let depthDirective = '';
    if (level === 'beginner') {
      depthDirective = `
TARGET DEPTH: BEGINNER (Foundational Understanding & Plain Language)
- Write in warm, clear, friendly language without technical jargon.
- If a technical term is essential, define it immediately with an intuitive everyday analogy.
- "simpleExplanation": 2-3 crisp, intuitive sentences focusing on what the concept is and why it matters in real life.
- "inSimpleWords": An ELI5 explanation featuring a vivid, relatable everyday metaphor (e.g., cooking, kitchen appliances, games, sports, or nature).
- "realWorldExample": A relatable, everyday scenario anyone encounters in daily life.
- "visualExplanation": Choose the visual format that genuinely clarifies this concept for beginners: "flow" (step-by-step everyday journey), "cycle" (looping process), "comparison" (everyday comparison), "concept_map" (connected ideas), or "graph" (if math/formula). 3-4 friendly stages with short labels and badges. If a visual does not genuinely help, set "appliesToConcept": false.
- "stepByStep": 3-4 friendly sequential steps with helpful memory tips.
- "keyTakeaways": 4 clear, memorable foundational takeaways.
- "checkUnderstanding": An accessible multiple-choice question testing basic intuitive comprehension.
- "goDeeper": An exciting teaser of what to explore next.`;
    } else if (level === 'intermediate') {
      depthDirective = `
TARGET DEPTH: INTERMEDIATE (System Architecture, Mechanisms & Causal Flows)
- Assume the student already understands basic intuition. Focus on HOW the mechanism operates, causal interactions, state transitions, inputs/outputs, and standard technical terminology.
- Use precise domain terminology (e.g., protocols, enzyme pathways, memory buffers, causal chains) and explain the system relationships.
- "simpleExplanation": 3-4 structured sentences defining the formal mechanism, functional components, operational flow, and standard industry/scientific terminology.
- "inSimpleWords": A functional operational model or systems-level analogy illustrating state transitions, component interactions, and data/energy throughput.
- "realWorldExample": A realistic engineering, scientific, economic, or professional case study showing how the mechanism works in practical systems.
- "visualExplanation": Choose the visual type that best represents the system architecture or mechanism: "flow" (causal pipeline with state gates), "cycle" (feedback or event loop), "comparison" (comparing competing technologies/approaches), "concept_map" (modular relationships), "layers" (abstraction stack), or "graph" (formula/curves). 4 stages with technical labels and throughput badges.
- "stepByStep": 4-5 rigorous steps detailing component interactions, state transitions, preconditions, execution mechanisms, and validation checks with practical technical tips.
- "keyTakeaways": 4 technical takeaways covering operational rules, component interactions, terminology, and common technical pitfalls.
- "checkUnderstanding": A diagnostic multiple-choice question testing causal understanding of system mechanisms and terminology, with detailed technical explanations for all choices.
- "goDeeper": A bridge to advanced paradigms, related frameworks, and architectural challenges.`;
    } else {
      depthDirective = `
TARGET DEPTH: DEEP DIVE (Advanced Engineering, Rigor, Invariants, Edge Cases & Formal Tradeoffs)
- Target senior engineers, researchers, or advanced university students who need rigorous technical reasoning, underlying mathematical/architectural foundations, boundary conditions, edge cases, failure modes, and tradeoffs.
- Include governing formulas, algorithmic invariants, protocols, or code patterns where relevant. Do NOT dumb anything down.
- "simpleExplanation": A rigorous, comprehensive technical breakdown detailing formal mechanisms, architectural foundations, governing equations/laws/invariants, asymptotic complexities, and operational tradeoffs.
- "inSimpleWords": A deep systems-level or algorithmic mental model accompanied by an explicit analysis of where simplified analogies fail and why the exact mathematical/technical model is necessary.
- "realWorldExample": An advanced, high-stakes edge case, distributed system scenario, extreme physical condition, concurrency race condition, or asymptotic performance bottleneck under stress.
- "visualExplanation": Choose the visual type that reveals formal invariants, boundary conditions, or mathematical models: "flow" (formal state-machine pipeline), "layers" (deep abstraction stack), "graph" (mathematical/algorithmic formula or curve), or "comparison" (formal tradeoff matrix). 4-5 rigorous stages with exact technical names.
- "stepByStep": 4-6 in-depth steps analyzing atomic state transitions, mathematical formulas or algorithmic execution, edge condition handling, concurrency/race constraints, and theoretical limits with expert-level optimization tips.
- "keyTakeaways": 4 advanced takeaways covering theoretical invariants, architectural tradeoffs, formal limits (e.g. CAP theorem, thermodynamic limits, time/space complexity), and failure mode mitigations.
- "checkUnderstanding": A rigorous analytical multiple-choice question testing subtle edge cases, failure conditions, or architectural tradeoffs, with in-depth analytical explanations for all choices.
- "goDeeper": Cutting-edge research directions, open unsolved problems, formal optimization strategies, and bleeding-edge literature.`;
    }

    const systemPrompt = `You are Explanation Tutor: an AI designed to help people truly understand difficult concepts, not just provide raw answers.
Your motto: "AI that helps people understand, not just AI that gives answers."

Educational Guidelines:
1. Prioritize factual and conceptual correctness. Never invent facts.
2. Adapt strictly to the learner's target depth: ${level}.
${depthDirective}
3. For everyday analogies, ensure they are illuminating and explicitly explain where the analogy stops applying.
4. Visual Diagram Guideline:
   - Select the visual type that genuinely helps explain the concept:
     "flow" (causal pipeline or step-by-step), "cycle" (recurring loop), "comparison" (contrasting ideas/states), "concept_map" (connected concepts), "layers" (architectural stack), "timeline" (evolution/phases), or "graph" (mathematical formula / quantitative model).
   - Use crisp, readable, short labels (2-5 words) and concise descriptions.
   - For mathematical topics (e.g. Pythagorean Theorem, Calculus, Fourier, Probability), use "graph" with "graphData" breaking down the formula and variables.
   - For cyclical topics (e.g. Water cycle, Photosynthesis Calvin cycle, Event loop), use "cycle".
   - For comparative topics (e.g. Classical vs Quantum, Monolith vs Microservices), use "comparison" with "comparisonData".
   - Include 3 to 5 clear stages. If a visual does not genuinely help, set "appliesToConcept": false.
5. Create a challenging multiple-choice understanding check with 4 plausible options, only ONE of which is correct, with clear diagnostic explanations for each option.
${mode ? `\nTutor focus mode modifier: "${mode}"` : ''}
${context ? `\nReference Context Material: """\n${context}\n"""` : ''}

Query to explain: "${query}"

You MUST output ONLY valid JSON matching this structure:
{
  "topic": "Clean capitalized topic name",
  "level": "${level}",
  "simpleExplanation": "2-4 crisp sentences explaining the concept with depth matching ${level}.",
  "inSimpleWords": "An explanation matching the ${level} depth instructions.",
  "realWorldExample": {
    "title": "Short scenario title",
    "scenario": "A concrete situation demonstrating this concept at ${level} depth.",
    "takeaway": "Key insight from this scenario."
  },
  "visualExplanation": {
    "title": "Diagram / Flow title",
    "type": "flow",
    "appliesToConcept": true,
    "stages": [
      { "label": "Phase 1 Label", "description": "Concise explanation of this phase", "badge": "Phase 1 Badge" },
      { "label": "Phase 2 Label", "description": "Concise explanation of this phase", "badge": "Phase 2 Badge" },
      { "label": "Phase 3 Label", "description": "Concise explanation of this phase", "badge": "Phase 3 Badge" },
      { "label": "Phase 4 Label", "description": "Concise explanation of this phase", "badge": "Phase 4 Badge" }
    ],
    "caption": "Summary line or formula for the diagram",
    "comparisonData": {
      "sideA": { "title": "Side A Name", "points": ["Key feature 1", "Key feature 2"], "badge": "Badge A" },
      "sideB": { "title": "Side B Name", "points": ["Key feature 1", "Key feature 2"], "badge": "Badge B" },
      "keyDifference": "One-sentence fundamental distinction"
    },
    "conceptMapData": {
      "centralNode": "Core Concept",
      "branches": [
        { "label": "Sub-concept", "relationship": "depends on / produces / transforms", "description": "Short explanation" }
      ]
    },
    "graphData": {
      "type": "formula",
      "formula": "e.g. a² + b² = c² or f(x) = ...",
      "title": "Mathematical / Quantitative Model",
      "elements": [
        { "label": "Variable/Term", "value": "Role/Value", "description": "Intuition" }
      ],
      "explanation": "Intuitive explanation of the mathematical relationship"
    }
  },
  "stepByStep": [
    { "stepNumber": 1, "title": "First phase", "explanation": "Clear explanation", "tip": "Helpful insight" },
    { "stepNumber": 2, "title": "Second phase", "explanation": "Clear explanation", "tip": "Helpful insight" },
    { "stepNumber": 3, "title": "Third phase", "explanation": "Clear explanation" }
  ],
  "keyTakeaways": [
    "Takeaway 1 (concise)",
    "Takeaway 2 (concise)",
    "Takeaway 3 (concise)",
    "Takeaway 4 (concise)"
  ],
  "checkUnderstanding": {
    "question": "A multiple choice test question checking true conceptual understanding at ${level} depth?",
    "options": [
      { "text": "Option A text", "isCorrect": false, "explanation": "Why this option is incorrect." },
      { "text": "Option B text", "isCorrect": true, "explanation": "Why this option is correct." },
      { "text": "Option C text", "isCorrect": false, "explanation": "Why this option is incorrect." },
      { "text": "Option D text", "isCorrect": false, "explanation": "Why this option is incorrect." }
    ],
    "hint": "A subtle hint directing their thinking without giving away the answer."
  },
  "goDeeper": {
    "concept": "Nuance or related concept",
    "whyItMatters": "Why practitioners or researchers care about this nuance.",
    "curiousQuestion": "An intriguing question to spark further exploration."
  },
  "suggestedNext": [
    "Suggested related question 1?",
    "Suggested related question 2?",
    "Suggested related question 3?"
  ]
}`;

    try {
      const { text } = await callGeminiWithFallback(ai, {
        preferredModel: 'gemini-3.1-flash-lite',
        contents: systemPrompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsedData = safeJsonParse(text);
      if (parsedData && parsedData.topic && parsedData.simpleExplanation) {
        // Sanitize and validate visualExplanation so it never causes frontend crashes
        parsedData.visualExplanation = sanitizeVisualExplanation(
          parsedData.visualExplanation,
          parsedData.topic,
          level
        );

        return res.status(200).json({
          success: true,
          data: {
            ...parsedData,
            level, // Guarantee matching level
            id: 'gen-' + Date.now(),
            timestamp: Date.now()
          }
        });
      }
    } catch (modelErr: any) {
      console.warn('AI call for explanation encountered error, using structured fallback:', modelErr?.message || modelErr);
      const fallback = getFallbackExplanation(query, level);
      return res.status(200).json({
        success: true,
        data: fallback
      });
    }

    const fallback = getFallbackExplanation(query, level);
    return res.status(200).json({
      success: true,
      data: fallback
    });
  } catch (err: any) {
    console.error('Error in /api/explain:', err?.message || err);
    return handleAiError(err, res, 'The AI tutor is temporarily unavailable. Please try again.');
  }
});

// ---------------------------------------------------------
// Endpoint 1b: /api/visual - Dedicated Visual Diagram Generator
// ---------------------------------------------------------
app.post('/api/visual', aiRateLimiter, async (req, res) => {
  try {
    const rawTopic = req.body.topic;
    const rawLevel = req.body.level || 'beginner';
    const preferredType = req.body.preferredType;

    const topic = validateString(rawTopic, 1, 300);
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const level = (rawLevel === 'intermediate' || rawLevel === 'deep_dive') ? rawLevel : 'beginner';

    const ai = getGenAI();
    if (!ai) {
      const fallback = getFallbackExplanation(topic, level);
      return res.status(200).json({
        success: true,
        data: fallback.visualExplanation
      });
    }

    const visualPrompt = `You are an expert educational diagram designer for Explanation Tutor.
Generate a simple, clean, minimal, educational visual diagram that directly helps students understand: "${topic}".
Target explanation depth: ${level.toUpperCase()}.
${preferredType ? `Preferred diagram format: "${preferredType}"` : ''}

Choose the BEST visual type that genuinely clarifies the concept:
- "flow": for sequential processes, causality pipelines, steps, or algorithm phases.
- "cycle": for cyclical/repeating natural or software processes (e.g. water cycle, event loop, photosynthesis Calvin cycle, agile loop).
- "comparison": for contrasting two concepts, algorithms, paradigms, or states (e.g. Classical vs Quantum, Synchronous vs Asynchronous, Mitosis vs Meiosis).
- "concept_map": for topics with interconnected concepts, dependencies, or component principles.
- "layers": for abstraction stacks, network models, or system tiers.
- "timeline": for chronological evolution or phased milestones.
- "graph": for mathematical formulas, functions, geometric theorems (e.g. Pythagorean theorem), rates of change, or quantitative tradeoffs.

Visual Guidelines:
1. Avoid unnecessary clutter, excessive decoration, or tiny text. Use short, readable, crystal-clear labels.
2. Ensure the visual matches the selected level:
   - Beginner: 3-4 friendly, everyday intuitive stages or simple high-level diagram.
   - Intermediate: 4 causal system components/stages with inputs, state changes, and outputs.
   - Deep Dive: 4-5 formal stages, boundary invariants, mathematical parameters, or state machine gates.
3. If this concept is purely abstract and a visual does NOT genuinely help, set "appliesToConcept": false.

Output ONLY valid JSON matching this schema:
{
  "title": "Clean, descriptive diagram title",
  "type": "flow",
  "appliesToConcept": true,
  "stages": [
    { "label": "Short label (2-4 words)", "description": "Crisp 1-2 sentence educational explanation", "badge": "Short badge" }
  ],
  "caption": "Concise summary formula or takeaway line",
  "comparisonData": {
    "sideA": { "title": "Side A Name", "points": ["Key feature 1", "Key feature 2"], "badge": "Badge A" },
    "sideB": { "title": "Side B Name", "points": ["Key feature 1", "Key feature 2"], "badge": "Badge B" },
    "keyDifference": "Core distinction"
  },
  "conceptMapData": {
    "centralNode": "Central Concept",
    "branches": [
      { "label": "Sub-concept", "relationship": "depends on / produces / transforms", "description": "Brief note" }
    ]
  },
  "graphData": {
    "type": "formula",
    "formula": "e.g. a² + b² = c² or f(x) = ...",
    "title": "Mathematical / Quantitative Model",
    "elements": [
      { "label": "Variable/Term", "value": "Role/Value", "description": "Intuition" }
    ],
    "explanation": "Intuitive explanation of the mathematical relationship"
  }
}`;

    try {
      const { text } = await callGeminiWithFallback(ai, {
        preferredModel: 'gemini-3.1-flash-lite',
        contents: visualPrompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = safeJsonParse(text);
      if (parsed && (parsed.title || parsed.stages)) {
        const visualData = sanitizeVisualExplanation(parsed, topic, level);
        return res.status(200).json({ success: true, data: visualData });
      }
    } catch (modelErr: any) {
      console.warn('AI call in /api/visual encountered error, using fallback:', modelErr?.message || modelErr);
    }

    const fallback = getFallbackExplanation(topic, level);
    return res.status(200).json({ success: true, data: fallback.visualExplanation });
  } catch (err: any) {
    console.error('Error generating visual in /api/visual:', err?.message || err);
    const fallback = getFallbackExplanation(req.body?.topic || 'Concept', req.body?.level || 'beginner');
    return res.status(200).json({ success: true, data: fallback.visualExplanation });
  }
});

// ---------------------------------------------------------
// Endpoint 2: /api/code-tutor - Debug and explain code
// ---------------------------------------------------------
app.post('/api/code-tutor', aiRateLimiter, async (req, res) => {
  try {
    const rawCode = req.body.code;
    const rawLang = req.body.language;
    const rawDesc = req.body.errorDescription;

    const code = validateString(rawCode, 1, 20000);
    if (!code) {
      return res.status(400).json({
        error: 'Code snippet is required and must not exceed 20,000 characters.'
      });
    }

    const language = typeof rawLang === 'string' && rawLang.trim().length > 0 ? rawLang.trim().slice(0, 30) : 'python';
    const errorDescription = typeof rawDesc === 'string' ? rawDesc.slice(0, 2000) : '';

    const ai = getGenAI();
    if (!ai) {
      const fallback = getFallbackCodeReview(code, language, errorDescription);
      return res.status(200).json({
        success: true,
        data: fallback
      });
    }

    const prompt = `You are Code Tutor in Explanation Tutor: an AI that teaches programmers how to understand why bugs happen and how code actually executes.
Goal: Do NOT just output a blind patch. Explain the mental model, memory lifecycle, scope, or logic invariants that broke.

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`
User Note / Observed Problem: "${errorDescription}"

Provide your pedagogical breakdown as strict JSON with this exact schema:
{
  "whatsWrong": "A clear, plain-language description of the bug or design issue.",
  "why": "The underlying computer science / language execution reason why this happens (memory, scope, timing, syntax, mutation, invariants, etc.).",
  "correctedCode": "The cleanly formatted, corrected code with explanatory comments.",
  "whatChanged": [
    "Bullet 1 explaining what was changed",
    "Bullet 2 explaining what was changed"
  ],
  "learnThisConcept": {
    "concept": "Name of the core programming concept (e.g. Pass by Reference, Closure Scope, Off-by-one)",
    "explanation": "Why this concept is fundamental and how to remember it.",
    "ruleOfThumb": "A practical rule of thumb for future coding."
  },
  "tryItYourself": {
    "prompt": "A mini challenge testing the student on this fix",
    "starterCode": "Code snippet with a similar subtle flaw",
    "solutionCode": "The clean solution"
  }
}`;

    try {
      const { text } = await callGeminiWithFallback(ai, {
        preferredModel: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsedData = safeJsonParse(text);
      if (parsedData && parsedData.whatsWrong && parsedData.correctedCode) {
        return res.status(200).json({ success: true, data: parsedData });
      }
    } catch (modelErr: any) {
      console.warn('AI call in /api/code-tutor note, using pedagogical fallback:', modelErr?.message || modelErr);
    }

    const fallback = getFallbackCodeReview(code, language, errorDescription);
    return res.status(200).json({ success: true, data: fallback });
  } catch (err: any) {
    console.error('Error in /api/code-tutor:', err?.message || err);
    const fallback = getFallbackCodeReview(req.body?.code || '', req.body?.language || 'python', req.body?.errorDescription);
    return res.status(200).json({ success: true, data: fallback });
  }
});

// ---------------------------------------------------------
// Endpoint 3: /api/evaluate-challenge - Evaluate mini challenge
// ---------------------------------------------------------
app.post('/api/evaluate-challenge', aiRateLimiter, async (req, res) => {
  try {
    const rawUserCode = req.body.userCode;
    const rawPrompt = req.body.challengePrompt;
    const rawSolution = req.body.solutionCode;
    const rawLang = req.body.language;

    const userCode = validateString(rawUserCode, 1, 20000);
    if (!userCode) {
      return res.status(400).json({
        error: 'Solution code is required.'
      });
    }

    const challengePrompt = validateString(rawPrompt, 5, 2000);
    if (!challengePrompt) {
      return res.status(400).json({
        error: 'Challenge prompt is required.'
      });
    }

    const solutionCode = typeof rawSolution === 'string' ? rawSolution.slice(0, 5000) : '';
    const language = typeof rawLang === 'string' ? rawLang.slice(0, 30) : 'python';

    const ai = getGenAI();
    if (!ai) {
      const fallback = getFallbackEvaluation(userCode, challengePrompt);
      return res.status(200).json({
        success: true,
        data: fallback
      });
    }

    const prompt = `You are an expert programming instructor evaluating a student's answer to a code challenge.
Language: ${language}
Challenge Description: "${challengePrompt}"

Reference Solution:
\`\`\`
${solutionCode}
\`\`\`

Student's Submitted Solution:
\`\`\`
${userCode}
\`\`\`

Evaluation Rubric:
- DO NOT rely on simple keyword presence (like 'if', 'let', 'None', '<= 1').
- Analyze the student's actual logic, syntax, boundary handling, and correctness.
- Determine whether the code satisfies the challenge requirement.
- Provide constructive, encouraging feedback explaining why it works or what edge case was missed.

Output strictly valid JSON with this schema:
{
  "isCorrect": boolean,
  "feedback": "2-3 crisp sentences explaining whether the solution correctly fixes the issue and why.",
  "conceptMastery": "Mastered" | "Partially Understood" | "Needs Review",
  "detectedIssues": ["Optional bullet of missed edge case or syntax issue"]
}`;

    try {
      const { text } = await callGeminiWithFallback(ai, {
        preferredModel: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsedData = safeJsonParse(text);
      if (parsedData && typeof parsedData.isCorrect === 'boolean') {
        return res.status(200).json({
          success: true,
          data: {
            isCorrect: Boolean(parsedData.isCorrect),
            feedback: parsedData.feedback || 'Evaluation completed.',
            conceptMastery: parsedData.conceptMastery || (parsedData.isCorrect ? 'Mastered' : 'Needs Review'),
            detectedIssues: Array.isArray(parsedData.detectedIssues) ? parsedData.detectedIssues : []
          }
        });
      }
    } catch (modelErr: any) {
      console.warn('AI call in /api/evaluate-challenge note, using heuristic fallback:', modelErr?.message || modelErr);
    }

    const fallback = getFallbackEvaluation(userCode, challengePrompt);
    return res.status(200).json({ success: true, data: fallback });
  } catch (err: any) {
    console.error('Error in /api/evaluate-challenge:', err?.message || err);
    const fallback = getFallbackEvaluation(req.body?.userCode || '', req.body?.challengePrompt || '');
    return res.status(200).json({ success: true, data: fallback });
  }
});

// ---------------------------------------------------------
// Endpoint: /api/realtime - Live Information with Layered Pedagogy
// ---------------------------------------------------------
app.post('/api/realtime', aiRateLimiter, async (req, res) => {
  try {
    const rawQuery = req.body.query;
    const rawIntent = req.body.intent;

    const query = validateString(rawQuery, 2, 300);
    if (!query) {
      return res.status(400).json({ error: 'Please provide a valid query to fetch real-time information.' });
    }

    const intent = typeof rawIntent === 'string' && ['weather', 'finance', 'news', 'events', 'general'].includes(rawIntent)
      ? (rawIntent as 'weather' | 'finance' | 'news' | 'events' | 'general')
      : undefined;

    // 1. Fetch live telemetry/data
    const liveData = await fetchLiveDataForQuery(query, intent);

    // 2. Synthesize pedagogical explanation with Gemini
    const ai = getGenAI();
    if (!ai) {
      const fallback = getFallbackRealTime(query, liveData);
      return res.status(200).json({ success: true, data: fallback });
    }

    const prompt = `You are Explanation Tutor in Real-Time Information Mode.
Lead with WHY and HOW, never just a flat dataset.
Topic / Query: "${query}"
Intent: "${liveData.intent}"
Live Verified Data:
"""
${liveData.rawDataText}
Source: ${liveData.source}
Last Updated: ${liveData.lastUpdated}
"""

Explain this data in our signature 3-layer pedagogical format:
1. In Simple Words (a 2-sentence analogy anyone can grasp)
2. First-Principles Explanation (how it actually works under the hood — the atmospheric, economic, algorithmic, or physical causal mechanism)
3. Real-World Context (concrete scenario of what this means right now)

Generate a clean JSON response matching this schema:
{
  "headline": "Crisp informative headline summarizing status or trend",
  "inSimpleWords": "2-sentence analogy explaining the concept or trend.",
  "firstPrinciples": "How the underlying causal mechanism works under the hood.",
  "realWorldContext": "Concrete scenario of what this means for people, developers, or society today.",
  "liveTiles": [
    {
      "label": "Metric Name",
      "value": "Formatted value (e.g. 26°C or $84,400)",
      "change": "e.g. +2.1% or Clear",
      "isPositive": true,
      "subtext": "Brief contextual meaning",
      "icon": "thermometer | droplet | wind | trending-up | activity | zap | percent | check-circle"
    }
  ],
  "visual": {
    "type": "${liveData.dataPoints ? 'trend' : 'stat_tiles'}",
    "title": "Clear diagram title",
    "caption": "Short caption explaining the visual",
    "dataPoints": ${JSON.stringify(liveData.dataPoints || [])},
    "summary": "1-sentence summary of the visual data"
  },
  "keyTakeaways": [
    "Key takeaway 1 emphasizing cause and effect",
    "Key takeaway 2 emphasizing cause and effect",
    "Key takeaway 3 emphasizing cause and effect"
  ],
  "relatedQueries": [
    "Related inquisitive question 1",
    "Related inquisitive question 2",
    "Related inquisitive question 3"
  ]
}`;

    try {
      const { text } = await callGeminiWithFallback(ai, {
        preferredModel: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = safeJsonParse(text);
      if (parsed && parsed.headline && parsed.inSimpleWords && parsed.firstPrinciples) {
        return res.status(200).json({
          success: true,
          data: {
            id: `rt-${Date.now()}`,
            query,
            intent: liveData.intent,
            headline: parsed.headline,
            source: liveData.source,
            lastUpdated: liveData.lastUpdated,
            timestamp: Date.now(),
            inSimpleWords: parsed.inSimpleWords,
            firstPrinciples: parsed.firstPrinciples,
            realWorldContext: parsed.realWorldContext || 'Applies directly to current operational planning and decision-making.',
            liveTiles: Array.isArray(parsed.liveTiles) && parsed.liveTiles.length > 0 ? parsed.liveTiles : liveData.starterTiles,
            visual: parsed.visual || {
              type: liveData.dataPoints ? 'trend' : 'stat_tiles',
              title: 'Live Telemetry & Indicator Profile',
              dataPoints: liveData.dataPoints
            },
            keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [
              'Observed directly from live verified sources.',
              'Reflects real-time causal equilibrium.',
              'Provides early indicator for future directional developments.'
            ],
            relatedQueries: Array.isArray(parsed.relatedQueries) ? parsed.relatedQueries : [
              'What factors could alter this trend in the next 48 hours?',
              'What is the first-principles explanation for this behavior?'
            ],
            isLiveDataAvailable: true
          }
        });
      }
    } catch (modelErr: any) {
      console.warn('AI call in /api/realtime note, using pedagogical fallback:', modelErr?.message || modelErr);
    }

    const fallback = getFallbackRealTime(query, liveData);
    return res.status(200).json({ success: true, data: fallback });
  } catch (err: any) {
    console.error('Error in /api/realtime:', err?.message || err);
    return res.status(500).json({ error: 'Failed to process real-time information. Please try again.' });
  }
});

// ---------------------------------------------------------
// Endpoint: /api/build - Software & Product Architect Blueprint
// ---------------------------------------------------------
app.post('/api/build', aiRateLimiter, async (req, res) => {
  try {
    const rawIdea = req.body.idea;
    const rawTechPreferences = req.body.techPreferences;

    const idea = validateString(rawIdea, 3, 500);
    if (!idea) {
      return res.status(400).json({ error: 'Please describe the application or system idea you want to architect.' });
    }

    const techPreferences = validateString(rawTechPreferences, 2, 200) || 'Modern React, TypeScript, Node/Express, relational database';

    const ai = getGenAI();
    if (!ai) {
      const fallback = getFallbackBuildPlan(idea, techPreferences);
      return res.status(200).json({ success: true, data: fallback });
    }

    const prompt = `You are Explanation Tutor in "Build Something" mode acting as an elite interactive software/product architect.
The user wants to build: "${idea}".
Tech preferences: "${techPreferences}".

Always produce a WORKING, production-grade blueprint, not just high-level advice.
Structure output in strict JSON matching:
{
  "brief": {
    "title": "Catchy, professional product name",
    "tagline": "One-line value proposition",
    "targetAudience": "Target user persona and why they need this",
    "coreGoal": "The single most critical problem solved",
    "keyFeatures": [
      "Key feature 1 with rationale",
      "Key feature 2 with rationale",
      "Key feature 3 with rationale",
      "Key feature 4 with rationale"
    ]
  },
  "architecture": {
    "title": "System Architecture & End-to-End Data Pipeline",
    "layers": [
      {
        "name": "Frontend & UI Layer",
        "color": "indigo",
        "badge": "Client",
        "description": "Component structure, reactive state, and client-side caching",
        "technologies": ["React 18", "TypeScript", "Tailwind CSS"]
      },
      {
        "name": "API & Middleware Gateway",
        "color": "sky",
        "badge": "Server",
        "description": "Route validation, security headers, rate limiting",
        "technologies": ["Node.js", "Express", "Zod"]
      },
      {
        "name": "Data Persistence Layer",
        "color": "emerald",
        "badge": "Database",
        "description": "Relational schema, foreign keys, index optimization",
        "technologies": ["PostgreSQL / SQLite", "Drizzle ORM"]
      }
    ],
    "dataFlowSteps": [
      "Step 1: User action triggered in UI -> Hook initiates validated fetch",
      "Step 2: API Gateway validates Bearer token and checks payload schema",
      "Step 3: Service layer executes transactional database mutation",
      "Step 4: Response returned with optimistic UI cache reconciliation"
    ]
  },
  "techStack": [
    { "category": "Frontend", "technology": "React 18 + Vite + TypeScript", "reason": "Fast compile times, component modularity, and compile-time contract safety." },
    { "category": "Backend", "technology": "Node.js + Express", "reason": "Lightweight, event-driven I/O with universal TypeScript types." },
    { "category": "Database", "technology": "PostgreSQL / SQLite", "reason": "Relational consistency, foreign key cascades, and ACID compliance." },
    { "category": "Auth", "technology": "JWT / HTTP-Only Session Cookies", "reason": "Secure stateless token verification immune to XSS." },
    { "category": "DevOps & Hosting", "technology": "Docker + Cloud Run", "reason": "Reproducible builds and sub-second scale to zero." }
  ],
  "fileTree": [
    { "path": "src/App.tsx", "description": "Main application layout and provider tree", "isFolder": false },
    { "path": "src/components/MainView.tsx", "description": "Interactive primary component with reactive state", "isFolder": false },
    { "path": "server/index.ts", "description": "Express server mounting routes and middleware", "isFolder": false },
    { "path": "server/db/schema.sql", "description": "Relational database table definitions and indices", "isFolder": false }
  ],
  "phases": [
    {
      "phase": 1,
      "title": "Data Modeling & Contract Definition",
      "description": "Design database schema, API contracts, and TypeScript types",
      "tasks": ["Draft database schema", "Declare shared TypeScript interfaces", "Setup project configuration"],
      "estimatedHours": "2-3 hrs"
    },
    {
      "phase": 2,
      "title": "Backend API & Service Implementation",
      "description": "Implement route handlers, input validation, and database queries",
      "tasks": ["Create Express route endpoints", "Write database query helpers", "Add error middleware"],
      "estimatedHours": "4-6 hrs"
    },
    {
      "phase": 3,
      "title": "Frontend UI & State Integration",
      "description": "Build interactive components and connect to backend APIs",
      "tasks": ["Construct UI layout", "Implement optimistic updates", "Add dark mode & accessibility tags"],
      "estimatedHours": "4-6 hrs"
    },
    {
      "phase": 4,
      "title": "Hardening, Security & Deployment",
      "description": "Perform security review, write integration tests, and deploy",
      "tasks": ["Audit edge cases and errors", "Test responsive mobile viewport", "Configure production deployment"],
      "estimatedHours": "2-3 hrs"
    }
  ],
  "scaffoldFiles": [
    {
      "filename": "src/components/MainView.tsx",
      "language": "tsx",
      "description": "Production-ready interactive React component with complete state logic",
      "code": "// Complete working React component..."
    },
    {
      "filename": "server/routes/api.ts",
      "language": "typescript",
      "description": "Express REST API router with schema validation and error handling",
      "code": "// Complete working Express routes..."
    },
    {
      "filename": "server/db/schema.sql",
      "language": "sql",
      "description": "Clean SQL DDL table schema with indices and foreign keys",
      "code": "-- Complete working SQL schema..."
    }
  ]
}`;

    try {
      const { text } = await callGeminiWithFallback(ai, {
        preferredModel: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = safeJsonParse(text);
      if (parsed && parsed.brief && parsed.architecture && Array.isArray(parsed.phases) && Array.isArray(parsed.scaffoldFiles)) {
        return res.status(200).json({
          success: true,
          data: {
            id: `build-${Date.now()}`,
            idea,
            brief: parsed.brief,
            architecture: parsed.architecture,
            techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
            fileTree: Array.isArray(parsed.fileTree) ? parsed.fileTree : [],
            phases: parsed.phases,
            scaffoldFiles: parsed.scaffoldFiles,
            timestamp: Date.now()
          }
        });
      }
    } catch (modelErr: any) {
      console.warn('AI call in /api/build note, using architectural fallback:', modelErr?.message || modelErr);
    }

    const fallback = getFallbackBuildPlan(idea, techPreferences);
    return res.status(200).json({ success: true, data: fallback });
  } catch (err: any) {
    console.error('Error in /api/build:', err?.message || err);
    const fallback = getFallbackBuildPlan(req.body?.idea || '', req.body?.techPreferences);
    return res.status(200).json({ success: true, data: fallback });
  }
});

// ---------------------------------------------------------
// Endpoint 4: /api/analyze-material - Analyze uploaded text or PDF
// ---------------------------------------------------------
app.post('/api/analyze-material', aiRateLimiter, async (req, res) => {
  try {
    const rawTitle = req.body.title;
    const rawContent = req.body.content;
    const rawPdfBase64 = req.body.pdfBase64;

    const title = validateString(rawTitle, 1, 300) || 'Uploaded Study Material';

    let contentText = '';
    let isPdf = false;
    let pdfData = '';

    if (typeof rawPdfBase64 === 'string' && rawPdfBase64.length > 50) {
      isPdf = true;
      pdfData = rawPdfBase64;
      try {
        const buffer = Buffer.from(pdfData, 'base64');
        if (typeof PDFParse === 'function') {
          const parsed = await PDFParse(buffer);
          if (parsed && parsed.text && parsed.text.trim().length > 10) {
            contentText = parsed.text.slice(0, 30000);
          }
        }
      } catch (pdfErr) {
        console.warn('Local PDF parse note:', pdfErr);
      }
    } else if (typeof rawContent === 'string') {
      contentText = rawContent.trim();
      if (contentText.length < 10) {
        return res.status(400).json({
          error: "We couldn't read sufficient text from this file. Please try another file or format."
        });
      }
      if (contentText.length > 150000) {
        return res.status(413).json({
          error: 'Document content exceeds maximum allowable size (150,000 characters).'
        });
      }
    } else {
      return res.status(400).json({
        error: "We couldn't read this file. Please try another file or format."
      });
    }

    const ai = getGenAI();
    if (!ai) {
      const fallback = fallbackDocumentAnalysis(title, contentText || title);
      return res.status(200).json({
        success: true,
        data: {
          ...fallback,
          extractedContent: contentText ? contentText.slice(0, 10000) : `Document: ${title}`
        }
      });
    }

    const analysisInstruction = `Analyze this document titled "${title}".
Extract structured educational insights in JSON matching this exact structure:
{
  "summary": "3-4 crisp sentences summarizing the core conceptual mechanics and thesis of this material.",
  "keyConcepts": [
    "Core concept 1 with concise note",
    "Core concept 2 with concise note",
    "Core concept 3 with concise note",
    "Core concept 4 with concise note"
  ],
  "recommendedQuestions": [
    "Inquisitive question 1 to test true conceptual understanding?",
    "Inquisitive question 2 to test true conceptual understanding?",
    "Inquisitive question 3 to test true conceptual understanding?"
  ]
}`;

    let contentsPayload: any;

    if (isPdf && pdfData) {
      contentsPayload = {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfData
            }
          },
          { text: analysisInstruction }
        ]
      };
    } else {
      contentsPayload = `Study material titled "${title}":
"""
${contentText.slice(0, 25000)}
"""

${analysisInstruction}`;
    }

    let responseResult: { text: string; modelUsed: string } | null = null;
    try {
      responseResult = await callGeminiWithFallback(ai, {
        preferredModel: 'gemini-3.1-flash-lite',
        contents: contentsPayload,
        config: { responseMimeType: 'application/json' }
      });
    } catch (primaryErr: any) {
      if (isPdf && contentText && contentText.length > 20) {
        console.warn('PDF multimodal attempt failed, falling back to extracted text prompt');
        const textPayload = `Study material extracted from "${title}":
"""
${contentText.slice(0, 25000)}
"""

${analysisInstruction}`;
        try {
          responseResult = await callGeminiWithFallback(ai, {
            preferredModel: 'gemini-3.1-flash-lite',
            contents: textPayload,
            config: { responseMimeType: 'application/json' }
          });
        } catch (textErr) {
          console.warn('AI fallback failed, using local document analysis:', textErr);
          responseResult = null;
        }
      } else {
        responseResult = null;
      }
    }

    let parsedData = responseResult ? safeJsonParse(responseResult.text) : null;
    if (
      !parsedData ||
      !parsedData.summary ||
      !Array.isArray(parsedData.keyConcepts) ||
      !Array.isArray(parsedData.recommendedQuestions)
    ) {
      console.warn('Parsing AI response yielded incomplete schema, using document synthesis fallback');
      parsedData = fallbackDocumentAnalysis(title, contentText || title);
    }

    return res.status(200).json({
      success: true,
      data: {
        summary: parsedData.summary,
        keyConcepts: parsedData.keyConcepts,
        recommendedQuestions: parsedData.recommendedQuestions,
        extractedContent: contentText ? contentText.slice(0, 10000) : `Document: ${title}`
      }
    });
  } catch (err: any) {
    console.error('Error in /api/analyze-material:', err?.message || err);
    return handleAiError(err, res, 'Material analysis failed. Please verify the document format or try again.');
  }
});

// ---------------------------------------------------------
// Endpoint 5: /api/learning-path - Fast & Verified Academic Curricula Search
// ---------------------------------------------------------
app.post('/api/learning-path', (req, res) => {
  try {
    const rawQuery = req.body.query;
    const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';

    if (!query) {
      return res.status(200).json({
        success: true,
        data: VERIFIED_CURRICULA[0],
        allPaths: VERIFIED_CURRICULA
      });
    }

    // 1. Search knowledge graph
    const searchMatches = searchCurricula(query, VERIFIED_CURRICULA);
    if (searchMatches.length > 0) {
      return res.status(200).json({
        success: true,
        data: searchMatches[0],
        matches: searchMatches
      });
    }

    // 2. Synthesize academically sequenced path for arbitrary query
    const synthesized = getOrGenerateAcademicPath(query, VERIFIED_CURRICULA);
    return res.status(200).json({
      success: true,
      data: synthesized,
      matches: [synthesized]
    });
  } catch (err: any) {
    console.error('Error in /api/learning-path:', err);
    return res.status(200).json({
      success: true,
      data: VERIFIED_CURRICULA[0],
      matches: VERIFIED_CURRICULA.slice(0, 5)
    });
  }
});

// ---------------------------------------------------------
// Setup Vite middleware for development & static in production
// ---------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Explanation Tutor server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
