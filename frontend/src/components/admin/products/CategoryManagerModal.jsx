"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  X,
  Plus,
  FolderTree,
  Sparkles,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  Layers,
  ChevronRight,
  RefreshCw,
  Zap,
  CheckSquare,
  Square,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { adminCategoryApi } from '@/lib/api/admin/categories';
import { adminProductApi } from '@/lib/api/admin/products';
import { BusyOverlay, BusyButtonLabel } from '@/components/admin/BusyUI';

const THE_PURPLE_PRESETS = [
  {
    name: 'Jewellery & Ornaments',
    description: 'Fine & fashion jewellery, sterling silver, gold-plated ornaments',
    subcategories: [
      'Necklaces & Chains',
      'Chokers',
      'Earrings & Studs',
      'Rings & Bands',
      'Solitaire Rings',
      'Bangles & Kadas',
      'Bracelets',
      'Anklets (Payal)',
      'Mangalsutras',
      'Pendants & Lockets',
      'Nose Pins & Rings',
      'Brooches',
      'Hair Accessories',
    ],
  },
  {
    name: 'Teddy Bears & Plushies',
    description: 'Soft toys, giant stuffed bears, cute plush gift items',
    subcategories: [
      'Classic Teddy Bears (15cm - 50cm)',
      'Giant Life-Size Bears (100cm - 200cm)',
      'Cute Keychain & Mini Plushies',
      'Couple & Valentine Bears',
      'Personalized & Custom Bears',
      'Animal Soft Toys',
      'Plush Cushions & Pillows',
    ],
  },
  {
    name: 'Gifts & Hampers',
    description: 'Curated gift sets, hampers, celebration combos',
    subcategories: [
      'Birthday Gift Hampers',
      'Anniversary Luxury Boxes',
      'Teddy & Jewellery Combos',
      'Chocolate & Flower Combos',
      'Customized Keepsake Boxes',
      'Corporate Gift Sets',
    ],
  },
  {
    name: 'Fashion Accessories',
    description: 'Bags, wallets, watches and lifestyle essentials',
    subcategories: [
      'Handbags & Clutches',
      'Wallets & Card Holders',
      'Watches',
      'Scarves & Stoles',
      'Belts',
      'Keychains & Charms',
    ],
  },
];

export default function CategoryManagerModal({ open, onClose, onCategoriesUpdated }) {
  const [activeTab, setActiveTab] = useState('browse'); // browse | single | bulk | presets
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyLabel, setBusyLabel] = useState('Please wait...');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Connected category + subcategories state
  const [createMode, setCreateMode] = useState('NEW_CATEGORY'); // 'NEW_CATEGORY' | 'EXISTING_CATEGORY'
  const [singleType, setSingleType] = useState('CATEGORY'); // CATEGORY | SUBCATEGORY
  const [singleName, setSingleName] = useState('');
  const [singleSlug, setSingleSlug] = useState('');
  const [singleParentId, setSingleParentId] = useState('');
  const [singleDescription, setSingleDescription] = useState('');
  const [singleImageUrl, setSingleImageUrl] = useState('');
  const [singleIsFeatured, setSingleIsFeatured] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [subcategoriesList, setSubcategoriesList] = useState([]);
  const [subInput, setSubInput] = useState('');

  const fileInputRef = useRef(null);

  // Bulk form
  const [bulkCategoryName, setBulkCategoryName] = useState('');
  const [bulkSubcategoriesText, setBulkSubcategoriesText] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCategoryApi.listCategories();
      setCategories(res?.categories || []);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadCategories();
      setError('');
      setSelectedIds([]);
    }
  }, [open, loadCategories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.subcategories?.some((sub) => sub.name.toLowerCase().includes(q))
    );
  }, [categories, search]);

  if (!open) return null;

  const handleSelectAll = () => {
    if (selectedIds.length === categories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleUploadSingleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploadingImage(true);
    try {
      const res = await adminProductApi.uploadImage(file, 'categories');
      const url = res?.imageUrl || res?.url || (typeof res === 'string' ? res : '');
      if (url) {
        setSingleImageUrl(url);
      }
    } catch (err) {
      setError(err?.message || 'Failed to upload image to R2');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddSubcategoryChip = (text) => {
    const raw = text !== undefined ? text : subInput;
    if (!raw || !raw.trim()) return;
    const parts = raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;

    setSubcategoriesList((prev) => {
      const existingNames = new Set(prev.map((s) => s.name.toLowerCase()));
      const newItems = parts
        .filter((name) => !existingNames.has(name.toLowerCase()))
        .map((name) => ({ id: `temp-${Date.now()}-${Math.random()}`, name }));
      return [...prev, ...newItems];
    });
    setSubInput('');
  };

  const handleRemoveSubcategoryChip = (index) => {
    setSubcategoriesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSingleSave = async (e) => {
    e.preventDefault();
    setError('');
    setBusyLabel(editingItem ? 'Updating Category...' : 'Saving Category & Subcategories...');
    setSubmitting(true);

    try {
      if (editingItem) {
        if (singleType === 'CATEGORY') {
          await adminCategoryApi.updateCategory(editingItem.id, {
            name: singleName,
            slug: singleSlug || undefined,
            description: singleDescription || undefined,
            imageUrl: singleImageUrl || undefined,
            isFeatured: singleIsFeatured,
          });

          // Also create any newly added subcategories in the list
          if (subcategoriesList.length > 0) {
            for (const sub of subcategoriesList) {
              await adminCategoryApi.createSubcategory({
                categoryId: editingItem.id,
                name: sub.name,
              }).catch(() => {});
            }
          }
        } else {
          await adminCategoryApi.updateSubcategory(editingItem.id, {
            categoryId: singleParentId,
            name: singleName,
            slug: singleSlug || undefined,
            description: singleDescription || undefined,
            imageUrl: singleImageUrl || undefined,
          });
        }
      } else if (createMode === 'NEW_CATEGORY') {
        if (!singleName.trim()) {
          setError('Category name is required');
          setSubmitting(false);
          return;
        }

        // 1. Create Parent Category
        const newCatRes = await adminCategoryApi.createCategory({
          name: singleName.trim(),
          slug: singleSlug || undefined,
          description: singleDescription || undefined,
          imageUrl: singleImageUrl || undefined,
          isFeatured: singleIsFeatured,
        });

        const createdCatId = newCatRes?.category?.id || newCatRes?.id;

        // 2. Automatically create all attached subcategories under this newly created category
        if (createdCatId && subcategoriesList.length > 0) {
          for (const sub of subcategoriesList) {
            await adminCategoryApi.createSubcategory({
              categoryId: createdCatId,
              name: sub.name,
            }).catch(() => {});
          }
        }
      } else {
        // EXISTING_CATEGORY mode
        if (!singleParentId) {
          setError('Please select an existing parent category');
          setSubmitting(false);
          return;
        }
        if (subcategoriesList.length === 0 && !subInput.trim()) {
          setError('Please enter at least one subcategory name');
          setSubmitting(false);
          return;
        }

        const allSubs = [...subcategoriesList];
        if (subInput.trim() && !allSubs.some((s) => s.name.toLowerCase() === subInput.trim().toLowerCase())) {
          allSubs.push({ name: subInput.trim() });
        }

        for (const sub of allSubs) {
          await adminCategoryApi.createSubcategory({
            categoryId: singleParentId,
            name: sub.name,
          }).catch(() => {});
        }
      }

      setSingleName('');
      setSingleSlug('');
      setSingleDescription('');
      setSingleImageUrl('');
      setSubcategoriesList([]);
      setSubInput('');
      setEditingItem(null);
      await loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
      setActiveTab('browse');
    } catch (err) {
      setError(err?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusyLabel('Importing categories...');
    setSubmitting(true);

    try {
      const subList = bulkSubcategoriesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        items: [
          {
            name: bulkCategoryName.trim(),
            subcategories: subList,
          },
        ],
      };

      await adminCategoryApi.bulkCreateCategories(payload);
      setBulkCategoryName('');
      setBulkSubcategoriesText('');
      await loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
      setActiveTab('browse');
    } catch (err) {
      setError(err?.message || 'Failed to import bulk category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyPreset = async (preset) => {
    setBusyLabel(`Applying ${preset.name}...`);
    setSubmitting(true);
    setError('');
    try {
      await adminCategoryApi.bulkCreateCategories({
        items: [preset],
      });
      await loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      setError(err?.message || 'Failed to apply preset');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete single category
  const handleDeleteCategory = async (catId) => {
    if (submitting) return;
    const cat = categories.find((c) => c.id === catId);
    if (!window.confirm(`Are you sure you want to delete category "${cat?.name || ''}"? This will also remove its subcategories.`)) {
      return;
    }
    setBusyLabel('Deleting category...');
    setSubmitting(true);
    try {
      await adminCategoryApi.deleteCategory(catId, false);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      setSelectedIds((prev) => prev.filter((id) => id !== catId));
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
      loadCategories();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubcategory = async (subId) => {
    if (submitting) return;
    if (!window.confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }
    setBusyLabel('Deleting subcategory...');
    setSubmitting(true);
    try {
      await adminCategoryApi.deleteSubcategory(subId, false);
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          subcategories: c.subcategories ? c.subcategories.filter((s) => s.id !== subId) : [],
        }))
      );
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      alert(err.message || 'Failed to delete subcategory');
      loadCategories();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0 || submitting) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected category(ies)?`)) {
      return;
    }
    const idsToDelete = [...selectedIds];
    setBusyLabel('Deleting selected...');
    setSubmitting(true);
    try {
      await adminCategoryApi.bulkDeleteCategories(idsToDelete, false);
      setCategories((prev) => prev.filter((c) => !idsToDelete.includes(c.id)));
      setSelectedIds([]);
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      alert(err.message || 'Failed to delete selected categories');
      loadCategories();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (categories.length === 0 || submitting) return;
    if (!window.confirm('Are you sure you want to delete ALL categories and their subcategories? This cannot be undone.')) return;
    setBusyLabel('Deleting all...');
    setSubmitting(true);
    try {
      await adminCategoryApi.deleteAllCategories(false);
      setCategories([]);
      setSelectedIds([]);
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      alert(err.message || 'Failed to delete all categories');
      loadCategories();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 27, 75, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '850px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(126, 34, 206, 0.2)',
          border: '1px solid #E9D5FF',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '88vh',
          position: 'relative',
        }}
      >
        <BusyOverlay show={submitting} label={busyLabel} />
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#FAF5FF',
            borderBottom: '1px solid #E9D5FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#7E22CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <FolderTree size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#2E1065' }}>
                Master Category & Taxonomy Manager
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                Organize store hierarchy, subcategories, presets, and bulk delete
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E5E7EB',
            padding: '0 24px',
            gap: '16px',
            backgroundColor: '#ffffff',
          }}
        >
          {[
            { id: 'browse', label: `Categories (${categories.length})` },
            { id: 'single', label: '+ Add Category & Subcategories' },
            { id: 'bulk', label: '⚡ Bulk Subcategories' },
            { id: 'presets', label: '✨ Industry Presets' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 0',
                border: 'none',
                background: 'none',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '13px',
                color: activeTab === tab.id ? '#7E22CE' : '#6B7280',
                borderBottom: activeTab === tab.id ? '2px solid #7E22CE' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ margin: '12px 24px 0', padding: '10px 14px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'browse' && (
            <div>
              {/* Search & Bulk Action Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
                  <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#9CA3AF' }} />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 30px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                  </div>

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
                      backgroundColor: '#FAF5FF',
                      color: '#7E22CE',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {selectedIds.length === categories.length && categories.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                    <span>{selectedIds.length === categories.length && categories.length > 0 ? 'Deselect All' : 'Select All'}</span>
                  </button>

                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#DC2626',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} /> Delete Selected ({selectedIds.length})
                    </button>
                  )}
                </div>

                {categories.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteAll}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #FECACA',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} /> Delete All Categories
                  </button>
                )}
              </div>

              {/* Categories List */}
              {loading && categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>Loading categories...</div>
              ) : filteredCategories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
                  <FolderTree size={40} style={{ color: '#C084FC', marginBottom: '10px' }} />
                  <p style={{ fontWeight: 600, margin: '0 0 6px' }}>No Categories Found</p>
                  <p style={{ fontSize: '13px', margin: 0 }}>Add categories or apply pre-built industry presets</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredCategories.map((cat) => {
                    const isSelected = selectedIds.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        style={{
                          borderRadius: '12px',
                          border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E9D5FF',
                          backgroundColor: '#ffffff',
                          overflow: 'hidden',
                          boxShadow: '0 2px 4px rgba(126, 34, 206, 0.04)',
                        }}
                      >
                        {/* Category Header */}
                        <div
                          style={{
                            padding: '12px 16px',
                            backgroundColor: isSelected ? '#FAF5FF' : '#FAF5FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: cat.subcategories?.length > 0 ? '1px solid #F3E8FF' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(cat.id)}
                              style={{ accentColor: '#7E22CE', width: '15px', height: '15px', cursor: 'pointer' }}
                            />
                            <div>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: '#2E1065' }}>{cat.name}</span>
                              <span style={{ marginLeft: '8px', fontSize: '11px', color: '#7E22CE', backgroundColor: '#F3E8FF', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                {cat.subcategories?.length || 0} subcategories
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(cat);
                                setSingleType('CATEGORY');
                                setSingleName(cat.name);
                                setSingleSlug(cat.slug || '');
                                setSingleDescription(cat.description || '');
                                setSingleImageUrl(cat.imageUrl || '');
                                setSingleIsFeatured(Boolean(cat.isFeatured));
                                setActiveTab('single');
                              }}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#7E22CE', padding: '4px' }}
                              title="Edit category"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px' }}
                              title="Delete category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Subcategories list */}
                        {cat.subcategories?.length > 0 && (
                          <div style={{ padding: '10px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px', backgroundColor: '#ffffff' }}>
                            {cat.subcategories.map((sub) => (
                              <div
                                key={sub.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  backgroundColor: '#F9FAFB',
                                  border: '1px solid #E5E7EB',
                                  fontSize: '12px',
                                  color: '#374151',
                                }}
                              >
                                {sub.imageUrl && (
                                  <img
                                    src={sub.imageUrl}
                                    alt={sub.name}
                                    style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }}
                                  />
                                )}
                                <span>{sub.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubcategory(sub.id)}
                                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0 2px' }}
                                  title="Delete subcategory"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'single' && (
            <form onSubmit={handleSingleSave} style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Header Mode Switcher: Create New vs Add to Existing */}
              {!editingItem && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#F5F3FF', padding: '6px', borderRadius: '12px', border: '1px solid #E9D5FF' }}>
                  <button
                    type="button"
                    onClick={() => setCreateMode('NEW_CATEGORY')}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: createMode === 'NEW_CATEGORY' ? 800 : 600,
                      backgroundColor: createMode === 'NEW_CATEGORY' ? '#7E22CE' : 'transparent',
                      color: createMode === 'NEW_CATEGORY' ? '#FFFFFF' : '#6B21A8',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Sparkles size={15} />
                    <span>✨ Create New Category &amp; Subcategories</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateMode('EXISTING_CATEGORY')}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: createMode === 'EXISTING_CATEGORY' ? 800 : 600,
                      backgroundColor: createMode === 'EXISTING_CATEGORY' ? '#7E22CE' : 'transparent',
                      color: createMode === 'EXISTING_CATEGORY' ? '#FFFFFF' : '#6B21A8',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Layers size={15} />
                    <span>↳ Add Subcategories to Existing Category</span>
                  </button>
                </div>
              )}

              {/* 2-Column Connected Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
                
                {/* ── LEFT COLUMN: PARENT CATEGORY DETAILS ── */}
                <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #E9D5FF', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 2px 8px rgba(126, 34, 206, 0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3E8FF', paddingBottom: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FAF5FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FolderTree size={16} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1E1B4B' }}>
                        {createMode === 'EXISTING_CATEGORY' ? 'Select Parent Category' : 'Parent Category Info'}
                      </h4>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>
                        {createMode === 'EXISTING_CATEGORY' ? 'Choose which category to attach subcategories to' : 'Main shop department / collection'}
                      </div>
                    </div>
                  </div>

                  {createMode === 'EXISTING_CATEGORY' ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Parent Category *
                      </label>
                      <select
                        required
                        value={singleParentId}
                        onChange={(e) => setSingleParentId(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none', fontWeight: 600, color: '#1E1B4B' }}
                      >
                        <option value="">-- Choose Category --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.subcategories?.length || 0} subcategories)
                          </option>
                        ))}
                      </select>
                      {singleParentId && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#FAF5FF', borderRadius: '8px', fontSize: '11.5px', color: '#7E22CE', fontWeight: 600 }}>
                          ✓ Selected: <strong>{categories.find((c) => c.id === singleParentId)?.name}</strong>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                          Category Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={singleName}
                          onChange={(e) => setSingleName(e.target.value)}
                          placeholder="e.g. Teddy bear, Jewellery, Gifts & Hampers"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none', fontWeight: 600 }}
                        />
                      </div>

                      {/* Cloudflare R2 Category Image Upload */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                          Category Banner Image (R2 Cloud Storage)
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleUploadSingleImage}
                          style={{ display: 'none' }}
                        />

                        {singleImageUrl ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 14px',
                              backgroundColor: '#FAF5FF',
                              border: '1.5px solid #E9D5FF',
                              borderRadius: '10px',
                            }}
                          >
                            <img
                              src={singleImageUrl}
                              alt="Category Preview"
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '1px solid #D8B4FE',
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: '#581C87' }}>Uploaded to Cloud</div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: '#7E22CE',
                                  fontFamily: 'monospace',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {singleImageUrl}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: '#7E22CE',
                                  color: '#ffffff',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                {uploadingImage ? '...' : 'Replace'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSingleImageUrl('')}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: '#FEE2E2',
                                  color: '#DC2626',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => !uploadingImage && fileInputRef.current?.click()}
                            style={{
                              border: '2px dashed #C084FC',
                              borderRadius: '10px',
                              padding: '14px',
                              textAlign: 'center',
                              backgroundColor: '#FAF5FF',
                              cursor: uploadingImage ? 'wait' : 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {uploadingImage ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#7E22CE' }}>
                                <Loader2 size={18} className="animate-spin" />
                                <span style={{ fontSize: '12px', fontWeight: 600 }}>Uploading image to R2...</span>
                              </div>
                            ) : (
                              <div>
                                <Upload size={20} color="#7E22CE" style={{ margin: '0 auto 4px' }} />
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#581C87' }}>
                                  Upload category image (R2 Cloud)
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                          Description (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={singleDescription}
                          onChange={(e) => setSingleDescription(e.target.value)}
                          placeholder="Brief summary..."
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none' }}
                        />
                      </div>

                      <div
                        onClick={() => setSingleIsFeatured((prev) => !prev)}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: singleIsFeatured ? '#FAF5FF' : '#F9FAFB',
                          border: singleIsFeatured ? '1.5px solid #C084FC' : '1px solid #E5E7EB',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={14} color={singleIsFeatured ? '#7E22CE' : '#9CA3AF'} />
                            <span>Show in Home Navigation Bar</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                            Feature this category in the top navigation tabs.
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={singleIsFeatured}
                          onChange={(e) => setSingleIsFeatured(e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ accentColor: '#7E22CE', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* ── RIGHT COLUMN: CONNECTED SUBCATEGORIES BUILDER ── */}
                <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #E9D5FF', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 2px 8px rgba(126, 34, 206, 0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F3E8FF', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FAF5FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={16} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1E1B4B' }}>
                          Connected Subcategories
                        </h4>
                        <div style={{ fontSize: '11px', color: '#7E22CE', fontWeight: 600 }}>
                          For: <strong>{createMode === 'EXISTING_CATEGORY' ? (categories.find((c) => c.id === singleParentId)?.name || 'Select Category') : (singleName.trim() || 'New Category')}</strong>
                        </div>
                      </div>
                    </div>
                    {subcategoriesList.length > 0 && (
                      <span style={{ fontSize: '11px', backgroundColor: '#FAF5FF', color: '#7E22CE', border: '1px solid #E9D5FF', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        {subcategoriesList.length} ready
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Add Subcategories (Type &amp; press Enter or comma)
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={subInput}
                        onChange={(e) => setSubInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            handleAddSubcategoryChip();
                          }
                        }}
                        placeholder="e.g. Classic Teddy Bears, Giant Bears..."
                        style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSubcategoryChip()}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '8px',
                          backgroundColor: '#7E22CE',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          flexShrink: 0,
                        }}
                      >
                        <Plus size={14} />
                        <span>Add</span>
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                      💡 Tip: You can paste multiple comma-separated subcategories to add them all at once!
                    </div>
                  </div>

                  {/* Subcategories Chips Rail */}
                  <div style={{ minHeight: '130px', padding: '12px', backgroundColor: '#FAF5FF', borderRadius: '10px', border: '1px dashed #D8B4FE', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {subcategoriesList.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 10px', color: '#8B5CF6' }}>
                        <Layers size={24} style={{ margin: '0 auto 6px', opacity: 0.7 }} />
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>No subcategories added yet</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Subcategories will automatically attach to this category on save</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '2px' }}>
                        {subcategoriesList.map((sub, idx) => (
                          <div
                            key={sub.id || idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              backgroundColor: '#ffffff',
                              border: '1.5px solid #C084FC',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#581C87',
                              boxShadow: '0 1px 3px rgba(126, 34, 206, 0.08)',
                            }}
                          >
                            <span>{sub.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubcategoryChip(idx)}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: '#DC2626',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Remove subcategory"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {subcategoriesList.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #E9D5FF', marginTop: '8px' }}>
                        <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600 }}>
                          Total: <strong>{subcategoriesList.length} subcategories</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSubcategoriesList([])}
                          style={{ border: 'none', background: 'none', color: '#DC2626', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Unified Submit Action Bar */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '14px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#7E22CE',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(126, 34, 206, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
              >
                {submitting ? (
                  <BusyButtonLabel busy busyText={busyLabel}>
                    Saving Category &amp; Subcategories...
                  </BusyButtonLabel>
                ) : editingItem ? (
                  `💾 Update Category ${subcategoriesList.length > 0 ? `& Add ${subcategoriesList.length} Subcategories` : ''}`
                ) : createMode === 'NEW_CATEGORY' ? (
                  `💾 Save Category ${singleName.trim() ? `"${singleName.trim()}"` : ''} & ${subcategoriesList.length} Subcategories (1-Click)`
                ) : (
                  `💾 Save ${subcategoriesList.length || 1} Subcategories to Selected Category`
                )}
              </button>
            </form>
          )}

          {activeTab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={bulkCategoryName}
                  onChange={(e) => setBulkCategoryName(e.target.value)}
                  placeholder="e.g. Jewellery & Ornaments"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Subcategories (One per line)
                </label>
                <textarea
                  rows={6}
                  value={bulkSubcategoriesText}
                  onChange={(e) => setBulkSubcategoriesText(e.target.value)}
                  placeholder={`Necklaces\nEarrings\nRings\nBangles\nBracelets`}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none', fontFamily: 'monospace' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#7E22CE',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? (
                  <BusyButtonLabel busy busyText="Importing...">Importing...</BusyButtonLabel>
                ) : '⚡ Create Category & All Subcategories'}
              </button>
            </form>
          )}

          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {THE_PURPLE_PRESETS.map((preset, idx) => (
                <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E9D5FF', backgroundColor: '#FAF5FF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#2E1065' }}>{preset.name}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{preset.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      disabled={submitting}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#7E22CE',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      + Import {preset.subcategories.length} Subcategories
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {preset.subcategories.map((sub, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #E5E7EB',
                          fontSize: '11px',
                          color: '#374151',
                        }}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
