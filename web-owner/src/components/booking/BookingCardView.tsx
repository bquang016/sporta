import React from 'react';
import { MOCK_FACILITIES, getBookingBlocks, type SlotStatus, type BookingBlock, formatPrice } from './mockData';

export const BookingCardView = ({ isMobile }: { isMobile: boolean }) => {
  // Thu thập toàn bộ block từ tất cả các sân bóng và sắp xếp theo thứ tự thời gian bắt đầu
  const allBlocks: (BookingBlock & { facilityName: string; facilityType: string; pricePerHour: number })[] = [];
  for (const facility of MOCK_FACILITIES) {
    const blocks = getBookingBlocks(facility.id);
    for (const block of blocks) {
      allBlocks.push({
        ...block,
        facilityName: facility.name,
        facilityType: facility.type,
        pricePerHour: facility.pricePerHour
      });
    }
  }
  allBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getStatusDetails = (status: SlotStatus) => {
    switch (status) {
      case 'booked':
        return {
          label: 'Đã đặt',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
          accent: 'border-l-emerald-600',
          iconBg: 'bg-emerald-600 text-white',
          dot: 'bg-emerald-500'
        };
      case 'pending':
        return {
          label: 'Đang giữ',
          bg: 'bg-amber-50 text-amber-800 border-amber-200/50',
          accent: 'border-l-amber-500',
          iconBg: 'bg-amber-400 text-amber-950',
          dot: 'bg-amber-500'
        };
      case 'maintenance':
        return {
          label: 'Bảo trì',
          bg: 'bg-red-50 text-red-700 border-red-200/50',
          accent: 'border-l-red-500',
          iconBg: 'bg-red-500 text-white',
          dot: 'bg-red-500'
        };
      default:
        return {
          label: 'Trống',
          bg: 'bg-slate-50 text-slate-600 border-slate-200/50',
          accent: 'border-l-slate-400',
          iconBg: 'bg-slate-300 text-slate-700',
          dot: 'bg-slate-400'
        };
    }
  };

  const getStatusIcon = (status: SlotStatus) => {
    switch (status) {
      case 'booked':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'maintenance':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (allBlocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-black text-slate-500">Hôm nay không có lịch đặt sân nào</p>
        <p className="text-xs text-slate-400 mt-1">Các sân đều trống hoặc chưa được cập nhật</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${isMobile ? 'px-4 pb-28 grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      {allBlocks.map((block, idx) => {
        const details = getStatusDetails(block.status);
        const durationMins = block.slotCount * 30;
        const hours = Math.floor(durationMins / 60);
        const mins = durationMins % 60;
        const durationStr = hours > 0 ? `${hours}h${mins > 0 ? mins : ''}` : `${mins} phút`;
        const totalPrice = block.pricePerHour * (durationMins / 60);

        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] p-4 border-l-4 ${details.accent} hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
          >
            <div>
              {/* Thẻ Header (Tên & Badge trạng thái) */}
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${details.iconBg} shadow-sm`}>
                    {getStatusIcon(block.status)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-800 truncate group-hover:text-brand-emerald transition-colors">
                      {block.customerName || (block.status === 'maintenance' ? 'Lịch Bảo Trì Sân' : 'Không rõ')}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {block.facilityName} • {block.facilityType}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold border ${details.bg} flex-shrink-0`}>
                  {details.label}
                </span>
              </div>

              {/* Thông tin thời gian & doanh thu */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Khung giờ</span>
                  <span className="text-brand-emerald font-black">{block.startTime} – {block.endTime}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Thời lượng</span>
                  <span className="text-slate-700 font-bold">{durationStr}</span>
                </div>
                {block.status !== 'maintenance' && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Thành tiền</span>
                    <span className="text-slate-800 font-black">{formatPrice(totalPrice)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chân thẻ - Nút xem chi tiết */}
            <div className="mt-4 pt-2.5 border-t border-slate-50 flex justify-end">
              <span className="text-[10px] font-bold text-brand-emerald hover:text-emerald-950 flex items-center gap-1 transition-colors">
                Xem chi tiết lịch
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            
          </div>
        );
      })}
    </div>
  );
};
