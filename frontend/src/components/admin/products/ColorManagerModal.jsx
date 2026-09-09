"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Palette,
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

const COLOR_PRESETS = [
  {
    category: 'Jewellery & Luxury Metallics',
    colors: [
      { name: 'Yellow Gold', hexCode: '#FFD700' },
      { name: 'Rose Gold', hexCode: '#B76E79' },
      { name: 'Silver Sterling', hexCode: '#C0C0C0' },
      { name: 'Platinum White', hexCode: '#E5E4E2' },
      { name: 'Antique Bronze', hexCode: '#8C7853' },
      { name: 'Diamond White', hexCode: '#F8F9FA' },
      { name: 'Royal Purple', hexCode: '#7B2CBF' },
      { name: 'Lavender Gem', hexCode: '#E0AAFF' },
      { name: 'Ruby Red', hexCode: '#9B111E' },
      { name: 'Emerald Green', hexCode: '#50C878' },
      { name: 'Sapphire Blue', hexCode: '#0F52BA' },
      { name: 'Onyx Black', hexCode: '#353839' },
      { name: 'Champagne Gold', hexCode: '#F7E7CE' },
    ],
  },
  {
    category: 'Teddy Bears & Plushies Tones',
    colors: [
      { name: 'Teddy Brown', hexCode: '#8B4513' },
      { name: 'Warm Beige', hexCode: '#F5F5DC' },
      { name: 'Blush Pink', hexCode: '#FFB6C1' },
      { name: 'Sky Baby Blue', hexCode: '#89CFF0' },
      { name: 'Dark Chocolate', hexCode: '#3D1C02' },
      { name: 'Cream White', hexCode: '#FFFDD0' },
      { name: 'Pastel Mint', hexCode: '#98FF98' },
      { name: 'Lavender Mist', hexCode: '#E6E6FA' },
      { name: 'Peach Coral', hexCode: '#FFDAB9' },
      { name: 'Charcoal Grey', hexCode: '#4A4A4A' },
    ],
  },
];

export default function ColorManagerModal({ open, onClose, onColorsUpdated }) {
  const [activeTab, setActiveTab] = useState('browse'); // browse | single | bulk
  const [colors, setColors] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyLabel, setBusyLabel] = useState('Please wait...');
  const [error, setError] = useState('');

  // Single form
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#7E22CE');

  // Bulk form
  const [bulkText, setBulkText] = useState('');

  const loadColors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAttributeApi.listColors();
      setColors(res?.colors || []);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadColors();
      setError('');
      setSelectedIds([]);
    }
  }, [open, loadColors]);

  if (!open) return null;

  const handleSelectAll = () => {
    if (selectedIds.length === colors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(colors.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleCreateSingle = async (e) => {
    e.preventDefault();
    if (!name.trim() || !hexCode.trim()) return;
    setBusyLabel('Adding color...');
    setSubmitting(true);
    setError('');

    const newColorName = name.trim();
    const newColorHex = hexCode.trim();

    // Optimistic UI addition
    const tempId = `temp-${Date.now()}`;
    const optimisticColor = { id: tempId, name: newColorName, hexCode: newColorHex };
    setColors((prev) => [...prev, optimisticColor]);
    setName('');
    setHexCode('#7E22CE');
    setActiveTab('browse');

    try {
      await adminAttributeApi.createColor({ name: newColorName, hexCode: newColorHex }, true);
      loadColors();
    } catch (err) {
      setError(err?.message || 'Failed to create color');
      loadColors();
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyPreset = async (presetGroup) => {
    setBusyLabel('Applying colors...');
    setSubmitting(true);
    setError('');
    try {
      await adminAttributeApi.bulkCreateColors({ items: presetGroup.colors }, true);
      await loadColors();
    } catch (err) {
      setError(err?.message || 'Failed to apply color presets');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBusyLabel('Importing colors...');
    setSubmitting(true);
    setError('');

    try {
      const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
      const items = [];
      for (const line of lines) {
        const match = line.match(/^(.+?)[,\s-]+(#[0-9a-fA-F]{3,6})$/);
        if (match) {
          items.push({ name: match[1].trim(), hexCode: match[2].trim() });
        } else {
          items.push({ name: line, hexCode: '#7E22CE' });
        }
      }

      if (items.length === 0) {
        setError('Please enter at least one color line.');
        setSubmitting(false);
        return;
      }

      await adminAttributeApi.bulkCreateColors({ items }, true);
      setBulkText('');
      await loadColors();
      setActiveTab('browse');
    } catch (err) {
      setError(err?.message || 'Failed to import bulk colors');
    } finally {
      setSubmitting(false);
    }
  };

  // Instant optimistic delete single
  const handleDelete = async (colorId) => {
    if (submitting) return;
    setBusyLabel('Deleting...');
    setSubmitting(true);
    setColors((prev) => prev.filter((c) => c.id !== colorId));
    setSelectedIds((prev) => prev.filter((id) => id !== colorId));
    try {
      await adminAttributeApi.deleteColor(colorId, true);
      if (onColorsUpdated) onColorsUpdated();
    } catch {
      loadColors();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0 || submitting) return;
    const idsToDelete = [...selectedIds];
    setBusyLabel('Deleting selected...');
    setSubmitting(true);
    setColors((prev) => prev.filter((c) => !idsToDelete.includes(c.id)));
    setSelectedIds([]);
    try {
      await adminAttributeApi.bulkDeleteColors(idsToDelete, true);
      if (onColorsUpdated) onColorsUpdated();
    } catch {
      loadColors();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (colors.length === 0 || submitting) return;
    if (!window.confirm('Are you sure you want to delete ALL colors?')) return;
    setBusyLabel('Deleting all...');
    setSubmitting(true);
    setColors([]);
    setSelectedIds([]);
    try {
      await adminAttributeApi.deleteAllColors(true);
      if (onColorsUpdated) onColorsUpdated();
    } catch {
      loadColors();
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
              <Palette size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#2E1065' }}>
                Color Manager & Visual Swatches
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                Manage catalog color shades, apply preset palettes, and bulk delete
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}
          >
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
            { id: 'browse', label: `All Colors (${colors.length})` },
            { id: 'single', label: '+ Add Single' },
            { id: 'bulk', label: '⚡ Bulk Paste' },
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
                    {selectedIds.length === colors.length && colors.length > 0 ? (
                      <CheckSquare size={14} />
                    ) : (
                      <Square size={14} />
                    )}
                    <span>{selectedIds.length === colors.length && colors.length > 0 ? 'Deselect All' : 'Select All'}</span>
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

                {colors.length > 0 && (
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
                    <Trash2 size={13} /> Delete All Colors
                  </button>
                )}
              </div>

              {/* Color Grid */}
              {loading && colors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>Loading colors...</div>
              ) : colors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
                  <Palette size={40} style={{ color: '#C084FC', marginBottom: '10px' }} />
                  <p style={{ fontWeight: 600, margin: '0 0 6px' }}>No Colors Found</p>
                  <p style={{ fontSize: '13px', margin: 0 }}>Add colors manually or apply industry presets</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
                  {colors.map((color) => {
                    const isSelected = selectedIds.includes(color.id);
                    return (
                      <div
                        key={color.id}
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
                            onChange={() => handleToggleSelect(color.id)}
                            style={{ accentColor: '#7E22CE', width: '14px', height: '14px', cursor: 'pointer' }}
                          />
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: color.hexCode || '#E5E7EB',
                              border: '1.5px solid #CBD5E1',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E1B4B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {color.name}
                            </div>
                            <div style={{ fontSize: '10px', color: '#6B7280' }}>{color.hexCode}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(color.id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px' }}
                          title="Delete color"
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
                  Color Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rose Gold, Lavender"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Color Visual Swatch & Hex *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="color"
                    value={hexCode}
                    onChange={(e) => setHexCode(e.target.value)}
                    style={{ width: '45px', height: '40px', padding: 0, border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    required
                    value={hexCode}
                    onChange={(e) => setHexCode(e.target.value)}
                    placeholder="#7E22CE"
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none' }}
                  />
                </div>
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
                ) : '+ Add Color'}
              </button>
            </form>
          )}

          {activeTab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                Enter one color per line in format: <code>Color Name, #HEX</code> (e.g. <code>Yellow Gold, #FFD700</code>)
              </p>
              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Yellow Gold, #FFD700\nRose Gold, #B76E79\nSilver Sterling, #C0C0C0\nRuby Red, #9B111E`}
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
                ) : '⚡ Import Colors'}
              </button>
            </form>
          )}

          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {COLOR_PRESETS.map((preset, idx) => (
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
                      + Apply {preset.colors.length} Colors
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {preset.colors.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #E5E7EB',
                          fontSize: '11px',
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c.hexCode, border: '1px solid #ccc' }} />
                        <span>{c.name}</span>
                      </div>
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
