'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Package, Truck, ArrowRight, ShieldCheck, ShoppingBag, Clock } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import { orderApi } from '@/lib/api/orders';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      async function loadOrder() {
        try {
          const data = await orderApi.getOrderDetails(orderId);
          setOrder(data);
        } catch (err) {
          console.warn('Could not load order details:', err);
        } finally {
          setLoading(false);
        }
      }
      loadOrder();
    }
  }, [orderId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FCFBFE', color: '#1E1B4B', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <AnnouncementBar />
      <MainHeader />

      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%', padding: '40px 20px 80px', boxSizing: 'border-box' }}>
        
        {/* Success Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E9D5FF',
            padding: ' clamp(24px, 5vw, 44px)',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(126, 34, 206, 0.06)',
          }}
        >
          {/* Animated Success Badge */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#F0FDF4',
              border: '2px solid #BBF7D0',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle2 size={44} />
          </div>

          <span
            style={{
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: '20px',
              backgroundColor: '#FAF5FF',
              color: '#7E22CE',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '10px',
            }}
          >
            PAYMENT CONFIRMED ✓
          </span>

          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: '#1E1B4B', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Thank You For Your Order!
          </h1>

          <p style={{ fontSize: '14.5px', color: '#6B7280', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Your order has been placed successfully and sent to our warehouse for packaging. You will receive an SMS and email with live Shiprocket tracking updates.
          </p>

          {/* Order Info Badge */}
          <div
            style={{
              backgroundColor: '#FAF8FC',
              borderRadius: '16px',
              border: '1px solid #E5E7EB',
              padding: '20px',
              marginBottom: '28px',
              textAlign: 'left',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Order Reference</div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#7E22CE', marginTop: '2px' }}>
                {order?.orderNumber || orderId}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Payment Method</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E1B4B', marginTop: '2px' }}>
                Razorpay Online (Paid)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Delivery Method</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E1B4B', marginTop: '2px' }}>
                Shiprocket Express (2-4 Days)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Total Amount Paid</div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#1E1B4B', marginTop: '2px' }}>
                {order ? `₹${parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}` : 'Verified'}
              </div>
            </div>
          </div>

          {/* Items Summary if loaded */}
          {order?.items && order.items.length > 0 && (
            <div style={{ textAlign: 'left', marginBottom: '28px', borderTop: '1px solid #F3F4F6', paddingTop: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '12px' }}>
                Purchased Items ({order.items.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {order.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#1E1B4B', fontWeight: 600 }}>
                      {item.productName} <span style={{ color: '#6B7280', fontWeight: 400 }}>× {item.quantity}</span>
                    </span>
                    <span style={{ fontWeight: 800, color: '#1E1B4B' }}>
                      ₹{parseFloat(item.totalPrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href={`/my-orders/${order?.orderNumber || orderId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 26px',
                borderRadius: '12px',
                backgroundColor: '#7E22CE',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(126, 34, 206, 0.3)',
              }}
            >
              <Package size={16} />
              <span>View Order Details</span>
            </Link>

            <Link
              href={`/my-orders`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '13px 22px',
                borderRadius: '12px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #E9D5FF',
                color: '#7E22CE',
                fontSize: '13.5px',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              <span>My Orders</span>
            </Link>

            <Link
              href="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '13px 22px',
                borderRadius: '12px',
                backgroundColor: '#F3F4F6',
                border: '1px solid #E5E7EB',
                color: '#374151',
                fontSize: '13.5px',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              <span>Shop More</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
