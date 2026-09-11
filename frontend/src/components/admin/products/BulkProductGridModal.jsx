"use client";

import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Copy,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Package,
} from 'lucide-react';
import { adminProductApi } from '@/lib/api/admin/products';
import { adminCategoryApi } from '@/lib/api/admin/categories';
import { adminAttributeApi } from '@/lib/api/admin/attributes';

const emptyRow = (defaultCatId = '') => ({
  id: Math.random().toString(36).substr(2, 9),
  title: '',
  sku: '',
  categoryId: defaultCatId,
  subcategoryId: '',
  regularPrice: '',
  sellingPrice: '',
  stockQuantity: '10',
  description: '',
  selectedColors: [],
  selectedSizes: [],
  status: 'PUBLISHED',
});

export default function BulkProductGridModal({ open, onClose, onProductsCreated }) {
  const [rows, setRows] = useState([emptyRow(), emptyRow()]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Global Defaults bar
  const [defaultCategory, setDefaultCategory] = useState('');
  const [defaultStock, setDefaultStock] = useState('15');

  useEffect(() => {
    if (!open) return;
    const fetchMetadata = async () => {
      setLoadingInitial(true);
      try {
        const [catsRes, subsRes, colorsRes, sizesRes] = await Promise.all([
          adminCategoryApi.listCategories(),
          adminCategoryApi.listSubcategories(),
          adminAttributeApi.listColors(),
          adminAttributeApi.listSizes(),
        ]);
        setCategories(catsRes?.categories || []);
        setSubcategories(subsRes?.subcategories || []);
        setColors(colorsRes?.colors || []);
        setSizes(sizesRes?.sizes || []);
      } catch (err) {
        setError(err?.message || 'Failed to fetch catalog metadata');
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchMetadata();
  }, [open]);

  if (!open) return null;

  const updateRow = (index, key, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      if (key === 'title' && !next[index].sku) {
        next[index].sku = 'PURPLE-' + value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) + '-' + Math.floor(100 + Math.random() * 900);
      }
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow(defaultCategory)]);
  };

  const duplicateRow = (index) => {
    const target = rows[index];
    const clone = {
      ...target,
      id: Math.random().toString(36).substr(2, 9),
      title: target.title ? `${target.title} (Copy)` : '',
      sku: target.sku ? `${target.sku}-CPY` : '',
    };
    setRows((prev) => [...prev.slice(0, index + 1), clone, ...prev.slice(index + 1)]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const applyDefaultsToAll = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        categoryId: defaultCategory || r.categoryId,
        stockQuantity: defaultStock || r.stockQuantity,
      }))
    );
  };

  const handleToggleColor = (rowIndex, colorId) => {
    setRows((prev) => {
      const next = [...prev];
      const cur = next[rowIndex].selectedColors || [];
      if (cur.includes(colorId)) {
        next[rowIndex].selectedColors = cur.filter((id) => id !== colorId);
      } else {
        next[rowIndex].selectedColors = [...cur, colorId];
      }
      return next;
    });
  };

  const handleToggleSize = (rowIndex, sizeId) => {
    setRows((prev) => {
      const next = [...prev];
      const cur = next[rowIndex].selectedSizes || [];
      if (cur.includes(sizeId)) {
        next[rowIndex].selectedSizes = cur.filter((id) => id !== sizeId);
      } else {
        next[rowIndex].selectedSizes = [...cur, sizeId];
      }
      return next;
    });
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.title.trim()) {
        setError(`Row #${i + 1} is missing a Product Title.`);
        return;
      }
      if (!r.categoryId) {
        setError(`Row #${i + 1} ("${r.title}") is missing a Category.`);
        return;
      }
      if (!r.regularPrice || Number(r.regularPrice) <= 0) {
        setError(`Row #${i + 1} ("${r.title}") has an invalid Regular MRP price.`);
        return;
      }
      if (!r.sellingPrice || Number(r.sellingPrice) <= 0) {
        setError(`Row #${i + 1} ("${r.title}") has an invalid Selling price.`);
        return;
      }
    }

    setSubmitting(true);
    let createdCount = 0;

    try {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const payload = {
          name: r.title.trim(),
          sku: r.sku.trim() || `PUR-${Date.now()}-${i}`,
          categoryId: r.categoryId,
          subcategoryId: r.subcategoryId || undefined,
          price: Number(r.regularPrice),
          salePrice: Number(r.sellingPrice),
          stock: Number(r.stockQuantity) || 0,
          description: r.description.trim() || undefined,
          status: r.status || 'PUBLISHED',
          colorIds: r.selectedColors,
          sizeIds: r.selectedSizes,
        };

        await adminProductApi.createProduct(payload);
        createdCount++;
        setProgress(Math.round((createdCount / rows.length) * 100));
      }

      setSuccess(`Successfully added ${createdCount} products in bulk!`);
      if (onProductsCreated) onProductsCreated();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(`Created ${createdCount}/${rows.length} products. Error: ${err?.message || 'Failed to complete bulk entry'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container full-width">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <Zap size={20} color="#D97706" />
              <span>⚡ Quick Multi-Product Grid Entry</span>
              <span className="badge badge-purple">{rows.length} Rows</span>
            </h2>
            <p className="modal-subtitle">
              Rapid spreadsheet-style entry: enter titles, prices, categories, and colors/sizes across multiple products simultaneously.
            </p>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Global Batch Controls Toolbar */}
        <div style={{ padding: '12px 24px', background: '#FAF5FF', borderBottom: '1px solid #E9D5FF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase' }}>
              <Sparkles size={13} color="#D97706" style={{ display: 'inline', marginRight: '4px' }} />
              Batch Defaults:
            </span>

            <select
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value)}
              className="admin-select"
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              <option value="">-- Apply Default Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151' }}>
              <span>Default Stock:</span>
              <input
                type="number"
                value={defaultStock}
                onChange={(e) => setDefaultStock(e.target.value)}
                style={{ width: '60px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #E5E7EB', textAlign: 'center', fontSize: '12px' }}
              />
            </div>

            <button
              type="button"
              onClick={applyDefaultsToAll}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              Apply To All Rows
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={addRow}
              className="admin-btn admin-btn-primary admin-btn-sm"
            >
              <Plus size={13} />
              <span>Add Row</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ margin: '14px 24px 0 24px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{ margin: '14px 24px 0 24px', padding: '10px 14px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', color: '#059669', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Progress Bar */}
        {submitting && (
          <div style={{ margin: '14px 24px 0 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
              <span>Processing bulk product batch...</span>
              <span>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#E9D5FF', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#7E22CE', transition: 'width 0.2s' }} />
            </div>
          </div>
        )}

        {/* Table Body */}
        <div className="modal-body" style={{ padding: '16px 24px' }}>
          <div style={{ overflowX: 'auto', border: '1px solid #E9D5FF', borderRadius: '12px' }}>
            <table className="bulk-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '35px' }}>#</th>
                  <th style={{ minWidth: '180px' }}>Product Title *</th>
                  <th style={{ minWidth: '130px' }}>SKU</th>
                  <th style={{ minWidth: '150px' }}>Category *</th>
                  <th style={{ minWidth: '150px' }}>Subcategory</th>
                  <th style={{ minWidth: '100px' }}>MRP (₹) *</th>
                  <th style={{ minWidth: '100px' }}>Sale Price (₹) *</th>
                  <th style={{ minWidth: '80px' }}>Stock</th>
                  <th style={{ minWidth: '180px' }}>Colors</th>
                  <th style={{ minWidth: '180px' }}>Sizes (cm, inch, rings)</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const availableSubs = subcategories.filter((s) => s.categoryId === row.categoryId);

                  return (
                    <tr key={row.id}>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#6B7280' }}>{idx + 1}</td>

                      {/* Title */}
                      <td>
                        <input
                          type="text"
                          required
                          value={row.title}
                          onChange={(e) => updateRow(idx, 'title', e.target.value)}
                          placeholder="e.g. Teddy Plush 50cm"
                          className="bulk-input"
                        />
                      </td>

                      {/* SKU */}
                      <td>
                        <input
                          type="text"
                          value={row.sku}
                          onChange={(e) => updateRow(idx, 'sku', e.target.value)}
                          placeholder="Auto-generated"
                          className="bulk-input"
                          style={{ fontFamily: 'monospace' }}
                        />
                      </td>

                      {/* Category */}
                      <td>
                        <select
                          value={row.categoryId}
                          onChange={(e) => updateRow(idx, 'categoryId', e.target.value)}
                          className="bulk-input"
                        >
                          <option value="">-- Select Category --</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Subcategory */}
                      <td>
                        <select
                          value={row.subcategoryId}
                          onChange={(e) => updateRow(idx, 'subcategoryId', e.target.value)}
                          disabled={!row.categoryId}
                          className="bulk-input"
                        >
                          <option value="">-- Subcategory --</option>
                          {availableSubs.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* MRP */}
                      <td>
                        <input
                          type="number"
                          required
                          min="0"
                          value={row.regularPrice}
                          onChange={(e) => updateRow(idx, 'regularPrice', e.target.value)}
                          placeholder="MRP"
                          className="bulk-input"
                        />
                      </td>

                      {/* Sale Price */}
                      <td>
                        <input
                          type="number"
                          required
                          min="0"
                          value={row.sellingPrice}
                          onChange={(e) => updateRow(idx, 'sellingPrice', e.target.value)}
                          placeholder="Sale Price"
                          className="bulk-input"
                        />
                      </td>

                      {/* Stock */}
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={row.stockQuantity}
                          onChange={(e) => updateRow(idx, 'stockQuantity', e.target.value)}
                          className="bulk-input"
                        />
                      </td>

                      {/* Colors */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxHeight: '55px', overflowY: 'auto' }}>
                          {colors.map((c) => {
                            const isSelected = (row.selectedColors || []).includes(c.id);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => handleToggleColor(idx, c.id)}
                                title={c.name}
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  border: isSelected ? '1px solid #7E22CE' : '1px solid #E5E7EB',
                                  background: isSelected ? '#7E22CE' : '#FAF5FF',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <span
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: c.hexCode || '#CBD5E1',
                                    border: isSelected ? '1px solid #fff' : '1px solid #9CA3AF',
                                  }}
                                />
                                <span>{c.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Sizes */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxHeight: '55px', overflowY: 'auto' }}>
                          {sizes.map((s) => {
                            const isSelected = (row.selectedSizes || []).includes(s.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleToggleSize(idx, s.id)}
                                title={s.name}
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  border: isSelected ? '1px solid #D97706' : '1px solid #E5E7EB',
                                  background: isSelected ? '#D97706' : '#FAF5FF',
                                  color: isSelected ? '#ffffff' : '#374151',
                                }}
                              >
                                {s.name}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => duplicateRow(idx)}
                            className="action-icon-btn"
                            title="Duplicate Row"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            disabled={rows.length <= 1}
                            className="action-icon-btn danger"
                            title="Delete Row"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="admin-btn admin-btn-outline"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmitAll}
            className="admin-btn admin-btn-primary"
          >
            <Zap size={15} color="#FDE68A" />
            <span>{submitting ? 'Creating Products...' : `Save & Publish ${rows.length} Products`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
