import React from 'react';
import { Card } from '../../../components/ui/Card';
import type { Activity } from '../types';

interface ActivityLogProps {
  isMobile: boolean;
  activities: Activity[];
}

export const ActivityLog = ({ isMobile, activities }: ActivityLogProps) => {
  if (isMobile) {
    return (
      <section className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm w-full">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-3">Nhật ký hoạt động</h2>
        <div className="space-y-3 max-h-[110px] overflow-y-auto pr-1">
          {activities.map(a => (
            <div key={a.id} className="flex gap-2 text-[10px] items-start">
              <span className="font-bold text-slate-400">{a.time}</span>
              <span className="text-slate-600 leading-tight font-medium">{a.message}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Desktop Activity Log
  return (
    <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] w-full">
      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Nhật ký hoạt động</h2>
      <div className="space-y-4 max-h-[160px] overflow-y-auto pr-1">
        {activities.map(a => (
          <div key={a.id} className="flex gap-3 text-xs leading-normal items-start">
            <span className="text-[9px] font-black text-slate-400 tracking-tight py-0.5">{a.time}</span>
            <div className="min-w-0">
              <p className="font-medium text-slate-700 text-[11px]">{a.message}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
export default ActivityLog;
