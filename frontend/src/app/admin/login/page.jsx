"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { loginAdminUser } from '@/store/slices/authSlice';

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(
        loginAdminUser({ email: email.trim(), password })
      );

      if (loginAdminUser.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        if (payload?.admin?.mustChangePassword) {
          router.replace('/admin/change-password');
        } else {
          router.replace('/admin');
        }
      } else {
        setErrorMessage(
          resultAction.payload || 'Invalid administrator credentials. Please check and try again.'
        );
      }
    } catch {
      setErrorMessage('Unable to connect to server. Please try again.');
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
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6B21A8 0%, #9333EA 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '24px',
            marginBottom: '16px',
            boxShadow: '0 8px 20px rgba(126, 34, 206, 0.3)',
          }}>
            TP
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#2E1065',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
          }}>
            ThePurple Admin
          </h1>
          <p style={{
            fontSize: '0.9rem',
            color: '#6B7280',
            margin: 0,
          }}>
            Sign in to manage catalog, orders, and system operations
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            color: '#DC2626',
            fontSize: '13px',
            marginBottom: '20px',
            lineHeight: 1.4,
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '6px',
            }}>
              Email Address
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '14px',
                color: '#9CA3AF',
              }} />
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
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#7E22CE')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}>
              <label style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
              }}>
                Password
              </label>
              <Link
                href="/admin/forgot-password"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#7E22CE',
                  textDecoration: 'none',
                }}
              >
                Forgot Password?
              </Link>
            </div>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '14px',
                color: '#9CA3AF',
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FAF5FF',
                  fontSize: '14px',
                  color: '#1E1B4B',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#7E22CE')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
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
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '13px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6B21A8 0%, #7E22CE 100%)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 16px rgba(126, 34, 206, 0.3)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Admin Panel</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #FAF5FF',
          textAlign: 'center',
          fontSize: '12px',
          color: '#9CA3AF',
        }}>
          Protected by ThePurple Role-Based Authorization Engine
        </div>
      </div>
    </div>
  );
}
