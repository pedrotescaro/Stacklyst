import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { evaluateExerciseCode, type EvaluatorTestCase } from '@/lib/exercises/evaluator';

// Exercise definitions stay in the migration. Read the actual trusted cases so
// this integration check catches changes to invocations as well as the runner.
const seed = readFileSync(
  path.join(
    process.cwd(),
    'prisma/migrations/20260822090000_knowledge_graph_foundation/migration.sql'
  ),
  'utf8'
);
function rowValues(line: string): Array<string | number | boolean | null> {
  return [...line.matchAll(/'((?:[^']|'')*)'(?:::jsonb)?|\b(NULL|true|false|\d+)\b/g)].map(
    (match) => {
      if (match[1] !== undefined) return match[1].replaceAll("''", "'");
      if (match[2] === 'NULL') return null;
      if (match[2] === 'true' || match[2] === 'false') return match[2] === 'true';
      return Number(match[2]);
    }
  );
}
const cases = seed
  .split('\n')
  .filter((line) => line.startsWith("('tc-"))
  .map((line) => {
    const row = rowValues(line);
    return {
      exerciseId: String(row[1]),
      id: String(row[0]),
      label: String(row[2]),
      input: row[3] === null ? null : JSON.parse(String(row[3])),
      invocation_code: row[4] === null ? null : String(row[4]),
      expected_output: JSON.parse(String(row[5])),
      is_hidden: row[6] === true,
      position: Number(row[7]),
    } satisfies EvaluatorTestCase & { exerciseId: string };
  });
const exercises = seed
  .split('\n')
  .filter((line) => line.startsWith("('ex-"))
  .map((line) => {
    const row = rowValues(line);
    return {
      id: String(row[0]),
      language: String(row[7]),
      // The following normalization is applied by the subsequent starter-code migration.
      starter: String(row[11]).replaceAll('\\n', '\n'),
      functionName: String(row[12]),
      testCases: cases.filter((test) => test.exerciseId === row[0]),
    };
  });

const solutions: Record<string, string> = {
  'ex-normalize-identifier': `function normalizeIdentifier(input) {
    const words = input.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
      .toLowerCase().match(/[a-z0-9]+/g) || [];
    const value = words.map((word, index) => index ? word[0].toUpperCase() + word.slice(1) : word).join('');
    return /^\\d/.test(value) ? '_' + value : value;
  }`,
  'ex-rate-limiter': `function createRateLimiter(limit) {
    const counts = new Map();
    return key => { const count = (counts.get(key) || 0) + 1; counts.set(key, count); return count <= limit; };
  }`,
  'ex-merge-intervals': `function mergeIntervals(intervals) {
    const sorted = intervals.map(item => [...item]).sort((a, b) => a[0] - b[0]);
    const result = [];
    for (const item of sorted) {
      const last = result[result.length - 1];
      if (last && item[0] <= last[1] + 1) last[1] = Math.max(last[1], item[1]);
      else result.push(item);
    }
    return result;
  }`,
  'ex-map-concurrency': `async function mapWithConcurrency(items, limit, worker) {
    if (!Number.isInteger(limit) || limit < 1) throw new TypeError('Invalid limit');
    const result = []; let next = 0; let failed = false;
    async function consume() {
      while (!failed && next < items.length) {
        const index = next++;
        try { result[index] = await worker(items[index]); }
        catch (error) { failed = true; throw error; }
      }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, consume));
    return result;
  }`,
  'ex-retry-after': `function parseRetryAfter(value: string | null, nowMs: number): number | null {
    if (value === null || !value.trim()) return null;
    const raw = value.trim();
    if (/^-/.test(raw)) return null;
    const delay = /^\\d+$/.test(raw) ? Number(raw) * 1000 : Date.parse(raw) - nowMs;
    return Number.isFinite(delay) ? Math.min(300000, Math.max(0, delay)) : null;
  }`,
  'ex-index-events': `function indexEvents(events) {
    const result = {};
    for (const event of events) {
      result[event.kind] ||= {};
      (result[event.kind][event.entityId] ||= []).push(event);
    }
    for (const group of Object.values(result)) for (const list of Object.values(group))
      list.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    return result;
  }`,
  'ex-optimistic-reducer': `function optimisticReducer(state, action) {
    let pending = state.pending.map(item => ({ ...item }));
    let confirmedValue = state.confirmedValue;
    const known = pending.find(item => item.id === action.id);
    if (action.type === 'APPLY' && !known) pending.push({ id: action.id, delta: action.delta });
    if (action.type === 'CONFIRM' && known) confirmedValue += known.delta;
    if (action.type === 'CONFIRM' || action.type === 'REJECT') pending = pending.filter(item => item.id !== action.id);
    return { confirmedValue, pending, value: confirmedValue + pending.reduce((sum, item) => sum + item.delta, 0) };
  }`,
  'ex-topological-sort': `function topologicalSort(nodes, edges) {
    const indegree = new Map(nodes.map(node => [node, 0]));
    const outgoing = new Map(nodes.map(node => [node, new Set()]));
    for (const [from, to] of edges) if (indegree.has(from) && indegree.has(to) && !outgoing.get(from).has(to)) {
      outgoing.get(from).add(to); indegree.set(to, indegree.get(to) + 1);
    }
    const order = []; const done = new Set();
    while (true) {
      const node = nodes.find(item => !done.has(item) && indegree.get(item) === 0);
      if (node === undefined) break;
      done.add(node); order.push(node);
      for (const to of outgoing.get(node)) indegree.set(to, indegree.get(to) - 1);
    }
    return { order, hasCycle: order.length !== nodes.length };
  }`,
  'ex-parameterized-query': `function buildUserQuery(filters) {
    const values = []; const clauses = [];
    for (const [key, operator] of [['active', '='], ['role', '='], ['createdAfter', '>=']]) {
      if (key === 'active' ? typeof filters[key] !== 'boolean' : typeof filters[key] !== 'string') continue;
      values.push(filters[key]);
      clauses.push((key === 'createdAfter' ? 'created_at' : key) + ' ' + operator + ' $' + values.length);
    }
    return { text: 'SELECT id, username FROM "User"' + (clauses.length ? ' WHERE ' + clauses.join(' AND ') : '')
      + ' ORDER BY created_at ' + (filters.sort === 'oldest' ? 'ASC' : 'DESC'), values };
  }`,
  'ex-idempotent-batch': `function processBatch(commands, processedIds) {
    const seen = new Set(processedIds); const accepted = []; const rejected = []; let balanceDelta = 0;
    for (const command of commands) {
      if (seen.has(command.id)) { rejected.push({ id: command.id, reason: 'duplicate' }); continue; }
      if (!command.id || !Number.isInteger(command.amount) || command.amount === 0) {
        rejected.push({ id: command.id, reason: 'invalid' }); continue;
      }
      seen.add(command.id); accepted.push(command.id); balanceDelta += command.amount;
    }
    return { balanceDelta, accepted, rejected };
  }`,
};

describe('published exercise catalog in the real QuickJS sandbox', () => {
  it('covers all ten curated JavaScript/TypeScript exercises and their forty trusted cases', () => {
    expect(exercises).toHaveLength(10);
    expect(cases).toHaveLength(40);
    expect(exercises.map((exercise) => exercise.id).sort()).toEqual(Object.keys(solutions).sort());
  });

  it.each(exercises)('evaluates the reference solution for $id ($language)', async (exercise) => {
    const result = await evaluateExerciseCode({ ...exercise, code: solutions[exercise.id] });
    expect(result, JSON.stringify(result)).toMatchObject({
      ok: true,
      passed: true,
      passedTests: exercise.testCases.length,
      totalTests: exercise.testCases.length,
      consoleOutput: '',
    });
    for (const test of result.tests.filter((test) => test.hidden)) {
      expect(test.expected).toBeUndefined();
      expect(test.actual).toBeUndefined();
      expect(test.label).toMatch(/^Caso oculto \d+$/);
    }
  });

  it.each(exercises)(
    'returns test verdicts for the unfinished starter of $id',
    async (exercise) => {
      const result = await evaluateExerciseCode({ ...exercise, code: exercise.starter });
      expect(result, JSON.stringify(result)).toMatchObject({
        ok: true,
        passed: false,
        totalTests: 4,
      });
      expect(result.tests).toHaveLength(4);
      expect(result.error).toBeUndefined();
    }
  );
});
