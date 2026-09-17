"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  ArrowRightLeft,
  Maximize2,
  Sliders,
  Check,
  Info,
} from 'lucide-react';
import { adminAttributeApi } from '@/lib/api/admin/attributes';
import { BusyOverlay, BusyButtonLabel } from '@/components/admin/BusyUI';

// Conversion factors to Centimetres (cm)
const TO_CM = {
  cm: 1,
  inch: 2.54,
  m: 100,
  mm: 0.1,
  ft: 30.48,
};

// Quick common dimension helpers
const QUICK_DIMENSION_CHIPS = [
  // 2D Dimensions (L x W)
  { label: '4" × 6" (Photo Frame)', mode: '2d', unit: 'inch', l: 6, w: 4, name: '4" × 6" (10.2 × 15.2 cm)', code: '4X6IN' },
  { label: '5" × 7" (Photo Frame)', mode: '2d', unit: 'inch', l: 7, w: 5, name: '5" × 7" (12.7 × 17.8 cm)', code: '5X7IN' },
  { label: '8" × 10" (Medium Frame)', mode: '2d', unit: 'inch', l: 10, w: 8, name: '8" × 10" (20.3 × 25.4 cm)', code: '8X10IN' },
  { label: '12" × 18" (Poster / Plaque)', mode: '2d', unit: 'inch', l: 18, w: 12, name: '12" × 18" (30.5 × 45.7 cm)', code: '12X18IN' },
  { label: '18" × 24" (Large Poster)', mode: '2d', unit: 'inch', l: 24, w: 18, name: '18" × 24" (45.7 × 61.0 cm)', code: '18X24IN' },
  { label: '24" × 36" (Giant Frame)', mode: '2d', unit: 'inch', l: 36, w: 24, name: '24" × 36" (61.0 × 91.4 cm)', code: '24X36IN' },
  { label: '50 × 70 cm (Standard Art)', mode: '2d', unit: 'cm', l: 70, w: 50, name: '50 × 70 cm (19.7" × 27.6")', code: '50X70CM' },
  { label: '150 × 225 cm (Single Bed)', mode: '2d', unit: 'cm', l: 225, w: 150, name: 'Single Bed: 150 × 225 cm (60" × 90" / 1.5 × 2.25 m)', code: '150X225CM' },
  { label: '225 × 250 cm (Double Bed)', mode: '2d', unit: 'cm', l: 250, w: 225, name: 'Double Bed: 225 × 250 cm (90" × 100" / 2.25 × 2.5 m)', code: '225X250CM' },
  { label: '275 × 275 cm (King Bed)', mode: '2d', unit: 'cm', l: 275, w: 275, name: 'King Bed: 275 × 275 cm (108" × 108" / 2.75 × 2.75 m)', code: '275X275CM' },
  
  // 1D Lengths (Chains & Plush)
  { label: '14" (Choker Chain)', mode: '1d_length', unit: 'inch', l: 14, name: '14" / 35.6 cm (Choker)', code: '14IN' },
  { label: '16" (Collar Chain)', mode: '1d_length', unit: 'inch', l: 16, name: '16" / 40.6 cm (Collar)', code: '16IN' },
  { label: '18" (Princess Chain)', mode: '1d_length', unit: 'inch', l: 18, name: '18" / 45.7 cm (Princess)', code: '18IN' },
  { label: '20" (Matinee Chain)', mode: '1d_length', unit: 'inch', l: 20, name: '20" / 50.8 cm (Matinee)', code: '20IN' },
  { label: '24" (Opera Chain)', mode: '1d_length', unit: 'inch', l: 24, name: '24" / 61.0 cm (Opera)', code: '24IN' },
  { label: '50 cm (Hug Size Plush)', mode: '1d_length', unit: 'cm', l: 50, name: '50 cm (19.7" / 0.5 Metre)', code: '50CM' },
  { label: '100 cm (1 Metre Giant)', mode: '1d_length', unit: 'cm', l: 100, name: '100 cm / 1 Metre (39.4")', code: '100CM' },
  { label: '150 cm (1.5m Life Size)', mode: '1d_length', unit: 'cm', l: 150, name: '150 cm / 1.5 Metre (59.1")', code: '150CM' },
];

const SIZE_PRESETS = [
  {
    category: 'Photo Frame & Art Dimensions (Length × Width with cm & inch)',
    unit: 'dimensions',
    sizes: [
      { name: '4" × 6" (10.2 × 15.2 cm)', code: '4X6IN' },
      { name: '5" × 7" (12.7 × 17.8 cm)', code: '5X7IN' },
      { name: '6" × 8" (15.2 × 20.3 cm)', code: '6X8IN' },
      { name: '8" × 10" (20.3 × 25.4 cm)', code: '8X10IN' },
      { name: '8" × 12" / A4 (20.3 × 30.5 cm)', code: 'A4-8X12' },
      { name: '12" × 16" (30.5 × 40.6 cm)', code: '12X16IN' },
      { name: '12" × 18" (30.5 × 45.7 cm)', code: '12X18IN' },
      { name: '16" × 20" (40.6 × 50.8 cm)', code: '16X20IN' },
      { name: '18" × 24" (45.7 × 61.0 cm)', code: '18X24IN' },
      { name: '20" × 30" (50.8 × 76.2 cm)', code: '20X30IN' },
      { name: '24" × 36" (61.0 × 91.4 cm)', code: '24X36IN' },
    ],
  },
  {
    category: 'Jewellery Necklace & Chain Lengths (inch & cm auto-converted)',
    unit: 'inch',
    sizes: [
      { name: '14" / 35.6 cm (Choker)', code: '14IN' },
      { name: '16" / 40.6 cm (Collar / Standard Short)', code: '16IN' },
      { name: '18" / 45.7 cm (Princess / Most Popular)', code: '18IN' },
      { name: '20" / 50.8 cm (Matinee Length)', code: '20IN' },
      { name: '22" / 55.9 cm (Layered)', code: '22IN' },
      { name: '24" / 61.0 cm (Opera Length)', code: '24IN' },
      { name: '30" / 76.2 cm (Long Chain)', code: '30IN' },
      { name: '36" / 91.4 cm (Rope Length)', code: '36IN' },
    ],
  },
  {
    category: 'Teddy Bear & Plush Heights (cm, m & inch auto-converted)',
    unit: 'cm',
    sizes: [
      { name: '15 cm / 5.9" (Mini Pocket)', code: '15CM' },
      { name: '20 cm / 7.9" (Small)', code: '20CM' },
      { name: '30 cm / 11.8" (Standard)', code: '30CM' },
      { name: '40 cm / 15.7" (Medium)', code: '40CM' },
      { name: '50 cm / 19.7" (Hug Size)', code: '50CM' },
      { name: '60 cm / 23.6" (Large)', code: '60CM' },
      { name: '80 cm / 31.5" (X-Large)', code: '80CM' },
      { name: '100 cm / 1 Metre (39.4" Giant)', code: '100CM' },
      { name: '120 cm / 1.2 Metre (47.2" Jumbo)', code: '120CM' },
      { name: '150 cm / 1.5 Metre (59.1" Life Size)', code: '150CM' },
      { name: '180 cm / 1.8 Metre (70.9" Huge)', code: '180CM' },
      { name: '200 cm / 2 Metre (78.7" Colossal)', code: '200CM' },
    ],
  },
  {
    category: 'Home Furnishings, Curtains & Bedsheets (cm, m & inch)',
    unit: 'home',
    sizes: [
      { name: 'Single Bed: 150 × 225 cm (60" × 90" / 1.5 × 2.25 m)', code: 'SINGLE-BED' },
      { name: 'Double Bed: 225 × 250 cm (90" × 100" / 2.25 × 2.5 m)', code: 'DOUBLE-BED' },
      { name: 'Queen Bed: 230 × 250 cm (90" × 100" / 2.3 × 2.5 m)', code: 'QUEEN-BED' },
      { name: 'King Bed: 275 × 275 cm (108" × 108" / 2.75 × 2.75 m)', code: 'KING-BED' },
      { name: 'Window Curtain: 4 × 5 ft / 122 × 152 cm (48" × 60")', code: 'CURTAIN-5FT' },
      { name: 'Door Curtain: 4 × 7 ft / 122 × 213 cm (48" × 84")', code: 'CURTAIN-7FT' },
      { name: 'Long Door Curtain: 4 × 9 ft / 122 × 274 cm (48" × 108")', code: 'CURTAIN-9FT' },
    ],
  },
  {
    category: 'Jewellery Ring Sizes (Standard 6-24 with mm diameter)',
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

export default function SizeManagerModal({ open, onClose, onSizesUpdated, initialTab = 'browse' }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'browse'); // browse | dimensions | single | bulk | presets
  const [sizes, setSizes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyLabel, setBusyLabel] = useState('Please wait...');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ─── Dimensional Calculator & Converter State ─────────────────────────
  const [dimMode, setDimMode] = useState('2d'); // '2d' (L x W) | '1d_length' (Length / Height) | '1d_width' (Width / Thickness)
  const [dimUnit, setDimUnit] = useState('cm'); // 'cm' | 'inch' | 'm' | 'mm' | 'ft'
  const [dimLength, setDimLength] = useState('');
  const [dimWidth, setDimWidth] = useState('');
  const [dimLabel, setDimLabel] = useState('');
  const [formatChoice, setFormatChoice] = useState('dual_cm_inch'); // 'dual_cm_inch' | 'dual_inch_cm' | 'metric_cm_m' | 'all_units' | 'compact' | 'custom'
  const [customNameInput, setCustomNameInput] = useState('');
  const [customCodeInput, setCustomCodeInput] = useState('');

  // ─── Single Form State ───────────────────────────────────────────────
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  // ─── Bulk Form State ─────────────────────────────────────────────────
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
      setSuccessMsg('');
      setSelectedIds([]);
      if (initialTab) setActiveTab(initialTab);
    }
  }, [open, loadSizes, initialTab]);

  // ─── Helper conversion calculations ──────────────────────────────────
  const calculatedConversions = useMemo(() => {
    const numL = parseFloat(dimLength) || 0;
    const numW = parseFloat(dimWidth) || 0;

    if (numL <= 0 && numW <= 0) return null;

    // Convert Length to standard CM
    const factor = TO_CM[dimUnit] || 1;
    const lCm = numL > 0 ? numL * factor : 0;
    const wCm = numW > 0 ? numW * factor : 0;

    const roundClean = (val, decimals = 1) => {
      if (val === 0) return '0';
      const factorDec = Math.pow(10, decimals);
      const rounded = Math.round(val * factorDec) / factorDec;
      return rounded.toString();
    };

    const lInch = roundClean(lCm / 2.54, 1);
    const lM = roundClean(lCm / 100, 2);
    const lMm = roundClean(lCm * 10, 0);
    const lFt = roundClean(lCm / 30.48, 1);

    const wInch = roundClean(wCm / 2.54, 1);
    const wM = roundClean(wCm / 100, 2);
    const wMm = roundClean(wCm * 10, 0);
    const wFt = roundClean(wCm / 30.48, 1);

    // Formatted name variations
    let nameDualCmInch = '';
    let nameDualInchCm = '';
    let nameMetric = '';
    let nameAllUnits = '';
    let nameCompact = '';
    let autoCode = '';

    const labelSuffix = dimLabel.trim() ? ` (${dimLabel.trim()})` : '';

    if (dimMode === '2d' && numL > 0 && numW > 0) {
      const displayL_cm = roundClean(lCm, 1);
      const displayW_cm = roundClean(wCm, 1);
      nameDualCmInch = `${displayW_cm} × ${displayL_cm} cm (${wInch}" × ${lInch}")${labelSuffix}`;
      nameDualInchCm = `${wInch}" × ${lInch}" (${displayW_cm} × ${displayL_cm} cm)${labelSuffix}`;
      nameMetric = `${displayW_cm} × ${displayL_cm} cm (${wM} × ${lM} m)${labelSuffix}`;
      nameAllUnits = `${displayW_cm} × ${displayL_cm} cm (${wInch}" × ${lInch}" / ${wM} × ${lM} m)${labelSuffix}`;
      nameCompact = `${displayW_cm}x${displayL_cm}cm`;
      autoCode = `${displayW_cm}X${displayL_cm}CM`;
    } else if (dimMode === '1d_length' || (dimMode === '2d' && numL > 0 && numW <= 0)) {
      const displayL_cm = roundClean(lCm, 1);
      nameDualCmInch = `${displayL_cm} cm / ${lInch}"${labelSuffix}`;
      nameDualInchCm = `${lInch}" (${displayL_cm} cm)${labelSuffix}`;
      nameMetric = lCm >= 100 ? `${displayL_cm} cm / ${lM} Metre${labelSuffix}` : `${displayL_cm} cm${labelSuffix}`;
      nameAllUnits = `${displayL_cm} cm / ${lInch}" / ${lM} m${labelSuffix}`;
      nameCompact = `${displayL_cm}cm`;
      autoCode = dimUnit === 'inch' ? `${roundClean(numL, 0)}IN` : `${displayL_cm}CM`;
    } else if (dimMode === '1d_width') {
      const displayW_cm = roundClean(wCm, 1);
      nameDualCmInch = `${displayW_cm} cm (${wInch}")${labelSuffix}`;
      nameDualInchCm = `${wInch}" Width (${displayW_cm} cm)${labelSuffix}`;
      nameMetric = `${wMm} mm Width${labelSuffix}`;
      nameAllUnits = `${displayW_cm} cm / ${wInch}" / ${wMm} mm${labelSuffix}`;
      nameCompact = `${wMm}mm`;
      autoCode = `${wMm}MM`;
    }

    return {
      lCm: roundClean(lCm, 1),
      lInch,
      lM,
      lMm,
      lFt,
      wCm: roundClean(wCm, 1),
      wInch,
      wM,
      wMm,
      wFt,
      nameDualCmInch,
      nameDualInchCm,
      nameMetric,
      nameAllUnits,
      nameCompact,
      autoCode,
    };
  }, [dimLength, dimWidth, dimUnit, dimMode, dimLabel]);

  // Handle Dimension Quick Chip Select
  const handleSelectQuickChip = (chip) => {
    setDimMode(chip.mode);
    setDimUnit(chip.unit);
    setDimLength(chip.l?.toString() || '');
    setDimWidth(chip.w?.toString() || '');
    setCustomNameInput(chip.name || '');
    setCustomCodeInput(chip.code || '');
    setFormatChoice('custom');
  };

  // Submit Dimension Size
  const handleCreateDimensionSize = async (e) => {
    if (e) e.preventDefault();
    if (!calculatedConversions && !customNameInput.trim()) {
      setError('Please enter valid dimensions (Length or Width).');
      return;
    }

    let finalName = '';
    if (formatChoice === 'custom' && customNameInput.trim()) {
      finalName = customNameInput.trim();
    } else if (formatChoice === 'dual_cm_inch') {
      finalName = calculatedConversions?.nameDualCmInch;
    } else if (formatChoice === 'dual_inch_cm') {
      finalName = calculatedConversions?.nameDualInchCm;
    } else if (formatChoice === 'metric_cm_m') {
      finalName = calculatedConversions?.nameMetric;
    } else if (formatChoice === 'all_units') {
      finalName = calculatedConversions?.nameAllUnits;
    } else if (formatChoice === 'compact') {
      finalName = calculatedConversions?.nameCompact;
    } else {
      finalName = calculatedConversions?.nameDualCmInch || customNameInput.trim();
    }

    if (!finalName) {
      setError('Please provide a size name.');
      return;
    }

    const finalCode = customCodeInput.trim() || calculatedConversions?.autoCode || undefined;

    setBusyLabel('Saving dimension size...');
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    // Optimistic addition
    const tempId = `temp-${Date.now()}`;
    const optimisticSize = { id: tempId, name: finalName, code: finalCode };
    setSizes((prev) => [...prev, optimisticSize]);

    try {
      await adminAttributeApi.createSize({ name: finalName, code: finalCode }, true);
      setSuccessMsg(`✓ Added "${finalName}" successfully!`);
      await loadSizes();
      if (onSizesUpdated) onSizesUpdated();
      // Keep form ready for next dimension or switch to browse
      setDimLength('');
      setDimWidth('');
      setDimLabel('');
      setCustomNameInput('');
      setCustomCodeInput('');
    } catch (err) {
      setError(err?.message || 'Failed to create dimension size');
      loadSizes();
    } finally {
      setSubmitting(false);
    }
  };

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
    setSuccessMsg('');

    const sizeName = name.trim();
    const sizeCode = code.trim() || undefined;

    // Optimistic addition
    const tempId = `temp-${Date.now()}`;
    setSizes((prev) => [...prev, { id: tempId, name: sizeName, code: sizeCode }]);
    setName('');
    setCode('');

    try {
      await adminAttributeApi.createSize({ name: sizeName, code: sizeCode }, true);
      setSuccessMsg(`✓ Added "${sizeName}"`);
      await loadSizes();
      if (onSizesUpdated) onSizesUpdated();
      setActiveTab('browse');
    } catch (err) {
      setError(err?.message || 'Failed to create size');
      loadSizes();
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyPreset = async (presetGroup) => {
    setBusyLabel(`Applying ${presetGroup.sizes.length} sizes...`);
    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      await adminAttributeApi.bulkCreateSizes({ items: presetGroup.sizes }, true);
      setSuccessMsg(`✓ Successfully added ${presetGroup.sizes.length} sizes from preset!`);
      await loadSizes();
      if (onSizesUpdated) onSizesUpdated();
      setActiveTab('browse');
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
    setSuccessMsg('');

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
      setSuccessMsg(`✓ Successfully imported ${items.length} sizes!`);
      await loadSizes();
      if (onSizesUpdated) onSizesUpdated();
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

  const handleClose = () => {
    if (onSizesUpdated) onSizesUpdated();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 27, 75, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(126, 34, 206, 0.25)',
          border: '1px solid #E9D5FF',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: '#7E22CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
              }}
            >
              <Ruler size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#2E1065' }}>
                Size & Dimension Manager
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                Length & Width calculator (cm ⇄ inch ⇄ m), jewelry chain lengths & apparel sizes
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              border: 'none',
              background: '#F3E8FF',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#7E22CE',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
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
            gap: '12px',
            backgroundColor: '#ffffff',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'browse', label: `All Sizes (${sizes.length})` },
            { id: 'dimensions', label: '📐 Dimensions & Auto-Converter (L × W)', highlight: true },
            { id: 'single', label: '+ Add Named' },
            { id: 'bulk', label: '⚡ Bulk Paste' },
            { id: 'presets', label: '✨ Category Presets' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError('');
                setSuccessMsg('');
              }}
              style={{
                padding: '13px 4px',
                border: 'none',
                background: 'none',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: '13px',
                color: activeTab === tab.id ? '#7E22CE' : tab.highlight ? '#9333EA' : '#6B7280',
                borderBottom: activeTab === tab.id ? '2.5px solid #7E22CE' : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{tab.label}</span>
              {tab.highlight && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: '#F3E8FF',
                    color: '#7E22CE',
                    padding: '2px 6px',
                    borderRadius: '10px',
                  }}
                >
                  cm / inch / m
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications */}
        {error && (
          <div style={{ margin: '12px 24px 0', padding: '10px 14px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ margin: '12px 24px 0', padding: '10px 14px', backgroundColor: '#F0FDF4', color: '#16A34A', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: BROWSE ALL SIZES */}
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
                        padding: '7px 12px',
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

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dimensions')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#7E22CE',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={13} /> + Dimension Size (L × W)
                  </button>

                  {sizes.length > 0 && (
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
                      <Trash2 size={13} /> Delete All
                    </button>
                  )}
                </div>
              </div>

              {/* Sizes Grid */}
              {loading && sizes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>Loading sizes...</div>
              ) : sizes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
                  <Ruler size={40} style={{ color: '#C084FC', marginBottom: '10px' }} />
                  <p style={{ fontWeight: 700, margin: '0 0 6px', color: '#2E1065' }}>No Sizes Found</p>
                  <p style={{ fontSize: '13px', margin: '0 0 16px', color: '#6B7280' }}>Add dimensions (Length × Width) with auto-conversion or apply category presets.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dimensions')}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '8px',
                      backgroundColor: '#7E22CE',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    📐 Open Dimensions & Auto-Converter
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
                  {sizes.map((size) => {
                    const isSelected = selectedIds.includes(size.id);
                    return (
                      <div
                        key={size.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E9D5FF',
                          backgroundColor: isSelected ? '#FAF5FF' : '#ffffff',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(size.id)}
                            style={{ accentColor: '#7E22CE', width: '15px', height: '15px', cursor: 'pointer', flexShrink: 0 }}
                          />
                          <div style={{ overflow: 'hidden', paddingRight: '4px' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E1B4B', whiteSpace: 'normal', lineHeight: '1.3' }}>
                              {size.name}
                            </div>
                            {size.code && <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>Code: <strong>{size.code}</strong></div>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(size.id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626', padding: '6px', flexShrink: 0 }}
                          title="Delete size"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIMENSIONS & BIDIRECTIONAL AUTO-CONVERTER (L × W / cm ⇄ inch ⇄ m) */}
          {activeTab === 'dimensions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Quick Dimension Inspiration Chips */}
              <div
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#FAF5FF',
                  borderRadius: '12px',
                  border: '1px solid #E9D5FF',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#2E1065', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} style={{ color: '#7E22CE' }} />
                  <span>Popular Standard Dimension Shortcuts (Click to load):</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_DIMENSION_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuickChip(chip)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #D8B4FE',
                        color: '#6B21A8',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension Calculator Inputs Form */}
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #E9D5FF',
                  boxShadow: '0 4px 20px rgba(126, 34, 206, 0.06)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {/* Mode Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Dimension Type
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[
                        { id: '2d', label: '2D: Length × Width' },
                        { id: '1d_length', label: '1D: Length / Height' },
                        { id: '1d_width', label: '1D: Width / Thickness' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setDimMode(m.id)}
                          style={{
                            flex: 1,
                            padding: '8px 6px',
                            borderRadius: '8px',
                            border: dimMode === m.id ? '2px solid #7E22CE' : '1px solid #E5E7EB',
                            backgroundColor: dimMode === m.id ? '#FAF5FF' : '#ffffff',
                            color: dimMode === m.id ? '#7E22CE' : '#4B5563',
                            fontSize: '11.5px',
                            fontWeight: dimMode === m.id ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Base Input Unit */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Input Unit (Auto-converts to all others)
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[
                        { id: 'cm', label: 'cm (Centimetre)' },
                        { id: 'inch', label: 'inch (")' },
                        { id: 'm', label: 'm (Metre)' },
                        { id: 'mm', label: 'mm' },
                        { id: 'ft', label: 'ft (Feet)' },
                      ].map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setDimUnit(u.id)}
                          style={{
                            flex: 1,
                            padding: '8px 4px',
                            borderRadius: '8px',
                            border: dimUnit === u.id ? '2px solid #7E22CE' : '1px solid #E5E7EB',
                            backgroundColor: dimUnit === u.id ? '#FAF5FF' : '#ffffff',
                            color: dimUnit === u.id ? '#7E22CE' : '#4B5563',
                            fontSize: '11.5px',
                            fontWeight: dimUnit === u.id ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Length and Width Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: dimMode === '2d' ? '1fr 1fr 1.2fr' : '1fr 1.2fr', gap: '14px', alignItems: 'flex-end', marginBottom: '16px' }}>
                  {dimMode !== '1d_width' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Length / Height ({dimUnit}) *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={dimLength}
                          onChange={(e) => setDimLength(e.target.value)}
                          placeholder={`e.g. ${dimUnit === 'cm' ? '50' : dimUnit === 'inch' ? '18' : '1.5'}`}
                          style={{
                            width: '100%',
                            padding: '10px 42px 10px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #CBD5E1',
                            backgroundColor: '#FAF5FF',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#1E1B4B',
                            outline: 'none',
                          }}
                        />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 700, color: '#7E22CE' }}>
                          {dimUnit}
                        </span>
                      </div>
                    </div>
                  )}

                  {dimMode !== '1d_length' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Width / Thickness ({dimUnit}) *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={dimWidth}
                          onChange={(e) => setDimWidth(e.target.value)}
                          placeholder={`e.g. ${dimUnit === 'cm' ? '70' : dimUnit === 'inch' ? '24' : '2.0'}`}
                          style={{
                            width: '100%',
                            padding: '10px 42px 10px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #CBD5E1',
                            backgroundColor: '#FAF5FF',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#1E1B4B',
                            outline: 'none',
                          }}
                        />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 700, color: '#7E22CE' }}>
                          {dimUnit}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Optional Tag / Suffix
                    </label>
                    <input
                      type="text"
                      value={dimLabel}
                      onChange={(e) => setDimLabel(e.target.value)}
                      placeholder="e.g. Wall Frame, Hug Size, Choker"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        backgroundColor: '#FAF5FF',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Real-time Bidirectional Conversion Live Output Box */}
                {calculatedConversions && (
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#F5F3FF',
                      borderRadius: '12px',
                      border: '1.5px dashed #A855F7',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#581C87', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowRightLeft size={14} style={{ color: '#7E22CE' }} />
                      <span>Instant Multi-Unit Conversions:</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                      {/* Centimetres */}
                      <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #E9D5FF' }}>
                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>Centimetres (cm)</span>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E1B4B' }}>
                          {dimMode === '2d' ? `${calculatedConversions.wCm} × ${calculatedConversions.lCm} cm` : `${calculatedConversions.lCm || calculatedConversions.wCm} cm`}
                        </span>
                      </div>

                      {/* Inches */}
                      <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #E9D5FF' }}>
                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>Inches (")</span>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#7E22CE' }}>
                          {dimMode === '2d' ? `${calculatedConversions.wInch}" × ${calculatedConversions.lInch}"` : `${calculatedConversions.lInch || calculatedConversions.wInch}"`}
                        </span>
                      </div>

                      {/* Metres */}
                      <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #E9D5FF' }}>
                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>Metres (m)</span>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0369A1' }}>
                          {dimMode === '2d' ? `${calculatedConversions.wM} × ${calculatedConversions.lM} m` : `${calculatedConversions.lM || calculatedConversions.wM} m`}
                        </span>
                      </div>

                      {/* Millimetres or Feet */}
                      <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #E9D5FF' }}>
                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>Feet / Millimetres</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#047857' }}>
                          {dimMode === '2d' ? `${calculatedConversions.wFt}' × ${calculatedConversions.lFt}'` : `${calculatedConversions.lFt || calculatedConversions.wFt} ft (${calculatedConversions.lMm || calculatedConversions.wMm} mm)`}
                        </span>
                      </div>
                    </div>

                    {/* Format Options Selector */}
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
                        Choose Saved Label Format for Product Variants:
                      </span>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                        {[
                          { id: 'dual_cm_inch', label: 'Metric + Imperial (cm & inch)', value: calculatedConversions.nameDualCmInch },
                          { id: 'dual_inch_cm', label: 'Imperial + Metric (inch & cm)', value: calculatedConversions.nameDualInchCm },
                          { id: 'metric_cm_m', label: 'Metric Scale (cm & Metres)', value: calculatedConversions.nameMetric },
                          { id: 'all_units', label: 'All Units (cm / inch / m)', value: calculatedConversions.nameAllUnits },
                          { id: 'compact', label: 'Compact Technical Code', value: calculatedConversions.nameCompact },
                        ].map((fmt) => (
                          <label
                            key={fmt.id}
                            onClick={() => setFormatChoice(fmt.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              backgroundColor: formatChoice === fmt.id ? '#EDE9FE' : '#ffffff',
                              border: formatChoice === fmt.id ? '1.5px solid #7E22CE' : '1px solid #E5E7EB',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="radio"
                                name="dimension_format"
                                checked={formatChoice === fmt.id}
                                onChange={() => setFormatChoice(fmt.id)}
                                style={{ accentColor: '#7E22CE' }}
                              />
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{fmt.label}:</span>
                            </div>
                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E1B4B' }}>{fmt.value}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Edit Option */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                      Custom Size Name Override (Optional)
                    </label>
                    <input
                      type="text"
                      value={customNameInput}
                      onChange={(e) => {
                        setCustomNameInput(e.target.value);
                        setFormatChoice('custom');
                      }}
                      placeholder={calculatedConversions?.nameDualCmInch || 'e.g. 50 × 70 cm (20" × 28")'}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                      Short Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={customCodeInput}
                      onChange={(e) => setCustomCodeInput(e.target.value)}
                      placeholder={calculatedConversions?.autoCode || 'e.g. 50X70CM'}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAF5FF', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Action Submit Button */}
                <button
                  type="button"
                  onClick={handleCreateDimensionSize}
                  disabled={submitting || (!calculatedConversions && !customNameInput.trim())}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '10px',
                    backgroundColor: '#7E22CE',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '14px',
                    border: 'none',
                    cursor: submitting || (!calculatedConversions && !customNameInput.trim()) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(126, 34, 206, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: (!calculatedConversions && !customNameInput.trim()) ? 0.6 : 1,
                  }}
                >
                  <Plus size={18} />
                  <span>{submitting ? 'Saving Dimension Size...' : '+ Save Dimension Size & Update Form'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SINGLE NAMED SIZE */}
          {activeTab === 'single' && (
            <form onSubmit={handleCreateSingle} style={{ maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Size Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 50 cm (Hug Size), 18 Inch Chain, or Size 7"
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
                  placeholder="e.g. 50CM, 18IN, R-7, M"
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
                ) : '+ Add Size & Sync'}
              </button>
            </form>
          )}

          {/* TAB 4: BULK PASTE */}
          {activeTab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                Enter one size per line in format: <code>Size Name, Code</code> (e.g. <code>50 cm (Hug Size), 50CM</code>)
              </p>
              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`18" Chain (45.7 cm), 18IN\n50 × 70 cm (20" × 28"), 50X70CM\n100 cm (1 Metre Giant), 100CM`}
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
                ) : '⚡ Import Sizes & Sync'}
              </button>
            </form>
          )}

          {/* TAB 5: CATEGORY PRESETS */}
          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {SIZE_PRESETS.map((preset, idx) => (
                <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E9D5FF', backgroundColor: '#FAF5FF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#2E1065' }}>{preset.category}</div>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      disabled={submitting}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#7E22CE',
                        color: '#ffffff',
                        fontSize: '11.5px',
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
