import React from 'react';

interface PasswordFormProps {
  passwordData: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setPasswordData: React.Dispatch<React.SetStateAction<{
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>>;
  isSaving: boolean;
  handlePasswordSave: (e: React.FormEvent) => void;
  isMobile: boolean;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({
  passwordData,
  setPasswordData,
  isSaving,
  handlePasswordSave,
  isMobile
}) => {
  if (isMobile) {
    return (
      <form onSubmit={handlePasswordSave} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Mật khẩu cũ</label>
          <input 
            type="password" 
            value={passwordData.oldPassword} 
            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Mật khẩu mới</label>
          <input 
            type="password" 
            value={passwordData.newPassword} 
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Xác nhận mật khẩu</label>
          <input 
            type="password" 
            value={passwordData.confirmPassword} 
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className="w-full text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required 
          />
        </div>

        <button type="submit" disabled={isSaving} className="w-full mt-4 bg-brand-yellow text-primary hover:bg-yellow-400 font-extrabold text-xs py-3 rounded-xl shadow-sm active:scale-95 transition-all">
          {isSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handlePasswordSave} className="space-y-6">
      <div className="max-w-md space-y-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Mật khẩu hiện tại</label>
          <input 
            type="password" 
            value={passwordData.oldPassword}
            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
            placeholder="••••••••"
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Mật khẩu mới</label>
          <input 
            type="password" 
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            placeholder="Tối thiểu 6 ký tự"
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
          <input 
            type="password" 
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            placeholder="Nhập lại mật khẩu mới"
            className="w-full text-xs font-bold text-slate-700 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" 
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
          {isSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </div>
    </form>
  );
};
