import React from 'react';
import { useOperationsPage } from '../hooks/useOperationsPage';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { OperationsSidebar } from '../components/operations/OperationsSidebar';
import { OperationsOverviewTab } from '../components/operations/OperationsOverviewTab';
import { OperationsFacilitiesTab } from '../components/operations/OperationsFacilitiesTab';
import { BookingQueueModal } from '../components/operations/BookingQueueModal';
import { BulkSurchargeModal } from '../components/operations/BulkSurchargeModal';
import { CourtConfigModal } from '../components/operations/CourtConfigModal';
import { VenueFormModal } from '../components/VenueFormModal';
import { VenueStatusModal } from '../components/VenueStatusModal';
import { VenueRowMenu } from '../components/operations/VenueRowMenu';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';

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
    editDescription,
    setEditDescription,
    editCoverImage,
    setEditCoverImage,
    editOpening,
    setEditOpening,
    editClosing,
    setEditClosing,
    editLocation,
    setEditLocation,
    editSportId,
    setEditSportId,
    editApprovalStatus,
    setEditApprovalStatus,
    editOpStatus,
    setEditOpStatus,
    editDetailImages,
    uploadingCover,
    uploadingDetail,

    // Create Venue Inputs
    newVenueName,
    setNewVenueName,
    newVenueLocation,
    setNewVenueLocation,
    newVenueDescription,
    setNewVenueDescription,

    // Edit Venue Inputs
    editVenueName,
    setEditVenueName,
    editVenueLocation,
    setEditVenueLocation,
    editVenueDescription,
    setEditVenueDescription,

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
    approvalDropdownOptions,
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
    uploadCoverFile,
    uploadDetailFiles,
    handleRemoveDetailImage,
    handleSaveCourtConfig,
    handleResolveBooking,
  } = useOperationsPage();

    // ── LOADING / EMPTY STATES ──────────────────────────────────────────────────

    if (loading) {
      return (
        <div className="flex flex-col flex-1 min-h-[400px] items-center justify-center gap-3 relative font-sans animate-fadeIn">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold">Đang tải dữ liệu từ máy chủ...</p>
        </div>
      );
    }

    if (venues.length === 0) {
      return (
        <div className="flex flex-col flex-1 min-h-[400px] items-center justify-center p-6 text-center gap-4 relative font-sans animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-brand-emerald flex items-center justify-center shadow-inner select-none">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <circle cx="12" cy="12" r="4" />
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
            className="bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs px-6 py-4 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 border-b-2 border-emerald-950"
          >
            <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Tạo cụm sân đầu tiên
          </button>

          {/* MODAL: CREATE VENUE (empty state) */}
          <VenueFormModal
            isOpen={isCreateVenueModalOpen}
            onClose={() => setIsCreateVenueModalOpen(false)}
            onSubmit={handleCreateVenue}
            title="Tạo cụm sân mới"
            name={newVenueName}
            setName={setNewVenueName}
            location={newVenueLocation}
            setLocation={setNewVenueLocation}
            description={newVenueDescription}
            setDescription={setNewVenueDescription}
            submitLabel="Tạo cụm sân"
          />
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
                <VenueRowMenu
                  venueId={activeVenueId || ''}
                  openMenuId={openVenueMenuId}
                  setOpenMenuId={setOpenVenueMenuId}
                  onEditInfo={() => handleOpenEditVenue()}
                  onEditStatus={() => setIsVenueStatusModalOpen(true)}
                />
              </div>

              <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
                <h2 className="text-base font-black text-slate-800">{activeVenue.name}</h2>
                <p className="text-[10px] text-slate-400 font-bold leading-normal mt-0.5">{activeVenue.location}</p>
              </div>

              {actionRequiredBookings.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-4 flex justify-between items-center text-xs font-bold text-red-750 animate-pulse select-none">
                  <span>Có {actionRequiredBookings.length} đơn đặt sân cần hoàn tiền / đổi lịch gấp.</span>
                  <button onClick={() => setIsQueueModalOpen(true)}
                    className="bg-red-600 hover:bg-red-750 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer">
                    Xử lý
                  </button>
                </div>
              )}

              {/* Mobile Tabs */}
              <div className="flex bg-slate-105 p-1 rounded-2xl select-none">
                <button onClick={() => setActiveTab('facilities')}
                  className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${activeTab === 'facilities' ? 'bg-white text-brand-emerald shadow-xs' : 'text-slate-500'}`}>
                  Quản lý sân bãi
                </button>
                <button onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-white text-brand-emerald shadow-xs' : 'text-slate-500'}`}>
                  Tổng quan chỉ số
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
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-800 tracking-tight">{activeVenue.name}</h1>
                </div>
                <p className="text-xs text-slate-450 font-bold leading-normal truncate" title={activeVenue.location}>
                  Địa chỉ: {activeVenue.location}
                </p>
              </div>
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

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-slate-100 mt-4 select-none flex-shrink-0">
              <button onClick={() => setActiveTab('facilities')}
                className={`pb-3 text-xs font-black tracking-wider transition-all cursor-pointer ${activeTab === 'facilities' ? 'text-brand-emerald border-b-2 border-brand-emerald' : 'text-slate-400 hover:text-slate-600'}`}>
                QUẢN LÝ SÂN BÃI
              </button>
              <button onClick={() => setActiveTab('overview')}
                className={`pb-3 text-xs font-black tracking-wider transition-all cursor-pointer ${activeTab === 'overview' ? 'text-brand-emerald border-b-2 border-brand-emerald' : 'text-slate-400 hover:text-slate-600'}`}>
                TỔNG QUAN CHỈ SỐ
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto mt-4 matrix-scroll min-h-0 relative">
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
                />
              )}
            </div>

            {/* Desktop Floating Action Bar */}
            {selectedCourtIds.length > 0 && activeTab === 'facilities' && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-primary text-on-primary rounded-2xl px-6 py-4 shadow-[0_16px_36px_rgba(0,53,39,0.3)] border border-white/10 flex items-center gap-6 select-none animate-slideUp">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-none">Đã lựa chọn {selectedCourtIds.length} sân bãi</span>
                  <span className="text-[9px] text-white/50 font-bold mt-1 uppercase tracking-widest">Thao tác hàng loạt</span>
                </div>

                <div className="h-6 w-px bg-white/20" />

                <div className="flex items-center gap-3">
                  <button onClick={handleOpenBulkSurcharge}
                    className="bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-[10px] px-5 py-2.5 rounded-xl transition-all cursor-pointer">
                    Cài đặt phụ thu
                  </button>
                  <button onClick={() => setSelectedCourtIds([])}
                    className="text-white/60 hover:text-white font-extrabold text-[10px] px-2 py-2 transition-all cursor-pointer">
                    Hủy chọn
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}

      {/* Booking action queue modal */}
      <BookingQueueModal
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
        actionRequiredBookings={actionRequiredBookings}
        handleResolveBooking={handleResolveBooking}
        formatVND={formatVND}
      />

      {/* Bulk surcharge modal */}
      <BulkSurchargeModal
        isOpen={isSurchargeModalOpen}
        onClose={() => setIsSurchargeModalOpen(false)}
        surchargeAmount={surchargeAmount}
        setSurchargeAmount={setSurchargeAmount}
        surchargeCourtIds={surchargeCourtIds}
        handleApplySurcharge={handleApplySurcharge}
        formatVND={formatVND}
      />

      {/* Edit court modal */}
      <CourtConfigModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCourtConfig}
        name={editName}
        setName={setEditName}
        price={editPrice}
        setPrice={setEditPrice}
        opening={editOpening}
        setOpening={setEditOpening}
        closing={editClosing}
        setClosing={setEditClosing}
        approvalStatus={editApprovalStatus}
        setApprovalStatus={setEditApprovalStatus}
        opStatus={editOpStatus}
        setOpStatus={setEditOpStatus}
        description={editDescription}
        setDescription={setEditDescription}
        coverImage={editCoverImage}
        setCoverImage={setEditCoverImage}
        detailImages={editDetailImages}
        uploadingCover={uploadingCover}
        uploadingDetail={uploadingDetail}
        hourDropdownOptions={hourDropdownOptions}
        approvalDropdownOptions={approvalDropdownOptions}
        opDropdownOptions={opDropdownOptions}
        onUploadCover={uploadCoverFile}
        onUploadDetail={uploadDetailFiles}
        onRemoveDetailImage={handleRemoveDetailImage}
        formatVND={formatVND}
      />

        {/* Create Venue Modal */}
        <VenueFormModal
          isOpen={isCreateVenueModalOpen}
          onClose={() => setIsCreateVenueModalOpen(false)}
          onSubmit={handleCreateVenue}
          title="Tạo cụm sân mới"
          name={newVenueName}
          setName={setNewVenueName}
          location={newVenueLocation}
          setLocation={setNewVenueLocation}
          description={newVenueDescription}
          setDescription={setNewVenueDescription}
          submitLabel="Tạo cụm sân"
        />

        {/* Edit Venue Modal */}
        <VenueFormModal
          isOpen={isEditVenueModalOpen}
          onClose={() => setIsEditVenueModalOpen(false)}
          onSubmit={handleEditVenue}
          title="Chỉnh sửa thông tin cụm sân"
          name={editVenueName}
          setName={setNewVenueName}
          location={editVenueLocation}
          setLocation={setEditVenueLocation}
          description={editVenueDescription}
          setDescription={setEditVenueDescription}
          submitLabel="Lưu thay đổi"
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
    </div>
  );
};
