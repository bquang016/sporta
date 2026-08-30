import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Sparkles } from 'lucide-react';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useSettings } from '../hooks/useSettings';
import { SettingsForm } from '../components/SettingsForm';
import logoSvg from '../../../assets/logo/light/logo-main_40x40px_small.svg';

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
      <div
        className="font-sans min-h-dvh bg-slate-100/60 pb-28 select-none flex flex-col animate-fadeIn"
        style={{ touchAction: 'pan-y' }}
      >
        {/* ── 1. UNIFIED SPORTY-TECH LIQUID GLASS HEADER ── */}
        <header
          className="relative bg-gradient-to-b from-[#002b1f] via-[#064e3b] to-[#043d2e] text-white rounded-b-[2.5rem] shadow-xl overflow-hidden z-20 pb-5 transition-all"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
        >
          {/* Glow Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-12 -right-12 w-56 h-56 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 -left-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 px-4 space-y-3.5">
            {/* Top Bar: Back button, Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="touch-target w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-transform backdrop-blur-md shrink-0"
                  title="Quay lại"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-brand-yellow uppercase tracking-wider">
                    <Settings className="w-3.5 h-3.5" />
                    <span>Cấu hình tự động & vận hành</span>
                  </div>
                  <h1 className="text-lg font-black tracking-tight text-white mt-0.5 truncate">
                    Cài Đặt Hệ Thống
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 pt-4 space-y-4">
          {message && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold text-center text-white shadow-md animate-fadeIn ${
                message.type === 'success' ? 'bg-brand-emerald' : 'bg-red-600'
              }`}
            >
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

      {/* Settings Form Container */}
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
export default SettingsPage;
