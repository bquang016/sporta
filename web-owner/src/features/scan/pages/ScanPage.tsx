import React, { useState } from 'react';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { QRScannerModal } from '../../venue/components/operations/QRScannerModal';
import { ticketService } from '../../venue/services/ticketService';
import { Camera, Scan } from 'lucide-react';

export const ScanPage = () => {
  const isMobile = useIsMobile();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleCheckIn = async (token: string) => {
    return await ticketService.checkInTicket(token);
  };

  const renderContent = () => (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-sm mx-auto text-center py-10 px-4 select-none">
      <div className="w-24 h-24 bg-brand-emerald/10 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(6,78,59,0.05)] border border-brand-emerald/10 animate-pulse">
        <Scan className="w-12 h-12 text-brand-emerald" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-black text-slate-800">Quét mã QR xé vé</h2>
        <p className="text-xs text-slate-450 leading-relaxed font-semibold">
          Sử dụng camera của thiết bị để quét mã QR vé của khách hàng hoặc nhập mã token thủ công để thực hiện check-in vào sân.
        </p>
      </div>

      <button
        onClick={() => setIsScannerOpen(true)}
        className="w-full bg-brand-emerald hover:bg-emerald-800 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md border-b-2 border-emerald-950 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
      >
        <Camera className="w-4 h-4" />
        Bắt đầu Quét QR
      </button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {isMobile ? (
        <>
          {/* Unified Mobile Header */}
          <header className="px-5 pt-12 pb-6 bg-brand-emerald text-white rounded-b-[2rem] shadow-md relative z-10 overflow-hidden select-none">
            <div className="absolute inset-0 overflow-hidden rounded-b-[2rem] pointer-events-none">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
            </div>
            
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-white/60 text-xs font-semibold tracking-wider">Sporty-Tech Owner App</p>
                <h1 className="text-xl font-black tracking-tight mt-0.5">Quét mã QR</h1>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-sm">
                <span className="font-bold text-sm text-brand-yellow">SA</span>
              </div>
            </div>
          </header>

          <main className="p-6 flex-1 flex flex-col justify-center">
            {renderContent()}
          </main>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center h-[70vh]">
          {renderContent()}
        </div>
      )}

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCheckIn={handleCheckIn}
      />
    </div>
  );
};
