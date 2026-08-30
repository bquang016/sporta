import React, { useState } from 'react';
import type { VenueResponse, CourtResponse } from '../../types';
import { 
  Zap, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  X, 
  Flame, 
  Map as MapIcon,
  Sliders,
  DollarSign
} from 'lucide-react';

interface MobilePricingTabProps {
  activeVenue: VenueResponse | null;
  courts: CourtResponse[];
  formatVND: (n: number) => string;
}

export const MobilePricingTab: React.FC<MobilePricingTabProps> = ({
  activeVenue,
  courts: _courts,
  formatVND
}) => {
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Mocked AI Smart Pricing Recommendations for Venue
  const recommendations = [
    {
      id: 'rec-1',
      title: 'Tăng giá giờ vàng (17:30 - 20:30)',
      description: 'Nhu cầu đặt sân tăng 42% vào khung giờ này các ngày trong tuần.',
      targetCourts: 'Tất cả các sân',
      currentPrice: 120000,
      suggestedPrice: 150000,
      type: 'surge',
      revenueImpact: '+18% doanh thu/tháng',
      confidence: 94
    },
    {
      id: 'rec-2',
      title: 'Giảm giá kích cầu buổi trưa (11:30 - 14:00)',
      description: 'Tỷ lệ lấp đầy thấp (<20%). Khuyến nghị giảm nhẹ để thu hút nhóm sinh viên.',
      targetCourts: 'Sân 1, Sân 2',
      currentPrice: 100000,
      suggestedPrice: 80000,
      type: 'discount',
      revenueImpact: '+12% lượng khách',
      confidence: 88
    },
    {
      id: 'rec-3',
      title: 'Phụ phí đặt sân cuối tuần (Thứ 7 & CN)',
      description: 'Khung giờ chiều tối thứ 7 & Chủ nhật thường kín lịch trước 3 ngày.',
      targetCourts: 'Tất cả các sân',
      currentPrice: 130000,
      suggestedPrice: 160000,
      type: 'surge',
      revenueImpact: '+25% lợi nhuận cuối tuần',
      confidence: 96
    }
  ];

  const handleApply = (id: string) => {
    setAppliedIds(prev => [...prev, id]);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  return (
    <div className="space-y-4 px-4 pb-8 select-none">
      {/* 1. AI Banner Strip */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#064e3b] to-emerald-900 text-white p-4 rounded-3xl shadow-md space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-yellow text-slate-900 flex items-center justify-center font-black shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Định giá động AI</h3>
            <p className="text-[10px] text-emerald-200/90 font-medium">Tự động đề xuất giá tối ưu hóa doanh thu</p>
          </div>
        </div>

        <p className="text-[11px] text-white/80 font-normal leading-relaxed pt-1">
          Hệ thống Sporta AI phân tích lịch sử đặt sân 30 ngày qua tại <strong className="text-brand-yellow">{activeVenue?.name || 'cụm sân'}</strong> để đưa ra các gợi ý định giá hiệu quả nhất.
        </p>
      </div>

      {/* 2. Recommendations Feed */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5 px-1">
          <Zap className="w-3.5 h-3.5 text-brand-yellow fill-brand-yellow" />
          <span>Gợi ý điều chỉnh giá ({recommendations.filter(r => !dismissedIds.includes(r.id)).length})</span>
        </h4>

        {recommendations.map(rec => {
          if (dismissedIds.includes(rec.id)) return null;
          const isApplied = appliedIds.includes(rec.id);

          return (
            <div 
              key={rec.id}
              className={`bg-white rounded-3xl p-4 border transition-all shadow-2xs space-y-3 ${
                isApplied ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-400' : 'border-slate-200/80'
              }`}
            >
              {/* Top: Title, Badge, Dismiss */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      rec.type === 'surge' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}>
                      {rec.type === 'surge' ? <TrendingUp className="w-3 h-3 text-amber-700" /> : <TrendingDown className="w-3 h-3 text-blue-700" />}
                      {rec.type === 'surge' ? 'Tăng giá giờ vàng' : 'Kích cầu giờ thấp'}
                    </span>
                    <span className="text-[9px] font-extrabold text-brand-emerald bg-emerald-50 px-1.5 py-0.5 rounded">
                      Độ tin cậy {rec.confidence}%
                    </span>
                  </div>
                  <h5 className="text-xs font-black text-slate-900 tracking-tight">{rec.title}</h5>
                </div>

                {!isApplied && (
                  <button
                    type="button"
                    onClick={() => handleDismiss(rec.id)}
                    className="touch-target text-slate-400 hover:text-slate-600 p-1"
                    title="Bỏ qua gợi ý"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-[10px] text-slate-500 font-medium leading-normal">
                {rec.description}
              </p>

              {/* Price comparison row */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Giá hiện tại</span>
                  <span className="text-xs font-bold text-slate-500 line-through">{formatVND(rec.currentPrice)}</span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold text-brand-emerald uppercase tracking-wider block">Giá AI đề xuất</span>
                  <span className="text-sm font-black text-brand-emerald">{formatVND(rec.suggestedPrice)}/ca</span>
                </div>
              </div>

              {/* Estimated impact & Action button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-xl">
                  {rec.revenueImpact}
                </span>

                {isApplied ? (
                  <div className="flex items-center gap-1 text-xs font-black text-brand-emerald bg-emerald-100/80 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã áp dụng</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApply(rec.id)}
                    className="touch-target px-4 py-2 bg-brand-yellow active:bg-yellow-400 text-slate-900 text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Áp dụng</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default MobilePricingTab;
