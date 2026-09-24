import React from 'react';

interface ExplanationSkeletonProps {
  loadingStep?: string;
}

export const ExplanationSkeleton: React.FC<ExplanationSkeletonProps> = ({
  loadingStep = 'Formulating first-principles explanation…',
}) => {
  return (
    <div 
      className="space-y-6 max-w-4xl mx-auto w-full animate-pulse" 
      role="status" 
      aria-label="Generating explanation and visual diagram"
    >
      {/* Header Bar Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-8 w-64 bg-slate-300 dark:bg-slate-700 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>

        {/* Loading Indicator with Step */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {loadingStep}
          </p>
        </div>
      </div>

      {/* Section 1: Simple Explanation Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80" />
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-4/6 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      {/* Section 2: In Simple Words / Analogy Skeleton */}
      <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-900/40 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-200 dark:bg-amber-900" />
          <div className="h-4 w-32 bg-amber-200/60 dark:bg-amber-800/60 rounded" />
        </div>
        <div className="h-4 w-11/12 bg-amber-100 dark:bg-amber-900/40 rounded" />
        <div className="h-4 w-3/4 bg-amber-100 dark:bg-amber-900/40 rounded" />
      </div>

      {/* Section 3: Visual Diagram Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950/80" />
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
        
        {/* Diagram Stages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2.5"
            >
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-4 w-28 bg-slate-300 dark:bg-slate-600 rounded" />
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
        <div className="h-3 w-64 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
      </div>

      {/* Section 4: Real-World Example Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80" />
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-5 w-48 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
};
