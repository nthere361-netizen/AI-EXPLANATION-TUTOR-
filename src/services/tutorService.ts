import { 
  ExplanationData, 
  ExplanationLevel, 
  CodeTutorResponse, 
  StudyMaterial, 
  ChallengeEvaluationResponse 
} from '../types';
import { PRESET_EXPLANATIONS } from '../data/mockData';

// Helper to normalize query string for lookup
function normalizeQuery(q: string): string {
  return q.toLowerCase().trim().replace(/[?!.,;]/g, '');
}

/**
 * Fetch conceptual explanation.
 * Uses curated baseline presets for instant initial experience when exact match and beginner level,
 * but calls real server AI tutor endpoint for all custom topics, depth levels, and modifiers.
 * Throws on failure instead of generating fake content.
 */
export async function fetchExplanation(
  query: string,
  level: ExplanationLevel = 'beginner',
  mode?: string,
  context?: string
): Promise<ExplanationData> {
  const norm = normalizeQuery(query);

  // 1. Curated baseline presets (only when exact match, beginner level, and no custom modifier/context)
  if (level === 'beginner' && !mode && !context) {
    for (const [key, preset] of Object.entries(PRESET_EXPLANATIONS)) {
      if (norm === normalizeQuery(key)) {
        return {
          ...preset,
          level,
          id: preset.id + '-' + Date.now(),
          timestamp: Date.now()
        };
      }
    }
  }

  // 2. Call the server-side AI tutor endpoint
  try {
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, level, mode, context })
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = json?.error || (res.status === 429 ? 'Too many requests. Please wait a moment.' : 'The AI tutor is temporarily unavailable.');
      throw new Error(errMsg);
    }

    if (json.success && json.data) {
      return json.data;
    }

    throw new Error('The AI tutor returned an invalid response structure.');
  } catch (err: any) {
    console.error('Explanation request failed:', err?.message || err);
    throw new Error(err?.message || 'The AI tutor is temporarily unavailable. Please try again.');
  }
}

/**
 * Debug code with AI tutor.
 * Explains underlying computational mechanics and provides clean correction.
 * Throws truthful error if service fails.
 */
export async function debugCodeWithTutor(
  code: string,
  language: string,
  errorDescription?: string
): Promise<CodeTutorResponse> {
  try {
    const res = await fetch('/api/code-tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, errorDescription })
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = json?.error || 'Unable to analyze code with Code Tutor.';
      throw new Error(errMsg);
    }

    if (json.success && json.data) {
      return json.data;
    }

    throw new Error('Code Tutor returned an unexpected response structure.');
  } catch (err: any) {
    console.error('Code Tutor request failed:', err?.message || err);
    throw new Error(err?.message || 'Code Tutor is temporarily unavailable. Please try again.');
  }
}

/**
 * Evaluate mini challenge code solution with rubric-based AI evaluation.
 * Does NOT rely on superficial keyword matching.
 */
export async function evaluateChallenge(payload: {
  challengePrompt: string;
  starterCode?: string;
  solutionCode?: string;
  userCode: string;
  language?: string;
}): Promise<ChallengeEvaluationResponse> {
  try {
    const res = await fetch('/api/evaluate-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = json?.error || 'Unable to evaluate challenge.';
      throw new Error(errMsg);
    }

    if (json.success && json.data) {
      return json.data;
    }

    throw new Error('Invalid evaluation response structure.');
  } catch (err: any) {
    console.error('Challenge evaluation failed:', err?.message || err);
    throw new Error(err?.message || 'Challenge evaluation service is unavailable. Please try again.');
  }
}

/**
 * Analyze uploaded study material (text or PDF).
 * Real server-side analysis pipeline.
 */
export async function analyzeMaterial(
  title: string,
  content?: string,
  pdfBase64?: string
): Promise<{
  summary: string;
  keyConcepts: string[];
  recommendedQuestions: string[];
  extractedContent?: string;
}> {
  try {
    const res = await fetch('/api/analyze-material', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, pdfBase64 })
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = json?.error || (res.status === 503
        ? 'This model is currently experiencing high demand. Please try again in a moment.'
        : "We couldn't read or analyze this file. Please try another file or format.");
      throw new Error(errMsg);
    }

    if (json?.data?.summary) {
      return json.data;
    }

    throw new Error(json?.error || 'Invalid material analysis response.');
  } catch (err: any) {
    console.error('Material analysis failed:', err?.message || err);
    throw err;
  }
}
