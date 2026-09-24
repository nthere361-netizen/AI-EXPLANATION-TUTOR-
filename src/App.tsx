/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { ExplanationWorkspace } from './components/ExplanationWorkspace';
import { ExplanationSkeleton } from './components/ExplanationSkeleton';
import { DashboardView } from './components/DashboardView';
import { ExplanationData, ExplanationLevel, UserPreferences, VisualDiagramType, RealTimeIntent } from './types';
import { PRESET_EXPLANATIONS, POPULAR_SUGGESTIONS } from './data/mockData';
import { fetchExplanation, fetchVisualDiagram, sanitizeQueryInput, ApiError } from './services/api';
import { useTheme } from './hooks/useTheme';
import { useRealTime } from './hooks/useRealTime';
import { useBuild } from './hooks/useBuild';
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
import { AlertCircle, RefreshCw, Sun, Moon, Sparkles, HelpCircle, ArrowRight, Activity, Hammer, Code2, Layers, Compass, CheckCircle2 } from 'lucide-react';

// Code-split heavy non-critical views using React.lazy
const RealTimeView = lazy(() => 
  import('./components/RealTimeView').then(m => ({ default: m.RealTimeView }))
);
const BuildView = lazy(() => 
  import('./components/BuildView').then(m => ({ default: m.BuildView }))
);
const LearningFlowVisual = lazy(() => 
  import('./components/LearningFlowVisual').then(m => ({ default: m.LearningFlowVisual }))
);
const HeroIllustration = lazy(() => 
  import('./components/HeroIllustration').then(m => ({ default: m.HeroIllustration }))
);
const MyMaterialsView = lazy(() => 
  import('./components/MyMaterialsView').then(m => ({ default: m.MyMaterialsView }))
);
const CodeTutorView = lazy(() => 
  import('./components/CodeTutorView').then(m => ({ default: m.CodeTutorView }))
);
const LearningPathView = lazy(() => 
  import('./components/LearningPathView').then(m => ({ default: m.LearningPathView }))
);
const SettingsView = lazy(() => 
  import('./components/SettingsView').then(m => ({ default: m.SettingsView }))
);
const VoiceOverlay = lazy(() =>
  import('./components/voice/VoiceOverlay').then(m => ({ default: m.VoiceOverlay }))
);

import { VoiceFloatingButton } from './components/voice/VoiceFloatingButton';

// Minimalist fallback skeleton for lazy views
const TabFallbackSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6 space-y-4 animate-pulse" role="status" aria-label="Loading module content">
    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
    <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/60 rounded" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
      <div className="h-40 bg-slate-100 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800" />
      <div className="h-40 bg-slate-100 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800" />
    </div>
  </div>
);

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeExplanation, setActiveExplanation] = useState<ExplanationData | null>(() => loadStoredActiveExplanation());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [isVisualLoading, setIsVisualLoading] = useState(false);
  const [visualError, setVisualError] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Mode B: Real-Time Intelligence Hook
  const {
    data: realTimeData,
    isLoading: isRealTimeLoading,
    loadingStep: realTimeLoadingStep,
    error: realTimeError,
    recentQueries: realTimeRecent,
    fetchLiveInfo,
    refresh: refreshRealTime,
  } = useRealTime();

  // Mode C: Build Software & Product Architect Hook
  const {
    data: buildData,
    savedBuilds,
    isLoading: isBuildLoading,
    loadingStep: buildLoadingStep,
    error: buildError,
    generateBuildPlan,
    saveCurrentBuild,
    deleteSavedBuild,
    loadSavedBuild,
  } = useBuild();

  const [explainError, setExplainError] = useState<{
    message: string;
    query: string;
    level?: ExplanationLevel;
    mode?: string;
  } | null>(null);

  const [recentQuestions, setRecentQuestions] = useState<StoredQuestion[]>(() => loadStoredRecentQuestions());
  const [savedTopics, setSavedTopics] = useState<StoredTopic[]>(() => loadStoredSavedTopics());
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadStoredPreferences());
  const { theme, toggleTheme } = useTheme();
  
  const [currentLevel, setCurrentLevel] = useState<ExplanationLevel>(() => {
    const active = loadStoredActiveExplanation();
    return active?.level || 'beginner';
  });

  // Sync activeExplanation.level to currentLevel
  useEffect(() => {
    if (activeExplanation?.level) {
      setCurrentLevel(activeExplanation.level);
    }
  }, [activeExplanation?.level]);

  // Main explanation query handler with input validation and retry resilience
  const handleExplain = async (
    rawQuery: string, 
    levelOverride?: ExplanationLevel,
    modeOverride?: string,
    contextOverride?: string
  ) => {
    let cleanQuery = '';
    try {
      cleanQuery = sanitizeQueryInput(rawQuery);
    } catch (validationErr: any) {
      setExplainError({
        message: validationErr?.message || 'Please enter a valid question or topic.',
        query: rawQuery,
        level: levelOverride || currentLevel
      });
      return;
    }

    const targetLevel = levelOverride || currentLevel;
    setCurrentLevel(targetLevel);
    setIsLoading(true);
    setIsVisualLoading(true);
    setExplainError(null);
    setVisualError(null);
    setLoadingStep('Accessing first-principles conceptual model…');

    // Automatically switch to explain tab so user observes the result
    setCurrentTab('explain');

    try {
      // Step 1: Conceptual explanation
      setLoadingStep(`Formulating ${targetLevel} explanation…`);
      const explanation = await fetchExplanation(
        cleanQuery, 
        targetLevel, 
        modeOverride || preferences.explanationStyle,
        contextOverride
      );

      // Guarantee level consistency
      explanation.level = targetLevel;

      setActiveExplanation(explanation);
      saveStoredActiveExplanation(explanation);

      // Step 2: Record in recent questions history
      const newQuestion: StoredQuestion = {
        id: String(Date.now()),
        query: cleanQuery,
        level: targetLevel,
        timestamp: Date.now()
      };
      const updatedQuestions = [
        newQuestion, 
        ...recentQuestions.filter(q => q.query.toLowerCase() !== cleanQuery.toLowerCase())
      ].slice(0, 10);
      setRecentQuestions(updatedQuestions);
      saveStoredRecentQuestions(updatedQuestions);

      // Step 3: Fetch educational visual diagram if not already populated
      if (!explanation.visualExplanation || !explanation.visualExplanation.stages || explanation.visualExplanation.stages.length === 0) {
        setLoadingStep('Synthesizing structured visual diagram…');
        try {
          const visual = await fetchVisualDiagram(cleanQuery, targetLevel, explanation.visualExplanation?.type);
          setActiveExplanation(prev => {
            if (!prev) return explanation;
            const updated = { ...prev, visualExplanation: visual, level: targetLevel };
            saveStoredActiveExplanation(updated);
            return updated;
          });
        } catch (visErr: any) {
          console.warn('Visual generation fallback note:', visErr?.message);
          setVisualError('Visual diagram generated with default schema.');
        }
      }
    } catch (err: any) {
      console.error('Explanation flow error:', err);
      setExplainError({
        message: err instanceof ApiError 
          ? err.message 
          : 'AI tutor temporarily unavailable. Please check your network and try again.',
        query: cleanQuery,
        level: targetLevel,
        mode: modeOverride
      });
    } finally {
      setIsLoading(false);
      setIsVisualLoading(false);
      setLoadingStep('');
    }
  };

  // Re-generate visual only
  const handleRefreshVisual = async (preferredType?: VisualDiagramType) => {
    if (!activeExplanation) return;
    setIsVisualLoading(true);
    setVisualError(null);

    try {
      const visual = await fetchVisualDiagram(activeExplanation.topic, activeExplanation.level, preferredType);
      setActiveExplanation(prev => {
        if (!prev) return null;
        const updated = { ...prev, visualExplanation: visual };
        saveStoredActiveExplanation(updated);
        return updated;
      });
    } catch (err: any) {
      console.warn('Refresh visual warning:', err);
      setVisualError('Could not update visual diagram at this moment.');
    } finally {
      setIsVisualLoading(false);
    }
  };

  // Level change handler
  const handleLevelChange = (newLevel: ExplanationLevel) => {
    if (!activeExplanation) return;
    setCurrentLevel(newLevel);
    handleExplain(activeExplanation.topic, newLevel);
  };

  // Tutor micro-actions (deeper, simpler, contrast, analogy)
  const handleTutorAction = (action: string) => {
    if (!activeExplanation) return;
    if (action === 'make_simpler') {
      handleLevelChange('beginner');
    } else if (action === 'go_deeper') {
      handleLevelChange('deep_dive');
    } else if (action === 'another_analogy') {
      handleExplain(activeExplanation.topic, activeExplanation.level, 'analogy_focus');
    } else if (action === 'step_by_step') {
      handleExplain(activeExplanation.topic, activeExplanation.level, 'steps_focus');
    }
  };

  // Toggle Save Topic in study materials
  const handleToggleSave = () => {
    if (!activeExplanation) return;
    const isAlreadySaved = savedTopics.some(t => t.title.toLowerCase() === activeExplanation.topic.toLowerCase());

    let updated: StoredTopic[];
    if (isAlreadySaved) {
      updated = savedTopics.filter(t => t.title.toLowerCase() !== activeExplanation.topic.toLowerCase());
    } else {
      updated = [
        {
          id: activeExplanation.id || `topic-${Date.now()}`,
          title: activeExplanation.topic,
          savedAt: Date.now(),
          summary: activeExplanation.simpleExplanation.slice(0, 140) + '...'
        },
        ...savedTopics
      ];
    }
    setSavedTopics(updated);
    saveStoredSavedTopics(updated);
  };

  const isCurrentSaved = Boolean(
    activeExplanation && savedTopics.some(t => t.title.toLowerCase() === activeExplanation.topic.toLowerCase())
  );

  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    const merged: UserPreferences = { ...preferences, ...updated };
    setPreferences(merged);
    saveStoredPreferences(merged);
  };

  const handleResetData = () => {
    clearStoredSession();
    setActiveExplanation(null);
    setRecentQuestions([]);
    setSavedTopics([]);
    setPreferences(loadStoredPreferences());
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navigation Header */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        hasActiveExplanation={Boolean(activeExplanation)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenVoice={() => setIsVoiceOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Retry Banner */}
        {explainError && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{explainError.message}</p>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                  Query: <span className="font-mono font-medium">"{explainError.query}"</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => handleExplain(explainError.query, explainError.level, explainError.mode)}
                className="px-3.5 py-1.5 min-h-[38px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => setExplainError(null)}
                aria-label="Dismiss error notice"
                className="px-3 py-1.5 min-h-[38px] rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-slate-700 text-rose-800 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* HOME VIEW */}
        {currentTab === 'home' && (
          <div className="space-y-8 sm:space-y-12">
            {/* Hero Input Section */}
            <section className="text-center pt-2 sm:pt-4" aria-labelledby="hero-heading">
              {/* Visible Theme Switcher pill */}
              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={toggleTheme}
                  aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                  className="inline-flex items-center gap-2 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
                >
                  {theme === 'light' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light Mode Active</span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Switch to Dark</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dark Mode Active</span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-amber-400 font-semibold">Switch to Light</span>
                    </>
                  )}
                </button>
              </div>

              <h1 id="hero-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight max-w-3xl mx-auto">
                Understand anything deeply.
              </h1>
              <p className="mt-2.5 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                First-principles pedagogy, live verified telemetry, and interactive software blueprints.
              </p>

              {/* Three Core Modes Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-6 text-left">
                <button
                  type="button"
                  onClick={() => setCurrentTab('explain')}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      Mode A
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Explain a Concept
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    First-principles deconstruction, 2-sentence analogies, and clean visual flow diagrams.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('realtime')}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <Activity className="w-4 h-4 animate-pulse" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                      Mode B • Live
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Real-Time Information
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Live weather, crypto/stock trends, rates, and current events with verified sources & refresh.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('build')}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Hammer className="w-4 h-4" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      Mode C • Architect
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Build Something
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Interactive software architect generating architecture layers, file trees & working code.
                  </p>
                </button>
              </div>

              <div className="mt-8">
                <HeroInput 
                  onExplain={handleExplain} 
                  selectedLevel={currentLevel}
                  onSelectLevel={(lvl) => setCurrentLevel(lvl)}
                  isLoading={isLoading} 
                  loadingStep={loadingStep} 
                />
              </div>
            </section>

            {/* Code-split Educational Visual Pipeline */}
            <Suspense fallback={<div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900/50 animate-pulse" />}>
              <section aria-label="Explanation methodology">
                <LearningFlowVisual />
              </section>
            </Suspense>

            {/* Code-split Hero Illustration */}
            <Suspense fallback={<div className="h-60 rounded-2xl bg-slate-100 dark:bg-slate-900/50 animate-pulse" />}>
              <section aria-label="Conceptual overview illustration">
                <HeroIllustration />
              </section>
            </Suspense>

            {/* Dashboard Section */}
            <section className="pt-2" aria-labelledby="dashboard-heading">
              <div className="flex items-center justify-between mb-3.5">
                <h2 id="dashboard-heading" className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Your Learning Dashboard
                </h2>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
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

        {/* MODE A: EXPLAIN WORKSPACE VIEW */}
        {currentTab === 'explain' && (
          <div className="space-y-6">
            {/* Quick search bar inside workspace */}
            <div className="max-w-4xl mx-auto">
              <HeroInput 
                onExplain={handleExplain} 
                selectedLevel={currentLevel}
                onSelectLevel={(lvl) => setCurrentLevel(lvl)}
                isLoading={isLoading} 
                loadingStep={loadingStep} 
              />
            </div>

            {/* Loading state skeleton mirroring explanation layout */}
            {isLoading ? (
              <ExplanationSkeleton loadingStep={loadingStep} />
            ) : activeExplanation ? (
              <ExplanationWorkspace 
                data={activeExplanation} 
                onLevelChange={handleLevelChange}
                onTutorAction={handleTutorAction}
                onSelectTopic={(t) => handleExplain(t)}
                isSaved={isCurrentSaved}
                onToggleSave={handleToggleSave}
                isLoading={isLoading}
                loadingStep={loadingStep}
                onRefreshVisual={handleRefreshVisual}
                isVisualLoading={isVisualLoading}
                visualError={visualError}
                onOpenVoice={() => setIsVoiceOpen(true)}
              />
            ) : (
              /* Friendly Empty State */
              <div 
                className="max-w-2xl mx-auto p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs"
                role="region"
                aria-label="Empty explanation prompt"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-200/60 dark:border-indigo-800/60">
                  <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Ask me anything…
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  Type any concept above or click an example below to receive a multi-depth explanation, structured visual diagrams, analogies, and mastery checks.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {POPULAR_SUGGESTIONS.slice(0, 6).map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => handleExplain(topic)}
                      className="px-3.5 py-1.5 min-h-[36px] rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{topic}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE B: REAL-TIME INFORMATION VIEW (Lazy Loaded) */}
        {currentTab === 'realtime' && (
          <Suspense fallback={<TabFallbackSkeleton />}>
            <RealTimeView
              data={realTimeData}
              isLoading={isRealTimeLoading}
              loadingStep={realTimeLoadingStep}
              error={realTimeError}
              recentQueries={realTimeRecent}
              onSearch={(q, intent) => fetchLiveInfo(q, intent)}
              onRefresh={refreshRealTime}
            />
          </Suspense>
        )}

        {/* MODE C: BUILD SOMETHING ARCHITECT VIEW (Lazy Loaded) */}
        {currentTab === 'build' && (
          <Suspense fallback={<TabFallbackSkeleton />}>
            <BuildView
              data={buildData}
              savedBuilds={savedBuilds}
              isLoading={isBuildLoading}
              loadingStep={buildLoadingStep}
              error={buildError}
              onGenerate={(idea, techPreferences) => generateBuildPlan(idea, techPreferences)}
              onSaveBuild={saveCurrentBuild}
              onDeleteSavedBuild={deleteSavedBuild}
              onLoadSavedBuild={loadSavedBuild}
            />
          </Suspense>
        )}

        {/* MY MATERIALS VIEW (Lazy Loaded) */}
        {currentTab === 'materials' && (
          <Suspense fallback={<TabFallbackSkeleton />}>
            <MyMaterialsView onLearnFromTopic={(topic) => handleExplain(topic)} />
          </Suspense>
        )}

        {/* CODE TUTOR VIEW (Lazy Loaded) */}
        {currentTab === 'code-tutor' && (
          <Suspense fallback={<TabFallbackSkeleton />}>
            <CodeTutorView />
          </Suspense>
        )}

        {/* LEARNING PATHS VIEW (Lazy Loaded) */}
        {currentTab === 'paths' && (
          <Suspense fallback={<TabFallbackSkeleton />}>
            <LearningPathView onStartTopic={(prompt) => handleExplain(prompt)} />
          </Suspense>
        )}

        {/* SETTINGS VIEW (Lazy Loaded) */}
        {currentTab === 'settings' && (
          <Suspense fallback={<TabFallbackSkeleton />}>
            <SettingsView 
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              onResetData={handleResetData}
              onLaunchDemoPreset={(t) => handleExplain(t)}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </Suspense>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] shadow-xs">
              ET
            </span>
            <span>Explanation Tutor</span>
            <span className="text-slate-300 dark:text-slate-700 font-normal">|</span>
            <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">“AI that helps people truly understand concepts”</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400 flex-wrap">
            <button onClick={() => setCurrentTab('home')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">Home</button>
            <button onClick={() => setCurrentTab('explain')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">Explain</button>
            <button onClick={() => setCurrentTab('realtime')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">Real-Time</button>
            <button onClick={() => setCurrentTab('build')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">Build</button>
            <button onClick={() => setCurrentTab('code-tutor')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">Code Tutor</button>
            <button onClick={() => setCurrentTab('paths')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">Learning Paths</button>
            <button onClick={() => setCurrentTab('materials')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">My Materials</button>
            <button onClick={() => setCurrentTab('settings')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">Settings</button>
          </div>
        </div>
      </footer>

      {/* Floating Hands-Free Voice Button */}
      <VoiceFloatingButton
        isOpen={isVoiceOpen}
        onClick={() => setIsVoiceOpen(true)}
      />

      {/* Voice Mode Overlay (Lazy Loaded with Suspense) */}
      {isVoiceOpen && (
        <Suspense fallback={null}>
          <VoiceOverlay
            isOpen={isVoiceOpen}
            onClose={() => setIsVoiceOpen(false)}
            level={preferences.defaultLevel || 'beginner'}
            initialTopic={activeExplanation?.topic}
          />
        </Suspense>
      )}
    </div>
  );
}
