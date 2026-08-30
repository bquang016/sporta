import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { VenueResponse } from '../../types';
import { 
  Building2, 
  MapPin, 
  ChevronDown, 
  Check, 
  Plus, 
  Layers, 
  BarChart3, 
  Sparkles,
  Zap
} from 'lucide-react';

export type OperationsTabType = 'courts' | 'analytics' | 'pricing' | 'venues';

interface MobileOperationsHeaderProps {
  venues: VenueResponse[];
  activeVenue: VenueResponse | null;
  activeTab: OperationsTabType;
  onSelectTab: (tab: OperationsTabType) => void;
  onSelectVenue: (venueId: string) => void;
  onCreateVenue: () => void;
  onAddCourt: () => void;
  onOpenVenueStatus: () => void;
}

export const MobileOperationsHeader: React.FC<MobileOperationsHeaderProps> = ({
  venues,
  activeVenue,
  activeTab,
  onSelectTab,
  onSelectVenue,
  onCreateVenue,
  onAddCourt,
  onOpenVenueStatus
}) => {
  const navigate = useNavigate();
  const [isVenuePickerOpen, setIsVenuePickerOpen] = useState(false);

  return (
    <>
      <header
        className="relative bg-gradient-to-b from-[#002b1f] via-[#064e3b] to-[#043d2e] text-white rounded-b-[2.5rem] shadow-xl z-20 pb-4 transition-all overflow-hidden"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}
      >
        {/* Ambient Glow Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -left-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 px-4 space-y-3">
          {/* Top Title & Status Row */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-emerald-200/90 tracking-wide uppercase">Cổng chủ sân Sporta</span>
              <h1 className="text-lg font-black tracking-tight text-white mt-0.5">Vận hành & Cơ sở</h1>
            </div>

            <div className="flex items-center gap-1.5">
              {activeVenue && (
                <button
                  type="button"
                  onClick={onOpenVenueStatus}
                  className="touch-target px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/20 text-white text-[10px] font-extrabold flex items-center gap-1 backdrop-blur-md"
                  title="Đổi trạng thái mở/đóng cụm sân"
                >
                  <span className={`w-2 h-2 rounded-full ${activeVenue.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{activeVenue.status === 'ACTIVE' ? 'Đang mở' : 'Tạm đóng'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onAddCourt}
                className="touch-target bg-brand-yellow active:bg-yellow-400 text-[#064e3b] font-black text-[10px] px-3 py-1.5 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1 uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Thêm sân</span>
              </button>
            </div>
          </div>

          {/* Active Facility Card (Tap to open Venue Picker Bottom Sheet) */}
          {venues.length > 0 && (
            <button
              type="button"
              onClick={() => setIsVenuePickerOpen(true)}
              className="w-full bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/15 backdrop-blur-xl rounded-2xl p-3 text-left transition-all shadow-sm flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-yellow text-[#064e3b] flex items-center justify-center shrink-0 shadow-sm font-black">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Cụm sân đang quản lý</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  </div>
                  <p className="text-xs font-black text-white truncate">
                    {activeVenue?.name || 'Chọn cụm sân'}
                  </p>
                  <p className="text-[10px] text-white/60 font-medium truncate mt-0.5">
                    {activeVenue?.addressDetail || activeVenue?.location || 'Khu vực quản lý'}
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white/80">
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
          )}

          {/* Operations 4 Tabs Navigation Bar */}
          <div className="grid grid-cols-4 gap-1 bg-black/25 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            {[
              { id: 'courts', label: 'Sân bãi', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'analytics', label: 'Biểu đồ', icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { id: 'pricing', label: 'Giá AI', icon: <Sparkles className="w-3.5 h-3.5 text-brand-yellow" /> },
              { id: 'venues', label: 'Cơ sở', icon: <Building2 className="w-3.5 h-3.5" /> },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === 'pricing') {
                      navigate('/pricing');
                    } else {
                      onSelectTab(tab.id as OperationsTabType);
                    }
                  }}
                  className={`touch-target flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-yellow text-[#064e3b] shadow-sm font-black scale-102'
                      : 'text-white/70 hover:text-white font-bold'
                  }`}
                >
                  {tab.icon}
                  <span className="text-[9px] uppercase tracking-wider mt-0.5">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Facility Picker Bottom Sheet Modal via createPortal to document.body */}
      {isVenuePickerOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            className="fixed inset-0"
            onClick={() => setIsVenuePickerOpen(false)}
          />
          <div 
            className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-10 max-h-[85dvh] flex flex-col animate-slideUp"
            style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Chọn cụm sân vận hành</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Dữ liệu sân, bảng giá và báo cáo sẽ lọc theo cụm đã chọn</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVenuePickerOpen(false)}
                className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95"
              >
                ✕
              </button>
            </div>

            {/* List of Venues */}
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 pb-3">
              {venues.map((v) => {
                const isSelected = activeVenue?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      onSelectVenue(v.id);
                      setIsVenuePickerOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'bg-emerald-50/80 border-brand-emerald shadow-xs ring-1 ring-brand-emerald/30'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black ${
                        isSelected ? 'bg-brand-emerald text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-black truncate ${isSelected ? 'text-brand-emerald' : 'text-slate-800'}`}>
                          {v.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {v.addressDetail || v.location || 'Khu vực quản lý'}
                        </p>
                        <span className="inline-block text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mt-1">
                          {v.openingTime || '06:00'} - {v.closingTime || '23:00'} • {v.shiftDurationMinutes || 60}p/ca
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-emerald text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Action to Create New Venue */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsVenuePickerOpen(false);
                  onCreateVenue();
                }}
                className="touch-target w-full py-3 bg-[#064e3b] active:bg-emerald-950 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Thêm cụm sân mới</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
export default MobileOperationsHeader;
