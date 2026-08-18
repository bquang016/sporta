import React from 'react';
import { Edit2, Ban, Eye } from 'lucide-react';
import { VoucherStatus, DiscountType } from '../types/voucher.types';
import type { Voucher } from '../types/voucher.types';
import { VoucherStatusBadge } from './VoucherStatusBadge';
import { Link } from 'react-router-dom';

interface VoucherTableProps {
  vouchers: Voucher[];
  onDisable: (id: string) => void;
  loading: boolean;
}

export const VoucherTable: React.FC<VoucherTableProps> = ({ vouchers, onDisable, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDiscount = (v: Voucher) => {
    if (v.discountType === DiscountType.FIXED_AMOUNT) {
      return formatCurrency(v.discountValue);
    }
    return `${v.discountValue}%${v.maxDiscountAmount ? ` (Tối đa ${formatCurrency(v.maxDiscountAmount)})` : ''}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        Không tìm thấy mã khuyến mãi nào.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã / Tên</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mức Giảm</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã dùng / Tổng</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời hạn</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vouchers.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{v.code}</span>
                    <span className="text-sm text-gray-500">{v.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDiscount(v)}</div>
                  <div className="text-xs text-gray-500">Đơn tối thiểu {formatCurrency(v.minOrderAmount)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{v.usedQuantity}</span>
                    <span className="text-sm text-gray-500 mx-1">/</span>
                    <span className="text-sm text-gray-500">{v.totalQuantity}</span>
                  </div>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full ${v.usageRate >= 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                      style={{ width: `${Math.min(100, v.usageRate)}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{new Date(v.startDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  <div>đến {new Date(v.endDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <VoucherStatusBadge status={v.status} isExpired={v.isExpired} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/vouchers/${v.id}`} className="text-gray-400 hover:text-gray-600 transition-colors" title="Xem chi tiết">
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link to={`/vouchers/${v.id}/edit`} className="text-blue-400 hover:text-blue-600 transition-colors" title="Chỉnh sửa">
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    {v.status === VoucherStatus.ACTIVE && !v.isExpired && (
                      <button 
                        onClick={() => {
                          if(window.confirm('Bạn có chắc muốn vô hiệu hóa mã này? Hành động này không thể hoàn tác.')) {
                            onDisable(v.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-600 transition-colors" 
                        title="Vô hiệu hóa"
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
