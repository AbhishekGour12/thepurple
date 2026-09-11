"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Plus,
  ArrowRight,
  Layers,
  DollarSign,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  Calendar,
  BarChart3,
  PieChart,
  Eye,
  RefreshCw,
  FolderTree,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { adminDashboardApi } from '@/lib/api/admin/dashboard';

const formatINR = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function AdminDashboardPage() {
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // '7d' | '30d' | 'year'
  const [chartMode, setChartMode] = useState('revenue'); // 'revenue' | 'orders'
  const [activeBarIndex, setActiveBarIndex] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalRevenue: 500300,
      revenueGrowth: '+18.4%',
      totalOrders: 182,
      ordersGrowth: '+14.2%',
      completedOrders: 154,
      pendingOrders: 28,
      totalCustomers: 64,
      customersGrowth: '+22.5%',
      totalProducts: 48,
      publishedProducts: 42,
      lowStockProducts: 3,
      outOfStockProducts: 1,
      averageOrderValue: 4850,
      conversionRate: '3.8%',
      inventoryHealth: '94%',
    },
    revenueTrend: [
      { day: 'Mon', revenue: 38500, orders: 14, visitors: 420 },
      { day: 'Tue', revenue: 52400, orders: 19, visitors: 610 },
      { day: 'Wed', revenue: 47900, orders: 16, visitors: 540 },
      { day: 'Thu', revenue: 68200, orders: 24, visitors: 780 },
      { day: 'Fri', revenue: 84600, orders: 31, visitors: 950 },
      { day: 'Sat', revenue: 112500, orders: 42, visitors: 1340 },
      { day: 'Sun', revenue: 95800, orders: 36, visitors: 1180 },
    ],
    monthlyTrend: [
      { month: 'Jan', revenue: 340000, orders: 120 },
      { month: 'Feb', revenue: 410000, orders: 145 },
      { month: 'Mar', revenue: 485000, orders: 168 },
      { month: 'Apr', revenue: 560000, orders: 195 },
      { month: 'May', revenue: 690000, orders: 235 },
      { month: 'Jun', revenue: 820000, orders: 280 },
      { month: 'Jul', revenue: 950000, orders: 315 },
      { month: 'Aug', revenue: 1120000, orders: 380 },
    ],
    categoryBreakdown: [],
    recentOrders: [],
    recentProducts: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminDashboardApi.getAnalytics({ timeRange });
      if (res?.data || res?.kpis) {
        setDashboardData(res?.data || res);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const kpis = dashboardData.kpis || {};
  const chartData = timeRange === 'year' ? dashboardData.monthlyTrend : dashboardData.revenueTrend;

  // Max value for chart scaling
  const maxChartValue = useMemo(() => {
    if (!chartData || chartData.length === 0) return 100000;
    const values = chartData.map((d) => (chartMode === 'revenue' ? d.revenue : d.orders));
    return Math.max(...values, 1) * 1.15;
  }, [chartData, chartMode]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', fontFamily: 'var(--font-heading)' }}>
      {/* ─── Top Executive Banner ────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2E1065 0%, #3B0764 50%, #581C87 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          marginBottom: '28px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 30px rgba(46, 16, 101, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Decorative Light */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: '10px',
            }}
          >
            <Sparkles size={13} color="#F472B6" />
            <span>EXECUTIVE INTELLIGENCE DASHBOARD</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 2.5vw, 1.95rem)',
              fontWeight: 800,
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome back, {currentAdmin?.name || 'Administrator'} 👋
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#E9D5FF' }}>
            Store status is{' '}
            <strong style={{ color: '#4ADE80' }}>● Operational & Live</strong>. Monitoring sales,
            inventory health, and order fulfillments.
          </p>
        </div>

        {/* Time Filter & Quick CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'year', label: '1 Year' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: timeRange === t.id ? '#7E22CE' : 'transparent',
                  color: '#FFFFFF',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Link
            href="/admin/products/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              color: '#581C87',
              fontSize: '13px',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
            }}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* ─── 6 Key KPI Metric Cards Grid ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* 1. Gross Revenue */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Total Revenue</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#F3E8FF',
                color: '#7E22CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px 0' }}>
            {formatINR(kpis.totalRevenue)}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#16A34A' }}>
            <TrendingUp size={14} />
            <span>{kpis.revenueGrowth} vs previous period</span>
          </div>
        </div>

        {/* 2. Total Orders */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Total Orders</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px 0' }}>
            {kpis.totalOrders}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
            <span style={{ color: '#16A34A', fontWeight: 700 }}>✓ {kpis.completedOrders} Delivered</span>
            <span>•</span>
            <span style={{ color: '#D97706', fontWeight: 700 }}>⏳ {kpis.pendingOrders} Processing</span>
          </div>
        </div>

        {/* 3. Average Order Value */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Avg Order Value (AOV)</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px 0' }}>
            {formatINR(kpis.averageOrderValue)}
          </h2>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
            Conversion Rate: <strong style={{ color: '#7E22CE' }}>{kpis.conversionRate}</strong>
          </div>
        </div>

        {/* 4. Total Customers */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Registered Customers</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px 0' }}>
            {kpis.totalCustomers}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#16A34A' }}>
            <TrendingUp size={14} />
            <span>{kpis.customersGrowth} new accounts</span>
          </div>
        </div>

        {/* 5. Live Product Catalog */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Catalog Products</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#FCE7F3',
                color: '#DB2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px 0' }}>
            {kpis.totalProducts}
          </h2>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
            <strong style={{ color: '#16A34A' }}>{kpis.publishedProducts} Published</strong> | {kpis.totalCategories} Categories
          </div>
        </div>

        {/* 6. Inventory Health & Alerts */}
        <div
          style={{
            backgroundColor: kpis.lowStockProducts > 0 ? '#FFFBEB' : '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: kpis.lowStockProducts > 0 ? '1px solid #FDE68A' : '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>Inventory Health</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#92400E', margin: '0 0 6px 0' }}>
            {kpis.inventoryHealth}
          </h2>
          <div style={{ fontSize: '12px', color: '#B45309', fontWeight: 700 }}>
            ⚠️ {kpis.lowStockProducts} Low Stock | {kpis.outOfStockProducts} Out of Stock
          </div>
        </div>
      </div>

      {/* ─── Growth Analytics Charts & Category Distribution ──────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        {/* Left: Interactive Revenue & Orders Trend Graph */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            flex: '1 1 60%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 800, color: '#1E1B4B' }}>
                Growth Analytics & Performance
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                Track financial momentum, incoming orders, and buyer demand trends.
              </p>
            </div>

            {/* Toggle Revenue vs Orders */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#F1F5F9',
                padding: '3px',
                borderRadius: '8px',
              }}
            >
              <button
                type="button"
                onClick={() => setChartMode('revenue')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: chartMode === 'revenue' ? '#FFFFFF' : 'transparent',
                  color: chartMode === 'revenue' ? '#7E22CE' : '#64748B',
                  boxShadow: chartMode === 'revenue' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                Revenue (₹)
              </button>
              <button
                type="button"
                onClick={() => setChartMode('orders')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: chartMode === 'orders' ? '#FFFFFF' : 'transparent',
                  color: chartMode === 'orders' ? '#7E22CE' : '#64748B',
                  boxShadow: chartMode === 'orders' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                Orders (Count)
              </button>
            </div>
          </div>

          {/* SVG/CSS Modern Bar & Sparkline Chart */}
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '14px', paddingTop: '30px' }}>
            {chartData.map((item, idx) => {
              const val = chartMode === 'revenue' ? item.revenue : item.orders;
              const heightPercent = Math.max(8, Math.min(100, (val / maxChartValue) * 100));
              const isHovered = activeBarIndex === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveBarIndex(idx)}
                  onMouseLeave={() => setActiveBarIndex(null)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-32px',
                        backgroundColor: '#1E1B4B',
                        color: '#FFFFFF',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                      }}
                    >
                      {chartMode === 'revenue' ? formatINR(item.revenue) : `${item.orders} Orders`}
                    </div>
                  )}

                  {/* Vertical Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '42px',
                      height: `${heightPercent}%`,
                      borderRadius: '8px 8px 3px 3px',
                      background: isHovered
                        ? 'linear-gradient(180deg, #A855F7 0%, #7E22CE 100%)'
                        : 'linear-gradient(180deg, #C084FC 0%, #9333EA 100%)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isHovered ? '0 4px 14px rgba(126, 34, 206, 0.4)' : 'none',
                    }}
                  />

                  {/* X-axis Label */}
                  <span
                    style={{
                      marginTop: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: isHovered ? '#7E22CE' : '#64748B',
                    }}
                  >
                    {item.day || item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Category Distribution & Inventory Status */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            flex: '1 1 35%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1E1B4B' }}>
                Category Distribution
              </h3>
              <Link href="/admin/categories" style={{ fontSize: '12.5px', fontWeight: 700, color: '#7E22CE', textDecoration: 'none' }}>
                Manage All →
              </Link>
            </div>

            {/* Category Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(dashboardData.categoryBreakdown || []).slice(0, 5).map((cat, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700, color: '#334155' }}>{cat.name}</span>
                    <span style={{ fontWeight: 700, color: '#64748B' }}>{cat.productCount} products</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(15, (cat.productCount / Math.max(1, kpis.totalProducts)) * 100))}%`,
                        height: '100%',
                        backgroundColor: cat.color || '#7E22CE',
                        borderRadius: '999px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #F1F5F9',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            <Link
              href="/admin/banners"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #E9D5FF',
                color: '#6B21A8',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Layers size={15} />
              <span>Manage Banners</span>
            </Link>

            <Link
              href="/admin/users"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#166534',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Users size={15} />
              <span>View Customers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Recent Orders & Recent Products Dual Grid ───────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        {/* 1. Recent Orders Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', fontWeight: 800, color: '#1E1B4B' }}>
                Recent Customer Orders
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>Latest purchases across India</p>
            </div>
            <Link
              href="/admin/orders"
              style={{ fontSize: '13px', fontWeight: 700, color: '#7E22CE', textDecoration: 'none' }}
            >
              View All Orders →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(dashboardData.recentOrders || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No recent orders</div>
            ) : (
              (dashboardData.recentOrders || []).slice(0, 5).map((order) => {
                const isPaid = order.paymentStatus === 'PAID';
                const isDelivered = order.status === 'DELIVERED';

                return (
                  <div
                    key={order.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E1B4B' }}>
                          {order.orderNumber}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isPaid ? '#DCFCE7' : '#FEF3C7',
                            color: isPaid ? '#15803D' : '#D97706',
                          }}
                        >
                          {isPaid ? 'PAID' : 'COD'}
                        </span>
                      </div>
                      <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                        {order.customerName} • {order.city || 'India'}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E1B4B' }}>
                        {formatINR(order.totalAmount)}
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: isDelivered ? '#16A34A' : '#7E22CE',
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2. Recent Products Added */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', fontWeight: 800, color: '#1E1B4B' }}>
                Active Products & Inventory
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>Stock tracking & live listings</p>
            </div>
            <Link
              href="/admin/products"
              style={{ fontSize: '13px', fontWeight: 700, color: '#7E22CE', textDecoration: 'none' }}
            >
              All Products →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(dashboardData.recentProducts || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No products yet</div>
            ) : (
              (dashboardData.recentProducts || []).slice(0, 5).map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#EDE9FE',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={prod.thumbnailUrl || '/images/storefront/hero-gold.jpg'}
                        alt={prod.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#1E1B4B',
                          maxWidth: '220px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {prod.title}
                      </h4>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                        {prod.category?.name || 'General'}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E1B4B' }}>
                      {formatINR(prod.sellingPrice || prod.regularPrice)}
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: prod.stock <= 5 ? '#DC2626' : '#16A34A',
                      }}
                    >
                      {prod.stock} in stock
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
