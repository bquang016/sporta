import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';

export const DesktopHome = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-outline uppercase tracking-wider">Doanh thu hôm nay</h3>
            <div className="w-8 h-8 rounded-full bg-brand-yellow/20 text-brand-secondary flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-on-surface">2,450,000đ</p>
        </Card>
        
        <Card className="p-6 border-none shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-outline uppercase tracking-wider">Đơn chờ duyệt</h3>
            <div className="w-8 h-8 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-on-surface">12</p>
            <p className="text-sm font-medium text-brand-emerald mb-1">Lượt</p>
          </div>
        </Card>
        
        <Card className="p-6 border-none shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-outline uppercase tracking-wider">Tỉ lệ lấp đầy</h3>
            <div className="w-8 h-8 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-on-surface">65%</p>
            <p className="text-sm font-medium text-brand-emerald mb-1">+5% so với tuần trước</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main section: Table/List */}
        <Card className="lg:col-span-2 p-6 border-none shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-on-surface">Lịch đặt sân sắp tới</h2>
            <button onClick={() => navigate('/matrix')} className="text-sm font-semibold text-brand-emerald hover:text-emerald-800 transition-colors">Xem toàn bộ</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-variant text-sm text-outline">
                  <th className="pb-3 font-semibold w-1/4">Tên Sân</th>
                  <th className="pb-3 font-semibold w-1/4">Thời gian</th>
                  <th className="pb-3 font-semibold w-1/4">Khách hàng</th>
                  <th className="pb-3 font-semibold w-1/4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-surface-variant/50 last:border-0 hover:bg-surface-container-lowest transition-colors">
                    <td className="py-4 font-bold">Sân {i} (5v5)</td>
                    <td className="py-4 font-medium text-on-surface-variant">18:00 - 19:30</td>
                    <td className="py-4 text-on-surface-variant">Nguyễn Văn A</td>
                    <td className="py-4 text-right">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-surface-container-high text-brand-emerald">
                        Đã thanh toán
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Sidebar section: Quick Actions */}
        <Card className="p-6 border-none shadow-sm">
          <h2 className="text-lg font-bold text-on-surface mb-6">Thao tác nhanh</h2>
          <div className="space-y-4">
            <button onClick={() => navigate('/scan')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-surface-variant hover:border-brand-emerald hover:bg-brand-emerald/5 transition-all text-left group">
              <div className="w-12 h-12 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center group-hover:bg-brand-emerald group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Quét mã QR</h3>
                <p className="text-xs text-outline mt-1">Xác nhận check-in nhanh chóng</p>
              </div>
            </button>
            
            <button onClick={() => navigate('/facility')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-surface-variant hover:border-brand-emerald hover:bg-brand-emerald/5 transition-all text-left group">
              <div className="w-12 h-12 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center group-hover:bg-brand-emerald group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Cấu hình sân</h3>
                <p className="text-xs text-outline mt-1">Cập nhật giá và trạng thái sân</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
