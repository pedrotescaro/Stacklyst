export const DURATION = 24;
export const chapters = [
  {
    id: 'feed',
    start: 2,
    end: 6,
    title: ['Feed', 'Feed'],
    caption: ['Compartilhe código, projetos e progresso.', 'Share code, projects and progress.'],
  },
  {
    id: 'trails',
    start: 6,
    end: 10,
    title: ['Trilhas', 'Trails'],
    caption: [
      'Do primeiro código ao seu próximo projeto.',
      'From your first code to your next project.',
    ],
  },
  {
    id: 'duels',
    start: 10,
    end: 14,
    title: ['Duelos', 'Duels'],
    caption: ['Coloque suas habilidades à prova.', 'Put your skills to the test.'],
  },
  {
    id: 'profile',
    start: 14,
    end: 18,
    title: ['Perfil', 'Profile'],
    caption: ['Seu progresso conta sua história.', 'Your progress tells your story.'],
  },
  {
    id: 'ranking',
    start: 18,
    end: 21,
    title: ['Ranking', 'Ranking'],
    caption: ['Evolua e avance no ranking de XP.', 'Grow and climb the XP ranking.'],
  },
] as const;
export type SceneId = (typeof chapters)[number]['id'];
export function chapterAt(time: number) {
  return chapters.findIndex((c) => time >= c.start && time < c.end);
}
export function smooth(from: number, to: number, time: number) {
  const p = Math.max(0, Math.min(1, (time - from) / (to - from)));
  return p * p * (3 - 2 * p);
}
export function scenePresence(id: SceneId, time: number) {
  if (id === 'feed') return time < 6.7 ? 1 - smooth(6, 6.7, time) : smooth(21, 21.7, time);
  const scene = chapters.find((c) => c.id === id)!;
  return (
    smooth(scene.start, scene.start + 0.7, time) * (1 - smooth(scene.end, scene.end + 0.7, time))
  );
}
// Shared camera returns to precisely the same pose at both ends of the loop.
const poses = [
  [0, 0.94, 0, 0],
  [2, 0.94, 0, 0],
  [3.4, 1.18, 20, 35],
  [5.3, 1.18, 20, 35],
  [6.5, 1, 0, 0],
  [8, 1.12, -10, 10],
  [9.4, 1.12, -10, 10],
  [10.5, 1, 0, 0],
  [11.7, 1.16, 15, 15],
  [13.4, 1.16, 15, 15],
  [14.5, 1, 0, 0],
  [16, 1.12, 0, -10],
  [17.4, 1.12, 0, -10],
  [18.5, 1, 0, 0],
  [20, 1.16, 5, -15],
  [21.5, 1.04, 0, 0],
  [22.5, 0.94, 0, 0],
  [23.8, 0.94, 0, 0],
  [24, 0.94, 0, 0],
];
export function cameraAt(time: number, mobile = false) {
  const index = poses.findIndex((p) => p[0] >= time);
  const b = poses[Math.max(0, index)],
    a = poses[Math.max(0, index - 1)];
  const mix = a === b ? 0 : smooth(a[0], b[0], time);
  const strength = mobile ? 0.2 : 1;
  return {
    scale: 1 + (a[1] + (b[1] - a[1]) * mix - 1) * strength,
    x: (a[2] + (b[2] - a[2]) * mix) * strength,
    y: (a[3] + (b[3] - a[3]) * mix) * strength,
  };
}
