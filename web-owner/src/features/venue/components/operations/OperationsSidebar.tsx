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
  const renderThumbnail = (venue: VenueResponse) => {
    if (venue.coverImage) {
      return (
        <img 
          src={venue.coverImage} 
          alt={venue.name} 
          className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-slate-100"
        />
      );
    }

    const sportId = venue.sport?.id;
    let bgClass = "bg-slate-100 text-slate-400";
    let icon = (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );

    if (sportId === 1 || venue.sport?.name?.toLowerCase().includes('bóng đá')) {
      bgClass = "bg-emerald-50 text-emerald-600 border border-emerald-100";
      icon = (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-9h3V8H8v3zm5-3h3v3h-3V8zm-5 5h3v3H8v-3zm5 3v-3h3v3h-3z" />
        </svg>
      );
    } else if (sportId === 2 || venue.sport?.name?.toLowerCase().includes('cầu lông')) {
      bgClass = "bg-orange-50 text-orange-600 border border-orange-100";
      icon = (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4.5 20.29c-.21.52.17 1.09.73 1.09h13.54c.56 0 .94-.57.73-1.09L12 2zm0 4l5.34 13H6.66L12 6z" />
        </svg>
      );
    } else if (sportId === 3 || venue.sport?.name?.toLowerCase().includes('pickleball')) {
      bgClass = "bg-sky-50 text-sky-600 border border-sky-100";
      icon = (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-4 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm2 9a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm2-4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-2-5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
        </svg>
      );
    } else if (sportId === 4 || venue.sport?.name?.toLowerCase().includes('bóng rổ')) {
      bgClass = "bg-amber-50 text-amber-600 border border-amber-100";
      icon = (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2zm-2 4a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      );
    }

    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        {icon}
      </div>
    );
  };

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
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 group ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-100 text-brand-emerald shadow-xs'
                    : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                }`}
              >
                {/* Thumbnail */}
                {renderThumbnail(venue)}

                {/* Venue info - clicking selects the venue */}
                <div
                  className="flex-1 min-w-0 space-y-0.5"
                  onClick={() => onSelectVenue(venue.id)}
                >
                  <h4 className={`text-xs font-black truncate flex items-center gap-1.5 ${isSelected ? 'text-brand-emerald' : 'text-slate-800 group-hover:text-slate-900'}`}>
                    {venue.name}
                    {venue.approvalStatus === 'DRAFT' && (
                      <span className="px-1 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black uppercase tracking-wider scale-90 origin-left">
                        Nháp
                      </span>
                    )}
                    {venue.approvalStatus === 'PENDING' && (
                      <span className="px-1 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-black uppercase tracking-wider scale-90 origin-left">
                        Chờ duyệt
                      </span>
                    )}
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
