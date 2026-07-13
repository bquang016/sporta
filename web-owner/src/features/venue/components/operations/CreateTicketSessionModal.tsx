import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../common/ui/overlay/Modal';
import { DatePicker } from '../../../../common/ui/form/DatePicker';
import { TimePicker } from '../../../../common/ui/form/TimePicker';
import { Dropdown } from '../../../../components/ui/Dropdown';
import { NumberInput } from '../../../../common/ui/form/NumberInput';
import { CurrencyInput } from '../../../../components/ui/CurrencyInput';
import type { CourtResponse } from '../../types';
import type { SportLevel } from '../../types/ticket.types';

interface CreateTicketSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: CourtResponse[];
  onCreate: (data: {
    courtId: string;
    playDate: string;
    startTime: string;
    endTime: string;
    pricePerTicket: number;
    maxSlots: number;
    sportLevel: SportLevel;
  }) => Promise<any>;
}

export const CreateTicketSessionModal: React.FC<CreateTicketSessionModalProps> = ({
  isOpen,
  onClose,
  courts,
  onCreate,
}) => {
  const activeCourts = courts.filter(c => c.status === 'ACTIVE');
  
  const [courtId, setCourtId] = useState('');
  const [playDate, setPlayDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [pricePerTicket, setPricePerTicket] = useState(50000);
  const [maxSlots, setMaxSlots] = useState(10);
  const [sportLevel, setSportLevel] = useState<SportLevel>('ALL');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset states when open
  useEffect(() => {
    if (isOpen) {
      if (activeCourts.length > 0) {
        setCourtId(activeCourts[0].id);
      } else {
        setCourtId('');
      }
      const today = new Date();
      setPlayDate(today.toISOString().split('T')[0]);
      setStartTime('08:00');
      setEndTime('10:00');
      setPricePerTicket(50000);
      setMaxSlots(10);
      setSportLevel('ALL');
      setErrorMsg(null);
    }
  }, [isOpen, courts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtId) {
      setErrorMsg('Vui lòng chọn sân đấu');
      return;
    }

    if (!playDate) {
      setErrorMsg('Vui lòng chọn ngày chơi');
      return;
    }

    if (!startTime || !endTime) {
      setErrorMsg('Vui lòng chọn khung giờ bắt đầu và kết thúc');
      return;
    }

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    if (startMinutes >= endMinutes) {
      setErrorMsg('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }

    if (pricePerTicket < 0) {
      setErrorMsg('Giá vé không được âm');
      return;
    }

    if (maxSlots <= 0) {
      setErrorMsg('Số lượng chỗ tối đa phải lớn hơn 0');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onCreate({
        courtId,
        playDate,
        startTime,
        endTime,
        pricePerTicket,
        maxSlots,
        sportLevel,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tạo ca xé vé');
    } finally {
      setSubmitting(false);
    }
  };

  const parseTimeToMinutes = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const courtOptions = activeCourts.map(c => ({
    value: c.id,
    label: c.name,
  }));

  const sportLevelOptions = [
    { value: 'ALL', label: 'Mọi trình độ (All levels)' },
    { value: 'WEAK', label: 'Yếu (Beginner)' },
    { value: 'WEAK_AVERAGE', label: 'Yếu - Trung bình' },
    { value: 'AVERAGE', label: 'Trung bình (Intermediate)' },
    { value: 'AVERAGE_GOOD', label: 'Trung bình - Khá' },
    { value: 'GOOD', label: 'Khá - Tốt (Advanced)' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo ca xé vé mới"
      maxWidth="md"
      footer={
        <div className="flex gap-3 justify-end w-full select-none">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black hover:bg-slate-100/75 text-slate-700 transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || activeCourts.length === 0}
            className="px-5 py-2.5 rounded-xl bg-[#fed01b] hover:bg-[#fed01b]/90 text-[#003527] text-xs font-black transition-all cursor-pointer border-b-2 border-[#6f5900] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Đang tạo...' : 'Tạo ca xé vé'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans select-none">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {activeCourts.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-2xl text-center">
            Không tìm thấy sân đấu nào đang hoạt động để tạo ca xé vé.
          </div>
        ) : (
          <>
            <div className="space-y-1.5 flex flex-col w-full text-left font-sans select-none">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-500 flex items-center gap-0.5">
                Chọn sân
                <span className="text-red-500 font-bold">*</span>
              </label>
              <Dropdown
                options={courtOptions}
                value={courtId}
                onChange={(val) => setCourtId(val)}
                placeholder="Chọn sân đấu"
              />
            </div>

            <DatePicker
              label="Ngày chơi"
              value={playDate}
              onChange={(e) => setPlayDate(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <TimePicker
                label="Giờ bắt đầu"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              <TimePicker
                label="Giờ kết thúc"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Giá vé/người</label>
                <CurrencyInput
                  value={pricePerTicket}
                  onChange={(val) => setPricePerTicket(val)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Số lượng vé tối đa</label>
                <NumberInput
                  value={maxSlots}
                  onNumberChange={(val) => setMaxSlots(val)}
                  min={1}
                  step={1}
                  showControls={true}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col w-full text-left font-sans select-none">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-500 flex items-center gap-0.5">
                Yêu cầu Trình độ
                <span className="text-red-500 font-bold">*</span>
              </label>
              <Dropdown
                options={sportLevelOptions}
                value={sportLevel}
                onChange={(val) => setSportLevel(val as SportLevel)}
                placeholder="Chọn trình độ yêu cầu"
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};
