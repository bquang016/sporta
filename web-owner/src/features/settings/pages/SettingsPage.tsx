import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sliders, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useSettings } from '../hooks/useSettings';
import { SettingsForm } from '../components/SettingsForm';

export const SettingsPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const {
    configData,
    setConfigData,
    isLoading,
    isSaving,
    isResetting,
    isResetModalOpen,
    setIsResetModalOpen,
    message,
    setMessage,
    handleConfigSave,
    handleResetSettings,
    handleOtpToggleAttempt,
    playTestSound,
  } = useSettings();

  // Floating Toast HUD (Visible across both mobile and desktop on top of everything)
  const renderFloatingToast = () => {
    if (!message || typeof document === 'undefined') return null;

    return createPortal(
      <div 
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-[999999] w-[92%] max-w-md px-4 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-slideDown select-none font-sans transition-all duration-300 ${
          message.type === 'success'
            ? 'bg-[#002b1f]/95 text-white border-emerald-500/40 shadow-emerald-950/40'
            : message.type === 'warning'
            ? 'bg-amber-950/95 text-white border-amber-500/40 shadow-amber-950/40'
            : 'bg-rose-950/95 text-white border-rose-500/40 shadow-rose-950/40'
        }`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
          message.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
          'bg-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {message.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
          {message.type === 'error' && <XCircle className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="text-[10px] font-black uppercase tracking-wider text-white/70">
            {message.type === 'success' ? 'Cập nhật thành công' : message.type === 'warning' ? 'Thông báo hệ thống' : 'Lỗi'}
          </h5>
          <p className="text-xs font-bold text-white mt-0.5 leading-snug break-words">{message.text}</p>
        </div>
        <button
          type="button"
          onClick={() => setMessage(null)}
          className="touch-target w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 text-xs"
        >
          ✕
        </button>
      </div>,
      document.body
    );
  };

  // ═══ MOBILE VIEW ═══
  if (isMobile) {
    return (
      <div
        className="font-sans min-h-screen bg-slate-100/60 select-none flex flex-col animate-fadeIn"
        style={{ 
          touchAction: 'pan-y',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)'
        }}
      >
        {renderFloatingToast()}

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
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Cấu hình & Tùy biến</span>
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
          <SettingsForm
            configData={configData}
            setConfigData={setConfigData}
            isSaving={isSaving}
            handleConfigSave={handleConfigSave}
            isMobile={true}
            isResetModalOpen={isResetModalOpen}
            setIsResetModalOpen={setIsResetModalOpen}
            isResetting={isResetting}
            handleResetSettings={handleResetSettings}
            handleOtpToggleAttempt={handleOtpToggleAttempt}
            playTestSound={playTestSound}
          />
        </main>
      </div>
    );
  }

  // ═══ DESKTOP VIEW ═══
  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 select-none animate-fadeIn">
      {renderFloatingToast()}

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Cài đặt hệ thống</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Cấu hình thông báo vận hành, bảo mật phiên làm việc và tùy biến giao diện lịch đặt
          </p>
        </div>
      </div>

      {/* Settings Form Container */}
      <SettingsForm
        configData={configData}
        setConfigData={setConfigData}
        isSaving={isSaving}
        handleConfigSave={handleConfigSave}
        isMobile={false}
        isResetModalOpen={isResetModalOpen}
        setIsResetModalOpen={setIsResetModalOpen}
        isResetting={isResetting}
        handleResetSettings={handleResetSettings}
        handleOtpToggleAttempt={handleOtpToggleAttempt}
        playTestSound={playTestSound}
      />
    </div>
  );
};
export default SettingsPage;
