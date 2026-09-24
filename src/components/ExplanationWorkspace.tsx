import React, { useState, useEffect, useRef } from 'react';
import { ExplanationData, ExplanationLevel } from '../types';
import { VisualDiagram } from './VisualDiagram';
import { QuizCard } from './QuizCard';
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
  Share2, 
  ArrowRight,
  Sliders,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

interface ExplanationWorkspaceProps {
  data: ExplanationData;
  onLevelChange: (level: ExplanationLevel) => void;
  onTutorAction: (action: 'simpler' | 'visual' | 'example' | 'stepByStep' | 'deeper') => void;
  onSelectTopic: (topic: string) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export const ExplanationWorkspace: React.FC<ExplanationWorkspaceProps> = ({
  data,
  onLevelChange,
  onTutorAction,
  onSelectTopic,
  isSaved = false,
  onToggleSave
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const visualRef = useRef<HTMLDivElement>(null);
  const exampleRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const deeperRef = useRef<HTMLDivElement>(null);

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

  const levels: { id: ExplanationLevel; label: string; desc: string }[] = [
    { id: 'beginner', label: 'Beginner', desc: 'Intuitive & Analogy First' },
    { id: 'intermediate', label: 'Intermediate', desc: 'Cause & Effect Mechanics' },
    { id: 'deep_dive', label: 'Deep Dive', desc: 'Edge Cases & Technical Depth' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Toolbar */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Cognitive Explanation
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Targeting Conceptual Mastery
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {data.topic}
            </h1>
          </div>

          {/* Quick utility controls */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {/* Audio Readout */}
            <button
              onClick={handleSpeechToggle}
              title={isSpeaking ? 'Stop audio reading' : 'Read explanation aloud'}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 ${
                isSpeaking
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Listen</span>
                </>
              )}
            </button>

            {/* Save / Bookmark */}
            <button
              onClick={onToggleSave}
              title={isSaved ? 'Topic saved in dashboard' : 'Save topic to dashboard'}
              className={`p-2 rounded-xl border transition-all duration-150 active:scale-95 ${
                isSaved
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              title="Copy explanation notes"
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300 transition-all duration-150 active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Level Segmented Selector */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Depth Level:
            </span>
          </div>

          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
            {levels.map((lvl) => {
              const isSelected = data.level === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => onLevelChange(lvl.id)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs sm:text-[13px] font-medium transition-all duration-150 flex items-center gap-1.5 active:scale-95 ${
                    isSelected
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation Control Buttons (Tutor Action Pills) */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Tutor Actions:
          </span>
          <button
            onClick={() => onTutorAction('simpler')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Explain Simpler</span>
          </button>
          <button
            onClick={() => {
              scrollToSection(visualRef);
              onTutorAction('visual');
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50/80 text-teal-700 hover:bg-teal-100 border border-teal-200/60 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          >
            <Layers className="w-3 h-3 text-teal-500" />
            <span>Show Visual</span>
          </button>
          <button
            onClick={() => {
              scrollToSection(exampleRef);
              onTutorAction('example');
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50/80 text-amber-800 hover:bg-amber-100 border border-amber-200/60 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3 text-amber-600" />
            <span>Give Example</span>
          </button>
          <button
            onClick={() => {
              scrollToSection(stepsRef);
              onTutorAction('stepByStep');
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50/80 text-purple-700 hover:bg-purple-100 border border-purple-200/60 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          >
            <ListOrdered className="w-3 h-3 text-purple-500" />
            <span>Explain Step-by-Step</span>
          </button>
          <button
            onClick={() => {
              scrollToSection(deeperRef);
              onTutorAction('deeper');
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          >
            <Compass className="w-3 h-3 text-slate-500" />
            <span>Go Deeper</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: SIMPLE EXPLANATION */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100 shadow-2xs">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            Simple Explanation
          </h3>
        </div>
        <p className="text-base sm:text-[17px] text-slate-800 font-medium leading-relaxed">
          {data.simpleExplanation}
        </p>
      </div>

      {/* SECTION 2: IN SIMPLE WORDS (ELI5 Analogy) */}
      <div className="bg-amber-50/40 rounded-2xl p-5 sm:p-6 border border-amber-200/70 shadow-2xs">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="p-1 rounded-lg bg-amber-100/80 text-amber-800 border border-amber-200">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
            In Simple Words
          </h3>
        </div>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
          “{data.inSimpleWords}”
        </p>
      </div>

      {/* SECTION 3: REAL-WORLD EXAMPLE */}
      <div ref={exampleRef} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Real-World Example
          </h3>
        </div>
        <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
          {data.realWorldExample.title}
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3.5">
          {data.realWorldExample.scenario}
        </p>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-[13px] font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
          <span>Takeaway: {data.realWorldExample.takeaway}</span>
        </div>
      </div>

      {/* SECTION 4: VISUAL EXPLANATION */}
      <div ref={visualRef} className="rounded-2xl">
        <VisualDiagram data={data.visualExplanation} />
      </div>

      {/* SECTION 5: STEP BY STEP */}
      <div ref={stepsRef} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-3.5">
          <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <ListOrdered className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Step by Step
          </h3>
        </div>
        <div className="space-y-3">
          {data.stepByStep.map((step) => (
            <div 
              key={step.stepNumber}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5">
                    {step.title}
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                    {step.explanation}
                  </p>
                  {step.tip && (
                    <div className="mt-2 text-[11px] text-indigo-700 font-medium flex items-center gap-1.5 bg-indigo-50/70 px-2 py-0.5 rounded-md border border-indigo-100 w-fit">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
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
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-3.5">
          <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Key Takeaways
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {data.keyTakeaways.map((takeaway, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-start gap-2.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-[13px] text-slate-800 font-medium leading-relaxed">
                {takeaway}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 7: CHECK YOUR UNDERSTANDING */}
      <QuizCard quiz={data.checkUnderstanding} />

      {/* SECTION 8: GO DEEPER */}
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
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            You might want to understand next:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.suggestedNext.map((topic) => (
            <button
              key={topic}
              onClick={() => onSelectTopic(topic)}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-medium bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 flex items-center gap-1.5"
            >
              <span>{topic}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
