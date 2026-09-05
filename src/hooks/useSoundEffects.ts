'use client';

import { useCallback } from 'react';

export type SoundType =
  | 'post'
  | 'like'
  | 'levelup'
  | 'quiz_correct'
  | 'quiz_incorrect'
  | 'lesson_completed'
  | 'task_completed'
  | 'xpgain'
  | 'bookmark'
  | 'send_dm'
  | 'notification';

// Cache global para elementos de áudio pré-carregados e AudioBuffers
const audioCache: Map<string, HTMLAudioElement> = new Map();
const audioBufferCache: Map<string, AudioBuffer> = new Map();
let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      globalAudioCtx = new AudioCtx();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    void globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

// Pré-decodifica arquivo de áudio diretamente para a memória RAM (latência 0ms)
async function preloadAndDecode(file: string) {
  const ctx = getAudioContext();
  if (!ctx || audioBufferCache.has(file)) return;
  try {
    const res = await fetch(`/sounds/${file}`);
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    audioBufferCache.set(file, audioBuffer);
  } catch {
    // fallback para HTML5 Audio
  }
}

// Toca áudio instantâneo decodificado em memória PCM
function playInstantBuffer(file: string): boolean {
  const ctx = getAudioContext();
  if (!ctx) return false;
  const buffer = audioBufferCache.get(file);
  if (buffer) {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    return true;
  }
  void preloadAndDecode(file);
  return false;
}

// Acorde maior estilo Duolingo instantâneo (latência 0ms) via Web Audio API
function playInstantCorrectChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Nota 1: E5 (659.25 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(659.25, now);
  gain1.gain.setValueAtTime(0.25, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.14);

  // Nota 2: A5 (880.00 Hz) - Brilho triunfante
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(880, now + 0.07);
  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.setValueAtTime(0.35, now + 0.07);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.07);
  osc2.stop(now + 0.35);

  // Harmônico superior: E6 (1318.51 Hz) para brilho de sino
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(1318.51, now + 0.08);
  gain3.gain.setValueAtTime(0.001, now);
  gain3.gain.setValueAtTime(0.12, now + 0.08);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
  osc3.connect(gain3);
  gain3.connect(ctx.destination);
  osc3.start(now + 0.08);
  osc3.stop(now + 0.28);
}

// Efeito sonoro instantâneo para resposta incorreta
function playInstantIncorrectBuzz() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(220, now);
  osc1.frequency.linearRampToValueAtTime(160, now + 0.2);
  gain1.gain.setValueAtTime(0.2, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.2);
}

const SOUND_FILES: Record<SoundType, string> = {
  post: 'Post_Sound.ogg',
  like: 'Like_sound.mp3',
  levelup: 'LevelUp_Sound.mp3',
  quiz_correct: 'RightAnswer_Sound.mp3',
  quiz_incorrect: 'WrongAnswer_Sound.mp3',
  lesson_completed: 'LessonComplete_Sound.mp3',
  task_completed: 'LessonComplete_Sound.mp3',
  xpgain: 'XpGain_Sound.mp3',
  bookmark: 'bookmark_Sound.mp3',
  send_dm: 'SendDM_Sound.ogg',
  notification: 'Notification_Sound.ogg',
};

function getPreloadedAudio(file: string): HTMLAudioElement {
  let audio = audioCache.get(file);
  if (!audio) {
    audio = new Audio(`/sounds/${file}`);
    audio.preload = 'auto';
    audioCache.set(file, audio);
  }
  return audio;
}

/**
 * Plays a short, explicit confirmation sound regardless of the saved sound
 * preference. Settings uses this from the same click that changes the setting,
 * so people can hear what enabling or disabling platform effects means.
 */
export function playSoundPreview(type: SoundType = 'notification') {
  if (typeof window === 'undefined') return;

  if (type === 'quiz_correct') {
    playInstantCorrectChime();
    return;
  }

  if (type === 'quiz_incorrect') {
    playInstantIncorrectBuzz();
    return;
  }

  const file = SOUND_FILES[type];
  if (!file) return;

  const played = playInstantBuffer(file);
  if (played) return;

  try {
    const audio = getPreloadedAudio(file);
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // The browser can reject playback in restrictive embedded contexts.
    });
  } catch {
    // Keep the setting itself functional even if the browser cannot create audio.
  }
}

export function useSoundEffects(enabled: boolean = false) {
  const playSound = useCallback(
    (type: SoundType) => {
      if (!enabled) return;

      playSoundPreview(type);
    },
    [enabled]
  );

  return { playSound };
}
