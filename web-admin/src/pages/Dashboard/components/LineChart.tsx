import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';

export interface ChartData {
  labels: string[];
  values: number[];
}

interface LineChartProps {
  title: string;
  subtitle: string;
  data: ChartData;
  formatValue?: (val: number) => string;
  colorHex?: string; 
  gradientId?: string;
}

export const LineChart = ({
  title,
  subtitle,
  data,
  formatValue = (val: number) => val.toString(),
  colorHex = '#064E3B',
  gradientId = 'chart-grad-default'
}: LineChartProps) => {
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  const svgWidth = 500;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 20;

  const chartPoints = useMemo(() => {
    if (!data.values || data.values.length === 0) return [];
    const maxVal = Math.max(...data.values, 10); // avoid div by 0
    const stepX = (svgWidth - paddingX * 2) / (Math.max(data.values.length - 1, 1));

    return data.values.map((val, idx) => {
      const x = paddingX + idx * stepX;
      const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - paddingY * 2);
      return { x, y, value: val };
    });
  }, [data, svgWidth, svgHeight, paddingX, paddingY]);

  const pathString = useMemo(() => {
    return chartPoints.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = chartPoints[idx - 1];
      const cpX1 = prev.x + (pt.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = prev.x + 2 * (pt.x - prev.x) / 3;
      const cpY2 = pt.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
    }, '');
  }, [chartPoints]);

  const areaString = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const startPoint = `M ${chartPoints[0].x} ${svgHeight - paddingY}`;
    const endPoint = `L ${chartPoints[chartPoints.length - 1].x} ${svgHeight - paddingY} Z`;
    return `${startPoint} L ${chartPoints[0].x} ${chartPoints[0].y} ${pathString.substring(1)} ${endPoint}`;
  }, [chartPoints, pathString, svgHeight, paddingY]);

  return (
    <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">{title}</h2>
          <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
        </div>
      </div>

      <div className="relative w-full flex flex-col justify-center items-center h-[210px] border border-slate-100 rounded-2xl bg-slate-50/20 p-2">
        {hoveredDataIndex !== null && chartPoints[hoveredDataIndex] && (
          <div 
            className="absolute bg-slate-900/95 text-white p-2.5 rounded-xl text-left border border-slate-700 pointer-events-none shadow-md z-10 transition-all duration-150"
            style={{
              left: `${Math.min(Math.max(chartPoints[hoveredDataIndex].x - 60, 0), svgWidth - 120)}px`,
              top: `${Math.max(chartPoints[hoveredDataIndex].y - 55, 0)}px`,
            }}
          >
            <p className="text-[9px] text-slate-400 font-bold uppercase">{data.labels[hoveredDataIndex]}</p>
            <p className="text-xs font-black mt-0.5" style={{ color: '#FACC15' }}>
              {formatValue(data.values[hoveredDataIndex])}
            </p>
          </div>
        )}

        <svg className="w-full h-[180px] overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorHex} stopOpacity="0.45" />
              <stop offset="100%" stopColor={colorHex} stopOpacity="0.00" />
            </linearGradient>
          </defs>

          <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1.5" />
          <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#f1f5f9" strokeWidth="1.5" />
          <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#e2e8f0" strokeWidth="2" />

          <path d={areaString} fill={`url(#${gradientId})`} className="transition-all duration-500 ease-in-out" />

          <path 
            d={pathString} 
            fill="none" 
            stroke={colorHex} 
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
                fill={hoveredDataIndex === idx ? '#FACC15' : colorHex}
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
              {data.labels[idx]}
            </text>
          ))}
        </svg>
      </div>
    </Card>
  );
};
export default LineChart;
