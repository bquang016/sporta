import React from 'react';
import { Sliders, Bell, Clock, Percent, Check } from 'lucide-react';

interface SettingsFormProps {
  configData: {
    autoApprove: boolean;
    notifyOnScan: boolean;
    minAdvanceHours: number;
    depositPercent: number;
  };
  setConfigData: React.Dispatch<React.SetStateAction<{
    autoApprove: boolean;
    notifyOnScan: boolean;
    minAdvanceHours: number;
    depositPercent: number;
  }>>;
  isSaving: boolean;
  handleConfigSave: (e: React.FormEvent) => void;
  isMobile: boolean;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  configData,
  setConfigData,
  isSaving,
  handleConfigSave,
  isMobile
}) => {
  if (isMobile) {
    return (
      <div className="space-y-4 font-sans">
        {/* Section 1: Tự động duyệt */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-brand-emerald" />
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
              Tự động duyệt & vận hành
            </h3>
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-800">Tự động duyệt đơn đặt</h4>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">
                Khi khách thanh toán trực tuyến thành công, hệ thống tự động xác nhận đơn.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfigData({ ...configData, autoApprove: !configData.autoApprove })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                configData.autoApprove ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  configData.autoApprove ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-black text-slate-800">Âm thanh thông báo check-in</h4>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">
                Phát âm thanh báo hiệu khi quét mã QR vé check-in thành công.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfigData({ ...configData, notifyOnScan: !configData.notifyOnScan })}
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
        </div>

        {/* Section 2: Chính sách thời gian và cọc */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
              Chính sách thời gian & đặt cọc
            </h3>
          </div>
          
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Thời gian đặt trước tối thiểu (Giờ)
              </label>
              <input 
                type="number" 
                value={configData.minAdvanceHours} 
                onChange={(e) => setConfigData({ ...configData, minAdvanceHours: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-bold text-slate-800 px-3.5 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
                min="1" 
                required 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                Phần trăm tiền cọc giữ sân (%)
              </label>
              <input 
                type="number" 
                value={configData.depositPercent} 
                onChange={(e) => setConfigData({ ...configData, depositPercent: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-bold text-slate-800 px-3.5 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
                min="0" 
                max="100" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button 
          type="button"
          onClick={handleConfigSave}
          disabled={isSaving}
          className="touch-target w-full bg-brand-emerald active:bg-emerald-950 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu cấu hình hệ thống'}</span>
        </button>
      </div>
    );
  }

  // Desktop View
  return (
    <form onSubmit={handleConfigSave} className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
      {/* OPERATIONAL SECTION */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
          Tự động duyệt và vận hành
        </h3>
        
        <div className="flex items-center justify-between py-3 bg-slate-50 px-4 rounded-2xl border border-slate-200/50">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-800">Tự động duyệt đơn đặt bãi</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Khi bật, các đơn đặt trực tuyến thành công sẽ tự động duyệt lịch bãi mà không cần thao tác tay.</p>
          </div>
          <button
            type="button"
            onClick={() => setConfigData({ ...configData, autoApprove: !configData.autoApprove })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              configData.autoApprove ? 'bg-brand-emerald' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                configData.autoApprove ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 bg-slate-50 px-4 rounded-2xl border border-slate-200/50">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-800">Thông báo âm thanh khi check-in</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Phát âm báo trên thiết bị khi quét QR thành công.</p>
          </div>
          <button
            type="button"
            onClick={() => setConfigData({ ...configData, notifyOnScan: !configData.notifyOnScan })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              configData.notifyOnScan ? 'bg-brand-emerald' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                configData.notifyOnScan ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* POLICIES SECTION */}
      <div className="space-y-4 pt-4 border-t border-slate-200/60">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-2">
          Chính sách đặt cọc và đặt trước
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Thời gian đặt trước tối thiểu (giờ)</label>
            <input 
              type="number" 
              value={configData.minAdvanceHours}
              onChange={(e) => setConfigData({ ...configData, minAdvanceHours: parseInt(e.target.value) || 0 })}
              className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
              min="1"
              max="24"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phần trăm đặt cọc bắt buộc (%)</label>
            <input 
              type="number" 
              value={configData.depositPercent}
              onChange={(e) => setConfigData({ ...configData, depositPercent: parseInt(e.target.value) || 0 })}
              className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
              min="0"
              max="100"
              required
            />
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 flex justify-end">
        <button 
          type="submit"
          disabled={isSaving}
          className="bg-brand-emerald hover:bg-emerald-800 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isSaving ? 'Đang cập nhật...' : 'Lưu cấu hình hệ thống'}</span>
        </button>
      </div>
    </form>
  );
};
export default SettingsForm;
