const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(process.cwd(), "db", "aym_kararlar.db");
const jsonPath = path.join(process.cwd(), "app", "data", "kararlar.json");

const db = new Database(dbPath);

const columns = db.prepare("PRAGMA table_info(kararlar)").all();
const hasColumn = columns.some((c) => c.name === "cezaevi_mi");

if (!hasColumn) {
  db.prepare("ALTER TABLE kararlar ADD COLUMN cezaevi_mi INTEGER DEFAULT 0").run();
  console.log("cezaevi_mi kolonu eklendi.");
} else {
  console.log("cezaevi_mi kolonu zaten var.");
}

const cezaeviKararlari = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

function normalizeNo(value = "") {
  return value.toString().trim().replace("-", "/");
}

db.prepare("UPDATE kararlar SET cezaevi_mi = 0").run();

const update = db.prepare(`
  UPDATE kararlar
  SET cezaevi_mi = 1
  WHERE basvuru_no = ?
`);

let sayac = 0;

for (const item of cezaeviKararlari) {
  const no = normalizeNo(item.basvuru_no);
  const result = update.run(no);
  if (result.changes > 0) sayac++;
}

console.log("İşaretlenen cezaevi kararı:", sayac);
console.log("JSON’daki karar sayısı:", cezaeviKararlari.length);