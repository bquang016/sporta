import React from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Dropdown } from '../../../../components/ui/Dropdown';

interface AddCourtSubScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  name: string;
  setName: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  status: 'ACTIVE' | 'MAINTENANCE';
  setStatus: (val: 'ACTIVE' | 'MAINTENANCE') => void;
  validationErrors: Record<string, string>;
  formatVND: (amount: number) => string;
}

export const AddCourtSubScreen = ({
  isOpen,
  onClose,
  onSubmit,
  name,
  setName,
  price,
  setPrice,
  status,
  setStatus,
  validationErrors,
  formatVND
}: AddCourtSubScreenProps) => {
  const statusOptions = [
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'MAINTENANCE', label: 'Bảo trì' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm sân lẻ mới"
      maxWidth="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="bg-brand-yellow hover:bg-yellow-400 text-primary border-b-2 border-yellow-600 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Lưu sân bãi
          </button>
        </>
      }
    >
      <div className="space-y-4 text-left">
        {/* Court Name */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
            Tên sân thi đấu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Sân số 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 ${
              validationErrors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
            }`}
          />
          {validationErrors.name && (
            <p className="text-[9px] text-red-500 font-bold">{validationErrors.name}</p>
          )}
        </div>

        {/* Base Price */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
            Giá thuê mặc định (VND/h) <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              placeholder="VD: 150000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`w-full text-xs font-bold text-slate-700 pl-3.5 pr-12 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 ${
                validationErrors.price
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
              }`}
              min={0}
            />
            <span className="absolute right-3.5 text-[10px] font-extrabold text-slate-400">VND/h</span>
          </div>
          {validationErrors.price && (
            <p className="text-[9px] text-red-500 font-bold">{validationErrors.price}</p>
          )}
          {price && !isNaN(parseFloat(price)) && (
            <p className="text-[9px] text-brand-emerald font-black">
              Hiển thị: {formatVND(parseFloat(price))}
            </p>
          )}
        </div>

        {/* Status selection */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
            Trạng thái vận hành
          </label>
          <Dropdown
            options={statusOptions}
            value={status}
            onChange={(val) => setStatus(val as 'ACTIVE' | 'MAINTENANCE')}
            className="w-full"
          />
        </div>
      </div>
    </Modal>
  );
};
