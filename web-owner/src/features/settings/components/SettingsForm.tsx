import React from 'react';

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
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 shadow-sm space-y-5">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Tự động duyệt và vận hành</h3>
          
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <h4 className="text-xs font-black text-slate-800">Tự động duyệt đơn đặt</h4>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5 leading-tight">Khi khách thanh toán trực tuyến thành công, hệ thống tự động xác nhận lịch bãi.</p>
            </div>
            <button
              type="button"
              onClick={() => setConfigData({ ...configData, autoApprove: !configData.autoApprove })}
              className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                configData.autoApprove ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  configData.autoApprove ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="pr-4">
              <h4 className="text-xs font-black text-slate-800">Âm thanh thông báo check-in</h4>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5 leading-tight">Phát âm thanh báo hiệu khi chủ sân quét mã QR vé check-in thành công.</p>
            </div>
            <button
              type="button"
              onClick={() => setConfigData({ ...configData, notifyOnScan: !configData.notifyOnScan })}
              className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                configData.notifyOnScan ? 'bg-brand-emerald' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  configData.notifyOnScan ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider pb-2">Chính sách thời gian và cọc</h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Đặt trước tối thiểu (giờ)</label>
              <input 
                type="number" 
                value={configData.minAdvanceHours} 
                onChange={(e) => setConfigData({ ...configData, minAdvanceHours: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none" 
                min="1" 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Phần trăm cọc (%)</label>
              <input 
                type="number" 
                value={configData.depositPercent} 
                onChange={(e) => setConfigData({ ...configData, depositPercent: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none" 
                min="0" 
                max="100" 
                required 
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleConfigSave}
          className="w-full mt-4 bg-brand-yellow text-primary hover:bg-yellow-400 font-extrabold text-xs py-3 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu cấu hình di động'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleConfigSave} className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
      {/* OPERATIONAL SECTION */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">Tự động duyệt và vận hành</h3>
        
        <div className="flex items-center justify-between py-2 bg-white px-4 rounded-2xl border border-slate-200/50 shadow-xxs">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-700">Tự động duyệt đơn đặt bãi</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Khi bật, các đơn đặt trực tuyến thành công sẽ tự động duyệt lịch bãi mà không cần thao tác tay.</p>
          </div>
          <button
            type="button"
            onClick={() => setConfigData({ ...configData, autoApprove: !configData.autoApprove })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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

        <div className="flex items-center justify-between py-2 bg-white px-4 rounded-2xl border border-slate-200/50 shadow-xxs">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-700">Thông báo âm thanh khi check-in</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Phát âm báo hoặc rung trên thiết bị khi quét QR thành công.</p>
          </div>
          <button
            type="button"
            onClick={() => setConfigData({ ...configData, notifyOnScan: !configData.notifyOnScan })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-2">Chính sách đặt cọc và đặt trước</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Thời gian đặt trước tối thiểu (giờ)</label>
            <input 
              type="number" 
              value={configData.minAdvanceHours}
              onChange={(e) => setConfigData({ ...configData, minAdvanceHours: parseInt(e.target.value) || 0 })}
              className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
              min="1"
              max="24"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Phần trăm đặt cọc bắt buộc (%)</label>
            <input 
              type="number" 
              value={configData.depositPercent}
              onChange={(e) => setConfigData({ ...configData, depositPercent: parseInt(e.target.value) || 0 })}
              className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
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
          className="bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          {isSaving ? 'Đang cập nhật...' : 'Lưu cấu hình hệ thống'}
        </button>
      </div>
    </form>
  );
};
