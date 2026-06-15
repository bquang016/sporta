import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

export const SettingsPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [configData, setConfigData] = useState({
    autoApprove: true,
    notifyOnScan: true,
    minAdvanceHours: 2,
    depositPercent: 50
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Cài đặt cấu hình hệ thống đã được cập nhật thành công!' });
    }, 800);
  };

  // ═══ MOBILE VIEW ═══
  if (isMobile) {
    return (
      <div className="font-sans pb-32 bg-slate-50/50 min-h-screen select-none animate-fadeIn">
        
        {/* Unified Mobile Header */}
        <header className="px-5 pt-12 pb-6 bg-brand-emerald text-white rounded-b-[2rem] shadow-md relative z-10 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden rounded-b-[2rem] pointer-events-none">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
          </div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/profile')} 
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white mr-1 active:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <p className="text-white/60 text-[10px] font-semibold tracking-wider">Cấu hình di động</p>
                <h1 className="text-lg font-black tracking-tight">Cài đặt hệ thống</h1>
              </div>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-sm">
              <span className="font-bold text-sm text-brand-yellow">SA</span>
            </div>
          </div>
        </header>

        <main className="px-4 mt-6 space-y-6">
          {message && (
            <div className={`p-3 rounded-2xl text-xs font-bold text-center text-white ${message.type === 'success' ? 'bg-brand-emerald' : 'bg-red-600'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 shadow-sm space-y-5">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Tự động duyệt và vận hành</h3>
              
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <h4 className="text-xs font-black text-slate-800">Tự động duyệt đơn đặt</h4>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5 leading-tight">Khi khách thanh toán trực tuyến thành công, hệ thống tự động xác nhận lịch bãi.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfigData({ ...configData, autoApprove: !configData.autoApprove })}
                  className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    configData.autoApprove ? 'bg-brand-emerald' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      configData.autoApprove ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="pr-4">
                  <h4 className="text-xs font-black text-slate-800">Âm thanh thông báo check-in</h4>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5 leading-tight">Phát âm thanh báo hiệu khi chủ sân quét mã QR vé check-in thành công.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfigData({ ...configData, notifyOnScan: !configData.notifyOnScan })}
                  className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    configData.notifyOnScan ? 'bg-brand-emerald' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      configData.notifyOnScan ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider pb-2">Chính sách thời gian và cọc</h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Đặt trước tối thiểu (giờ)</label>
                  <input 
                    type="number" 
                    value={configData.minAdvanceHours} 
                    onChange={(e) => setConfigData({ ...configData, minAdvanceHours: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none" 
                    min="1" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Phần trăm cọc (%)</label>
                  <input 
                    type="number" 
                    value={configData.depositPercent} 
                    onChange={(e) => setConfigData({ ...configData, depositPercent: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none" 
                    min="0" 
                    max="100" 
                    required 
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleConfigSave}
              className="w-full mt-4 bg-brand-yellow text-primary hover:bg-yellow-400 font-extrabold text-xs py-3 rounded-xl shadow-sm active:scale-95 transition-all"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu cấu hình di động'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ═══ DESKTOP VIEW ═══
  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 select-none animate-fadeIn">
      
      {/* Title & Status Message Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Cài đặt hệ thống</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Cấu hình cơ chế tự động hóa, thời gian vận hành và đặt cọc sân bãi</p>
        </div>

        {/* Global Toast Message */}
        {message && (
          <div 
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all duration-300 transform scale-100 ${
              message.type === 'success' 
                ? 'bg-emerald-600 text-white shadow-emerald-200' 
                : 'bg-red-600 text-white shadow-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Premium Athletic Gradient Header Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md border-b-4 border-brand-yellow select-none">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute left-1/3 -bottom-10 w-40 h-40 bg-brand-yellow/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-brand-yellow/15 flex items-center justify-center border border-brand-yellow/30 text-brand-yellow shadow-inner">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <span className="text-[9px] bg-brand-yellow text-primary px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">Hệ Thống</span>
            <h2 className="text-lg font-black tracking-tight text-white mt-1.5">Thiết Lập Cơ Chế Vận Hành</h2>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <form onSubmit={handleConfigSave} className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        
        {/* OPERATIONAL SECTION */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">Tự động duyệt và vận hành</h3>
          
          <div className="flex items-center justify-between py-2 bg-white px-4 rounded-2xl border border-slate-200/50 shadow-xxs">
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-700">Tự động duyệt đơn hàng</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Khi bật, các đơn đặt trực tuyến thành công sẽ tự động duyệt lịch bãi mà không cần thao tác tay.</p>
            </div>
            <button
              type="button"
              onClick={() => setConfigData({ ...configData, autoApprove: !configData.autoApprove })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                configData.autoApprove ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  configData.autoApprove ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 bg-white px-4 rounded-2xl border border-slate-200/50 shadow-xxs">
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-700">Thông báo âm thanh khi check-in</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Phát âm báo hoặc rung trên thiết bị khi quét QR thành công.</p>
            </div>
            <button
              type="button"
              onClick={() => setConfigData({ ...configData, notifyOnScan: !configData.notifyOnScan })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                configData.notifyOnScan ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  configData.notifyOnScan ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* POLICIES SECTION */}
        <div className="space-y-4 pt-4 border-t border-slate-200/60">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-2">Chính sách đặt cọc và đặt trước</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Thời gian đặt trước tối thiểu (giờ)</label>
              <input 
                type="number" 
                value={configData.minAdvanceHours}
                onChange={(e) => setConfigData({ ...configData, minAdvanceHours: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
                min="1"
                max="24"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Phần trăm đặt cọc bắt buộc (%)</label>
              <input 
                type="number" 
                value={configData.depositPercent}
                onChange={(e) => setConfigData({ ...configData, depositPercent: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
                min="0"
                max="100"
                required
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            {isSaving ? 'Đang cập nhật...' : 'Lưu cấu hình hệ thống'}
          </button>
        </div>
      </form>
    </div>
  );
};
