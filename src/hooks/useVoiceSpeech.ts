import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceSettings, VoiceSentence, VoiceModeState } from '../types';

interface UseVoiceSpeechOptions {
  onAutoSubmitTranscript?: (transcript: string) => void;
  voiceSettings: VoiceSettings;
}

export function useVoiceSpeech({ onAutoSubmitTranscript, voiceSettings }: UseVoiceSpeechOptions) {
  const [isSupported, setIsSupported] = useState(true);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(-1);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);
  const speakingQueueRef = useRef<VoiceSentence[]>([]);
  const currentSentenceIdxRef = useRef<number>(-1);
  const animFrameRef = useRef<number | null>(null);
  const transcriptBufferRef = useRef<string>('');

  // 1. Populate SpeechSynthesis Voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // 2. Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setMicError('Speech recognition is not supported in this browser. You can type using the text input below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setMicError(null);
        setHasMicPermission(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const combinedText = (final + ' ' + interim).trim();
        setInterimTranscript(combinedText);

        if (combinedText.length > 0) {
          transcriptBufferRef.current = combinedText;
          // Reset silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          if (!voiceSettings.pushToTalk) {
            silenceTimerRef.current = setTimeout(() => {
              if (transcriptBufferRef.current.trim().length > 0 && onAutoSubmitTranscript) {
                const textToSubmit = transcriptBufferRef.current.trim();
                transcriptBufferRef.current = '';
                setInterimTranscript('');
                onAutoSubmitTranscript(textToSubmit);
              }
            }, voiceSettings.autoStopSilenceMs || 2400);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setHasMicPermission(false);
          setMicError('Microphone access blocked. Check permissions or use the text box below.');
          setIsListening(false);
          isListeningRef.current = false;
        } else if (event.error === 'network') {
          setMicError('Speech service connection issue. You can use the text box below.');
        }
      };

      recognition.onend = () => {
        // Auto restart if user intended to keep listening and not actively speaking
        if (isListeningRef.current && !voiceSettings.pushToTalk) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      console.warn('Error initializing SpeechRecognition:', err);
      setIsSupported(false);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [voiceSettings.pushToTalk, voiceSettings.autoStopSilenceMs, onAutoSubmitTranscript]);

  // 3. Audio level simulation loop (smooth reactive waveform / orb pulsation)
  useEffect(() => {
    let phase = 0;
    const updateAudioLevel = () => {
      phase += 0.12;
      if (isSpeaking) {
        // Dynamic speaking wave amplitude
        const base = Math.sin(phase) * 0.4 + 0.6;
        const jitter = Math.sin(phase * 2.7) * 0.2;
        setAudioLevel(Math.min(1, Math.max(0.2, base + jitter)));
      } else if (isListening) {
        // Responsive listening pulse
        const pulse = (Math.sin(phase * 0.8) + 1) * 0.25 + (interimTranscript.length > 0 ? 0.35 : 0.1);
        setAudioLevel(Math.min(1, pulse));
      } else {
        setAudioLevel(0);
      }
      animFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    animFrameRef.current = requestAnimationFrame(updateAudioLevel);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpeaking, isListening, interimTranscript]);

  // 4. Start Listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    // Stop any ongoing speech first
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActiveSentenceIndex(-1);
    setInterimTranscript('');
    transcriptBufferRef.current = '';

    try {
      isListeningRef.current = true;
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // Already running
    }
  }, []);

  // 5. Stop Listening
  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  // 6. Speak Sentences Sequentially (Sentence-by-sentence TTS chunking)
  const speakSentences = useCallback((
    sentences: VoiceSentence[],
    onFinished?: () => void
  ) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onFinished?.();
      return;
    }

    // Stop listening while speaking to prevent echo/feedback
    stopListening();
    window.speechSynthesis.cancel();

    if (!sentences || sentences.length === 0) {
      onFinished?.();
      return;
    }

    speakingQueueRef.current = [...sentences];
    setIsSpeaking(true);

    const speakIndex = (index: number) => {
      if (index >= speakingQueueRef.current.length) {
        setIsSpeaking(false);
        setActiveSentenceIndex(-1);
        currentSentenceIdxRef.current = -1;
        onFinished?.();
        return;
      }

      currentSentenceIdxRef.current = index;
      setActiveSentenceIndex(index);

      const sentenceItem = speakingQueueRef.current[index];
      const cleanText = sentenceItem.text.replace(/[*#_`\[\]()]/g, '').trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = voiceSettings.rate || 0.95;
      utterance.pitch = voiceSettings.pitch || 1.0;
      utterance.volume = 1.0;

      // Select voice
      const voices = window.speechSynthesis.getVoices();
      if (voiceSettings.voiceName && voices.length > 0) {
        const found = voices.find(v => v.name === voiceSettings.voiceName);
        if (found) utterance.voice = found;
      } else if (voices.length > 0) {
        // Prefer natural / Google US English voice
        const preferred = voices.find(v => 
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural')) && v.lang.startsWith('en')
        ) || voices.find(v => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;
      }

      utterance.onend = () => {
        speakIndex(index + 1);
      };

      utterance.onerror = (e: any) => {
        console.warn('SpeechSynthesis error on sentence:', e);
        speakIndex(index + 1);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakIndex(0);
  }, [stopListening, voiceSettings]);

  // 7. Interrupt: instantly stops TTS and immediately returns to listening
  const interrupt = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    speakingQueueRef.current = [];
    currentSentenceIdxRef.current = -1;
    setIsSpeaking(false);
    setActiveSentenceIndex(-1);

    // Immediately start listening for user input
    startListening();
  }, [startListening]);

  // 8. Stop Everything
  const stopAll = useCallback(() => {
    stopListening();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    speakingQueueRef.current = [];
    setIsSpeaking(false);
    setActiveSentenceIndex(-1);
    setInterimTranscript('');
  }, [stopListening]);

  return {
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
  };
}
