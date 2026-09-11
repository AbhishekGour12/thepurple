"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { adminCategoryApi } from '@/lib/api/admin/categories';
import { adminProductApi } from '@/lib/api/admin/products';
import CategoryManagerModal from '@/components/admin/products/CategoryManagerModal';
import { BusyOverlay, BusyButtonLabel } from '@/components/admin/BusyUI';

export default function CategoryManagementPage() {
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);
  const canManage = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'MANAGER';

  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const catFileInputRef = useRef(null);
  const subFileInputRef = useRef(null);

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
    isFeatured: false,
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

  // Quick toggle featured status
  const handleToggleFeatured = async (cat) => {
    const updatedStatus = !cat.isFeatured;
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isFeatured: updatedStatus } : c))
    );
    try {
      await adminCategoryApi.updateCategory(cat.id, {
        isFeatured: updatedStatus,
      });
    } catch {
      // Revert if error
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isFeatured: !updatedStatus } : c))
      );
    }
  };

  // Image Upload Handlers for R2
  const handleUploadCategoryImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setUploadingImage(true);
    try {
      const res = await adminProductApi.uploadImage(file, 'categories');
      const url = res?.imageUrl || res?.url || (typeof res === 'string' ? res : '');
      if (url) {
        setCategoryModal((prev) => ({ ...prev, imageUrl: url }));
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to upload category image to cloud storage');
    } finally {
      setUploadingImage(false);
      if (catFileInputRef.current) catFileInputRef.current.value = '';
    }
  };

  const handleUploadSubcategoryImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setUploadingImage(true);
    try {
      const res = await adminProductApi.uploadImage(file, 'categories');
      const url = res?.imageUrl || res?.url || (typeof res === 'string' ? res : '');
      if (url) {
        setSubModal((prev) => ({ ...prev, imageUrl: url }));
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to upload subcategory image to cloud storage');
    } finally {
      setUploadingImage(false);
      if (subFileInputRef.current) subFileInputRef.current.value = '';
    }
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
          isFeatured: categoryModal.isFeatured,
        });
      } else {
        await adminCategoryApi.createCategory({
          name: categoryModal.name,
          slug: categoryModal.slug,
          description: categoryModal.description,
          imageUrl: categoryModal.imageUrl,
          displayOrder: categoryModal.displayOrder,
          isActive: categoryModal.isActive,
          isFeatured: categoryModal.isFeatured,
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
                  isFeatured: false,
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {canManage && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(cat.id)}
                        style={{ accentColor: '#7E22CE', width: '16px', height: '16px', marginTop: '12px', cursor: 'pointer' }}
                      />
                    )}
                    
                    {/* Category Image Thumbnail */}
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '1.5px solid #E9D5FF',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          backgroundColor: '#FAF5FF',
                          border: '1.5px solid #E9D5FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#A855F7',
                          flexShrink: 0,
                        }}
                      >
                        <FolderTree size={20} />
                      </div>
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                        {cat.isFeatured && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: 700,
                              backgroundColor: '#FAF5FF',
                              color: '#7E22CE',
                              border: '1px solid #E9D5FF',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Sparkles size={10} color="#7E22CE" />
                            Nav Tab
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7E22CE', fontFamily: 'monospace', marginTop: '2px' }}>
                        /{cat.slug}
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(cat)}
                        title={cat.isFeatured ? 'Remove from Home Navigation Tabs' : 'Feature in Home Navigation Tabs'}
                        style={{
                          padding: '5px 9px',
                          borderRadius: '6px',
                          backgroundColor: cat.isFeatured ? '#FAF5FF' : '#F9FAFB',
                          border: cat.isFeatured ? '1px solid #C084FC' : '1px solid #E5E7EB',
                          color: cat.isFeatured ? '#7E22CE' : '#6B7280',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Sparkles size={12} color={cat.isFeatured ? '#7E22CE' : '#9CA3AF'} />
                        <span>{cat.isFeatured ? 'In Nav' : '+ Nav'}</span>
                      </button>
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
                            isFeatured: Boolean(cat.isFeatured),
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {sub.imageUrl ? (
                              <img
                                src={sub.imageUrl}
                                alt={sub.name}
                                style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                              />
                            ) : null}
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#2E1065' }}>{sub.name}</span>
                              <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '6px' }}>/{sub.slug}</span>
                            </div>
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
              maxWidth: '490px',
              maxHeight: '90vh',
              overflowY: 'auto',
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

              {/* Cloudflare R2 Category Image Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Category Image (Uploaded to R2 Cloud Storage)
                </label>
                <input
                  ref={catFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCategoryImage}
                  style={{ display: 'none' }}
                />

                {categoryModal.imageUrl ? (
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
                      src={categoryModal.imageUrl}
                      alt="Category Preview"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid #D8B4FE',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#581C87' }}>Image Uploaded (R2)</div>
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
                        {categoryModal.imageUrl}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => catFileInputRef.current?.click()}
                        disabled={uploadingImage}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#7E22CE',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {uploadingImage ? 'Uploading...' : 'Replace'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryModal((prev) => ({ ...prev, imageUrl: '' }))}
                        style={{
                          padding: '6px 10px',
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
                    onClick={() => !uploadingImage && catFileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #C084FC',
                      borderRadius: '10px',
                      padding: '18px',
                      textAlign: 'center',
                      backgroundColor: '#FAF5FF',
                      cursor: uploadingImage ? 'wait' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {uploadingImage ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#7E22CE' }}>
                        <Loader2 size={20} className="animate-spin" />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Uploading & optimizing to R2 storage...</span>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} color="#7E22CE" style={{ margin: '0 auto 6px' }} />
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#581C87' }}>
                          Click to upload category image
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                          PNG, JPG, WebP up to 25MB (Auto WebP compression & R2 Cloud CDN)
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={categoryModal.description}
                  onChange={(e) => setCategoryModal({ ...categoryModal, description: e.target.value })}
                  placeholder="Brief summary..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '13px', backgroundColor: '#FAF5FF' }}
                />
              </div>

              {/* Show in Home Navigation Tab Option */}
              <div
                onClick={() => setCategoryModal((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
                style={{
                  padding: '12px 14px',
                  backgroundColor: categoryModal.isFeatured ? '#FAF5FF' : '#F9FAFB',
                  border: categoryModal.isFeatured ? '1.5px solid #C084FC' : '1px solid #E5E7EB',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ paddingRight: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={15} color={categoryModal.isFeatured ? '#7E22CE' : '#9CA3AF'} />
                    <span>Show in Home Navigation Bar</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px', lineHeight: 1.3 }}>
                    Display this category in the top navigation tabs between "Best Sellers" and "Offers".
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={categoryModal.isFeatured}
                  onChange={(e) => setCategoryModal((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                  onClick={(e) => e.stopPropagation()}
                  style={{ accentColor: '#7E22CE', width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
                />
              </div>

              {/* Category Active Visibility Option */}
              <div
                onClick={() => setCategoryModal((prev) => ({ ...prev, isActive: !prev.isActive }))}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Category Active / Published</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>When unchecked, category and subcategories are hidden from store.</div>
                </div>
                <input
                  type="checkbox"
                  checked={categoryModal.isActive}
                  onChange={(e) => setCategoryModal((prev) => ({ ...prev, isActive: e.target.checked }))}
                  onClick={(e) => e.stopPropagation()}
                  style={{ accentColor: '#7E22CE', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                />
              </div>

              <button
                type="submit"
                disabled={formLoading || uploadingImage}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#7E22CE',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: (formLoading || uploadingImage) ? 'not-allowed' : 'pointer',
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
              maxWidth: '490px',
              maxHeight: '90vh',
              overflowY: 'auto',
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

              {/* Cloudflare R2 Subcategory Image Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Subcategory Image (R2 Cloud Storage)
                </label>
                <input
                  ref={subFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadSubcategoryImage}
                  style={{ display: 'none' }}
                />

                {subModal.imageUrl ? (
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
                      src={subModal.imageUrl}
                      alt="Subcategory Preview"
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid #D8B4FE',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#581C87' }}>Image Uploaded (R2)</div>
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
                        {subModal.imageUrl}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => subFileInputRef.current?.click()}
                        disabled={uploadingImage}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#7E22CE',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {uploadingImage ? 'Uploading...' : 'Replace'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubModal((prev) => ({ ...prev, imageUrl: '' }))}
                        style={{
                          padding: '6px 10px',
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
                    onClick={() => !uploadingImage && subFileInputRef.current?.click()}
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
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Uploading to R2...</span>
                      </div>
                    ) : (
                      <div>
                        <Upload size={20} color="#7E22CE" style={{ margin: '0 auto 4px' }} />
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#581C87' }}>
                          Upload subcategory image
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={subModal.description}
                  onChange={(e) => setSubModal({ ...subModal, description: e.target.value })}
                  placeholder="Brief summary..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '13px', backgroundColor: '#FAF5FF' }}
                />
              </div>

              <button
                type="submit"
                disabled={formLoading || uploadingImage}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#7E22CE',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: (formLoading || uploadingImage) ? 'not-allowed' : 'pointer',
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
