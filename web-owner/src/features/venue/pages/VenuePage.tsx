import React from 'react';
import { useVenueOperations } from '../hooks/useVenueOperations';
import { VenueStats } from '../components/VenueStats';
import { VenueList } from '../components/VenueList';
import { VenueFormModal } from '../components/VenueFormModal';
import { VenueStatusModal } from '../components/VenueStatusModal';

export const VenuePage = () => {
  const {
    venues,
    courts,
    loading,
    error,
    showStats,
    toggleStats,
    isVenueModalOpen,
    setIsVenueModalOpen,
    venueName,
    setVenueName,
    venueLocation,
    setVenueLocation,
    venueDescription,
    setVenueDescription,
    venueValidationErrors,
    isEditVenueModalOpen,
    setIsEditVenueModalOpen,
    editVenueName,
    setEditVenueName,
    editVenueLocation,
    setEditVenueLocation,
    editVenueDescription,
    setEditVenueDescription,
    isStatusModalOpen,
    setIsStatusModalOpen,
    openMenuId,
    setOpenMenuId,
    totalVenues,
    totalCourts,
    activeCourts,
    handleOpenVenueCreate,
    handleSubmitVenue,
    handleOpenEditVenue,
    handleSubmitEditVenue,
    handleOpenStatusModal,
    handleChangeStatus
  } = useVenueOperations();

  return (
    <div className="flex flex-col flex-1 min-h-0 relative font-sans animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6 select-none">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Quan ly cum san</h1>
          <p className="text-xs text-slate-400 font-bold mt-0.5">Quan ly cac co so the thao tap trung cua ban</p>
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
              <span>An thong ke</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Hien thong ke</span>
            </>
          )}
        </button>
      </div>

      {/* TOP STATS DISPLAY */}
      <VenueStats
        showStats={showStats}
        totalVenues={totalVenues}
        totalCourts={totalCourts}
        activeCourts={activeCourts}
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
          <p className="text-xs text-slate-400 font-bold">Dang tai du lieu tu may chu...</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* VENUE HEADER AND ADD BUTTON */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-4 mb-6 shadow-xs flex items-center justify-between select-none">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Danh sach cum san</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Danh sach cac dia diem the thao truc thuoc tai khoan cua ban</p>
            </div>
            <button
              onClick={handleOpenVenueCreate}
              className="bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 whitespace-nowrap border-b-2 border-emerald-950"
            >
              <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Them cum san moi
            </button>
          </div>

          {/* VENUES GRID LIST */}
          <VenueList
            venues={venues}
            courts={courts}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onEdit={handleOpenEditVenue}
            onChangeStatus={handleOpenStatusModal}
          />
        </div>
      )}

      {/* MODAL: CREATE VENUE */}
      <VenueFormModal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
        onSubmit={handleSubmitVenue}
        title="Them cum san moi"
        name={venueName}
        setName={setVenueName}
        location={venueLocation}
        setLocation={setVenueLocation}
        description={venueDescription}
        setDescription={setVenueDescription}
        validationErrors={venueValidationErrors}
        submitLabel="Tao cum san"
      />

      {/* MODAL: EDIT VENUE */}
      <VenueFormModal
        isOpen={isEditVenueModalOpen}
        onClose={() => setIsEditVenueModalOpen(false)}
        onSubmit={handleSubmitEditVenue}
        title="Chinh sua thong tin cum san"
        name={editVenueName}
        setName={setEditVenueName}
        location={editVenueLocation}
        setLocation={setEditVenueLocation}
        description={editVenueDescription}
        setDescription={setEditVenueDescription}
        submitLabel="Luu thay doi"
      />

      {/* MODAL: CHANGE VENUE STATUS */}
      <VenueStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onChangeStatus={handleChangeStatus}
      />
    </div>
  );
};
