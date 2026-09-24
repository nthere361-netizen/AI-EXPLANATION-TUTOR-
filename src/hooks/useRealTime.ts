import { useState, useCallback } from 'react';
import { RealTimeData, RealTimeIntent } from '../types';
import { fetchRealTime, ApiError } from '../services/api';

const STORAGE_KEY_REALTIME = 'explanation_tutor_active_realtime_v3';
const STORAGE_KEY_REALTIME_RECENT = 'explanation_tutor_realtime_recent_v3';

export function useRealTime() {
  const [data, setData] = useState<RealTimeData | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REALTIME);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REALTIME_RECENT);
      return saved ? JSON.parse(saved) : [
        'Tokyo current weather and forecast',
        'Bitcoin live price & market trend',
        'Ethereum gas fees & network activity',
        'Federal Reserve interest rate decisions & inflation',
        'Latest AI and semiconductor supply developments'
      ];
    } catch {
      return [];
    }
  });

  const recordQuery = useCallback((query: string) => {
    setRecentQueries(prev => {
      const updated = [query, ...prev.filter(q => q.toLowerCase() !== query.toLowerCase())].slice(0, 15);
      try {
        localStorage.setItem(STORAGE_KEY_REALTIME_RECENT, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const fetchLiveInfo = useCallback(async (query: string, intent?: RealTimeIntent) => {
    const clean = query.trim();
    if (!clean) return;

    setIsLoading(true);
    setError(null);
    setLoadingStep('Accessing live verified feeds…');

    try {
      setLoadingStep('Synthesizing first-principles telemetry…');
      const res = await fetchRealTime(clean, intent);
      setData(res);
      recordQuery(clean);

      try {
        localStorage.setItem(STORAGE_KEY_REALTIME, JSON.stringify(res));
      } catch {}
    } catch (err: any) {
      console.error('Real-time query error:', err);
      const msg = err instanceof ApiError 
        ? err.message 
        : 'Live intelligence feed unavailable. Please check your query or try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [recordQuery]);

  const refresh = useCallback(async () => {
    if (!data) return;
    await fetchLiveInfo(data.query, data.intent);
  }, [data, fetchLiveInfo]);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY_REALTIME);
    } catch {}
  }, []);

  return {
    data,
    isLoading,
    loadingStep,
    error,
    recentQueries,
    fetchLiveInfo,
    refresh,
    clear,
  };
}
