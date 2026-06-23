import React from 'react';
import { Modal } from '../../../../components/ui/Modal';
import type { SimulatedBooking } from '../../../../hooks/useOperationsState';

interface BookingQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionRequiredBookings: SimulatedBooking[];
  handleResolveBooking: (bookingId: string, action: 'refund' | 'points' | 'reschedule') => void;
  formatVND: (amount: number) => string;
}

export const BookingQueueModal = ({
  isOpen,
  onClose,
  actionRequiredBookings,
  handleResolveBooking,
  formatVND
}: BookingQueueModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title="Danh sach don dat san can giai quyet khan cap" maxWidth="lg">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-750 p-4 rounded-2xl flex items-start gap-3 select-none">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="space-y-1 text-xs">
            <h4 className="font-black text-red-800 uppercase tracking-tight">Quy tac huy dat lich khan cap</h4>
            <p className="leading-relaxed font-bold">
              Do cum san bi chuyen sang trang thai <strong>Dong cua khan cap (CLOSED)</strong>, he thong da ngat tu dong toan bo lich trinh.
              Chu san can lien he cac khach hang ben duoi de tien hanh boi hoan tien mat, tang diem Sporta doi lich, hoac thao luan roi lich.
            </p>
          </div>
        </div>

        <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
          {actionRequiredBookings.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-450 font-bold select-none">Khong con don dat san nao can xu ly.</div>
          ) : (
            actionRequiredBookings.map(booking => (
              <div key={booking.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-xs text-slate-800">{booking.customerName}</span>
                    <span className="text-[9px] font-mono text-slate-400 font-bold select-none">({booking.id})</span>
                  </div>
                  <p className="text-[10px] text-slate-505 font-semibold select-none">So dien thoai: {booking.phoneNumber}</p>
                  <div className="flex flex-wrap gap-2 pt-1 select-none">
                    <span className="text-[9px] bg-white border border-slate-200 text-slate-650 px-2 py-0.5 rounded font-bold">San: {booking.courtName}</span>
                    <span className="text-[9px] bg-white border border-slate-200 text-slate-650 px-2 py-0.5 rounded font-bold">Lich: {booking.date} | {booking.time}</span>
                    <span className="text-[9px] bg-emerald-50 border border-emerald-250 text-emerald-700 px-2 py-0.5 rounded font-bold">Da thanh toan: {formatVND(booking.price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center select-none">
                  <button onClick={() => handleResolveBooking(booking.id, 'refund')} className="bg-red-650 hover:bg-red-750 text-white font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer">Hoan tien</button>
                  <button onClick={() => handleResolveBooking(booking.id, 'points')} className="bg-emerald-50 hover:bg-emerald-100 text-brand-emerald border border-emerald-100 font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer">Tang diem</button>
                  <button onClick={() => handleResolveBooking(booking.id, 'reschedule')} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer">Doi lich</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
