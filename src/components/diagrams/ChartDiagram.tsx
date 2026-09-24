/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ChartDiagram — SVG-based mini charts & stat tiles (bar, line, sparkline)
 * Strict 5-color grammar: indigo, slate, emerald, amber, rose
 */

import React, { useState } from 'react';
import { VisualChartData } from '../../types';
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface ChartDiagramProps {
  title?: string;
  chartData?: VisualChartData;
  stages?: Array<{ label: string; description: string; badge?: string }>;
  altText?: string;
  caption?: string;
}

export const ChartDiagram: React.FC<ChartDiagramProps> = ({
  title,
  chartData,
  stages = [],
  altText,
  caption
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const points: Array<{ label: string; value: number; color?: string }> = chartData?.points && chartData.points.length > 0
    ? chartData.points
    : stages.map((s, idx) => ({
        label: s.label.slice(0, 10),
        value: 20 + ((idx * 27) % 65),
        color: idx % 2 === 0 ? 'indigo' : 'emerald'
      }));

  if (points.length === 0) return null;

  const maxValue = Math.max(...points.map((p: { value: number }) => p.value), 1);
  const chartType = chartData?.type || 'bar';

  // SVG dimensions for chart
  const width = 560;
  const height = 180;
  const paddingX = 40;
  const paddingY = 24;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Compute SVG polyline/path points for line / area charts
  const svgCoordinates = points.map((p: { label: string; value: number; color?: string }, idx: number) => {
    const x = paddingX + (plotWidth / (points.length - 1 || 1)) * idx;
    const y = height - paddingY - (p.value / maxValue) * plotHeight;
    return { x, y, label: p.label, value: p.value };
  });

  const polylinePoints = svgCoordinates.map((c: { x: number; y: number }) => `${c.x},${c.y}`).join(' ');
  const areaPath = `M ${svgCoordinates[0].x} ${height - paddingY} ` +
    svgCoordinates.map((c: { x: number; y: number }) => `L ${c.x} ${c.y}`).join(' ') +
    ` L ${svgCoordinates[svgCoordinates.length - 1].x} ${height - paddingY} Z`;

  return (
    <div
      className="w-full space-y-5"
      role="img"
      aria-label={altText || `Data chart visual for ${title || 'Metrics'}`}
    >
      {/* Stat Tiles Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {points.slice(0, 4).map((p: { label: string; value: number; color?: string }, idx: number) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate">
              {p.label}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
              </span>
              {chartData?.unit && (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {chartData.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SVG Chart Container */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {title || 'Quantitative Metric Distribution'}
            </h5>
          </div>
          {chartData?.xAxisLabel && (
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              Axis: {chartData.xAxisLabel}
            </span>
          )}
        </div>

        {/* SVG Graphic */}
        <div className="w-full overflow-x-auto select-none">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 min-w-[480px] overflow-visible">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.33, 0.66, 1].map((ratio, i) => {
              const y = height - paddingY - ratio * plotHeight;
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    className="dark:opacity-20"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {Math.round(ratio * maxValue)}
                  </text>
                </g>
              );
            })}

            {/* Line / Area rendering */}
            {chartType === 'line' || chartType === 'sparkline' ? (
              <g>
                <path d={areaPath} fill="url(#chartGradient)" />
                <path
                  d={`M ${polylinePoints.replace(/ /g, ' L ')}`}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {svgCoordinates.map((c: { x: number; y: number }, i: number) => (
                  <circle
                    key={i}
                    cx={c.x}
                    cy={c.y}
                    r={hoveredIdx === i ? 6 : 4}
                    fill={hoveredIdx === i ? '#4338ca' : '#6366f1'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                ))}
              </g>
            ) : (
              /* Bar rendering */
              <g>
                {points.map((p: { label: string; value: number; color?: string }, idx: number) => {
                  const barWidth = Math.min(36, (plotWidth / points.length) * 0.6);
                  const barX = paddingX + (plotWidth / points.length) * idx + (plotWidth / points.length - barWidth) / 2;
                  const barHeight = (p.value / maxValue) * plotHeight;
                  const barY = height - paddingY - barHeight;
                  const isHovered = hoveredIdx === idx;

                  return (
                    <g 
                      key={idx} 
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill={isHovered ? '#4338ca' : '#6366f1'}
                        className="transition-colors duration-150"
                      />
                      <text
                        x={barX + barWidth / 2}
                        y={height - paddingY + 14}
                        textAnchor="middle"
                        fill={isHovered ? '#4338ca' : '#64748b'}
                        fontSize="10"
                        fontWeight={isHovered ? 'bold' : 'normal'}
                      >
                        {p.label.length > 7 ? p.label.slice(0, 6) + '…' : p.label}
                      </text>
                      {/* Value tag above bar on hover */}
                      {isHovered && (
                        <text
                          x={barX + barWidth / 2}
                          y={barY - 6}
                          textAnchor="middle"
                          fill="#4338ca"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {p.value}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        </div>
      </div>

      {caption && (
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-mono">
          {caption}
        </p>
      )}
    </div>
  );
};
