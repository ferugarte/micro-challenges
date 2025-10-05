import { create } from 'zustand';
import challenges from '../data/challenges.json';
import { startOfDay, isSameDay } from 'date-fns';

type Challenge = typeof challenges[number];

type State = {
  todaysId: string;
  solvedIds: string[];
  streak: number;
  premium: boolean;
  lastSolvedAt?: string;
  getTodaysChallenge: () => Challenge;
  checkAnswer: (input: string) => boolean;
  setPremium: (v: boolean) => void;
};

const pickToday = () => {
  const idx = Math.floor((Date.now() / 86400000) % challenges.length);
  return challenges[idx].id;
};

export const useGameStore = create<State>((set, get) => ({
  todaysId: pickToday(),
  solvedIds: [],
  streak: 0,
  premium: false, // ensure boolean
  getTodaysChallenge: () => challenges.find(c => c.id === get().todaysId)!,
  setPremium: (v) => set({ premium: v }),
  checkAnswer: (input) => {
    const c = get().getTodaysChallenge();
    const ok = input.trim().toLowerCase() === c.answer.trim().toLowerCase();
    if (!ok) return false;
    const now = new Date();
    const { lastSolvedAt, solvedIds, streak } = get();
    const yesterday = new Date(now.getTime() - 86400000);
    const newStreak = lastSolvedAt
      ? (isSameDay(startOfDay(new Date(lastSolvedAt)), startOfDay(yesterday)) ? streak + 1
        : isSameDay(startOfDay(new Date(lastSolvedAt)), startOfDay(now)) ? streak
        : 1)
      : 1;
    set({ solvedIds: [...solvedIds, c.id], streak: newStreak, lastSolvedAt: now.toISOString() });
    return true;
  }
}));
