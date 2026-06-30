import React from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Dropdown } from '../../../../components/ui/Dropdown';
import type { DropdownOption } from '../../../../components/ui/Dropdown';

interface CourtConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  name: string;
  setName: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  opStatus: 'ACTIVE' | 'MAINTENANCE';
  setOpStatus: (val: 'ACTIVE' | 'MAINTENANCE') => void;
  formatVND: (amount: number) => string;
}

export const CourtConfigModal = ({
  isOpen,
  onClose,
  onSave,
  name,
  setName,
  price,
  setPrice,
  opStatus,
  setOpStatus,
  formatVND
}: CourtConfigModalProps) => {
  const statusOptions: DropdownOption[] = [
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'MAINTENANCE', label: 'Bảo trì' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấu hình chi tiết sân"
      maxWidth="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onSave}
            className="bg-brand-yellow hover:bg-yellow-400 text-primary border-b-2 border-yellow-600 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Lưu cấu hình
          </button>
        </>
      }
    >
      <div className="space-y-4 text-left">
        {/* Court Name */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Tên sân bãi</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
          />
        </div>

        {/* Base Price */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giá thuê mặc định (VND/h)</label>
          <div className="relative flex items-center">
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 pr-14 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1"
            />
            <span className="absolute right-3.5 text-[10px] font-extrabold text-slate-400">VND/h</span>
          </div>
          {price && !isNaN(parseFloat(price)) && (
            <p className="text-[9px] text-brand-emerald font-black">Hiển thị: {formatVND(parseFloat(price))}</p>
          )}
        </div>

        {/* Operational Status */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Trạng thái vận hành</label>
          <Dropdown
            options={statusOptions}
            value={opStatus}
            onChange={val => setOpStatus(val as 'ACTIVE' | 'MAINTENANCE')}
            placeholder="Chọn trạng thái"
            className="w-full"
          />
        </div>
      </div>
    </Modal>
  );
};
