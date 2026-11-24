/** Lorenz curve from equal population groups (shares in %, poorest first). */
export function lorenzPoints(shares: number[]): [number, number][] {
  const total = shares.reduce((sum, v) => sum + v, 0) || 1;
  let cumulative = 0;
  return [
    [0, 0],
    ...shares.map((share, i): [number, number] => {
      cumulative += share;
      return [(i + 1) / shares.length, cumulative / total];
    }),
  ];
}

/** Gini by the trapezoid (Brown) formula: G = 1 − Σ (Xk − Xk−1)(Yk + Yk−1). */
export function giniFromShares(shares: number[]) {
  const points = lorenzPoints(shares);
  let area = 0;
  for (let k = 1; k < points.length; k++)
    area += (points[k][0] - points[k - 1][0]) * (points[k][1] + points[k - 1][1]);
  return Math.max(0, Math.min(1, 1 - area));
}

export function roi(gain: number, cost: number) {
  return cost ? (gain - cost) / cost : null;
}

/** Simple payback: periods until cumulative cash flow covers the investment. */
export function payback(investment: number, flows: number[]) {
  let remaining = investment;
  for (let i = 0; i < flows.length; i++) {
    if (flows[i] >= remaining) return i + remaining / flows[i];
    remaining -= flows[i];
  }
  return null;
}
