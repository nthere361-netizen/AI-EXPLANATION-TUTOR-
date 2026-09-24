import React, { useEffect } from 'react';
import { Mic, Sparkles } from 'lucide-react';

interface VoiceFloatingButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const VoiceFloatingButton: React.FC<VoiceFloatingButtonProps> = ({ onClick, isOpen }) => {
  // Global keyboard shortcuts: 'V' or 'Cmd+Shift+V' (when not inside an input/textarea)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable;

      if (isInput) return;

      // 'V' key or Cmd/Ctrl + Shift + V
      if (
        (e.key.toLowerCase() === 'v' && !e.metaKey && !e.ctrlKey && !e.altKey) ||
        (e.key.toLowerCase() === 'v' && (e.metaKey || e.ctrlKey) && e.shiftKey)
      ) {
        e.preventDefault();
        onClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick]);

  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
      {/* Floating Shortcut Tooltip badge on hover */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-xs text-white text-xs font-medium shadow-lg border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0 pointer-events-none">
        <span>Hands-Free Voice Mode</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 dark:bg-slate-700 font-mono text-[10px] text-indigo-300">
          V
        </kbd>
      </div>

      {/* Pulsing Floating Action Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Start Voice Mode tutor (Shortcut: V)"
        className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20 focus:outline-none focus:ring-4 focus:ring-indigo-400"
      >
        {/* Subtle breathing glow ring */}
        <span className="absolute -inset-1 rounded-2xl bg-indigo-500/30 animate-pulse pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center">
          <Mic className="w-6 h-6 animate-pulse" />
          <span className="text-[9px] font-bold tracking-tight uppercase mt-0.5 opacity-90">
            Voice
          </span>
        </div>
      </button>
    </div>
  );
};
