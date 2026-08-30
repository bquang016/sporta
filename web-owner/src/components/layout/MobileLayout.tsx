import React from 'react';
import { BottomNav } from './BottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
  /** Nếu true, sẽ KHÔNG render BottomNav (dùng cho full-screen pages như Scan, Login) */
  hideNav?: boolean;
}

export const MobileLayout = ({ children, hideNav = false }: MobileLayoutProps) => {
  return (
    <div
      className="min-h-dvh bg-background font-sans flex flex-col"
      // viewport-fit=cover cần được set trong HTML meta tag
    >
      {/* Main content — padding-bottom 80px = BottomNav (64px) + safe-area-bottom */}
      <div className={`flex-1 flex flex-col min-h-0 ${!hideNav ? 'pb-20 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]' : ''}`}>
        {children}
      </div>

      {/* Bottom Navigation */}
      {!hideNav && <BottomNav />}
    </div>
  );
};
