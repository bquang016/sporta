import React, { useState } from 'react';
import { DesktopBookingGrid } from '../components/booking/DesktopBookingGrid';
import { MobileBookingGrid } from '../components/booking/MobileBookingGrid';
import { BookingCardView } from '../components/booking/BookingCardView';
import { useIsMobile } from '../hooks/useIsMobile';

type ViewMode = 'grid' | 'card';

export const MatrixPage = () => {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // ═══ MOBILE ═══
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-container-lowest">
        {/* Mobile Header */}
        <div className="px-5 pt-10 pb-4 bg-white border-b border-surface-variant/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-on-surface tracking-tight">Sơ đồ sân</h2>
              <p className="text-xs text-outline mt-1">Xem và quản lý lịch đặt sân</p>
            </div>
            {/* View Toggle */}
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>
        </div>
        {viewMode === 'grid' ? <MobileBookingGrid /> : <BookingCardView isMobile={true} />}
      </div>
    );
  }

  // ═══ DESKTOP ═══
  return (
    <div className="flex flex-col min-h-0">
      {/* Legend + View Toggle */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-outline">Hôm nay • Xem và quản lý lịch đặt sân</p>
        <div className="flex items-center gap-5">
          {/* View Toggle */}
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />

          {/* Legend */}
          <div className="flex gap-4 items-center border-l border-surface-variant pl-5">
            <LegendItem color="bg-emerald-50 border-emerald-200" label="Trống" />
            <LegendItem color="bg-brand-emerald" label="Đã đặt" />
            <LegendItem color="bg-amber-400" label="Đang giữ" />
            <LegendItem color="bg-red-400/80" label="Bảo trì" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0">
        {viewMode === 'grid' ? <DesktopBookingGrid /> : (
          <div className="rounded-2xl border border-surface-variant bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-visible">
            <BookingCardView isMobile={false} />
          </div>
        )}
      </div>
    </div>
  );
};

// ═══ View Toggle Component ═══
const ViewToggle = ({ viewMode, onChange }: { viewMode: ViewMode; onChange: (v: ViewMode) => void }) => (
  <div className="flex bg-surface-container-high rounded-xl p-1 gap-0.5">
    <button
      onClick={() => onChange('grid')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        viewMode === 'grid'
          ? 'bg-brand-emerald text-white shadow-sm'
          : 'text-outline hover:text-on-surface'
      }`}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
      Lưới
    </button>
    <button
      onClick={() => onChange('card')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        viewMode === 'card'
          ? 'bg-brand-emerald text-white shadow-sm'
          : 'text-outline hover:text-on-surface'
      }`}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      Thẻ
    </button>
  </div>
);

// ═══ Legend Item ═══
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-3.5 h-3.5 rounded ${color} ${color.includes('border') ? 'border' : ''}`}></div>
    <span className="text-[11px] font-bold text-on-surface">{label}</span>
  </div>
);
