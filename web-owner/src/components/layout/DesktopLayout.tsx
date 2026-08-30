import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from '../ui/Tooltip';
import { getLoggedInUser } from '../../utils/auth';
import { ConfirmModal } from '../ui/ConfirmModal';
import { ContractsListModal } from '../../features/profile/components/ContractsListModal';
import { useSystemStatus } from '../../hooks/useSystemStatus';
import { useOwnerNotifications, type NotificationItem } from '../../features/notifications';
import logoHorizontal from '../../assets/logo/light/logo-horizontal_1600x400px.svg';
import logoSvg from '../../assets/logo/light/logo-main_40x40px_small.svg';

const PAGE_TITLES: Record<string, string> = {
  '/notifications': 'Trung Tâm Thông Báo',
  '/': 'Bảng điều khiển',
  '/matrix': 'Quản lý lịch',
  '/scan': 'Quét mã QR',
  '/operations': 'Quản lý vận hành',
  '/pricing': 'Định giá AI & Dự báo',
  '/wallet': 'Ví của tôi',
  '/vouchers': 'Mã khuyến mãi',
  '/profile': 'Hồ sơ tài khoản',
  '/settings': 'Cài đặt hệ thống',
};

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return diffMin + ' phút trước';
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return diffHours + ' giờ trước';
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return diffDays + ' ngày trước';
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  } catch {
    return '';
  }
}

const renderDropdownIcon = (type: string) => {
  if (type.startsWith('BOOKING_') || type === 'OWNER_NEW_BOOKING') {
    return (
      <div className="w-8 h-8 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  if (type.startsWith('WALLET_') || type.includes('WITHDRAWAL') || type.includes('RECONCIL')) {
    return (
      <div className="w-8 h-8 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  if (type.startsWith('TICKET_') || type.includes('SUPPORT')) {
    return (
      <div className="w-8 h-8 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-brand-emerald flex items-center justify-center shrink-0 shadow-2xs">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
  );
};

export const DesktopLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Sporta';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isContractsListModalOpen, setIsContractsListModalOpen] = useState(false);

  const { isOnline, latency } = useSystemStatus(10000);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useOwnerNotifications(12000);

  const loggedInUser = getLoggedInUser();
  const userEmail = loggedInUser?.email || 'owner@sporta.vn';
  const userInitials = userEmail.substring(0, 2).toUpperCase();

  const handleNotificationClick = (n: NotificationItem) => {
    if (!(n.isRead ?? n.read)) {
      markAsRead(n.id);
    }
    setIsNotificationsOpen(false);

    if (n.type.startsWith('BOOKING_') || n.type === 'OWNER_NEW_BOOKING') {
      if (n.referenceId) {
        navigate(`/matrix?bookingId=${n.referenceId}`);
      } else {
        navigate('/matrix');
      }
    } else if (n.type.startsWith('WALLET_')) {
      navigate('/wallet');
    } else if (n.type.startsWith('VOUCHER_')) {
      navigate('/vouchers');
    }
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
              <p className="text-[9px] text-on-primary/60 font-bold uppercase tracking-widest pl-1 mt-0.5">Dành Cho Chủ Sân</p>
            </div>
          )}
        </div>
        
        {/* Navigation Items */}
        <nav className={`flex-1 py-8 space-y-2 transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <NavItem to="/" icon="home" label="Bảng điều khiển" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/notifications" icon="bell" label="Trung tâm thông báo" isCollapsed={isSidebarCollapsed} badge={unreadCount} />
          <NavItem to="/matrix" icon="calendar" label="Quản lý lịch" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/scan" icon="scan" label="Quét mã QR" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/operations" icon="facility" label="Quản lý vận hành" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/pricing" icon="sparkles" label="Định giá AI & Dự báo" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/wallet" icon="wallet" label="Ví của tôi" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/vouchers" icon="voucher" label="Mã khuyến mãi" isCollapsed={isSidebarCollapsed} />
          <NavItem to="/settings" icon="settings" label="Cài đặt hệ thống" isCollapsed={isSidebarCollapsed} />
        </nav>
        
        {/* User Account Section (Static brand version - duplicate removed) */}
        <div className="p-4 border-t border-white/10 flex justify-center text-center">
          {isSidebarCollapsed ? (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/50 text-xs">
              SP
            </div>
          ) : (
            <div className="flex flex-col items-center py-1 w-full text-white/40">
              <span className="text-[9px] font-bold uppercase tracking-widest">Sporta Owner Portal</span>
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
        {/* Top Header — dynamic title & Sidebar Toggle */}
        <header className="h-16 bg-white border-b border-surface-variant flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
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
                placeholder="Tìm kiếm nhanh đơn đặt, lịch sân..." 
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
                  className={`w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-brand-emerald hover:bg-slate-100 transition-all relative focus:outline-none ${isNotificationsOpen ? 'text-brand-emerald ring-2 ring-brand-emerald/30 bg-emerald-50/50' : ''}`}
                >
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] bg-red-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setIsNotificationsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-88 bg-white border border-slate-200/80 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.18)] z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Thông báo</span>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                              {unreadCount} mới
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => markAllAsRead()}
                            className="text-[11px] font-bold text-brand-emerald hover:text-emerald-800 transition-colors cursor-pointer"
                          >
                            Đọc tất cả
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 matrix-scroll">
                        {notifications.length > 0 ? (
                          notifications.map(n => {
                            const isUnread = !(n.isRead ?? n.read);
                            return (
                              <div 
                                key={n.id} 
                                onClick={() => handleNotificationClick(n)}
                                className={`p-3.5 cursor-pointer transition-all flex gap-3 items-start ${
                                  isUnread 
                                    ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-3 border-brand-emerald' 
                                    : 'bg-white hover:bg-slate-50 opacity-70'
                                }`}
                              >
                                {renderDropdownIcon(n.type)}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className={`text-xs truncate ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                                      {n.title}
                                    </p>
                                    {isUnread && (
                                      <span className="w-2 h-2 rounded-full bg-brand-emerald flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className={`text-[11px] mt-0.5 leading-relaxed line-clamp-2 ${isUnread ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                    {n.content}
                                  </p>
                                  <span className="text-[9px] text-slate-400 font-bold block mt-1">
                                    {formatTimeAgo(n.createdAt)}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-8 text-center px-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-slate-600">Chưa có thông báo nào</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Các thông báo mới từ hệ thống sẽ hiển thị tại đây</p>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5 border-t border-slate-100 bg-slate-50/40 text-center">
                        <button 
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            navigate('/matrix');
                          }}
                          className="text-[10px] font-bold text-slate-500 hover:text-brand-emerald uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Xem lịch đặt sân →
                        </button>
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

                {/* Profile Menu Dropdown (Admin text removed) */}
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.18)] z-[101] overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-brand-emerald text-white font-bold flex items-center justify-center text-lg shadow-sm">
                          {userInitials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-800 truncate">Sporta Arena</h4>
                          <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{userEmail}</p>
                          <span className="inline-block text-[8px] font-black uppercase text-brand-emerald bg-brand-emerald/10 px-1.5 py-0.5 rounded mt-1">
                            Chủ Sân
                          </span>
                        </div>
                      </div>

                      <div className="p-2 space-y-0.5">
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Thông tin tài khoản</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate('/settings');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Cài đặt hệ thống</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            setIsContractsListModalOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Hợp đồng hợp tác</span>
                        </button>

                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Đổi mật khẩu</span>
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

        {/* Page Content — flex-1 + min-h-0 + scrollable content container */}
        <div className={`${
          location.pathname === '/matrix' 
            ? 'p-4 pb-6 md:p-5 overflow-y-auto overflow-x-hidden matrix-scroll' 
            : 'p-8 overflow-y-auto matrix-scroll'
        } flex-1 min-h-0 flex flex-col`}>
          {children}
        </div>

        <ConfirmModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={async () => {
            const token = localStorage.getItem('accessToken');
            try {
              if (token) {
                const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
                await fetch(`http://${host}:8387/api/v1/auth/logout`, {
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

        {/* Import here if not dynamically loaded. Or just render the modal component if created */}
        {isContractsListModalOpen && (
          <ContractsListModal
            isOpen={isContractsListModalOpen}
            onClose={() => setIsContractsListModalOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label, isCollapsed, badge }: { to: string, icon: string, label: string, isCollapsed: boolean, badge?: number }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const content = (
    <Link 
      to={to} 
      className={`flex items-center justify-between rounded-xl transition-all duration-300 cursor-pointer ${
        isCollapsed ? 'justify-center p-3 w-12 mx-auto relative' : 'gap-3 px-3.5 py-2.5'
      } ${
        isActive 
          ? 'bg-white/15 text-brand-yellow font-bold shadow-xs' 
          : 'text-white/70 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon name={icon} className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && (
          <span className="text-xs whitespace-nowrap overflow-hidden transition-opacity duration-300 font-bold">
            {label}
          </span>
        )}
      </div>

      {badge !== undefined && badge > 0 && !isCollapsed && (
        <span className="bg-rose-500 text-white font-black text-[10px] rounded-full px-1.5 py-0.5 shadow-sm">
          {badge > 99 ? '99+' : badge}
        </span>
      )}

      {badge !== undefined && badge > 0 && isCollapsed && (
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#003527]" />
      )}
    </Link>
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
    case 'bell':
    case 'notification':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
    case 'home':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    case 'calendar':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    case 'scan':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>;
    case 'facility':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
    case 'sparkles':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
    case 'venue':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    case 'dot':
      return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" /></svg>;
    case 'settings':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    case 'wallet':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
    case 'voucher':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      );
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
};

const NavGroup = ({ 
  label, 
  icon, 
  isCollapsed, 
  isActive, 
  items 
}: { 
  label: string, 
  icon: string, 
  isCollapsed: boolean, 
  isActive: boolean, 
  items: { to: string, label: string }[] 
}) => {
  const [isOpen, setIsOpen] = useState(isActive);
  const location = useLocation();

  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {items.map((item, idx) => {
          const isItemActive = location.pathname === item.to;
          return (
            <Tooltip key={idx} content={`${label} - ${item.label}`} position="right">
              <Link 
                to={item.to} 
                className={`flex items-center justify-center p-3 w-12 mx-auto rounded-xl transition-all duration-300 ${
                  isItemActive 
                    ? 'bg-white/10 text-brand-yellow font-semibold' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon name={idx === 0 ? 'facility' : 'venue'} className="w-5 h-5 flex-shrink-0" />
              </Link>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-left cursor-pointer ${
          isActive 
            ? 'bg-white/5 text-brand-yellow font-semibold' 
            : 'text-white/70 hover:bg-white/5 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon name={icon} className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 text-white/50 ${isOpen ? 'rotate-180 text-brand-yellow' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="pl-6 space-y-1 mt-1 border-l border-white/10 ml-6 flex flex-col">
          {items.map((item, idx) => {
            const isItemActive = location.pathname === item.to;
            return (
              <Link
                key={idx}
                to={item.to}
                className={`flex items-center px-4 py-2 text-xs rounded-lg transition-all duration-200 cursor-pointer ${
                  isItemActive
                    ? 'text-brand-yellow font-black bg-white/5'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
