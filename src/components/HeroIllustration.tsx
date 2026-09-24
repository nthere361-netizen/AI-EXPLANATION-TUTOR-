import React, { useState, useEffect } from 'react';
import { HelpCircle, Layers, Lightbulb, CheckCircle, Sparkles } from 'lucide-react';

export const HeroIllustration: React.FC = () => {
  const [activeCycle, setActiveCycle] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCycle((prev) => (prev + 1) % 3);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const scenarios = [
    {
      question: "Why does recursion cause a Stack Overflow?",
      concept: "Each call stacks local memory frames until memory limit",
      visualTitle: "Call Stack Memory Unwinding",
      tag: "Computer Science"
    },
    {
      question: "How do plants convert sunlight into food?",
      concept: "Chlorophyll splits H₂O to generate ATP and Glucose",
      visualTitle: "Photosynthesis Photolysis Cycle",
      tag: "Biology"
    },
    {
      question: "What actually happens when you type a URL?",
      concept: "DNS resolves IP address → TLS handshake → HTTP GET",
      visualTitle: "Client-Server Request Pipeline",
      tag: "Networking"
    }
  ];

  const current = scenarios[activeCycle];

  return (
    <div className="w-full max-w-4xl mx-auto my-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
            Cognitive Transformation Engine
          </span>
          <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-slate-400">
            — raw friction to crystal intuition
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {scenarios.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveCycle(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeCycle === i 
                  ? 'w-5 bg-indigo-600 dark:bg-indigo-400' 
                  : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
              aria-label={`Show example ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
        {/* Step 1: Raw Question */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/40">
                1. Complex Question
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-rose-400 dark:text-rose-400" />
            </div>
            <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-snug">
              “{current.question}”
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>High cognitive friction</span>
          </div>
        </div>

        {/* Step 2: Mental Model */}
        <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-150">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/50">
                2. Mental Model
              </span>
              <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 font-medium leading-snug">
              {current.concept}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1.5 text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>ELI5 Analogy + First Principles</span>
          </div>
        </div>

        {/* Step 3: Visual & Practice */}
        <div className="p-3.5 rounded-xl bg-teal-50/30 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/50 flex flex-col justify-between hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-150">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-900/60 px-2 py-0.5 rounded-md border border-teal-200/50 dark:border-teal-800/50">
                3. Visual & Practice
              </span>
              <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-snug">
              {current.visualTitle}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-teal-100 dark:border-teal-900/50 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-teal-700 dark:text-teal-300 font-semibold">
              <CheckCircle className="w-3 h-3" />
              <span>Intuition Retained</span>
            </div>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">{current.tag}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
