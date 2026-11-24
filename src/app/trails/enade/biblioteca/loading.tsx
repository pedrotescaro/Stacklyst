import ui from '../_components/ui.module.css';

export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando conteúdo"
      style={{ maxWidth: 720, display: 'grid', gap: 12 }}
    >
      <span className={ui.skeleton} style={{ width: 200, height: 12 }} />
      <span className={ui.skeleton} style={{ width: '70%', height: 34 }} />
      <span className={ui.skeleton} style={{ width: '90%', height: 16 }} />
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          className={ui.skeleton}
          style={{ width: `${90 - (i % 3) * 12}%`, height: 14 }}
        />
      ))}
    </div>
  );
}
