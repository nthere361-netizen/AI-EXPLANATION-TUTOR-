import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

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
// Robust Model Invocation with Retry & Fallback
// ---------------------------------------------------------
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  options: {
    contents: any;
    config?: any;
    preferredModel?: string;
  }
): Promise<{ text: string; modelUsed: string }> {
  // Ordered sequence of authorized models to navigate capacity spikes
  const modelsToTry = [
    options.preferredModel || 'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite'
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config
        });

        const text = response?.text;
        if (text && text.trim().length > 0) {
          return { text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || String(err)).toLowerCase();
        console.warn(`Gemini call to ${model} (attempt ${attempt + 1}) encountered:`, err?.message || err);

        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('high demand') ||
          errMsg.includes('overloaded') ||
          errMsg.includes('429') ||
          errMsg.includes('resource_exhausted') ||
          errMsg.includes('rate limit');

        if (isTransient) {
          // Linear/jittered backoff before next attempt
          await new Promise(res => setTimeout(res, 800 * (attempt + 1)));
          continue;
        } else {
          // If non-transient, try next model in fallback list
          break;
        }
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

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'The AI tutor is temporarily unavailable. Please verify the Gemini API configuration.'
      });
    }

    const levelDescriptions = {
      beginner: 'Intuitive everyday analogies, plain language, vivid metaphors, zero unnecessary jargon.',
      intermediate: 'Underlying mechanisms, causal chains, state transitions, inputs, processes, and outputs.',
      deep_dive: 'Edge cases, formal boundaries, mathematical/architectural tradeoffs, nuances, and failure modes.'
    };

    const systemPrompt = `You are Explanation Tutor: an AI designed to help people truly understand difficult concepts, not just provide raw answers.
Your motto: "AI that helps people understand, not just AI that gives answers."

Educational Guidelines:
1. Prioritize factual and conceptual correctness. Never invent facts.
2. Adapt strictly to the learner's target depth: ${level} (${levelDescriptions[level as keyof typeof levelDescriptions]}).
3. For everyday analogies, ensure they are illuminating and explicitly explain where the analogy stops applying.
4. Keep the visual diagram realistic, structured as 3 to 4 sequential architectural or conceptual phases.
5. Create a challenging multiple-choice understanding check with 4 plausible options, only ONE of which is correct, with clear diagnostic explanations for each option.
${mode ? `\nTutor focus mode modifier: "${mode}"` : ''}
${context ? `\nReference Context Material: """\n${context}\n"""` : ''}

Query to explain: "${query}"

You MUST output ONLY valid JSON matching this structure:
{
  "topic": "Clean capitalized topic name",
  "level": "${level}",
  "simpleExplanation": "2-3 crisp sentences explaining the core concept clearly.",
  "inSimpleWords": "An ELI5 explanation using a vivid, memorable everyday analogy.",
  "realWorldExample": {
    "title": "Short relatable scenario title",
    "scenario": "A concrete real-world situation demonstrating this concept.",
    "takeaway": "Key insight from this scenario."
  },
  "visualExplanation": {
    "title": "Diagram / Flow title",
    "type": "flow",
    "stages": [
      { "label": "Phase 1 Label", "description": "Concise explanation of this phase", "badge": "Input/Trigger" },
      { "label": "Phase 2 Label", "description": "Concise explanation of this phase", "badge": "Core Mechanism" },
      { "label": "Phase 3 Label", "description": "Concise explanation of this phase", "badge": "Validation/State" },
      { "label": "Phase 4 Label", "description": "Concise explanation of this phase", "badge": "Output/Result" }
    ],
    "caption": "Summary line or formula for the diagram"
  },
  "stepByStep": [
    { "stepNumber": 1, "title": "First phase", "explanation": "Clear explanation", "tip": "Helpful insight" },
    { "stepNumber": 2, "title": "Second phase", "explanation": "Clear explanation", "tip": "Helpful insight" },
    { "stepNumber": 3, "title": "Third phase", "explanation": "Clear explanation", "tip": "Helpful insight" }
  ],
  "keyTakeaways": [
    "Takeaway 1 (concise)",
    "Takeaway 2 (concise)",
    "Takeaway 3 (concise)",
    "Takeaway 4 (concise)"
  ],
  "checkUnderstanding": {
    "question": "A sharp multiple choice test question checking true conceptual understanding?",
    "options": [
      { "text": "Option A text", "isCorrect": false, "explanation": "Why this option is incorrect." },
      { "text": "Option B text", "isCorrect": true, "explanation": "Why this option is correct." },
      { "text": "Option C text", "isCorrect": false, "explanation": "Why this option is incorrect." },
      { "text": "Option D text", "isCorrect": false, "explanation": "Why this option is incorrect." }
    ],
    "hint": "A subtle hint directing their thinking without giving away the answer."
  },
  "goDeeper": {
    "concept": "Advanced nuance or related breakthrough concept",
    "whyItMatters": "Why serious practitioners or researchers care about this nuance.",
    "curiousQuestion": "An intriguing question to spark further exploration."
  },
  "suggestedNext": [
    "Suggested related question 1?",
    "Suggested related question 2?",
    "Suggested related question 3?"
  ]
}`;

    const { text } = await callGeminiWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      contents: systemPrompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsedData = safeJsonParse(text);
    if (!parsedData || !parsedData.topic || !parsedData.simpleExplanation) {
      console.error('Invalid schema structure from AI:', text?.slice(0, 200));
      return res.status(502).json({
        error: 'The AI explanation was incomplete. Please try again.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...parsedData,
        id: 'gen-' + Date.now(),
        timestamp: Date.now()
      }
    });
  } catch (err: any) {
    console.error('Error in /api/explain:', err?.message || err);
    return handleAiError(err, res, 'The AI tutor is temporarily unavailable. Please try again.');
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
      return res.status(503).json({
        error: 'The AI tutor is temporarily unavailable. Please verify the Gemini API configuration.'
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

    const { text } = await callGeminiWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsedData = safeJsonParse(text);
    if (!parsedData || !parsedData.whatsWrong || !parsedData.correctedCode) {
      return res.status(502).json({
        error: 'Incomplete Code Tutor response from AI. Please try again.'
      });
    }

    return res.status(200).json({ success: true, data: parsedData });
  } catch (err: any) {
    console.error('Error in /api/code-tutor:', err?.message || err);
    return handleAiError(err, res, 'The AI tutor is temporarily unavailable. Please try again.');
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
      return res.status(503).json({
        error: 'The AI tutor is temporarily unavailable. Please verify the Gemini API configuration.'
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

    const { text } = await callGeminiWithFallback(ai, {
      preferredModel: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsedData = safeJsonParse(text);
    if (!parsedData) {
      return res.status(502).json({
        error: 'Unable to evaluate solution. Please try again.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        isCorrect: Boolean(parsedData.isCorrect),
        feedback: parsedData.feedback || 'Evaluation completed.',
        conceptMastery: parsedData.conceptMastery || (parsedData.isCorrect ? 'Mastered' : 'Needs Review'),
        detectedIssues: Array.isArray(parsedData.detectedIssues) ? parsedData.detectedIssues : []
      }
    });
  } catch (err: any) {
    console.error('Error in /api/evaluate-challenge:', err?.message || err);
    return handleAiError(err, res, 'Evaluation service temporarily unavailable. Please try again.');
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
      // Extract text using PDFParse for text fallback
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
      return res.status(503).json({
        error: 'The AI tutor is temporarily unavailable. Please verify the Gemini API configuration.'
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
      // First try native multimodal document analysis
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

    let responseResult: { text: string; modelUsed: string };
    try {
      responseResult = await callGeminiWithFallback(ai, {
        preferredModel: 'gemini-3.8-flash',
        contents: contentsPayload,
        config: { responseMimeType: 'application/json' }
      });
    } catch (primaryErr: any) {
      // If multimodal PDF failed and we have extracted text, fallback to text prompt
      if (isPdf && contentText && contentText.length > 20) {
        console.warn('PDF multimodal attempt failed, falling back to extracted text prompt');
        const textPayload = `Study material extracted from "${title}":
"""
${contentText.slice(0, 25000)}
"""

${analysisInstruction}`;
        responseResult = await callGeminiWithFallback(ai, {
          preferredModel: 'gemini-3.8-flash',
          contents: textPayload,
          config: { responseMimeType: 'application/json' }
        });
      } else {
        throw primaryErr;
      }
    }

    const parsedData = safeJsonParse(responseResult.text);
    if (
      !parsedData ||
      !parsedData.summary ||
      !Array.isArray(parsedData.keyConcepts) ||
      !Array.isArray(parsedData.recommendedQuestions)
    ) {
      console.error('Failed to parse material analysis:', responseResult.text?.slice(0, 250));
      return res.status(502).json({
        error: 'Failed to parse material analysis. Please try again.'
      });
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
