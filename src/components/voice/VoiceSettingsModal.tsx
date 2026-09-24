import React from 'react';
import { VoiceSettings } from '../../types';
import { Settings, Volume2, X, Sliders, Mic } from 'lucide-react';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
  availableVoices: SpeechSynthesisVoice[];
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  availableVoices
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-settings-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 id="voice-settings-title" className="text-base font-bold text-slate-900 dark:text-white">
              Voice Mode Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close voice settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <label htmlFor="voice-picker" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tutor Voice
          </label>
          <select
            id="voice-picker"
            value={settings.voiceName}
            onChange={(e) => onUpdateSettings({ voiceName: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {availableVoices.length === 0 ? (
              <option value="">Default System Teacher Voice</option>
            ) : (
              availableVoices.map((voice, idx) => (
                <option key={`${voice.name}-${idx}`} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))
            )}
          </select>
          <p className="text-[11px] text-slate-400">
            Web Speech synthesis voices available on your current operating system and browser.
          </p>
        </div>

        {/* Speed Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Speaking Pace</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">{settings.rate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.25"
            step="0.05"
            value={settings.rate}
            onChange={(e) => onUpdateSettings({ rate: parseFloat(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0.75x (Deliberate)</span>
            <span>1.0x (Standard)</span>
            <span>1.25x (Brisk)</span>
          </div>
        </div>

        {/* Pitch Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Voice Pitch</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">{settings.pitch.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.1"
            value={settings.pitch}
            onChange={(e) => onUpdateSettings({ pitch: parseFloat(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Lower</span>
            <span>Natural</span>
            <span>Higher</span>
          </div>
        </div>

        {/* Push to Talk Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Push-to-Talk Mode
            </span>
            <span className="text-[11px] text-slate-400 block">
              Hold Spacebar or the orb to speak, release when finished.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.pushToTalk}
            onChange={(e) => onUpdateSettings({ pushToTalk: e.target.checked })}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        {/* Close Action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
