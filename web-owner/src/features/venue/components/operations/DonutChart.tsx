import React, { useState, useEffect } from 'react';

interface DonutChartProps {
  activeCount: number;
  maintCount: number;
  closedCount: number;
  totalCount: number;
  isMobile?: boolean;
}

export const DonutChart = ({ activeCount, maintCount, closedCount, totalCount, isMobile = false }: DonutChartProps) => {
  const [animated, setAnimated] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const size = isMobile ? 150 : 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = isMobile ? 45 : 70;
  const strokeW = isMobile ? 14 : 22;
  const circumference = 2 * Math.PI * r;
  const gap = totalCount > 1 ? 4 : 0; // gap between segments in px

  const activePct  = totalCount > 0 ? activeCount / totalCount : 0;
  const maintPct   = totalCount > 0 ? maintCount  / totalCount : 0;
  const closedPct  = totalCount > 0 ? closedCount / totalCount : 0;

  const lenActive = activePct  * (circumference - (totalCount > 1 ? gap * 3 : 0));
  const lenMaint  = maintPct   * (circumference - (totalCount > 1 ? gap * 3 : 0));
  const lenClosed = closedPct  * (circumference - (totalCount > 1 ? gap * 3 : 0));

  const segments = [
    { key: 'active',  count: activeCount,  pct: activePct,  len: lenActive, offset: 0,                          color: '#10b981', label: 'Hoat dong' },
    { key: 'maint',   count: maintCount,   pct: maintPct,   len: lenMaint,  offset: -(lenActive + gap),         color: '#f59e0b', label: 'Bao tri' },
    { key: 'closed',  count: closedCount,  pct: closedPct,  len: lenClosed, offset: -(lenActive + lenMaint + gap * 2), color: '#ef4444', label: 'Dong cua' },
  ];

  return (
    <div className={`flex flex-col items-center ${isMobile ? 'gap-3' : 'gap-5'}`}>
      <div className="relative flex justify-center items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="#f1f5f9" strokeWidth={strokeW} />

          {totalCount > 0 && segments.map(seg => {
            if (seg.count === 0) return null;
            const isHovered = hoveredSegment === seg.key;
            const displayLen = animated ? seg.len : 0;
            const displayRest = animated ? circumference - seg.len : circumference;
            return (
              <circle
                key={seg.key}
                cx={cx} cy={cy} r={r}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeW + 4 : strokeW}
                strokeDasharray={`${displayLen} ${displayRest}`}
                strokeDashoffset={seg.offset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 0.6s ease-out, stroke-width 0.15s ease',
                  cursor: 'pointer',
                  filter: isHovered ? `drop-shadow(0 0 6px ${seg.color}80)` : 'none',
                }}
                onMouseEnter={() => setHoveredSegment(seg.key)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute text-center pointer-events-none">
          {hoveredSegment ? (
            <>
              <h4 className={`font-black text-slate-800 leading-none ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                {segments.find(s => s.key === hoveredSegment)?.count}
              </h4>
              <span className={`font-black text-slate-400 uppercase tracking-widest block mt-1 ${isMobile ? 'text-[7px]' : 'text-[9px]'}`}>
                {segments.find(s => s.key === hoveredSegment)?.label}
              </span>
            </>
          ) : (
            <>
              <h4 className={`font-black text-slate-800 leading-none ${isMobile ? 'text-xl' : 'text-3xl'}`}>{totalCount}</h4>
              <span className={`font-black text-slate-400 uppercase tracking-widest block mt-1 ${isMobile ? 'text-[7px]' : 'text-[9px]'}`}>SAN BAI</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className={`grid grid-cols-3 gap-4 w-full text-center border-t border-slate-100 pt-4 ${isMobile ? 'text-[8px]' : 'text-[10px]'} font-bold`}>
        {segments.map(seg => (
          <div
            key={seg.key}
            className={`space-y-1 cursor-pointer transition-opacity ${hoveredSegment && hoveredSegment !== seg.key ? 'opacity-40' : 'opacity-100'}`}
            onMouseEnter={() => setHoveredSegment(seg.key)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span className={`rounded-full flex-shrink-0 ${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'}`} style={{ backgroundColor: seg.color }} />
              <span className="text-slate-800">{seg.label}</span>
            </div>
            <span className="text-slate-400 block">
              {seg.count} san ({totalCount > 0 ? Math.round(seg.pct * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
