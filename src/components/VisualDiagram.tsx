import React, { useState } from 'react';
import { VisualExplanation } from '../types';
import { Layers, ChevronRight, Check, Play, RotateCcw } from 'lucide-react';

interface VisualDiagramProps {
  data: VisualExplanation;
}

export const VisualDiagram: React.FC<VisualDiagramProps> = ({ data }) => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-advance through stages when play is clicked
  React.useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStage((prev) => {
          if (prev >= data.stages.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, data.stages.length]);

  return (
    <div className="w-full bg-slate-900 text-slate-100 rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {data.title}
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Interactive Architectural Walkthrough • Stage {activeStage + 1} of {data.stages.length}
            </p>
          </div>
        </div>

        {/* Play / Stepper controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeStage >= data.stages.length - 1) {
                setActiveStage(0);
              }
              setIsPlaying(!isPlaying);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isPlaying ? (
              <>
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span>Auto-playing…</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Stages</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStage(0);
            }}
            title="Reset to Stage 1"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stage Flow Nodes Grid */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {data.stages.map((stage, idx) => {
          const isCurrent = activeStage === idx;
          const isPassed = activeStage > idx;

          return (
            <button
              key={idx}
              onClick={() => {
                setIsPlaying(false);
                setActiveStage(idx);
              }}
              className={`p-3.5 rounded-xl text-left transition-all duration-200 relative group flex flex-col justify-between ${
                isCurrent
                  ? 'bg-teal-950/60 border-2 border-teal-400 text-white shadow-lg shadow-teal-900/30'
                  : isPassed
                  ? 'bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:border-slate-600'
                  : 'bg-slate-800/40 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      isCurrent
                        ? 'bg-teal-400/20 text-teal-300 border border-teal-400/40'
                        : isPassed
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    Phase {idx + 1}
                  </span>
                  {isPassed && <Check className="w-3.5 h-3.5 text-teal-400" />}
                </div>
                <h5 className={`text-xs font-bold ${isCurrent ? 'text-teal-200' : 'text-slate-200'}`}>
                  {stage.label}
                </h5>
              </div>

              {stage.badge && (
                <div className="mt-3 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-teal-400/90 font-medium">
                    {stage.badge}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Breakdown */}
      <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700/70">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-mono font-bold text-sm shrink-0 border border-teal-500/30">
            {activeStage + 1}
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-bold text-white mb-1">
              {data.stages[activeStage]?.label}
            </h5>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {data.stages[activeStage]?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Diagram Caption / Formula Footer */}
      {data.caption && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="text-teal-400 font-semibold">Summary Model:</span>
          <span className="text-slate-300 truncate max-w-lg">{data.caption}</span>
        </div>
      )}
    </div>
  );
};
