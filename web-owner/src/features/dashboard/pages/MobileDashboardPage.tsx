import React from 'react';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { useDashboard } from '../hooks/useDashboard';
import DashboardHeader from '../components/DashboardHeader';
import QuickCheckIn from '../components/QuickCheckIn';
import RevenueChart from '../components/RevenueChart';
import PitchMonitor from '../components/PitchMonitor';
import BookingList from '../components/BookingList';
import ActivityLog from '../components/ActivityLog';

export const MobileDashboardPage = () => {
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
    activities,
    handleInitiateStatusChange,
    handleConfirmStatusChange,
    handleCheckinDirect,
    handleStartQRScan
  } = useDashboard({ isMobile: true });

  return (
    <div className="font-sans pb-32 bg-slate-50/50 min-h-screen select-none w-full">
      {/* GREETING & COMPLEX HEADER */}
      <DashboardHeader
        isMobile
        selectedComplex={selectedComplex}
        onChangeComplex={setSelectedComplex}
        listComplexes={listComplexes}
        stats={stats}
      />

      {/* MAIN MOBILE WORKSPACE */}
      <main className="px-4 mt-6 space-y-6">
        {/* Quick check-in trigger */}
        <QuickCheckIn
          isMobile
          isScanning={isScanning}
          isScanModalOpen={isScanModalOpen}
          setIsScanModalOpen={setIsScanModalOpen}
          scanStatus={scanStatus}
          scannedResult={scannedResult}
          onStartQRScan={handleStartQRScan}
        />

        {/* Revenue SVG Chart */}
        <RevenueChart
          isMobile
          chartPeriod={chartPeriod}
          setChartPeriod={setChartPeriod}
          hoveredDataIndex={null}
          setHoveredDataIndex={() => {}}
          chartData={chartData}
          chartPoints={chartPoints}
          pathString={pathString}
          areaString={areaString}
          svgWidth={svgWidth}
          svgHeight={svgHeight}
        />

        {/* Live Pitch Grid */}
        <PitchMonitor
          isMobile
          currentPitches={currentPitches}
          isPitchesExpanded={isPitchesExpanded}
          setIsPitchesExpanded={setIsPitchesExpanded}
          onInitiateStatusChange={handleInitiateStatusChange}
        />

        {/* Recent Bookings */}
        <BookingList
          isMobile
          currentBookings={currentBookings}
          listComplexes={listComplexes}
          onCheckinDirect={handleCheckinDirect}
        />

        {/* Collapsible logs */}
        <ActivityLog isMobile activities={activities} />
      </main>

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

export default MobileDashboardPage;
