import React, { useEffect, useRef } from 'react';
import { VoiceConversationTurn, VoiceSentence } from '../../types';
import { User, Sparkles, Volume2, CornerDownLeft } from 'lucide-react';

interface VoiceTranscriptPaneProps {
  turns: VoiceConversationTurn[];
  interimTranscript: string;
  isListening: boolean;
  activeSentenceIndex: number;
  isSpeaking: boolean;
  onQuickCommand?: (command: string) => void;
}

export const VoiceTranscriptPane: React.FC<VoiceTranscriptPaneProps> = ({
  turns,
  interimTranscript,
  isListening,
  activeSentenceIndex,
  isSpeaking,
  onQuickCommand
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeSentenceRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll on new turns, interim text, or active sentence change
  useEffect(() => {
    if (activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [turns, interimTranscript, activeSentenceIndex]);

  return (
    <div className="flex flex-col h-full bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/70 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>Conversation Transcript</span>
        <span className="text-[11px] font-normal text-slate-400">Audio synced in real-time</span>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm focus:outline-none"
        tabIndex={0}
        aria-label="Spoken conversation transcript"
      >
        {turns.length === 0 && !interimTranscript && (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 dark:text-slate-500">
            <Sparkles className="w-8 h-8 text-indigo-400 mb-2 opacity-60" />
            <p className="font-medium text-slate-600 dark:text-slate-300">Start a conversation with your tutor</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Say &ldquo;Explain how a diesel engine works&rdquo; or ask any question you want to understand.
            </p>
          </div>
        )}

        {turns.map((turn, turnIdx) => {
          const isLatestTurn = turnIdx === turns.length - 1;
          const isTutor = turn.role === 'tutor';

          return (
            <div
              key={turn.id}
              className={`flex gap-3 ${isTutor ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  isTutor
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 dark:bg-slate-700 text-white'
                }`}
              >
                {isTutor ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-xs text-xs sm:text-sm ${
                  isTutor
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80'
                    : 'bg-indigo-600 text-white rounded-tr-xs'
                }`}
              >
                {isTutor && turn.sentences && turn.sentences.length > 0 ? (
                  <div className="space-y-1">
                    {turn.sentences.map((sent, sIdx) => {
                      const isCurrentlySpoken = isLatestTurn && isSpeaking && activeSentenceIndex === sIdx;
                      return (
                        <span
                          key={sIdx}
                          ref={isCurrentlySpoken ? activeSentenceRef : undefined}
                          className={`inline transition-all duration-200 rounded px-1 py-0.5 mr-1 ${
                            isCurrentlySpoken
                              ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 font-semibold ring-1 ring-indigo-400/50'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {sent.text}{' '}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p>{turn.text}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Interim Transcript (as user speaks) */}
        {isListening && interimTranscript && (
          <div className="flex gap-3 items-start flex-row-reverse animate-pulse">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tr-xs px-4 py-2.5 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm italic">
              &ldquo;{interimTranscript}&rdquo;
            </div>
          </div>
        )}
      </div>

      {/* Quick Spoken Follow-up Suggestions */}
      {onQuickCommand && (
        <div className="pt-3 mt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 mr-1">Quick:</span>
          {[
            'Explain more simply',
            'Wait, explain that again',
            'Give a real-world example',
            'Go deeper',
            'Skip ahead'
          ].map((cmd, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onQuickCommand(cmd)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
