import React from 'react';
import { Card } from '@/components/ui/Card';

interface ReconciliationKpisProps {
  pendingAmount: number;
  completedAmount: number;
  commissionAmount: number;
  pendingCount: number;
  formatCurrency: (val: number) => string;
}

export const ReconciliationKpis: React.FC<ReconciliationKpisProps> = ({
  pendingAmount,
  completedAmount,
  commissionAmount,
  pendingCount,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 select-none">
      {/* KPI 1 - Số dư chờ thanh toán */}
      <Card className="p-5 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Số dư chờ đối soát</span>
          <span className="text-xl font-black text-amber-600 block">{formatCurrency(pendingAmount)}</span>
        </div>
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100/50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </Card>

      {/* KPI 2 - Đã thanh toán */}
      <Card className="p-5 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Đã thanh toán (kỳ này)</span>
          <span className="text-xl font-black text-brand-emerald block">{formatCurrency(completedAmount)}</span>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-brand-emerald border border-emerald-100/50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </Card>

      {/* KPI 3 - Hoa hồng hệ thống */}
      <Card className="p-5 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hoa hồng giữ lại</span>
          <span className="text-xl font-black text-slate-800 block">{formatCurrency(commissionAmount)}</span>
        </div>
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-200/50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </Card>

      {/* KPI 4 - Đối tác chờ thanh toán */}
      <Card className="p-5 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all duration-300">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Chủ sân chờ đối soát</span>
          <span className="text-xl font-black text-blue-600 block">{pendingCount} đối tác</span>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100/50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </Card>
    </div>
  );
};
