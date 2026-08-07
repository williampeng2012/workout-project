import { config } from "dotenv";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

config({ path: ".env.local" });

const url =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;

if (!url) {
  console.error(
    "Set DATABASE_URL (or SUPABASE_DB_URL / POSTGRES_URL) in .env.local",
  );
  process.exit(1);
}

const dir = path.join(process.cwd(), "supabase", "migrations");
const files = (await readdir(dir))
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  for (const file of files) {
    const sql = await readFile(path.join(dir, file), "utf8");
    console.log(`Applying ${file}…`);
    await client.query(sql);
    console.log(`  ok`);
  }
  console.log("Migrations complete.");
} finally {
  await client.end();
}
