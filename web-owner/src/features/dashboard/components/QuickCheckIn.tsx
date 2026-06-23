import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';

interface QuickCheckInProps {
  isMobile: boolean;
  
  // Mobile states & handlers
  isScanModalOpen?: boolean;
  setIsScanModalOpen?: (isOpen: boolean) => void;
  isScanning: boolean;
  scanStatus?: 'idle' | 'success' | 'error';
  scannedResult?: string;
  onStartQRScan?: () => void;
  
  // Desktop states & handlers
  ticketCode?: string;
  setTicketCode?: (code: string) => void;
  scanMessage?: { text: string; success: boolean } | null;
  onQuickCheckin?: (e: React.FormEvent) => void;
  onSimulateDesktopQR?: () => void;
}

export const QuickCheckIn = ({
  isMobile,
  isScanModalOpen = false,
  setIsScanModalOpen = () => {},
  isScanning,
  scanStatus = 'idle',
  scannedResult = '',
  onStartQRScan = () => {},
  ticketCode = '',
  setTicketCode = () => {},
  scanMessage = null,
  onQuickCheckin = () => {},
  onSimulateDesktopQR = () => {}
}: QuickCheckInProps) => {
  if (isMobile) {
    return (
      <>
        <style>{`
          @keyframes scan-laser {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
          }
          .laser-line {
            position: absolute;
            left: 0;
            width: 100%;
            height: 3px;
            background: #00ff66;
            box-shadow: 0 0 10px #00ff66, 0 0 20px #00ff66;
            animation: scan-laser 2s linear infinite;
          }
        `}</style>

        <section className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm flex items-center justify-between w-full">
          <div className="min-w-0 pr-2">
            <h3 className="font-black text-sm text-slate-800">Check-in bằng mã QR</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Xác nhận check-in nhanh bằng Camera quét</p>
          </div>
          <button
            onClick={onStartQRScan}
            className="flex items-center gap-1.5 bg-brand-yellow text-brand-emerald text-xs font-black px-4 py-2.5 rounded-2xl shadow-sm active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Quét QR</span>
          </button>
        </section>

        {/* QR scanner simulation modal */}
        <Modal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          title="Quét mã QR Check-in"
          maxWidth="sm"
        >
          <div className="space-y-5 text-center">
            <p className="text-xs text-slate-500 font-medium">Đặt mã vé QR của khách hàng vào khung hình camera dưới đây để check-in tự động</p>
            
            <div className="w-full max-w-[240px] aspect-square mx-auto border-2 border-slate-200 bg-slate-900 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center">
              {isScanning ? (
                <>
                  <div className="absolute inset-4 border border-white/10 rounded-2xl flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-t-4 border-l-4 border-brand-yellow rounded-tl-md"></div>
                      <div className="w-5 h-5 border-t-4 border-r-4 border-brand-yellow rounded-tr-md"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-b-4 border-l-4 border-brand-yellow rounded-bl-md"></div>
                      <div className="w-5 h-5 border-b-4 border-r-4 border-brand-yellow rounded-tr-md"></div>
                    </div>
                  </div>
                  <div className="laser-line"></div>
                  
                  <svg className="w-8 h-8 text-brand-yellow animate-spin relative z-10" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-[10px] font-black uppercase text-brand-yellow tracking-widest mt-4 animate-pulse relative z-10">Đang quét mã...</span>
                </>
              ) : (
                <div className="p-4 relative z-10 flex flex-col items-center">
                  {scanStatus === 'success' ? (
                    <>
                      <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-3 shadow-[0_4px_12px_rgba(16,185,129,0.3)] transform scale-110 transition-transform">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h4 className="text-sm font-black text-white">CHECK-IN THÀNH CÔNG</h4>
                      <p className="text-[11px] text-brand-yellow font-bold mt-1.5">{scannedResult}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white mb-3 shadow-[0_4px_12px_rgba(239,68,68,0.3)]">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </div>
                      <h4 className="text-sm font-black text-white">CHECK-IN THẤT BẠI</h4>
                      <p className="text-[10px] text-red-200 mt-1">Không còn đơn đặt nào đang chờ quét check-in</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsScanModalOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs transition-colors"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Desktop Quick Check-in UI
  return (
    <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] w-full">
      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Check-in nhanh</h2>
      
      <form onSubmit={onQuickCheckin} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Nhập mã vé đặt (Ví dụ: b-1)..."
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            disabled={isScanning}
            className="w-full pl-3 pr-20 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald disabled:bg-slate-100 placeholder-slate-400 transition-all"
          />
          
          <button
            type="submit"
            disabled={isScanning || !ticketCode.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-emerald text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg hover:bg-emerald-950 transition-colors disabled:bg-slate-300"
          >
            {isScanning ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </form>

      <div className="mt-4 border border-dashed border-slate-200 bg-slate-50/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center min-h-[160px] relative overflow-hidden">
        {isScanning ? (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-slate-900/10 flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-brand-emerald"></div>
                <div className="w-4 h-4 border-t-2 border-r-2 border-brand-emerald"></div>
              </div>
              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-brand-emerald"></div>
                <div className="w-4 h-4 border-b-2 border-r-2 border-brand-emerald"></div>
              </div>
            </div>
            <div className="w-full h-0.5 bg-brand-emerald absolute left-0 top-1/2 -translate-y-1/2 animate-bounce"></div>
            
            <svg className="w-10 h-10 text-brand-emerald animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-[10px] font-black text-slate-500 mt-3 uppercase tracking-wider animate-pulse">Đang định dạng mã QR...</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <button 
              onClick={onSimulateDesktopQR}
              className="text-[11px] font-black text-brand-emerald hover:text-emerald-950 transition-colors uppercase tracking-wide focus:outline-none"
            >
              Click để Giả Lập Quét Vé QR
            </button>
            <p className="text-[9px] text-slate-400 mt-1 max-w-[200px]">Mô phỏng check-in thực tế thông qua camera của chủ sân</p>
          </>
        )}

        {scanMessage && (
          <div className={`mt-3 p-2 rounded-xl text-[10px] font-bold w-full text-center border ${
            scanMessage.success 
              ? 'bg-emerald-50 border-emerald-100 text-brand-emerald' 
              : 'bg-red-50 border-red-100 text-red-600'
          }`}>
            {scanMessage.text}
          </div>
        )}
      </div>
    </Card>
  );
};
export default QuickCheckIn;
