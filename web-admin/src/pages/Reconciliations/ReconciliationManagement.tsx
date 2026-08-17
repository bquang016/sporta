import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// Subcomponents
import { ReconciliationFilters } from '@/components/reconciliations/ReconciliationFilters';
import { ReconciliationTable } from '@/components/reconciliations/ReconciliationTable';
import { ReconciliationDetailModal } from '@/components/reconciliations/ReconciliationDetailModal';
import { ReconciliationProcessModal } from '@/components/reconciliations/ReconciliationProcessModal';

// API
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from '@/api/adminWithdrawalApi';
import type { WithdrawalResponse } from '@/api/adminWithdrawalApi';

const PAGE_SIZE = 10;

export const ReconciliationManagement: React.FC = () => {
  const { showToast } = useToast();

  // State
  const [records, setRecords] = useState<WithdrawalResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCycle, setSelectedCycle] = useState<string>('');

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<WithdrawalResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isProcessOpen, setIsProcessOpen] = useState<boolean>(false);

  const fetchWithdrawals = useCallback(async (page: number, status?: string) => {
    try {
      setIsLoading(true);
      const data = await getWithdrawals(page - 1, PAGE_SIZE, status);
      setRecords(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi tải danh sách');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWithdrawals(currentPage, selectedStatus);
  }, [currentPage, selectedStatus, fetchWithdrawals]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const tableContainer = document.getElementById('reconciliation-table-container');
    if (tableContainer) {
      tableContainer.scrollTop = 0;
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        rec.ownerName.toLowerCase().includes(q) ||
        rec.bankAccountNumber.includes(q);

      return matchesSearch;
    });
  }, [records, searchQuery]);

  const handleApprove = async (id: string, proofUrl: string, note?: string) => {
    try {
      await approveWithdrawal(id, note, proofUrl);
      showToast('success', 'Đã duyệt lệnh rút tiền thành công');
      setIsDetailOpen(false);
      setSelectedRecord(null);
      fetchWithdrawals(currentPage, selectedStatus);
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra khi duyệt');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await rejectWithdrawal(id, reason);
      showToast('success', 'Đã từ chối lệnh rút tiền thành công');
      setIsDetailOpen(false);
      setSelectedRecord(null);
      fetchWithdrawals(currentPage, selectedStatus);
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra khi từ chối');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col flex-1 min-h-0">
      
      {/* Title & Info Header */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-background">Quản Lý Rút Tiền</h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Xem, xử lý các lệnh rút tiền từ ví Sporta của các chủ sân và đối soát chuyển khoản.
          </p>
        </div>
      </div>

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
          uniqueCycles={[]}
        />

        {/* Bảng Dữ liệu & Quản lý 3 trạng thái */}
        <div id="reconciliation-table-container" className="flex-1 overflow-y-auto matrix-scroll min-h-0">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner size="lg" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Không Tìm Thấy Kết Quả</h3>
              <p className="text-xs text-slate-400 font-semibold max-w-sm">Không tìm thấy bất kỳ bản ghi nào phù hợp.</p>
            </div>
          ) : (
            <ReconciliationTable
              records={filteredRecords}
              onViewDetails={(rec) => {
                setSelectedRecord(rec);
                setIsDetailOpen(true);
              }}
              onConfirmReconcile={(rec) => {
                setSelectedRecord(rec);
                setIsProcessOpen(true);
              }}
            />
          )}
        </div>

        {/* Phân trang Footer */}
        <div className="p-4 border-t border-slate-200/60 flex items-center justify-between bg-slate-50/20 shrink-0 select-none">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Trang {currentPage}
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
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasMore || isLoading}
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
      />

      {/* Xử lý đối soát modal */}
      <ReconciliationProcessModal
        isOpen={isProcessOpen}
        onClose={() => {
          setIsProcessOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onApprove={handleApprove}
        onReject={handleReject}
      />

    </div>
  );
};
