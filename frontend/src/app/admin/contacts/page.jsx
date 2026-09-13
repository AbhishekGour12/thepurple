"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  RefreshCw,
  Send,
  Trash2,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Inbox,
  User,
  ShoppingBag,
  Tag,
  ArrowRight,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { adminContactApi } from '@/lib/api/admin/contacts';

const QUICK_REPLY_TEMPLATES = [
  {
    label: '✨ Standard Concierge Greeting',
    text: (name) =>
      `Hello ${name || 'there'},\n\nThank you for reaching out to ThePurple Concierge Team. We have reviewed your request and would be delighted to assist you.\n\n`,
  },
  {
    label: '📦 Order Status & Tracking',
    text: (name, orderId) =>
      `Hello ${name || 'there'},\n\nThank you for contacting us regarding your order ${orderId ? `(#${orderId})` : ''}. We have checked the shipping logs, and your package is being handled with utmost care. You can track real-time delivery milestones via our Track Order portal.\n\n`,
  },
  {
    label: '💎 Product Customization & Details',
    text: (name) =>
      `Hello ${name || 'there'},\n\nThank you for your interest in ThePurple jewelry collection. Regarding your customization inquiry, our artisans can certainly tailor this piece to your specific preferences.\n\n`,
  },
  {
    label: '🔄 Return / Exchange Support',
    text: (name) =>
      `Hello ${name || 'there'},\n\nWe are sorry to hear that you need assistance with a return or exchange. We offer a 7-day hassle-free exchange policy. Please ensure the jewelry is in its original luxury box with all tags intact.\n\n`,
  },
  {
    label: '✅ Inquiry Resolved',
    text: (name) =>
      `Hello ${name || 'there'},\n\nWe are pleased to inform you that your request has been resolved. If you need any further assistance, please do not hesitate to contact us again. Wishing you a wonderful day!\n\nWarm regards,\nThePurple Concierge Team`,
  },
];

export default function AdminContactsPage() {
  const currentAdmin = useSelector((state) => state.auth?.admin?.profile);
  const canManage = currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'MANAGER';

  const [queries, setQueries] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, inProgress: 0, replied: 0, closed: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  // Modal / Drawer State
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [replyStatus, setReplyStatus] = useState('REPLIED');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminContactApi.listQueries({
        search,
        status: statusFilter || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      setQueries(res?.queries || []);
      if (res?.summary) setSummary(res.summary);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err) {
      showToast(err?.message || 'Failed to load contact queries', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const openQueryModal = (query) => {
    setSelectedQuery(query);
    setReplyText(query.adminReply || '');
    setAdminNotes(query.adminNotes || '');
    setReplyStatus(query.status === 'PENDING' ? 'REPLIED' : query.status);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      showToast('Please compose a reply message to email the customer.', 'error');
      return;
    }

    setIsSendingReply(true);
    try {
      const res = await adminContactApi.replyToQuery(selectedQuery.id, {
        replyMessage: replyText,
        adminNotes,
        status: replyStatus,
      });

      showToast(`Reply emailed successfully to ${selectedQuery.email}!`);
      
      const updatedQuery = res?.query || { ...selectedQuery, adminReply: replyText, status: replyStatus, repliedAt: new Date() };
      setSelectedQuery(updatedQuery);
      
      setQueries((prev) =>
        prev.map((q) => (q.id === selectedQuery.id ? updatedQuery : q))
      );
      
      fetchQueries();
    } catch (err) {
      showToast(err?.message || 'Failed to send reply email', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleQuickStatusChange = async (nextStatus) => {
    if (!selectedQuery) return;
    setIsUpdatingStatus(true);
    try {
      const res = await adminContactApi.updateStatus(selectedQuery.id, {
        status: nextStatus,
        adminNotes,
      });

      showToast(`Inquiry marked as ${nextStatus}`);
      const updated = res?.query || { ...selectedQuery, status: nextStatus, adminNotes };
      setSelectedQuery(updated);
      setQueries((prev) =>
        prev.map((q) => (q.id === selectedQuery.id ? updated : q))
      );
      fetchQueries();
    } catch (err) {
      showToast(err?.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteQuery = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer inquiry?')) return;
    setIsDeleting(true);
    try {
      await adminContactApi.deleteQuery(id);
      showToast('Inquiry deleted successfully');
      if (selectedQuery?.id === id) setSelectedQuery(null);
      setQueries((prev) => prev.filter((q) => q.id !== id));
      fetchQueries();
    } catch (err) {
      showToast(err?.message || 'Failed to delete inquiry', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const applyTemplate = (templateFn) => {
    const text = templateFn(selectedQuery?.fullName, selectedQuery?.orderId);
    setReplyText((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', fontFamily: 'var(--font-heading)' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toast.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#1E1B4B',
              margin: '0 0 6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#FAF5FF',
                border: '1.5px solid #E9D5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7E22CE',
              }}
            >
              <MessageSquare size={22} />
            </div>
            <span>Customer Contact Inquiries</span>
          </h1>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14.5px' }}>
            Manage incoming messages from the storefront contact page, track pending questions, and send email replies directly to customers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchQueries}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            color: '#475569',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Total Inquiries</span>
            <Inbox size={18} color="#7E22CE" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 4px' }}>
            {summary.total || 0}
          </h2>
          <span style={{ fontSize: '12px', color: '#7E22CE', fontWeight: 700 }}>All incoming tickets</span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #FEF3C7',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>Pending Review</span>
            <Clock size={18} color="#D97706" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#D97706', margin: '0 0 4px' }}>
            {summary.pending || 0}
          </h2>
          <span style={{ fontSize: '12px', color: '#B45309', fontWeight: 700 }}>Awaiting admin response</span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #DCFCE7',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>Replied to User</span>
            <CheckCheck size={18} color="#16A34A" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#16A34A', margin: '0 0 4px' }}>
            {summary.replied || 0}
          </h2>
          <span style={{ fontSize: '12px', color: '#15803D', fontWeight: 700 }}>Emailed with official reply</span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Closed / Resolved</span>
            <CheckCircle2 size={18} color="#64748B" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#475569', margin: '0 0 4px' }}>
            {summary.closed || 0}
          </h2>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>Archived / Resolved</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #E2E8F0',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        {/* Search Input */}
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <Search
            size={18}
            color="#94A3B8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by customer name, email, subject, order ID, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '10px',
              border: '1.5px solid #E2E8F0',
              fontSize: '13.5px',
              color: '#1E1B4B',
              outline: 'none',
              backgroundColor: '#F8FAFC',
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: '180px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid #E2E8F0',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">🟡 Pending Review</option>
            <option value="IN_PROGRESS">🔵 In Progress</option>
            <option value="REPLIED">🟢 Replied</option>
            <option value="CLOSED">⚪ Closed</option>
          </select>
        </div>
      </div>

      {/* Queries Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#7E22CE' }} />
            <p style={{ fontWeight: 600 }}>Loading customer queries...</p>
          </div>
        ) : queries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
            <MessageSquare size={44} style={{ margin: '0 auto 12px', color: '#DDD6FE' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E1B4B', margin: '0 0 6px' }}>
              No inquiries found
            </h3>
            <p style={{ fontSize: '13.5px', margin: 0 }}>
              {search || statusFilter ? 'Try clearing your search query or filters.' : 'Inquiries submitted on the contact page will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px' }}>Sender</th>
                  <th style={{ padding: '14px 20px' }}>Subject &amp; Order ID</th>
                  <th style={{ padding: '14px 20px' }}>Message Preview</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Received</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((q) => {
                  const isPending = q.status === 'PENDING';
                  const isReplied = q.status === 'REPLIED';
                  const isInProgress = q.status === 'IN_PROGRESS';
                  const isClosed = q.status === 'CLOSED';

                  return (
                    <tr
                      key={q.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF5FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      {/* Sender */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: isPending ? '#FEF3C7' : '#EDE9FE',
                              color: isPending ? '#B45309' : '#7E22CE',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '14px',
                              flexShrink: 0,
                            }}
                          >
                            {(q.fullName || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <span style={{ display: 'block', fontWeight: 800, color: '#1E1B4B', fontSize: '14px' }}>
                              {q.fullName}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
                              <Mail size={11} color="#94A3B8" />
                              {q.email}
                            </span>
                            {q.phone && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#94A3B8' }}>
                                <Phone size={10} color="#94A3B8" />
                                {q.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Subject & Order ID */}
                      <td style={{ padding: '16px 20px', maxWidth: '220px' }}>
                        <span style={{ display: 'block', fontWeight: 700, color: '#1E1B4B', fontSize: '13.5px', lineHeight: 1.3 }}>
                          {q.subject}
                        </span>
                        {q.orderId && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '4px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#F3E8FF',
                              color: '#6B21A8',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            <ShoppingBag size={10} />
                            Order #{q.orderId}
                          </span>
                        )}
                      </td>

                      {/* Message Preview */}
                      <td style={{ padding: '16px 20px', maxWidth: '280px' }}>
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#475569',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          &ldquo;{q.message}&rdquo;
                        </div>
                        {q.adminReply && (
                          <div
                            style={{
                              marginTop: '4px',
                              fontSize: '11.5px',
                              color: '#16A34A',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCheck size={12} />
                            <span>Replied: {q.adminReply.slice(0, 30)}...</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 700,
                            backgroundColor: isPending
                              ? '#FEF3C7'
                              : isReplied
                              ? '#DCFCE7'
                              : isInProgress
                              ? '#E0F2FE'
                              : '#F1F5F9',
                            color: isPending
                              ? '#B45309'
                              : isReplied
                              ? '#15803D'
                              : isInProgress
                              ? '#0369A1'
                              : '#64748B',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isPending
                                ? '#D97706'
                                : isReplied
                                ? '#16A34A'
                                : isInProgress
                                ? '#0284C7'
                                : '#94A3B8',
                            }}
                          />
                          <span>{q.status}</span>
                        </span>
                      </td>

                      {/* Received Date */}
                      <td style={{ padding: '16px 20px', fontSize: '12.5px', color: '#64748B' }} suppressHydrationWarning>
                        <div>
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {q.createdAt ? new Date(q.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => openQueryModal(q)}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '8px',
                              backgroundColor: isPending ? '#6D28D9' : '#FAF5FF',
                              border: isPending ? 'none' : '1px solid #E9D5FF',
                              color: isPending ? '#FFFFFF' : '#7E22CE',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Send size={13} />
                            <span>{isReplied ? 'View & Reply' : 'Reply Now'}</span>
                          </button>

                          {canManage && (
                            <button
                              type="button"
                              onClick={() => handleDeleteQuery(q.id)}
                              style={{
                                padding: '7px',
                                borderRadius: '8px',
                                backgroundColor: 'transparent',
                                border: '1px solid #FEE2E2',
                                color: '#DC2626',
                                cursor: 'pointer',
                              }}
                              title="Delete inquiry"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: '#64748B',
            }}
          >
            <div>
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: pagination.page <= 1 ? '#F1F5F9' : '#FFFFFF',
                  color: '#334155',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: pagination.page >= pagination.totalPages ? '#F1F5F9' : '#FFFFFF',
                  color: '#334155',
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── QUERY DETAIL & EMAIL REPLY MODAL ────────────────────────────── */}
      {selectedQuery && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FAF5FF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: '#6D28D9',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '18px',
                  }}
                >
                  {(selectedQuery.fullName || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 800, color: '#1E1B4B' }}>
                    Inquiry from {selectedQuery.fullName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#6B7280' }}>
                    <span>Email: <strong>{selectedQuery.email}</strong></span>
                    {selectedQuery.phone && <span>• Phone: <strong>{selectedQuery.phone}</strong></span>}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQuery(null)}
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E9D5FF',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* Meta Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '12px',
                  backgroundColor: '#F8FAFC',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontSize: '13px',
                }}
              >
                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Subject
                  </span>
                  <strong style={{ color: '#1E1B4B' }}>{selectedQuery.subject}</strong>
                </div>

                {selectedQuery.orderId && (
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      Order Reference
                    </span>
                    <strong style={{ color: '#6B21A8' }}>#{selectedQuery.orderId}</strong>
                  </div>
                )}

                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Ticket Status
                  </span>
                  <strong style={{ color: selectedQuery.status === 'REPLIED' ? '#16A34A' : '#D97706' }}>
                    {selectedQuery.status}
                  </strong>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Received On
                  </span>
                  <span style={{ color: '#334155' }} suppressHydrationWarning>
                    {selectedQuery.createdAt ? new Date(selectedQuery.createdAt).toLocaleString('en-IN') : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Original Customer Message Box */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1E1B4B', marginBottom: '8px' }}>
                  📩 Customer Message:
                </label>
                <div
                  style={{
                    backgroundColor: '#FAF5FF',
                    border: '1.5px solid #E9D5FF',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    color: '#2E1065',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedQuery.message}
                </div>
              </div>

              {/* Previously Sent Reply If Any */}
              {selectedQuery.adminReply && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCheck size={16} color="#16A34A" />
                      <span>Last Sent Email Response:</span>
                    </label>
                    <span style={{ fontSize: '12px', color: '#64748B' }} suppressHydrationWarning>
                      {selectedQuery.repliedAt ? `Sent on ${new Date(selectedQuery.repliedAt).toLocaleString('en-IN')}` : ''}
                      {selectedQuery.repliedByAdmin?.name ? ` by ${selectedQuery.repliedByAdmin.name}` : ''}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#F0FDF4',
                      border: '1.5px solid #BBF7D0',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      color: '#14532D',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {selectedQuery.adminReply}
                  </div>
                </div>
              )}

              {/* Live Email Reply Composer */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 800, color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="#7E22CE" />
                    <span>{selectedQuery.adminReply ? 'Compose New / Follow-up Reply:' : 'Compose Email Reply to Customer:'}</span>
                  </label>
                </div>

                {/* Quick Templates Pill Bar */}
                <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', alignSelf: 'center', marginRight: '4px' }}>
                    Quick Presets:
                  </span>
                  {QUICK_REPLY_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(tmpl.text)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#F3E8FF',
                        border: '1px solid #DDD6FE',
                        color: '#6B21A8',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E9D5FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F3E8FF')}
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={6}
                  placeholder={`Write your official response to ${selectedQuery.fullName}... It will be styled into a luxury branded email and sent directly to ${selectedQuery.email}.`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: '#1E1B4B',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#FFFFFF',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Internal Admin Notes */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    Internal Admin Note (Optional - visible only to staff):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified with logistics team, replacement parcel dispatched."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px',
                      color: '#334155',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#F8FAFC',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #F1F5F9',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              {/* Quick Status Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B' }}>Mark Status:</span>
                <button
                  type="button"
                  disabled={isUpdatingStatus || selectedQuery.status === 'IN_PROGRESS'}
                  onClick={() => handleQuickStatusChange('IN_PROGRESS')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #BAE6FD',
                    backgroundColor: selectedQuery.status === 'IN_PROGRESS' ? '#E0F2FE' : '#FFFFFF',
                    color: '#0369A1',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus || selectedQuery.status === 'CLOSED'}
                  onClick={() => handleQuickStatusChange('CLOSED')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: selectedQuery.status === 'CLOSED' ? '#F1F5F9' : '#FFFFFF',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close Inquiry
                </button>
              </div>

              {/* Main Reply Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedQuery(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSendingReply || !replyText.trim()}
                  onClick={handleSendReply}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isSendingReply || !replyText.trim() ? '#CBD5E1' : '#6D28D9',
                    color: '#FFFFFF',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: isSendingReply || !replyText.trim() ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(109, 40, 217, 0.25)',
                  }}
                >
                  <Send size={15} className={isSendingReply ? 'animate-spin' : ''} />
                  <span>{isSendingReply ? 'Sending Email...' : 'Send Email Reply'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
