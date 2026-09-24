import React, { useState } from 'react';
import { HelpCircle, Lightbulb, Eye, CheckCircle2, Compass } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  sub: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { id: 'ask', label: 'ASK', sub: 'Pose any concept', icon: HelpCircle },
  { id: 'understand', label: 'UNDERSTAND', sub: 'Simplified analogy', icon: Lightbulb },
  { id: 'visualize', label: 'VISUALIZE', sub: 'Interactive diagrams', icon: Eye },
  { id: 'practice', label: 'PRACTICE', sub: 'Check comprehension', icon: CheckCircle2 },
  { id: 'deeper', label: 'GO DEEPER', sub: 'Advanced nuances', icon: Compass },
];

export const LearningFlowVisual: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-4">
      <div className="text-center mb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
          The Pedagogical Framework
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
          How Explanation Tutor transforms overwhelming complexity into lasting intuition
        </p>
      </div>

      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-200/80 dark:bg-slate-800 z-0 hidden sm:block" />

        {/* Dynamic Progress Fill */}
        <div 
          className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-linear-to-r from-indigo-500 to-teal-500 z-0 transition-all duration-500 hidden sm:block"
          style={{ width: `${(activeStep / (STEPS.length - 1)) * 85}%` }}
        />

        {/* Step Nodes */}
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = activeStep === idx;
          const isPassed = activeStep > idx;

          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className="group relative z-10 flex flex-col items-center focus:outline-none text-center cursor-pointer"
            >
              {/* Circle Node */}
              <div 
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-3 ring-indigo-100 dark:ring-indigo-900/50 scale-105'
                    : isPassed
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-105 ${isSelected ? 'text-white' : ''}`} />
              </div>

              {/* Labels */}
              <div className="mt-2">
                <span 
                  className={`text-[11px] font-bold tracking-wider block transition-colors ${
                    isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden md:block mt-0.5 max-w-[85px] leading-tight">
                  {step.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
