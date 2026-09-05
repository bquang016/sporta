import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { API_BASE_URL } from '@/api/config';

export type SupportTicketStatusType = 
  | 'NEW'
  | 'IN_PROGRESS'
  | 'PENDING_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED';

export interface SupportTicket {
  id: string;
  ticketCode: string;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone?: string;
  ticketType: string;
  bookingCode?: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: SupportTicketStatusType;
  adminNote?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

const STATUS_CONFIG: Record<SupportTicketStatusType, { label: string; bg: string; text: string; border: string; dot: string }> = {
  NEW: {
    label: 'Mới tiếp nhận',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200/80',
    dot: 'bg-sky-500',
  },
  IN_PROGRESS: {
    label: 'Đang xử lý',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-200/80',
    dot: 'bg-amber-500',
  },
  PENDING_CUSTOMER: {
    label: 'Chờ phản hồi',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200/80',
    dot: 'bg-purple-500',
  },
  RESOLVED: {
    label: 'Đã giải quyết',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  CLOSED: {
    label: 'Đã đóng',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300/80',
    dot: 'bg-slate-400',
  },
  REJECTED: {
    label: 'Đã hủy / Từ chối',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200/80',
    dot: 'bg-rose-500',
  },
};

export const SupportTicketManagement: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const ticketIdParam = searchParams.get('ticketId');
  const hasAutoOpenedRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | SupportTicketStatusType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [targetStatusInput, setTargetStatusInput] = useState<SupportTicketStatusType>('IN_PROGRESS');
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Calculated Metrics
  const metrics = useMemo(() => {
    const total = tickets.length;
    const newCount = tickets.filter(t => t.status === 'NEW').length;
    const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'PENDING_CUSTOMER').length;
    const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    return { total, newCount, inProgressCount, resolvedCount };
  }, [tickets]);

  const handleOpenProcessModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTargetStatusInput(ticket.status || 'IN_PROGRESS');
    setAdminNoteInput(ticket.adminNote || '');
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    hasAutoOpenedRef.current = null;
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('ticketId');
      return next;
    });
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      let url = `${API_BASE_URL}/admin/support-tickets`;
      const params: string[] = [];
      if (statusFilter !== 'ALL') {
        params.push(`status=${statusFilter}`);
      }
      if (searchQuery.trim()) {
        params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách yêu cầu hỗ trợ.');
      }
      const data = await response.json();
      setTickets(data || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  // Auto open ticket detail modal from URL param (deep link from notifications)
  useEffect(() => {
    if (!ticketIdParam) {
      hasAutoOpenedRef.current = null;
      return;
    }

    if (hasAutoOpenedRef.current === ticketIdParam && selectedTicket) {
      return;
    }

    // Try finding in current tickets
    const found = tickets.find(t => 
      String(t.id).toLowerCase() === String(ticketIdParam).toLowerCase() || 
      t.ticketCode.toLowerCase() === ticketIdParam.toLowerCase()
    );

    if (found) {
      hasAutoOpenedRef.current = ticketIdParam;
      handleOpenProcessModal(found);
      return;
    }

    // If not found in current filtered state, fetch directly
    const fetchAndOpen = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/admin/support-tickets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data: SupportTicket[] = await response.json();
          const matched = data.find(t => 
            String(t.id).toLowerCase() === String(ticketIdParam).toLowerCase() || 
            t.ticketCode.toLowerCase() === ticketIdParam.toLowerCase()
          );
          if (matched) {
            setTickets(data);
            hasAutoOpenedRef.current = ticketIdParam;
            handleOpenProcessModal(matched);
          }
        }
      } catch (err) {
        console.error('Error fetching ticket for deep link:', err);
      }
    };
    fetchAndOpen();
  }, [ticketIdParam, tickets, selectedTicket]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleProcess = async () => {
    if (!selectedTicket) return;
    if (selectedTicket.status === 'CLOSED') {
      showToast('error', 'Ticket đã ở trạng thái ĐÃ ĐÓNG và không thể chỉnh sửa.');
      return;
    }
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/support-tickets/${selectedTicket.id}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: targetStatusInput,
          adminNote: adminNoteInput.trim() || `Cập nhật trạng thái sang ${STATUS_CONFIG[targetStatusInput]?.label || targetStatusInput}.`
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Xử lý yêu cầu hỗ trợ thất bại.');
      }

      const statusLabel = STATUS_CONFIG[targetStatusInput]?.label || targetStatusInput;
      showToast('success', `Đã chuyển yêu cầu ${selectedTicket.ticketCode} sang "${statusLabel}" thành công!`);
      handleCloseModal();
      fetchTickets();
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra khi xử lý yêu cầu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} - ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="space-y-5 flex flex-col flex-1 min-h-0">
      {/* 1. Sporty-Tech KPI Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="bg-surface-container-lowest border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-brand-emerald/30 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tổng Yêu Cầu</span>
            <p className="text-2xl font-black text-on-surface tracking-tight">{metrics.total}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        </div>

        {/* Card 2: New Queue */}
        <div className="bg-surface-container-lowest border border-sky-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-sky-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Mới Tiếp Nhận</span>
            <p className="text-2xl font-black text-sky-900 tracking-tight">{metrics.newCount}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-100/80 flex items-center justify-center text-sky-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Card 3: In Progress / Pending */}
        <div className="bg-surface-container-lowest border border-amber-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-amber-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Đang Xử Lý</span>
            <p className="text-2xl font-black text-amber-950 tracking-tight">{metrics.inProgressCount}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-secondary-container/60 flex items-center justify-center text-secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 4: Resolved */}
        <div className="bg-surface-container-lowest border border-emerald-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-emerald-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Đã Hoàn Tất</span>
            <p className="text-2xl font-black text-emerald-950 tracking-tight">{metrics.resolvedCount}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-brand-emerald">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Main Content Card */}
      <Card className="overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm border border-slate-200/80 rounded-2xl bg-white">
        {/* Header Filters & Search (Sporty-Tech Precision) */}
        <div className="p-4 border-b border-slate-200/60 flex flex-wrap gap-4 items-center justify-between bg-surface-container-low/40">
          {/* Status Tabs Filter */}
          <div className="flex flex-wrap items-center gap-1 bg-surface-container-high/60 p-1 rounded-2xl border border-slate-200/60">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'NEW', label: 'Mới' },
              { id: 'IN_PROGRESS', label: 'Đang xử lý' },
              { id: 'PENDING_CUSTOMER', label: 'Chờ phản hồi' },
              { id: 'RESOLVED', label: 'Đã xử lý' },
              { id: 'CLOSED', label: 'Đã đóng' },
              { id: 'REJECTED', label: 'Từ chối/Hủy' }
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-[1.02]' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar (Sporty-Tech Pill) */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Tìm theo mã, tên, email, tiêu đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 w-full bg-white border border-slate-200/90 rounded-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 pr-10 shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface-container hover:bg-brand-emerald hover:text-white text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchTickets}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs font-bold rounded-full px-3.5 py-2 border-slate-200 hover:border-brand-emerald"
            >
              <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </Button>
          </form>
        </div>

        {/* Ticket List Table */}
        <div className="flex-1 overflow-auto matrix-scroll">
          {isLoading && tickets.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <LoadingSpinner size="lg" />
              <p className="text-xs text-slate-400 font-medium">Đang tải danh sách yêu cầu hỗ trợ...</p>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold">!</div>
              <p className="text-xs text-red-500 font-semibold">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchTickets}>Thử lại</Button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs text-slate-500 font-medium">Không có yêu cầu hỗ trợ nào phù hợp</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-surface-container-low/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                <tr>
                  <th className="px-6 py-3.5">Mã Ticket</th>
                  <th className="px-6 py-3.5">Người Gửi</th>
                  <th className="px-6 py-3.5">Phân Loại & Đơn Đặt</th>
                  <th className="px-6 py-3.5">Tiêu Đề / Mô Tả</th>
                  <th className="px-6 py-3.5">Thời Gian Gửi</th>
                  <th className="px-6 py-3.5">Trạng Thái</th>
                  <th className="px-6 py-3.5 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
                {tickets.map((t) => {
                  const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.NEW;

                  return (
                    <tr key={t.id} className="hover:bg-surface-container-low/40 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-xs bg-surface-container text-primary px-2.5 py-1 rounded-lg border border-brand-emerald/15">
                          {t.ticketCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0 border border-primary/20">
                            {getInitials(t.userName)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-on-surface text-xs truncate">{t.userName}</span>
                            <span className="text-[11px] text-slate-400 truncate">{t.userEmail}</span>
                            {t.userPhone && <span className="text-[10px] text-slate-400">{t.userPhone}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-block bg-surface-container text-primary font-bold text-[10px] px-2 py-0.5 rounded-md border border-brand-emerald/15">
                            {t.ticketType}
                          </span>
                          {t.bookingCode && (
                            <span className="text-[11px] font-mono text-slate-500 font-semibold">
                              Mã: {t.bookingCode}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs truncate max-w-xs group-hover:text-brand-emerald transition-colors" title={t.title}>
                            {t.title}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-xs" title={t.description}>
                            {t.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 ${cfg.bg} ${cfg.text} border ${cfg.border} px-3 py-1 rounded-full text-[11px] font-bold shadow-xs`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant={t.status === 'NEW' || t.status === 'IN_PROGRESS' ? "primary" : "outline"}
                          size="sm"
                          onClick={() => handleOpenProcessModal(t)}
                          className={`text-xs font-bold rounded-xl transition-all shadow-xs ${
                            t.status === 'NEW' || t.status === 'IN_PROGRESS'
                              ? 'bg-brand-yellow text-primary hover:bg-brand-yellow/90 font-black border-none'
                              : 'border-slate-200 hover:border-brand-emerald'
                          }`}
                        >
                          {t.status === 'NEW' ? 'Tiếp nhận' : t.status === 'CLOSED' ? 'Xem chi tiết' : 'Chi tiết / Xử lý'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 3. Process / Detail Ticket Modal (Sporty-Tech Refined) */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-surface-container-low/40">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-black bg-brand-emerald text-white px-3 py-1 rounded-lg shadow-xs">
                    {selectedTicket.ticketCode}
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                    {selectedTicket.status === 'CLOSED' ? 'Chi Tiết Yêu Cầu (Đã Đóng)' : 'Chi Tiết Yêu Cầu Hỗ Trợ'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 overflow-y-auto matrix-scroll flex-1 text-xs">
                {/* User Info Box */}
                <div className="p-4 bg-surface-container-low/60 rounded-2xl border border-slate-200/60 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {getInitials(selectedTicket.userName)}
                    </div>
                    <div>
                      <p className="font-black text-on-surface text-sm">{selectedTicket.userName}</p>
                      <p className="text-slate-500 font-medium">{selectedTicket.userEmail}</p>
                      {selectedTicket.userPhone && <p className="text-slate-400 text-[11px]">{selectedTicket.userPhone}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg border border-primary/20">
                      {selectedTicket.ticketType}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{formatDate(selectedTicket.createdAt)}</p>
                  </div>
                </div>

                {/* Booking Code Reference */}
                {selectedTicket.bookingCode && (
                  <div className="p-3 bg-brand-emerald/5 rounded-2xl border border-brand-emerald/15 flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Mã đơn đặt sân liên quan:</span>
                    <span className="font-mono font-black text-brand-emerald text-xs bg-white px-2.5 py-1 rounded-md border border-brand-emerald/20 shadow-2xs">
                      {selectedTicket.bookingCode}
                    </span>
                  </div>
                )}

                {/* Title & Description */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Tiêu đề yêu cầu
                  </label>
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 font-bold text-slate-800">
                    {selectedTicket.title}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Mô tả chi tiết sự cố
                  </label>
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[70px]">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Attached Image Proof */}
                {selectedTicket.imageUrl && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Ảnh bằng chứng đính kèm
                    </label>
                    <a href={selectedTicket.imageUrl} target="_blank" rel="noopener noreferrer" className="block group">
                      <img 
                        src={selectedTicket.imageUrl} 
                        alt="Ảnh sự cố" 
                        className="max-h-48 rounded-2xl object-contain border border-slate-200 group-hover:border-brand-emerald group-hover:opacity-95 transition-all bg-black/5"
                      />
                    </a>
                  </div>
                )}

                {/* Processing Section */}
                {selectedTicket.status !== 'CLOSED' && (
                  <div className="pt-4 border-t border-slate-200/80 space-y-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                        Cập Nhật Trạng Thái Ticket:
                      </label>
                      <select
                        value={targetStatusInput}
                        onChange={(e) => setTargetStatusInput(e.target.value as SupportTicketStatusType)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 shadow-2xs"
                      >
                        <option value="NEW">1. Mới tiếp nhận (Hàng đợi)</option>
                        <option value="IN_PROGRESS">2. Đang xử lý</option>
                        <option value="PENDING_CUSTOMER">3. Chờ phản hồi từ khách hàng</option>
                        <option value="RESOLVED">4. Đã giải quyết</option>
                        <option value="CLOSED">5. Đóng Ticket</option>
                        <option value="REJECTED">6. Từ chối / Hủy</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                        Ghi Chú Phản Hồi / Lý Do Xử Lý:
                      </label>
                      <textarea
                        rows={3}
                        value={adminNoteInput}
                        onChange={(e) => setAdminNoteInput(e.target.value)}
                        placeholder="Nhập ghi chú phản hồi hoặc hướng dẫn xử lý cho người dùng..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 placeholder:text-slate-400 resize-none shadow-2xs"
                      />
                    </div>
                  </div>
                )}

                {/* Closed Admin Note */}
                {selectedTicket.status === 'CLOSED' && selectedTicket.adminNote && (
                  <div className="p-3.5 bg-surface-container-low rounded-2xl border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-600 uppercase mb-1">Ghi chú xử lý trước đó:</p>
                    <p className="text-slate-700 italic">{selectedTicket.adminNote}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-surface-container-low/40 flex items-center justify-end gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseModal}
                  className="rounded-xl px-4 text-xs font-bold border-slate-200"
                >
                  Đóng
                </Button>
                {selectedTicket.status !== 'CLOSED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="bg-brand-emerald hover:bg-brand-emerald/90 text-white font-bold rounded-xl px-5 py-2 shadow-sm transition-all cursor-pointer"
                  >
                    {isProcessing ? 'Đang lưu...' : 'Cập Nhật Trạng Thái'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
