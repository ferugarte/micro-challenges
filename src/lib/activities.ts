import free from "@/data/free.json";
import premium from "@/data/premium.json";

export type Activity = {
  id: string;
  title: string;
  interest: string;
  text: string;
  hint?: string;
  options?: string[];
  correct?: number;
  solution?: string; // respuesta esperada para abiertas (puede ser ejemplo/placeholder)
  premium?: boolean;
  ageMin?: number;
  ageMax?: number;
  difficulty?: number;
  objective_id?: string;
};

const INDEX: Record<string, Activity> = {};
[...free, ...premium].forEach((a: any) => INDEX[a.id] = a);

export function getActivity(id: string): Activity | null {
  return INDEX[id] ?? null;
}