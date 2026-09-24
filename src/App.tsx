/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { LearningFlowVisual } from './components/LearningFlowVisual';
import { HeroIllustration } from './components/HeroIllustration';
import { ExplanationWorkspace } from './components/ExplanationWorkspace';
import { MyMaterialsView } from './components/MyMaterialsView';
import { CodeTutorView } from './components/CodeTutorView';
import { LearningPathView } from './components/LearningPathView';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { ExplanationData, ExplanationLevel, UserPreferences } from './types';
import { PRESET_EXPLANATIONS } from './data/mockData';
import { fetchExplanation } from './services/tutorService';
import { 
  loadStoredRecentQuestions, 
  saveStoredRecentQuestions, 
  loadStoredSavedTopics, 
  saveStoredSavedTopics, 
  loadStoredPreferences, 
  saveStoredPreferences, 
  loadStoredActiveExplanation, 
  saveStoredActiveExplanation, 
  clearStoredSession,
  StoredQuestion,
  StoredTopic
} from './services/storage';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'explain' | 'materials' | 'code-tutor' | 'paths' | 'settings'>('home');
  const [activeExplanation, setActiveExplanation] = useState<ExplanationData>(() => loadStoredActiveExplanation());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [explainError, setExplainError] = useState<{
    message: string;
    query: string;
    level?: ExplanationLevel;
    mode?: string;
  } | null>(null);

  const [recentQuestions, setRecentQuestions] = useState<StoredQuestion[]>(() => loadStoredRecentQuestions());
  const [savedTopics, setSavedTopics] = useState<StoredTopic[]>(() => loadStoredSavedTopics());
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadStoredPreferences());

  // Sync reducedMotion preference to HTML document class
  useEffect(() => {
    if (preferences.reducedMotion) {
      document.documentElement.classList.add('motion-reduce');
    } else {
      document.documentElement.classList.remove('motion-reduce');
    }
  }, [preferences.reducedMotion]);

  // Handles requesting an explanation for a topic
  const handleExplain = async (query: string, levelOverride?: ExplanationLevel, mode?: string) => {
    setIsLoading(true);
    setExplainError(null);
    setLoadingStep('Understanding your question…');

    try {
      const targetLevel = levelOverride || preferences.defaultLevel;
      const result = await fetchExplanation(query, targetLevel, mode);

      setActiveExplanation(result);
      saveStoredActiveExplanation(result);
      setCurrentTab('explain');

      // Update recent questions with persistence
      setRecentQuestions((prev) => {
        const updated: StoredQuestion[] = [
          { id: 'q-' + Date.now(), query, level: targetLevel, timestamp: Date.now() },
          ...prev.filter(q => q.query.toLowerCase() !== query.toLowerCase()).slice(0, 9)
        ];
        saveStoredRecentQuestions(updated);
        return updated;
      });
    } catch (err: any) {
      console.error('Explanation request failed:', err);
      setExplainError({
        message: err?.message || 'The AI tutor is temporarily unavailable. Please try again.',
        query,
        level: levelOverride || preferences.defaultLevel,
        mode
      });
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleLevelChange = (level: ExplanationLevel) => {
    if (activeExplanation) {
      handleExplain(activeExplanation.topic, level);
    }
  };

  const handleTutorAction = (action: 'simpler' | 'visual' | 'example' | 'stepByStep' | 'deeper') => {
    if (activeExplanation) {
      handleExplain(activeExplanation.topic, activeExplanation.level, action);
    }
  };

  const handleToggleSave = () => {
    if (!activeExplanation) return;
    const exists = savedTopics.some(t => t.id === activeExplanation.id || t.title.toLowerCase() === activeExplanation.topic.toLowerCase());
    
    let updated: StoredTopic[];
    if (exists) {
      updated = savedTopics.filter(t => t.id !== activeExplanation.id && t.title.toLowerCase() !== activeExplanation.topic.toLowerCase());
    } else {
      updated = [
        {
          id: activeExplanation.id,
          title: activeExplanation.topic,
          summary: activeExplanation.simpleExplanation.slice(0, 120) + '...',
          savedAt: Date.now()
        },
        ...savedTopics
      ];
    }
    setSavedTopics(updated);
    saveStoredSavedTopics(updated);
  };

  const isCurrentSaved = activeExplanation 
    ? savedTopics.some(t => t.id === activeExplanation.id || t.title.toLowerCase() === activeExplanation.topic.toLowerCase())
    : false;

  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    const nextPrefs = { ...preferences, ...updated };
    setPreferences(nextPrefs);
    saveStoredPreferences(nextPrefs);
  };

  const handleResetData = () => {
    clearStoredSession();
    const defaultExp = PRESET_EXPLANATIONS['explain photosynthesis'];
    setRecentQuestions([]);
    setSavedTopics([]);
    setActiveExplanation(defaultExp);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 ${
      preferences.reducedMotion ? 'motion-reduce' : ''
    }`}>
      {/* Top Navbar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          setExplainError(null);
          setCurrentTab(tab);
        }} 
        hasActiveExplanation={!!activeExplanation} 
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Global Error Banner if explanation failed */}
        {explainError && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold block text-rose-900">Explanation Request Unsuccessful</span>
                <span>{explainError.message}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => handleExplain(explainError.query, explainError.level, explainError.mode)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => setExplainError(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* HOME VIEW */}
        {currentTab === 'home' && (
          <div className="space-y-8 sm:space-y-10">
            {/* Hero Input Section */}
            <section className="text-center pt-2 sm:pt-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight max-w-3xl mx-auto">
                Understand anything deeply.
              </h1>
              <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                Simplified explanations, visual diagrams, real-world examples, and interactive checks.
              </p>

              <div className="mt-6 sm:mt-8">
                <HeroInput 
                  onExplain={handleExplain} 
                  isLoading={isLoading} 
                  loadingStep={loadingStep} 
                />
              </div>
            </section>

            {/* Learning Flow Visualization */}
            <section>
              <LearningFlowVisual />
            </section>

            {/* AI Visual / Hero Illustration */}
            <section>
              <HeroIllustration />
            </section>

            {/* Dashboard Section */}
            <section className="pt-2">
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Your Learning Dashboard
                </h2>
                <span className="text-xs font-semibold text-slate-600">
                  Quick Resume & Vault
                </span>
              </div>
              <DashboardView 
                recentQuestions={recentQuestions} 
                savedTopics={savedTopics} 
                onSelectTopic={(t) => handleExplain(t)}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            </section>
          </div>
        )}

        {/* EXPLAIN WORKSPACE VIEW */}
        {currentTab === 'explain' && (
          <div className="space-y-6">
            {/* Quick search bar inside workspace */}
            <div className="max-w-4xl mx-auto">
              <HeroInput 
                onExplain={handleExplain} 
                isLoading={isLoading} 
                loadingStep={loadingStep} 
              />
            </div>

            {activeExplanation ? (
              <ExplanationWorkspace 
                data={activeExplanation} 
                onLevelChange={handleLevelChange}
                onTutorAction={handleTutorAction}
                onSelectTopic={(t) => handleExplain(t)}
                isSaved={isCurrentSaved}
                onToggleSave={handleToggleSave}
              />
            ) : (
              <div className="max-w-xl mx-auto p-10 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-slate-500 text-sm">
                  “Start with something you’re curious about.”
                </p>
              </div>
            )}
          </div>
        )}

        {/* MY MATERIALS VIEW */}
        {currentTab === 'materials' && (
          <MyMaterialsView onLearnFromTopic={(topic) => handleExplain(topic)} />
        )}

        {/* CODE TUTOR VIEW */}
        {currentTab === 'code-tutor' && (
          <CodeTutorView />
        )}

        {/* LEARNING PATHS VIEW */}
        {currentTab === 'paths' && (
          <LearningPathView onStartTopic={(prompt) => handleExplain(prompt)} />
        )}

        {/* SETTINGS VIEW */}
        {currentTab === 'settings' && (
          <SettingsView 
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onResetData={handleResetData}
            onLaunchDemoPreset={(t) => handleExplain(t)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-xs mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] shadow-xs">
              ET
            </span>
            <span>Explanation Tutor</span>
            <span className="text-slate-300 font-normal">|</span>
            <span className="text-slate-600 font-medium text-[11px]">“AI that helps people understand, not just gives answers”</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <button onClick={() => setCurrentTab('home')} className="hover:text-indigo-600 transition-colors">Home</button>
            <button onClick={() => setCurrentTab('explain')} className="hover:text-indigo-600 transition-colors">Explain</button>
            <button onClick={() => setCurrentTab('materials')} className="hover:text-indigo-600 transition-colors">My Materials</button>
            <button onClick={() => setCurrentTab('code-tutor')} className="hover:text-indigo-600 transition-colors">Code Tutor</button>
            <button onClick={() => setCurrentTab('paths')} className="hover:text-indigo-600 transition-colors">Learning Paths</button>
            <button onClick={() => setCurrentTab('settings')} className="hover:text-indigo-600 transition-colors">Settings</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
