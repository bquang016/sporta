import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { LocationPickerMap } from './LocationPickerMap';

interface VenueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  title: string;
  name: string;
  setName: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  latitude?: number;
  setLatitude?: (val: number) => void;
  longitude?: number;
  setLongitude?: (val: number) => void;
  description: string;
  setDescription: (val: string) => void;
  validationErrors?: Record<string, string>;
  submitLabel: string;
}

export const VenueFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  name,
  setName,
  location,
  setLocation,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  description,
  setDescription,
  validationErrors = {},
  submitLabel
}: VenueFormModalProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => onSubmit()}
              className="bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer border-b-2 border-emerald-950"
            >
              {submitLabel}
            </button>
          </>
        }
      >
        <form onSubmit={e => onSubmit(e)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
              Tên cụm sân <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Cụm Sân Ba Đình"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 ${
                validationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
              }`}
            />
            {validationErrors.name && (
              <p className="text-[9px] text-red-500 font-bold">{validationErrors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Địa chỉ chi tiết cụm sân <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="text-[9px] font-black text-brand-emerald hover:text-emerald-700 uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95 transition-all focus:outline-none bg-slate-50 hover:bg-emerald-50 px-2 py-1 rounded-lg border border-slate-100"
              >
                🗺️ Chọn từ bản đồ
              </button>
            </div>
            <input
              type="text"
              placeholder="VD: 34 Hoàng Hoa Thám, Ba Đình, Hà Nội"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 ${
                validationErrors.location ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
              }`}
            />
            {validationErrors.location && (
              <p className="text-[9px] text-red-500 font-bold">{validationErrors.location}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giới thiệu cụm sân</label>
            <textarea
              placeholder="Mô tả các môn thể thao hỗ trợ hoặc cơ sở hạ tầng..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald h-24 resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Embedded Location Picker Map Sub-Modal */}
      {isMapOpen && (
        <Modal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          title="Chọn vị trí cụm sân trên bản đồ"
          maxWidth="lg"
        >
          <div className="p-1">
            <LocationPickerMap
              initialLocation={{
                lat: latitude || 0,
                lng: longitude || 0
              }}
              initialAddress={location}
              onClose={() => setIsMapOpen(false)}
              onChange={(data) => {
                setLocation(data.address);
                if (setLatitude) setLatitude(data.lat);
                if (setLongitude) setLongitude(data.lng);
                setIsMapOpen(false);
              }}
            />
          </div>
        </Modal>
      )}
    </>
  );
};
