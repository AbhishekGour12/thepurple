"use client";

import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
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
            <ShieldCheck size={26} color="#7E22CE" />
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#18181B', margin: 0 }}>
              Terms & Conditions
            </h1>
          </div>

          <p style={{ color: '#71717A', fontSize: '13px', marginBottom: '24px' }}>
            Last updated: September 2026
          </p>

          <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#3F3F46', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <section>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or purchasing from ThePurple, you agree to be bound by these Terms & Conditions. If you do not agree to all terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                2. Products & Pricing
              </h2>
              <p>
                All jewellery, accessories, and gifts displayed on ThePurple are subject to availability. We reserve the right to modify prices and product specifications at any time without prior notice.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                3. Customer Accounts & Authentication
              </h2>
              <p>
                You may authenticate your account securely using Google sign-in. You are responsible for maintaining the confidentiality of your credentials and account access.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                4. Shipping & Returns
              </h2>
              <p>
                Standard shipping timelines and return policies apply to all orders placed through ThePurple platform. Damaged or defective items must be reported within 48 hours of delivery.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
