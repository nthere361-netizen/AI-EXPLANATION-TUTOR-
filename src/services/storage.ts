import { ExplanationData, ExplanationLevel, StudyMaterial, UserPreferences, PersonalNote } from '../types';
import { SAMPLE_STUDY_MATERIALS, PRESET_EXPLANATIONS } from '../data/mockData';

const STORAGE_KEYS = {
  RECENT_QUESTIONS: 'explanation_tutor_recent_questions_v1',
  SAVED_TOPICS: 'explanation_tutor_saved_topics_v1',
  MATERIALS: 'explanation_tutor_materials_v1',
  PREFERENCES: 'explanation_tutor_preferences_v1',
  ACTIVE_EXPLANATION: 'explanation_tutor_active_explanation_v1',
  COMPLETED_NODES: 'explanation_tutor_completed_nodes_v1',
  THEME: 'explanation_tutor_theme_v1',
  NOTES: 'explanation_tutor_personal_notes_v1'
} as const;

export interface StoredQuestion {
  id: string;
  query: string;
  level: ExplanationLevel;
  timestamp: number;
}

export interface StoredTopic {
  id: string;
  title: string;
  summary: string;
  savedAt: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultLevel: 'beginner',
  speechSpeed: 1.0,
  voiceEnabled: true,
  explanationStyle: 'analogy',
  reducedMotion: false,
  theme: 'light'
};

const DEFAULT_QUESTIONS: StoredQuestion[] = [
  { id: '1', query: 'Explain photosynthesis', level: 'beginner', timestamp: Date.now() - 3600000 },
  { id: '2', query: 'What is an API?', level: 'beginner', timestamp: Date.now() - 7200000 },
  { id: '3', query: 'Explain recursion', level: 'beginner', timestamp: Date.now() - 86400000 }
];

const DEFAULT_SAVED_TOPICS: StoredTopic[] = [
  {
    id: 'photosynthesis',
    title: 'Photosynthesis & The Calvin Cycle',
    summary: '6CO2 + 6H2O -> C6H12O6 + 6O2. Photolysis splits water, yielding O2 and ATP.',
    savedAt: Date.now() - 10000000
  }
];

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadStoredRecentQuestions(): StoredQuestion[] {
  if (!isLocalStorageAvailable()) return DEFAULT_QUESTIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.RECENT_QUESTIONS);
    if (!raw) return DEFAULT_QUESTIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_QUESTIONS;
  } catch (e) {
    console.warn('Failed to parse stored questions from localStorage:', e);
    return DEFAULT_QUESTIONS;
  }
}

export function saveStoredRecentQuestions(questions: StoredQuestion[]): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.RECENT_QUESTIONS, JSON.stringify(questions));
  } catch (e) {
    console.warn('Failed to save questions to localStorage:', e);
  }
}

export function loadStoredSavedTopics(): StoredTopic[] {
  if (!isLocalStorageAvailable()) return DEFAULT_SAVED_TOPICS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SAVED_TOPICS);
    if (!raw) return DEFAULT_SAVED_TOPICS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SAVED_TOPICS;
  } catch (e) {
    console.warn('Failed to parse saved topics from localStorage:', e);
    return DEFAULT_SAVED_TOPICS;
  }
}

export function saveStoredSavedTopics(topics: StoredTopic[]): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.SAVED_TOPICS, JSON.stringify(topics));
  } catch (e) {
    console.warn('Failed to save topics to localStorage:', e);
  }
}

export function loadStoredMaterials(): StudyMaterial[] {
  if (!isLocalStorageAvailable()) return SAMPLE_STUDY_MATERIALS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (!raw) return SAMPLE_STUDY_MATERIALS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_STUDY_MATERIALS;
  } catch (e) {
    console.warn('Failed to parse stored materials from localStorage:', e);
    return SAMPLE_STUDY_MATERIALS;
  }
}

export function saveStoredMaterials(materials: StudyMaterial[]): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  } catch (e) {
    console.warn('Failed to save materials to localStorage:', e);
  }
}

export function loadStoredPreferences(): UserPreferences {
  if (!isLocalStorageAvailable()) return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (e) {
    console.warn('Failed to parse stored preferences from localStorage:', e);
    return DEFAULT_PREFERENCES;
  }
}

export function saveStoredPreferences(preferences: UserPreferences): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (e) {
    console.warn('Failed to save preferences to localStorage:', e);
  }
}

export function loadStoredActiveExplanation(): ExplanationData {
  const fallback = PRESET_EXPLANATIONS['explain photosynthesis'];
  if (!isLocalStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.ACTIVE_EXPLANATION);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && parsed.topic ? parsed : fallback;
  } catch (e) {
    console.warn('Failed to parse stored active explanation:', e);
    return fallback;
  }
}

export function saveStoredActiveExplanation(explanation: ExplanationData): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.ACTIVE_EXPLANATION, JSON.stringify(explanation));
  } catch (e) {
    console.warn('Failed to save active explanation to localStorage:', e);
  }
}

export function loadStoredCompletedNodes(): string[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.COMPLETED_NODES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse completed nodes:', e);
    return [];
  }
}

export function saveStoredCompletedNodes(nodes: string[]): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.COMPLETED_NODES, JSON.stringify(nodes));
  } catch (e) {
    console.warn('Failed to save completed nodes:', e);
  }
}

export function clearStoredSession(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.RECENT_QUESTIONS);
    window.localStorage.removeItem(STORAGE_KEYS.SAVED_TOPICS);
    window.localStorage.removeItem(STORAGE_KEYS.MATERIALS);
    window.localStorage.removeItem(STORAGE_KEYS.ACTIVE_EXPLANATION);
    window.localStorage.removeItem(STORAGE_KEYS.COMPLETED_NODES);
    window.localStorage.removeItem(STORAGE_KEYS.NOTES);
  } catch (e) {
    console.warn('Failed to clear session data from localStorage:', e);
  }
}

export function loadStoredPersonalNotes(): Record<string, PersonalNote> {
  if (!isLocalStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (e) {
    console.warn('Failed to parse personal notes from localStorage:', e);
    return {};
  }
}

export function loadPersonalNoteForTopic(topic: string): PersonalNote | null {
  if (!topic) return null;
  const allNotes = loadStoredPersonalNotes();
  const key = topic.trim().toLowerCase();
  return allNotes[key] || null;
}

export function savePersonalNoteForTopic(topic: string, text: string): PersonalNote {
  const allNotes = loadStoredPersonalNotes();
  const key = topic.trim().toLowerCase();
  const updatedNote: PersonalNote = {
    topic: topic.trim(),
    text,
    updatedAt: Date.now()
  };
  allNotes[key] = updatedNote;
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(allNotes));
    } catch (e) {
      console.warn('Failed to save personal notes to localStorage:', e);
    }
  }
  return updatedNote;
}

export function deletePersonalNoteForTopic(topic: string): void {
  const allNotes = loadStoredPersonalNotes();
  const key = topic.trim().toLowerCase();
  if (allNotes[key]) {
    delete allNotes[key];
    if (isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(allNotes));
      } catch (e) {
        console.warn('Failed to delete personal note from localStorage:', e);
      }
    }
  }
}

export function loadStoredTheme(): 'light' | 'dark' {
  if (!isLocalStorageAvailable()) return 'light';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'dark' || raw === 'light') return raw;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveStoredTheme(theme: 'light' | 'dark'): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.warn('Failed to save theme to localStorage:', e);
  }
}

