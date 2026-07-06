import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Dropdown } from '../../../components/ui/Dropdown';
import { MOCK_FACILITIES, formatPrice } from './mockData';
import { useBookingMatrix } from '../hooks/useBookingMatrix';

export const DesktopBookingGrid = () => {
  const {
    times,
    searchTerm,
    setSearchTerm,
    selectedCourtType,
    setSelectedCourtType,
    currentDate,
    isBookingModalOpen,
    setIsBookingModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    showKpis,
    setShowKpis,
    quickBookingData,
    setQuickBookingData,
    selectedBookingDetail,
    filteredFacilities,
    kpis,
    getCellStyle,
    handlePrevDay,
    handleNextDay,
    handleToday,
    handleCellClick,
    handleQuickBookingSubmit,
    handleCancelBooking,
    getBlockSpan,
    isInsideBlock,
    handleConfirmDeposit
  } = useBookingMatrix();

  return (
    <div className="w-full flex flex-col gap-5 min-h-0">
      
      {/* ─── STYLE ĐỊNH NGHĨA SỌC BẢO TRÌ & SCROLLBAR ──────────────── */}
      <style>{`
        .bg-stripes-red {
          background-image: repeating-linear-gradient(45deg, #fee2e2, #fee2e2 8px, #fecaca 8px, #fecaca 16px);
        }
        .matrix-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .matrix-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
        .matrix-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 999px; border: 2px solid #f1f5f9; }
        .matrix-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        .matrix-scroll::-webkit-scrollbar-corner { background: #f1f5f9; }
        .matrix-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f5f9; }
      `}</style>

      {/* ─── 1. THẺ THỐNG KÊ KPI CARDS ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-300 overflow-hidden">
        {/* Toggleable Header */}
        <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-4 select-none">
          {showKpis ? (
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
              Báo cáo hiệu suất hoạt động hôm nay
            </h3>
          ) : (
            <div className="flex items-center gap-6 text-xs text-slate-500 font-bold">
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Tỷ lệ lấp đầy: <span className="text-slate-800 font-black">{kpis.occupancyRate}%</span>
              </span>
              <span className="w-px h-3.5 bg-slate-200"></span>
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Doanh thu hôm nay: <span className="text-slate-800 font-black">{formatPrice(kpis.totalRevenue)}</span>
              </span>
              <span className="w-px h-3.5 bg-slate-200"></span>
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9m1.414-1.414A2 2 0 1114 3.586V5h-3.586M9 11h6m-6 4h6" />
                </svg>
                Lượt đặt sân: <span className="text-slate-800 font-black">{kpis.bookingBlockCount} lượt</span>
              </span>
              <span className="w-px h-3.5 bg-slate-200"></span>
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Sân hoạt động: <span className="text-slate-800 font-black">{kpis.activeCourtsText} sân</span>
              </span>
            </div>
          )}
          <button 
            onClick={() => setShowKpis(!showKpis)}
            className="flex items-center gap-1.5 text-xs font-black text-brand-emerald hover:text-emerald-950 transition-colors focus:outline-none"
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showKpis ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
            {showKpis ? 'Thu gọn thống kê' : 'Chi tiết thống kê'}
          </button>
        </div>

        {/* Collapsible Cards Grid Container */}
        <div 
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            showKpis ? 'max-h-[300px] opacity-100 border-t border-slate-100 p-5 bg-slate-50/30' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI: Tỷ lệ lấp đầy */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ lấp đầy</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-brand-emerald">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{kpis.occupancyRate}%</div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-brand-emerald h-full rounded-full" style={{ width: `${kpis.occupancyRate}%` }}></div>
                </div>
              </div>
            </div>

            {/* KPI: Doanh thu dự kiến */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh thu hôm nay</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{formatPrice(kpis.totalRevenue)}</div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Tăng 12% so với hôm qua
                </span>
              </div>
            </div>

            {/* KPI: Tổng lượt đặt */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng lượt đặt</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9m1.414-1.414A2 2 0 1114 3.586V5h-3.586M9 11h6m-6 4h6" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{kpis.bookingBlockCount} lượt</div>
                <span className="text-[10px] text-slate-400 font-medium block mt-2">Đã tối ưu hóa lịch trống</span>
              </div>
            </div>

            {/* KPI: Sân đang hoạt động */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sân hoạt động</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{kpis.activeCourtsText} sân</div>
                <span className="text-[10px] text-slate-400 font-medium block mt-2">Sẵn sàng phục vụ khách</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. THANH BỘ LỌC FILTER TOOLBAR ──────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/85 shadow-[0_4px_18px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Ô Tìm kiếm khách hàng */}
          <div className="relative">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm khách đặt sân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald w-56 font-medium placeholder-slate-400 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Lọc Loại Sân */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200/50">
            {['all', '5v5', '7v7', '11v11'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedCourtType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCourtType === type ? 'bg-white text-brand-emerald shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type === 'all' ? 'Tất cả sân' : `Sân ${type.replace('v', ' đấu ')}`}
              </button>
            ))}
          </div>
        </div>

        {/* Chọn ngày & Nút đặt nhanh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button onClick={handlePrevDay} className="px-3 py-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={handleToday} className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border-x border-slate-200 hover:bg-slate-50 transition-colors">
              {currentDate}
            </button>
            <button onClick={handleNextDay} className="px-3 py-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-emerald text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-950 hover:shadow-md active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Đặt sân nhanh
          </button>
        </div>
      </div>

      {/* ─── 3. BẢNG MA TRẬN ĐẶT SÂN ───────────────────────── */}
      <div className="matrix-scroll overflow-x-auto overflow-y-visible rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] select-none">
        <table className="border-collapse w-full">
          <thead>
            <tr className="sticky top-0 z-30">
              <th
                style={{ position: 'sticky', left: 0, zIndex: 40, minWidth: 160 }}
                className="h-12 bg-slate-900 text-white text-xs font-black uppercase tracking-wider border-b border-r border-slate-800/80 text-center"
              >
                Sân bóng
              </th>
              
              {times.map((time) => {
                const isHour = time.endsWith(':00');
                return (
                  <th
                    key={time}
                    style={{ minWidth: 84 }}
                    className={`h-12 text-[11px] font-extrabold tracking-wider px-1 border-b text-center border-slate-800/20 ${
                      isHour
                        ? 'bg-slate-900 text-brand-yellow border-r border-r-slate-500'
                        : 'bg-slate-800 text-slate-300 border-r border-r-slate-700'
                    }`}
                  >
                    {time}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredFacilities.map((facility) => (
              <tr key={facility.id} className="group/row hover:bg-slate-50/30">
                <td
                  style={{ position: 'sticky', left: 0, zIndex: 20, minWidth: 160 }}
                  className="h-13 bg-slate-900 text-white border-b border-r border-slate-800/80 shadow-[4px_0_12px_rgba(0,0,0,0.1)] text-center"
                >
                  <div className="flex flex-col items-center justify-center px-3">
                    <span className="text-sm font-black text-slate-100">{facility.name}</span>
                    <span className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider mt-0.5">{facility.type}</span>
                  </div>
                </td>

                {times.map((time, colIdx) => {
                  const slot = useBookingMatrix().slots.find(s => s.facilityId === facility.id && s.time === time);
                  const status = slot?.status || 'available';
                  const isHourBorder = time.endsWith(':00');

                  if (isInsideBlock(facility.id, time, status, slot?.customerName)) {
                    return null;
                  }

                  const span = status !== 'available' ? getBlockSpan(facility.id, colIdx, status, slot?.customerName) : 1;

                  return (
                    <td
                      key={`${facility.id}-${time}`}
                      colSpan={span}
                      onClick={() => handleCellClick(facility.id, time, status)}
                      style={{ minWidth: span > 1 ? undefined : 84 }}
                      className={`h-13 p-0 border-b border-slate-200/70 transition-all ${
                        isHourBorder ? 'border-l-2 border-l-slate-400/80' : ''
                      } ${status === 'available' ? 'border-r border-r-slate-350' : ''}`}
                    >
                      {status === 'available' ? (
                        <div className={`h-full w-full flex items-center justify-center ${getCellStyle(status)} group`}>
                          <span className="w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500/0 text-emerald-600 font-black text-base opacity-0 group-hover:opacity-100 group-hover:bg-emerald-500/10 transition-all duration-150">
                            +
                          </span>
                        </div>
                      ) : (
                        <div className={`h-10 mx-1 rounded-xl flex items-center justify-between px-3 gap-2 shadow-sm ${getCellStyle(status)}`}>
                          <div className="flex items-center gap-1.5 min-w-0">
                            {status === 'booked' && (
                              <svg className="w-3.5 h-3.5 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                            {status === 'pending' && (
                              <svg className="w-3.5 h-3.5 text-amber-950/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {status === 'matchmaking' && (
                              <svg className="w-3.5 h-3.5 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            )}
                            {status === 'maintenance' && (
                              <svg className="w-3.5 h-3.5 text-red-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
                              </svg>
                            )}
                            <span className="text-xs font-bold truncate">
                              {status === 'matchmaking' 
                                ? `Xé vé: ${slot?.customerName || 'Trận ghép'} (${slot?.maxPlayers}ng - ${slot?.skillLevel})`
                                : (slot?.customerName || (status === 'maintenance' ? 'BẢO TRÌ' : ''))}
                            </span>
                          </div>
                          <span className="text-[9px] font-extrabold opacity-75 whitespace-nowrap bg-black/10 px-1.5 py-0.5 rounded">
                            {span * 30}p
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── 4. MODAL: ĐẶT SÂN NHANH ───────────────────────────────── */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Đặt sân bóng nhanh" maxWidth="md">
        <form onSubmit={handleQuickBookingSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chọn Sân</label>
            <Dropdown
              options={MOCK_FACILITIES.map(f => ({
                value: f.id,
                label: `${f.name} (${f.type} - ${formatPrice(f.pricePerHour)}/h)`
              }))}
              value={quickBookingData.facilityId}
              onChange={(val) => setQuickBookingData({...quickBookingData, facilityId: val})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loại giờ</label>
            <Dropdown
              options={[
                { value: 'regular', label: 'Giờ thường' },
                { value: 'matchmaking', label: 'Xé vé' }
              ]}
              value={quickBookingData.bookingType}
              onChange={(val) => setQuickBookingData({...quickBookingData, bookingType: val as 'regular' | 'matchmaking'})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên khách hàng / Tên giải</label>
            <input
              type="text"
              placeholder="Nhập tên khách..."
              value={quickBookingData.customerName}
              onChange={(e) => setQuickBookingData({...quickBookingData, customerName: e.target.value})}
              disabled={quickBookingData.status === 'maintenance' && quickBookingData.bookingType !== 'matchmaking'}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald disabled:bg-slate-100"
            />
          </div>

          {quickBookingData.bookingType === 'matchmaking' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/50">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Số lượng người tối đa</label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={quickBookingData.maxPlayers}
                  onChange={(e) => setQuickBookingData({...quickBookingData, maxPlayers: parseInt(e.target.value) || 10})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Trình độ yêu cầu</label>
                <Dropdown
                  options={[
                    { value: 'Yếu', label: 'Yếu' },
                    { value: 'Trung bình yếu', label: 'Trung bình yếu' },
                    { value: 'Trung bình khá', label: 'Trung bình khá' },
                    { value: 'Khá', label: 'Khá' },
                    { value: 'Bán chuyên', label: 'Bán chuyên' },
                    { value: 'Chuyên nghiệp', label: 'Chuyên nghiệp' }
                  ]}
                  value={quickBookingData.skillLevel}
                  onChange={(val) => setQuickBookingData({...quickBookingData, skillLevel: val})}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giờ bắt đầu</label>
              <Dropdown
                options={times.map(t => ({ value: t, label: t }))}
                value={quickBookingData.startTime}
                onChange={(val) => setQuickBookingData({...quickBookingData, startTime: val})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giờ kết thúc</label>
              <Dropdown
                options={times.map(t => ({ value: t, label: t }))}
                value={quickBookingData.endTime}
                onChange={(val) => setQuickBookingData({...quickBookingData, endTime: val})}
              />
            </div>
          </div>

          {quickBookingData.bookingType === 'regular' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Trạng thái đặt</label>
              <div className="grid grid-cols-3 gap-2">
                {['booked', 'pending', 'maintenance'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setQuickBookingData({
                      ...quickBookingData,
                      status: st as any,
                      customerName: st === 'maintenance' ? '' : quickBookingData.customerName
                    })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      quickBookingData.status === st 
                        ? st === 'booked' ? 'bg-brand-emerald text-white border-brand-emerald'
                          : st === 'pending' ? 'bg-amber-400 text-amber-950 border-amber-400'
                          : 'bg-red-500 text-white border-red-500'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'booked' ? 'Đã đặt' : st === 'pending' ? 'Đang giữ' : 'Bảo trì'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button type="submit" className="w-full bg-brand-emerald hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl text-xs transition-colors">
              Xác nhận đặt lịch
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── 5. MODAL: CHI TIẾT ĐẶT SÂN ─────────────────────────────── */}
      <Modal isOpen={isDetailModalOpen && !!selectedBookingDetail} onClose={() => setIsDetailModalOpen(false)} title="Thông tin lịch đặt" maxWidth="sm">
        {selectedBookingDetail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedBookingDetail.status === 'booked' ? 'bg-emerald-600 text-white' :
                selectedBookingDetail.status === 'pending' ? 'bg-amber-400 text-amber-950' :
                selectedBookingDetail.status === 'matchmaking' ? 'bg-indigo-600 text-white bg-gradient-to-br from-indigo-600 to-purple-600' :
                'bg-red-500 text-white'
              }`}>
                {selectedBookingDetail.status === 'booked' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                {selectedBookingDetail.status === 'pending' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {selectedBookingDetail.status === 'matchmaking' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                {selectedBookingDetail.status === 'maintenance' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">{selectedBookingDetail.customerName}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 inline-block ${
                  selectedBookingDetail.status === 'booked' ? 'bg-emerald-100 text-emerald-800' :
                  selectedBookingDetail.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  selectedBookingDetail.status === 'matchmaking' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedBookingDetail.status === 'booked' ? 'Đã đặt' : selectedBookingDetail.status === 'pending' ? 'Đang giữ' : selectedBookingDetail.status === 'matchmaking' ? 'Xé vé' : 'Bảo trì'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-400">Sân bóng</span>
                <span className="font-black text-slate-800">{selectedBookingDetail.facility.name} ({selectedBookingDetail.facility.type})</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-400">Thời gian</span>
                <span className="font-black text-brand-emerald">{selectedBookingDetail.startTime} – {selectedBookingDetail.endTime}</span>
              </div>
              {selectedBookingDetail.status === 'matchmaking' && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-400">Số lượng người tối đa</span>
                    <span className="font-black text-slate-800">{selectedBookingDetail.maxPlayers || 10} người</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-400">Trình độ yêu cầu</span>
                    <span className="font-black text-indigo-600">{selectedBookingDetail.skillLevel || 'Chưa cập nhật'}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-400">Giá thuê</span>
                <span className="font-bold text-slate-700">{formatPrice(selectedBookingDetail.facility.pricePerHour)}/h</span>
              </div>
              {selectedBookingDetail.status !== 'maintenance' && (
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-slate-400">Tổng tạm tính</span>
                  <span className="font-black text-slate-800 text-sm">{formatPrice(selectedBookingDetail.price)}</span>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              {selectedBookingDetail.status === 'pending' && (
                <button onClick={handleConfirmDeposit} className="w-full bg-brand-emerald hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl text-xs transition-colors">
                  Xác nhận đã đặt cọc
                </button>
              )}
              <button onClick={handleCancelBooking} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-xs transition-colors">
                {selectedBookingDetail.status === 'maintenance' ? 'Hủy lịch bảo trì' : 'Hủy lịch đặt sân này'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
