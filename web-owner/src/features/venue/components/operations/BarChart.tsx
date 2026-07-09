import React, { useState, useEffect } from 'react';
import type { CourtResponse } from '../../types';

interface BarChartProps {
  courts: CourtResponse[];
  getCourtOpStatus: (id: string) => 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  getCourtDetails: (c: CourtResponse) => {
    name: string;
    price: number;
    surcharge: number;
    liveStatus: string;
    occupancy: number;
    performanceRevenue: number;
    isMaintenance: boolean;
  };
  formatVND: (n: number) => string;
  isMobile?: boolean;
}

export const BarChart = ({ courts, getCourtOpStatus, getCourtDetails, formatVND, isMobile = false }: BarChartProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (courts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-bold">
        Chưa có dữ liệu sân bãi
      </div>
    );
  }

  const revenues = courts.map(c => getCourtDetails(c).performanceRevenue);
  const maxRevenue = Math.max(...revenues, 1);
  // Ceiling max to a nice round number
  const niceMax = Math.ceil(maxRevenue / 500000) * 500000 || 500000;
  const chartH = isMobile ? 90 : 140;

  const formatAxis = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${Math.round(v / 1000)}K`;
    return `${v}`;
  };

  const gridLevels = [niceMax, niceMax * 0.75, niceMax * 0.5, niceMax * 0.25, 0];

  return (
    <div className="w-full relative select-none pt-8">
      {/* Chart Wrapper: separate Y-axis labels from Plot Area */}
      <div className="flex" style={{ height: `${chartH + 30}px` }}>
        {/* Y-axis Labels */}
        <div className="w-12 flex flex-col justify-between items-end pr-2 text-right pointer-events-none pb-6">
          {gridLevels.map((level, i) => (
            <span key={i} className={`font-black text-slate-400 leading-none ${isMobile ? 'text-[7px]' : 'text-[8px]'}`}>
              {formatAxis(level)}
            </span>
          ))}
        </div>

        {/* Plot Area */}
        <div className="flex-1 relative border-b border-slate-200 pb-6">
          {/* Background Grid Lines */}
          <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
            {gridLevels.map((_, i) => (
              <div key={i} className={`w-full border-t ${i === gridLevels.length - 1 ? 'border-slate-200' : 'border-dashed border-slate-100'}`} />
            ))}
          </div>

          {/* Bars Container */}
          <div className="absolute inset-0 flex items-end justify-around px-2 pb-6 z-10">
            {courts.map(court => {
              const details = getCourtDetails(court);
              const opStatus = getCourtOpStatus(court.id);
              const barRatio = details.performanceRevenue > 0
                ? Math.min(details.performanceRevenue / niceMax, 1)
                : 0;
              const barPx = mounted
                ? Math.max(Math.round(barRatio * chartH), barRatio > 0 ? 6 : 0)
                : 0;

              const barColor =
                opStatus === 'ACTIVE'      ? 'from-emerald-600 to-emerald-400 shadow-emerald-500/20' :
                opStatus === 'MAINTENANCE' ? 'from-amber-500 to-yellow-400 shadow-amber-500/20' :
                                             'from-red-600 to-rose-400 shadow-red-500/20';

              const shortName = details.name.length > 8 ? details.name.slice(0, 8) + '…' : details.name;

              return (
                <div key={court.id} className={`flex flex-col items-center group relative z-10 ${isMobile ? 'w-10' : 'w-12'}`}>
                  {/* Hover tooltip */}
                  <div className={`
                    absolute bottom-full mb-2 opacity-0 group-hover:opacity-100
                    transition-opacity bg-slate-900/95 text-white font-black
                    px-2.5 py-1.5 rounded-xl shadow-lg pointer-events-none whitespace-nowrap z-50
                    ${isMobile ? 'text-[8px]' : 'text-[9px]'}
                  `}>
                    <div className="font-black">{details.name}</div>
                    <div className="text-white/70 font-bold">{formatVND(details.performanceRevenue)}</div>
                    <div className="text-white/60 font-bold">Lấp đầy: {details.occupancy}%</div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900/95" />
                  </div>

                  {/* Value label above bar */}
                  {details.performanceRevenue > 0 && (
                    <span className={`font-black text-slate-505 mb-1 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'} ${isMobile ? 'text-[7px]' : 'text-[8px]'}`}>
                      {formatAxis(details.performanceRevenue)}
                    </span>
                  )}

                  {/* Bar */}
                  <div
                    className={`bg-gradient-to-t ${barColor} rounded-t-md shadow-sm transition-all duration-500 ease-out ${isMobile ? 'w-5' : 'w-7'}`}
                    style={{ height: `${barPx}px`, minHeight: barRatio > 0 ? '4px' : '0' }}
                  />

                  {/* Occupancy mini-indicator */}
                  <div className={`mt-1 bg-slate-100 rounded-full overflow-hidden ${isMobile ? 'w-5 h-1' : 'w-7 h-1.5'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-700 delay-300 ${
                        details.occupancy > 75 ? 'bg-emerald-500' :
                        details.occupancy > 50 ? 'bg-blue-400' : 'bg-slate-400'
                      }`}
                      style={{ width: mounted ? `${details.occupancy}%` : '0%' }}
                    />
                  </div>

                  {/* Label */}
                  <span className={`font-bold text-slate-555 truncate text-center mt-1.5 ${isMobile ? 'w-10 text-[8px]' : 'w-12 text-[9px]'}`}>
                    {shortName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
