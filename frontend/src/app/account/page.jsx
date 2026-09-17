'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Sparkles,
  ShieldCheck,
  Package,
  Heart,
  ShoppingBag,
  Headphones,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Calendar,
  ArrowRight,
  RefreshCw,
  Home,
  Check,
} from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import { setCustomer, clearCustomer, fetchCustomerProfile } from '@/store/slices/authSlice';
import { customerApi } from '@/lib/api/customer';
import { getStoredCustomerToken, setCustomerSession, clearCustomerSession } from '@/lib/auth/session';

export default function AccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const customerUser = useSelector((state) => state.auth?.customer?.user);
  const authStatus = useSelector((state) => state.auth?.customer?.status);
  const cartItemsCount = useSelector((state) => state.cart?.items?.length || 0);
  const wishlistCount = useSelector((state) => state.wishlist?.items?.length || 0);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('personal'); // 'personal' | 'address'

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    mobile: '',
    alternatePhone: '',
    shippingAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastNotice, setToastNotice] = useState(null);

  // Fetch / Sync profile on mount
  useEffect(() => {
    const token = getStoredCustomerToken();
    if (token && !customerUser) {
      dispatch(fetchCustomerProfile());
    }
  }, [dispatch, customerUser]);

  // Sync formData when customerUser loads or changes
  useEffect(() => {
    if (customerUser) {
      setFormData({
        name: customerUser.name || '',
        contactEmail: customerUser.contactEmail || customerUser.email || '',
        mobile: customerUser.mobile || '',
        alternatePhone: customerUser.alternatePhone || '',
        shippingAddress: customerUser.shippingAddress || '',
        landmark: customerUser.landmark || '',
        city: customerUser.city || '',
        state: customerUser.state || '',
        pincode: customerUser.pincode || '',
      });
    }
  }, [customerUser]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleOpenEditModal = (defaultTab = 'personal') => {
    setActiveModalTab(defaultTab);
    setErrorMessage('');
    setSaveSuccess(false);
    if (customerUser) {
      setFormData({
        name: customerUser.name || '',
        contactEmail: customerUser.contactEmail || customerUser.email || '',
        mobile: customerUser.mobile || '',
        alternatePhone: customerUser.alternatePhone || '',
        shippingAddress: customerUser.shippingAddress || '',
        landmark: customerUser.landmark || '',
        city: customerUser.city || '',
        state: customerUser.state || '',
        pincode: customerUser.pincode || '',
      });
    }
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (saving) return;
    setIsEditModalOpen(false);
    setErrorMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSaving(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Please enter your full name');
      }

      if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim())) {
        throw new Error('Please enter a valid email address');
      }

      if (formData.pincode && !/^\d{4,10}$/.test(formData.pincode.trim())) {
        throw new Error('Please enter a valid PIN / Postal code');
      }

      const updates = {
        name: formData.name.trim(),
        contactEmail: formData.contactEmail ? formData.contactEmail.trim() : null,
        mobile: formData.mobile ? formData.mobile.trim() : null,
        alternatePhone: formData.alternatePhone ? formData.alternatePhone.trim() : null,
        shippingAddress: formData.shippingAddress ? formData.shippingAddress.trim() : null,
        landmark: formData.landmark ? formData.landmark.trim() : null,
        city: formData.city ? formData.city.trim() : null,
        state: formData.state ? formData.state.trim() : null,
        pincode: formData.pincode ? formData.pincode.trim() : null,
      };

      const response = await customerApi.updateMe(updates);
      const updatedUser = response?.user || response;
      const token = getStoredCustomerToken();

      setCustomerSession(token, updatedUser);
      dispatch(setCustomer({ user: updatedUser, token }));

      setSaveSuccess(true);
      setToastNotice('Profile details saved successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccess(false);
      }, 1000);

      setTimeout(() => {
        setToastNotice(null);
      }, 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to sign out of your account?')) {
      clearCustomerSession();
      dispatch(clearCustomer());
      router.push('/');
    }
  };

  const token = typeof window !== 'undefined' ? getStoredCustomerToken() : null;

  // Unauthenticated / Guest State
  if (!token && !customerUser && authStatus !== 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAF8FC' }}>
        <AnnouncementBar />
        <MainHeader />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
          <div
            style={{
              maxWidth: '460px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '36px 24px',
              textAlign: 'center',
              boxShadow: '0 20px 40px -15px rgba(76, 29, 149, 0.12), 0 0 0 1px rgba(109, 40, 217, 0.06)',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#FAF5FF',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
                border: '2px solid #EDE9FE',
              }}
            >
              <User size={32} strokeWidth={2} />
            </div>
            <h1 style={{ fontSize: '21px', fontWeight: 800, color: '#18181B', marginBottom: '8px' }}>
              Sign In to View Your Account
            </h1>
            <p style={{ fontSize: '13.5px', color: '#6B7280', lineHeight: 1.5, marginBottom: '24px' }}>
              Access your saved addresses, manage contact details, track recent orders, and unlock member privileges.
            </p>
            <Link
              href="/login?redirect=/account"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '13px 20px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontSize: '14.5px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(109, 40, 217, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Sign In with Google</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const memberSinceFormatted = customerUser?.createdAt
    ? new Date(customerUser.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Active Member';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAF8FC' }}>
      <AnnouncementBar />
      <MainHeader />

      {/* Floating Toast Notification */}
      {toastNotice && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            maxWidth: 'calc(100vw - 40px)',
            backgroundColor: '#065F46',
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px rgba(6, 95, 70, 0.3)',
            zIndex: 9999,
            fontSize: '13.5px',
            fontWeight: 600,
            animation: 'slideInRight 0.3s ease forwards',
          }}
        >
          <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
          <span>{toastNotice}</span>
        </div>
      )}

      <main className="account-main-wrapper" style={{ flex: 1, padding: '24px 16px 54px 16px', maxWidth: '1200px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Breadcrumbs Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
          <Link href="/" style={{ color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Home size={14} />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span style={{ color: '#6D28D9', fontWeight: 600 }}>My Account</span>
        </div>

        {/* ─── HERO PROFILE BANNER ─── */}
        <div
          className="account-hero-banner"
          style={{
            background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)',
            borderRadius: '20px',
            padding: '30px 28px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 16px 36px -10px rgba(109, 40, 217, 0.28)',
            marginBottom: '24px',
          }}
        >
          {/* Subtle Ambient Background Elements */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              pointerEvents: 'none',
            }}
          />

          <div
            className="account-hero-inner"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* User Identity Info */}
            <div className="account-hero-identity" style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EDE9FE 0%, #FAF5FF 100%)',
                  color: '#581C87',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 800,
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.18)',
                  border: '3px solid rgba(255, 255, 255, 0.35)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {customerUser?.avatar ? (
                  <img
                    src={customerUser.avatar}
                    alt={customerUser.name || 'User Avatar'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(customerUser?.name)
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
                    {customerUser?.name || 'Valued Customer'}
                  </h1>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    <Sparkles size={11} />
                    <span>ThePurple Member</span>
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                    color: '#E9D5FF',
                    marginTop: '6px',
                    flexWrap: 'wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={14} style={{ flexShrink: 0 }} />
                    <span>{customerUser?.email || 'Authenticated'}</span>
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} style={{ flexShrink: 0 }} />
                    <span>Member since {memberSinceFormatted}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="account-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleOpenEditModal('personal')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  color: '#6D28D9',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={handleLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── QUICK SHORTCUTS ─── */}
        <div
          className="account-shortcuts-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          {/* Card 1: My Orders */}
          <Link
            href="/my-orders"
            style={{
              textDecoration: 'none',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              border: '1px solid #E8E1F5',
              boxShadow: '0 2px 8px rgba(76, 29, 149, 0.03)',
              transition: 'all 0.15s ease',
            }}
            className="account-shortcut-card"
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#FAF5FF',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Package size={20} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Purchase History</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#18181B' }}>My Orders</div>
            </div>
            <ArrowRight size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          </Link>

          {/* Card 2: Wishlist & Interests */}
          <Link
            href="/my-interests"
            style={{
              textDecoration: 'none',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              border: '1px solid #FCE7F3',
              boxShadow: '0 2px 8px rgba(219, 39, 119, 0.03)',
              transition: 'all 0.15s ease',
            }}
            className="account-shortcut-card"
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#FDF2F8',
                color: '#DB2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Heart size={20} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Saved For Later</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#18181B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </div>
            </div>
            <ArrowRight size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          </Link>

          {/* Card 3: Shopping Cart */}
          <Link
            href="/cart"
            style={{
              textDecoration: 'none',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              border: '1px solid #E8E1F5',
              boxShadow: '0 2px 8px rgba(76, 29, 149, 0.03)',
              transition: 'all 0.15s ease',
            }}
            className="account-shortcut-card"
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#FAF5FF',
                color: '#6D28D9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShoppingBag size={20} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Shopping Bag</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#18181B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                My Cart {cartItemsCount > 0 && `(${cartItemsCount})`}
              </div>
            </div>
            <ArrowRight size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          </Link>

          {/* Card 4: Support & Help */}
          <Link
            href="/contact"
            style={{
              textDecoration: 'none',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              border: '1px solid #DCFCE7',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.03)',
              transition: 'all 0.15s ease',
            }}
            className="account-shortcut-card"
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Headphones size={20} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>24x7 Assistance</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#18181B' }}>Help Center</div>
            </div>
            <ArrowRight size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          </Link>
        </div>

        {/* ─── TWO-COLUMN DETAILS GRID ─── */}
        <div
          className="account-details-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '20px',
          }}
        >
          {/* ──── LEFT PANEL: Personal & Contact Details ──── */}
          <div
            className="account-card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E8E1F5',
              padding: '24px 20px',
              boxShadow: '0 3px 12px rgba(76, 29, 149, 0.03)',
              boxSizing: 'border-box',
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                paddingBottom: '14px',
                borderBottom: '1px solid #F3F4F6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: '#FAF5FF',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <User size={17} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181B', margin: 0 }}>
                    Personal &amp; Contact Info
                  </h2>
                  <p style={{ fontSize: '11.5px', color: '#6B7280', margin: '2px 0 0 0' }}>
                    Profile &amp; communication details
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenEditModal('personal')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  backgroundColor: '#FAF5FF',
                  color: '#6D28D9',
                  border: '1px solid #EDE9FE',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Edit3 size={12} />
                <span>Edit</span>
              </button>
            </div>

            {/* Field Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Full Name */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ color: '#7C3AED', marginTop: '2px', flexShrink: 0 }}>
                  <User size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 500 }}>Full Name</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#18181B', marginTop: '1px', wordBreak: 'break-word' }}>
                    {customerUser?.name || 'Not provided'}
                  </div>
                </div>
              </div>

              {/* Primary Mobile Number */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ color: '#7C3AED', marginTop: '2px', flexShrink: 0 }}>
                  <Phone size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 500 }}>Primary Mobile / WhatsApp</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#18181B', marginTop: '1px' }}>
                    {customerUser?.mobile ? `+91 ${customerUser.mobile}` : (
                      <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontWeight: 400 }}>
                        No phone number added
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Alternate Contact Phone */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ color: '#7C3AED', marginTop: '2px', flexShrink: 0 }}>
                  <Phone size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 500 }}>Alternate Phone Number</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#18181B', marginTop: '1px' }}>
                    {customerUser?.alternatePhone ? `+91 ${customerUser.alternatePhone}` : (
                      <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontWeight: 400 }}>
                        None provided
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Email */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ color: '#7C3AED', marginTop: '2px', flexShrink: 0 }}>
                  <Mail size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 500 }}>
                      Notification &amp; Contact Email
                    </div>
                    <span
                      style={{
                        fontSize: '9.5px',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: '#EDE9FE',
                        color: '#6D28D9',
                        fontWeight: 600,
                      }}
                    >
                      Editable
                    </span>
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#18181B', marginTop: '1px', wordBreak: 'break-all' }}>
                    {customerUser?.contactEmail || customerUser?.email || 'Not specified'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px', lineHeight: 1.3 }}>
                    Used for order confirmations and invoice copies.
                  </div>
                </div>
              </div>

              {/* Google SSO Login Account */}
              <div
                style={{
                  backgroundColor: '#FAF5FF',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid #EDE9FE',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    color: '#6D28D9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  }}
                >
                  <Lock size={14} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#6D28D9', fontWeight: 700, textTransform: 'uppercase' }}>
                    Google SSO Identity
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1E1B4B',
                      marginTop: '1px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {customerUser?.email}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: '#059669',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={13} />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* ──── RIGHT PANEL: Saved Address & Shipping Details ──── */}
          <div
            className="account-card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E8E1F5',
              padding: '24px 20px',
              boxShadow: '0 3px 12px rgba(76, 29, 149, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                paddingBottom: '14px',
                borderBottom: '1px solid #F3F4F6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: '#FAF5FF',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={17} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#18181B', margin: 0 }}>
                    Default Shipping Address
                  </h2>
                  <p style={{ fontSize: '11.5px', color: '#6B7280', margin: '2px 0 0 0' }}>
                    Primary delivery location
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenEditModal('address')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  backgroundColor: '#FAF5FF',
                  color: '#6D28D9',
                  border: '1px solid #EDE9FE',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Edit3 size={12} />
                <span>{customerUser?.shippingAddress ? 'Edit' : 'Add'}</span>
              </button>
            </div>

            {/* Address Content */}
            {customerUser?.shippingAddress ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#FAF8FC',
                    border: '1px solid #EDE9FE',
                    position: 'relative',
                    wordBreak: 'break-word',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '5px',
                        backgroundColor: '#EDE9FE',
                        color: '#6D28D9',
                        fontSize: '10.5px',
                        fontWeight: 700,
                      }}
                    >
                      DEFAULT SHIPPING
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Check size={12} /> Active Destination
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', color: '#18181B', fontWeight: 600, lineHeight: 1.5 }}>
                    {customerUser.shippingAddress}
                  </div>

                  {customerUser.landmark && (
                    <div style={{ fontSize: '12.5px', color: '#6B7280', marginTop: '6px' }}>
                      <span style={{ fontWeight: 500, color: '#4B5563' }}>Landmark: </span>
                      {customerUser.landmark}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {customerUser.city && (
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
                        {customerUser.city}
                      </span>
                    )}
                    {customerUser.state && (
                      <span style={{ fontSize: '12.5px', color: '#6B7280' }}>
                        {customerUser.state}
                      </span>
                    )}
                    {customerUser.pincode && (
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor: '#F3E8FF',
                          color: '#6D28D9',
                          padding: '2px 7px',
                          borderRadius: '5px',
                        }}
                      >
                        PIN: {customerUser.pincode}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '9px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #DCFCE7',
                    color: '#15803D',
                    fontSize: '12px',
                    lineHeight: 1.4,
                  }}
                >
                  <ShieldCheck size={15} style={{ flexShrink: 0 }} />
                  <span>Prefilled automatically at checkout for express ordering.</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '30px 14px',
                  textAlign: 'center',
                  backgroundColor: '#FAF8FC',
                  borderRadius: '12px',
                  border: '1px dashed #D8B4FE',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#FAF5FF',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <MapPin size={20} />
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#18181B' }}>
                  No Delivery Address Saved
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', maxWidth: '260px', marginTop: '4px', lineHeight: 1.4 }}>
                  Add your home or office address for express checkout.
                </div>
                <button
                  onClick={() => handleOpenEditModal('address')}
                  style={{
                    marginTop: '14px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(124, 58, 237, 0.22)',
                  }}
                >
                  + Add Shipping Address
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── EDIT PROFILE & ADDRESS MODAL ─── */}
      {isEditModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '12px',
            boxSizing: 'border-box',
          }}
          onClick={handleCloseEditModal}
        >
          <div
            className="account-edit-modal"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(76, 29, 149, 0.25)',
              border: '1px solid #E8E1F5',
              animation: 'modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 20px',
                borderBottom: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#18181B', margin: 0 }}>
                  Edit Profile &amp; Address Details
                </h3>
                <p style={{ fontSize: '11.5px', color: '#6B7280', margin: '2px 0 0 0' }}>
                  Update your contact information and default delivery location
                </p>
              </div>

              <button
                onClick={handleCloseEditModal}
                disabled={saving}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#F3F4F6',
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #F3F4F6', padding: '0 20px' }}>
              <button
                type="button"
                onClick={() => setActiveModalTab('personal')}
                style={{
                  padding: '11px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeModalTab === 'personal' ? '2px solid #7C3AED' : '2px solid transparent',
                  color: activeModalTab === 'personal' ? '#6D28D9' : '#6B7280',
                  fontWeight: activeModalTab === 'personal' ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <User size={14} />
                <span>Personal &amp; Contact</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('address')}
                style={{
                  padding: '11px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeModalTab === 'address' ? '2px solid #7C3AED' : '2px solid transparent',
                  color: activeModalTab === 'address' ? '#6D28D9' : '#6B7280',
                  fontWeight: activeModalTab === 'address' ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MapPin size={14} />
                <span>Shipping Address</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} style={{ padding: '20px' }}>
              {errorMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    color: '#DC2626',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {saveSuccess && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#047857',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                  <span>Details saved successfully!</span>
                </div>
              )}

              {/* ─── TAB 1: Personal & Contact ─── */}
              {activeModalTab === 'personal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                      Full Name <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '9px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13.5px',
                        color: '#18181B',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                      onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                    />
                  </div>

                  {/* Primary Mobile */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                      Primary Mobile Number
                    </label>
                    <div style={{ display: 'flex' }}>
                      <span
                        style={{
                          padding: '10px 12px',
                          backgroundColor: '#F3F4F6',
                          border: '1px solid #D1D5DB',
                          borderRight: 'none',
                          borderRadius: '9px 0 0 9px',
                          fontSize: '13.5px',
                          color: '#6B7280',
                          fontWeight: 600,
                        }}
                      >
                        +91
                      </span>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        maxLength={15}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '10px 12px',
                          borderRadius: '0 9px 9px 0',
                          border: '1px solid #D1D5DB',
                          fontSize: '13.5px',
                          color: '#18181B',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                        onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                      />
                    </div>
                  </div>

                  {/* Alternate Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                      Alternate Phone Number
                    </label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      placeholder="Optional secondary phone number"
                      maxLength={15}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '9px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13.5px',
                        color: '#18181B',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                      onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '3px' }}>
                      Contact &amp; Invoicing Email
                    </label>
                    <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 5px 0' }}>
                      Receives tracking receipts and invoices. Does not change Google login email.
                    </p>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="e.g. contact@example.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '9px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13.5px',
                        color: '#18181B',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                      onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                    />
                  </div>
                </div>
              )}

              {/* ─── TAB 2: Shipping Address ─── */}
              {activeModalTab === 'address' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Street / House Address */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                      House / Flat No., Building &amp; Street Address
                    </label>
                    <textarea
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      placeholder="e.g. Flat 402, Royal Palms Residency, 12th Main Road"
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '9px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13.5px',
                        color: '#18181B',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                      onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                      Landmark
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="e.g. Near City Mall / Opposite Metro Pillar 142"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '9px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13.5px',
                        color: '#18181B',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                      onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                    />
                  </div>

                  {/* City & State Grid */}
                  <div className="account-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                        City / District
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Mumbai"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '9px',
                          border: '1px solid #D1D5DB',
                          fontSize: '13.5px',
                          color: '#18181B',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                        onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                        State / Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="e.g. Maharashtra"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '9px',
                          border: '1px solid #D1D5DB',
                          fontSize: '13.5px',
                          color: '#18181B',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                        onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                      PIN / Postal Code
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="e.g. 400001"
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '9px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13.5px',
                        color: '#18181B',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                      onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                    />
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '20px',
                  paddingTop: '14px',
                  borderTop: '1px solid #F3F4F6',
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={saving}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(109, 40, 217, 0.3)',
                    opacity: saving ? 0.75 : 1,
                  }}
                >
                  {saving && <RefreshCw size={14} className="spinner-animation" />}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />

      {/* Global Embedded Responsive Styles */}
      <style jsx global>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .account-shortcut-card:hover {
          transform: translateY(-2px);
          border-color: #7C3AED !important;
          box-shadow: 0 8px 20px -4px rgba(109, 40, 217, 0.12) !important;
        }
        .spinner-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* ─── FULL MOBILE RESPONSIVENESS ─── */
        @media (max-width: 850px) {
          .account-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .account-hero-banner {
            padding: 22px 18px !important;
          }
          .account-hero-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .account-hero-actions {
            width: 100% !important;
          }
          .account-hero-actions button {
            flex: 1 1 auto !important;
          }
        }
        @media (max-width: 540px) {
          .account-main-wrapper {
            padding: 16px 12px 40px 12px !important;
          }
          .account-shortcuts-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .account-modal-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 380px) {
          .account-shortcuts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
