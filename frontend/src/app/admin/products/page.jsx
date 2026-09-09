"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  Package,
  Plus,
  Upload,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FolderTree,
  Palette,
  Ruler,
  Sliders,
  Zap,
  RefreshCw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  Square,
  Eye,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { adminProductApi } from '@/lib/api/admin/products';
import { adminCategoryApi } from '@/lib/api/admin/categories';

// Modals
import CategoryManagerModal from '@/components/admin/products/CategoryManagerModal';
import ColorManagerModal from '@/components/admin/products/ColorManagerModal';
import SizeManagerModal from '@/components/admin/products/SizeManagerModal';
import AttributeManagerModal from '@/components/admin/products/AttributeManagerModal';
import BulkProductGridModal from '@/components/admin/products/BulkProductGridModal';
import BulkExcelImportModal from '@/components/admin/products/BulkExcelImportModal';

const money = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function ProductListPage() {
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);
  const canDelete = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'MANAGER';
  const canPublish = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'MANAGER';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [attributeModalOpen, setAttributeModalOpen] = useState(false);
  const [bulkGridOpen, setBulkGridOpen] = useState(false);
  const [excelImportOpen, setExcelImportOpen] = useState(false);

  // Filters & Search State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Loading states for actions
  const [deletingId, setDeletingId] = useState(null);
  const [togglingStatusId, setTogglingStatusId] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Debounce search term by 350ms to prevent duplicate API hits
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await adminCategoryApi.listCategories();
      setCategories(res?.categories || []);
    } catch {
      // Handled
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      adminCategoryApi.listSubcategories({ categoryId: selectedCategory }).then((res) => {
        setSubcategories(res?.subcategories || []);
      });
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory]);

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const data = await adminProductApi.listProducts({
          page,
          limit: 15,
          search: debouncedSearch,
          categoryId: selectedCategory || undefined,
          subcategoryId: selectedSubcategory || undefined,
          status: statusFilter || undefined,
          stockStatus: stockFilter || undefined,
          sort,
        });
        setProducts(data?.products || []);
        setPagination(data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, selectedCategory, selectedSubcategory, statusFilter, stockFilter, sort]
  );

  useEffect(() => {
    fetchProducts(1);
    setSelectedIds([]);
  }, [fetchProducts]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === products.length && products.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Instant optimistic publish/draft status toggle with loader
  const handleTogglePublish = async (product) => {
    if (!canPublish || togglingStatusId === product.id) return;
    const nextStatus = product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setTogglingStatusId(product.id);

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus, isActive: nextStatus === 'PUBLISHED' } : p))
    );

    try {
      await adminProductApi.updateProductStatus(product.id, nextStatus);
    } catch {
      fetchProducts(pagination.page);
    } finally {
      setTogglingStatusId(null);
    }
  };

  // Instant optimistic single product deletion with loader
  const handleDeleteProduct = async (product) => {
    if (!canDelete || deletingId === product.id) return;
    setDeletingId(product.id);

    // Instant removal from React state
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setSelectedIds((prev) => prev.filter((id) => id !== product.id));
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));

    try {
      await adminProductApi.deleteProduct(product.id, true);
    } catch {
      fetchProducts(pagination.page);
    } finally {
      setDeletingId(null);
    }
  };

  // Instant optimistic bulk delete selected products with loader
  const handleDeleteSelected = async () => {
    if (!canDelete || selectedIds.length === 0 || isBulkDeleting) return;
    const idsToDelete = [...selectedIds];
    setIsBulkDeleting(true);

    // Optimistic removal from React state
    setProducts((prev) => prev.filter((p) => !idsToDelete.includes(p.id)));
    setSelectedIds([]);
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - idsToDelete.length) }));

    try {
      await adminProductApi.bulkDeleteProducts(idsToDelete, true);
    } catch {
      fetchProducts(pagination.page);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Instant optimistic delete all products with loader
  const handleDeleteAll = async () => {
    if (!canDelete || products.length === 0 || isDeletingAll) return;
    if (!window.confirm('Are you sure you want to delete ALL products in your catalog? This cannot be undone.')) return;
    setIsDeletingAll(true);

    // Optimistic clear
    setProducts([]);
    setSelectedIds([]);
    setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));

    try {
      await adminProductApi.deleteAllProducts(true);
    } catch {
      fetchProducts(pagination.page);
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Quick reset filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setStatusFilter('');
    setStockFilter('');
    setSort('newest');
  };

  return (
    <div>
      {/* Top Header & Fast Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2E1065', margin: 0 }}>
              Product Catalog
            </h1>
            <span
              style={{
                backgroundColor: '#FAF5FF',
                border: '1px solid #E9D5FF',
                color: '#7E22CE',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {pagination.total} Total
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Full catalog inventory, pricing, visual swatches, bulk management & instant actions
          </p>
        </div>

        {/* Quick Tools & Creation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCategoryModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              color: '#7E22CE',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FolderTree size={14} />
            <span>Categories</span>
          </button>

          <button
            type="button"
            onClick={() => setColorModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              color: '#7E22CE',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Palette size={14} />
            <span>Colors</span>
          </button>

          <button
            type="button"
            onClick={() => setSizeModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              color: '#7E22CE',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Ruler size={14} />
            <span>Sizes</span>
          </button>

          <button
            type="button"
            onClick={() => setAttributeModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              color: '#7E22CE',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Sliders size={14} />
            <span>Attributes</span>
          </button>

          <button
            type="button"
            onClick={() => setBulkGridOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #C084FC',
              color: '#7E22CE',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Zap size={14} color="#D97706" />
            <span>⚡ Bulk Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setExcelImportOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #C084FC',
              color: '#7E22CE',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Upload size={14} color="#059669" />
            <span>📥 Excel Import</span>
          </button>

          <Link
            href="/admin/products/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '9px',
              backgroundColor: '#7E22CE',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
            }}
          >
            <Plus size={15} />
            <span>+ Create Product</span>
          </Link>
        </div>
      </div>

      {/* Interactive Status Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {[
          { id: '', label: 'All Products', icon: Package },
          { id: 'PUBLISHED', label: 'Published (Live)', icon: CheckCircle2 },
          { id: 'DRAFT', label: 'Drafts (Hidden)', icon: Edit2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: isActive ? '1px solid #7E22CE' : '1px solid #E5E7EB',
                backgroundColor: isActive ? '#7E22CE' : '#ffffff',
                color: isActive ? '#ffffff' : '#374151',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {[
          { id: 'low_stock', label: '⚠️ Low Stock', filterKey: 'stock' },
          { id: 'out_of_stock', label: '❌ Out of Stock', filterKey: 'stock' },
        ].map((tab) => {
          const isActive = stockFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStockFilter(stockFilter === tab.id ? '' : tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: isActive ? '1px solid #DC2626' : '1px solid #E5E7EB',
                backgroundColor: isActive ? '#FEF2F2' : '#ffffff',
                color: isActive ? '#DC2626' : '#374151',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Toolbar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #E9D5FF',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 4px rgba(107, 33, 168, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', minWidth: '220px', flex: 1, maxWidth: '340px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search product name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#FAF5FF',
              }}
            />
          </div>

          {/* Category dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#FAF5FF',
              color: '#374151',
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Subcategory dropdown */}
          {subcategories.length > 0 && (
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#FAF5FF',
                color: '#374151',
              }}
            >
              <option value="">All Subcategories</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#FAF5FF',
              color: '#374151',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="stock_desc">Highest Stock</option>
            <option value="stock_asc">Lowest Stock</option>
          </select>

          {(search || selectedCategory || selectedSubcategory || statusFilter || stockFilter || sort !== 'newest') && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#7E22CE',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Selection Bar (Shows when items selected or to select all) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          padding: '10px 16px',
          backgroundColor: selectedIds.length > 0 ? '#FAF5FF' : '#ffffff',
          border: selectedIds.length > 0 ? '1.5px solid #C084FC' : '1px solid #E9D5FF',
          borderRadius: '12px',
          flexWrap: 'wrap',
          gap: '10px',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleSelectAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#ffffff',
              color: '#7E22CE',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {selectedIds.length === products.length && products.length > 0 ? (
              <CheckSquare size={15} />
            ) : (
              <Square size={15} />
            )}
            <span>
              {selectedIds.length === products.length && products.length > 0
                ? 'Deselect All'
                : `Select All (${products.length})`}
            </span>
          </button>

          {selectedIds.length > 0 && (
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#7E22CE' }}>
              {selectedIds.length} item(s) selected
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {selectedIds.length > 0 && canDelete && (
            <button
              type="button"
              disabled={isBulkDeleting}
              onClick={handleDeleteSelected}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: isBulkDeleting ? '#9CA3AF' : '#DC2626',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: isBulkDeleting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.2)',
              }}
            >
              {isBulkDeleting ? (
                <RefreshCw size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Trash2 size={14} />
              )}
              <span>{isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}</span>
            </button>
          )}

          {canDelete && products.length > 0 && (
            <button
              type="button"
              disabled={isDeletingAll}
              onClick={handleDeleteAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #FECACA',
                backgroundColor: isDeletingAll ? '#F3F4F6' : '#FEF2F2',
                color: isDeletingAll ? '#9CA3AF' : '#DC2626',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isDeletingAll ? 'not-allowed' : 'pointer',
              }}
            >
              {isDeletingAll ? (
                <RefreshCw size={13} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Trash2 size={13} />
              )}
              <span>{isDeletingAll ? 'Deleting All...' : 'Delete All Products'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchProducts(pagination.page)}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #E9D5FF',
              backgroundColor: '#FAF5FF',
              color: '#7E22CE',
              fontSize: '12px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            title="Refresh Products"
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Product Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E9D5FF',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(107, 33, 168, 0.04)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF5FF', borderBottom: '1px solid #E9D5FF' }}>
                <th style={{ padding: '14px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    style={{ accentColor: '#7E22CE', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Product
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Category
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Price (MRP / Sale)
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Stock Status
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
                    <RefreshCw size={28} style={{ color: '#7E22CE', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#2E1065' }}>Loading Catalog Products...</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Connecting to inventory database</div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
                    <Package size={44} style={{ color: '#C084FC', margin: '0 auto 10px' }} />
                    <h3 style={{ margin: '0 0 6px', color: '#1E1B4B' }}>No Products Found</h3>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      Try adjusting filters or click "+ Create Product" above.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const primaryImg = product.images?.find((img) => img.isPrimary) || product.images?.[0];
                  const numPrice = parseFloat(product.price) || 0;
                  const numSale = parseFloat(product.salePrice) || numPrice;
                  const discount = numPrice > 0 ? Math.round(((numPrice - numSale) / numPrice) * 100) : 0;
                  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
                  const isOutOfStock = product.stock <= 0;
                  const isToggling = togglingStatusId === product.id;
                  const isDeleting = deletingId === product.id;

                  return (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: '1px solid #F3E8FF',
                        backgroundColor: isSelected ? '#FAF5FF' : '#ffffff',
                        transition: 'background-color 0.15s ease',
                        opacity: isDeleting ? 0.5 : 1,
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(product.id)}
                          style={{ accentColor: '#7E22CE', width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                      </td>

                      {/* Product Info with Thumbnail */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              backgroundColor: '#FAF5FF',
                              border: '1px solid #E9D5FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {primaryImg?.imageUrl ? (
                              <img
                                src={primaryImg.imageUrl}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Package size={22} style={{ color: '#C084FC' }} />
                            )}
                          </div>

                          <div>
                            <Link
                              href={`/admin/products/${product.id}`}
                              style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#1E1B4B',
                                textDecoration: 'none',
                              }}
                            >
                              {product.name}
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontFamily: 'monospace',
                                  color: '#7E22CE',
                                  backgroundColor: '#FAF5FF',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #E9D5FF',
                                }}
                              >
                                {product.sku}
                              </span>
                              {product.isBulk && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    backgroundColor: '#FEF3C7',
                                    color: '#92400E',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #FDE68A',
                                    fontWeight: 700,
                                  }}
                                >
                                  Bulk MOQ: {product.minOrderQuantity || 30}
                                </span>
                              )}
                              {product.brand && (
                                <span style={{ fontSize: '11px', color: '#6B7280' }}>• {product.brand}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Breadcrumb */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                          {product.subcategory?.category?.name || 'General'}
                        </div>
                        {product.subcategory?.name && (
                          <div style={{ fontSize: '11px', color: '#7E22CE' }}>
                            › {product.subcategory.name}
                          </div>
                        )}
                      </td>

                      {/* Pricing */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E1B4B' }}>
                          {money(product.salePrice)}
                        </div>
                        {numSale < numPrice && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontSize: '11px', color: '#9CA3AF', textDecoration: 'line-through' }}>
                              {money(product.price)}
                            </span>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#047857',
                                backgroundColor: '#ECFDF5',
                                padding: '1px 5px',
                                borderRadius: '4px',
                              }}
                            >
                              {discount}% OFF
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Stock Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: isOutOfStock
                                ? '#DC2626'
                                : isLowStock
                                ? '#D97706'
                                : '#10B981',
                            }}
                          />
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: isOutOfStock
                                ? '#DC2626'
                                : isLowStock
                                ? '#D97706'
                                : '#047857',
                            }}
                          >
                            {isOutOfStock
                              ? 'Out of Stock'
                              : isLowStock
                              ? `Low (${product.stock})`
                              : `${product.stock} in stock`}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle Switch */}
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleTogglePublish(product)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: isToggling ? 'not-allowed' : 'pointer',
                            backgroundColor:
                              product.status === 'PUBLISHED' ? '#ECFDF5' : '#FEF2F2',
                            color: product.status === 'PUBLISHED' ? '#047857' : '#DC2626',
                            transition: 'all 0.15s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isToggling ? (
                            <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <span>{product.status === 'PUBLISHED' ? '● Live' : '○ Draft'}</span>
                          )}
                        </button>
                      </td>

                      {/* Quick Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Link
                            href={`/admin/products/${product.id}`}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#FAF5FF',
                              border: '1px solid #E9D5FF',
                              color: '#7E22CE',
                              display: 'inline-flex',
                              alignItems: 'center',
                              textDecoration: 'none',
                            }}
                            title="Edit Product"
                          >
                            <Edit2 size={13} />
                          </Link>

                          {canDelete && (
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteProduct(product)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                backgroundColor: isDeleting ? '#F3F4F6' : '#FEF2F2',
                                border: '1px solid #FECACA',
                                color: isDeleting ? '#9CA3AF' : '#DC2626',
                                cursor: isDeleting ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                              title="Delete Product"
                            >
                              {isDeleting ? (
                                <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                              ) : (
                                <Trash2 size={13} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#FAF5FF',
              borderTop: '1px solid #E9D5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '13px', color: '#6B7280' }}>
              Showing page <b>{pagination.page}</b> of <b>{pagination.totalPages}</b> ({pagination.total} total)
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchProducts(pagination.page - 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  color: pagination.page <= 1 ? '#9CA3AF' : '#374151',
                }}
              >
                Previous
              </button>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchProducts(pagination.page + 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  color: pagination.page >= pagination.totalPages ? '#9CA3AF' : '#374151',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Modals for Fast Popups */}
      <CategoryManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCategoriesUpdated={() => {
          loadCategories();
          fetchProducts(pagination.page);
        }}
      />

      <ColorManagerModal
        open={colorModalOpen}
        onClose={() => setColorModalOpen(false)}
        onColorsUpdated={() => fetchProducts(pagination.page)}
      />

      <SizeManagerModal
        open={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        onSizesUpdated={() => fetchProducts(pagination.page)}
      />

      <AttributeManagerModal
        open={attributeModalOpen}
        onClose={() => setAttributeModalOpen(false)}
        onAttributesUpdated={() => fetchProducts(pagination.page)}
      />

      <BulkProductGridModal
        open={bulkGridOpen}
        onClose={() => setBulkGridOpen(false)}
        onProductsCreated={() => fetchProducts(1)}
      />

      <BulkExcelImportModal
        open={excelImportOpen}
        onClose={() => setExcelImportOpen(false)}
        onImportSuccess={() => fetchProducts(1)}
      />
    </div>
  );
}
