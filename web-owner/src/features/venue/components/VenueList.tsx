import React, { useRef, useEffect } from 'react';
import type { VenueResponse, CourtResponse } from '../types';

interface VenueCardMenuProps {
  venueId: string;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onEdit: () => void;
  onChangeStatus: () => void;
}

const VenueCardMenu = ({ venueId, openMenuId, setOpenMenuId, onEdit, onChangeStatus }: VenueCardMenuProps) => {
  const isOpen = openMenuId === venueId;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, setOpenMenuId]);

  return (
    <div ref={ref} className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpenMenuId(isOpen ? null : venueId)}
        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
        title="Tuy chon"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.14)] z-[100] overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => { setOpenMenuId(null); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chinh sua thong tin
            </button>
            <button
              onClick={() => { setOpenMenuId(null); onChangeStatus(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Doi trang thai van hanh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface VenueListProps {
  venues: VenueResponse[];
  courts: CourtResponse[];
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onEdit: (venue: VenueResponse) => void;
  onChangeStatus: (venueId: string) => void;
}

export const VenueList = ({ venues, courts, openMenuId, setOpenMenuId, onEdit, onChangeStatus }: VenueListProps) => {
  if (venues.length === 0) {
    return (
      <div className="flex-1 bg-white border border-slate-200/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-sm select-none">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Khong co cum san nao</h3>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
          Tai khoản của bạn chưa đăng ký cụm sân nào. Hãy thêm cụm sân đầu tiên để quản lý dễ dàng hơn.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pr-1">
      {venues.map(venue => {
        const venueCourts = courts.filter(c => c.venueId === venue.id);
        const venueStatus = venue.status || 'ACTIVE';
        const statusColor =
          venueStatus === 'ACTIVE'      ? 'bg-emerald-50 text-brand-emerald border-emerald-100' :
          venueStatus === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
          'bg-red-50 text-red-600 border-red-100';
        const statusLabel =
          venueStatus === 'ACTIVE' ? 'Hoat dong' : venueStatus === 'MAINTENANCE' ? 'Bao tri' : 'Dong cua';

        return (
          <div
            key={venue.id}
            className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              {/* Header row: name + 3-dot menu */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h4 className="font-black text-slate-800 text-sm tracking-tight truncate">{venue.name}</h4>
                  <VenueCardMenu
                    venueId={venue.id}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    onEdit={() => onEdit(venue)}
                    onChangeStatus={() => onChangeStatus(venue.id)}
                  />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${statusColor}`}>
                    {statusLabel}
                  </span>
                  <span className="text-[9px] font-black text-brand-emerald bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {venueCourts.length} san bai
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="truncate" title={venue.location}>{venue.location}</span>
              </div>

              {venue.description && (
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed italic">
                  "{venue.description}"
                </p>
              )}
            </div>

            <div className="text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-3 flex justify-between select-none mt-3">
              <span>Co so Sporta Owner Portal</span>
              <span>ID: {venue.id.substring(0, 8)}...</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
