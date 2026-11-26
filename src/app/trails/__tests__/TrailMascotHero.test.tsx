import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';
import { TrailMascot } from '@/app/trails/TrailMascot';
import { TrailMascotAvatarProvider } from '@/app/trails/trailMascotAvatar';
import { readTrailMascotAvatar } from '@/app/trails/readTrailMascotAvatar';
import { DEFAULT_AVATAR } from '@/lib/mundinho/types';

function Trail() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref}>
      <TrailMascot containerRef={ref} progressKey="test" currentNodeKey="node-1" />
    </div>
  );
}

describe('Trail mascot hero', () => {
  it("draws the learner's Mundinho hero facing down and breathing, not the robot", () => {
    render(
      <TrailMascotAvatarProvider value={{ ...DEFAULT_AVATAR, gender: 'feminine', hair: 2 }}>
        <Trail />
      </TrailMascotAvatarProvider>
    );
    const mascot = screen.getByTestId('trail-moving-mascot');
    expect(mascot.querySelector('img')).toBeNull();
    const hero = mascot.querySelector('[role="img"]')!;
    expect(hero).toHaveAttribute('data-silhouette', 'feminine');
    expect(hero.getAttribute('aria-label')).toMatch(/down|baixo/);
    expect(mascot).toHaveAttribute('data-direction', 'baixo');
    expect(mascot).not.toHaveAttribute('data-walking');
    const idleBody = mascot.querySelector<HTMLElement>('[data-layer="body"][data-pose="idle"]')!;
    expect(idleBody.style.backgroundImage).toContain('hero-body-idle.png');
    expect(idleBody).not.toHaveAttribute('data-standby');
    // The walking sheet is mounted too, ready for the first step.
    expect(mascot.querySelector('[data-layer="body"][data-pose="walk"]')).not.toBeNull();
  });

  it('fills fields missing from older saved avatars with defaults', () => {
    expect(readTrailMascotAvatar({ skin: 4 })).toEqual({ ...DEFAULT_AVATAR, skin: 4 });
    expect(readTrailMascotAvatar(null)).toEqual(DEFAULT_AVATAR);
    expect(readTrailMascotAvatar(['x'])).toEqual(DEFAULT_AVATAR);
  });
});
