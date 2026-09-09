"use client";

import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8FC', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#7E22CE',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            marginBottom: '24px',
          }}
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #E9D5FF',
            padding: '36px 40px',
            boxShadow: '0 4px 16px rgba(126, 34, 206, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Lock size={26} color="#7E22CE" />
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#18181B', margin: 0 }}>
              Privacy Policy
            </h1>
          </div>

          <p style={{ color: '#71717A', fontSize: '13px', marginBottom: '24px' }}>
            Last updated: September 2026
          </p>

          <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#3F3F46', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <section>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                1. Information We Collect
              </h2>
              <p>
                When you sign in with Google, we receive your verified name, email address, and profile picture provided by Google OAuth. We collect order information, shipping addresses, and payment confirmation IDs necessary to process your purchases.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                2. How We Use Your Data
              </h2>
              <p>
                We use your data solely to fulfill orders, provide order tracking updates, personalize your shopping cart and wishlist, and ensure security on our platform.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                3. Data Security & Storage
              </h2>
              <p>
                We implement industry-standard encryption protocols and secure database systems. We do not store Google passwords or share your personal data with third-party marketers.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                4. Contact Us
              </h2>
              <p>
                If you have questions regarding your data privacy, please contact our support team at support@thepurple.in.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
