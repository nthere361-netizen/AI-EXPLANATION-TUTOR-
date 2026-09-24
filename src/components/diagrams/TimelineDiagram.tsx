/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TimelineDiagram — SVG Horizontal timeline with milestone nodes
 * Strict 5-color grammar: indigo, slate, emerald, amber, rose
 */

import React, { useState } from 'react';
import { VisualTimelineItem } from '../../types';
import { Clock, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';

interface TimelineDiagramProps {
  title?: string;
  items?: VisualTimelineItem[];
  stages?: Array<{ label: string; description: string; badge?: string }>;
  altText?: string;
  caption?: string;
}

export const TimelineDiagram: React.FC<TimelineDiagramProps> = ({
  title,
  items,
  stages = [],
  altText,
  caption
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  // Normalize timeline entries
  const milestones: VisualTimelineItem[] = (items && items.length > 0)
    ? items
    : stages.map((s, i) => ({
        time: s.badge || `Phase ${i + 1}`,
        title: s.label,
        description: s.description,
        status: i === 0 ? 'completed' : i === 1 ? 'current' : 'upcoming'
      }));

  if (milestones.length === 0) return null;

  const currentMilestone = milestones[activeIdx] || milestones[0];

  return (
    <div
      className="w-full space-y-5"
      role="img"
      aria-label={altText || `Historical or sequential timeline for ${title || 'Milestones'}`}
    >
      {/* SVG Horizontal Timeline Rail */}
      <div className="relative w-full overflow-x-auto py-3 px-2 select-none">
        <svg 
          viewBox={`0 0 ${Math.max(600, milestones.length * 160)} 90`} 
          className="w-full h-24 min-w-[560px] overflow-visible"
        >
          {/* Main Horizontal Timeline Bar */}
          <line
            x1="40"
            y1="40"
            x2={40 + (milestones.length - 1) * 160}
            y2="40"
            stroke="#cbd5e1"
            strokeWidth="3"
            strokeLinecap="round"
            className="dark:stroke-slate-700"
          />

          {/* Active progress overlay */}
          <line
            x1="40"
            y1="40"
            x2={40 + activeIdx * 160}
            y2="40"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Milestones */}
          {milestones.map((m, idx) => {
            const cx = 40 + idx * 160;
            const isSelected = idx === activeIdx;
            const isCompleted = idx < activeIdx;

            return (
              <g
                key={idx}
                className="cursor-pointer group"
                onClick={() => setActiveIdx(idx)}
              >
                {/* Glow ring */}
                {isSelected && (
                  <circle
                    cx={cx}
                    y="40"
                    r="22"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeOpacity="0.4"
                    className="animate-pulse"
                  />
                )}

                {/* Milestone Node */}
                <circle
                  cx={cx}
                  cy="40"
                  r="14"
                  fill={isSelected ? '#4f46e5' : isCompleted ? '#10b981' : '#ffffff'}
                  stroke={isSelected ? '#4338ca' : isCompleted ? '#059669' : '#94a3b8'}
                  strokeWidth="2.5"
                  className="transition-all duration-150 group-hover:scale-110"
                />

                {/* Node Center Dot */}
                {!isCompleted && !isSelected && (
                  <circle cx={cx} cy="40" r="4" fill="#94a3b8" />
                )}

                {/* Timestamp Badge Above */}
                <text
                  x={cx}
                  y="18"
                  textAnchor="middle"
                  fill={isSelected ? '#4338ca' : '#64748b'}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {m.time}
                </text>

                {/* Title Below */}
                <text
                  x={cx}
                  y="70"
                  textAnchor="middle"
                  fill={isSelected ? '#1e293b' : '#64748b'}
                  fontSize="11"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {m.title.length > 16 ? m.title.slice(0, 14) + '…' : m.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active Milestone Card */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {currentMilestone.time}
            </span>
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {currentMilestone.title}
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
            Milestone {activeIdx + 1} of {milestones.length}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {currentMilestone.description}
        </p>
      </div>

      {caption && (
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-mono">
          {caption}
        </p>
      )}
    </div>
  );
};
