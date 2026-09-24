import React from 'react';
import { VoiceModeState } from '../../types';
import { Mic, Square, Volume2, Sparkles, AlertCircle } from 'lucide-react';

interface VoiceOrbVisualizerProps {
  state: VoiceModeState;
  audioLevel: number;
  onOrbClick: () => void;
  isPushToTalk?: boolean;
}

export const VoiceOrbVisualizer: React.FC<VoiceOrbVisualizerProps> = ({
  state,
  audioLevel,
  onOrbClick,
  isPushToTalk = false
}) => {
  // Compute dynamic scale and glow based on audio amplitude level
  const dynamicScale = 1 + audioLevel * 0.18;
  const outerPulseScale = 1 + audioLevel * 0.35;
  const outerOpacity = Math.max(0.15, Math.min(0.8, 0.2 + audioLevel * 0.6));

  const getStatusLabel = () => {
    switch (state) {
      case 'listening':
        return isPushToTalk ? 'Listening (Release to stop)' : 'Listening… (Speak now)';
      case 'thinking':
        return 'Thinking & structuring answer…';
      case 'speaking':
        return 'Speaking (Tap orb to interrupt)';
      case 'interrupted':
        return 'Interrupted — Listening…';
      case 'idle':
      default:
        return 'Tap orb or press Space to speak';
    }
  };

  const getStatusBadge = () => {
    switch (state) {
      case 'listening':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Listening
          </span>
        );
      case 'thinking':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700">
            <Sparkles className="w-3 h-3 animate-spin text-amber-500" />
            Thinking
          </span>
        );
      case 'speaking':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-700">
            <Volume2 className="w-3.5 h-3.5 animate-pulse text-indigo-600 dark:text-indigo-400" />
            Explaining Aloud
          </span>
        );
      case 'interrupted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300/60 dark:border-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Interrupted
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Ready to listen
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Orb Stage Container */}
      <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center my-2">
        {/* Outer Aura Ring 2 (Active when listening or speaking) */}
        {(state === 'listening' || state === 'speaking') && (
          <div
            className="absolute inset-0 rounded-full transition-all duration-150 pointer-events-none"
            style={{
              transform: `scale(${outerPulseScale * 1.15})`,
              background: state === 'listening'
                ? 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0) 70%)'
                : 'radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(168, 85, 247, 0) 70%)',
              opacity: outerOpacity
            }}
          />
        )}

        {/* Outer Aura Ring 1 */}
        <div
          className={`absolute inset-4 rounded-full transition-all duration-300 pointer-events-none ${
            state === 'thinking' ? 'animate-pulse' : ''
          }`}
          style={{
            transform: `scale(${outerPulseScale})`,
            background: state === 'listening'
              ? 'radial-gradient(circle, rgba(52, 211, 153, 0.35) 0%, rgba(16, 185, 129, 0) 70%)'
              : state === 'thinking'
              ? 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0) 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0) 70%)',
            opacity: outerOpacity
          }}
        />

        {/* Interactive Center Orb */}
        <button
          type="button"
          onClick={onOrbClick}
          aria-label={
            state === 'speaking'
              ? 'Interrupt teacher and speak'
              : state === 'listening'
              ? 'Stop listening'
              : 'Start speaking'
          }
          className={`relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-400 dark:focus:ring-indigo-600 ${
            state === 'listening'
              ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 shadow-emerald-500/40 text-white'
              : state === 'thinking'
              ? 'bg-gradient-to-tr from-indigo-700 via-purple-600 to-amber-500 shadow-purple-500/40 text-white animate-pulse'
              : state === 'speaking'
              ? 'bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-800 shadow-indigo-500/50 text-white hover:scale-105'
              : 'bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-900 dark:from-slate-800 dark:via-indigo-950 dark:to-slate-900 shadow-indigo-950/50 text-slate-200 hover:scale-105 border border-indigo-500/30'
          }`}
          style={{
            transform: `scale(${dynamicScale})`
          }}
        >
          {/* Inner ambient glow */}
          <div className="absolute inset-2 rounded-full bg-white/10 blur-xs pointer-events-none" />

          {/* Central Icon depending on state */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            {state === 'listening' ? (
              <>
                <Mic className="w-10 h-10 animate-bounce" />
                <span className="text-[11px] font-bold tracking-wider uppercase mt-1 text-white/90">
                  Listening
                </span>
              </>
            ) : state === 'thinking' ? (
              <>
                <Sparkles className="w-10 h-10 animate-spin" />
                <span className="text-[11px] font-bold tracking-wider uppercase mt-1 text-white/90">
                  Thinking
                </span>
              </>
            ) : state === 'speaking' ? (
              <>
                {/* Simulated waveform bars inside orb when speaking */}
                <div className="flex items-center gap-1 h-8 my-1" aria-hidden="true">
                  <span className="w-1.5 bg-white rounded-full transition-all duration-75" style={{ height: `${Math.max(10, audioLevel * 30)}px` }} />
                  <span className="w-1.5 bg-white rounded-full transition-all duration-75" style={{ height: `${Math.max(16, (1 - audioLevel * 0.4) * 32)}px` }} />
                  <span className="w-1.5 bg-white rounded-full transition-all duration-75" style={{ height: `${Math.max(12, audioLevel * 34)}px` }} />
                  <span className="w-1.5 bg-white rounded-full transition-all duration-75" style={{ height: `${Math.max(8, (1 - audioLevel * 0.3) * 26)}px` }} />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/80">
                  Tap to Interrupt
                </span>
              </>
            ) : (
              <>
                <Mic className="w-9 h-9 text-indigo-300" />
                <span className="text-[11px] font-semibold text-slate-300 mt-1">
                  Tap to Speak
                </span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* State Badge & Friendly Guidance */}
      <div className="mt-3 flex flex-col items-center gap-1.5">
        {getStatusBadge()}
        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
          {getStatusLabel()}
        </p>
      </div>
    </div>
  );
};
