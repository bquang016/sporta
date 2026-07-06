import React from 'react';

interface VenueStatsProps {
  showStats: boolean;
  totalVenues: number;
  totalCourts: number;
  activeCourts: number;
}

export const VenueStats = ({ showStats, totalVenues, totalCourts, activeCourts }: VenueStatsProps) => {
  if (!showStats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 select-none animate-fadeIn">
      <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tong so cum san</p>
          <h3 className="text-2xl font-black text-slate-800">{totalVenues}</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Tong so san nho</p>
          <h3 className="text-2xl font-black text-brand-emerald">{totalCourts}</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">San dang Hoạt động</p>
          <h3 className="text-2xl font-black text-emerald-600">{activeCourts}</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
