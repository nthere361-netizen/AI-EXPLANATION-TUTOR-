/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FlowDiagram — SVG-based animated numbered process flow
 * Strict 5-color grammar: indigo, slate, emerald, amber, rose
 */

import React, { useState } from 'react';
import { DiagramNode, DiagramEdge, VisualStage } from '../../types';
import { Play, RotateCcw, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

interface FlowDiagramProps {
  title: string;
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  stages?: VisualStage[];
  activeStage?: number;
  onSelectStage?: (index: number) => void;
  altText?: string;
  caption?: string;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({
  title,
  nodes,
  edges,
  stages = [],
  activeStage: controlledActive,
  onSelectStage,
  altText,
  caption
}) => {
  const [internalActive, setInternalActive] = useState<number>(0);
  const activeIdx = controlledActive !== undefined ? controlledActive : internalActive;

  // Normalize nodes from either nodes[] or stages[]
  const items: Array<{
    id: string;
    number: number;
    label: string;
    description: string;
    badge?: string;
    color?: string;
  }> = (nodes && nodes.length > 0)
    ? nodes.map((n, i) => ({
        id: n.id || `node-${i}`,
        number: i + 1,
        label: n.label,
        description: n.description || '',
        badge: n.badge || (n.kind ? n.kind.toUpperCase() : `STEP ${i + 1}`),
        color: n.color || 'indigo'
      }))
    : stages.map((s, i) => ({
        id: `stage-${i}`,
        number: i + 1,
        label: s.label,
        description: s.description,
        badge: s.badge || `STEP ${i + 1}`,
        color: 'indigo'
      }));

  if (items.length === 0) return null;

  const handleStep = (idx: number) => {
    if (onSelectStage) onSelectStage(idx);
    else setInternalActive(idx);
  };

  const currentItem = items[activeIdx] || items[0];

  return (
    <div 
      className="w-full space-y-4"
      role="img"
      aria-label={altText || `Sequential process diagram for ${title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') handleStep(Math.min(items.length - 1, activeIdx + 1));
        if (e.key === 'ArrowLeft') handleStep(Math.max(0, activeIdx - 1));
      }}
    >
      {/* SVG Pipeline Visualization */}
      <div className="relative w-full overflow-x-auto py-4 px-2 select-none">
        <svg 
          viewBox={`0 0 ${Math.max(680, items.length * 175)} 120`}
          className="w-full h-28 sm:h-32 min-w-[600px] overflow-visible"
        >
          <defs>
            <marker
              id="flow-arrow-indigo"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
            </marker>
            <marker
              id="flow-arrow-slate"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Connectors between nodes */}
          {items.map((_, i) => {
            if (i === items.length - 1) return null;
            const x1 = 80 + i * 165;
            const x2 = x1 + 85;
            const isPassed = i < activeIdx;

            return (
              <g key={`edge-${i}`}>
                {/* Connector line */}
                <line
                  x1={x1}
                  y1={52}
                  x2={x2}
                  y2={52}
                  stroke={isPassed ? '#6366f1' : '#cbd5e1'}
                  strokeWidth="2.5"
                  strokeDasharray={isPassed ? undefined : '4 4'}
                  className="transition-colors duration-200"
                />
                {/* Arrowhead */}
                <polygon
                  points={`${x2},48 ${x2 + 7},52 ${x2},56`}
                  fill={isPassed ? '#6366f1' : '#94a3b8'}
                />
              </g>
            );
          })}

          {/* Node Circles */}
          {items.map((item, i) => {
            const cx = 40 + i * 165;
            const isActive = i === activeIdx;
            const isCompleted = i < activeIdx;

            return (
              <g 
                key={item.id} 
                className="cursor-pointer group"
                onClick={() => handleStep(i)}
              >
                {/* Outer Glow for Active Node */}
                {isActive && (
                  <circle
                    cx={cx}
                    y={52}
                    r="28"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeOpacity="0.4"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={cx}
                  cy={52}
                  r="20"
                  fill={isActive ? '#4f46e5' : isCompleted ? '#10b981' : '#ffffff'}
                  stroke={isActive ? '#4338ca' : isCompleted ? '#059669' : '#94a3b8'}
                  strokeWidth="2.5"
                  className="transition-all duration-200 group-hover:scale-105"
                />

                {/* Step Number or Checkmark */}
                <text
                  x={cx}
                  y={57}
                  textAnchor="middle"
                  fill={isActive || isCompleted ? '#ffffff' : '#475569'}
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {isCompleted ? '✓' : item.number}
                </text>

                {/* Node Label Below */}
                <text
                  x={cx}
                  y={90}
                  textAnchor="middle"
                  fill={isActive ? '#4338ca' : '#64748b'}
                  fontSize="11"
                  fontWeight={isActive ? '700' : '500'}
                  className="transition-colors"
                >
                  {item.label.length > 18 ? item.label.slice(0, 16) + '…' : item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active Stage Callout Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/80 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {currentItem.number}
            </span>
            <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              {currentItem.label}
            </h5>
          </div>
          {currentItem.badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 self-start sm:self-auto border border-indigo-200/80 dark:border-indigo-800/60">
              {currentItem.badge}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
          {currentItem.description}
        </p>
      </div>

      {/* Flow Controls & Progression Buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === activeIdx 
                  ? 'w-6 bg-indigo-600' 
                  : idx < activeIdx 
                  ? 'w-2 bg-emerald-500' 
                  : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
              title={`Jump to step ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStep(Math.max(0, activeIdx - 1))}
            disabled={activeIdx === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <button
            onClick={() => handleStep(Math.min(items.length - 1, activeIdx + 1))}
            disabled={activeIdx === items.length - 1}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {caption && (
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-mono pt-1">
          {caption}
        </p>
      )}
    </div>
  );
};
