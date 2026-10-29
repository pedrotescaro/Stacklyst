import { useRef, useState } from 'react';
export function TouchStick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const active = useRef<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reset = () => {
    active.current = null;
    setOffset({ x: 0, y: 0 });
    onMove(0, 0);
  };
  return (
    <div
      className="world-stick"
      role="group"
      aria-label="Controle de movimento por toque. Arraste em qualquer direção. Use também WASD ou setas no teclado."
      onPointerDown={(e) => {
        if (active.current !== null) return;
        active.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (e.pointerId !== active.current) return;
        const bounds = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bounds.left - bounds.width / 2,
          y = e.clientY - bounds.top - bounds.height / 2;
        const length = Math.hypot(x, y),
          factor = Math.min(1, 32 / Math.max(1, length));
        setOffset({ x: x * factor, y: y * factor });
        onMove(length < 7 ? 0 : (x * factor) / 32, length < 7 ? 0 : (y * factor) / 32);
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
      onLostPointerCapture={reset}
    >
      <span style={{ transform: `translate(${offset.x}px,${offset.y}px)` }} />
    </div>
  );
}
