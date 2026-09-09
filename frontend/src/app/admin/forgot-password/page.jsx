"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { adminAuthApi } from '@/lib/api/admin/auth';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [debugUrl, setDebugUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your administrator email address');
      return;
    }

    setLoading(true);
    try {
      const res = await adminAuthApi.forgotPassword(email.trim());
      setSubmitted(true);
      if (res?.debugResetUrl) {
        setDebugUrl(res.debugResetUrl);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FDFBF7',
      backgroundImage: `
        radial-gradient(circle at 10% 20%, rgba(147, 51, 234, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(192, 132, 252, 0.1) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(250, 245, 255, 0.8) 0%, transparent 100%)
      `,
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid #E9D5FF',
        borderRadius: '20px',
        boxShadow: '0 20px 35px -5px rgba(107, 33, 168, 0.12), 0 10px 15px -5px rgba(107, 33, 168, 0.05)',
        padding: '40px 36px',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <Link
            href="/admin/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#7E22CE',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: '16px',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#2E1065',
            margin: '0 0 6px 0',
          }}>
            Reset Password
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>
            Enter your admin email to receive a secure password reset link
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
              marginBottom: '16px',
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E1B4B', margin: '0 0 8px 0' }}>
              Check Your Inbox
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.5 }}>
              If an active account exists for <strong>{email}</strong>, we have dispatched a single-use password reset link.
            </p>

            {debugUrl && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #E9D5FF',
                borderRadius: '8px',
                fontSize: '12px',
                textAlign: 'left',
              }}>
                <strong style={{ color: '#7E22CE' }}>Local Dev Reset Link:</strong>
                <div style={{ marginTop: '4px', wordBreak: 'break-all' }}>
                  <Link href={debugUrl} style={{ color: '#6B21A8', textDecoration: 'underline' }}>
                    {debugUrl}
                  </Link>
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <Link
                href="/admin/login"
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  backgroundColor: '#7E22CE',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '14px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '13px',
              }}>
                <ShieldAlert size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '6px',
              }}>
                Administrator Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', color: '#9CA3AF' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@thepurple.in"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FAF5FF',
                    fontSize: '14px',
                    color: '#1E1B4B',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px',
                padding: '13px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6B21A8 0%, #7E22CE 100%)',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? 'Sending link...' : 'Send Password Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
