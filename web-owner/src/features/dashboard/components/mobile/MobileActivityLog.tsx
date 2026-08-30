import React, { useState } from 'react';
import type { Activity } from '../../types';
import { 
  Activity as ActivityIcon, 
  CheckCircle, 
  Radio, 
  Layers, 
  ChevronDown, 
  Sparkles,
  BellRing
} from 'lucide-react';

interface MobileActivityLogProps {
  activities: Activity[];
}

export const MobileActivityLog: React.FC<MobileActivityLogProps> = ({ activities }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayActivities = isExpanded ? activities : activities.slice(0, 4);

  const getActivityIcon = (type?: string) => {
    switch (type) {
      case 'check-in':
        return (
          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#064e3b] flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        );
      case 'status-change':
        return (
          <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
            <Radio className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 shadow-xs">
            <BellRing className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        );
    }
  };

  return (
    <section className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center font-bold">
            <ActivityIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Nhật ký hoạt động
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Lịch sử sự kiện gần nhất trong ngày</p>
          </div>
        </div>

        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {activities.length} sự kiện
        </span>
      </div>

      {/* Activity Timeline Items */}
      <div className="space-y-3 pt-1">
        {activities.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Chưa có hoạt động nào được ghi nhận hôm nay
          </div>
        ) : (
          displayActivities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 relative group">
              {getActivityIcon(act.type)}
              <div className="flex-1 min-w-0 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-200/50">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[10px] font-extrabold text-[#064e3b] uppercase tracking-wider">
                    {act.type === 'check-in' ? 'Check-in' : act.type === 'status-change' ? 'Đổi trạng thái' : 'Hệ thống'}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 font-mono">
                    {act.time}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-700 leading-snug">
                  {act.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Expand / Collapse Button */}
      {activities.length > 4 && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full pt-2 border-t border-slate-100 text-[11px] font-black text-[#064e3b] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <span>{isExpanded ? 'Thu gọn nhật ký' : `Xem thêm ${activities.length - 4} sự kiện khác`}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </section>
  );
};
export default MobileActivityLog;
