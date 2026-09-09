'use client';

export function ActionSpinner({ size = 16, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function BusyButtonLabel({ busy, busyText, children }) {
  if (!busy) return children;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <ActionSpinner size={15} />
      {busyText}
    </span>
  );
}

export function BusyOverlay({ show, label = 'Please wait...' }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.62)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        backdropFilter: 'blur(2px)',
      }}
    >
      <ActionSpinner size={28} color="#7E22CE" />
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#6D28D9' }}>{label}</div>
    </div>
  );
}
