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

export interface DisputeDetail {
  disputeId: string;
  matchId: string;
  roomId?: string;
  status: 'OPEN' | 'RESOLVED';
  reasonCode: string;
  description: string;
  openedByClubId: number;
  openedByClubName: string;
  hostClubId: number;
  hostClubName: string;
  hostClubAvatar?: string;
  guestClubId: number;
  guestClubName: string;
  guestClubAvatar?: string;
  sportName?: string;
  venueName?: string;
  matchDate?: string;
  matchTime?: string;
  hostSubmittedScore?: string;
  hostSubmittedRaw?: string;
  guestEvidenceImageUrl?: string;
  guestEvidenceDescription?: string;
  guestEvidenceCreatedAt?: string;
  hostEvidenceImageUrl?: string;
  hostEvidenceDescription?: string;
  hostEvidenceCreatedAt?: string;
  hostHasSubmittedEvidence: boolean;
  disputeCreatedAt?: string;
  counterEvidenceDeadline?: string;
  isDeadlineExpired: boolean;
  resolutionNote?: string;
  resolvedResultJson?: string;
  resolvedAt?: string;
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

const DISPUTE_REASON_LABELS: Record<string, string> = {
  WRONG_SCORE: 'Tỷ số thực tế không khớp',
  HOST_FAKE_SCORE: 'Đội nhà tự ý khai gian lận điểm số',
  NO_SHOW: 'Đối thủ không đến sân thi đấu',
  RULE_VIOLATION: 'Vi phạm điều lệ giải đấu / thi đấu',
  OTHER: 'Lý do khác',
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

  // Dispute Detail State
  const [disputeDetail, setDisputeDetail] = useState<DisputeDetail | null>(null);
  const [isDisputeLoading, setIsDisputeLoading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isRuling, setIsRuling] = useState<boolean>(false);

  // Calculated Metrics
  const metrics = useMemo(() => {
    const total = tickets.length;
    const newCount = tickets.filter(t => t.status === 'NEW').length;
    const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'PENDING_CUSTOMER').length;
    const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    return { total, newCount, inProgressCount, resolvedCount };
  }, [tickets]);

  const isMatchDisputeTicket = (ticket: SupportTicket | null) => {
    if (!ticket) return false;
    return ticket.ticketType === 'MATCH_DISPUTE' || (ticket.adminNote && ticket.adminNote.includes('MatchId:'));
  };

  const fetchDisputeDetailForTicket = async (ticket: SupportTicket) => {
    setIsDisputeLoading(true);
    setDisputeDetail(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/disputes/by-ticket/${ticket.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data: DisputeDetail = await response.json();
        setDisputeDetail(data);
      }
    } catch (err) {
      console.warn('Could not fetch dispute details:', err);
    } finally {
      setIsDisputeLoading(false);
    }
  };

  const handleOpenProcessModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTargetStatusInput(ticket.status || 'IN_PROGRESS');
    setAdminNoteInput(ticket.adminNote || '');

    if (isMatchDisputeTicket(ticket)) {
      fetchDisputeDetailForTicket(ticket);
    } else {
      setDisputeDetail(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    setDisputeDetail(null);
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

  // 1-Click Ruling Handler for Match Disputes
  const handleRuling = async (ruling: 'WIN_A' | 'WIN_B' | 'DRAW') => {
    if (!disputeDetail) return;
    setIsRuling(true);
    try {
      const token = localStorage.getItem('accessToken');
      const note = adminNoteInput.trim() || (
        ruling === 'WIN_A'
          ? 'Admin xử lý: Bên A (Host) thắng 3-0. Phạt bên B -10 CRP do khiếu nại sai.'
          : ruling === 'WIN_B'
          ? 'Admin xử lý: Bên B (Guest) thắng 0-3. Phạt bên A -10 CRP do khai báo sai tỷ số.'
          : 'Admin xử lý: Kết quả hòa 0-0. Cập nhật điểm xếp hạng theo kết quả thi đấu.'
      );

      const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeDetail.disputeId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ruling,
          resolutionNote: note
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Xử lý tranh chấp thất bại.');
      }

      showToast(
        'success',
        ruling === 'DRAW'
          ? 'Đã xử kết quả hòa (0 - 0) thành công! Điểm CRP và kết quả trận đã được chốt.'
          : `Đã xử ${ruling === 'WIN_A' ? 'bên A (Host)' : 'bên B (Guest)'} thắng thành công! Điểm CRP và kết quả trận đã được chốt.`
      );
      handleCloseModal();
      fetchTickets();
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra khi xử lý tranh chấp.');
    } finally {
      setIsRuling(false);
    }
  };

  // Handler to close / dismiss duplicate or invalid dispute ticket
  const handleCloseDispute = async () => {
    if (!disputeDetail) return;
    setIsRuling(true);
    try {
      const token = localStorage.getItem('accessToken');
      const note = adminNoteInput.trim() || 'Admin đã đóng khiếu nại này (Khiếu nại trùng lặp hoặc đã được xử lý trước đó).';

      const response = await fetch(`${API_BASE_URL}/admin/disputes/${disputeDetail.disputeId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resolutionNote: note
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Đóng khiếu nại thất bại.');
      }

      showToast('success', 'Đã đóng hồ sơ khiếu nại thành công!');
      handleCloseModal();
      fetchTickets();
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra khi đóng khiếu nại.');
    } finally {
      setIsRuling(false);
    }
  };

  // Direct Ticket Close / Resolve Handler
  const handleDirectCloseTicket = async (status: SupportTicketStatusType = 'CLOSED', customNote?: string) => {
    if (!selectedTicket) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const note = customNote || adminNoteInput.trim() || (
        status === 'CLOSED'
          ? 'Admin đã đóng yêu cầu hỗ trợ này.'
          : status === 'RESOLVED'
          ? 'Admin đã xử lý hoàn tất yêu cầu hỗ trợ.'
          : `Cập nhật trạng thái sang ${STATUS_CONFIG[status]?.label || status}.`
      );

      const response = await fetch(`${API_BASE_URL}/admin/support-tickets/${selectedTicket.id}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          adminNote: note
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Cập nhật trạng thái ticket thất bại.');
      }

      const statusLabel = STATUS_CONFIG[status]?.label || status;
      showToast('success', `Đã chuyển ticket ${selectedTicket.ticketCode} sang "${statusLabel}" thành công!`);
      handleCloseModal();
      fetchTickets();
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra khi cập nhật ticket.');
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tổng yêu cầu</span>
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Mới tiếp nhận</span>
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Đang xử lý</span>
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Đã hoàn tất</span>
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
                  <th className="px-6 py-3.5">Mã ticket</th>
                  <th className="px-6 py-3.5">Người gửi</th>
                  <th className="px-6 py-3.5">Phân loại & đơn đặt</th>
                  <th className="px-6 py-3.5">Tiêu đề / mô tả</th>
                  <th className="px-6 py-3.5">Thời gian gửi</th>
                  <th className="px-6 py-3.5">Trạng thái</th>
                  <th className="px-6 py-3.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
                {tickets.map((t) => {
                  const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.NEW;
                  const isDispute = t.ticketType === 'MATCH_DISPUTE';

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
                          <span className={`inline-block font-bold text-[10px] px-2.5 py-0.5 rounded-md border ${
                            isDispute 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : 'bg-surface-container text-primary border-brand-emerald/15'
                          }`}>
                            {isDispute ? 'Tranh chấp kèo' : t.ticketType}
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
                            isDispute && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white font-black border-none'
                              : t.status === 'NEW' || t.status === 'IN_PROGRESS'
                              ? 'bg-brand-yellow text-primary hover:bg-brand-yellow/90 font-black border-none'
                              : 'border-slate-200 hover:border-brand-emerald'
                          }`}
                        >
                          {isDispute 
                            ? (t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'Xem chi tiết' : 'Xử lý kèo') 
                            : t.status === 'NEW' ? 'Tiếp nhận' : t.status === 'CLOSED' ? 'Xem chi tiết' : 'Chi tiết / xử lý'}
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
            <div className={`bg-white rounded-3xl shadow-2xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 ${
              isMatchDisputeTicket(selectedTicket) ? 'max-w-4xl' : 'max-w-lg'
            }`}>
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-surface-container-low/40">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-black bg-brand-emerald text-white px-3 py-1 rounded-lg shadow-xs">
                    {selectedTicket.ticketCode}
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                    {isMatchDisputeTicket(selectedTicket) ? (
                      <>
                        <span>Xử lý tranh chấp tỷ số trận đấu</span>
                        {disputeDetail?.status === 'RESOLVED' ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">Đã xử lý</span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold animate-pulse">Chờ Admin xử lý</span>
                        )}
                      </>
                    ) : selectedTicket.status === 'CLOSED' ? (
                      'Chi tiết yêu cầu (đã đóng)'
                    ) : (
                      'Chi tiết yêu cầu hỗ trợ'
                    )}
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
                {/* 3A. SPECIAL UI: MATCH DISPUTE DETAIL */}
                {isMatchDisputeTicket(selectedTicket) ? (
                  isDisputeLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                      <LoadingSpinner size="lg" />
                      <p className="text-slate-500 font-medium">Đang tải hồ sơ tranh chấp & bằng chứng hai đội...</p>
                    </div>
                  ) : disputeDetail ? (
                    <div className="space-y-4">
                      {/* Match & Club Context Card */}
                      {(() => {
                        const isResolved = disputeDetail.status === 'RESOLVED';
                        const resolvedParts = disputeDetail.resolvedResultJson ? disputeDetail.resolvedResultJson.split('-') : null;
                        const hostFinalScore = resolvedParts ? parseInt(resolvedParts[0]?.trim() || '0', 10) : null;
                        const guestFinalScore = resolvedParts ? parseInt(resolvedParts[1]?.trim() || '0', 10) : null;
                        const isHostWinner = isResolved && hostFinalScore !== null && guestFinalScore !== null && hostFinalScore > guestFinalScore;
                        const isGuestWinner = isResolved && hostFinalScore !== null && guestFinalScore !== null && guestFinalScore > hostFinalScore;
                        const isDrawMatch = isResolved && hostFinalScore !== null && guestFinalScore !== null && hostFinalScore === guestFinalScore;

                        return (
                          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="bg-brand-emerald text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase">
                                  {disputeDetail.sportName || 'Thể thao'}
                                </span>
                                <span className="text-slate-300 font-semibold text-xs">
                                  {disputeDetail.venueName || 'Sân vận động Sporta'} • {disputeDetail.matchDate || ''} {disputeDetail.matchTime || ''}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] text-slate-400">
                                Phòng kèo: #{disputeDetail.roomId ? String(disputeDetail.roomId).slice(0, 8) : 'N/A'}
                              </span>
                            </div>

                            {/* Clubs Comparison & Final / Submitted Score */}
                            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-1">
                              {/* Host Club (Side A) */}
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-emerald-500/20 border text-emerald-300 font-black flex items-center justify-center text-sm shrink-0 overflow-hidden ${
                                  isHostWinner ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-emerald-400/40'
                                }`}>
                                  {disputeDetail.hostClubAvatar ? (
                                    <img src={disputeDetail.hostClubAvatar} alt="Host" className="w-full h-full object-cover" />
                                  ) : (
                                    getInitials(disputeDetail.hostClubName)
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Đội nhà (Bên A)</span>
                                    {isResolved && (
                                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                                        isHostWinner ? 'bg-emerald-500 text-white' : isDrawMatch ? 'bg-slate-700 text-slate-300' : 'bg-rose-500/30 text-rose-300'
                                      }`}>
                                        {isHostWinner ? 'THẮNG' : isDrawMatch ? 'HÒA' : 'THUA'}
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-black text-sm text-white truncate">{disputeDetail.hostClubName}</p>
                                </div>
                              </div>

                              {/* Center Score Badge */}
                              <div className={`text-center rounded-xl py-2 px-3 border ${
                                isResolved ? 'bg-emerald-950/60 border-emerald-500/40' : 'bg-white/10 border-white/10'
                              }`}>
                                <span className={`text-[10px] uppercase font-bold block mb-0.5 ${
                                  isResolved ? 'text-emerald-400' : 'text-amber-300'
                                }`}>
                                  {isResolved ? 'Tỷ số chốt chung cuộc' : 'Tỷ số bên A khai báo'}
                                </span>
                                <p className="text-xl font-black tracking-widest text-white">
                                  {isResolved ? (disputeDetail.resolvedResultJson || '0 - 0') : (disputeDetail.hostSubmittedScore || 'Chưa rõ')}
                                </p>
                                {isResolved && (
                                  <span className="text-[10px] font-bold text-emerald-300 block mt-0.5">
                                    {isHostWinner ? 'Bên A (Đội nhà) thắng' : isGuestWinner ? 'Bên B (Đội khách) thắng' : 'Kết quả hòa'}
                                  </span>
                                )}
                              </div>

                              {/* Guest Club (Side B) */}
                              <div className="flex items-center justify-end gap-3 text-right">
                                <div className="min-w-0">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {isResolved && (
                                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                                        isGuestWinner ? 'bg-emerald-500 text-white' : isDrawMatch ? 'bg-slate-700 text-slate-300' : 'bg-rose-500/30 text-rose-300'
                                      }`}>
                                        {isGuestWinner ? 'THẮNG' : isDrawMatch ? 'HÒA' : 'THUA'}
                                      </span>
                                    )}
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">Đội khách (Bên B)</span>
                                  </div>
                                  <p className="font-black text-sm text-white truncate">{disputeDetail.guestClubName}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-full bg-sky-500/20 border text-sky-300 font-black flex items-center justify-center text-sm shrink-0 overflow-hidden ${
                                  isGuestWinner ? 'border-sky-400 ring-2 ring-sky-400/50' : 'border-sky-400/40'
                                }`}>
                                  {disputeDetail.guestClubAvatar ? (
                                    <img src={disputeDetail.guestClubAvatar} alt="Guest" className="w-full h-full object-cover" />
                                  ) : (
                                    getInitials(disputeDetail.guestClubName)
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Side-by-Side Evidence Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* LEFT COLUMN: GUEST (SIDE B) COMPLAINT */}
                        <div className="bg-rose-50/50 border-2 border-rose-200/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-rose-800 uppercase flex items-center gap-1.5">
                                Khiếu nại từ bên B (Đội khách)
                              </span>
                              <span className="bg-rose-100 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-rose-200">
                                {DISPUTE_REASON_LABELS[disputeDetail.reasonCode] || disputeDetail.reasonCode || 'Khiếu nại'}
                              </span>
                            </div>

                            <div>
                              <p className="text-[11px] font-bold text-slate-500 mb-1">Mô tả sự việc:</p>
                              <div className="bg-white p-3 rounded-xl border border-rose-200 text-slate-800 leading-relaxed min-h-[60px]">
                                {disputeDetail.guestEvidenceDescription || disputeDetail.description || 'Không có mô tả chi tiết.'}
                              </div>
                            </div>

                            {/* Guest Evidence Image */}
                            <div>
                              <p className="text-[11px] font-bold text-slate-500 mb-1">Ảnh bằng chứng đính kèm:</p>
                              {disputeDetail.guestEvidenceImageUrl ? (
                                <div 
                                  className="relative group cursor-pointer overflow-hidden rounded-xl border border-rose-300 bg-black/5 aspect-video max-h-40 flex items-center justify-center"
                                  onClick={() => setPreviewImage(disputeDetail.guestEvidenceImageUrl!)}
                                >
                                  <img 
                                    src={disputeDetail.guestEvidenceImageUrl} 
                                    alt="Guest Evidence" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                    Phóng to ảnh
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 bg-white/60 border border-slate-200 rounded-xl text-center text-slate-400 italic">
                                  Bên B không tải lên ảnh chụp
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 text-[10px] text-slate-400 border-t border-rose-100">
                            Gửi lúc: {formatDate(disputeDetail.guestEvidenceCreatedAt || disputeDetail.disputeCreatedAt)}
                          </div>
                        </div>

                        {/* RIGHT COLUMN: HOST (SIDE A) COUNTER-EVIDENCE */}
                        <div className={`rounded-2xl p-4 space-y-3 flex flex-col justify-between border-2 ${
                          disputeDetail.hostHasSubmittedEvidence 
                            ? 'bg-emerald-50/50 border-emerald-200/80' 
                            : 'bg-amber-50/50 border-amber-200/80'
                        }`}>
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-slate-800 uppercase flex items-center gap-1.5">
                                Đối chất từ bên A (Đội nhà)
                              </span>
                              <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                                disputeDetail.hostHasSubmittedEvidence 
                                   ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                   : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}>
                                {disputeDetail.hostHasSubmittedEvidence ? 'Đã gửi bằng chứng' : 'Chưa gửi đối chất'}
                              </span>
                            </div>

                            {disputeDetail.hostHasSubmittedEvidence ? (
                              <>
                                <div>
                                  <p className="text-[11px] font-bold text-slate-500 mb-1">Ghi chú đối chất:</p>
                                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-slate-800 leading-relaxed min-h-[60px]">
                                    {disputeDetail.hostEvidenceDescription || 'Không có ghi chú thêm.'}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-[11px] font-bold text-slate-500 mb-1">Ảnh bằng chứng đối chất:</p>
                                  {disputeDetail.hostEvidenceImageUrl ? (
                                    <div 
                                      className="relative group cursor-pointer overflow-hidden rounded-xl border border-emerald-300 bg-black/5 aspect-video max-h-40 flex items-center justify-center"
                                      onClick={() => setPreviewImage(disputeDetail.hostEvidenceImageUrl!)}
                                    >
                                      <img 
                                        src={disputeDetail.hostEvidenceImageUrl} 
                                        alt="Host Evidence" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                                      />
                                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                        Phóng to ảnh
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-3 bg-white/60 border border-slate-200 rounded-xl text-center text-slate-400 italic">
                                      Bên A không tải lên ảnh chụp
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-2">
                                <div className="flex items-center gap-2 text-amber-700 font-bold">
                                  <span>Đội nhà chưa cung cấp bằng chứng đối chất.</span>
                                </div>
                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                  Hệ thống cho phép Đội nhà tối đa 24 giờ kể từ lúc có khiếu nại để bổ sung bằng chứng đối chất.
                                </p>
                                {disputeDetail.isDeadlineExpired ? (
                                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-bold text-[11px] flex items-center gap-1.5">
                                    Đã quá hạn 24 giờ (Tự động xử bên B thắng 0-3 theo quy định)
                                  </div>
                                ) : (
                                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-medium text-[11px]">
                                    Hạn chót gửi đối chất: <span className="font-bold">{formatDate(disputeDetail.counterEvidenceDeadline)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100">
                            {disputeDetail.hostHasSubmittedEvidence 
                              ? `Gửi lúc: ${formatDate(disputeDetail.hostEvidenceCreatedAt)}` 
                              : `Hạn 24h: ${formatDate(disputeDetail.counterEvidenceDeadline)}`}
                          </div>
                        </div>
                      </div>

                      {/* Ruling Actions or Resolution Banner */}
                      {disputeDetail.status === 'RESOLVED' ? (
                        <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300/90 rounded-2xl space-y-3 shadow-xs">
                          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                                ✓
                              </span>
                              <span className="font-extrabold text-emerald-900 text-sm">
                                Kết quả đã được Admin xử lý
                              </span>
                            </div>
                            <span className="text-[11px] text-emerald-700 font-bold bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                              {formatDate(disputeDetail.resolvedAt)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-emerald-200/80">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Tỷ số chốt kết quả</span>
                              <p className="font-black text-lg text-emerald-700">{disputeDetail.resolvedResultJson || '3 - 0'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Trạng thái hồ sơ</span>
                              <p className="font-bold text-xs text-slate-800">Đã chốt kết quả & cập nhật điểm CRP / ELO</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-emerald-900 block">Quyết định / Ghi chú của Admin:</span>
                            <p className="text-slate-700 text-xs leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-100 italic">
                              {disputeDetail.resolutionNote || 'Không có ghi chú thêm.'}
                            </p>
                          </div>

                          {/* Quick Actions to update ticket status */}
                          <div className="pt-3 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 font-medium">Trạng thái ticket hiện tại:</span>
                              <span className={`inline-flex items-center gap-1.5 ${STATUS_CONFIG[selectedTicket.status]?.bg || 'bg-slate-100'} ${STATUS_CONFIG[selectedTicket.status]?.text || 'text-slate-700'} border ${STATUS_CONFIG[selectedTicket.status]?.border || 'border-slate-200'} px-2.5 py-0.5 rounded-full text-[10px] font-bold`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selectedTicket.status]?.dot || 'bg-slate-400'}`} />
                                {STATUS_CONFIG[selectedTicket.status]?.label || selectedTicket.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                                <button
                                  type="button"
                                  onClick={() => handleDirectCloseTicket('RESOLVED', 'Admin xác nhận tranh chấp đã giải quyết xong.')}
                                  disabled={isProcessing}
                                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Đánh dấu Đã giải quyết
                                </button>
                              )}
                              {selectedTicket.status !== 'CLOSED' && (
                                <button
                                  type="button"
                                  onClick={() => handleDirectCloseTicket('CLOSED', 'Admin đã đóng ticket hỗ trợ sau khi phân xử tranh chấp.')}
                                  disabled={isProcessing}
                                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Đóng Ticket này
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 space-y-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Ghi chú xử lý của Admin (tùy chọn):
                            </label>
                            <input
                              type="text"
                              value={adminNoteInput}
                              onChange={(e) => setAdminNoteInput(e.target.value)}
                              placeholder="Nhập ghi chú hoặc lý do xử lý để thông báo cho cả hai đội..."
                              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 shadow-2xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                            {/* Option 1: Rule for Side A */}
                            <button
                              type="button"
                              onClick={() => handleRuling('WIN_A')}
                              disabled={isRuling || isProcessing}
                              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-left shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between disabled:opacity-50"
                            >
                              <div>
                                <p className="font-black text-sm flex items-center gap-1.5">
                                  Xử bên A thắng (3 - 0)
                                </p>
                                <p className="text-[11px] text-emerald-100 font-medium mt-0.5">
                                  Phạt bên B -10 CRP do khiếu nại sai
                                </p>
                              </div>
                              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-2">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </button>

                            {/* Option 2: Rule for Side B */}
                            <button
                              type="button"
                              onClick={() => handleRuling('WIN_B')}
                              disabled={isRuling || isProcessing}
                              className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold text-left shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between disabled:opacity-50"
                            >
                              <div>
                                <p className="font-black text-sm flex items-center gap-1.5">
                                  Xử bên B thắng (0 - 3)
                                </p>
                                <p className="text-[11px] text-rose-100 font-medium mt-0.5">
                                  Phạt bên A -10 CRP do khai gian tỷ số
                                </p>
                              </div>
                              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-2">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </button>

                            {/* Option 3: Rule for Draw */}
                            <button
                              type="button"
                              onClick={() => handleRuling('DRAW')}
                              disabled={isRuling || isProcessing}
                              className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-left shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between disabled:opacity-50"
                            >
                              <div>
                                <p className="font-black text-sm flex items-center gap-1.5">
                                  Xử kết quả hòa (0 - 0)
                                </p>
                                <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                                  Tính điểm hòa, không phạt CRP
                                </p>
                              </div>
                              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-2">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </button>
                          </div>

                          {/* Option 4: Close / Dismiss Duplicate Dispute or Close Ticket */}
                          <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row gap-2">
                            <button
                              type="button"
                              onClick={handleCloseDispute}
                              disabled={isRuling || isProcessing}
                              className="flex-1 p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Đóng khiếu nại (Trùng lặp / Đã xử lý xong)</span>
                            </button>
                            {selectedTicket.status !== 'CLOSED' && (
                              <button
                                type="button"
                                onClick={() => handleDirectCloseTicket('CLOSED')}
                                disabled={isRuling || isProcessing}
                                className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Đóng Ticket</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-3">
                      <p className="font-semibold text-xs">Không tìm thấy chi tiết hồ sơ tranh chấp trận đấu liên kết (hoặc trận đấu đã được xử lý trước đó).</p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDirectCloseTicket('RESOLVED', 'Admin đánh dấu đã giải quyết (Hồ sơ tranh chấp đã hoàn tất).')}
                          disabled={isProcessing}
                          className="rounded-xl text-xs font-bold border-amber-300 hover:bg-amber-100"
                        >
                          Đánh dấu Đã giải quyết
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDirectCloseTicket('CLOSED', 'Admin đóng ticket do hồ sơ đã hoàn tất.')}
                          disabled={isProcessing}
                          className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Đóng Ticket
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  /* 3B. STANDARD SUPPORT TICKET UI */
                  <>
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
                        <div 
                          onClick={() => setPreviewImage(selectedTicket.imageUrl!)}
                          className="cursor-pointer inline-block group"
                        >
                          <img 
                            src={selectedTicket.imageUrl} 
                            alt="Ảnh sự cố" 
                            className="max-h-48 rounded-2xl object-contain border border-slate-200 group-hover:border-brand-emerald group-hover:opacity-95 transition-all bg-black/5"
                          />
                        </div>
                      </div>
                    )}

                    {/* Processing Section */}
                    {selectedTicket.status !== 'CLOSED' && (
                      <div className="pt-4 border-t border-slate-200/80 space-y-3.5">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                            Cập nhật trạng thái ticket:
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
                            <option value="CLOSED">5. Đóng ticket</option>
                            <option value="REJECTED">6. Từ chối / Hủy</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                            Ghi chú phản hồi / lý do xử lý:
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
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-surface-container-low/40 flex items-center justify-between gap-2.5">
                {/* Left: Current Ticket Status */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">Trạng thái:</span>
                  <span className={`inline-flex items-center gap-1.5 ${STATUS_CONFIG[selectedTicket.status]?.bg || 'bg-slate-100'} ${STATUS_CONFIG[selectedTicket.status]?.text || 'text-slate-700'} border ${STATUS_CONFIG[selectedTicket.status]?.border || 'border-slate-200'} px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selectedTicket.status]?.dot || 'bg-slate-400'}`} />
                    {STATUS_CONFIG[selectedTicket.status]?.label || selectedTicket.status}
                  </span>
                </div>

                {/* Right: Modal Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseModal}
                    className="rounded-xl px-4 text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    Thoát cửa sổ
                  </Button>

                  {selectedTicket.status !== 'CLOSED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDirectCloseTicket('CLOSED')}
                      disabled={isProcessing || isRuling}
                      className="rounded-xl px-4 text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                    >
                      🔒 Đóng Ticket
                    </Button>
                  )}

                  {!isMatchDisputeTicket(selectedTicket) && selectedTicket.status !== 'CLOSED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="bg-brand-emerald hover:bg-brand-emerald/90 text-white font-bold rounded-xl px-5 py-2 shadow-sm transition-all cursor-pointer"
                    >
                      {isProcessing ? 'Đang lưu...' : 'Cập nhật trạng thái'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Lightbox Image Zoom Modal */}
        {previewImage && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black shadow-2xl flex flex-col items-center">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-2 rounded-full transition-all z-10 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img 
                src={previewImage} 
                alt="Evidence Full Preview" 
                className="max-h-[85vh] w-auto object-contain rounded-2xl" 
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
