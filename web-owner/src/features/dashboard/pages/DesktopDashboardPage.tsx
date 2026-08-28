import React from 'react';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { useDashboard } from '../hooks/useDashboard';
import DashboardHeader from '../components/DashboardHeader';
import KPIStats from '../components/KPIStats';
import RevenueChart from '../components/RevenueChart';
import BookingList from '../components/BookingList';
import QuickCheckIn from '../components/QuickCheckIn';
import PitchMonitor from '../components/PitchMonitor';
import ActivityLog from '../components/ActivityLog';

export const DesktopDashboardPage = () => {
  const {
    listComplexes,
    selectedComplex,
    setSelectedComplex,
    chartPeriod,
    setChartPeriod,
    hoveredDataIndex,
    setHoveredDataIndex,
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
    ticketCode,
    setTicketCode,
    scanMessage,
    isScanning,
    activities,
    handleInitiateStatusChange,
    handleConfirmStatusChange,
    handleCheckinDirect,
    handleQuickCheckin,
    handleSimulateDesktopQR
  } = useDashboard({ isMobile: false });

  return (
    <div className="space-y-6 pb-12 select-none overflow-y-auto w-full">
      {/* TOP HEADER SWITCHER */}
      <DashboardHeader
        isMobile={false}
        selectedComplex={selectedComplex}
        onChangeComplex={setSelectedComplex}
        listComplexes={listComplexes}
      />

      {/* KPI CARDS GRID */}
      <KPIStats stats={stats} />

      {/* MAIN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Charts & Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Area Chart */}
          <RevenueChart
            isMobile={false}
            chartPeriod={chartPeriod}
            setChartPeriod={setChartPeriod}
            hoveredDataIndex={hoveredDataIndex}
            setHoveredDataIndex={setHoveredDataIndex}
            chartData={chartData}
            chartPoints={chartPoints}
            pathString={pathString}
            areaString={areaString}
            svgWidth={svgWidth}
            svgHeight={svgHeight}
          />

          {/* Recent Bookings */}
          <BookingList
            isMobile={false}
            currentBookings={currentBookings}
            listComplexes={listComplexes}
            onCheckinDirect={handleCheckinDirect}
          />
        </div>

        {/* Right Section: Quick actions, Live Pitch Status & Logs */}
        <div className="space-y-6">
          {/* Quick Action: Simulated QR Check-in */}
          <QuickCheckIn
            isMobile={false}
            isScanning={isScanning}
            ticketCode={ticketCode}
            setTicketCode={setTicketCode}
            scanMessage={scanMessage}
            onQuickCheckin={handleQuickCheckin}
            onSimulateDesktopQR={handleSimulateDesktopQR}
          />

          {/* Live Pitch Monitor */}
          <PitchMonitor
            isMobile={false}
            currentPitches={currentPitches}
            isPitchesExpanded={isPitchesExpanded}
            setIsPitchesExpanded={setIsPitchesExpanded}
            onInitiateStatusChange={handleInitiateStatusChange}
          />

          {/* Activities log */}
          <ActivityLog isMobile={false} activities={activities} />
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

export default DesktopDashboardPage;
