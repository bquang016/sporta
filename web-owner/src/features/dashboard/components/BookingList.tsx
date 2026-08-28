import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import type { Booking, Complex } from '../types';

interface BookingListProps {
  isMobile: boolean;
  currentBookings: Booking[];
  listComplexes: Complex[];
  onCheckinDirect: (bookingId: string) => void;
}

export const BookingList = ({
  isMobile,
  currentBookings,
  listComplexes,
  onCheckinDirect
}: BookingListProps) => {
  const navigate = useNavigate();

  if (isMobile) {
    return (
      <section className="w-full">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide">Đơn đặt gần đây (Tự động duyệt)</h2>
          <button 
            onClick={() => navigate('/matrix')} 
            className="text-[10px] font-bold text-brand-emerald hover:text-emerald-950 transition-colors"
          >
            Xem tất cả
          </button>
        </div>

        <div className="space-y-3">
          {currentBookings.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs font-bold bg-white rounded-2xl border border-slate-200/50">
              Không có đơn đặt nào
            </div>
          ) : (
            currentBookings.map((b) => (
              <Card key={b.id} className="p-4 border-none shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-brand-emerald border border-slate-200">
                      {b.pitchName.substring(4)}
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-slate-800">{b.customerName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{b.pitchName} • {b.date ? `${b.date} (${b.time})` : b.time}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="text-[11px] font-black text-slate-700">
                      {new Intl.NumberFormat('vi-VN').format(b.amount)}đ
                    </span>
                    {b.status === 'checked-in' ? (
                      <span className="text-[8px] font-black uppercase text-brand-emerald bg-emerald-50 px-2 py-0.5 rounded-md">
                        Checked-in
                      </span>
                    ) : (
                      <button
                        onClick={() => onCheckinDirect(b.id)}
                        className="text-[8px] font-extrabold uppercase text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded-md border border-blue-100 transition-colors"
                      >
                        Check-in
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    );
  }

  // Desktop Booking Table
  return (
    <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Lịch đặt gần đây</h2>
          <p className="text-xs text-slate-400 font-medium">Đơn đặt thành công trực tiếp được chuyển từ hệ thống người dùng</p>
        </div>
        <button 
          onClick={() => navigate('/matrix')} 
          className="text-xs font-extrabold text-brand-emerald hover:text-emerald-950 transition-colors flex items-center gap-1 focus:outline-none"
        >
          <span>Xem sơ đồ sân</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-variant text-[10px] text-outline uppercase tracking-wider font-extrabold">
              <th className="pb-3 text-center w-12">Mã vé</th>
              <th className="pb-3 pl-4">Sân bóng</th>
              <th className="pb-3">Thời gian</th>
              <th className="pb-3">Khách hàng</th>
              <th className="pb-3 text-right">Tổng tiền</th>
              <th className="pb-3 text-right pr-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {currentBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                  Không có đơn đặt nào cho cụm sân này.
                </td>
              </tr>
            ) : (
              currentBookings.map((b) => (
                <tr key={b.id} className="border-b border-surface-variant/40 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 text-center font-bold text-slate-400">#{b.id}</td>
                  <td className="py-4 pl-4">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800">{b.pitchName}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {listComplexes.find(c => c.id === b.complexId)?.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 font-bold text-slate-700">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{b.time}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{b.date || 'Hôm nay'}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{b.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{b.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right font-black text-slate-800">
                    {new Intl.NumberFormat('vi-VN').format(b.amount)}đ
                  </td>
                  <td className="py-4 text-right pr-4">
                    {b.status === 'checked-in' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-brand-emerald border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
                        Đã check-in
                      </span>
                    ) : (
                      <button
                        onClick={() => onCheckinDirect(b.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 transition-all"
                      >
                        Check-in
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
export default BookingList;
