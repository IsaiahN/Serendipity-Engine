const variants = {
  accent: { background: 'var(--accent-glow)', color: 'var(--accent)' },
  muted: { background: 'var(--bg-tertiary)', color: 'var(--text-muted)' },
  green: { background: 'rgba(74,222,128,0.15)', color: 'var(--health-exceptional)' },
  amber: { background: 'rgba(251,191,36,0.15)', color: 'var(--health-good)' },
};

export default function Badge({ children, variant = 'accent', style }) {
  const v = variants[variant] || variants.accent;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 100,
      fontSize: '0.75rem',
      fontWeight: 500,
      ...v,
      ...style,
    }}>
      {children}
    </span>
  );
}
