"use client";

export default function LoginBackground() {
  return (
    <div
      className="login-scene"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        backgroundColor: '#F7F4FA',
      }}
    >
      {/* High-Resolution Luxury Scene Background */}
      <img
        src="/images/image.png"
        alt="ThePurple Luxury Setting"
        className="login-scene-photo"
      />

      {/* Left-side soft ambient blend for crisp headline readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.4) 22%, rgba(255, 255, 255, 0) 38%)',
        }}
      />

      {/* Bottom-Left Purple Corner Wave */}
      <svg
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '35%',
          height: '28%',
          minWidth: '320px',
          maxWidth: '520px',
          zIndex: 3,
          pointerEvents: 'none',
        }}
        viewBox="0 0 500 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0 240V90C130 145 230 110 350 180C420 220 470 235 500 240H0Z"
          fill="url(#loginLeftWave1)"
          opacity="0.94"
        />
        <path
          d="M0 240V130C140 180 260 145 380 215C430 230 475 238 500 240H0Z"
          fill="url(#loginLeftWave2)"
          opacity="0.98"
        />
        <defs>
          <linearGradient id="loginLeftWave1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <linearGradient id="loginLeftWave2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-Left Watermark Typography */}
      <div
        className="login-left-watermark"
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '36px',
          zIndex: 6,
          color: '#FFFFFF',
          fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
          fontSize: '10.5px',
          fontWeight: 800,
          letterSpacing: '0.24em',
          lineHeight: '1.7',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div>STYLE</div>
        <div>GIFTS</div>
        <div>MEMORIES</div>
        <div>ALL HERE</div>
        <div
          style={{
            width: '24px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            marginTop: '5px',
          }}
        />
      </div>

      {/* Bottom-Right Purple Corner Wave */}
      <svg
        className="login-right-wave-svg"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '28%',
          height: '22%',
          minWidth: '260px',
          maxWidth: '440px',
          zIndex: 3,
          pointerEvents: 'none',
        }}
        viewBox="0 0 400 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M400 180V80C310 110 220 130 110 100C45 85 15 140 0 180H400Z"
          fill="url(#loginRightWave)"
          opacity="0.38"
        />
        <defs>
          <linearGradient id="loginRightWave" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-Right Handwritten Watermark */}
      <div
        className="login-right-watermark"
        style={{
          position: 'absolute',
          bottom: '22px',
          right: '36px',
          zIndex: 6,
          color: '#3B0764',
          fontFamily: "var(--font-script, 'Caveat', cursive)",
          fontSize: '34px',
          fontWeight: 700,
          transform: 'rotate(-5deg)',
          opacity: 0.95,
          pointerEvents: 'none',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.9)',
        }}
      >
        Shop Happiness ♡
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .login-left-watermark {
            display: none !important;
          }
          .login-right-watermark {
            font-size: 22px !important;
            bottom: 12px !important;
            right: 18px !important;
            opacity: 0.8 !important;
          }
          .login-right-wave-svg {
            width: 45% !important;
            height: 16% !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
