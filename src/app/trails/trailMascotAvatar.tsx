'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_AVATAR, type Avatar } from '@/lib/mundinho/types';

/** The learner's own Mundinho hero, who walks the trail in place of a generic mascot. */
const TrailMascotAvatarContext = createContext<Avatar>(DEFAULT_AVATAR);

export const TrailMascotAvatarProvider = TrailMascotAvatarContext.Provider;

export function useTrailMascotAvatar() {
  return useContext(TrailMascotAvatarContext);
}
