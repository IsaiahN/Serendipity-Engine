const variants = {
  primary: {
    background: 'var(--accent)',
    color: '#000',
    border: 'none',
  },
  secondary: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
  },
};

const sizes = {
  sm: { padding: '6px 12px', fontSize: '0.8rem' },
  md: { padding: '10px 20px', fontSize: '0.9rem' },
  lg: { padding: '14px 28px', fontSize: '1rem' },
};

export default function Button({ children, variant = 'primary', size = 'md', disabled, onClick, style, ...props }) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'var(--transition)',
        ...v,
        ...s,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
