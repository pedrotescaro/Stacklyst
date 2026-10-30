'use client';

import { useState } from 'react';
import { ColorPalette } from '@/components/ColorPalette';
import type { ProfilePreferences } from '@/lib/profile-customization';
import styles from './InlineProfile.module.css';

type BannerColor = 'color' | 'secondaryColor';

export function BannerColorPicker({
  banner,
  disabled,
  onChange,
}: {
  banner: ProfilePreferences['banner'];
  disabled: boolean;
  onChange: (field: BannerColor, value: string) => void;
}) {
  const [selected, setSelected] = useState<BannerColor>('color');
  const gradient = banner.mode === 'gradient';
  const active = gradient ? selected : 'color';

  return (
    <div className={styles.bannerColors}>
      {gradient ? (
        <div className={styles.bannerColorStops} role="group" aria-label="Cores do degradê">
          {(
            [
              ['color', 'Primeira cor'],
              ['secondaryColor', 'Segunda cor'],
            ] as const
          ).map(([field, label]) => (
            <button
              type="button"
              key={field}
              aria-pressed={active === field}
              aria-label={`Escolher ${label.toLowerCase()} do degradê`}
              disabled={disabled}
              onClick={() => setSelected(field)}
            >
              <span style={{ backgroundColor: banner[field] }} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.bannerColorLabel}>Cor do banner</p>
      )}
      <ColorPalette
        className={styles.bannerPalette}
        aria-label={active === 'color' ? 'Cor do banner' : 'Segunda cor do banner'}
        value={banner[active]}
        disabled={disabled}
        onChange={(event) => onChange(active, event.target.value)}
      />
    </div>
  );
}
