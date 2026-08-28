export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type RecommendationStatus = 'PENDING' | 'APPLIED' | 'REJECTED' | 'EXPIRED';

export interface PricingRecommendation {
  id: string;
  courtId: string;
  courtName: string;
  venueId: string;
  venueName: string;
  dayOfWeek: number; // 1 = Thứ 2 ... 7 = CN
  dayOfWeekLabel: string;
  startTime: string;
  endTime: string;
  timeSlotLabel: string;

  basePrice: number;
  dayFactor: number;
  timeSlotFactor: number;
  occupancyFactor: number;
  occupancyRate: number;

  rawPrice: number;
  suggestedPrice: number;
  priceDifference: number;
  priceChangePercentage: number;

  recommendationReason: string;
  confidenceLevel: ConfidenceLevel;
  status: RecommendationStatus;

  createdAt: string;
  expiresAt: string;
  effectiveDateStart?: string;
  effectiveDateEnd?: string;
}

export interface ApplyPricingRequest {
  recommendationIds: string[];
  customPrices?: Record<string, number>;
}

export interface RejectPricingRequest {
  recommendationIds: string[];
  reason?: string;
}

export interface SlotHeatmapItem {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  occupancyRate: number;
  bookedCount: number;
  activeWeeks: number;
  currentPrice: number;
  suggestedPrice?: number;
}

export interface CourtHeatmapDto {
  courtId: string;
  courtName: string;
  slots: SlotHeatmapItem[];
}

export interface PricingAnalyticsSummary {
  venueId: string;
  venueName: string;
  totalPendingRecommendations: number;
  totalAppliedRecommendations: number;
  totalRejectedRecommendations: number;
  acceptanceRate: number;

  /** Thời điểm batch phân tích gần nhất */
  lastAnalyzedAt?: string;

  /** Khoảng thời gian áp dụng đề xuất (Thứ 2 - Chủ Nhật tuần khảo sát/áp dụng) */
  evaluationPeriodStart?: string;
  evaluationPeriodEnd?: string;

  /** Khoảng thời gian dữ liệu lịch sử được khảo sát */
  historicalLookbackWeeks?: number;
  historicalLookbackStart?: string;
  historicalLookbackEnd?: string;

  courtHeatmaps: CourtHeatmapDto[];
}
