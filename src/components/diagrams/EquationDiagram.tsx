/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EquationDiagram — Mathematical equation block with annotated step-by-step breakdown
 * Strict 5-color grammar: indigo, slate, emerald, amber, rose
 */

import React from 'react';
import { VisualEquationData } from '../../types';
import { Sigma, Lightbulb, CheckCircle2 } from 'lucide-react';

interface EquationDiagramProps {
  title?: string;
  data?: VisualEquationData;
  stages?: Array<{ label: string; description: string; badge?: string }>;
  altText?: string;
  caption?: string;
}

export const EquationDiagram: React.FC<EquationDiagramProps> = ({
  title,
  data,
  stages = [],
  altText,
  caption
}) => {
  const formula = data?.formula || data?.title || 'E = mc²';
  const variables = data?.variables || [];
  const derivationSteps = data?.steps || stages.map(s => ({
    step: s.label,
    explanation: s.description
  }));

  return (
    <div
      className="w-full max-w-2xl mx-auto space-y-4"
      role="img"
      aria-label={altText || `Mathematical equation diagram for ${formula}`}
    >
      {/* Central Hero Equation Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 text-center shadow-xs">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sigma className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-semibold">
            {data?.name || title || 'Governing Relationship'}
          </span>
        </div>

        <div className="py-2 text-2xl sm:text-4xl font-mono font-extrabold text-indigo-950 dark:text-indigo-100 tracking-tight">
          {formula}
        </div>

        {data?.explanation && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
            {data.explanation}
          </p>
        )}
      </div>

      {/* Variables & Constants Glossary */}
      {variables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {variables.map((v: { symbol: string; meaning: string; value?: string; unit?: string }, i: number) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                  {v.symbol}
                </span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {v.meaning}
                </span>
              </div>
              {v.unit && (
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {v.unit}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step-by-Step Derivation / Mechanics */}
      {derivationSteps.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Step-by-Step Application:
          </span>
          <div className="space-y-2">
            {derivationSteps.map((step: { step: string; explanation: string }, idx: number) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <h6 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {step.step}
                  </h6>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {step.explanation}
                  </p>
                </div>
              </div>
            ))}
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
