// src/store/useGameStore.ts
import create from 'zustand';
import { isSameDay, startOfDay } from 'date-fns';
// Local fallback types/helpers (remplaza a ../data/types y ../utils)
export type Challenge = {
  id: string;
  title: string;
  category?: string;
  text: string;
  hint?: string;
  solution?: string;
  answer?: string; // por compatibilidad
  options?: string[]; // para selección múltiple
  correct?: number;   // índice correcto en options
};

function pickToday(list: Challenge[]): string | null {
  if (!Array.isArray(list) || list.length === 0) return null;
  const idx = Math.floor((Date.now() / 86400000) % list.length);
  return list[idx].id;
}

type State = {
  challenges: Challenge[];
  todaysId: string | null;
  solvedIds: string[];
  streak: number;
  points: number;
  solvedToday: boolean;
  premium: boolean;
  lastSolvedAt?: string;
  bootstrap: () => Promise<void>;
  getTodaysChallenge: () => Challenge;
  checkAnswer: (input: string) => boolean;
  setPremium: (v: boolean) => void;
  advanceToNext: () => void;
  advanceToRandom: () => void;
  randomizeToday: () => void;
};

const useGameStore = create<State>((set, get) => ({
  challenges: [],
  todaysId: null,
  solvedIds: [],
  streak: 0,
  points: 0,
  solvedToday: false,
  premium: false,
  lastSolvedAt: undefined,

  bootstrap: async () => {
    try {
      const localChallenges: Challenge[] = require('../data/challenges.json');
      const todays = pickToday(localChallenges);
      set({ challenges: localChallenges, todaysId: todays });
      const ls = get().lastSolvedAt;
      if (ls) {
        const today = startOfDay(new Date());
        const last = startOfDay(new Date(ls));
        set({ solvedToday: isSameDay(today, last) });
      }
    } catch {
      set({ challenges: [], todaysId: null, solvedToday: false });
    }
  },

  getTodaysChallenge: () => {
    const { challenges, todaysId } = get();
    return (challenges.find(c => c.id === todaysId) as Challenge) ?? ({} as Challenge);
  },

  checkAnswer: (input) => {
    const c = get().getTodaysChallenge();
    const expected = (c as any).solution ?? (c as any).answer ?? '';
    const ok = String(input).trim().toLowerCase() === String(expected).trim().toLowerCase();
    if (!ok) return false;
    const now = new Date();
    const { lastSolvedAt, solvedIds, streak, points } = get();
    const yesterday = new Date(now.getTime() - 86400000);
    const newStreak = lastSolvedAt
      ? (isSameDay(startOfDay(new Date(lastSolvedAt)), startOfDay(yesterday)) ? streak + 1
        : isSameDay(startOfDay(new Date(lastSolvedAt)), startOfDay(now)) ? streak
        : 1)
      : 1;
    set({
      solvedIds: [...solvedIds, c.id],
      streak: newStreak,
      lastSolvedAt: now.toISOString(),
      points: points + 10,
      solvedToday: true,
    });
    return true;
  },

  checkOption: (index) => {
    const c = get().getTodaysChallenge();
    if (!c || !Array.isArray(c.options) || typeof c.correct !== 'number') return false;
    const ok = index === c.correct;
    if (!ok) return false;
    const now = new Date();
    const { lastSolvedAt, solvedIds, streak, points } = get();
    const yesterday = new Date(now.getTime() - 86400000);
    const newStreak = lastSolvedAt
      ? (isSameDay(startOfDay(new Date(lastSolvedAt)), startOfDay(yesterday)) ? streak + 1
        : isSameDay(startOfDay(new Date(lastSolvedAt)), startOfDay(now)) ? streak
        : 1)
      : 1;
    set({
      solvedIds: [...solvedIds, c.id],
      streak: newStreak,
      lastSolvedAt: now.toISOString(),
      points: points + 10,
      solvedToday: true,
    });
    return true;
  },

  setPremium: (v) => set({ premium: v }),

  advanceToNext: () => {
    const { challenges, todaysId } = get();
    if (!Array.isArray(challenges) || challenges.length === 0) return;
    const idx = Math.max(0, challenges.findIndex(c => c.id === todaysId));
    const next = challenges[(idx + 1) % challenges.length];
    if (next) set({ todaysId: next.id, solvedToday: false });
  },

  advanceToRandom: () => {
    const { challenges, todaysId } = get();
    if (!Array.isArray(challenges) || challenges.length === 0) return;
    const pool = challenges.filter(c => c.id !== todaysId);
    if (pool.length === 0) return;
    const next = pool[Math.floor(Math.random() * pool.length)];
    set({ todaysId: next.id, solvedToday: false });
  },

  randomizeToday: () => {
    const { challenges } = get();
    if (!Array.isArray(challenges) || challenges.length === 0) return;
    const next = challenges[Math.floor(Math.random() * challenges.length)];
    set({ todaysId: next.id, solvedToday: false });
  }
}));

export default useGameStore;
