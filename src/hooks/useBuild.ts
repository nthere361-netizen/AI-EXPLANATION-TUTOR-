import { useState, useCallback } from 'react';
import { BuildPlanData } from '../types';
import { fetchBuildPlan, ApiError } from '../services/api';

const STORAGE_KEY_BUILD = 'explanation_tutor_active_build_v3';
const STORAGE_KEY_SAVED_BUILDS = 'explanation_tutor_saved_builds_v3';

export function useBuild() {
  const [data, setData] = useState<BuildPlanData | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUILD);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [savedBuilds, setSavedBuilds] = useState<BuildPlanData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_BUILDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generateBuildPlan = useCallback(async (idea: string, techPreferences?: string) => {
    const clean = idea.trim();
    if (!clean) return;

    setIsLoading(true);
    setError(null);
    setLoadingStep('Architecting system topology & data pipelines…');

    try {
      setLoadingStep('Synthesizing working code scaffold files…');
      const res = await fetchBuildPlan(clean, techPreferences);
      setData(res);

      try {
        localStorage.setItem(STORAGE_KEY_BUILD, JSON.stringify(res));
      } catch {}
    } catch (err: any) {
      console.error('Build plan error:', err);
      const msg = err instanceof ApiError 
        ? err.message 
        : 'The software architect is temporarily unavailable. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, []);

  const saveCurrentBuild = useCallback(() => {
    if (!data) return;
    setSavedBuilds(prev => {
      const exists = prev.some(b => b.id === data.id);
      const updated = exists ? prev.map(b => b.id === data.id ? data : b) : [data, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_SAVED_BUILDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [data]);

  const deleteSavedBuild = useCallback((id: string) => {
    setSavedBuilds(prev => {
      const updated = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_SAVED_BUILDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const loadSavedBuild = useCallback((build: BuildPlanData) => {
    setData(build);
    try {
      localStorage.setItem(STORAGE_KEY_BUILD, JSON.stringify(build));
    } catch {}
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY_BUILD);
    } catch {}
  }, []);

  return {
    data,
    savedBuilds,
    isLoading,
    loadingStep,
    error,
    generateBuildPlan,
    saveCurrentBuild,
    deleteSavedBuild,
    loadSavedBuild,
    clear,
  };
}
