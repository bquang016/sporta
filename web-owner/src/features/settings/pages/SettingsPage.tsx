import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useSettings } from '../hooks/useSettings';
import { SettingsForm } from '../components/SettingsForm';

export const SettingsPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const {
    configData,
    setConfigData,
    message,
    isSaving,
    handleConfigSave
  } = useSettings();

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

          <SettingsForm
            configData={configData}
            setConfigData={setConfigData}
            isSaving={isSaving}
            handleConfigSave={handleConfigSave}
            isMobile={true}
          />
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

      {/* Form Content */}
      <SettingsForm
        configData={configData}
        setConfigData={setConfigData}
        isSaving={isSaving}
        handleConfigSave={handleConfigSave}
        isMobile={false}
      />
    </div>
  );
};
