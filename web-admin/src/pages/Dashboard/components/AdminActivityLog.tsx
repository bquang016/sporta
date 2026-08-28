import { Card } from '@/components/ui/Card';

export interface AdminActivity {
  id: string;
  time: string;
  message: string;
}

interface AdminActivityLogProps {
  activities: AdminActivity[];
}

export const AdminActivityLog = ({ activities }: AdminActivityLogProps) => {
  return (
    <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] w-full">
      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Nhật ký hệ thống Admin</h2>
      <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
        {activities.map(a => (
          <div key={a.id} className="flex gap-3 text-xs leading-normal items-start">
            <span className="text-[9px] font-black text-slate-400 tracking-tight py-0.5 whitespace-nowrap">{a.time}</span>
            <div className="min-w-0">
              <p className="font-medium text-slate-700 text-[11px]">{a.message}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AdminActivityLog;
