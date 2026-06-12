import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
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

// ═══ CONSTANTS ═══
const COMPLEXES: Complex[] = [
  { id: 'all', name: 'Tần cả cụm sân', location: 'TP. Hồ Chí Minh' },
  { id: 'q7', name: 'Sporta Quận 7', location: 'Nguyễn Văn Linh, Q.7' },
  { id: 'tb', name: 'Sporta Tân Bình', location: 'Cộng Hòa, Q. Tân Bình' },
  { id: 'bt', name: 'Sporta Bình Thạnh', location: 'Chu Văn An, Q. Bình Thạnh' },
];

const INITIAL_PITCHES: Pitch[] = [
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

const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b-1', pitchName: 'Sân Q7-1', complexId: 'q7', time: '17:30 - 19:00', customerName: 'Nguyễn Văn Hùng', phone: '0901234567', amount: 450000, status: 'pending-checkin' },
  { id: 'b-2', pitchName: 'Sân TB-2', complexId: 'tb', time: '18:00 - 19:30', customerName: 'Trần Anh Tuấn', phone: '0918765432', amount: 780000, status: 'checked-in' },
  { id: 'b-3', pitchName: 'Sân BT-4', complexId: 'bt', time: '19:00 - 21:00', customerName: 'Lê Minh Quốc', phone: '0983332211', amount: 1640000, status: 'pending-checkin' },
  { id: 'b-4', pitchName: 'Sân Q7-3', complexId: 'q7', time: '20:00 - 21:30', customerName: 'Phạm Đức Duy', phone: '0977889900', amount: 750000, status: 'pending-checkin' },
];

const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'a-1', time: '10:15', message: 'Tự động duyệt: Đơn của Nguyễn Hùng được tạo thành công', type: 'system' },
  { id: 'a-2', time: '10:05', message: 'Check-in thành công: Trần Tuấn quét mã vé tại Sân TB-2', type: 'check-in' },
];

const REVENUE_CHART_DATA: Record<ComplexId, Record<ChartPeriod, { labels: string[]; values: number[] }>> = {
  all: {
    day: { labels: ['06h', '10h', '14h', '18h', '22h'], values: [300, 600, 800, 2450, 1500] },
    quarter: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [18, 24, 31, 42] },
    year: { labels: ['24', '25', '26'], values: [85, 112, 148] }
  },
  q7: {
    day: { labels: ['06h', '10h', '14h', '18h', '22h'], values: [100, 250, 310, 1100, 600] },
    quarter: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [6.2, 8.1, 10.5, 14.2] },
    year: { labels: ['24', '25', '26'], values: [28, 37, 49] }
  },
  tb: {
    day: { labels: ['06h', '10h', '14h', '18h', '22h'], values: [80, 180, 220, 680, 420] },
    quarter: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [5.1, 6.9, 8.9, 11.8] },
    year: { labels: ['24', '25', '26'], values: [25, 32, 41] }
  },
  bt: {
    day: { labels: ['06h', '10h', '14h', '18h', '22h'], values: [120, 170, 270, 670, 480] },
    quarter: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [6.7, 9.0, 11.6, 16.0] },
    year: { labels: ['24', '25', '26'], values: [32, 43, 58] }
  }
};

export const MobileHome = () => {
  const navigate = useNavigate();

  // ═══ STATES ═══
  const [selectedComplex, setSelectedComplex] = useState<ComplexId>('all');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('day');
  const [pitches, setPitches] = useState<Pitch[]>(INITIAL_PITCHES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);

  // States for manual status editing on Mobile
  const [isPitchesExpanded, setIsPitchesExpanded] = useState(false);
  const [selectedPitchToEdit, setSelectedPitchToEdit] = useState<Pitch | null>(null);
  const [pendingStatusToApply, setPendingStatusToApply] = useState<PitchStatus | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // QR Scan simulation modal states
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scannedResult, setScannedResult] = useState<string>('');

  // Filtering based on complex selection
  const currentPitches = useMemo(() => {
    if (selectedComplex === 'all') return pitches;
    return pitches.filter(p => p.complexId === selectedComplex);
  }, [pitches, selectedComplex]);

  const currentBookings = useMemo(() => {
    if (selectedComplex === 'all') return bookings;
    return bookings.filter(b => b.complexId === selectedComplex);
  }, [bookings, selectedComplex]);

  // Financial statistics
  const stats = useMemo(() => {
    let base = 0;
    if (selectedComplex === 'all') base = 1500000;
    else if (selectedComplex === 'q7') base = 600000;
    else if (selectedComplex === 'tb') base = 400000;
    else base = 500000;

    const checkedInSum = currentBookings
      .filter(b => b.status === 'checked-in')
      .reduce((sum, b) => sum + b.amount, 0);

    const activePitches = currentPitches.filter(p => p.status !== 'maintenance').length;
    const busyPitches = currentPitches.filter(p => p.status === 'busy').length;
    const totalPitches = currentPitches.length;

    const occupancy = totalPitches > 0 ? Math.round((busyPitches / totalPitches) * 100) : 0;

    return {
      revenueK: Math.round((base + checkedInSum) / 1000),
      occupancy,
      activeRatio: `${activePitches}/${totalPitches}`,
      pendingCount: currentBookings.filter(b => b.status === 'pending-checkin').length
    };
  }, [currentPitches, currentBookings, selectedComplex]);

  const chartData = useMemo(() => {
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

      // Log activity
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const statusMap = { available: 'Trống', busy: 'Đang bận', maintenance: 'Bảo trì' };
      const newAct: Activity = {
        id: `a-${Date.now()}`,
        time: timeStr,
        message: `Mobile: Đổi trạng thái ${p.name} -> ${statusMap[pendingStatusToApply]}`,
        type: 'status-change'
      };
      setActivities(prevAct => [newAct, ...prevAct]);

      return { ...p, status: pendingStatusToApply };
    }));

    setSelectedPitchToEdit(null);
    setPendingStatusToApply(null);
  };

  const handleStartQRScan = () => {
    setIsScanModalOpen(true);
    setIsScanning(true);
    setScanStatus('idle');
    setScannedResult('');

    // Simulate scanning camera frame
    setTimeout(() => {
      setIsScanning(false);
      const pendingBooking = bookings.find(b => b.status === 'pending-checkin');
      if (pendingBooking) {
        setScanStatus('success');
        setScannedResult(pendingBooking.customerName);
        
        setBookings(prev => prev.map(b => b.id === pendingBooking.id ? { ...b, status: 'checked-in' } : b));

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newAct: Activity = {
          id: `a-${Date.now()}`,
          time: timeStr,
          message: `QR Mobile: Check-in thành công khách ${pendingBooking.customerName} (${pendingBooking.pitchName})`,
          type: 'check-in'
        };
        setActivities(prevAct => [newAct, ...prevAct]);
      } else {
        setScanStatus('error');
      }
    }, 1500);
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
      message: `Mobile: Check-in ${booking.customerName} (${booking.pitchName})`,
      type: 'check-in'
    };
    setActivities(prevAct => [newAct, ...prevAct]);
  };

  // SVG Chart points calculation for mobile (w: 320, h: 100)
  const chartPoints = useMemo(() => {
    const w = 320;
    const h = 100;
    const px = 25;
    const py = 12;
    const maxVal = Math.max(...chartData.values, 10);
    const stepX = (w - px * 2) / (chartData.values.length - 1);

    return chartData.values.map((val, idx) => {
      const x = px + idx * stepX;
      const y = h - py - (val / maxVal) * (h - py * 2);
      return { x, y, value: val };
    });
  }, [chartData]);

  const pathString = useMemo(() => {
    return chartPoints.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = chartPoints[idx - 1];
      const cpX1 = prev.x + (pt.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (pt.x - prev.x) / 2;
      const cpY2 = pt.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
    }, '');
  }, [chartPoints]);

  const areaString = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const h = 100;
    const py = 12;
    return `M ${chartPoints[0].x} ${h - py} L ${chartPoints[0].x} ${chartPoints[0].y} ${pathString.substring(1)} L ${chartPoints[chartPoints.length - 1].x} ${h - py} Z`;
  }, [chartPoints, pathString]);

  // Options for manually changing pitch status
  const pitchStatusOptions = [
    { value: 'available', label: 'Trống' },
    { value: 'busy', label: 'Đang bận' },
    { value: 'maintenance', label: 'Bảo trì' }
  ];

  return (
    <div className="font-sans pb-32 bg-slate-50/50 min-h-screen select-none">
      
      <style>{`
        @keyframes scan-laser {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .laser-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 3px;
          background: #00ff66;
          box-shadow: 0 0 10px #00ff66, 0 0 20px #00ff66;
          animation: scan-laser 2s linear infinite;
        }
      `}</style>

      {/* ═══ GREETING & COMPLEX HEADER ═══ */}
      <header className="px-5 pt-12 pb-6 bg-brand-emerald text-white rounded-b-[2rem] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <p className="text-white/60 text-xs font-semibold tracking-wider">Sporty-Tech Owner App</p>
            <h1 className="text-xl font-black tracking-tight mt-0.5">Bảng điều khiển</h1>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-sm">
            <span className="font-bold text-sm text-brand-yellow">SA</span>
          </div>
        </div>

        {/* Custom Dropdown used as venue complex switcher */}
        <div className="relative z-10 mb-6">
          <Dropdown
            options={COMPLEXES.map(c => ({ value: c.id, label: c.name }))}
            value={selectedComplex}
            onChange={(val) => setSelectedComplex(val as ComplexId)}
            className="w-full text-slate-800"
          />
        </div>
        
        {/* KPI Mini Grid */}
        <div className="grid grid-cols-3 gap-3 relative z-10">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Doanh thu</p>
            <p className="text-lg font-black text-brand-yellow mt-0.5">{stats.revenueK}k</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Lấp đầy</p>
            <p className="text-lg font-black mt-0.5">{stats.occupancy}%</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Sân mở</p>
            <p className="text-lg font-black mt-0.5">{stats.activeRatio}</p>
          </div>
        </div>
      </header>

      {/* ═══ MAIN MOBILE WORKSPACE ═══ */}
      <main className="px-4 mt-6 space-y-6">
        
        {/* Quick check-in trigger */}
        <section className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h3 className="font-black text-sm text-slate-800">Check-in bằng mã QR</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Xác nhận check-in nhanh bằng Camera quét</p>
          </div>
          <button
            onClick={handleStartQRScan}
            className="flex items-center gap-1.5 bg-brand-yellow text-brand-emerald text-xs font-black px-4 py-2.5 rounded-2xl shadow-sm active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            <span>Quét QR</span>
          </button>
        </section>

        {/* Revenue SVG Chart */}
        <section className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide">Hiệu suất Doanh thu</h2>
            
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
              {(['day', 'quarter', 'year'] as ChartPeriod[]).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-wider ${chartPeriod === p ? 'bg-brand-emerald text-white shadow-xs' : 'text-slate-500'}`}
                >
                  {p === 'day' ? 'Ngày' : p === 'quarter' ? 'Quý' : 'Năm'}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full flex justify-center items-center h-[110px] bg-slate-50/20 rounded-2xl border border-slate-100 p-1">
            <svg className="w-full h-[95px] overflow-visible" viewBox="0 0 320 100">
              <path d={areaString} fill="url(#mobile-chart-grad)" />
              <path d={pathString} fill="none" stroke="#064E3B" strokeWidth="2.5" strokeLinecap="round" />
              <linearGradient id="mobile-chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#064E3B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#064E3B" stopOpacity="0.00" />
              </linearGradient>

              {chartPoints.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#064E3B" stroke="#ffffff" strokeWidth="1" />
              ))}

              {chartPoints.map((pt, i) => (
                <text key={i} x={pt.x} y="96" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">
                  {chartData.labels[i]}
                </text>
              ))}
            </svg>
          </div>
        </section>

        {/* Live Pitch Grid (Expanded/Collapsed manual change) */}
        <section className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide">Trạng thái sân hôm nay</h2>
            <span className="text-[10px] text-slate-400 font-medium">
              {isPitchesExpanded ? 'Chọn trạng thái thủ công' : 'Chỉ xem trạng thái'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(isPitchesExpanded ? currentPitches : currentPitches.slice(0, 3)).map(p => (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                  p.status === 'available' ? 'bg-emerald-50/20 border-emerald-100' :
                  p.status === 'busy' ? 'bg-amber-50/15 border-amber-100' :
                  'bg-red-50/15 border-red-100'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800">{p.name}</span>
                    <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                      {p.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      p.status === 'available' ? 'bg-brand-emerald animate-pulse' :
                      p.status === 'busy' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}></span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {p.status === 'available' ? 'Trống' : p.status === 'busy' ? 'Bận' : 'Bảo trì'}
                    </span>
                  </div>
                </div>

                {/* Dropdown status changer only visible when expanded */}
                {isPitchesExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-400 font-bold">Trạng thái:</span>
                    <Dropdown
                      options={pitchStatusOptions}
                      value={p.status}
                      onChange={(newVal) => handleInitiateStatusChange(p, newVal as PitchStatus)}
                      className="w-28"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsPitchesExpanded(!isPitchesExpanded)}
            className="w-full mt-4 pt-2.5 border-t border-slate-100 text-[10px] font-black text-brand-emerald hover:text-emerald-950 uppercase tracking-widest text-center flex items-center justify-center gap-1 focus:outline-none"
          >
            <span>{isPitchesExpanded ? 'Thu gọn trạng thái' : 'Mở rộng sân bãi (Xem thêm)'}</span>
            <span className="transition-transform duration-200" style={{ transform: isPitchesExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
        </section>

        {/* Recent Bookings */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide">Đơn đặt gần đây (Tự động duyệt)</h2>
            <button 
              onClick={() => navigate('/matrix')} 
              className="text-[10px] font-bold text-brand-emerald hover:text-emerald-950 transition-colors"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-3">
            {currentBookings.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-bold bg-white rounded-2xl border border-slate-200/50">
                Không có đơn đặt nào
              </div>
            ) : (
              currentBookings.map((b) => (
                <Card key={b.id} className="p-4 border-none shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-brand-emerald border border-slate-200">
                        {b.pitchName.substring(4)}
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-800">{b.customerName}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{b.pitchName} • {b.time}</p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="text-[11px] font-black text-slate-700">
                        {new Intl.NumberFormat('vi-VN').format(b.amount)}đ
                      </span>
                      {b.status === 'checked-in' ? (
                        <span className="text-[8px] font-black uppercase text-brand-emerald bg-emerald-50 px-2 py-0.5 rounded-md">
                          Checked-in
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCheckinDirect(b.id)}
                          className="text-[8px] font-extrabold uppercase text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded-md border border-blue-100 transition-colors"
                        >
                          Check-in
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Collapsible logs */}
        <section className="bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-3">Nhật ký hoạt động</h2>
          <div className="space-y-3 max-h-[110px] overflow-y-auto pr-1">
            {activities.map(a => (
              <div key={a.id} className="flex gap-2 text-[10px] items-start">
                <span className="font-bold text-slate-400">{a.time}</span>
                <span className="text-slate-600 leading-tight font-medium">{a.message}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* QR scanner simulation modal */}
      <Modal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        title="Quét mã QR Check-in"
        maxWidth="sm"
      >
        <div className="space-y-5 text-center">
          <p className="text-xs text-slate-500 font-medium">Đặt mã vé QR của khách hàng vào khung hình camera dưới đây để check-in tự động</p>
          
          <div className="w-full max-w-[240px] aspect-square mx-auto border-2 border-slate-200 bg-slate-900 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center">
            {isScanning ? (
              <>
                <div className="absolute inset-4 border border-white/10 rounded-2xl flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="w-5 h-5 border-t-4 border-l-4 border-brand-yellow rounded-tl-md"></div>
                    <div className="w-5 h-5 border-t-4 border-r-4 border-brand-yellow rounded-tr-md"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-5 h-5 border-b-4 border-l-4 border-brand-yellow rounded-bl-md"></div>
                    <div className="w-5 h-5 border-b-4 border-r-4 border-brand-yellow rounded-tr-md"></div>
                  </div>
                </div>
                <div className="laser-line"></div>
                
                <svg className="w-8 h-8 text-brand-yellow animate-spin relative z-10" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-[10px] font-black uppercase text-brand-yellow tracking-widest mt-4 animate-pulse relative z-10">Đang quét mã...</span>
              </>
            ) : (
              <div className="p-4 relative z-10 flex flex-col items-center">
                {scanStatus === 'success' ? (
                  <>
                    <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-3 shadow-[0_4px_12px_rgba(16,185,129,0.3)] transform scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h4 className="text-sm font-black text-white">CHECK-IN THÀNH CÔNG</h4>
                    <p className="text-[11px] text-brand-yellow font-bold mt-1.5">{scannedResult}</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white mb-3 shadow-[0_4px_12px_rgba(239,68,68,0.3)]">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <h4 className="text-sm font-black text-white">CHECK-IN THẤT BẠI</h4>
                    <p className="text-[10px] text-red-200 mt-1">Không còn đơn đặt nào đang chờ quét check-in</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsScanModalOpen(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs transition-colors"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </Modal>

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
