import { useState, useCallback, useEffect } from 'react';
import { ExplanationData, ExplanationLevel } from '../types';
import { fetchExplanation, fetchVisualDiagram, ApiError } from '../services/api';

const STORAGE_KEY_EXPLANATION = 'explanation_tutor_active_data_v3';
const STORAGE_KEY_HISTORY = 'explanation_tutor_recent_v3';

export function useExplanation(initialLevel: ExplanationLevel = 'beginner') {
  const [data, setData] = useState<ExplanationData | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPLANATION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [level, setLevel] = useState<ExplanationLevel>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPLANATION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.level) return parsed.level;
      }
    } catch {}
    return initialLevel;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [
        'How does photosynthesis work?',
        'How does an API work?',
        'What is recursion?',
        'Why does inflation happen?',
        'How do neural networks learn?'
      ];
    } catch {
      return [];
    }
  });

  const recordQuery = useCallback((query: string) => {
    setRecentQueries(prev => {
      const updated = [query, ...prev.filter(q => q.toLowerCase() !== query.toLowerCase())].slice(0, 15);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const explainTopic = useCallback(async (query: string, targetLevel: ExplanationLevel = level) => {
    const clean = query.trim();
    if (!clean) return;

    setIsLoading(true);
    setError(null);
    setLoadingStep('Deconstructing first-principles foundations…');

    try {
      const res = await fetchExplanation(clean, targetLevel);
      setData(res);
      setLevel(targetLevel);
      recordQuery(clean);

      try {
        localStorage.setItem(STORAGE_KEY_EXPLANATION, JSON.stringify(res));
      } catch {}

      // If visual is missing stages, synthesize dedicated visual
      if (!res.visualExplanation?.stages || res.visualExplanation.stages.length === 0) {
        setLoadingStep('Synthesizing structured visual diagram…');
        try {
          const vis = await fetchVisualDiagram(clean, targetLevel, res.visualExplanation?.type);
          setData(prev => {
            if (!prev) return res;
            const updated = { ...prev, visualExplanation: vis, level: targetLevel };
            try {
              localStorage.setItem(STORAGE_KEY_EXPLANATION, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        } catch (visErr) {
          console.warn('Visual fallback note:', visErr);
        }
      }
    } catch (err: any) {
      console.error('Explanation error:', err);
      const msg = err instanceof ApiError 
        ? err.message 
        : 'The tutor is temporarily taking a nap. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [level, recordQuery]);

  const changeLevel = useCallback(async (newLevel: ExplanationLevel) => {
    if (!data || data.level === newLevel) return;
    await explainTopic(data.topic, newLevel);
  }, [data, explainTopic]);

  const clearExplanation = useCallback(() => {
    setData(null);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY_EXPLANATION);
    } catch {}
  }, []);

  return {
    data,
    level,
    setLevel,
    isLoading,
    loadingStep,
    error,
    recentQueries,
    explainTopic,
    changeLevel,
    clearExplanation,
  };
}
