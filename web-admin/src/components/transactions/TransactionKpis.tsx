import React from 'react';
import { Card } from '@/components/ui/Card';

interface TransactionKpisProps {
  revenue: number;
  bookingsCount: number;
  successRate: string;
  refunded: number;
  formatCurrency: (val: number) => string;
}

export const TransactionKpis: React.FC<TransactionKpisProps> = ({
  revenue,
  bookingsCount,
  successRate,
  refunded,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0 select-none">
      {/* KPI 1 - Doanh thu */}
      <Card className="p-5 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Doanh thu đặt sân</span>
          <span className="text-xl font-black text-brand-emerald block">{formatCurrency(revenue)}</span>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-brand-emerald border border-emerald-100/50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </Card>

      {/* KPI 2 - Tổng lượt đặt */}
      <Card className="p-5 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Khối lượng giao dịch</span>
          <span className="text-xl font-black text-slate-800 block">{bookingsCount} lượt</span>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100/50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </Card>

      {/* KPI 3 - Tỉ lệ thành công */}
      <Card className="p-5 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tỷ lệ thành công</span>
          <span className="text-xl font-black text-slate-800 block">{successRate}%</span>
        </div>
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100/50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </Card>

      {/* KPI 4 - Tiền hoàn lại */}
      <Card className="p-5 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dòng tiền hoàn trả</span>
          <span className="text-xl font-black text-red-600 block">{formatCurrency(refunded)}</span>
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
