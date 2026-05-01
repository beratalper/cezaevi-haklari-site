import Database from "better-sqlite3";

const db = new Database("./db/aym_kararlar.db", { readonly: true });

const tables = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table'
`).all();

console.log("TABLOLAR:", tables);

for (const t of tables) {
  console.log("\nTABLO:", t.name);
  const cols = db.prepare(`PRAGMA table_info(${t.name})`).all();
  console.log(cols.map(c => c.name));
}