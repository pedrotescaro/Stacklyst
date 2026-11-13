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

const heroLayers = ['body', 'outfit', 'eyes', 'hair', 'accessory'];
const attackFiles = [...heroLayers, 'weapon'].map((layer) => `hero-${layer}-attack.png`);
const bowFiles = [...heroLayers, 'weapon'].map((layer) => `hero-${layer}-bow.png`);
const walkingFiles = heroLayers.map((layer) => `hero-${layer}.png`);

function usePreparedSprites(files: string[]) {
  const assets = (
    globalThis as typeof globalThis & { __MUNDINHO_ASSETS__?: Record<string, string> }
  ).__MUNDINHO_ASSETS__;
  const [readyFor, setReadyFor] = useState<{ files: string[]; assets: typeof assets }>();
  useEffect(() => {
    let cancelled = false;
    const urls = files.map((file) => adventureAsset(file, '/assets/mundinho'));
    void Promise.all(urls.map(prepareImage)).then((loaded) => {
      if (!cancelled && loaded.every(Boolean)) setReadyFor({ files, assets });
    });
    return () => {
      cancelled = true;
    };
  }, [files, assets]);
  return readyFor?.files === files && readyFor.assets === assets;
}

/** Switch the entire pose together after every image has decoded. */
export function useAttackSprites(bow = false) {
  return usePreparedSprites(bow ? bowFiles : attackFiles);
}

export function useWalkingSprites() {
  return usePreparedSprites(walkingFiles);
}
