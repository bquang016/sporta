import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// Subcomponents imports
import { TransactionKpis } from '@/components/transactions/TransactionKpis';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

type PaymentMethod = 'MOMO' | 'VNPAY' | 'BANK_TRANSFER';
type TransactionStatus = 'SUCCESS' | 'FAILED' | 'REFUNDING' | 'REFUNDED';

interface Transaction {
  id: string;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  facilityCluster: string;
  courtName: string;
  sportType: string;
  bookingDate: string;
  bookingSlot: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdAt: string;
  reason?: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA (15 High-Fidelity Records)
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TRX-982731",
    playerName: "Nguyễn Văn Hùng",
    playerEmail: "hung.nv@gmail.com",
    playerPhone: "0912345678",
    facilityCluster: "Sân Bóng Đá Chảo Lửa",
    courtName: "Sân số 1 (5 người)",
    sportType: "Bóng Đá",
    bookingDate: "2026-07-15",
    bookingSlot: "18:00 - 19:30",
    amount: 350000,
    paymentMethod: "MOMO",
    status: "SUCCESS",
    createdAt: "2026-07-12T09:12:00Z"
  },
  {
    id: "TRX-102948",
    playerName: "Trần Thị Lan",
    playerEmail: "lan.tt@yahoo.com",
    playerPhone: "0987654321",
    facilityCluster: "Cụm Sân Cầu Lông Tân Phú",
    courtName: "Sân số 3",
    sportType: "Cầu Lông",
    bookingDate: "2026-07-14",
    bookingSlot: "19:00 - 21:00",
    amount: 160000,
    paymentMethod: "VNPAY",
    status: "SUCCESS",
    createdAt: "2026-07-12T08:45:00Z"
  },
  {
    id: "TRX-384729",
    playerName: "Phan Văn Nam",
    playerEmail: "nam.pv@hotmail.com",
    playerPhone: "0933445566",
    facilityCluster: "Sân Tennis Quận 7",
    courtName: "Sân A (Mái che)",
    sportType: "Tennis",
    bookingDate: "2026-07-13",
    bookingSlot: "16:00 - 18:00",
    amount: 500000,
    paymentMethod: "BANK_TRANSFER",
    status: "REFUNDING",
    createdAt: "2026-07-12T07:30:00Z",
    reason: "Hủy đặt sân do trời mưa to giông bão, chủ sân đã xác nhận đồng ý hoàn tiền đặt cọc cho khách hàng."
  },
  {
    id: "TRX-582910",
    playerName: "Lê Minh Hoàng",
    playerEmail: "hoang.lm@gmail.com",
    playerPhone: "0905123456",
    facilityCluster: "Sân Bóng Đá Chảo Lửa",
    courtName: "Sân số 2 (7 người)",
    sportType: "Bóng Đá",
    bookingDate: "2026-07-16",
    bookingSlot: "20:30 - 22:00",
    amount: 600000,
    paymentMethod: "MOMO",
    status: "FAILED",
    createdAt: "2026-07-11T15:20:00Z",
    reason: "Thanh toán thất bại: Hết hạn thời gian giao dịch trên cổng Momo."
  },
  {
    id: "TRX-284910",
    playerName: "Phạm Thanh Thảo",
    playerEmail: "thao.pt@outlook.com",
    playerPhone: "0944556677",
    facilityCluster: "Cụm Sân Cầu Lông Tân Phú",
    courtName: "Sân số 1",
    sportType: "Cầu Lông",
    bookingDate: "2026-07-15",
    bookingSlot: "08:00 - 10:00",
    amount: 160000,
    paymentMethod: "VNPAY",
    status: "SUCCESS",
    createdAt: "2026-07-11T14:10:00Z"
  },
  {
    id: "TRX-748102",
    playerName: "Đỗ Anh Tuấn",
    playerEmail: "tuan.da@gmail.com",
    playerPhone: "0977889900",
    facilityCluster: "Khu Phức Hợp Thể Thao Rạch Chiếc",
    courtName: "Sân Futsal Trong Nhà",
    sportType: "Bóng Đá",
    bookingDate: "2026-07-18",
    bookingSlot: "17:00 - 19:00",
    amount: 800000,
    paymentMethod: "BANK_TRANSFER",
    status: "SUCCESS",
    createdAt: "2026-07-11T11:05:00Z"
  },
  {
    id: "TRX-492019",
    playerName: "Vũ Thị Mai",
    playerEmail: "mai.vt@gmail.com",
    playerPhone: "0911223344",
    facilityCluster: "Sân Tennis Quận 7",
    courtName: "Sân B",
    sportType: "Tennis",
    bookingDate: "2026-07-14",
    bookingSlot: "18:00 - 20:00",
    amount: 450000,
    paymentMethod: "MOMO",
    status: "REFUNDED",
    createdAt: "2026-07-10T16:40:00Z",
    reason: "Hoàn tiền thành công: Khách hủy lịch trước 48h theo đúng quy định hoàn trả của sân bãi.",
    updatedAt: "2026-07-11T09:00:00Z"
  },
  {
    id: "TRX-839201",
    playerName: "Nguyễn Hoàng Nam",
    playerEmail: "nam.nh@gmail.com",
    playerPhone: "0966778899",
    facilityCluster: "Khu Phức Hợp Thể Thao Rạch Chiếc",
    courtName: "Sân Tennis Ngoài Trời",
    sportType: "Tennis",
    bookingDate: "2026-07-17",
    bookingSlot: "06:00 - 08:00",
    amount: 400000,
    paymentMethod: "VNPAY",
    status: "SUCCESS",
    createdAt: "2026-07-10T10:15:00Z"
  },
  {
    id: "TRX-194820",
    playerName: "Bùi Quốc Khánh",
    playerEmail: "khanh.bq@gmail.com",
    playerPhone: "0909090909",
    facilityCluster: "Sân Bóng Đá Chảo Lửa",
    courtName: "Sân số 3 (5 người)",
    sportType: "Bóng Đá",
    bookingDate: "2026-07-15",
    bookingSlot: "19:30 - 21:00",
    amount: 350000,
    paymentMethod: "BANK_TRANSFER",
    status: "SUCCESS",
    createdAt: "2026-07-09T21:30:00Z"
  },
  {
    id: "TRX-629104",
    playerName: "Ngô Hoàng Gia",
    playerEmail: "gia.nh@gmail.com",
    playerPhone: "0911999888",
    facilityCluster: "Cụm Sân Cầu Lông Tân Phú",
    courtName: "Sân số 4",
    sportType: "Cầu Lông",
    bookingDate: "2026-07-13",
    bookingSlot: "17:00 - 19:00",
    amount: 160000,
    paymentMethod: "MOMO",
    status: "SUCCESS",
    createdAt: "2026-07-09T18:22:00Z"
  },
  {
    id: "TRX-305918",
    playerName: "Hoàng Đức Thịnh",
    playerEmail: "thinh.hd@gmail.com",
    playerPhone: "0922334455",
    facilityCluster: "Khu Phức Hợp Thể Thao Rạch Chiếc",
    courtName: "Sân Futsal Trong Nhà",
    sportType: "Bóng Đá",
    bookingDate: "2026-07-20",
    bookingSlot: "20:00 - 22:00",
    amount: 800000,
    paymentMethod: "BANK_TRANSFER",
    status: "FAILED",
    createdAt: "2026-07-09T10:00:00Z",
    reason: "Giao dịch thất bại: Lỗi kết nối cổng thanh toán ngân hàng."
  },
  {
    id: "TRX-591829",
    playerName: "Lý Hải Đăng",
    playerEmail: "dang.lh@gmail.com",
    playerPhone: "0938383838",
    facilityCluster: "Sân Bóng Đá Chảo Lửa",
    courtName: "Sân số 1 (5 người)",
    sportType: "Bóng Đá",
    bookingDate: "2026-07-14",
    bookingSlot: "17:00 - 18:30",
    amount: 350000,
    paymentMethod: "MOMO",
    status: "SUCCESS",
    createdAt: "2026-07-08T15:30:00Z"
  },
  {
    id: "TRX-827394",
    playerName: "Đặng Hồng Nhung",
    playerEmail: "nhung.dh@gmail.com",
    playerPhone: "0988112233",
    facilityCluster: "Sân Tennis Quận 7",
    courtName: "Sân B",
    sportType: "Tennis",
    bookingDate: "2026-07-12",
    bookingSlot: "15:00 - 17:00",
    amount: 450000,
    paymentMethod: "VNPAY",
    status: "SUCCESS",
    createdAt: "2026-07-08T11:20:00Z"
  },
  {
    id: "TRX-910482",
    playerName: "Nguyễn Lâm Oanh",
    playerEmail: "oanh.nl@gmail.com",
    playerPhone: "0977443322",
    facilityCluster: "Cụm Sân Cầu Lông Tân Phú",
    courtName: "Sân số 2",
    sportType: "Cầu Lông",
    bookingDate: "2026-07-16",
    bookingSlot: "18:00 - 20:00",
    amount: 160000,
    paymentMethod: "BANK_TRANSFER",
    status: "SUCCESS",
    createdAt: "2026-07-07T14:40:00Z"
  },
  {
    id: "TRX-204810",
    playerName: "Tạ Minh Trí",
    playerEmail: "tri.tm@gmail.com",
    playerPhone: "0909123987",
    facilityCluster: "Khu Phức Hợp Thể Thao Rạch Chiếc",
    courtName: "Sân Tennis Ngoài Trời",
    sportType: "Tennis",
    bookingDate: "2026-07-19",
    bookingSlot: "08:00 - 10:00",
    amount: 400000,
    paymentMethod: "MOMO",
    status: "SUCCESS",
    createdAt: "2026-07-07T09:15:00Z"
  }
];

// Items per page
const PAGE_SIZE = 6;

export const TransactionManagement: React.FC = () => {
  const { showToast } = useToast();
  
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
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
    const clusters = transactions.map(tx => tx.facilityCluster);
    return Array.from(new Set(clusters));
  }, [transactions]);

  // Simulate loading spinner when filter parameters or paging changes (premium feel)
  const triggerFakeLoading = () => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  };

  // Watch filter state updates to reset paging and show loading
  useEffect(() => {
    setCurrentPage(1);
    triggerFakeLoading();
  }, [searchQuery, selectedCluster, selectedStatus, startDate, endDate]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll inside table container to top on page change
    const tableContainer = document.getElementById('table-scroll-container');
    if (tableContainer) {
      tableContainer.scrollTop = 0;
    }
    triggerFakeLoading();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FILTERING LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        tx.id.toLowerCase().includes(q) ||
        tx.playerName.toLowerCase().includes(q) ||
        tx.playerEmail.toLowerCase().includes(q) ||
        tx.courtName.toLowerCase().includes(q) ||
        tx.facilityCluster.toLowerCase().includes(q);

      const matchesCluster = !selectedCluster || tx.facilityCluster === selectedCluster;
      const matchesStatus = !selectedStatus || tx.status === selectedStatus;

      const matchesStartDate = !startDate || new Date(tx.bookingDate) >= new Date(startDate);
      const matchesEndDate = !endDate || new Date(tx.bookingDate) <= new Date(endDate);

      return matchesSearch && matchesCluster && matchesStatus && matchesStartDate && matchesEndDate;
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
    const totalRefunded = refundedTx.reduce((acc, curr) => acc + curr.amount, 0);
    
    const rateDenominator = totalTransactionsCount - failedTx.length;
    const successRate = rateDenominator > 0 
      ? ((successTx.length / rateDenominator) * 100).toFixed(1) 
      : "100.0";

    return {
      revenue: totalRevenue,
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
        return <Badge variant="success">Thành công</Badge>;
      case 'REFUNDING':
        return <Badge variant="warning">Đang hoàn tiền</Badge>;
      case 'REFUNDED':
        return <Badge variant="info">Đã hoàn tiền</Badge>;
      case 'FAILED':
        return <Badge variant="error">Thất bại</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'MOMO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-pink-50 text-pink-600 border border-pink-100 shadow-sm select-none">
            Momo
          </span>
        );
      case 'VNPAY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 shadow-sm select-none">
            VNPAY
          </span>
        );
      case 'BANK_TRANSFER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-brand-emerald border border-emerald-100 shadow-sm select-none">
            Chuyển khoản
          </span>
        );
      default:
        return <span className="text-[10px] font-semibold text-slate-500">{method}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col flex-1 min-h-0">
      
      {/* Title & Info Section */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-background">Lịch Sử Đặt Sân & Giao Dịch</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Giám sát dòng tiền, theo dõi khối lượng đặt lịch và xử lý khiếu nại/hoàn tiền.</p>
        </div>
      </div>

      {/* KPI Cards Component */}
      <TransactionKpis
        revenue={kpis.revenue}
        bookingsCount={kpis.bookingsCount}
        successRate={kpis.successRate}
        refunded={kpis.refunded}
        formatCurrency={formatCurrency}
      />

      {/* Filter and Table Card */}
      <Card className="overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm border border-slate-200/80 rounded-2xl">
        
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
        <div id="table-scroll-container" className="flex-1 overflow-y-auto matrix-scroll min-h-0">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner size="lg" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tìm kiếm giao dịch...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
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
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/50 sticky top-0 backdrop-blur-sm z-10 select-none">
                <tr>
                  <th className="px-6 py-3.5">Mã Giao Dịch</th>
                  <th className="px-6 py-3.5">Khách Hàng</th>
                  <th className="px-6 py-3.5">Cụm Sân</th>
                  <th className="px-6 py-3.5">Ngày Chơi</th>
                  <th className="px-6 py-3.5">Thanh Toán</th>
                  <th className="px-6 py-3.5">Giá Trị</th>
                  <th className="px-6 py-3.5">Trạng Thái</th>
                  <th className="px-6 py-3.5 text-center w-24">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-800">#{tx.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">{tx.playerName}</span>
                        <span className="text-xs text-slate-400 font-medium font-mono">{tx.playerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">{tx.facilityCluster}</span>
                        <span className="text-xs text-slate-500 font-bold">{tx.courtName} ({tx.sportType})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-700">
                          {new Date(tx.bookingDate).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">{tx.bookingSlot}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getPaymentMethodBadge(tx.paymentMethod)}</td>
                    <td className="px-6 py-4 font-black text-slate-800">{formatCurrency(tx.amount)}</td>
                    <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTx(tx);
                          setIsDetailOpen(true);
                        }}
                        className="text-brand-emerald hover:bg-emerald-50 hover:text-emerald-800 font-bold py-1.5 px-3 rounded-lg border border-brand-emerald/10 shadow-sm"
                      >
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200/60 flex items-center justify-between bg-slate-50/20 shrink-0 select-none">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredTransactions.length)} trong {filteredTransactions.length} giao dịch
          </span>
          <div className="flex gap-2">
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
                    ? 'bg-brand-emerald text-white'
                    : 'text-slate-500 hover:bg-slate-100'
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
