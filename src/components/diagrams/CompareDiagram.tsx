/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CompareDiagram — Side-by-side split cards with SVG divider and semantic contrast
 * Strict 5-color grammar: indigo, slate, emerald, amber, rose
 */

import React from 'react';
import { VisualComparisonData, VisualStage } from '../../types';
import { Check, X, Info, ArrowLeftRight } from 'lucide-react';

interface CompareDiagramProps {
  title?: string;
  data?: VisualComparisonData;
  stages?: VisualStage[];
  altText?: string;
  caption?: string;
}

export const CompareDiagram: React.FC<CompareDiagramProps> = ({
  title,
  data,
  stages = [],
  altText,
  caption
}) => {
  // Normalize comparison data with stages fallback
  const resolvedData: VisualComparisonData | null = (data && data.sideA && data.sideB)
    ? data
    : (stages && stages.length >= 2)
    ? {
        sideA: {
          title: stages[0].label,
          points: [stages[0].description],
          badge: stages[0].badge || 'Option A'
        },
        sideB: {
          title: stages[1].label,
          points: [stages[1].description],
          badge: stages[1].badge || 'Option B'
        },
        keyDifference: stages.length > 2 ? stages[2].description : (caption || `${stages[0].label} versus ${stages[1].label}`)
      }
    : null;

  if (!resolvedData || !resolvedData.sideA || !resolvedData.sideB) {
    return null;
  }

  const { sideA, sideB, keyDifference } = resolvedData;

  return (
    <div
      className="w-full space-y-4"
      role="img"
      aria-label={altText || `Comparison diagram between ${sideA.title} and ${sideB.title}`}
    >
      {/* Side-by-side Split Cards */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {/* Side A Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {sideA.title}
              </h4>
              {sideA.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {sideA.badge}
                </span>
              )}
            </div>

            <ul className="space-y-2.5">
              {sideA.points.map((pt, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    •
                  </span>
                  <span className="leading-snug">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center SVG "VS" divider badge (visible on desktop) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800 shadow-md flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-black">
            VS
          </div>
        </div>

        {/* Side B Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/40 mb-4">
              <h4 className="font-bold text-base sm:text-lg text-indigo-950 dark:text-indigo-100">
                {sideB.title}
              </h4>
              {sideB.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {sideB.badge}
                </span>
              )}
            </div>

            <ul className="space-y-2.5">
              {sideB.points.map((pt, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </span>
                  <span className="leading-snug">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Key Architectural Difference Banner */}
      {keyDifference && (
        <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 block mb-0.5">
              Essential Contrast:
            </span>
            <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
              {keyDifference}
            </p>
          </div>
        </div>
      )}

      {caption && (
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-mono">
          {caption}
        </p>
      )}
    </div>
  );
};
