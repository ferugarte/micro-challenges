import { create } from 'zustand';
import localChallenges from '../data/challenges.json';
import { startOfDay, isSameDay } from 'date-fns';
import { fetchChallenges } from '../services/remoteContent';

type Challenge = typeof localChallenges[number];

type State = {
  challenges: Challenge[];
  todaysId: string;
  solvedIds: string[];
  streak: number;
  premium: boolean;
  lastSolvedAt?: string;
  bootstrap: () => Promise<void>;
  getTodaysChallenge: () => Challenge;
  checkAnswer: (input: string) => boolean;
  setPremium: (v: boolean) => void;
};

const pickToday = (list: Challenge[]) => {
  const idx = Math.floor((Date.now() / 86400000) % list.length);
  return list[idx].id;
};

export const useGameStore = create<State>((set, get) => ({
  challenges: localChallenges,
  todaysId: pickToday(localChallenges),
  solvedIds: [],
  streak: 0,
  premium: false,

  async bootstrap() {
    try {
      const remote = await fetchChallenges(get().premium);
      if (Array.isArray(remote) && remote.length > 0) {
        const merged = dedupeById([...localChallenges, ...remote]);
        set({ challenges: merged, todaysId: pickToday(merged) });
      }
    } catch {
      set({ challenges: localChallenges, todaysId: pickToday(localChallenges) });
    }
  },

  getTodaysChallenge: () => {
    const { challenges, todaysId } = get();
    return challenges.find(c => c.id === todaysId)!;
  },

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

function dedupeById<T extends {id:string}>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    if (!seen.has(item.id)) { seen.add(item.id); out.push(item); }
  }
  return out;
}
