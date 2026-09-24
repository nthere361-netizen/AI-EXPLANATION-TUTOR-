import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  VoiceConversationTurn, 
  VoiceSentence, 
  VoiceModeState, 
  VoiceSettings, 
  ExplanationLevel,
  VisualExplanation 
} from '../../types';
import { useVoiceSpeech } from '../../hooks/useVoiceSpeech';
import { apiVoiceExplain } from '../../services/api';
import { VoiceOrbVisualizer } from './VoiceOrbVisualizer';
import { VoiceTranscriptPane } from './VoiceTranscriptPane';
import { VoiceContentPane } from './VoiceContentPane';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import { 
  X, 
  RotateCcw, 
  Settings, 
  Mic, 
  MicOff, 
  Square, 
  Send, 
  AlertCircle, 
  Sparkles,
  Volume2
} from 'lucide-react';

interface VoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  level?: ExplanationLevel;
  initialTopic?: string;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceName: '',
  rate: 0.95,
  pitch: 1.0,
  pushToTalk: false,
  autoStopSilenceMs: 2400
};

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({
  isOpen,
  onClose,
  level = 'beginner',
  initialTopic
}) => {
  const [turns, setTurns] = useState<VoiceConversationTurn[]>([]);
  const [state, setState] = useState<VoiceModeState>('idle');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [currentTopic, setCurrentTopic] = useState<string>(initialTopic || 'Voice Tutor');
  const [activeVisual, setActiveVisual] = useState<VisualExplanation | null>(null);
  const [activeOnScreenText, setActiveOnScreenText] = useState<string>('');
  const [activeRealTimeData, setActiveRealTimeData] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const turnsRef = useRef<VoiceConversationTurn[]>([]);
  turnsRef.current = turns;

  // Process user question / command
  const handleProcessQuery = useCallback(async (queryText: string) => {
    const clean = queryText.trim();
    if (!clean || isSubmitting) return;

    // 1. Add user turn
    const userTurnId = 'turn-user-' + Date.now();
    const newUserTurn: VoiceConversationTurn = {
      id: userTurnId,
      role: 'user',
      text: clean,
      timestamp: Date.now()
    };

    setTurns(prev => [...prev, newUserTurn]);
    setState('thinking');
    setIsSubmitting(true);

    try {
      // 2. Prepare payload for /api/explain in voice mode
      const historyPayload = turnsRef.current.slice(-6).map(t => ({
        role: t.role,
        text: t.text
      }));

      const response = await apiVoiceExplain({
        query: clean,
        level,
        mode: 'voice',
        conversationHistory: historyPayload,
        voiceSettings: {
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          voiceName: voiceSettings.voiceName
        }
      });

      // 3. Update active on-screen content
      if (response.visual) {
        setActiveVisual(response.visual);
        if (response.visual.title) {
          setCurrentTopic(response.visual.title);
        }
      }
      if (response.onScreenText) {
        setActiveOnScreenText(response.onScreenText);
      }
      if (response.realTimeData) {
        setActiveRealTimeData(response.realTimeData);
      }

      // 4. Add tutor turn
      const tutorTurnId = 'turn-tutor-' + Date.now();
      const tutorTurn: VoiceConversationTurn = {
        id: tutorTurnId,
        role: 'tutor',
        text: response.spokenText,
        sentences: response.sentences,
        visual: response.visual,
        realTimeData: response.realTimeData,
        timestamp: Date.now(),
        intent: response.intent
      };

      setTurns(prev => [...prev, tutorTurn]);
      setIsSubmitting(false);
      setState('speaking');

      // 5. Speak sentences aloud via TTS with synced highlighter
      speakSentences(response.sentences, () => {
        // Finished speaking: resume listening if continuous, else idle
        if (!voiceSettings.pushToTalk) {
          setState('listening');
          startListening();
        } else {
          setState('idle');
        }
      });
    } catch (err: any) {
      console.warn('Voice API error, using friendly voice fallback:', err);
      setIsSubmitting(false);

      const fallbackSentences: VoiceSentence[] = [
        { text: 'I heard your question, and let me share the key intuition.', durationMs: 2400 },
        { text: 'Every great concept is built from simpler foundations working together.', durationMs: 2600 },
        { text: 'Would you like to try asking that in another way, or dive into an example?', durationMs: 2800 }
      ];

      const tutorTurn: VoiceConversationTurn = {
        id: 'turn-tutor-fb-' + Date.now(),
        role: 'tutor',
        text: fallbackSentences.map(s => s.text).join(' '),
        sentences: fallbackSentences,
        timestamp: Date.now()
      };

      setTurns(prev => [...prev, tutorTurn]);
      setState('speaking');
      speakSentences(fallbackSentences, () => {
        setState(voiceSettings.pushToTalk ? 'idle' : 'listening');
        if (!voiceSettings.pushToTalk) startListening();
      });
    }
  }, [isSubmitting, level, voiceSettings]);

  // Audio Speech Hook
  const {
    isSupported,
    hasMicPermission,
    micError,
    isListening,
    isSpeaking,
    interimTranscript,
    activeSentenceIndex,
    audioLevel,
    availableVoices,
    startListening,
    stopListening,
    speakSentences,
    interrupt,
    stopAll
  } = useVoiceSpeech({
    voiceSettings,
    onAutoSubmitTranscript: (finalText) => {
      handleProcessQuery(finalText);
    }
  });

  // Keep state machine synced with hook activities
  useEffect(() => {
    if (isSpeaking) {
      setState('speaking');
    } else if (isListening) {
      setState('listening');
    } else if (!isSubmitting && state !== 'thinking') {
      setState('idle');
    }
  }, [isSpeaking, isListening, isSubmitting]);

  // Handle Orb Click: toggle listening or interrupt if tutor is currently speaking
  const handleOrbClick = () => {
    if (state === 'speaking') {
      // User tapped orb to interrupt
      interrupt();
      setState('listening');
    } else if (state === 'listening') {
      stopListening();
      setState('idle');
    } else {
      setState('listening');
      startListening();
    }
  };

  // Quick Command (e.g. "Explain like I'm 5", "Wait, what does that mean?")
  const handleQuickCommand = (cmd: string) => {
    if (state === 'speaking') {
      interrupt();
    }
    handleProcessQuery(cmd);
  };

  // Keyboard Shortcuts: Space (toggle/PTT), Enter (interrupt when speaking), Esc (close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc closes
      if (e.key === 'Escape') {
        e.preventDefault();
        stopAll();
        onClose();
        return;
      }

      // Enter interrupts when speaking
      if (e.key === 'Enter' && state === 'speaking') {
        e.preventDefault();
        interrupt();
        return;
      }

      // Spacebar for push-to-talk or listening toggle (when not focused on text input)
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (state === 'speaking') {
          interrupt();
        } else if (state === 'listening') {
          stopListening();
          setState('idle');
        } else if (state === 'idle') {
          setState('listening');
          startListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, state, interrupt, startListening, stopListening, stopAll, onClose]);

  // Initial greeting if opening with a topic
  useEffect(() => {
    if (isOpen && initialTopic && turns.length === 0) {
      handleProcessQuery(initialTopic);
    }
  }, [isOpen, initialTopic]);

  // Cleanup on close
  const handleClose = () => {
    stopAll();
    onClose();
  };

  // Restart / Clear conversation
  const handleClearHistory = () => {
    stopAll();
    setTurns([]);
    setActiveVisual(null);
    setActiveOnScreenText('');
    setActiveRealTimeData(null);
    setState('idle');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Explanation Tutor Voice Mode"
    >
      {/* Voice Mode Main Shell Container */}
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[880px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="px-5 py-3.5 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                  Voice Mode Tutor
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/60 dark:border-indigo-800">
                  Hands-Free
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Natural spoken conversation with synchronized visual models
              </p>
            </div>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Restart conversation"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Clear conversation history"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              title="Voice settings"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open voice settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleClose}
              title="Exit Voice Mode (Esc)"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close voice mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Microphone Warning Banner if permissions blocked */}
        {micError && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200/60 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{micError}</span>
            </div>
            <button
              type="button"
              onClick={() => startListening()}
              className="font-medium underline hover:text-amber-900 cursor-pointer text-xs"
            >
              Retry Mic
            </button>
          </div>
        )}

        {/* Main Body: Dual-Pane Layout on Desktop, Tabs on Mobile */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
          {/* Left Pane: Interactive Orb & Transcript (7 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col h-full space-y-4 min-h-0">
            {/* Centerpiece Glowing Orb Visualizer */}
            <div className="shrink-0 bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 py-2">
              <VoiceOrbVisualizer
                state={state}
                audioLevel={audioLevel}
                onOrbClick={handleOrbClick}
                isPushToTalk={voiceSettings.pushToTalk}
              />
            </div>

            {/* Live Transcript Pane */}
            <div className="flex-1 min-h-[180px] overflow-hidden">
              <VoiceTranscriptPane
                turns={turns}
                interimTranscript={interimTranscript}
                isListening={isListening}
                activeSentenceIndex={activeSentenceIndex}
                isSpeaking={isSpeaking}
                onQuickCommand={handleQuickCommand}
              />
            </div>
          </div>

          {/* Right Pane: On-Screen Visual Diagram & Layered Notes (6 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col h-full min-h-0">
            <VoiceContentPane
              topic={currentTopic}
              level={level}
              visual={activeVisual}
              onScreenText={activeOnScreenText}
              realTimeData={activeRealTimeData}
              isLoading={isSubmitting}
            />
          </div>
        </div>

        {/* Bottom Control Bar */}
        <footer className="px-5 py-3 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Text Input Fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!textInput.trim()) return;
              if (state === 'speaking') interrupt();
              handleProcessQuery(textInput);
              setTextInput('');
            }}
            className="flex-1 flex gap-2 w-full max-w-md"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type your question / command here…"
              className="flex-1 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isSubmitting}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Ask</span>
              <Send className="w-3 h-3" />
            </button>
          </form>

          {/* Controls & Shortcut Hints */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="hidden sm:flex items-center gap-2 text-[11px]">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                Space
              </kbd>
              <span>Toggle Mic</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                Enter
              </kbd>
              <span>Interrupt</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                Esc
              </kbd>
              <span>Exit</span>
            </div>

            {/* Quick Stop Button */}
            {(state === 'listening' || state === 'speaking') && (
              <button
                type="button"
                onClick={() => {
                  if (state === 'speaking') interrupt();
                  else stopListening();
                }}
                className="px-3 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>{state === 'speaking' ? 'Interrupt' : 'Stop'}</span>
              </button>
            )}
          </div>
        </footer>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={voiceSettings}
        onUpdateSettings={(updated) => setVoiceSettings(prev => ({ ...prev, ...updated }))}
        availableVoices={availableVoices}
      />
    </div>
  );
};
