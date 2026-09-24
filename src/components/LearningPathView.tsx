/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * LearningPathView — Verified Academic Curricula with Global Search & Prerequisite Enforcement
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  StructuredLearningPath, 
  Lesson, 
  ExplanationLevel 
} from '../types';
import { 
  VERIFIED_CURRICULA, 
  searchCurricula, 
  getOrGenerateAcademicPath 
} from '../data/learningPathsData';
import { 
  Search, 
  Command, 
  CheckCircle, 
  Lock, 
  PlayCircle, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Check,
  ChevronRight,
  Filter,
  RotateCcw
} from 'lucide-react';

interface LearningPathViewProps {
  onStartTopic: (prompt: string) => void;
}

const STORAGE_KEY_COMPLETED = 'explanation_tutor_completed_lessons';

export const LearningPathView: React.FC<LearningPathViewProps> = ({ onStartTopic }) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  // Active curriculum & selected lesson
  const [activePathId, setActivePathId] = useState<string>(VERIFIED_CURRICULA[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(VERIFIED_CURRICULA[0].lessons[0].id);

  // Completed lessons set persisted in localStorage
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLETED);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load completed lessons from localStorage');
    }
    // Default: mark first foundational lesson of the first 2 paths as complete for immediate demo satisfaction
    return new Set(['qm-1', 'la-1', 'dock-1']);
  });

  // Quiz state for the selected lesson
  const [activeQuizIndex, setActiveQuizIndex] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Global cmd+k / ctrl+k keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync completed lessons to localStorage
  const markLessonComplete = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      const next = new Set(prev);
      next.add(lessonId);
      try {
        localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.warn('Failed to save to localStorage');
      }
      return next;
    });
  };

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      try {
        localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.warn('Failed to save to localStorage');
      }
      return next;
    });
  };

  // Filtered and searched curricula
  const filteredPaths: StructuredLearningPath[] = useMemo(() => {
    let list: StructuredLearningPath[] = debouncedQuery.trim()
      ? searchCurricula(debouncedQuery, VERIFIED_CURRICULA).map((res) => res.path)
      : VERIFIED_CURRICULA;

    if (selectedSubject !== 'All') {
      list = list.filter((p) => p.subject.toLowerCase() === selectedSubject.toLowerCase());
    }

    if (selectedLevel !== 'All') {
      list = list.filter((p) => p.level.toLowerCase() === selectedLevel.toLowerCase());
    }

    return list;
  }, [debouncedQuery, selectedSubject, selectedLevel]);

  // If search query yields nothing from base list, auto-synthesize an academic path
  const synthesizedPath = useMemo(() => {
    if (debouncedQuery.trim() && filteredPaths.length === 0) {
      return getOrGenerateAcademicPath(debouncedQuery, VERIFIED_CURRICULA);
    }
    return null;
  }, [debouncedQuery, filteredPaths.length]);

  // Resolved active path
  const activePath: StructuredLearningPath = useMemo(() => {
    if (synthesizedPath) return synthesizedPath;
    const found = filteredPaths.find((p) => p.id === activePathId);
    if (found) return found;
    return filteredPaths[0] || VERIFIED_CURRICULA[0];
  }, [synthesizedPath, filteredPaths, activePathId]);

  // Keep selectedLessonId in sync
  useEffect(() => {
    if (activePath && activePath.lessons.length > 0) {
      const exists = activePath.lessons.some((l) => l.id === selectedLessonId);
      if (!exists) {
        setSelectedLessonId(activePath.lessons[0].id);
      }
    }
    setActiveQuizIndex(null);
    setSelectedOption(null);
    setQuizSubmitted(false);
  }, [activePath.id]);

  const selectedLesson = activePath.lessons.find((l) => l.id === selectedLessonId) || activePath.lessons[0];

  // Helper to check if all prerequisites for a lesson are fulfilled
  const checkPrerequisitesMet = (lesson: Lesson): { met: boolean; missingPrereqs: Lesson[] } => {
    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
      return { met: true, missingPrereqs: [] };
    }

    const missingPrereqs: Lesson[] = [];
    for (const prereqId of lesson.prerequisites) {
      if (!completedLessonIds.has(prereqId)) {
        const found = activePath.lessons.find((l) => l.id === prereqId);
        if (found) missingPrereqs.push(found);
      }
    }

    return {
      met: missingPrereqs.length === 0,
      missingPrereqs
    };
  };

  // Calculate mastery progress for a path
  const calculatePathProgress = (path: StructuredLearningPath) => {
    if (!path.lessons || path.lessons.length === 0) return 0;
    const completed = path.lessons.filter((l) => completedLessonIds.has(l.id)).length;
    return Math.round((completed / path.lessons.length) * 100);
  };

  // Helper to highlight matching text in search results
  const renderHighlighted = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 rounded px-1 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const selectedLessonPrereqStatus = checkPrerequisitesMet(selectedLesson);
  const isSelectedLessonComplete = completedLessonIds.has(selectedLesson.id);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 1. Global Search & Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Academic Knowledge Graph</span>
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                Zero-Cognitive-Gap Sequences
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 tracking-tight">
              Interactive Learning Paths & Curricula
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Strictly ordered pedagogical roadmaps mapped to MIT OCW and university syllabi. Master foundational first principles before unlocking advanced topics.
            </p>
          </div>
        </div>

        {/* Global Search Bar (with cmd+k / ctrl+k shortcut) */}
        <div className="mt-6 relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across paths, subjects, topics, or lessons (e.g. 'quantum mechanics', 'linear algebra', 'docker')…"
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            <div className="absolute right-3.5 flex items-center gap-1.5 pointer-events-none">
              <kbd className="px-2 py-1 text-[11px] font-mono font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 rounded-lg shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Quick preset suggestions */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 dark:text-slate-500 shrink-0 font-medium">Quick Explore:</span>
            {['Quantum Mechanics', 'Linear Algebra', 'Docker', 'Supply & Demand', 'Operating Systems', 'Machine Learning', 'Git'].map((preset) => (
              <button
                key={preset}
                onClick={() => setSearchQuery(preset)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors whitespace-nowrap"
              >
                {preset}
              </button>
            ))}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium ml-2 whitespace-nowrap"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Subject & Level Filters */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            {['All', 'Physics', 'Mathematics', 'Computer Science', 'Economics'].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  selectedSubject === sub
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-mono">Level:</span>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedLevel === lvl
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Path Cards Carousel / Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPaths.slice(0, 9).map((path) => {
            const isSelected = activePath.id === path.id;
            const progress = calculatePathProgress(path);

            return (
              <button
                key={path.id}
                onClick={() => {
                  setActivePathId(path.id);
                  if (path.lessons && path.lessons.length > 0) {
                    setSelectedLessonId(path.lessons[0].id);
                  }
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-400/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {path.subject} • {path.level}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      ~{path.estimatedHours}h total
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${isSelected ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-900 dark:text-slate-100'}`}>
                    {renderHighlighted(path.title, debouncedQuery)}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {path.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    <span>{path.lessons.length} Milestones</span>
                    <span className="font-mono">{progress}% Mastered</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Synthesized Path Banner when searching custom topic */}
        {synthesizedPath && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase text-indigo-700 dark:text-indigo-300">
                  Synthesized Academic Curriculum
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {synthesizedPath.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Dynamically sequenced with strictly validated prerequisite relationships.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Roadmap Milestones & Active Lesson Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Numbered Prerequisite Milestone Chain */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {activePath.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sequential Prerequisite Chain (Locked until prerequisites are satisfied)
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {activePath.lessons.length} Milestones
            </span>
          </div>

          <div className="relative space-y-4">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800 z-0" />

            {activePath.lessons.map((lesson, index) => {
              const isSelected = selectedLesson.id === lesson.id;
              const isCompleted = completedLessonIds.has(lesson.id);
              const prereqStatus = checkPrerequisitesMet(lesson);
              const isLocked = !prereqStatus.met;

              return (
                <div key={lesson.id} className="relative z-10 flex items-start gap-4">
                  {/* Status Node Icon */}
                  <button
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'ring-4 ring-indigo-200 dark:ring-indigo-900/60 shadow-md scale-105'
                        : 'hover:scale-102'
                    } ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none'
                        : isLocked
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                        : 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <PlayCircle className="w-5 h-5" />
                    )}
                  </button>

                  {/* Milestone Card */}
                  <div
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`flex-1 p-4 rounded-2xl text-left border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Milestone {index + 1}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            Mastered
                          </span>
                        )}
                        {!isCompleted && !isLocked && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                            Ready to Learn
                          </span>
                        )}
                        {isLocked && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.minutes}m</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {lesson.summary}
                    </p>

                    {/* Prerequisite requirements indicator if locked */}
                    {isLocked && prereqStatus.missingPrereqs.length > 0 && (
                      <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Requires: {prereqStatus.missingPrereqs.map(p => p.title).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Lesson Detail, First Principles Trigger, and Milestone Quiz */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isSelectedLessonComplete 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                    : !selectedLessonPrereqStatus.met
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                }`}>
                  {isSelectedLessonComplete ? 'COMPLETED' : !selectedLessonPrereqStatus.met ? 'PREREQUISITE LOCKED' : 'CURRENT FOCUS'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-mono">{selectedLesson.minutes} mins</span>
              </div>

              {/* Toggle manual complete button */}
              <button
                onClick={() => toggleLessonComplete(selectedLesson.id)}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                title="Mark this lesson completed or reset"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSelectedLessonComplete ? 'Mark Incomplete' : 'Mark Done'}</span>
              </button>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Concept Target
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {selectedLesson.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {selectedLesson.summary}
              </p>
            </div>

            {/* If Locked Warning */}
            {!selectedLessonPrereqStatus.met && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Prerequisite Requirement Not Met</span>
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-200">
                  Academic mastery requires completing foundational milestones before this concept:
                </p>
                <div className="space-y-1 pt-1">
                  {selectedLessonPrereqStatus.missingPrereqs.map((prereq) => (
                    <button
                      key={prereq.id}
                      onClick={() => setSelectedLessonId(prereq.id)}
                      className="w-full text-left text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between hover:bg-amber-50/50"
                    >
                      <span>Jump to: {prereq.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* First-Principles Explainer Trigger */}
            <button
              onClick={() => onStartTopic(selectedLesson.concept)}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white shadow-md shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explain Concept with First Principles</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Interactive Knowledge Check Quiz */}
            {selectedLesson.quiz && selectedLesson.quiz.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Checkpoint Quiz
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Question 1 of {selectedLesson.quiz.length}
                  </span>
                </div>

                {(() => {
                  const currentQuiz = selectedLesson.quiz[0];
                  const isCorrect = selectedOption !== null && Boolean(currentQuiz.options[selectedOption]?.isCorrect);
                  const feedbackExplanation = selectedOption !== null
                    ? currentQuiz.options[selectedOption]?.explanation
                    : (currentQuiz.options.find(o => o.isCorrect)?.explanation || '');

                  return (
                    <div className="space-y-3">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {currentQuiz.question}
                      </p>

                      <div className="space-y-2">
                        {currentQuiz.options.map((option, optIdx) => {
                          const isSelected = selectedOption === optIdx;
                          let optStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50';

                          if (quizSubmitted) {
                            if (option.isCorrect) {
                              optStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold';
                            } else if (isSelected) {
                              optStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200';
                            }
                          } else if (isSelected) {
                            optStyle = 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-950 dark:text-indigo-200 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => setSelectedOption(optIdx)}
                              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${optStyle}`}
                            >
                              <span>{option.text}</span>
                              {quizSubmitted && option.isCorrect && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Submit / Results Feedback */}
                      {!quizSubmitted ? (
                        <button
                          disabled={selectedOption === null}
                          onClick={() => {
                            setQuizSubmitted(true);
                            if (selectedOption !== null && currentQuiz.options[selectedOption]?.isCorrect) {
                              markLessonComplete(selectedLesson.id);
                            }
                          }}
                          className="w-full py-2.5 rounded-xl font-semibold text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          Check Answer & Unlock Next
                        </button>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                            isCorrect 
                              ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' 
                              : 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                          }`}>
                            <div className="font-bold mb-0.5">
                              {isCorrect ? '✓ Correct! Milestone Mastered.' : '✗ Not quite yet.'}
                            </div>
                            <p>{feedbackExplanation}</p>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedOption(null);
                              setQuizSubmitted(false);
                            }}
                            className="w-full py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Try Quiz Again</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
