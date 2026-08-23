import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Ticket, Percent, Banknote, CalendarDays, Hash, AlertTriangle, CheckCircle2, Building } from 'lucide-react';
import { useVoucherMutations } from '../hooks/useVoucherMutations';
import { voucherApi } from '../services/voucherApi';
import { courtService } from '../../venue/services/courtService';
import { DiscountType } from '../types/voucher.types';
import type { Voucher } from '../types/voucher.types';
import { Input, DateTimePicker, Button, Container, Grid } from '../../../common/ui';
import { Dropdown } from '../../../components/ui/Dropdown';
import { CurrencyInput } from '../../../components/ui/CurrencyInput';
import { Modal } from '../../../components/ui/Modal';
import { Checkbox } from '../../../components/ui/Checkbox';

export const VoucherFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { createVoucher, updateVoucher, submitting, error: submitError } = useVoucherMutations();
  const [loading, setLoading] = useState(isEdit);
  const [originalVoucher, setOriginalVoucher] = useState<Voucher | null>(null);
  
  // Venue State
  const [venues, setVenues] = useState<Array<{ id: string; name: string; address?: string }>>([]);
  const [applyScope, setApplyScope] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedVenueIds, setSelectedVenueIds] = useState<string[]>([]);

  // Custom Modal State
  const [modalState, setModalState] = useState<{isOpen: boolean, type: 'success'|'error', message: string}>({
    isOpen: false,
    type: 'success',
    message: ''
  });

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
    // Fetch owner venues
    courtService.getVenues().then(venueList => {
      setVenues(venueList || []);
    }).catch(err => console.error('Failed to fetch venues:', err));

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
          startDate: data.startDate.substring(0, 16),
          endDate: data.endDate.substring(0, 16),
          totalQuantity: data.totalQuantity,
        });
        if (data.venueIds && data.venueIds.length > 0) {
          setApplyScope('SPECIFIC');
          setSelectedVenueIds(data.venueIds);
        } else {
          setApplyScope('ALL');
          setSelectedVenueIds([]);
        }
        setLoading(false);
      }).catch(() => {
        setModalState({ isOpen: true, type: 'error', message: 'Không thể tải thông tin mã khuyến mãi' });
      });
    }
  }, [id, isEdit]);

  const hasInteractions = originalVoucher && originalVoucher.collectedQuantity > 0;
  
  // Frontend Validation Logic
  const validationError = (formData.discountType === DiscountType.PERCENTAGE && formData.discountValue > 100) 
    ? 'Phần trăm giảm giá không được vượt quá 100%' 
    : (applyScope === 'SPECIFIC' && selectedVenueIds.length === 0)
    ? 'Vui lòng chọn ít nhất một cụm sân áp dụng'
    : null;

  let dateValidationError = null;
  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const now = new Date();
    
    // Ignore past start date error if we are editing an existing voucher whose start date is already in the past
    if (!isEdit && start < new Date(now.getTime() - 5 * 60000)) { // allow 5 mins margin
      dateValidationError = 'Thời gian bắt đầu không được trong quá khứ';
    } else if (end <= start) {
      dateValidationError = 'Thời gian kết thúc phải sau thời gian bắt đầu';
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError || dateValidationError) return;
    
    const startDate = formData.startDate.length === 16 ? `${formData.startDate}:00` : formData.startDate;
    const endDate = formData.endDate.length === 16 ? `${formData.endDate}:00` : formData.endDate;

    try {
      if (isEdit) {
        await updateVoucher(id, {
          name: formData.name,
          totalQuantity: formData.totalQuantity,
          endDate: endDate,
        });
        setModalState({ isOpen: true, type: 'success', message: 'Cập nhật mã khuyến mãi thành công!' });
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
          venueIds: applyScope === 'SPECIFIC' ? selectedVenueIds : null,
          bannerImageUrl: null,
        });
        setModalState({ isOpen: true, type: 'success', message: 'Tạo mã khuyến mãi mới thành công!' });
      }
    } catch (err: any) {
      // Mutations already handle the error state 'submitError', but if we want to show it in a modal:
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setModalState({ isOpen: true, type: 'error', message: msg });
    }
  };

  const handleCloseModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (modalState.type === 'success') {
      navigate('/vouchers');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Container className="animate-fadeIn py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/vouchers')} 
          className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{isEdit ? 'Chỉnh sửa mã khuyến mãi' : 'Tạo mã khuyến mãi mới'}</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">Thiết lập các ưu đãi để thu hút khách hàng đặt lịch</p>
        </div>
      </div>

      {submitError && !modalState.isOpen && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {submitError}
        </div>
      )}

      {hasInteractions && (
        <div className="mb-6 p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>Lưu ý: Mã này đã có khách hàng lưu. Bạn chỉ có thể sửa Tên chương trình, tăng Số lượng, và gia hạn Thời gian kết thúc.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
        
        {/* Basic Info */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Ticket className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-black text-slate-800">Thông tin cơ bản</h3>
          </div>
          
          <Grid cols={1} md={2} gap={6}>
            <Input 
              label="Tên chương trình"
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Vd: Ưu đãi mùa hè"
            />
            <Input 
              label="Mã code (Viết liền, không dấu)"
              required 
              disabled={isEdit}
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
              placeholder="Vd: SUMMER2026"
            />
          </Grid>
        </div>

        {/* Discount Info */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Percent className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-black text-slate-800">Thiết lập giảm giá</h3>
          </div>
          
          <Grid cols={1} md={2} gap={6}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Loại giảm giá <span className="text-red-500">*</span>
              </label>
              <Dropdown 
                disabled={isEdit}
                value={formData.discountType}
                onChange={(val) => setFormData({...formData, discountType: val as DiscountType})}
                options={[
                  { value: DiscountType.PERCENTAGE, label: 'Giảm theo phần trăm (%)' },
                  { value: DiscountType.FIXED_AMOUNT, label: 'Giảm tiền mặt (VNĐ)' },
                ]}
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Mức giảm <span className="text-red-500">*</span>
              </label>
              {formData.discountType === DiscountType.PERCENTAGE ? (
                <Input 
                  type="number" 
                  required
                  min={1}
                  disabled={isEdit}
                  value={formData.discountValue || ''}
                  onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})}
                  suffixIcon={<span className="text-xs font-black">%</span>}
                  placeholder="0"
                  className={validationError ? 'border-red-500 ring-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                />
              ) : (
                <CurrencyInput 
                  required
                  disabled={isEdit}
                  value={formData.discountValue || 0}
                  onChange={val => setFormData({...formData, discountValue: val})}
                  placeholder="0"
                />
              )}
              {validationError && (
                <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {validationError}
                </p>
              )}
            </div>
            
            {formData.discountType === DiscountType.PERCENTAGE && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Giảm tối đa (VNĐ)
                </label>
                <CurrencyInput 
                  disabled={isEdit}
                  value={formData.maxDiscountAmount || 0}
                  onChange={val => setFormData({...formData, maxDiscountAmount: val})}
                  placeholder="0 (Không giới hạn)"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Đơn tối thiểu (VNĐ) <span className="text-red-500">*</span>
              </label>
              <CurrencyInput 
                required
                disabled={isEdit}
                value={formData.minOrderAmount || 0}
                onChange={val => setFormData({...formData, minOrderAmount: val})}
                placeholder="0"
              />
            </div>
          </Grid>
        </div>

        {/* Time & Quantity */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <CalendarDays className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-black text-slate-800">Thời gian & Số lượng</h3>
          </div>
          
          <Grid cols={1} md={3} gap={6}>
            <DateTimePicker 
              label="Bắt đầu"
              required
              disabled={isEdit}
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
            />
            <DateTimePicker 
              label="Kết thúc"
              required
              value={formData.endDate}
              onChange={e => setFormData({...formData, endDate: e.target.value})}
            />
            <Input 
              label="Tổng số lượng"
              type="number" 
              required
              min={hasInteractions && originalVoucher ? originalVoucher.totalQuantity : 1}
              value={formData.totalQuantity || ''}
              onChange={e => setFormData({...formData, totalQuantity: Number(e.target.value)})}
              prefixIcon={<Hash className="w-4 h-4" />}
            />
          </Grid>
          
          {dateValidationError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2 text-sm font-bold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {dateValidationError}
            </div>
          )}
        </div>

        {/* Applicable Venues */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Building className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-black text-slate-800">Phạm vi áp dụng (Cụm sân)</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  applyScope === 'ALL'
                    ? 'border-brand-emerald bg-emerald-50/40 ring-1 ring-brand-emerald'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="applyScope"
                  checked={applyScope === 'ALL'}
                  onChange={() => setApplyScope('ALL')}
                  disabled={isEdit}
                  className="mt-1 text-brand-emerald focus:ring-brand-emerald"
                />
                <div>
                  <span className="font-bold text-slate-800 text-sm">Tất cả cụm sân</span>
                  <p className="text-xs text-slate-500 mt-0.5">Khách hàng có thể sử dụng mã tại mọi cụm sân bạn quản lý</p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  applyScope === 'SPECIFIC'
                    ? 'border-brand-emerald bg-emerald-50/40 ring-1 ring-brand-emerald'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="applyScope"
                  checked={applyScope === 'SPECIFIC'}
                  onChange={() => setApplyScope('SPECIFIC')}
                  disabled={isEdit}
                  className="mt-1 text-brand-emerald focus:ring-brand-emerald"
                />
                <div>
                  <span className="font-bold text-slate-800 text-sm">Cụm sân chỉ định</span>
                  <p className="text-xs text-slate-500 mt-0.5">Chỉ áp dụng mã cho một hoặc nhiều cụm sân được chọn</p>
                </div>
              </label>
            </div>

            {applyScope === 'SPECIFIC' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Chọn cụm sân áp dụng ({selectedVenueIds.length}/{venues.length})
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVenueIds(venues.map(v => v.id))}
                      className="text-xs font-bold text-brand-emerald hover:underline"
                      disabled={isEdit}
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedVenueIds([])}
                      className="text-xs font-bold text-slate-500 hover:underline"
                      disabled={isEdit}
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {venues.map(venue => {
                    const isChecked = selectedVenueIds.includes(venue.id);
                    return (
                      <label
                        key={venue.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border bg-white cursor-pointer transition-all ${
                          isChecked
                            ? 'border-brand-emerald bg-emerald-50/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          disabled={isEdit}
                          onChange={(checked) => {
                            if (checked) {
                              setSelectedVenueIds(prev => [...prev, venue.id]);
                            } else {
                              setSelectedVenueIds(prev => prev.filter(id => id !== venue.id));
                            }
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold text-slate-800 block truncate">{venue.name}</span>
                          {venue.address && (
                            <span className="text-xs text-slate-400 block truncate">{venue.address}</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {selectedVenueIds.length === 0 && (
                  <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Vui lòng chọn ít nhất một cụm sân để áp dụng mã
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions at the bottom of the form */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/vouchers')}
          >
            Hủy bỏ
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            loading={submitting}
            disabled={!!validationError || !!dateValidationError}
            prefixIcon={<Save className="w-4 h-4" />}
          >
            Lưu mã khuyến mãi
          </Button>
        </div>
      </form>

      {/* Result Modal */}
      <Modal 
        isOpen={modalState.isOpen} 
        onClose={handleCloseModal}
        maxWidth="sm"
        title={modalState.type === 'success' ? 'Thành công' : 'Thất bại'}
      >
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            {modalState.type === 'success' ? (
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <p className="text-sm font-bold text-slate-700">{modalState.message}</p>
          <div className="mt-6">
            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleCloseModal}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

    </Container>
  );
};
