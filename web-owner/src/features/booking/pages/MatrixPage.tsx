import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DesktopBookingGrid } from '../components/DesktopBookingGrid';
import { MobileBookingGrid } from '../components/MobileBookingGrid';
import { BookingCardView } from '../components/BookingCardView';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { courtService } from '../../venue/services/courtService';
import { useTicketSessions } from '../../venue/hooks/useTicketSessions';
import { CreateTicketSessionModal } from '../../venue/components/operations/CreateTicketSessionModal';
import { Dropdown } from '../../../components/ui/Dropdown';
import type { VenueResponse, CourtResponse } from '../../venue/types';
import { Ticket, MapPin, Plus, ChevronDown, Check, LayoutGrid, List } from 'lucide-react';

type ViewMode = 'grid' | 'card';

export const MatrixPage = () => {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Venue switching state
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [isVenuePickerOpen, setIsVenuePickerOpen] = useState(false);

  // Trigger calendar matrix reload
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Modal create ticket session state
  const [isCreateTicketSessionOpen, setIsCreateTicketSessionOpen] = useState(false);

  // Ticket session custom hook
  const { createSession } = useTicketSessions(selectedVenueId);


  // Load venues and courts
  useEffect(() => {
    const loadData = async () => {
      setLoadingVenues(true);
      try {
        const venueList = await courtService.getVenues();
        const activeVenues = venueList.filter(v => v.status === 'ACTIVE');
        setVenues(activeVenues);
        if (activeVenues.length > 0) {
          setSelectedVenueId(activeVenues[0].id);
        }

        const courtList = await courtService.getCourts();
        setCourts(courtList);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu cụm sân / sân đấu:', err);
      } finally {
        setLoadingVenues(false);
      }
    };
    loadData();
  }, []);

  const handleCreateSessionSuccess = async (data: any) => {
    await createSession(data);
    // Increment counter to refresh booking grids
    setRefreshCounter(prev => prev + 1);
  };

  const activeVenue = venues.find(v => v.id === selectedVenueId);
  const activeCourts = courts.filter(c => c.venueId === selectedVenueId);

  if (loadingVenues) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 select-none font-sans">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin mb-4" />
        <span className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">Đang tải cụm sân...</span>
      </div>
    );
  }

  // ═══ MOBILE ═══
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-dvh bg-slate-100/60 select-none animate-fadeIn pb-24"
           style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
        {/* Unified Mobile Header */}
        <header
          className="relative bg-gradient-to-b from-[#002b1f] via-[#064e3b] to-[#043d2e] text-white rounded-b-[2.5rem] shadow-xl z-20 pb-5 transition-all overflow-hidden"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-12 -right-12 w-56 h-56 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 -left-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 px-5 space-y-3.5">
            {/* Top Bar */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-emerald-200/90 tracking-wide uppercase">Cổng chủ sân Sporta</span>
                <h1 className="text-lg font-black tracking-tight text-white mt-0.5">Sơ đồ lịch đặt sân</h1>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-brand-yellow font-black shadow-inner">
                <Ticket className="w-5 h-5" />
              </div>
            </div>

            {/* Venue Switcher Button */}
            {venues.length > 0 && (
              <button
                type="button"
                onClick={() => setIsVenuePickerOpen(true)}
                className="w-full bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/15 backdrop-blur-xl rounded-2xl p-3 text-left transition-all shadow-sm flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-brand-yellow text-[#064e3b] flex items-center justify-center shrink-0 shadow-sm font-black">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Cụm sân đang xem</span>
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

            {/* Controls Row: View Toggle & Ticket Session CTA */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex-1 flex justify-between items-center bg-black/20 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-[10px] text-white/80 font-extrabold ml-2">Chế độ:</span>
                <ViewToggle viewMode={viewMode} onChange={setViewMode} isHeaderTheme={true} />
              </div>

              {selectedVenueId && (
                <button
                  type="button"
                  onClick={() => setIsCreateTicketSessionOpen(true)}
                  className="touch-target bg-brand-yellow active:bg-yellow-400 text-[#064e3b] font-black text-[10px] px-3.5 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 uppercase tracking-wider min-h-[42px] border-b-2 border-yellow-600 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Xé vé</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Horizontal Status Color Legend Bar */}
        <div className="px-4 py-2 bg-white border-b border-slate-200/70 shadow-2xs select-none">
          <div className="flex items-center gap-2.5 overflow-x-auto scroll-x-touch py-0.5 text-[10px] font-black">
            <div className="flex items-center gap-1.5 shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Trống</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-[#064e3b] text-white px-2 py-0.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              <span>Đã đặt</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Đặt thủ công</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Ca xé vé</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-red-100 text-red-900 border border-red-300 px-2 py-0.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Bảo trì</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 pt-2">
          {selectedVenueId ? (
            viewMode === 'grid' ? (
              <MobileBookingGrid venueId={selectedVenueId} refreshCounter={refreshCounter} />
            ) : (
              <BookingCardView 
                isMobile={true} 
                venueId={selectedVenueId} 
                refreshCounter={refreshCounter} 
                onRefresh={() => setRefreshCounter(prev => prev + 1)} 
              />
            )
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 font-bold bg-white rounded-3xl m-4 border border-dashed border-slate-200">
              Không tìm thấy cụm sân hoạt động nào.
            </div>
          )}
        </div>

        {/* Venue Picker Bottom Sheet Modal (Portal to document.body with z-[9999]) */}
        {isVenuePickerOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div 
              className="fixed inset-0"
              onClick={() => setIsVenuePickerOpen(false)}
            />
            <div 
              className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-10 max-h-[80dvh] flex flex-col animate-slideUp"
              style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-800">Chọn cụm sân xem lịch</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Sơ đồ và ca đặt sẽ hiển thị theo cụm sân đã chọn</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVenuePickerOpen(false)}
                  className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 pb-4">
                {venues.map((v) => {
                  const isSelected = selectedVenueId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVenueId(v.id);
                        setIsVenuePickerOpen(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-emerald-50/80 border-brand-emerald shadow-xs'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black ${
                          isSelected ? 'bg-brand-emerald text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-black truncate ${isSelected ? 'text-brand-emerald' : 'text-slate-800'}`}>
                            {v.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                            {v.addressDetail || v.location || 'Khu vực'}
                          </p>
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
            </div>
          </div>,
          document.body
        )}

        {/* Modal tạo ca xé vé */}
        <CreateTicketSessionModal
          isOpen={isCreateTicketSessionOpen}
          onClose={() => setIsCreateTicketSessionOpen(false)}
          courts={activeCourts}
          venues={venues}
          onCreate={handleCreateSessionSuccess}
        />
      </div>
    );
  }

  // ═══ DESKTOP ═══
  return (
    <div className="flex flex-col min-h-0 select-none">
      {/* Top Header / Filter toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 mb-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald"></span>
              Sơ đồ lịch đặt sân
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">
              Theo dõi, đặt sân nhanh và quản lý các ca ghép cặp xé vé
            </p>
          </div>

          {/* Venue Switcher */}
          {venues.length > 0 && (
            <Dropdown
              options={venues.map(v => ({
                value: v.id,
                label: v.name,
                icon: <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
              }))}
              value={selectedVenueId || ''}
              onChange={(val) => setSelectedVenueId(val || null)}
              className="min-w-[220px] ml-4 text-slate-800 font-bold"
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Create Ticket Session Button */}
          {selectedVenueId && (
            <button
              type="button"
              onClick={() => setIsCreateTicketSessionOpen(true)}
              className="bg-brand-yellow hover:bg-yellow-500 text-[#064e3b] font-black text-[10px] px-4.5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 uppercase tracking-wider border-b-2 border-yellow-600 cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              Tạo ca xé vé
            </button>
          )}

          {/* View Toggle */}
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />

          {/* Legend */}
          <div className="flex gap-4 items-center border-l border-slate-100 pl-4">
            <LegendItem color="bg-emerald-50 border-emerald-250" label="Trống" />
            <LegendItem color="bg-brand-emerald" label="Đã đặt" />
            <LegendItem color="bg-amber-400" label="Đặt thủ công" />
            <LegendItem color="bg-indigo-650 bg-gradient-to-r from-indigo-600 to-purple-600" label="Xé vé" />
            <LegendItem color="bg-stripes-red" label="Bảo trì" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0">
        {selectedVenueId ? (
          viewMode === 'grid' ? (
            <DesktopBookingGrid venueId={selectedVenueId} refreshCounter={refreshCounter} />
          ) : (
            <BookingCardView 
              isMobile={false} 
              venueId={selectedVenueId} 
              refreshCounter={refreshCounter} 
              onRefresh={() => setRefreshCounter(prev => prev + 1)} 
            />
          )
        ) : (
          <div className="bg-white border border-slate-150 p-16 rounded-3xl text-center font-bold text-slate-400 text-xs">
            Vui lòng tạo cụm sân bóng hoạt động để quản lý sơ đồ lịch đặt.
          </div>
        )}
      </div>

      <CreateTicketSessionModal
        isOpen={isCreateTicketSessionOpen}
        onClose={() => setIsCreateTicketSessionOpen(false)}
        courts={activeCourts}
        venues={venues}
        onCreate={handleCreateSessionSuccess}
      />
    </div>
  );
};

// ═══ View Toggle Component ═══
const ViewToggle = ({ 
  viewMode, 
  onChange,
  isHeaderTheme = false
}: { 
  viewMode: ViewMode; 
  onChange: (v: ViewMode) => void;
  isHeaderTheme?: boolean;
}) => (
  <div className={`flex rounded-xl p-1 gap-1 select-none ${isHeaderTheme ? 'bg-black/25' : 'bg-slate-100 border border-slate-200/40'}`}>
    <button
      type="button"
      onClick={() => onChange('grid')}
      className={`touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer min-h-[34px] ${
        viewMode === 'grid'
          ? (isHeaderTheme ? 'bg-brand-yellow text-[#064e3b] shadow-sm scale-105' : 'bg-brand-emerald text-white shadow-xs')
          : (isHeaderTheme ? 'text-white/70 hover:text-white' : 'text-slate-450 hover:text-slate-700 active:bg-slate-200')
      }`}
    >
      <LayoutGrid className="w-3.5 h-3.5" />
      <span>Lưới</span>
    </button>
    <button
      type="button"
      onClick={() => onChange('card')}
      className={`touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer min-h-[34px] ${
        viewMode === 'card'
          ? (isHeaderTheme ? 'bg-brand-yellow text-[#064e3b] shadow-sm scale-105' : 'bg-brand-emerald text-white shadow-xs')
          : (isHeaderTheme ? 'text-white/70 hover:text-white' : 'text-slate-450 hover:text-slate-700 active:bg-slate-200')
      }`}
    >
      <List className="w-3.5 h-3.5" />
      <span>Danh sách</span>
    </button>
  </div>
);

// ═══ Legend Item ═══
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1.5 select-none">
    <div className={`w-3.5 h-3.5 rounded-md ${color} ${color.includes('border') ? 'border border-dashed' : ''}`}></div>
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide">{label}</span>
  </div>
);

export default MatrixPage;
