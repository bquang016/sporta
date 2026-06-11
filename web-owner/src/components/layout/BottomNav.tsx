import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-safe pt-2 bg-white/95 backdrop-blur-[20px] border-t border-surface-variant safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        <NavItem to="/" icon="home" label="Trang chủ" />
        <NavItem to="/matrix" icon="calendar" label="Lịch" />
        <NavItem to="/scan" icon="scan" label="Quét QR" isCenter />
        <NavItem to="/facility" icon="facility" label="Sân bãi" />
        <NavItem to="/profile" icon="profile" label="Hồ sơ" />
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, label, isCenter }: { to: string, icon: string, label: string, isCenter?: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  if (isCenter) {
    return (
      <Link to={to} className="flex flex-col items-center justify-center -mt-8">
        <div className="bg-brand-yellow text-brand-emerald rounded-full w-14 h-14 flex items-center justify-center shadow-[0_8px_16px_rgba(6,78,59,0.15)]">
          <Icon name={icon} className="w-6 h-6" />
        </div>
        <span className="text-[10px] mt-1 font-semibold text-brand-emerald tracking-wider">{label}</span>
      </Link>
    );
  }

  return (
    <Link to={to} className="flex flex-col items-center justify-center flex-1 py-1 relative">
      <div className={`mb-1 transition-colors ${isActive ? 'text-brand-emerald' : 'text-outline'}`}>
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <span className={`text-[10px] tracking-wider transition-colors ${isActive ? 'text-brand-emerald font-semibold' : 'text-outline font-medium'}`}>
        {label}
      </span>
      {isActive && <div className="w-1 h-1 bg-brand-emerald rounded-full mt-1 absolute bottom-0" />}
    </Link>
  );
};

const Icon = ({ name, className }: { name: string, className?: string }) => {
  // Placeholder SVG icons
  switch (name) {
    case 'home':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    case 'calendar':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    case 'scan':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>;
    case 'facility':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
    case 'profile':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
};
