import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@/components/ui/Tooltip';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import logoHorizontal from '@/assets/logo/light/logo-horizontal_1600x400px.svg';
import logoSvg from '@/assets/logo/light/logo-main_40x40px_small.svg';

const PAGE_TITLES: Record<string, string> = {
  'dashboard': 'Dashboard Thống Kê',
  'facilities': 'Kiểm Duyệt Sân',
  'owners': 'Quản Lý Chủ Sân',
  'users': 'Quản Lý Người Dùng',
  'vouchers': 'Quản Lý Mã Khuyến Mãi',
  'tickets': 'Quản Lý Yêu Cầu Hỗ Trợ',
  'transactions': 'Quản Lý Đặt Sân & Giao Dịch',
  'reconciliations': 'Quản Lý Đối Soát',
  'settings': 'Cài Đặt Hệ Thống',
  'staff': 'Nhân Sự Nội Bộ',
};

interface AdminLayoutProps {
    children: (currentTab: string) => React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const pageTitle = PAGE_TITLES[currentTab] || 'Sporta Admin';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Mock system status instead of using hooks that don't exist yet
  const isOnline = true;
  const latency = 12;

  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const permissionsStr = localStorage.getItem('permissions');
  const permissions = permissionsStr ? JSON.parse(permissionsStr) : [];

  const userEmail = role === 'SUPER_ADMIN' ? 'superadmin@sporta.vn' : 'admin@sporta.vn';
  const userInitials = role === 'SUPER_ADMIN' ? 'SA' : 'AD';
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Yêu cầu duyệt sân', desc: 'Sân Q7-1 vừa đăng ký mới', time: 'Vừa xong', unread: true },
    { id: 2, title: 'Tài khoản bị khóa', desc: 'Hệ thống tự động khóa user vi phạm', time: '10 phút trước', unread: true },
    { id: 3, title: 'Cập nhật hệ thống', desc: 'Bản vá bảo mật đã được áp dụng', time: '1 giờ trước', unread: true },
  ]);

  const handleMarkAllAsRead = () => {
    setUnreadNotifications(0);
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const formattedDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="h-screen bg-surface-container-low font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-primary text-on-primary flex flex-col hidden md:flex fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.1)] transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className={`py-6 px-4 transition-all duration-300 ${isSidebarCollapsed ? 'text-center px-2 flex justify-center' : 'flex flex-col items-start gap-1'}`}>
          {isSidebarCollapsed ? (
            <img 
              src={logoSvg} 
              alt="Sporta Logo" 
              className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-200" 
            />
          ) : (
            <div className="flex flex-col gap-1 w-full">
              <img 
                src={logoHorizontal} 
                alt="Sporta Logo" 
                className="h-10 w-auto object-contain max-w-[180px]" 
              />
              <p className="text-[9px] text-on-primary/60 font-bold uppercase tracking-widest pl-1 mt-0.5">Hệ Thống Admin</p>
            </div>
          )}
        </div>
        
        {/* Navigation Items */}
        <nav className={`flex-1 py-8 space-y-2 transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
          {(role === 'SUPER_ADMIN' || permissions.includes('VIEW_DASHBOARD')) && (
            <NavItem id="dashboard" currentTab={currentTab} setCurrentTab={setCurrentTab} icon="home" label="Bảng điều khiển" isCollapsed={isSidebarCollapsed} />
          )}
          {(role === 'SUPER_ADMIN' || permissions.includes('MANAGE_FACILITIES')) && (
            <NavItem id="facilities" currentTab={currentTab} setCurrentTab={setCurrentTab} icon="facility" label="Kiểm duyệt sân" isCollapsed={isSidebarCollapsed} />
          )}
          {(role === 'SUPER_ADMIN' || permissions.includes('MANAGE_OWNERS')) && (
            <NavItem id="owners" currentTab={currentTab} setCurrentTab={setCurrentTab} icon="users" label="Quản lý chủ sân" isCollapsed={isSidebarCollapsed} />
          )}
          {(role === 'SUPER_ADMIN' || permissions.includes('MANAGE_USERS')) && (
            <NavItem id="users" currentTab={currentTab} setCurrentTab={setCurrentTab} icon="users" label="Quản lý người dùng" isCollapsed={isSidebarCollapsed} />
          )}
          {(role === 'SUPER_ADMIN' || permissions.includes('MANAGE_VOUCHERS') || permissions.includes('MANAGE_SYSTEM') || permissions.length === 0) && (
            <NavItem id="vouchers" currentTab={currentTab} setCurrentTab={setCurrentTab} icon="voucher" label="Mã khuyến mãi" isCollapsed={isSidebarCollapsed} />
          )}
          {(role === 'SUPER_ADMIN' || permissions.includes('MANAGE_TICKETS')) && (
            <NavItem id="tickets" currentTab={currentTab} setCurrentTab={setCurrentTab} icon="ticket" label="Yêu cầu hỗ trợ" isCollapsed={isSidebarCollapsed} />
          )}
          {(role === 'SUPER_ADMIN' || permissions.includes('MANAGE_TRANSACTIONS')) && (
            <NavItem id="transactions" currentTab={currentTab} setCurrentTab={setCurrentTab} icon="transaction" label="Quản lý giao dịch" isCollapsed={isSidebarCollapsed} />
          )}
          {(role === 'SUPER_ADMIN' || permissions.includes('MANAGE_RECONCILIATION') || permissions.includes('MANAGE_TRANSACTIONS')) && (
            <NavItem id="reconciliations" currentTab={currentTab} setCurrentTab={setCurrentTab} icon="reconciliation" label="Quản lý đối soát" isCollapsed={isSidebarCollapsed} />
          )}
          {(role === 'SUPER_ADMIN' || permissions.includes('MANAGE_SYSTEM')) && (
            <NavItem id="settings" currentTab={currentTab} setCurrentTab={setCurrentTab} icon="settings" label="Cài đặt hệ thống" isCollapsed={isSidebarCollapsed} />
          )}
          {role === 'SUPER_ADMIN' && (
            <NavItem id="staff" currentTab={currentTab} setCurrentTab={setCurrentTab} icon="staff" label="Nhân sự nội bộ" isCollapsed={isSidebarCollapsed} />
          )}
        </nav>
        
        {/* User Account Section */}
        <div className="p-4 border-t border-white/10 flex justify-center text-center">
          {isSidebarCollapsed ? (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/50 text-xs">
              AD
            </div>
          ) : (
            <div className="flex flex-col items-center py-1 w-full text-white/40">
              <span className="text-[9px] font-bold uppercase tracking-widest">Sporta Admin Portal</span>
              <span className="text-[8px] font-medium tracking-wide mt-0.5">Phiên bản 1.0.0</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-surface-variant flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors focus:outline-none hidden md:block"
              title={isSidebarCollapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isSidebarCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M4 6h16M4 12h10M4 18h16"} />
              </svg>
            </button>
            <h2 className="text-lg font-black text-on-surface whitespace-nowrap">{pageTitle}</h2>

            {/* Global Search Bar */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 w-72 text-xs text-slate-500 focus-within:border-brand-emerald focus-within:ring-1 focus-within:ring-brand-emerald focus-within:bg-white transition-all ml-4">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Tìm kiếm nhanh user, sân..." 
                className="bg-transparent border-none outline-none w-full text-slate-700 font-medium" 
              />
              <span className="text-[9px] bg-slate-200 px-1 py-0.5 rounded text-slate-500 font-mono font-bold select-none">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* System Status & Time */}
            <div className="hidden xl:flex items-center gap-4 text-xs font-semibold text-slate-500 border-r border-slate-100 pr-6">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isOnline ? 'bg-emerald-50 text-brand-emerald' : 'bg-red-50 text-red-600'}`}>
                <span className="relative flex h-2 w-2">
                  {isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-brand-emerald' : 'bg-red-600'}`}></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Hệ thống: {isOnline ? `Trực tuyến${latency !== null ? ` (${latency}ms)` : ''}` : 'Ngoại tuyến'}
                </span>
              </div>
              <span className="text-slate-400 font-black">{formattedDate}</span>
            </div>

            <div className="flex items-center gap-3 relative">
              {/* Notification Button & Popover */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsProfileOpen(false);
                  }}
                  className={`w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-brand-emerald hover:bg-slate-55/40 transition-colors relative focus:outline-none ${isNotificationsOpen ? 'text-brand-emerald ring-2 ring-brand-emerald/20 bg-slate-100' : ''}`}
                >
                  {unreadNotifications > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-yellow rounded-full"></span>
                  )}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-40 overflow-hidden">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Thông báo</span>
                        {unreadNotifications > 0 && (
                          <button 
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] font-black text-brand-emerald hover:text-emerald-950 uppercase tracking-widest cursor-pointer"
                          >
                            Đọc tất cả
                          </button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50 matrix-scroll">
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                              setUnreadNotifications(prev => Math.max(0, prev - (n.unread ? 1 : 0)));
                            }}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-2.5 items-start ${n.unread ? 'bg-slate-50/40' : ''}`}
                          >
                            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? 'bg-brand-yellow' : 'bg-transparent'}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800">{n.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                              <span className="text-[9px] text-slate-400 font-bold block mt-1">{n.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-slate-100 text-center">
                        <button className="text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider cursor-pointer">Xem tất cả hoạt động</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Avatar & Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className={`w-10 h-10 rounded-full bg-brand-emerald text-white hover:bg-emerald-900 transition-colors flex items-center justify-center font-bold shadow-sm active:scale-95 cursor-pointer relative focus:outline-none ${isProfileOpen ? 'ring-2 ring-brand-emerald/40' : ''}`}
                >
                  {userInitials}
                </button>

                {/* Profile Menu Dropdown */}
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-40 overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-brand-emerald text-white font-bold flex items-center justify-center text-lg shadow-sm">
                          {userInitials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-800 truncate">Sporta {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</h4>
                          <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{userEmail}</p>
                          <span className="inline-block text-[8px] font-black uppercase text-brand-emerald bg-brand-emerald/10 px-1.5 py-0.5 rounded mt-1">
                            {role === 'SUPER_ADMIN' ? 'Quản trị tối cao' : 'Quản trị viên'}
                          </span>
                        </div>
                      </div>

                      <div className="p-2 space-y-0.5">
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            setCurrentTab('settings');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Cài đặt hệ thống</span>
                        </button>

                        <div className="h-px bg-slate-100 my-1 mx-2" />

                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            setIsLogoutModalOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 overflow-y-auto matrix-scroll flex-1 min-h-0 flex flex-col">
          {children(currentTab)}
        </div>

        <ConfirmModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={async () => {
             localStorage.removeItem('accessToken');
             localStorage.removeItem('role');
             localStorage.removeItem('permissions');
             navigate('/login', { replace: true });
          }}
          title="Xác nhận đăng xuất"
          message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản lý admin Sporta?"
          confirmText="Đăng xuất"
          cancelText="Hủy"
          variant="logout"
        />
      </main>
    </div>
  );
};

const NavItem = ({ id, currentTab, setCurrentTab, icon, label, isCollapsed }: { id: string, currentTab: string, setCurrentTab: (id: string) => void, icon: string, label: string, isCollapsed: boolean }) => {
  const isActive = currentTab === id;

  const content = (
    <button 
      onClick={() => setCurrentTab(id)}
      className={`w-full flex items-center rounded-xl transition-all duration-300 ${
        isCollapsed ? 'justify-center p-3 w-12 mx-auto' : 'gap-3 px-4 py-3'
      } ${
        isActive 
          ? 'bg-white/10 text-brand-yellow font-semibold' 
          : 'text-white/70 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon name={icon} className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && (
        <span className="text-sm whitespace-nowrap overflow-hidden transition-opacity duration-300">
          {label}
        </span>
      )}
    </button>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={label} position="right">
        {content}
      </Tooltip>
    );
  }

  return content;
};

const Icon = ({ name, className }: { name: string, className?: string }) => {
  switch (name) {
    case 'home':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    case 'facility':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
    case 'users':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
    case 'settings':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    case 'staff':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'transaction':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-6 4h6m-2 5H9M11 3v2m2-2v2M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'reconciliation':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'voucher':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      );
    case 'ticket':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      );
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
};