import { create } from "zustand";

type ActivityResult = {
  id: string;
  correct?: boolean;         // para MC
  solution?: string;         // para abiertas
  timeSpentMs: number;
  ts: number;                // timestamp
  premium?: boolean;
};

type State = {
  lastActivityId: string | null;
  results: Record<string, ActivityResult>;
};

type Actions = {
  setLastActivity: (id: string) => void;
  saveResult: (res: ActivityResult) => void;
  reset: () => void;
};

const KEY = "apps_ninos_progress";

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { lastActivityId: null, results: {} };
}

function persist(s: State) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export const useProgress = create<State & Actions>((set, get) => ({
  ...load(),
  setLastActivity: (id) => {
    const s = { ...get(), lastActivityId: id };
    set(s); persist(s);
  },
  saveResult: (res) => {
    const results = { ...get().results, [res.id]: res };
    const s = { ...get(), results, lastActivityId: res.id };
    set(s); persist(s);
  },
  reset: () => {
    const s = { lastActivityId: null, results: {} };
    set(s); persist(s);
  }
}));