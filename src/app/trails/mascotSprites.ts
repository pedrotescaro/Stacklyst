export type MascotDirection = 'direita' | 'esquerda' | 'cima' | 'baixo';

export const MASCOT_SPRITE_FRAMES: Record<MascotDirection, readonly string[]> = {
  direita: [
    '/sprites/robot/direita_01.png',
    '/sprites/robot/direita_02.png',
    '/sprites/robot/direita_03.png',
  ],
  esquerda: [
    '/sprites/robot/esquerda_01.png',
    '/sprites/robot/esquerda_02.png',
    '/sprites/robot/esquerda_03.png',
  ],
  cima: [
    '/sprites/robot/cima_01.png',
    '/sprites/robot/cima_02.png',
    '/sprites/robot/cima_03.png',
    '/sprites/robot/cima_04.png',
  ],
  baixo: [
    '/sprites/robot/baixo_01.png',
    '/sprites/robot/baixo_02.png',
    '/sprites/robot/baixo_03.png',
    '/sprites/robot/baixo_04.png',
  ],
};

/**
 * The idle set is intentionally separate from the walking set. Walking keeps
 * the compact three/four-frame sprite animation, while a settled mascot uses
 * the supplied directional idle poses and never reuses a walk frame.
 */
export const MASCOT_IDLE_FRAMES: Record<MascotDirection, readonly string[]> = {
  direita: [
    '/sprites/robot/idle/direita/idle_direita_01.png',
    '/sprites/robot/idle/direita/idle_direita_02.png',
    '/sprites/robot/idle/direita/idle_direita_03.png',
    '/sprites/robot/idle/direita/idle_direita_04.png',
  ],
  esquerda: [
    '/sprites/robot/idle/esquerda/idle_esquerda_01.png',
    '/sprites/robot/idle/esquerda/idle_esquerda_02.png',
    '/sprites/robot/idle/esquerda/idle_esquerda_03.png',
    '/sprites/robot/idle/esquerda/idle_esquerda_04.png',
  ],
  cima: [
    '/sprites/robot/idle/cima/idle_cima_01.png',
    '/sprites/robot/idle/cima/idle_cima_02.png',
    '/sprites/robot/idle/cima/idle_cima_03.png',
    '/sprites/robot/idle/cima/idle_cima_04.png',
  ],
  baixo: [
    '/sprites/robot/idle/baixo/idle_baixo_01.png',
    '/sprites/robot/idle/baixo/idle_baixo_02.png',
    '/sprites/robot/idle/baixo/idle_baixo_03.png',
    '/sprites/robot/idle/baixo/idle_baixo_04.png',
  ],
};

export const ALL_MASCOT_SPRITES = [
  ...Object.values(MASCOT_SPRITE_FRAMES).flat(),
  ...Object.values(MASCOT_IDLE_FRAMES).flat(),
];

let preloadPromise: Promise<void> | null = null;

export function preloadMascotSprites(): Promise<void> {
  if (typeof window === 'undefined' || typeof window.Image === 'undefined') {
    return Promise.resolve();
  }

  if (!preloadPromise) {
    preloadPromise = Promise.all(
      ALL_MASCOT_SPRITES.map(
        (source) =>
          new Promise<void>((resolve) => {
            const image = new window.Image();
            image.decoding = 'async';
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = source;
          })
      )
    ).then(() => undefined);
  }

  return preloadPromise;
}
