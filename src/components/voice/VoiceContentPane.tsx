import React, { useState } from 'react';
import { VisualExplanation, ExplanationLevel } from '../../types';
import { VisualDiagram } from '../VisualDiagram';
import { BookOpen, Layers, Activity, TrendingUp, Zap, HelpCircle } from 'lucide-react';

interface VoiceContentPaneProps {
  topic?: string;
  level?: ExplanationLevel;
  visual?: VisualExplanation | null;
  onScreenText?: string;
  realTimeData?: any | null;
  isLoading?: boolean;
}

export const VoiceContentPane: React.FC<VoiceContentPaneProps> = ({
  topic = 'Voice Explanation',
  level = 'beginner',
  visual,
  onScreenText,
  realTimeData,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'notes'>('visual');

  if (!visual && !onScreenText && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[320px] bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Visual Diagram & Summary
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 leading-relaxed">
          As you converse with the tutor, interactive diagrams (flows, comparisons, architectures, equations) and structured notes will appear here automatically.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
            SVG Visuals
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
            Real-Time Stat Tiles
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
            Structured Notes
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 overflow-y-auto">
      {/* Header with Switcher */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
            {topic}
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
            {level.replace('_', ' ')} depth
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Visual Model
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Summary Notes
          </button>
        </div>
      </div>

      {/* Real-time telemetry tiles if present */}
      {realTimeData && realTimeData.starterTiles && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {realTimeData.starterTiles.slice(0, 4).map((tile: any, idx: number) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60"
            >
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {tile.label}
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {tile.value}
              </div>
              {tile.change && (
                <div className={`text-[10px] font-semibold mt-0.5 ${tile.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {tile.change}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Content Pane */}
      {activeTab === 'visual' ? (
        <div className="flex-1">
          {visual ? (
            <VisualDiagram
              data={visual}
              topic={topic}
              level={level}
              isLoading={isLoading}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
              Generating visual representation…
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed overflow-y-auto">
          {onScreenText ? (
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-2 whitespace-pre-wrap">
              {onScreenText}
            </div>
          ) : (
            <p className="text-slate-400 text-xs italic">Summary will appear as the tutor explains.</p>
          )}
        </div>
      )}
    </div>
  );
};
