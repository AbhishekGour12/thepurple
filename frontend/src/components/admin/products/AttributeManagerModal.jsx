"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Sliders,
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

const ATTRIBUTE_PRESETS = [
  {
    name: 'Material',
    values: [
      '925 Sterling Silver',
      '18K Yellow Gold Plated',
      'Rose Gold Plated',
      '14K Solid Gold',
      'High-Grade Stainless Steel',
      'Hypoallergenic Brass',
      'Premium Velvet Plush',
      '100% Organic Cotton',
      'PP Cotton Microfiber',
    ],
  },
  {
    name: 'Gemstone & Inlay',
    values: [
      'AAA+ Cubic Zirconia',
      'Natural Freshwater Pearl',
      'Lab-Grown Diamond',
      'Swarovski Crystal',
      'Synthetic Ruby',
      'Synthetic Emerald',
      'No Gemstone (Plain Metal)',
    ],
  },
  {
    name: 'Packaging & Presentation',
    values: [
      'Signature Purple Velvet Box',
      'LED Illuminated Jewellery Box',
      'Luxury Satin Pouch',
      'Gift Hamper Basket with Ribbon',
    ],
  },
  {
    name: 'Occasion & Celebration',
    values: [
      'Birthday Special',
      'Anniversary Romantic',
      "Valentine's Day",
      'Wedding & Bridal',
      'Festive Diwali / Christmas',
      'Just Because / Thinking of You',
    ],
  },
];

export default function AttributeManagerModal({ open, onClose, onAttributesUpdated }) {
  const [activeTab, setActiveTab] = useState('browse'); // browse | single | preset
  const [attributes, setAttributes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyLabel, setBusyLabel] = useState('Please wait...');
  const [error, setError] = useState('');

  // Single attribute form
  const [attrName, setAttrName] = useState('');
  const [attrValuesText, setAttrValuesText] = useState('');

  // Add value to existing attribute
  const [selectedAttrId, setSelectedAttrId] = useState('');
  const [newValueInput, setNewValueInput] = useState('');

  const loadAttributes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAttributeApi.listAttributes();
      setAttributes(res?.attributes || []);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadAttributes();
      setError('');
      setSelectedIds([]);
    }
  }, [open, loadAttributes]);

  if (!open) return null;

  const handleSelectAll = () => {
    if (selectedIds.length === attributes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(attributes.map((a) => a.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleCreateAttribute = async (e) => {
    e.preventDefault();
    if (!attrName.trim()) return;
    setBusyLabel('Creating attribute...');
    setSubmitting(true);
    setError('');

    try {
      const values = attrValuesText
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean);

      await adminAttributeApi.createAttribute({
        name: attrName.trim(),
        values,
      });

      setAttrName('');
      setAttrValuesText('');
      await loadAttributes();
      setActiveTab('browse');
    } catch (err) {
      setError(err?.message || 'Failed to create attribute');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyPreset = async (preset) => {
    setBusyLabel(`Applying ${preset.name}...`);
    setSubmitting(true);
    setError('');
    try {
      await adminAttributeApi.createAttribute({
        name: preset.name,
        values: preset.values,
      });
      await loadAttributes();
    } catch (err) {
      setError(err?.message || 'Failed to apply preset');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddValueToAttr = async (attrId) => {
    if (!newValueInput.trim()) return;
    setBusyLabel('Adding value...');
    setSubmitting(true);
    setError('');

    const val = newValueInput.trim();
    // Optimistic UI update
    setAttributes((prev) =>
      prev.map((a) =>
        a.id === attrId
          ? {
              ...a,
              values: [...(a.values || []), { id: `temp-${Date.now()}`, value: val }],
            }
          : a
      )
    );
    setNewValueInput('');

    try {
      await adminAttributeApi.addAttributeValue(attrId, { value: val });
      loadAttributes();
    } catch (err) {
      setError(err?.message || 'Failed to add value');
      loadAttributes();
    } finally {
      setSubmitting(false);
    }
  };

  // Instant optimistic delete single attribute
  const handleDeleteAttribute = async (attrId) => {
    if (submitting) return;
    setBusyLabel('Deleting...');
    setSubmitting(true);
    setAttributes((prev) => prev.filter((a) => a.id !== attrId));
    setSelectedIds((prev) => prev.filter((id) => id !== attrId));
    try {
      await adminAttributeApi.deleteAttribute(attrId, true);
      if (onAttributesUpdated) onAttributesUpdated();
    } catch {
      loadAttributes();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteValue = async (attrId, valId) => {
    if (submitting) return;
    setBusyLabel('Deleting...');
    setSubmitting(true);
    setAttributes((prev) =>
      prev.map((a) =>
        a.id === attrId
          ? { ...a, values: a.values ? a.values.filter((v) => v.id !== valId) : [] }
          : a
      )
    );
    try {
      await adminAttributeApi.deleteAttributeValue(attrId, valId, true);
      if (onAttributesUpdated) onAttributesUpdated();
    } catch {
      loadAttributes();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0 || submitting) return;
    const idsToDelete = [...selectedIds];
    setBusyLabel('Deleting selected...');
    setSubmitting(true);
    setAttributes((prev) => prev.filter((a) => !idsToDelete.includes(a.id)));
    setSelectedIds([]);
    try {
      await adminAttributeApi.bulkDeleteAttributes(idsToDelete, true);
      if (onAttributesUpdated) onAttributesUpdated();
    } catch {
      loadAttributes();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (attributes.length === 0 || submitting) return;
    if (!window.confirm('Are you sure you want to delete ALL custom attributes?')) return;
    setBusyLabel('Deleting all...');
    setSubmitting(true);
    setAttributes([]);
    setSelectedIds([]);
    try {
      await adminAttributeApi.deleteAllAttributes(true);
      if (onAttributesUpdated) onAttributesUpdated();
    } catch {
      loadAttributes();
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
          maxWidth: '800px',
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
              <Sliders size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#2E1065' }}>
                Specification & Attribute Manager
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                Configure custom attributes (Material, Gemstone, Occasion) and bulk delete
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
            { id: 'browse', label: `All Attributes (${attributes.length})` },
            { id: 'single', label: '+ Add Attribute' },
            { id: 'presets', label: '✨ Common Presets' },
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
                    {selectedIds.length === attributes.length && attributes.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                    <span>{selectedIds.length === attributes.length && attributes.length > 0 ? 'Deselect All' : 'Select All'}</span>
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

                {attributes.length > 0 && (
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
                    <Trash2 size={13} /> Delete All Attributes
                  </button>
                )}
              </div>

              {/* Attributes List */}
              {loading && attributes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>Loading attributes...</div>
              ) : attributes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
                  <Sliders size={40} style={{ color: '#C084FC', marginBottom: '10px' }} />
                  <p style={{ fontWeight: 600, margin: '0 0 6px' }}>No Attributes Configured</p>
                  <p style={{ fontSize: '13px', margin: 0 }}>Add attributes or apply pre-built presets</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {attributes.map((attr) => {
                    const isSelected = selectedIds.includes(attr.id);
                    return (
                      <div
                        key={attr.id}
                        style={{
                          borderRadius: '12px',
                          border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E9D5FF',
                          backgroundColor: '#ffffff',
                          overflow: 'hidden',
                          boxShadow: '0 2px 4px rgba(126, 34, 206, 0.04)',
                        }}
                      >
                        <div
                          style={{
                            padding: '12px 16px',
                            backgroundColor: '#FAF5FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #F3E8FF',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(attr.id)}
                              style={{ accentColor: '#7E22CE', width: '15px', height: '15px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#2E1065' }}>{attr.name}</span>
                            <span style={{ fontSize: '11px', color: '#7E22CE', backgroundColor: '#F3E8FF', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                              {attr.values?.length || 0} values
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteAttribute(attr.id)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px' }}
                            title="Delete attribute"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Values list & quick add */}
                        <div style={{ padding: '12px 16px', backgroundColor: '#ffffff' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                            {attr.values?.map((val) => (
                              <div
                                key={val.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  backgroundColor: '#FAF5FF',
                                  border: '1px solid #E9D5FF',
                                  fontSize: '12px',
                                  color: '#374151',
                                }}
                              >
                                <span>{val.value}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteValue(attr.id, val.id)}
                                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0 2px' }}
                                  title="Delete value"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder={`+ Add option value to ${attr.name}...`}
                              value={selectedAttrId === attr.id ? newValueInput : ''}
                              onChange={(e) => {
                                setSelectedAttrId(attr.id);
                                setNewValueInput(e.target.value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddValueToAttr(attr.id);
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                fontSize: '12px',
                                outline: 'none',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddValueToAttr(attr.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#7E22CE',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'single' && (
            <form onSubmit={handleCreateAttribute} style={{ maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Attribute Name *
                </label>
                <input
                  type="text"
                  required
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  placeholder="e.g. Gemstone, Material, Plating"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Predefined Values (One per line)
                </label>
                <textarea
                  rows={5}
                  value={attrValuesText}
                  onChange={(e) => setAttrValuesText(e.target.value)}
                  placeholder={`AAA+ Cubic Zirconia\nNatural Pearl\nLab-Grown Diamond`}
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
                  <BusyButtonLabel busy busyText="Creating...">Creating...</BusyButtonLabel>
                ) : '+ Create Attribute'}
              </button>
            </form>
          )}

          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ATTRIBUTE_PRESETS.map((preset, idx) => (
                <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E9D5FF', backgroundColor: '#FAF5FF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#2E1065' }}>{preset.name}</div>
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
                      + Apply {preset.values.length} Options
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {preset.values.map((v, i) => (
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
                        {v}
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
