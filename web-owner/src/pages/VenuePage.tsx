import React, { useState, useEffect } from 'react';
import { courtService } from '../services/courtService';
import type { VenueResponse, CourtResponse } from '../services/courtService';
import { Modal } from '../components/ui/Modal';

export const VenuePage = () => {
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats Toggle State
  const [showStats, setShowStats] = useState(() => {
    const saved = localStorage.getItem('showFacilityStats');
    return saved !== 'false';
  });

  // Modal States
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [venueName, setVenueName] = useState('');
  const [venueLocation, setVenueLocation] = useState('');
  const [venueDescription, setVenueDescription] = useState('');
  const [venueValidationErrors, setVenueValidationErrors] = useState<Record<string, string>>({});
  
  // Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedVenues, fetchedCourts] = await Promise.all([
        courtService.getVenues(),
        courtService.getCourts()
      ]);
      setVenues(fetchedVenues);
      setCourts(fetchedCourts);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Không thể kết nối API hệ thống. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleStats = () => {
    localStorage.setItem('showFacilityStats', (!showStats).toString());
    setShowStats(!showStats);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const validateVenue = (): boolean => {
    const errors: Record<string, string> = {};
    if (!venueName.trim()) {
      errors.name = 'Tên cụm sân không được để trống';
    }
    if (!venueLocation.trim()) {
      errors.location = 'Địa chỉ cụm sân không được để trống';
    }

    setVenueValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenVenueCreate = () => {
    setVenueName('');
    setVenueLocation('');
    setVenueDescription('');
    setVenueValidationErrors({});
    setIsVenueModalOpen(true);
  };

  const handleSubmitVenue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateVenue()) return;

    try {
      const created = await courtService.createVenue({
        name: venueName,
        location: venueLocation,
        description: venueDescription
      });
      setVenues(prev => [...prev, created]);
      showToast('success', 'Thêm cụm sân mới thành công!');
      setIsVenueModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'Không thể tạo cụm sân');
    }
  };

  // Calculations
  const totalVenues = venues.length;
  const totalCourts = courts.length;
  const activeCourts = courts.filter(c => c.status === 'APPROVED').length;

  return (
    <div className="flex flex-col flex-1 min-h-0 relative font-sans animate-fadeIn">
      {/* Toast Banner */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-xs font-black text-white flex items-center gap-3 border border-white/10 select-none animate-fadeIn ${
            toast.type === 'success' ? 'bg-emerald-600 shadow-emerald-950/20' : 'bg-red-600 shadow-red-950/20'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {toast.message}
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6 select-none">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Quản lý cụm sân</h1>
          <p className="text-xs text-slate-400 font-bold mt-0.5">Quản lý các cơ sở thể thao tập trung của bạn</p>
        </div>
        <button 
          onClick={toggleStats}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
        >
          {showStats ? (
            <>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
              <span>Ẩn thống kê</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Hiện thống kê</span>
            </>
          )}
        </button>
      </div>

      {/* TOP STATS DISPLAY */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 select-none animate-fadeIn">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng số cụm sân</p>
              <h3 className="text-2xl font-black text-slate-800">{totalVenues}</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Tổng số sân nhỏ</p>
              <h3 className="text-2xl font-black text-brand-emerald">{totalCourts}</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Sân đang hoạt động</p>
              <h3 className="text-2xl font-black text-emerald-600">{activeCourts}</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-650 rounded-3xl p-5 text-xs font-bold text-center mb-6">
          {error}
        </div>
      )}

      {/* LOADER & LIST CONTENT */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold">Đang tải dữ liệu từ máy chủ...</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* VENUE HEADER AND ADD BUTTON */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-4 mb-6 shadow-xs flex items-center justify-between select-none">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Danh sách cụm sân</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Danh sách các địa điểm thể thao trực thuộc tài khoản của bạn</p>
            </div>
            <button
              onClick={handleOpenVenueCreate}
              className="bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 whitespace-nowrap border-b-2 border-emerald-950"
            >
              <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Thêm cụm sân mới
            </button>
          </div>

          {/* VENUES GRID LIST */}
          {venues.length === 0 ? (
            <div className="flex-1 bg-white border border-slate-200/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-sm select-none">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Không có cụm sân nào</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Tài khoản của bạn chưa đăng ký cụm sân nào. Hãy thêm cụm sân đầu tiên để quản lý dễ dàng hơn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pr-1">
              {venues.map(venue => {
                const venueCourts = courts.filter(c => c.venueId === venue.id);
                return (
                  <div 
                    key={venue.id}
                    className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[200px]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-black text-slate-800 text-sm tracking-tight truncate flex-1 pr-2">{venue.name}</h4>
                        <span className="text-[9px] font-black text-brand-emerald bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {venueCourts.length} sân bãi
                        </span>
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

                    <div className="text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-3 flex justify-between select-none">
                      <span>Cơ sở Sporta Owner Portal</span>
                      <span>ID: {venue.id.substring(0, 8)}...</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PORTAL-BASED MODAL: VENUE CREATE */}
      <Modal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
        title="Thêm cụm sân mới"
        maxWidth="md"
        footer={
          <>
            <button 
              type="button" 
              onClick={() => setIsVenueModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
            >
              Hủy
            </button>
            <button 
              type="button"
              onClick={() => handleSubmitVenue()}
              className="bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer border-b-2 border-emerald-950"
            >
              Tạo cụm sân
            </button>
          </>
        }
      >
        <form onSubmit={(e) => handleSubmitVenue(e)} className="space-y-4">
          {/* Venue Name */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
              Tên cụm sân <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="VD: Cụm Sân Ba Đình"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 ${
                venueValidationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
              }`}
            />
            {venueValidationErrors.name && (
              <p className="text-[9px] text-red-500 font-bold">{venueValidationErrors.name}</p>
            )}
          </div>

          {/* Venue Location */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
              Địa chỉ chi tiết cụm sân <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="VD: 34 Hoàng Hoa Thám, Ba Đình, Hà Nội"
              value={venueLocation}
              onChange={(e) => setVenueLocation(e.target.value)}
              className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 ${
                venueValidationErrors.location ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
              }`}
            />
            {venueValidationErrors.location && (
              <p className="text-[9px] text-red-500 font-bold">{venueValidationErrors.location}</p>
            )}
          </div>

          {/* Venue Description */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giới thiệu cụm sân</label>
            <textarea 
              placeholder="Mô tả các môn thể thao hỗ trợ hoặc cơ sở hạ tầng..."
              value={venueDescription}
              onChange={(e) => setVenueDescription(e.target.value)}
              className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald h-24 resize-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
