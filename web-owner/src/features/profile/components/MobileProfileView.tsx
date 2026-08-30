import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  Edit3, 
  Settings, 
  Camera, 
  Flame, 
  Calendar, 
  Star, 
  CreditCard, 
  Gift, 
  Building2, 
  Sparkles, 
  QrCode, 
  User, 
  FileText, 
  KeyRound, 
  Activity, 
  Headphones, 
  LogOut, 
  ChevronRight,
  Check,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  BotMessageSquare
} from 'lucide-react';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { ContractsListModal } from './ContractsListModal';
import { courtService } from '../../venue/services/courtService';
import type { OwnerProfileData } from '../services/profileService';
import logoSvg from '../../../assets/logo/light/logo-main_40x40px_small.svg';

interface MobileProfileViewProps {
  profileData: OwnerProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<OwnerProfileData>>;
  isSaving: boolean;
  handleProfileSave: (e: React.FormEvent) => Promise<void>;
  passwordData: {
    oldPassword: '';
    newPassword: '';
    confirmPassword: '';
  };
  setPasswordData: React.Dispatch<React.SetStateAction<{
    oldPassword: '';
    newPassword: '';
    confirmPassword: '';
  }>>;
  handlePasswordSave: (e: React.FormEvent) => Promise<void>;
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: (open: boolean) => void;
  executeLogout: () => void;
  isOnline: boolean;
  latency: number | null;
  message: { type: 'success' | 'error'; text: string } | null;
}

export const MobileProfileView: React.FC<MobileProfileViewProps> = ({
  profileData,
  setProfileData,
  isSaving,
  handleProfileSave,
  passwordData,
  setPasswordData,
  handlePasswordSave,
  isLogoutModalOpen,
  setIsLogoutModalOpen,
  executeLogout,
  isOnline,
  latency,
  message
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sheets & Modals state
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isPasswordSheetOpen, setIsPasswordSheetOpen] = useState(false);
  const [isSupportSheetOpen, setIsSupportSheetOpen] = useState(false);
  const [isContractsModalOpen, setIsContractsModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Lock body scroll whenever any sheet/modal is open
  useBodyScrollLock(isEditSheetOpen || isPasswordSheetOpen || isSupportSheetOpen || isContractsModalOpen || isLogoutModalOpen);

  // Dynamic statistics from real API
  const [venuesCount, setVenuesCount] = useState<number>(1);
  const [courtsCount, setCourtsCount] = useState<number>(4);

  useEffect(() => {
    Promise.all([
      courtService.getVenues().catch(() => []),
      courtService.getCourts().catch(() => [])
    ]).then(([venues, courts]) => {
      if (venues && venues.length > 0) setVenuesCount(venues.length);
      if (courts && courts.length > 0) setCourtsCount(courts.length);
    });
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const imageUrl = await courtService.uploadImage(file, 'avatar');
      setProfileData((prev) => ({ ...prev, avatarUrl: imageUrl }));
    } catch (err) {
      console.error('Lỗi khi tải ảnh đại diện:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

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
          {/* Top Bar: Brand, Badge & Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden p-0.5 bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                <img src={logoSvg} alt="Sporta Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-brand-yellow uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 fill-brand-yellow" />
                  <span>Tài khoản chủ sân</span>
                </div>
                <h1 className="text-lg font-black tracking-tight text-white mt-0.5">
                  Hồ Sơ Cá Nhân
                </h1>
              </div>
            </div>

            {/* Right: Quick Action Buttons (Edit & Settings) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditSheetOpen(true)}
                className="touch-target w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-transform backdrop-blur-md shadow-xs"
                title="Chỉnh sửa hồ sơ"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="touch-target w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-transform backdrop-blur-md shadow-xs"
                title="Cài đặt hệ thống"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Toast Notification */}
      {message && (
        <div className="px-4 pt-3">
          <div
            className={`p-3 rounded-2xl text-xs font-bold text-center text-white shadow-md animate-fadeIn ${
              message.type === 'success' ? 'bg-brand-emerald' : 'bg-red-600'
            }`}
          >
            {message.text}
          </div>
        </div>
      )}

      {/* ── 2. MAIN PROFILE HERO CARD ── */}
      <main className="px-4 pt-4 space-y-4">
        <div className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-2xs relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            {/* Avatar with Camera Badge */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 rounded-full ring-2 ring-emerald-500/30 p-1 bg-white shadow-xs">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white text-xl font-black">
                  {profileData.avatarUrl ? (
                    <img
                      src={profileData.avatarUrl}
                      alt={profileData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{profileData.name ? profileData.name.substring(0, 2).toUpperCase() : 'OS'}</span>
                  )}
                </div>
              </div>

              {/* Camera Icon Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#064e3b] text-white flex items-center justify-center border-2 border-white shadow-xs cursor-pointer active:scale-95 transition-transform"
                title="Thay đổi ảnh đại diện"
              >
                {isUploadingAvatar ? (
                  <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3 h-3" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* User Credentials */}
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                {profileData.name || 'Chủ Sân Sporta'}
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {profileData.email || 'owner@sporta.vn'}
              </p>

              {/* Verified Partner Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-black uppercase tracking-wider mt-2 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Đối tác Chủ sân • Đã xác thực</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. 3-METRIC STATS STRIP CARD ── */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs grid grid-cols-3 divide-x divide-slate-100 text-center">
          {/* Metric 1: Venues */}
          <div className="px-1 space-y-0.5">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-1">
              <Flame className="w-4 h-4" />
            </div>
            <p className="text-base font-black text-slate-900 tracking-tight">
              {venuesCount}
            </p>
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
              Cơ Sở
            </span>
            <span className="text-[10px] text-emerald-700 font-extrabold block">
              Đang mở
            </span>
          </div>

          {/* Metric 2: Courts */}
          <div className="px-1 space-y-0.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-base font-black text-slate-900 tracking-tight">
              {courtsCount}
            </p>
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
              Sân Bãi
            </span>
            <span className="text-[10px] text-emerald-700 font-extrabold block">
              Hoạt động
            </span>
          </div>

          {/* Metric 3: Rating & Rate */}
          <div className="px-1 space-y-0.5">
            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-1">
              <Star className="w-4 h-4 fill-sky-500 text-sky-500" />
            </div>
            <p className="text-base font-black text-slate-900 tracking-tight">
              4.9 ★
            </p>
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
              Đánh Giá
            </span>
            <span className="text-[10px] text-emerald-700 font-extrabold block">
              Tỷ lệ cao
            </span>
          </div>
        </div>

        {/* ── 4. 2-COLUMN MINI FEATURE CARDS ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Ví của tôi */}
          <div
            onClick={() => navigate('/wallet')}
            className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 cursor-pointer active:scale-98 transition-all hover:border-emerald-200"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center shrink-0 shadow-2xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-900 truncate">
                  Ví của tôi
                </h4>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  Số dư & rút tiền
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </div>

          {/* Card 2: Quản lý khuyến mãi */}
          <div
            onClick={() => navigate('/vouchers')}
            className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 cursor-pointer active:scale-98 transition-all hover:border-amber-200"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Gift className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-900 truncate">
                  Quản lý khuyến mãi
                </h4>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  Ưu đãi & giảm giá
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </div>
        </div>

        {/* ── 5. CATEGORY 1: HOẠT ĐỘNG & VẬN HÀNH ── */}
        <div className="space-y-2 pt-1">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider px-1">
            Hoạt động & Vận hành
          </h3>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {/* Item 1: Operations */}
            <div
              onClick={() => navigate('/operations')}
              className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center shrink-0">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    Quản lý cụm sân & Sân bãi
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    Cấu hình cơ sở thể thao và từng sân lẻ
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>

            {/* Item 2: Matrix */}
            <div
              onClick={() => navigate('/matrix')}
              className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    Sơ đồ ma trận đặt sân
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    Theo dõi lịch đặt sân, ca trống và đặt lịch
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>

            {/* Item 3: Dynamic Pricing AI */}
            <div
              onClick={() => navigate('/pricing')}
              className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center shrink-0">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 truncate">
                      Dự báo & Định giá động AI
                    </h4>
                    <span className="px-1.5 py-0.2 rounded-md bg-brand-yellow text-[#064e3b] text-[9px] font-black uppercase">
                      AI Mới
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    Tối ưu giá giờ vàng & kích cầu tự động
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>

            {/* Item 4: Scan QR */}
            <div
              onClick={() => navigate('/scan')}
              className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <QrCode className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    Quét mã QR Check-in
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    Xác thực vé vào sân và lượt khách chơi
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>
          </div>
        </div>

        {/* ── 6. CATEGORY 2: TÀI KHOẢN & HỢP ĐỒNG ── */}
        <div className="space-y-2 pt-1">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider px-1">
            Tài khoản & Hợp đồng
          </h3>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {/* Item 1: Edit Profile */}
            <div
              onClick={() => setIsEditSheetOpen(true)}
              className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    Chỉnh sửa thông tin hồ sơ
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    Tên chủ sân, số điện thoại & địa chỉ
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>

            {/* Item 2: Contracts */}
            <div
              onClick={() => setIsContractsModalOpen(true)}
              className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    Hợp đồng & Pháp lý cụm sân
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    Chi tiết hợp đồng hợp tác đã ký với Sporta
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>

            {/* Item 3: Change Password */}
            <div
              onClick={() => setIsPasswordSheetOpen(true)}
              className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    Đổi mật khẩu & Bảo mật
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    Cập nhật mật khẩu đăng nhập tài khoản
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>
          </div>
        </div>

        {/* ── 7. CATEGORY 3: HỆ THỐNG & HỖ TRỢ ── */}
        <div className="space-y-2 pt-1">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider px-1">
            Hệ thống & Hỗ trợ
          </h3>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {/* Item 1: Settings */}
            <div
              onClick={() => navigate('/settings')}
              className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Settings className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    Cài đặt hệ thống
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    Đặt cọc, duyệt đơn & cấu hình tự động
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>

            {/* Item 2: System Status */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    Trạng thái kết nối API
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    Ứng dụng quản lý chủ sân
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                isOnline ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span>{isOnline ? `Online${latency ? ` (${latency}ms)` : ''}` : 'Offline'}</span>
              </span>
            </div>

            {/* Item 3: Support */}
            <div
              onClick={() => setIsSupportSheetOpen(true)}
              className="p-3.5 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    Trung tâm trợ giúp đối tác
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    Hotline hỗ trợ kỹ thuật và CSKH 24/7
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>
          </div>
        </div>

        {/* ── 8. LOGOUT ACTION CARD ── */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full bg-red-50/70 hover:bg-red-100/70 border border-red-200 text-red-600 font-black text-xs py-3.5 rounded-3xl active:scale-98 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </main>

      {/* ── 9. MOBILE EDIT PROFILE BOTTOM SHEET ── */}
      {isEditSheetOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsEditSheetOpen(false)} />
          <div
            className="relative w-full bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-10 max-h-[88dvh] flex flex-col animate-slideUp font-sans"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Chỉnh sửa hồ sơ cá nhân</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Thông tin định danh và Căn cước công dân của chủ sân</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditSheetOpen(false)}
                className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={async (e) => {
                await handleProfileSave(e);
                setIsEditSheetOpen(false);
              }}
              className="space-y-3.5 overflow-y-auto flex-1 pr-1 pb-4"
            >
              {/* Avatar Preview in Sheet */}
              <div className="flex items-center gap-3.5 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full ring-2 ring-emerald-500/20 p-0.5 bg-white overflow-hidden">
                    {profileData.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt={profileData.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-emerald-800 text-white font-black flex items-center justify-center text-xs rounded-full">
                        {profileData.name ? profileData.name.substring(0, 2).toUpperCase() : 'OS'}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#064e3b] text-white flex items-center justify-center border-2 border-white shadow-2xs"
                  >
                    <Camera className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-800">Ảnh đại diện định danh</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Bấm vào camera để tải ảnh mới từ máy</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Họ và tên chủ sân
                </label>
                <input
                  type="text"
                  value={profileData.name || ''}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white"
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Số điện thoại liên hệ
                </label>
                <input
                  type="tel"
                  value={profileData.phone || ''}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white"
                  placeholder="Nhập số điện thoại..."
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Số Căn cước công dân (CCCD / CMND)
                </label>
                <input
                  type="text"
                  value={profileData.idNumber || ''}
                  onChange={(e) => setProfileData({ ...profileData, idNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white"
                  placeholder="Nhập 12 số CCCD gắn chip..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={profileData.dateOfBirth || ''}
                  onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Quê quán / Địa chỉ thường trú
                </label>
                <input
                  type="text"
                  value={profileData.hometown || ''}
                  onChange={(e) => setProfileData({ ...profileData, hometown: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white"
                  placeholder="Tỉnh/Thành phố quê quán..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="touch-target w-full py-3.5 bg-[#064e3b] active:bg-emerald-950 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu thông tin cá nhân'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── 11. MOBILE CHANGE PASSWORD BOTTOM SHEET ── */}
      {isPasswordSheetOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsPasswordSheetOpen(false)} />
          <div
            className="relative w-full bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-10 max-h-[88dvh] flex flex-col animate-slideUp font-sans"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Đổi mật khẩu tài khoản</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Bảo vệ an toàn cho tài khoản chủ sân</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordSheetOpen(false)}
                className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={async (e) => {
                await handlePasswordSave(e);
                setIsPasswordSheetOpen(false);
              }}
              className="space-y-3.5 overflow-y-auto flex-1 pr-1 pb-4"
            >
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white"
                  placeholder="Tối thiểu 6 ký tự"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="touch-target w-full py-3.5 bg-brand-emerald active:bg-emerald-950 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSaving ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── 12. MOBILE SUPPORT BOTTOM SHEET ── */}
      {isSupportSheetOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsSupportSheetOpen(false)} />
          <div
            className="relative w-full bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-10 max-h-[85dvh] flex flex-col animate-slideUp font-sans"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Trung tâm trợ giúp đối tác</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Đội ngũ kỹ thuật & vận hành Sporta 24/7</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportSheetOpen(false)}
                className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <a
                href="tel:1900888888"
                className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3 active:scale-98 transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-emerald text-white flex items-center justify-center font-bold shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900">Hotline Đối tác Chủ sân</p>
                  <p className="text-[11px] text-emerald-800 font-bold mt-0.5">1900 888 888 (Miễn phí 24/7)</p>
                </div>
              </a>

              <a
                href="mailto:support@sporta.vn"
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 active:scale-98 transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900">Email Hỗ trợ kỹ thuật</p>
                  <p className="text-[11px] text-slate-600 font-bold mt-0.5">support@sporta.vn</p>
                </div>
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── 13. CONTRACTS MODAL ── */}
      <ContractsListModal
        isOpen={isContractsModalOpen}
        onClose={() => setIsContractsModalOpen(false)}
      />

      {/* ── 14. LOGOUT CONFIRMATION MODAL ── */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={executeLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản lý chủ sân Sporta?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        variant="logout"
      />
    </div>
  );
};
export default MobileProfileView;
