import React from 'react';
import type { CourtResponse } from '../../types';

interface OperationsFacilitiesTabProps {
  activeCourts: CourtResponse[];
  selectedCourtIds: string[];
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectCourt: (id: string) => void;
  handleOpenEditCourt: (court: CourtResponse) => void;
  getCourtDetails: (court: CourtResponse) => {
    name: string;
    price: number;
    surcharge: number;
    liveStatus: string;
    occupancy: number;
    performanceRevenue: number;
    isMaintenance: boolean;
  };
  formatVND: (n: number) => string;
  isMobile?: boolean;
}

export const OperationsFacilitiesTab = ({
  activeCourts,
  selectedCourtIds,
  handleSelectAll,
  handleSelectCourt,
  handleOpenEditCourt,
  getCourtDetails,
  formatVND,
  isMobile = false
}: OperationsFacilitiesTabProps) => {
  if (isMobile) {
    return (
      <div className="space-y-4 pb-20">
        <div className="flex justify-between items-center bg-white border border-slate-200/60 p-3.5 rounded-2xl select-none">
          <span className="text-xs font-black text-slate-700">Danh sach san ({activeCourts.length})</span>
          <button
            onClick={() => {
              if (selectedCourtIds.length === activeCourts.length) {
                // Deselect all
                activeCourts.forEach(c => {
                  if (selectedCourtIds.includes(c.id)) {
                    handleSelectCourt(c.id);
                  }
                });
              } else {
                // Select all
                activeCourts.forEach(c => {
                  if (!selectedCourtIds.includes(c.id)) {
                    handleSelectCourt(c.id);
                  }
                });
              }
            }}
            className="text-[10px] font-black text-brand-emerald hover:underline cursor-pointer"
          >
            {selectedCourtIds.length === activeCourts.length ? 'Bo chon tat ca' : 'Chon tat ca'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {activeCourts.map(court => {
            const details = getCourtDetails(court);
            const isSelected = selectedCourtIds.includes(court.id);
            return (
              <div key={court.id}
                className={`bg-white border rounded-3xl p-4 shadow-sm space-y-3 transition-all relative ${isSelected ? 'border-brand-emerald ring-2 ring-brand-emerald/10' : 'border-slate-200/60'}`}>
                <div className="absolute top-4 right-4 z-10">
                  <input type="checkbox" checked={isSelected} onChange={() => handleSelectCourt(court.id)}
                    className="w-4 h-4 rounded text-brand-emerald border-slate-305 focus:ring-brand-emerald cursor-pointer" />
                </div>
                <div className="space-y-1 pr-6 select-none">
                  <h4 className="font-black text-slate-800 text-sm">{details.name}</h4>
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[9px] bg-slate-100 border text-slate-550 px-2 py-0.5 rounded font-black uppercase">{court.sportName}</span>
                    {details.surcharge > 0 && (
                      <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-black">+{formatVND(details.surcharge)}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold border-t border-b border-slate-100 py-2.5 select-none">
                  <div className="space-y-1">
                    <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Trang thai</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md border text-[9px] font-black uppercase ${
                      details.liveStatus === 'AVAILABLE'  ? 'bg-emerald-50 text-brand-emerald border-emerald-100' :
                      details.liveStatus === 'IN_USE'     ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      details.liveStatus === 'MAINTENANCE'? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-red-50 text-red-500 border-red-100'
                    }`}>
                      {details.liveStatus === 'AVAILABLE' ? 'Trong' : details.liveStatus === 'IN_USE' ? 'Dang co khach' : details.liveStatus === 'MAINTENANCE' ? 'Bao tri' : 'Dong cua'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Ti le lap day</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-700">{details.occupancy}%</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${details.occupancy > 75 ? 'bg-brand-emerald' : details.occupancy > 50 ? 'bg-blue-550' : 'bg-slate-400'}`}
                          style={{ width: `${details.occupancy}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-extrabold select-none">
                  <div>
                    <span className="text-slate-400 text-[8px] block uppercase">Doanh thu/ngay</span>
                    <span className="text-brand-emerald font-black">{formatVND(details.performanceRevenue)}</span>
                  </div>
                  <button onClick={() => handleOpenEditCourt(court)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] rounded-xl border border-slate-200 cursor-pointer">
                    Cau hinh
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="pb-24">
      {activeCourts.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-450 font-bold">
          Chua co san nao duoc cau hinh trong cum san nay.
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3.5 pl-2 w-10">
                <input type="checkbox"
                  checked={selectedCourtIds.length === activeCourts.length && activeCourts.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-brand-emerald border-slate-300 focus:ring-brand-emerald cursor-pointer" />
              </th>
              <th className="py-3.5">Tên sân bãi</th>
              <th className="py-3.5">Trạng thái hoạt động</th>
              <th className="py-3.5">Tỷ lệ lấp đầy</th>
              <th className="py-3.5">Hiệu quả vận hành</th>
              <th className="py-3.5 pr-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
            {activeCourts.map(court => {
              const details = getCourtDetails(court);
              const isSelected = selectedCourtIds.includes(court.id);
              return (
                <tr key={court.id}
                  className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-emerald-50/20' : ''}`}>
                  <td className="py-4 pl-2">
                    <input type="checkbox" checked={isSelected} onChange={() => handleSelectCourt(court.id)}
                      className="w-4 h-4 rounded text-brand-emerald border-slate-300 focus:ring-brand-emerald cursor-pointer" />
                  </td>
                  <td className="py-4">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-800 text-xs">{details.name}</span>
                      <div className="flex gap-2 items-center">
                        <span className="text-[9px] bg-slate-100 border text-slate-500 px-1.5 py-0.5 rounded leading-none select-none">{court.sportName}</span>
                        {details.surcharge > 0 && (
                          <span className="text-[9px] bg-amber-50 border border-amber-200 text-amber-600 px-1.5 py-0.5 rounded leading-none select-none">
                            + Phu thu: {formatVND(details.surcharge)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 select-none">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md border text-[9px] font-black uppercase ${
                      details.liveStatus === 'AVAILABLE'   ? 'bg-emerald-50 text-brand-emerald border-emerald-100' :
                      details.liveStatus === 'IN_USE'      ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      details.liveStatus === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-red-50 text-red-655 border-red-100'
                    }`}>
                      {details.liveStatus === 'AVAILABLE' ? 'Trong' :
                       details.liveStatus === 'IN_USE'    ? 'Dang co khach' :
                       details.liveStatus === 'MAINTENANCE' ? 'Bao tri' : 'Dong cua'}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 max-w-[130px] select-none">
                      <span className="font-extrabold text-slate-700 w-8">{details.occupancy}%</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full ${details.occupancy > 75 ? 'bg-brand-emerald' : details.occupancy > 50 ? 'bg-blue-500' : 'bg-slate-400'}`}
                          style={{ width: `${details.occupancy}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 select-none">
                    <div className="space-y-0.5">
                      <span className="text-slate-700 font-extrabold">{formatVND(details.performanceRevenue)}</span>
                      <span className="block text-[9px] text-slate-400 font-bold font-mono">ID: {court.id.substring(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="py-4 pr-2 text-right select-none">
                    <button onClick={() => handleOpenEditCourt(court)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] rounded-xl transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer ml-auto">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Cấu hình
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
