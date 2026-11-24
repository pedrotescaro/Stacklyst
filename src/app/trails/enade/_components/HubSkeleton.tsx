import ui from './ui.module.css';

/** Skeleton shown while a hub page loads its data on the server. */
export function HubSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando"
      style={{ maxWidth: 980, margin: '0 auto', padding: '32px 28px' }}
    >
      <span className={ui.skeleton} style={{ width: 220, height: 14 }} />
      <span className={ui.skeleton} style={{ width: '55%', height: 30, marginTop: 12 }} />
      <span className={ui.skeleton} style={{ width: '75%', height: 16, marginTop: 12 }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
          marginTop: 32,
        }}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className={ui.skeleton} style={{ height: 64 }} />
        ))}
      </div>
      <div style={{ display: 'grid', gap: 14, marginTop: 32 }}>
        {Array.from({ length: rows }, (_, i) => (
          <span key={i} className={ui.skeleton} style={{ height: 44 }} />
        ))}
      </div>
    </div>
  );
}
