import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Bảng điều khiển',
  '/matrix': 'Sơ đồ sân',
  '/scan': 'Quét mã QR',
  '/facility': 'Quản lý sân',
  '/profile': 'Hồ sơ tài khoản',
};

export const DesktopLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Sporta';

  return (
    <div className="h-screen bg-surface-container-low font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-on-primary flex-col hidden md:flex fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.1)]">
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-brand-yellow">Sporta</h1>
          <p className="text-[10px] text-on-primary/70 mt-1 font-bold uppercase tracking-widest">Dành Cho Chủ Sân</p>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          <NavItem to="/" icon="home" label="Bảng điều khiển" />
          <NavItem to="/matrix" icon="calendar" label="Sơ đồ sân" />
          <NavItem to="/scan" icon="scan" label="Quét mã QR" />
          <NavItem to="/facility" icon="facility" label="Quản lý sân" />
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
              SA
            </div>
            <div>
              <p className="text-sm font-semibold">Sporta Arena</p>
              <p className="text-xs text-white/60">Tài khoản</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header — dynamic title */}
        <header className="h-16 bg-white border-b border-surface-variant flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-bold text-on-surface">{pageTitle}</h2>
          <div className="flex items-center gap-4">
             <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-brand-emerald transition-colors relative">
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-yellow rounded-full"></span>
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
             </button>
          </div>
        </header>

        {/* Page Content — fixed height chain: flex-1 + min-h-0 + overflow-hidden */}
        <div className={`${
          location.pathname === '/matrix' 
            ? 'p-4 pb-6 md:p-5 overflow-y-auto overflow-x-hidden matrix-scroll' 
            : 'p-8 overflow-hidden'
        } flex-1 min-h-0 flex flex-col`}>
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-brand-yellow font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
      <Icon name={icon} className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </Link>
  );
};

const Icon = ({ name, className }: { name: string, className?: string }) => {
  switch (name) {
    case 'home':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    case 'calendar':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    case 'scan':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>;
    case 'facility':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
};
