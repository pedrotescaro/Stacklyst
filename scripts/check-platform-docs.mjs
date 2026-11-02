import fs from 'node:fs/promises';
import path from 'node:path';
async function scan(dir) {
  const all = [];
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) all.push(...(await scan(file)));
    else if (file.endsWith('.md')) all.push(file);
  }
  return all;
}
let checked = 0;
const failures = [];
for (const file of await scan('docs/manual')) {
  const source = await fs.readFile(file, 'utf8');
  for (const match of source.matchAll(/\]\((?:<([^>]+)>|([^\n)]+))\)/g)) {
    const target = (match[1] ?? match[2]).split('#')[0];
    if (!target || /^\w+:/.test(target)) continue;
    checked++;
    try {
      await fs.access(path.resolve(path.dirname(file), decodeURI(target)));
    } catch {
      failures.push(`${file}: ${target}`);
    }
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`${checked} local documentation links resolve successfully.`);
