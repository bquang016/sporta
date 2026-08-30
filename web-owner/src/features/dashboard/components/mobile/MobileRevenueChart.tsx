import React, { useState } from 'react';
import type { ChartPeriod, ChartData } from '../../types';
import { TrendingUp, BarChart3, Info } from 'lucide-react';

interface MobileRevenueChartProps {
  chartPeriod: ChartPeriod;
  setChartPeriod: (period: ChartPeriod) => void;
  chartData: ChartData;
  chartPoints: Array<{ x: number; y: number; value: number }>;
  pathString: string;
  areaString: string;
  svgWidth: number;
  svgHeight: number;
}

export const MobileRevenueChart: React.FC<MobileRevenueChartProps> = ({
  chartPeriod,
  setChartPeriod,
  chartData,
  chartPoints,
  pathString,
  areaString,
  svgWidth,
  svgHeight
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    chartPoints.length > 0 ? chartPoints.length - 1 : null
  );

  const periods: { id: ChartPeriod; label: string }[] = [
    { id: 'day', label: 'Theo Ngày' },
    { id: 'quarter', label: 'Theo Quý' },
    { id: 'year', label: 'Theo Năm' }
  ];

  const formatVND = (num: number) => {
    // If num is less than 10,000, treat it as in thousands (k)
    const actual = num > 0 && num < 10000 ? num * 1000 : num;
    return new Intl.NumberFormat('vi-VN').format(Math.round(actual)) + 'đ';
  };

  // Calculate total revenue for active period
  const totalValue = chartData.values.reduce((sum, v) => sum + (v > 0 && v < 10000 ? v * 1000 : v), 0);
  const formattedTotal = formatVND(totalValue);

  const activePoint = selectedPointIndex !== null && chartPoints[selectedPointIndex]
    ? {
        label: chartData.labels[selectedPointIndex],
        val: formatVND(chartData.values[selectedPointIndex]),
        rawVal: chartData.values[selectedPointIndex],
        x: chartPoints[selectedPointIndex].x,
        y: chartPoints[selectedPointIndex].y
      }
    : null;

  return (
    <section className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm space-y-3.5">
      {/* Header & Period Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Hiệu suất doanh thu
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Doanh số đặt sân trực tuyến</p>
          </div>
        </div>

        {/* Segmented Period Tabs (React Native style) */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5 border border-slate-200/50">
          {periods.map(p => {
            const isActive = chartPeriod === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setChartPeriod(p.id);
                  setSelectedPointIndex(null);
                }}
                className={`touch-target min-h-[30px] px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                  isActive
                    ? 'bg-[#064e3b] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p.label.replace('Theo ', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Point Tooltip / Value Highlight Banner */}
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {activePoint ? `Mốc thời gian: ${activePoint.label}` : 'Tổng doanh số kỳ này'}
          </span>
          <p className="text-base font-black text-[#064e3b] tracking-tight mt-0.5">
            {activePoint ? activePoint.val : formattedTotal}
          </p>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            +12.4%
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">So với kỳ trước</p>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative w-full h-[120px] bg-slate-50/50 rounded-2xl border border-slate-100 p-1 flex items-center justify-center overflow-hidden">
        <svg 
          className="w-full h-[110px] overflow-visible select-none" 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          <defs>
            <linearGradient id="mobile-revenue-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={15} y1={svgHeight - 20} x2={svgWidth - 15} y2={svgHeight - 20} stroke="#e2e8f0" strokeWidth="1" />
          <line x1={15} y1={svgHeight / 2} x2={svgWidth - 15} y2={svgHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

          {/* Area Fill */}
          <path d={areaString} fill="url(#mobile-revenue-grad)" />

          {/* Smooth Stroke */}
          <path 
            d={pathString} 
            fill="none" 
            stroke="#064e3b" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Points */}
          {chartPoints.map((pt, i) => {
            const isSelected = selectedPointIndex === i;
            return (
              <g key={i} onClick={() => setSelectedPointIndex(i)} className="cursor-pointer">
                {/* Invisible large touch target */}
                <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                {/* Outer halo when active */}
                {isSelected && (
                  <circle cx={pt.x} cy={pt.y} r="8" fill="#FACC15" fillOpacity="0.4" />
                )}

                {/* Inner dot */}
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={isSelected ? 5 : 3.5} 
                  fill={isSelected ? '#FACC15' : '#064e3b'} 
                  stroke="#ffffff" 
                  strokeWidth={isSelected ? 2 : 1.5} 
                />

                {/* Bottom X-Axis Label */}
                <text 
                  x={pt.x} 
                  y={svgHeight - 4} 
                  textAnchor="middle" 
                  fill={isSelected ? '#064e3b' : '#94a3b8'} 
                  fontSize={isSelected ? "9" : "8"} 
                  fontWeight={isSelected ? "900" : "bold"}
                >
                  {chartData.labels[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
        <Info className="w-3 h-3" />
        Chạm vào các điểm trên biểu đồ để xem chi tiết từng mốc
      </p>
    </section>
  );
};
export default MobileRevenueChart;
