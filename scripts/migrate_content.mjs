import fs from "fs";
import path from "path";

const root = "src/data";
const files = ["free.json", "premium.json", "challenges.json", "taxonomy.json"];
const [freePath, premiumPath, challengesPath, taxPath] = files.map(f => path.join(root, f));

const taxonomy = JSON.parse(fs.readFileSync(taxPath, "utf8"));
const alias = taxonomy.interestAlias;
const canonical = new Set(taxonomy.interests);

function normalizeInterest(v) {
  if (!v) return null;
  if (canonical.has(v)) return v;
  const mapped = alias[v?.toLowerCase?.()] || v;
  return canonical.has(mapped) ? mapped : null;
}

// mapa objetivo por interés (default)
const interest2objective = {
  math: "reasoning",
  language: "reading",
  science: "reasoning",
  nature: "memory",
  animals: "memory",
  music: "memory",
  art: "creativity",
  sports: "attention_focus",
  history: "memory",
  tech: "reasoning",
  health: "executive_functions",
  social: "emotion_regulation",
  geo: "memory",
  culture: "memory",
  finance: "executive_functions",
  digital_safety: "executive_functions",
  emotions: "emotion_regulation",
  executive_functions: "executive_functions",
  creativity: "creativity",
  reading: "reading",
  logic: "reasoning",
  videogames: "attention_focus"
};

function ensureActivityDefaults(item, i) {
  item.audience = "user";
  if (!item.interest) item.interest = "mixed";
  item.interest = normalizeInterest(item.interest) || "mixed";

  // metadatos básicos si faltan (heurísticas suaves)
  if (item.ageMin == null || item.ageMax == null) {
    // heurística: si el ID sugiere _f00X → 8–12, si _p → 13–18; sino 10–14
    const id = (item.id || "").toLowerCase();
    if (id.includes("_f0")) { item.ageMin = 8; item.ageMax = 12; }
    else if (id.includes("premium") || id.includes("_p")) { item.ageMin = 13; item.ageMax = 18; }
    else { item.ageMin = 10; item.ageMax = 14; }
  }
  if (item.difficulty == null) {
    // 1=easy, 2=mid, 3=hard, 4=advanced
    item.difficulty = (item.premium ? 3 : 2);
  }
  if (!item.objective_id) {
    item.objective_id = interest2objective[item.interest] || "reasoning";
  }
  if (item.hint == null) item.hint = "";
  return item;
}

function load(p){ return JSON.parse(fs.readFileSync(p,"utf8")); }
function save(p, data){ fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8"); }

const freeData = load(freePath).map(ensureActivityDefaults);
const premiumData = load(premiumPath).map(x => ensureActivityDefaults({...x, premium: true}));

// Normaliza intereses en challenges y deja audience:user
const chData = load(challengesPath).map(ch => {
  ch.audience = "user";
  if (ch.interest) ch.interest = normalizeInterest(ch.interest) || "mixed";
  if (Array.isArray(ch.objective_ids)) {
    ch.objective_ids = ch.objective_ids.map(o => o.trim());
  }
  return ch;
});

save(freePath, freeData);
save(premiumPath, premiumData);
save(challengesPath, chData);

console.log("✔ Migración completada: intereses normalizados y metadatos base añadidos.");