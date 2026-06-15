import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

export const FacilityPage = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50 select-none animate-fadeIn">
        {/* Unified Mobile Header */}
        <header className="px-5 pt-12 pb-6 bg-brand-emerald text-white rounded-b-[2rem] shadow-md relative z-10 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden rounded-b-[2rem] pointer-events-none">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
          </div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-white/60 text-xs font-semibold tracking-wider">Sporty-Tech Owner App</p>
              <h1 className="text-xl font-black tracking-tight mt-0.5">Quản lý sân</h1>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-sm">
              <span className="font-bold text-sm text-brand-yellow">SA</span>
            </div>
          </div>
        </header>

        <main className="p-6 flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-24 h-24 bg-brand-yellow/10 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(6,78,59,0.05)] border border-brand-yellow/10">
            <svg className="w-12 h-12 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-slate-800 text-center">Quản lý Sân bãi</h2>
          <p className="text-xs text-slate-500 text-center max-w-xs leading-relaxed font-semibold">Trang cấu hình chi tiết danh sách sân bãi, phân loại sân (5v5, 7v7, 11v11) và quản lý khung giờ vàng.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="w-24 h-24 bg-brand-yellow/20 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      </div>
      <h2 className="text-xl font-bold text-on-surface mb-2">Quản lý sân bãi</h2>
      <p className="text-outline text-center max-w-sm px-4">Trang cấu hình và quản lý sân đang được xây dựng.</p>
    </div>
  );
};
