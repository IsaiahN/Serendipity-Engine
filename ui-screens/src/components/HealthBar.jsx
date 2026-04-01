const levels = [
  { label: 'Just Started', color: 'var(--health-just-started)', pct: 0 },
  { label: 'Needs Work', color: 'var(--health-needs-work)', pct: 20 },
  { label: 'Developing', color: 'var(--health-developing)', pct: 40 },
  { label: 'Good', color: 'var(--health-good)', pct: 60 },
  { label: 'Strong', color: 'var(--health-strong)', pct: 80 },
  { label: 'Exceptional', color: 'var(--health-exceptional)', pct: 100 },
];

export function getHealthLevel(rating) {
  return levels[rating] || levels[0];
}

export default function HealthBar({ rating = 0, showLabel = true, size = 'md', compact = false, style }) {
  const level = getHealthLevel(rating);
  const h = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 6 : 10, ...style }}>
      {showLabel && (
        <span style={{ fontSize: size === 'sm' ? '0.75rem' : '0.85rem', color: level.color, fontWeight: 600, minWidth: compact ? 0 : 85, whiteSpace: 'nowrap' }}>
          {level.label}
        </span>
      )}
      <div style={{
        flex: 1,
        height: h,
        background: 'var(--bg-tertiary)',
        borderRadius: 100,
        overflow: 'hidden',
        minWidth: compact ? 40 : 60,
      }}>
        <div style={{
          width: `${level.pct}%`,
          height: '100%',
          background: level.color,
          borderRadius: 100,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: compact ? 20 : 24, whiteSpace: 'nowrap' }}>
        {rating}/5
      </span>
    </div>
  );
}
