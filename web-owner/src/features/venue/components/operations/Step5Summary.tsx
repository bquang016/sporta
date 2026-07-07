import React from 'react';
import { useVenueWizard } from './VenueWizardContext';

export const Step5Summary = () => {
  const {
    name,
    location,
    description,
    sportId,
    courts,
    coverImage,
    detailImages,
    openingTime,
    closingTime,
    shiftDurationMinutes,
    hasSurcharge,
    surchargeAmount,
    surchargeDescription,
  } = useVenueWizard();

  const getSportName = () => {
    switch (sportId) {
      case '1': return 'Bóng đá';
      case '2': return 'Cầu lông';
      case '3': return 'Pickleball';
      case '4': return 'Bóng rổ';
      default: return 'Thể thao';
    }
  };

  const getSportBadgeColor = () => {
    switch (sportId) {
      case '1': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case '2': return 'bg-orange-50 text-orange-700 border-orange-100';
      case '3': return 'bg-sky-50 text-sky-700 border-sky-100';
      case '4': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // Calculate pricing range on the fly
  const calculatePriceRange = () => {
    if (courts.length === 0) return { min: 0, max: 0 };
    
    let min = Infinity;
    let max = -Infinity;

    courts.forEach(court => {
      // Base price
      if (court.price < min) min = court.price;
      if (court.price > max) max = court.price;

      // Price rules prices
      court.priceRules?.forEach(rule => {
        if (rule.ruleType === 'SHIFT' && rule.customPrice) {
          if (rule.customPrice < min) min = rule.customPrice;
          if (rule.customPrice > max) max = rule.customPrice;
        } else if (rule.ruleType === 'DAY_OF_WEEK') {
          // Estimate weekend/day changes
          let modifiedPrice = court.price;
          if (rule.percentageModifier) {
            modifiedPrice = court.price * rule.percentageModifier;
          } else if (rule.fixedModifier) {
            modifiedPrice = court.price + rule.fixedModifier;
          }
          if (modifiedPrice < min) min = modifiedPrice;
          if (modifiedPrice > max) max = modifiedPrice;
        }
      });
    });

    return { min, max };
  };

  const priceRange = calculatePriceRange();

  const formatVND = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VND';
  };

  return (
    <div className="flex-grow overflow-y-auto px-8 py-6 select-none max-w-5xl mx-auto w-full font-sans">
      <div className="space-y-1 mb-6">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bước 5: Xem trước & Xác nhận</h3>
        <p className="text-[10px] text-slate-400 font-semibold leading-normal">
          Kiểm tra lại toàn bộ thông tin đăng ký cụm sân. Dưới đây là mô phỏng giao diện hiển thị với khách hàng đặt sân.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: Detailed Breakdown (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Basic Info Summary */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-3.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              1. Thông tin cơ bản & Dịch vụ
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-slate-700">
              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Tên cụm sân:</span>
              <span className="col-span-2 font-black text-slate-800">{name || 'Chưa đặt tên'}</span>

              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Địa chỉ:</span>
              <span className="col-span-2">{location || 'Chưa khai báo'}</span>

              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Bộ môn chính:</span>
              <span className="col-span-2 flex">
                <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase ${getSportBadgeColor()}`}>
                  {getSportName()}
                </span>
              </span>

              {description && (
                <>
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Mô tả cụm:</span>
                  <span className="col-span-2 leading-relaxed text-slate-600 font-normal">{description}</span>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Courts & Price Rules Summary */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-3.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              2. Danh sách sân & Giá thuê ({courts.length} sân)
            </h4>
            
            {courts.length === 0 ? (
              <p className="text-xs text-red-500 font-bold">Lỗi: Chưa có sân bãi nào được khai báo.</p>
            ) : (
              <div className="space-y-3">
                {courts.map((court, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-2xl p-3 bg-slate-50/20 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-black text-slate-800">
                      <span>{court.name}</span>
                      <span className="text-brand-emerald">{formatVND(court.price)} <span className="text-[10px] text-slate-400 font-bold">/ ca gốc</span></span>
                    </div>

                    {court.priceRules && court.priceRules.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100/60">
                        {court.priceRules.map((rule, rIdx) => (
                          <span
                            key={rIdx}
                            className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[9px] font-bold text-slate-600"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                            {rule.ruleType === 'SHIFT' ? (
                              <span>Giờ {rule.startTime?.substring(0, 5)}-{rule.endTime?.substring(0, 5)}: {formatVND(rule.customPrice || 0)}</span>
                            ) : (
                              <span>Thứ {rule.dayOfWeek === undefined ? '' : rule.dayOfWeek === 7 ? 'CN' : rule.dayOfWeek + 1}: {rule.percentageModifier ? `+${Math.round((rule.percentageModifier - 1) * 100)}%` : `+${formatVND(rule.fixedModifier || 0)}`}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Operating Settings Summary */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-3.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              3. Vận hành & Phụ thu
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-slate-700">
              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Mở/Đóng cửa:</span>
              <span className="col-span-2 font-black text-slate-800">{openingTime} - {closingTime}</span>

              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Thời lượng ca:</span>
              <span className="col-span-2">{shiftDurationMinutes} phút</span>

              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Phụ thu cố định:</span>
              <span className="col-span-2 font-black">
                {hasSurcharge ? (
                  <span className="text-red-600">Đang bật ({formatVND(surchargeAmount || 0)})</span>
                ) : (
                  <span className="text-slate-400">Không áp dụng</span>
                )}
              </span>

              {hasSurcharge && surchargeDescription && (
                <>
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Lý do phụ thu:</span>
                  <span className="col-span-2 leading-relaxed text-slate-650 font-normal">{surchargeDescription}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: Mock Customer Live Preview (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block text-center">Giao diện xem trước của Khách hàng</span>
          
          {/* Mock App Card */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md flex flex-col font-sans max-w-sm mx-auto">
            {/* Header Image */}
            <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
              {coverImage ? (
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-350 bg-slate-50 border-b border-slate-150">
                  <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-wider">Chưa tải ảnh bìa</span>
                </div>
              )}

              {/* Float Sport Badge */}
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full border text-[9px] font-black uppercase shadow-xs bg-white ${getSportBadgeColor().split(' ')[1]} ${getSportBadgeColor().split(' ')[2]}`}>
                {getSportName()}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-800 leading-snug">{name || 'Tên cụm sân của bạn'}</h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                  <svg className="w-3.5 h-3.5 text-slate-350 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="truncate">{location || 'Địa chỉ cụm sân'}</span>
                </div>
              </div>

              {/* Price range display */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3 flex justify-between items-center text-xs font-black">
                <span className="text-slate-450 uppercase text-[9px] tracking-wider">Giá dao động:</span>
                <span className="text-brand-emerald">
                  {priceRange.min === 0 ? (
                    'Chưa khai báo giá'
                  ) : priceRange.min === priceRange.max ? (
                    `${formatVND(priceRange.min)} / ca`
                  ) : (
                    `${formatVND(priceRange.min)} - ${formatVND(priceRange.max)} / ca`
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                  <span>Hoạt động: {openingTime} - {closingTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 block" />
                  <span>Số sân lẻ: {courts.length} sân</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Preview */}
          {detailImages.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Thư viện ảnh chi tiết</span>
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                {detailImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumb ${idx}`}
                    className="w-16 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-150 shadow-3xs"
                  />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
