import React, { useState } from 'react';
import type { PricingRecommendation } from '../../types/dynamicPricing';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Tooltip } from '../../../../components/ui/Tooltip';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  CheckCircle,
  XCircle,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  Activity,
  HelpCircle,
  Info
} from 'lucide-react';

interface PricingRecommendationCardProps {
  recommendation: PricingRecommendation;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onApplySingle: (id: string, customPrice?: number) => void;
  onRejectSingle: (id: string) => void;
  formatVND: (n: number) => string;
}

export const PricingRecommendationCard: React.FC<PricingRecommendationCardProps> = ({
  recommendation,
  isSelected,
  onToggleSelect,
  onApplySingle,
  onRejectSingle,
  formatVND,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState(
    recommendation.suggestedPrice.toString()
  );

  const isSurge = recommendation.priceChangePercentage > 0;
  const isDiscount = recommendation.priceChangePercentage < 0;
  const isNeutral = recommendation.priceChangePercentage === 0;

  const formatReason = (text: string) => {
    if (!text) return '';
    return text
      .replace(/🔥/g, '[Nhu cầu cao]')
      .replace(/❄️/g, '[Nhu cầu thấp]')
      .replace(/⚖️/g, '[Nhu cầu ổn định]')
      .replace(/🎯|📊|⚡/g, '')
      .trim();
  };

  const handleApplyCustom = () => {
    const val = parseFloat(customPriceInput.replace(/\D/g, ''));
    if (!isNaN(val) && val > 0) {
      onApplySingle(recommendation.id, val);
      setIsEditing(false);
    }
  };

  const getConfidenceBadge = () => {
    switch (recommendation.confidenceLevel) {
      case 'HIGH':
        return (
          <Tooltip
            position="bottom-right"
            className="whitespace-normal max-w-xs text-left"
            content="Độ tin cậy cao: Sân đã hoạt động trên 4 tuần, tỷ lệ dự báo chuẩn xác cao dựa 100% vào lịch sử đặt sân thực tế của chính sân này."
          >
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-help">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tin cậy cao</span>
            </span>
          </Tooltip>
        );
      case 'MEDIUM':
        return (
          <Tooltip
            position="bottom-right"
            className="whitespace-normal max-w-xs text-left"
            content="Dữ liệu ổn định: Sân đã hoạt động 2-3 tuần. Thuật toán đang kết hợp dữ liệu sân với dữ liệu chuẩn ngành."
          >
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 cursor-help">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>Dữ liệu ổn định</span>
            </span>
          </Tooltip>
        );
      case 'LOW':
      default:
        return (
          <Tooltip
            position="bottom-right"
            className="whitespace-normal max-w-xs text-left"
            content="Sân mới hoạt động (< 2 tuần): Chưa có đủ lịch sử riêng. AI tạm thời ước tính dựa trên tỷ lệ lấp đầy trung bình toàn hệ thống của môn thể thao này để tránh biến động giá bất thường."
          >
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-sky-50 text-sky-700 border border-sky-200 cursor-help">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Sân mới (Ước tính theo môn)</span>
            </span>
          </Tooltip>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('T')[0].split('-');
      return `${d}/${m}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-200 ${
        isSelected
          ? 'bg-emerald-50/40 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/20'
          : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
      }`}
    >
      {/* Header: Checkbox + Court + Slot */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelect(recommendation.id)}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">
                {recommendation.courtName}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-md">
                {recommendation.dayOfWeekLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{recommendation.timeSlotLabel}</span>
              {recommendation.effectiveDateStart && recommendation.effectiveDateEnd && (
                <span className="text-[10px] text-slate-400 font-medium">
                  • Tuần {formatDate(recommendation.effectiveDateStart)} - {formatDate(recommendation.effectiveDateEnd)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div>{getConfidenceBadge()}</div>
      </div>

      {/* Pricing Comparison Block */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl mb-3 border border-slate-100">
        <div>
          <Tooltip
            position="top-left"
            className="whitespace-normal max-w-xs text-left"
            content="Giá niêm yết ban đầu của sân. Đây là mốc neo an toàn cố định, không bao giờ bị biến dạng qua các lần đổi giá."
          >
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 cursor-help">
              <span>Giá cơ sở</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
          </Tooltip>
          <div className="text-sm font-semibold text-slate-600 mt-0.5">
            {formatVND(recommendation.basePrice)}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Tooltip
              position="top-right"
              className="whitespace-normal max-w-xs text-left"
              content="Giá AI gợi ý sau khi tối ưu theo nhu cầu khách và kẹp trong biên độ an toàn ±20%."
            >
              <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 cursor-help">
                <span>AI Đề xuất</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
            </Tooltip>

            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.2 rounded ${
                isSurge
                  ? 'bg-rose-100 text-rose-700'
                  : isDiscount
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isSurge && <TrendingUp className="w-3 h-3" />}
              {isDiscount && <TrendingDown className="w-3 h-3" />}
              {isNeutral && <Minus className="w-3 h-3" />}
              {isSurge ? `+${recommendation.priceChangePercentage}%` : `${recommendation.priceChangePercentage}%`}
            </span>
          </div>

          <div
            className={`text-base font-extrabold mt-0.5 ${
              isSurge
                ? 'text-rose-600'
                : isDiscount
                ? 'text-emerald-600'
                : 'text-slate-800'
            }`}
          >
            {formatVND(recommendation.suggestedPrice)}
          </div>
        </div>
      </div>

      {/* Occupancy Rate Bar & Explanation */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <Tooltip
            position="top-left"
            className="whitespace-normal max-w-xs text-left"
            content="Tỷ lệ số ca sân đã được đặt và thanh toán thành công trong 6 tuần gần nhất. Khung giờ > 70% là giờ đông khách, < 40% là giờ vắng khách."
          >
            <span className="text-slate-500 font-medium flex items-center gap-1 cursor-help">
              <span>Tỷ lệ lấp đầy 6 tuần:</span>
              <Info className="w-3 h-3 text-slate-400" />
            </span>
          </Tooltip>

          <span className="font-bold text-slate-700">
            {Math.round(recommendation.occupancyRate * 100)}%
          </span>
        </div>

        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              recommendation.occupancyRate >= 0.7
                ? 'bg-rose-500'
                : recommendation.occupancyRate <= 0.4
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, recommendation.occupancyRate * 100))}%` }}
          />
        </div>
      </div>

      {/* Reason text */}
      <div className="p-2.5 bg-emerald-50/50 rounded-xl text-xs text-slate-700 mb-3 border border-emerald-100 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{formatReason(recommendation.recommendationReason)}</span>
      </div>

      {/* Custom Price Editing Drawer */}
      {isEditing && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl mb-3 flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-amber-900 block mb-1">
              Nhập giá tùy chỉnh (VNĐ):
            </label>
            <input
              type="text"
              value={customPriceInput}
              onChange={(e) => setCustomPriceInput(e.target.value)}
              className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="VD: 220000"
            />
          </div>
          <button
            onClick={handleApplyCustom}
            className="mt-4 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
          >
            Lưu & Áp dụng
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <Tooltip position="top-left" content="Bỏ qua và giữ nguyên giá gốc hiện tại cho khung giờ này">
          <button
            onClick={() => onRejectSingle(recommendation.id)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Bỏ qua</span>
          </button>
        </Tooltip>

        <div className="flex items-center gap-2">
          <Tooltip position="top-right" content="Chủ sân tự nhập một mức giá mong muốn khác trước khi duyệt">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sửa giá</span>
            </button>
          </Tooltip>

          <Tooltip position="top-right" content="Cập nhật mức giá đề xuất này vào bảng giá đặt sân thật của khách">
            <button
              onClick={() => onApplySingle(recommendation.id)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Áp dụng</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
