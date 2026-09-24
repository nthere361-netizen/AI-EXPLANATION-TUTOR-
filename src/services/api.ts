import { 
  ExplanationData, 
  ExplanationLevel, 
  CodeTutorResponse, 
  ChallengeEvaluationResponse,
  VisualExplanation,
  VisualDiagramType,
  RealTimeData,
  RealTimeIntent,
  BuildPlanData,
  StructuredLearningPath,
  VoiceExplanationResponse,
  VoiceExplainRequest
} from '../types';
import { getCuratedPreset } from '../data/mockData';

export class ApiError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number = 500, retryAfter?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

/**
 * Resilient fetcher with exponential backoff & jitter for 429 / transient 503 errors.
 */
async function resilientFetch<T>(
  url: string,
  options: RequestInit,
  retries: number = 2,
  baseDelayMs: number = 800
): Promise<T> {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, options);

      // Handle 429 Too Many Requests with Retry-After header or exponential backoff
      if (response.status === 429) {
        if (attempt < retries) {
          const retryHeader = response.headers.get('Retry-After');
          const delay = retryHeader 
            ? parseInt(retryHeader, 10) * 1000 
            : baseDelayMs * Math.pow(2, attempt) + Math.random() * 300;
          
          attempt++;
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }

        const data = await response.json().catch(() => ({}));
        throw new ApiError(
          data?.error || 'Rate limit reached. Please wait a moment before trying again.',
          429,
          data?.retryAfter
        );
      }

      // Handle server error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData?.error || `Request failed with status ${response.status}`,
          response.status
        );
      }

      const json = await response.json();
      return json as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }

      // Network / connection drop retry
      if (attempt < retries) {
        attempt++;
        const backoff = baseDelayMs * Math.pow(2, attempt) + Math.random() * 200;
        await new Promise((res) => setTimeout(res, backoff));
        continue;
      }

      throw new ApiError(
        err?.message || 'Unable to connect to tutor service. Please check your network.',
        0
      );
    }
  }

  throw new ApiError('Maximum retry attempts exceeded.', 500);
}

/**
 * Validates and clamps a user query to safe limits.
 */
export function sanitizeQueryInput(query: string, maxLength: number = 2000): string {
  if (!query || typeof query !== 'string') {
    throw new ApiError('Please enter a question or topic.', 400);
  }
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    throw new ApiError('Query is too short. Please enter at least 2 characters.', 400);
  }
  return trimmed.slice(0, maxLength);
}

/**
 * Fetch conceptual explanation with full depth control and curated fallbacks.
 */
export async function apiFetchExplanation(
  query: string,
  level: ExplanationLevel = 'beginner',
  mode?: string,
  context?: string
): Promise<ExplanationData> {
  const sanitized = sanitizeQueryInput(query);

  try {
    const result = await resilientFetch<{ success: boolean; data: ExplanationData }>('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sanitized, level, mode, context }),
    });

    if (result.success && result.data) {
      return {
        ...result.data,
        level, // Ensure level matches user's request
      };
    }

    const preset = getCuratedPreset(sanitized, level);
    if (preset) return preset;

    throw new ApiError('Invalid response received from tutor server.', 502);
  } catch (err: any) {
    const preset = getCuratedPreset(sanitized, level);
    if (preset) return preset;

    console.error('apiFetchExplanation failed:', err?.message || err);
    throw new ApiError(
      err?.message || 'The AI tutor is temporarily unavailable. Please try again.',
      err?.status || 500
    );
  }
}

/**
 * Fetch dedicated educational visual diagram.
 */
export async function apiFetchVisualDiagram(
  topic: string,
  level: ExplanationLevel = 'beginner',
  preferredType?: VisualDiagramType
): Promise<VisualExplanation> {
  const sanitized = sanitizeQueryInput(topic, 300);

  try {
    const result = await resilientFetch<{ success: boolean; data: VisualExplanation }>('/api/visual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: sanitized, level, preferredType }),
    });

    if (result.success && result.data) {
      return result.data;
    }

    throw new ApiError('Invalid visual diagram data received.', 502);
  } catch (err: any) {
    console.warn('apiFetchVisualDiagram encountered error, using fallback:', err?.message || err);
    const preset = getCuratedPreset(sanitized, level);
    if (preset && preset.visualExplanation) {
      return preset.visualExplanation;
    }

    // Default safe fallback visual
    return {
      title: `${sanitized} Conceptual Flow`,
      type: 'flow',
      appliesToConcept: true,
      stages: [
        { label: 'Foundational Input', description: 'Starting ingredients or initial state.', badge: 'Precondition' },
        { label: 'Active Transformation', description: 'Core mechanism operating smoothly.', badge: 'Active Process' },
        { label: 'Observable Result', description: 'Clear outcome and takeaway.', badge: 'Final State' },
      ],
      caption: 'Step-by-step conceptual mechanism.',
      level,
    };
  }
}

// Aliases for cleaner imports
export const fetchExplanation = apiFetchExplanation;
export const fetchVisualDiagram = apiFetchVisualDiagram;
export const fetchRealTime = apiFetchRealTime;
export const fetchBuildPlan = apiFetchBuildPlan;
export const debugCodeWithTutor = apiDebugCodeWithTutor;
export const evaluateChallenge = apiEvaluateChallenge;
export const analyzeMaterial = apiAnalyzeMaterial;

/**
 * Fetch real-time live data with layered pedagogical explanation.
 */
export async function apiFetchRealTime(
  query: string,
  intent?: RealTimeIntent
): Promise<RealTimeData> {
  const sanitized = sanitizeQueryInput(query, 300);

  try {
    const result = await resilientFetch<{ success: boolean; data: RealTimeData }>('/api/realtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sanitized, intent }),
    });

    if (result.success && result.data) {
      return result.data;
    }

    throw new ApiError('Invalid response received from real-time service.', 502);
  } catch (err: any) {
    console.error('apiFetchRealTime failed:', err?.message || err);
    throw new ApiError(
      err?.message || 'Unable to retrieve real-time intelligence. Please try again.',
      err?.status || 500
    );
  }
}

/**
 * Fetch interactive software/product architecture blueprint & scaffold.
 */
export async function apiFetchBuildPlan(
  idea: string,
  techPreferences?: string
): Promise<BuildPlanData> {
  const sanitized = sanitizeQueryInput(idea, 500);

  try {
    const result = await resilientFetch<{ success: boolean; data: BuildPlanData }>('/api/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: sanitized, techPreferences }),
    });

    if (result.success && result.data) {
      return result.data;
    }

    throw new ApiError('Invalid response received from software architect service.', 502);
  } catch (err: any) {
    console.error('apiFetchBuildPlan failed:', err?.message || err);
    throw new ApiError(
      err?.message || 'Unable to generate build plan. Please try again.',
      err?.status || 500
    );
  }
}


/**
 * Debug code with Code Tutor.
 */
export async function apiDebugCodeWithTutor(
  code: string,
  language: string,
  errorDescription?: string
): Promise<CodeTutorResponse> {
  if (!code || typeof code !== 'string' || !code.trim()) {
    throw new ApiError('Please provide source code to debug.', 400);
  }

  try {
    const result = await resilientFetch<{ success: boolean; data: CodeTutorResponse }>('/api/code-tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code: code.slice(0, 15000), 
        language: language || 'javascript', 
        errorDescription: errorDescription ? errorDescription.slice(0, 1000) : undefined 
      }),
    });

    if (result.success && result.data) {
      return result.data;
    }

    throw new ApiError('Code Tutor returned an unexpected structure.', 502);
  } catch (err: any) {
    console.error('apiDebugCodeWithTutor error:', err?.message || err);
    throw new ApiError(
      err?.message || 'Code Tutor is temporarily unavailable. Please try again.',
      err?.status || 500
    );
  }
}

/**
 * Evaluate mini challenge code solution.
 */
export async function apiEvaluateChallenge(payload: {
  challengePrompt: string;
  starterCode?: string;
  solutionCode?: string;
  userCode: string;
  language?: string;
}): Promise<ChallengeEvaluationResponse> {
  if (!payload.userCode || !payload.userCode.trim()) {
    throw new ApiError('Please write some code before submitting your solution.', 400);
  }

  try {
    const result = await resilientFetch<{ success: boolean; data: ChallengeEvaluationResponse }>('/api/evaluate-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (result.success && result.data) {
      return result.data;
    }

    throw new ApiError('Evaluation returned an invalid format.', 502);
  } catch (err: any) {
    console.error('apiEvaluateChallenge error:', err?.message || err);
    throw new ApiError(
      err?.message || 'Challenge evaluation service is unavailable. Please try again.',
      err?.status || 500
    );
  }
}

/**
 * Analyze uploaded study material (text or PDF).
 */
export async function apiAnalyzeMaterial(
  title: string,
  content?: string,
  pdfBase64?: string
): Promise<{
  summary: string;
  keyConcepts: string[];
  recommendedQuestions: string[];
  extractedContent?: string;
}> {
  if (!title || !title.trim()) {
    throw new ApiError('Document title is required.', 400);
  }
  if (!content && !pdfBase64) {
    throw new ApiError('Please provide document text or upload a PDF.', 400);
  }

  try {
    const result = await resilientFetch<{
      success: boolean;
      data: {
        summary: string;
        keyConcepts: string[];
        recommendedQuestions: string[];
        extractedContent?: string;
      };
    }>('/api/analyze-material', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), content, pdfBase64 }),
    });

    if (result.success && result.data) {
      return result.data;
    }

    throw new ApiError('Material analysis returned an invalid structure.', 502);
  } catch (err: any) {
    console.error('apiAnalyzeMaterial error:', err?.message || err);
    throw new ApiError(
      err?.message || 'Material analysis service is temporarily unavailable.',
      err?.status || 500
    );
  }
}

/**
 * Search or synthesize structured learning paths.
 */
export async function apiSearchLearningPaths(query: string): Promise<{
  data: StructuredLearningPath;
  matches?: StructuredLearningPath[];
}> {
  try {
    const result = await resilientFetch<{
      success: boolean;
      data: StructuredLearningPath;
      matches?: StructuredLearningPath[];
    }>('/api/learning-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim() })
    });

    if (result.success && result.data) {
      return { data: result.data, matches: result.matches };
    }

    throw new ApiError('Learning path returned an invalid structure.', 502);
  } catch (err: any) {
    console.warn('apiSearchLearningPaths error, falling back:', err?.message || err);
    throw err;
  }
}

/**
 * Spoken Voice Mode API: Conversational turn with speakable sentences,
 * intent analysis, synchronized sentences, and visual diagram.
 */
export async function apiVoiceExplain(payload: VoiceExplainRequest): Promise<VoiceExplanationResponse> {
  const sanitizedQuery = sanitizeQueryInput(payload.query, 600);

  try {
    const result = await resilientFetch<{ success: boolean; data: VoiceExplanationResponse }>('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: sanitizedQuery,
        level: payload.level || 'beginner',
        mode: 'voice',
        intent: payload.intent,
        conversationHistory: payload.conversationHistory,
        voiceSettings: payload.voiceSettings
      }),
    });

    if (result.success && result.data) {
      return result.data;
    }

    throw new ApiError('Invalid response received from voice tutor service.', 502);
  } catch (err: any) {
    console.error('apiVoiceExplain failed:', err?.message || err);
    throw new ApiError(
      err?.message || 'Voice tutor is temporarily unavailable. Please try again.',
      err?.status || 500
    );
  }
}
