'use client';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  icon = null,
  ...props
}) {
  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '0.85rem' },
    md: { padding: '10px 18px', fontSize: '0.95rem' },
    lg: { padding: '12px 24px', fontSize: '1.05rem' },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;
  const baseClass = variant === 'primary' ? 'tp-button tp-button-primary' : 'tp-button tp-button-secondary';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${className}`}
      style={{
        ...currentSize,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
      }}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <svg
            style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="30 60"
            />
          </svg>
          Loading...
        </span>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
