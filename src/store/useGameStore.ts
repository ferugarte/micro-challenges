// src/store/useGameStore.ts (perfil niño/mentor + edad/intereses/objetivos)
import create from 'zustand';
import { isSameDay, startOfDay } from 'date-fns';
import localChallenges from '../data/challenges.json';

// ---- Tipos de contenido ----
export type Challenge = {
  id: string;
  title: string;
  interest: string; // clave de intereses
  text: string;
  hint?: string;
  // Para preguntas abiertas
  solution?: string;
  // Para opción múltiple
  options?: string[];
  correct?: number;
  // Metadatos para segmentación (opcionales en JSON)
  audience?: 'user' | 'mentor' | 'both';
  ageMin?: number;
  ageMax?: number;
  difficulty?: number;
  premium?: boolean;
};

type State = {
  // Contenido
  challenges: Challenge[];
  todaysId: string | null;

  // Perfil
  role?: 'user' | 'mentor';
  age: number | null;          // edad del usuario (o null si no aplica)
  interests: string[];         // intereses del niño (modo user)
  objectives: string[];        // objetivos del mentor (modo mentor)

  // Progreso
  solvedIds: string[];
  streak: number;
  points: number;
  solvedToday: boolean;
  lastSolvedAt?: string;

  // Métodos
  bootstrap: () => Promise<void>;
  setProfile: (age: number | null, interests: string[] | null, role?: 'user' | 'mentor', objectives?: string[] | null) => void;
  getTodaysChallenge: () => Challenge | null;
  checkAnswer: (input: string) => boolean;
  checkOption: (index: number) => boolean;
  advanceToNext: () => void;
  advanceToRandom: () => void;
  randomizeToday: () => void;
};

// ---- Utilidades ----
const objectiveInterestMap: Record<string, string[]> = {
  attention_focus:     ['math_basic','sports','art','videogames','music','animals'],
  memory:              ['memory','language','music','history','geo'],
  reasoning:           ['logic','math_basic','tech','social'],
  emotion_regulation:  ['social','health','sports','art','music'],
  executive_functions: ['math_basic','tech','videogames','social','sports']
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

// Filtro para modo mentor (edad + objetivos → intereses mapeados)
function filterForMentor(challenges: Challenge[], age?: number | null, objectives: string[] = []) {
  if (!Array.isArray(challenges) || challenges.length === 0) return [];
  const allowedInterests = new Set<string>(
    objectives.flatMap(obj => objectiveInterestMap[obj] ?? [])
  );

  // 1) estricto: audience mentor/both + edad + interés permitido
  let pool = challenges.filter(ch => {
    const okAudience = ch.audience === 'mentor' || ch.audience === 'both';
    const okAge = typeof age === 'number'
      ? (typeof ch.ageMin === 'number' ? age >= ch.ageMin : true) &&
        (typeof ch.ageMax === 'number' ? age <= ch.ageMax : true)
      : true;
    const okInterest = allowedInterests.size > 0 ? allowedInterests.has(ch.interest) : true;
    return okAudience && okAge && okInterest;
  });

  // 2) sin interés (mantiene audience+edad)
  if (pool.length === 0) {
    pool = challenges.filter(ch => {
      const okAudience = ch.audience === 'mentor' || ch.audience === 'both';
      const okAge = typeof age === 'number'
        ? (typeof ch.ageMin === 'number' ? age >= ch.ageMin : true) &&
          (typeof ch.ageMax === 'number' ? age <= ch.ageMax : true)
        : true;
      return okAudience && okAge;
    });
  }

  // 3) solo audience
  if (pool.length === 0) {
    pool = challenges.filter(ch => ch.audience === 'mentor' || ch.audience === 'both');
  }

  // 4) último recurso
  if (pool.length === 0) pool = challenges;
  return pool;
}

// Filtro para modo user (edad + intereses)
function filterForUser(challenges: Challenge[], age?: number | null, interests: string[] = []) {
  let pool = challenges.filter(ch => {
    const okAudience = ch.audience === 'user' || ch.audience === 'both' || !ch.audience;
    const okAge = typeof age === 'number'
      ? (typeof ch.ageMin === 'number' ? age >= ch.ageMin : true) &&
        (typeof ch.ageMax === 'number' ? age <= ch.ageMax : true)
      : true;
    const okInterest = Array.isArray(interests) && interests.length > 0
      ? interests.includes(ch.interest)
      : true;
    return okAudience && okAge && okInterest;
  });
  if (pool.length === 0) pool = challenges; // fallback suave
  return pool;
}

// ---- Store ----
export const useGameStore = create<State>((set, get) => ({
  challenges: (localChallenges as Challenge[]),
  todaysId: null,

  role: undefined,
  age: null,
  interests: [],
  objectives: [],

  solvedIds: [],
  streak: 0,
  points: 0,
  solvedToday: false,
  lastSolvedAt: undefined,

  bootstrap: async () => {
    // Solo prepara un "todaysId" inicial neutro (sin saber perfil aún)
    const all = (localChallenges as Challenge[]);
    const todays = pickId(all);
    set({ challenges: all, todaysId: todays });
  },

  setProfile: (age, interests, role, objectives) => {
    const all = (localChallenges as Challenge[]);
    const theRole = role ?? 'user';
    const theAge = typeof age === 'number' ? age : null;
    const theInterests = Array.isArray(interests) ? interests : [];
    const theObjectives = Array.isArray(objectives) ? objectives : [];

    // Construir pool según rol
    const pool = theRole === 'mentor'
      ? filterForMentor(all, theAge, theObjectives)
      : filterForUser(all, theAge, theInterests);

    const todays = pickId(pool);
    set({
      role: theRole,
      age: theAge,
      interests: theInterests,
      objectives: theObjectives,
      todaysId: todays,
      solvedToday: false
    });
  },

  getTodaysChallenge: () => {
    const s = get();
    const { role, age, objectives, interests, challenges, todaysId } = s;

    let pool = role === 'mentor'
      ? filterForMentor(challenges, age, objectives)
      : filterForUser(challenges, age, interests);

    // si el todaysId ya no está en el pool, elegir uno del pool
    const current = pool.find(c => c.id === todaysId);
    if (current) return current;

    const pick = pool[Math.floor(Math.random() * pool.length)];
    return pick ?? (challenges[0] as any);
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
    const s = get();
    const { role, age, objectives, interests, challenges, todaysId } = s;

    const pool = role === 'mentor'
      ? filterForMentor(challenges, age, objectives)
      : filterForUser(challenges, age, interests);

    if (pool.length === 0) return;
    const i = Math.max(0, pool.findIndex(c => c.id === todaysId));
    const next = pool[(i + 1) % pool.length];
    set({ todaysId: next.id, solvedToday: false });
  },

  advanceToRandom: () => {
    const s = get();
    const { role, age, objectives, interests, challenges, todaysId } = s;

    const pool = role === 'mentor'
      ? filterForMentor(challenges, age, objectives)
      : filterForUser(challenges, age, interests);

    const nextId = randomId(pool, todaysId);
    if (nextId) set({ todaysId: nextId, solvedToday: false });
  },

  randomizeToday: () => {
    const s = get();
    const { role, age, objectives, interests, challenges } = s;

    const pool = role === 'mentor'
      ? filterForMentor(challenges, age, objectives)
      : filterForUser(challenges, age, interests);

    const nextId = randomId(pool);
    if (nextId) set({ todaysId: nextId, solvedToday: false });
  }
}));

export default useGameStore;
