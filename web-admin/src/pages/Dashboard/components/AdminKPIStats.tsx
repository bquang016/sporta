import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  isPositive?: boolean;
  positive?: boolean;
  tooltip?: string;
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
  },
  {
    bgBlur: 'bg-brand-emerald/10',
    iconBg: 'bg-brand-emerald/20',
    iconText: 'text-brand-emerald',
    iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  }
];

export const AdminKPIStats = ({ metrics }: AdminKPIStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full">
      {metrics.map((metric, idx) => {
        const style = STYLES[idx % STYLES.length];
        const isPos = metric.isPositive ?? metric.positive ?? true;
        const isWarning = metric.change?.includes('Cần xử lý');

        let badgeStyle = 'text-emerald-700 bg-emerald-50/80 border-emerald-200/60';
        let dotStyle = 'bg-emerald-500';

        if (isWarning) {
          badgeStyle = 'text-amber-700 bg-amber-50/90 border-amber-200/80';
          dotStyle = 'bg-amber-500';
        } else if (!isPos) {
          badgeStyle = 'text-rose-700 bg-rose-50/80 border-rose-200/60';
          dotStyle = 'bg-rose-500';
        }

        return (
          <Card key={idx} className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 ${style.bgBlur}`}></div>
            
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-wider">{metric.label}</h3>
                {metric.tooltip && (
                  <Tooltip content={metric.tooltip} position="top">
                    <svg className="w-3.5 h-3.5 text-outline cursor-pointer hover:text-brand-emerald transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
                )}
              </div>
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
              <div className="mt-2 flex items-center">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badgeStyle}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`}></span>
                  {metric.change}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminKPIStats;
