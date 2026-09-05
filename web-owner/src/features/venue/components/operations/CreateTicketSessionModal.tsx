import React, { useState, useEffect, useMemo } from 'react';
import { Users } from 'lucide-react';
import { Modal } from '../../../../common/ui/overlay/Modal';
import { DatePicker } from '../../../../common/ui/form/DatePicker';
import { Dropdown } from '../../../../components/ui/Dropdown';
import { NumberInput } from '../../../../common/ui/form/NumberInput';
import { CurrencyInput } from '../../../../components/ui/CurrencyInput';
import { scheduleService } from '../../../booking/services/scheduleService';
import type { CourtResponse, VenueResponse } from '../../types';
import type { SportLevel } from '../../types/ticket.types';
import { useToast } from '../../../../components/ui/Toast';

interface CreateTicketSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: CourtResponse[];
  venues: VenueResponse[];
  onCreate: (data: {
    courtId: string;
    playDate: string;
    startTime: string;
    endTime: string;
    pricePerTicket: number;
    maxSlots: number;
    sportLevel: SportLevel;
    hasHostTeam?: boolean;
    hostTeamName?: string;
    hostTeamLevel?: SportLevel;
  }) => Promise<any>;
}

export const CreateTicketSessionModal: React.FC<CreateTicketSessionModalProps> = ({
  isOpen,
  onClose,
  courts,
  venues,
  onCreate,
}) => {
  const { showToast } = useToast();
  const activeCourts = courts.filter(c => c.status === 'ACTIVE');

  const [courtId, setCourtId] = useState('');
  const [playDate, setPlayDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [pricePerTicket, setPricePerTicket] = useState(50000);
  const [maxSlots, setMaxSlots] = useState(10);
  const [sportLevel, setSportLevel] = useState<SportLevel>('ALL');

  const [hasHostTeam, setHasHostTeam] = useState(false);
  const [hostTeamName, setHostTeamName] = useState('Đội Sân Nhà');
  const [hostTeamLevel, setHostTeamLevel] = useState<SportLevel>('AVERAGE');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Availability schedule
  const [apiSlots, setApiSlots] = useState<any[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState('');

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
      setPricePerTicket(50000);
      setMaxSlots(10);
      setSportLevel('ALL');
      setErrorMsg(null);
      setSelectedShiftId('');
      setStartTime('');
      setEndTime('');
    }
  }, [isOpen, courts]);

  // Fetch schedule of this venue when date or court selection changes
  useEffect(() => {
    const fetchShifts = async () => {
      const court = courts.find(c => c.id === courtId);
      if (!court || !playDate) {
        setApiSlots([]);
        return;
      }

      setLoadingShifts(true);
      try {
        const slotsData = await scheduleService.getSchedule(court.venueId, playDate);
        setApiSlots(slotsData || []);
      } catch (err) {
        console.error('Error fetching court slots:', err);
        setApiSlots([]);
      } finally {
        setLoadingShifts(false);
      }
    };

    if (isOpen && courtId && playDate) {
      fetchShifts();
    }
  }, [courtId, playDate, courts, isOpen]);

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
      setErrorMsg('Vui lòng chọn ca chơi');
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
        hasHostTeam,
        hostTeamName: hasHostTeam ? hostTeamName.trim() : undefined,
        hostTeamLevel: hasHostTeam ? hostTeamLevel : undefined,
      });
      showToast('success', 'Tạo ca xé vé mới thành công!');
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
    { value: 'ALL', label: 'Mọi trình độ (Tất cả Elo)' },
    { value: 'WEAK', label: 'Yếu (< 900 Elo)' },
    { value: 'WEAK_AVERAGE', label: 'Trung bình - Yếu (900 - 1199 Elo)' },
    { value: 'AVERAGE', label: 'Trung bình (1200 - 1499 Elo)' },
    { value: 'AVERAGE_GOOD', label: 'Trung bình - Khá (1500 - 1799 Elo)' },
    { value: 'GOOD', label: 'Bán chuyên (1800 - 2099 Elo)' },
    { value: 'PRO', label: 'Chuyên nghiệp (≥ 2100 Elo)' },
  ];

  const selectedCourt = useMemo(() => courts.find(c => c.id === courtId), [courts, courtId]);
  const selectedVenue = useMemo(() => venues.find(v => v.id === selectedCourt?.venueId), [venues, selectedCourt]);

  // Compute availability list
  const shiftOptions = useMemo(() => {
    if (!selectedVenue || !selectedCourt) return [];

    const duration = selectedVenue.shiftDurationMinutes || 30;
    const opening = selectedVenue.openingTime || '06:00';
    const closing = selectedVenue.closingTime || '22:00';

    let startMin = 6 * 60;
    let endMin = 22 * 60;

    const parseTimeToMinutesLocal = (t: string): number => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    if (opening) startMin = parseTimeToMinutesLocal(opening);
    if (closing) endMin = parseTimeToMinutesLocal(closing);

    const options = [];
    let currentMin = startMin;
    let shiftIndex = 1;

    const formatMinutesToTime = (min: number) => {
      const h = Math.floor(min / 60);
      const m = min % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    while (currentMin < endMin) {
      const nextMin = currentMin + duration;
      if (nextMin > endMin) break;

      const startTimeStr = formatMinutesToTime(currentMin);
      const endTimeStr = formatMinutesToTime(nextMin);

      // Check if court has any busy slot at this time
      const matchingSlot = apiSlots.find(s => s.courtId === selectedCourt.id && s.time === startTimeStr);
      const isAvailable = !matchingSlot || matchingSlot.status === 'available';

      if (isAvailable) {
        options.push({
          value: `${startTimeStr}-${endTimeStr}`,
          label: `Ca ${shiftIndex}: ${startTimeStr} - ${endTimeStr}`,
        });
      }

      currentMin = nextMin;
      shiftIndex++;
    }

    return options;
  }, [selectedVenue, selectedCourt, apiSlots]);

  // Sync selected shift options
  useEffect(() => {
    if (shiftOptions.length > 0) {
      const exists = shiftOptions.some(opt => opt.value === selectedShiftId);
      if (!exists) {
        setSelectedShiftId(shiftOptions[0].value);
        const [start, end] = shiftOptions[0].value.split('-');
        setStartTime(start);
        setEndTime(end);
      }
    } else {
      setSelectedShiftId('');
      setStartTime('');
      setEndTime('');
    }
  }, [shiftOptions, selectedShiftId]);

  const handleShiftChange = (val: string) => {
    setSelectedShiftId(val);
    if (val) {
      const [start, end] = val.split('-');
      setStartTime(start);
      setEndTime(end);
    } else {
      setStartTime('');
      setEndTime('');
    }
  };

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
            <div className="space-y-1 flex flex-col w-full text-left font-sans select-none">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-0.5">
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
              labelClassName="text-[10px] font-black text-slate-400 uppercase tracking-wide"
              required
            />

            <div className="space-y-1 flex flex-col w-full text-left font-sans select-none">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-0.5">
                Chọn ca chơi
                <span className="text-red-500 font-bold">*</span>
              </label>
              <Dropdown
                options={shiftOptions}
                value={selectedShiftId}
                onChange={handleShiftChange}
                placeholder={loadingShifts ? "Đang tải danh sách ca..." : "Chọn ca chơi"}
                disabled={loadingShifts || shiftOptions.length === 0}
              />
              {shiftOptions.length === 0 && !loadingShifts && (
                <span className="text-[10px] text-amber-600 font-bold mt-1">Không có ca nào trống cho sân và ngày này</span>
              )}
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

            <div className="space-y-1 flex flex-col w-full text-left font-sans select-none">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-0.5">
                Yêu cầu Trình độ
                <span className="text-red-500 font-bold">*</span>
              </label>
              <Dropdown
                options={sportLevelOptions}
                value={sportLevel}
                onChange={(val) => setSportLevel(val as SportLevel)}
                placeholder="Chọn trình độ yêu cầu"
                direction="up"
              />
            </div>

            {/* Host Team Configuration */}
            <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-indigo-950 block">Đã có sẵn Đội Sân Nhà (Mở kèo tìm đối thủ)</span>
                    <span className="text-[10px] text-indigo-600/90 font-medium">Vé mở bán sẽ dành riêng cho Đội Thách Đấu vào so tài</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHostTeam}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHasHostTeam(checked);
                      if (checked && maxSlots > 7) {
                        setMaxSlots(Math.max(1, Math.floor(maxSlots / 2)));
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {hasHostTeam && (
                <div className="pt-2 border-t border-indigo-200/60 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-900 uppercase tracking-wide">Tên Đội Sân Nhà</label>
                    <input
                      type="text"
                      value={hostTeamName}
                      onChange={(e) => setHostTeamName(e.target.value)}
                      placeholder="Ví dụ: FC Sân Nhà"
                      className="w-full text-xs font-bold text-slate-800 bg-white border border-indigo-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-900 uppercase tracking-wide">Trình độ Đội Nhà</label>
                    <Dropdown
                      options={sportLevelOptions.filter(o => o.value !== 'ALL')}
                      value={hostTeamLevel}
                      onChange={(val) => setHostTeamLevel(val as SportLevel)}
                      placeholder="Chọn trình độ"
                      direction="up"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};
