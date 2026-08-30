import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../../common/ui/overlay/Modal';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  Clipboard, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar, 
  Award, 
  Ticket as TicketIcon, 
  X 
} from 'lucide-react';
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
  const isProcessingRef = useRef(false);
  const lastScannedTokenRef = useRef<string | null>(null);
  const lastScanTimestampRef = useRef<number>(0);

  // Stop physical camera streams from browser
  const stopCameraStreams = () => {
    try {
      const videoElems = document.querySelectorAll('video');
      videoElems.forEach((video) => {
        if (video && video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach((track) => {
            track.stop();
            track.enabled = false;
          });
          video.srcObject = null;
        }
      });
    } catch (e) {
      console.error('Error stopping media tracks:', e);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        console.error("Error stopping scanner:", e);
      }
      scannerRef.current = null;
    }
    stopCameraStreams();
    setScanning(false);
  };

  // Initialize camera scanner
  useEffect(() => {
    if (!isOpen || activeMode !== 'camera' || checkInResult || checkInError) {
      stopScanning();
      return;
    }

    setCameraError(null);
    setScanning(true);
    isProcessingRef.current = false;

    let isMounted = true;

    const startScanner = async () => {
      try {
        // Wait small delay to ensure DOM element exists
        await new Promise(r => setTimeout(r, 250));
        if (!isMounted) return;

        const target = document.getElementById("qr-reader-target");
        if (!target) return;
        
        const scanner = new Html5Qrcode("qr-reader-target");
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.72;
              return { width: size, height: size };
            }
          },
          async (decodedText) => {
            const now = Date.now();
            const cleanToken = decodedText.trim();

            // Guard: If currently processing or scanned same token within 4 seconds, ignore
            if (isProcessingRef.current) return;
            if (lastScannedTokenRef.current === cleanToken && now - lastScanTimestampRef.current < 4000) {
              return;
            }

            isProcessingRef.current = true;
            lastScannedTokenRef.current = cleanToken;
            lastScanTimestampRef.current = now;

            // Stop camera scanning immediately on match
            await stopScanning();
            handleCheckInSubmit(cleanToken);
          },
          () => {} // silent ignore frame
        );
      } catch (err: any) {
        console.error("Camera scanning start failed", err);
        if (isMounted) {
          setCameraError(
            "Không thể truy cập camera. Vui lòng cấp quyền hoặc chuyển sang chế độ Nhập mã thủ công."
          );
          setScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanning();
    };
  }, [isOpen, activeMode, checkInResult, checkInError]);

  // Clean up when modal closes or unmounts
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const handleCheckInSubmit = async (token: string) => {
    if (!token.trim()) {
      isProcessingRef.current = false;
      return;
    }
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
    isProcessingRef.current = false;
    setCheckInResult(null);
    setCheckInError(null);
    setManualToken('');
    setActiveMode('camera');
  };

  const handleModalClose = () => {
    isProcessingRef.current = false;
    stopScanning();
    handleReset();
    onClose();
  };

  // Render Check-in Success
  if (checkInResult) {
    return (
      <Modal isOpen={isOpen} onClose={handleModalClose} title="Xác Thực Check-in Thành Công" maxWidth="lg">
        <div className="space-y-5 py-1 select-none">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-[#064e3b] text-white p-5 rounded-3xl shadow-md flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xs">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-emerald-100">
                  Vé Hợp Lệ • Đã Xé Vé
                </span>
                <h3 className="text-base font-black text-white tracking-tight mt-0.5">
                  Check-in Thành Công
                </h3>
              </div>
            </div>

            <div className="text-right relative z-10">
              <span className="text-[10px] font-bold text-emerald-200 block uppercase">Mã vé</span>
              <span className="text-sm font-black font-mono tracking-widest text-brand-yellow">
                {checkInResult.shortCode || 'SPORTA'}
              </span>
            </div>
          </div>

          {/* Customer & Ticket Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Customer Info Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <User className="w-4 h-4 text-brand-emerald" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Thông tin khách hàng
                </h4>
              </div>

              <div className="flex items-center gap-3 pt-1">
                {checkInResult.customerAvatar ? (
                  <img 
                    src={checkInResult.customerAvatar} 
                    alt={checkInResult.customerName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-300 shadow-xs" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-brand-emerald flex items-center justify-center font-black text-base border-2 border-emerald-200">
                    {checkInResult.customerName?.charAt(0)?.toUpperCase() || 'K'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h5 className="text-sm font-black text-slate-900 truncate">
                    {checkInResult.customerName}
                  </h5>
                  {checkInResult.customerPhone && (
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{checkInResult.customerPhone}</span>
                    </p>
                  )}
                  {checkInResult.customerEmail && (
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{checkInResult.customerEmail}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Court & Session Info Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <TicketIcon className="w-4 h-4 text-brand-emerald" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Chi tiết ca xé vé
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-emerald" />
                    Sân chỉ định:
                  </span>
                  <span className="font-black text-brand-emerald text-xs bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {checkInResult.courtName}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    Khung giờ:
                  </span>
                  <span className="font-black text-slate-800 font-mono">
                    {checkInResult.startTime?.substring(0, 5)} - {checkInResult.endTime?.substring(0, 5)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    Ngày chơi:
                  </span>
                  <span className="font-bold text-slate-700">{checkInResult.playDate}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Award className="w-3 h-3 text-purple-500" />
                    Trình độ:
                  </span>
                  <span className="font-bold text-slate-800">
                    {getSportLevelLabel(checkInResult.sportLevel)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Số lượng slot:</span>
                  <span className="font-black text-brand-emerald">
                    {checkInResult.quantity || 1} vé
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="flex-1 py-3.5 border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-100 cursor-pointer transition-all active:scale-95"
            >
              Đóng cửa sổ
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3.5 bg-brand-emerald text-white rounded-2xl text-xs font-black hover:bg-emerald-800 shadow-md border-b-2 border-emerald-950 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Quét Vé Tiếp Theo</span>
            </button>
          </div>
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
            <p className="text-xs text-slate-600 leading-relaxed font-semibold max-w-xs">{checkInError}</p>
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
            onClick={() => {
              setActiveMode('manual');
              stopScanning();
            }}
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
