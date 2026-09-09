'use client';

const ICONS = {
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.5 8.5V6.8c0-.7.5-1.1 1.2-1.1H17V3h-2.3C12.4 3 11 4.5 11 6.7v1.8H9v2.7h2V21h3.2v-9.8h2.3l.4-2.7h-2.7z" />
    </svg>
  ),
  pinterest: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 3.2 6.1 3.2 10.7c0 2.9 1.54 5.16 4.04 6.07.37.07.57-.16.65-.36.07-.16.24-.64.32-.84.1-.27.06-.37-.18-.61-.54-.63-.88-1.45-.88-2.61 0-3.36 2.52-6.37 6.56-6.37 3.58 0 5.55 2.19 5.55 5.11 0 3.85-1.7 7.1-4.23 7.1-1.4 0-2.44-1.16-2.1-2.58.4-1.68 1.17-3.5 1.17-4.71 0-1.09-.58-2-1.8-2-1.42 0-2.57 1.47-2.57 3.45 0 1.26.43 2.11.43 2.11s-1.46 6.18-1.72 7.3c-.51 2.16-.08 4.81-.04 5.08.02.16.23.2.32.08.14-.18 1.9-2.36 2.5-4.54.17-.62.97-3.8.97-3.8.48.91 1.88 1.71 3.37 1.71 4.43 0 7.44-4.04 7.44-9.45C20.8 5.7 17.04 2 12.04 2z" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.5 7.2s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.2-1C16.7 3.6 12 3.6 12 3.6h0s-4.7 0-7.4.3c-.5.1-1.4.1-2.2 1-.7.7-.9 2.3-.9 2.3S1.2 9.1 1.2 11v1.9c0 1.9.3 3.8.3 3.8s.2 1.6.9 2.3c.8.9 1.9.8 2.4.9 1.7.2 7.2.3 7.2.3s4.7 0 7.4-.3c.5-.1 1.4-.1 2.2-1 .7-.7.9-2.3.9-2.3s.3-1.9.3-3.8V11c0-1.9-.3-3.8-.3-3.8zM9.8 14.8V8.7l6.1 3.05-6.1 3.05z" />
    </svg>
  ),
  whatsapp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2.1A9.9 9.9 0 0 0 2.2 12c0 1.74.46 3.44 1.32 4.94L2 22.1l5.3-1.47A9.9 9.9 0 0 0 12.04 22 9.9 9.9 0 0 0 22 12.1 9.9 9.9 0 0 0 12.04 2.1zm0 18.1c-1.54 0-3.05-.42-4.36-1.2l-.31-.19-3.15.87.84-3.07-.2-.32A7.95 7.95 0 0 1 4.1 12.1a7.94 7.94 0 0 1 7.94-7.95 7.94 7.94 0 0 1 7.95 7.94 7.94 7.94 0 0 1-7.95 8.1zm4.36-5.95c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.1-.1.24-.26.36-.4.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28z" />
    </svg>
  ),
};

const LINKS = [
  { id: 'instagram', name: 'Instagram', href: 'https://instagram.com' },
  { id: 'facebook', name: 'Facebook', href: 'https://facebook.com' },
  { id: 'pinterest', name: 'Pinterest', href: 'https://pinterest.com' },
  { id: 'youtube', name: 'YouTube', href: 'https://youtube.com' },
  { id: 'whatsapp', name: 'WhatsApp', href: 'https://wa.me/919876543210' },
];

export default function SocialIcons({ size = 34 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      {LINKS.map((social) => (
        <a
          key={social.id}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={social.name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: '#F5F3FF',
            color: '#6D28D9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#6D28D9';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F5F3FF';
            e.currentTarget.style.color = '#6D28D9';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {ICONS[social.id]}
        </a>
      ))}
    </div>
  );
}
