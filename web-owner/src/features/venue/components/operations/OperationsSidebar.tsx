import React from 'react';
import { VenueRowMenu } from './VenueRowMenu';
import type { VenueResponse, CourtResponse } from '../../types';

interface OperationsSidebarProps {
  venues: VenueResponse[];
  courts: CourtResponse[];
  activeVenueId: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  openVenueMenuId: string | null;
  setOpenVenueMenuId: (val: string | null) => void;
  onCreateVenueClick: () => void;
  onSelectVenue: (venueId: string) => void;
  onEditVenueInfo: (venueId: string) => void;
  onEditVenueStatus: (venueId: string) => void;
}

export const OperationsSidebar = ({
  venues,
  courts,
  activeVenueId,
  searchQuery,
  setSearchQuery,
  openVenueMenuId,
  setOpenVenueMenuId,
  onCreateVenueClick,
  onSelectVenue,
  onEditVenueInfo,
  onEditVenueStatus
}: OperationsSidebarProps) => {
  return (
    <aside className="w-72 bg-white border border-slate-200/60 rounded-3xl shadow-sm p-4 flex flex-col flex-shrink-0 select-none">
      <div className="space-y-1 pb-3.5 border-b border-slate-100">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Danh sách cụm sân</h2>
        <p className="text-[10px] text-slate-400 font-semibold leading-normal">Chọn cụm sân để quản lý vận hành</p>
      </div>

      {/* Create venue button */}
      <button
        onClick={onCreateVenueClick}
        className="w-full bg-emerald-50 hover:bg-emerald-100 text-brand-emerald font-extrabold text-[10px] py-3 rounded-xl border border-emerald-100 transition-all text-center mt-3 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
      >
        <svg className="w-3.5 h-3.5 text-brand-emerald animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Tạo cụm sân mới
      </button>

      {/* Search */}
      <div className="my-3.5 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs">
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="Tìm kiếm cụm sân..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-slate-700 font-semibold" 
        />
      </div>

      {/* Venue list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 matrix-scroll pr-1">
        {venues.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-semibold">Không tìm thấy cụm sân</div>
        ) : (
          venues.map(venue => {
            const isSelected = venue.id === activeVenueId;
            const venueCourtsCount = courts.filter(c => c.venueId === venue.id).length;
            return (
              <div
                key={venue.id}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 group ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-100 text-brand-emerald shadow-xs'
                    : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                {/* Venue info - clicking selects the venue */}
                <div
                  className="flex-1 min-w-0 space-y-0.5"
                  onClick={() => onSelectVenue(venue.id)}
                >
                  <h4 className={`text-xs font-black truncate ${isSelected ? 'text-brand-emerald' : 'text-slate-800 group-hover:text-slate-900'}`}>
                    {venue.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold truncate leading-normal">
                    {venueCourtsCount} sân trực thuộc
                  </p>
                </div>

                {/* 3-dot menu per venue row */}
                <VenueRowMenu
                  venueId={venue.id}
                  openMenuId={openVenueMenuId}
                  setOpenMenuId={setOpenVenueMenuId}
                  onEditInfo={() => onEditVenueInfo(venue.id)}
                  onEditStatus={() => onEditVenueStatus(venue.id)}
                />
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
