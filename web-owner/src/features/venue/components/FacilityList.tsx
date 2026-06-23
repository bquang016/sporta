import React from 'react';
import { Dropdown } from '../../../components/ui/Dropdown';
import type { DropdownOption } from '../../../components/ui/Dropdown';
import type { CourtResponse } from '../types';

interface FacilityListProps {
  courts: CourtResponse[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedSport: string;
  setSelectedSport: (val: string) => void;
  selectedVenueFilter: string;
  setSelectedVenueFilter: (val: string) => void;
  SPORT_FILTER_OPTIONS: DropdownOption[];
  venueFilterOptions: DropdownOption[];
  onOpenCreate: () => void;
  onOpenDetail: (court: CourtResponse, isViewOnly: boolean) => void;
  onSimulateStatus: (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => void;
  formatVND: (amount: number) => string;
}

export const FacilityList = ({
  courts,
  searchQuery,
  setSearchQuery,
  selectedSport,
  setSelectedSport,
  selectedVenueFilter,
  setSelectedVenueFilter,
  SPORT_FILTER_OPTIONS,
  venueFilterOptions,
  onOpenCreate,
  onOpenDetail,
  onSimulateStatus,
  formatVND
}: FacilityListProps) => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      
      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between select-none">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 w-full sm:w-60 text-xs">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Tìm theo tên sân, địa chỉ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-slate-700 font-semibold"
            />
          </div>

          {/* Custom Dropdown: Sport filter */}
          <Dropdown 
            options={SPORT_FILTER_OPTIONS}
            value={selectedSport}
            onChange={setSelectedSport}
            className="w-full sm:w-48"
          />

          {/* Custom Dropdown: Venue filter */}
          <Dropdown 
            options={venueFilterOptions}
            value={selectedVenueFilter}
            onChange={setSelectedVenueFilter}
            placeholder="Lọc theo cụm sân"
            className="w-full sm:w-48"
          />
        </div>

        {/* Register Action button */}
        <button 
          onClick={onOpenCreate}
          className="w-full md:w-auto bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap border-b-2 border-emerald-950"
        >
          <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Gửi đơn đăng ký sân mới
        </button>
      </div>

      {/* COURTS LIST GRID */}
      {courts.length === 0 ? (
        <div className="flex-1 bg-white border border-slate-200/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-sm select-none">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Không có sân bãi</h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Không tìm thấy sân bãi nào phù hợp với bộ lọc tìm kiếm của bạn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pr-1">
          {courts.map(court => (
            <div 
              key={court.id}
              className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group relative h-[490px]"
            >
              <div className="h-44 w-full bg-slate-100 relative overflow-hidden flex-shrink-0">
                {court.coverImage ? (
                  <img 
                    src={court.coverImage} 
                    alt={court.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs uppercase bg-slate-50 select-none">
                    Không có ảnh bìa
                  </div>
                )}
                
                <span className="absolute top-3 left-3 text-[9px] font-black uppercase bg-emerald-950 text-brand-yellow px-2 py-0.5 rounded-md border border-brand-yellow/15 shadow-sm">
                  {court.sportName}
                </span>

                <span className={`absolute top-3 right-3 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-sm border border-white/10 ${
                  court.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 
                  court.status === 'REJECTED' ? 'bg-red-655 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {court.status === 'APPROVED' ? 'Đã duyệt' : 
                   court.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-800 text-sm tracking-tight truncate" title={court.name}>{court.name}</h4>
                    {court.venueName && (
                      <span className="inline-block text-[9px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {court.venueName}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold pt-1">
                      <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="truncate" title={court.location}>{court.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 select-none">
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">Giờ mở cửa</span>
                      <span className="font-extrabold text-slate-700">{court.openingTime} - {court.closingTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">Giá theo giờ</span>
                      <span className="font-extrabold text-brand-emerald">{formatVND(court.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-2xl p-2 border border-dashed border-slate-250 flex flex-col gap-1.5 select-none">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Simulator duyệt (Dev)</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => onSimulateStatus(court.id, 'APPROVED')}
                        className={`flex-1 py-1 rounded text-[9px] font-black cursor-pointer transition-all border ${court.status === 'APPROVED' ? 'bg-emerald-50 text-brand-emerald border-brand-emerald/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-150'}`}
                      >
                        Duyệt
                      </button>
                      <button 
                        onClick={() => onSimulateStatus(court.id, 'PENDING')}
                        className={`flex-1 py-1 rounded text-[9px] font-black cursor-pointer transition-all border ${court.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-250' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-150'}`}
                      >
                        Chờ
                      </button>
                      <button 
                        onClick={() => onSimulateStatus(court.id, 'REJECTED')}
                        className={`flex-1 py-1 rounded text-[9px] font-black cursor-pointer transition-all border ${court.status === 'REJECTED' ? 'bg-red-50 text-red-655 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-150'}`}
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>

                  {court.status === 'APPROVED' ? (
                    <button
                      onClick={() => onOpenDetail(court, false)}
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11px] py-2.5 rounded-2xl active:scale-98 transition-all cursor-pointer border border-slate-200"
                    >
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Chỉnh sửa chi tiết
                    </button>
                  ) : court.status === 'PENDING' ? (
                    <button
                      onClick={() => onOpenDetail(court, true)}
                      className="w-full flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-[11px] py-2.5 rounded-2xl active:scale-98 transition-all cursor-pointer border border-amber-200"
                    >
                      <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Xem đơn đăng ký
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenDetail(court, true)}
                      className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-655 font-extrabold text-[11px] py-2.5 rounded-2xl active:scale-98 transition-all cursor-pointer border border-red-200"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Xem lý do từ chối
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
