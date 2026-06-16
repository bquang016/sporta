import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { getLoggedInUser } from '../utils/auth';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useSystemStatus } from '../hooks/useSystemStatus';

export const ProfilePage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'info';
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const { isOnline, latency } = useSystemStatus(10000);

  const loggedInUser = getLoggedInUser();
  const userEmail = loggedInUser?.email || 'owner@sporta.vn';
  const userInitials = userEmail.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  // State for forms
  const [profileData, setProfileData] = useState({
    name: 'Nguyễn Quang Huy',
    email: userEmail,
    phone: '0987 654 321',
    role: 'Chủ sân',
    facilityName: 'Sporta Arena Quận 7',
    address: '152 Nguyễn Văn Linh, Phường Tân Thuận Tây, Quận 7, TP. HCM',
    openHours: '05:00 - 23:00',
    description: 'Hệ thống cụm 4 sân bóng cỏ nhân tạo chất lượng cao, trang bị đèn LED chuẩn thi đấu và dịch vụ nước uống, phòng tắm miễn phí.'
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Cập nhật thông tin cá nhân và cơ sở thành công!' });
    }, 800);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ tất cả các trường mật khẩu!' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự!' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp!' });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Đổi mật khẩu tài khoản thành công!' });
    }, 800);
  };

  const handleTabChange = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

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
            
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-sm">
              <span className="font-bold text-sm text-brand-yellow">{userInitials}</span>
            </div>
          </div>
        </header>

        <main className="px-4 mt-6 space-y-6">
          {/* Quick link to Settings Page on Mobile (Required since bottom nav has no settings tab) */}
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
            ) : (
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
            )}
          </div>

          {/* Detailed System Status Card to prevent empty layout feeling */}
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

          {/* Gorgeous Red Logout Button for Mobile View */}
          <div className="pt-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 font-black text-xs py-3.5 rounded-2xl active:scale-98 transition-all cursor-pointer shadow-xs animate-fadeIn"
            >
              <svg className="w-4.5 h-4.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>

        </main>
        <ConfirmModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={async () => {
            const token = localStorage.getItem('accessToken');
            try {
              if (token) {
                await fetch('http://localhost:8387/api/v1/auth/logout', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
              }
            } catch (err) {
              console.error('Logout error:', err);
            }
            localStorage.removeItem('accessToken');
            navigate('/login');
          }}
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

      {/* Premium Athletic Gradient Header Card (Visual Polish & High Contrast) */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md border-b-4 border-brand-yellow select-none">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute right-20 bottom-0 w-36 h-36 bg-brand-yellow/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-brand-yellow text-primary font-black text-2xl flex items-center justify-center shadow-md border-4 border-white/10">
            SA
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

      {/* Content Container (Background reduced to soft gray to avoid white glare) */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
        
        {/* TAB 1: BASIC INFO */}
        {activeTab === 'info' && (
          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-200/60">
              <div className="w-16 h-16 rounded-full bg-brand-emerald text-white font-black text-xl flex items-center justify-center shadow-md border-4 border-white relative group">
                SA
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
        )}

        {/* TAB 3: SECURITY */}
        {activeTab === 'security' && (
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
        )}

      </div>
    </div>
  );
};
