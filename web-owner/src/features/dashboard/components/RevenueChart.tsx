import React from 'react';
import { Card } from '../../../components/ui/Card';
import type { ChartPeriod, ChartData } from '../types';

interface RevenueChartProps {
  isMobile: boolean;
  chartPeriod: ChartPeriod;
  setChartPeriod: (period: ChartPeriod) => void;
  hoveredDataIndex: number | null;
  setHoveredDataIndex: (idx: number | null) => void;
  chartData: ChartData;
  chartPoints: Array<{ x: number; y: number; value: number }>;
  pathString: string;
  areaString: string;
  svgWidth: number;
  svgHeight: number;
}

export const RevenueChart = ({
  isMobile,
  chartPeriod,
  setChartPeriod,
  hoveredDataIndex,
  setHoveredDataIndex,
  chartData,
  chartPoints,
  pathString,
  areaString,
  svgWidth,
  svgHeight
}: RevenueChartProps) => {
  if (isMobile) {
    return (
      <section className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide">Hiệu suất Doanh thu</h2>
          
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
            {(['day', 'quarter', 'year'] as ChartPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-wider ${
                  chartPeriod === p ? 'bg-brand-emerald text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                {p === 'day' ? 'Ngày' : p === 'quarter' ? 'Quý' : 'Năm'}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full flex justify-center items-center h-[110px] bg-slate-50/20 rounded-2xl border border-slate-100 p-1">
          <svg className="w-full h-[95px] overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            <defs>
              <linearGradient id="mobile-chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#064E3B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#064E3B" stopOpacity="0.00" />
              </linearGradient>
            </defs>
            <path d={areaString} fill="url(#mobile-chart-grad)" />
            <path d={pathString} fill="none" stroke="#064E3B" strokeWidth="2.5" strokeLinecap="round" />

            {chartPoints.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#064E3B" stroke="#ffffff" strokeWidth="1" />
            ))}

            {chartPoints.map((pt, i) => (
              <text key={i} x={pt.x} y="96" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">
                {chartData.labels[i]}
              </text>
            ))}
          </svg>
        </div>
      </section>
    );
  }

  // Desktop Revenue Chart
  return (
    <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Biểu đồ doanh thu</h2>
          <p className="text-xs text-slate-400 font-medium">Doanh số thu về qua hệ thống đặt sân trực tuyến</p>
        </div>

        {/* Day/Quarter/Year Switcher Tabs */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
          <button
            onClick={() => { setChartPeriod('day'); setHoveredDataIndex(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all ${
              chartPeriod === 'day' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Ngày
          </button>
          <button
            onClick={() => { setChartPeriod('quarter'); setHoveredDataIndex(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all ${
              chartPeriod === 'quarter' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Quý
          </button>
          <button
            onClick={() => { setChartPeriod('year'); setHoveredDataIndex(null); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all ${
              chartPeriod === 'year' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Năm
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative w-full flex flex-col justify-center items-center h-[210px] border border-slate-100 rounded-2xl bg-slate-50/20 p-2">
        {/* Tooltip Overlay */}
        {hoveredDataIndex !== null && chartPoints[hoveredDataIndex] && (
          <div 
            className="absolute bg-slate-900/95 text-white p-2.5 rounded-xl text-left border border-slate-700 pointer-events-none shadow-md z-10 transition-all duration-150"
            style={{
              left: `${chartPoints[hoveredDataIndex].x - 60}px`,
              top: `${chartPoints[hoveredDataIndex].y - 55}px`,
            }}
          >
            <p className="text-[9px] text-slate-400 font-bold uppercase">{chartData.labels[hoveredDataIndex]}</p>
            <p className="text-xs font-black text-brand-yellow mt-0.5">
              {(() => {
                const raw = chartData.values[hoveredDataIndex];
                const actual = raw > 0 && raw < 10000 ? raw * 1000 : raw;
                return `${Math.round(actual).toLocaleString('vi-VN')}đ`;
              })()}
            </p>
          </div>
        )}

        {/* Chart SVG */}
        <svg className="w-full h-[180px] overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <defs>
            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064E3B" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#064E3B" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          <line x1={40} y1={20} x2={svgWidth - 40} y2={20} stroke="#f1f5f9" strokeWidth="1.5" />
          <line x1={40} y1={svgHeight / 2} x2={svgWidth - 40} y2={svgHeight / 2} stroke="#f1f5f9" strokeWidth="1.5" />
          <line x1={40} y1={svgHeight - 20} x2={svgWidth - 40} y2={svgHeight - 20} stroke="#e2e8f0" strokeWidth="2" />

          <path d={areaString} fill="url(#chart-grad)" className="transition-all duration-500 ease-in-out" />

          <path 
            d={pathString} 
            fill="none" 
            stroke="#064E3B" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-all duration-500 ease-in-out"
          />

          {chartPoints.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredDataIndex === idx ? 7 : 5}
                fill={hoveredDataIndex === idx ? '#FACC15' : '#064E3B'}
                stroke="#ffffff"
                strokeWidth="2.5"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredDataIndex(idx)}
                onMouseLeave={() => setHoveredDataIndex(null)}
              />
            </g>
          ))}

          {chartPoints.map((pt, idx) => (
            <text
              key={idx}
              x={pt.x}
              y={svgHeight - 2}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
              fontWeight="bold"
            >
              {chartData.labels[idx]}
            </text>
          ))}
        </svg>
      </div>
    </Card>
  );
};
export default RevenueChart;
