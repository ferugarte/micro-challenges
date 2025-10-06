import challenges from "@/data/challenges.json";
import taxonomy from "@/data/taxonomy.json";

export function recommendChallenges(age:number, interests:string[], max=2): string[] {
  const canon = new Set(taxonomy.interests);
  const ints = interests.filter(i => canon.has(i));
  const pool = (challenges as any[]).filter(ch=>{
    const inAge = (age>=ch.ageMin && age<=ch.ageMax);
    const match = ints.length===0 ? true : ints.some(i=> (ch.interest===i || (ch.interests?.includes?.(i))));
    return inAge && !ch.premium && match;
  });
  // orden simple: dificultad asc, luego por cobertura (heurística)
  pool.sort((a,b)=> (a.difficulty??2)-(b.difficulty??2));
  return pool.slice(0,max).map(ch=>ch.id);
}