import React, { useState, useEffect } from 'react';
import { DesktopBookingGrid } from '../components/DesktopBookingGrid';
import { MobileBookingGrid } from '../components/MobileBookingGrid';
import { BookingCardView } from '../components/BookingCardView';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { courtService } from '../../venue/services/courtService';
import { useTicketSessions } from '../../venue/hooks/useTicketSessions';
import { CreateTicketSessionModal } from '../../venue/components/operations/CreateTicketSessionModal';
import { Dropdown } from '../../../components/ui/Dropdown';
import type { VenueResponse, CourtResponse } from '../../venue/types';
import { Ticket, MapPin, Plus } from 'lucide-react';

type ViewMode = 'grid' | 'card';

export const MatrixPage = () => {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Venue switching state
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

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

  const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVenueId(e.target.value || null);
  };

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
      <div className="flex flex-col min-h-screen bg-slate-50/50 select-none animate-fadeIn">
        {/* Unified Mobile Header */}
        <header className="px-5 pt-12 pb-6 bg-brand-emerald text-white rounded-b-[2rem] shadow-md relative z-10 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden rounded-b-[2rem] pointer-events-none">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
          </div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-white/60 text-xs font-semibold tracking-wider">Sporty-Tech Owner App</p>
              <h1 className="text-xl font-black tracking-tight mt-0.5">Quản lý lịch</h1>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-sm">
              <span className="font-bold text-sm text-brand-yellow">SA</span>
            </div>
          </div>

          {/* Venue Switcher */}
          {venues.length > 0 && (
            <div className="mt-4 relative z-10">
              <Dropdown
                options={venues.map(v => ({
                  value: v.id,
                  label: v.name,
                  icon: <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                }))}
                value={selectedVenueId || ''}
                onChange={(val) => setSelectedVenueId(val || null)}
                className="w-full text-slate-800 font-bold"
              />
            </div>
          )}

          <div className="mt-4 flex gap-2 relative z-10">
            <div className="flex-1 flex justify-between items-center bg-white/10 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-white/80 font-bold ml-2">Chế độ:</span>
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>

            {selectedVenueId && (
              <button
                onClick={() => setIsCreateTicketSessionOpen(true)}
                className="bg-brand-yellow hover:bg-yellow-500 text-primary font-black text-[10px] px-3.5 py-2.5 rounded-2xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Xé vé
              </button>
            )}
          </div>
        </header>

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
          <div className="p-8 text-center text-xs text-slate-400 font-bold">
            Không tìm thấy cụm sân hoạt động nào.
          </div>
        )}

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
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="space-y-0.5">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
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
          {/* Create Ticket Session Button (Athletic Yellow Style per DESIGN.md) */}
          {selectedVenueId && (
            <button
              onClick={() => setIsCreateTicketSessionOpen(true)}
              className="bg-brand-yellow hover:bg-yellow-500 text-primary font-black text-[10px] px-4.5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 uppercase tracking-wider border-b-2 border-yellow-750 cursor-pointer"
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
const ViewToggle = ({ viewMode, onChange }: { viewMode: ViewMode; onChange: (v: ViewMode) => void }) => (
  <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5 border border-slate-200/40 select-none">
    <button
      onClick={() => onChange('grid')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
        viewMode === 'grid'
          ? 'bg-brand-emerald text-white shadow-xs'
          : 'text-slate-450 hover:text-slate-700'
      }`}
    >
      Lưới
    </button>
    <button
      onClick={() => onChange('card')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
        viewMode === 'card'
          ? 'bg-brand-emerald text-white shadow-xs'
          : 'text-slate-450 hover:text-slate-700'
      }`}
    >
      Danh sách
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
