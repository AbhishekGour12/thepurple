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
  Award,
  Box,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  Square,
  Eye,
  Layers,
  ArrowUpDown,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
import ProductFilterDrawer from '@/components/admin/products/ProductFilterDrawer';

const money = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);

const INITIAL_FILTERS = {
  search: '',
  categoryId: '',
  subcategoryId: '',
  status: '',
  stockStatus: '',
  minPrice: '',
  maxPrice: '',
  minStock: '',
  maxStock: '',
  minDiscount: '',
  maxDiscount: '',
  brand: '',
  isFeatured: '',
  isBestSeller: '',
  isBulk: '',
  tags: '',
  startDate: '',
  endDate: '',
  sort: 'newest',
};

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
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filters & Search State
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [perPage, setPerPage] = useState(20);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Loading states for actions
  const [deletingId, setDeletingId] = useState(null);
  const [togglingStatusId, setTogglingStatusId] = useState(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput.trim()) return prev;
        return { ...prev, search: searchInput.trim() };
      });
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

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

  // Update subcategories when category filter changes
  const loadSubcategories = useCallback(async (categoryId) => {
    if (categoryId) {
      try {
        const res = await adminCategoryApi.listSubcategories({ categoryId });
        setSubcategories(res?.subcategories || []);
      } catch {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }, []);

  useEffect(() => {
    loadSubcategories(filters.categoryId);
  }, [filters.categoryId, loadSubcategories]);

  // Fetch Products with active filters and pagination
  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const data = await adminProductApi.listProducts({
          page,
          limit: perPage,
          search: filters.search || undefined,
          categoryId: filters.categoryId || undefined,
          subcategoryId: filters.subcategoryId || undefined,
          status: filters.status || undefined,
          stockStatus: filters.stockStatus || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          minStock: filters.minStock || undefined,
          maxStock: filters.maxStock || undefined,
          minDiscount: filters.minDiscount || undefined,
          maxDiscount: filters.maxDiscount || undefined,
          brand: filters.brand || undefined,
          isFeatured: filters.isFeatured || undefined,
          isBestSeller: filters.isBestSeller || undefined,
          isBulk: filters.isBulk || undefined,
          tags: filters.tags || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          sort: filters.sort || 'newest',
        });
        setProducts(data?.products || []);
        setPagination(data?.pagination || { page: 1, limit: perPage, total: 0, totalPages: 1 });
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    },
    [filters, perPage]
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

  // Status toggle
  const handleTogglePublish = async (product) => {
    if (!canPublish || togglingStatusId === product.id) return;
    const nextStatus = product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setTogglingStatusId(product.id);

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

  // Delete handlers
  const handleDeleteProduct = async (product) => {
    if (!canDelete || deletingId === product.id) return;
    setDeletingId(product.id);

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

  const handleDeleteSelected = async () => {
    if (!canDelete || selectedIds.length === 0 || isBulkDeleting) return;
    const idsToDelete = [...selectedIds];
    setIsBulkDeleting(true);

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

  const handleDeleteAll = async () => {
    if (!canDelete || products.length === 0 || isDeletingAll) return;
    if (!window.confirm('Are you sure you want to delete ALL products in your catalog? This cannot be undone.')) return;
    setIsDeletingAll(true);

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

  // Filter Drawer & quick reset
  const handleApplyDrawerFilters = (updatedFilters) => {
    setFilters(updatedFilters);
    if (updatedFilters.search !== undefined) {
      setSearchInput(updatedFilters.search);
    }
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchInput('');
  };

  const handleRemoveSingleFilter = (key) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: '' };
      if (key === 'categoryId') next.subcategoryId = '';
      return next;
    });
    if (key === 'search') setSearchInput('');
  };

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([k, v]) => {
      if (k === 'search' || k === 'sort') return false;
      return v !== '' && v !== undefined && v !== null;
    }).length;
  }, [filters]);

  // Selected Category name helper
  const selectedCategoryName = categories.find((c) => c.id === filters.categoryId)?.name;
  const selectedSubcategoryName = subcategories.find((s) => s.id === filters.subcategoryId)?.name;

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
            style={topToolBtnStyle}
          >
            <FolderTree size={14} />
            <span>Categories</span>
          </button>

          <button
            type="button"
            onClick={() => setColorModalOpen(true)}
            style={topToolBtnStyle}
          >
            <Palette size={14} />
            <span>Colors</span>
          </button>

          <button
            type="button"
            onClick={() => setSizeModalOpen(true)}
            style={topToolBtnStyle}
          >
            <Ruler size={14} />
            <span>Sizes</span>
          </button>

          <button
            type="button"
            onClick={() => setAttributeModalOpen(true)}
            style={topToolBtnStyle}
          >
            <Sliders size={14} />
            <span>Attributes</span>
          </button>

          <button
            type="button"
            onClick={() => setBulkGridOpen(true)}
            style={{
              ...topToolBtnStyle,
              border: '1px solid #C084FC',
              fontWeight: 700,
            }}
          >
            <Zap size={14} color="#D97706" />
            <span>⚡ Bulk Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setExcelImportOpen(true)}
            style={{
              ...topToolBtnStyle,
              border: '1px solid #C084FC',
              fontWeight: 700,
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
          const isActive = filters.status === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilters((prev) => ({ ...prev, status: tab.id }))}
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
          { id: 'low_stock', label: '⚠️ Low Stock' },
          { id: 'out_of_stock', label: '❌ Out of Stock' },
        ].map((tab) => {
          const isActive = filters.stockStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  stockStatus: prev.stockStatus === tab.id ? '' : tab.id,
                }))
              }
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

      {/* Main Filter & Search Bar with Side-Drawer Trigger */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #E9D5FF',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '12px',
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
              placeholder="Search product name, SKU, brand..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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

          {/* Quick Category select */}
          <select
            value={filters.categoryId || ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                categoryId: e.target.value,
                subcategoryId: '',
              }))
            }
            style={filterSelectStyle}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Quick Subcategory select */}
          {subcategories.length > 0 && (
            <select
              value={filters.subcategoryId || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, subcategoryId: e.target.value }))}
              style={filterSelectStyle}
            >
              <option value="">All Subcategories</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Sort order select */}
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
            style={filterSelectStyle}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
            <option value="stock_desc">Highest Stock</option>
            <option value="stock_asc">Lowest Stock</option>
            <option value="discount_desc">Highest Discount</option>
          </select>

          {/* 🌟 FILTER DRAWER BUTTON WITH BADGE */}
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: activeFilterCount > 0 ? '#7C3AED' : '#FAF5FF',
              border: activeFilterCount > 0 ? '1.5px solid #6D28D9' : '1px solid #E9D5FF',
              color: activeFilterCount > 0 ? '#FFFFFF' : '#7E22CE',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: activeFilterCount > 0 ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Filter size={14} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#7C3AED',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '9999px',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Reset button if any filter active */}
          {(searchInput || activeFilterCount > 0 || filters.sort !== 'newest') && (
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

      {/* Active Filter Chips Bar */}
      {activeFilterCount > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
            flexWrap: 'wrap',
            padding: '4px 2px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
            Active Filters:
          </span>

          {filters.categoryId && (
            <span style={chipStyle}>
              <span>Category: {selectedCategoryName || 'Selected'}</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('categoryId')} />
            </span>
          )}

          {filters.subcategoryId && (
            <span style={chipStyle}>
              <span>Subcategory: {selectedSubcategoryName || 'Selected'}</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('subcategoryId')} />
            </span>
          )}

          {filters.status && (
            <span style={chipStyle}>
              <span>Status: {filters.status === 'PUBLISHED' ? 'Live' : 'Draft'}</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('status')} />
            </span>
          )}

          {filters.stockStatus && (
            <span style={chipStyle}>
              <span>Stock: {filters.stockStatus.replace('_', ' ')}</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('stockStatus')} />
            </span>
          )}

          {filters.minPrice && (
            <span style={chipStyle}>
              <span>Min Price: ₹{filters.minPrice}</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('minPrice')} />
            </span>
          )}

          {filters.maxPrice && (
            <span style={chipStyle}>
              <span>Max Price: ₹{filters.maxPrice}</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('maxPrice')} />
            </span>
          )}

          {filters.minDiscount && (
            <span style={chipStyle}>
              <span>Discount: ≥ {filters.minDiscount}%</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('minDiscount')} />
            </span>
          )}

          {filters.minStock && (
            <span style={chipStyle}>
              <span>Min Stock: {filters.minStock}</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('minStock')} />
            </span>
          )}

          {filters.maxStock && (
            <span style={chipStyle}>
              <span>Max Stock: {filters.maxStock}</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('maxStock')} />
            </span>
          )}

          {filters.brand && (
            <span style={chipStyle}>
              <span>Brand: {filters.brand}</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('brand')} />
            </span>
          )}

          {filters.isFeatured === 'true' && (
            <span style={chipStyle}>
              <span>★ Featured</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('isFeatured')} />
            </span>
          )}

          {filters.isBestSeller === 'true' && (
            <span style={chipStyle}>
              <span>🏆 Best Seller</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('isBestSeller')} />
            </span>
          )}

          {filters.isBulk === 'true' && (
            <span style={chipStyle}>
              <span>📦 Bulk MOQ</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('isBulk')} />
            </span>
          )}

          {filters.tags && (
            <span style={chipStyle}>
              <span>Tag: {filters.tags}</span>
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSingleFilter('tags')} />
            </span>
          )}

          {(filters.startDate || filters.endDate) && (
            <span style={chipStyle}>
              <span>
                Date: {filters.startDate || 'Start'} to {filters.endDate || 'Now'}
              </span>
              <X
                size={12}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleRemoveSingleFilter('startDate');
                  handleRemoveSingleFilter('endDate');
                }}
              />
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              fontSize: '11.5px',
              color: '#DC2626',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginLeft: '4px',
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Bulk Selection Bar */}
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
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Price (MRP / Sale)</th>
                <th style={thStyle}>Stock Status</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
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
                    <p style={{ margin: '0 0 14px', fontSize: '13px' }}>
                      No items matched your current filter criteria.
                    </p>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: '#7C3AED',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Reset All Filters
                      </button>
                    )}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
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
                              {product.isFeatured && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    backgroundColor: '#EDE9FE',
                                    color: '#6D28D9',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #DDD6FE',
                                    fontWeight: 700,
                                  }}
                                >
                                  ★ Featured
                                </span>
                              )}
                              {product.isBestSeller && (
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
                                  🏆 Best Seller
                                </span>
                              )}
                              {product.isBulk && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    backgroundColor: '#ECFDF5',
                                    color: '#065F46',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #A7F3D0',
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

        {/* 🌟 ENHANCED PAGINATION BAR WITH PER-PAGE SELECTOR */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#FAF5FF',
            borderTop: '1px solid #E9D5FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Left: Per Page selector & Showing item range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', color: '#6B7280', fontWeight: 500 }}>Show:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(parseInt(e.target.value, 10));
                  fetchProducts(1);
                }}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#374151',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            <div style={{ fontSize: '13px', color: '#6B7280' }}>
              Showing{' '}
              <b>
                {pagination.total === 0
                  ? 0
                  : (pagination.page - 1) * pagination.limit + 1}
              </b>
              –
              <b>
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </b>{' '}
              of <b>{pagination.total}</b> products
            </div>
          </div>

          {/* Right: Page Navigation Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* First Page */}
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchProducts(1)}
                style={pageNavBtnStyle(pagination.page <= 1)}
                title="First Page"
              >
                <ChevronsLeft size={15} />
              </button>

              {/* Previous Page */}
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchProducts(pagination.page - 1)}
                style={pageNavBtnStyle(pagination.page <= 1)}
                title="Previous Page"
              >
                <ChevronLeft size={15} />
              </button>

              {/* Numbered Page Buttons with Smart Window */}
              {renderPageButtons(pagination.page, pagination.totalPages, (p) => fetchProducts(p))}

              {/* Next Page */}
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchProducts(pagination.page + 1)}
                style={pageNavBtnStyle(pagination.page >= pagination.totalPages)}
                title="Next Page"
              >
                <ChevronRight size={15} />
              </button>

              {/* Last Page */}
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchProducts(pagination.totalPages)}
                style={pageNavBtnStyle(pagination.page >= pagination.totalPages)}
                title="Last Page"
              >
                <ChevronsRight size={15} />
              </button>

              {/* Jump to Page input (if > 5 pages) */}
              {pagination.totalPages > 5 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const p = parseInt(jumpPageInput, 10);
                    if (p >= 1 && p <= pagination.totalPages) {
                      fetchProducts(p);
                      setJumpPageInput('');
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}
                >
                  <input
                    type="number"
                    min={1}
                    max={pagination.totalPages}
                    placeholder="Page"
                    value={jumpPageInput}
                    onChange={(e) => setJumpPageInput(e.target.value)}
                    style={{
                      width: '46px',
                      padding: '4px 6px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '12px',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#7E22CE',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Go
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🌟 FILTER SLIDE-OVER DRAWER */}
      <ProductFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApply={handleApplyDrawerFilters}
        onReset={handleResetFilters}
        categories={categories}
        subcategories={subcategories}
        onCategoryChange={loadSubcategories}
      />

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

// ─── Helper for Smart Page Window Rendering ──────────────────────────
function renderPageButtons(currentPage, totalPages, onSelectPage) {
  const pages = [];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (
      (i === currentPage - delta - 1 && i > 1) ||
      (i === currentPage + delta + 1 && i < totalPages)
    ) {
      pages.push('...');
    }
  }

  // Deduplicate consecutive ellipsis
  const cleanPages = pages.filter((item, index) => item !== '...' || pages[index - 1] !== '...');

  return cleanPages.map((p, idx) => {
    if (p === '...') {
      return (
        <span key={`dots-${idx}`} style={{ padding: '0 4px', fontSize: '12px', color: '#9CA3AF' }}>
          ...
        </span>
      );
    }

    const isActive = p === currentPage;
    return (
      <button
        key={p}
        type="button"
        onClick={() => onSelectPage(p)}
        style={{
          minWidth: '32px',
          height: '32px',
          padding: '0 6px',
          borderRadius: '8px',
          border: isActive ? '1px solid #7E22CE' : '1px solid #E5E7EB',
          backgroundColor: isActive ? '#7E22CE' : '#FFFFFF',
          color: isActive ? '#FFFFFF' : '#374151',
          fontSize: '12px',
          fontWeight: isActive ? 700 : 500,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        {p}
      </button>
    );
  });
}

// ─── Reusable Styles ──────────────────────────────────────────────────
const thStyle = {
  padding: '14px 16px',
  fontSize: '12px',
  fontWeight: 700,
  color: '#6B7280',
  textTransform: 'uppercase',
};

const topToolBtnStyle = {
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
};

const filterSelectStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  fontSize: '13px',
  outline: 'none',
  backgroundColor: '#FAF5FF',
  color: '#374151',
  cursor: 'pointer',
};

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '4px 9px',
  borderRadius: '9999px',
  backgroundColor: '#FAF5FF',
  border: '1px solid #E9D5FF',
  color: '#6D28D9',
  fontSize: '11.5px',
  fontWeight: 600,
};

const pageNavBtnStyle = (disabled) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: '1px solid #E5E7EB',
  backgroundColor: '#FFFFFF',
  color: disabled ? '#D1D5DB' : '#374151',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.15s ease',
});
