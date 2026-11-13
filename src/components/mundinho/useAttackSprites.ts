'use client';

import { useEffect, useState } from 'react';
import { adventureAsset } from './assets';

const prepared = new Map<string, Promise<boolean>>();

function prepareImage(url: string): Promise<boolean> {
  const cached = prepared.get(url);
  if (cached) return cached;
  const pending = new Promise<boolean>((resolve) => {
    const image = new Image();
    image.onload = async () => {
      try {
        if (typeof image.decode === 'function') await image.decode();
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    image.onerror = () => resolve(false);
    image.src = url;
  });
  prepared.set(url, pending);
  void pending.then((success) => {
    if (!success) prepared.delete(url);
  });
  return pending;
}

/** Keep the loaded idle picture until the whole attack picture can be painted. */
export function useAttackSprites() {
  const body = adventureAsset('hero-body-attack.png', '/assets/mundinho');
  const outfit = adventureAsset('hero-outfit-attack.png', '/assets/mundinho');
  const weapon = adventureAsset('hero-weapon-attack.png', '/assets/mundinho');
  const signature = JSON.stringify([body, outfit, weapon]);
  const [readyFor, setReadyFor] = useState('');
  useEffect(() => {
    let cancelled = false;
    void Promise.all([body, outfit, weapon].map(prepareImage)).then((loaded) => {
      if (!cancelled && loaded.every(Boolean)) setReadyFor(signature);
    });
    return () => {
      cancelled = true;
    };
  }, [body, outfit, weapon, signature]);
  return readyFor === signature;
}
