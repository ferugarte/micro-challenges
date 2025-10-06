import challenges from "@/data/challenges.json";

export function getChallengeActivities(chId: string): string[] {
  const ch = (challenges as any[]).find(c => c.id === chId);
  return ch?.activities ?? [];
}