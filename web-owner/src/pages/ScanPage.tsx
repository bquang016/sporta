import React from 'react';

export const ScanPage = () => {
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
