import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { neon } from "@neondatabase/serverless";

const MIGRATIONS_DIR = join(__dirname, "..", "db", "migrations");

function splitStatements(fileSql: string): string[] {
  return fileSql
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Set DATABASE_URL before running migrations.");
  }

  const sql = neon(connectionString);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = (await sql.query(`SELECT name FROM schema_migrations`)) as { name: string }[];
  const appliedNames = new Set(applied.map((r) => r.name));

  for (const file of files) {
    if (appliedNames.has(file)) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }
    const fileSql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    const statements = splitStatements(fileSql);

    await sql.transaction((tx) => [
      ...statements.map((stmt) => tx.query(stmt)),
      tx.query(`INSERT INTO schema_migrations (name) VALUES ($1)`, [file]),
    ]);
    console.log(`apply ${file}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
