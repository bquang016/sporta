import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { voucherApi } from '../../api/voucherApi';
import { DiscountType } from '../../types/voucher.types';
import type { Voucher } from '../../types/voucher.types';
import { BannerUploader } from './components/BannerUploader';

interface VoucherFormProps {
  voucherId?: string;
  onBack: () => void;
}

export const VoucherForm: React.FC<VoucherFormProps> = ({ voucherId, onBack }) => {
  const isEdit = !!voucherId;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
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
    bannerImageUrl: string;
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
    bannerImageUrl: '',
  });

  useEffect(() => {
    if (isEdit && voucherId) {
      voucherApi.getVoucherById(voucherId).then(data => {
        setOriginalVoucher(data);
        setFormData({
          name: data.name,
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          maxDiscountAmount: data.maxDiscountAmount || 0,
          minOrderAmount: data.minOrderAmount,
          startDate: data.startDate.substring(0, 16),
          endDate: data.endDate.substring(0, 16),
          totalQuantity: data.totalQuantity,
          bannerImageUrl: data.bannerImageUrl || '',
        });
        setLoading(false);
      }).catch(() => {
        alert('Lỗi tải thông tin');
        onBack();
      });
    }
  }, [voucherId, isEdit, onBack]);

  const hasInteractions = originalVoucher && originalVoucher.collectedQuantity > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bannerImageUrl) {
      alert('Vui lòng tải lên ảnh banner cho mã hệ thống');
      return;
    }

    const startDate = formData.startDate.length === 16 ? `${formData.startDate}:00` : formData.startDate;
    const endDate = formData.endDate.length === 16 ? `${formData.endDate}:00` : formData.endDate;

    setSubmitting(true);
    try {
      if (isEdit && voucherId) {
        await voucherApi.updateVoucher(voucherId, {
          name: formData.name,
          totalQuantity: formData.totalQuantity,
          endDate: endDate,
          bannerImageUrl: formData.bannerImageUrl,
        });
        alert('Cập nhật thành công');
      } else {
        await voucherApi.createVoucher({
          name: formData.name,
          code: formData.code,
          discountType: formData.discountType,
          discountValue: Number(formData.discountValue),
          maxDiscountAmount: formData.discountType === DiscountType.PERCENTAGE && formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
          minOrderAmount: Number(formData.minOrderAmount),
          startDate: startDate,
          endDate: endDate,
          totalQuantity: Number(formData.totalQuantity),
          bannerImageUrl: formData.bannerImageUrl,
        });
        alert('Tạo mã thành công');
      }
      onBack();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-surface-variant rounded-full text-on-surface-variant">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-on-background">{isEdit ? 'Chỉnh sửa mã hệ thống' : 'Tạo mã hệ thống mới'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-outline-variant/30 p-6 space-y-6">
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2 text-on-background">Banner hiển thị</h3>
          <BannerUploader 
            value={formData.bannerImageUrl} 
            onChange={(url) => setFormData({...formData, bannerImageUrl: url})} 
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2 text-on-background">Thông tin cơ bản</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Tên chương trình *</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-outline-variant rounded-md text-on-surface" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Mã code *</label>
              <input required disabled={isEdit} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full border-outline-variant rounded-md uppercase disabled:bg-surface-variant/50 text-on-surface" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2 text-on-background">Thiết lập giảm giá</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Loại giảm giá *</label>
              <select disabled={isEdit} value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value as DiscountType})} className="w-full border-outline-variant rounded-md disabled:bg-surface-variant/50 text-on-surface">
                <option value={DiscountType.PERCENTAGE}>Giảm theo %</option>
                <option value={DiscountType.FIXED_AMOUNT}>Giảm tiền mặt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Mức giảm *</label>
              <input type="number" required min="1" disabled={isEdit} value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} className="w-full border-outline-variant rounded-md disabled:bg-surface-variant/50 text-on-surface" />
            </div>
            {formData.discountType === DiscountType.PERCENTAGE && (
              <div>
                <label className="block text-sm font-medium mb-1 text-on-surface">Giảm tối đa (VNĐ)</label>
                <input type="number" min="0" disabled={isEdit} value={formData.maxDiscountAmount} onChange={e => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})} className="w-full border-outline-variant rounded-md disabled:bg-surface-variant/50 text-on-surface" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Đơn tối thiểu (VNĐ) *</label>
              <input type="number" required min="0" disabled={isEdit} value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: Number(e.target.value)})} className="w-full border-outline-variant rounded-md disabled:bg-surface-variant/50 text-on-surface" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2 text-on-background">Thời gian & Số lượng</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Bắt đầu *</label>
              <input type="datetime-local" required disabled={isEdit} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border-outline-variant rounded-md disabled:bg-surface-variant/50 text-on-surface" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Kết thúc *</label>
              <input type="datetime-local" required min={hasInteractions && originalVoucher ? originalVoucher.endDate.substring(0, 16) : formData.startDate} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border-outline-variant rounded-md text-on-surface" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface">Tổng số lượng *</label>
              <input type="number" required min={hasInteractions && originalVoucher ? originalVoucher.totalQuantity : 1} value={formData.totalQuantity} onChange={e => setFormData({...formData, totalQuantity: Number(e.target.value)})} className="w-full border-outline-variant rounded-md text-on-surface" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
          <button type="button" onClick={onBack} className="px-4 py-2 border border-outline-variant text-on-surface rounded-md hover:bg-surface-variant transition-colors">Hủy</button>
          <button type="submit" disabled={submitting} className="flex items-center gap-2 px-4 py-2 bg-brand-emerald text-white rounded-md hover:bg-emerald-700 transition-colors">
            <Save className="w-4 h-4" /> {submitting ? 'Đang lưu...' : 'Lưu mã'}
          </button>
        </div>
      </form>
    </div>
  );
};
