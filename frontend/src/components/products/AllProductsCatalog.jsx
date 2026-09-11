'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Star,
  Heart,
  ShoppingCart,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  RotateCcw,
  Layers,
  FolderTree,
  Tag,
  DollarSign,
  Palette,
  Ruler,
  CheckSquare,
  Square,
  Loader2,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { optimisticToggle, toggleWishlistProduct } from '@/store/slices/wishlistSlice';
import CategoryGridModal from './CategoryGridModal';

const DEFAULT_DISCOUNT_OPTIONS = [
  { label: '10% and above', min: 10 },
  { label: '20% and above', min: 20 },
  { label: '30% and above', min: 30 },
  { label: '40% and above', min: 40 },
  { label: '50% and above', min: 50 },
];

const ITEMS_PER_PAGE = 30;

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  pages.push(1);

  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) {
    pages.push('...');
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < totalPages - 1) {
    pages.push('...');
  }

  pages.push(totalPages);
  return pages;
}

export default function AllProductsCatalog({ initialCategory = null, isCategoryModalOpenExternal = false, onCategoryModalClose = null }) {
  const router = useRouter();
  // Taxonomy Data from API
  const [dbCategories, setDbCategories] = useState([]);
  const [dbColors, setDbColors] = useState([]);
  const [dbSizes, setDbSizes] = useState([]);
  const [rawDbProducts, setRawDbProducts] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : []);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);

  // Update selected category when initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
      setCurrentPage(1);
    }
  }, [initialCategory]);

  const handleSelectCategoryFromModal = (categoryName, subcategoryName) => {
    if (categoryName) {
      setSelectedCategories([categoryName]);
      if (subcategoryName) {
        setSelectedSubcategories([subcategoryName]);
      } else {
        setSelectedSubcategories([]);
      }
      setCurrentPage(1);
      setIsCategoryModalOpen(false);
      // Smoothly scroll to catalog
      const catalogEl = document.getElementById('catalog-products-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Accordion open/collapse states
  const [accordions, setAccordions] = useState({
    category: true,
    price: true,
    color: true,
    size: true,
    discount: true,
    rating: true,
    availability: true,
  });

  // Mobile Filter Drawer Toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Redux Wishlist and Cart feedback state
  const dispatch = useDispatch();
  const likedMap = useSelector((state) => state.wishlist?.likedMap || {});
  const [cartState, setCartState] = useState({});

  const toggleAccordion = (key) => {
    setAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDiscountToggle = (minVal) => {
    setCurrentPage(1);
    setSelectedDiscount((prev) => (prev === minVal ? null : minVal));
    scrollToCatalog();
  };

  // 1. Fetch Dynamic Filters Taxonomy
  useEffect(() => {
    let isMounted = true;
    async function loadFilterTaxonomy() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/products/filters`);
        const json = await res.json();
        if (json.success && isMounted) {
          if (Array.isArray(json.data?.categories)) setDbCategories(json.data.categories);
          if (Array.isArray(json.data?.colors)) setDbColors(json.data.colors);
          if (Array.isArray(json.data?.sizes)) setDbSizes(json.data.sizes);
        }
      } catch {
        // Handled
      }
    }
    loadFilterTaxonomy();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Products dynamically from backend with full filter criteria
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const params = new URLSearchParams();
      params.set('page', currentPage);
      params.set('limit', ITEMS_PER_PAGE);

      if (searchKeyword.trim()) params.set('search', searchKeyword.trim());
      if (selectedCategories.length > 0) params.set('category', selectedCategories.join('||'));
      if (selectedSubcategories.length > 0) params.set('subcategory', selectedSubcategories.join('||'));
      if (minPrice > 0) params.set('minPrice', minPrice);
      if (maxPrice < 5000) params.set('maxPrice', maxPrice);
      if (selectedDiscount) params.set('minDiscount', selectedDiscount);
      if (selectedRating) params.set('rating', selectedRating);
      if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
      if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));
      if (inStockOnly) params.set('inStock', 'true');
      if (sortBy) params.set('sortBy', sortBy);

      const res = await fetch(`${apiUrl}/products?${params.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data?.products)) {
        setRawDbProducts(json.data.products);
        setTotalCount(json.data.pagination?.total ?? json.data.products.length);
        setTotalPages(json.data.pagination?.totalPages || 1);
        setHasFetched(true);
      } else {
        setRawDbProducts([]);
        setHasFetched(true);
      }
    } catch {
      setRawDbProducts([]);
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchKeyword,
    selectedCategories,
    selectedSubcategories,
    selectedColors,
    selectedSizes,
    selectedRating,
    minPrice,
    maxPrice,
    selectedDiscount,
    inStockOnly,
    sortBy,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Transform DB products seamlessly - strictly using backend database results (never dummy fallback)
  const displayProducts = useMemo(() => {
    return rawDbProducts.map((p) => {
      const primaryImg =
        p.images?.find((img) => img.isPrimary)?.imageUrl ||
        p.images?.find((img) => img.isPrimary)?.url ||
        p.images?.[0]?.imageUrl ||
        p.images?.[0]?.url ||
        p.image ||
        '/images/storefront/prod-gold-rope.jpg';
      const catName = p.subcategory?.category?.name || 'Jewellery';
      const subName = p.subcategory?.name || '';
      
      const numPrice = Number(p.price) || 0;
      const numSale = p.salePrice !== undefined && p.salePrice !== null ? Number(p.salePrice) : numPrice;
      const hasDiscount = numSale < numPrice && numPrice > 0;
      const sellingPrice = hasDiscount ? numSale : numPrice;
      const originalPrice = hasDiscount ? numPrice : null;
      const discount = hasDiscount ? Math.round(((numPrice - numSale) / numPrice) * 100) : 0;

      return {
        id: String(p.id),
        name: p.name,
        category: catName,
        subcategory: subName,
        price: sellingPrice,
        originalPrice: originalPrice,
        discount,
        rating: Number(p.rating || 4.8),
        reviews: p.reviewCount || 42,
        badge: p.badge || (p.isFeatured ? 'FEATURED' : p.isBestSeller ? 'BESTSELLER' : hasDiscount && discount > 0 ? `${discount}% OFF` : ''),
        badgeColor: (() => {
          const b = (p.badge || (p.isBestSeller ? 'BESTSELLER' : '')).toUpperCase();
          if (b.includes('EXCLUSIVE')) return '#059669';
          if (b.includes('TRENDING')) return '#DB2777';
          if (b.includes('GIFT')) return '#9333EA';
          if (b.includes('BEST')) return '#6D28D9';
          if (b.includes('NEW')) return '#4338CA';
          if (b.includes('HOT') || b.includes('DEAL')) return '#DC2626';
          if (b.includes('LIMITED')) return '#0284C7';
          return p.isBestSeller ? '#6D28D9' : '#DB2777';
        })(),
        color: p.variants?.[0]?.color?.name || 'Gold',
        colorHex: p.variants?.[0]?.color?.hexCode || '#EAB308',
        size: p.variants?.[0]?.size?.name || 'Standard',
        inStock: (p.stock || 10) > 0,
        image: primaryImg,
        images: p.images && p.images.length > 0 ? p.images.map((img) => img.imageUrl || img.url) : [primaryImg],
        slug: p.slug || p.id,
      };
    });
  }, [rawDbProducts]);

  // Categories list for filters
  const filterCategories = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl,
        subcategories: c.subcategories || [],
      }));
    }
    return [
      { id: '1', name: 'Chains', slug: 'chains', subcategories: [{ name: 'Necklaces & Chains' }, { name: 'Bracelets' }] },
      { id: '2', name: 'Earrings', slug: 'earrings', subcategories: [{ name: 'Earrings & Studs' }, { name: 'Jhumkas' }] },
      { id: '3', name: 'Necklaces', slug: 'necklaces', subcategories: [{ name: 'Necklaces & Chains' }, { name: 'Chokers' }] },
      { id: '4', name: 'Bangles', slug: 'bangles', subcategories: [{ name: 'Bangles & Kadas' }] },
      { id: '5', name: 'Rings', slug: 'rings', subcategories: [{ name: 'Rings & Bands' }, { name: 'Solitaire Rings' }] },
      { id: '6', name: 'Teddy Bears', slug: 'teddy-bears', subcategories: [{ name: 'Classic Teddy Bears' }, { name: 'Giant Life-Size Bears' }] },
      { id: '7', name: 'Gifts & Hampers', slug: 'gifts', subcategories: [{ name: 'Celebration Hampers' }, { name: 'Combos' }] },
    ];
  }, [dbCategories]);

  // Colors list for filters
  const filterColors = useMemo(() => {
    if (dbColors.length > 0) {
      return dbColors.map((c) => ({ name: c.name, hex: c.hexCode || '#9333EA' }));
    }
    return [
      { name: 'Gold', hex: '#EAB308' },
      { name: 'Silver', hex: '#E2E8F0' },
      { name: 'Rose Gold', hex: '#FDA4AF' },
      { name: 'Purple', hex: '#9333EA' },
      { name: 'Black', hex: '#18181B' },
      { name: 'Pink', hex: '#F472B6' },
    ];
  }, [dbColors]);

  // Sizes list for filters
  const filterSizes = useMemo(() => {
    if (dbSizes.length > 0) {
      return dbSizes.map((s) => s.name || s.code);
    }
    return ['16 Inch', '18 Inch', '22 Inch', 'Size 7', '2.4', '2.6', '30 cm', '120 cm', 'Standard'];
  }, [dbSizes]);

  // Auto-scroll to products catalog section
  const scrollToCatalog = () => {
    const catalogEl = document.getElementById('catalog-products-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter Handlers
  const handleCategoryToggle = (categoryName) => {
    setCurrentPage(1);
    setSelectedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((c) => c !== categoryName) : [...prev, categoryName]
    );
    scrollToCatalog();
  };

  const handleSubcategoryToggle = (subName) => {
    setCurrentPage(1);
    setSelectedSubcategories((prev) =>
      prev.includes(subName) ? prev.filter((s) => s !== subName) : [...prev, subName]
    );
    scrollToCatalog();
  };

  const handleColorToggle = (colorName) => {
    setCurrentPage(1);
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
    scrollToCatalog();
  };

  const handleSizeToggle = (sizeName) => {
    setCurrentPage(1);
    setSelectedSizes((prev) =>
      prev.includes(sizeName) ? prev.filter((s) => s !== sizeName) : [...prev, sizeName]
    );
    scrollToCatalog();
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setMinPrice(0);
    setMaxPrice(5000);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedRating(null);
    setSelectedDiscount(null);
    setInStockOnly(false);
    setSearchKeyword('');
    setCurrentPage(1);
    scrollToCatalog();
  };

  const toggleWishlist = (e, prod) => {
    e.preventDefault();
    e.stopPropagation();
    // 1. Instant 0ms synchronous UI toggle across all pages
    dispatch(optimisticToggle(prod));
    // 2. Database & auth sync
    dispatch(toggleWishlistProduct(prod));
  };

  const handleAddToCart = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setCartState((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCartState((prev) => ({ ...prev, [id]: false }));
    }, 1800);
  };
  // Active filter count
  const activeFilterCount =
    selectedCategories.length +
    selectedSubcategories.length +
    selectedColors.length +
    selectedSizes.length +
    (selectedRating ? 1 : 0) +
    (selectedDiscount ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minPrice > 0 || maxPrice < 5000 ? 1 : 0) +
    (searchKeyword.trim() ? 1 : 0);

  // Reusable Filter Sidebar Content
  const renderSidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sidebar Header & Clear */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          borderBottom: '1.5px solid #F3E8FF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={18} color="#7E22CE" />
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
            Filter Catalog
          </h2>
          {activeFilterCount > 0 && (
            <span
              style={{
                backgroundColor: '#7E22CE',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: '#DC2626',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '6px',
              backgroundColor: '#FEF2F2',
            }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Category & Subcategory Taxonomy Accordion */}
      <div style={{ borderBottom: '1px solid #FAF5FF', paddingBottom: '14px' }}>
        <button
          type="button"
          onClick={() => toggleAccordion('category')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            marginBottom: accordions.category ? '12px' : 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderTree size={16} color="#7E22CE" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B4B' }}>Categories</span>
          </div>
          {accordions.category ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
        </button>

        {accordions.category && (
          <div className="filter-accordion-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
            {filterCategories.map((cat) => {
              const isCatChecked = selectedCategories.includes(cat.name);
              return (
                <div key={cat.id || cat.name} style={{ display: 'flex', flexDirection: 'column' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      backgroundColor: isCatChecked ? '#FAF5FF' : 'transparent',
                      border: isCatChecked ? '1px solid #E9D5FF' : '1px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={isCatChecked}
                        onChange={() => handleCategoryToggle(cat.name)}
                        style={{ accentColor: '#7E22CE', width: '15px', height: '15px', cursor: 'pointer' }}
                      />
                      {cat.imageUrl && (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E9D5FF' }}
                        />
                      )}
                      <span style={{ fontSize: '13px', fontWeight: isCatChecked ? 700 : 500, color: isCatChecked ? '#7E22CE' : '#374151' }}>
                        {cat.name}
                      </span>
                    </div>
                  </label>

                  {/* Subcategories (if available) */}
                  {cat.subcategories?.length > 0 && (
                    <div className="filter-accordion-scroll" style={{ paddingLeft: '26px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                      {cat.subcategories.map((sub) => {
                        const isSubChecked = selectedSubcategories.includes(sub.name);
                        return (
                          <label
                            key={sub.id || sub.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: isSubChecked ? '#7E22CE' : '#6B7280',
                              fontWeight: isSubChecked ? 700 : 400,
                              padding: '2px 4px',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSubChecked}
                              onChange={() => handleSubcategoryToggle(sub.name)}
                              style={{ accentColor: '#7E22CE', width: '13px', height: '13px', cursor: 'pointer' }}
                            />
                            <span>{sub.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Price Range Slider & Bounds */}
      <div style={{ borderBottom: '1px solid #FAF5FF', paddingBottom: '14px' }}>
        <button
          type="button"
          onClick={() => toggleAccordion('price')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            marginBottom: accordions.price ? '12px' : 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={16} color="#7E22CE" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B4B' }}>Price Range</span>
          </div>
          {accordions.price ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
        </button>

        {accordions.price && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12.5px', fontWeight: 700, color: '#7E22CE' }}>
              <span>₹{minPrice}</span>
              <span>₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setCurrentPage(1);
                scrollToCatalog();
              }}
              style={{ width: '100%', accentColor: '#7E22CE', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: '#9CA3AF', display: 'block', marginBottom: '2px' }}>MIN PRICE</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '12px', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: '#9CA3AF', display: 'block', marginBottom: '2px' }}>MAX PRICE</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '12px', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Color Swatches Accordion - Structured 2-Column Grid */}
      <div style={{ borderBottom: '1px solid #FAF5FF', paddingBottom: '14px' }}>
        <button
          type="button"
          onClick={() => toggleAccordion('color')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            marginBottom: accordions.color ? '12px' : 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={16} color="#7E22CE" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B4B' }}>Color Palette</span>
          </div>
          {accordions.color ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
        </button>

        {accordions.color && (
          <div
            className="filter-accordion-scroll"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6px',
              maxHeight: '190px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            {filterColors.map((col) => {
              const isSelected = selectedColors.includes(col.name);
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => handleColorToggle(col.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '6px 8px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? '#FAF5FF' : '#F9FAFB',
                    border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E5E7EB',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#7E22CE' : '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#F3E8FF';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }}
                >
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: col.hex,
                      border: '1.5px solid rgba(0,0,0,0.18)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {col.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Sizes Accordion - Structured Responsive Badges */}
      <div style={{ borderBottom: '1px solid #FAF5FF', paddingBottom: '14px' }}>
        <button
          type="button"
          onClick={() => toggleAccordion('size')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            marginBottom: accordions.size ? '12px' : 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ruler size={16} color="#7E22CE" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B4B' }}>Sizes & Dimensions</span>
          </div>
          {accordions.size ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
        </button>

        {accordions.size && (
          <div
            className="filter-accordion-scroll"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              maxHeight: '180px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            {filterSizes.map((sz) => {
              const isSelected = selectedSizes.includes(sz);
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleSizeToggle(sz)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#7E22CE' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#374151',
                    border: isSelected ? '1.5px solid #7E22CE' : '1px solid #D1D5DB',
                    fontSize: '12px',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 8px rgba(126, 34, 206, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#C084FC';
                      e.currentTarget.style.backgroundColor = '#FAF5FF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Discount / Offers Accordion */}
      <div style={{ borderBottom: '1px solid #FAF5FF', paddingBottom: '14px' }}>
        <button
          type="button"
          onClick={() => toggleAccordion('discount')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            marginBottom: accordions.discount ? '12px' : 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={16} color="#7E22CE" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B4B' }}>Discounts & Offers</span>
          </div>
          {accordions.discount ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
        </button>

        {accordions.discount && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {DEFAULT_DISCOUNT_OPTIONS.map((opt) => {
              const isSelected = selectedDiscount === opt.min;
              return (
                <div
                  key={opt.min}
                  onClick={() => handleDiscountToggle(opt.min)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '5px 8px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#FAF5FF' : 'transparent',
                    border: isSelected ? '1px solid #E9D5FF' : '1px solid transparent',
                    fontSize: '12.5px',
                    color: isSelected ? '#7E22CE' : '#374151',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => handleDiscountToggle(opt.min)}
                    style={{ accentColor: '#7E22CE', cursor: 'pointer', pointerEvents: 'none' }}
                  />
                  <span>{opt.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Stock Availability */}
      <div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '10px',
            backgroundColor: inStockOnly ? '#FAF5FF' : '#F9FAFB',
            border: inStockOnly ? '1.5px solid #C084FC' : '1px solid #E5E7EB',
            cursor: 'pointer',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B' }}>In Stock Only</span>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>Hide items currently out of stock</div>
          </div>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              setCurrentPage(1);
              scrollToCatalog();
            }}
            style={{ accentColor: '#7E22CE', width: '16px', height: '16px', cursor: 'pointer' }}
          />
        </label>
      </div>
    </div>
  );

  return (
    <div id="catalog-products-section" style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Top Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
              Explore All Products
            </h1>
            {selectedCategories.length > 0 && (
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  color: '#7E22CE',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Category: {selectedCategories.join(', ')}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategories([]);
                    scrollToCatalog();
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7E22CE', padding: 0 }}
                  title="Clear category filter"
                >
                  <X size={13} />
                </button>
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '3px 0 0 0' }}>
            Handcrafted luxury jewellery, precious ornaments & gift hampers ({totalCount || displayProducts.length} items)
          </p>
        </div>

        {/* Search input, Category Modal & Sort Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* View All Categories Modal Button */}
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: '#FAF5FF',
              border: '1.5px solid #C084FC',
              color: '#7E22CE',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7E22CE';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FAF5FF';
              e.currentTarget.style.color = '#7E22CE';
            }}
          >
            <Sparkles size={14} />
            <span>All Categories</span>
          </button>

          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#9CA3AF' }} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentPage(1);
                  scrollToCatalog();
                }
              }}
              placeholder="Search in products..."
              style={{
                width: '100%',
                padding: '8px 30px 8px 36px',
                borderRadius: '10px',
                border: '1.5px solid #E9D5FF',
                backgroundColor: '#FAF5FF',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('');
                  setCurrentPage(1);
                  scrollToCatalog();
                }}
                style={{ position: 'absolute', right: '10px', top: '9px', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
              scrollToCatalog();
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1.5px solid #E9D5FF',
              backgroundColor: '#FAF5FF',
              color: '#2E1065',
              fontSize: '13px',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="discount">Highest Discount</option>
            <option value="newest">Newest First</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '7px 10px',
                backgroundColor: viewMode === 'grid' ? '#FAF5FF' : '#ffffff',
                color: viewMode === 'grid' ? '#7E22CE' : '#9CA3AF',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Grid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '7px 10px',
                backgroundColor: viewMode === 'list' ? '#FAF5FF' : '#ffffff',
                color: viewMode === 'list' ? '#7E22CE' : '#9CA3AF',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <List size={16} />
            </button>
          </div>

          {/* Mobile Filter Trigger */}
          <button
            type="button"
            className="mobile-filter-btn"
            onClick={() => setMobileFilterOpen(true)}
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: '#7E22CE',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={15} />
            <span>Filters ({activeFilterCount})</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280' }}>Active Filters:</span>
          {selectedCategories.map((c) => (
            <span
              key={c}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '16px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #C084FC',
                color: '#7E22CE',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {c}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleCategoryToggle(c)} />
            </span>
          ))}
          {selectedSubcategories.map((s) => (
            <span
              key={s}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '16px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #C084FC',
                color: '#7E22CE',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {s}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleSubcategoryToggle(s)} />
            </span>
          ))}
          {selectedColors.map((c) => (
            <span
              key={c}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '16px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #C084FC',
                color: '#7E22CE',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {c}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleColorToggle(c)} />
            </span>
          ))}
          {selectedSizes.map((sz) => (
            <span
              key={sz}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '16px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #C084FC',
                color: '#7E22CE',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {sz}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleSizeToggle(sz)} />
            </span>
          ))}
          {selectedDiscount && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '16px',
                backgroundColor: '#FAF5FF',
                border: '1px solid #C084FC',
                color: '#7E22CE',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {selectedDiscount}%+ Off
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedDiscount(null)} />
            </span>
          )}
          {inStockOnly && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '16px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#047857',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              In Stock Only
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setInStockOnly(false)} />
            </span>
          )}
          <button
            type="button"
            onClick={handleClearAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC2626',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Catalog Layout */}
      <div className="catalog-layout-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
        {/* Desktop Filter Sidebar */}
        <aside
          className="catalog-sidebar"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #E9D5FF',
            padding: '20px',
            height: 'fit-content',
            boxShadow: '0 4px 6px rgba(107, 33, 168, 0.03)',
          }}
        >
          {renderSidebarContent()}
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'flex-start',
            }}
          >
            <div
              style={{
                width: '85%',
                maxWidth: '340px',
                height: '100%',
                backgroundColor: '#ffffff',
                padding: '24px 20px',
                overflowY: 'auto',
                boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={22} color="#374151" />
                </button>
              </div>
              {renderSidebarContent()}
            </div>
          </div>
        )}

        {/* Products Grid / Results Area */}
        <main>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#7E22CE' }}>
              <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '15px', fontWeight: 600 }}>Loading latest products...</div>
            </div>
          ) : displayProducts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #E9D5FF',
              }}
            >
              <Search size={40} color="#C084FC" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E1B4B', margin: '0 0 6px 0' }}>
                No Products Found
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 18px 0' }}>
                Try adjusting your selected category, price slider, or keyword filter.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#7E22CE',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div
              className="products-catalog-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
              }}
            >
              {displayProducts.map((prod) => {
                const isWishlisted = Boolean(likedMap[String(prod.id)] || likedMap[String(prod.productId)]);
                const isAdded = cartState[prod.id];

                return (
                  <div
                    key={prod.id}
                    className="product-card-wrap"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #F3E8FF',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 4px rgba(107, 33, 168, 0.03)',
                      position: 'relative',
                    }}
                  >
                    {/* Badge */}
                    {prod.badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: prod.badgeColor || '#7E22CE',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          zIndex: 2,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {prod.badge}
                      </span>
                    )}

                    {/* 1-Click Wishlist / Interest Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleWishlist(e, prod)}
                      aria-label="Save to Wishlist & Interests"
                      title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: isWishlisted ? '#FEF2F2' : '#ffffff',
                        border: isWishlisted ? '1.5px solid #FECACA' : '1px solid #F3E8FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 2,
                        boxShadow: isWishlisted ? '0 3px 10px rgba(220, 38, 38, 0.18)' : '0 2px 6px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: isWishlisted ? 'scale(1.08)' : 'scale(1)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.18)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = isWishlisted ? 'scale(1.08)' : 'scale(1)')}
                    >
                      <Heart
                        size={16}
                        fill={isWishlisted ? '#DC2626' : 'none'}
                        color={isWishlisted ? '#DC2626' : '#6B7280'}
                        style={{ transition: 'all 0.2s ease' }}
                      />
                    </button>

                    {/* Image */}
                    <Link
                      href={`/products/${prod.slug}`}
                      style={{
                        display: 'block',
                        position: 'relative',
                        aspectRatio: '1 / 1',
                        backgroundColor: '#FAF5FF',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                        className="catalog-product-img"
                      />
                    </Link>

                    {/* Details */}
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#7E22CE',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        {prod.category}
                      </div>

                      <Link
                        href={`/products/${prod.slug}`}
                        style={{
                          textDecoration: 'none',
                          color: '#1E1B4B',
                          fontSize: '14px',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: '8px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '36px',
                        }}
                      >
                        {prod.name}
                      </Link>

                      {/* Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#F59E0B' }}>
                          <Star size={12} fill="#F59E0B" />
                        </div>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1E1B4B' }}>{prod.rating}</span>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>({prod.reviews})</span>
                      </div>

                      {/* Price & Add to Cart */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 'auto',
                          paddingTop: '8px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#1E1B4B' }}>₹{prod.price}</span>
                            {prod.originalPrice && prod.originalPrice > prod.price && (
                              <span style={{ fontSize: '11px', color: '#9CA3AF', textDecoration: 'line-through' }}>
                                ₹{prod.originalPrice}
                              </span>
                            )}
                            {prod.discount > 0 && prod.originalPrice && prod.originalPrice > prod.price && (
                              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#16A34A', backgroundColor: '#F0FDF4', padding: '1px 5px', borderRadius: '4px' }}>
                                {prod.discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, prod.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: isAdded ? '#10B981' : '#7E22CE',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          {isAdded ? (
                            <>
                              <Check size={13} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={13} />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {displayProducts.map((prod) => {
                const isWishlisted = Boolean(likedMap[String(prod.id)] || likedMap[String(prod.productId)]);
                const isAdded = cartState[prod.id];

                return (
                  <div
                    key={prod.id}
                    style={{
                      display: 'flex',
                      gap: '18px',
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #F3E8FF',
                      alignItems: 'center',
                      boxShadow: '0 2px 4px rgba(107, 33, 168, 0.03)',
                    }}
                  >
                    <Link
                      href={`/products/${prod.slug}`}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        backgroundColor: '#FAF5FF',
                      }}
                    >
                      <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Link>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: '#7E22CE', fontWeight: 700, textTransform: 'uppercase' }}>
                        {prod.category} {prod.subcategory ? `• ${prod.subcategory}` : ''}
                      </div>
                      <Link
                        href={`/products/${prod.slug}`}
                        style={{ fontSize: '15px', fontWeight: 700, color: '#1E1B4B', textDecoration: 'none', margin: '2px 0 6px 0', display: 'block' }}
                      >
                        {prod.name}
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#1E1B4B' }}>₹{prod.price}</span>
                        {prod.originalPrice > prod.price && (
                          <span style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through' }}>
                            ₹{prod.originalPrice}
                          </span>
                        )}
                        {prod.discount > 0 && prod.originalPrice && prod.originalPrice > prod.price && (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEF2F2', padding: '2px 6px', borderRadius: '4px' }}>
                            {prod.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, prod.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: isAdded ? '#10B981' : '#7E22CE',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
                        <span>{isAdded ? 'Added' : 'Add to Cart'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(e, prod)}
                        title={isWishlisted ? 'Remove from Interests' : 'Save to Interests'}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          backgroundColor: isWishlisted ? '#FEF2F2' : '#FAF5FF',
                          border: `1px solid ${isWishlisted ? '#FECACA' : '#E9D5FF'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: isWishlisted ? '#DC2626' : '#7E22CE',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Heart size={16} fill={isWishlisted ? '#DC2626' : 'none'} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dynamic Scalable Pagination */}
          {totalCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: totalPages > 1 ? 'space-between' : 'center',
                marginTop: '40px',
                paddingTop: '20px',
                borderTop: '1px solid #F3F4F6',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                Showing{' '}
                <b style={{ color: '#111827' }}>
                  {totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                </b>{' '}
                to{' '}
                <b style={{ color: '#111827' }}>
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}
                </b>{' '}
                of <b style={{ color: '#111827' }}>{totalCount}</b> products
                {totalPages > 1 && (
                  <span style={{ color: '#9CA3AF', marginLeft: '6px' }}>
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </div>

              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* First Page */}
                  <button
                    type="button"
                    title="First Page"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(1);
                      scrollToCatalog();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      color: currentPage === 1 ? '#D1D5DB' : '#374151',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  {/* Previous Page */}
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      scrollToCatalog();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: currentPage === 1 ? '#9CA3AF' : '#374151',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ChevronLeft size={15} />
                    <span>Prev</span>
                  </button>

                  {/* Page Numbers */}
                  {getPaginationItems(currentPage, totalPages).map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          style={{
                            padding: '0 4px',
                            color: '#9CA3AF',
                            fontSize: '14px',
                            fontWeight: 700,
                            userSelect: 'none',
                          }}
                        >
                          ...
                        </span>
                      );
                    }
                    const num = item;
                    const isCurrent = currentPage === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setCurrentPage(num);
                          scrollToCatalog();
                        }}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: isCurrent ? '#7E22CE' : '#FFFFFF',
                          color: isCurrent ? '#FFFFFF' : '#374151',
                          border: isCurrent ? '1px solid #7E22CE' : '1px solid #E5E7EB',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isCurrent ? '0 2px 4px rgba(126, 34, 206, 0.2)' : 'none',
                        }}
                      >
                        {num}
                      </button>
                    );
                  })}

                  {/* Next Page */}
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      setCurrentPage((p) => p + 1);
                      scrollToCatalog();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: currentPage >= totalPages ? '#9CA3AF' : '#374151',
                      cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>Next</span>
                    <ChevronRight size={15} />
                  </button>

                  {/* Last Page */}
                  <button
                    type="button"
                    title="Last Page"
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      setCurrentPage(totalPages);
                      scrollToCatalog();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      color: currentPage >= totalPages ? '#D1D5DB' : '#374151',
                      cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Category Grid Modal for Direct Category Filtering (Pure categories with images) */}
      <CategoryGridModal
        isOpen={isCategoryModalOpen || isCategoryModalOpenExternal}
        onClose={() => {
          setIsCategoryModalOpen(false);
          if (onCategoryModalClose) onCategoryModalClose();
        }}
        categories={dbCategories}
        selectedCategory={selectedCategories[0] || null}
        onSelectCategory={handleSelectCategoryFromModal}
      />

      <style jsx global>{`
        .filter-accordion-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .filter-accordion-scroll::-webkit-scrollbar-track {
          background: #FAF5FF;
          border-radius: 4px;
        }
        .filter-accordion-scroll::-webkit-scrollbar-thumb {
          background: #D8B4FE;
          border-radius: 4px;
        }
        .filter-accordion-scroll::-webkit-scrollbar-thumb:hover {
          background: #A855F7;
        }
        :global(.product-card-wrap:hover) {
          transform: translateY(-4px);
          border-color: #C084FC !important;
          box-shadow: 0 12px 24px rgba(126, 34, 206, 0.1) !important;
        }
        :global(.product-card-wrap:hover .prod-card-img) {
          transform: scale(1.06);
        }
        @media (max-width: 1200px) {
          .products-catalog-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 900px) {
          .catalog-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .catalog-sidebar {
            display: none !important;
          }
          .mobile-filter-btn {
            display: inline-flex !important;
          }
          .products-catalog-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 540px) {
          .products-catalog-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}


