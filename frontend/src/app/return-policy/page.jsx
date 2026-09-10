'use client';

import Link from 'next/link';
import { ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';

export default function ReturnPolicyPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FAF8FC' }}>
      <AnnouncementBar />
      <MainHeader />
      <main style={{ flex: 1, padding: '40px 24px' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <Link
            href="/"
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
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #E9D5FF',
              padding: 'clamp(24px, 4vw, 40px)',
              boxShadow: '0 4px 16px rgba(126, 34, 206, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <RefreshCw size={28} color="#7E22CE" />
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#18181B', margin: 0 }}>
                Return &amp; Exchange Policy
              </h1>
            </div>

            <p style={{ color: '#71717A', fontSize: '13px', marginBottom: '24px' }}>
              Last updated: September 2026
            </p>

            <div style={{ fontSize: '14.5px', lineHeight: '1.7', color: '#3F3F46', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                  1. 7-Day Easy Returns
                </h2>
                <p>
                  We want you to love your jewellery and gifts. If for any reason you are not completely satisfied, you can initiate a return or exchange request within 7 days of delivery.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                  2. Eligibility Conditions
                </h2>
                <p>
                  - Items must be unused, unwashed, and in their original packaging with tags, certificates, and warranty cards intact.<br />
                  - Custom engraved items or personalized bespoke pieces are eligible for exchange only in case of transit damage or defect.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                  3. Instant Refund Processing
                </h2>
                <p>
                  Once our quality team inspects the returned piece at our fulfillment hub, refunds are credited directly to your original payment mode (or UPI/Bank) within 3-5 business days.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
