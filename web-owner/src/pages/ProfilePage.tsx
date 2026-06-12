import React from 'react';

export const ProfilePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      </div>
      <h2 className="text-xl font-bold text-on-surface mb-2">Hồ sơ tài khoản</h2>
      <p className="text-outline text-center max-w-sm px-4">Trang quản lý thông tin chủ sân đang được phát triển.</p>
    </div>
  );
};
