import React from 'react';
import { Card } from '@/components/ui/Card';

interface TransactionKpisProps {
  revenue: number;
  totalCommission: number;
  bookingsCount: number;
  successRate: string;
  refunded: number;
  formatCurrency: (val: number) => string;
}

export const TransactionKpis: React.FC<TransactionKpisProps> = ({
  revenue,
  totalCommission,
  bookingsCount,
  successRate,
  refunded,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 select-none">
      {/* KPI 1 - Doanh thu gộp */}
      <Card className="p-5 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300 bg-white">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tổng tiền đặt sân</span>
          <span className="text-xl font-black text-brand-emerald block">{formatCurrency(revenue)}</span>
          <span className="text-[10px] text-slate-400 font-semibold block">Khách đã thanh toán</span>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-brand-emerald border border-emerald-100/50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </Card>

      {/* KPI 2 - Hoa hồng nền tảng */}
      <Card className="p-5 border border-amber-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300 bg-gradient-to-br from-amber-50/50 to-orange-50/20">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Hoa hồng Sporta (10%)</span>
          <span className="text-xl font-black text-amber-600 block">{formatCurrency(totalCommission)}</span>
          <span className="text-[10px] text-amber-700/70 font-semibold block">Doanh thu sàn thực nhận</span>
        </div>
        <div className="w-12 h-12 bg-amber-100/70 rounded-2xl flex items-center justify-center text-amber-700 border border-amber-200/60">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </Card>

      {/* KPI 3 - Tổng lượt đặt & Tỷ lệ thành công */}
      <Card className="p-5 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300 bg-white">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Khối lượng giao dịch</span>
          <span className="text-xl font-black text-slate-800 block">{bookingsCount} lượt</span>
          <span className="text-[10px] text-blue-600 font-bold block">Tỷ lệ thành công: {successRate}%</span>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100/50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </Card>

      {/* KPI 4 - Tiền hoàn lại */}
      <Card className="p-5 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300 bg-white">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dòng tiền hoàn trả</span>
          <span className="text-xl font-black text-red-600 block">{formatCurrency(refunded)}</span>
          <span className="text-[10px] text-slate-400 font-semibold block">Đã hoàn lại ví người dùng</span>
        </div>
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100/50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-6a4 4 0 00-8 0v6m8 0a2 2 0 11-4 0m4 0H8m-2 4h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2z" />
          </svg>
        </div>
      </Card>
    </div>
  );
};
