'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeakOptions {
  lang?: 'pt-BR' | 'en-US' | 'auto';
  rate?: number;
  pitch?: number;
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }

      // If already speaking, stop first
      if (isSpeakingRef.current) {
        stop();
        return;
      }

      window.speechSynthesis.cancel();

      if (!text || !text.trim()) return;

      // Clean markdown tags, code delimiters, backticks, asterisks, brackets
      const cleanText = text
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/__+/g, 'espaço')
        .replace(/[#*~_]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Auto-detect Portuguese vs English based on text content
      let targetLang = options.lang || 'auto';
      if (targetLang === 'auto') {
        const enIndicators =
          /\b(the|in|at|on|for|is|are|we|you|they|early|days|employees|what|which|function|return|const|let|var)\b/i;
        const ptIndicators =
          /\b(o|a|os|as|em|no|na|de|do|da|que|qual|como|para|monte|organize|código|variáveis|função|lição|leia|responda)\b/i;

        const enMatches = (cleanText.match(enIndicators) || []).length;
        const ptMatches = (cleanText.match(ptIndicators) || []).length;

        targetLang = enMatches > ptMatches ? 'en-US' : 'pt-BR';
      }

      utterance.lang = targetLang;
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.05;

      // Try selecting the best native voice available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find((v) =>
          targetLang === 'en-US'
            ? v.lang.startsWith('en')
            : v.lang.startsWith('pt') || v.lang.includes('BR') || v.lang.includes('PT')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [stop]
  );

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, stop, isSpeaking, isSupported };
}
