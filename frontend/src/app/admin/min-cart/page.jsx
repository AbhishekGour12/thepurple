"use client";

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ShoppingCart,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw,
  Save,
  Sliders,
  ShieldCheck,
  Eye,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { settingsApi } from '@/lib/api/admin/settings';

const DEFAULT_PRESETS = [500, 1000, 1500, 2000, 2500];

export default function AdminMinCartPage() {
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);
  const canManage = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'MANAGER';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [enabled, setEnabled] = useState(true);
  const [minCartValue, setMinCartValue] = useState('500');
  const [presets, setPresets] = useState(DEFAULT_PRESETS);
  const [message, setMessage] = useState('Minimum order amount is ₹{minCartValue}. Please add more items to proceed.');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Preset Addition Modal/Inline state
  const [newPresetInput, setNewPresetInput] = useState('');
  const [isAddingPreset, setIsAddingPreset] = useState(false);

  // Preview simulator state
  const [simulatedSubtotal, setSimulatedSubtotal] = useState('350');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Current Settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.getMinCart();
      if (res && res.data) {
        const d = res.data;
        setEnabled(d.enabled !== undefined ? Boolean(d.enabled) : true);
        setMinCartValue(d.minCartValue !== undefined ? String(d.minCartValue) : '500');
        setPresets(Array.isArray(d.presets) && d.presets.length > 0 ? d.presets : DEFAULT_PRESETS);
        if (d.message) setMessage(d.message);
        if (d.updatedAt) setLastUpdated(new Date(d.updatedAt));
      }
    } catch (err) {
      showToast(err.message || 'Failed to load min cart settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle Save / Update
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!canManage) {
      showToast('You do not have permission to modify settings', 'error');
      return;
    }

    const numericVal = parseFloat(minCartValue);
    if (enabled && (isNaN(numericVal) || numericVal < 0)) {
      showToast('Please enter a valid minimum cart value (0 or greater)', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        enabled,
        minCartValue: isNaN(numericVal) ? 0 : numericVal,
        presets,
        message: message.trim(),
      };
      const res = await settingsApi.updateMinCart(payload);
      if (res && res.data) {
        showToast('Minimum Cart Value settings saved successfully! Global cart rules updated.');
        setLastUpdated(new Date());
      }
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reset / Disable
  const handleResetOrDisable = async () => {
    if (!window.confirm('Are you sure you want to disable the Minimum Cart Value requirement? Customers will be able to checkout with any cart total.')) {
      return;
    }

    try {
      setSubmitting(true);
      await settingsApi.deleteMinCart();
      setEnabled(false);
      setMinCartValue('0');
      showToast('Minimum Cart Value requirement disabled. No cart minimum will be enforced.', 'info');
      setLastUpdated(new Date());
    } catch (err) {
      showToast(err.message || 'Failed to disable min cart rule', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Add a new preset
  const handleAddPreset = () => {
    const val = parseFloat(newPresetInput);
    if (isNaN(val) || val <= 0) {
      showToast('Please enter a valid positive number for preset amount', 'error');
      return;
    }
    if (presets.includes(val)) {
      showToast(`Preset ₹${val} already exists`, 'error');
      return;
    }
    const updated = [...presets, val].sort((a, b) => a - b);
    setPresets(updated);
    setNewPresetInput('');
    setIsAddingPreset(false);
    showToast(`Preset ₹${val.toLocaleString('en-IN')} added. Don't forget to click Save!`, 'info');
  };

  // Delete a preset
  const handleDeletePreset = (valToDelete) => {
    const updated = presets.filter((p) => p !== valToDelete);
    setPresets(updated);
    showToast(`Preset ₹${valToDelete.toLocaleString('en-IN')} removed`, 'info');
  };

  // Restore Default Presets
  const handleRestoreDefaults = () => {
    setPresets([...DEFAULT_PRESETS]);
    showToast('Default presets [₹500, ₹1000, ₹1500, ₹2000, ₹2500] restored', 'info');
  };

  const parsedMin = enabled ? Math.max(0, parseFloat(minCartValue) || 0) : 0;
  const simSubtotal = Math.max(0, parseFloat(simulatedSubtotal) || 0);
  const simSatisfied = parsedMin <= 0 || simSubtotal >= parsedMin;
  const simDeficit = !simSatisfied ? parsedMin - simSubtotal : 0;
  const simProgress = parsedMin > 0 ? Math.min(100, Math.round((simSubtotal / parsedMin) * 100)) : 100;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px 80px 20px' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '14px 20px',
            borderRadius: '12px',
            backgroundColor: toast.type === 'error' ? '#DC2626' : toast.type === 'info' ? '#2563EB' : '#166534',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }}
        >
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7E22CE 0%, #9333EA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(126, 34, 206, 0.3)',
              }}
            >
              <ShoppingCart size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B', margin: 0, letterSpacing: '-0.02em' }}>
                Minimum Cart Value Settings
              </h1>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6B7280' }}>
                Configure global minimum order restrictions. When active, customers must add products equal to or exceeding this threshold before checkout.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading || submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {canManage && (
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #7E22CE 0%, #9333EA 100%)',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(126, 34, 206, 0.28)',
              }}
            >
              <Save size={16} />
              <span>{submitting ? 'Saving...' : 'Save & Publish'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Form Left, Preview Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Left Column: Configuration Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Status Hero Card */}
          <div
            style={{
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: enabled && parsedMin > 0 ? '#FAF5FF' : '#F9FAFB',
              border: enabled && parsedMin > 0 ? '1.5px solid #E9D5FF' : '1.5px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: enabled && parsedMin > 0 ? '#10B981' : '#9CA3AF',
                    boxShadow: enabled && parsedMin > 0 ? '0 0 10px #10B981' : 'none',
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 800, color: enabled && parsedMin > 0 ? '#6B21A8' : '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {enabled && parsedMin > 0 ? 'Minimum Cart Rule Active' : 'Restriction Disabled'}
                </span>
              </div>

              {/* Enable/Disable Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#374151' }}>
                  {enabled ? 'Enabled' : 'Disabled'}
                </span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#7E22CE', cursor: 'pointer' }}
                />
              </label>
            </div>

            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: enabled && parsedMin > 0 ? '#2E1065' : '#6B7280', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>₹</span>
              <span>{enabled ? (parsedMin > 0 ? parsedMin.toLocaleString('en-IN') : '0 (No Minimum)') : 'Disabled'}</span>
            </div>

            <p style={{ margin: '8px 0 0', fontSize: '12.5px', color: '#6B7280', lineHeight: 1.5 }}>
              {enabled && parsedMin > 0
                ? `Customers cannot checkout unless their cart subtotal is at least ₹${parsedMin.toLocaleString('en-IN')}. Checkout button is automatically blocked.`
                : 'Any customer can checkout regardless of order total. (No minimum restriction is applied).'}
            </p>

            {lastUpdated && (
              <div style={{ marginTop: '12px', fontSize: '11px', color: '#9CA3AF' }}>
                Last updated: {lastUpdated.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          {/* Configuration Card */}
          <div
            style={{
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E9D5FF',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            {/* Quick Selection Presets */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={15} color="#7E22CE" />
                  <span>Quick Selection Presets</span>
                </label>
                <button
                  type="button"
                  onClick={handleRestoreDefaults}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7E22CE',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Reset Defaults
                </button>
              </div>

              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 10px' }}>
                Click any preset button to instantly choose it as the store's minimum cart value:
              </p>

              {/* Preset Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {presets.map((val) => {
                  const isSelected = enabled && Math.abs(parseFloat(minCartValue || 0) - val) < 0.01;
                  return (
                    <div
                      key={val}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? '#FAF5FF' : '#F9FAFB',
                        border: isSelected ? '2px solid #7E22CE' : '1px solid #E5E7EB',
                        overflow: 'hidden',
                        boxShadow: isSelected ? '0 2px 8px rgba(126, 34, 206, 0.15)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEnabled(true);
                          setMinCartValue(String(val));
                        }}
                        style={{
                          padding: '8px 14px',
                          border: 'none',
                          background: 'none',
                          color: isSelected ? '#6B21A8' : '#374151',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <span>₹{val.toLocaleString('en-IN')}</span>
                      </button>

                      {/* Delete Preset Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePreset(val);
                        }}
                        title={`Delete ₹${val} preset`}
                        style={{
                          padding: '8px 8px 8px 4px',
                          border: 'none',
                          background: 'none',
                          color: '#9CA3AF',
                          cursor: 'pointer',
                          fontSize: '14px',
                          lineHeight: 1,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                {/* Inline Add Preset */}
                {isAddingPreset ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#6B7280', fontWeight: 700 }}>₹</span>
                      <input
                        type="number"
                        min="1"
                        step="50"
                        autoFocus
                        value={newPresetInput}
                        onChange={(e) => setNewPresetInput(e.target.value)}
                        placeholder="e.g. 3000"
                        style={{
                          padding: '6px 8px 6px 20px',
                          borderRadius: '8px',
                          border: '1.5px solid #7E22CE',
                          fontSize: '12.5px',
                          width: '100px',
                          outline: 'none',
                          fontWeight: 700,
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPreset();
                          }
                          if (e.key === 'Escape') setIsAddingPreset(false);
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPreset}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#7E22CE',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingPreset(false)}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#F3F4F6',
                        color: '#4B5563',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingPreset(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1.5px dashed #C084FC',
                      backgroundColor: '#FAF5FF',
                      color: '#7E22CE',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Preset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <IndianRupee size={15} color="#7E22CE" />
                <span>Custom Minimum Cart Value (₹)</span>
              </label>

              <div style={{ position: 'relative', maxWidth: '360px' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 800,
                    color: '#7E22CE',
                    fontSize: '16px',
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={minCartValue}
                  disabled={!enabled}
                  onChange={(e) => setMinCartValue(e.target.value)}
                  placeholder="e.g. 500"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 34px',
                    borderRadius: '10px',
                    border: '1.5px solid #E9D5FF',
                    backgroundColor: enabled ? '#FFFFFF' : '#F3F4F6',
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#1E1B4B',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#7E22CE')}
                  onBlur={(e) => (e.target.style.borderColor = '#E9D5FF')}
                />
              </div>

              {parsedMin > 0 && enabled && (
                <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '6px', fontWeight: 600 }}>
                  Active threshold: ₹{parsedMin.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* Configurable Message Template */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Info size={15} color="#7E22CE" />
                <span>Customer Alert Message</span>
              </label>
              <p style={{ fontSize: '11.5px', color: '#6B7280', margin: '0 0 8px' }}>
                Variables: <code style={{ backgroundColor: '#F3F4F6', padding: '1px 5px', borderRadius: '4px' }}>{'{minCartValue}'}</code> and <code style={{ backgroundColor: '#F3F4F6', padding: '1px 5px', borderRadius: '4px' }}>{'{deficit}'}</code>
              </p>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Minimum order amount is ₹{minCartValue}. Please add items worth ₹{deficit} more."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #E9D5FF',
                  fontSize: '12.5px',
                  color: '#1E1B4B',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F3F4F6', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                onClick={handleResetOrDisable}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #FCA5A5',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} />
                <span>Disable / Remove Rule</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={loading || submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7E22CE 0%, #9333EA 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
                }}
              >
                <Save size={15} />
                <span>{submitting ? 'Saving...' : 'Apply & Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Storefront Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E9D5FF',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Eye size={18} color="#7E22CE" />
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                Live Customer Simulator
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px', lineHeight: 1.5 }}>
              Test how customer cart and checkout pages react in real-time. Adjust the test cart total below:
            </p>

            {/* Test Cart Total Slider / Input */}
            <div style={{ marginBottom: '20px', padding: '14px', borderRadius: '12px', backgroundColor: '#FAF5FF', border: '1px solid #F3E8FF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B21A8' }}>Simulated Cart Subtotal</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#2E1065' }}>₹{simSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(3000, parsedMin * 1.5)}
                step="50"
                value={simulatedSubtotal}
                onChange={(e) => setSimulatedSubtotal(e.target.value)}
                style={{ width: '100%', accentColor: '#7E22CE', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#9CA3AF', marginTop: '2px' }}>
                <span>₹0</span>
                <span>₹{Math.max(3000, Math.round(parsedMin * 1.5)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Mock Cart Component Preview */}
            <div
              style={{
                border: '1.5px solid #E5E7EB',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Order Summary (Customer View)
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4B5563', marginBottom: '8px' }}>
                <span>Cart Subtotal</span>
                <span style={{ fontWeight: 700, color: '#1E1B4B' }}>₹{simSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Progress Indicator towards minimum order */}
              {enabled && parsedMin > 0 && (
                <div style={{ margin: '14px 0', padding: '12px', borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, marginBottom: '6px' }}>
                    <span style={{ color: simSatisfied ? '#166534' : '#B45309' }}>
                      {simSatisfied ? '✓ Minimum Order Requirement Reached' : `Add ₹${Math.ceil(simDeficit).toLocaleString('en-IN')} more to reach min order`}
                    </span>
                    <span style={{ color: '#6B7280' }}>{simProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '7px', borderRadius: '4px', backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${simProgress}%`,
                        height: '100%',
                        backgroundColor: simSatisfied ? '#10B981' : '#D97706',
                        borderRadius: '4px',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Warning Alert Banner (When requirement is not satisfied) */}
              {enabled && parsedMin > 0 && !simSatisfied && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFBEB',
                    border: '1.5px solid #FCD34D',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#92400E' }}>
                      Minimum Order Required: ₹{parsedMin.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#B45309', marginTop: '2px', lineHeight: 1.4 }}>
                      Your current cart is ₹{simSubtotal.toLocaleString('en-IN')}. Please add items worth <strong>₹{Math.ceil(simDeficit).toLocaleString('en-IN')}</strong> more to checkout.
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Button Simulation */}
              <button
                type="button"
                disabled={enabled && parsedMin > 0 && !simSatisfied}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: !enabled || simSatisfied ? '#7E22CE' : '#D97706',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: !enabled || simSatisfied ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: !enabled || simSatisfied
                    ? '0 4px 14px rgba(126, 34, 206, 0.3)'
                    : '0 4px 14px rgba(217, 119, 6, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>
                  {enabled && parsedMin > 0 && !simSatisfied
                    ? `Add ₹${Math.ceil(simDeficit).toLocaleString('en-IN')} More to Checkout`
                    : 'Proceed to Checkout'}
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Quick FAQ / Guidance Card */}
          <div
            style={{
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <HelpCircle size={16} color="#7E22CE" />
              <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#2E1065', margin: 0 }}>
                How Minimum Cart Value Works
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#6B7280', lineHeight: 1.6 }}>
              <li>
                <strong>Global Enforcement:</strong> The threshold applies universally to all carts across your entire catalog.
              </li>
              <li>
                <strong>Checkout Blocker:</strong> If a customer's cart subtotal is below the threshold, the Checkout button is disabled and warns them with the exact remaining deficit.
              </li>
              <li>
                <strong>Backend Safeguard:</strong> The server also verifies this rule upon order creation, preventing API tampering.
              </li>
              <li>
                <strong>Instant Updates:</strong> Updating this value instantly reflects on all active shopper carts within seconds.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
