import React, { useState } from 'react';
import type { VenueInfo, SubCourt, CourtPriceRuleRequest } from '../types';
import { useToast } from '../../../components/ui/Toast';

interface VenueCourtsStepProps {
  venueInfo: VenueInfo;
  onVenueInfoChange: (val: VenueInfo) => void;
  courts: SubCourt[];
  onCourtsChange: (val: SubCourt[]) => void;
  isLoading: boolean;
}

export const VenueCourtsStep = ({
  venueInfo,
  onVenueInfoChange,
  courts,
  onCourtsChange,
  isLoading
}: VenueCourtsStepProps) => {
  const { showToast } = useToast();
  
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtPrice, setNewCourtPrice] = useState('100000');

  const SPORT_OPTIONS = [
    { 
      id: 'football', 
      name: 'Bóng đá', 
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-9h3V8H8v3zm5-3h3v3h-3V8zm-5 5h3v3H8v-3zm5 3v-3h3v3h-3z" />
        </svg>
      ),
      bgClass: "hover:border-emerald-500 hover:bg-emerald-50/20",
      activeClass: "border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-xs"
    },
    { 
      id: 'badminton', 
      name: 'Cầu lông', 
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4.5 20.29c-.21.52.17 1.09.73 1.09h13.54c.56 0 .94-.57.73-1.09L12 2zm0 4l5.34 13H6.66L12 6z" />
        </svg>
      ),
      bgClass: "hover:border-orange-500 hover:bg-orange-50/20",
      activeClass: "border-orange-500 bg-orange-50/30 text-orange-700 shadow-xs"
    },
    { 
      id: 'pickleball', 
      name: 'Pickleball', 
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-4 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm2 9a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm4 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm2-4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-2-5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
        </svg>
      ),
      bgClass: "hover:border-sky-500 hover:bg-sky-50/20",
      activeClass: "border-sky-500 bg-sky-50/30 text-sky-700 shadow-xs"
    },
    { 
      id: 'basketball', 
      name: 'Bóng rổ', 
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2zm-2 4a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      ),
      bgClass: "hover:border-amber-500 hover:bg-amber-50/20",
      activeClass: "border-amber-500 bg-amber-50/30 text-amber-700 shadow-xs"
    }
  ];

  const handleAddCourt = () => {
    if (!newCourtName.trim()) {
      showToast('warning', 'Vui lòng nhập tên sân');
      return;
    }

    const priceNum = parseFloat(newCourtPrice);
    if (!newCourtPrice || isNaN(priceNum) || priceNum <= 0) {
      showToast('warning', 'Giá thuê sân phải là số lớn hơn 0');
      return;
    }

    if (courts.some(c => c.name.toLowerCase() === newCourtName.trim().toLowerCase())) {
      showToast('warning', 'Tên sân đã tồn tại');
      return;
    }

    const newCourt: SubCourt = {
      name: newCourtName.trim(),
      price: priceNum,
      status: 'ACTIVE',
      priceRules: []
    };

    onCourtsChange([...courts, newCourt]);
    setNewCourtName('');
    showToast('success', `Đã thêm ${newCourt.name} vào danh sách`);
  };

  const handleRemoveCourt = (index: number) => {
    const courtName = courts[index].name;
    onCourtsChange(courts.filter((_, i) => i !== index));
    showToast('info', `Đã xóa ${courtName}`);
  };

  const formatVND = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VND';
  };

  return (
    <div className="flex-grow overflow-y-auto px-8 py-6 space-y-6 select-none w-full max-w-4xl mx-auto font-sans animate-fadeIn">
      <div className="space-y-1">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bước 2: Dịch vụ & Sân trực thuộc</h3>
        <p className="text-[10px] text-slate-400 font-semibold leading-normal">
          Chọn bộ môn thể thao chính và khai báo danh sách các sân bãi lẻ trực thuộc cụm sân này.
        </p>
      </div>

      {/* ① Chọn môn thể thao */}
      <div className="space-y-3">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
          Môn thể thao chính
        </label>
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          {SPORT_OPTIONS.map(opt => {
            const isSelected = venueInfo.sportId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onVenueInfoChange({ ...venueInfo, sportId: opt.id })}
                className={`border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-95 ${
                  isSelected ? opt.activeClass : `border-slate-100 bg-white text-slate-500 ${opt.bgClass}`
                }`}
              >
                {opt.icon}
                <span className="text-[11px] font-black tracking-wider uppercase">{opt.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-px bg-slate-100 my-4" />

      {/* ② Form thêm sân */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 border border-slate-100 rounded-3xl p-5 shadow-xs ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="md:col-span-3 space-y-0.5">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Đăng ký sân lẻ</h4>
          <p className="text-[9px] text-slate-400 font-bold">Thêm các sân lẻ thuộc cụm sân và đặt giá thuê cơ bản.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Tên sân</label>
          <input
            type="text"
            placeholder="Ví dụ: Sân 1, Sân A"
            value={newCourtName}
            onChange={e => setNewCourtName(e.target.value)}
            disabled={isLoading}
            className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-emerald-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giá thuê cơ bản (VND / ca)</label>
          <input
            type="number"
            placeholder="Ví dụ: 100000"
            value={newCourtPrice}
            onChange={e => setNewCourtPrice(e.target.value)}
            disabled={isLoading}
            className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-emerald-100"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleAddCourt}
            disabled={isLoading}
            className="w-full bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow-md border-b-2 border-emerald-950 disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Thêm sân lẻ
          </button>
        </div>
      </div>

      {/* ③ Danh sách sân trực thuộc */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
            Danh sách sân đã khai báo ({courts.length})
          </label>
        </div>

        {courts.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-400 font-semibold bg-white shadow-2xs">
            Chưa có sân nào được thêm. Vui lòng thêm ít nhất một sân ở form phía trên.
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {courts.map((court, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-brand-emerald">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">{court.name}</h5>
                    <p className="text-[10px] text-brand-emerald font-extrabold">{formatVND(court.price)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveCourt(index)}
                  className="p-2 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 hover:text-red-700 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-2xs"
                  title="Xóa sân này"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
