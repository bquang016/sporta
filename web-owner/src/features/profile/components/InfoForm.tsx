import React, { useRef, useState } from 'react';
import { Camera, User, Phone, Mail, CreditCard, Calendar, MapPin, Check, UploadCloud } from 'lucide-react';
import { courtService } from '../../venue/services/courtService';
import type { OwnerProfileData } from '../services/profileService';

interface InfoFormProps {
  profileData: OwnerProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<OwnerProfileData>>;
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await courtService.uploadImage(file, 'avatar');
      setProfileData((prev) => ({ ...prev, avatarUrl: imageUrl }));
    } catch (err) {
      console.error('Lỗi khi tải ảnh đại diện:', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (isMobile) {
    return (
      <form onSubmit={handleProfileSave} className="space-y-4">
        {/* Avatar Upload Preview on Mobile */}
        <div className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full ring-2 ring-emerald-500/20 p-0.5 bg-white overflow-hidden">
              {profileData.avatarUrl ? (
                <img src={profileData.avatarUrl} alt={profileData.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-emerald-800 text-white font-black flex items-center justify-center text-sm rounded-full">
                  {profileData.name ? profileData.name.substring(0, 2).toUpperCase() : 'OS'}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#064e3b] text-white flex items-center justify-center border-2 border-white shadow-xs"
            >
              {isUploading ? (
                <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-3 h-3" />
              )}
            </button>
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-slate-800 truncate">Ảnh đại diện chủ sân</h4>
            <p className="text-[10px] text-slate-400 font-medium">Bấm vào camera để đổi ảnh đại diện</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFileChange}
        />

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Họ và tên chủ sân</label>
          <input 
            type="text" 
            value={profileData.name || ''} 
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            className="w-full text-xs font-bold text-slate-800 px-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
            required 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Số điện thoại</label>
          <input 
            type="tel" 
            value={profileData.phone || ''} 
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            className="w-full text-xs font-bold text-slate-800 px-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
            required 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Email đăng ký</label>
          <input 
            type="email" 
            value={profileData.email || ''} 
            disabled 
            className="w-full text-xs font-bold text-slate-400 px-3.5 py-3 rounded-2xl border border-slate-200 bg-slate-100 shadow-2xs cursor-not-allowed" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Số Căn cước công dân (CCCD / CMND)</label>
          <input 
            type="text" 
            value={profileData.idNumber || ''} 
            onChange={(e) => setProfileData({ ...profileData, idNumber: e.target.value })}
            placeholder="Nhập số CCCD 12 số..."
            className="w-full text-xs font-bold text-slate-800 px-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Ngày sinh</label>
          <input 
            type="date" 
            value={profileData.dateOfBirth || ''} 
            onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
            className="w-full text-xs font-bold text-slate-800 px-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Quê quán / Địa chỉ thường trú</label>
          <input 
            type="text" 
            value={profileData.hometown || ''} 
            onChange={(e) => setProfileData({ ...profileData, hometown: e.target.value })}
            placeholder="Tỉnh/Thành phố quê quán..."
            className="w-full text-xs font-bold text-slate-800 px-3.5 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSaving} 
          className="w-full mt-4 bg-brand-emerald active:bg-emerald-950 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu thông tin cá nhân'}</span>
        </button>
      </form>
    );
  }

  // Desktop View
  return (
    <form onSubmit={handleProfileSave} className="space-y-6">
      {/* Avatar Section on Desktop */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-200/60">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-white ring-4 ring-emerald-500/20 overflow-hidden shadow-md">
            {profileData.avatarUrl ? (
              <img src={profileData.avatarUrl} alt={profileData.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-emerald-900 to-emerald-700 text-white font-black text-2xl flex items-center justify-center">
                {profileData.name ? profileData.name.substring(0, 2).toUpperCase() : 'OS'}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#064e3b] text-white flex items-center justify-center border-2 border-white shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            title="Đổi ảnh đại diện"
          >
            {isUploading ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFileChange}
        />

        <div className="text-center md:text-left space-y-1">
          <h3 className="text-sm font-black text-slate-800">Ảnh đại diện cá nhân</h3>
          <p className="text-xs text-slate-500 font-medium">Ảnh đại diện định danh của chủ sân Sporta.</p>
          <div className="flex gap-2 justify-center md:justify-start pt-1">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs font-black text-brand-emerald bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 cursor-pointer transition-colors"
            >
              {isUploading ? 'Đang tải lên...' : 'Thay đổi ảnh'}
            </button>
            {profileData.avatarUrl && (
              <button 
                type="button" 
                onClick={() => setProfileData(prev => ({ ...prev, avatarUrl: '' }))}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
              >
                Gỡ ảnh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Họ và tên chủ sân</label>
          <input 
            type="text" 
            value={profileData.name || ''}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Số điện thoại liên hệ</label>
          <input 
            type="tel" 
            value={profileData.phone || ''}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Địa chỉ Email đăng ký</label>
          <input 
            type="email" 
            value={profileData.email || ''}
            disabled
            className="w-full text-xs font-bold text-slate-400 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 cursor-not-allowed shadow-2xs" 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Vai trò tài khoản</label>
          <input 
            type="text" 
            value={profileData.role || 'Chủ sân'}
            disabled
            className="w-full text-xs font-bold text-slate-400 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 cursor-not-allowed shadow-2xs" 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Số Căn cước công dân (CCCD / CMND)</label>
          <input 
            type="text" 
            value={profileData.idNumber || ''}
            onChange={(e) => setProfileData({ ...profileData, idNumber: e.target.value })}
            placeholder="Nhập 12 số CCCD gắn chip..."
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Ngày sinh</label>
          <input 
            type="date" 
            value={profileData.dateOfBirth || ''}
            onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Quê quán / Địa chỉ thường trú</label>
          <input 
            type="text" 
            value={profileData.hometown || ''}
            onChange={(e) => setProfileData({ ...profileData, hometown: e.target.value })}
            placeholder="Tỉnh/Thành phố quê quán..."
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs" 
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit"
          disabled={isSaving}
          className="bg-brand-emerald hover:bg-emerald-800 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu thông tin cá nhân'}</span>
        </button>
      </div>
    </form>
  );
};
export default InfoForm;
