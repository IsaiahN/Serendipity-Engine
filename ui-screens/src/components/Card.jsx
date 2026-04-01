export default function Card({ children, active, hoverable = true, onClick, style, ...props }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 20,
        transition: 'var(--transition)',
        cursor: onClick ? 'pointer' : 'default',
        ...(active && { boxShadow: '0 0 0 1px var(--accent)' }),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
