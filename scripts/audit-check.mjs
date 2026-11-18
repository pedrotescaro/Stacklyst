#!/usr/bin/env node
// Runs `npm audit` and fails on high/critical advisories that are not in
// .github/audit-allowlist.json. Each allowlist entry names one advisory, why it
// cannot be fixed yet, and when it expires; expired entries block again, so an
// accepted risk is reviewed instead of silently living forever.
//
// Usage: node scripts/audit-check.mjs --project web|mobile [--prefix dir]
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};
const project = option('project');
const prefix = option('prefix');
const level = option('level') || 'high';
if (!project) {
  console.error('Missing --project (web or mobile).');
  process.exit(2);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const allowlist = JSON.parse(readFileSync(join(root, '.github', 'audit-allowlist.json'), 'utf8'));
const entries = allowlist[project] || [];
const today = new Date().toISOString().slice(0, 10);

let output;
try {
  // A plain command string runs npm through the shell on every OS (npm is npm.cmd on Windows).
  output = execSync(`npm audit --json${prefix ? ` --prefix "${prefix}"` : ''}`, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
} catch (error) {
  // npm audit exits non-zero whenever it finds anything; the JSON is still on stdout.
  output = error.stdout;
}
let report;
try {
  report = JSON.parse(output);
} catch {
  console.error('Could not read the npm audit report.');
  process.exit(2);
}
if (report.error) {
  console.error(`npm audit failed: ${report.error.summary || JSON.stringify(report.error)}`);
  process.exit(2);
}

// Only the advisories themselves: packages listed because they depend on a
// vulnerable package carry no advisory of their own.
const advisories = new Map();
for (const vulnerability of Object.values(report.vulnerabilities || {}))
  for (const via of vulnerability.via)
    if (typeof via === 'object' && RANK[via.severity] >= RANK[level]) {
      const id = via.url?.split('/').pop() || String(via.source);
      advisories.set(id, { id, name: via.name, severity: via.severity, title: via.title });
    }

const blocking = [];
for (const advisory of advisories.values()) {
  const entry = entries.find((e) => e.id === advisory.id);
  const line = `${advisory.severity} ${advisory.id} ${advisory.name}: ${advisory.title}`;
  if (!entry) blocking.push(line);
  else if (entry.expires < today)
    blocking.push(`${line} (allowlist entry expired ${entry.expires})`);
  else console.log(`allowed until ${entry.expires}: ${line}`);
}
for (const entry of entries)
  if (!advisories.has(entry.id))
    console.log(
      `::notice::${entry.id} (${entry.package}) is no longer reported; remove it from the allowlist.`
    );

if (blocking.length) {
  console.error(`\n${blocking.length} ${level}+ advisories are not allowlisted:`);
  for (const line of blocking) console.error(`  ${line}`);
  console.error('\nFix them, or add a justified, dated entry to .github/audit-allowlist.json.');
  process.exit(1);
}
console.log(`\nNo blocking ${level}+ advisories for ${project}.`);
