'use client';

import Link from 'next/link';
import { ArrowLeft, Truck, ShieldCheck } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';

export default function ShippingPolicyPage() {
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
              <Truck size={28} color="#7E22CE" />
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#18181B', margin: 0 }}>
                Shipping &amp; Delivery Policy
              </h1>
            </div>

            <p style={{ color: '#71717A', fontSize: '13px', marginBottom: '24px' }}>
              Last updated: September 2026
            </p>

            <div style={{ fontSize: '14.5px', lineHeight: '1.7', color: '#3F3F46', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                  1. Free Insured Shipping
                </h2>
                <p>
                  We offer 100% complimentary insured express shipping across all pin codes in India on all orders. Every package is sealed in tamper-proof, discreet packaging with full transit insurance.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                  2. Dispatch &amp; Delivery Timelines
                </h2>
                <p>
                  - Metro Cities: Delivered within 2 to 4 business days.<br />
                  - Rest of India: Delivered within 4 to 7 business days.<br />
                  - Made-to-order &amp; Custom Engraved Pieces: Dispatched within 5 business days after crafting.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#18181B', marginBottom: '6px' }}>
                  3. Order Tracking
                </h2>
                <p>
                  As soon as your order is handed over to our courier partner (Bluedart, Delhivery), you will receive a tracking link via SMS, WhatsApp, and Email to monitor your parcel in real-time.
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
