import React from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { useSystemStatus } from '../../../hooks/useSystemStatus';
import logoMain from '../../../assets/logo/light/logo-main_1024x1024px.svg';
import logoSvg from '../../../assets/logo/light/logo-main_40x40px_small.svg';
import { useProfile } from '../hooks/useProfile';
import { InfoForm } from '../components/InfoForm';
import { PasswordForm } from '../components/PasswordForm';

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
      <div className="font-sans pb-32 bg-slate-50/50 min-h-screen select-none animate-fadeIn">
        
        {/* Unified Mobile Header */}
        <header className="px-5 pt-12 pb-6 bg-brand-emerald text-white rounded-b-[2rem] shadow-md relative z-10 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden rounded-b-[2rem] pointer-events-none">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
          </div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-white/60 text-xs font-semibold tracking-wider">Sporty-Tech Owner App</p>
              <h1 className="text-xl font-black tracking-tight mt-0.5">Hồ sơ tài khoản</h1>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-sm overflow-hidden p-1">
              <img src={logoSvg} alt="Sporta Logo" className="w-full h-full object-contain" />
            </div>
          </div>
        </header>

        <main className="px-4 mt-6 space-y-6">
          {/* Quick link to Settings Page on Mobile */}
          <Link 
            to="/settings" 
            className="flex items-center justify-between bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-4 rounded-3xl shadow-sm active:scale-98 transition-transform border-b-2 border-brand-yellow relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 blur-xl rounded-3xl pointer-events-none"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-brand-yellow border border-white/10">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-white">Cài đặt hệ thống</h4>
                <p className="text-[9px] text-white/60 font-semibold mt-0.5">Đặt cọc, duyệt đơn & cấu hình tự động</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-brand-yellow relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Toast Message */}
          {message && (
            <div className={`p-3 rounded-2xl text-xs font-bold text-center text-white ${message.type === 'success' ? 'bg-brand-emerald' : 'bg-red-600'}`}>
              {message.text}
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200/50 shadow-xs">
            <button
              onClick={() => handleTabChange('info')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                activeTab === 'info' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Thông tin cơ bản
            </button>
            <button
              onClick={() => handleTabChange('security')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                activeTab === 'security' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Đổi mật khẩu
            </button>
          </div>

          {/* Forms */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 shadow-sm">
            {activeTab === 'info' ? (
              <InfoForm
                profileData={profileData}
                setProfileData={setProfileData}
                isSaving={isSaving}
                handleProfileSave={handleProfileSave}
                isMobile={true}
              />
            ) : (
              <PasswordForm
                passwordData={passwordData}
                setPasswordData={setPasswordData}
                isSaving={isSaving}
                handlePasswordSave={handlePasswordSave}
                isMobile={true}
              />
            )}
          </div>

          {/* Detailed System Status Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm space-y-3 relative overflow-hidden">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Trạng thái hệ thống</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-none">
                <span className="text-slate-400 font-semibold">Vai trò</span>
                <span className="font-black text-slate-700 bg-brand-emerald/10 text-brand-emerald px-2 py-0.5 rounded text-[10px] uppercase">Chủ sân</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-none">
                <span className="text-slate-400 font-semibold">Thiết bị</span>
                <span className="font-bold text-slate-700">Ứng dụng di động</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 last:border-none">
                <span className="text-slate-400 font-semibold">Kết nối API</span>
                <span className={`font-bold flex items-center gap-1 ${isOnline ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isOnline && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  )}
                  {isOnline ? `Trực tuyến${latency !== null ? ` (${latency}ms)` : ''}` : 'Ngoại tuyến'}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-2">
            <button 
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 font-black text-xs py-3.5 rounded-2xl active:scale-98 transition-all cursor-pointer shadow-xs animate-fadeIn"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>

        </main>
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
