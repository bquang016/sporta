export interface DailyRevenuePoint {
  date: string;
  gmv: number;
  netRevenue: number;
  bookingCount: number;
}

export interface OwnerRevenueReportResponse {
  venueId: string;
  venueName: string;
  fromDate: string;
  toDate: string;

  totalGmv: number;
  netRevenue: number;
  commissionFee: number;
  totalBookings: number;
  averageOrderValue: number;

  bookingSingleAmount: number;
  bookingFixedAmount: number;
  ticketSessionAmount: number;

  payosAmount: number;
  walletAmount: number;
  cashAmount: number;

  dailyTimeline: DailyRevenuePoint[];
}
