import React from 'react';
import type { VenueResponse } from '../../venue/types';
import type { OwnerRevenueReportResponse } from '../types/report.types';
import { formatCurrency, exportToExcel, exportToPrintablePdf } from '../utils/exportUtils';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Dropdown, type DropdownOption } from '../../../components/ui/Dropdown';

interface Props {
  venues: VenueResponse[];
  selectedVenueId: string;
  setSelectedVenueId: (id: string) => void;
  timePreset: string;
  handlePresetChange: (preset: string) => void;
  fromDate: string;
  setFromDate: (date: string) => void;
  toDate: string;
  setToDate: (date: string) => void;
  reportData: OwnerRevenueReportResponse | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const MobileRevenueReportPage: React.FC<Props> = ({
  venues,
  selectedVenueId,
  setSelectedVenueId,
  timePreset,
  handlePresetChange,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  reportData,
  isLoading,
  error,
  onRefresh,
}) => {
  const venueOptions: DropdownOption[] = venues.map((v) => ({
    value: v.id,
    label: v.name,
  }));

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-800 animate-in fade-in duration-300">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 bg-primary text-white p-4 shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-base font-black tracking-tight">Báo Cáo Doanh Thu</h1>
          <p className="text-[10px] text-white/70 font-medium">Đối soát tài chính & Dòng tiền</p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 bg-white/10 rounded-xl hover:bg-white/20 active:scale-95 transition-all text-xs font-bold"
        >
          🔄
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Venue Selector */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">
            Chọn cụm sân báo cáo
          </label>
          <Dropdown
            options={venueOptions}
            value={selectedVenueId}
            onChange={(val) => {
              setSelectedVenueId(val);
              localStorage.setItem('selectedVenueId', val);
            }}
            placeholder="Chọn cụm sân"
          />
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 matrix-scroll">
          {[
            { key: 'today', label: 'Hôm nay' },
            { key: 'last_7_days', label: '7 ngày' },
            { key: 'this_month', label: 'Tháng này' },
            { key: 'last_month', label: 'Tháng trước' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => handlePresetChange(p.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                timePreset === p.key
                  ? 'bg-brand-emerald text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2 text-xs">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-1/2 bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-700 outline-none"
          />
          <span className="text-slate-400 font-bold">-</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-1/2 bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-700 outline-none"
          />
        </div>

        {/* Loading / Error State */}
        {isLoading ? (
          <div className="h-48 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
            <LoadingSpinner size="md" />
            <span className="text-xs font-bold text-slate-400 uppercase">Đang tải báo cáo...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center bg-white rounded-2xl border border-red-200">
            <p className="text-xs font-bold text-red-600">{error}</p>
          </div>
        ) : reportData ? (
          <>
            {/* 2x2 KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[9px] font-black uppercase text-slate-400">Doanh Thu Gộp</span>
                <p className="text-base font-black text-slate-900 mt-1">{formatCurrency(reportData.totalGmv)}</p>
                <span className="text-[9px] text-slate-400 block mt-1">Tổng GMV đơn</span>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
                <span className="text-[9px] font-black uppercase text-brand-emerald">Thực Nhận (90%)</span>
                <p className="text-base font-black text-brand-emerald mt-1">{formatCurrency(reportData.netRevenue)}</p>
                <span className="text-[9px] text-emerald-700 block mt-1">Về ví chủ sân</span>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[9px] font-black uppercase text-amber-700">Phí Sàn (10%)</span>
                <p className="text-base font-black text-amber-700 mt-1">{formatCurrency(reportData.commissionFee)}</p>
                <span className="text-[9px] text-amber-800 block mt-1">Sporta chiết khấu</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[9px] font-black uppercase text-slate-400">Số Lượt Đặt</span>
                <p className="text-base font-black text-slate-900 mt-1">{reportData.totalBookings} đơn</p>
                <span className="text-[9px] text-slate-400 block mt-1">Đơn thành công</span>
              </div>
            </div>

            {/* Breakdown Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-800">Nguồn Thu Chi Tiết</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Đặt sân lẻ</span>
                  <span>{formatCurrency(reportData.bookingSingleAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Đặt sân cố định</span>
                  <span>{formatCurrency(reportData.bookingFixedAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Vé lượt (vé xé)</span>
                  <span>{formatCurrency(reportData.ticketSessionAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-800">Phương Thức Thanh Toán</h3>

              <div className="space-y-2 text-xs font-bold">
                <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                  <span>PayOS / Chuyển khoản</span>
                  <span className="font-black">{formatCurrency(reportData.payosAmount)}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                  <span>Ví Sporta</span>
                  <span className="font-black text-brand-emerald">{formatCurrency(reportData.walletAmount)}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                  <span>Tiền mặt</span>
                  <span className="font-black text-amber-700">{formatCurrency(reportData.cashAmount)}</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Sticky Bottom Actions Bar */}
      {reportData && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 z-40 flex gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <button
            onClick={() => exportToExcel(reportData)}
            className="flex-1 bg-emerald-50 text-brand-emerald border border-emerald-200 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>📥 Xuất Excel</span>
          </button>

          <button
            onClick={() => exportToPrintablePdf(reportData)}
            className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>🖨️ In / PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};
