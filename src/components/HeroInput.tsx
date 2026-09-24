import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { POPULAR_SUGGESTIONS } from '../data/mockData';

interface HeroInputProps {
  onExplain: (query: string) => void;
  isLoading?: boolean;
  loadingStep?: string;
}

export const HeroInput: React.FC<HeroInputProps> = ({ 
  onExplain, 
  isLoading = false,
  loadingStep 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;
    onExplain(query.trim());
  };

  const handleChipClick = (suggestion: string) => {
    setQuery(suggestion);
    onExplain(suggestion);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Input container */}
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className={`relative rounded-2xl bg-white transition-all duration-200 ${
            isFocused 
              ? 'ring-4 ring-indigo-500/12 border-indigo-600 shadow-lg shadow-indigo-950/5 -translate-y-0.5' 
              : 'border border-slate-200/90 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="flex items-center px-3.5 sm:px-4 py-2.5 sm:py-3 gap-2 sm:gap-3">
            {/* Left AI icon indicator */}
            <div className="text-indigo-600 hidden sm:flex items-center justify-center pl-1 shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-500" />
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
              className="flex-1 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent border-none focus:outline-none focus:ring-0 leading-normal"
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading || !voiceSupported}
              title={
                !voiceSupported 
                  ? 'Voice recognition is not supported in this browser' 
                  : isListening 
                  ? 'Stop listening' 
                  : 'Speak your question'
              }
              className={`relative p-2 sm:p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center shrink-0 ${
                !voiceSupported
                  ? 'text-slate-300 cursor-not-allowed'
                  : isListening
                  ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-400/40 animate-pulse'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/80 active:scale-95'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute -top-7 px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded-md font-medium whitespace-nowrap shadow-xs">
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
              className={`group px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all duration-150 shrink-0 ${
                !query.trim() || isLoading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-sm shadow-indigo-200/80 hover:shadow-md'
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
            <div className="px-4 pb-2.5 pt-0.5 flex items-center gap-2 text-xs text-rose-600 font-medium border-t border-rose-100">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Voice mode active: Speak naturally into your microphone...</span>
              <div className="flex items-center gap-1 ml-auto">
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
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
          Try exploring:
        </span>
        {POPULAR_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => handleChipClick(suggestion)}
            className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-700 bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/40 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150"
          >
            <Sparkles className="w-3 h-3 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
