import React from 'react';
import type { VenueInfo } from '../types';

interface VenueSportModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  venueInfo: VenueInfo;
  onVenueInfoChange: (val: VenueInfo) => void;
  isLoading: boolean;
}

export const VenueSportModal = ({
  isOpen,
  onConfirm,
  venueInfo,
  onVenueInfoChange,
  isLoading
}: VenueSportModalProps) => {

  if (!isOpen) return null;

  const SPORT_OPTIONS = [
    {
      id: '1',
      name: 'Bóng đá',
      icon: (
        <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 3.3 1.35-.95a8.01 8.01 0 0 1 4.38 3.34l-.39 1.34-1.35.46L13 6.7V5.3zm-3.35-.95L11 5.3v1.4L7.01 9.49l-1.35-.46-.39-1.34a8.103 8.103 0 0 1 4.38-3.34zM7.08 17.11l-1.14.1A7.938 7.938 0 0 1 4 12c0-.12.01-.23.02-.35l1-.73 1.38.48 1.46 4.34-.78 1.37zm7.42 2.48c-.79.26-1.63.41-2.5.41s-1.71-.15-2.5-.41l-.69-1.49.64-1.1h5.11l.64 1.11-.7 1.48zM14.27 15H9.73l-1.35-4.02L12 8.44l3.63 2.54L14.27 15zm3.79 2.21-1.14-.1-.79-1.37 1.46-4.34 1.39-.47 1 .73c.01.11.02.22.02.34 0 1.99-.73 3.81-1.94 5.21z" />
        </svg>
      ),
      bgClass: "hover:border-emerald-500 hover:bg-emerald-50/20",
      activeClass: "border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-md ring-2 ring-emerald-500/20"
    },
    {
      id: '2',
      name: 'Cầu lông',
      icon: (
        <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.3,2C11.33,2.03 10.58,2.84 10.61,3.8C10.62,4.04 10.67,4.27 10.77,4.5L11.06,5.14V5.14C11.1,5.27 11.03,5.41 10.89,5.45C10.8,5.5 10.7,5.45 10.63,5.37L10.21,4.82C9.88,4.4 9.38,4.14 8.85,4.13C7.88,4.11 7.08,4.88 7.06,5.84C7.05,6.26 7.19,6.66 7.45,7L7.87,7.5H7.88C7.96,7.63 7.93,7.79 7.82,7.87C7.73,7.94 7.61,7.94 7.53,7.87L7,7.45C6.66,7.19 6.25,7.05 5.84,7.06C4.88,7.08 4.11,7.88 4.13,8.85C4.14,9.38 4.4,9.88 4.82,10.21L5.39,10.65C5.5,10.75 5.5,10.91 5.38,11C5.31,11.07 5.21,11.09 5.12,11.05H5.11L4.5,10.77C4.27,10.68 4.04,10.62 3.8,10.61C2.84,10.58 2.03,11.34 2,12.31C2,13.03 2.4,13.69 3.06,13.97L14.45,19.04L19.04,14.45L13.97,3.06C13.69,2.39 13,1.97 12.3,2M13.13,6.1C13.55,6.09 13.93,6.33 14.09,6.71L17.14,13.55L13.19,9.61L12.26,7.5C11.96,6.87 12.42,6.12 13.13,6.1M9.85,8.85C10.12,8.85 10.37,8.95 10.56,9.15L15.37,13.96C15.77,14.34 15.78,14.97 15.4,15.37C15,15.77 14.38,15.78 13.96,15.37L9.15,10.56C8.75,10.18 8.74,9.54 9.13,9.15C9.32,8.95 9.58,8.85 9.85,8.85M7.13,12.17C7.26,12.17 7.4,12.21 7.5,12.26L9.63,13.2L13.57,17.14L6.71,14.09C5.69,13.65 6.03,12.14 7.13,12.17M20.28,16.04L16.04,20.28L16.89,21.13C17.65,21.88 18.75,22.17 19.78,21.9C20.81,21.62 21.62,20.81 21.9,19.78C22.17,18.75 21.88,17.65 21.13,16.89L20.28,16.04Z" />
        </svg>
      ),
      bgClass: "hover:border-orange-500 hover:bg-orange-50/20",
      activeClass: "border-orange-500 bg-orange-50/30 text-orange-700 shadow-md ring-2 ring-orange-500/20"
    },
    {
      id: '3',
      name: 'Pickleball',
      icon: (
        <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.52 2.49C17.18.15 12.9.62 9.97 3.55c-1.6 1.6-2.52 3.87-2.54 5.46-.02 1.58.26 3.89-1.35 5.5l-4.24 4.24 1.42 1.42 4.24-4.24c1.61-1.61 3.92-1.33 5.5-1.35s3.86-.94 5.46-2.54c2.92-2.93 3.4-7.21 1.06-9.55zm-9.2 9.19c-1.53-1.53-1.05-4.61 1.06-6.72s5.18-2.59 6.72-1.06c1.53 1.53 1.05 4.61-1.06 6.72s-5.18 2.59-6.72 1.06zM18 17c.53 0 1.04.21 1.41.59.78.78.78 2.05 0 2.83-.37.37-.88.58-1.41.58s-1.04-.21-1.41-.59c-.78-.78-.78-2.05 0-2.83.37-.37.88-.58 1.41-.58m0-2a3.998 3.998 0 0 0-2.83 6.83c.78.78 1.81 1.17 2.83 1.17a3.998 3.998 0 0 0 2.83-6.83A3.998 3.998 0 0 0 18 15z" />
        </svg>
      ),
      bgClass: "hover:border-sky-500 hover:bg-sky-50/20",
      activeClass: "border-sky-500 bg-sky-50/30 text-sky-700 shadow-md ring-2 ring-sky-500/20"
    },
    {
      id: '4',
      name: 'Bóng rổ',
      icon: (
        <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM5.23 7.75C6.1 8.62 6.7 9.74 6.91 11H4.07a8.12 8.12 0 0 1 1.16-3.25zM4.07 13h2.84a5.972 5.972 0 0 1-1.68 3.25A8.12 8.12 0 0 1 4.07 13zM11 19.93c-1.73-.22-3.29-1-4.49-2.14A7.952 7.952 0 0 0 8.93 13H11v6.93zM11 11H8.93A7.99 7.99 0 0 0 6.5 6.2 8.035 8.035 0 0 1 11 4.07V11zm8.93 0h-2.84c.21-1.26.81-2.38 1.68-3.25.6.97 1.01 2.07 1.16 3.25zM13 4.07c1.73.22 3.29.99 4.5 2.13a7.99 7.99 0 0 0-2.43 4.8H13V4.07zm0 15.86V13h2.07a8.006 8.006 0 0 0 2.42 4.79A7.988 7.988 0 0 1 13 19.93zm5.77-3.68A6.004 6.004 0 0 1 17.09 13h2.84a8.12 8.12 0 0 1-1.16 3.25z" />
        </svg>
      ),
      bgClass: "hover:border-amber-500 hover:bg-amber-50/20",
      activeClass: "border-amber-500 bg-amber-50/30 text-amber-700 shadow-md ring-2 ring-amber-500/20"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onConfirm} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden animate-slideUp">
        <div className="p-8 space-y-8">
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Chọn bộ môn thể thao chính</h3>
            <p className="text-sm text-slate-500 font-medium">
              Cụm sân của bạn sẽ được hiển thị với bộ môn này trên hệ thống.
            </p>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {SPORT_OPTIONS.map(opt => {
              const isSelected = venueInfo.sportId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onVenueInfoChange({ ...venueInfo, sportId: opt.id })}
                  className={`border-2 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-95 ${isSelected ? opt.activeClass : `border-slate-100 bg-white text-slate-500 ${opt.bgClass}`
                    }`}
                >
                  {opt.icon}
                  <span className="text-sm font-black tracking-wider uppercase">{opt.name}</span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center pt-4 border-t border-slate-100">
            <button
              onClick={onConfirm}
              disabled={!venueInfo.sportId || isLoading}
              className={`px-8 py-3.5 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all shadow-md flex items-center gap-2 ${
                !venueInfo.sportId || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer active:scale-95'
              }`}
            >
              Tiếp tục cấu hình kinh doanh
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
