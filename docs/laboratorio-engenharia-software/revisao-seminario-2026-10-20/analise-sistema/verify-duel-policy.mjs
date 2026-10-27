import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
const ts = require('typescript');
const source = fs.readFileSync('src/lib/duels/resolution-policy.ts', 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const policyModule = { exports: {} };
vm.runInNewContext(compiled, { exports: policyModule.exports, module: policyModule });
const { chooseBestDuelSubmission, decideDuelResolution } = policyModule.exports;
const input = {
  id: 'offline-example',
  user_id: 'first',
  code: 'example',
  status: 'JUDGE_UNAVAILABLE',
  score: 0,
  runtime_ms: null,
  complexity: 'Não medida',
  created_at: new Date('2026-10-20T12:00:00Z'),
};
const chosen = chooseBestDuelSubmission([input], 'first');
const decision = decideDuelResolution({ first: chosen, second: null, reason: 'deadline_score' });
const result = {
  method: 'Pure deterministic policy, transpiled current file. No network/database.',
  source: 'src/lib/duels/resolution-policy.ts',
  input_status: input.status,
  selected_status: chosen?.status,
  decision,
};
fs.writeFileSync(
  'docs/laboratorio-engenharia-software/revisao-seminario-2026-10-20/analise-sistema/evidencia-politica-duelo.json',
  JSON.stringify(result, null, 2)
);
console.log(JSON.stringify(result, null, 2));
