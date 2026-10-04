"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  X,
  RefreshCw,
  Clock,
  Layers,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { adminBulkApi } from '@/lib/api/admin/bulk';
import { adminProductApi } from '@/lib/api/admin/products';

export default function BulkProductUploadPage() {
  const [activeTab, setActiveTab] = useState('upload'); // upload | images | history
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Media Tab state
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [uploadedMediaList, setUploadedMediaList] = useState([]);
  const [copiedUrlIndex, setCopiedUrlIndex] = useState(null);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await adminBulkApi.listImportHistory();
      setHistory(res?.imports || res?.history || []);
    } catch {
      // Handled
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, loadHistory]);

  // Poll active BullMQ job status
  useEffect(() => {
    if (!activeJobId) return undefined;

    const interval = setInterval(async () => {
      try {
        const res = await adminBulkApi.getImportJobStatus(activeJobId);
        const job = res?.job;
        setJobStatus(job);

        if (
          job?.status === 'COMPLETED' ||
          job?.status === 'FAILED' ||
          job?.status === 'PARTIALLY_COMPLETED'
        ) {
          clearInterval(interval);
          setUploading(false);
          loadHistory();
          if (job?.status === 'COMPLETED') {
            setSuccess(`Bulk import complete! Successfully imported ${job.createdCount || 0} products into your catalog.`);
          } else if (job?.status === 'PARTIALLY_COMPLETED') {
            setSuccess(`Bulk import finished with ${job.createdCount || 0} created and ${job.failedCount || 0} failed rows.`);
          }
        }
      } catch (err) {
        console.error('Job polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJobId, loadHistory]);

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    setError('');
    try {
      await adminBulkApi.downloadTemplate();
      setSuccess('Template downloaded! Check your downloads folder for ThePurple_Product_Import_Template.xlsx');
    } catch (err) {
      setError(err?.message || 'Failed to download sample template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationResult(null);
    setError('');
    setSuccess('');
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files]);
      setValidationResult(null);
      setError('');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setValidationResult(null);
  };

  const handleClearAllImages = () => {
    setSelectedImages([]);
    setValidationResult(null);
  };

  const handleValidateFile = async () => {
    if (!selectedFile) return;
    setValidating(true);
    setError('');
    setSuccess('');

    try {
      const data = await adminBulkApi.validateBulkFile(selectedFile, selectedImages);
      setValidationResult(data);
      if (data.errorCount > 0 || (data.errors && data.errors.length > 0)) {
        setError(`Found ${data.errorCount || data.errors.length} validation errors in your spreadsheet. Review the issues below before importing.`);
      } else {
        setSuccess(`Spreadsheet verified! ${data.validCount || data.totalRows || 0} product rows ready for import.`);
      }
    } catch (err) {
      setError(err?.message || 'File validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const res = await adminBulkApi.executeBulkImport(selectedFile, selectedImages);
      if (res?.importId) {
        setActiveJobId(res.importId);
      }
      setJobStatus(res?.job || { status: 'PROCESSING', validRows: validationResult?.validCount || 0 });
      setSuccess('Bulk import started! Products and gallery images are being processed in background.');
    } catch (err) {
      setError(err?.message || 'Failed to start bulk import');
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedImages([]);
    setValidationResult(null);
    setError('');
    setSuccess('');
    setActiveJobId(null);
    setJobStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Direct Media Uploader Handlers
  const handleMediaUpload = async () => {
    if (mediaFiles.length === 0) return;
    setMediaUploading(true);
    setError('');
    try {
      const res = await adminProductApi.uploadMultipleImages(mediaFiles, 'products');
      const newItems = (res?.images || res?.uploads || []).map((img) => ({
        url: img.publicUrl || img.url || img.imageUrl,
        name: img.originalName || img.originalname || 'image.webp',
        size: img.size || 0,
      }));
      setUploadedMediaList((prev) => [...newItems, ...prev]);
      setMediaFiles([]);
      setSuccess(`Uploaded ${newItems.length} images to Cloudflare R2! Copy their URLs into your Excel.`);
    } catch (err) {
      setError(err?.message || 'Failed to upload images');
    } finally {
      setMediaUploading(false);
    }
  };

  const handleCopyUrl = (url, index) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlIndex(index);
    setTimeout(() => setCopiedUrlIndex(null), 2000);
  };

  const handleCopyAllUrls = () => {
    const allUrls = uploadedMediaList.map((m) => m.url).join('\n');
    navigator.clipboard.writeText(allUrls);
    setSuccess('Copied all image URLs to clipboard!');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/admin/products"
            style={{
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              color: '#7E22CE',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(126, 34, 206, 0.06)',
            }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#2E1065', margin: 0 }}>
                Bulk Excel & Media Product Importer
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#FAF5FF',
                color: '#7E22CE',
                border: '1px solid #E9D5FF',
                padding: '3px 10px',
                borderRadius: '999px',
              }}>
                Cloudflare R2 + WebP
              </span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#6B7280', margin: '4px 0 0 0' }}>
              Upload Excel spreadsheets (.xlsx, .csv) and bulk product images with automatic R2 optimization and category auto-matching.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadTemplate}
          disabled={downloadingTemplate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            backgroundColor: '#7E22CE',
            border: 'none',
            color: '#ffffff',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: downloadingTemplate ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 10px rgba(126, 34, 206, 0.25)',
          }}
        >
          {downloadingTemplate ? (
            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Download size={16} />
          )}
          <span>{downloadingTemplate ? 'Generating Template...' : 'Download Excel Template (.XLSX)'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: '2px',
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 700,
            borderBottom: activeTab === 'upload' ? '3px solid #7E22CE' : '3px solid transparent',
            color: activeTab === 'upload' ? '#7E22CE' : '#6B7280',
            background: 'none',
            border: 'none',
            borderBottomWidth: '3px',
            borderBottomStyle: 'solid',
            borderBottomColor: activeTab === 'upload' ? '#7E22CE' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Upload size={18} />
          <span>📥 Upload & Import</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('images')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 700,
            borderBottom: activeTab === 'images' ? '3px solid #7E22CE' : '3px solid transparent',
            color: activeTab === 'images' ? '#7E22CE' : '#6B7280',
            background: 'none',
            border: 'none',
            borderBottomWidth: '3px',
            borderBottomStyle: 'solid',
            borderBottomColor: activeTab === 'images' ? '#7E22CE' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ImageIcon size={18} />
          <span>🖼️ Batch Image Uploader & Links</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 700,
            borderBottom: activeTab === 'history' ? '3px solid #7E22CE' : '3px solid transparent',
            color: activeTab === 'history' ? '#7E22CE' : '#6B7280',
            background: 'none',
            border: 'none',
            borderBottomWidth: '3px',
            borderBottomStyle: 'solid',
            borderBottomColor: activeTab === 'history' ? '#7E22CE' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Layers size={18} />
          <span>📜 Import History</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '14px 18px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          color: '#DC2626',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.05)',
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div style={{
          marginBottom: '20px',
          padding: '14px 18px',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '12px',
          color: '#059669',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.05)',
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess('')}
            style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tab 1: Upload & Import */}
      {activeTab === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Instructions / Template Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
            border: '1px solid #E9D5FF',
            borderRadius: '18px',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(126, 34, 206, 0.04)',
          }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={18} color="#7E22CE" />
                <span style={{ fontWeight: 800, fontSize: '15px', color: '#2E1065' }}>
                  Step 1: Download & Fill the Excel Template
                </span>
                <span style={{
                  fontSize: '11px',
                  background: '#7E22CE',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700,
                }}>
                  ⚡ Dropdown Validations
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>
                The template is automatically pre-configured with all your store&apos;s active Categories, Subcategories, Colors, and Sizes dropdown selectors. Fill your products, then upload both Excel and images below.
              </div>
            </div>
            <button
              type="button"
              disabled={downloadingTemplate}
              onClick={handleDownloadTemplate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#ffffff',
                color: '#7E22CE',
                border: '1px solid #D8B4FE',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: downloadingTemplate ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                boxShadow: '0 2px 4px rgba(126, 34, 206, 0.08)',
              }}
            >
              {downloadingTemplate ? (
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Download size={15} />
              )}
              <span>{downloadingTemplate ? 'Downloading...' : 'Get .XLSX Template'}</span>
            </button>
          </div>

          {/* Upload Dropzones: Excel + Images */}
          {!activeJobId && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {/* 1. Excel Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: selectedFile ? '2px solid #7E22CE' : '2px dashed #D8B4FE',
                  borderRadius: '18px',
                  padding: '36px 24px',
                  textAlign: 'center',
                  background: selectedFile ? '#FAF5FF' : '#FCF9FF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(126, 34, 206, 0.03)',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: selectedFile ? '#EDE9FE' : '#F3E8FF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7E22CE',
                  marginBottom: '14px',
                }}>
                  <FileSpreadsheet size={28} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px 0' }}>
                  {selectedFile ? selectedFile.name : '1. Select Product Excel File *'}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#6B7280', margin: 0 }}>
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB (Click to change)`
                    : 'Supports .xlsx, .xls, and .csv files'}
                </p>
              </div>

              {/* 2. Image Files Dropzone */}
              <div
                onClick={() => imageInputRef.current?.click()}
                style={{
                  border: selectedImages.length > 0 ? '2px solid #059669' : '2px dashed #A7F3D0',
                  borderRadius: '18px',
                  padding: '36px 24px',
                  textAlign: 'center',
                  background: selectedImages.length > 0 ? '#ECFDF5' : '#F0FDF4',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.03)',
                }}
              >
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageFilesChange}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: selectedImages.length > 0 ? '#D1FAE5' : '#DCFCE7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                  marginBottom: '14px',
                }}>
                  <ImageIcon size={28} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#064E3B', margin: '0 0 6px 0' }}>
                  {selectedImages.length > 0
                    ? `${selectedImages.length} Image Files Attached`
                    : '2. Attach Image Files (Optional)'}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#047857', margin: 0 }}>
                  {selectedImages.length > 0
                    ? 'Click to add more image files'
                    : 'Auto-matched by filename or SKU & uploaded to Cloudflare R2'}
                </p>
              </div>
            </div>
          )}

          {/* Attached Images Preview Box */}
          {selectedImages.length > 0 && !activeJobId && (
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '14px',
              padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#065F46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <span>{selectedImages.length} Attached Images Ready for R2 Upload:</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAllImages}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#DC2626',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={14} />
                  <span>Remove All</span>
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                {selectedImages.map((img, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#FFFFFF',
                      border: '1px solid #86EFAC',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      color: '#047857',
                      fontWeight: 600,
                    }}
                  >
                    <span>{img.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Validation & Import Controls */}
          {selectedFile && !activeJobId && !validationResult && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear Selection
              </button>
              <button
                type="button"
                disabled={validating}
                onClick={handleValidateFile}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  backgroundColor: '#7E22CE',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: validating ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 10px rgba(126, 34, 206, 0.25)',
                }}
              >
                {validating ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                <span>{validating ? 'Validating Spreadsheet...' : 'Validate Spreadsheet & Images'}</span>
              </button>
            </div>
          )}

          {/* Validation Results Card */}
          {validationResult && !activeJobId && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #E9D5FF',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(107, 33, 168, 0.05)',
            }}>
              {/* Summary Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #FAF5FF',
                paddingBottom: '16px',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileSpreadsheet size={20} style={{ color: '#7E22CE' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
                      Validation Complete: {selectedFile?.name}
                    </h3>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#6B7280', marginTop: '2px' }}>
                    Total Rows Analyzed: <strong>{validationResult.totalRows}</strong>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                >
                  <X size={16} />
                  <span>Choose Another File</span>
                </button>
              </div>

              {/* Stats Badges */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '12px',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>Valid Products</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#065F46', marginTop: '4px' }}>
                    {validationResult.validCount}
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: validationResult.errorCount > 0 ? '#FEF2F2' : '#F9FAFB',
                  border: `1px solid ${validationResult.errorCount > 0 ? '#FECACA' : '#E5E7EB'}`,
                  borderRadius: '12px',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: validationResult.errorCount > 0 ? '#DC2626' : '#6B7280' }}>
                    Row Errors
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: validationResult.errorCount > 0 ? '#991B1B' : '#374151', marginTop: '4px' }}>
                    {validationResult.errorCount}
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: validationResult.attachedImagesCount > 0 ? '#EFF6FF' : '#F9FAFB',
                  border: `1px solid ${validationResult.attachedImagesCount > 0 ? '#BFDBFE' : '#E5E7EB'}`,
                  borderRadius: '12px',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: validationResult.attachedImagesCount > 0 ? '#1D4ED8' : '#6B7280' }}>
                    Attached Images
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: validationResult.attachedImagesCount > 0 ? '#1E40AF' : '#374151', marginTop: '4px' }}>
                    {validationResult.attachedImagesCount || selectedImages.length}
                  </div>
                </div>
              </div>

              {/* Row Errors Breakdown if any */}
              {validationResult.errors?.length > 0 && (
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <AlertCircle size={18} style={{ color: '#DC2626' }} />
                    <strong style={{ color: '#991B1B', fontSize: '14px' }}>
                      Validation Errors ({validationResult.errors.length} rows will be skipped):
                    </strong>
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {validationResult.errors.map((err, i) => (
                      <div key={i} style={{ fontSize: '12.5px', color: '#B91C1C', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #FEE2E2' }}>
                        <strong>Row {err.row}</strong> [{err.sku} - {err.productName}]: {err.messages?.join(', ') || err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Row Preview Table */}
              {validationResult.preview && validationResult.preview.length > 0 && (
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                  <div style={{ padding: '10px 14px', background: '#FAF5FF', fontSize: '13px', fontWeight: 700, color: '#581C87', borderBottom: '1px solid #E5E7EB' }}>
                    Previewing First {validationResult.preview.length} Rows:
                  </div>
                  <div style={{ overflowX: 'auto', maxHeight: '200px' }}>
                    <table style={{ width: '100%', fontSize: '12.5px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px', color: '#6B7280' }}>#</th>
                          <th style={{ padding: '8px 12px', color: '#6B7280' }}>Product Name</th>
                          <th style={{ padding: '8px 12px', color: '#6B7280' }}>SKU</th>
                          <th style={{ padding: '8px 12px', color: '#6B7280' }}>Category</th>
                          <th style={{ padding: '8px 12px', color: '#6B7280' }}>Price</th>
                          <th style={{ padding: '8px 12px', color: '#6B7280' }}>Image Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationResult.preview.map((p, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '8px 12px', color: '#9CA3AF' }}>{p.rowNumber}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1F2937' }}>{p.name}</td>
                            <td style={{ padding: '8px 12px', color: '#4B5563', fontFamily: 'monospace' }}>{p.sku}</td>
                            <td style={{ padding: '8px 12px', color: '#7E22CE' }}>{p.category}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#059669' }}>₹{p.salePrice || p.price}</td>
                            <td style={{ padding: '8px 12px', color: '#4B5563', fontSize: '12px' }}>{p.imageMatchStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action to Start Import */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartImport}
                  disabled={validationResult.validCount === 0 || uploading}
                  style={{
                    padding: '10px 28px',
                    borderRadius: '10px',
                    backgroundColor: '#7E22CE',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: validationResult.validCount === 0 || uploading ? 'not-allowed' : 'pointer',
                    opacity: validationResult.validCount === 0 ? 0.5 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 10px rgba(126, 34, 206, 0.25)',
                  }}
                >
                  {uploading ? (
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Upload size={16} />
                  )}
                  <span>{uploading ? 'Importing Products...' : `Confirm & Import ${validationResult.validCount} Valid Products`}</span>
                </button>
              </div>
            </div>
          )}

          {/* BullMQ Live Job Progress Tracker */}
          {activeJobId && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #E9D5FF',
              borderRadius: '18px',
              padding: '36px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(107, 33, 168, 0.05)',
            }}>
              {jobStatus?.status === 'COMPLETED' ? (
                <div>
                  <CheckCircle2 size={52} style={{ color: '#10B981', margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#065F46', margin: '0 0 8px 0' }}>
                    Bulk Import Completed Successfully!
                  </h3>
                  <p style={{ fontSize: '14.5px', color: '#047857', margin: 0 }}>
                    Successfully imported <strong>{jobStatus.createdCount}</strong> products and their gallery images to Cloudflare R2 & catalog.
                  </p>
                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '14px' }}>
                    <Link
                      href="/admin/products"
                      style={{
                        padding: '10px 22px',
                        borderRadius: '10px',
                        backgroundColor: '#7E22CE',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '13.5px',
                        textDecoration: 'none',
                        boxShadow: '0 4px 10px rgba(126, 34, 206, 0.25)',
                      }}
                    >
                      View Product Catalog &rarr;
                    </Link>
                    <button
                      onClick={handleReset}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        backgroundColor: '#FAF5FF',
                        border: '1px solid #E9D5FF',
                        color: '#7E22CE',
                        fontWeight: 700,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                      }}
                    >
                      Upload Another Batch
                    </button>
                  </div>
                </div>
              ) : jobStatus?.status === 'FAILED' ? (
                <div>
                  <AlertCircle size={52} style={{ color: '#DC2626', margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#991B1B', margin: '0 0 8px 0' }}>
                    Bulk Import Failed
                  </h3>
                  <p style={{ fontSize: '14px', color: '#B91C1C', margin: 0 }}>
                    An error occurred while processing bulk batch products.
                  </p>
                  <button
                    onClick={handleReset}
                    style={{
                      marginTop: '20px',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      backgroundColor: '#7E22CE',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    border: '3px solid #E9D5FF',
                    borderTopColor: '#7E22CE',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 18px',
                  }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px 0' }}>
                    Background Processing Products & Images...
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#6B7280', margin: 0 }}>
                    Status: <strong>{jobStatus?.status || 'PROCESSING'}</strong> | Processed: <strong>{jobStatus?.processedRows || 0} / {jobStatus?.validRows || validationResult?.validCount || 0}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Batch Media Uploader */}
      {activeTab === 'images' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Media Uploader Notice */}
          <div style={{
            padding: '16px 20px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            fontSize: '13.5px',
            color: '#1E40AF',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}>
            <Info size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '14.5px' }}>Direct Image Uploader & Cloudflare R2 WebP Generator</div>
              <div style={{ marginTop: '4px', color: '#2563EB', fontSize: '13px', lineHeight: 1.5 }}>
                Upload multiple product photos in batch. They will be compressed to WebP and hosted on your high-speed Cloudflare R2 bucket. Copy their links into your Excel file&apos;s &quot;Image Filename(s) or URLs&quot; column.
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div style={{
            border: '2px dashed #93C5FD',
            borderRadius: '18px',
            padding: '40px 24px',
            textAlign: 'center',
            background: '#F8FAFC',
          }}>
            <ImageIcon size={40} color="#2563EB" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#1E293B' }}>
              {mediaFiles.length > 0 ? `${mediaFiles.length} Images Selected` : 'Select Product Images to Upload'}
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: '20px' }}>
              Supports JPG, PNG, and WebP images (up to 50 images per batch)
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <label style={{
                cursor: 'pointer',
                display: 'inline-flex',
                padding: '9px 18px',
                borderRadius: '10px',
                backgroundColor: '#7E22CE',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13.5px',
              }}>
                <span>Browse Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                  style={{ display: 'none' }}
                />
              </label>
              {mediaFiles.length > 0 && (
                <button
                  type="button"
                  disabled={mediaUploading}
                  onClick={handleMediaUpload}
                  style={{
                    background: '#2563EB',
                    color: '#fff',
                    border: 'none',
                    padding: '9px 20px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    cursor: mediaUploading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13.5px',
                  }}
                >
                  {mediaUploading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
                  <span>{mediaUploading ? 'Uploading to R2...' : `Upload ${mediaFiles.length} Images to R2`}</span>
                </button>
              )}
            </div>
          </div>

          {/* Uploaded Media Table */}
          {uploadedMediaList.length > 0 && (
            <div style={{
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '20px',
              background: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#1E293B' }}>
                  Uploaded Image URLs ({uploadedMediaList.length})
                </div>
                <button
                  type="button"
                  onClick={handleCopyAllUrls}
                  style={{
                    fontSize: '12.5px',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <Copy size={13} />
                  <span>Copy All URLs</span>
                </button>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {uploadedMediaList.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <img
                        src={item.url}
                        alt={item.name}
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                      />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '460px' }}>
                          {item.url}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.url, idx)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: copiedUrlIndex === idx ? '#ECFDF5' : '#FFFFFF',
                          border: copiedUrlIndex === idx ? '1px solid #10B981' : '1px solid #CBD5E1',
                          color: copiedUrlIndex === idx ? '#059669' : '#334155',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedUrlIndex === idx ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedUrlIndex === idx ? 'Copied!' : 'Copy URL'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Import History Table */}
      {activeTab === 'history' && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #E9D5FF',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(107, 33, 168, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Clock size={20} style={{ color: '#7E22CE' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
              Recent Bulk Import Jobs
            </h3>
          </div>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>
              <RefreshCw size={24} color="#7E22CE" style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 10px auto', display: 'block' }} />
              Loading import history...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '13.5px' }}>
              No past import history found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAF5FF', borderBottom: '1px solid #E9D5FF' }}>
                    <th style={{ padding: '12px 16px', color: '#581C87', fontWeight: 700 }}>File Name</th>
                    <th style={{ padding: '12px 16px', color: '#581C87', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '12px 16px', color: '#581C87', fontWeight: 700 }}>Total Rows</th>
                    <th style={{ padding: '12px 16px', color: '#581C87', fontWeight: 700 }}>Created</th>
                    <th style={{ padding: '12px 16px', color: '#581C87', fontWeight: 700 }}>Failed</th>
                    <th style={{ padding: '12px 16px', color: '#581C87', fontWeight: 700 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} style={{ borderBottom: '1px solid #F3E8FF' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1E1B4B' }}>{h.fileName}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor:
                            h.status === 'COMPLETED'
                              ? '#ECFDF5'
                              : h.status === 'FAILED'
                              ? '#FEF2F2'
                              : '#EFF6FF',
                          color:
                            h.status === 'COMPLETED'
                              ? '#047857'
                              : h.status === 'FAILED'
                              ? '#DC2626'
                              : '#1D4ED8',
                        }}>
                          {h.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{h.totalRows}</td>
                      <td style={{ padding: '12px 16px', color: '#047857', fontWeight: 700 }}>{h.createdCount || h.processedRows || 0}</td>
                      <td style={{ padding: '12px 16px', color: '#DC2626', fontWeight: 700 }}>{h.failedCount || 0}</td>
                      <td style={{ padding: '12px 16px', color: '#6B7280', fontSize: '12.5px' }}>
                        {new Date(h.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
