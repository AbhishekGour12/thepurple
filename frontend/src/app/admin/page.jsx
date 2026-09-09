"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  Package,
  FolderTree,
  Upload,
  AlertTriangle,
  Plus,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { adminProductApi } from '@/lib/api/admin/products';
import { adminCategoryApi } from '@/lib/api/admin/categories';

const money = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function AdminDashboardPage() {
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);

  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    lowStockProducts: 0,
    totalCategories: 0,
    recentProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [prodRes, lowStockRes, catRes] = await Promise.all([
          adminProductApi.listProducts({ limit: 5, sort: 'newest' }),
          adminProductApi.listProducts({ stockStatus: 'low_stock', limit: 1 }),
          adminCategoryApi.listCategories(),
        ]);

        setStats({
          totalProducts: prodRes?.pagination?.total || 0,
          publishedProducts: prodRes?.products?.filter((p) => p.status === 'PUBLISHED').length || 0,
          lowStockProducts: lowStockRes?.pagination?.total || 0,
          totalCategories: catRes?.categories?.length || 0,
          recentProducts: prodRes?.products || [],
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const statCardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #E9D5FF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(107, 33, 168, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        backgroundColor: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
        border: '1px solid #E9D5FF',
        borderRadius: '20px',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '20px',
            backgroundColor: '#FAF5FF',
            border: '1px solid #D8B4FE',
            color: '#6B21A8',
            fontSize: '11px',
            fontWeight: 700,
            marginBottom: '8px',
          }}>
            <span>THEPURPLE ADMIN CONSOLE</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2E1065', margin: '0 0 6px 0' }}>
            Welcome back, {currentAdmin?.name || 'Administrator'}!
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Role: <strong>{currentAdmin?.role === 'SUPER_ADMIN' ? 'Super Admin' : currentAdmin?.role === 'MANAGER' ? 'Manager' : 'Executive'}</strong> | Store Status: <span style={{ color: '#10B981', fontWeight: 600 }}>Active</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href="/admin/products/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: '#7E22CE',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
            }}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>

          <Link
            href="/admin/products/bulk"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #E9D5FF',
              color: '#7E22CE',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <Upload size={16} />
            <span>Bulk Upload</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Total Products</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E22CE' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E1B4B', marginTop: '12px' }}>
            {loading ? '—' : stats.totalProducts}
          </div>
          <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600, marginTop: '4px' }}>
            Catalog Items in Database
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Categories</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <FolderTree size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E1B4B', marginTop: '12px' }}>
            {loading ? '—' : stats.totalCategories}
          </div>
          <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600, marginTop: '4px' }}>
            Active Taxonomies
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Low Stock Alert</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: stats.lowStockProducts > 0 ? '#D97706' : '#1E1B4B', marginTop: '12px' }}>
            {loading ? '—' : stats.lowStockProducts}
          </div>
          <div style={{ fontSize: '12px', color: stats.lowStockProducts > 0 ? '#D97706' : '#6B7280', fontWeight: 600, marginTop: '4px' }}>
            Requires Replenishment
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Role Access</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#065F46', marginTop: '16px' }}>
            {currentAdmin?.role === 'SUPER_ADMIN' ? 'Super Admin' : currentAdmin?.role === 'MANAGER' ? 'Manager' : 'Executive'}
          </div>
          <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600, marginTop: '4px' }}>
            {currentAdmin?.role === 'SUPER_ADMIN' ? 'Full Authority' : currentAdmin?.role === 'MANAGER' ? 'Business Operations' : 'Product Upload & Edit'}
          </div>
        </div>
      </div>

      {/* Recent Products Quick Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E9D5FF',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(107, 33, 168, 0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E1B4B', margin: 0 }}>
            Recently Added Products
          </h3>
          <Link
            href="/admin/products"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#7E22CE',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>View All Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
            Loading recent products...
          </div>
        ) : stats.recentProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
            No products created yet. Click "+ Add Product" to get started.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF5FF', borderBottom: '1px solid #E9D5FF' }}>
                  <th style={{ padding: '10px 14px', color: '#581C87', fontWeight: 700 }}>Product Name</th>
                  <th style={{ padding: '10px 14px', color: '#581C87', fontWeight: 700 }}>SKU</th>
                  <th style={{ padding: '10px 14px', color: '#581C87', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '10px 14px', color: '#581C87', fontWeight: 700 }}>Sale Price</th>
                  <th style={{ padding: '10px 14px', color: '#581C87', fontWeight: 700 }}>Stock</th>
                  <th style={{ padding: '10px 14px', color: '#581C87', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F3E8FF' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1E1B4B' }}>{p.name}</td>
                    <td style={{ padding: '10px 14px', color: '#7E22CE', fontFamily: 'monospace' }}>{p.sku}</td>
                    <td style={{ padding: '10px 14px', color: '#6B7280' }}>{p.subcategory?.category?.name || '—'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#047857' }}>{money(p.salePrice)}</td>
                    <td style={{ padding: '10px 14px' }}>{p.stock}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: p.status === 'PUBLISHED' ? '#ECFDF5' : '#EFF6FF',
                        color: p.status === 'PUBLISHED' ? '#047857' : '#1D4ED8',
                      }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
