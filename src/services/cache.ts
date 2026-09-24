/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Explanation Tutor High-Performance Explanation Cache
 * In-memory LRU + localStorage persistence with TTL and instant retrieval.
 */

import { ExplanationData, ExplanationLevel } from '../types';

interface CacheEntry {
  data: ExplanationData;
  timestamp: number;
  ttl: number; // in milliseconds (default 24 hours)
}

const STORAGE_PREFIX = 'exp_tutor_cache_';
const MAX_MEMORY_ENTRIES = 60;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Fast In-Memory Map (0ms access)
const memoryCache = new Map<string, CacheEntry>();

/**
 * Normalizes query string, level, and mode into a consistent deterministic key.
 */
export function buildCacheKey(query: string, level: ExplanationLevel = 'beginner', mode: string = 'standard'): string {
  const cleanQ = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 80);
  const cleanL = level.toLowerCase();
  const cleanM = (mode || 'standard').toLowerCase();
  return `${cleanQ}__lvl_${cleanL}__m_${cleanM}`;
}

/**
 * Retrieves cached explanation instantly if available and not expired.
 */
export function getCachedExplanation(query: string, level: ExplanationLevel = 'beginner', mode?: string): ExplanationData | null {
  const key = buildCacheKey(query, level, mode || 'standard');
  const now = Date.now();

  // 1. Try In-Memory Cache first (Fastest)
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    if (now - memEntry.timestamp < memEntry.ttl) {
      // Refresh LRU position
      memoryCache.delete(key);
      memoryCache.set(key, memEntry);
      return memEntry.data;
    }
    memoryCache.delete(key);
  }

  // 2. Try localStorage Cache
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) {
      const parsed: CacheEntry = JSON.parse(raw);
      if (now - parsed.timestamp < parsed.ttl && parsed.data) {
        // Promote to in-memory cache
        memoryCache.set(key, parsed);
        return parsed.data;
      }
      localStorage.removeItem(STORAGE_PREFIX + key);
    }
  } catch (e) {
    // Graceful degradation on storage quota or security restrictions
  }

  return null;
}

/**
 * Stores explanation into both memory and persistent localStorage.
 */
export function setCachedExplanation(
  query: string,
  level: ExplanationLevel,
  data: ExplanationData,
  mode?: string,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  const key = buildCacheKey(query, level, mode || 'standard');
  const entry: CacheEntry = {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  };

  // 1. In-Memory eviction (LRU)
  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, entry);

  // 2. localStorage persistence
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch (e) {
    // If storage full, purge older cached keys
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      // Remove oldest half of entries
      keysToRemove.slice(0, Math.ceil(keysToRemove.length / 2)).forEach(k => localStorage.removeItem(k));
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Ignore quota errors
    }
  }
}

/**
 * Checks if a query is already cached without decoding the full payload.
 */
export function hasCachedExplanation(query: string, level: ExplanationLevel = 'beginner', mode?: string): boolean {
  return getCachedExplanation(query, level, mode) !== null;
}
