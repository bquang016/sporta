import React from 'react';
import { Dropdown } from '../../../components/ui/Dropdown';
import type { ComplexId, Complex } from '../types';
import logoSvg from '../../../assets/logo/light/logo-main_40x40px_small.svg';

interface DashboardHeaderProps {
  isMobile: boolean;
  selectedComplex: ComplexId;
  onChangeComplex: (val: ComplexId) => void;
  listComplexes: Complex[];
  // Extra mobile stats
  stats?: {
    revenueK: number;
    occupancy: number;
    activeRatio: string;
  };
}

export const DashboardHeader = ({
  isMobile,
  selectedComplex,
  onChangeComplex,
  listComplexes,
  stats
}: DashboardHeaderProps) => {
  if (isMobile) {
    return (
      <header className="px-5 pt-12 pb-6 bg-brand-emerald text-white rounded-b-[2rem] shadow-md relative z-20 w-full">
        <div className="absolute inset-0 overflow-hidden rounded-b-[2rem] pointer-events-none">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <p className="text-white/60 text-xs font-semibold tracking-wider">Sporty-Tech Owner App</p>
            <h1 className="text-xl font-black tracking-tight mt-0.5">Bảng điều khiển</h1>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-sm overflow-hidden p-1">
            <img src={logoSvg} alt="Sporta Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Custom Dropdown used as venue complex switcher */}
        <div className="relative z-10 mb-6">
          <Dropdown
            options={listComplexes.map(c => ({ value: c.id, label: c.name }))}
            value={selectedComplex}
            onChange={(val) => onChangeComplex(val as ComplexId)}
            className="w-full text-slate-800"
          />
        </div>
        
        {/* KPI Mini Grid */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 relative z-10">
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Doanh thu</p>
              <p className="text-lg font-black text-brand-yellow mt-0.5">{stats.revenueK}k</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Lấp đầy</p>
              <p className="text-lg font-black mt-0.5">{stats.occupancy}%</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Sân mở</p>
              <p className="text-lg font-black mt-0.5">{stats.activeRatio}</p>
            </div>
          </div>
        )}
      </header>
    );
  }

  // Desktop Header
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-surface-variant/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
      <div>
        <h1 className="text-xl font-bold text-on-surface tracking-tight">Tổng quan hoạt động</h1>
        <p className="text-xs text-outline mt-1">
          {selectedComplex === 'all' 
            ? 'Thống kê tổng hợp từ tất cả các cụm sân Sporta' 
            : `Báo cáo chi tiết cho cụm sân tại: ${listComplexes.find(c => c.id === selectedComplex)?.location}`
          }
        </p>
      </div>

      <Dropdown
        options={listComplexes.map(c => ({ value: c.id, label: c.name }))}
        value={selectedComplex}
        onChange={(val) => onChangeComplex(val as ComplexId)}
        className="min-w-[220px]"
      />
    </div>
  );
};
export default DashboardHeader;
