import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOperations } from '../../../hooks/useOperationsState';
import { dynamicPricingService } from '../services/dynamicPricingService';
import type { PricingRecommendation, PricingAnalyticsSummary } from '../types/dynamicPricing';
import { OccupancyHeatmapModal } from '../components/operations/OccupancyHeatmapModal';
import { AIAnalysisProgressModal } from '../components/operations/AIAnalysisProgressModal';
import { CurrencyInput } from '../../../components/ui/CurrencyInput';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  RefreshCw,
  Map as MapIcon,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  ChevronDown,
  Check,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Zap,
  Info,
  Clock,
  Edit3,
  Flame
} from 'lucide-react';

export const MobileDynamicPricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { venues } = useOperations();

  const activeVenues = useMemo(
    () => venues.filter((v) => v.approvalStatus !== 'DRAFT'),
    [venues]
  );

  const [selectedVenueId, setSelectedVenueId] = useState<string>(
    activeVenues.length > 0 ? activeVenues[0].id : ''
  );

  const activeVenue = useMemo(
    () => activeVenues.find((v) => v.id === selectedVenueId) || activeVenues[0] || null,
    [activeVenues, selectedVenueId]
  );

  // States
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<PricingAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState<boolean>(false);
  const [isVenuePickerOpen, setIsVenuePickerOpen] = useState<boolean>(false);

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

  // Filters
  const [selectedCourtFilter, setSelectedCourtFilter] = useState<string>('ALL');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'SURGE' | 'DISCOUNT'>('ALL');

  // Custom Price Sheet state
  const [editingRec, setEditingRec] = useState<PricingRecommendation | null>(null);
  const [customPriceValue, setCustomPriceValue] = useState<number>(0);

  // Toast / Notification banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const formatVND = (n: number) => {
    return n ? n.toLocaleString('vi-VN') + ' đ' : '0 đ';
  };

  const getDayName = (dow: number) => {
    const map: Record<number, string> = {
      1: 'Thứ 2',
      2: 'Thứ 3',
      3: 'Thứ 4',
      4: 'Thứ 5',
      5: 'Thứ 6',
      6: 'Thứ 7',
      7: 'Chủ Nhật'
    };
    return map[dow] || `Thứ ${dow}`;
  };

  const loadData = async (venueId: string) => {
    if (!venueId) return;
    setIsLoading(true);
    try {
      const [recs, stats] = await Promise.all([
        dynamicPricingService.getVenueRecommendations(venueId),
        dynamicPricingService.getVenuePricingAnalytics(venueId),
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
      loadData(activeVenue.id);
    }
  }, [activeVenue?.id]);

  useEffect(() => {
    if (!selectedVenueId && activeVenues.length > 0) {
      setSelectedVenueId(activeVenues[0].id);
    }
  }, [activeVenues, selectedVenueId]);

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
        const res = await loadData(activeVenue.id);
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

  const handleApplySingle = async (rec: PricingRecommendation) => {
    try {
      const res = await dynamicPricingService.applyRecommendations({
        recommendationIds: [rec.id]
      });
      setNotification({ type: 'success', message: res.message || 'Đã áp dụng mức giá thành công!' });
      if (activeVenue?.id) await loadData(activeVenue.id);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Lỗi khi áp dụng giá' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleApplyCustomPrice = async () => {
    if (!editingRec) return;
    if (customPriceValue <= 0) {
      setNotification({ type: 'error', message: 'Giá tùy chỉnh phải lớn hơn 0đ' });
      return;
    }

    try {
      const res = await dynamicPricingService.applyRecommendations({
        recommendationIds: [editingRec.id],
        customPrices: { [editingRec.id]: customPriceValue }
      });
      setNotification({ type: 'success', message: res.message || 'Đã áp dụng giá tùy chỉnh!' });
      setEditingRec(null);
      if (activeVenue?.id) await loadData(activeVenue.id);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Lỗi khi áp dụng giá' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleRejectSingle = async (rec: PricingRecommendation) => {
    try {
      const res = await dynamicPricingService.rejectRecommendations({
        recommendationIds: [rec.id],
        reason: 'Chủ sân bỏ qua đề xuất này'
      });
      setNotification({ type: 'success', message: res.message || 'Đã bỏ qua đề xuất giá' });
      if (activeVenue?.id) await loadData(activeVenue.id);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Lỗi khi từ chối giá' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleBulkApply = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await dynamicPricingService.applyRecommendations({
        recommendationIds: selectedIds
      });
      setNotification({ type: 'success', message: res.message || `Đã áp dụng ${selectedIds.length} đề xuất giá!` });
      setSelectedIds([]);
      if (activeVenue?.id) await loadData(activeVenue.id);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Lỗi khi áp dụng hàng loạt' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((r) => {
      if (selectedCourtFilter !== 'ALL' && r.courtId !== selectedCourtFilter) return false;
      if (selectedDayFilter !== 'ALL' && r.dayOfWeek.toString() !== selectedDayFilter) return false;
      if (selectedTypeFilter === 'SURGE' && r.priceChangePercentage <= 0) return false;
      if (selectedTypeFilter === 'DISCOUNT' && r.priceChangePercentage >= 0) return false;
      return true;
    });
  }, [recommendations, selectedCourtFilter, selectedDayFilter, selectedTypeFilter]);

  const uniqueCourts = useMemo(() => {
    const map = new Map<string, string>();
    recommendations.forEach((r) => {
      if (r.courtId && r.courtName) map.set(r.courtId, r.courtName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [recommendations]);

  const surgeCount = recommendations.filter((r) => r.priceChangePercentage > 0).length;
  const discountCount = recommendations.filter((r) => r.priceChangePercentage < 0).length;

  return (
    <div
      className="font-sans min-h-dvh bg-slate-100/70 select-none pb-28 flex flex-col"
      style={{ touchAction: 'pan-y' }}
    >
      {/* ── 1. LIQUID GLASS HEADER ── */}
      <header
        className="relative bg-gradient-to-b from-[#002b1f] via-[#064e3b] to-[#043d2e] text-white rounded-b-[2.5rem] shadow-xl z-20 pb-5 transition-all overflow-hidden"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        {/* Glow Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -left-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 px-4 space-y-3.5">
          {/* Top Bar: Back button & Full-width Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="touch-target w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-transform backdrop-blur-md shrink-0"
              title="Quay lại"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-brand-yellow uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 fill-brand-yellow shrink-0" />
                <span>Trí Tuệ Doanh Thu</span>
              </div>
              <h1 className="text-lg font-black tracking-tight text-white mt-0.5 truncate">
                Dự Báo & Giá Động AI
              </h1>
            </div>
          </div>

          {/* Active Facility Card (Tap to open Venue Picker Bottom Sheet) */}
          {activeVenues.length > 0 && (
            <button
              type="button"
              onClick={() => setIsVenuePickerOpen(true)}
              className="w-full bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/15 backdrop-blur-xl rounded-2xl p-3 text-left transition-all shadow-sm flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-yellow text-[#064e3b] flex items-center justify-center shrink-0 shadow-sm font-black">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Cụm sân phân tích</span>
                  <p className="text-xs font-black text-white truncate">
                    {activeVenue?.name || 'Chọn cụm sân'}
                  </p>
                  <p className="text-[10px] text-white/60 font-medium truncate mt-0.5">
                    {activeVenue?.addressDetail || activeVenue?.location || 'Khu vực quản lý'}
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white/80">
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
          )}

          {/* Dedicated 2-Button Action Bar (Bản đồ nhiệt & Phân tích lại) */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setIsHeatmapOpen(true)}
              className="touch-target py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/15 text-white text-xs font-black flex items-center justify-center gap-2 backdrop-blur-md shadow-xs transition-transform"
              title="Xem bản đồ nhiệt tỷ lệ lấp đầy"
            >
              <MapIcon className="w-4 h-4 text-brand-yellow" />
              <span>Bản đồ nhiệt</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerBatch}
              disabled={isRefreshing}
              className="touch-target py-2.5 px-3 rounded-2xl bg-brand-yellow active:bg-yellow-400 text-[#064e3b] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98] disabled:opacity-50"
              title="Chạy lại phân tích AI"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Đang phân tích...' : 'Phân tích lại'}</span>
            </button>
          </div>

          {/* 3 Metric Cards Strip */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-2.5 text-center backdrop-blur-md">
              <span className="text-[9px] font-bold uppercase text-white/70 block">Đề xuất AI</span>
              <p className="text-sm font-black text-white tracking-tight mt-0.5">
                {recommendations.length} ca
              </p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl p-2.5 text-center backdrop-blur-md">
              <span className="text-[9px] font-bold uppercase text-rose-300 block flex items-center justify-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> Giờ vàng
              </span>
              <p className="text-sm font-black text-rose-300 tracking-tight mt-0.5">
                +{surgeCount}
              </p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl p-2.5 text-center backdrop-blur-md">
              <span className="text-[9px] font-bold uppercase text-emerald-300 block flex items-center justify-center gap-0.5">
                <TrendingDown className="w-2.5 h-2.5" /> Kích cầu
              </span>
              <p className="text-sm font-black text-emerald-300 tracking-tight mt-0.5">
                +{discountCount}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. TOAST NOTIFICATION ── */}
      {notification && (
        <div className="px-4 pt-3 animate-fadeIn">
          <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-sm ${notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="flex-1">{notification.message}</span>
          </div>
        </div>
      )}

      {/* ── 3. FILTER BAR ── */}
      <div className="px-4 pt-3.5 space-y-2.5">
        {/* Trend Type Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scroll-x-touch py-0.5">
          {[
            { id: 'ALL', label: `Tất cả (${recommendations.length})` },
            { id: 'SURGE', label: `Giờ vàng (+${surgeCount})`, icon: <TrendingUp className="w-3 h-3 text-rose-500" /> },
            { id: 'DISCOUNT', label: `Kích cầu (+${discountCount})`, icon: <TrendingDown className="w-3 h-3 text-emerald-500" /> },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedTypeFilter(f.id as any)}
              className={`touch-target px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1 ${selectedTypeFilter === f.id
                  ? 'bg-[#064e3b] text-white shadow-xs scale-102'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {f.icon}
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Day of Week Filter Bar */}
        <div className="flex items-center gap-1 overflow-x-auto scroll-x-touch py-0.5">
          {[
            { id: 'ALL', label: 'Cả tuần' },
            { id: '1', label: 'T2' },
            { id: '2', label: 'T3' },
            { id: '3', label: 'T4' },
            { id: '4', label: 'T5' },
            { id: '5', label: 'T6' },
            { id: '6', label: 'T7' },
            { id: '7', label: 'CN' },
          ].map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDayFilter(d.id)}
              className={`touch-target px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all shrink-0 ${selectedDayFilter === d.id
                  ? 'bg-brand-yellow text-[#064e3b] shadow-xs scale-105'
                  : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50'
                }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Court Filter Chips (If multiple courts) */}
        {uniqueCourts.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scroll-x-touch py-0.5">
            <button
              type="button"
              onClick={() => setSelectedCourtFilter('ALL')}
              className={`touch-target px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all whitespace-nowrap ${selectedCourtFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-200 text-slate-600'
                }`}
            >
              Tất cả sân
            </button>
            {uniqueCourts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCourtFilter(c.id)}
                className={`touch-target px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all whitespace-nowrap ${selectedCourtFilter === c.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-200 text-slate-600'
                  }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. RECOMMENDATIONS LIST ── */}
      <main className={`px-4 pt-3.5 space-y-3 flex-1 ${selectedIds.length > 0 ? 'pb-36' : 'pb-6'}`}>
        {isLoading ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-brand-emerald rounded-full animate-spin mx-auto" />
            <p className="text-xs font-black text-slate-700">Đang phân tích dữ liệu AI...</p>
            <p className="text-[10px] text-slate-400 font-medium">Khảo sát lịch sử lấp đầy của 6 tuần gần nhất</p>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-300 select-none space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">Không có đề xuất nào phù hợp</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Các mức giá hiện tại đang tối ưu hoặc thử đổi bộ lọc khác.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTriggerBatch}
              disabled={isRefreshing}
              className="touch-target inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-black shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Phân tích lại toàn bộ</span>
            </button>
          </div>
        ) : (
          filteredRecommendations.map((rec) => {
            const isSurge = rec.priceChangePercentage > 0;
            const isSelected = selectedIds.includes(rec.id);

            return (
              <div
                key={rec.id}
                className={`bg-white rounded-3xl p-4 border transition-all shadow-2xs space-y-3 relative overflow-hidden ${isSelected
                    ? 'border-brand-emerald ring-2 ring-brand-emerald/20 bg-emerald-50/15'
                    : 'border-slate-200/80 hover:border-slate-300'
                  }`}
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(rec.id)}
                      className="touch-target w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        backgroundColor: isSelected ? '#064e3b' : '#ffffff',
                        borderColor: isSelected ? '#064e3b' : '#cbd5e1'
                      }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 truncate tracking-tight">
                          {getDayName(rec.dayOfWeek)} • {rec.courtName}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{rec.startTime} - {rec.endTime}</span>
                      </p>
                    </div>
                  </div>

                  {/* Surge / Discount Badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${isSurge
                      ? 'bg-rose-50 text-rose-900 border border-rose-300'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                    }`}>
                    {isSurge ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-rose-600" />
                        <span>+{Math.abs(Math.round(rec.priceChangePercentage))}% Giờ vàng</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-emerald-600" />
                        <span>-{Math.abs(Math.round(rec.priceChangePercentage))}% Kích cầu</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Price Comparison Strip */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Giá hiện tại</span>
                    <p className="text-xs font-black text-slate-500 line-through">
                      {formatVND(rec.basePrice)}
                    </p>
                  </div>

                  <div className="text-slate-300 font-bold text-sm">➔</div>

                  <div className="space-y-0.5 text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block flex items-center justify-end gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-brand-emerald" /> Giá AI đề xuất
                    </span>
                    <p className={`text-sm font-black tracking-tight ${isSurge ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {formatVND(rec.suggestedPrice)}
                    </p>
                  </div>
                </div>

                {/* AI Reasoning Strip */}
                <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-[10px] text-slate-700 font-medium leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-emerald shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-brand-emerald">Đánh giá AI: </span>
                    <span>{rec.recommendationReason || (isSurge ? 'Tỷ lệ lấp đầy cao trong 6 tuần qua. Khuyến nghị tăng giá thu lợi nhuận.' : 'Tỷ lệ lấp đầy thấp. Khuyến nghị giảm giá kích cầu.')}</span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleApplySingle(rec)}
                    className="touch-target col-span-1 py-2 bg-brand-emerald active:bg-emerald-950 text-white font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 active:scale-95 shadow-xs"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Áp dụng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingRec(rec);
                      setCustomPriceValue(rec.suggestedPrice);
                    }}
                    className="touch-target col-span-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Edit3 className="w-3 h-3 text-slate-500" />
                    <span>Sửa giá</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRejectSingle(rec)}
                    className="touch-target col-span-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-red-600 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 active:scale-95"
                  >
                    <X className="w-3 h-3" />
                    <span>Bỏ qua</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* ── 5. STICKY BULK APPLY FLOATING DOCK ── */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-40 animate-slideUp pointer-events-none">
          <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.35)] border border-slate-700/80 flex items-center justify-between gap-2 pointer-events-auto">
            {/* Left: Count & Deselect Button */}
            <div className="flex items-center gap-2 pl-1 min-w-0">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="w-7 h-7 rounded-xl bg-brand-yellow text-[#064e3b] font-black text-xs flex items-center justify-center shrink-0 shadow-xs active:scale-90 transition-transform"
                title="Bỏ chọn tất cả"
              >
                {selectedIds.length}
              </button>
              <div className="min-w-0">
                <span className="text-[11px] font-black text-white block truncate leading-tight">
                  Đã chọn {selectedIds.length} đề xuất
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-[9px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* Right: Apply All Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleBulkApply}
                className="touch-target px-3.5 py-2 rounded-xl bg-brand-yellow active:bg-yellow-400 text-[#064e3b] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 stroke-[3]" />
                <span>Áp dụng tất cả</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. VENUE PICKER BOTTOM SHEET ── */}
      {isVenuePickerOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsVenuePickerOpen(false)} />
          <div
            className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-10 max-h-[85dvh] flex flex-col animate-slideUp"
            style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Chọn cụm sân phân tích giá</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Dữ liệu AI và đề xuất giá sẽ tải theo cụm đã chọn</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVenuePickerOpen(false)}
                className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 pb-3">
              {activeVenues.map((v) => {
                const isSelected = activeVenue?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedVenueId(v.id);
                      setIsVenuePickerOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${isSelected
                        ? 'bg-emerald-50/80 border-brand-emerald shadow-xs ring-1 ring-brand-emerald/30'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black ${isSelected ? 'bg-brand-emerald text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                        }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-black truncate ${isSelected ? 'text-brand-emerald' : 'text-slate-800'}`}>
                          {v.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {v.addressDetail || v.location || 'Khu vực quản lý'}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-emerald text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── 7. CUSTOM PRICE ADJUSTMENT SHEET ── */}
      {editingRec && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setEditingRec(null)} />
          <div
            className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-10 max-h-[85dvh] flex flex-col animate-slideUp font-sans"
            style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-800">Tùy chỉnh giá cho ca này</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {getDayName(editingRec.dayOfWeek)} • {editingRec.courtName} ({editingRec.startTime} - {editingRec.endTime})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRec(null)}
                className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Giá hiện tại</span>
                  <strong className="text-slate-700">{formatVND(editingRec.basePrice)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">AI đề xuất</span>
                  <strong className="text-brand-emerald">{formatVND(editingRec.suggestedPrice)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  Mức giá bạn muốn áp dụng (VNĐ/ca)
                </label>
                <CurrencyInput
                  value={customPriceValue}
                  onChange={(val) => setCustomPriceValue(val)}
                  placeholder="Nhập mức giá..."
                  className="w-full text-base font-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRec(null)}
                  className="flex-1 py-3 bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustomPrice}
                  className="flex-1 py-3 bg-brand-emerald active:bg-emerald-950 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Xác nhận & Áp dụng</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── 8. OCCUPANCY HEATMAP MODAL ── */}
      {isHeatmapOpen && analytics?.courtHeatmaps && (
        <OccupancyHeatmapModal
          isOpen={isHeatmapOpen}
          onClose={() => setIsHeatmapOpen(false)}
          courtHeatmaps={analytics.courtHeatmaps}
          formatVND={formatVND}
        />
      )}

      {/* ── 9. AI ANALYSIS PROGRESS & RESULT MODAL ── */}
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
export default MobileDynamicPricingPage;
