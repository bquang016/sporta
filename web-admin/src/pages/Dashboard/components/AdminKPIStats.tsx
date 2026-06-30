import React from 'react';
import { Card } from '@/components/ui/Card';

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

interface AdminKPIStatsProps {
  metrics: DashboardMetric[];
}

const STYLES = [
  {
    bgBlur: 'bg-brand-yellow/5',
    iconBg: 'bg-brand-yellow/15',
    iconText: 'text-amber-600',
    iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    bgBlur: 'bg-brand-emerald/5',
    iconBg: 'bg-brand-emerald/10',
    iconText: 'text-brand-emerald',
    iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    bgBlur: 'bg-blue-500/5',
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    bgBlur: 'bg-purple-500/5',
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-600',
    iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  }
];

export const AdminKPIStats = ({ metrics }: AdminKPIStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {metrics.map((metric, idx) => {
        const style = STYLES[idx % STYLES.length];
        
        return (
          <Card key={idx} className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 ${style.bgBlur}`}></div>
            <div className="flex justify-between items-start z-10">
              <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-wider">{metric.label}</h3>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${style.iconBg} ${style.iconText}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={style.iconPath} />
                </svg>
              </div>
            </div>
            <div className="z-10 mt-2">
              <p className="text-2xl font-black text-slate-800 tracking-tight">
                {metric.value}
              </p>
              <p className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${metric.isPositive ? 'text-emerald-600' : 'text-error'}`}>
                {metric.isPositive && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1"></span>
                )}
                {metric.change}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminKPIStats;
