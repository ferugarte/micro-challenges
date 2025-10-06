import fs from "fs";
import path from "path";

const root = "src/data";
const read = f => JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));

const taxonomy = read("taxonomy.json");
const free = read("free.json");
const premium = read("premium.json");
const challenges = read("challenges.json");

const allActivities = [...free, ...premium];
const byId = new Map();
const errs = [];
const warns = [];

function err(m){ errs.push("❌ " + m); }
function warn(m){ warns.push("⚠️ " + m); }

function checkUniqueIDs(list, label){
  const seen = new Set();
  list.forEach(x=>{
    if (!x.id) return err(`[${label}] item sin id`);
    if (seen.has(x.id)) err(`[${label}] id duplicado: ${x.id}`);
    seen.add(x.id);
    // global
    if (byId.has(x.id)) err(`ID global duplicado: ${x.id}`);
    byId.set(x.id, x);
  });
}

checkUniqueIDs(free,"free");
checkUniqueIDs(premium,"premium");

// interest válido
const canonical = new Set(taxonomy.interests);
const alias = taxonomy.interestAlias || {};
function norm(v){
  const low = v?.toLowerCase?.();
  if (canonical.has(low)) return low;
  if (alias[low] && canonical.has(alias[low])) return alias[low];
  return null;
}

// validar actividades
function validateActivity(a, label){
  // options/solution consistencia
  const hasOptions = Array.isArray(a.options);
  const hasSolution = a.solution != null;
  if (hasOptions && hasSolution) err(`[${label}] ${a.id} tiene options y solution a la vez`);
  if (!hasOptions && !hasSolution) err(`[${label}] ${a.id} no tiene options ni solution`);

  // correct en rango
  if (hasOptions) {
    if (typeof a.correct !== "number") err(`[${label}] ${a.id} missing correct index`);
    else if (a.correct < 0 || a.correct >= a.options.length) err(`[${label}] ${a.id} correct fuera de rango`);
  }

  // interest
  const n = norm(a.interest);
  if (!n) warn(`[${label}] ${a.id} interest no canónico: ${a.interest}`);
  // edades
  if (a.ageMin == null || a.ageMax == null || a.ageMin > a.ageMax) err(`[${label}] ${a.id} edades inválidas (${a.ageMin}-${a.ageMax})`);

  // dificultad
  if (a.difficulty == null || a.difficulty < 1 || a.difficulty > 5) warn(`[${label}] ${a.id} dificultad ausente o fuera [1..5]`);

  // objetivo
  if (!a.objective_id) warn(`[${label}] ${a.id} sin objective_id`);
}

free.forEach(a => validateActivity(a,"free"));
premium.forEach(a => {
  if (!a.premium) warn(`[premium] ${a.id} no tiene premium:true`);
  validateActivity(a,"premium");
});

// validar challenges
challenges.forEach(ch=>{
  if (!ch.id) err(`[challenge] item sin id`);
  if (!Array.isArray(ch.activities) || ch.activities.length===0) err(`[${ch.id}] sin activities`);
  // premium rule
  if (ch.premium===true){
    ch.activities?.forEach(actId=>{
      const a = byId.get(actId);
      if (!a) return err(`[${ch.id}] referencia inexistente: ${actId}`);
      if (!a.premium) err(`[${ch.id}] usa actividad no premium en challenge premium: ${actId}`);
    });
  }
  // edad/dificultad consistencia suave
  ch.activities?.forEach(actId=>{
    const a = byId.get(actId);
    if (!a) return; // ya reportado
    if (ch.ageMin!=null && a.ageMax!=null && a.ageMax < ch.ageMin) warn(`[${ch.id}] ${actId} fuera de rango por abajo`);
    if (ch.ageMax!=null && a.ageMin!=null && a.ageMin > ch.ageMax) warn(`[${ch.id}] ${actId} fuera de rango por arriba`);
  });
});

if (errs.length===0){
  console.log("✅ Validación OK.");
  if (warns.length) console.log("\nAvisos:\n" + warns.join("\n"));
  process.exit(0);
} else {
  console.error("FALLÓ VALIDACIÓN:\n" + errs.join("\n"));
  if (warns.length) console.error("\nAvisos:\n" + warns.join("\n"));
  process.exit(1);
}