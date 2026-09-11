'use client';

export default function StatusBadge({ status = 'unknown', label }) {
  const normalized = (status || 'unknown').toLowerCase();
  
  const statusStyles = {
    healthy: {
      bg: '#ECFDF5',
      text: '#065F46',
      border: '#A7F3D0',
      dotClass: 'healthy',
      defaultLabel: 'Operational',
    },
    degraded: {
      bg: '#FFFBEB',
      text: '#92400E',
      border: '#FDE68A',
      dotClass: 'degraded',
      defaultLabel: 'Degraded',
    },
    unhealthy: {
      bg: '#FEF2F2',
      text: '#991B1B',
      border: '#FECACA',
      dotClass: 'unhealthy',
      defaultLabel: 'Offline',
    },
    unknown: {
      bg: '#F3F4F6',
      text: '#374151',
      border: '#E5E7EB',
      dotClass: 'degraded',
      defaultLabel: 'Checking',
    },
  };

  const current = statusStyles[normalized] || statusStyles.unknown;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        letterSpacing: '0.01em',
      }}
    >
      <span className={`status-dot ${current.dotClass}`} />
      {label || current.defaultLabel}
    </span>
  );
}
