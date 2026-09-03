import React, { useState, useEffect } from 'react';
import { getAdminSportsAnalytics, type AdminSportsAnalyticsResponse } from '@/api/adminReportApi';
import { formatCurrency } from '@/utils/exportAdminUtils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const SportsAnalyticsWidget: React.FC = () => {
  const [data, setData] = useState<AdminSportsAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getAdminSportsAnalytics()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Lỗi khi tải báo cáo phân tích Admin:', err);
        setError(err.message || 'Không thể tải dữ liệu');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-64 flex flex-col items-center justify-center gap-2">
        <LoadingSpinner size="md" />
        <span className="text-xs font-bold text-slate-400 uppercase">Đang phân tích dữ liệu môn thể thao & khu vực...</span>
      </div>
    );
  }

  if (error || !data) {
    return null; // Silent fallback if no backend connection
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Sports Breakdown Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald"></span>
              Phân Tích Doanh Thu Theo Môn Thể Thao
            </h3>
            <p className="text-xs text-slate-500 font-medium">Tỷ lệ đóng góp doanh thu của các bộ môn trên nền tảng</p>
          </div>
          <span className="text-xs font-black text-brand-emerald bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            {data.sportsBreakdown.length} Môn
          </span>
        </div>

        <div className="space-y-4 mt-4">
          {data.sportsBreakdown.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">{s.sportName} ({s.bookingCount} lượt đặt)</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 font-black">{formatCurrency(s.totalGmv)}</span>
                  <span className="text-[11px] text-brand-emerald bg-emerald-50 px-1.5 py-0.2 rounded font-mono font-extrabold">
                    {s.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-emerald h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, s.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Breakdown Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Phân Tích Doanh Thu Theo Tỉnh / Thành Phố
            </h3>
            <p className="text-xs text-slate-500 font-medium">Phân bổ thị trường theo vị trí địa lý của cụm sân</p>
          </div>
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            {data.regionBreakdown.length} Tỉnh/Thành
          </span>
        </div>

        <div className="space-y-4 mt-4">
          {data.regionBreakdown.map((r, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">{r.provinceName} ({r.venueCount} cụm sân)</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 font-black">{formatCurrency(r.totalGmv)}</span>
                  <span className="text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-mono font-extrabold">
                    {r.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, r.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
