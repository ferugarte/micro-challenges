import fs from "fs";
import path from "path";

const root = "src/data";
const read = f => JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const write = (f, data) => fs.writeFileSync(path.join(root,f), JSON.stringify(data, null, 2), "utf8");

const taxonomy = read("taxonomy.json");
const free = read("free.json");
const premium = read("premium.json");
const challenges = read("challenges.json");

const canonical = new Set(taxonomy.interests);
const alias = taxonomy.interestAlias || {};

const all = [...free, ...premium];
const byId = new Map(all.map(a => [a.id, a]));

// 2.1 Arreglar intereses residuales por patrón de ID
function normalizeInterest(v) {
  if (!v) return null;
  const vv = v.toLowerCase?.() ?? v;
  if (canonical.has(vv)) return vv;
  const mapped = alias[vv] || vv;
  return canonical.has(mapped) ? mapped : null;
}

for (const a of all) {
  // si quedó "mixed" pero el ID revela la intención, corrige
  const id = (a.id || "").toLowerCase();

  if (!normalizeInterest(a.interest)) {
    if (id.startsWith("attention_")) a.interest = "attention";
    else if (id.startsWith("memory_")) a.interest = "memory";
    else if (id.startsWith("advanced_logic_")) a.interest = "logic";
    else if (id.startsWith("reading_critical_")) a.interest = "reading";
    else if (id.startsWith("digital_culture_")) a.interest = "culture";
  }

  // normaliza vía alias/canónicos por si quedó pendiente
  const n = normalizeInterest(a.interest);
  a.interest = n || "mixed";
}

// 2.2 Ajustar edades para evitar “fuera de rango por abajo”
// Regla: si el challenge incluye el activity y el activity.ageMax < challenge.ageMin,
// subimos activity.ageMax a challenge.ageMax (o al menos a ageMin del challenge).
for (const ch of challenges) {
  const { ageMin: chMin, ageMax: chMax } = ch;
  if (!Array.isArray(ch.activities)) continue;

  for (const actId of ch.activities) {
    const a = byId.get(actId);
    if (!a) continue;

    if (typeof a.ageMin !== "number") a.ageMin = chMin ?? 8;
    if (typeof a.ageMax !== "number") a.ageMax = chMax ?? 12;

    // si queda por debajo del rango del challenge, eleva ageMax
    if (typeof chMin === "number" && a.ageMax < chMin) {
      a.ageMax = Math.max(a.ageMax, chMax ?? chMin);
    }
    // si por algún motivo el ageMin queda por encima del ageMax, corrige suavemente
    if (a.ageMin > a.ageMax) a.ageMin = Math.max(chMin ?? 6, a.ageMax - 2);
  }
}

// Persistir
write("free.json", free);
write("premium.json", premium);

console.log("✔ fix_warnings aplicado. Ahora vuelve a correr el validador.");