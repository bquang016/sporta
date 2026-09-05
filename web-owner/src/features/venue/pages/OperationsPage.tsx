import React, { useState } from 'react';
import { useOperationsPage } from '../hooks/useOperationsPage';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { OperationsSidebar } from '../components/operations/OperationsSidebar';
import { OperationsOverviewTab } from '../components/operations/OperationsOverviewTab';
import { OperationsFacilitiesTab } from '../components/operations/OperationsFacilitiesTab';
import { BookingQueueModal } from '../components/operations/BookingQueueModal';
import { BulkSurchargeModal } from '../components/operations/BulkSurchargeModal';
import { CourtConfigModal } from '../components/operations/CourtConfigModal';
import { VenueWizard } from '../components/operations/VenueWizard';
import { VenuePendingDetailScreen } from '../components/operations/VenuePendingDetailScreen';
import { DraftFloater } from '../components/operations/DraftFloater';
import { VenueStatusModal } from '../components/VenueStatusModal';
import { VenueRowMenu } from '../components/operations/VenueRowMenu';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { AddCourtSubScreen } from '../components/operations/AddCourtSubScreen';

// Mobile Dedicated Operations Components
import { MobileOperationsHeader, type OperationsTabType } from '../components/mobile/MobileOperationsHeader';
import { MobileCourtsTab } from '../components/mobile/MobileCourtsTab';
import { MobileAnalyticsTab } from '../components/mobile/MobileAnalyticsTab';
import { MobilePricingTab } from '../components/mobile/MobilePricingTab';
import { MobileVenueManagerTab } from '../components/mobile/MobileVenueManagerTab';
import { MobileAddCourtSheet } from '../components/mobile/MobileAddCourtSheet';
import { MobileCourtConfigSheet } from '../components/mobile/MobileCourtConfigSheet';
import { MobileBulkSurchargeSheet } from '../components/mobile/MobileBulkSurchargeSheet';
import { MobileVenueStatusSheet } from '../components/mobile/MobileVenueStatusSheet';
import type { CourtResponse } from '../types';

export const OperationsPage = () => {
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<OperationsTabType>('courts');

  const {
    venues,
    courts,
    selectedVenueId,
    selectedCourtIds,
    loading,
    error,
    setSelectedVenueId,
    setSelectedCourtIds,

    mobileScreen, setMobileScreen,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    isQueueModalOpen, setIsQueueModalOpen,
    isEditModalOpen, setIsEditModalOpen,
    isCreateVenueModalOpen, setIsCreateVenueModalOpen,
    isEditVenueModalOpen, setIsEditVenueModalOpen,
    isVenueStatusModalOpen, setIsVenueStatusModalOpen,
    openVenueMenuId, setOpenVenueMenuId,

    editingCourt, editName, setEditName,
    editPrice, setEditPrice,
    editOpStatus, setEditOpStatus,

    hasShiftPricing, setHasShiftPricing,
    shiftPrices, setShiftPrice, removeShiftPrice,
    hasDayOfWeekPricing, setHasDayOfWeekPricing,
    selectedDayOfWeek, setSelectedDayOfWeek,
    dayPricingType, setDayPricingType,
    dayPricingValue, setDayPricingValue,
    isBulkEdit,
    configMode,

    // Create Venue Inputs
    newVenueName, setNewVenueName,
    newVenueLocation, setNewVenueLocation,
    newVenueLatitude, setNewVenueLatitude,
    newVenueLongitude, setNewVenueLongitude,
    newVenueDescription, setNewVenueDescription,
    newVenueOpeningTime, setNewVenueOpeningTime,
    newVenueClosingTime, setNewVenueClosingTime,
    newVenueShiftDuration, setNewVenueShiftDuration,
    newVenueSportId, setNewVenueSportId,
    newVenueCoverImage, setNewVenueCoverImage,
    newVenueDetailImages,
    newVenueHasSurcharge, setNewVenueHasSurcharge,
    newVenueSurchargeAmount, setNewVenueSurchargeAmount,
    newVenueSurchargeDescription, setNewVenueSurchargeDescription,
    uploadingNewVenueCover, uploadingNewVenueDetail,

    isSurchargeModalOpen, setIsSurchargeModalOpen,
    surchargeAmount, setSurchargeAmount,
    surchargeCourtIds,

    activeVenue, activeVenueId, activeCourts, filteredVenues, draftVenues, deleteVenueDraft,
    actionRequiredBookings, todayRevenue, totalBookingsCount, avgOccupancy,
    totalVenueSlots, totalBookedSlots,
    activeCount, maintCount, closedCount, totalOpCourts,

    // Statistics API states
    statistics, isLoadingStats,
    dateRangePreset, setDateRangePreset,
    customFromDate, setCustomFromDate,
    customToDate, setCustomToDate,
    refreshStatistics,

    formatVND, hourDropdownOptions, opDropdownOptions,
    getCourtOpStatus, getCourtDetails,

    pendingVenueStatus, isConfirmStatusModalOpen,

    handleVenueStatusSelect, handleConfirmVenueStatusChange, handleCancelVenueStatusChange,
    handleOpenVenueStatusFromMenu, handleCreateVenue, handleOpenEditVenue,
    handleSelectAll, handleSelectCourt, handleOpenBulkSurcharge,
    handleApplySurcharge, handleOpenEditCourt, handleOpenBulkEdit, handleSaveCourtConfig, handleResolveBooking,

    isAddingCourt, newCourtName, setNewCourtName,
    newCourtPrice, setNewCourtPrice,
    newCourtStatus, setNewCourtStatus,
    isConfirmSubmitOpen, setIsConfirmSubmitOpen,
    newCourtValidationErrors,
    handleStartAddCourt, handleCancelAddCourt,
    handleSubmitNewCourt, handleConfirmSubmitNewCourt,

    uploadNewVenueCoverFile, uploadNewVenueDetailFiles,
    handleRemoveNewVenueDetailImage
  } = useOperationsPage();

  const handleQuickToggleCourtStatus = async (court: CourtResponse) => {
    const currentStatus = court.status || 'ACTIVE';
    const nextStatus = currentStatus === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    await handleOpenEditCourt(court, 'shift');
    setEditOpStatus(nextStatus);
  };

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [mobileTab, selectedVenueId]);

  if (loading && venues.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 select-none font-sans">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin mb-4" />
        <span className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (isCreateVenueModalOpen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden">
        <VenueWizard
          onClose={() => setIsCreateVenueModalOpen(false)}
          initialVenue={null}
        />
      </div>
    );
  }

  if (isEditVenueModalOpen) {
    if (activeVenue && activeVenue.approvalStatus === 'PENDING') {
      return (
        <VenuePendingDetailScreen
          onClose={() => setIsEditVenueModalOpen(false)}
          venue={activeVenue}
          courts={activeCourts}
        />
      );
    }

    if (activeVenue) {
      return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden">
          <VenueWizard
            onClose={() => setIsEditVenueModalOpen(false)}
            initialVenue={activeVenue}
            initialCourts={activeCourts}
          />
        </div>
      );
    }
  }

  if (venues.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none font-sans">
        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-xs">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="max-w-md space-y-1">
          <h2 className="text-base font-black text-slate-800">Chưa có cụm sân nào được cấu hình</h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Hệ thống cần ít nhất một cụm sân để quản lý các hoạt động vận hành, sân bãi và đặt sân. Hãy tạo cụm sân đầu tiên của bạn ngay bây giờ.
          </p>
        </div>
        <button
          onClick={() => setIsCreateVenueModalOpen(true)}
          className="bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs px-6 py-4 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 border-b-2 border-emerald-950 mt-6"
        >
          <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          Tạo cụm sân đầu tiên
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 relative font-sans animate-fadeIn">
      {error && (
        <div className="bg-red-50 border border-red-205 text-red-650 rounded-3xl p-5 text-xs font-bold text-center mb-6 select-none flex-shrink-0">
          {error}
        </div>
      )}

      {/* ═══ MOBILE ═══ */}
      {isMobile ? (
        <div className="flex flex-col flex-1 pb-6">
          {/* Mobile Liquid Glass Sticky Header & Tab Switcher */}
          <MobileOperationsHeader
            venues={venues}
            activeVenue={activeVenue}
            activeTab={mobileTab}
            onSelectTab={(tab) => {
              setMobileTab(tab);
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            onSelectVenue={(id) => {
              setSelectedVenueId(id);
              setSelectedCourtIds([]);
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            onCreateVenue={() => setIsCreateVenueModalOpen(true)}
            onAddCourt={handleStartAddCourt}
            onOpenVenueStatus={() => setIsVenueStatusModalOpen(true)}
          />

          {/* Mobile Tab Content */}
          <div className="flex-1 min-h-0 pt-3">
            {mobileTab === 'courts' && (
              <MobileCourtsTab
                courts={courts}
                activeVenue={activeVenue}
                selectedCourtIds={selectedCourtIds}
                onToggleSelectCourt={handleSelectCourt}
                onSelectAllCourts={() => {
                  if (selectedCourtIds.length === activeCourts.length) {
                    setSelectedCourtIds([]);
                  } else {
                    setSelectedCourtIds(activeCourts.map(c => c.id));
                  }
                }}
                onDeselectAllCourts={() => setSelectedCourtIds([])}
                onAddCourt={handleStartAddCourt}
                onEditCourtConfig={(court) => handleOpenEditCourt(court, 'shift')}
                onBulkEdit={() => handleOpenBulkEdit('shift')}
                onBulkSurcharge={handleOpenBulkSurcharge}
                onQuickToggleStatus={handleQuickToggleCourtStatus}
                formatVND={formatVND}
              />
            )}

            {mobileTab === 'analytics' && (
              <MobileAnalyticsTab
                activeVenue={activeVenue}
                courts={courts}
                todayRevenue={todayRevenue}
                totalBookingsCount={totalBookingsCount}
                avgOccupancy={avgOccupancy}
                totalVenueSlots={totalVenueSlots}
                totalBookedSlots={totalBookedSlots}
                statistics={statistics}
                isLoadingStats={isLoadingStats}
                dateRangePreset={dateRangePreset}
                setDateRangePreset={setDateRangePreset}
                customFromDate={customFromDate}
                setCustomFromDate={setCustomFromDate}
                customToDate={customToDate}
                setCustomToDate={setCustomToDate}
                onRefresh={refreshStatistics}
                formatVND={formatVND}
              />
            )}

            {mobileTab === 'pricing' && (
              <MobilePricingTab
                activeVenue={activeVenue}
                courts={courts}
                formatVND={formatVND}
              />
            )}

            {mobileTab === 'venues' && (
              <MobileVenueManagerTab
                venues={venues}
                courts={courts}
                activeVenueId={activeVenueId}
                draftVenues={draftVenues}
                onSelectVenue={(id) => { setSelectedVenueId(id); setMobileTab('courts'); }}
                onCreateVenue={() => setIsCreateVenueModalOpen(true)}
                onEditVenue={handleOpenEditVenue}
                onOpenVenueStatus={(id) => { setSelectedVenueId(id); setIsVenueStatusModalOpen(true); }}
                onResumeDraft={() => {
                  setIsCreateVenueModalOpen(true);
                }}
                onDeleteDraft={deleteVenueDraft}
                formatVND={formatVND}
              />
            )}
          </div>

          {/* ═══ MOBILE BOTTOM SHEETS ═══ */}
          <MobileAddCourtSheet
            isOpen={isAddingCourt}
            onClose={handleCancelAddCourt}
            courtName={newCourtName}
            setCourtName={setNewCourtName}
            courtPrice={newCourtPrice}
            setCourtPrice={setNewCourtPrice}
            courtStatus={newCourtStatus}
            setCourtStatus={setNewCourtStatus}
            validationErrors={newCourtValidationErrors}
            onSubmit={handleConfirmSubmitNewCourt}
          />

          <MobileCourtConfigSheet
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            court={editingCourt}
            isBulkEdit={isBulkEdit}
            selectedCount={selectedCourtIds.length}
            editName={editName}
            setEditName={setEditName}
            editPrice={editPrice}
            setEditPrice={setEditPrice}
            editOpStatus={editOpStatus}
            setEditOpStatus={setEditOpStatus}
            onSave={handleSaveCourtConfig}
          />

          <MobileBulkSurchargeSheet
            isOpen={isSurchargeModalOpen}
            onClose={() => setIsSurchargeModalOpen(false)}
            selectedCount={selectedCourtIds.length}
            surchargeAmount={parseFloat(surchargeAmount) || 0}
            setSurchargeAmount={(amt) => setSurchargeAmount(amt.toString())}
            onApply={handleApplySurcharge}
          />

          <MobileVenueStatusSheet
            isOpen={isVenueStatusModalOpen}
            onClose={() => setIsVenueStatusModalOpen(false)}
            venue={activeVenue}
            onSelectStatus={(st) => handleVenueStatusSelect(st)}
          />

          <ConfirmModal
            isOpen={isConfirmStatusModalOpen}
            title="Xác nhận thay đổi trạng thái cụm sân"
            message={`Bạn có chắc chắn muốn chuyển trạng thái cơ sở "${activeVenue?.name}" sang ${
              pendingVenueStatus === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm đóng cửa / bảo dưỡng'
            }?`}
            confirmText="Xác nhận đổi"
            cancelText="Hủy bỏ"
            variant={pendingVenueStatus === 'ACTIVE' ? 'success' : 'warning'}
            onConfirm={handleConfirmVenueStatusChange}
            onClose={handleCancelVenueStatusChange}
          />
        </div>
      ) : (
        /* ═══ DESKTOP ═══ */
        <div className="flex gap-6 flex-1 min-h-0">
          <OperationsSidebar
            venues={filteredVenues}
            courts={courts}
            activeVenueId={activeVenueId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            openVenueMenuId={openVenueMenuId}
            setOpenVenueMenuId={setOpenVenueMenuId}
            onCreateVenueClick={() => setIsCreateVenueModalOpen(true)}
            onSelectVenue={(venueId) => { setSelectedVenueId(venueId); setSelectedCourtIds([]); }}
            onEditVenueInfo={handleOpenEditVenue}
            onEditVenueStatus={handleOpenVenueStatusFromMenu}
          />

          <section className="flex-1 bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6 flex flex-col min-w-0">
            {activeVenue?.approvalStatus === 'PENDING' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4 select-none animate-fadeIn">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Cụm sân đang chờ duyệt</h3>
                <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                  Thông tin cụm sân <strong>"{activeVenue.name}"</strong> đang được Admin hệ thống duyệt. Trong thời gian này, bạn không thể quản lý danh sách sân lẻ hoặc cấu hình bảng giá/vận hành.
                </p>
                <button
                  onClick={() => handleOpenEditVenue(activeVenue.id)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-[10px] px-5 py-3.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer border-b-2 border-slate-950 flex items-center gap-1.5 uppercase tracking-wider"
                >
                  Xem chi tiết thông tin đang chờ duyệt
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-slate-100 select-none flex-shrink-0">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-black text-slate-800 tracking-tight">{activeVenue?.name}</h1>
                    </div>
                    <p className="text-xs text-slate-455 font-bold leading-normal truncate" title={activeVenue?.location}>
                      Địa chỉ: {activeVenue?.location}
                    </p>
                  </div>
                  <button
                    onClick={handleStartAddCourt}
                    className="bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 border-b-2 border-emerald-950 flex-shrink-0"
                  >
                    <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm sân mới
                  </button>
                </div>

                {actionRequiredBookings.length > 0 && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex justify-between items-center text-xs font-bold text-red-700 animate-pulse select-none flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Có {actionRequiredBookings.length} đơn đặt sân cần giải quyết do cụm sân đóng cửa khẩn cấp.</span>
                    </div>
                    <button
                      onClick={() => setIsQueueModalOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-xl transition-all active:scale-95 flex-shrink-0 cursor-pointer"
                    >
                      Xử lý ngay
                    </button>
                  </div>
                )}

                <div className="bg-slate-100/80 p-1.5 rounded-2xl flex gap-1 select-none my-5 max-w-sm flex-shrink-0">
                  <button
                    onClick={() => setActiveTab('facilities')}
                    className={`flex-1 py-2.5 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer ${
                      activeTab === 'facilities' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Danh sách sân
                  </button>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-2.5 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer ${
                      activeTab === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Biểu đồ vận hành
                  </button>
                </div>

                <div className="flex-1 min-h-0 flex flex-col">
                  {activeTab === 'overview' ? (
                    <OperationsOverviewTab
                      activeCourts={activeCourts}
                      todayRevenue={todayRevenue}
                      totalBookingsCount={totalBookingsCount}
                      avgOccupancy={avgOccupancy}
                      totalVenueSlots={totalVenueSlots}
                      totalBookedSlots={totalBookedSlots}
                      activeCount={activeCount}
                      maintCount={maintCount}
                      closedCount={closedCount}
                      totalOpCourts={totalOpCourts}
                      statistics={statistics}
                      isLoadingStats={isLoadingStats}
                      dateRangePreset={dateRangePreset}
                      setDateRangePreset={setDateRangePreset}
                      customFromDate={customFromDate}
                      setCustomFromDate={setCustomFromDate}
                      customToDate={customToDate}
                      setCustomToDate={setCustomToDate}
                      onRefresh={refreshStatistics}
                      getCourtOpStatus={getCourtOpStatus}
                      getCourtDetails={getCourtDetails}
                      formatVND={formatVND}
                      isMobile={false}
                    />
                  ) : (
                    <OperationsFacilitiesTab
                      activeCourts={activeCourts}
                      selectedCourtIds={selectedCourtIds}
                      handleSelectAll={handleSelectAll}
                      handleSelectCourt={handleSelectCourt}
                      handleOpenEditCourt={handleOpenEditCourt}
                      getCourtDetails={getCourtDetails}
                      formatVND={formatVND}
                      isMobile={false}
                      sportName={activeVenue?.sport?.name}
                    />
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* Desktop Modals */}
      {!isMobile && (
        <>
          <BookingQueueModal
            isOpen={isQueueModalOpen}
            onClose={() => setIsQueueModalOpen(false)}
            actionRequiredBookings={actionRequiredBookings}
            handleResolveBooking={handleResolveBooking}
            formatVND={formatVND}
          />

          <CourtConfigModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            name={editName}
            setName={setEditName}
            price={editPrice}
            setPrice={setEditPrice}
            opStatus={editOpStatus}
            setOpStatus={setEditOpStatus}
            activeVenue={activeVenue}
            hasShiftPricing={hasShiftPricing}
            setHasShiftPricing={setHasShiftPricing}
            shiftPrices={shiftPrices}
            setShiftPrice={setShiftPrice}
            removeShiftPrice={removeShiftPrice}
            hasDayOfWeekPricing={hasDayOfWeekPricing}
            setHasDayOfWeekPricing={setHasDayOfWeekPricing}
            selectedDayOfWeek={selectedDayOfWeek}
            setSelectedDayOfWeek={setSelectedDayOfWeek}
            dayPricingType={dayPricingType}
            setDayPricingType={setDayPricingType}
            dayPricingValue={dayPricingValue}
            setDayPricingValue={setDayPricingValue}
            isBulkEdit={isBulkEdit}
            selectedCourtsCount={selectedCourtIds.length}
            configMode={configMode}
            onSave={handleSaveCourtConfig}
            formatVND={formatVND}
          />

          <BulkSurchargeModal
            isOpen={isSurchargeModalOpen}
            onClose={() => setIsSurchargeModalOpen(false)}
            surchargeAmount={surchargeAmount}
            setSurchargeAmount={setSurchargeAmount}
            surchargeCourtIds={surchargeCourtIds}
            handleApplySurcharge={handleApplySurcharge}
            formatVND={formatVND}
          />

          <VenueStatusModal
            isOpen={isVenueStatusModalOpen}
            onClose={() => setIsVenueStatusModalOpen(false)}
            currentStatus={activeVenue?.status}
            onChangeStatus={handleVenueStatusSelect}
          />

          <ConfirmModal
            isOpen={isConfirmStatusModalOpen}
            onClose={handleCancelVenueStatusChange}
            onConfirm={handleConfirmVenueStatusChange}
            title="Xác nhận thay đổi trạng thái"
            confirmText="Xác nhận"
            cancelText="Hủy"
            variant={
              pendingVenueStatus === 'ACTIVE'
                ? 'success'
                : pendingVenueStatus === 'CLOSED'
                  ? 'danger'
                  : 'warning'
            }
            message={
              pendingVenueStatus === 'ACTIVE'
                ? `Bạn có chắc chắn muốn mở cửa hoạt động lại cụm sân "${activeVenue?.name || ''}"? Tất cả các sân bãi trực thuộc sẽ được chuyển sang trạng thái hoạt động.`
                : pendingVenueStatus === 'CLOSED'
                  ? `CẢNH BÁO: Bạn có chắc chắn muốn ĐÓNG CỬA khẩn cấp cụm sân "${activeVenue?.name || ''}"? Tất cả sân bãi trực thuộc sẽ đóng cửa, và bạn có thể cần xử lý các đơn đặt sân bị ảnh hưởng.`
                  : `Bạn có chắc chắn muốn chuyển cụm sân "${activeVenue?.name || ''}" sang trạng thái bảo trì? Toàn bộ sân bãi bên trong sẽ tạm ngưng nhận khách đặt lịch mới.`
            }
          />

          <ConfirmModal
            isOpen={isConfirmSubmitOpen}
            onClose={() => setIsConfirmSubmitOpen(false)}
            onConfirm={handleConfirmSubmitNewCourt}
            title="Xác nhận lưu sân lẻ"
            message={`Bạn có chắc chắn muốn lưu thông tin cho sân "${newCourtName}"?`}
            confirmText="Đồng ý"
            cancelText="Hủy"
            variant="success"
          />

          <DraftFloater
            drafts={draftVenues}
            onResume={(draft) => handleOpenEditVenue(draft.id)}
            onDelete={deleteVenueDraft}
          />
        </>
      )}
    </div>
  );
};
export default OperationsPage;