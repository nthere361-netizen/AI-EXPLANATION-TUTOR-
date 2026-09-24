import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, ArrowRight, Loader2, AlertCircle, X, Volume2, Compass, Layers, Zap } from 'lucide-react';
import { POPULAR_SUGGESTIONS } from '../data/mockData';
import { ExplanationLevel } from '../types';

interface HeroInputProps {
  onExplain: (query: string, level?: ExplanationLevel) => void;
  selectedLevel?: ExplanationLevel;
  onSelectLevel?: (level: ExplanationLevel) => void;
  isLoading?: boolean;
  loadingStep?: string;
}

export const HeroInput: React.FC<HeroInputProps> = ({ 
  onExplain, 
  selectedLevel = 'beginner',
  onSelectLevel,
  isLoading = false,
  loadingStep 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceTranscriptFeedback, setVoiceTranscriptFeedback] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  const depthLevels: { id: ExplanationLevel; label: string; icon: string; desc: string }[] = [
    { id: 'beginner', label: 'Beginner', icon: '🌱', desc: 'Simple language & everyday analogies' },
    { id: 'intermediate', label: 'Intermediate', icon: '⚙️', desc: 'System mechanisms & causal pipelines' },
    { id: 'deep_dive', label: 'Deep Dive', icon: '🔬', desc: 'Theoretical rigor, invariants & edge cases' },
  ];

  // Initialize Speech Recognition if supported in environment
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceError(null);
          setVoiceTranscriptFeedback('Listening... Speak your question clearly.');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setQuery(currentTranscript);
            setVoiceTranscriptFeedback(`Heard: "${currentTranscript}"`);
          }
          if (event.results[0] && event.results[0].isFinal) {
            setIsListening(false);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error event:', event.error);
          setIsListening(false);
          const errType = event.error;
          if (errType === 'not-allowed' || errType === 'service-not-allowed') {
            setVoiceError('Microphone access was denied. Please enable microphone permissions in your browser to use voice input.');
          } else if (errType === 'no-speech') {
            setVoiceError('No speech was detected. Please try clicking the microphone and speaking again.');
          } else if (errType === 'audio-capture') {
            setVoiceError('No microphone was found. Please ensure a microphone is connected.');
          } else if (errType === 'network') {
            setVoiceError('Network error occurred during speech recognition. Please check your connection.');
          } else {
            setVoiceError('Speech recognition encountered an issue. You can also type your question.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
        setVoiceSupported(false);
      }
    } else {
      setVoiceSupported(false);
    }
  }, []);

  const toggleListening = async () => {
    setVoiceError(null);

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
      setIsListening(false);
      return;
    }

    if (!voiceSupported || !recognitionRef.current) {
      setVoiceError('Voice recognition is not supported in this browser. Please type your question.');
      return;
    }

    // Check mediaDevices permission directly if available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release stream right away, recognition handles its own stream
        stream.getTracks().forEach(track => track.stop());
      } catch (permErr: any) {
        console.warn('Microphone permission check failed:', permErr);
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          setVoiceError('Microphone access was denied. Please allow microphone permissions in your browser to use voice input.');
          return;
        }
      }
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      console.warn('Error starting speech recognition:', err);
      setIsListening(false);
      if (err.name === 'InvalidStateError') {
        // Recognition is already running, stop and restart
        try {
          recognitionRef.current.stop();
        } catch {}
      } else {
        setVoiceError('Could not start microphone. Please check permissions or try typing.');
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;
    onExplain(query.trim(), selectedLevel);
  };

  const handleChipClick = (suggestion: string) => {
    setQuery(suggestion);
    onExplain(suggestion, selectedLevel);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Voice Error Notice */}
      {voiceError && (
        <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{voiceError}</span>
          </div>
          <button
            onClick={() => setVoiceError(null)}
            className="p-1 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg transition-colors shrink-0"
            aria-label="Dismiss voice error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Explanation Depth Selector */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>Depth Level:</span>
        </div>
        <div 
          role="radiogroup" 
          aria-label="Select explanation depth level"
          className="inline-flex p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs"
        >
          {depthLevels.map((lvl) => {
            const isSelected = selectedLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${lvl.label} depth: ${lvl.desc}`}
                onClick={() => onSelectLevel && onSelectLevel(lvl.id)}
                title={lvl.desc}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{lvl.icon}</span>
                <span>{lvl.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input container */}
      <form onSubmit={handleSubmit} className="relative" role="search" aria-label="Ask Explanation Tutor">
        <div 
          className={`relative rounded-2xl bg-white dark:bg-slate-900 transition-all duration-200 ${
            isFocused 
              ? 'ring-4 ring-indigo-500/15 border-indigo-600 dark:border-indigo-500 shadow-lg shadow-indigo-950/5 dark:shadow-indigo-950/30 -translate-y-0.5' 
              : 'border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center px-3.5 sm:px-4 py-2.5 sm:py-3 gap-2 sm:gap-3">
            {/* Left AI icon indicator */}
            <div className="text-indigo-600 dark:text-indigo-400 hidden sm:flex items-center justify-center pl-1 shrink-0" aria-hidden="true">
              <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>

            {/* Input field */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="What do you want to understand today? (e.g., Photosynthesis, APIs, Recursion...)"
              disabled={isLoading}
              maxLength={2000}
              aria-label="Enter concept or question to explain"
              className="flex-1 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent border-none focus:outline-none focus:ring-0 leading-normal"
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading}
              title={
                !voiceSupported 
                  ? 'Voice recognition not available in this browser' 
                  : isListening 
                  ? 'Stop listening' 
                  : 'Speak your question'
              }
              aria-label={isListening ? 'Stop voice input' : 'Speak your question with microphone'}
              aria-pressed={isListening}
              className={`relative p-2 sm:p-2.5 min-h-[44px] min-w-[44px] rounded-xl transition-all duration-150 flex items-center justify-center shrink-0 cursor-pointer ${
                !voiceSupported
                  ? 'text-slate-300 dark:text-slate-600 hover:text-slate-400'
                  : isListening
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 ring-2 ring-rose-400/40 animate-pulse'
                  : 'text-slate-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 active:scale-95'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400" />
                  <span className="absolute -top-7 px-2 py-0.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] rounded-md font-medium whitespace-nowrap shadow-xs">
                    Listening...
                  </span>
                </>
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Explain Submit Button */}
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              aria-label="Explain this topic"
              className={`group px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all duration-150 shrink-0 cursor-pointer ${
                !query.trim() || isLoading
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-sm shadow-indigo-200/80 dark:shadow-none hover:shadow-md'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span className="text-xs font-medium">
                    {loadingStep || 'Understanding…'}
                  </span>
                </div>
              ) : (
                <>
                  <span>Explain</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>

          {/* Active listening waveform indicator */}
          {isListening && (
            <div className="px-4 pb-2.5 pt-0.5 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium border-t border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 rounded-b-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span className="truncate max-w-xs sm:max-w-md">
                  {voiceTranscriptFeedback || 'Voice mode active: Speak naturally into your microphone...'}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <span className="w-1 h-3 bg-rose-400 rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-rose-500 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-2 bg-rose-400 rounded-full animate-pulse delay-150" />
                <span className="w-1 h-5 bg-rose-600 rounded-full animate-pulse delay-100" />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
          Try exploring:
        </span>
        {POPULAR_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => handleChipClick(suggestion)}
            className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150"
          >
            <Sparkles className="w-3 h-3 text-indigo-400 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
