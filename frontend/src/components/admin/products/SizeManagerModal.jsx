"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Ruler,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  CheckSquare,
  Square,
} from 'lucide-react';
import { adminAttributeApi } from '@/lib/api/admin/attributes';
import { BusyOverlay, BusyButtonLabel } from '@/components/admin/BusyUI';

const SIZE_PRESETS = [
  {
    category: 'Teddy Bear Heights (cm / m)',
    unit: 'cm',
    sizes: [
      { name: '15 cm (Mini Pocket)', code: '15CM' },
      { name: '20 cm (Small)', code: '20CM' },
      { name: '30 cm (Standard)', code: '30CM' },
      { name: '40 cm (Medium)', code: '40CM' },
      { name: '50 cm (Hug Size)', code: '50CM' },
      { name: '60 cm (Large)', code: '60CM' },
      { name: '80 cm (X-Large)', code: '80CM' },
      { name: '100 cm / 1 Metre (Giant)', code: '100CM' },
      { name: '120 cm (Jumbo)', code: '120CM' },
      { name: '150 cm / 1.5 Metre (Life Size)', code: '150CM' },
      { name: '180 cm (Huge)', code: '180CM' },
      { name: '200 cm / 2 Metre (Colossal)', code: '200CM' },
    ],
  },
  {
    category: 'Jewellery Necklace & Chain Lengths (inch)',
    unit: 'inch',
    sizes: [
      { name: '14" (Choker)', code: '14IN' },
      { name: '16" (Collar / Standard Short)', code: '16IN' },
      { name: '18" (Princess / Most Popular)', code: '18IN' },
      { name: '20" (Matinee Length)', code: '20IN' },
      { name: '22" (Layered)', code: '22IN' },
      { name: '24" (Opera Length)', code: '24IN' },
      { name: '30" (Long Chain)', code: '30IN' },
      { name: '36" (Rope Length)', code: '36IN' },
    ],
  },
  {
    category: 'Jewellery Ring Sizes (Standard 6-24)',
    unit: 'ring',
    sizes: [
      { name: 'Size 6 (14.5 mm)', code: 'R-6' },
      { name: 'Size 7 (14.9 mm)', code: 'R-7' },
      { name: 'Size 8 (15.3 mm)', code: 'R-8' },
      { name: 'Size 9 (15.7 mm)', code: 'R-9' },
      { name: 'Size 10 (16.1 mm)', code: 'R-10' },
      { name: 'Size 11 (16.5 mm)', code: 'R-11' },
      { name: 'Size 12 (16.9 mm)', code: 'R-12' },
      { name: 'Size 13 (17.3 mm)', code: 'R-13' },
      { name: 'Size 14 (17.7 mm)', code: 'R-14' },
      { name: 'Size 15 (18.1 mm)', code: 'R-15' },
      { name: 'Size 16 (18.5 mm)', code: 'R-16' },
      { name: 'Size 17 (19.0 mm)', code: 'R-17' },
      { name: 'Size 18 (19.4 mm)', code: 'R-18' },
      { name: 'Size 19 (19.8 mm)', code: 'R-19' },
      { name: 'Size 20 (20.2 mm)', code: 'R-20' },
      { name: 'Size 21 (20.6 mm)', code: 'R-21' },
      { name: 'Size 22 (21.0 mm)', code: 'R-22' },
      { name: 'Size 23 (21.4 mm)', code: 'R-23' },
      { name: 'Size 24 (21.8 mm)', code: 'R-24' },
    ],
  },
  {
    category: 'Standard Apparel & General Sizes',
    unit: 'apparel',
    sizes: [
      { name: 'XS', code: 'XS' },
      { name: 'S', code: 'S' },
      { name: 'M', code: 'M' },
      { name: 'L', code: 'L' },
      { name: 'XL', code: 'XL' },
      { name: 'XXL', code: 'XXL' },
      { name: 'Free Size / One Size', code: 'FS' },
    ],
  },
];

export default function SizeManagerModal({ open, onClose, onSizesUpdated }) {
  const [activeTab, setActiveTab] = useState('browse'); // browse | single | bulk
  const [sizes, setSizes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyLabel, setBusyLabel] = useState('Please wait...');
  const [error, setError] = useState('');

  // Single form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  // Bulk form
  const [bulkText, setBulkText] = useState('');

  const loadSizes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAttributeApi.listSizes();
      setSizes(res?.sizes || []);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadSizes();
      setError('');
      setSelectedIds([]);
    }
  }, [open, loadSizes]);

  if (!open) return null;

  const handleSelectAll = () => {
    if (selectedIds.length === sizes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sizes.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleCreateSingle = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusyLabel('Adding size...');
    setSubmitting(true);
    setError('');

    const sizeName = name.trim();
    const sizeCode = code.trim() || undefined;

    // Optimistic addition
    const tempId = `temp-${Date.now()}`;
    setSizes((prev) => [...prev, { id: tempId, name: sizeName, code: sizeCode }]);
    setName('');
    setCode('');
    setActiveTab('browse');

    try {
      await adminAttributeApi.createSize({ name: sizeName, code: sizeCode }, true);
      loadSizes();
    } catch (err) {
      setError(err?.message || 'Failed to create size');
      loadSizes();
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyPreset = async (presetGroup) => {
    setBusyLabel('Applying sizes...');
    setSubmitting(true);
    setError('');
    try {
      await adminAttributeApi.bulkCreateSizes({ items: presetGroup.sizes }, true);
      await loadSizes();
    } catch (err) {
      setError(err?.message || 'Failed to apply size presets');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBusyLabel('Importing sizes...');
    setSubmitting(true);
    setError('');

    try {
      const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
      const items = [];
      for (const line of lines) {
        const parts = line.split(',').map((p) => p.trim());
        items.push({ name: parts[0], code: parts[1] || undefined });
      }

      if (items.length === 0) {
        setError('Please enter at least one size.');
        setSubmitting(false);
        return;
      }

      await adminAttributeApi.bulkCreateSizes({ items }, true);
      setBulkText('');
      await loadSizes();
      setActiveTab('browse');
    } catch (err) {
      setError(err?.message || 'Failed to import bulk sizes');
    } finally {
      setSubmitting(false);
    }
  };

  // Instant optimistic delete single
  const handleDelete = async (sizeId) => {
    if (submitting) return;
    setBusyLabel('Deleting...');
    setSubmitting(true);
    setSizes((prev) => prev.filter((s) => s.id !== sizeId));
    setSelectedIds((prev) => prev.filter((id) => id !== sizeId));
    try {
      await adminAttributeApi.deleteSize(sizeId, true);
      if (onSizesUpdated) onSizesUpdated();
    } catch {
      loadSizes();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0 || submitting) return;
    const idsToDelete = [...selectedIds];
    setBusyLabel('Deleting selected...');
    setSubmitting(true);
    setSizes((prev) => prev.filter((s) => !idsToDelete.includes(s.id)));
    setSelectedIds([]);
    try {
      await adminAttributeApi.bulkDeleteSizes(idsToDelete, true);
      if (onSizesUpdated) onSizesUpdated();
    } catch {
      loadSizes();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (sizes.length === 0 || submitting) return;
    if (!window.confirm('Are you sure you want to delete ALL sizes?')) return;
    setBusyLabel('Deleting all...');
    setSubmitting(true);
    setSizes([]);
    setSelectedIds([]);
    try {
      await adminAttributeApi.deleteAllSizes(true);
      if (onSizesUpdated) onSizesUpdated();
    } catch {
      loadSizes();
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
          maxWidth: '750px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(126, 34, 206, 0.2)',
          border: '1px solid #E9D5FF',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
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
              <Ruler size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#2E1065' }}>
                Size & Dimension Manager
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                Manage heights, ring sizes, chain lengths, apparel dimensions & bulk delete
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
            { id: 'browse', label: `All Sizes (${sizes.length})` },
            { id: 'single', label: '+ Add Single' },
            { id: 'bulk', label: '⚡ Bulk Paste' },
            { id: 'presets', label: '✨ Category Presets' },
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
              {/* Action Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                    {selectedIds.length === sizes.length && sizes.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                    <span>{selectedIds.length === sizes.length && sizes.length > 0 ? 'Deselect All' : 'Select All'}</span>
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

                {sizes.length > 0 && (
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
                    <Trash2 size={13} /> Delete All Sizes
                  </button>
                )}
              </div>

              {/* Sizes Grid */}
              {loading && sizes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>Loading sizes...</div>
              ) : sizes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
                  <Ruler size={40} style={{ color: '#C084FC', marginBottom: '10px' }} />
                  <p style={{ fontWeight: 600, margin: '0 0 6px' }}>No Sizes Found</p>
                  <p style={{ fontSize: '13px', margin: 0 }}>Add sizes manually or apply category presets</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
                  {sizes.map((size) => {
                    const isSelected = selectedIds.includes(size.id);
                    return (
                      <div
                        key={size.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E9D5FF',
                          backgroundColor: isSelected ? '#FAF5FF' : '#ffffff',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(size.id)}
                            style={{ accentColor: '#7E22CE', width: '14px', height: '14px', cursor: 'pointer' }}
                          />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E1B4B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {size.name}
                            </div>
                            {size.code && <div style={{ fontSize: '10px', color: '#6B7280' }}>Code: {size.code}</div>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(size.id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px' }}
                          title="Delete size"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'single' && (
            <form onSubmit={handleCreateSingle} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Size Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 50 cm (Hug Size) or Size 7"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Short Code (Optional)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 50CM, R-7, M"
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
                  <BusyButtonLabel busy busyText="Adding...">Adding...</BusyButtonLabel>
                ) : '+ Add Size'}
              </button>
            </form>
          )}

          {activeTab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                Enter one size per line in format: <code>Size Name, Code</code> (e.g. <code>50 cm, 50CM</code>)
              </p>
              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`30 cm (Standard), 30CM\n50 cm (Hug Size), 50CM\n100 cm (Giant), 100CM`}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none', fontFamily: 'monospace' }}
              />
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
                ) : '⚡ Import Sizes'}
              </button>
            </form>
          )}

          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {SIZE_PRESETS.map((preset, idx) => (
                <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E9D5FF', backgroundColor: '#FAF5FF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#2E1065' }}>{preset.category}</div>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      disabled={submitting}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#7E22CE',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      + Apply {preset.sizes.length} Sizes
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {preset.sizes.map((s, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #E5E7EB',
                          fontSize: '11px',
                          color: '#374151',
                        }}
                      >
                        {s.name}
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
