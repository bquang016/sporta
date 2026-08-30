import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ticketService } from '../../venue/services/ticketService';
import { getSportLevelLabel } from '../../venue/hooks/useTicketSessions';
import type { TicketCheckInResponse } from '../../venue/types/ticket.types';
import { 
  QrCode, 
  Camera, 
  Keyboard, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FlipHorizontal, 
  Sparkles, 
  Building2, 
  Clock, 
  ClipboardPaste,
  Search,
  Check,
  XCircle,
  History,
  ShieldAlert,
  HelpCircle,
  Play,
  ChevronRight,
  Info
} from 'lucide-react';

export const ScanPage = () => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualToken, setManualToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isSafariGuideOpen, setIsSafariGuideOpen] = useState(false);

  // Check-in results
  const [checkInResult, setCheckInResult] = useState<TicketCheckInResponse | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<TicketCheckInResponse[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef(false);

  // Detect insecure context (e.g. HTTP on local IP 192.168.x.x which Safari strictly blocks)
  const isHttpOnLan = typeof window !== 'undefined' && 
    !window.isSecureContext && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';

  // Play audio & vibration feedback
  const playFeedbackSound = (isSuccess: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (isSuccess) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15); // A6 note
        gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      }

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + (isSuccess ? 0.15 : 0.25));

      if (navigator.vibrate) {
        navigator.vibrate(isSuccess ? [80, 40, 100] : [200, 100, 200]);
      }
    } catch (e) {
      console.log('Audio feedback not supported');
    }
  };

  // Stop camera helper
  const stopCamera = async () => {
    if (isStoppingRef.current) return;
    if (scannerRef.current) {
      isStoppingRef.current = true;
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping scanner:', err);
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
        setIsCameraStarting(false);
        isStoppingRef.current = false;
      }
    }
  };

  // Start camera scanner
  const startCamera = async () => {
    // Check if mediaDevices API exists
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        isHttpOnLan 
          ? 'Trình duyệt Safari chặn Camera trên kết nối HTTP (IP mạng LAN). Safari chỉ cho phép Camera trên HTTPS hoặc localhost.'
          : 'Trình duyệt của bạn không hỗ trợ hoặc đang chặn quyền truy cập Camera.'
      );
      return;
    }

    await stopCamera();
    setCameraError(null);
    setIsCameraStarting(true);

    try {
      // Small pause to guarantee target container is mounted
      await new Promise((r) => setTimeout(r, 250));

      const targetElem = document.getElementById('qr-live-camera-target');
      if (!targetElem) {
        setIsCameraStarting(false);
        return;
      }

      const scanner = new Html5Qrcode('qr-live-camera-target');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode },
        {
          fps: 15,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.72;
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // Immediately pause/stop to prevent duplicate rapid scans
          await stopCamera();
          handleProcessCheckIn(decodedText);
        },
        () => {} // Silent scan frame
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start camera:', err);
      const errMsg = err?.name === 'NotAllowedError' || err?.message?.includes('NotAllowedError') || err?.message?.includes('Permission')
        ? 'Bạn chưa cấp quyền Camera cho trang web. Vui lòng kiểm tra Cài đặt Safari để cho phép Camera.'
        : isHttpOnLan
        ? 'Safari chặn Camera khi chạy qua IP HTTP LAN (http://192.168.x.x). Vui lòng dùng localhost hoặc chuyển sang nhập mã.'
        : 'Không thể mở Camera. Vui lòng bấm "Cấp quyền & Thử lại" hoặc nhập mã thủ công.';
      
      setCameraError(errMsg);
    } finally {
      setIsCameraStarting(false);
    }
  };

  // Start / Stop camera when tab changes or result shows
  useEffect(() => {
    if (activeTab === 'camera' && !checkInResult && !checkInError) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode, checkInResult, checkInError]);

  // Check-in API handler
  const handleProcessCheckIn = async (token: string) => {
    const cleanToken = token.trim();
    if (!cleanToken) return;

    setIsCheckingIn(true);
    setCheckInError(null);
    setCheckInResult(null);

    try {
      const res = await ticketService.checkInTicket(cleanToken);
      setCheckInResult(res);
      setRecentCheckIns((prev) => [res, ...prev.filter((item) => item.ticketId !== res.ticketId)].slice(0, 5));
      playFeedbackSound(true);
    } catch (err: any) {
      const errorMsg = err.message || 'Mã vé không hợp lệ hoặc đã qua sử dụng.';
      setCheckInError(errorMsg);
      playFeedbackSound(false);
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Manual submit form
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      handleProcessCheckIn(manualToken);
    }
  };

  // Paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setManualToken(text);
      }
    } catch (err) {
      console.log('Clipboard paste not supported');
    }
  };

  // Flip camera toggle
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Reset to scan next ticket
  const handleScanNext = () => {
    setCheckInResult(null);
    setCheckInError(null);
    setManualToken('');
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  return (
    <div
      className="font-sans min-h-dvh bg-slate-100/60 select-none flex flex-col animate-fadeIn"
      style={{ 
        touchAction: 'pan-y',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)' 
      }}
    >
      {/* ── 1. SPORTY-TECH LIQUID GLASS HEADER ── */}
      <header
        className="relative bg-gradient-to-b from-[#002b1f] via-[#064e3b] to-[#043d2e] text-white rounded-b-[2.5rem] shadow-xl overflow-hidden z-20 pb-5 transition-all"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -left-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 px-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-brand-yellow backdrop-blur-md shadow-xs shrink-0">
                <QrCode className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-brand-yellow uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Xác thực vé & Nhận sân</span>
                </div>
                <h1 className="text-lg font-black tracking-tight text-white mt-0.5 truncate">
                  Quét Mã QR Check-in
                </h1>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Camera</span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-black/25 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                setCheckInResult(null);
                setCheckInError(null);
              }}
              className={`touch-target flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'camera'
                  ? 'bg-brand-yellow text-[#064e3b] shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Camera Quét</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('manual');
                stopCamera();
              }}
              className={`touch-target flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'manual'
                  ? 'bg-brand-yellow text-[#064e3b] shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Keyboard className="w-4 h-4 stroke-[2.5]" />
              <span>Nhập Mã Thủ Công</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. MAIN SCAN WORKSPACE ── */}
      <main className="px-4 pt-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Laser Beam Animation Styles */}
        <style>{`
          @keyframes laser-sweep {
            0% { top: 6%; opacity: 0.8; }
            50% { top: 90%; opacity: 1; }
            100% { top: 6%; opacity: 0.8; }
          }
          .qr-laser-line {
            position: absolute;
            left: 5%;
            width: 90%;
            height: 3px;
            background: #FACC15;
            box-shadow: 0 0 14px #FACC15, 0 0 28px rgba(250, 204, 21, 0.9);
            border-radius: 9999px;
            animation: laser-sweep 2.2s ease-in-out infinite;
            z-index: 20;
          }
          #qr-live-camera-target video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 1.5rem !important;
          }
          #qr-live-camera-target {
            border: none !important;
          }
        `}</style>

        {/* ── 2A. CHECK-IN RESULT CARD (SUCCESS / ERROR) ── */}
        {checkInResult && (
          <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  Hợp Lệ • Check-in Thành Công
                </span>
                <h3 className="text-base font-black text-slate-800 tracking-tight mt-1 truncate">
                  {checkInResult.customerName}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Cụm sân & Sân đấu</span>
                <span className="font-black text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-brand-emerald" />
                  {checkInResult.courtName}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Khung giờ trận đấu</span>
                <span className="font-black text-slate-800 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  {checkInResult.startTime} - {checkInResult.endTime}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Ngày thi đấu</span>
                <span className="font-bold text-slate-700">{checkInResult.playDate}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Trình độ</span>
                <span className="font-bold text-brand-emerald">
                  {getSportLevelLabel(checkInResult.sportLevel)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleScanNext}
              className="touch-target w-full bg-[#064e3b] active:bg-emerald-950 text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Quét Vé Tiếp Theo</span>
            </button>
          </div>
        )}

        {checkInError && (
          <div className="bg-white rounded-3xl p-5 border-2 border-rose-500 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shrink-0">
                <XCircle className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                  Check-in Thất Bại
                </span>
                <h3 className="text-sm font-black text-rose-700 mt-1 leading-snug">
                  {checkInError}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleScanNext}
              className="touch-target w-full bg-slate-800 active:bg-slate-900 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Thử lại hoặc Quét lại</span>
            </button>
          </div>
        )}

        {/* ── 2B. LIVE CAMERA SCANNER VIEW ── */}
        {activeTab === 'camera' && !checkInResult && !checkInError && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-4">
            {/* Viewfinder Container */}
            <div className="relative aspect-square w-full bg-slate-900 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center border-4 border-slate-800">
              {/* HTML5 QR Target Canvas */}
              <div id="qr-live-camera-target" className="w-full h-full" />

              {/* Scanning Target Overlay */}
              {isScanning && (
                <>
                  <div className="qr-laser-line" />
                  
                  {/* Viewfinder Corner Target Brackets */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[72%] h-[72%] border-2 border-dashed border-brand-yellow/70 rounded-3xl relative">
                      <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-brand-yellow rounded-tl-xl" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-brand-yellow rounded-tr-xl" />
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-brand-yellow rounded-bl-xl" />
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-brand-yellow rounded-br-xl" />
                    </div>
                  </div>

                  {/* Hint Label */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold tracking-wide pointer-events-none z-30">
                    Hướng camera vào mã QR vé
                  </div>
                </>
              )}

              {/* Camera Starting Spinner */}
              {isCameraStarting && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-white space-y-3 z-30">
                  <div className="w-10 h-10 border-3 border-white/20 border-t-brand-yellow rounded-full animate-spin" />
                  <p className="text-xs font-black tracking-wide">Đang khởi động Camera...</p>
                </div>
              )}

              {/* Camera Error / Permission Fallback with Safari Guidance */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-900 p-5 flex flex-col items-center justify-center text-center space-y-3 z-30 text-white overflow-y-auto">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white">Chưa cấp quyền Camera</h4>
                    <p className="text-[11px] font-medium text-slate-300 leading-relaxed px-1">
                      {cameraError}
                    </p>
                  </div>

                  <div className="flex flex-col w-full gap-2 pt-1">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="touch-target w-full py-3 bg-brand-yellow text-[#064e3b] rounded-2xl text-xs font-black transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-[#064e3b]" />
                      <span>Bấm để Cấp Quyền & Mở Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSafariGuideOpen(true)}
                      className="touch-target w-full py-2 text-white/70 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Xem hướng dẫn bật Camera trên Safari (iOS)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls Toolbar */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="touch-target flex-1 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-2xl text-xs font-black text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <FlipHorizontal className="w-4 h-4 text-slate-500" />
                <span>{facingMode === 'environment' ? 'Camera Sau' : 'Camera Trước'}</span>
              </button>

              <button
                type="button"
                onClick={startCamera}
                disabled={isCameraStarting}
                className="touch-target px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] active:scale-95 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Làm mới camera"
              >
                <RefreshCw className={`w-4 h-4 ${isCameraStarting ? 'animate-spin' : ''}`} />
                <span>Khởi động lại</span>
              </button>
            </div>
          </div>
        )}

        {/* ── 2C. MANUAL TOKEN INPUT VIEW ── */}
        {activeTab === 'manual' && !checkInResult && !checkInError && (
          <form
            onSubmit={handleManualSubmit}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Keyboard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Nhập Mã Token / Mã Vé
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Nhập mã vé 8 ký tự hoặc token từ vé đặt sân
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Nhập mã vé hoặc dán token QR..."
                  className="w-full pl-11 pr-24 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white transition-all shadow-2xs font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black rounded-xl active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Dán</span>
                </button>
              </div>

              {/* Quick sample token pills for fast demo/test */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 font-bold block mb-1.5">Mã thử nghiệm nhanh:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['TK-DEMO-01', 'TK-TEST-2026', 'TICKET-SPORTA'].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setManualToken(sample)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-brand-emerald hover:border-emerald-200 text-slate-600 border border-slate-200 text-[10px] font-mono font-bold active:scale-95 transition-all cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCheckingIn || !manualToken.trim()}
              className="touch-target w-full bg-[#064e3b] active:bg-emerald-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCheckingIn ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[3]" />
              )}
              <span>{isCheckingIn ? 'Đang xác thực vé...' : 'Xác Thực Check-in Ngay'}</span>
            </button>
          </form>
        )}

        {/* ── 3. RECENT CHECK-INS STRIP ── */}
        {recentCheckIns.length > 0 && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                Vé vừa check-in trong phiên ({recentCheckIns.length})
              </h3>
            </div>

            <div className="space-y-2">
              {recentCheckIns.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="font-black text-slate-800 truncate">{ticket.customerName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                      {ticket.courtName} • {ticket.startTime} - {ticket.endTime}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-brand-emerald" />
                    Đã xé vé
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SAFARI & iOS CAMERA PERMISSION GUIDE MODAL ── */}
        {isSafariGuideOpen && (
          <div className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="fixed inset-0" onClick={() => setIsSafariGuideOpen(false)} />
            
            <div 
              className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-3xl p-6 shadow-2xl z-10 space-y-4 animate-slideUp font-sans"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden -mt-2 mb-2" />

              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    Hướng dẫn bật Camera trên Safari
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Quy định bảo mật của Apple iOS / Safari</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-amber-900 text-[11px] leading-relaxed">
                  <strong>⚠️ Lưu ý quan trọng:</strong> Apple Safari chặn 100% camera nếu bạn mở bằng IP mạng LAN (ví dụ: <code className="font-mono bg-amber-100 px-1 rounded">http://192.168.x.x:5173</code>). Safari chỉ cho phép mở Camera trên <strong className="text-emerald-700">HTTPS</strong> hoặc <strong className="text-emerald-700">localhost</strong>.
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider">Cách 1: Cho phép trên thanh địa chỉ Safari</h4>
                  <p className="text-[11px] leading-relaxed">
                    1. Trên thanh địa chỉ Safari, bấm vào biểu tượng <strong>aA</strong> (hoặc biểu tượng Cài đặt trang web).<br />
                    2. Chọn <strong>Cài đặt trang web (Website Settings)</strong> $\rightarrow$ Mục <strong>Camera</strong> $\rightarrow$ Chọn <strong>Cho phép (Allow)</strong>.
                  </p>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider">Cách 2: Cài đặt hệ thống iPhone / iPad</h4>
                  <p className="text-[11px] leading-relaxed">
                    1. Vào <strong>Cài đặt (Settings)</strong> trên iPhone $\rightarrow$ <strong>Safari</strong>.<br />
                    2. Kéo xuống mục <strong>Camera</strong> $\rightarrow$ Chuyển thành <strong>Hỏi (Ask)</strong> hoặc <strong>Cho phép (Allow)</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSafariGuideOpen(false);
                  startCamera();
                }}
                className="touch-target w-full py-3.5 bg-brand-emerald text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md active:scale-95 transition-all"
              >
                Đã Hiểu & Thử Lại
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default ScanPage;
