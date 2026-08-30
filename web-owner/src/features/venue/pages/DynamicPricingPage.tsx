import React, { useState, useEffect, useRef } from 'react';
import { useOperations } from '../../../hooks/useOperationsState';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { dynamicPricingService } from '../services/dynamicPricingService';
import type { PricingRecommendation, PricingAnalyticsSummary } from '../types/dynamicPricing';
import { PricingRecommendationCard } from '../components/operations/PricingRecommendationCard';
import { OccupancyHeatmapModal } from '../components/operations/OccupancyHeatmapModal';
import { AIAnalysisProgressModal } from '../components/operations/AIAnalysisProgressModal';
import { MobileDynamicPricingPage } from './MobileDynamicPricingPage';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Dropdown, type DropdownOption } from '../../../components/ui/Dropdown';
import { Tooltip } from '../../../components/ui/Tooltip';
import {
  Sparkles,
  RefreshCw,
  Map as MapIcon,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Filter,
  CheckCheck,
  Ban,
  Clock,
  Layers,
  AlertCircle,
  Building2,
  BarChart3,
  Sliders,
  Calendar,
  CalendarRange,
  CalendarDays,
  Database,
  Zap,
  Info,
  HelpCircle
} from 'lucide-react';

export const DynamicPricingPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { venues } = useOperations();

  if (isMobile) {
    return <MobileDynamicPricingPage />;
  }

  const formatVND = (n: number) => {
    return n ? n.toLocaleString('vi-VN') + ' đ' : '0 đ';
  };

  const formatDateVN = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('T')[0].split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  const formatDateTimeVN = (dateTimeStr?: string) => {
    if (!dateTimeStr) return '';
    try {
      const d = new Date(dateTimeStr);
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${mins} - ${day}/${month}/${year}`;
    } catch {
      return dateTimeStr;
    }
  };

  // Active Venue Selection
  const activeVenues = venues.filter((v) => v.approvalStatus !== 'DRAFT');
  const [selectedVenueId, setSelectedVenueId] = useState<string>(
    activeVenues.length > 0 ? activeVenues[0].id : ''
  );

  const activeVenue =
    activeVenues.find((v) => v.id === selectedVenueId) ||
    (activeVenues.length > 0 ? activeVenues[0] : null);

  // States
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<PricingAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState<boolean>(false);

  // AI Progress Modal states
  const [analysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStageText, setAnalysisStageText] = useState<string>('');
  const [analysisErrorMsg, setAnalysisErrorMsg] = useState<string>('');
  const [analysisResultSummary, setAnalysisResultSummary] = useState<{
    totalRecs: number;
    surgeCount: number;
    discountCount: number;
  } | null>(null);

  const progressTimerRef = useRef<any>(null);

  // Filters (On-demand queries)
  const [selectedCourtFilter, setSelectedCourtFilter] = useState<string>('ALL');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'SURGE' | 'DISCOUNT'>('ALL');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const getPeriodDisplay = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMon = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMon);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const historyEnd = new Date(monday);
    historyEnd.setDate(monday.getDate() - 1);

    const historyStart = new Date(historyEnd);
    historyStart.setDate(historyEnd.getDate() - (6 * 7 - 1));

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatD = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

    const evalStart = analytics?.evaluationPeriodStart ? formatDateVN(analytics.evaluationPeriodStart) : formatD(monday);
    const evalEnd = analytics?.evaluationPeriodEnd ? formatDateVN(analytics.evaluationPeriodEnd) : formatD(sunday);
    const histStart = analytics?.historicalLookbackStart ? formatDateVN(analytics.historicalLookbackStart) : formatD(historyStart);
    const histEnd = analytics?.historicalLookbackEnd ? formatDateVN(analytics.historicalLookbackEnd) : formatD(historyEnd);
    const lastAnalyzed = analytics?.lastAnalyzedAt ? formatDateTimeVN(analytics.lastAnalyzedAt) : `03:00 - ${formatD(now)}`;

    return { evalStart, evalEnd, histStart, histEnd, lastAnalyzed };
  };

  const periodInfo = getPeriodDisplay();

  // Synchronize venue selection when venues load
  useEffect(() => {
    if (!selectedVenueId && activeVenues.length > 0) {
      setSelectedVenueId(activeVenues[0].id);
    }
  }, [activeVenues, selectedVenueId]);

  const loadData = async (venueId: string, courtIdFilter?: string, dayFilter?: string) => {
    if (!venueId) return;
    setIsLoading(true);
    try {
      const cId = (courtIdFilter && courtIdFilter !== 'ALL') ? courtIdFilter : undefined;
      const dVal = (dayFilter && dayFilter !== 'ALL') ? parseInt(dayFilter, 10) : undefined;

      const [recs, stats] = await Promise.all([
        dynamicPricingService.getVenueRecommendations(venueId),
        dynamicPricingService.getVenuePricingAnalytics(venueId, cId, dVal),
      ]);
      setRecommendations(recs);
      setAnalytics(stats);
      setSelectedIds([]);
      return { recs, stats };
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu định giá động:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeVenue?.id) {
      loadData(activeVenue.id, selectedCourtFilter, selectedDayFilter);
    }
  }, [activeVenue?.id, selectedCourtFilter, selectedDayFilter]);

  const handleTriggerBatch = async () => {
    setIsRefreshing(true);
    setAnalysisModalOpen(true);
    setAnalysisStatus('analyzing');
    setAnalysisProgress(12);
    setAnalysisStageText('Thu thập lịch sử đặt sân (6 tuần qua)...');
    setAnalysisErrorMsg('');
    setAnalysisResultSummary(null);

    // Smooth progressive stages
    let currentP = 12;
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      currentP += Math.random() * 8 + 3;
      if (currentP > 90) currentP = 90;
      setAnalysisProgress(currentP);
      if (currentP > 25 && currentP <= 55) {
        setAnalysisStageText('Phân tích tỷ lệ lấp đầy theo từng khung giờ...');
      } else if (currentP > 55 && currentP <= 80) {
        setAnalysisStageText('Mô hình hóa nhu cầu & tính hệ số định giá AI...');
      } else if (currentP > 80) {
        setAnalysisStageText('Tổng hợp các đề xuất tối ưu doanh thu...');
      }
    }, 280);

    try {
      await dynamicPricingService.triggerBatch();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setAnalysisProgress(100);
      setAnalysisStageText('Hoàn tất phân tích!');

      let latestRecs: PricingRecommendation[] = [];
      if (activeVenue?.id) {
        const res = await loadData(activeVenue.id, selectedCourtFilter, selectedDayFilter);
        if (res?.recs) latestRecs = res.recs;
      }

      const sCount = latestRecs.filter((r) => r.priceChangePercentage > 0).length;
      const dCount = latestRecs.filter((r) => r.priceChangePercentage < 0).length;

      setAnalysisResultSummary({
        totalRecs: latestRecs.length,
        surgeCount: sCount,
        discountCount: dCount,
      });
      setAnalysisStatus('success');
    } catch (err: any) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setAnalysisStatus('error');
      setAnalysisErrorMsg(err.message || 'Lỗi khi kích hoạt phân tích AI');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRecommendations.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleApply = async (ids: string[], customPrices?: Record<string, number>) => {
    try {
      const res = await dynamicPricingService.applyRecommendations({
        recommendationIds: ids,
        customPrices,
      });
      setNotification({ type: 'success', message: res.message });
      if (activeVenue?.id) {
        await loadData(activeVenue.id, selectedCourtFilter, selectedDayFilter);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Lỗi khi áp dụng giá' });
    }
  };

  const handleReject = async (ids: string[]) => {
    try {
      const res = await dynamicPricingService.rejectRecommendations({
        recommendationIds: ids,
        reason: 'Chủ sân từ chối áp dụng mức giá này',
      });
      setNotification({ type: 'success', message: res.message });
      if (activeVenue?.id) {
        await loadData(activeVenue.id, selectedCourtFilter, selectedDayFilter);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Lỗi khi từ chối giá' });
    }
  };

  // Filter recommendations locally
  const filteredRecommendations = recommendations.filter((r) => {
    if (selectedCourtFilter !== 'ALL' && r.courtId !== selectedCourtFilter) return false;
    if (selectedDayFilter !== 'ALL' && r.dayOfWeek.toString() !== selectedDayFilter) return false;
    if (selectedTypeFilter === 'SURGE' && r.priceChangePercentage <= 0) return false;
    if (selectedTypeFilter === 'DISCOUNT' && r.priceChangePercentage >= 0) return false;
    return true;
  });

  const courtOptions = Array.from(
    new Set(recommendations.map((r) => JSON.stringify({ id: r.courtId, name: r.courtName })))
  ).map((str) => JSON.parse(str));

  // Dropdown options
  const venueDropdownOptions: DropdownOption[] = activeVenues.map((v) => ({
    value: v.id,
    label: v.name,
    icon: <Building2 className="w-3.5 h-3.5 text-slate-400" />,
  }));

  const courtDropdownOptions: DropdownOption[] = [
    { value: 'ALL', label: `Tất cả sân (${courtOptions.length})` },
    ...courtOptions.map((c) => ({
      value: c.id,
      label: c.name,
      icon: <Layers className="w-3.5 h-3.5 text-slate-400" />,
    })),
  ];

  const dayDropdownOptions: DropdownOption[] = [
    { value: 'ALL', label: 'Tất cả các ngày' },
    { value: '1', label: 'Thứ 2' },
    { value: '2', label: 'Thứ 3' },
    { value: '3', label: 'Thứ 4' },
    { value: '4', label: 'Thứ 5' },
    { value: '5', label: 'Thứ 6' },
    { value: '6', label: 'Thứ 7' },
    { value: '7', label: 'Chủ Nhật' },
  ];

  const typeDropdownOptions: DropdownOption[] = [
    { value: 'ALL', label: 'Tất cả xu hướng' },
    {
      value: 'SURGE',
      label: 'Giờ cao điểm (Tăng giá)',
      icon: <TrendingUp className="w-3.5 h-3.5 text-rose-500" />,
    },
    {
      value: 'DISCOUNT',
      label: 'Giờ thấp điểm (Giảm giá)',
      icon: <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto matrix-scroll p-4 md:p-6 lg:p-8 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Dự báo giá • AI Pricing Engine</span>
            <Tooltip
              position="bottom-left"
              className="whitespace-normal max-w-sm text-left"
              content="Hệ thống tự động phân tích lịch sử đặt sân của từng ca trong 6 tuần gần nhất để phát hiện khung giờ vàng hoặc giờ vắng khách, từ đó đề xuất mức giá tối ưu doanh thu. Hệ thống KHÔNG tự ý sửa giá thật nếu bạn chưa bấm Áp dụng."
            >
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            </Tooltip>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Định Giá Động & Dự Báo Nhu Cầu
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Tối ưu hóa giá từng khung giờ dựa trên lịch sử lấp đầy thực tế. Chủ sân chủ động kiểm duyệt trước khi áp dụng.
          </p>
        </div>

        {/* Venue Selector & Primary Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Venue Switcher using Dropdown UI */}
          <div className="min-w-[200px]">
            <Dropdown
              options={venueDropdownOptions}
              value={selectedVenueId}
              onChange={(val) => setSelectedVenueId(val)}
              placeholder="Chọn cơ sở thể thao"
            />
          </div>

          <Tooltip
            position="bottom-right"
            className="whitespace-normal max-w-xs text-left"
            content="Mở bản đồ nhiệt tương tác để xem chi tiết tỷ lệ lấp đầy của từng khung giờ trong 7 ngày theo tuần."
          >
            <button
              onClick={() => setIsHeatmapOpen(true)}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <MapIcon className="w-4 h-4 text-emerald-600" />
              <span>Bản đồ nhiệt nhu cầu</span>
            </button>
          </Tooltip>

          <Tooltip
            position="bottom-right"
            className="whitespace-normal max-w-xs text-left"
            content="Kích hoạt quét và tính toán lại toàn bộ lịch sử đặt sân của tất cả các sân ngay lập tức."
          >
            <button
              onClick={handleTriggerBatch}
              disabled={isRefreshing}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Đang tính toán...' : 'Phân tích lại ngay'}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Analysis & Forecast Period Information Card (Light Theme) */}
      {analytics && (
        <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-200/80 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/80">
                <CalendarRange className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800 tracking-tight">
                  Chu kỳ phân tích & Đề xuất giá
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Phân tích lúc: {periodInfo.lastAnalyzed}
                </span>
              </div>
            </div>

            <Tooltip
              position="bottom-right"
              className="whitespace-normal max-w-xs text-left"
              content="Hệ thống tổng hợp lịch sử đặt sân của 6 tuần trước đó để dự báo và đề xuất mức giá cho các ngày trong tuần hiện tại (từ Thứ 2 đến Chủ Nhật)."
            >
              <div className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 cursor-help font-medium self-start md:self-auto">
                <Info className="w-3.5 h-3.5" />
                <span>Ý nghĩa chu kỳ</span>
              </div>
            </Tooltip>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 bg-emerald-100/60 text-emerald-700 rounded-xl mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">Tuần áp dụng đề xuất (Thứ 2 - Chủ Nhật)</div>
                <div className="text-xs md:text-sm font-bold text-slate-800 mt-0.5">
                  {periodInfo.evalStart} — {periodInfo.evalEnd}{' '}
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md ml-1 border border-emerald-200/60">
                    Tuần hiện tại
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 flex items-start gap-3">
              <div className="p-2 bg-teal-100/60 text-teal-700 rounded-xl mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">Cơ sở dữ liệu khảo sát ({analytics.historicalLookbackWeeks || 6} tuần gần nhất)</div>
                <div className="text-xs md:text-sm font-bold text-slate-800 mt-0.5">
                  {periodInfo.histStart} — {periodInfo.histEnd}{' '}
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded-md ml-1">
                    Lịch sử đặt sân
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics KPI Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <Tooltip
                position="bottom-left"
                className="whitespace-normal max-w-xs text-left"
                content="Số khung giờ mà AI nhận thấy cần tăng hoặc giảm giá để tối ưu, đang chờ bạn xem xét và duyệt."
              >
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1 cursor-help">
                  <span>Đề xuất chờ duyệt</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </span>
              </Tooltip>

              <div className="p-2 bg-amber-50 rounded-xl">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {analytics.totalPendingRecommendations}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Khung giờ cần quyết định</span>
          </div>

          <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <Tooltip
                position="bottom-left"
                className="whitespace-normal max-w-xs text-left"
                content="Tổng số đề xuất bạn đã đồng ý và hệ thống đã ghi nhận cập nhật trực tiếp vào bảng giá đặt sân."
              >
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1 cursor-help">
                  <span>Đã áp dụng</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </span>
              </Tooltip>

              <div className="p-2 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600">
              {analytics.totalAppliedRecommendations}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Đã đồng bộ vào bảng giá</span>
          </div>

          <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <Tooltip
                position="bottom-right"
                className="whitespace-normal max-w-xs text-left"
                content="Các đề xuất giá bạn đã bấm Bỏ qua để giữ nguyên mức giá niêm yết ban đầu."
              >
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1 cursor-help">
                  <span>Đã bỏ qua</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </span>
              </Tooltip>

              <div className="p-2 bg-rose-50 rounded-xl">
                <Ban className="w-4 h-4 text-rose-500" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600">
              {analytics.totalRejectedRecommendations}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Giữ nguyên mức giá gốc</span>
          </div>

          <div className="bg-white p-4.5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <Tooltip
                position="bottom-right"
                className="whitespace-normal max-w-xs text-left"
                content="Tỷ lệ % các gợi ý giá từ AI mà bạn thấy phù hợp và đã bấm Áp dụng (Đo lường mức độ tin tưởng của bạn với AI)."
              >
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1 cursor-help">
                  <span>Tỷ lệ đồng thuận</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </span>
              </Tooltip>

              <div className="p-2 bg-blue-50 rounded-xl">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-600">
              {analytics.acceptanceRate}%
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Độ khớp quyết định</span>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all mb-6 ${notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* On-demand Filter & Batch Operations Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Filters using Dropdown Component */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-500 font-bold flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Lọc nhanh:
          </span>

          {/* Court Filter */}
          <div className="min-w-[160px]">
            <Dropdown
              options={courtDropdownOptions}
              value={selectedCourtFilter}
              onChange={(val) => setSelectedCourtFilter(val)}
              placeholder="Chọn sân"
            />
          </div>

          {/* Day Filter */}
          <div className="min-w-[150px]">
            <Dropdown
              options={dayDropdownOptions}
              value={selectedDayFilter}
              onChange={(val) => setSelectedDayFilter(val)}
              placeholder="Chọn ngày"
            />
          </div>

          {/* Trend Type Filter */}
          <div className="min-w-[190px]">
            <Dropdown
              options={typeDropdownOptions}
              value={selectedTypeFilter}
              onChange={(val) => setSelectedTypeFilter(val as any)}
              placeholder="Chọn xu hướng"
            />
          </div>
        </div>

        {/* Batch Actions using Checkbox UI Component */}
        {filteredRecommendations.length > 0 && (
          <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <Checkbox
              checked={
                selectedIds.length > 0 &&
                filteredRecommendations.every((r) => selectedIds.includes(r.id))
              }
              onChange={handleSelectAll}
              label={`Chọn tất cả (${filteredRecommendations.length})`}
              labelClassName="text-xs font-bold text-slate-700"
            />

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <Tooltip position="top" content="Bỏ qua tất cả các đề xuất giá đang được chọn">
                  <button
                    onClick={() => handleReject(selectedIds)}
                    className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Bỏ qua ({selectedIds.length})</span>
                  </button>
                </Tooltip>

                <Tooltip position="top" content="Áp dụng đồng loạt tất cả các mức giá đã chọn vào bảng giá thật">
                  <button
                    onClick={() => handleApply(selectedIds)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Áp dụng ({selectedIds.length})</span>
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Đang truy vấn tỷ lệ lấp đầy & đề xuất giá...</p>
          <p className="text-xs text-slate-400 mt-1">Hệ thống đang đối soát dữ liệu với các ngưỡng an toàn</p>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            Không có đề xuất giá nào đang chờ duyệt
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Tất cả các khung giờ của cơ sở thể thao đều đang hoạt động ở mức giá cân bằng hoặc bạn đã hoàn tất phê duyệt toàn bộ các khuyến nghị gần nhất.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecommendations.map((rec) => (
            <PricingRecommendationCard
              key={rec.id}
              recommendation={rec}
              isSelected={selectedIds.includes(rec.id)}
              onToggleSelect={handleToggleSelect}
              onApplySingle={(id, customPrice) =>
                handleApply([id], customPrice ? { [id]: customPrice } : undefined)
              }
              onRejectSingle={(id) => handleReject([id])}
              formatVND={formatVND}
            />
          ))}
        </div>
      )}

      {/* Heatmap Modal */}
      {analytics && (
        <OccupancyHeatmapModal
          isOpen={isHeatmapOpen}
          onClose={() => setIsHeatmapOpen(false)}
          courtHeatmaps={analytics.courtHeatmaps}
          formatVND={formatVND}
        />
      )}

      {/* AI Analysis Progress & Result Modal */}
      <AIAnalysisProgressModal
        isOpen={analysisModalOpen}
        status={analysisStatus}
        progress={analysisProgress}
        currentStageText={analysisStageText}
        errorMessage={analysisErrorMsg}
        resultSummary={analysisResultSummary}
        onClose={() => setAnalysisModalOpen(false)}
        onRetry={handleTriggerBatch}
      />
    </div>
  );
};
