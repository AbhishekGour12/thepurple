'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Package, Search, Truck, CheckCircle2, AlertCircle, Clock, MapPin, ExternalLink } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import { orderApi } from '@/lib/api/orders';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNo = searchParams?.get('orderNumber') || '';

  const [orderId, setOrderId] = useState(initialOrderNo);
  const [phone, setPhone] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (initialOrderNo) {
      handleTrackDirect(initialOrderNo);
    }
  }, [initialOrderNo]);

  async function handleTrackDirect(num) {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await orderApi.trackOrder({ orderNumber: num });
      setStatusResult(data);
    } catch (err) {
      setErrorMessage(err.message || 'No tracking information found for this Order ID.');
    } finally {
      setLoading(false);
    }
  }

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    try {
      setLoading(true);
      setErrorMessage(null);
      setStatusResult(null);
      const data = await orderApi.trackOrder({ orderNumber: orderId.trim(), phone: phone.trim() });
      setStatusResult(data);
    } catch (err) {
      setErrorMessage(err.message || 'Could not find order. Please verify your Order ID and Phone Number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', width: '100%' }}>
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
          boxShadow: '0 4px 20px rgba(126, 34, 206, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Package size={28} color="#7E22CE" />
          <h1 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.85rem)', fontWeight: 900, color: '#18181B', margin: 0 }}>
            Live Order & Shiprocket Tracking
          </h1>
        </div>

        <p style={{ color: '#71717A', fontSize: '13.5px', marginBottom: '24px', lineHeight: 1.5 }}>
          Enter your Order Number (e.g. TP-81322216) to see live status from our warehouse and Shiprocket courier partners.
        </p>

        <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Order Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TP-81322216"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1.5px solid #E5E7EB',
                backgroundColor: '#FAF8FC',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                textTransform: 'uppercase',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="Enter Registered 10-digit Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1.5px solid #E5E7EB',
                backgroundColor: '#FAF8FC',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7E22CE 0%, #6D28D9 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '14px',
              fontWeight: 800,
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(109, 40, 217, 0.25)',
            }}
          >
            <Search size={16} />
            <span>{loading ? 'Fetching Tracking...' : 'Track Shipment'}</span>
          </button>
        </form>

        {/* Error Banner */}
        {errorMessage && (
          <div style={{ marginTop: '24px', padding: '14px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#DC2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} flexShrink={0} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Real Tracking Result */}
        {statusResult && (
          <div
            style={{
              marginTop: '28px',
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: '#FAF5FF',
              border: '1.5px solid #DDD6FE',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E9D5FF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={22} color="#7E22CE" />
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#18181B' }}>
                  Order {statusResult.orderNumber}
                </span>
              </div>

              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  backgroundColor: statusResult.status === 'DELIVERED' ? '#DCFCE7' : '#EFF6FF',
                  color: statusResult.status === 'DELIVERED' ? '#15803D' : '#1D4ED8',
                  border: statusResult.status === 'DELIVERED' ? '1px solid #86EFAC' : '1px solid #BFDBFE',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {statusResult.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', fontSize: '13px', color: '#374151', marginBottom: '16px' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '11.5px', display: 'block' }}>Customer:</span>
                <strong>{statusResult.customerName}</strong>
              </div>

              <div>
                <span style={{ color: '#6B7280', fontSize: '11.5px', display: 'block' }}>Courier:</span>
                <strong>{statusResult.courierName || 'Shiprocket Express'}</strong>
              </div>

              <div>
                <span style={{ color: '#6B7280', fontSize: '11.5px', display: 'block' }}>AWB Code:</span>
                <strong>{statusResult.awbCode || 'Pending Assignment'}</strong>
              </div>

              <div>
                <span style={{ color: '#6B7280', fontSize: '11.5px', display: 'block' }}>Delivery Address:</span>
                <strong>{statusResult.shippingAddress}</strong>
              </div>
            </div>

            {/* Live Shiprocket Timeline if available */}
            {statusResult.liveTracking?.activities && statusResult.liveTracking.activities.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #E9D5FF' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#581C87', marginBottom: '10px' }}>
                  Shiprocket Live Checkpoints:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {statusResult.liveTracking.activities.map((act, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7E22CE', marginTop: '5px' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#1E1B4B' }}>{act.activity || act.status}</div>
                        <div style={{ color: '#6B7280', fontSize: '11px' }}>{act.location} - {act.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FAF8FC', color: '#1E1B4B', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <AnnouncementBar />
      <MainHeader />
      <main style={{ flex: 1, padding: '40px 20px 80px', boxSizing: 'border-box' }}>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Loading tracking...</div>}>
          <TrackOrderContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
