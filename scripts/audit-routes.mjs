#!/usr/bin/env node
/**
 * Route & link audit.
 *  1. Static: every internal href/router target in source must resolve to an app route.
 *  2. Runtime: every static route and every dynamic route instance (built from
 *     content ids) must respond 200 from a running server.
 *
 * Usage: node scripts/audit-routes.mjs [baseUrl]   (default http://localhost:3000)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const BASE = process.argv[2] ?? "http://localhost:3000";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/* ── 1. Route table ─────────────────────────────────────────── */
const appDir = join(ROOT, "app");
const routes = walk(appDir)
  .filter((f) => /\/page\.(t|j)sx?$/.test(f))
  .map((f) => {
    const segs = relative(appDir, f)
      .split(sep)
      .slice(0, -1)
      .filter((s) => !/^\(.*\)$/.test(s));
    return segs;
  });
const routeStrings = routes.map((r) => "/" + r.join("/"));

function matches(pathSegs) {
  return routes.some(
    (r) =>
      r.length === pathSegs.length &&
      r.every((seg, i) => {
        const dyn = /^\[.+\]$/.test(seg);
        if (pathSegs[i] === ":param") return dyn;
        return dyn || seg === pathSegs[i];
      }),
  );
}

/* ── 2. Static href scan ────────────────────────────────────── */
const SKIP = [/^\/images\//, /^\/_next/, /^\/auth\/callback/, /^\/api\//, /^\/favicon/];
const sourceFiles = ["app", "components", "lib", "content"]
  .flatMap((d) => walk(join(ROOT, d)))
  .filter((f) => /\.(tsx?|mjs)$/.test(f));

const literal = /(["'`])(\/[a-z][a-z0-9\-/]*(?:\$\{[^}]+\}[a-z0-9\-/]*)*)(?:[?#][^"'`]*)?\1/gi;
const problems = [];
let checked = 0;

for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    // Only lines that look like navigation targets.
    if (!/href|push\(|replace\(|redirect\(|Href|: ?["'`]\/|fallback|next=/.test(line)) continue;
    for (const m of line.matchAll(literal)) {
      const raw = m[2];
      if (SKIP.some((re) => re.test(raw))) continue;
      if (raw.startsWith("//")) continue;
      const normalized = raw.replace(/\$\{[^}]+\}/g, ":param").replace(/\/+$/, "") || "/";
      if (normalized.includes(":param") && !/\/:param(\/|$)/.test(normalized)) continue;
      const segs = normalized === "/" ? [] : normalized.slice(1).split("/");
      checked++;
      if (!matches(segs)) problems.push(`${relative(ROOT, file)}: ${raw}`);
    }
  }
}

console.log(`Routes (${routeStrings.length}):\n  ${routeStrings.sort().join("\n  ")}\n`);
console.log(`Static scan: ${checked} internal link targets checked.`);
if (problems.length) {
  console.log(`✗ ${problems.length} unresolved:\n  ${[...new Set(problems)].join("\n  ")}`);
} else {
  console.log("✓ every internal link target resolves to a route.");
}

/* ── 3. Runtime crawl ───────────────────────────────────────── */
function idsIn(file, startMarker, endMarker = /\nexport /) {
  const text = readFileSync(join(ROOT, file), "utf8");
  const start = text.indexOf(startMarker);
  if (start < 0) return [];
  const rest = text.slice(start + startMarker.length);
  const end = rest.search(endMarker);
  const block = end < 0 ? rest : rest.slice(0, end);
  return [...block.matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1]);
}

const lessons = idsIn("content/lessons.ts", "export const LESSONS");
const exercises = idsIn("content/exercises.ts", "export const EXERCISES");
const classes = idsIn("content/classes.ts", "export const CLASSES");
const programs = idsIn("content/catalog.ts", "export const PROGRAMS");
const courses = idsIn("content/catalog.ts", "export const COURSES");
const categories = idsIn("content/catalog.ts", "export const CATEGORIES");
const settings = ["profile", "training", "notifications", "units", "data", "subscription", "help", "about"];

const urls = new Set(routeStrings.filter((r) => !r.includes("[")));
const dyn = {
  "/workouts/[id]": lessons,
  "/lesson/[id]": lessons,
  "/learn/[id]": exercises,
  "/workout/[id]": exercises,
  "/classes/[id]": classes,
  "/programs/[id]": programs,
  "/courses/[id]": courses,
  "/categories/[id]": categories,
  "/settings/[section]": settings,
  "/legal/[doc]": ["privacy", "terms"],
};
for (const r of routeStrings.filter((r) => r.includes("["))) {
  const ids = dyn[r];
  if (!ids) {
    console.log(`! no sample ids for dynamic route ${r}`);
    continue;
  }
  for (const id of ids) urls.add(r.replace(/\[[^\]]+\]/, id));
}

const expect404 = ["/workouts/nope", "/learn/nope", "/programs/nope", "/settings/nope", "/this-does-not-exist"];

let failures = 0;
async function check(path, expected) {
  try {
    const res = await fetch(BASE + path, { redirect: "manual" });
    const ok = res.status === expected;
    if (!ok) {
      failures++;
      console.log(`✗ ${path} → ${res.status} (expected ${expected})`);
    }
  } catch (err) {
    failures++;
    console.log(`✗ ${path} → ${err.message}`);
  }
}

console.log(`\nRuntime crawl against ${BASE}: ${urls.size} URLs + ${expect404.length} expected 404s…`);
const list = [...urls];
for (let i = 0; i < list.length; i += 6) {
  await Promise.all(list.slice(i, i + 6).map((u) => check(u, 200)));
}
await Promise.all(expect404.map((u) => check(u, 404)));
console.log(failures ? `✗ ${failures} runtime failures` : "✓ all runtime checks passed");

process.exit(problems.length || failures ? 1 : 0);
