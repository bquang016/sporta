import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { ConfirmModal } from '../../../../common/ui/overlay/ConfirmModal';
import { useOperations } from '../../../../hooks/useOperationsState';
import { useToast } from '../../../../components/ui/Toast';
import { courtService } from '../../services/courtService';
import type { VenueResponse, CourtResponse, VenueImageDto, CourtPriceRuleResponse } from '../../types';

interface VenuePendingDetailScreenProps {
  onClose: () => void;
  venue: VenueResponse;
  courts: CourtResponse[];
}

export const VenuePendingDetailScreen = ({
  onClose,
  venue,
  courts
}: VenuePendingDetailScreenProps) => {
  const { cancelVenueSubmission, refreshData } = useOperations();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [courtRulesMap, setCourtRulesMap] = useState<Record<string, CourtPriceRuleResponse[]>>({});

  useEffect(() => {
    const fetchRules = async () => {
      const newMap: Record<string, CourtPriceRuleResponse[]> = {};
      try {
        await Promise.all(
          courts.map(async (court) => {
            const rules = await courtService.getCourtPriceRules(court.id);
            newMap[court.id] = rules;
          })
        );
        setCourtRulesMap(newMap);
      } catch (err) {
        console.error('Lỗi khi lấy quy tắc giá của sân:', err);
      }
    };
    if (courts.length > 0) {
      fetchRules();
    }
  }, [courts]);

  const handleCancelSubmit = async () => {
    try {
      setLoading(true);
      await cancelVenueSubmission(venue.id);
      showToast('success', 'Đã hủy yêu cầu duyệt cụm sân thành công! Cụm sân đã trở lại trạng thái Bản nháp.');
      await refreshData();
      setLoading(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Lỗi khi hủy yêu cầu duyệt cụm sân');
      setLoading(false);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none font-sans py-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-650 transition-all cursor-pointer"
              title="Quay lại"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              Chi tiết cụm sân chờ duyệt
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-semibold pl-9">
            Xem chi tiết thông tin đang được Admin kiểm duyệt
          </p>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto sm:pl-9">
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => setIsConfirmCancelOpen(true)}
            className="flex-1 sm:flex-initial text-red-600 hover:text-red-750 hover:bg-red-50 font-black text-xs border border-red-200 uppercase tracking-wider px-5 py-2.5 min-h-[38px] rounded-xl"
          >
            Hủy gửi duyệt
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={onClose}
            className="flex-1 sm:flex-initial font-black text-xs border-b-2 border-slate-950 uppercase tracking-wider px-6 py-2.5 min-h-[38px] rounded-xl"
          >
            Đóng
          </Button>
        </div>
      </div>

      {/* Banner warning */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-5 flex gap-4 text-xs text-amber-800 font-semibold select-none shadow-3xs">
        <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="font-black text-slate-800 text-xs mb-1 uppercase tracking-wide">Trạng thái: Đang chờ duyệt</p>
          <p className="leading-relaxed text-slate-600 text-[11px]">
            Đơn đăng ký của cụm sân này đang được ban quản trị hệ thống phê duyệt. Bạn không thể thực hiện bất kỳ chỉnh sửa nào cho đến khi đơn được duyệt. Nếu cần sửa đổi thông tin, hãy chọn <strong>Hủy gửi duyệt</strong> ở góc trên bên phải để thu hồi đơn về trạng thái Bản nháp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SECTION (7 cols): Basic details & gallery */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Basic Info Box */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Thông tin cụm sân
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tên cụm sân</span>
                <p className="text-xs font-extrabold text-slate-800">{venue.name}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Môn thể thao</span>
                <p className="text-xs font-extrabold text-brand-emerald">{venue.sport?.name || 'Chưa cấu hình'}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Giờ mở cửa</span>
                <p className="text-xs font-extrabold text-slate-800">{formatTime(venue.openingTime)} - {formatTime(venue.closingTime)}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Thời lượng mỗi ca</span>
                <p className="text-xs font-extrabold text-slate-800">{venue.shiftDurationMinutes} phút</p>
              </div>
              <div className="space-y-0.5 md:col-span-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Địa chỉ chi tiết</span>
                <p className="text-xs font-extrabold text-slate-800 leading-relaxed">{venue.location}</p>
              </div>
              {venue.description && (
                <div className="space-y-0.5 md:col-span-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Giới thiệu / mô tả</span>
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 rounded-2xl p-4 border border-slate-100">{venue.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Surcharge Box */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center justify-between">
              Cấu hình phụ thu
              <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md ${venue.hasSurcharge ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                {venue.hasSurcharge ? 'Đang bật' : 'Đang tắt'}
              </span>
            </h4>
            {venue.hasSurcharge ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Số tiền phụ thu</span>
                  <p className="text-xs font-black text-red-600">+{formatVND(venue.surchargeAmount || 0)} / ca</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lý do phụ thu</span>
                  <p className="text-xs font-bold text-slate-700 leading-normal">{venue.surchargeDescription}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-semibold italic">Không áp dụng phí phụ thu cố định cho cụm sân này.</p>
            )}
          </div>

          {/* Media Gallery */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Hình ảnh thực tế
            </h4>
            
            <div className="space-y-4">
              {/* Cover Image */}
              {venue.coverImage ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Ảnh bìa chính</span>
                  <div className="w-full h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative shadow-2xs">
                    <img
                      src={venue.coverImage}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-semibold italic">Chưa đăng tải ảnh bìa cụm sân.</p>
              )}

              {/* Detail Images */}
              {venue.images && venue.images.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Ảnh chi tiết ({venue.images.length})</span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {venue.images.map((img: VenueImageDto) => (
                      <div key={img.id} className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs">
                        <img
                          src={img.imageUrl}
                          alt="Chi tiết"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT SECTION (5 cols): Courts list & rules */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Courts Listing */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Sân trực thuộc ({courts.length})
            </h4>
            
            {courts.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold italic text-center py-4">Chưa khai báo sân lẻ trực thuộc cụm sân.</p>
            ) : (
              <div className="space-y-3.5">
                {courts.map((court) => {
                  const courtRules = courtRulesMap[court.id] || [];
                  return (
                    <div key={court.id} className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                      
                      {/* Court header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-xs font-black text-slate-800">{court.name}</h5>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Giá mặc định: <span className="text-brand-emerald font-black">{formatVND(court.price)}</span> / ca</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md ${court.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                          {court.status === 'ACTIVE' ? 'Hoạt động' : 'Bảo trì'}
                        </span>
                      </div>

                      {/* Special Pricing Rules for this court */}
                      {courtRules.length > 0 && (
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Quy tắc giá đặc biệt ({courtRules.length})</span>
                          <div className="space-y-1">
                            {courtRules.map((rule) => {
                              const modifierStr = rule.fixedModifier !== undefined && rule.fixedModifier !== 0
                                ? `${rule.fixedModifier > 0 ? '+' : ''}${formatVND(rule.fixedModifier)}`
                                : rule.percentageModifier !== undefined && rule.percentageModifier !== 0
                                ? `${rule.percentageModifier > 0 ? '+' : ''}${rule.percentageModifier}%`
                                : 'Giá cố định';
                              
                              const targetPriceStr = rule.customPrice !== undefined && rule.customPrice !== 0
                                ? `= ${formatVND(rule.customPrice)}`
                                : '';

                              return (
                                <div key={rule.id} className="bg-white rounded-xl p-2.5 flex justify-between items-center text-[10px] font-bold text-slate-650 border border-slate-150 shadow-3xs">
                                  <span>
                                    {rule.ruleType === 'SHIFT' ? (
                                      <span className="text-blue-600 font-extrabold bg-blue-50 px-1 py-0.5 rounded mr-1">Ca</span>
                                    ) : (
                                      <span className="text-purple-600 font-extrabold bg-purple-50 px-1 py-0.5 rounded mr-1">Ngày</span>
                                    )}
                                    {rule.ruleType === 'SHIFT' 
                                      ? `${formatTime(rule.startTime)} - ${formatTime(rule.endTime)}`
                                      : `Thứ ${rule.dayOfWeek === 8 ? 'CN' : rule.dayOfWeek}`}
                                  </span>
                                  <span className="text-slate-800 font-extrabold">
                                    {modifierStr} {targetPriceStr}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmCancelOpen}
        onClose={() => setIsConfirmCancelOpen(false)}
        onConfirm={handleCancelSubmit}
        title="Xác nhận hủy gửi duyệt"
        message="CẢNH BÁO: Bạn có chắc chắn muốn hủy yêu cầu duyệt cụm sân này? Đơn đăng ký sẽ được chuyển lại thành Bản nháp để bạn có thể tiếp tục chỉnh sửa."
        confirmText="Đồng ý hủy"
        cancelText="Không"
        variant="warning"
      />
    </div>
  );
};
