import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

export type SupportTicketStatusType = 
  | 'NEW'
  | 'IN_PROGRESS'
  | 'PENDING_CUSTOMER'
  | 'ESCALATED'
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

const STATUS_CONFIG: Record<SupportTicketStatusType, { label: string; bg: string; text: string; border: string }> = {
  NEW: {
    label: 'Mới tiếp nhận',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  IN_PROGRESS: {
    label: 'Đang xử lý',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  PENDING_CUSTOMER: {
    label: 'Chờ phản hồi',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  ESCALATED: {
    label: 'Đang chuyển tiếp',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  RESOLVED: {
    label: 'Đã giải quyết',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  CLOSED: {
    label: 'Đã đóng',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
  },
  REJECTED: {
    label: 'Đã hủy / Từ chối',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

export const SupportTicketManagement: React.FC = () => {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
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

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      let url = 'http://localhost:8387/api/v1/admin/support-tickets';
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleOpenProcessModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTargetStatusInput(ticket.status || 'IN_PROGRESS');
    setAdminNoteInput(ticket.adminNote || '');
  };

  const handleProcess = async () => {
    if (!selectedTicket) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8387/api/v1/admin/support-tickets/${selectedTicket.id}/process`, {
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
      setSelectedTicket(null);
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

  return (
    <Card className="overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm border border-slate-200/80 rounded-2xl">
      {/* Header Filters & Search */}
      <div className="p-4 border-b border-slate-200/60 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
        {/* Status Tabs Filter */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'NEW', label: '1. Mới' },
            { id: 'IN_PROGRESS', label: '2. Đang xử lý' },
            { id: 'PENDING_CUSTOMER', label: '3. Chờ phản hồi' },
            { id: 'ESCALATED', label: '4. Chuyển tiếp' },
            { id: 'RESOLVED', label: '5. Đã giải quyết' },
            { id: 'CLOSED', label: '6. Đã đóng' },
            { id: 'REJECTED', label: '7. Từ chối/Hủy' }
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm theo mã, tên, email, tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-1.5 w-full bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 pr-9"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-emerald p-1 focus:outline-none cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setTimeout(() => fetchTickets(), 0);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Xóa
            </Button>
          )}
        </form>
      </div>

      {/* Content Table & States */}
      <div className="flex-1 overflow-y-auto matrix-scroll min-h-0">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải danh sách ticket...</span>
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200/50">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Lỗi Tải Dữ Liệu</h3>
            <p className="text-xs text-slate-500 max-w-sm font-semibold">{error}</p>
            <Button variant="primary" onClick={fetchTickets} size="sm" className="mt-2 bg-brand-emerald text-white">
              Thử lại
            </Button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Chưa Có Yêu Cầu Hỗ Trợ</h3>
            <p className="text-xs text-slate-400 font-semibold">Không tìm thấy bất kỳ ticket nào phù hợp.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/50 sticky top-0 backdrop-blur-sm z-10 select-none">
              <tr>
                <th className="px-6 py-3.5">Mã Ticket</th>
                <th className="px-6 py-3.5">Người Yêu Cầu</th>
                <th className="px-6 py-3.5">Loại & Mã Đơn</th>
                <th className="px-6 py-3.5">Tiêu Đề Yêu Cầu</th>
                <th className="px-6 py-3.5">Thời Gian Gửi</th>
                <th className="px-6 py-3.5">Trạng Thái</th>
                <th className="px-6 py-3.5 text-center w-28">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tickets.map((t) => {
                const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.NEW;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                        {t.ticketCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs">{t.userName}</span>
                        <span className="text-[11px] text-slate-400">{t.userEmail}</span>
                        {t.userPhone && <span className="text-[10px] text-slate-400">{t.userPhone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
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
                        <span className="font-semibold text-slate-800 text-xs truncate max-w-xs" title={t.title}>
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
                      <span className={`inline-flex items-center gap-1.5 ${cfg.bg} ${cfg.text} border ${cfg.border} px-2.5 py-1 rounded-full text-[11px] font-bold`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant={t.status === 'NEW' || t.status === 'IN_PROGRESS' ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handleOpenProcessModal(t)}
                        className="text-xs font-bold"
                      >
                        {t.status === 'NEW' ? 'Tiếp nhận' : 'Chi tiết / Xử lý'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Process / Detail Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-brand-emerald/10 text-brand-emerald px-2.5 py-1 rounded-md border border-brand-emerald/20">
                  {selectedTicket.ticketCode}
                </span>
                <h3 className="font-bold text-slate-800 text-sm">Chi Tiết Yêu Cầu Hỗ Trợ</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto matrix-scroll flex-1 text-xs">
              {/* User Info Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{selectedTicket.userName}</p>
                  <p className="text-slate-500">{selectedTicket.userEmail}</p>
                  {selectedTicket.userPhone && <p className="text-slate-400 text-[11px]">{selectedTicket.userPhone}</p>}
                </div>
                <div className="text-right">
                  <span className="inline-block bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded text-[11px]">
                    {selectedTicket.ticketType}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{formatDate(selectedTicket.createdAt)}</p>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-slate-500 font-bold mb-1 text-[11px] uppercase tracking-wider">Tiêu Đề Yêu Cầu</label>
                <p className="font-bold text-slate-800 text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedTicket.title}
                </p>
              </div>

              {selectedTicket.bookingCode && (
                <div>
                  <label className="block text-slate-500 font-bold mb-1 text-[11px] uppercase tracking-wider">Mã Đơn Đặt Hàng Liên Quan</label>
                  <p className="font-mono font-bold text-brand-emerald bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                    {selectedTicket.bookingCode}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-bold mb-1 text-[11px] uppercase tracking-wider">Mô Tả Chi Tiết Sự Cố</label>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Proof Image if present */}
              {selectedTicket.imageUrl && !selectedTicket.imageUrl.startsWith('blob:') && (() => {
                const images = selectedTicket.imageUrl.split(',').map((s) => s.trim()).filter(Boolean);
                if (images.length === 0) return null;
                return (
                  <div>
                    <label className="block text-slate-500 font-bold mb-1 text-[11px] uppercase tracking-wider">
                      Ảnh Bằng Chứng Đính Kèm ({images.length} ảnh)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((url, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-36 flex items-center justify-center">
                          <img 
                            src={url} 
                            alt={`Ảnh bằng chứng ${idx + 1}`} 
                            className="w-full h-36 object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(url, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic">* Bấm vào ảnh để mở ảnh kích thước lớn trong tab mới.</p>
                  </div>
                );
              })()}

              {/* Status Selector */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Cập Nhật Trạng Thái Ticket:
                </label>
                <select
                  value={targetStatusInput}
                  onChange={(e) => setTargetStatusInput(e.target.value as SupportTicketStatusType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 cursor-pointer"
                >
                  <option value="NEW">1. Mới tiếp nhận (Hàng đợi)</option>
                  <option value="IN_PROGRESS">2. Đang xử lý</option>
                  <option value="PENDING_CUSTOMER">3. Chờ người dùng phản hồi</option>
                  <option value="ESCALATED">4. Chuyển tiếp kỹ thuật/đối tác</option>
                  <option value="RESOLVED">5. Đã giải quyết (chờ người dùng xác nhận)</option>
                  <option value="CLOSED">6. Đã đóng hoàn tất</option>
                  <option value="REJECTED">7. Đã hủy / Từ chối</option>
                </select>
              </div>

              {/* Admin Feedback Note Input */}
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                  Ghi Chú Phản Hồi / Lý Do Xử Lý:
                </label>
                <textarea
                  rows={3}
                  placeholder="Nhập ghi chú phản hồi hoặc hướng dẫn xử lý cho người dùng..."
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10"
                />
              </div>

              {selectedTicket.processedBy && (
                <div className="text-[11px] text-slate-400 flex flex-col gap-0.5 pt-1 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Người xử lý gần nhất: <strong>{selectedTicket.processedBy}</strong></span>
                    <span>Cập nhật: {formatDate(selectedTicket.updatedAt)}</span>
                  </div>
                  {selectedTicket.resolvedAt && <span>Đã giải quyết lúc: {formatDate(selectedTicket.resolvedAt)}</span>}
                  {selectedTicket.closedAt && <span>Đã đóng lúc: {formatDate(selectedTicket.closedAt)}</span>}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTicket(null)}
                disabled={isProcessing}
              >
                Đóng
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleProcess}
                disabled={isProcessing}
                className="bg-brand-emerald hover:bg-brand-emerald/90 text-white font-bold"
              >
                {isProcessing ? 'Đang cập nhật...' : 'Cập Nhật Trạng Thái'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
