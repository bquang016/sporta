import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Search, 
  Calendar, 
  Settings2, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  Keyboard, 
  X,
  Sparkles,
  Zap
} from 'lucide-react';

interface MobileQuickActionsProps {
  isScanning: boolean;
  isScanModalOpen: boolean;
  setIsScanModalOpen: (open: boolean) => void;
  scanStatus: 'idle' | 'success' | 'error';
  scannedResult: string;
  onStartQRScan: () => void;
  ticketCode: string;
  setTicketCode: (code: string) => void;
  scanMessage: { text: string; success: boolean } | null;
  onQuickCheckin: (e: React.FormEvent) => void;
  onSimulateDesktopQR?: () => void;
}

export const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({
  isScanning,
  isScanModalOpen,
  setIsScanModalOpen,
  scanStatus,
  scannedResult,
  onStartQRScan,
  ticketCode,
  setTicketCode,
  scanMessage,
  onQuickCheckin
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'qr' | 'manual'>('qr');

  return (
    <section className="space-y-3">
      {/* Laser Animation Styles for Modal */}
      <style>{`
        @keyframes scan-laser-smooth {
          0% { top: 8%; opacity: 0.8; }
          50% { top: 88%; opacity: 1; }
          100% { top: 8%; opacity: 0.8; }
        }
        .laser-beam {
          position: absolute;
          left: 5%;
          width: 90%;
          height: 3px;
          background: #FACC15;
          box-shadow: 0 0 12px #FACC15, 0 0 24px rgba(250, 204, 21, 0.8);
          border-radius: 9999px;
          animation: scan-laser-smooth 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Main Action Banner: Primary QR Check-in CTA */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="bg-brand-emerald/10 text-[#064e3b] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Check-in tức thì
              </span>
            </div>
            <h2 className="text-sm font-black text-slate-800 tracking-tight">
              Quét mã QR nhận sân
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
              Kiểm tra đơn và xé vé tự động cho khách
            </p>
          </div>

          <button
            type="button"
            onClick={onStartQRScan}
            className="touch-target shrink-0 flex items-center gap-2 bg-brand-yellow hover:bg-yellow-400 active:scale-95 text-[#064e3b] text-xs font-black px-4 py-3 rounded-2xl shadow-md transition-all border-b-2 border-yellow-600 cursor-pointer"
          >
            <QrCode className="w-5 h-5 stroke-[2.5]" />
            <span>Quét ngay</span>
          </button>
        </div>

        {/* Manual Code Input Bar (Collapsible / Inline) */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100">
          <form onSubmit={onQuickCheckin} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Hoặc nhập mã vé (VD: b-1, SP-2026)..."
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                disabled={isScanning}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isScanning || !ticketCode.trim()}
              className="bg-[#064e3b] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs px-3.5 py-2.5 rounded-xl active:scale-95 transition-all shrink-0 min-h-[40px] flex items-center justify-center cursor-pointer shadow-xs"
            >
              {isScanning ? 'Đang duyệt...' : 'Check-in'}
            </button>
          </form>

          {/* Feedback Message */}
          {scanMessage && (
            <div className={`mt-2.5 p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2 border animate-fadeIn ${
              scanMessage.success 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {scanMessage.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="flex-1 truncate">{scanMessage.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation Action Grid (2 Big Touch Tiles) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate('/matrix')}
          className="bg-white border border-slate-200/60 rounded-2xl p-3.5 text-left shadow-xs hover:border-slate-300 active:scale-[0.98] transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center shrink-0 font-bold group-hover:bg-[#064e3b] group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800 truncate">Sơ đồ lịch sân</p>
              <p className="text-[10px] text-slate-400 font-medium truncate">Xem ma trận ca</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/operations')}
          className="bg-white border border-slate-200/60 rounded-2xl p-3.5 text-left shadow-xs hover:border-slate-300 active:scale-[0.98] transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 font-bold group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Settings2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800 truncate">Vận hành sân</p>
              <p className="text-[10px] text-slate-400 font-medium truncate">Cấu hình & bảng giá</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
        </button>
      </div>

      {/* QR Scanner Full Native-Feel Modal / Bottom Sheet */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-md animate-fadeIn">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsScanModalOpen(false)} 
          />
          <div 
            className="relative w-full max-w-lg bg-slate-900 text-white rounded-t-[2.5rem] p-6 z-10 shadow-2xl flex flex-col items-center animate-slideUp max-h-[90dvh] overflow-y-auto"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mb-4" />

            {/* Header */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-yellow/20 text-brand-yellow flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Quét mã QR Check-in</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Đặt mã vé của khách vào khung quét</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScanModalOpen(false)}
                className="touch-target w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scanner Viewport */}
            <div className="w-full max-w-[260px] aspect-square rounded-3xl bg-black border-2 border-slate-700 relative overflow-hidden flex flex-col items-center justify-center my-2 shadow-2xl">
              {isScanning ? (
                <>
                  {/* Viewfinder Corners */}
                  <div className="absolute inset-4 border border-white/10 rounded-2xl flex flex-col justify-between p-2 pointer-events-none">
                    <div className="flex justify-between">
                      <div className="w-6 h-6 border-t-4 border-l-4 border-brand-yellow rounded-tl-lg" />
                      <div className="w-6 h-6 border-t-4 border-r-4 border-brand-yellow rounded-tr-lg" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-6 h-6 border-b-4 border-l-4 border-brand-yellow rounded-bl-lg" />
                      <div className="w-6 h-6 border-b-4 border-r-4 border-brand-yellow rounded-br-lg" />
                    </div>
                  </div>

                  {/* Laser Beam */}
                  <div className="laser-beam" />

                  {/* Center Scanning Indicator */}
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div className="w-12 h-12 rounded-full border-2 border-brand-yellow/30 border-t-brand-yellow animate-spin flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-brand-yellow" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-brand-yellow tracking-widest animate-pulse">
                      Đang nhận diện...
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center flex flex-col items-center relative z-10">
                  {scanStatus === 'success' ? (
                    <>
                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-3 shadow-[0_0_24px_rgba(16,185,129,0.5)] transform scale-110 transition-transform">
                        <CheckCircle className="w-10 h-10 stroke-[2.5]" />
                      </div>
                      <h4 className="text-sm font-black text-white">CHECK-IN THÀNH CÔNG</h4>
                      <p className="text-xs text-brand-yellow font-black mt-1">Khách: {scannedResult}</p>
                      <p className="text-[10px] text-emerald-300 mt-0.5 font-medium">Đã cập nhật trạng thái vào hệ thống</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white mb-3 shadow-[0_0_24px_rgba(239,68,68,0.5)]">
                        <AlertCircle className="w-10 h-10 stroke-[2.5]" />
                      </div>
                      <h4 className="text-sm font-black text-white">CHƯA TÌM THẤY VÉ</h4>
                      <p className="text-[11px] text-red-200 mt-1 max-w-[200px]">Không có đơn đặt nào đang chờ check-in tại cụm sân này</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions inside Modal */}
            <div className="w-full pt-4 space-y-2">
              {!isScanning && (
                <button
                  type="button"
                  onClick={onStartQRScan}
                  className="w-full py-3 rounded-2xl bg-brand-yellow active:bg-yellow-400 text-[#064e3b] font-black text-xs uppercase tracking-wider transition-all"
                >
                  Quét lại mã khác
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsScanModalOpen(false)}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 font-bold text-xs transition-all"
              >
                Đóng máy quét
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
export default MobileQuickActions;
