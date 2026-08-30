import React from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../../../../hooks/useBodyScrollLock';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  RotateCcw,
  Database,
  Layers,
  Zap,
  Check
} from 'lucide-react';

export interface AIAnalysisProgressModalProps {
  isOpen: boolean;
  status: 'idle' | 'analyzing' | 'success' | 'error';
  progress: number; // 0 - 100
  currentStageText: string;
  errorMessage?: string;
  resultSummary?: {
    totalRecs: number;
    surgeCount: number;
    discountCount: number;
  } | null;
  onClose: () => void;
  onRetry?: () => void;
}

const STAGES = [
  { threshold: 25, label: 'Thu thập lịch sử đặt sân (6 tuần qua)', icon: <Database className="w-3.5 h-3.5" /> },
  { threshold: 55, label: 'Phân tích tỷ lệ lấp đầy theo khung giờ & thứ', icon: <Layers className="w-3.5 h-3.5" /> },
  { threshold: 85, label: 'Mô hình hóa nhu cầu & tính hệ số định giá AI', icon: <Zap className="w-3.5 h-3.5" /> },
  { threshold: 100, label: 'Tổng hợp đề xuất tối ưu doanh thu', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

export const AIAnalysisProgressModal: React.FC<AIAnalysisProgressModalProps> = ({
  isOpen,
  status,
  progress,
  currentStageText,
  errorMessage,
  resultSummary,
  onClose,
  onRetry
}) => {
  useBodyScrollLock(isOpen);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-fadeIn" 
        onClick={() => status !== 'analyzing' && onClose()} 
      />

      {/* Modal Container / Mobile Bottom Sheet */}
      <div 
        className="relative bg-white rounded-t-[2.25rem] sm:rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-100 animate-slideUp sm:animate-scaleUp overflow-hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-1 mb-4 sm:hidden shrink-0" />
        
        {/* Glow Header Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-brand-yellow/15 rounded-full blur-3xl pointer-events-none" />

        {/* ── STATE 1: ANALYZING (PROGRESS) ── */}
        {status === 'analyzing' && (
          <div className="space-y-6">
            {/* Top Icon with Pulsing Effect */}
            <div className="text-center space-y-2">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#064e3b] to-emerald-600 text-brand-yellow flex items-center justify-center shadow-lg border border-emerald-400/30">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                AI Đang Phân Tích Lịch Sử
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                Hệ thống đang quét toàn bộ dữ liệu lịch sử đặt sân và tính toán hệ số định giá động...
              </p>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-brand-emerald flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                  {currentStageText || 'Đang xử lý...'}
                </span>
                <span className="text-slate-800 font-mono">{Math.round(progress)}%</span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[#064e3b] via-emerald-500 to-brand-yellow rounded-full transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
                />
              </div>
            </div>

            {/* Step Checkpoints */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {STAGES.map((st, idx) => {
                const isDone = progress >= st.threshold;
                const isCurrent = progress < st.threshold && (idx === 0 || progress >= STAGES[idx - 1].threshold);

                return (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-all ${
                      isDone 
                        ? 'bg-brand-emerald text-white' 
                        : isCurrent 
                          ? 'bg-brand-yellow text-[#064e3b] ring-2 ring-yellow-400/40 animate-pulse font-black' 
                          : 'bg-slate-200 text-slate-400'
                    }`}>
                      {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                    </div>
                    <span className={`truncate ${
                      isDone 
                        ? 'text-slate-700 font-bold' 
                        : isCurrent 
                          ? 'text-slate-900 font-black' 
                          : 'text-slate-400 font-medium'
                    }`}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STATE 2: SUCCESS ── */}
        {status === 'success' && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-brand-emerald rounded-2xl flex items-center justify-center mx-auto shadow-md border border-emerald-200 animate-bounce">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Phân Tích Dự Báo Thành Công!
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Đã hoàn tất tổng hợp lịch sử đặt sân và cập nhật danh sách đề xuất giá mới nhất cho tuần này.
              </p>
            </div>

            {/* Results Metric Strip */}
            {resultSummary && (
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <div className="p-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Đề xuất</span>
                  <p className="text-sm font-black text-slate-800 tracking-tight mt-0.5">
                    {resultSummary.totalRecs} ca
                  </p>
                </div>
                <div className="p-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 block flex items-center justify-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" /> Giờ vàng
                  </span>
                  <p className="text-sm font-black text-rose-600 tracking-tight mt-0.5">
                    +{resultSummary.surgeCount}
                  </p>
                </div>
                <div className="p-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block flex items-center justify-center gap-0.5">
                    <TrendingDown className="w-2.5 h-2.5" /> Kích cầu
                  </span>
                  <p className="text-sm font-black text-emerald-700 tracking-tight mt-0.5">
                    +{resultSummary.discountCount}
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="touch-target w-full py-3.5 bg-brand-emerald hover:bg-emerald-900 active:bg-emerald-950 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Xem danh sách đề xuất</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* ── STATE 3: ERROR ── */}
        {status === 'error' && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-rose-200">
              <AlertTriangle className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Phân Tích Dự Báo Thất Bại
              </h3>
              <p className="text-xs text-rose-600 font-semibold mt-1 bg-rose-50 p-3 rounded-xl border border-rose-100 leading-relaxed">
                {errorMessage || 'Không thể kết nối đến máy chủ AI hoặc hệ thống đang bận. Vui lòng thử lại sau.'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
              >
                Đóng
              </button>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Thử lại</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
export default AIAnalysisProgressModal;
