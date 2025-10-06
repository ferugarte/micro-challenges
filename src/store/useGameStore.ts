// src/store/useGameStore.ts (personalizado con perfil e intereses)
import create from 'zustand';
import { isSameDay, startOfDay } from 'date-fns';
import localInterests from '../data/interests.json';
import localChallenges from '../data/challenges.json';

export type Challenge = {
  id: string;
  title: string;
  interest: string; // clave de intereses
  text: string;
  hint?: string;
  solution?: string;
  options?: string[];
  correct?: number;
};

type State = {
  // Contenido y filtro
  challenges: Challenge[];
  filtered: Challenge[];
  todaysId: string | null;

  // Perfil
  age: number | null;
  interests: string[];

  // Progreso
  solvedIds: string[];
  streak: number;
  points: number;
  solvedToday: boolean;
  lastSolvedAt?: string;

  // Métodos
  bootstrap: () => Promise<void>;
  setProfile: (age: number, interests: string[]) => void;
  getTodaysChallenge: () => Challenge | null;
  checkAnswer: (input: string) => boolean;
  checkOption: (index: number) => boolean;
  advanceToNext: () => void;
  advanceToRandom: () => void;
  randomizeToday: () => void;
};

function pickId(list: Challenge[]): string | null {
  if (!Array.isArray(list) || list.length === 0) return null;
  const idx = Math.floor((Date.now() / 86400000) % list.length);
  return list[idx].id;
}

function randomId(list: Challenge[], excludeId?: string | null) {
  const pool = excludeId ? list.filter(x => x.id !== excludeId) : list;
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

export const useGameStore = create<State>((set, get) => ({
  challenges: localChallenges as Challenge[],
  filtered: [],
  todaysId: null,
  age: null,
  interests: [],
  solvedIds: [],
  streak: 0,
  points: 0,
  solvedToday: false,
  lastSolvedAt: undefined,

  bootstrap: async () => {
    // Si ya hay perfil, filtramos según intereses
    const { age, interests } = get();
    const all = (localChallenges as Challenge[]);
    const filtered = (Array.isArray(interests) && interests.length >= 1)
      ? all.filter(c => interests.includes(c.interest))
      : all;
    const todays = pickId(filtered);
    set({ challenges: all, filtered, todaysId: todays });
  },

  setProfile: (age, interests) => {
    const all = (localChallenges as Challenge[]);
    const filtered = (Array.isArray(interests) && interests.length >= 1)
      ? all.filter(c => interests.includes(c.interest))
      : all;
    const todays = pickId(filtered);
    set({ age, interests, filtered, todaysId: todays, solvedToday: false });
  },

  getTodaysChallenge: () => {
    const { filtered, todaysId } = get();
    if (!todaysId) return null;
    return filtered.find(c => c.id === todaysId) ?? null;
  },

  checkAnswer: (input) => {
    const c = get().getTodaysChallenge();
    if (!c) return false;
    const expected = (c as any).solution ?? '';
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

  advanceToNext: () => {
    const { filtered, todaysId } = get();
    if (!filtered.length) return;
    const idx = Math.max(0, filtered.findIndex(c => c.id === todaysId));
    const next = filtered[(idx + 1) % filtered.length];
    if (next) set({ todaysId: next.id, solvedToday: false });
  },

  advanceToRandom: () => {
    const { filtered, todaysId } = get();
    const nextId = randomId(filtered, todaysId);
    if (nextId) set({ todaysId: nextId, solvedToday: false });
  },

  randomizeToday: () => {
    const { filtered } = get();
    const nextId = randomId(filtered);
    if (nextId) set({ todaysId: nextId, solvedToday: false });
  }
}));

export default useGameStore;
