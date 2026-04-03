import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * useTTS — Text-to-Speech hook using Web Speech API (SpeechSynthesis)
 *
 * Handles:
 * - Speaking, pausing, resuming, stopping
 * - Voice and rate selection
 * - Word-level tracking for highlighting
 * - Sentence-level tracking
 * - Long text chunking (Chrome ~15 second limit)
 * - Browser compatibility
 */
export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentWord, setCurrentWord] = useState(-1);
  const [currentSentence, setCurrentSentence] = useState(-1);
  const [voices, setVoices] = useState([]);

  const ttsSpeed = useSettingsStore(s => s.ttsSpeed);
  const ttsVoice = useSettingsStore(s => s.ttsVoice);
  const ttsHighlight = useSettingsStore(s => s.ttsHighlight);

  const synth = useRef(window.speechSynthesis);
  const currentTextRef = useRef('');
  const wordsRef = useRef([]);
  const sentencesRef = useRef([]);
  const currentChunkRef = useRef(0);
  const chunksRef = useRef([]);
  const utterancesRef = useRef([]);

  // Parse speed setting ('0.5x' → 0.5)
  const getRate = useCallback(() => {
    const rateMap = {
      '0.5x': 0.5,
      '0.75x': 0.75,
      '1x': 1.0,
      '1.25x': 1.25,
      '1.5x': 1.5,
      '2x': 2.0,
    };
    return rateMap[ttsSpeed] || 1.0;
  }, [ttsSpeed]);

  // Load available voices
  useEffect(() => {
    if (!synth.current) return;

    const loadVoices = () => {
      const availableVoices = synth.current.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    synth.current.onvoiceschanged = loadVoices;

    return () => {
      if (synth.current) {
        synth.current.onvoiceschanged = null;
      }
    };
  }, []);

  // Split text into words for highlighting
  const parseWords = useCallback((text) => {
    // Split on whitespace, preserve index
    const words = [];
    let currentPos = 0;
    const wordRegex = /\S+/g;
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
      words.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return words;
  }, []);

  // Split text into sentences
  const parseSentences = useCallback((text) => {
    // Match sentence endings with some context
    const sentenceRegex = /[^.!?]*[.!?]+/g;
    const sentences = [];
    let match;

    while ((match = sentenceRegex.exec(text)) !== null) {
      sentences.push({
        text: match[0].trim(),
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return sentences.length > 0 ? sentences : [{ text, start: 0, end: text.length }];
  }, []);

  // Split long text into chunks (~200 words) to bypass Chrome 15-second limit
  const chunkText = useCallback((text, wordsPerChunk = 200) => {
    const words = text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
    }

    return chunks.length > 0 ? chunks : [text];
  }, []);

  const speak = useCallback((text) => {
    if (!synth.current) return;

    // Stop any ongoing speech
    stop();

    currentTextRef.current = text;
    wordsRef.current = parseWords(text);
    sentencesRef.current = parseSentences(text);
    chunksRef.current = chunkText(text);
    currentChunkRef.current = 0;
    utterancesRef.current = [];

    setSpeaking(true);
    setPaused(false);

    // Find the selected voice
    const selectedVoice = voices.find(v =>
      ttsVoice === 'system' ? v.default : v.voiceURI === ttsVoice
    );

    const playChunk = (chunkIndex) => {
      if (chunkIndex >= chunksRef.current.length) {
        setSpeaking(false);
        setCurrentWord(-1);
        setCurrentSentence(-1);
        return;
      }

      const chunkText = chunksRef.current[chunkIndex];
      const utterance = new SpeechSynthesisUtterance(chunkText);

      utterance.rate = getRate();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Track word boundaries for highlighting
      if (ttsHighlight) {
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            // Find which word in the full text we're on
            const charIndex = event.charIndex;
            const fullIndex = chunksRef.current
              .slice(0, chunkIndex)
              .join(' ')
              .length + (chunkIndex > 0 ? chunkIndex : 0) + charIndex;

            const wordIndex = wordsRef.current.findIndex(
              w => w.start <= fullIndex && fullIndex < w.end
            );
            if (wordIndex !== -1) {
              setCurrentWord(wordIndex);
            }

            // Also track sentence
            const sentenceIndex = sentencesRef.current.findIndex(
              s => s.start <= fullIndex && fullIndex < s.end
            );
            if (sentenceIndex !== -1) {
              setCurrentSentence(sentenceIndex);
            }
          }
        };
      }

      // Chain to next chunk when this one ends
      utterance.onend = () => {
        playChunk(chunkIndex + 1);
      };

      utterance.onerror = (event) => {
        console.warn('Speech synthesis error:', event);
        setSpeaking(false);
      };

      utterancesRef.current.push(utterance);
      synth.current.speak(utterance);
    };

    playChunk(0);
  }, [parseWords, parseSentences, chunkText, getRate, ttsVoice, ttsHighlight, voices]);

  const pause = useCallback(() => {
    if (!synth.current) return;
    if (synth.current.speaking && !synth.current.paused) {
      synth.current.pause();
      setPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (!synth.current) return;
    if (synth.current.paused) {
      synth.current.resume();
      setPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (!synth.current) return;
    synth.current.cancel();
    setSpeaking(false);
    setPaused(false);
    setCurrentWord(-1);
    setCurrentSentence(-1);
    utterancesRef.current = [];
  }, []);

  const setVoice = useCallback((voiceURI) => {
    // Voice will be applied on next speak()
    useSettingsStore.setState({ ttsVoice: voiceURI });
  }, []);

  const setRate = useCallback((rate) => {
    // Rate string like '1x', '1.5x', etc.
    useSettingsStore.setState({ ttsSpeed: rate });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synth.current) {
        synth.current.cancel();
      }
    };
  }, []);

  return {
    speaking,
    paused,
    currentWord,
    currentSentence,
    speak,
    pause,
    resume,
    stop,
    voices,
    setVoice,
    setRate,
  };
}
