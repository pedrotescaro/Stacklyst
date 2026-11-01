import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';

const require = createRequire(import.meta.url);
const buildDir = path.resolve('.next');

const executionRoutes = [
  'server/app/api/run/route.js',
  'server/app/api/duels/[id]/run/route.js',
  'server/app/api/duels/[id]/solution/route.js',
  'server/app/api/lessons/[lessonId]/attempt/route.js',
  'server/app/api/exercises/[exerciseId]/run/route.js',
  'server/app/api/exercises/[exerciseId]/submit/route.js',
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
    const chunkPath = path.join(buildDir, chunk);
    // Some server chunks group their first module pairs in an inner array.
    const modules = require(path.join(buildDir, chunk)).flat();
    const chunkSource = readFileSync(chunkPath, 'utf8');
    let sourceMap;
    for (let index = 0; index < modules.length - 1; index += 1) {
      const factory = modules[index + 1];
      if (typeof factory !== 'function') continue;
      const factorySource = factory.toString();
      if (factorySource.includes(`"${exportName}",`)) {
        const exports = await runtime.m(modules[index]).exports;
        if (typeof exports[exportName] === 'function') return exports[exportName];
      }
      // Next 16.4 also minifies server export keys. Resolve the original
      // function through its source map, while still executing the built WASM.
      for (const exported of factorySource.matchAll(/"([^"\s]+)",0,([\w$]+)/g)) {
        const inline = exported[2] === 'function';
        const declaration = inline
          ? null
          : new RegExp(`function\\s+${exported[2].replace(/\$/g, '\\$')}\\(`).exec(factorySource);
        if (!inline && !declaration) continue;
        sourceMap ??= new TraceMap(JSON.parse(readFileSync(`${chunkPath}.map`, 'utf8')));
        const offset =
          chunkSource.indexOf(factorySource) +
          (inline
            ? exported.index + exported[0].indexOf('function')
            : declaration.index + declaration[0].indexOf(exported[2]));
        if (offset < 0) continue;
        const original = originalPositionFor(sourceMap, {
          line: chunkSource.slice(0, offset).split('\n').length,
          column: offset - chunkSource.lastIndexOf('\n', offset) - 1,
        });
        const sourceIndex = sourceMap.sources.indexOf(original.source);
        const sourceLine = sourceMap.sourcesContent?.[sourceIndex]?.split('\n')[original.line - 1];
        const originalName = original.name ?? sourceLine?.match(/function\s+([\w$]+)/)?.[1];
        if (originalName !== exportName) continue;
        const exports = await runtime.m(modules[index]).exports;
        if (typeof exports[exported[1]] === 'function') return exports[exported[1]];
      }
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
const evaluateExerciseCode = await builtExport(
  'server/app/api/exercises/[exerciseId]/run/route.js',
  'evaluateExerciseCode'
);

for (const language of ['javascript', 'typescript']) {
  const source = language === 'typescript' ? 'const answer: number = 42;' : 'const answer = 42;';
  const result = await executeCode(`${source} console.log(answer);`, language);
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.output, '42');
}

const asynchronous = await executeCode(
  `const completed: number[] = [];
  Promise.all([30, 5, 15].map(delay => new Promise<number>(resolve => {
    setTimeout(() => { completed.push(delay); resolve(delay * 2); }, delay);
  }))).then(values => console.log(JSON.stringify({ values, completed })));`,
  'typescript'
);
assert.equal(asynchronous.ok, true, JSON.stringify(asynchronous));
assert.deepEqual(JSON.parse(asynchronous.output), {
  values: [60, 10, 30],
  completed: [5, 15, 30],
});

const retryAfterTests = [
  ['retry-seconds', ['120', 0], 120000, false],
  ['retry-date', ['Wed, 21 Oct 2015 07:28:00 GMT', 1445412420000], 60000, false],
  ['retry-limit', ['999', 0], 300000, true],
  ['retry-invalid', [null, 0], null, true],
].map(([id, input, expected_output, is_hidden], index) => ({
  id,
  label: id,
  input,
  expected_output,
  is_hidden,
  invocation_code: null,
  position: index + 1,
}));
for (const includeHidden of [false, true]) {
  const result = await evaluateExerciseCode({
    language: 'TS',
    functionName: 'parseRetryAfter',
    code: `function parseRetryAfter(value: string | null, nowMs: number): number | null {
      if (value === null || !value.trim()) return null;
      const raw = value.trim();
      if (/^-/.test(raw)) return null;
      const delay = /^\\d+$/.test(raw) ? Number(raw) * 1000 : Date.parse(raw) - nowMs;
      return Number.isFinite(delay) ? Math.min(300000, Math.max(0, delay)) : null;
    }`,
    testCases: retryAfterTests.filter((test) => includeHidden || !test.is_hidden),
  });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.passed, true, JSON.stringify(result));
  assert.equal(result.passedTests, includeHidden ? 4 : 2);
  assert.equal(result.consoleOutput, '');
  for (const test of result.tests.filter((test) => test.hidden)) {
    assert.equal(test.actual, undefined);
    assert.equal(test.expected, undefined);
  }
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
  'Production judge smoke passed: JS, TS, Promise/timer scheduling, Retry-After exercise public/hidden tests, lesson run/submit and code errors, public/hidden duel tests, and wrong-answer handling; no external requests.'
);

const certificateRoute = 'server/app/api/certificates/[id]/pdf/route.js';
const certificateTrace = JSON.parse(
  readFileSync(path.join(buildDir, `${certificateRoute}.nft.json`), 'utf8')
);
for (const asset of ['Sora-Regular.ttf', 'Sora-SemiBold.ttf', 'Sora-Bold.ttf', 'signature.png']) {
  assert.ok(
    certificateTrace.files.some((file) =>
      file.replaceAll('\\', '/').endsWith(`/public/assets/credentials/${asset}`)
    ),
    `Certificate deployment is missing ${asset}`
  );
}
const renderCredentialPdf = await builtExport(certificateRoute, 'renderCredentialPdf');
const certificateBytes = await renderCredentialPdf(
  {
    id: '35ca5499-276b-4a56-8c20-9bc4d4de382f',
    recipientName: 'João Luís Gonçalves de Almeida',
    recipientUsername: 'synthetic-build-check',
    issuedAt: '2026-11-01T12:00:00.000Z',
    verifiedAt: '2026-11-01T12:00:00.000Z',
    integrityHash: 'a'.repeat(64),
    status: 'valid',
    definition: {
      id: 'synthetic:build-only',
      version: 1,
      kind: 'course',
      language: 'TS',
      title: 'TypeScript do zero',
      description: 'Synthetic build check, never issued.',
      estimatedMinutes: 60,
      skills: ['Tipos e funções'],
      requirements: [],
    },
  },
  'https://stacklyst.vercel.app/certificates/35ca5499-276b-4a56-8c20-9bc4d4de382f'
);
assert.equal(Buffer.from(certificateBytes).subarray(0, 4).toString(), '%PDF');
assert.ok(certificateBytes.byteLength > 1000);
assert.equal(externalRequests, 0);
console.log(
  'Production certificate smoke passed: compiled PDF renderer, embedded fonts/signature, QR and deployed asset trace; no database or external requests.'
);
