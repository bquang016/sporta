import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';

export const MobileHome = () => {
  const navigate = useNavigate();

  return (
    <div className="font-sans">
      {/* Header */}
      <header className="px-5 pt-12 pb-8 bg-brand-emerald text-white rounded-b-3xl shadow-sm relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <p className="text-brand-emerald-dim text-sm font-medium opacity-80 mb-1">Chào buổi sáng,</p>
            <h1 className="text-2xl font-bold tracking-tight">Sporta Arena</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
            <span className="font-bold text-lg">SA</span>
          </div>
        </div>
        
        {/* Quick Stats inside Header */}
        <div className="flex gap-4 relative z-10">
          <div className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Doanh thu</p>
            <p className="text-2xl font-bold text-brand-yellow">2,450k</p>
          </div>
          <div className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Chờ duyệt</p>
            <p className="text-2xl font-bold">12 Lượt</p>
          </div>
        </div>
      </header>

      <main className="px-5 pt-8 space-y-10">
        
        {/* Quick Actions */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-on-background tracking-tight">Thao tác nhanh</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card onClick={() => navigate('/scan')} className="p-5 flex flex-col items-center justify-center gap-3 active:scale-[0.98] transition-transform cursor-pointer border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(6,78,59,0.08)]">
              <div className="w-12 h-12 bg-brand-emerald/10 rounded-full flex items-center justify-center text-brand-emerald">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              </div>
              <span className="font-semibold text-sm text-on-background">Quét mã QR</span>
            </Card>
            <Card onClick={() => navigate('/facility')} className="p-5 flex flex-col items-center justify-center gap-3 active:scale-[0.98] transition-transform cursor-pointer border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(6,78,59,0.08)]">
              <div className="w-12 h-12 bg-brand-emerald/10 rounded-full flex items-center justify-center text-brand-emerald">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <span className="font-semibold text-sm text-on-background">Cấu hình sân</span>
            </Card>
          </div>
        </section>

        {/* Matrix Preview */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-on-background tracking-tight">Lịch sắp tới</h2>
            <button onClick={() => navigate('/matrix')} className="text-sm font-bold text-brand-emerald hover:text-emerald-800 transition-colors">Xem ma trận</button>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 flex items-center justify-between border-none shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center font-bold text-brand-emerald border border-surface-container-highest">
                    S{i}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-background">Sân {i} (5v5)</h3>
                    <p className="text-[13px] text-outline font-medium mt-1">18:00 - 19:30 • N. Văn A</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold text-brand-emerald">
                  Đã thanh toán
                </div>
              </Card>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};
