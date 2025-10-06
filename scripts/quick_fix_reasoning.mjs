import fs from "fs";
const p = "src/data/free.json";
const data = JSON.parse(fs.readFileSync(p, "utf8"));
for (const a of data) {
  if (a.id === "reasoning_f001") a.interest = "reasoning";
}
fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
console.log("✔ reasoning_f001 → interest: reasoning");