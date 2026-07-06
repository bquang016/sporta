import React from 'react';
import { Modal } from '../../../components/ui/Modal';

interface VenueStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED') => void;
  currentStatus?: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
}

export const VenueStatusModal = ({ isOpen, onClose, onChangeStatus, currentStatus }: VenueStatusModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thay đổi trạng thái vận hành cụm sân"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl flex items-start gap-2.5 select-none">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="space-y-1 text-xs">
            <h4 className="font-black text-amber-800 uppercase">Lưu ý quan trọng</h4>
            <p className="leading-relaxed font-bold">
              Thay đổi trạng thái cụm sân sẽ ảnh hưởng trực tiếp đến trạng thái hoạt động của toàn bộ sân bãi bên trong.
              Hệ thống sẽ đồng bộ hóa trạng thái mới xuống toàn bộ sân bãi tương ứng.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 select-none pt-2">
          {[
            {
              status: 'ACTIVE' as const,
              color: 'bg-emerald-500',
              border: 'border-emerald-500',
              bg: 'bg-emerald-50/30',
              label: 'Hoạt động',
              desc: 'Bật toàn bộ các sân hoạt động'
            },
            {
              status: 'MAINTENANCE' as const,
              color: 'bg-amber-400',
              border: 'border-amber-500',
              bg: 'bg-amber-50/30',
              label: 'Bảo trì',
              desc: 'Tạm ngưng nhận khách'
            },
            {
              status: 'CLOSED' as const,
              color: 'bg-red-500',
              border: 'border-red-500',
              bg: 'bg-red-50/30',
              label: 'Đóng cửa',
              desc: 'Đóng cửa toàn cụm sân'
            },
          ].map(opt => {
            const isCurrent = currentStatus === opt.status;
            return (
              <button
                key={opt.status}
                onClick={() => onChangeStatus(opt.status)}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer w-full text-center relative ${
                  isCurrent
                    ? `border-2 ${opt.border} ${opt.bg} shadow-sm`
                    : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {isCurrent && (
                  <span className={`absolute top-2 right-2 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                    opt.status === 'ACTIVE' ? 'bg-emerald-100 text-brand-emerald' :
                    opt.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Hiện tại
                  </span>
                )}
                <span className={`w-4 h-4 rounded-full ${opt.color}`} />
                <span className="text-xs font-black text-slate-800">{opt.label}</span>
                <span className="text-[9px] text-slate-400 font-bold text-center">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
