'use client';

import { useState, type CSSProperties, type PointerEvent } from 'react';
import styles from './NameColorPicker.module.css';

type HSV = { hue: number; saturation: number; brightness: number };
const clamp = (value: number, max = 100) => Math.max(0, Math.min(max, value));

function fromHex(hex: string): HSV {
  const [red, green, blue] = [1, 3, 5].map(
    (offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255
  );
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const hue = !delta
    ? 0
    : max === red
      ? ((green - blue) / delta) % 6
      : max === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4;
  return {
    hue: (hue * 60 + 360) % 360,
    saturation: max ? (delta / max) * 100 : 0,
    brightness: max * 100,
  };
}

function toHex({ hue, saturation, brightness }: HSV) {
  const chroma = (brightness / 100) * (saturation / 100);
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const offset = brightness / 100 - chroma;
  const channels =
    hue < 60
      ? [chroma, secondary, 0]
      : hue < 120
        ? [secondary, chroma, 0]
        : hue < 180
          ? [0, chroma, secondary]
          : hue < 240
            ? [0, secondary, chroma]
            : hue < 300
              ? [secondary, 0, chroma]
              : [chroma, 0, secondary];
  return `#${channels
    .map((channel) =>
      Math.round((channel + offset) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

export function NameColorPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}) {
  const [selection, setSelection] = useState(() => ({ hex: value, ...fromHex(value) }));
  const [hexInput, setHexInput] = useState(value.slice(1));
  // Preserve hue when selecting gray/black, but follow an external reset of the color.
  if (value !== selection.hex) {
    setSelection({ hex: value, ...fromHex(value) });
    setHexInput(value.slice(1));
  }

  const change = (next: HSV) => {
    const hex = toHex(next);
    setSelection({ ...next, hex });
    setHexInput(hex.slice(1));
    onChange(hex);
  };
  const chooseOnWheel = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    change({
      ...selection,
      hue: Math.hypot(x, y) < 1 ? selection.hue : ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360,
      saturation: clamp((Math.hypot(x, y) / (rect.width / 2)) * 100),
    });
  };
  const radians = (selection.hue * Math.PI) / 180;
  const hueColor = toHex({ hue: selection.hue, saturation: 100, brightness: 100 });
  const wheelStyle = {
    '--wheel-darkness': 1 - selection.brightness / 100,
    '--marker-x': `${50 + (Math.cos(radians) * selection.saturation) / 2}%`,
    '--marker-y': `${50 + (Math.sin(radians) * selection.saturation) / 2}%`,
    '--selected-color': selection.hex,
  } as CSSProperties;

  return (
    <div className={styles.picker} role="group" aria-label="Cor do nome" data-disabled={disabled}>
      <div
        className={styles.wheel}
        style={wheelStyle}
        aria-hidden="true"
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          chooseOnWheel(event);
        }}
        onPointerMove={(event) => {
          if (!disabled && event.currentTarget.hasPointerCapture(event.pointerId))
            chooseOnWheel(event);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      >
        <span className={styles.marker} />
      </div>
      <div className={styles.sliders}>
        {(
          [
            ['hue', 'Matiz', 359, styles.hue, undefined],
            ['saturation', 'Saturação', 100, '', `linear-gradient(to right, #ffffff, ${hueColor})`],
            [
              'brightness',
              'Brilho',
              100,
              '',
              `linear-gradient(to right, #000000, ${toHex({ ...selection, brightness: 100 })})`,
            ],
          ] as const
        ).map(([key, label, max, className, background]) => (
          <label className={styles.sliderRow} key={key}>
            <span>{label}</span>
            <input
              type="range"
              min={0}
              max={max}
              value={Math.round(selection[key])}
              aria-label={`Cor do nome: ${label.toLowerCase()}`}
              disabled={disabled}
              className={`${styles.range} ${className}`}
              style={{ background }}
              onChange={(event) => change({ ...selection, [key]: Number(event.target.value) })}
            />
          </label>
        ))}
      </div>
      <label className={styles.hexRow}>
        <span>Hexadecimal</span>
        <span className={styles.hexField}>
          <span
            className={styles.preview}
            style={{ backgroundColor: selection.hex }}
            aria-hidden="true"
          />
          <span aria-hidden="true">#</span>
          <input
            type="text"
            aria-label="Cor do nome em hexadecimal"
            value={hexInput}
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
            disabled={disabled}
            onChange={(event) => {
              const hex = event.target.value.replace(/^#/, '').slice(0, 6);
              setHexInput(hex);
              if (/^[\da-f]{6}$/i.test(hex)) {
                const color = `#${hex.toLowerCase()}`;
                setSelection({ hex: color, ...fromHex(color) });
                onChange(color);
              }
            }}
            onBlur={() => setHexInput(selection.hex.slice(1))}
          />
        </span>
      </label>
    </div>
  );
}
