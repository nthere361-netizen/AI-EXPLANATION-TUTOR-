/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TreeDiagram — SVG Hierarchy & Mind-Map classification layout
 * Clean bezier curves connecting root to child concept nodes
 */

import React, { useState } from 'react';
import { VisualConceptMapData, VisualStage } from '../../types';
import { GitBranch, Sparkles, ChevronRight, Layers } from 'lucide-react';

interface TreeDiagramProps {
  title?: string;
  data?: VisualConceptMapData;
  stages?: VisualStage[];
  altText?: string;
  caption?: string;
}

export const TreeDiagram: React.FC<TreeDiagramProps> = ({
  title,
  data,
  stages = [],
  altText,
  caption
}) => {
  // Normalize concept map data with stages fallback
  const resolvedData: VisualConceptMapData | null = (data && data.centralNode && data.branches && data.branches.length > 0)
    ? data
    : (stages && stages.length > 0)
    ? {
        centralNode: title || 'Core Concept',
        branches: stages.map((s, idx) => ({
          label: s.label,
          relationship: s.badge || 'connects to',
          description: s.description
        }))
      }
    : null;

  if (!resolvedData || !resolvedData.centralNode || !resolvedData.branches || resolvedData.branches.length === 0) {
    return null;
  }

  const { centralNode, branches } = resolvedData;
  const [selectedBranch, setSelectedBranch] = useState<number>(0);

  const activeBranch = branches[selectedBranch] || branches[0];

  return (
    <div
      className="w-full space-y-5"
      role="img"
      aria-label={altText || `Hierarchy tree diagram for ${centralNode}`}
    >
      {/* Root Node Banner */}
      <div className="flex justify-center">
        <div className="px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-base sm:text-lg shadow-md shadow-indigo-200 dark:shadow-none text-center flex items-center gap-2.5">
          <GitBranch className="w-5 h-5 text-indigo-200" />
          <span>{centralNode}</span>
        </div>
      </div>

      {/* SVG Tree Connector Branches */}
      <div className="relative w-full max-w-3xl mx-auto px-4">
        <svg viewBox="0 0 600 50" className="w-full h-12 overflow-visible select-none">
          {branches.map((_, idx) => {
            const total = branches.length;
            const targetX = 600 * ((idx + 0.5) / total);
            const isSelected = idx === selectedBranch;

            return (
              <path
                key={idx}
                d={`M 300 0 C 300 25, ${targetX} 25, ${targetX} 48`}
                fill="none"
                stroke={isSelected ? '#6366f1' : '#cbd5e1'}
                strokeWidth={isSelected ? '2.5' : '1.5'}
                className="transition-colors duration-200"
              />
            );
          })}
        </svg>

        {/* Children Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {branches.map((branch, idx) => {
            const isSelected = idx === selectedBranch;

            return (
              <button
                key={idx}
                onClick={() => setSelectedBranch(idx)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-400/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {branch.relationship}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  )}
                </div>
                <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {branch.label}
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {branch.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Branch Detail Spotlight */}
      {activeBranch && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
              Branch Relationship: {activeBranch.relationship}
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            {activeBranch.label}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeBranch.description}
          </p>
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
