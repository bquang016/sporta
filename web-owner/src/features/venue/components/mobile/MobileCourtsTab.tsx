import React, { useState, useMemo } from 'react';
import type { CourtResponse, VenueResponse } from '../../types';
import { MobileCourtCard } from './MobileCourtCard';
import { 
  Search, 
  Plus, 
  Layers, 
  Sparkles, 
  SlidersHorizontal, 
  CheckSquare, 
  Square, 
  DollarSign, 
  Power, 
  Wrench,
  Zap
} from 'lucide-react';

interface MobileCourtsTabProps {
  courts: CourtResponse[];
  activeVenue: VenueResponse | null;
  selectedCourtIds: string[];
  onToggleSelectCourt: (courtId: string) => void;
  onSelectAllCourts: () => void;
  onDeselectAllCourts?: () => void;
  onAddCourt: () => void;
  onEditCourtConfig: (court: CourtResponse) => void;
  onBulkEdit: () => void;
  onBulkSurcharge: () => void;
  onQuickToggleStatus: (court: CourtResponse) => void;
  formatVND: (n: number) => string;
}

export const MobileCourtsTab: React.FC<MobileCourtsTabProps> = ({
  courts,
  activeVenue,
  selectedCourtIds,
  onToggleSelectCourt,
  onSelectAllCourts,
  onDeselectAllCourts,
  onAddCourt,
  onEditCourtConfig,
  onBulkEdit,
  onBulkSurcharge,
  onQuickToggleStatus,
  formatVND
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MAINTENANCE'>('ALL');

  // Filter courts by active venue, search, and status
  const venueCourts = useMemo(() => {
    if (!activeVenue) return [];
    return courts.filter(c => c.venueId === activeVenue.id);
  }, [courts, activeVenue]);

  const filteredCourts = useMemo(() => {
    return venueCourts.filter(court => {
      const matchesSearch = !searchTerm || court.name.toLowerCase().includes(searchTerm.toLowerCase());
      const courtStatus = court.status || 'ACTIVE';
      const matchesStatus = statusFilter === 'ALL' || courtStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [venueCourts, searchTerm, statusFilter]);

  // Counts
  const totalCount = venueCourts.length;
  const activeCount = venueCourts.filter(c => (c.status || 'ACTIVE') === 'ACTIVE').length;
  const maintCount = venueCourts.filter(c => c.status === 'MAINTENANCE').length;

  const isAllSelected = venueCourts.length > 0 && selectedCourtIds.length === venueCourts.length;

  const handleClearSelection = () => {
    if (onDeselectAllCourts) {
      onDeselectAllCourts();
    } else {
      onSelectAllCourts();
    }
  };

  return (
    <div className="space-y-3 pb-6" style={{ touchAction: 'pan-y' }}>
      {/* 1. KPI Metric Strip */}
      <div className="grid grid-cols-3 gap-2 px-4 select-none">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Tổng sân</span>
          <p className="text-base font-black text-slate-800 tracking-tight mt-0.5">{totalCount}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block">Đang mở</span>
          <p className="text-base font-black text-emerald-700 tracking-tight mt-0.5">{activeCount}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
          <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 block">Bảo trì</span>
          <p className="text-base font-black text-amber-700 tracking-tight mt-0.5">{maintCount}</p>
        </div>
      </div>

      {/* 2. Search & Filter Chips Bar */}
      <div className="px-4 space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm tên sân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-brand-emerald shadow-2xs"
          />
          {searchTerm && (
            <button 
              type="button"
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Chips & Select All */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto scroll-x-touch py-0.5 select-none">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Tất cả', count: totalCount },
              { id: 'ACTIVE', label: 'Đang mở', count: activeCount },
              { id: 'MAINTENANCE', label: 'Bảo trì', count: maintCount },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id as any)}
                className={`touch-target px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  statusFilter === f.id
                    ? 'bg-[#064e3b] text-white shadow-xs scale-102'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onSelectAllCourts}
            className="touch-target shrink-0 flex items-center gap-1 text-[10px] font-black text-brand-emerald bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 active:scale-95"
          >
            {isAllSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            <span>{isAllSelected ? 'Bỏ chọn' : 'Chọn hết'}</span>
          </button>
        </div>
      </div>

      {/* 3. Courts List Feed with dynamic bottom padding when action bar is visible */}
      <div className={`px-4 space-y-3 transition-all ${selectedCourtIds.length > 0 ? 'pb-36' : 'pb-6'}`}>
        {filteredCourts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200 select-none space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700">Không tìm thấy sân nào phù hợp</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Thử đổi bộ lọc hoặc thêm sân mới cho cụm này</p>
            </div>
            <button
              type="button"
              onClick={onAddCourt}
              className="touch-target inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-emerald text-white text-xs font-black shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm sân ngay</span>
            </button>
          </div>
        ) : (
          filteredCourts.map(court => (
            <MobileCourtCard
              key={court.id}
              court={court}
              isSelected={selectedCourtIds.includes(court.id)}
              onToggleSelect={onToggleSelectCourt}
              onEditConfig={onEditCourtConfig}
              onQuickToggleStatus={onQuickToggleStatus}
              formatVND={formatVND}
            />
          ))
        )}
      </div>

      {/* 4. Floating Multi-Select Action Dock (Visible when courts are selected) */}
      {selectedCourtIds.length > 0 && (
        <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-40 animate-slideUp pointer-events-none">
          <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.35)] border border-slate-700/80 flex items-center justify-between gap-2 pointer-events-auto">
            {/* Left: Count & Deselect Button */}
            <div className="flex items-center gap-2 pl-1 min-w-0">
              <button
                type="button"
                onClick={handleClearSelection}
                className="w-7 h-7 rounded-xl bg-brand-yellow text-[#064e3b] font-black text-xs flex items-center justify-center shrink-0 shadow-xs active:scale-90 transition-transform"
                title="Bỏ chọn tất cả"
              >
                {selectedCourtIds.length}
              </button>
              <div className="min-w-0">
                <span className="text-[11px] font-black text-white block truncate leading-tight">
                  Đã chọn {selectedCourtIds.length} sân
                </span>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-[9px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onBulkSurcharge}
                className="touch-target px-3 py-2 rounded-xl bg-brand-yellow active:bg-yellow-400 text-[#064e3b] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 stroke-[3]" />
                <span>Phụ phí</span>
              </button>

              <button
                type="button"
                onClick={onBulkEdit}
                className="touch-target px-3 py-2 rounded-xl bg-white/15 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 border border-white/20"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Cấu hình chung</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MobileCourtsTab;
