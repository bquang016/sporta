import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

export const ScanPage = () => {
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
              <h1 className="text-xl font-black tracking-tight mt-0.5">Quét mã QR</h1>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-sm">
              <span className="font-bold text-sm text-brand-yellow">SA</span>
            </div>
          </div>
        </header>

        <main className="p-6 flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-24 h-24 bg-brand-emerald/10 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(6,78,59,0.05)] border border-brand-emerald/10 animate-pulse">
            <svg className="w-12 h-12 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-slate-800 text-center">Camera Quét Mã Vé</h2>
          <p className="text-xs text-slate-500 text-center max-w-xs leading-relaxed font-semibold">Tính năng camera quét vé thực tế sẽ được tích hợp thông qua plugin Capacitor trên nền tảng Android/iOS.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="w-24 h-24 bg-brand-emerald/10 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
      </div>
      <h2 className="text-xl font-bold text-on-surface mb-2">Quét mã QR</h2>
      <p className="text-outline text-center max-w-sm px-4">Trang này đang được phát triển. Tính năng quét mã sẽ tích hợp Capacitor Camera ở đây.</p>
    </div>
  );
};
