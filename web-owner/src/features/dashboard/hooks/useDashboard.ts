import { useState, useMemo } from 'react';
import type { ComplexId, PitchStatus, ChartPeriod, Pitch, Booking, Activity } from '../types';
import {
  COMPLEXES,
  MOBILE_COMPLEXES,
  INITIAL_PITCHES,
  DESKTOP_INITIAL_BOOKINGS,
  MOBILE_INITIAL_BOOKINGS,
  DESKTOP_INITIAL_ACTIVITIES,
  MOBILE_INITIAL_ACTIVITIES,
  DESKTOP_REVENUE_CHART_DATA,
  MOBILE_REVENUE_CHART_DATA,
} from '../services/dashboardService';

interface UseDashboardProps {
  isMobile?: boolean;
}

export const useDashboard = ({ isMobile = false }: UseDashboardProps = {}) => {
  // ═══ RESOLVE INITIAL DATA ═══
  const listComplexes = isMobile ? MOBILE_COMPLEXES : COMPLEXES;
  const initialBookings = isMobile ? MOBILE_INITIAL_BOOKINGS : DESKTOP_INITIAL_BOOKINGS;
  const initialActivities = isMobile ? MOBILE_INITIAL_ACTIVITIES : DESKTOP_INITIAL_ACTIVITIES;
  const revenueChartData = isMobile ? MOBILE_REVENUE_CHART_DATA : DESKTOP_REVENUE_CHART_DATA;

  // ═══ STATES ═══
  const [selectedComplex, setSelectedComplex] = useState<ComplexId>('all');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('day');
  const [pitches, setPitches] = useState<Pitch[]>(INITIAL_PITCHES);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // States for manual status editing
  const [isPitchesExpanded, setIsPitchesExpanded] = useState(false);
  const [selectedPitchToEdit, setSelectedPitchToEdit] = useState<Pitch | null>(null);
  const [pendingStatusToApply, setPendingStatusToApply] = useState<PitchStatus | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // QR Scan simulation modal states (Mobile)
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scannedResult, setScannedResult] = useState<string>('');

  // Ticket Code and Scan status states (Desktop)
  const [ticketCode, setTicketCode] = useState('');
  const [scanMessage, setScanMessage] = useState<{ text: string; success: boolean } | null>(null);

  // ═══ MEMOS ═══
  const currentPitches = useMemo(() => {
    if (selectedComplex === 'all') return pitches;
    return pitches.filter(p => p.complexId === selectedComplex);
  }, [pitches, selectedComplex]);

  const currentBookings = useMemo(() => {
    if (selectedComplex === 'all') return bookings;
    return bookings.filter(b => b.complexId === selectedComplex);
  }, [bookings, selectedComplex]);

  const stats = useMemo(() => {
    const activePitchesCount = currentPitches.filter(p => p.status !== 'maintenance').length;
    const busyPitchesCount = currentPitches.filter(p => p.status === 'busy').length;
    const totalPitchesCount = currentPitches.length;

    const occupancyRate = totalPitchesCount > 0 
      ? Math.round((busyPitchesCount / totalPitchesCount) * 100) 
      : 0;

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
      revenueK: Math.round(totalRevenue / 1000),
      occupancy: occupancyRate,
      pendingCount: pendingCheckinCount,
      activeRatio: `${activePitchesCount}/${totalPitchesCount}`
    };
  }, [currentPitches, currentBookings, selectedComplex]);

  const chartData = useMemo(() => {
    return revenueChartData[selectedComplex][chartPeriod];
  }, [revenueChartData, selectedComplex, chartPeriod]);

  // SVG Chart points calculation
  // Mobile canvas width = 320, height = 100, paddingX = 25, paddingY = 12
  // Desktop canvas width = 500, height = 180, paddingX = 40, paddingY = 20
  const svgWidth = isMobile ? 320 : 500;
  const svgHeight = isMobile ? 100 : 180;
  const paddingX = isMobile ? 25 : 40;
  const paddingY = isMobile ? 12 : 20;

  const chartPoints = useMemo(() => {
    const maxVal = Math.max(...chartData.values, isMobile ? 10 : 1000);
    const stepX = (svgWidth - paddingX * 2) / (chartData.values.length - 1);

    return chartData.values.map((val, idx) => {
      const x = paddingX + idx * stepX;
      const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - paddingY * 2);
      return { x, y, value: val };
    });
  }, [chartData, isMobile, svgWidth, svgHeight, paddingX, paddingY]);

  const pathString = useMemo(() => {
    return chartPoints.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = chartPoints[idx - 1];
      if (isMobile) {
        const cpX1 = prev.x + (pt.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (pt.x - prev.x) / 2;
        const cpY2 = pt.y;
        return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
      } else {
        const cpX1 = prev.x + (pt.x - prev.x) / 3;
        const cpY1 = prev.y;
        const cpX2 = prev.x + 2 * (pt.x - prev.x) / 3;
        const cpY2 = pt.y;
        return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
      }
    }, '');
  }, [chartPoints, isMobile]);

  const areaString = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const startPoint = `M ${chartPoints[0].x} ${svgHeight - paddingY}`;
    const endPoint = `L ${chartPoints[chartPoints.length - 1].x} ${svgHeight - paddingY} Z`;
    return `${startPoint} L ${chartPoints[0].x} ${chartPoints[0].y} ${pathString.substring(1)} ${endPoint}`;
  }, [chartPoints, pathString, svgHeight, paddingY]);

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

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const statusMap = { available: 'Trống', busy: 'Đang bận', maintenance: 'Bảo trì' };
      
      const newAct: Activity = {
        id: `a-${Date.now()}`,
        time: timeStr,
        message: isMobile
          ? `Mobile: Đổi trạng thái ${p.name} -> ${statusMap[pendingStatusToApply]}`
          : `${p.name} vừa chuyển sang trạng thái: ${statusMap[pendingStatusToApply]}`,
        type: 'status-change'
      };
      setActivities(prevAct => [newAct, ...prevAct]);

      return { ...p, status: pendingStatusToApply };
    }));

    setSelectedPitchToEdit(null);
    setPendingStatusToApply(null);
    setIsConfirmModalOpen(false);
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
      message: isMobile
        ? `Mobile: Check-in ${booking.customerName} (${booking.pitchName})`
        : `Check-in trực tiếp: ${booking.customerName} - ${booking.pitchName}`,
      type: 'check-in'
    };
    setActivities(prevAct => [newAct, ...prevAct]);
  };

  // QR Scanning Simulation (Mobile)
  const handleStartQRScan = () => {
    setIsScanModalOpen(true);
    setIsScanning(true);
    setScanStatus('idle');
    setScannedResult('');

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

  // Quick Ticket Code Check-in Form Submission (Desktop)
  const handleQuickCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setIsScanning(true);
    setScanMessage(null);

    setTimeout(() => {
      setIsScanning(false);
      const code = ticketCode.trim().toUpperCase();
      const bookingIndex = bookings.findIndex(b => b.id.toUpperCase().includes(code) || code === 'SP-2026' || code === 'CHECKIN');
      
      if (bookingIndex !== -1 || code.startsWith('SP-') || code.length >= 3) {
        const checkedBooking = bookingIndex !== -1 ? bookings[bookingIndex] : bookings[0];
        
        setBookings(prev => prev.map((b, idx) => {
          if (idx === (bookingIndex !== -1 ? bookingIndex : 0)) {
            return { ...b, status: 'checked-in' };
          }
          return b;
        }));

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
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
        setScanMessage({ text: `Mã vé ${code} không hợp lệ hoặc đã sử dụng!`, success: false });
      }
    }, 1000);
  };

  const handleSimulateDesktopQR = () => {
    setTicketCode('b-1');
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      handleCheckinDirect('b-1');
      setScanMessage({ text: 'Giả lập check-in mã vé b-1 (Nguyễn Văn Hùng) thành công!', success: true });
      setTicketCode('');
    }, 1000);
  };

  const handleComplexChange = (val: ComplexId) => {
    setSelectedComplex(val);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newAct: Activity = {
      id: `a-${Date.now()}`,
      time: timeStr,
      message: isMobile
        ? `Chuyển cụm sân đang xem` // In MobileHome, selectedComplex change is not logged in activities, only in Desktop. Let's align or write cleaner logic.
        : `Chuyển cụm sân đang xem sang: ${listComplexes.find(c => c.id === val)?.name}`,
      type: 'system'
    };
    if (!isMobile) {
      setActivities(prevAct => [newAct, ...prevAct]);
    }
  };

  return {
    // Data
    listComplexes,
    selectedComplex,
    setSelectedComplex: handleComplexChange,
    chartPeriod,
    setChartPeriod,
    hoveredDataIndex,
    setHoveredDataIndex,
    activities,

    
    // Calculated
    currentPitches,
    currentBookings,
    stats,
    chartData,
    chartPoints,
    pathString,
    areaString,
    svgWidth,
    svgHeight,
    
    // States and toggles
    isPitchesExpanded,
    setIsPitchesExpanded,
    selectedPitchToEdit,
    setSelectedPitchToEdit,
    pendingStatusToApply,
    setPendingStatusToApply,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    
    // Mobile QR Modal
    isScanModalOpen,
    setIsScanModalOpen,
    isScanning,
    setIsScanning,
    scanStatus,
    setScanStatus,
    scannedResult,
    setScannedResult,
    
    // Desktop check-in form
    ticketCode,
    setTicketCode,
    scanMessage,
    setScanMessage,

    // Handlers
    handleInitiateStatusChange,
    handleConfirmStatusChange,
    handleCheckinDirect,
    handleStartQRScan,
    handleQuickCheckin,
    handleSimulateDesktopQR,
  };
};
export type UseDashboardReturn = ReturnType<typeof useDashboard>;
