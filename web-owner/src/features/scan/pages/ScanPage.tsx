import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ticketService } from '../../venue/services/ticketService';
import { getSportLevelLabel } from '../../venue/hooks/useTicketSessions';
import type { TicketCheckInResponse } from '../../venue/types/ticket.types';
import { 
  QrCode, 
  Camera, 
  CameraOff,
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
  HelpCircle,
  Play,
  Square,
  User,
  Phone,
  Mail,
  Volume2,
  VolumeX,
  Maximize2,
  Calendar,
  Award,
  Ticket as TicketIcon,
  Info,
  ShieldCheck,
  Power
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
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Check-in results
  const [checkInResult, setCheckInResult] = useState<TicketCheckInResponse | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<TicketCheckInResponse[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lastScannedTokenRef = useRef<string | null>(null);
  const lastScanTimestampRef = useRef<number>(0);

  // Detect insecure context (HTTP LAN)
  const isHttpOnLan = typeof window !== 'undefined' && 
    !window.isSecureContext && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';

  // Play audio & vibration feedback
  const playFeedbackSound = (isSuccess: boolean) => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (isSuccess) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15);
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

  // Stop hardware media tracks
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

  // Stop camera helper
  const stopCamera = async () => {
    if (isStoppingRef.current) return;
    if (scannerRef.current) {
      isStoppingRef.current = true;
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
        setIsCameraStarting(false);
        isStoppingRef.current = false;
      }
    }
    stopCameraStreams();
    setIsScanning(false);
  };

  // Start camera scanner
  const startCamera = async () => {
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
      const qrTarget = document.getElementById('qr-live-camera-target');
      if (!qrTarget) {
        setIsCameraStarting(false);
        return;
      }

      const scanner = new Html5Qrcode('qr-live-camera-target');
      scannerRef.current = scanner;

      const qrBoxDimension = Math.min(
        Math.floor(window.innerWidth * 0.7),
        320
      );

      const config = {
        fps: 20,
        qrbox: { width: qrBoxDimension, height: qrBoxDimension },
        aspectRatio: 1.0,
      };

      await scanner.start(
        { facingMode },
        config,
        (decodedText) => {
          handleOnScanSuccess(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
      setIsCameraStarting(false);
      setCameraError(null);
    } catch (err: any) {
      console.error('Camera start error:', err);
      setIsScanning(false);
      setIsCameraStarting(false);

      const errorStr = err?.message || String(err);
      if (errorStr.includes('NotAllowedError') || errorStr.includes('Permission')) {
        setCameraError(
          isHttpOnLan
            ? 'Apple Safari không cấp quyền Camera qua kết nối HTTP LAN. Vui lòng mở qua localhost hoặc sử dụng HTTPS.'
            : 'Bạn đã từ chối quyền Camera. Vui lòng bấm vào biểu tượng Camera/Ổ khóa trên thanh địa chỉ trình duyệt để Cho phép (Allow).'
        );
      } else if (errorStr.includes('NotFoundError') || errorStr.includes('DevicesNotFoundError')) {
        setCameraError('Không tìm thấy thiết bị Camera trên máy tính hoặc điện thoại của bạn.');
      } else if (errorStr.includes('NotReadableError') || errorStr.includes('TrackStartError')) {
        setCameraError('Camera đang bị ứng dụng khác sử dụng (ví dụ: Zalo, Zoom, Teams). Vui lòng tắt các ứng dụng đó.');
      } else {
        setCameraError(
          isHttpOnLan 
            ? 'Safari chặn Camera trên HTTP LAN. Vui lòng thử dùng mã thủ công hoặc chuyển sang HTTPS.'
            : `Không thể mở Camera: ${errorStr}`
        );
      }
    }
  };

  // Turn off camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle successful QR scan
  const handleOnScanSuccess = (decodedText: string) => {
    const now = Date.now();
    if (
      lastScannedTokenRef.current === decodedText &&
      now - lastScanTimestampRef.current < 4000
    ) {
      return;
    }

    if (isProcessingRef.current) return;

    lastScannedTokenRef.current = decodedText;
    lastScanTimestampRef.current = now;
    handleProcessCheckIn(decodedText);
  };

  // API Call Check-in Ticket
  const handleProcessCheckIn = async (tokenOrCode: string) => {
    if (!tokenOrCode || !tokenOrCode.trim()) return;
    const cleanToken = tokenOrCode.trim();

    setIsCheckingIn(true);
    isProcessingRef.current = true;
    setCheckInError(null);
    setCheckInResult(null);

    try {
      const response = await ticketService.checkInTicket(cleanToken);
      setCheckInResult(response);
      setRecentCheckIns((prev) => {
        const withoutDuplicate = prev.filter((p) => p.ticketId !== response.ticketId);
        return [response, ...withoutDuplicate].slice(0, 10);
      });
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
    if (isScanning) {
      setTimeout(() => startCamera(), 100);
    }
  };

  // Reset to scan next ticket
  const handleScanNext = () => {
    isProcessingRef.current = false;
    setCheckInResult(null);
    setCheckInError(null);
    setManualToken('');
  };

  return (
    <div className="font-sans min-h-dvh bg-slate-100/70 select-none flex flex-col pb-16">
      {/* Laser Animation Styles */}
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
          border-radius: 1rem !important;
        }
        #qr-live-camera-target {
          border: none !important;
        }
      `}</style>

      {/* ── 1. NON-STICKY CLEAN HEADER ── */}
      <header className="bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#064e3b] border border-emerald-200/80 flex items-center justify-center shadow-2xs shrink-0">
              <QrCode className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Quét Mã QR & Xác Thực Vé
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-brand-emerald" />
                  Live POS Terminal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Đối soát ca xé vé, xác thực check-in nhận sân cho người chơi
              </p>
            </div>
          </div>

          {/* Top Controls on Header */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsSoundEnabled((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isSoundEnabled
                  ? 'bg-emerald-50 text-[#064e3b] border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
              title={isSoundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{isSoundEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}</span>
            </button>

            {/* Mode Switcher Buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('camera');
                  setCheckInResult(null);
                  setCheckInError(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'camera'
                    ? 'bg-white text-[#064e3b] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('manual');
                  stopCamera();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'manual'
                    ? 'bg-white text-[#064e3b] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Nhập mã</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. DESKTOP 2-COLUMN RESPONSIVE WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ═══════════════════════════════════════════════
              LEFT COLUMN (CAMERA VIEWFINDER & INPUTS)
             ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-5">
            {/* Camera Viewfinder Card */}
            {activeTab === 'camera' && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      {isScanning ? 'Khung Ngắm Quét Trực Tiếp' : 'Camera Quét QR'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {isScanning && (
                      <button
                        type="button"
                        onClick={toggleFacingMode}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5 text-slate-500" />
                        <span>{facingMode === 'environment' ? 'Camera Sau' : 'Camera Trước'}</span>
                      </button>
                    )}

                    {/* Turn ON / Turn OFF Button */}
                    {isScanning || isCameraStarting ? (
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <CameraOff className="w-3.5 h-3.5" />
                        <span>Tắt Camera</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] border border-emerald-200 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Bật Camera</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Viewfinder Container */}
                <div className="relative aspect-square sm:aspect-[4/3] w-full bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-slate-800">
                  {/* Target Canvas */}
                  <div id="qr-live-camera-target" className={`w-full h-full ${!isScanning ? 'hidden' : ''}`} />

                  {/* Camera OFF Default State */}
                  {!isScanning && !isCameraStarting && !cameraError && (
                    <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-center p-6 space-y-3.5 text-white">
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                        <CameraOff className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-200">Camera đang tắt</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                          Bấm nút bên dưới để mở camera quét mã QR vé hoặc nhập mã vé thủ công.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-5 py-2.5 bg-[#064e3b] hover:bg-emerald-950 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Bật Camera Quét</span>
                      </button>
                    </div>
                  )}

                  {/* Scanning Laser and Corners */}
                  {isScanning && (
                    <>
                      <div className="qr-laser-line" />
                      
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[68%] h-[68%] border-2 border-dashed border-amber-400/80 rounded-2xl relative">
                          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-xl" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-xl" />
                          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-xl" />
                          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-xl" />
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold pointer-events-none z-30">
                        Đặt mã QR vé vào trung tâm khung ngắm
                      </div>
                    </>
                  )}

                  {/* Loading Spinner */}
                  {isCameraStarting && (
                    <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-white space-y-3 z-30">
                      <div className="w-10 h-10 border-3 border-white/20 border-t-amber-400 rounded-full animate-spin" />
                      <p className="text-xs font-bold">Đang khởi động Camera...</p>
                    </div>
                  )}

                  {/* Error & Permission Guidance */}
                  {cameraError && (
                    <div className="absolute inset-0 bg-slate-900 p-6 flex flex-col items-center justify-center text-center space-y-3 z-30 text-white overflow-y-auto">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Chưa cấp quyền Camera</h4>
                        <p className="text-xs font-medium text-slate-300 leading-relaxed max-w-sm">
                          {cameraError}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2.5 bg-brand-emerald text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Cấp Quyền & Thử Lại</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsSafariGuideOpen(true)}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Hướng dẫn Safari</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manual Input Search & Fast Barcode Gun Form */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-[#064e3b]" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Nhập Thủ Công / Quét Súng Barcode
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Hỗ trợ mã vé 6 ký tự hoặc Token QR</span>
              </div>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                    placeholder="Nhập mã vé (ví dụ: A7K2MX) hoặc quét mã vạch..."
                    className="w-full pl-10 pr-20 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-brand-emerald focus:bg-white transition-all font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>Dán</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isCheckingIn || !manualToken.trim()}
                  className="px-5 py-3 bg-[#064e3b] hover:bg-emerald-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isCheckingIn ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                  <span>Xác Thực</span>
                </button>
              </form>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              RIGHT COLUMN (CHECK-IN RESULT & SESSION HISTORY)
             ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-5">
            {/* ── 2A. CHECK-IN SUCCESS RESULT CARD ── */}
            {checkInResult && (
              <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500 shadow-md space-y-4 animate-scaleUp">
                {/* Header Banner */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                      <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                        Hợp Lệ • Check-in Thành Công
                      </span>
                      <h3 className="text-base font-black text-slate-900 tracking-tight mt-0.5">
                        {checkInResult.customerName}
                      </h3>
                    </div>
                  </div>

                  {checkInResult.shortCode && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Mã vé</span>
                      <span className="text-xs font-black font-mono tracking-widest text-[#064e3b] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        #{checkInResult.shortCode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Customer Details Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-3 text-xs">
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
                    {checkInResult.customerAvatar ? (
                      <img 
                        src={checkInResult.customerAvatar} 
                        alt={checkInResult.customerName}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-300 shadow-2xs" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#064e3b] flex items-center justify-center font-bold text-sm border border-emerald-200">
                        {checkInResult.customerName?.charAt(0)?.toUpperCase() || 'K'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 truncate">{checkInResult.customerName}</h4>
                      {checkInResult.customerPhone && (
                        <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{checkInResult.customerPhone}</span>
                        </p>
                      )}
                      {checkInResult.customerEmail && (
                        <p className="text-[10.5px] text-slate-400 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{checkInResult.customerEmail}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Grid of match details */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Sân thi đấu</span>
                      <span className="font-bold text-[#064e3b] flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {checkInResult.courtName}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Khung giờ</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {checkInResult.startTime?.substring(0, 5)} - {checkInResult.endTime?.substring(0, 5)}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Ngày chơi</span>
                      <span className="font-medium text-slate-700">{checkInResult.playDate}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Trình độ</span>
                      <span className="font-semibold text-emerald-700">
                        {getSportLevelLabel(checkInResult.sportLevel)}
                      </span>
                    </div>

                    <div className="col-span-2 flex justify-between items-center pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Số lượng vé check-in:</span>
                      <span className="font-bold text-[#064e3b] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {checkInResult.quantity || 1} slot (vé)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleScanNext}
                  className="w-full bg-[#064e3b] hover:bg-emerald-950 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Quét Vé Tiếp Theo</span>
                </button>
              </div>
            )}

            {/* ── 2B. CHECK-IN ERROR CARD ── */}
            {checkInError && (
              <div className="bg-white rounded-3xl p-5 border-2 border-rose-500 shadow-md space-y-4 animate-scaleUp">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
                    <XCircle className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                      Check-in Thất Bại
                    </span>
                    <h3 className="text-sm font-bold text-rose-700 mt-1 leading-snug">
                      {checkInError}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleScanNext}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Thử lại hoặc Quét lại</span>
                </button>
              </div>
            )}

            {/* ── 2C. IDLE STATE PLACEHOLDER (When no result yet on Desktop) ── */}
            {!checkInResult && !checkInError && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#064e3b] border border-emerald-200/70 flex items-center justify-center mx-auto">
                  <QrCode className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">
                    Sẵn sàng kiểm tra vé
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Bật camera hoặc nhập mã vé để đối soát thông tin ca chơi tức thì.
                  </p>
                </div>
              </div>
            )}

            {/* ── 2D. RECENT CHECK-INS IN THIS SESSION ── */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Vé Đã Xé Trong Phiên ({recentCheckIns.length})
                  </h3>
                </div>
                {recentCheckIns.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Gần nhất
                  </span>
                )}
              </div>

              {recentCheckIns.length === 0 ? (
                <div className="py-6 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-medium">Chưa có vé nào được quét trong phiên này</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {recentCheckIns.map((ticket) => (
                    <div
                      key={ticket.ticketId}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs hover:bg-emerald-50/50 transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-slate-900 truncate">{ticket.customerName}</h4>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {ticket.courtName} • {ticket.startTime?.substring(0, 5)} - {ticket.endTime?.substring(0, 5)}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold block">
                          {ticket.quantity || 1} vé
                        </span>
                        {ticket.shortCode && (
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            #{ticket.shortCode}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

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
                className="w-full py-3.5 bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer"
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
