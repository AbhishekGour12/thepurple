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
              <ShieldCheck size={28} color="#7E22CE" />
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#18181B', margin: 0 }}>
                Return &amp; Cancellation Policy
              </h1>
            </div>

            <p style={{ color: '#71717A', fontSize: '13px', marginBottom: '24px' }}>
              Last updated: October 2026
            </p>

            <div style={{ fontSize: '14.5px', lineHeight: '1.7', color: '#3F3F46', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                  1. Non-Returnable &amp; Final Sale Policy
                </h2>
                <p>
                  Due to the handcrafted, artisanal nature of our fine jewellery and strict hygiene standards, <strong>all sales are final</strong>. We do not accept returns, refunds, or exchanges once an order has been successfully delivered, and our platform does not feature automated product return functionality.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                  2. Damaged in Transit or Manufacturing Defect
                </h2>
                <p>
                  Every piece undergoes rigorous multi-tier quality checks and is sealed in tamper-evident, insured luxury packaging prior to dispatch. In the rare event that your package arrives physically damaged, tampered, or defective, please contact our concierge team at <a href="mailto:nowthepurple26@gmail.com" style={{ color: '#7E22CE', fontWeight: 700, textDecoration: 'none' }}>nowthepurple26@gmail.com</a> or via WhatsApp/Call at <strong>+91 89660 80203</strong> within <strong>48 hours</strong> of delivery.
                </p>
                <p style={{ marginTop: '8px' }}>
                  Please share clear unboxing photos or video evidence showing the parcel packaging and the damaged item. Upon verification by our quality control team, we will promptly arrange an exchange replacement.
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
