/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * StackDiagram — Layered system architecture (Client -> API -> Server -> DB)
 * Strict 5-color grammar: indigo, slate, emerald, amber, rose
 */

import React from 'react';
import { VisualStage } from '../../types';
import { Layers, ArrowDown, Database, Server, Globe, Cpu } from 'lucide-react';

interface StackDiagramProps {
  title?: string;
  layers?: Array<{
    label: string;
    items?: string[];
    description?: string;
    badge?: string;
    color?: string;
  }>;
  stages?: VisualStage[];
  altText?: string;
  caption?: string;
}

export const StackDiagram: React.FC<StackDiagramProps> = ({
  title,
  layers,
  stages = [],
  altText,
  caption
}) => {
  // Normalize layers
  const normalizedLayers = (layers && layers.length > 0)
    ? layers
    : stages.map((s, idx) => ({
        label: s.label,
        items: [s.description],
        description: s.description,
        badge: s.badge || `LAYER ${idx + 1}`
      }));

  if (normalizedLayers.length === 0) return null;

  // Pre-configured color bands matching the 5-color palette: indigo, slate, emerald, amber
  const colorBands = [
    {
      card: 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100',
      badge: 'bg-indigo-600 text-white',
      accent: '#6366f1',
      icon: Globe
    },
    {
      card: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100',
      badge: 'bg-slate-700 dark:bg-slate-600 text-white',
      accent: '#64748b',
      icon: Cpu
    },
    {
      card: 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100',
      badge: 'bg-emerald-600 text-white',
      accent: '#10b981',
      icon: Server
    },
    {
      card: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100',
      badge: 'bg-amber-600 text-white',
      accent: '#f59e0b',
      icon: Database
    }
  ];

  return (
    <div
      className="w-full max-w-2xl mx-auto space-y-3"
      role="img"
      aria-label={altText || `Layered architecture stack diagram for ${title || 'System'}`}
    >
      {normalizedLayers.map((layer, idx) => {
        const style = colorBands[idx % colorBands.length];
        const IconComponent = style.icon;
        const isNotLast = idx < normalizedLayers.length - 1;

        return (
          <div key={idx} className="relative group">
            {/* The Horizontal Layer Band */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${style.card} shadow-2xs transition-all hover:scale-[1.01]`}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${style.badge} shrink-0`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm sm:text-base">
                    {layer.label}
                  </h4>
                </div>
                {layer.badge && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                    {layer.badge}
                  </span>
                )}
              </div>

              {layer.description && (
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed pl-8">
                  {layer.description}
                </p>
              )}

              {layer.items && layer.items.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-3 pl-8">
                  {layer.items.map((item, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white/80 dark:bg-slate-900/60 border border-black/5 dark:border-white/10"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Downward SVG arrow connector between layers */}
            {isNotLast && (
              <div className="flex justify-center my-1">
                <svg width="24" height="18" viewBox="0 0 24 18" className="overflow-visible">
                  <line 
                    x1="12" 
                    y1="0" 
                    x2="12" 
                    y2="12" 
                    stroke={style.accent} 
                    strokeWidth="2" 
                    strokeDasharray="3 3" 
                  />
                  <polygon points="8,10 12,16 16,10" fill={style.accent} />
                </svg>
              </div>
            )}
          </div>
        );
      })}

      {caption && (
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-mono pt-2">
          {caption}
        </p>
      )}
    </div>
  );
};
