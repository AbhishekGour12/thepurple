'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Search, Truck, CheckCircle2 } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [statusResult, setStatusResult] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId) return;
    setStatusResult({
      orderId: orderId.toUpperCase(),
      status: 'In Transit',
      courier: 'Bluedart Express',
      estimatedDelivery: '2 - 3 Days',
      currentLocation: 'New Delhi Sorting Hub',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FAF8FC' }}>
      <AnnouncementBar />
      <MainHeader />
      <main style={{ flex: 1, padding: '40px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Package size={28} color="#7E22CE" />
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#18181B', margin: 0 }}>
                Track Your Order
              </h1>
            </div>

            <p style={{ color: '#71717A', fontSize: '14px', marginBottom: '24px' }}>
              Enter your Order ID and registered Phone Number to get real-time tracking updates.
            </p>

            <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Order ID (e.g. TP-98231)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Order ID"
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
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter Registered Phone Number"
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
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7E22CE 0%, #6D28D9 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(109, 40, 217, 0.25)',
                }}
              >
                <Search size={16} />
                <span>Track Shipment</span>
              </button>
            </form>

            {statusResult && (
              <div
                style={{
                  marginTop: '28px',
                  padding: '20px',
                  borderRadius: '16px',
                  backgroundColor: '#FAF5FF',
                  border: '1.5px solid #DDD6FE',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Truck size={20} color="#7E22CE" />
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#18181B' }}>
                    Order {statusResult.orderId}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {statusResult.status}
                  </span>
                </div>
                <div style={{ fontSize: '13.5px', color: '#5F5A6B', lineHeight: 1.6 }}>
                  Courier: <strong>{statusResult.courier}</strong><br />
                  Location: <strong>{statusResult.currentLocation}</strong><br />
                  Estimated Delivery: <strong>{statusResult.estimatedDelivery}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
