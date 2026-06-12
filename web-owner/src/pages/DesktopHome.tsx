import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Dropdown } from '../components/ui/Dropdown';
import { ConfirmModal } from '../components/ui/ConfirmModal';

// ═══ TYPES ═══
type ComplexId = 'all' | 'q7' | 'tb' | 'bt';
type PitchStatus = 'available' | 'busy' | 'maintenance';
type ChartPeriod = 'day' | 'quarter' | 'year';

interface Complex {
  id: ComplexId;
  name: string;
  location: string;
}

interface Pitch {
  id: string;
  name: string;
  type: '5v5' | '7v7' | '11v11';
  complexId: Exclude<ComplexId, 'all'>;
  status: PitchStatus;
  price: number;
}

interface Booking {
  id: string;
  pitchName: string;
  complexId: Exclude<ComplexId, 'all'>;
  time: string;
  customerName: string;
  phone: string;
  amount: number;
  status: 'checked-in' | 'pending-checkin';
}

interface Activity {
  id: string;
  time: string;
  message: string;
  type: 'check-in' | 'status-change' | 'system';
}

// ═══ CONSTANTS & INITIAL DATA ═══
const COMPLEXES: Complex[] = [
  { id: 'all', name: 'Tất cả cụm sân', location: 'TP. Hồ Chí Minh' },
  { id: 'q7', name: 'Sporta Quận 7', location: 'Đường Nguyễn Văn Linh, Q.7' },
  { id: 'tb', name: 'Sporta Tân Bình', location: 'Đường Cộng Hòa, Q. Tân Bình' },
  { id: 'bt', name: 'Sporta Bình Thạnh', location: 'Đường Chu Văn An, Q. Bình Thạnh' },
];

const INITIAL_PITCHES: Pitch[] = [
  // Quận 7
  { id: 'p-q7-1', name: 'Sân Q7-1', type: '5v5', complexId: 'q7', status: 'busy', price: 300000 },
  { id: 'p-q7-2', name: 'Sân Q7-2', type: '5v5', complexId: 'q7', status: 'available', price: 300000 },
  { id: 'p-q7-3', name: 'Sân Q7-3', type: '7v7', complexId: 'q7', status: 'available', price: 500000 },
  { id: 'p-q7-4', name: 'Sân Q7-4', type: '11v11', complexId: 'q7', status: 'maintenance', price: 800000 },
  // Tân Bình
  { id: 'p-tb-1', name: 'Sân TB-1', type: '5v5', complexId: 'tb', status: 'available', price: 320000 },
  { id: 'p-tb-2', name: 'Sân TB-2', type: '7v7', complexId: 'tb', status: 'busy', price: 520000 },
  { id: 'p-tb-3', name: 'Sân TB-3', type: '7v7', complexId: 'tb', status: 'available', price: 520000 },
  // Bình Thạnh
  { id: 'p-bt-1', name: 'Sân BT-1', type: '5v5', complexId: 'bt', status: 'busy', price: 310000 },
  { id: 'p-bt-2', name: 'Sân BT-2', type: '5v5', complexId: 'bt', status: 'available', price: 310000 },
  { id: 'p-bt-3', name: 'Sân BT-3', type: '7v7', complexId: 'bt', status: 'available', price: 510000 },
  { id: 'p-bt-4', name: 'Sân BT-4', type: '11v11', complexId: 'bt', status: 'busy', price: 820000 },
];

const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b-1', pitchName: 'Sân Q7-1', complexId: 'q7', time: '17:30 - 19:00', customerName: 'Nguyễn Văn Hùng', phone: '0901234567', amount: 450000, status: 'pending-checkin' },
  { id: 'b-2', pitchName: 'Sân TB-2', complexId: 'tb', time: '18:00 - 19:30', customerName: 'Trần Anh Tuấn', phone: '0918765432', amount: 780000, status: 'checked-in' },
  { id: 'b-3', pitchName: 'Sân BT-4', complexId: 'bt', time: '19:00 - 21:00', customerName: 'Lê Minh Quốc', phone: '0983332211', amount: 1640000, status: 'pending-checkin' },
  { id: 'b-4', pitchName: 'Sân Q7-3', complexId: 'q7', time: '20:00 - 21:30', customerName: 'Phạm Đức Duy', phone: '0977889900', amount: 750000, status: 'pending-checkin' },
  { id: 'b-5', pitchName: 'Sân BT-1', complexId: 'bt', time: '20:30 - 22:00', customerName: 'Đỗ Hữu Tài', phone: '0966554433', amount: 465000, status: 'checked-in' },
];

const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'a-1', time: '10:15', message: 'Tự động duyệt: Nguyễn Văn Hùng đặt Sân Q7-1 (17:30)', type: 'system' },
  { id: 'a-2', time: '10:05', message: 'Khách hàng Trần Anh Tuấn đã quét QR check-in tại Sân TB-2', type: 'check-in' },
  { id: 'a-3', time: '09:45', message: 'Sân Q7-4 đã được chuyển sang chế độ Bảo trì', type: 'status-change' },
];

// Dữ liệu biểu đồ doanh thu theo cụm sân và chu kỳ thời gian
const REVENUE_CHART_DATA: Record<ComplexId, Record<ChartPeriod, { labels: string[]; values: number[] }>> = {
  all: {
    day: { labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], values: [450, 800, 600, 1100, 2450, 1900] },
    quarter: { labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'], values: [18000, 24000, 31000, 42000] },
    year: { labels: ['2024', '2025', '2026'], values: [85000, 112000, 148000] }
  },
  q7: {
    day: { labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], values: [150, 320, 210, 450, 1100, 820] },
    quarter: { labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'], values: [6200, 8100, 10500, 14200] },
    year: { labels: ['2024', '2025', '2026'], values: [28000, 37000, 49000] }
  },
  tb: {
    day: { labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], values: [120, 240, 180, 310, 680, 510] },
    quarter: { labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'], values: [5100, 6900, 8900, 11800] },
    year: { labels: ['2024', '2025', '2026'], values: [25000, 32000, 41000] }
  },
  bt: {
    day: { labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], values: [180, 240, 210, 340, 670, 570] },
    quarter: { labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'], values: [6700, 9000, 11600, 16000] },
    year: { labels: ['2024', '2025', '2026'], values: [32000, 43000, 58000] }
  }
};

export const DesktopHome = () => {
  const navigate = useNavigate();

  // ═══ STATES ═══
  const [selectedComplex, setSelectedComplex] = useState<ComplexId>('all');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('day');
  const [pitches, setPitches] = useState<Pitch[]>(INITIAL_PITCHES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // States for manual status editing
  const [isPitchesExpanded, setIsPitchesExpanded] = useState(false);
  const [selectedPitchToEdit, setSelectedPitchToEdit] = useState<Pitch | null>(null);
  const [pendingStatusToApply, setPendingStatusToApply] = useState<PitchStatus | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Check-in state
  const [ticketCode, setTicketCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Filtered values based on selectedComplex
  const currentPitches = useMemo(() => {
    if (selectedComplex === 'all') return pitches;
    return pitches.filter(p => p.complexId === selectedComplex);
  }, [pitches, selectedComplex]);

  const currentBookings = useMemo(() => {
    if (selectedComplex === 'all') return bookings;
    return bookings.filter(b => b.complexId === selectedComplex);
  }, [bookings, selectedComplex]);

  // Dynamic calculations based on state (revenue, active, occupancy)
  const stats = useMemo(() => {
    const activePitchesCount = currentPitches.filter(p => p.status !== 'maintenance').length;
    const busyPitchesCount = currentPitches.filter(p => p.status === 'busy').length;
    const totalPitchesCount = currentPitches.length;

    // Calculate dynamic occupancy based on pitches status
    const occupancyRate = totalPitchesCount > 0 
      ? Math.round((busyPitchesCount / totalPitchesCount) * 100) 
      : 0;

    // Calculate revenue based on checked-in bookings + a baseline
    let baseRevenue = 0;
    if (selectedComplex === 'all') baseRevenue = 1500000;
    else if (selectedComplex === 'q7') baseRevenue = 600000;
    else if (selectedComplex === 'tb') baseRevenue = 400000;
    else baseRevenue = 500000;

    const checkedInBookingsSum = currentBookings
      .filter(b => b.status === 'checked-in')
      .reduce((sum, b) => sum + b.amount, 0);

    const totalRevenue = baseRevenue + checkedInBookingsSum;
    const pendingCheckinCount = currentBookings.filter(b => b.status === 'pending-checkin').length;

    return {
      revenue: totalRevenue,
      occupancy: occupancyRate,
      pendingCount: pendingCheckinCount,
      activeRatio: `${activePitchesCount}/${totalPitchesCount}`
    };
  }, [currentPitches, currentBookings, selectedComplex]);

  // Chart data
  const currentChart = useMemo(() => {
    return REVENUE_CHART_DATA[selectedComplex][chartPeriod];
  }, [selectedComplex, chartPeriod]);

  // ═══ HANDLERS ═══
  const handleInitiateStatusChange = (pitch: Pitch, nextStatus: PitchStatus) => {
    setSelectedPitchToEdit(pitch);
    setPendingStatusToApply(nextStatus);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!selectedPitchToEdit || !pendingStatusToApply) return;

    setPitches(prev => prev.map(p => {
      if (p.id !== selectedPitchToEdit.id) return p;
      
      // Add Activity Log
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const statusMap = { available: 'Trống', busy: 'Đang bận', maintenance: 'Bảo trì' };
      const newActivity: Activity = {
        id: `a-${Date.now()}`,
        time: timeStr,
        message: `${p.name} vừa chuyển sang trạng thái: ${statusMap[pendingStatusToApply]}`,
        type: 'status-change'
      };
      setActivities(prevAct => [newActivity, ...prevAct]);

      return { ...p, status: pendingStatusToApply };
    }));

    setSelectedPitchToEdit(null);
    setPendingStatusToApply(null);
  };

  const handleQuickCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setIsScanning(true);
    setScanMessage(null);

    // Simulate network delay for scan check
    setTimeout(() => {
      setIsScanning(false);
      const code = ticketCode.trim().toUpperCase();
      
      // Look up booking with this code or match random
      const bookingIndex = bookings.findIndex(b => b.id.toUpperCase().includes(code) || code === 'SP-2026' || code === 'CHECKIN');
      
      if (bookingIndex !== -1 || code.startsWith('SP-') || code.length >= 3) {
        // Success
        const checkedBooking = bookingIndex !== -1 ? bookings[bookingIndex] : bookings[0];
        
        // Update booking status
        setBookings(prev => prev.map((b, idx) => {
          if (idx === (bookingIndex !== -1 ? bookingIndex : 0)) {
            return { ...b, status: 'checked-in' };
          }
          return b;
        }));

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Add log
        const newAct: Activity = {
          id: `a-${Date.now()}`,
          time: timeStr,
          message: `Check-in thành công vé ${code} - Khách: ${checkedBooking.customerName} (${checkedBooking.pitchName})`,
          type: 'check-in'
        };
        setActivities(prevAct => [newAct, ...prevAct]);
        setScanMessage({ text: `Check-in THÀNH CÔNG vé ${code} - ${checkedBooking.customerName}`, success: true });
        setTicketCode('');
      } else {
        // Fail
        setScanMessage({ text: `Mã vé ${code} không hợp lệ hoặc đã sử dụng!`, success: false });
      }
    }, 1000);
  };

  const handleCheckinDirect = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'checked-in' } : b));

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newAct: Activity = {
      id: `a-${Date.now()}`,
      time: timeStr,
      message: `Check-in trực tiếp: ${booking.customerName} - ${booking.pitchName}`,
      type: 'check-in'
    };
    setActivities(prevAct => [newAct, ...prevAct]);
  };

  // SVG dimensions for revenue chart
  const svgWidth = 500;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 20;

  const points = useMemo(() => {
    const maxVal = Math.max(...currentChart.values, 1000);
    const stepX = (svgWidth - paddingX * 2) / (currentChart.values.length - 1);
    
    return currentChart.values.map((val, idx) => {
      const x = paddingX + idx * stepX;
      const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - paddingY * 2);
      return { x, y, value: val };
    });
  }, [currentChart, svgWidth, svgHeight]);

  const svgPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = points[idx - 1];
      const cpX1 = prev.x + (pt.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = prev.x + 2 * (pt.x - prev.x) / 3;
      const cpY2 = pt.y;
      return `${path} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
    }, '');
  }, [points]);

  const svgAreaPath = useMemo(() => {
    if (points.length === 0) return '';
    const startPoint = `M ${points[0].x} ${svgHeight - paddingY}`;
    const endPoint = `L ${points[points.length - 1].x} ${svgHeight - paddingY} Z`;
    return `${startPoint} L ${points[0].x} ${points[0].y} ${svgPath.substring(1)} ${endPoint}`;
  }, [points, svgPath]);

  // Options for manually changing pitch status
  const pitchStatusOptions = [
    { value: 'available', label: 'Trống' },
    { value: 'busy', label: 'Đang bận' },
    { value: 'maintenance', label: 'Bảo trì' }
  ];

  return (
    <div className="space-y-6 pb-12 select-none overflow-y-auto">
      
      {/* ═══ TOP HEADER SWITCHER ═══ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-surface-variant/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight">Tổng quan hoạt động</h1>
          <p className="text-xs text-outline mt-1">
            {selectedComplex === 'all' 
              ? 'Thống kê tổng hợp từ tất cả các cụm sân Sporta' 
              : `Báo cáo chi tiết cho cụm sân tại: ${COMPLEXES.find(c => c.id === selectedComplex)?.location}`
            }
          </p>
        </div>

        {/* Custom Dropdown for Venue Complex selector */}
        <Dropdown
          options={COMPLEXES.map(c => ({ value: c.id, label: c.name }))}
          value={selectedComplex}
          onChange={(val) => {
            setSelectedComplex(val as ComplexId);
            // Log event
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const newAct: Activity = {
              id: `a-${Date.now()}`,
              time: timeStr,
              message: `Chuyển cụm sân đang xem sang: ${COMPLEXES.find(c => c.id === val)?.name}`,
              type: 'system'
            };
            setActivities(prevAct => [newAct, ...prevAct]);
          }}
          className="min-w-[220px]"
        />
      </div>

      {/* ═══ 1. KPI CARDS GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* KPI: Doanh thu */}
        <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-brand-yellow/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-start z-10">
            <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-wider">Doanh thu hôm nay</h3>
            <div className="w-8 h-8 rounded-xl bg-brand-yellow/15 text-brand-secondary flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="z-10">
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              {new Intl.NumberFormat('vi-VN').format(stats.revenue)}đ
            </p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Đã cập nhật tự động
            </p>
          </div>
        </Card>

        {/* KPI: Tỉ lệ lấp đầy */}
        <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-brand-emerald/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-start z-10">
            <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-wider">Tỉ lệ lấp đầy sân</h3>
            <div className="w-8 h-8 rounded-xl bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
          </div>
          <div className="z-10">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.occupancy}%</p>
              <p className="text-[10px] text-brand-emerald font-bold">Lượt bận/Trống</p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-brand-emerald h-full rounded-full transition-all duration-500" style={{ width: `${stats.occupancy}%` }}></div>
            </div>
          </div>
        </Card>

        {/* KPI: Lượt check-in đang chờ */}
        <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-start z-10">
            <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-wider">Lượt chờ check-in</h3>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="z-10">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.pendingCount}</p>
              <p className="text-[10px] text-blue-600 font-bold">Khách chưa check-in</p>
            </div>
            <p className="text-[9px] text-slate-400 font-medium mt-1">Đơn hàng tự động duyệt thành công</p>
          </div>
        </Card>

        {/* KPI: Tỉ lệ sân hoạt động */}
        <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-start z-10">
            <h3 className="text-[10px] font-extrabold text-outline uppercase tracking-wider">Sân sẵn sàng</h3>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
          </div>
          <div className="z-10">
            <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.activeRatio}</p>
            <p className="text-[10px] text-purple-600 font-bold mt-1">Sân đang mở / Tổng số sân</p>
          </div>
        </Card>

      </div>

      {/* ═══ 2. MAIN WORKSPACE ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Charts & Bookings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue Area Chart */}
          <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Biểu đồ doanh thu</h2>
                <p className="text-xs text-slate-400 font-medium">Doanh số thu về qua hệ thống đặt sân trực tuyến</p>
              </div>

              {/* Day/Quarter/Year Switcher Tabs */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
                <button
                  onClick={() => { setChartPeriod('day'); setHoveredDataIndex(null); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all ${chartPeriod === 'day' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Ngày
                </button>
                <button
                  onClick={() => { setChartPeriod('quarter'); setHoveredDataIndex(null); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all ${chartPeriod === 'quarter' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Quý
                </button>
                <button
                  onClick={() => { setChartPeriod('year'); setHoveredDataIndex(null); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all ${chartPeriod === 'year' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Năm
                </button>
              </div>
            </div>

            {/* Interactive SVG Chart Canvas */}
            <div className="relative w-full flex flex-col justify-center items-center h-[210px] border border-slate-100 rounded-2xl bg-slate-50/20 p-2">
              
              {/* Tooltip Overlay */}
              {hoveredDataIndex !== null && (
                <div 
                  className="absolute bg-slate-900/95 text-white p-2.5 rounded-xl text-left border border-slate-700 pointer-events-none shadow-md z-10 transition-all duration-150"
                  style={{
                    left: `${points[hoveredDataIndex].x - 60}px`,
                    top: `${points[hoveredDataIndex].y - 55}px`,
                  }}
                >
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{currentChart.labels[hoveredDataIndex]}</p>
                  <p className="text-xs font-black text-brand-yellow mt-0.5">
                    {chartPeriod === 'day' 
                      ? `${(currentChart.values[hoveredDataIndex] * 1000).toLocaleString('vi-VN')}đ`
                      : `${(currentChart.values[hoveredDataIndex] * 1000000).toLocaleString('vi-VN')}đ`
                    }
                  </p>
                </div>
              )}

              {/* Chart SVG */}
              <svg className="w-full h-[180px] overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                <defs>
                  <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#064E3B" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#064E3B" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#e2e8f0" strokeWidth="2" />

                <path d={svgAreaPath} fill="url(#chart-grad)" className="transition-all duration-500 ease-in-out" />

                <path 
                  d={svgPath} 
                  fill="none" 
                  stroke="#064E3B" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transition-all duration-500 ease-in-out"
                />

                {points.map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredDataIndex === idx ? 7 : 5}
                      fill={hoveredDataIndex === idx ? '#FACC15' : '#064E3B'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredDataIndex(idx)}
                      onMouseLeave={() => setHoveredDataIndex(null)}
                    />
                  </g>
                ))}

                {points.map((pt, idx) => (
                  <text
                    key={idx}
                    x={pt.x}
                    y={svgHeight - 2}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {currentChart.labels[idx]}
                  </text>
                ))}
              </svg>
            </div>
          </Card>

          {/* Recent Bookings */}
          <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Lịch đặt gần đây</h2>
                <p className="text-xs text-slate-400 font-medium">Đơn đặt thành công trực tiếp được chuyển từ hệ thống người dùng</p>
              </div>
              <button 
                onClick={() => navigate('/matrix')} 
                className="text-xs font-extrabold text-brand-emerald hover:text-emerald-950 transition-colors flex items-center gap-1 focus:outline-none"
              >
                <span>Xem sơ đồ sân</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-variant text-[10px] text-outline uppercase tracking-wider font-extrabold">
                    <th className="pb-3 text-center w-12">Mã vé</th>
                    <th className="pb-3 pl-4">Sân bóng</th>
                    <th className="pb-3">Thời gian</th>
                    <th className="pb-3">Khách hàng</th>
                    <th className="pb-3 text-right">Tổng tiền</th>
                    <th className="pb-3 text-right pr-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {currentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                        Không có đơn đặt nào cho cụm sân này.
                      </td>
                    </tr>
                  ) : (
                    currentBookings.map((b) => (
                      <tr key={b.id} className="border-b border-surface-variant/40 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 text-center font-bold text-slate-400">#{b.id}</td>
                        <td className="py-4 pl-4">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800">{b.pitchName}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{COMPLEXES.find(c => c.id === b.complexId)?.name}</span>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-slate-700">{b.time}</td>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{b.customerName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{b.phone}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right font-black text-slate-800">
                          {new Intl.NumberFormat('vi-VN').format(b.amount)}đ
                        </td>
                        <td className="py-4 text-right pr-4">
                          {b.status === 'checked-in' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-brand-emerald border border-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
                              Đã check-in
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCheckinDirect(b.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 transition-all"
                            >
                              Check-in
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

        </div>

        {/* Right Section: Quick actions, Live Pitch Status & Logs */}
        <div className="space-y-6">
          
          {/* Quick Action: Simulated QR Check-in */}
          <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Check-in nhanh</h2>
            
            <form onSubmit={handleQuickCheckin} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập mã vé đặt (Ví dụ: b-1)..."
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  disabled={isScanning}
                  className="w-full pl-3 pr-20 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald disabled:bg-slate-100 placeholder-slate-400 transition-all"
                />
                
                <button
                  type="submit"
                  disabled={isScanning || !ticketCode.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-emerald text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg hover:bg-emerald-950 transition-colors disabled:bg-slate-300"
                >
                  {isScanning ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </form>

            <div className="mt-4 border border-dashed border-slate-200 bg-slate-50/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center min-h-[160px] relative overflow-hidden">
              {isScanning ? (
                <>
                  <div className="absolute top-0 left-0 w-full h-full bg-slate-900/10 flex flex-col justify-between p-4">
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-brand-emerald"></div>
                      <div className="w-4 h-4 border-t-2 border-r-2 border-brand-emerald"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-b-2 border-l-2 border-brand-emerald"></div>
                      <div className="w-4 h-4 border-b-2 border-r-2 border-brand-emerald"></div>
                    </div>
                  </div>
                  <div className="w-full h-0.5 bg-brand-emerald absolute left-0 top-1/2 -translate-y-1/2 animate-bounce"></div>
                  
                  <svg className="w-10 h-10 text-brand-emerald animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-[10px] font-black text-slate-500 mt-3 uppercase tracking-wider animate-pulse">Đang định dạng mã QR...</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                  </div>
                  <button 
                    onClick={() => {
                      setTicketCode('b-1');
                      setIsScanning(true);
                      setTimeout(() => {
                        setIsScanning(false);
                        handleCheckinDirect('b-1');
                        setScanMessage({ text: 'Giả lập check-in mã vé b-1 (Nguyễn Văn Hùng) thành công!', success: true });
                        setTicketCode('');
                      }, 1000);
                    }}
                    className="text-[11px] font-black text-brand-emerald hover:text-emerald-950 transition-colors uppercase tracking-wide focus:outline-none"
                  >
                    Click để Giả Lập Quét Vé QR
                  </button>
                  <p className="text-[9px] text-slate-400 mt-1 max-w-[200px]">Mô phỏng check-in thực tế thông qua camera của chủ sân</p>
                </>
              )}

              {scanMessage && (
                <div className={`mt-3 p-2 rounded-xl text-[10px] font-bold w-full text-center border ${
                  scanMessage.success 
                    ? 'bg-emerald-50 border-emerald-100 text-brand-emerald' 
                    : 'bg-red-50 border-red-100 text-red-600'
                }`}>
                  {scanMessage.text}
                </div>
              )}
            </div>
          </Card>

          {/* Live Pitch Monitor (Status and manual edit when expanded) */}
          <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Giám sát sân bãi</h2>
                <p className="text-[10px] text-slate-400 font-medium">
                  {isPitchesExpanded 
                    ? 'Thay đổi trạng thái sân bằng Dropdown' 
                    : 'Trạng thái hoạt động hiện tại'
                  }
                </p>
              </div>
            </div>

            {/* Pitches listing grid */}
            <div className="grid grid-cols-1 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {(isPitchesExpanded ? currentPitches : currentPitches.slice(0, 4)).map(p => (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all select-none ${
                    p.status === 'available' ? 'bg-emerald-50/30 border-emerald-100' :
                    p.status === 'busy' ? 'bg-amber-50/20 border-amber-100' :
                    'bg-red-50/20 border-red-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800">{p.name}</span>
                      <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wide bg-slate-100 px-1 py-0.5 rounded">
                        {p.type}
                      </span>
                    </div>
                    
                    {/* Status dot and label */}
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        p.status === 'available' ? 'bg-brand-emerald animate-pulse' :
                        p.status === 'busy' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}></span>
                      <span className="text-[9px] font-bold text-slate-500">
                        {p.status === 'available' ? 'Trống' :
                         p.status === 'busy' ? 'Đang bận' :
                         'Bảo trì'}
                      </span>
                    </div>
                  </div>

                  {/* Manual status edit dropdown only visible when expanded */}
                  {isPitchesExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-4">
                      <span className="text-[10px] text-slate-400 font-bold">Chỉnh sửa trạng thái:</span>
                      <Dropdown
                        options={pitchStatusOptions}
                        value={p.status}
                        onChange={(newVal) => handleInitiateStatusChange(p, newVal as PitchStatus)}
                        className="w-32"
                      />
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Expand / Collapse trigger */}
            <div className="mt-4 pt-2 border-t border-slate-100 flex justify-center">
              <button
                type="button"
                onClick={() => setIsPitchesExpanded(!isPitchesExpanded)}
                className="text-xs font-black text-brand-emerald hover:text-emerald-950 transition-colors uppercase tracking-wider flex items-center gap-1 focus:outline-none"
              >
                <span>{isPitchesExpanded ? 'Thu gọn sân bãi' : 'Mở rộng sân bãi (Xem thêm)'}</span>
                <span className="transition-transform duration-200" style={{ transform: isPitchesExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>
          </Card>

          {/* Activities log */}
          <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
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

        </div>

      </div>

      {/* Confirm Modal for manual status changes */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedPitchToEdit(null);
          setPendingStatusToApply(null);
        }}
        onConfirm={handleConfirmStatusChange}
        title="Xác nhận đổi trạng thái sân"
        message={`Bạn có chắc chắn muốn thay đổi trạng thái của ${selectedPitchToEdit?.name} sang "${
          pendingStatusToApply === 'available' ? 'Trống' :
          pendingStatusToApply === 'busy' ? 'Đang bận' :
          'Bảo trì'
        }"?`}
        confirmText="Đồng ý thay đổi"
        cancelText="Hủy bỏ"
        variant={pendingStatusToApply === 'maintenance' ? 'danger' : 'warning'}
      />

    </div>
  );
};
