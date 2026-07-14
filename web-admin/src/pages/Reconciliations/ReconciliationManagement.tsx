import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// Subcomponents
import { ReconciliationKpis } from '@/components/reconciliations/ReconciliationKpis';
import { ReconciliationFilters } from '@/components/reconciliations/ReconciliationFilters';
import { ReconciliationTable } from '@/components/reconciliations/ReconciliationTable';
import type { ReconciliationRecord } from '@/components/reconciliations/ReconciliationTable';
import { ReconciliationDetailModal } from '@/components/reconciliations/ReconciliationDetailModal';

// Mock Data
const INITIAL_RECONCILIATIONS: ReconciliationRecord[] = [
  {
    id: "REC-2026-W27-01",
    ownerName: "Nguyễn Văn Hùng",
    ownerEmail: "hung.nv@gmail.com",
    facilityCluster: "Sân Bóng Đá Chảo Lửa",
    bankName: "MB Bank",
    bankAccountNo: "0912345678",
    bankAccountName: "NGUYEN VAN HUNG",
    cycle: "Tuần 27 (06/07/2026 - 12/07/2026)",
    grossAmount: 2100000,
    commissionRate: 0.10,
    commissionAmount: 210000,
    netPayoutAmount: 1890000,
    status: "PENDING"
  },
  {
    id: "REC-2026-W27-02",
    ownerName: "Trần Thị Lan",
    ownerEmail: "lan.tt@yahoo.com",
    facilityCluster: "Cụm Sân Cầu Lông Tân Phú",
    bankName: "Techcombank",
    bankAccountNo: "190284710294",
    bankAccountName: "TRAN THI LAN",
    cycle: "Tuần 27 (06/07/2026 - 12/07/2026)",
    grossAmount: 1600000,
    commissionRate: 0.10,
    commissionAmount: 160000,
    netPayoutAmount: 1440000,
    status: "PENDING"
  },
  {
    id: "REC-2026-W27-03",
    ownerName: "Phan Văn Nam",
    ownerEmail: "nam.pv@hotmail.com",
    facilityCluster: "Sân Tennis Quận 7",
    bankName: "Vietcombank",
    bankAccountNo: "0071001294827",
    bankAccountName: "PHAN VAN NAM",
    cycle: "Tuần 27 (06/07/2026 - 12/07/2026)",
    grossAmount: 5000000,
    commissionRate: 0.12,
    commissionAmount: 600000,
    netPayoutAmount: 4400000,
    status: "PENDING"
  },
  {
    id: "REC-2026-W27-04",
    ownerName: "Đỗ Anh Tuấn",
    ownerEmail: "tuan.da@gmail.com",
    facilityCluster: "Khu Phức Hợp Thể Thao Rạch Chiếc",
    bankName: "MB Bank",
    bankAccountNo: "999988889999",
    bankAccountName: "DO ANH TUAN",
    cycle: "Tuần 27 (06/07/2026 - 12/07/2026)",
    grossAmount: 8400000,
    commissionRate: 0.10,
    commissionAmount: 840000,
    netPayoutAmount: 7560000,
    status: "PENDING"
  },
  {
    id: "REC-2026-W27-05",
    ownerName: "Lê Minh Hoàng",
    ownerEmail: "hoang.lm@gmail.com",
    facilityCluster: "Sân Bóng Khang An",
    bankName: "VietinBank",
    bankAccountNo: "101004829104",
    bankAccountName: "LE MINH HOANG",
    cycle: "Tuần 27 (06/07/2026 - 12/07/2026)",
    grossAmount: 3500000,
    commissionRate: 0.10,
    commissionAmount: 350000,
    netPayoutAmount: 3150000,
    status: "PAID_OUT",
    reconciledAt: "2026-07-13T02:30:00Z",
    reconciledBy: "superadmin@sporta.vn"
  },
  {
    id: "REC-2026-W27-06",
    ownerName: "Phạm Thanh Thảo",
    ownerEmail: "thao.pt@outlook.com",
    facilityCluster: "Sân Cầu Lông Bình Thạnh",
    bankName: "ACB",
    bankAccountNo: "204910294",
    bankAccountName: "PHAM THANH THAO",
    cycle: "Tuần 27 (06/07/2026 - 12/07/2026)",
    grossAmount: 1200000,
    commissionRate: 0.10,
    commissionAmount: 120000,
    netPayoutAmount: 1080000,
    status: "PAID_OUT",
    reconciledAt: "2026-07-12T18:15:00Z",
    reconciledBy: "admin@sporta.vn"
  },
  {
    id: "REC-2026-W26-01",
    ownerName: "Vũ Thị Mai",
    ownerEmail: "mai.vt@gmail.com",
    facilityCluster: "Cụm Sân Pickleball Bình Vị",
    bankName: "VPBank",
    bankAccountNo: "911223344",
    bankAccountName: "VU THI MAI",
    cycle: "Tuần 26 (29/06/2026 - 05/07/2026)",
    grossAmount: 4500000,
    commissionRate: 0.10,
    commissionAmount: 450000,
    netPayoutAmount: 4050000,
    status: "PAID_OUT",
    reconciledAt: "2026-07-06T09:00:00Z",
    reconciledBy: "superadmin@sporta.vn"
  },
  {
    id: "REC-2026-W26-02",
    ownerName: "Nguyễn Văn Hùng",
    ownerEmail: "hung.nv@gmail.com",
    facilityCluster: "Sân Bóng Đá Chảo Lửa",
    bankName: "MB Bank",
    bankAccountNo: "0912345678",
    bankAccountName: "NGUYEN VAN HUNG",
    cycle: "Tuần 26 (29/06/2026 - 05/07/2026)",
    grossAmount: 3200000,
    commissionRate: 0.10,
    commissionAmount: 320000,
    netPayoutAmount: 2880000,
    status: "PAID_OUT",
    reconciledAt: "2026-07-06T09:10:00Z",
    reconciledBy: "superadmin@sporta.vn"
  },
  {
    id: "REC-2026-W26-03",
    ownerName: "Phan Văn Nam",
    ownerEmail: "nam.pv@hotmail.com",
    facilityCluster: "Sân Tennis Quận 7",
    bankName: "Vietcombank",
    bankAccountNo: "0071001294827",
    bankAccountName: "PHAN VAN NAM",
    cycle: "Tuần 26 (29/06/2026 - 05/07/2026)",
    grossAmount: 6000000,
    commissionRate: 0.12,
    commissionAmount: 720000,
    netPayoutAmount: 5280000,
    status: "PAID_OUT",
    reconciledAt: "2026-07-06T10:05:00Z",
    reconciledBy: "admin@sporta.vn"
  },
  {
    id: "REC-2026-W26-04",
    ownerName: "Trần Thị Lan",
    ownerEmail: "lan.tt@yahoo.com",
    facilityCluster: "Cụm Sân Cầu Lông Tân Phú",
    bankName: "Techcombank",
    bankAccountNo: "190284710294",
    bankAccountName: "TRAN THI LAN",
    cycle: "Tuần 26 (29/06/2026 - 05/07/2026)",
    grossAmount: 2400000,
    commissionRate: 0.10,
    commissionAmount: 240000,
    netPayoutAmount: 2160000,
    status: "PAID_OUT",
    reconciledAt: "2026-07-06T09:30:00Z",
    reconciledBy: "superadmin@sporta.vn"
  }
];

// Items per page (Pagination)
const PAGE_SIZE = 5;

export const ReconciliationManagement: React.FC = () => {
  const { showToast } = useToast();

  // State
  const [records, setRecords] = useState<ReconciliationRecord[]>(INITIAL_RECONCILIATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCycle, setSelectedCycle] = useState<string>('');

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<ReconciliationRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Extract unique cycles for filters
  const uniqueCycles = useMemo(() => {
    const cycles = records.map(rec => rec.cycle);
    return Array.from(new Set(cycles)).sort((a, b) => b.localeCompare(a)); // Descending order
  }, [records]);

  // Fake Loading Simulation for Premium UX
  const triggerFakeLoading = () => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  };

  // Trigger loading when filter parameters change (simulates BE query reset)
  useEffect(() => {
    setCurrentPage(1);
    triggerFakeLoading();
  }, [searchQuery, selectedStatus, selectedCycle]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll inside table container to top on page change
    const tableContainer = document.getElementById('reconciliation-table-container');
    if (tableContainer) {
      tableContainer.scrollTop = 0;
    }
    triggerFakeLoading();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FILTERING LOGIC (Simulates BE query)
  // ─────────────────────────────────────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        rec.ownerName.toLowerCase().includes(q) ||
        rec.ownerEmail.toLowerCase().includes(q) ||
        rec.facilityCluster.toLowerCase().includes(q) ||
        rec.bankAccountNo.includes(q);

      const matchesStatus = !selectedStatus || rec.status === selectedStatus;
      const matchesCycle = !selectedCycle || rec.cycle === selectedCycle;

      return matchesSearch && matchesStatus && matchesCycle;
    });
  }, [records, searchQuery, selectedStatus, selectedCycle]);

  // ─────────────────────────────────────────────────────────────────────────────
  // KPI CALCULATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const pendingItems = records.filter(r => r.status === 'PENDING');
    const completedItems = records.filter(r => r.status === 'PAID_OUT');

    const totalPending = pendingItems.reduce((acc, curr) => acc + curr.netPayoutAmount, 0);
    const totalCompleted = completedItems.reduce((acc, curr) => acc + curr.netPayoutAmount, 0);
    const totalCommission = records.reduce((acc, curr) => acc + curr.commissionAmount, 0);
    const pendingPartnersCount = Array.from(new Set(pendingItems.map(p => p.ownerEmail))).length;

    return {
      pendingAmount: totalPending,
      completedAmount: totalCompleted,
      commissionAmount: totalCommission,
      pendingCount: pendingPartnersCount
    };
  }, [records]);

  // ─────────────────────────────────────────────────────────────────────────────
  // PAGINATION COMPUTATION
  // ─────────────────────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE) || 1;

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RECONCILIATION CONFIRMATION PROCESS (Manual payout confirm)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleTriggerReconcile = (record: ReconciliationRecord) => {
    setSelectedRecord(record);
    setIsConfirmOpen(true);
  };

  const handleConfirmReconcile = () => {
    if (!selectedRecord) return;

    setIsProcessing(true);
    // Simulate BE update API call
    setTimeout(() => {
      setRecords(prev => prev.map(rec => {
        if (rec.id === selectedRecord.id) {
          return {
            ...rec,
            status: 'PAID_OUT',
            reconciledAt: new Date().toISOString(),
            reconciledBy: 'superadmin@sporta.vn' // Simulated logger
          };
        }
        return rec;
      }));

      showToast(
        'success',
        `Đã xác nhận đối soát kỳ ${selectedRecord.cycle} cho sân "${selectedRecord.facilityCluster}". Số dư chờ đối soát reset về 0. Thông báo đã được gửi tới đối tác.`
      );
      
      // Update selected record state if detail modal is open
      setSelectedRecord(prev => prev ? {
        ...prev,
        status: 'PAID_OUT',
        reconciledAt: new Date().toISOString(),
        reconciledBy: 'superadmin@sporta.vn'
      } : null);

      setIsProcessing(false);
      setIsConfirmOpen(false);
    }, 500);
  };

  // Currency Formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col flex-1 min-h-0">
      
      {/* Title & Info Header */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-background">Quản Lý Đối Soát Chủ Sân</h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Xem số dư doanh thu, thực hiện chuyển khoản thanh toán và xác nhận đối soát dòng tiền định kỳ cho các đối tác sân đấu.
          </p>
        </div>
      </div>

      {/* KPIs Summary Cards */}
      <ReconciliationKpis
        pendingAmount={kpis.pendingAmount}
        completedAmount={kpis.completedAmount}
        commissionAmount={kpis.commissionAmount}
        pendingCount={kpis.pendingCount}
        formatCurrency={formatCurrency}
      />

      {/* Main Table Card */}
      <Card className="overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm border border-slate-200/80 rounded-2xl">
        
        {/* Lọc danh sách */}
        <ReconciliationFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedCycle={selectedCycle}
          setSelectedCycle={setSelectedCycle}
          uniqueCycles={uniqueCycles}
        />

        {/* Bảng Dữ liệu & Quản lý 3 trạng thái */}
        <div id="reconciliation-table-container" className="flex-1 overflow-y-auto matrix-scroll min-h-0">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner size="lg" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang kết xuất dữ liệu đối soát...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Không Tìm Thấy Kết Quả</h3>
              <p className="text-xs text-slate-400 font-semibold max-w-sm">Không tìm thấy bất kỳ bản ghi đối soát nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <ReconciliationTable
              records={paginatedRecords}
              onViewDetails={(rec) => {
                setSelectedRecord(rec);
                setIsDetailOpen(true);
              }}
              onConfirmReconcile={handleTriggerReconcile}
              formatCurrency={formatCurrency}
            />
          )}
        </div>

        {/* Phân trang Footer */}
        <div className="p-4 border-t border-slate-200/60 flex items-center justify-between bg-slate-50/20 shrink-0 select-none">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredRecords.length)} trong {filteredRecords.length} chủ sân
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="text-xs font-bold py-1 px-3 border border-slate-200 disabled:opacity-30"
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
                    ? 'bg-brand-emerald text-white shadow-sm'
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
              className="text-xs font-bold py-1 px-3 border border-slate-200 disabled:opacity-30"
            >
              Sau
            </Button>
          </div>
        </div>

      </Card>

      {/* Chi tiết đối soát modal */}
      <ReconciliationDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onConfirmReconcile={handleTriggerReconcile}
        formatCurrency={formatCurrency}
      />

      {/* Popup Cảnh báo kép xác nhận đã chuyển khoản thực tế (Edge Case xử lý ấn nhầm) */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmReconcile}
        title="Xác nhận đối soát hoàn thành"
        message={`Bạn có chắc chắn ĐÃ CHUYỂN KHOẢN THỦ CÔNG số tiền ${formatCurrency(selectedRecord?.netPayoutAmount || 0)} cho đối tác "${selectedRecord?.ownerName}" (Sân: ${selectedRecord?.facilityCluster}) chưa?\n\nHệ thống sẽ cập nhật trạng thái đã thanh toán (PAID_OUT), đặt số dư chờ đối soát về 0 và gửi thông báo điện tử cho đối tác. Hãy chắc chắn giao dịch ngân hàng đã thành công.`}
        confirmText={isProcessing ? "Đang xử lý..." : "Có, tôi đã chuyển khoản"}
        cancelText="Hủy bỏ, kiểm tra lại"
        variant="warning"
        maxWidth="md"
      />

    </div>
  );
};
