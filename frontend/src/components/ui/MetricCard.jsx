'use client';

import StatusBadge from './StatusBadge.jsx';

export default function MetricCard({
  title,
  subtitle,
  icon,
  status = 'healthy',
  latency = null,
  details = null,
  extra = null,
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'var(--purple-100)',
              color: 'var(--purple-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div style={{ borderTop: '1px solid var(--purple-100)', paddingTop: '14px', marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Response Latency:</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--purple-800)' }}>
            {latency !== null ? `${latency} ms` : '—'}
          </span>
        </div>
        {details && (
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#6B7280', fontFamily: 'monospace' }}>
            {details}
          </div>
        )}
        {extra}
      </div>
    </div>
  );
}
