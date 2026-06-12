import React from 'react';

export const FacilityPage = () => {
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
