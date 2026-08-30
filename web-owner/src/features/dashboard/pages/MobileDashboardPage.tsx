import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { useDashboard } from '../hooks/useDashboard';
import { MobileDashboardHeader } from '../components/mobile/MobileDashboardHeader';
import { MobileQuickActions } from '../components/mobile/MobileQuickActions';
import { MobileRevenueChart } from '../components/mobile/MobileRevenueChart';
import { MobilePitchMonitor } from '../components/mobile/MobilePitchMonitor';
import { MobileBookingList } from '../components/mobile/MobileBookingList';
import { MobileActivityLog } from '../components/mobile/MobileActivityLog';
import { Sparkles, ArrowRight } from 'lucide-react';

export const MobileDashboardPage = () => {
  const navigate = useNavigate();
  const {
    listComplexes,
    selectedComplex,
    setSelectedComplex,
    chartPeriod,
    setChartPeriod,
    currentPitches,
    currentBookings,
    stats,
    chartData,
    chartPoints,
    pathString,
    areaString,
    svgWidth,
    svgHeight,
    isPitchesExpanded,
    setIsPitchesExpanded,
    selectedPitchToEdit,
    setSelectedPitchToEdit,
    pendingStatusToApply,
    setPendingStatusToApply,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    isScanModalOpen,
    setIsScanModalOpen,
    isScanning,
    scanStatus,
    scannedResult,
    ticketCode,
    setTicketCode,
    scanMessage,
    activities,
    handleInitiateStatusChange,
    handleConfirmStatusChange,
    handleCheckinDirect,
    handleStartQRScan,
    handleQuickCheckin,
    handleSimulateDesktopQR
  } = useDashboard({ isMobile: true });

  return (
    <div
      className="font-sans min-h-dvh bg-slate-100/60 select-none w-full pb-28"
      style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* 1. GREETING, FACILITY SELECTOR & 4-KPI CARDS HEADER */}
      <MobileDashboardHeader
        selectedComplex={selectedComplex}
        onChangeComplex={setSelectedComplex}
        listComplexes={listComplexes}
        stats={stats}
      />

      {/* 2. MAIN MOBILE WORKSPACE */}
      <main className="px-4 -mt-2 space-y-4 relative z-20">
        {/* Quick check-in & QR Action Hub */}
        <MobileQuickActions
          isScanning={isScanning}
          isScanModalOpen={isScanModalOpen}
          setIsScanModalOpen={setIsScanModalOpen}
          scanStatus={scanStatus}
          scannedResult={scannedResult}
          onStartQRScan={handleStartQRScan}
          ticketCode={ticketCode}
          setTicketCode={setTicketCode}
          scanMessage={scanMessage}
          onQuickCheckin={handleQuickCheckin}
          onSimulateDesktopQR={handleSimulateDesktopQR}
        />

        {/* AI Dynamic Pricing Insight Widget */}
        <div
          onClick={() => navigate('/pricing')}
          className="bg-gradient-to-r from-[#002b1f] via-[#064e3b] to-[#043d2e] rounded-3xl p-4 text-white shadow-md border border-emerald-800/60 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-brand-yellow text-[#064e3b] flex items-center justify-center shrink-0 shadow-sm font-black">
                <Sparkles className="w-5 h-5 fill-[#064e3b]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-yellow">Dự báo giá AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h3 className="text-xs font-black text-white truncate mt-0.5">
                  Tối ưu hóa giá & Tỷ lệ lấp đầy
                </h3>
                <p className="text-[10px] text-white/70 font-medium truncate mt-0.5">
                  Khám phá các ca trống & giờ vàng được AI đề xuất
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Interactive Revenue Performance Chart */}
        <MobileRevenueChart
          chartPeriod={chartPeriod}
          setChartPeriod={setChartPeriod}
          chartData={chartData}
          chartPoints={chartPoints}
          pathString={pathString}
          areaString={areaString}
          svgWidth={svgWidth}
          svgHeight={svgHeight}
        />

        {/* Live Pitch Monitor & Quick Action Sheet */}
        <MobilePitchMonitor
          currentPitches={currentPitches}
          isPitchesExpanded={isPitchesExpanded}
          setIsPitchesExpanded={setIsPitchesExpanded}
          onInitiateStatusChange={handleInitiateStatusChange}
        />

        {/* Recent Bookings List & Check-in Actions */}
        <MobileBookingList
          currentBookings={currentBookings}
          listComplexes={listComplexes}
          onCheckinDirect={handleCheckinDirect}
        />

        {/* Timeline Activity Log */}
        <MobileActivityLog activities={activities} />
      </main>

      {/* Confirm Modal for Status Changes */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedPitchToEdit(null);
          setPendingStatusToApply(null);
        }}
        onConfirm={handleConfirmStatusChange}
        title="Xác nhận đổi trạng thái sân"
        message={`Bạn có chắc chắn muốn thay đổi trạng thái của ${selectedPitchToEdit?.name} sang "${pendingStatusToApply === 'available' ? 'Trống' :
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

export default MobileDashboardPage;

