import React from 'react';
import { BottomNav } from './BottomNav';

export const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background font-sans">
      {children}
      <BottomNav />
    </div>
  );
};
