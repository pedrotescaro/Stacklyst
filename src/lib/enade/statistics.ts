export function describe(values: number[]) {
  const n = values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((s, v) => s + v, 0);
  const mean = sum / n;
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const top = Math.max(...counts.values());
  const modes =
    top > 1
      ? [...counts.entries()]
          .filter(([, c]) => c === top)
          .map(([v]) => v)
          .sort((a, b) => a - b)
      : [];
  const squares = values.reduce((s, v) => s + (v - mean) ** 2, 0);
  return {
    n,
    sorted,
    sum,
    mean,
    median,
    modes,
    range: sorted[n - 1] - sorted[0],
    variance: squares / n,
    sampleVariance: n > 1 ? squares / (n - 1) : 0,
  };
}
