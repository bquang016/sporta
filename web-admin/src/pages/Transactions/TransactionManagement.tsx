import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// Subcomponents imports
import { TransactionKpis } from '@/components/transactions/TransactionKpis';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal';
import { getAdminTransactions, type AdminTransaction } from '@/api/adminTransactionApi';
import { exportTransactionsToExcel, exportAdminReportPdf } from '@/utils/exportAdminUtils';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

type PaymentMethod = 'MOMO' | 'VNPAY' | 'BANK_TRANSFER' | 'PAYOS' | 'WALLET' | 'DEV' | 'CASH' | string;
type TransactionStatus = 'SUCCESS' | 'FAILED' | 'REFUNDING' | 'REFUNDED' | 'PENDING';

type Transaction = AdminTransaction & {
  updatedAt?: string;
};

// Items per page
const PAGE_SIZE = 15;

export const TransactionManagement: React.FC = () => {
  const { showToast } = useToast();
  
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTransactions = () => {
    setIsLoading(true);
    getAdminTransactions()
      .then((data) => {
        if (data && data.length > 0) {
          setTransactions(data);
        } else {
          setTransactions([]);
        }
      })
      .catch((err) => {
        console.warn('Lỗi khi tải danh sách giao dịch từ server:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Paging states
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Action details state
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Dispute & Refund Confirmation Modal States
  const [isConfirmRefundRequestOpen, setIsConfirmRefundRequestOpen] = useState<boolean>(false);
  const [isConfirmRefundCompleteOpen, setIsConfirmRefundCompleteOpen] = useState<boolean>(false);
  const [isConfirmRefundRejectOpen, setIsConfirmRefundRejectOpen] = useState<boolean>(false);
  
  const [refundReason, setRefundReason] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  
  const [isActionProcessing, setIsActionProcessing] = useState<boolean>(false);

  // Extract unique facility clusters for filter dropdown
  const uniqueClusters = useMemo(() => {
    const clusters = transactions.map(tx => tx.facilityCluster).filter(Boolean);
    return Array.from(new Set(clusters));
  }, [transactions]);

  // Watch filter state updates to reset paging
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCluster, selectedStatus, startDate, endDate]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FILTERING & SORTING LOGIC (Newest First)
  // ─────────────────────────────────────────────────────────────────────────────
  
  const filteredTransactions = useMemo(() => {
    const list = transactions.filter(tx => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        tx.id.toLowerCase().includes(q) ||
        tx.playerName.toLowerCase().includes(q) ||
        tx.playerEmail.toLowerCase().includes(q) ||
        tx.playerPhone.toLowerCase().includes(q) ||
        tx.courtName.toLowerCase().includes(q) ||
        tx.facilityCluster.toLowerCase().includes(q);

      const matchesCluster = !selectedCluster || tx.facilityCluster === selectedCluster;
      const matchesStatus = !selectedStatus || tx.status === selectedStatus;

      const matchesStartDate = !startDate || new Date(tx.bookingDate) >= new Date(startDate);
      const matchesEndDate = !endDate || new Date(tx.bookingDate) <= new Date(endDate);

      return matchesSearch && matchesCluster && matchesStatus && matchesStartDate && matchesEndDate;
    });

    // Luôn sắp xếp các đơn hàng mới nhất lên đầu tiên
    return list.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.bookingDate).getTime() || 0;
      const dateB = new Date(b.createdAt || b.bookingDate).getTime() || 0;
      return dateB - dateA;
    });
  }, [transactions, searchQuery, selectedCluster, selectedStatus, startDate, endDate]);

  // ─────────────────────────────────────────────────────────────────────────────
  // METRICS COMPUTATION
  // ─────────────────────────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const totalTransactionsCount = transactions.length;
    const successTx = transactions.filter(t => t.status === 'SUCCESS');
    const refundedTx = transactions.filter(t => t.status === 'REFUNDED');
    const failedTx = transactions.filter(t => t.status === 'FAILED');

    const totalRevenue = successTx.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCommission = transactions.reduce((acc, curr) => {
      const comm = curr.commissionAmount ?? (curr.status === 'SUCCESS' ? Math.round(curr.amount * 0.10) : 0);
      return acc + comm;
    }, 0);
    const totalRefunded = refundedTx.reduce((acc, curr) => acc + (curr.refundAmount || curr.amount), 0);
    
    const rateDenominator = totalTransactionsCount - failedTx.length;
    const successRate = rateDenominator > 0 
      ? ((successTx.length / rateDenominator) * 100).toFixed(1) 
      : "100.0";

    return {
      revenue: totalRevenue,
      totalCommission: totalCommission,
      bookingsCount: totalTransactionsCount,
      successRate: successRate,
      refunded: totalRefunded
    };
  }, [transactions]);

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGINATION COMPUTATION
  // ─────────────────────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE) || 1;
  
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredTransactions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredTransactions, currentPage]);

  // ─────────────────────────────────────────────────────────────────────────────
  // MANUAL RESOLUTIONS / OVERRIDES (Admin actions)
  // ─────────────────────────────────────────────────────────────────────────────

  const handleTriggerRefundRequest = () => {
    if (!selectedTx) return;
    if (!refundReason.trim()) {
      showToast('warning', 'Vui lòng nhập lý do hoàn trả tiền giao dịch.');
      return;
    }

    setIsActionProcessing(true);
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => {
        if (tx.id === selectedTx.id) {
          const updated: Transaction = {
            ...tx,
            status: 'REFUNDING',
            reason: `Yêu cầu hoàn trả thủ công bởi Admin: ${refundReason.trim()}`,
            updatedAt: new Date().toISOString()
          };
          setSelectedTx(updated);
          return updated;
        }
        return tx;
      }));

      showToast('success', `Đã chuyển đổi giao dịch "${selectedTx.id}" sang trạng thái Yêu cầu hoàn tiền.`);
      setIsConfirmRefundRequestOpen(false);
      setRefundReason('');
      setIsActionProcessing(false);
    }, 500);
  };

  const handleConfirmRefundComplete = () => {
    if (!selectedTx) return;

    setIsActionProcessing(true);
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => {
        if (tx.id === selectedTx.id) {
          const updated: Transaction = {
            ...tx,
            status: 'REFUNDED',
            reason: `${tx.reason || ''} | Đã hoàn trả tiền thành công thủ công bởi Admin.`,
            updatedAt: new Date().toISOString()
          };
          setSelectedTx(updated);
          return updated;
        }
        return tx;
      }));

      showToast('success', `Đã xác nhận hoàn trả tiền thành công cho mã giao dịch "${selectedTx.id}".`);
      setIsConfirmRefundCompleteOpen(false);
      setIsActionProcessing(false);
    }, 500);
  };

  const handleRejectRefundRequest = () => {
    if (!selectedTx) return;
    if (!rejectReason.trim()) {
      showToast('warning', 'Vui lòng nhập lý do từ chối yêu cầu hoàn tiền.');
      return;
    }

    setIsActionProcessing(true);
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => {
        if (tx.id === selectedTx.id) {
          const updated: Transaction = {
            ...tx,
            status: 'SUCCESS',
            reason: `Yêu cầu hoàn tiền bị từ chối bởi Admin. Lý do: ${rejectReason.trim()}`,
            updatedAt: new Date().toISOString()
          };
          setSelectedTx(updated);
          return updated;
        }
        return tx;
      }));

      showToast('success', `Đã từ chối hoàn tiền cho giao dịch "${selectedTx.id}". Giao dịch trở lại trạng thái Thành công.`);
      setIsConfirmRefundRejectOpen(false);
      setRejectReason('');
      setIsActionProcessing(false);
    }, 500);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
            Thành công
          </span>
        );
      case 'REFUNDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Đang hoàn tiền
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
            Đã hoàn tiền
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Thất bại
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Đang chờ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 select-none">
            {status}
          </span>
        );
    }
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const m = (method || '').toUpperCase();
    switch (m) {
      case 'DEV':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-purple-100/80 text-purple-700 border border-purple-200 shadow-2xs select-none">
            DEV TEST
          </span>
        );
      case 'PAYOS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-100/80 text-blue-700 border border-blue-200 shadow-2xs select-none">
            PayOS QR
          </span>
        );
      case 'WALLET':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-100/80 text-emerald-800 border border-emerald-200 shadow-2xs select-none">
            Ví Sporta
          </span>
        );
      case 'MOMO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-pink-100/80 text-pink-700 border border-pink-200 shadow-2xs select-none">
            Momo
          </span>
        );
      case 'VNPAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-sky-100/80 text-sky-700 border border-sky-200 shadow-2xs select-none">
            VNPay
          </span>
        );
      case 'CASH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-100/80 text-amber-800 border border-amber-200 shadow-2xs select-none">
            Tiền mặt
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 select-none">
            {method}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* Title & Info Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-background">Lịch Sử Đặt Sân & Giao Dịch</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Giám sát toàn bộ dòng tiền, hoa hồng nền tảng 10% và giải quyết khiếu nại hoàn tiền.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => exportTransactionsToExcel(filteredTransactions)}
            disabled={isLoading || filteredTransactions.length === 0}
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-brand-emerald border border-emerald-200/80 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Xuất Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const kpiList = [
                { label: 'Tổng Doanh Thu GMV', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kpis.revenue) },
                { label: 'Hoa Hồng Sàn 10%', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kpis.totalCommission) },
                { label: 'Tổng Lượt Đặt', value: `${kpis.bookingsCount} đơn` },
                { label: 'Tỷ Lệ Thành Công', value: `${kpis.successRate}%` }
              ];
              exportAdminReportPdf('BÁO CÁO DÒNG TIỀN VÀ ĐỐI SOÁT', 'DANH SÁCH GIAO DỊCH VÀ PHÍ HOA HỒNG SÀN 10%', kpiList, filteredTransactions);
            }}
            disabled={isLoading || filteredTransactions.length === 0}
            className="flex items-center gap-2 bg-primary text-white hover:bg-emerald-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>In / Export PDF</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={isLoading}
            className="font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            {isLoading ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}
          </Button>
        </div>
      </div>

      {/* KPI Cards Component */}
      <TransactionKpis
        revenue={kpis.revenue}
        totalCommission={kpis.totalCommission}
        bookingsCount={kpis.bookingsCount}
        successRate={kpis.successRate}
        refunded={kpis.refunded}
        formatCurrency={formatCurrency}
      />

      {/* Filter and Table Card */}
      <Card className="shadow-sm border border-slate-200/80 rounded-2xl bg-white overflow-hidden">
        
        {/* Filters & Searching Component */}
        <TransactionFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCluster={selectedCluster}
          setSelectedCluster={setSelectedCluster}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          uniqueClusters={uniqueClusters}
        />

        {/* 3 States Management (Loading, Empty, Data) */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner size="lg" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu giao dịch...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center p-6">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Không Tìm Thấy Kết Quả</h3>
              <p className="text-xs text-slate-400 font-semibold max-w-sm">Không tìm thấy bất kỳ giao dịch nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200/70 select-none">
                <tr>
                  <th className="px-5 py-3.5">Mã Đơn</th>
                  <th className="px-5 py-3.5">Khách Hàng</th>
                  <th className="px-5 py-3.5">Cụm Sân & Chi Tiết</th>
                  <th className="px-5 py-3.5">Thời Gian Chơi</th>
                  <th className="px-5 py-3.5">Phương Thức</th>
                  <th className="px-5 py-3.5 text-right">Tổng Tiền</th>
                  <th className="px-5 py-3.5 text-right text-amber-700 bg-amber-50/40">Hoa Hồng (10%)</th>
                  <th className="px-5 py-3.5 text-right text-emerald-800 bg-emerald-50/40">Chủ Sân (90%)</th>
                  <th className="px-5 py-3.5 text-center">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-center w-24">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedTransactions.map((tx) => {
                  const comm = tx.commissionAmount ?? Math.round(tx.amount * 0.10);
                  const owner = tx.ownerAmount ?? (tx.amount - comm);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-black text-slate-800 font-mono text-xs">#{tx.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800">{tx.playerName}</span>
                          <span className="text-[11px] text-slate-400 font-medium font-mono">{tx.playerPhone || tx.playerEmail}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800">{tx.facilityCluster}</span>
                          <span className="text-xs text-slate-500 font-semibold">{tx.courtName} ({tx.sportType})</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-700">
                            {tx.bookingDate}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{tx.bookingSlot}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">{getPaymentMethodBadge(tx.paymentMethod)}</td>
                      <td className="px-5 py-4 text-right font-black text-slate-800">{formatCurrency(tx.amount)}</td>
                      <td className="px-5 py-4 text-right font-black text-amber-600 bg-amber-50/20">+{formatCurrency(comm)}</td>
                      <td className="px-5 py-4 text-right font-black text-emerald-700 bg-emerald-50/20">+{formatCurrency(owner)}</td>
                      <td className="px-5 py-4 text-center">{getStatusBadge(tx.status)}</td>
                      <td className="px-5 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTx(tx);
                            setIsDetailOpen(true);
                          }}
                          className="text-brand-emerald hover:bg-emerald-50 hover:text-emerald-800 font-bold py-1 px-2.5 rounded-lg border border-brand-emerald/20 shadow-2xs"
                        >
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30 select-none">
          <span className="text-xs text-slate-500 font-bold">
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredTransactions.length)} trong tổng số {filteredTransactions.length} giao dịch
          </span>
          {totalPages > 1 && (
            <div className="flex gap-1.5 items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="text-xs font-bold py-1 px-3 border border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  disabled={isLoading}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                    currentPage === p
                      ? 'bg-brand-emerald text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="text-xs font-bold py-1 px-3 border border-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Transaction Details Modal Component */}
      <TransactionDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTx(null);
        }}
        selectedTx={selectedTx}
        formatCurrency={formatCurrency}
        getStatusBadge={getStatusBadge}
        getPaymentMethodBadge={getPaymentMethodBadge}
        onRefundRequest={() => setIsConfirmRefundRequestOpen(true)}
        onRefundComplete={() => setIsConfirmRefundCompleteOpen(true)}
        onRefundReject={() => setIsConfirmRefundRejectOpen(true)}
      />

      {/* ─────────────────────────────────────────────────────────────────────────────
          CONFIRM ACTION DIALOGS
          ───────────────────────────────────────────────────────────────────────────── */}
      
      {/* 1. Modal trigger Refund Request */}
      <ConfirmModal
        isOpen={isConfirmRefundRequestOpen}
        onClose={() => {
          setIsConfirmRefundRequestOpen(false);
          setRefundReason('');
        }}
        onConfirm={handleTriggerRefundRequest}
        title="Xác nhận yêu cầu hoàn tiền"
        message={`Bạn đang kích hoạt trạng thái HOÀN TIỀN THỦ CÔNG cho giao dịch #${selectedTx?.id} của khách hàng ${selectedTx?.playerName}.`}
        confirmText={isActionProcessing ? "Đang xử lý..." : "Kích hoạt hoàn tiền"}
        cancelText="Hủy bỏ"
        variant="warning"
      />
      {isConfirmRefundRequestOpen && (
        <div className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xl w-full max-w-sm mx-4 translate-y-16 pointer-events-auto">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider pl-0.5 block mb-1">
              Nhập lý do hoàn trả tiền <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Trời mưa to, chủ sân và khách hàng đồng ý hủy..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-brand-emerald focus:bg-white transition-all"
              disabled={isActionProcessing}
            />
          </div>
        </div>
      )}

      {/* 2. Modal confirm Refund Complete */}
      <ConfirmModal
        isOpen={isConfirmRefundCompleteOpen}
        onClose={() => setIsConfirmRefundCompleteOpen(false)}
        onConfirm={handleConfirmRefundComplete}
        title="Xác nhận Đã hoàn trả tiền"
        message={`Bạn xác nhận giao dịch #${selectedTx?.id} đã được hoàn trả thành công số tiền ${formatCurrency(selectedTx?.amount || 0)} về tài khoản của khách hàng?`}
        confirmText={isActionProcessing ? "Đang xác nhận..." : "Xác nhận hoàn thành"}
        cancelText="Hủy bỏ"
        variant="success"
      />

      {/* 3. Modal confirm Refund Reject */}
      <ConfirmModal
        isOpen={isConfirmRefundRejectOpen}
        onClose={() => {
          setIsConfirmRefundRejectOpen(false);
          setRejectReason('');
        }}
        onConfirm={handleRejectRefundRequest}
        title="Từ chối hoàn tiền giao dịch"
        message={`Bạn đang từ chối yêu cầu hoàn tiền của giao dịch #${selectedTx?.id}. Giao dịch sẽ quay trở về trạng thái Thành công.`}
        confirmText={isActionProcessing ? "Đang xử lý..." : "Từ chối hoàn tiền"}
        cancelText="Quay lại"
        variant="danger"
      />
      {isConfirmRefundRejectOpen && (
        <div className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xl w-full max-w-sm mx-4 translate-y-16 pointer-events-auto">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider pl-0.5 block mb-1">
              Lý do từ chối yêu cầu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Khách hàng yêu cầu hủy trễ giờ quy định..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-brand-emerald focus:bg-white transition-all"
              disabled={isActionProcessing}
            />
          </div>
        </div>
      )}

    </div>
  );
};
