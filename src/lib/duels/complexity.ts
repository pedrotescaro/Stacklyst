import type { Language } from '@prisma/client';

export type ComplexityClass =
  | 'O(1)'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n²)'
  | 'O(n³)'
  | 'O(2ⁿ)';

const COMPLEXITY_RANK: Record<ComplexityClass, number> = {
  'O(1)': 6,
  'O(log n)': 5,
  'O(n)': 4,
  'O(n log n)': 3,
  'O(n²)': 2,
  'O(n³)': 1,
  'O(2ⁿ)': 0,
};

export interface ComplexityEstimate {
  label: ComplexityClass;
  confidence: 'medium' | 'low';
  reason: string;
}

function stripCommentsAndStrings(code: string) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/#.*$/gm, ' ')
    .replace(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g, '""');
}

function maxBraceLoopDepth(code: string) {
  const tokens = code.match(/\b(?:for|while)\b|\.(?:forEach|map|filter|reduce)\s*\(|[{}]/g) ?? [];
  const stack: boolean[] = [];
  let pendingLoop = false;
  let activeLoops = 0;
  let maximum = 0;

  for (const token of tokens) {
    if (/^(?:for|while)$/.test(token) || token.startsWith('.')) {
      pendingLoop = true;
      continue;
    }
    if (token === '{') {
      stack.push(pendingLoop);
      if (pendingLoop) activeLoops += 1;
      pendingLoop = false;
      maximum = Math.max(maximum, activeLoops);
      continue;
    }
    if (token === '}') {
      if (stack.pop()) activeLoops = Math.max(0, activeLoops - 1);
      pendingLoop = false;
    }
  }

  return maximum;
}

function maxPythonLoopDepth(code: string) {
  const loopIndents: number[] = [];
  let maximum = 0;

  for (const rawLine of code.split('\n')) {
    if (!rawLine.trim()) continue;
    const indent = rawLine.match(/^\s*/)?.[0].replace(/\t/g, '    ').length ?? 0;
    while (loopIndents.length && indent <= loopIndents.at(-1)!) loopIndents.pop();
    if (/^\s*(?:for|while)\b.*:\s*$/.test(rawLine)) {
      loopIndents.push(indent);
      maximum = Math.max(maximum, loopIndents.length);
    }
  }

  return maximum;
}

function snakeCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function estimateCodeComplexity(
  source: string,
  language: Language,
  functionName: string
): ComplexityEstimate {
  const code = stripCommentsAndStrings(source);
  const names = [functionName, snakeCase(functionName)];
  const recursiveCalls = names.reduce((count, name) => {
    const matches = code.match(
      new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`, 'g')
    );
    return Math.max(count, Math.max(0, (matches?.length ?? 0) - 1));
  }, 0);

  if (recursiveCalls >= 2) {
    return { label: 'O(2ⁿ)', confidence: 'low', reason: 'múltiplas chamadas recursivas' };
  }

  const loopDepth = language === 'PYTHON' ? maxPythonLoopDepth(code) : maxBraceLoopDepth(code);
  if (loopDepth >= 3) {
    return { label: 'O(n³)', confidence: 'medium', reason: 'três laços aninhados' };
  }
  if (loopDepth === 2) {
    return { label: 'O(n²)', confidence: 'medium', reason: 'dois laços aninhados' };
  }

  const usesSort = /\.sort\s*\(|\bsorted\s*\(/.test(code);
  if (usesSort) {
    return { label: 'O(n log n)', confidence: 'medium', reason: 'ordenação dominante' };
  }

  const shrinksInput =
    /(?:\/\s*=\s*2|>>\s*1|Math\.floor\s*\([^)]*\/\s*2)/.test(code) ||
    /(?:\/\/\s*2|>>\s*1)/.test(code);
  if (loopDepth === 1 && shrinksInput) {
    return { label: 'O(log n)', confidence: 'low', reason: 'entrada reduzida pela metade' };
  }

  const linearBuiltIn =
    /\.(?:reverse|includes|indexOf|join|split|slice|some|every)\s*\(|\b(?:sum|max|min|set|list|Counter)\s*\(|\[\s*::\s*-?1\s*\]/.test(
      code
    );
  if (loopDepth === 1 || recursiveCalls === 1 || linearBuiltIn) {
    return {
      label: 'O(n)',
      confidence: recursiveCalls === 1 ? 'low' : 'medium',
      reason: 'uma passagem dominante',
    };
  }

  return { label: 'O(1)', confidence: 'low', reason: 'nenhum crescimento estrutural detectado' };
}

export function scoreComplexity(estimated: ComplexityClass, expected: ComplexityClass) {
  const gap = COMPLEXITY_RANK[expected] - COMPLEXITY_RANK[estimated];
  if (gap <= 0) return 200;
  if (gap === 1) return 140;
  if (gap === 2) return 70;
  return 20;
}
