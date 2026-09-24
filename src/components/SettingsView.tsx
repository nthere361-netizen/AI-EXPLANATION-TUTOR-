import React, { useState } from 'react';
import { UserPreferences, ExplanationLevel } from '../types';
import { Settings, Volume2, Sliders, Sparkles, RefreshCcw, ShieldCheck, Zap, Check } from 'lucide-react';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onResetData: () => void;
  onLaunchDemoPreset: (topic: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  onResetData,
  onLaunchDemoPreset,
}) => {
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    onResetData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tutor Preferences & Configuration
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Personalize explanation depth, speech speeds, and presentation settings.
            </p>
          </div>
        </div>

        {/* Options Stack */}
        <div className="mt-6 space-y-6">
          {/* 1. Default Depth */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Default Explanation Depth
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'beginner', title: 'Beginner', sub: 'Intuitive analogies, plain words, everyday metaphors' },
                { id: 'intermediate', title: 'Intermediate', sub: 'Causal mechanisms, structured flow, systems thinking' },
                { id: 'deep_dive', title: 'Deep Dive', sub: 'Edge conditions, mathematical rigor, formal architecture' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => onUpdatePreferences({ defaultLevel: lvl.id as ExplanationLevel })}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    preferences.defaultLevel === lvl.id
                      ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-400/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-sm font-bold block ${preferences.defaultLevel === lvl.id ? 'text-indigo-950' : 'text-slate-800'}`}>
                    {lvl.title}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block leading-snug">
                    {lvl.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Voice Audio Speed */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Speech Synthesis Speed
              </label>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {preferences.speechSpeed}x
              </span>
            </div>
            <div className="flex items-center gap-3">
              {[0.8, 1.0, 1.2, 1.4].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onUpdatePreferences({ speechSpeed: speed })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    preferences.speechSpeed === speed
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* 3. Explanation Style Emphasis */}
          <div className="pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Pedagogical Emphasis
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'analogy', title: 'Analogy-First', desc: 'Prioritizes relatable stories and metaphors' },
                { id: 'visual', title: 'Visual-First', desc: 'Focuses on stage flowcharts & structural diagrams' },
                { id: 'academic', title: 'Academic / Structured', desc: 'Focuses on rigorous step-by-step principles' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => onUpdatePreferences({ explanationStyle: style.id as any })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    preferences.explanationStyle === style.id
                      ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400 font-semibold text-indigo-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold block">{style.title}</span>
                  <span className="text-[11px] text-slate-500">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Motion & Accessibility Settings */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Reduced Motion
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Minimizes animations, transitions, and pulsing effects across the workspace.
              </p>
            </div>
            <button
              onClick={() => onUpdatePreferences({ reducedMotion: !preferences.reducedMotion })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                preferences.reducedMotion
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {preferences.reducedMotion ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>

      {/* College Hackathon Presenter Guide Card */}
      <div className="bg-linear-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Hackathon Demonstration Presets
          </span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          Showcase the Core Product Difference
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
          Click any preset to demonstrate how Explanation Tutor doesn’t just dump answers like generic chatbots, but decomposes mental models with visual flows and interactive checks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => onLaunchDemoPreset('Explain photosynthesis')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-left text-xs text-slate-200 transition-all flex items-center justify-between"
          >
            <span><strong>Biology:</strong> Photosynthesis & Light Reactions</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          </button>
          <button
            onClick={() => onLaunchDemoPreset('What is an API?')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-left text-xs text-slate-200 transition-all flex items-center justify-between"
          >
            <span><strong>Systems:</strong> What is an API? (Waiter Analogy)</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          </button>
          <button
            onClick={() => onLaunchDemoPreset('Explain recursion')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-left text-xs text-slate-200 transition-all flex items-center justify-between"
          >
            <span><strong>CS:</strong> Recursion & Call Stacks</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          </button>
          <button
            onClick={() => onLaunchDemoPreset('Why does inflation happen?')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-left text-xs text-slate-200 transition-all flex items-center justify-between"
          >
            <span><strong>Econ:</strong> Inflation & Money Supply</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          </button>
        </div>
      </div>

      {/* Reset Cache & History */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Reset Local Session Data</h4>
          <p className="text-xs text-slate-500">Clears recent queries, saved bookmarks, and restores default sample study materials.</p>
        </div>
        <div className="flex items-center gap-3">
          {resetDone && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Data Reset</span>
            </span>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
