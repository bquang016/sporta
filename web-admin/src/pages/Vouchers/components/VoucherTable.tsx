import React from 'react';
import { format } from 'date-fns';
import { Edit2, Ban, Image as ImageIcon } from 'lucide-react';
import { VoucherStatus, DiscountType } from '../../../types/voucher.types';
import type { Voucher } from '../../../types/voucher.types';
import { Link } from 'react-router-dom';

interface VoucherTableProps {
  vouchers: Voucher[];
  onDisable: (id: string) => void;
  onEdit?: (id: string) => void;
  loading: boolean;
}

export const VoucherTable: React.FC<VoucherTableProps> = ({ vouchers, onDisable, onEdit, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDiscount = (v: Voucher) => {
    if (v.discountType === DiscountType.FIXED_AMOUNT) {
      return formatCurrency(v.discountValue);
    }
    return `${v.discountValue}%${v.maxDiscountAmount ? ` (Tối đa ${formatCurrency(v.maxDiscountAmount)})` : ''}`;
  };

  const renderStatus = (status: VoucherStatus, isExpired: boolean) => {
    if (isExpired && status !== VoucherStatus.DISABLED) {
      return <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-700">Đã hết hạn</span>;
    }
    if (status === VoucherStatus.ACTIVE) return <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">Hoạt động</span>;
    if (status === VoucherStatus.DISABLED) return <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700">Đã vô hiệu</span>;
    return <span>{status}</span>;
  };

  if (loading) {
    return <div className="p-8 text-center"><div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã / Tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mức Giảm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sử dụng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời hạn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vouchers.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {v.bannerImageUrl ? (
                    <img src={v.bannerImageUrl} alt="Banner" className="w-16 h-9 object-cover rounded shadow-sm" />
                  ) : (
                    <div className="w-16 h-9 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                </td>
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{format(new Date(v.startDate), 'dd/MM/yyyy HH:mm')}</div>
                  <div>đến {format(new Date(v.endDate), 'dd/MM/yyyy HH:mm')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStatus(v.status, v.isExpired)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit ? (
                      <button onClick={() => onEdit(v.id)} className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa">
                        <Edit2 className="w-5 h-5" />
                      </button>
                    ) : (
                      <Link to={`/vouchers/${v.id}/edit`} className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa">
                        <Edit2 className="w-5 h-5" />
                      </Link>
                    )}
                    {v.status === VoucherStatus.ACTIVE && !v.isExpired && (
                      <button onClick={() => { if(window.confirm('Vô hiệu hóa mã?')) onDisable(v.id); }} className="text-red-600 hover:text-red-900" title="Vô hiệu hóa">
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
