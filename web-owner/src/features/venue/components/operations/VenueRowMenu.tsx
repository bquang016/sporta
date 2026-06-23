import React, { useRef, useEffect } from 'react';

interface VenueRowMenuProps {
  venueId: string;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onEditInfo: () => void;
  onEditStatus: () => void;
}

export const VenueRowMenu = ({ venueId, openMenuId, setOpenMenuId, onEditInfo, onEditStatus }: VenueRowMenuProps) => {
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
    <div ref={ref} className={`relative flex-shrink-0 ${isOpen ? 'z-[110]' : 'z-10'}`} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpenMenuId(isOpen ? null : venueId)}
        className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
        title="Tùy chọn"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.14)] z-[100] overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => { setOpenMenuId(null); onEditInfo(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa
            </button>
            <button
              onClick={() => { setOpenMenuId(null); onEditStatus(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Thay đổi trạng thái
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
