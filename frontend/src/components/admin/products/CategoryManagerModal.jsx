"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
import { adminCategoryApi } from '@/lib/api/admin/categories';
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

  // Single form
  const [singleType, setSingleType] = useState('CATEGORY'); // CATEGORY | SUBCATEGORY
  const [singleName, setSingleName] = useState('');
  const [singleSlug, setSingleSlug] = useState('');
  const [singleParentId, setSingleParentId] = useState('');
  const [singleDescription, setSingleDescription] = useState('');
  const [editingItem, setEditingItem] = useState(null);

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

  const handleSingleSave = async (e) => {
    e.preventDefault();
    setError('');
    setBusyLabel(editingItem ? 'Updating...' : 'Saving...');
    setSubmitting(true);

    try {
      if (singleType === 'CATEGORY') {
        if (editingItem) {
          await adminCategoryApi.updateCategory(editingItem.id, {
            name: singleName,
            slug: singleSlug || undefined,
            description: singleDescription || undefined,
          });
        } else {
          await adminCategoryApi.createCategory({
            name: singleName,
            slug: singleSlug || undefined,
            description: singleDescription || undefined,
          });
        }
      } else {
        if (!singleParentId) {
          setError('Please select a parent category');
          setSubmitting(false);
          return;
        }
        if (editingItem) {
          await adminCategoryApi.updateSubcategory(editingItem.id, {
            categoryId: singleParentId,
            name: singleName,
            slug: singleSlug || undefined,
            description: singleDescription || undefined,
          });
        } else {
          await adminCategoryApi.createSubcategory({
            categoryId: singleParentId,
            name: singleName,
            slug: singleSlug || undefined,
            description: singleDescription || undefined,
          });
        }
      }

      setSingleName('');
      setSingleSlug('');
      setSingleDescription('');
      setEditingItem(null);
      await loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
      setActiveTab('browse');
    } catch (err) {
      setError(err?.message || 'Failed to save');
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

  // Instant optimistic delete single category
  const handleDeleteCategory = async (catId) => {
    if (submitting) return;
    setBusyLabel('Deleting...');
    setSubmitting(true);
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    setSelectedIds((prev) => prev.filter((id) => id !== catId));
    try {
      await adminCategoryApi.deleteCategory(catId, true);
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch {
      loadCategories();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubcategory = async (subId) => {
    if (submitting) return;
    setBusyLabel('Deleting...');
    setSubmitting(true);
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        subcategories: c.subcategories ? c.subcategories.filter((s) => s.id !== subId) : [],
      }))
    );
    try {
      await adminCategoryApi.deleteSubcategory(subId, true);
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch {
      loadCategories();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0 || submitting) return;
    const idsToDelete = [...selectedIds];
    setBusyLabel('Deleting selected...');
    setSubmitting(true);
    setCategories((prev) => prev.filter((c) => !idsToDelete.includes(c.id)));
    setSelectedIds([]);
    try {
      await adminCategoryApi.bulkDeleteCategories(idsToDelete, true);
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch {
      loadCategories();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (categories.length === 0 || submitting) return;
    if (!window.confirm('Are you sure you want to delete ALL categories and their subcategories?')) return;
    setBusyLabel('Deleting all...');
    setSubmitting(true);
    setCategories([]);
    setSelectedIds([]);
    try {
      await adminCategoryApi.deleteAllCategories(true);
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch {
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
            { id: 'single', label: '+ Add Single' },
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
            <form onSubmit={handleSingleSave} style={{ maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Item Type
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="singleType"
                      checked={singleType === 'CATEGORY'}
                      onChange={() => setSingleType('CATEGORY')}
                      style={{ accentColor: '#7E22CE' }}
                    />
                    <span>Parent Category</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="singleType"
                      checked={singleType === 'SUBCATEGORY'}
                      onChange={() => setSingleType('SUBCATEGORY')}
                      style={{ accentColor: '#7E22CE' }}
                    />
                    <span>Subcategory</span>
                  </label>
                </div>
              </div>

              {singleType === 'SUBCATEGORY' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Parent Category *
                  </label>
                  <select
                    required
                    value={singleParentId}
                    onChange={(e) => setSingleParentId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="">Select Parent Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  placeholder={singleType === 'CATEGORY' ? 'e.g. Jewellery' : 'e.g. Earrings & Studs'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
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
                  boxShadow: '0 4px 12px rgba(126, 34, 206, 0.2)',
                }}
              >
                {submitting ? (
                  <BusyButtonLabel busy busyText={editingItem ? 'Updating...' : 'Saving...'}>
                    Saving...
                  </BusyButtonLabel>
                ) : editingItem ? 'Update Item' : '+ Create Item'}
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
