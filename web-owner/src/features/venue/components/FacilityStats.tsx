import React from 'react';

interface FacilityStatsProps {
  showStats: boolean;
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export const FacilityStats = ({ showStats, totalCount, approvedCount, pendingCount, rejectedCount }: FacilityStatsProps) => {
  if (!showStats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 select-none animate-fadeIn">
      <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng số sân</p>
          <h3 className="text-2xl font-black text-slate-800">{totalCount}</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Sân hoạt động</p>
          <h3 className="text-2xl font-black text-brand-emerald">{approvedCount}</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Đơn chờ duyệt</p>
          <h3 className="text-2xl font-black text-amber-500">{pendingCount}</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">Bị từ chối duyệt</p>
          <h3 className="text-2xl font-black text-red-500">{rejectedCount}</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
