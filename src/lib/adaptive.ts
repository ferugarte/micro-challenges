export type Perf = { correct: boolean; timeMs: number };

import { getActivity } from "@/lib/activities";
import free from "@/data/free.json";
import premium from "@/data/premium.json";

const ALL: any[] = [...(free as any[]), ...(premium as any[])];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Suggest an activity from the SAME interest and nearest difficulty to target.
 * Returns a different ID than current if possible; otherwise null.
 */
export function suggestNextActivity(currentId: string, perf: Perf): string | null {
  const cur = getActivity(currentId) as any;
  if (!cur) return null;

  const interest = cur.interest;
  const curDiff = cur.difficulty ?? 2; // 1..5 expected
  const delta = perf.correct ? (perf.timeMs < 30000 ? 1 : 0) : -1;
  const target = clamp(curDiff + delta, 1, 5);

  const pool = ALL
    .filter((a) => a.interest === interest)
    .filter((a) => a.id !== currentId)
    .sort((a, b) => {
      const da = Math.abs((a.difficulty ?? 2) - target);
      const db = Math.abs((b.difficulty ?? 2) - target);
      return da - db;
    });

  return pool[0]?.id ?? null;
}

/**
 * Convenience: given a list of candidate IDs, prefer ones close to target difficulty.
 */
export function rankByAdaptiveTarget(ids: string[], targetDifficulty = 3): string[] {
  const map = new Map(ALL.map((a) => [a.id, a] as const));
  return [...ids].sort((idA, idB) => {
    const a = map.get(idA);
    const b = map.get(idB);
    const da = Math.abs(((a?.difficulty ?? 2) as number) - targetDifficulty);
    const db = Math.abs(((b?.difficulty ?? 2) as number) - targetDifficulty);
    return da - db;
  });
}