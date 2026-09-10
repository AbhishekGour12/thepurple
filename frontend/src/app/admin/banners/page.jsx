"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  Tag,
  Layers,
  Eye,
  ExternalLink,
  Info,
  Check,
  RefreshCw,
  Copy,
  Sliders,
} from 'lucide-react';
import { adminBannerApi } from '@/lib/api/admin/banners';

const PLACEMENT_CONFIG = {
  HOME_HERO: {
    id: 'HOME_HERO',
    name: 'Home Hero Carousel',
    subtitle: 'Top full-width rotating carousel on the home page',
    recommendedSize: '1920 × 720 px',
    aspectRatio: '8:3 or 16:6',
    format: 'WebP, JPG, PNG (Max 25MB)',
    tips: 'For standard slides, keep key visual subjects centered or right-aligned so left text overlays clearly. In Full Image mode, upload complete graphics at 1920×720px.',
  },
  PRODUCTS_HERO: {
    id: 'PRODUCTS_HERO',
    name: 'Products Page Carousel',
    subtitle: 'Header carousel on the products & catalogue page',
    recommendedSize: '1440 × 380 px',
    aspectRatio: '18:5 (or 600×600px square for card visual)',
    format: 'WebP, JPG, PNG (Max 25MB)',
    tips: 'Ideal for showcasing product categories, active promotions, and seasonal collections above the product catalog filters.',
  },
  HOME_OFFER: {
    id: 'HOME_OFFER',
    name: 'Home Special Offer Banner',
    subtitle: 'Promotional discount banner with coupon code on home page',
    recommendedSize: '1440 × 280 px',
    aspectRatio: '5:1 (or 400×400px for icon visual)',
    format: 'WebP, JPG, PNG (Max 25MB)',
    tips: 'Features a coupon code copy button and quick CTA button to drive immediate conversions.',
  },
};

const COLOR_PRESETS = [
  { name: 'Royal Purple', hex: '#6D28D9', bg: 'linear-gradient(180deg, #F6ECFF 0%, #EFE3FC 45%, #FCFBFE 100%)' },
  { name: 'Rose Gold / Pink', hex: '#BE185D', bg: 'linear-gradient(180deg, #FDEBF4 0%, #F8D8EA 45%, #FCFBFE 100%)' },
  { name: 'Deep Indigo', hex: '#4338CA', bg: 'linear-gradient(180deg, #EEF2FF 0%, #E0E7FF 45%, #FCFBFE 100%)' },
  { name: 'Emerald Green', hex: '#059669', bg: 'linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 45%, #FCFBFE 100%)' },
  { name: 'Amber Gold', hex: '#D97706', bg: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 45%, #FCFBFE 100%)' },
  { name: 'Midnight Dark', hex: '#9333EA', bg: 'linear-gradient(135deg, #130726 0%, #200D3E 50%, #3B1270 100%)' },
];

export default function BannerManagementPage() {
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);
  const canManage = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'MANAGER';

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('HOME_HERO'); // HOME_HERO | PRODUCTS_HERO | HOME_OFFER | ALL
  const [search, setSearch] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, banner: null });

  const fileInputRef = useRef(null);

  // Modal State for Add / Edit
  const [modal, setModal] = useState({
    isOpen: false,
    isEdit: false,
    id: null,
    title: '',
    highlight: '',
    subtitle: '',
    badge: '',
    imageUrl: '',
    mobileImageUrl: '',
    linkUrl: '',
    primaryBtnText: '',
    primaryBtnUrl: '',
    secondaryBtnText: '',
    secondaryBtnUrl: '',
    placement: 'HOME_HERO',
    bannerType: 'CAROUSEL_SLIDE',
    accentColor: '#6D28D9',
    bgGradient: 'linear-gradient(180deg, #F6ECFF 0%, #EFE3FC 45%, #FCFBFE 100%)',
    couponCode: '',
    discountTag: '',
    isFullImage: false,
    isActive: true,
    displayOrder: 0,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminBannerApi.listBanners({
        placement: activeTab === 'ALL' ? undefined : activeTab,
        search,
      });
      setBanners(data?.banners || []);
    } catch (err) {
      showToast(err?.message || 'Failed to load banners', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Open Modal to create
  const handleOpenCreate = () => {
    const defaultPlacement = activeTab === 'ALL' ? 'HOME_HERO' : activeTab;
    const isOffer = defaultPlacement === 'HOME_OFFER';
    const isProducts = defaultPlacement === 'PRODUCTS_HERO';

    setModal({
      isOpen: true,
      isEdit: false,
      id: null,
      title: isOffer ? 'Special Offer Just For You!' : isProducts ? 'Exquisite Fine Jewellery' : 'Shine in Every',
      highlight: isOffer ? '10% Off' : isProducts ? 'Handcrafted Perfection' : 'Royal Moment',
      subtitle: isOffer
        ? 'Get 10% off on your first order with complimentary luxury gift packaging.'
        : isProducts
        ? 'Explore certified 22K BIS Hallmarked gold chains, bridal necklaces & solitaire diamond rings.'
        : 'Handcrafted pure 22K gold rope chains, heirloom bridal necklaces & pendant sets.',
      badge: isOffer ? 'LIMITED TIME PROMOTION' : isProducts ? '👑 ROYAL COLLECTION 2026' : '✨ ROYAL 22K GOLD',
      imageUrl: '',
      mobileImageUrl: '',
      linkUrl: isOffer ? '/shop' : '/category/chains',
      primaryBtnText: isOffer ? 'Shop Now' : isProducts ? 'View All Categories' : 'Shop 22K Gold',
      primaryBtnUrl: isOffer ? '/shop' : '/products',
      secondaryBtnText: isOffer ? '' : isProducts ? 'Filter Collection' : 'Explore Collection',
      secondaryBtnUrl: isOffer ? '' : isProducts ? '/products' : '/category/necklaces',
      placement: defaultPlacement,
      bannerType: isOffer ? 'PROMO_BANNER' : 'CAROUSEL_SLIDE',
      accentColor: isProducts ? '#9333EA' : isOffer ? '#6D28D9' : '#6D28D9',
      bgGradient: isProducts
        ? 'linear-gradient(135deg, #130726 0%, #200D3E 50%, #3B1270 100%)'
        : 'linear-gradient(180deg, #F6ECFF 0%, #EFE3FC 45%, #FCFBFE 100%)',
      couponCode: isOffer ? 'WELCOME10' : '',
      discountTag: isOffer ? '🔥 UP TO 25% OFF' : isProducts ? 'UP TO 40% OFF' : '🔥 UP TO 25% OFF',
      isFullImage: false,
      isActive: true,
      displayOrder: banners.length,
    });
  };

  // Open Modal to edit
  const handleOpenEdit = (banner) => {
    setModal({
      isOpen: true,
      isEdit: true,
      id: banner.id,
      title: banner.title || '',
      highlight: banner.highlight || '',
      subtitle: banner.subtitle || banner.description || '',
      badge: banner.badge || '',
      imageUrl: banner.imageUrl || '',
      mobileImageUrl: banner.mobileImageUrl || '',
      linkUrl: banner.linkUrl || '',
      primaryBtnText: banner.primaryBtnText || '',
      primaryBtnUrl: banner.primaryBtnUrl || '',
      secondaryBtnText: banner.secondaryBtnText || '',
      secondaryBtnUrl: banner.secondaryBtnUrl || '',
      placement: banner.placement || 'HOME_HERO',
      bannerType: banner.bannerType || 'CAROUSEL_SLIDE',
      accentColor: banner.accentColor || '#6D28D9',
      bgGradient: banner.bgGradient || 'linear-gradient(180deg, #F6ECFF 0%, #EFE3FC 45%, #FCFBFE 100%)',
      couponCode: banner.couponCode || '',
      discountTag: banner.discountTag || '',
      isFullImage: Boolean(banner.isFullImage),
      isActive: Boolean(banner.isActive),
      displayOrder: banner.displayOrder || 0,
    });
  };

  // Image Upload Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await adminBannerApi.uploadBannerImage(file);
      if (res?.imageUrl) {
        setModal((prev) => ({ ...prev, imageUrl: res.imageUrl }));
        showToast('Image uploaded and optimized successfully!');
      } else {
        throw new Error('Image upload failed');
      }
    } catch (err) {
      showToast(err?.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save Banner (Create / Update)
  const handleSaveBanner = async (e) => {
    e.preventDefault();

    if (!modal.imageUrl && !modal.isFullImage && !modal.title) {
      showToast('Please provide at least an image or a title', 'error');
      return;
    }

    if (modal.isFullImage && !modal.imageUrl) {
      showToast('Please upload or provide an image for Full Image slide mode', 'error');
      return;
    }

    try {
      const payload = {
        title: modal.title,
        highlight: modal.highlight,
        subtitle: modal.subtitle,
        description: modal.subtitle,
        badge: modal.badge,
        imageUrl: modal.imageUrl,
        mobileImageUrl: modal.mobileImageUrl,
        linkUrl: modal.linkUrl || modal.primaryBtnUrl,
        primaryBtnText: modal.primaryBtnText,
        primaryBtnUrl: modal.primaryBtnUrl,
        secondaryBtnText: modal.secondaryBtnText,
        secondaryBtnUrl: modal.secondaryBtnUrl,
        placement: modal.placement,
        bannerType: modal.placement === 'HOME_OFFER' ? 'PROMO_BANNER' : modal.bannerType,
        accentColor: modal.accentColor,
        bgGradient: modal.bgGradient,
        couponCode: modal.couponCode,
        discountTag: modal.discountTag,
        isFullImage: modal.isFullImage,
        isActive: modal.isActive,
        displayOrder: Number(modal.displayOrder) || 0,
      };

      if (modal.isEdit) {
        await adminBannerApi.updateBanner(modal.id, payload);
        showToast('Banner updated successfully');
      } else {
        await adminBannerApi.createBanner(payload);
        showToast('New slide created successfully');
      }

      setModal((prev) => ({ ...prev, isOpen: false }));
      fetchBanners();
    } catch (err) {
      showToast(err?.message || 'Failed to save banner', 'error');
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (banner) => {
    try {
      const nextStatus = !banner.isActive;
      await adminBannerApi.updateBannerStatus(banner.id, nextStatus);
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: nextStatus } : b))
      );
      showToast(`Banner ${nextStatus ? 'activated' : 'deactivated'}`);
    } catch (err) {
      showToast(err?.message || 'Status update failed', 'error');
    }
  };

  // Move Up / Move Down Order
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    const items = newBanners.map((b, idx) => ({ id: b.id, displayOrder: idx }));
    setBanners(newBanners);

    try {
      await adminBannerApi.reorderBanners(items);
      showToast('Display order updated');
    } catch (err) {
      showToast(err?.message || 'Failed to reorder', 'error');
      fetchBanners();
    }
  };

  // Delete Banner
  const handleDeleteBanner = async () => {
    if (!deleteConfirm.banner) return;
    try {
      await adminBannerApi.deleteBanner(deleteConfirm.banner.id);
      showToast('Banner deleted successfully');
      setDeleteConfirm({ isOpen: false, banner: null });
      fetchBanners();
    } catch (err) {
      showToast(err?.message || 'Delete failed', 'error');
    }
  };

  const currentGuide = PLACEMENT_CONFIG[activeTab] || PLACEMENT_CONFIG.HOME_HERO;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', fontFamily: 'var(--font-heading)' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toast.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#1E1B4B',
              margin: '0 0 6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Layers size={28} color="#7E22CE" />
            <span>Banners & Carousels</span>
          </h1>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14.5px' }}>
            Manage website carousels, hero slides, and promotional offer banners in real-time.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 22px',
              backgroundColor: '#7E22CE',
              color: '#FFFFFF',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(126, 34, 206, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6B21A8')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#7E22CE')}
          >
            <Plus size={18} />
            <span>Add Slide / Banner</span>
          </button>
        )}
      </div>

      {/* Placement Selector Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          padding: '8px',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          marginBottom: '24px',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'HOME_HERO', label: '🏠 Home Hero Carousel' },
          { id: 'PRODUCTS_HERO', label: '🛍️ Products Page Carousel' },
          { id: 'HOME_OFFER', label: '🏷️ Home Offer Banner' },
          { id: 'ALL', label: '📑 All Banners' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === tab.id ? '#7E22CE' : 'transparent',
              color: activeTab === tab.id ? '#FFFFFF' : '#64748B',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(126, 34, 206, 0.25)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recommended Image Dimensions & Guidelines Box */}
      {activeTab !== 'ALL' && currentGuide && (
        <div
          style={{
            backgroundColor: '#FAF5FF',
            border: '1.5px solid #E9D5FF',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#EDE9FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#7E22CE',
            }}
          >
            <ImageIcon size={22} />
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '6px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#581C87' }}>
                {currentGuide.name} — Recommended Dimensions
              </h3>
              <span
                style={{
                  backgroundColor: '#7E22CE',
                  color: '#FFFFFF',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                📐 {currentGuide.recommendedSize}
              </span>
              <span
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DDD6FE',
                  color: '#6B21A8',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Ratio: {currentGuide.aspectRatio}
              </span>
            </div>

            <p style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#6B21A8', lineHeight: 1.5 }}>
              {currentGuide.tips}
            </p>
            <div style={{ fontSize: '12px', color: '#7E22CE', fontWeight: 600 }}>
              ⚡ Supported: {currentGuide.format} (Auto-compressed to next-gen WebP upon upload)
            </div>
          </div>
        </div>
      )}

      {/* Banner List / Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600 }}>Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#F3E8FF',
              color: '#7E22CE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ImageIcon size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E1B4B', margin: '0 0 8px 0' }}>
            No banners found in this section
          </h3>
          <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>
            Add your first carousel slide or promotional banner to dynamically showcase deals on your website.
          </p>
          {canManage && (
            <button
              type="button"
              onClick={handleOpenCreate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#7E22CE',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
              <span>Create Slide Now</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {banners.map((banner, index) => {
            const isHome = banner.placement === 'HOME_HERO';
            const isProd = banner.placement === 'PRODUCTS_HERO';
            const isOffer = banner.placement === 'HOME_OFFER';

            return (
              <div
                key={banner.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: banner.isActive ? '1px solid #E2E8F0' : '1px dashed #CBD5E1',
                  opacity: banner.isActive ? 1 : 0.75,
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  flexWrap: 'wrap',
                }}
              >
                {/* Order Index & Reorder Buttons */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, 'up')}
                    aria-label="Move Up"
                    style={{
                      padding: '4px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: index === 0 ? '#F8FAFC' : '#FFFFFF',
                      color: index === 0 ? '#CBD5E1' : '#475569',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    disabled={index === banners.length - 1}
                    onClick={() => handleMoveOrder(index, 'down')}
                    aria-label="Move Down"
                    style={{
                      padding: '4px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: index === banners.length - 1 ? '#F8FAFC' : '#FFFFFF',
                      color: index === banners.length - 1 ? '#CBD5E1' : '#475569',
                      cursor: index === banners.length - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* Thumbnail Preview */}
                <div
                  style={{
                    width: '140px',
                    height: '84px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    position: 'relative',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {banner.imageUrl ? (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || 'Slide'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700 }}>No Image</div>
                  )}

                  {banner.isFullImage && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        backgroundColor: '#1E1B4B',
                        color: '#FFFFFF',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      FULL IMAGE
                    </span>
                  )}
                </div>

                {/* Banner Info Details */}
                <div style={{ flex: '1 1 300px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: isHome ? '#7E22CE' : isProd ? '#0284C7' : '#D97706',
                        backgroundColor: isHome ? '#F3E8FF' : isProd ? '#E0F2FE' : '#FEF3C7',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {isHome ? '🏠 Home Hero' : isProd ? '🛍️ Products Hero' : '🏷️ Offer Banner'}
                    </span>

                    {banner.badge && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          backgroundColor: '#F1F5F9',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {banner.badge}
                      </span>
                    )}

                    {banner.discountTag && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#DC2626',
                          backgroundColor: '#FEE2E2',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {banner.discountTag}
                      </span>
                    )}
                  </div>

                  <h4
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '15px',
                      fontWeight: 800,
                      color: '#1E1B4B',
                    }}
                  >
                    {banner.title || '(Image Only Slide)'}{' '}
                    {banner.highlight && (
                      <span style={{ color: banner.accentColor || '#7E22CE' }}>
                        {banner.highlight}
                      </span>
                    )}
                  </h4>

                  {banner.subtitle && (
                    <p
                      style={{
                        margin: '0 0 6px 0',
                        fontSize: '13px',
                        color: '#64748B',
                        lineHeight: 1.4,
                        maxWidth: '650px',
                      }}
                    >
                      {banner.subtitle}
                    </p>
                  )}

                  {/* Buttons / Coupon details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {banner.couponCode && (
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 800,
                          color: '#7E22CE',
                          backgroundColor: '#F3E8FF',
                          border: '1px dashed #C084FC',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        Code: {banner.couponCode}
                      </span>
                    )}
                    {banner.primaryBtnText && (
                      <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        🔘 Primary: <strong>{banner.primaryBtnText}</strong> ({banner.primaryBtnUrl || banner.linkUrl || '#'})
                      </span>
                    )}
                    {banner.secondaryBtnText && (
                      <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        🔘 Secondary: <strong>{banner.secondaryBtnText}</strong> ({banner.secondaryBtnUrl || '#'})
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Switch & Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginLeft: 'auto',
                  }}
                >
                  {/* Active Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(banner)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: banner.isActive ? '#DCFCE7' : '#F1F5F9',
                      color: banner.isActive ? '#15803D' : '#64748B',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: banner.isActive ? '#16A34A' : '#94A3B8',
                      }}
                    />
                    <span>{banner.isActive ? 'Active' : 'Inactive'}</span>
                  </button>

                  {/* Edit Button */}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(banner)}
                      aria-label="Edit Banner"
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        color: '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.color = '#7E22CE';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.color = '#475569';
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                  )}

                  {/* Delete Button */}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ isOpen: true, banner })}
                      aria-label="Delete Banner"
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #FEE2E2',
                        backgroundColor: '#FFF5F5',
                        color: '#DC2626',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#DC2626';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFF5F5';
                        e.currentTarget.style.color = '#DC2626';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── ADD / EDIT BANNER MODAL ──────────────────────────────────────── */}
      {modal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '860px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FAF5FF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#7E22CE',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1E1B4B' }}>
                    {modal.isEdit ? 'Edit Slide / Banner' : 'Create New Slide / Banner'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#6B21A8' }}>
                    Configure slide graphics, text copy, actions, and display options.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveBanner} style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Placement & Mode Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {/* Placement Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Placement Location *
                    </label>
                    <select
                      value={modal.placement}
                      onChange={(e) => setModal({ ...modal, placement: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1E1B4B',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="HOME_HERO">🏠 Home Hero Carousel (1920 × 720 px)</option>
                      <option value="PRODUCTS_HERO">🛍️ Products Page Carousel (1440 × 380 px)</option>
                      <option value="HOME_OFFER">🏷️ Home Special Offer Banner (1440 × 280 px)</option>
                    </select>
                  </div>

                  {/* Slide Mode (Full Image vs Standard) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Slide Display Mode
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setModal({ ...modal, isFullImage: false })}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          border: !modal.isFullImage ? '2px solid #7E22CE' : '1px solid #E2E8F0',
                          backgroundColor: !modal.isFullImage ? '#F3E8FF' : '#FFFFFF',
                          color: !modal.isFullImage ? '#7E22CE' : '#64748B',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                        }}
                      >
                        📝 Standard Slide (With Text)
                      </button>
                      <button
                        type="button"
                        onClick={() => setModal({ ...modal, isFullImage: true })}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          border: modal.isFullImage ? '2px solid #7E22CE' : '1px solid #E2E8F0',
                          backgroundColor: modal.isFullImage ? '#F3E8FF' : '#FFFFFF',
                          color: modal.isFullImage ? '#7E22CE' : '#64748B',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                        }}
                      >
                        🖼️ Full Image Mode
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Upload Area with Recommended Dimension Indicator */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '14px',
                    border: '1.5px dashed #CBD5E1',
                    padding: '18px 20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                      Slide Image (Cloudflare R2 Storage) *
                    </label>
                    <span style={{ fontSize: '12px', color: '#7E22CE', fontWeight: 700, backgroundColor: '#FAF5FF', padding: '3px 8px', borderRadius: '6px' }}>
                      Recommended: {PLACEMENT_CONFIG[modal.placement]?.recommendedSize || '1920 × 720 px'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Image Preview Thumbnail */}
                    <div
                      style={{
                        width: '180px',
                        height: '95px',
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      {modal.imageUrl ? (
                        <img
                          src={modal.imageUrl}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ color: '#94A3B8', fontSize: '12px', textAlign: 'center', padding: '8px' }}>
                          <ImageIcon size={22} style={{ margin: '0 auto 4px' }} />
                          <span>No image selected</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div style={{ flex: 1 }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageFileChange}
                      />
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <button
                          type="button"
                          disabled={uploadingImage}
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 18px',
                            backgroundColor: '#7E22CE',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: uploadingImage ? 'wait' : 'pointer',
                          }}
                        >
                          {uploadingImage ? (
                            <RefreshCw size={15} className="animate-spin" />
                          ) : (
                            <Upload size={15} />
                          )}
                          <span>{uploadingImage ? 'Uploading & Optimizing...' : 'Upload Image File'}</span>
                        </button>
                      </div>

                      {/* Manual Image URL Input */}
                      <input
                        type="text"
                        placeholder="Or enter image URL (e.g. /images/storefront/hero-gold.jpg or https://...)"
                        value={modal.imageUrl}
                        onChange={(e) => setModal({ ...modal, imageUrl: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '12.5px',
                          color: '#1E1B4B',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Text Copy & Details (Shown if NOT Full Image or if user wants overlays) */}
                {!modal.isFullImage ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      {/* Eyebrow Badge */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Eyebrow Tag / Badge
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ✨ ROYAL 22K GOLD"
                          value={modal.badge}
                          onChange={(e) => setModal({ ...modal, badge: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #E2E8F0',
                            fontSize: '13.5px',
                            color: '#1E1B4B',
                          }}
                        />
                      </div>

                      {/* Discount Tag */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Discount Tag / Chip
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 🔥 UP TO 25% OFF"
                          value={modal.discountTag}
                          onChange={(e) => setModal({ ...modal, discountTag: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #E2E8F0',
                            fontSize: '13.5px',
                            color: '#1E1B4B',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      {/* Main Title */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Slide Main Title *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Shine in Every"
                          value={modal.title}
                          onChange={(e) => setModal({ ...modal, title: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #E2E8F0',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#1E1B4B',
                          }}
                        />
                      </div>

                      {/* Highlighted Text */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Highlight Text (Colored)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Royal Moment"
                          value={modal.highlight}
                          onChange={(e) => setModal({ ...modal, highlight: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #E2E8F0',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#1E1B4B',
                          }}
                        />
                      </div>
                    </div>

                    {/* Subtitle / Description */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Subtitle / Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Handcrafted pure 22K gold rope chains, heirloom bridal necklaces..."
                        value={modal.subtitle}
                        onChange={(e) => setModal({ ...modal, subtitle: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #E2E8F0',
                          fontSize: '13.5px',
                          color: '#1E1B4B',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Slide Click Link (Optional Banner Redirect URL)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /category/chains or https://..."
                      value={modal.linkUrl}
                      onChange={(e) => setModal({ ...modal, linkUrl: e.target.value, primaryBtnUrl: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '13.5px',
                        color: '#1E1B4B',
                      }}
                    />
                  </div>
                )}

                {/* Offer Coupon Code (for HOME_OFFER) */}
                {modal.placement === 'HOME_OFFER' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Coupon Promo Code (e.g. WELCOME10)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={modal.couponCode}
                      onChange={(e) => setModal({ ...modal, couponCode: e.target.value.toUpperCase() })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #E2E8F0',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#7E22CE',
                        letterSpacing: '0.05em',
                      }}
                    />
                  </div>
                )}

                {/* Call-to-Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {/* Primary CTA */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Primary Button Text & URL
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Text (e.g. Shop Now)"
                        value={modal.primaryBtnText}
                        onChange={(e) => setModal({ ...modal, primaryBtnText: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #E2E8F0',
                          fontSize: '13px',
                          color: '#1E1B4B',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="URL (/shop)"
                        value={modal.primaryBtnUrl}
                        onChange={(e) => setModal({ ...modal, primaryBtnUrl: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid #E2E8F0',
                          fontSize: '13px',
                          color: '#1E1B4B',
                        }}
                      />
                    </div>
                  </div>

                  {/* Secondary CTA (Optional) */}
                  {!modal.isFullImage && modal.placement !== 'HOME_OFFER' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Secondary Button Text & URL (Optional)
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Text (e.g. Explore)"
                          value={modal.secondaryBtnText}
                          onChange={(e) => setModal({ ...modal, secondaryBtnText: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #E2E8F0',
                            fontSize: '13px',
                            color: '#1E1B4B',
                          }}
                        />
                        <input
                          type="text"
                          placeholder="URL (/necklaces)"
                          value={modal.secondaryBtnUrl}
                          onChange={(e) => setModal({ ...modal, secondaryBtnUrl: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #E2E8F0',
                            fontSize: '13px',
                            color: '#1E1B4B',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Scheme Presets */}
                {!modal.isFullImage && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Accent Color Theme
                    </label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {COLOR_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setModal({ ...modal, accentColor: p.hex, bgGradient: p.bg })}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: modal.accentColor === p.hex ? `2px solid ${p.hex}` : '1px solid #E2E8F0',
                            backgroundColor: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <span
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: p.hex,
                            }}
                          />
                          <span>{p.name}</span>
                        </button>
                      ))}

                      <input
                        type="color"
                        value={modal.accentColor}
                        onChange={(e) => setModal({ ...modal, accentColor: e.target.value })}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        title="Custom Color"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div
                style={{
                  marginTop: '28px',
                  paddingTop: '20px',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#7E22CE',
                    color: '#FFFFFF',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
                  }}
                >
                  {modal.isEdit ? 'Save Changes' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION MODAL ────────────────────────────────────── */}
      {deleteConfirm.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 8px 0' }}>
              Delete Slide / Banner?
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Are you sure you want to delete this banner? It will immediately stop appearing on the website carousel.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, banner: null })}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBanner}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
