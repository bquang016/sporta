import React from 'react';
import logoMain from '../../../assets/logo/light/logo-main_1024x1024px.svg';

interface InfoFormProps {
  profileData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    facilityName: string;
    address: string;
    openHours: string;
    description: string;
  };
  setProfileData: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    phone: string;
    role: string;
    facilityName: string;
    address: string;
    openHours: string;
    description: string;
  }>>;
  isSaving: boolean;
  handleProfileSave: (e: React.FormEvent) => void;
  isMobile: boolean;
}

export const InfoForm: React.FC<InfoFormProps> = ({
  profileData,
  setProfileData,
  isSaving,
  handleProfileSave,
  isMobile
}) => {
  if (isMobile) {
    return (
      <form onSubmit={handleProfileSave} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Họ và tên</label>
          <input 
            type="text" 
            value={profileData.name} 
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Điện thoại</label>
          <input 
            type="text" 
            value={profileData.phone} 
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Email</label>
          <input type="text" value={profileData.email} disabled className="w-full text-xs font-bold text-slate-400 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100" />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Tên cụm sân</label>
          <input 
            type="text" 
            value={profileData.facilityName} 
            onChange={(e) => setProfileData({ ...profileData, facilityName: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Địa chỉ cụ thể</label>
          <input 
            type="text" 
            value={profileData.address} 
            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required 
          />
        </div>
        
        <button type="submit" disabled={isSaving} className="w-full mt-4 bg-brand-yellow text-primary hover:bg-yellow-400 font-extrabold text-xs py-3 rounded-xl shadow-sm active:scale-95 transition-all">
          {isSaving ? 'Đang lưu...' : 'Lưu hồ sơ di động'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleProfileSave} className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-200/60">
        <div className="w-16 h-16 rounded-full bg-white text-white font-black text-xl flex items-center justify-center shadow-md border-4 border-white relative group overflow-hidden p-1.5">
          <img src={logoMain} alt="Sporta Logo" className="w-full h-full object-contain" />
        </div>
        <div className="text-center md:text-left space-y-1">
          <h3 className="text-xs font-black text-slate-800">Ảnh đại diện cụm sân</h3>
          <p className="text-[10px] text-slate-400 font-semibold">Tải ảnh đại diện để khách đặt sân có thể nhận diện cơ sở trên ứng dụng di động.</p>
          <div className="flex gap-2 justify-center md:justify-start pt-1">
            <button type="button" className="text-[9px] font-black text-brand-emerald bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 cursor-pointer">Thay đổi</button>
            <button type="button" className="text-[9px] font-black text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg cursor-pointer">Xóa ảnh</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Họ và tên chủ sân</label>
          <input 
            type="text" 
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Số điện thoại liên hệ</label>
          <input 
            type="text" 
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Địa chỉ Email đăng ký</label>
          <input 
            type="email" 
            value={profileData.email}
            disabled
            className="w-full text-xs font-bold text-slate-400 px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 cursor-not-allowed" 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Vai trò tài khoản</label>
          <input 
            type="text" 
            value={profileData.role}
            disabled
            className="w-full text-xs font-bold text-slate-400 px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 cursor-not-allowed" 
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Tên cơ sở / Cụm sân</label>
          <input 
            type="text" 
            value={profileData.facilityName}
            onChange={(e) => setProfileData({ ...profileData, facilityName: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Địa chỉ chi tiết</label>
          <input 
            type="text" 
            value={profileData.address}
            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Khung giờ mở cửa</label>
          <input 
            type="text" 
            value={profileData.openHours}
            onChange={(e) => setProfileData({ ...profileData, openHours: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giới thiệu về cơ sở</label>
          <textarea 
            value={profileData.description}
            onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald h-24 resize-none" 
            required
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit"
          disabled={isSaving}
          className="bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu thông tin cơ sở'}
        </button>
      </div>
    </form>
  );
};
