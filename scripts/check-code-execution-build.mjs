import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const buildDir = path.resolve('.next');

const executionRoutes = [
  'server/app/api/run/route.js',
  'server/app/api/duels/[id]/run/route.js',
  'server/app/api/duels/[id]/solution/route.js',
  'server/app/api/lessons/[lessonId]/attempt/route.js',
];
for (const route of executionRoutes) {
  const trace = JSON.parse(readFileSync(path.join(buildDir, `${route}.nft.json`), 'utf8'));
  for (const dependency of [
    /@jitl\/quickjs-singlefile-browser-release-sync\/dist\/emscripten-module[^/]*\.mjs$/,
    /@jitl\/quickjs-singlefile-browser-release-sync\/dist\/ffi\.mjs$/,
    /quickjs-emscripten-core\/dist\/module-[^/]*\.mjs$/,
  ]) {
    assert.ok(
      trace.files.some((file) => dependency.test(file.replaceAll('\\', '/'))),
      `${route} is missing a deployed QuickJS dependency matching ${dependency}`
    );
  }
}

// Load the actual Turbopack server modules, including their lazy imports, instead
// of re-transpiling source with a test runner. This catches broken WASM chunks
// that next build can emit successfully but Node cannot execute at request time.
async function builtExport(routePath, exportName) {
  const entry = readFileSync(path.join(buildDir, routePath), 'utf8');
  const runtime = require(path.join(buildDir, 'server/chunks/[turbopack]_runtime.js'))(routePath);
  const chunks = [...entry.matchAll(/R\.c\("([^"]+)"\)/g)].map((match) => match[1]);
  assert.ok(
    chunks.length,
    'Expected a Turbopack build; update the build smoke loader if the bundler changes.'
  );
  for (const chunk of chunks) runtime.c(chunk);

  for (const chunk of chunks) {
    const modules = require(path.join(buildDir, chunk));
    for (let index = 0; index < modules.length - 1; index += 1) {
      const factory = modules[index + 1];
      if (typeof factory !== 'function' || !factory.toString().includes(`"${exportName}",`))
        continue;
      const exports = await runtime.m(modules[index]).exports;
      if (typeof exports[exportName] === 'function') return exports[exportName];
    }
  }
  throw new Error(`Missing ${exportName} in the compiled ${routePath}`);
}

let externalRequests = 0;
globalThis.fetch = async () => {
  externalRequests += 1;
  throw new Error('Build smoke tests must not contact external execution providers.');
};

const executeCode = await builtExport('server/app/api/run/route.js', 'executeCode');
const judgeDuelCode = await builtExport('server/app/api/duels/[id]/run/route.js', 'judgeDuelCode');
const judgeDuelSubmission = await builtExport(
  'server/app/api/duels/[id]/solution/route.js',
  'judgeDuelSubmission'
);
const assessLessonStep = await builtExport(
  'server/app/api/lessons/[lessonId]/attempt/route.js',
  'assessLessonStep'
);

for (const language of ['javascript', 'typescript']) {
  const source = language === 'typescript' ? 'const answer: number = 42;' : 'const answer = 42;';
  const result = await executeCode(`${source} console.log(answer);`, language);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.output, '42');
}

const lessonStep = {
  id: 'first-output',
  type: 'code_editor',
  expectedOutput: 'Stacklyst\nMeu primeiro programa',
};
for (const action of ['run', 'submit']) {
  for (const [code, isCorrect] of [
    ['console.log("Stacklyst");\nconsole.log("Meu primeiro programa");', true],
    ['print("Stacklyst")\nprint("Meu primeiro programa")', false],
    ['console.log(', false],
  ]) {
    const result = await assessLessonStep({ language: 'JS' }, lessonStep, {
      stepId: lessonStep.id,
      action,
      code,
    });
    assert.equal(result.isCorrect, isCorrect, JSON.stringify(result));
    assert.equal(result.unavailable, false, JSON.stringify(result));
    if (isCorrect) assert.equal(result.output, lessonStep.expectedOutput);
    else assert.ok(result.details, 'Lesson code errors must remain visible to the learner.');
  }
}

const input = {
  problemId: 'reverse-string',
  language: 'TS',
  code: 'function reverseString(str: string): string { return [...str].reverse().join(""); }',
};
for (const includeHiddenTests of [false, true]) {
  const result = await judgeDuelCode({ ...input, includeHiddenTests });
  assert.equal(result.status, 'ACCEPTED', JSON.stringify(result));
  assert.equal(result.passedTests, includeHiddenTests ? 4 : 3);
  assert.equal(result.totalTests, result.passedTests);
}

const submission = await judgeDuelSubmission(input);
assert.equal(submission.status, 'ACCEPTED', JSON.stringify(submission));
assert.equal(submission.passedTests, 4);

const wrong = await judgeDuelCode({
  ...input,
  includeHiddenTests: true,
  code: 'function reverseString(str: string): string { return str.split("").reverse().join(""); }',
});
assert.equal(wrong.status, 'WRONG_ANSWER', JSON.stringify(wrong));
assert.equal(wrong.passedTests, 3);
assert.equal(externalRequests, 0, 'The bundled judge fell back to an external execution provider.');
console.log(
  'Production judge smoke passed: JS, TS, lesson run/submit and code errors, public/hidden duel tests, and wrong-answer handling; no external requests.'
);
