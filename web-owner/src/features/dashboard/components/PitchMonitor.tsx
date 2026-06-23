import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Dropdown } from '../../../components/ui/Dropdown';
import type { Pitch, PitchStatus } from '../types';

interface PitchMonitorProps {
  isMobile: boolean;
  currentPitches: Pitch[];
  isPitchesExpanded: boolean;
  setIsPitchesExpanded: (val: boolean) => void;
  onInitiateStatusChange: (pitch: Pitch, nextStatus: PitchStatus) => void;
}

export const PitchMonitor = ({
  isMobile,
  currentPitches,
  isPitchesExpanded,
  setIsPitchesExpanded,
  onInitiateStatusChange
}: PitchMonitorProps) => {
  const pitchStatusOptions = [
    { value: 'available', label: 'Trống' },
    { value: 'busy', label: 'Đang bận' },
    { value: 'maintenance', label: 'Bảo trì' }
  ];

  const displayPitches = isPitchesExpanded 
    ? currentPitches 
    : currentPitches.slice(0, isMobile ? 3 : 4);

  if (isMobile) {
    return (
      <section className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm w-full">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide">Trạng thái sân hôm nay</h2>
          <span className="text-[10px] text-slate-400 font-medium">
            {isPitchesExpanded ? 'Chọn trạng thái thủ công' : 'Chỉ xem trạng thái'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {displayPitches.map(p => (
            <div
              key={p.id}
              className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                p.status === 'available' ? 'bg-emerald-50/20 border-emerald-100' :
                p.status === 'busy' ? 'bg-amber-50/15 border-amber-100' :
                'bg-red-50/15 border-red-100'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800">{p.name}</span>
                  <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                    {p.type}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    p.status === 'available' ? 'bg-brand-emerald animate-pulse' :
                    p.status === 'busy' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}></span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {p.status === 'available' ? 'Trống' : p.status === 'busy' ? 'Bận' : 'Bảo trì'}
                  </span>
                </div>
              </div>

              {/* Dropdown status changer only visible when expanded */}
              {isPitchesExpanded && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-4">
                  <span className="text-[10px] text-slate-400 font-bold">Trạng thái:</span>
                  <Dropdown
                    options={pitchStatusOptions}
                    value={p.status}
                    onChange={(newVal) => onInitiateStatusChange(p, newVal as PitchStatus)}
                    className="w-28"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsPitchesExpanded(!isPitchesExpanded)}
          className="w-full mt-4 pt-2.5 border-t border-slate-100 text-[10px] font-black text-brand-emerald hover:text-emerald-950 uppercase tracking-widest text-center flex items-center justify-center gap-1 focus:outline-none"
        >
          <span>{isPitchesExpanded ? 'Thu gọn trạng thái' : 'Mở rộng sân bãi (Xem thêm)'}</span>
          <span className="transition-transform duration-200" style={{ transform: isPitchesExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </section>
    );
  }

  // Desktop Pitch Monitor
  return (
    <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Giám sát sân bãi</h2>
          <p className="text-[10px] text-slate-400 font-medium">
            {isPitchesExpanded 
              ? 'Thay đổi trạng thái sân bằng Dropdown' 
              : 'Trạng thái hoạt động hiện tại'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-[360px] overflow-y-auto pr-1">
        {displayPitches.map(p => (
          <div
            key={p.id}
            className={`p-3 rounded-xl border flex flex-col justify-between transition-all select-none ${
              p.status === 'available' ? 'bg-emerald-50/30 border-emerald-100' :
              p.status === 'busy' ? 'bg-amber-50/20 border-amber-100' :
              'bg-red-50/20 border-red-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800">{p.name}</span>
                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wide bg-slate-100 px-1 py-0.5 rounded">
                  {p.type}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  p.status === 'available' ? 'bg-brand-emerald animate-pulse' :
                  p.status === 'busy' ? 'bg-amber-500' :
                  'bg-red-500'
                }`}></span>
                <span className="text-[9px] font-bold text-slate-500">
                  {p.status === 'available' ? 'Trống' :
                   p.status === 'busy' ? 'Đang bận' :
                   'Bảo trì'}
                </span>
              </div>
            </div>

            {/* Manual status edit dropdown only visible when expanded */}
            {isPitchesExpanded && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-4">
                <span className="text-[10px] text-slate-400 font-bold">Chỉnh sửa trạng thái:</span>
                <Dropdown
                  options={pitchStatusOptions}
                  value={p.status}
                  onChange={(newVal) => onInitiateStatusChange(p, newVal as PitchStatus)}
                  className="w-32"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-2 border-t border-slate-100 flex justify-center">
        <button
          type="button"
          onClick={() => setIsPitchesExpanded(!isPitchesExpanded)}
          className="text-xs font-black text-brand-emerald hover:text-emerald-950 transition-colors uppercase tracking-wider flex items-center gap-1 focus:outline-none"
        >
          <span>{isPitchesExpanded ? 'Thu gọn sân bãi' : 'Mở rộng sân bãi (Xem thêm)'}</span>
          <span className="transition-transform duration-200" style={{ transform: isPitchesExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </div>
    </Card>
  );
};
export default PitchMonitor;
