"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { adminAuthApi } from '@/lib/api/admin/auth';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Reset token is missing or invalid. Please request a new reset link.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await adminAuthApi.resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Create New Password
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>
          Set a secure new password for your admin account
        </p>
      </div>

      {success ? (
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
            Password Updated!
          </h3>
          <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.5 }}>
            Your administrator password has been reset successfully. Redirecting you to login...
          </p>
          <div style={{ marginTop: '20px' }}>
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
              Log in Now
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

          {!token && (
            <div style={{
              padding: '12px',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              color: '#92400E',
              fontSize: '13px',
            }}>
              Warning: Missing reset token in URL. Please use the link sent to your email.
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              New Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', color: '#9CA3AF' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FAF5FF',
                  fontSize: '14px',
                  color: '#1E1B4B',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', color: '#9CA3AF' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
            disabled={loading || !token}
            style={{
              marginTop: '6px',
              padding: '13px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6B21A8 0%, #7E22CE 100%)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: loading || !token ? 'not-allowed' : 'pointer',
              opacity: loading || !token ? 0.75 : 1,
            }}
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FDFBF7',
      padding: '20px',
    }}>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
