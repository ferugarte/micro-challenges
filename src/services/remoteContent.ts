const FREE_URL = "https://<tu-usuario>.github.io/micro-challenges/content/free.json";
const PREMIUM_URL = "https://<tu-usuario>.github.io/micro-challenges/content/premium.json";

export async function fetchChallenges(premium: boolean) {
  const url = premium ? PREMIUM_URL : FREE_URL;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Remote fetch failed");
  return (await res.json()) as any[];
}
