/**
 * Tutor Service facade
 * Re-exports the resilient API client implementation from api.ts
 * ensuring backward compatibility across all views and components.
 */
export {
  ApiError,
  sanitizeQueryInput,
  apiFetchExplanation as fetchExplanation,
  apiFetchVisualDiagram as fetchVisualDiagram,
  apiDebugCodeWithTutor as debugCodeWithTutor,
  apiEvaluateChallenge as evaluateChallenge,
  apiAnalyzeMaterial as analyzeMaterial,
} from './api';
