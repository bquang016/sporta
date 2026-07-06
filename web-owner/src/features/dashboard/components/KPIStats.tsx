import React from 'react';
import { Card } from '../../../components/ui/Card';

interface KPIStatsProps {
  stats: {
    revenue: number;
    occupancy: number;
    pendingCount: number;
    activeRatio: string;
  };
}

export const KPIStats = ({ stats }: KPIStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
      {/* KPI: Doanh thu */}
      <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-brand-yellow/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
        <div className="flex justify-between items-start z-10">
          <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-wider">Doanh thu hôm nay</h3>
          <div className="w-8 h-8 rounded-xl bg-brand-yellow/15 text-brand-secondary flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="z-10">
          <p className="text-2xl font-black text-slate-800 tracking-tight">
            {new Intl.NumberFormat('vi-VN').format(stats.revenue)}đ
          </p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Đã cập nhật tự động
          </p>
        </div>
      </Card>

      {/* KPI: Tỉ lệ lấp đầy */}
      <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-brand-emerald/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
        <div className="flex justify-between items-start z-10">
          <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-wider">Tỉ lệ lấp đầy sân</h3>
          <div className="w-8 h-8 rounded-xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div className="z-10">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.occupancy}%</p>
            <p className="text-[10px] text-brand-emerald font-bold">Lượt bận/Trống</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-brand-emerald h-full rounded-full transition-all duration-500" style={{ width: `${stats.occupancy}%` }}></div>
          </div>
        </div>
      </Card>

      {/* KPI: Lượt check-in đang chờ */}
      <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
        <div className="flex justify-between items-start z-10">
          <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-wider">Lượt chờ check-in</h3>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="z-10">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.pendingCount}</p>
            <p className="text-[10px] text-blue-600 font-bold">Khách chưa check-in</p>
          </div>
          <p className="text-[9px] text-slate-400 font-medium mt-1">Đơn hàng tự động duyệt thành công</p>
        </div>
      </Card>

      {/* KPI: Tỉ lệ sân hoạt động */}
      <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
        <div className="flex justify-between items-start z-10">
          <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-wider">Sân sẵn sàng</h3>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <div className="z-10">
          <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.activeRatio}</p>
          <p className="text-[10px] text-purple-600 font-bold mt-1">Sân đang mở / Tổng số sân</p>
        </div>
      </Card>
    </div>
  );
};
export default KPIStats;
