/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CycleDiagram — SVG Continuous Loop & Cyclical Mechanism Visualizer
 * Strict 5-color grammar: indigo, slate, emerald, amber, rose
 * Responsive vector layout with directional arc arrows and interactive stage inspection.
 */

import React, { useState } from 'react';
import { VisualStage } from '../../types';
import { RotateCw, ChevronRight, CheckCircle2 } from 'lucide-react';

interface CycleDiagramProps {
  title?: string;
  stages?: VisualStage[];
  altText?: string;
  caption?: string;
}

export const CycleDiagram: React.FC<CycleDiagramProps> = ({
  title = 'Continuous Loop Mechanism',
  stages = [],
  altText,
  caption
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const items = stages.length > 0
    ? stages
    : [
        { label: 'Phase 1: Input & Inflow', description: 'Energy, data, or materials enter the cyclical system.', badge: 'Inflow' },
        { label: 'Phase 2: Active Transformation', description: 'Core mechanism changes state or processes inputs.', badge: 'Conversion' },
        { label: 'Phase 3: Emission / Distribution', description: 'Outputs are distributed into the environment.', badge: 'Output' },
        { label: 'Phase 4: Regeneration', description: 'Substrates replenish to starting conditions to repeat seamlessly.', badge: 'Feedback' }
      ];

  const total = items.length;
  const currentItem = items[activeIdx] || items[0];

  // SVG dimensions for circular layout
  const viewBoxSize = 480;
  const center = viewBoxSize / 2;
  const radius = 160;

  // Calculate coordinates for each node around circle
  const nodePositions = items.map((_, idx) => {
    // Start at top (-PI/2) and rotate clockwise
    const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      angle
    };
  });

  return (
    <div
      className="w-full space-y-5"
      role="img"
      aria-label={altText || `Continuous circular process diagram for ${title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') setActiveIdx((prev) => (prev + 1) % total);
        if (e.key === 'ArrowLeft') setActiveIdx((prev) => (prev - 1 + total) % total);
      }}
    >
      {/* SVG Circular Visualizer */}
      <div className="relative w-full max-w-lg mx-auto py-2 px-4 select-none flex justify-center">
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full max-w-[420px] aspect-square overflow-visible"
        >
          <defs>
            {/* Directional Arrow Marker */}
            <marker
              id="cycle-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#6366f1" />
            </marker>

            <linearGradient id="cycle-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Central Loop Hub */}
          <circle
            cx={center}
            cy={center}
            r={54}
            className="fill-indigo-50/80 dark:fill-indigo-950/40 stroke-indigo-200 dark:stroke-indigo-800"
            strokeWidth="1.5"
          />
          <g className="text-center" transform={`translate(${center - 24}, ${center - 24})`}>
            <RotateCw className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-[spin_24s_linear_infinite]" />
          </g>

          {/* Directional Connecting Arcs */}
          {nodePositions.map((pos, idx) => {
            const nextIdx = (idx + 1) % total;
            const nextPos = nodePositions[nextIdx];
            
            // Generate circular arc segment between current and next node
            const startAngle = pos.angle + 0.22;
            const endAngle = nextPos.angle - 0.22;
            
            const sx = center + radius * Math.cos(startAngle);
            const sy = center + radius * Math.sin(startAngle);
            const ex = center + radius * Math.cos(endAngle);
            const ey = center + radius * Math.sin(endAngle);

            const largeArc = (endAngle - startAngle + 2 * Math.PI) % (2 * Math.PI) > Math.PI ? 1 : 0;
            const isCompleted = idx <= activeIdx;

            return (
              <path
                key={`arc-${idx}`}
                d={`M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey}`}
                fill="none"
                stroke={isCompleted ? '#6366f1' : '#cbd5e1'}
                strokeWidth={isCompleted ? '3' : '2'}
                strokeDasharray={isCompleted ? 'none' : '4 4'}
                markerEnd="url(#cycle-arrow)"
                className="transition-colors duration-300 dark:stroke-slate-700"
              />
            );
          })}

          {/* Interactive Stage Nodes */}
          {items.map((stage, idx) => {
            const pos = nodePositions[idx];
            const isCurrent = idx === activeIdx;
            const isPassed = idx < activeIdx;

            return (
              <g
                key={`node-${idx}`}
                onClick={() => setActiveIdx(idx)}
                className="cursor-pointer group"
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                {/* Ping ring for active node */}
                {isCurrent && (
                  <circle
                    r={32}
                    className="fill-none stroke-indigo-400 dark:stroke-indigo-500 animate-ping opacity-35"
                    strokeWidth="2"
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  r={isCurrent ? 26 : 22}
                  className={`transition-all duration-200 ${
                    isCurrent
                      ? 'fill-indigo-600 stroke-white dark:stroke-slate-900 shadow-md'
                      : isPassed
                      ? 'fill-indigo-100 dark:fill-indigo-950/80 stroke-indigo-500'
                      : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 group-hover:stroke-indigo-400'
                  }`}
                  strokeWidth={isCurrent ? '3' : '2'}
                />

                {/* Step Number */}
                <text
                  textAnchor="middle"
                  dy=".35em"
                  className={`text-xs font-mono font-bold select-none ${
                    isCurrent
                      ? 'fill-white'
                      : isPassed
                      ? 'fill-indigo-700 dark:fill-indigo-300'
                      : 'fill-slate-600 dark:fill-slate-400 group-hover:fill-indigo-600'
                  }`}
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active Stage Details Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 transition-all">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {activeIdx + 1}
            </span>
            <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              {currentItem.label}
            </h5>
          </div>
          {currentItem.badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
              {currentItem.badge}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
          {currentItem.description}
        </p>
      </div>

      {/* Stepper Navigation Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setActiveIdx((prev) => (prev - 1 + total) % total)}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700 active:scale-95 transition-all"
        >
          ← Previous Phase
        </button>

        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
          Continuous Phase {activeIdx + 1} of {total}
        </span>

        <button
          onClick={() => setActiveIdx((prev) => (prev + 1) % total)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs active:scale-95 transition-all"
        >
          Next Phase →
        </button>
      </div>

      {caption && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 italic">
          {caption}
        </p>
      )}
    </div>
  );
};
