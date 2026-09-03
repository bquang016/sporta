import React, { useState, useEffect } from 'react';
import { courtService } from '../../venue/services/courtService';
import type { VenueResponse } from '../../venue/types';
import { reportService } from '../services/reportService';
import type { OwnerRevenueReportResponse } from '../types/report.types';
import { formatCurrency, exportToExcel, exportToPrintablePdf } from '../utils/exportUtils';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Dropdown, type DropdownOption } from '../../../components/ui/Dropdown';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { MobileRevenueReportPage } from './MobileRevenueReportPage';

export const RevenueReportPage: React.FC = () => {
  const isMobile = useIsMobile();

  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [timePreset, setTimePreset] = useState<string>('this_month');

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState<string>(firstDayOfMonth);
  const [toDate, setToDate] = useState<string>(todayStr);

  const [reportData, setReportData] = useState<OwnerRevenueReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Venues on Mount
  useEffect(() => {
    courtService.getVenues()
      .then((data) => {
        if (data && data.length > 0) {
          setVenues(data);
          const savedVenueId = localStorage.getItem('selectedVenueId');
          if (savedVenueId && data.some(v => v.id === savedVenueId)) {
            setSelectedVenueId(savedVenueId);
          } else {
            setSelectedVenueId(data[0].id);
          }
        }
      })
      .catch((err) => {
        console.error('Lỗi lấy danh sách sân:', err);
      });
  }, []);

  // Handle Preset Changes
  const handlePresetChange = (preset: string) => {
    setTimePreset(preset);
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === 'today') {
      start = now;
      end = now;
    } else if (preset === 'last_7_days') {
      start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      end = now;
    } else if (preset === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
    } else if (preset === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (preset === 'this_year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = now;
    }

    setFromDate(start.toISOString().split('T')[0]);
    setToDate(end.toISOString().split('T')[0]);
  };

  // Fetch Report Data
  const fetchReport = async () => {
    if (!selectedVenueId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getRevenueReport(selectedVenueId, fromDate, toDate);
      setReportData(data);
    } catch (err: any) {
      console.error('Lỗi khi tải báo cáo doanh thu:', err);
      setError(err.message || 'Không thể lấy dữ liệu báo cáo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVenueId) {
      fetchReport();
    }
  }, [selectedVenueId, fromDate, toDate]);

  if (isMobile) {
    return (
      <MobileRevenueReportPage
        venues={venues}
        selectedVenueId={selectedVenueId}
        setSelectedVenueId={setSelectedVenueId}
        timePreset={timePreset}
        handlePresetChange={handlePresetChange}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        reportData={reportData}
        isLoading={isLoading}
        error={error}
        onRefresh={fetchReport}
      />
    );
  }

  const maxGmvInTimeline = reportData?.dailyTimeline
    ? Math.max(...reportData.dailyTimeline.map(p => p.gmv), 1)
    : 1;

  const venueDropdownOptions: DropdownOption[] = venues.map((v) => ({
    value: v.id,
    label: v.name,
    icon: (
      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  }));

  return (
    <div className="space-y-6 pb-12 w-full animate-in fade-in duration-300">
        {/* Top Header & Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Báo Cáo Doanh Thu & Dòng Tiền</h1>
              <span className="bg-emerald-100 text-brand-emerald text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                Kế toán & Đối soát
              </span>
            </div>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Giám sát tổng doanh thu gộp (GMV), thực nhận (90%), phí dịch vụ sàn (10%) và phân rã nguồn thu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Select Venue Dropdown */}
            <div className="min-w-[220px]">
              <Dropdown
                options={venueDropdownOptions}
                value={selectedVenueId}
                onChange={(val) => {
                  setSelectedVenueId(val);
                  localStorage.setItem('selectedVenueId', val);
                }}
                placeholder="Chọn cụm sân"
              />
            </div>

            {/* Export Buttons */}
            {reportData && (
              <>
                <button
                  onClick={() => exportToExcel(reportData)}
                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-brand-emerald border border-emerald-200/80 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs h-[42px]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Xuất Excel (.xlsx)</span>
                </button>

                <button
                  onClick={() => exportToPrintablePdf(reportData)}
                  className="flex items-center gap-2 bg-primary text-white hover:bg-emerald-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs h-[42px]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>In / Export PDF</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Date Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {[
              { key: 'today', label: 'Hôm nay' },
              { key: 'last_7_days', label: '7 ngày qua' },
              { key: 'this_month', label: 'Tháng này' },
              { key: 'last_month', label: 'Tháng trước' },
              { key: 'this_year', label: 'Năm nay' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => handlePresetChange(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  timePreset === p.key
                    ? 'bg-brand-emerald text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Picker Inputs */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Khoảng ngày:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setTimePreset('custom');
                setFromDate(e.target.value);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl outline-none focus:border-brand-emerald"
            />
            <span className="text-slate-400 font-bold">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setTimePreset('custom');
                setToDate(e.target.value);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl outline-none focus:border-brand-emerald"
            />
          </div>
        </div>

        {/* Loading / Error State */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200/80">
            <LoadingSpinner size="lg" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tổng hợp báo cáo doanh thu...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button
              onClick={fetchReport}
              className="mt-3 px-4 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 hover:bg-red-100"
            >
              Thử lại
            </button>
          </div>
        ) : reportData ? (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total GMV */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Doanh Thu Gộp (GMV)</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(reportData.totalGmv)}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  Tổng giá trị giao dịch đơn đặt thành công
                </p>
              </div>

              {/* Card 2: Net Revenue (90%) */}
              <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200/70 shadow-xs relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase text-brand-emerald tracking-wider">Thực Nhận Về Ví (90%)</span>
                    <h3 className="text-2xl font-black text-brand-emerald mt-1">{formatCurrency(reportData.netRevenue)}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-brand-emerald border border-emerald-200 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-emerald-800/80 mt-3 pt-3 border-t border-emerald-100">
                  Số tiền chủ sân thực sự nhận được
                </p>
              </div>

              {/* Card 3: Commission Fee (10%) */}
              <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/70 shadow-xs relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Phí Sàn Sporta (10%)</span>
                    <h3 className="text-2xl font-black text-amber-700 mt-1">{formatCurrency(reportData.commissionFee)}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-amber-800/80 mt-3 pt-3 border-t border-amber-100">
                  Chiết khấu dịch vụ nền tảng trích tự động
                </p>
              </div>

              {/* Card 4: Orders & AOV */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Đơn Hàng & Giá Trị TB</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{reportData.totalBookings} đơn</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-600 mt-3 pt-3 border-t border-slate-100">
                  AOV: <span className="font-black text-brand-emerald">{formatCurrency(reportData.averageOrderValue)}</span> / đơn
                </p>
              </div>
            </div>

            {/* Breakdown Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Source */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-emerald"></span>
                  Phân Rã Theo Nguồn Thu
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Đặt Sân Lẻ (Khách tự do)</span>
                      <span className="text-slate-900">{formatCurrency(reportData.bookingSingleAmount)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-emerald h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${reportData.totalGmv > 0 ? (reportData.bookingSingleAmount / reportData.totalGmv) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Đặt Sân Cố Định (Lịch cố định hàng tuần)</span>
                      <span className="text-slate-900">{formatCurrency(reportData.bookingFixedAmount)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${reportData.totalGmv > 0 ? (reportData.bookingFixedAmount / reportData.totalGmv) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Vé Lượt (Vé séc / Ca giao lưu)</span>
                      <span className="text-slate-900">{formatCurrency(reportData.ticketSessionAmount)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${reportData.totalGmv > 0 ? (reportData.ticketSessionAmount / reportData.totalGmv) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue by Payment Method */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Phân Rã Theo Phương Thức Thanh Toán
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        QR
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Chuyển khoản PayOS / Ngân hàng</p>
                        <p className="text-[10px] text-slate-400 font-medium">Thanh toán trực tuyến cổng PayOS</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">{formatCurrency(reportData.payosAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-brand-emerald flex items-center justify-center font-bold text-xs">
                        VÍ
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Ví Điện Tử Sporta</p>
                        <p className="text-[10px] text-slate-400 font-medium">Trừ trực tiếp số dư ví người dùng</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">{formatCurrency(reportData.walletAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        TM
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Tiền Mặt Tại Quầy</p>
                        <p className="text-[10px] text-slate-400 font-medium">Thu trực tiếp tại lễ tân cụm sân</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">{formatCurrency(reportData.cashAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Timeline Visual Chart & Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider mb-6 flex items-center justify-between">
                <span>Diễn Biến Doanh Thu Theo Ngày</span>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {reportData.dailyTimeline.length} điểm dữ liệu
                </span>
              </h3>

              {/* Simple Visual SVG Bar Chart */}
              {reportData.dailyTimeline.length > 0 && (
                <div className="h-44 flex items-end gap-2 pb-6 pt-2 overflow-x-auto border-b border-slate-100 matrix-scroll">
                  {reportData.dailyTimeline.map((p, idx) => {
                    const heightPct = Math.max(8, (p.gmv / maxGmvInTimeline) * 100);
                    return (
                      <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group">
                        <div className="w-full bg-slate-100 rounded-t-md h-32 flex items-end relative overflow-hidden">
                          <div
                            className="w-full bg-brand-emerald group-hover:bg-emerald-500 rounded-t-md transition-all duration-300 relative"
                            style={{ height: `${heightPct}%` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-10">
                              {formatCurrency(p.gmv)}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                          {p.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Data Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Ngày</th>
                      <th className="px-4 py-3 text-right">Doanh Thu Gộp (GMV)</th>
                      <th className="px-4 py-3 text-right text-emerald-700 bg-emerald-50/50">Thực Nhận (90%)</th>
                      <th className="px-4 py-3 text-right text-amber-700 bg-amber-50/50">Phí Sàn (10%)</th>
                      <th className="px-4 py-3 text-center">Số Đơn Đặt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reportData.dailyTimeline.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-800">{p.date}</td>
                        <td className="px-4 py-3 text-right font-black text-slate-900">{formatCurrency(p.gmv)}</td>
                        <td className="px-4 py-3 text-right font-black text-brand-emerald bg-emerald-50/20">{formatCurrency(p.netRevenue)}</td>
                        <td className="px-4 py-3 text-right font-black text-amber-600 bg-amber-50/20">{formatCurrency(p.gmv * 0.10)}</td>
                        <td className="px-4 py-3 text-center font-bold">{p.bookingCount} đơn</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
  );
};
