import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ComplexId, Complex } from '../../types';
import logoSvg from '../../../../assets/logo/light/logo-main_40x40px_small.svg';
import { 
  Building2, 
  MapPin, 
  ChevronDown, 
  Bell, 
  TrendingUp, 
  Percent, 
  Clock, 
  CheckCircle2, 
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';

interface MobileDashboardHeaderProps {
  selectedComplex: ComplexId;
  onChangeComplex: (val: ComplexId) => void;
  listComplexes: Complex[];
  stats: {
    revenue: number;
    revenueK: number;
    occupancy: number;
    pendingCount: number;
    activeRatio: string;
  };
}

export const MobileDashboardHeader: React.FC<MobileDashboardHeaderProps> = ({
  selectedComplex,
  onChangeComplex,
  listComplexes,
  stats
}) => {
  const navigate = useNavigate();
  const [isVenuePickerOpen, setIsVenuePickerOpen] = useState(false);

  const activeVenue = listComplexes.find(c => c.id === selectedComplex);
  const activeVenueName = selectedComplex === 'all' 
    ? 'Tất cả cụm sân Sporta' 
    : (activeVenue?.name || 'Cụm sân đã chọn');

  const activeVenueLocation = selectedComplex === 'all'
    ? 'Thống kê tổng hợp toàn hệ thống'
    : (activeVenue?.location || 'Khu vực quản lý');

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  return (
    <>
      <header
        className="relative bg-gradient-to-b from-[#002b1f] via-[#064e3b] to-[#043d2e] text-white rounded-b-[2.5rem] shadow-xl overflow-hidden z-20 pb-6 transition-all"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}
      >
        {/* Abstract Glow Effect Layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -left-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        </div>

        <div className="relative z-10 px-5 space-y-4">
          {/* Top Bar: Profile & Brand & Notification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-white/10 p-0.5 border border-white/25 backdrop-blur-md shadow-inner flex items-center justify-center overflow-hidden">
                  <img src={logoSvg} alt="Sporta Logo" className="w-8 h-8 object-contain drop-shadow" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#064e3b] rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-emerald-200/90 tracking-wide uppercase">Cổng chủ sân</span>
                  <span className="bg-brand-yellow/20 text-brand-yellow text-[9px] font-black px-1.5 py-0.5 rounded-full border border-brand-yellow/30">PRO</span>
                </div>
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Tổng quan hôm nay
                </h1>
              </div>
            </div>

            {/* Notification Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/notifications')}
                className="touch-target w-10 h-10 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform relative"
                aria-label="Thông báo"
              >
                <Bell className="w-5 h-5 text-emerald-100" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-yellow rounded-full ring-2 ring-[#064e3b] animate-pulse" />
              </button>
            </div>
          </div>

          {/* Facility Selector Card Button */}
          <button
            type="button"
            onClick={() => setIsVenuePickerOpen(true)}
            className="w-full bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/15 backdrop-blur-xl rounded-2xl p-3 text-left transition-all shadow-sm flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-yellow text-[#064e3b] flex items-center justify-center shrink-0 shadow-sm font-black">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Cụm sân đang xem</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                </div>
                <p className="text-sm font-black text-white truncate group-hover:text-brand-yellow transition-colors">
                  {activeVenueName}
                </p>
                <p className="text-[10px] text-white/60 font-medium truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0 text-brand-yellow/80" />
                  {activeVenueLocation}
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white/80 group-hover:bg-white/20 transition-all">
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {/* 4 KPI Metrics Grid (Native iOS card styling) */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* KPI 1: Doanh thu */}
            <div className="bg-white/10 border border-white/15 backdrop-blur-lg rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/90 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-yellow" />
                  Doanh thu
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div>
                <p className="text-lg font-black text-brand-yellow tracking-tight leading-none">
                  {formatVND(stats.revenue)}
                </p>
                <p className="text-[9px] text-white/70 font-semibold mt-1 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-300" />
                  Tự động cập nhật
                </p>
              </div>
            </div>

            {/* KPI 2: Tỉ lệ lấp đầy */}
            <div className="bg-white/10 border border-white/15 backdrop-blur-lg rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/90 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-300" />
                  Lấp đầy
                </span>
                <span className="text-[9px] font-black text-emerald-200 bg-white/15 px-1.5 py-0.5 rounded-md">
                  {stats.occupancy}%
                </span>
              </div>
              <div>
                <p className="text-lg font-black text-white tracking-tight leading-none">
                  {stats.occupancy}%
                </p>
                <div className="w-full bg-black/20 h-1.5 rounded-full mt-2 overflow-hidden border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-brand-yellow h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, stats.occupancy))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* KPI 3: Chờ check-in */}
            <div className="bg-white/10 border border-white/15 backdrop-blur-lg rounded-2xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/90 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  Chờ Check-in
                </span>
                {stats.pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-black text-white tracking-tight leading-none">
                    {stats.pendingCount}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-200/80">đơn chờ</span>
                </div>
                <p className="text-[9px] text-white/60 font-semibold mt-1">
                  {stats.pendingCount > 0 ? 'Khách chưa đến sân' : 'Tất cả đã nhận sân'}
                </p>
              </div>
            </div>

            {/* KPI 4: Sân hoạt động */}
            <div className="bg-white/10 border border-white/15 backdrop-blur-lg rounded-2xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/90 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-300" />
                  Sân mở
                </span>
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-black text-white tracking-tight leading-none">
                    {stats.activeRatio}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-200/80">sân</span>
                </div>
                <p className="text-[9px] text-white/60 font-semibold mt-1">
                  Sân mở / Tổng số sân
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Facility Picker Bottom Sheet Modal */}
      {isVenuePickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            className="fixed inset-0"
            onClick={() => setIsVenuePickerOpen(false)}
          />
          <div 
            className="relative w-full max-w-lg bg-white rounded-t-[2rem] p-6 shadow-2xl z-10 max-h-[80dvh] flex flex-col animate-slideUp"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Chọn cụm sân quản lý</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Dữ liệu thống kê sẽ được lọc theo cụm sân đã chọn</p>
              </div>
              <button
                onClick={() => setIsVenuePickerOpen(false)}
                className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 pb-4">
              {listComplexes.map((complex) => {
                const isSelected = selectedComplex === complex.id;
                return (
                  <button
                    key={complex.id}
                    type="button"
                    onClick={() => {
                      onChangeComplex(complex.id as ComplexId);
                      setIsVenuePickerOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'bg-emerald-50/70 border-brand-emerald shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black ${
                        isSelected 
                          ? 'bg-brand-emerald text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-black truncate ${isSelected ? 'text-brand-emerald' : 'text-slate-800'}`}>
                          {complex.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {complex.location}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-emerald text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default MobileDashboardHeader;
