import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useVoucherMutations } from '../hooks/useVoucherMutations';
import { voucherApi } from '../services/voucherApi';
import { DiscountType } from '../types/voucher.types';
import type { Voucher } from '../types/voucher.types';

export const VoucherFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { createVoucher, updateVoucher, submitting, error } = useVoucherMutations();
  const [loading, setLoading] = useState(isEdit);
  const [originalVoucher, setOriginalVoucher] = useState<Voucher | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    maxDiscountAmount: number;
    minOrderAmount: number;
    startDate: string;
    endDate: string;
    totalQuantity: number;
  }>({
    name: '',
    code: '',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 0,
    maxDiscountAmount: 0,
    minOrderAmount: 0,
    startDate: '',
    endDate: '',
    totalQuantity: 100,
  });

  useEffect(() => {
    if (isEdit) {
      voucherApi.getVoucherById(id).then(data => {
        setOriginalVoucher(data);
        setFormData({
          name: data.name,
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          maxDiscountAmount: data.maxDiscountAmount || 0,
          minOrderAmount: data.minOrderAmount,
          startDate: data.startDate.substring(0, 16), // YYYY-MM-DDTHH:mm
          endDate: data.endDate.substring(0, 16),
          totalQuantity: data.totalQuantity,
        });
        setLoading(false);
      }).catch(() => {
        alert('Không thể tải thông tin mã khuyến mãi');
        navigate('/vouchers');
      });
    }
  }, [id, isEdit, navigate]);

  const hasInteractions = originalVoucher && originalVoucher.collectedQuantity > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // YYYY-MM-DDTHH:mm:ss for backend
    const startDate = formData.startDate.length === 16 ? `${formData.startDate}:00` : formData.startDate;
    const endDate = formData.endDate.length === 16 ? `${formData.endDate}:00` : formData.endDate;

    if (isEdit) {
      await updateVoucher(id, {
        name: formData.name,
        totalQuantity: formData.totalQuantity,
        endDate: endDate,
      });
    } else {
      await createVoucher({
        name: formData.name,
        code: formData.code,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.discountType === DiscountType.PERCENTAGE && formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        minOrderAmount: Number(formData.minOrderAmount),
        startDate: startDate,
        endDate: endDate,
        totalQuantity: Number(formData.totalQuantity),
        // venueIds: undefined => Áp dụng tất cả sân
      });
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/vouchers')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Chỉnh sửa mã khuyến mãi' : 'Tạo mã khuyến mãi mới'}</h1>
          <p className="text-gray-500 text-sm mt-1">Thiết lập các ưu đãi để thu hút khách hàng đặt sân</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {hasInteractions && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
          <strong>Lưu ý:</strong> Mã này đã có khách hàng lưu. Bạn chỉ có thể sửa Tên, tăng Số lượng và gia hạn Thời gian.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương trình *</label>
              <input 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Vd: Ưu đãi mùa hè"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã code *</label>
              <input 
                required 
                disabled={isEdit}
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase disabled:bg-gray-100"
                placeholder="Vd: SUMMER2026"
              />
            </div>
          </div>
        </div>

        {/* Discount Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Thiết lập giảm giá</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá *</label>
              <select 
                disabled={isEdit}
                value={formData.discountType}
                onChange={e => setFormData({...formData, discountType: e.target.value as DiscountType})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value={DiscountType.PERCENTAGE}>Giảm theo %</option>
                <option value={DiscountType.FIXED_AMOUNT}>Giảm tiền mặt (VNĐ)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mức giảm *</label>
              <div className="relative">
                <input 
                  type="number" 
                  required
                  min="1"
                  disabled={isEdit}
                  value={formData.discountValue}
                  onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">{formData.discountType === DiscountType.PERCENTAGE ? '%' : 'VNĐ'}</span>
                </div>
              </div>
            </div>
            
            {formData.discountType === DiscountType.PERCENTAGE && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (VNĐ)</label>
                <input 
                  type="number" 
                  min="0"
                  disabled={isEdit}
                  value={formData.maxDiscountAmount}
                  onChange={e => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                  placeholder="Không giới hạn"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn tối thiểu (VNĐ) *</label>
              <input 
                type="number" 
                required
                min="0"
                disabled={isEdit}
                value={formData.minOrderAmount}
                onChange={e => setFormData({...formData, minOrderAmount: Number(e.target.value)})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Time & Quantity */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Thời gian & Số lượng</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu *</label>
              <input 
                type="datetime-local" 
                required
                disabled={isEdit}
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc *</label>
              <input 
                type="datetime-local" 
                required
                min={hasInteractions && originalVoucher ? originalVoucher.endDate.substring(0, 16) : formData.startDate}
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số lượng *</label>
              <input 
                type="number" 
                required
                min={hasInteractions && originalVoucher ? originalVoucher.totalQuantity : 1}
                value={formData.totalQuantity}
                onChange={e => setFormData({...formData, totalQuantity: Number(e.target.value)})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button" 
            onClick={() => navigate('/vouchers')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Đang lưu...' : 'Lưu mã khuyến mãi'}
          </button>
        </div>
      </form>
    </div>
  );
};
