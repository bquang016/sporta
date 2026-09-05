import React from 'react';
import { Plus, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useVoucherList } from '../hooks/useVoucherList';
import { VoucherTable } from '../components/VoucherTable';
import { VoucherFilterBar } from '../components/VoucherFilterBar';
import { MobileVoucherListPage } from './MobileVoucherListPage';
import { Container, Button, Pagination } from '../../../common/ui';

export const VoucherListPage: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    vouchers,
    loading,
    keyword,
    status,
    handleStatusChange,
    handleSearch,
    disableVoucher,
    currentPage,
    totalPages,
    handlePageChange,
    totalElements
  } = useVoucherList();

  // ═══ MOBILE VIEW ═══
  if (isMobile) {
    return (
      <MobileVoucherListPage
        vouchers={vouchers}
        loading={loading}
        keyword={keyword}
        onKeywordChange={handleSearch}
        status={status}
        onStatusChange={handleStatusChange}
        onDisable={disableVoucher}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
      />
    );
  }

  return (
    <Container className="animate-fadeIn py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý khuyến mãi</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">Quản lý các chương trình ưu đãi cho cụm sân của bạn</p>
          </div>
        </div>
        <Link to="/vouchers/create">
          <Button 
            variant="primary" 
            prefixIcon={<Plus className="w-5 h-5" />}
          >
            Tạo mã mới
          </Button>
        </Link>
      </div>

      <VoucherFilterBar 
        keyword={keyword}
        onKeywordChange={handleSearch}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <VoucherTable 
        vouchers={vouchers}
        loading={loading}
        onDisable={disableVoucher}
      />

      {totalElements > 0 && (
        <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-center">
          <Pagination 
            currentPage={currentPage + 1} // Backend is 0-indexed, UI is 1-indexed
            pageSize={10}
            totalItems={totalElements || 0}
            onPageChange={(p) => handlePageChange(p - 1)}
          />
        </div>
      )}
    </Container>
  );
};
