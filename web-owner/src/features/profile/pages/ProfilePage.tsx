import React from 'react';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { useSystemStatus } from '../../../hooks/useSystemStatus';
import logoMain from '../../../assets/logo/light/logo-main_1024x1024px.svg';
import { useProfile } from '../hooks/useProfile';
import { InfoForm } from '../components/InfoForm';
import { PasswordForm } from '../components/PasswordForm';
import { MobileProfileView } from '../components/MobileProfileView';

export const ProfilePage = () => {
  const isMobile = useIsMobile();
  const { isOnline, latency } = useSystemStatus(10000);

  const {
    activeTab,
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    profileData,
    setProfileData,
    passwordData,
    setPasswordData,
    message,
    isSaving,
    handleProfileSave,
    handlePasswordSave,
    handleTabChange,
    executeLogout
  } = useProfile();

  // ═══ MOBILE VIEW ═══
  if (isMobile) {
    return (
      <MobileProfileView
        profileData={profileData}
        setProfileData={setProfileData}
        isSaving={isSaving}
        handleProfileSave={handleProfileSave}
        passwordData={passwordData as any}
        setPasswordData={setPasswordData as any}
        handlePasswordSave={handlePasswordSave}
        isLogoutModalOpen={isLogoutModalOpen}
        setIsLogoutModalOpen={setIsLogoutModalOpen}
        executeLogout={executeLogout}
        isOnline={isOnline}
        latency={latency}
        message={message}
      />
    );
  }

  // ═══ DESKTOP VIEW ═══
  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 select-none animate-fadeIn">
      
      {/* Title & Status Message Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Hồ sơ tài khoản</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Cập nhật thông tin định danh và đổi mật khẩu đăng nhập</p>
        </div>

        {/* Global Toast Message */}
        {message && (
          <div 
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all duration-300 transform scale-100 ${
              message.type === 'success' 
                ? 'bg-emerald-600 text-white shadow-emerald-200' 
                : 'bg-red-600 text-white shadow-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Premium Athletic Gradient Header Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md border-b-4 border-brand-yellow select-none">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute right-20 bottom-0 w-36 h-36 bg-brand-yellow/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white text-primary font-black text-2xl flex items-center justify-center shadow-md border-4 border-white/10 p-2 overflow-hidden">
            <img src={logoMain} alt="Sporta Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-center md:text-left space-y-1">
            <span className="inline-block text-[9px] bg-brand-yellow text-primary px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-xs">
              Chủ Sân
            </span>
            <h2 className="text-xl font-black tracking-tight text-white mt-1.5">{profileData.facilityName}</h2>
            <p className="text-xs text-white/70 font-medium">{profileData.address}</p>
          </div>
        </div>
      </div>

      {/* Tabs list layout */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 shadow-xs max-w-sm">
        <button
          onClick={() => handleTabChange('info')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
            activeTab === 'info' 
              ? 'bg-brand-emerald text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Thông tin cơ bản
        </button>
        <button
          onClick={() => handleTabChange('security')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
            activeTab === 'security' 
              ? 'bg-brand-emerald text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Content Container */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
        {activeTab === 'info' ? (
          <InfoForm
            profileData={profileData}
            setProfileData={setProfileData}
            isSaving={isSaving}
            handleProfileSave={handleProfileSave}
            isMobile={false}
          />
        ) : (
          <PasswordForm
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            isSaving={isSaving}
            handlePasswordSave={handlePasswordSave}
            isMobile={false}
          />
        )}
      </div>
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
