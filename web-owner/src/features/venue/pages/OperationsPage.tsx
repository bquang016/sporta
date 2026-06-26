import React from 'react';
import { useOperationsPage } from '../hooks/useOperationsPage';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { OperationsSidebar } from '../components/operations/OperationsSidebar';
import { OperationsOverviewTab } from '../components/operations/OperationsOverviewTab';
import { OperationsFacilitiesTab } from '../components/operations/OperationsFacilitiesTab';
import { BookingQueueModal } from '../components/operations/BookingQueueModal';
import { BulkSurchargeModal } from '../components/operations/BulkSurchargeModal';
import { CourtConfigModal } from '../components/operations/CourtConfigModal';
import { VenueFormScreen } from '../components/VenueFormScreen';
import { VenueStatusModal } from '../components/VenueStatusModal';
import { VenueRowMenu } from '../components/operations/VenueRowMenu';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { AddCourtSubScreen } from '../components/operations/AddCourtSubScreen';

export const OperationsPage = () => {
  const isMobile = useIsMobile();
  const {
    venues,
    courts,
    selectedVenueId,
    selectedCourtIds,
    loading,
    error,
    setSelectedVenueId,
    setSelectedCourtIds,

    // UI Local
    mobileScreen,
    setMobileScreen,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isQueueModalOpen,
    setIsQueueModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isCreateVenueModalOpen,
    setIsCreateVenueModalOpen,
    isEditVenueModalOpen,
    setIsEditVenueModalOpen,
    isVenueStatusModalOpen,
    setIsVenueStatusModalOpen,
    openVenueMenuId,
    setOpenVenueMenuId,

    // Form inputs
    editingCourt,
    editName,
    setEditName,
    editPrice,
    setEditPrice,
    editOpStatus,
    setEditOpStatus,

    // Create Venue Inputs
    newVenueName,
    setNewVenueName,
    newVenueLocation,
    setNewVenueLocation,
    newVenueLatitude,
    setNewVenueLatitude,
    newVenueLongitude,
    setNewVenueLongitude,
    newVenueDescription,
    setNewVenueDescription,
    newVenueOpeningTime,
    setNewVenueOpeningTime,
    newVenueClosingTime,
    setNewVenueClosingTime,
    newVenueShiftDuration,
    setNewVenueShiftDuration,
    newVenueSportId,
    setNewVenueSportId,
    newVenueCoverImage,
    setNewVenueCoverImage,
    newVenueDetailImages,
    uploadingNewVenueCover,
    uploadingNewVenueDetail,

    // Edit Venue Inputs
    editVenueName,
    setEditVenueName,
    editVenueLocation,
    setEditVenueLocation,
    editVenueLatitude,
    setEditVenueLatitude,
    editVenueLongitude,
    setEditVenueLongitude,
    editVenueDescription,
    setEditVenueDescription,
    editVenueOpeningTime,
    setEditVenueOpeningTime,
    editVenueClosingTime,
    setEditVenueClosingTime,
    editVenueShiftDuration,
    setEditVenueShiftDuration,
    editVenueSportId,
    setEditVenueSportId,
    editVenueCoverImage,
    setEditVenueCoverImage,
    editVenueDetailImages,
    uploadingEditVenueCover,
    uploadingEditVenueDetail,

    // Surcharge
    isSurchargeModalOpen,
    setIsSurchargeModalOpen,
    surchargeAmount,
    setSurchargeAmount,
    surchargeCourtIds,

    // Derived values
    activeVenue,
    activeVenueId,
    activeCourts,
    filteredVenues,
    actionRequiredBookings,
    todayRevenue,
    totalBookingsCount,
    avgOccupancy,

    // Donut Stats
    activeCount,
    maintCount,
    closedCount,
    totalOpCourts,

    // Helper functions
    formatVND,
    hourDropdownOptions,
    opDropdownOptions,
    getCourtOpStatus,
    getCourtDetails,

    // Confirmation Flow States
    pendingVenueStatus,
    isConfirmStatusModalOpen,

    // Operations Handlers
    handleVenueStatusSelect,
    handleConfirmVenueStatusChange,
    handleCancelVenueStatusChange,
    handleOpenVenueStatusFromMenu,
    handleCreateVenue,
    handleOpenEditVenue,
    handleEditVenue,
    handleSelectAll,
    handleSelectCourt,
    handleOpenBulkSurcharge,
    handleApplySurcharge,
    handleOpenEditCourt,
    handleSaveCourtConfig,
    handleResolveBooking,

    // --- NEW COURT FORM / DRAFT EXPORTS ---
    isAddingCourt,
    newCourtName,
    setNewCourtName,
    newCourtPrice,
    setNewCourtPrice,
    newCourtStatus,
    setNewCourtStatus,
    isConfirmSubmitOpen,
    setIsConfirmSubmitOpen,
    newCourtValidationErrors,
    handleStartAddCourt,
    handleCancelAddCourt,
    handleSubmitNewCourt,
    handleConfirmSubmitNewCourt,

    // Image upload actions for Venues
    uploadNewVenueCoverFile,
    uploadNewVenueDetailFiles,
    uploadEditVenueCoverFile,
    uploadEditVenueDetailFiles,
    handleRemoveNewVenueDetailImage,
    handleRemoveEditVenueDetailImage
  } = useOperationsPage();

  // ── LOADING STATE ─────────────────────────────────────────────────────────────
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
      <div className="flex-grow relative min-h-0 overflow-hidden">
        <VenueFormScreen
          onClose={() => setIsCreateVenueModalOpen(false)}
          onSubmit={handleCreateVenue}
          title="Tạo cụm sân mới"
          name={newVenueName}
          setName={setNewVenueName}
          location={newVenueLocation}
          setLocation={setNewVenueLocation}
          latitude={newVenueLatitude}
          setLatitude={setNewVenueLatitude}
          longitude={newVenueLongitude}
          setLongitude={setNewVenueLongitude}
          description={newVenueDescription}
          setDescription={setNewVenueDescription}
          openingTime={newVenueOpeningTime}
          setOpeningTime={setNewVenueOpeningTime}
          closingTime={newVenueClosingTime}
          setClosingTime={setNewVenueClosingTime}
          shiftDurationMinutes={newVenueShiftDuration}
          setShiftDurationMinutes={setNewVenueShiftDuration}
          sportId={newVenueSportId}
          setSportId={setNewVenueSportId}
          coverImage={newVenueCoverImage}
          setCoverImage={setNewVenueCoverImage}
          detailImages={newVenueDetailImages}
          uploadingCover={uploadingNewVenueCover}
          uploadingDetail={uploadingNewVenueDetail}
          onUploadCover={uploadNewVenueCoverFile}
          onUploadDetail={uploadNewVenueDetailFiles}
          onRemoveDetailImage={handleRemoveNewVenueDetailImage}
          submitLabel="Tạo cụm sân"
        />
      </div>
    );
  }

  if (isEditVenueModalOpen) {
    return (
      <div className="flex-grow relative min-h-0 overflow-hidden">
        <VenueFormScreen
          onClose={() => setIsEditVenueModalOpen(false)}
          onSubmit={handleEditVenue}
          title="Chỉnh sửa thông tin cụm sân"
          name={editVenueName}
          setName={setEditVenueName}
          location={editVenueLocation}
          setLocation={setEditVenueLocation}
          latitude={editVenueLatitude}
          setLatitude={setEditVenueLatitude}
          longitude={editVenueLongitude}
          setLongitude={setEditVenueLongitude}
          description={editVenueDescription}
          setDescription={setEditVenueDescription}
          openingTime={editVenueOpeningTime}
          setOpeningTime={setEditVenueOpeningTime}
          closingTime={editVenueClosingTime}
          setClosingTime={setEditVenueClosingTime}
          shiftDurationMinutes={editVenueShiftDuration}
          setShiftDurationMinutes={setEditVenueShiftDuration}
          sportId={editVenueSportId}
          setSportId={setEditVenueSportId}
          coverImage={editVenueCoverImage}
          setCoverImage={setEditVenueCoverImage}
          detailImages={editVenueDetailImages}
          uploadingCover={uploadingEditVenueCover}
          uploadingDetail={uploadingEditVenueDetail}
          onUploadCover={uploadEditVenueCoverFile}
          onUploadDetail={uploadEditVenueDetailFiles}
          onRemoveDetailImage={handleRemoveEditVenueDetailImage}
          submitLabel="Lưu thay đổi"
        />
      </div>
    );
  }

  // ── EMPTY STATE ────────────────────────────────────────────────────────────────
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

  // ── MAIN RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 min-h-0 relative font-sans animate-fadeIn">
      {error && (
        <div className="bg-red-50 border border-red-205 text-red-650 rounded-3xl p-5 text-xs font-bold text-center mb-6 select-none flex-shrink-0">
          {error}
        </div>
      )}

      {/* MOBILE DRILL-DOWN LAYOUT */}
      {isMobile ? (
        <div className="flex flex-col flex-1">
          {mobileScreen === 'list' ? (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-base font-black text-slate-800 uppercase tracking-tight">Vận hành cụm sân</h1>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Chọn cụm sân bên dưới để quản lý</p>
                  </div>
                  <button
                    onClick={() => setIsCreateVenueModalOpen(true)}
                    className="bg-brand-emerald text-white p-2.5 rounded-2xl active:scale-95 shadow-md border-b-2 border-emerald-950 cursor-pointer"
                    title="Tạo cụm sân mới"
                  >
                    <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs">
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm cụm sân..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-slate-700 font-semibold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredVenues.map(venue => {
                  const venueCourtsCount = courts.filter(c => c.venueId === venue.id).length;
                  return (
                    <div
                      key={venue.id}
                      onClick={() => { setSelectedVenueId(venue.id); setMobileScreen('detail'); }}
                      className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm active:scale-98 transition-all flex flex-col justify-between h-36 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1 min-w-0 pr-2">
                           <h3 className="font-black text-slate-800 text-sm tracking-tight truncate">{venue.name}</h3>
                           <p className="text-[10px] text-slate-400 font-bold truncate">{venue.location}</p>
                        </div>
                        <VenueRowMenu
                          venueId={venue.id}
                          openMenuId={openVenueMenuId}
                          setOpenMenuId={setOpenVenueMenuId}
                          onEditInfo={() => handleOpenEditVenue(venue.id)}
                          onEditStatus={() => handleOpenVenueStatusFromMenu(venue.id)}
                        />
                      </div>
                      <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-lg">
                          {venueCourtsCount} sân trực thuộc
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-brand-emerald font-black">
                          <span>Xem vận hành</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* MOBILE SCREEN 2: Venue Detail */
            <div className="space-y-4">
              <div className="flex justify-between items-center select-none">
                <button
                  onClick={() => setMobileScreen('list')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Quay lại
                </button>
                <button
                  onClick={handleStartAddCourt}
                  className="bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 border-b-2 border-emerald-950"
                >
                  <svg className="w-3.5 h-3.5 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm sân lẻ
                </button>
              </div>

              {/* Sub-Header venue info card */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">{activeVenue.name}</h2>
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-normal truncate" title={activeVenue.location}>
                  Địa chỉ: {activeVenue.location}
                </p>
              </div>

              {/* Tabs selector */}
              <div className="bg-slate-100/80 backdrop-blur-md p-1 rounded-2xl flex gap-1 select-none">
                <button
                  onClick={() => setActiveTab('facilities')}
                  className={`flex-1 py-2 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'facilities' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Danh sách sân
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2 rounded-xl text-center text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Biểu đồ vận hành
                </button>
              </div>

              {activeTab === 'overview' ? (
                <OperationsOverviewTab
                  activeCourts={activeCourts}
                  todayRevenue={todayRevenue}
                  totalBookingsCount={totalBookingsCount}
                  avgOccupancy={avgOccupancy}
                  activeCount={activeCount}
                  maintCount={maintCount}
                  closedCount={closedCount}
                  totalOpCourts={totalOpCourts}
                  getCourtOpStatus={getCourtOpStatus}
                  getCourtDetails={getCourtDetails}
                  formatVND={formatVND}
                  isMobile
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
                  isMobile
                  sportName={activeVenue?.sport?.name}
                />
              )}
            </div>
          )}

          {/* Mobile Floating action bar - ONLY surcharge */}
          {selectedCourtIds.length > 0 && mobileScreen === 'detail' && activeTab === 'facilities' && (
            <div className="fixed bottom-20 left-4 right-4 z-50 bg-primary text-on-primary rounded-3xl p-4 shadow-xl border border-white/10 flex flex-col gap-2 select-none animate-slideUp">
              <div className="flex justify-between items-center text-xs font-bold px-1 border-b border-white/10 pb-2">
                <span>Đã chọn: {selectedCourtIds.length} sân</span>
                <button onClick={() => setSelectedCourtIds([])}
                  className="text-brand-yellow font-black cursor-pointer uppercase tracking-widest text-[9px]">
                  Hủy chọn
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={handleOpenBulkSurcharge}
                  className="flex-1 bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-[10px] py-2.5 rounded-xl transition-all cursor-pointer text-center">
                  Cài đặt phụ thu
                </button>
                <button onClick={() => setSelectedCourtIds([])}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-extrabold text-[10px] py-2.5 rounded-xl transition-all cursor-pointer text-center">
                  Hủy bỏ
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* DESKTOP MASTER-DETAIL LAYOUT */
        <div className="flex gap-6 flex-1 min-h-0">
          {/* LEFT SIDEBAR */}
          <OperationsSidebar
            venues={venues}
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

          {/* MAIN CONTENT AREA */}
          <section className="flex-1 bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-slate-100 select-none flex-shrink-0">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-800 tracking-tight">{activeVenue.name}</h1>
                </div>
                <p className="text-xs text-slate-455 font-bold leading-normal truncate" title={activeVenue.location}>
                  Địa chỉ: {activeVenue.location}
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

            {/* Warning Alert */}
            {actionRequiredBookings.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex justify-between items-center text-xs font-bold text-red-700 animate-pulse select-none flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Có {actionRequiredBookings.length} đơn đặt sân cần giải quyết do cụm sân đóng cửa khẩn cấp.</span>
                </div>
                <button onClick={() => setIsQueueModalOpen(true)}
                  className="bg-red-600 hover:bg-red-750 text-white font-extrabold text-[10px] px-4.5 py-2.5 rounded-xl transition-all cursor-pointer border-b-2 border-red-850">
                  Giải quyết ngay
                </button>
              </div>
            )}

            {/* Content Tabs selector */}
            <div className="mt-5 border-b border-slate-100 flex justify-between items-center flex-shrink-0 select-none">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('facilities')}
                  className={`pb-3.5 text-xs font-black relative cursor-pointer transition-all ${
                    activeTab === 'facilities' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Danh sách sân trực thuộc ({activeCourts.length})
                  {activeTab === 'facilities' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-emerald rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3.5 text-xs font-black relative cursor-pointer transition-all ${
                    activeTab === 'overview' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Giám sát vận hành & Thống kê
                  {activeTab === 'overview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-emerald rounded-full" />
                  )}
                </button>
              </div>

              {/* Multi-surcharge button */}
              {selectedCourtIds.length > 0 && activeTab === 'facilities' && (
                <div className="pb-2.5 flex items-center gap-3 animate-fadeIn">
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-150">
                    Đã chọn: {selectedCourtIds.length} sân
                  </span>
                  <button onClick={handleOpenBulkSurcharge}
                    className="bg-primary hover:bg-slate-850 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl transition-all cursor-pointer border-b-2 border-slate-950">
                    Cấu hình phụ thu
                  </button>
                  <button onClick={() => setSelectedCourtIds([])}
                    className="text-[10px] font-black text-slate-450 hover:text-slate-700 cursor-pointer">
                    Hủy chọn
                  </button>
                </div>
              )}
            </div>

            {/* TAB PANES */}
            <div className="flex-1 overflow-hidden mt-6">
              {activeTab === 'overview' ? (
                <OperationsOverviewTab
                  activeCourts={activeCourts}
                  todayRevenue={todayRevenue}
                  totalBookingsCount={totalBookingsCount}
                  avgOccupancy={avgOccupancy}
                  activeCount={activeCount}
                  maintCount={maintCount}
                  closedCount={closedCount}
                  totalOpCourts={totalOpCourts}
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
          </section>
        </div>
      )}

      {/* ── MODALS & OVERLAYS ───────────────────────────────────────────────────────── */}

      {/* Queue booking handler */}
      <BookingQueueModal
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
        actionRequiredBookings={actionRequiredBookings}
        handleResolveBooking={handleResolveBooking}
        formatVND={formatVND}
      />

      {/* Bulk Surcharge config */}
      <BulkSurchargeModal
        isOpen={isSurchargeModalOpen}
        onClose={() => setIsSurchargeModalOpen(false)}
        handleApplySurcharge={handleApplySurcharge}
        surchargeAmount={surchargeAmount}
        setSurchargeAmount={setSurchargeAmount}
        surchargeCourtIds={surchargeCourtIds}
        formatVND={formatVND}
      />

      {/* MODAL: COURT CONFIGURATION & PRICING */}
      <CourtConfigModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCourtConfig}
        name={editName}
        setName={setEditName}
        price={editPrice}
        setPrice={setEditPrice}
        opStatus={editOpStatus}
        setOpStatus={setEditOpStatus}
        formatVND={formatVND}
      />

      {/* Add Court Modal (Replaces the inline screen) */}
      <AddCourtSubScreen
        isOpen={isAddingCourt}
        onClose={handleCancelAddCourt}
        onSubmit={handleSubmitNewCourt}
        name={newCourtName}
        setName={setNewCourtName}
        price={newCourtPrice}
        setPrice={setNewCourtPrice}
        status={newCourtStatus}
        setStatus={setNewCourtStatus}
        validationErrors={newCourtValidationErrors}
        formatVND={formatVND}
      />

      {/* Venue Status Warning Modal */}
      <VenueStatusModal
        isOpen={isVenueStatusModalOpen}
        onClose={() => setIsVenueStatusModalOpen(false)}
        onChangeStatus={handleVenueStatusSelect}
        currentStatus={activeVenue?.status}
      />

      {/* Confirmation Modal for changing status */}
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

      {/* Confirm Submit Registration Modal */}
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
    </div>
  );
};
