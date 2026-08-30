import React from 'react';
import { 
  Bell, 
  ShieldCheck, 
  Calendar, 
  RotateCcw, 
  Check, 
  Volume2, 
  LayoutGrid, 
  List, 
  Lock,
  Sparkles,
  Construction
} from 'lucide-react';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import type { OwnerSettingsData } from '../services/settingsService';

interface SettingsFormProps {
  configData: OwnerSettingsData;
  setConfigData: React.Dispatch<React.SetStateAction<OwnerSettingsData>>;
  isSaving: boolean;
  handleConfigSave: (e?: React.FormEvent) => Promise<void>;
  isMobile: boolean;
  isResetModalOpen: boolean;
  setIsResetModalOpen: (open: boolean) => void;
  isResetting: boolean;
  handleResetSettings: () => Promise<void>;
  handleOtpToggleAttempt: () => void;
  playTestSound: () => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  configData,
  setConfigData,
  isSaving,
  handleConfigSave,
  isMobile,
  isResetModalOpen,
  setIsResetModalOpen,
  isResetting,
  handleResetSettings,
  handleOtpToggleAttempt,
  playTestSound,
}) => {
  // Toggle Helper
  const toggleSetting = (key: keyof OwnerSettingsData) => {
    setConfigData((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ══════════════════════════════════════════════════════════════════
  // MOBILE VIEW
  // ══════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div className="space-y-4 font-sans select-none pb-1">
        {/* ── CARD 1: THÔNG BÁO & CẢNH BÁO ── */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-emerald flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Thông Báo & Cảnh Báo
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Cấu hình thông báo vận hành sân</p>
            </div>
          </div>

          {/* Item 1: Đơn đặt mới */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-800">Thông báo đơn đặt sân mới</h4>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">
                Nhận cảnh báo đẩy và âm thanh khi có khách vừa đặt lịch hoặc thanh toán cọc.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting('notifyNewBooking')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                configData.notifyNewBooking ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  configData.notifyNewBooking ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 2: Hủy lịch / đổi ca */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-800">Cảnh báo hủy lịch & đổi ca</h4>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">
                Cảnh báo tức thì khi có yêu cầu hủy đơn để chủ sân kịp giải phóng khung giờ.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting('notifyCancellation')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                configData.notifyCancellation ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  configData.notifyCancellation ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 3: Âm thanh QR check-in */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-slate-800">Âm thanh & Rung Check-in</h4>
                <button
                  type="button"
                  onClick={playTestSound}
                  className="px-2 py-0.5 rounded-lg bg-emerald-50 text-brand-emerald text-[9px] font-black hover:bg-emerald-100 active:scale-95 flex items-center gap-1 transition-all"
                  title="Nghe thử âm thanh"
                >
                  <Volume2 className="w-2.5 h-2.5" />
                  <span>Thử</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">
                Phát âm báo "Bíp" và rung nhẹ khi quét mã QR vé check-in thành công.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting('notifyOnScan')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                configData.notifyOnScan ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  configData.notifyOnScan ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 4: Báo cáo tổng kết doanh thu */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-800">Báo cáo doanh thu hàng ngày</h4>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">
                Gửi email tổng kết doanh thu và số lượt phục vụ vào 23:00 mỗi ngày.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting('dailyRevenueReport')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                configData.dailyRevenueReport ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  configData.dailyRevenueReport ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── CARD 2: BẢO MẬT & PHIÊN LÀM VIỆC ── */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Bảo Mật & Phiên Làm Việc
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Bảo vệ tài khoản và dòng tiền</p>
            </div>
          </div>

          {/* Item 1: OTP Rút tiền (Đang phát triển) */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-black text-slate-800">Xác thực OTP khi Rút tiền</h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Construction className="w-2.5 h-2.5" />
                  <span>Đang phát triển</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">
                Bắt buộc nhập mã OTP gửi về email khi tạo lệnh rút tiền về ngân hàng.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOtpToggleAttempt}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-slate-200 opacity-80"
              title="Tính năng đang phát triển"
            >
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out translate-x-0" />
            </button>
          </div>

          {/* Item 2: Timeout phiên */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div>
              <h4 className="text-xs font-black text-slate-800">Tự động khóa phiên khi không hoạt động</h4>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Bảo vệ dữ liệu khi để thiết bị tại quầy lễ tân.
              </p>
            </div>
            <select
              value={configData.sessionTimeoutMinutes}
              onChange={(e) =>
                setConfigData((prev) => ({
                  ...prev,
                  sessionTimeoutMinutes: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white transition-all"
            >
              <option value={15}>Sau 15 phút không hoạt động</option>
              <option value={30}>Sau 30 phút không hoạt động (Mặc định)</option>
              <option value={60}>Sau 1 giờ không hoạt động</option>
              <option value={0}>Không bao giờ (Tắt tự động khóa)</option>
            </select>
          </div>
        </div>

        {/* ── CARD 3: TRẢI NGHIỆM & HIỂN THỊ ── */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Trải Nghiệm & Hiển Thị
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Tùy biến màn hình lịch đặt</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-black text-slate-800">Chế độ xem lịch đặt mặc định</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfigData((prev) => ({ ...prev, defaultBookingView: 'grid' }))}
                className={`touch-target p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  configData.defaultBookingView === 'grid'
                    ? 'border-brand-emerald bg-emerald-50/70 text-brand-emerald shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <LayoutGrid className="w-4 h-4" />
                  {configData.defaultBookingView === 'grid' && (
                    <span className="w-2 h-2 rounded-full bg-brand-emerald" />
                  )}
                </div>
                <span className="text-xs font-black">Lưới Ma Trận</span>
                <span className="text-[9px] text-slate-400 font-medium leading-tight">
                  Hiển thị trực quan toàn bộ sân theo trục thời gian.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setConfigData((prev) => ({ ...prev, defaultBookingView: 'list' }))}
                className={`touch-target p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  configData.defaultBookingView === 'list'
                    ? 'border-brand-emerald bg-emerald-50/70 text-brand-emerald shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <List className="w-4 h-4" />
                  {configData.defaultBookingView === 'list' && (
                    <span className="w-2 h-2 rounded-full bg-brand-emerald" />
                  )}
                </div>
                <span className="text-xs font-black">Thẻ Danh Sách</span>
                <span className="text-[9px] text-slate-400 font-medium leading-tight">
                  Liệt kê theo từng đơn đặt tuần tự dễ tìm kiếm.
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => handleConfigSave()}
            disabled={isSaving}
            className="touch-target w-full bg-[#064e3b] active:bg-emerald-950 text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4 stroke-[3]" />
            )}
            <span>{isSaving ? 'Đang lưu cấu hình...' : 'Lưu Cài Đặt Hệ Thống'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="touch-target w-full py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục cài đặt gốc</span>
          </button>
        </div>

        {/* Reset Confirmation Modal */}
        <ConfirmModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleResetSettings}
          title="Khôi phục cài đặt gốc?"
          message="Toàn bộ cấu hình thông báo, bảo mật và chế độ hiển thị sẽ được đặt lại về trạng thái mặc định của Sporta."
          confirmText={isResetting ? 'Đang đặt lại...' : 'Khôi phục mặc định'}
          cancelText="Hủy bỏ"
          variant="warning"
        />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // DESKTOP VIEW
  // ══════════════════════════════════════════════════════════════════
  return (
    <form onSubmit={handleConfigSave} className="space-y-6 font-sans">
      {/* ── CARD 1: THÔNG BÁO & CẢNH BÁO ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Thông Báo & Cảnh Báo Vận Hành
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Quản lý các kênh nhận thông báo và âm báo tại sân
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Item 1 */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
            <div className="space-y-0.5 pr-3">
              <h4 className="text-xs font-black text-slate-800">Thông báo đơn đặt sân mới</h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Gửi thông báo đẩy và âm thanh khi có đơn đặt mới từ khách hàng.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting('notifyNewBooking')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                configData.notifyNewBooking ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  configData.notifyNewBooking ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
            <div className="space-y-0.5 pr-3">
              <h4 className="text-xs font-black text-slate-800">Cảnh báo hủy lịch & đổi ca</h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Cảnh báo khẩn khi khách hủy lịch để kịp thời giải phóng khung giờ.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting('notifyCancellation')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                configData.notifyCancellation ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  configData.notifyCancellation ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-slate-800">Âm thanh & Rung khi Check-in</h4>
                <button
                  type="button"
                  onClick={playTestSound}
                  className="px-2 py-0.5 rounded-md bg-emerald-100 text-brand-emerald text-[10px] font-black hover:bg-emerald-200 active:scale-95 flex items-center gap-1 transition-all cursor-pointer"
                  title="Nghe thử âm thanh"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Nghe thử</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Phát âm báo "Bíp" xác nhận khi quét mã QR vé check-in thành công.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting('notifyOnScan')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                configData.notifyOnScan ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  configData.notifyOnScan ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Item 4 */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
            <div className="space-y-0.5 pr-3">
              <h4 className="text-xs font-black text-slate-800">Báo cáo doanh thu hàng ngày</h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Tự động gửi email tổng kết doanh thu và ca chơi vào 23:00 hàng ngày.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting('dailyRevenueReport')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                configData.dailyRevenueReport ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  configData.dailyRevenueReport ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD 2: BẢO MẬT & PHIÊN LÀM VIỆC ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Bảo Mật & Phiên Làm Việc
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Chính sách bảo vệ tài khoản và an toàn giao dịch
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* OTP Rút tiền (Đang phát triển) */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-black text-slate-800">Xác thực OTP khi Rút tiền</h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Construction className="w-2.5 h-2.5" />
                  <span>Đang phát triển</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Bắt buộc nhập mã xác thực OTP gửi về email khi tạo yêu cầu rút tiền.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOtpToggleAttempt}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-slate-200 opacity-80"
              title="Tính năng đang phát triển"
            >
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out translate-x-0" />
            </button>
          </div>

          {/* Session Timeout */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-2">
            <h4 className="text-xs font-black text-slate-800">Tự động khóa phiên khi không hoạt động</h4>
            <select
              value={configData.sessionTimeoutMinutes}
              onChange={(e) =>
                setConfigData((prev) => ({
                  ...prev,
                  sessionTimeoutMinutes: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald transition-all"
            >
              <option value={15}>Sau 15 phút không hoạt động</option>
              <option value={30}>Sau 30 phút không hoạt động (Mặc định)</option>
              <option value={60}>Sau 1 giờ không hoạt động</option>
              <option value={0}>Không bao giờ (Tắt tự động khóa)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── CARD 3: TRẢI NGHIỆM & HIỂN THỊ ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Trải Nghiệm & Hiển Thị
            </h3>
            <p className="text-xs text-slate-400 font-medium">Tùy biến chế độ xem lịch đặt sân</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-800">Chế độ xem lịch đặt mặc định</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setConfigData((prev) => ({ ...prev, defaultBookingView: 'grid' }))}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                configData.defaultBookingView === 'grid'
                  ? 'border-brand-emerald bg-emerald-50/70 shadow-2xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  configData.defaultBookingView === 'grid'
                    ? 'bg-brand-emerald text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800">Lưới Ma Trận (Grid View)</span>
                  {configData.defaultBookingView === 'grid' && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-emerald text-white text-[9px] font-black uppercase">
                      Đang chọn
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Hiển thị trực quan toàn bộ các sân theo trục thời gian 24 giờ.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setConfigData((prev) => ({ ...prev, defaultBookingView: 'list' }))}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                configData.defaultBookingView === 'list'
                  ? 'border-brand-emerald bg-emerald-50/70 shadow-2xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  configData.defaultBookingView === 'list'
                    ? 'bg-brand-emerald text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <List className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800">Thẻ Danh Sách (Card List)</span>
                  {configData.defaultBookingView === 'list' && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-emerald text-white text-[9px] font-black uppercase">
                      Đang chọn
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Liệt kê theo từng đơn đặt theo danh sách tuần tự dễ tìm kiếm.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ACTIONS ── */}
      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsResetModalOpen(true)}
          className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-600 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Khôi phục cài đặt gốc</span>
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-brand-emerald hover:bg-emerald-800 active:bg-emerald-950 text-white font-black text-xs px-8 py-4 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4 stroke-[3]" />
          )}
          <span>{isSaving ? 'Đang cập nhật...' : 'Lưu Cấu Hình Hệ Thống'}</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetSettings}
        title="Khôi phục cài đặt gốc?"
        message="Toàn bộ cấu hình thông báo, bảo mật và chế độ hiển thị sẽ được đặt lại về trạng thái mặc định của Sporta."
        confirmText={isResetting ? 'Đang đặt lại...' : 'Khôi phục mặc định'}
        cancelText="Hủy bỏ"
        variant="warning"
      />
    </form>
  );
};
export default SettingsForm;
