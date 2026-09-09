"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  CheckSquare,
  Square,
} from 'lucide-react';
import { adminCategoryApi } from '@/lib/api/admin/categories';
import CategoryManagerModal from '@/components/admin/products/CategoryManagerModal';
import { BusyOverlay, BusyButtonLabel } from '@/components/admin/BusyUI';

export default function CategoryManagementPage() {
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);
  const canManage = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'MANAGER';

  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Category Modal State
  const [categoryModal, setCategoryModal] = useState({
    isOpen: false,
    isEdit: false,
    id: null,
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    displayOrder: 0,
    isActive: true,
  });

  // Subcategory Modal State
  const [subModal, setSubModal] = useState({
    isOpen: false,
    isEdit: false,
    id: null,
    categoryId: '',
    categoryName: '',
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    displayOrder: 0,
    isActive: true,
  });

  const [bulkWizardOpen, setBulkWizardOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [busyLabel, setBusyLabel] = useState('Please wait...');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCategoryApi.listCategories({ search });
      setCategories(data?.categories || []);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  // Handle Category Save
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setBusyLabel(categoryModal.isEdit ? 'Updating category...' : 'Creating category...');
    setFormLoading(true);

    try {
      if (categoryModal.isEdit) {
        await adminCategoryApi.updateCategory(categoryModal.id, {
          name: categoryModal.name,
          slug: categoryModal.slug,
          description: categoryModal.description,
          imageUrl: categoryModal.imageUrl,
          displayOrder: categoryModal.displayOrder,
          isActive: categoryModal.isActive,
        });
      } else {
        await adminCategoryApi.createCategory({
          name: categoryModal.name,
          slug: categoryModal.slug,
          description: categoryModal.description,
          imageUrl: categoryModal.imageUrl,
          displayOrder: categoryModal.displayOrder,
          isActive: categoryModal.isActive,
        });
      }
      setCategoryModal((prev) => ({ ...prev, isOpen: false }));
      await fetchCategories();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Subcategory Save
  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setBusyLabel(subModal.isEdit ? 'Updating subcategory...' : 'Creating subcategory...');
    setFormLoading(true);

    try {
      if (subModal.isEdit) {
        await adminCategoryApi.updateSubcategory(subModal.id, {
          categoryId: subModal.categoryId,
          name: subModal.name,
          slug: subModal.slug,
          description: subModal.description,
          imageUrl: subModal.imageUrl,
          displayOrder: subModal.displayOrder,
          isActive: subModal.isActive,
        });
      } else {
        await adminCategoryApi.createSubcategory({
          categoryId: subModal.categoryId,
          name: subModal.name,
          slug: subModal.slug,
          description: subModal.description,
          imageUrl: subModal.imageUrl,
          displayOrder: subModal.displayOrder,
          isActive: subModal.isActive,
        });
      }
      setSubModal((prev) => ({ ...prev, isOpen: false }));
      await fetchCategories();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save subcategory');
    } finally {
      setFormLoading(false);
    }
  };

  // Instant optimistic delete single category
  const handleDeleteCategory = async (cat) => {
    if (!canManage || formLoading) return;
    setBusyLabel('Deleting...');
    setFormLoading(true);
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    setSelectedIds((prev) => prev.filter((id) => id !== cat.id));
    try {
      await adminCategoryApi.deleteCategory(cat.id, true);
    } catch {
      fetchCategories();
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSubcategory = async (sub) => {
    if (!canManage || formLoading) return;
    setBusyLabel('Deleting...');
    setFormLoading(true);
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        subcategories: c.subcategories ? c.subcategories.filter((s) => s.id !== sub.id) : [],
      }))
    );
    try {
      await adminCategoryApi.deleteSubcategory(sub.id, true);
    } catch {
      fetchCategories();
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!canManage || selectedIds.length === 0 || formLoading) return;
    const idsToDelete = [...selectedIds];
    setBusyLabel('Deleting selected...');
    setFormLoading(true);
    setCategories((prev) => prev.filter((c) => !idsToDelete.includes(c.id)));
    setSelectedIds([]);
    try {
      await adminCategoryApi.bulkDeleteCategories(idsToDelete, true);
    } catch {
      fetchCategories();
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!canManage || categories.length === 0 || formLoading) return;
    if (!window.confirm('Are you sure you want to delete ALL categories and subcategories?')) return;
    setBusyLabel('Deleting all...');
    setFormLoading(true);
    setCategories([]);
    setSelectedIds([]);
    try {
      await adminCategoryApi.deleteAllCategories(true);
    } catch {
      fetchCategories();
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <BusyOverlay show={formLoading} label={busyLabel} />
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2E1065', margin: 0 }}>
            Categories & Taxonomies
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Organize products with hierarchical master categories, subcategories & presets
          </p>
        </div>

        {canManage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setBulkWizardOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: '#FAF5FF',
                color: '#7E22CE',
                border: '1px solid #C084FC',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Zap size={16} color="#D97706" />
              <span>⚡ Bulk Taxonomy Wizard & Presets</span>
            </button>

            <button
              onClick={() => {
                setErrorMsg('');
                setCategoryModal({
                  isOpen: true,
                  isEdit: false,
                  id: null,
                  name: '',
                  slug: '',
                  description: '',
                  imageUrl: '',
                  displayOrder: categories.length + 1,
                  isActive: true,
                });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                backgroundColor: '#7E22CE',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
              }}
            >
              <Plus size={16} />
              <span>+ Add Main Category</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Bulk Action Toolbar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #E9D5FF',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#9CA3AF' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories and subcategories..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#FAF5FF',
            }}
          />
        </div>

        {canManage && categories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleSelectAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
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
                  padding: '7px 14px',
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

            <button
              type="button"
              onClick={handleDeleteAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
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
          </div>
        )}
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading category taxonomy...</div>
      ) : categories.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E9D5FF',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            color: '#6B7280',
          }}
        >
          <FolderTree size={40} style={{ color: '#C084FC', margin: '0 auto 12px' }} />
          <h3 style={{ color: '#1E1B4B', margin: '0 0 6px 0' }}>No Categories Found</h3>
          <p style={{ fontSize: '13px', margin: 0 }}>Create your first category or open the Bulk Taxonomy Wizard above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {categories.map((cat) => {
            const isSelected = selectedIds.includes(cat.id);
            return (
              <div
                key={cat.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E9D5FF',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(107, 33, 168, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Category Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #FAF5FF',
                    paddingBottom: '14px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {canManage && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(cat.id)}
                        style={{ accentColor: '#7E22CE', width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }}
                      />
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E1B4B', margin: 0 }}>{cat.name}</h3>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 700,
                            backgroundColor: cat.isActive ? '#ECFDF5' : '#FEF2F2',
                            color: cat.isActive ? '#047857' : '#DC2626',
                          }}
                        >
                          {cat.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#7E22CE', fontFamily: 'monospace', marginTop: '2px' }}>
                        /{cat.slug}
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setErrorMsg('');
                          setCategoryModal({
                            isOpen: true,
                            isEdit: true,
                            id: cat.id,
                            name: cat.name,
                            slug: cat.slug,
                            description: cat.description || '',
                            imageUrl: cat.imageUrl || '',
                            displayOrder: cat.displayOrder || 0,
                            isActive: cat.isActive,
                          });
                        }}
                        title="Edit Category"
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: '#FAF5FF',
                          border: '1px solid #E9D5FF',
                          color: '#7E22CE',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        title="Delete Category"
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FECACA',
                          color: '#DC2626',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {cat.description && (
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                    {cat.description}
                  </p>
                )}

                {/* Subcategories List */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#581C87', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={14} />
                      <span>Subcategories ({cat.subcategories?.length || 0})</span>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => {
                          setErrorMsg('');
                          setSubModal({
                            isOpen: true,
                            isEdit: false,
                            id: null,
                            categoryId: cat.id,
                            categoryName: cat.name,
                            name: '',
                            slug: '',
                            description: '',
                            imageUrl: '',
                            displayOrder: (cat.subcategories?.length || 0) + 1,
                            isActive: true,
                          });
                        }}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#7E22CE',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        + Add Subcategory
                      </button>
                    )}
                  </div>

                  {cat.subcategories?.length === 0 ? (
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: '#FAF5FF',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#9CA3AF',
                        textAlign: 'center',
                      }}
                    >
                      No subcategories yet
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {cat.subcategories?.map((sub) => (
                        <div
                          key={sub.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: '#FAF5FF',
                            borderRadius: '8px',
                            border: '1px solid #F3E8FF',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#2E1065' }}>{sub.name}</span>
                            <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '6px' }}>/{sub.slug}</span>
                          </div>

                          {canManage && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                onClick={() => {
                                  setErrorMsg('');
                                  setSubModal({
                                    isOpen: true,
                                    isEdit: true,
                                    id: sub.id,
                                    categoryId: cat.id,
                                    categoryName: cat.name,
                                    name: sub.name,
                                    slug: sub.slug,
                                    description: sub.description || '',
                                    imageUrl: sub.imageUrl || '',
                                    displayOrder: sub.displayOrder || 0,
                                    isActive: sub.isActive,
                                  });
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7E22CE', padding: '2px' }}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(sub)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '2px' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      {categoryModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1E1B4B' }}>
                {categoryModal.isEdit ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setCategoryModal({ ...categoryModal, isOpen: false })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px', backgroundColor: '#FEF2F2', borderRadius: '8px', color: '#DC2626', fontSize: '13px', marginBottom: '14px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryModal.name}
                  onChange={(e) => setCategoryModal({ ...categoryModal, name: e.target.value })}
                  placeholder="e.g. Jewellery, Accessories"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '13px', backgroundColor: '#FAF5FF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={categoryModal.description}
                  onChange={(e) => setCategoryModal({ ...categoryModal, description: e.target.value })}
                  placeholder="Brief summary..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '13px', backgroundColor: '#FAF5FF' }}
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#7E22CE',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {formLoading ? (
                  <BusyButtonLabel busy busyText="Saving...">Saving...</BusyButtonLabel>
                ) : categoryModal.isEdit ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {subModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1E1B4B' }}>
                {subModal.isEdit ? 'Edit Subcategory' : 'Create Subcategory'}
              </h3>
              <button
                onClick={() => setSubModal({ ...subModal, isOpen: false })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px', backgroundColor: '#FEF2F2', borderRadius: '8px', color: '#DC2626', fontSize: '13px', marginBottom: '14px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveSubcategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Parent Category *
                </label>
                <select
                  required
                  value={subModal.categoryId}
                  onChange={(e) => setSubModal({ ...subModal, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '13px', backgroundColor: '#FAF5FF' }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  value={subModal.name}
                  onChange={(e) => setSubModal({ ...subModal, name: e.target.value })}
                  placeholder="e.g. Earrings & Studs"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '13px', backgroundColor: '#FAF5FF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={subModal.description}
                  onChange={(e) => setSubModal({ ...subModal, description: e.target.value })}
                  placeholder="Brief summary..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '13px', backgroundColor: '#FAF5FF' }}
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#7E22CE',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {formLoading ? (
                  <BusyButtonLabel busy busyText="Saving...">Saving...</BusyButtonLabel>
                ) : subModal.isEdit ? 'Update Subcategory' : 'Create Subcategory'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Category Wizard Modal */}
      <CategoryManagerModal
        open={bulkWizardOpen}
        onClose={() => setBulkWizardOpen(false)}
        onCategoriesUpdated={fetchCategories}
      />
    </div>
  );
}
