import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking, Complex } from '../../types';
import { 
  ClipboardList, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  User,
  MapPin,
  Sparkles
} from 'lucide-react';

interface MobileBookingListProps {
  currentBookings: Booking[];
  listComplexes: Complex[];
  onCheckinDirect: (bookingId: string) => void;
}

type BookingFilter = 'all' | 'pending' | 'checked-in';

export const MobileBookingList: React.FC<MobileBookingListProps> = ({
  currentBookings,
  listComplexes: _listComplexes,
  onCheckinDirect
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<BookingFilter>('all');

  const pendingCount = currentBookings.filter(b => b.status === 'pending-checkin').length;
  const checkedInCount = currentBookings.filter(b => b.status === 'checked-in').length;

  const filteredBookings = currentBookings.filter(b => {
    if (filter === 'pending') return b.status === 'pending-checkin';
    if (filter === 'checked-in') return b.status === 'checked-in';
    return true;
  });

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  return (
    <section className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center font-bold">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Đơn đặt gần đây
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Tự động duyệt từ ứng dụng khách</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/matrix')}
          className="touch-target text-[11px] font-black text-[#064e3b] hover:text-emerald-900 active:scale-95 flex items-center gap-0.5 uppercase tracking-wider"
        >
          <span>Xem tất cả</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200/50">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            filter === 'all'
              ? 'bg-white text-[#064e3b] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Tất cả</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${filter === 'all' ? 'bg-emerald-100 text-[#064e3b]' : 'bg-slate-200 text-slate-600'}`}>
            {currentBookings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            filter === 'pending'
              ? 'bg-white text-[#064e3b] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Chờ nhận sân</span>
          {pendingCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-black">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('checked-in')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            filter === 'checked-in'
              ? 'bg-white text-[#064e3b] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Đã nhận sân</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${filter === 'checked-in' ? 'bg-emerald-100 text-[#064e3b]' : 'bg-slate-200 text-slate-600'}`}>
            {checkedInCount}
          </span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-2.5">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Không có đơn đặt nào trong danh mục này
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const isCheckedIn = booking.status === 'checked-in';
            return (
              <div
                key={booking.id}
                className="p-3.5 rounded-2xl border border-slate-200/70 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Court Badge Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center font-black text-xs text-[#064e3b] shrink-0">
                      {booking.pitchName.replace(/Sân\s*/i, 'S')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-xs text-slate-800 truncate flex items-center gap-1.5">
                        {booking.customerName}
                        {booking.phone && (
                          <span className="text-[10px] text-slate-400 font-normal">({booking.phone})</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold truncate mt-0.5">
                        {booking.pitchName} • {booking.date ? `${booking.date} (${booking.time})` : booking.time}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[#064e3b]">
                      {formatVND(booking.amount)}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">
                      Đã thanh toán
                    </span>
                  </div>
                </div>

                {/* Bottom Action / Status row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <span>Mã đơn: <strong className="text-slate-600 font-mono">{booking.id}</strong></span>
                  </div>

                  {isCheckedIn ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Đã Check-in
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onCheckinDirect(booking.id)}
                      className="touch-target min-h-[34px] px-3.5 py-1.5 bg-[#064e3b] active:bg-emerald-950 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1"
                    >
                      <span>Nhận sân (Check-in)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
export default MobileBookingList;
