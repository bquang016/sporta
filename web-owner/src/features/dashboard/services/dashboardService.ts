import type { Complex, Pitch, Booking, Activity, ComplexId, ChartPeriod, ChartData } from '../types';

export const COMPLEXES: Complex[] = [
  { id: 'all', name: 'Tất cả cụm sân', location: 'TP. Hồ Chí Minh' },
  { id: 'q7', name: 'Sporta Quận 7', location: 'Đường Nguyễn Văn Linh, Q.7' },
  { id: 'tb', name: 'Sporta Tân Bình', location: 'Đường Cộng Hòa, Q. Tân Bình' },
  { id: 'bt', name: 'Sporta Bình Thạnh', location: 'Đường Chu Văn An, Q. Bình Thạnh' },
];

export const MOBILE_COMPLEXES: Complex[] = [
  { id: 'all', name: 'Tần cả cụm sân', location: 'TP. Hồ Chí Minh' },
  { id: 'q7', name: 'Sporta Quận 7', location: 'Nguyễn Văn Linh, Q.7' },
  { id: 'tb', name: 'Sporta Tân Bình', location: 'Cộng Hòa, Q. Tân Bình' },
  { id: 'bt', name: 'Sporta Bình Thạnh', location: 'Chu Văn An, Q. Bình Thạnh' },
];

export const INITIAL_PITCHES: Pitch[] = [
  { id: 'p-q7-1', name: 'Sân Q7-1', type: '5v5', complexId: 'q7', status: 'busy', price: 300000 },
  { id: 'p-q7-2', name: 'Sân Q7-2', type: '5v5', complexId: 'q7', status: 'available', price: 300000 },
  { id: 'p-q7-3', name: 'Sân Q7-3', type: '7v7', complexId: 'q7', status: 'available', price: 500000 },
  { id: 'p-q7-4', name: 'Sân Q7-4', type: '11v11', complexId: 'q7', status: 'maintenance', price: 800000 },
  { id: 'p-tb-1', name: 'Sân TB-1', type: '5v5', complexId: 'tb', status: 'available', price: 320000 },
  { id: 'p-tb-2', name: 'Sân TB-2', type: '7v7', complexId: 'tb', status: 'busy', price: 520000 },
  { id: 'p-tb-3', name: 'Sân TB-3', type: '7v7', complexId: 'tb', status: 'available', price: 520000 },
  { id: 'p-bt-1', name: 'Sân BT-1', type: '5v5', complexId: 'bt', status: 'busy', price: 310000 },
  { id: 'p-bt-2', name: 'Sân BT-2', type: '5v5', complexId: 'bt', status: 'available', price: 310000 },
  { id: 'p-bt-3', name: 'Sân BT-3', type: '7v7', complexId: 'bt', status: 'available', price: 510000 },
  { id: 'p-bt-4', name: 'Sân BT-4', type: '11v11', complexId: 'bt', status: 'busy', price: 820000 },
];

export const DESKTOP_INITIAL_BOOKINGS: Booking[] = [
  { id: 'b-1', pitchName: 'Sân Q7-1', complexId: 'q7', date: '26/08/2026', time: '17:30 - 19:00', customerName: 'Nguyễn Văn Hùng', phone: '0901234567', amount: 450000, status: 'pending-checkin' },
  { id: 'b-2', pitchName: 'Sân TB-2', complexId: 'tb', date: '26/08/2026', time: '18:00 - 19:30', customerName: 'Trần Anh Tuấn', phone: '0918765432', amount: 780000, status: 'checked-in' },
  { id: 'b-3', pitchName: 'Sân BT-4', complexId: 'bt', date: '26/08/2026', time: '19:00 - 21:00', customerName: 'Lê Minh Quốc', phone: '0983332211', amount: 1640000, status: 'pending-checkin' },
  { id: 'b-4', pitchName: 'Sân Q7-3', complexId: 'q7', date: '26/08/2026', time: '20:00 - 21:30', customerName: 'Phạm Đức Duy', phone: '0977889900', amount: 750000, status: 'pending-checkin' },
  { id: 'b-5', pitchName: 'Sân BT-1', complexId: 'bt', date: '26/08/2026', time: '20:30 - 22:00', customerName: 'Đỗ Hữu Tài', phone: '0966554433', amount: 465000, status: 'checked-in' },
];

export const MOBILE_INITIAL_BOOKINGS: Booking[] = [
  { id: 'b-1', pitchName: 'Sân Q7-1', complexId: 'q7', date: '26/08/2026', time: '17:30 - 19:00', customerName: 'Nguyễn Văn Hùng', phone: '0901234567', amount: 450000, status: 'pending-checkin' },
  { id: 'b-2', pitchName: 'Sân TB-2', complexId: 'tb', date: '26/08/2026', time: '18:00 - 19:30', customerName: 'Trần Anh Tuấn', phone: '0918765432', amount: 780000, status: 'checked-in' },
  { id: 'b-3', pitchName: 'Sân BT-4', complexId: 'bt', date: '26/08/2026', time: '19:00 - 21:00', customerName: 'Lê Minh Quốc', phone: '0983332211', amount: 1640000, status: 'pending-checkin' },
  { id: 'b-4', pitchName: 'Sân Q7-3', complexId: 'q7', date: '26/08/2026', time: '20:00 - 21:30', customerName: 'Phạm Đức Duy', phone: '0977889900', amount: 750000, status: 'pending-checkin' },
];

export const DESKTOP_INITIAL_ACTIVITIES: Activity[] = [
  { id: 'a-1', time: '10:15', message: 'Tự động duyệt: Nguyễn Văn Hùng đặt Sân Q7-1 (17:30)', type: 'system' },
  { id: 'a-2', time: '10:05', message: 'Khách hàng Trần Anh Tuấn đã quét QR check-in tại Sân TB-2', type: 'check-in' },
  { id: 'a-3', time: '09:45', message: 'Sân Q7-4 đã được chuyển sang chế độ Bảo trì', type: 'status-change' },
];

export const MOBILE_INITIAL_ACTIVITIES: Activity[] = [
  { id: 'a-1', time: '10:15', message: 'Tự động duyệt: Đơn của Nguyễn Hùng được tạo thành công', type: 'system' },
  { id: 'a-2', time: '10:05', message: 'Check-in thành công: Trần Tuấn quét mã vé tại Sân TB-2', type: 'check-in' },
];

export const DESKTOP_REVENUE_CHART_DATA: Record<ComplexId, Record<ChartPeriod, ChartData>> = {
  all: {
    day: { labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], values: [450000, 800000, 600000, 1100000, 2450000, 1900000] },
    quarter: { labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'], values: [18000000, 24000000, 31000000, 42000000] },
    year: { labels: ['2024', '2025', '2026'], values: [85000000, 112000000, 148000000] }
  },
  q7: {
    day: { labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], values: [150000, 320000, 210000, 450000, 1100000, 820000] },
    quarter: { labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'], values: [6200000, 8100000, 10500000, 14200000] },
    year: { labels: ['2024', '2025', '2026'], values: [28000000, 37000000, 49000000] }
  },
  tb: {
    day: { labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], values: [120000, 240000, 180000, 310000, 680000, 510000] },
    quarter: { labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'], values: [5100000, 6900000, 8900000, 11800000] },
    year: { labels: ['2024', '2025', '2026'], values: [25000000, 32000000, 41000000] }
  },
  bt: {
    day: { labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], values: [180000, 240000, 210000, 340000, 670000, 570000] },
    quarter: { labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'], values: [6700000, 9000000, 11600000, 16000000] },
    year: { labels: ['2024', '2025', '2026'], values: [32000000, 43000000, 58000000] }
  }
};

export const MOBILE_REVENUE_CHART_DATA: Record<ComplexId, Record<ChartPeriod, ChartData>> = {
  all: {
    day: { labels: ['06h', '10h', '14h', '18h', '22h'], values: [300000, 600000, 800000, 2450000, 1500000] },
    quarter: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [18000000, 24000000, 31000000, 42000000] },
    year: { labels: ['2024', '2025', '2026'], values: [85000000, 112000000, 148000000] }
  },
  q7: {
    day: { labels: ['06h', '10h', '14h', '18h', '22h'], values: [100000, 250000, 310000, 1100000, 600000] },
    quarter: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [6200000, 8100000, 10500000, 14200000] },
    year: { labels: ['2024', '2025', '2026'], values: [28000000, 37000000, 49000000] }
  },
  tb: {
    day: { labels: ['06h', '10h', '14h', '18h', '22h'], values: [80000, 180000, 220000, 680000, 420000] },
    quarter: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [5100000, 6900000, 8900000, 11800000] },
    year: { labels: ['2024', '2025', '2026'], values: [25000000, 32000000, 41000000] }
  },
  bt: {
    day: { labels: ['06h', '10h', '14h', '18h', '22h'], values: [120000, 170000, 270000, 670000, 480000] },
    quarter: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [6700000, 9000000, 11600000, 16000000] },
    year: { labels: ['2024', '2025', '2026'], values: [32000000, 43000000, 58000000] }
  }
};

// ═══ BACKEND API INTEGRATION ═══
export interface OwnerDashboardResponseData {
  listComplexes: Complex[];
  stats: {
    revenue: number;
    revenueK: number;
    occupancy: number;
    pendingCount: number;
    activeRatio: string;
  };
  pitches: Pitch[];
  bookings: Booking[];
  activities: Activity[];
  chartData: ChartData;
}

export const fetchDashboardOverviewApi = async (venueId = 'all', period = 'day'): Promise<OwnerDashboardResponseData> => {
  const token = localStorage.getItem('accessToken');
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const response = await fetch(`http://${host}:8387/api/v1/owner/dashboard/overview?venueId=${venueId}&period=${period}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu bảng điều khiển');
  }

  const data = await response.json();
  return {
    listComplexes: data.listComplexes || COMPLEXES,
    stats: data.stats || { revenue: 2745000, revenueK: 2745, occupancy: 36, pendingCount: 3, activeRatio: '10/11' },
    pitches: (data.pitches || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type || '5v5',
      complexId: p.complexId || 'all',
      status: p.status as any,
      price: p.price || 300000
    })),
    bookings: (data.bookings || []).map((b: any) => ({
      id: b.id,
      pitchName: b.pitchName,
      complexId: b.complexId || 'all',
      date: b.date,
      time: b.time,
      customerName: b.customerName,
      phone: b.phone,
      amount: b.amount,
      status: b.status as any
    })),
    activities: data.activities || DESKTOP_INITIAL_ACTIVITIES,
    chartData: data.chartData || { labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], values: [450, 800, 600, 1100, 2450, 1900] }
  };
};

export const updateCourtStatusApi = async (courtId: string, status: string): Promise<boolean> => {
  const token = localStorage.getItem('accessToken');
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const dbStatus = status === 'maintenance' ? 'MAINTENANCE' : 'ACTIVE';

  try {
    const response = await fetch(`http://${host}:8387/api/v1/owner/courts/${courtId}/status?status=${dbStatus}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (err) {
    console.error('Error updating court status:', err);
    return false;
  }
};

export const checkInTicketApi = async (tokenStr: string): Promise<boolean> => {
  const token = localStorage.getItem('accessToken');
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  try {
    const response = await fetch(`http://${host}:8387/api/v1/owner/tickets/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token: tokenStr })
    });
    return response.ok;
  } catch (err) {
    console.error('Error checking in ticket:', err);
    return false;
  }
};
