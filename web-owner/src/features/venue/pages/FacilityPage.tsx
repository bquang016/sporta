import React from 'react';
import { useFacilityOperations } from '../hooks/useFacilityOperations';
import { FacilityStats } from '../components/FacilityStats';
import { FacilityList } from '../components/FacilityList';
import { FacilityFormModal } from '../components/FacilityFormModal';

export const FacilityPage = () => {
  const {
    courts,
    loading,
    error,
    showStats,
    toggleStats,
    searchQuery,
    setSearchQuery,
    selectedSport,
    setSelectedSport,
    selectedVenueFilter,
    setSelectedVenueFilter,
    isCourtModalOpen,
    setIsCourtModalOpen,
    editingCourt,
    viewOnly,
    courtName,
    setCourtName,
    courtPrice,
    setCourtPrice,
    courtDescription,
    setCourtDescription,
    courtCoverImage,
    setCourtCoverImage,
    courtOpeningTime,
    setCourtOpeningTime,
    courtClosingTime,
    setCourtClosingTime,
    courtLocation,
    setCourtLocation,
    courtSportId,
    setCourtSportId,
    courtVenueId,
    setCourtVenueId,
    courtDetailImages,
    uploadingCover,
    uploadingDetail,
    courtValidationErrors,
    TIME_OPTIONS,
    formatVND,
    handleOpenCourtCreate,
    handleOpenCourtDetail,
    uploadCoverFile,
    uploadDetailFiles,
    handleRemoveDetailImage,
    handleSubmitCourt,
    handleSimulateStatus,
    filteredCourts,
    totalCount,
    approvedCount,
    pendingCount,
    rejectedCount,
    SPORT_FILTER_OPTIONS,
    venueFilterOptions,
    SPORT_FORM_OPTIONS,
    venueFormOptions
  } = useFacilityOperations();

  return (
    <div className="flex flex-col flex-1 min-h-0 relative font-sans animate-fadeIn">

      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6 select-none">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Quản lý sân</h1>
          <p className="text-xs text-slate-400 font-bold mt-0.5">Đăng ký và cấu hình thông tin chi tiết các sân thi đấu</p>
        </div>
        <button 
          onClick={toggleStats}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer"
        >
          {showStats ? (
            <>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
              <span>Ẩn thống kê</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Hiện thống kê</span>
            </>
          )}
        </button>
      </div>

      {/* TOP STATS DISPLAY */}
      <FacilityStats
        showStats={showStats}
        totalCount={totalCount}
        approvedCount={approvedCount}
        pendingCount={pendingCount}
        rejectedCount={rejectedCount}
      />

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-650 rounded-3xl p-5 text-xs font-bold text-center mb-6">
          {error}
        </div>
      )}

      {/* LOADER & LIST CONTENT */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold">Đang tải dữ liệu từ máy chủ...</p>
        </div>
      ) : (
        <FacilityList
          courts={filteredCourts}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSport={selectedSport}
          setSelectedSport={setSelectedSport}
          selectedVenueFilter={selectedVenueFilter}
          setSelectedVenueFilter={setSelectedVenueFilter}
          SPORT_FILTER_OPTIONS={SPORT_FILTER_OPTIONS}
          venueFilterOptions={venueFilterOptions}
          onOpenCreate={handleOpenCourtCreate}
          onOpenDetail={handleOpenCourtDetail}
          onSimulateStatus={handleSimulateStatus}
          formatVND={formatVND}
        />
      )}

      {/* PORTAL-BASED MODAL: COURT DETAIL / CREATE / EDIT */}
      <FacilityFormModal
        isOpen={isCourtModalOpen}
        onClose={() => setIsCourtModalOpen(false)}
        onSubmit={handleSubmitCourt}
        viewOnly={viewOnly}
        editingCourt={editingCourt}
        name={courtName}
        setName={setCourtName}
        sportId={courtSportId}
        setSportId={setCourtSportId}
        venueId={courtVenueId}
        setVenueId={setCourtVenueId}
        price={courtPrice}
        setPrice={setCourtPrice}
        openingTime={courtOpeningTime}
        setOpeningTime={setCourtOpeningTime}
        closingTime={courtClosingTime}
        setClosingTime={setCourtClosingTime}
        location={courtLocation}
        setLocation={setCourtLocation}
        description={courtDescription}
        setDescription={setCourtDescription}
        coverImage={courtCoverImage}
        setCoverImage={setCourtCoverImage}
        detailImages={courtDetailImages}
        uploadingCover={uploadingCover}
        uploadingDetail={uploadingDetail}
        validationErrors={courtValidationErrors}
        TIME_OPTIONS={TIME_OPTIONS}
        SPORT_FORM_OPTIONS={SPORT_FORM_OPTIONS}
        venueFormOptions={venueFormOptions}
        onUploadCover={uploadCoverFile}
        onUploadDetail={uploadDetailFiles}
        onRemoveDetailImage={handleRemoveDetailImage}
        formatVND={formatVND}
      />
    </div>
  );
};
