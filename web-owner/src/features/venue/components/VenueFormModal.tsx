import React from 'react';
import { Modal } from '../../../components/ui/Modal';

interface VenueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  title: string;
  name: string;
  setName: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
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
  description,
  setDescription,
  validationErrors = {},
  submitLabel
}: VenueFormModalProps) => {
  return (
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
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
            Địa chỉ chi tiết cụm sân <span className="text-red-500">*</span>
          </label>
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
  );
};
