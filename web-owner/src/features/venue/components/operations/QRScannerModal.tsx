import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../../common/ui/overlay/Modal';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Clipboard, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { getSportLevelLabel } from '../../hooks/useTicketSessions';
import type { TicketCheckInResponse } from '../../types/ticket.types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (token: string) => Promise<TicketCheckInResponse>;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onCheckIn,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'manual'>('camera');
  const [manualToken, setManualToken] = useState('');
  
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  
  // Results
  const [checkInResult, setCheckInResult] = useState<TicketCheckInResponse | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Initialize camera scanner
  useEffect(() => {
    if (!isOpen || activeMode !== 'camera' || checkInResult || checkInError) {
      stopScanning();
      return;
    }

    setCameraError(null);
    setScanning(true);

    const startScanner = async () => {
      try {
        // Wait small delay to ensure DOM element exists
        await new Promise(r => setTimeout(r, 300));
        
        const scanner = new Html5Qrcode("qr-reader-target");
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7;
              return { width: size, height: size };
            }
          },
          async (decodedText) => {
            // Stop camera scanning immediately on match
            await stopScanning();
            handleCheckInSubmit(decodedText);
          },
          () => {} // silent ignore error scan
        );
      } catch (err: any) {
        console.error("Camera scanning start failed", err);
        setCameraError(
          "Không thể truy cập camera. Vui lòng cấp quyền hoặc chuyển sang chế độ Nhập mã thủ công."
        );
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      stopScanning();
    };
  }, [isOpen, activeMode, checkInResult, checkInError]);

  const stopScanning = async () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          console.error("Error stopping scanner:", e);
        }
      }
      scannerRef.current = null;
      setScanning(false);
    }
  };

  const handleCheckInSubmit = async (token: string) => {
    if (!token.trim()) return;
    setCheckingIn(true);
    setCheckInError(null);
    try {
      const res = await onCheckIn(token.trim());
      setCheckInResult(res);
    } catch (err: any) {
      setCheckInError(err.message || 'Quét check-in vé thất bại.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleReset = () => {
    setCheckInResult(null);
    setCheckInError(null);
    setManualToken('');
    setActiveMode('camera');
  };

  const handleModalClose = () => {
    stopScanning();
    handleReset();
    onClose();
  };

  // Render Check-in Success
  if (checkInResult) {
    return (
      <Modal isOpen={isOpen} onClose={handleModalClose} title="Quét vé Thành Công" maxWidth="md">
        <div className="flex flex-col items-center text-center space-y-5 py-4 select-none">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-100">
            <CheckCircle2 className="w-12 h-12 text-brand-emerald animate-bounce" />
          </div>
          
          <div className="space-y-1.5">
            <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">Vé Hợp Lệ</h4>
            <p className="text-xs text-slate-400 font-semibold">Thông tin khách hàng đã được đối chiếu</p>
          </div>

          <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-4 text-left space-y-3.5">
            <div className="flex justify-between border-b border-slate-200/50 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Khách hàng</span>
              <span className="text-xs font-black text-slate-800">{checkInResult.customerName}</span>
            </div>
            
            <div className="flex justify-between border-b border-slate-200/50 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Sân chỉ định</span>
              <span className="text-xs font-black text-brand-emerald">{checkInResult.courtName}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200/50 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Khung giờ chơi</span>
              <span className="text-xs font-black text-slate-800">
                {checkInResult.startTime.substring(0, 5)} - {checkInResult.endTime.substring(0, 5)} ({checkInResult.playDate})
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase">Trình độ</span>
              <span className="text-xs font-black text-slate-800">
                {getSportLevelLabel(checkInResult.sportLevel)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            className="w-full py-3 bg-brand-emerald hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md border-b-2 border-emerald-950 cursor-pointer"
          >
            Hoàn tất
          </button>
        </div>
      </Modal>
    );
  }

  // Render Check-in Error
  if (checkInError) {
    return (
      <Modal isOpen={isOpen} onClose={handleModalClose} title="Quét vé Thất Bại" maxWidth="md">
        <div className="flex flex-col items-center text-center space-y-5 py-4 select-none">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-2 border-red-100">
            <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h4 className="text-base font-black text-red-650 uppercase tracking-tight">Lỗi kiểm tra vé</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-xs">{checkInError}</p>
          </div>

          <div className="flex gap-3 w-full pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="flex-1 py-3 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-650 hover:bg-slate-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 bg-brand-emerald text-white rounded-2xl text-xs font-extrabold hover:bg-emerald-800 shadow-md border-b-2 border-emerald-950 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Quét lại
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Quét mã QR xé vé"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Toggle Mode */}
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 select-none">
          <button
            type="button"
            onClick={() => setActiveMode('camera')}
            className={`flex-1 py-2 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'camera' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            Sử dụng Camera
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`flex-1 py-2 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'manual' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            Nhập mã thủ công
          </button>
        </div>

        {activeMode === 'camera' ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            {cameraError ? (
              <div className="p-4 bg-red-50 border border-red-150 text-red-650 text-xs font-bold rounded-2xl leading-relaxed text-center">
                {cameraError}
              </div>
            ) : (
              <div className="relative w-full max-w-sm aspect-square bg-slate-900 rounded-3xl overflow-hidden border border-slate-250 flex items-center justify-center">
                <div id="qr-reader-target" className="w-full h-full"></div>
                {scanning && (
                  <div className="absolute inset-0 border-[3px] border-dashed border-brand-yellow/70 pointer-events-none rounded-3xl m-8 animate-pulse"></div>
                )}
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center">
              Đặt mã QR vé trước ống kính camera
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Mã Check-in thủ công</label>
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                placeholder="Nhập mã vé 6 ký tự (ví dụ: A7K2MX)..."
                maxLength={8}
                className="w-full px-4 py-3.5 font-mono text-center text-sm font-black tracking-widest text-slate-750 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-emerald focus:bg-white transition-all uppercase"
              />
            </div>

            <button
              type="button"
              disabled={checkingIn || !manualToken.trim()}
              onClick={() => handleCheckInSubmit(manualToken)}
              className="w-full py-3.5 bg-brand-emerald hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md border-b-2 border-emerald-950 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {checkingIn ? 'Đang kiểm tra...' : 'Xác nhận Check-in'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
