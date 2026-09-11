"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { adminBulkApi } from '@/lib/api/admin/bulk';

export default function BulkExcelImportModal({ open, onClose, onImportComplete }) {
  const [activeTab, setActiveTab] = useState('upload'); // upload | history
  const [selectedFile, setSelectedFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (open) {
      setError('');
      setSuccess('');
      setValidationResult(null);
      setJobStatus(null);
      setSelectedFile(null);
      if (activeTab === 'history') loadHistory();
    }
  }, [open, activeTab, loadHistory]);

  if (!open) return null;

  const handleDownloadTemplate = async () => {
    try {
      await adminBulkApi.downloadTemplate();
    } catch (err) {
      setError(err?.message || 'Failed to download template');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null);
      setError('');
    }
  };

  const handleValidateFile = async () => {
    if (!selectedFile) return;
    setValidating(true);
    setError('');
    try {
      const res = await adminBulkApi.validateBulkFile(selectedFile);
      setValidationResult(res);
      if (!res.isValid) {
        setError(`Found ${res.errors?.length || 0} validation errors in your spreadsheet.`);
      } else {
        setSuccess(`File passed validation! ${res.validRowsCount || res.validCount || 0} product rows ready for import.`);
      }
    } catch (err) {
      setError(err?.message || 'Failed to validate file');
    } finally {
      setValidating(false);
    }
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    try {
      const res = await adminBulkApi.executeBulkImport(selectedFile);
      setJobStatus(res?.job || { status: 'COMPLETED', successCount: res?.count || 1 });
      setSuccess('Bulk import processed successfully!');
      if (onImportComplete) onImportComplete();
    } catch (err) {
      setError(err?.message || 'Failed to execute import');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container large">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <FileSpreadsheet size={20} color="#7E22CE" />
              <span>Bulk Excel & CSV Import Engine</span>
            </h2>
            <p className="modal-subtitle">
              Upload spreadsheets with products, dimensional sizes, categories, and pricing in bulk.
            </p>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`modal-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          >
            📥 Upload & Validate
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`modal-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            📜 Import History & Logs
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ margin: '16px 24px 0 24px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{ margin: '16px 24px 0 24px', padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', color: '#059669', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          {activeTab === 'upload' && (
            <div>
              {/* Template Download Card */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '14px', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#2E1065' }}>Download Official Excel Template</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Pre-configured with all store columns (Title, Category, Subcategory, MRP, Sale Price, Stock, Colors, Sizes).</div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="admin-btn admin-btn-secondary"
                >
                  <Download size={15} />
                  <span>Download .XLSX Template</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div style={{ border: '2px dashed #D8B4FE', borderRadius: '16px', padding: '36px 24px', textAlign: 'center', background: '#FAF5FF', marginBottom: '20px' }}>
                <Upload size={36} color="#7E22CE" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#1E1B4B' }}>
                  {selectedFile ? selectedFile.name : 'Select or drop your spreadsheet (.xlsx or .csv)'}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', marginBottom: '16px' }}>
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Supports Microsoft Excel (.xlsx, .xls) or CSV files up to 10MB'}
                </div>

                <label className="admin-btn admin-btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                  <span>{selectedFile ? 'Change File' : 'Browse File from Computer'}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Validation Summary Card */}
              {validationResult && (
                <div style={{ border: '1px solid #E9D5FF', borderRadius: '14px', padding: '18px 20px', background: '#ffffff', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#1E1B4B' }}>Spreadsheet Pre-Flight Check</div>
                    <span className={`badge ${validationResult.isValid ? 'badge-success' : 'badge-danger'}`}>
                      {validationResult.isValid ? '✓ Passed Validation' : '⚠️ Errors Found'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ padding: '10px', background: '#FAF5FF', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Total Rows</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#1E1B4B' }}>{validationResult.totalRows || 0}</div>
                    </div>
                    <div style={{ padding: '10px', background: '#ECFDF5', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#047857' }}>Valid Rows</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#047857' }}>{validationResult.validRowsCount || validationResult.validCount || 0}</div>
                    </div>
                    <div style={{ padding: '10px', background: '#FEF2F2', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#B91C1C' }}>Error Rows</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#B91C1C' }}>{validationResult.errors?.length || 0}</div>
                    </div>
                  </div>

                  {validationResult.errors && validationResult.errors.length > 0 && (
                    <div style={{ maxHeight: '150px', overflowY: 'auto', background: '#FEF2F2', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#B91C1C', marginBottom: '6px' }}>Error Details:</div>
                      {validationResult.errors.map((err, i) => (
                        <div key={i} style={{ fontSize: '11.5px', color: '#7F1D1D', marginBottom: '3px' }}>
                          Row #{err.row || i + 1}: {err.message || err}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>
                  <RefreshCw size={22} color="#7E22CE" style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 8px auto', display: 'block' }} />
                  Loading past imports...
                </div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280', border: '1px dashed #E9D5FF', borderRadius: '12px' }}>
                  <FileSpreadsheet size={36} color="#C084FC" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                  <div style={{ fontWeight: 700, color: '#1E1B4B' }}>No bulk imports recorded yet</div>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Filename</th>
                        <th>Total Rows</th>
                        <th>Success</th>
                        <th>Failed</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.id}>
                          <td>{new Date(h.createdAt).toLocaleString('en-IN')}</td>
                          <td style={{ fontWeight: 600 }}>{h.fileName || 'Spreadsheet'}</td>
                          <td>{h.totalRows || 0}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{h.processedRows || h.successCount || 0}</td>
                          <td style={{ color: '#DC2626', fontWeight: 700 }}>{h.failedRows || 0}</td>
                          <td>
                            <span className={`badge ${h.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                              {h.status}
                            </span>
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

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="admin-btn admin-btn-outline"
          >
            Close
          </button>

          {activeTab === 'upload' && (
            <>
              {!validationResult ? (
                <button
                  type="button"
                  disabled={!selectedFile || validating}
                  onClick={handleValidateFile}
                  className="admin-btn admin-btn-secondary"
                >
                  <Check size={14} />
                  <span>{validating ? 'Validating File...' : '1. Validate File'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={uploading || !validationResult.isValid}
                  onClick={handleStartImport}
                  className="admin-btn admin-btn-primary"
                >
                  <Upload size={14} />
                  <span>{uploading ? 'Importing Products...' : '2. Execute Database Import'}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
