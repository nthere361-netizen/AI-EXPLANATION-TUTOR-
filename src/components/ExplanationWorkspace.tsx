import React, { useState, useEffect, useRef } from 'react';
import { ExplanationData, ExplanationLevel, VisualDiagramType } from '../types';
import { VisualDiagram } from './VisualDiagram';
import { QuizCard } from './QuizCard';
import { 
  loadPersonalNoteForTopic, 
  savePersonalNoteForTopic, 
  deletePersonalNoteForTopic 
} from '../services/storage';
import { 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Layers, 
  ListOrdered, 
  CheckCircle, 
  HelpCircle, 
  Compass, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  ArrowRight,
  PenLine,
  Save,
  Trash2,
  Clock,
  RefreshCw,
  Mic
} from 'lucide-react';

interface ExplanationWorkspaceProps {
  data: ExplanationData;
  onLevelChange: (level: ExplanationLevel) => void;
  onTutorAction: (action: 'simpler' | 'visual' | 'example' | 'stepByStep' | 'deeper') => void;
  onSelectTopic: (topic: string) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  isLoading?: boolean;
  loadingStep?: string;
  onRefreshVisual?: (preferredType?: VisualDiagramType) => void;
  isVisualLoading?: boolean;
  visualError?: string | null;
  onOpenVoice?: () => void;
}

export const ExplanationWorkspace: React.FC<ExplanationWorkspaceProps> = ({
  data,
  onLevelChange,
  onTutorAction,
  onSelectTopic,
  isSaved = false,
  onToggleSave,
  isLoading = false,
  loadingStep,
  onRefreshVisual,
  isVisualLoading = false,
  visualError = null,
  onOpenVoice
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRate = 1.0;
  const workspaceRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const exampleRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const deeperRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus management: announce new explanation to screen readers
  useEffect(() => {
    if (workspaceRef.current && !isLoading) {
      workspaceRef.current.focus({ preventScroll: true });
    }
  }, [data.id, data.topic, data.level, isLoading]);

  // Personal Notes state
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteLastSaved, setNoteLastSaved] = useState<number | null>(null);
  const [isNoteSaving, setIsNoteSaving] = useState<boolean>(false);
  const [noteCopied, setNoteCopied] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const autoSaveTimerRef = useRef<any>(null);

  // Load note when topic changes
  useEffect(() => {
    const existing = loadPersonalNoteForTopic(data.topic);
    if (existing) {
      setNoteContent(existing.text);
      setNoteLastSaved(existing.updatedAt);
    } else {
      setNoteContent('');
      setNoteLastSaved(null);
    }
    setShowClearConfirm(false);
  }, [data.topic]);

  // Stop speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    const textToCopy = `${data.topic} - Explanation Tutor\n\nSimple Explanation:\n${data.simpleExplanation}\n\nIn Simple Words:\n${data.inSimpleWords}\n\nKey Takeaways:\n${data.keyTakeaways.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeechToggle = () => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utteranceText = `${data.topic}. ${data.simpleExplanation}. In simple words: ${data.inSimpleWords}`;
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.rate = speechRate;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Personal Notes handlers
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setNoteContent(newText);
    setIsNoteSaving(true);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (newText.trim().length > 0) {
        const saved = savePersonalNoteForTopic(data.topic, newText);
        setNoteLastSaved(saved.updatedAt);
      } else {
        deletePersonalNoteForTopic(data.topic);
        setNoteLastSaved(null);
      }
      setIsNoteSaving(false);
    }, 800);
  };

  const handleManualSaveNote = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    setIsNoteSaving(true);
    if (noteContent.trim().length > 0) {
      const saved = savePersonalNoteForTopic(data.topic, noteContent);
      setNoteLastSaved(saved.updatedAt);
    } else {
      deletePersonalNoteForTopic(data.topic);
      setNoteLastSaved(null);
    }
    setTimeout(() => setIsNoteSaving(false), 300);
  };

  const handleCopyNote = () => {
    if (!noteContent.trim()) return;
    navigator.clipboard.writeText(`Notes on ${data.topic}:\n\n${noteContent}`);
    setNoteCopied(true);
    setTimeout(() => setNoteCopied(false), 2000);
  };

  const handleClearNote = () => {
    if (showClearConfirm) {
      deletePersonalNoteForTopic(data.topic);
      setNoteContent('');
      setNoteLastSaved(null);
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 4000);
    }
  };

  const handleInsertPrompt = (promptPrefix: string) => {
    const textarea = noteTextareaRef.current;
    const prefix = noteContent.trim().length > 0 ? `\n\n${promptPrefix} ` : `${promptPrefix} `;
    const updated = noteContent + prefix;
    setNoteContent(updated);
    const saved = savePersonalNoteForTopic(data.topic, updated);
    setNoteLastSaved(saved.updatedAt);
    
    // Focus textarea
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = textarea.value.length;
        textarea.selectionEnd = textarea.value.length;
      }
    }, 50);
  };

  const levels: { id: ExplanationLevel; label: string; desc: string }[] = [
    { id: 'beginner', label: 'Beginner', desc: 'Intuitive & Analogy First' },
    { id: 'intermediate', label: 'Intermediate', desc: 'Cause & Effect Mechanics' },
    { id: 'deep_dive', label: 'Deep Dive', desc: 'Edge Cases & Technical Depth' },
  ];

  // Helper formatting for words and last saved
  const wordCount = noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0;
  const charCount = noteContent.length;

  const formatLastSavedTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      ref={workspaceRef}
      tabIndex={-1}
      role="region"
      aria-live="polite"
      aria-label={`Detailed conceptual explanation for ${data.topic} at ${data.level} depth`}
      className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 outline-hidden"
    >
      {/* Top Header & Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Cognitive Explanation
              </span>
              <span aria-hidden="true">·</span>
              <span>Targeting Conceptual Mastery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {data.topic}
            </h1>
          </div>

          {/* Quick utility controls */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap sm:flex-nowrap">
            {/* Re-explain / Regenerate button */}
            <button
              onClick={() => onLevelChange(data.level)}
              disabled={isLoading}
              aria-label={`Re-explain ${data.topic} at current ${data.level} depth`}
              title={`Re-explain "${data.topic}" at ${data.level === 'deep_dive' ? 'Deep Dive' : data.level === 'intermediate' ? 'Intermediate' : 'Beginner'} depth`}
              className={`px-3 py-2 min-h-[44px] rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer ${
                isLoading
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-2xs hover:shadow-xs'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? (loadingStep || 'Re-explaining…') : 'Re-explain'}</span>
            </button>

            {/* Scroll to Personal Notes Shortcut */}
            <button
              onClick={() => scrollToSection(notesRef)}
              aria-label="Jump to personal notes section"
              title="Jump to Personal Notes"
              className={`px-3 py-2 min-h-[44px] rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer ${
                noteContent.trim()
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <PenLine className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Notes</span>
              {noteContent.trim() && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>

            {/* Audio Readout */}
            <button
              onClick={handleSpeechToggle}
              aria-label={isSpeaking ? 'Stop voice readout' : 'Read explanation aloud'}
              aria-pressed={isSpeaking}
              title={isSpeaking ? 'Stop audio reading' : 'Read explanation aloud'}
              className={`px-3 py-2 min-h-[44px] rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer ${
                isSpeaking
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Listen</span>
                </>
              )}
            </button>

            {/* Interactive Hands-Free Voice Mode */}
            {onOpenVoice && (
              <button
                type="button"
                onClick={onOpenVoice}
                title="Start conversational hands-free Voice Mode (V)"
                aria-label="Start conversational Voice Mode for this concept"
                className="px-3 py-2 min-h-[44px] rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-xs cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                <span>Voice Mode</span>
              </button>
            )}

            {/* Save / Bookmark */}
            <button
              onClick={onToggleSave}
              aria-label={isSaved ? 'Remove topic from saved materials' : 'Save topic to study materials'}
              aria-pressed={isSaved}
              title={isSaved ? 'Topic saved in dashboard' : 'Save topic to dashboard'}
              className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer ${
                isSaved
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              aria-label={copied ? 'Explanation copied to clipboard' : 'Copy explanation to clipboard'}
              title="Copy explanation notes"
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all duration-150 active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Level Segmented Selector & Depth Guidance */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Depth Level:
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              data.level === 'deep_dive'
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : data.level === 'intermediate'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}>
              <span>{data.level === 'deep_dive' ? '🔬 Deep Dive' : data.level === 'intermediate' ? '⚙️ Intermediate' : '🌱 Beginner'}</span>
            </span>
          </div>

          <div className="inline-flex p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
            {levels.map((lvl) => {
              const isSelected = data.level === lvl.id;
              return (
                <button
                  key={lvl.id}
                  disabled={isLoading}
                  onClick={() => onLevelChange(lvl.id)}
                  title={`${lvl.label}: ${lvl.desc} (Click to re-explain at this depth)`}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs sm:text-[13px] font-medium transition-all duration-150 flex items-center gap-1.5 active:scale-95 ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs font-semibold ring-1 ring-slate-200 dark:ring-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span>{lvl.id === 'deep_dive' ? '🔬' : lvl.id === 'intermediate' ? '⚙️' : '🌱'}</span>
                  <span>{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level description guide banner */}
        <div className="mt-3 px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 border bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {data.level === 'deep_dive' ? 'Deep Dive Mode:' : data.level === 'intermediate' ? 'Intermediate Mode:' : 'Beginner Mode:'}
            </span>
            <span>
              {data.level === 'deep_dive'
                ? 'Substantial technical depth, architectural invariants, failure modes, formulas, and edge cases.'
                : data.level === 'intermediate'
                ? 'Underlying causal mechanisms, functional components, state transitions, and terminology.'
                : 'Simple language, fundamental intuition, step-by-step clarity, and relatable everyday analogies.'}
            </span>
          </div>
          {isLoading && (
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Generating…</span>
            </span>
          )}
        </div>

        {/* Explanation Control Buttons (Tutor Action Pills) */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
            Tutor Actions:
          </span>
          <button
            onClick={() => onTutorAction('simpler')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/60 dark:border-indigo-800/60 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            <span>Explain Simpler</span>
          </button>
          <button
            onClick={() => {
              scrollToSection(visualRef);
              onTutorAction('visual');
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50/80 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200/60 dark:border-teal-800/60 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          >
            <Layers className="w-3 h-3 text-teal-500 dark:text-teal-400" />
            <span>Show Visual</span>
          </button>
          <button
            onClick={() => {
              scrollToSection(exampleRef);
              onTutorAction('example');
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/60 dark:border-amber-800/60 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Give Example</span>
          </button>
          <button
            onClick={() => {
              scrollToSection(stepsRef);
              onTutorAction('stepByStep');
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50/80 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          >
            <ListOrdered className="w-3 h-3 text-purple-500 dark:text-purple-400" />
            <span>Explain Step-by-Step</span>
          </button>
          <button
            onClick={() => {
              scrollToSection(deeperRef);
              onTutorAction('deeper');
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          >
            <Compass className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>Go Deeper</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: SIMPLE EXPLANATION */}
      <div className={`rounded-2xl p-5 sm:p-6 border shadow-2xs transition-all duration-200 ${
        data.level === 'deep_dive'
          ? 'bg-white dark:bg-slate-900 border-purple-200/80 dark:border-purple-900/60 ring-1 ring-purple-500/10'
          : data.level === 'intermediate'
          ? 'bg-white dark:bg-slate-900 border-blue-200/80 dark:border-blue-900/60 ring-1 ring-blue-500/10'
          : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-950/80'
      }`}>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-lg border ${
              data.level === 'deep_dive'
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                : data.level === 'intermediate'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${
              data.level === 'deep_dive'
                ? 'text-purple-700 dark:text-purple-400'
                : data.level === 'intermediate'
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-indigo-700 dark:text-indigo-400'
            }`}>
              Simple Explanation
            </h3>
          </div>
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
            data.level === 'deep_dive'
              ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
              : data.level === 'intermediate'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          }`}>
            {data.level === 'deep_dive' ? '🔬 Formal Mechanics & Invariants' : data.level === 'intermediate' ? '⚙️ System Architecture' : '🌱 Foundational Concept'}
          </span>
        </div>
        <p className="text-base sm:text-[17px] text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
          {data.simpleExplanation}
        </p>
      </div>

      {/* SECTION 2: IN SIMPLE WORDS (ELI5 Analogy) */}
      <div className={`rounded-2xl p-5 sm:p-6 border shadow-2xs transition-all duration-200 ${
        data.level === 'deep_dive'
          ? 'bg-purple-50/30 dark:bg-purple-950/20 border-purple-200/70 dark:border-purple-900/40'
          : data.level === 'intermediate'
          ? 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-200/70 dark:border-sky-900/40'
          : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
      }`}>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-lg border ${
              data.level === 'deep_dive'
                ? 'bg-purple-100/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : data.level === 'intermediate'
                ? 'bg-sky-100/80 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                : 'bg-amber-100/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}>
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${
              data.level === 'deep_dive'
                ? 'text-purple-800 dark:text-purple-300'
                : data.level === 'intermediate'
                ? 'text-sky-800 dark:text-sky-300'
                : 'text-amber-800 dark:text-amber-400'
            }`}>
              In Simple Words
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {data.level === 'deep_dive' ? 'Abstraction Boundary Mental Model' : data.level === 'intermediate' ? 'Operational Flow Model' : 'ELI5 Relatable Analogy'}
          </span>
        </div>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed italic">
          “{data.inSimpleWords}”
        </p>
      </div>

      {/* SECTION 3: REAL-WORLD EXAMPLE */}
      <div ref={exampleRef} className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Real-World Example
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {data.level === 'deep_dive' ? '🔬 Boundary Stress Case' : data.level === 'intermediate' ? '⚙️ Production Case Study' : '🌱 Everyday Observation'}
          </span>
        </div>
        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">
          {data.realWorldExample.title}
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3.5">
          {data.realWorldExample.scenario}
        </p>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
          <span>Takeaway: {data.realWorldExample.takeaway}</span>
        </div>
      </div>

      {/* SECTION 4: VISUAL EXPLANATION */}
      <div ref={visualRef} className="rounded-2xl">
        <VisualDiagram 
          data={data.visualExplanation} 
          topic={data.topic}
          level={data.level}
          isLoading={isVisualLoading}
          error={visualError}
          onRefreshVisual={onRefreshVisual}
        />
      </div>

      {/* SECTION 5: STEP BY STEP */}
      <div ref={stepsRef} className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
              <ListOrdered className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Step by Step
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {data.level === 'deep_dive' ? '🔬 Atomic Invariant Execution' : data.level === 'intermediate' ? '⚙️ Causal Execution Pipeline' : '🌱 Sequential Walkthrough'}
          </span>
        </div>
        <div className="space-y-3">
          {data.stepByStep.map((step) => (
            <div 
              key={step.stepNumber}
              className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                    {step.title}
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.explanation}
                  </p>
                  {step.tip && (
                    <div className="mt-2 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1.5 bg-indigo-50/70 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50 w-fit">
                      <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: KEY TAKEAWAYS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 mb-3.5">
          <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Key Takeaways
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {data.keyTakeaways.map((takeaway, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-2.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {takeaway}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 7: CHECK YOUR UNDERSTANDING */}
      <QuizCard quiz={data.checkUnderstanding} />

      {/* SECTION 8: PERSONAL NOTES & REFLECTIONS */}
      <div 
        ref={notesRef} 
        className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-all duration-200"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
              <PenLine className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Personal Notes
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>Custom annotations & reflections</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {isNoteSaving ? (
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">Saving changes...</span>
                  ) : noteLastSaved ? (
                    <span>Saved {formatLastSavedTime(noteLastSaved)}</span>
                  ) : (
                    <span>Auto-saves as you type</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {noteContent.trim().length > 0 && (
              <>
                <button
                  onClick={handleCopyNote}
                  title="Copy notes to clipboard"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-95"
                >
                  {noteCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleClearNote}
                  title="Clear note"
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 active:scale-95 ${
                    showClearConfirm
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50/60 dark:hover:bg-rose-950/40 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{showClearConfirm ? 'Confirm Clear?' : 'Clear'}</span>
                </button>
              </>
            )}

            <button
              onClick={handleManualSaveNote}
              title="Save current notes"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all duration-150"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isNoteSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Reflection Prompt Starters */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
            Reflection Starters:
          </span>
          {[
            { label: '💡 Key Insight', prefix: '💡 Key Insight:' },
            { label: '❓ Questions I Have', prefix: '❓ Question I have:' },
            { label: '🔗 Project Connection', prefix: '🔗 How this connects to my work:' },
            { label: '⚠️ Gotcha to Remember', prefix: '⚠️ Watch out for:' },
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleInsertPrompt(prompt.prefix)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Note Textarea */}
        <div className="mt-3 relative">
          <textarea
            ref={noteTextareaRef}
            rows={5}
            value={noteContent}
            onChange={handleNoteChange}
            placeholder={`Jot down your custom takeaways, questions for your tutor, or real-world connections regarding "${data.topic}"...`}
            className="w-full p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 text-sm leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-850 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans"
          />
        </div>

        {/* Footer info: Counts & auto-save state */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            <span aria-hidden="true">·</span>
            <span>{charCount} characters</span>
          </div>

          <div className="text-[11px]">
            {noteLastSaved ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Saved for this topic</span>
              </span>
            ) : (
              <span>Notes persist across sessions</span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 9: GO DEEPER */}
      <div ref={deeperRef} className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 border border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Go Deeper
          </h3>
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">
          {data.goDeeper.concept}
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3.5">
          {data.goDeeper.whyItMatters}
        </p>
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-[13px] text-indigo-200 font-medium flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-white font-bold block mb-0.5">Curious exploration:</span>
            <span>{data.goDeeper.curiousQuestion}</span>
          </div>
        </div>
      </div>

      {/* SUGGESTED NEXT TOPICS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            You might want to understand next:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.suggestedNext.map((topic) => (
            <button
              key={topic}
              onClick={() => onSelectTopic(topic)}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-medium bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 flex items-center gap-1.5"
            >
              <span>{topic}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
