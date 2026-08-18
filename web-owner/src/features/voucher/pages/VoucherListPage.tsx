import React from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoucherList } from '../hooks/useVoucherList';
import { VoucherTable } from '../components/VoucherTable';
import { VoucherFilterBar } from '../components/VoucherFilterBar';

export const VoucherListPage: React.FC = () => {
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
    handlePageChange
  } = useVoucherList();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mã khuyến mãi</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý các chương trình khuyến mãi cho cụm sân của bạn</p>
        </div>
        <Link 
          to="/vouchers/create" 
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo mã mới</span>
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

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-3 py-1">Trang {currentPage + 1} / {totalPages}</span>
            <button 
              disabled={currentPage >= totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
