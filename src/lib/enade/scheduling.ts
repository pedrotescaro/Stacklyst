export type Job = { id: string; arrival: number; burst: number };
export type Policy = 'fcfs' | 'sjf' | 'srtf' | 'rr';

/** CPU scheduling simulation with a Gantt timeline (consecutive slots merged). */
export function schedule(jobs: Job[], policy: Policy, quantum = 2) {
  const remaining = new Map(jobs.map((j) => [j.id, j.burst]));
  const finish = new Map<string, number>();
  const timeline: { id: string; start: number; end: number }[] = [];
  const run = (id: string, start: number, end: number) => {
    const last = timeline.at(-1);
    if (last && last.id === id && last.end === start) last.end = end;
    else timeline.push({ id, start, end });
  };
  let time = 0;
  const pending = () => jobs.filter((j) => remaining.get(j.id)! > 0);
  const ready = () => pending().filter((j) => j.arrival <= time);
  const queue: string[] = [];
  const enqueueArrivals = (from: number, to: number) => {
    for (const j of jobs)
      if (j.arrival > from && j.arrival <= to && !queue.includes(j.id)) queue.push(j.id);
  };
  if (policy === 'rr') for (const j of jobs) if (j.arrival <= 0) queue.push(j.id);
  while (pending().length) {
    if (policy === 'rr') {
      if (!queue.length) {
        const next = Math.min(...pending().map((j) => j.arrival));
        run('ocioso', time, next);
        enqueueArrivals(time, next);
        time = next;
        continue;
      }
      const id = queue.shift()!;
      const slice = Math.min(quantum, remaining.get(id)!);
      run(id, time, time + slice);
      enqueueArrivals(time, time + slice);
      time += slice;
      remaining.set(id, remaining.get(id)! - slice);
      if (remaining.get(id)! > 0) queue.push(id);
      else finish.set(id, time);
      continue;
    }
    const candidates = ready();
    if (!candidates.length) {
      const next = Math.min(...pending().map((j) => j.arrival));
      run('ocioso', time, next);
      time = next;
      continue;
    }
    const chosen =
      policy === 'fcfs'
        ? candidates.sort((a, b) => a.arrival - b.arrival)[0]
        : candidates.sort(
            (a, b) => remaining.get(a.id)! - remaining.get(b.id)! || a.arrival - b.arrival
          )[0];
    const slice = policy === 'srtf' ? 1 : remaining.get(chosen.id)!;
    run(chosen.id, time, time + slice);
    time += slice;
    remaining.set(chosen.id, remaining.get(chosen.id)! - slice);
    if (remaining.get(chosen.id) === 0) finish.set(chosen.id, time);
  }
  const rows = jobs.map((j) => {
    const end = finish.get(j.id)!;
    return { ...j, finish: end, turnaround: end - j.arrival, waiting: end - j.arrival - j.burst };
  });
  return {
    timeline,
    jobs: rows,
    averageWaiting: rows.reduce((s, r) => s + r.waiting, 0) / rows.length,
    averageTurnaround: rows.reduce((s, r) => s + r.turnaround, 0) / rows.length,
  };
}
