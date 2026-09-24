import React from 'react';
import { ExplanationData } from '../types';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Bookmark, 
  FileText, 
  GitFork, 
  Compass, 
  CheckCircle2, 
  BookOpen 
} from 'lucide-react';

interface DashboardViewProps {
  recentQuestions: { id: string; query: string; level: string; timestamp: number }[];
  savedTopics: { id: string; title: string; summary: string; savedAt: number }[];
  onSelectTopic: (topic: string) => void;
  onNavigateTab: (tab: 'home' | 'explain' | 'materials' | 'code-tutor' | 'paths' | 'settings') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  recentQuestions,
  savedTopics,
  onSelectTopic,
  onNavigateTab,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* 1. Continue Learning Hero Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Continue Learning
              </span>
              <span className="text-xs text-slate-400">Resume your last inquiry</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Photosynthesis & The Calvin Cycle
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-300 mt-1 leading-relaxed">
              You reviewed the light reactions. Next milestone: Test understanding on ATP Synthase and carbon fixation.
            </p>
          </div>

          <button
            onClick={() => onSelectTopic('Explain photosynthesis')}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white text-slate-950 hover:bg-slate-100 active:scale-[0.98] shadow-xs flex items-center justify-center gap-1.5 transition-all shrink-0"
          >
            <span>Resume Lesson</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
          </button>
        </div>
      </div>

      {/* Grid of Dashboard Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 2: Recent Questions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Recent Inquiries
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {recentQuestions.length}
              </span>
            </div>

            {recentQuestions.length > 0 ? (
              <div className="space-y-1.5">
                {recentQuestions.slice(0, 4).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => onSelectTopic(q.query)}
                    className="w-full p-2.5 rounded-xl text-left bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-200 border border-slate-200/60 transition-all flex items-center justify-between group active:scale-[0.98]"
                  >
                    <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-900 truncate mr-2">
                      {q.query}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                “Start with something you’re curious about.”
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('home')}
            className="mt-3 pt-2.5 border-t border-slate-100 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>Ask a new question</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Saved Topics */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Bookmark className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Saved Key Topics
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {savedTopics.length}
              </span>
            </div>

            {savedTopics.length > 0 ? (
              <div className="space-y-1.5">
                {savedTopics.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectTopic(item.title)}
                    className="w-full p-2.5 rounded-xl text-left bg-amber-50/30 hover:bg-amber-50/70 border border-amber-100/80 transition-all flex items-center justify-between group active:scale-[0.98]"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 group-hover:text-amber-950">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate max-w-[190px]">
                        {item.summary}
                      </p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-amber-500 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Bookmark explanations to review anytime.
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600">
            Quick reference for exam review
          </div>
        </div>

        {/* Card 4: Learning Paths & Materials Quick Hub */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                  <GitFork className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Curriculum Hub
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('paths')}
                className="w-full p-2.5 rounded-xl text-left bg-teal-50/30 hover:bg-teal-50/70 border border-teal-100/80 transition-all flex items-center justify-between active:scale-[0.98]"
              >
                <div>
                  <span className="text-xs font-semibold text-teal-950 block">Python Basics Roadmap</span>
                  <span className="text-[11px] text-teal-700">3 of 6 Milestones completed</span>
                </div>
                <ArrowRight className="w-3 h-3 text-teal-600" />
              </button>

              <button
                onClick={() => onNavigateTab('materials')}
                className="w-full p-2.5 rounded-xl text-left bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/70 transition-all flex items-center justify-between active:scale-[0.98]"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Uploaded Lecture Notes</span>
                  <span className="text-[11px] text-slate-500">3 documents ready for tutoring</span>
                </div>
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('code-tutor')}
            className="mt-3 pt-2.5 border-t border-slate-100 text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            <span>Open Code Tutor</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
