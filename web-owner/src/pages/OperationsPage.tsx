import React, { useState, useRef } from 'react';
import { useOperations, type SimulatedBooking } from '../hooks/useOperationsState';
import { useIsMobile } from '../hooks/useIsMobile';
import { Dropdown } from '../components/ui/Dropdown';
import { Modal } from '../components/ui/Modal';
import { courtService, type CourtResponse, type CourtRequest } from '../services/courtService';

export const OperationsPage = () => {
  const isMobile = useIsMobile();
  const {
    venues,
    courts,
    bookings,
    selectedVenueId,
    selectedCourtIds,
    loading,
    error,
    refreshData,
    setSelectedVenueId,
    changeVenueStatus,
    updateVenueInfo,
    createVenueInfo,
    toggleCourtStatus,
    bulkToggleMaintenance,
    bulkApplySurcharge,
    setSelectedCourtIds,
    resolveBooking,
  } = useOperations();

  // Local UI States
  const [mobileScreen, setMobileScreen] = useState<'list' | 'detail'>('list');
  const [activeTab, setActiveTab] = useState<'facilities' | 'overview'>('facilities');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateVenueModalOpen, setIsCreateVenueModalOpen] = useState(false);
  const [isEditVenueModalOpen, setIsEditVenueModalOpen] = useState(false);
  const [isVenueStatusModalOpen, setIsVenueStatusModalOpen] = useState(false);
  const [isVenueMenuOpen, setIsVenueMenuOpen] = useState(false);
  
  // Active court being edited
  const [editingCourt, setEditingCourt] = useState<CourtResponse | null>(null);

  // Edit court form states
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editOpening, setEditOpening] = useState('06:00');
  const [editClosing, setEditClosing] = useState('22:00');
  const [editLocation, setEditLocation] = useState('');
  const [editSportId, setEditSportId] = useState<number>(1);
  const [editApprovalStatus, setEditApprovalStatus] = useState<'APPROVED' | 'PENDING' | 'REJECTED'>('APPROVED');
  const [editOpStatus, setEditOpStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'CLOSED'>('ACTIVE');
  const [editDetailImages, setEditDetailImages] = useState<string[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingDetail, setUploadingDetail] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  // Create venue form states
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueLocation, setNewVenueLocation] = useState('');
  const [newVenueDescription, setNewVenueDescription] = useState('');

  // Edit venue form states
  const [editVenueName, setEditVenueName] = useState('');
  const [editVenueLocation, setEditVenueLocation] = useState('');
  const [editVenueDescription, setEditVenueDescription] = useState('');

  // Surcharge states
  const [isSurchargeModalOpen, setIsSurchargeModalOpen] = useState(false);
  const [surchargeAmount, setSurchargeAmount] = useState('50000');
  const [surchargeCourtIds, setSurchargeCourtIds] = useState<string[]>([]);

  // Toast Notification state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper formatting for currency: 100000 -> 100.000 VND
  const formatVND = (amount: number) => {
    if (isNaN(amount)) return '0 VND';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VND";
  };

  // Smart hour options from 00:00 to 23:30 in 30-min intervals
  const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, '0');
    const minutes = (i % 2 === 0 ? '00' : '30');
    return `${hours}:${minutes}`;
  });

  const activeVenue = venues.find(v => v.id === selectedVenueId) || venues[0];
  const activeVenueId = activeVenue?.id;
  
  // Read actual courts for the active venue
  const activeCourts = courts.filter(c => c.venueId === activeVenueId);

  // Filtered venues for search
  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute mock bookings for this venue
  const venueBookings = bookings.filter(b => {
    const court = courts.find(c => c.id === b.courtId);
    return court?.venueId === activeVenueId;
  });

  const actionRequiredBookings = venueBookings.filter(b => b.status === 'ACTION_REQUIRED');
  const confirmedBookings = venueBookings.filter(b => b.status === 'CONFIRMED');

  // Overall metric stats
  const todayRevenue = confirmedBookings.reduce((sum, b) => sum + b.price, 0);
  const totalBookingsCount = venueBookings.length;

  // Retrieve court operational status
  const getCourtOpStatus = (courtId: string) => {
    return (localStorage.getItem(`court_op_status_${courtId}`) || 'ACTIVE') as 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  };

  const getCourtLiveStatus = (court: CourtResponse) => {
    const opStatus = getCourtOpStatus(court.id);
    if (opStatus === 'MAINTENANCE') return 'MAINTENANCE';
    if (opStatus === 'CLOSED') return 'CLOSED';
    
    // Check local storage maintenance flag if exists for backwards compatibility
    if (localStorage.getItem(`court_maint_${court.id}`) === 'true') {
      return 'MAINTENANCE';
    }

    // Mock In-Use vs Available based on ID
    const charCodeSum = court.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return charCodeSum % 3 === 0 ? 'IN_USE' : 'AVAILABLE';
  };

  // Occupancy rate calculation
  const getCourtOccupancy = (court: CourtResponse) => {
    const opStatus = getCourtOpStatus(court.id);
    if (opStatus === 'MAINTENANCE' || opStatus === 'CLOSED') return 0;
    const charSum = court.name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return 45 + (charSum % 46); // 45% - 90%
  };

  // Performance revenue calculation
  const getCourtPerformanceRevenue = (court: CourtResponse) => {
    const opStatus = getCourtOpStatus(court.id);
    if (opStatus === 'MAINTENANCE' || opStatus === 'CLOSED') return 0;
    const charSum = court.name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const dailyBookingsCount = Math.floor(charSum % 5) + 1;
    const price = localStorage.getItem(`court_price_${court.id}`) 
      ? parseFloat(localStorage.getItem(`court_price_${court.id}`)!) 
      : court.price;
    return dailyBookingsCount * price;
  };

  // Helper to compile details for a court
  const getCourtDetails = (court: CourtResponse) => {
    const localName = localStorage.getItem(`court_name_${court.id}`) || court.name;
    const localPrice = localStorage.getItem(`court_price_${court.id}`) 
      ? parseFloat(localStorage.getItem(`court_price_${court.id}`)!) 
      : court.price;
    const surcharge = localStorage.getItem(`court_surcharge_${court.id}`) 
      ? parseFloat(localStorage.getItem(`court_surcharge_${court.id}`)!) 
      : 0;
    const opStatus = getCourtOpStatus(court.id);
    const liveStatus = getCourtLiveStatus(court);
    const occupancy = getCourtOccupancy(court);
    const performanceRevenue = getCourtPerformanceRevenue(court);

    return {
      name: localName,
      price: localPrice,
      surcharge,
      liveStatus,
      occupancy,
      performanceRevenue,
      isMaintenance: opStatus === 'MAINTENANCE'
    };
  };

  // Average occupancy
  const avgOccupancy = activeCourts.length > 0
    ? Math.round(activeCourts.reduce((sum, c) => sum + getCourtOccupancy(c), 0) / activeCourts.length)
    : 0;

  // Venue Status change handler with cascading to all courts
  const handleVenueStatusChange = async (newStatus: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED') => {
    if (!activeVenueId) return;
    try {
      await changeVenueStatus(activeVenueId, newStatus);
      setIsVenueStatusModalOpen(false);
      showToast('success', `Đã chuyển trạng thái cụm sân thành: ${
        newStatus === 'ACTIVE' ? 'Đang hoạt động' : newStatus === 'MAINTENANCE' ? 'Tạm ngưng nhận khách' : 'Đóng cửa khẩn cấp'
      }. Toàn bộ sân bên trong đã được cập nhật trạng thái.`);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi cập nhật trạng thái cụm sân');
    }
  };

  // Create Venue handler
  const handleCreateVenue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newVenueName.trim() || !newVenueLocation.trim()) {
      showToast('error', 'Vui lòng điền đủ Tên và Địa chỉ cụm sân');
      return;
    }
    try {
      await createVenueInfo(newVenueName, newVenueLocation, newVenueDescription);
      setIsCreateVenueModalOpen(false);
      setNewVenueName('');
      setNewVenueLocation('');
      setNewVenueDescription('');
      showToast('success', 'Đã tạo cụm sân mới thành công!');
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi tạo cụm sân');
    }
  };

  // Open Edit Venue modal
  const handleOpenEditVenue = () => {
    if (!activeVenue) return;
    setEditVenueName(activeVenue.name);
    setEditVenueLocation(activeVenue.location);
    setEditVenueDescription(activeVenue.description || '');
    setIsEditVenueModalOpen(true);
  };

  // Edit Venue details handler
  const handleEditVenue = async () => {
    if (!editVenueName.trim() || !editVenueLocation.trim()) {
      showToast('error', 'Vui lòng điền đủ Tên và Địa chỉ cụm sân');
      return;
    }
    try {
      await updateVenueInfo(activeVenueId, editVenueName, editVenueLocation, editVenueDescription);
      setIsEditVenueModalOpen(false);
      showToast('success', 'Đã cập nhật thông tin cụm sân thành công!');
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi cập nhật thông tin cụm sân');
    }
  };

  // Checkbox row selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCourtIds(activeCourts.map(c => c.id));
    } else {
      setSelectedCourtIds([]);
    }
  };

  const handleSelectCourt = (courtId: string) => {
    setSelectedCourtIds(prev => 
      prev.includes(courtId) ? prev.filter(id => id !== courtId) : [...prev, courtId]
    );
  };

  // Bulk actions handlers
  const handleBulkMaintenance = (enable: boolean) => {
    bulkToggleMaintenance(selectedCourtIds, enable);
    showToast('success', `Đã chuyển ${selectedCourtIds.length} sân sang trạng thái ${enable ? 'Bảo trì' : 'Hoạt động'}`);
  };

  const handleOpenBulkSurcharge = () => {
    setSurchargeCourtIds(selectedCourtIds);
    setIsSurchargeModalOpen(true);
  };

  const handleApplySurcharge = () => {
    const amt = parseFloat(surchargeAmount);
    if (isNaN(amt) || amt < 0) {
      showToast('error', 'Mức phụ thu không hợp lệ');
      return;
    }
    bulkApplySurcharge(surchargeCourtIds, amt);
    setIsSurchargeModalOpen(false);
    showToast('success', `Đã cấu hình phụ thu +${formatVND(amt)} thành công.`);
  };

  // Open Edit Court modal with detailed fields
  const handleOpenEditCourt = (court: CourtResponse) => {
    setEditingCourt(court);
    
    // Retrieve custom local values if exists
    const localName = localStorage.getItem(`court_name_${court.id}`) || court.name;
    const localPrice = localStorage.getItem(`court_price_${court.id}`) || court.price.toString();
    const localDesc = localStorage.getItem(`court_desc_${court.id}`) || court.description || '';
    const localOpen = localStorage.getItem(`court_open_${court.id}`) || court.openingTime;
    const localClose = localStorage.getItem(`court_close_${court.id}`) || court.closingTime;
    
    setEditName(localName);
    setEditPrice(localPrice);
    setEditDescription(localDesc);
    setEditOpening(localOpen);
    setEditClosing(localClose);
    
    setEditCoverImage(court.coverImage || '');
    setEditLocation(court.location);
    setEditSportId(court.sportId);
    setEditApprovalStatus(court.status);
    setEditOpStatus(getCourtOpStatus(court.id));
    setEditDetailImages(court.detailImages.map(img => img.imageUrl));

    setIsEditModalOpen(true);
  };

  // Image Uploaders
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const url = await courtService.uploadImage(file, 'court_cover');
      setEditCoverImage(url);
      showToast('success', 'Đã tải ảnh bìa mới lên lưu trữ.');
    } catch (err) {
      showToast('error', 'Lỗi khi upload ảnh bìa');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDetailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingDetail(true);
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await courtService.uploadImage(files[i], 'court_detail');
        uploadedUrls.push(url);
      }
      setEditDetailImages(prev => [...prev, ...uploadedUrls]);
      showToast('success', `Đã tải lên thêm ${files.length} ảnh chi tiết.`);
    } catch (err) {
      showToast('error', 'Lỗi khi upload ảnh chi tiết');
    } finally {
      setUploadingDetail(false);
    }
  };

  const handleRemoveDetailImage = (index: number) => {
    setEditDetailImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Save all court configurations (JPA database details & Local state status/images)
  const handleSaveCourtConfig = async () => {
    if (!editName.trim()) {
      showToast('error', 'Tên sân không được để trống');
      return;
    }
    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('error', 'Giá thuê sân không hợp lệ');
      return;
    }

    try {
      // 1. Save approval status on backend (APPROVED/PENDING/REJECTED)
      if (editApprovalStatus !== editingCourt?.status) {
        await courtService.updateStatus(editingCourt!.id, editApprovalStatus);
      }

      // 2. Save main details on backend
      const payload: CourtRequest = {
        name: editName,
        price: priceNum,
        description: editDescription,
        coverImage: editCoverImage,
        openingTime: editOpening,
        closingTime: editClosing,
        location: editLocation,
        sportId: editSportId,
        venueId: activeVenueId,
        detailImages: editDetailImages
      };
      await courtService.updateCourt(editingCourt!.id, payload);

      // 3. Save operational status (ACTIVE/MAINTENANCE/CLOSED) locally
      localStorage.setItem(`court_op_status_${editingCourt!.id}`, editOpStatus);
      
      // Save name & price overrides locally for immediate reactive updates
      localStorage.setItem(`court_name_${editingCourt!.id}`, editName);
      localStorage.setItem(`court_price_${editingCourt!.id}`, priceNum.toString());
      localStorage.setItem(`court_desc_${editingCourt!.id}`, editDescription);
      localStorage.setItem(`court_open_${editingCourt!.id}`, editOpening);
      localStorage.setItem(`court_close_${editingCourt!.id}`, editClosing);

      // Refresh list
      await refreshData();
      setIsEditModalOpen(false);
      showToast('success', 'Đã đồng bộ và cập nhật thông tin sân bóng thành công.');
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi lưu thông tin cấu hình sân');
    }
  };

  // Booking resolutions
  const handleResolveBooking = (bookingId: string, action: 'refund' | 'points' | 'reschedule') => {
    resolveBooking(bookingId, action);
    showToast('success', `Đã hoàn tất xử lý: ${
      action === 'refund' ? 'Hoàn trả tiền' : action === 'points' ? 'Tặng điểm thưởng' : 'Chuyển lịch hẹn'
    }`);
  };

  // Calculate SVG donut segments for Pie Chart
  const activeCount = activeCourts.filter(c => getCourtOpStatus(c.id) === 'ACTIVE').length;
  const maintCount = activeCourts.filter(c => getCourtOpStatus(c.id) === 'MAINTENANCE').length;
  const closedCount = activeCourts.filter(c => getCourtOpStatus(c.id) === 'CLOSED').length;
  const totalOpCourts = activeCourts.length;

  const r = 60;
  const circumference = 2 * Math.PI * r; // 377
  
  const activePct = totalOpCourts > 0 ? activeCount / totalOpCourts : 0;
  const maintPct = totalOpCourts > 0 ? maintCount / totalOpCourts : 0;
  const closedPct = totalOpCourts > 0 ? closedCount / totalOpCourts : 0;

  const lenActive = activePct * circumference;
  const lenMaint = maintPct * circumference;
  const lenClosed = closedPct * circumference;

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-[400px] items-center justify-center gap-3 relative font-sans animate-fadeIn">
        {toast && (
          <div className="fixed top-4 right-4 z-[9999] px-5 py-3.5 rounded-2xl shadow-xl text-xs font-black text-white flex items-center gap-3 border border-white/10 select-none bg-emerald-650 shadow-emerald-950/20">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            {toast.message}
          </div>
        )}
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-bold">Đang tải dữ liệu từ máy chủ...</p>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-[400px] items-center justify-center p-6 text-center gap-4 relative font-sans animate-fadeIn">
        {toast && (
          <div className="fixed top-4 right-4 z-[9999] px-5 py-3.5 rounded-2xl shadow-xl text-xs font-black text-white flex items-center gap-3 border border-white/10 select-none bg-emerald-650 shadow-emerald-950/20">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            {toast.message}
          </div>
        )}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-brand-emerald flex items-center justify-center text-4xl shadow-inner select-none">
          🏟️
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

        {/* MODAL: CREATE VENUE */}
        <Modal
          isOpen={isCreateVenueModalOpen}
          onClose={() => setIsCreateVenueModalOpen(false)}
          title="Tạo cụm sân mới"
          maxWidth="md"
          footer={
            <>
              <button 
                type="button" 
                onClick={() => setIsCreateVenueModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button 
                type="button"
                onClick={() => handleCreateVenue()}
                className="bg-brand-emerald text-white font-extrabold text-xs px-6 py-2.5 rounded-xl border-b-2 border-emerald-950 cursor-pointer"
              >
                Tạo cụm sân
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateVenue} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Tên cụm sân *</label>
              <input 
                type="text"
                placeholder="VD: Cụm Sân Pickleball Q3"
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
                className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-emerald focus:ring-1 text-left"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Địa chỉ cụm sân *</label>
              <input 
                type="text"
                placeholder="VD: 145 Điện Biên Phủ, Quận 3, TP. Hồ Chí Minh"
                value={newVenueLocation}
                onChange={(e) => setNewVenueLocation(e.target.value)}
                className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-emerald focus:ring-1 text-left"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giới thiệu cụm sân</label>
              <textarea 
                placeholder="Mô tả cơ sở vật chất, bãi đỗ xe, dịch vụ..."
                value={newVenueDescription}
                onChange={(e) => setNewVenueDescription(e.target.value)}
                className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-emerald h-20 resize-none text-left"
              />
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 relative font-sans animate-fadeIn">
      {/* Toast Notification Banner */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-[9999] px-5 py-3.5 rounded-2xl shadow-xl text-xs font-black text-white flex items-center gap-3 border border-white/10 select-none animate-fadeIn ${
            toast.type === 'success' ? 'bg-emerald-650 shadow-emerald-950/20' : 'bg-red-650 shadow-red-950/20'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          {toast.message}
        </div>
      )}

      {/* MOBILE DRILL-DOWN LAYOUT */}
      {isMobile ? (
        <div className="flex flex-col flex-1">
          {mobileScreen === 'list' ? (
            /* MOBILE SCREEN 1: Venue List Cards */
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-base font-black text-slate-800 uppercase tracking-tight">Vận hành cụm sân</h1>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Chọn cụm sân bên dưới để quản lý</p>
                  </div>
                  
                  {/* Create venue trigger mobile */}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredVenues.map(venue => {
                  const venueCourtsCount = courts.filter(c => c.venueId === venue.id).length;
                  const venueStatus = venue.status || 'ACTIVE';
                  
                  return (
                    <div 
                      key={venue.id}
                      onClick={() => {
                        setSelectedVenueId(venue.id);
                        setMobileScreen('detail');
                      }}
                      className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm active:scale-98 transition-all flex flex-col justify-between h-36"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-black text-slate-800 text-sm tracking-tight">{venue.name}</h3>
                          <p className="text-[10px] text-slate-400 font-bold truncate max-w-[200px]">{venue.location}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          venueStatus === 'ACTIVE' ? 'bg-emerald-50 text-brand-emerald border-emerald-100' :
                          venueStatus === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-red-50 text-red-655 border-red-100'
                        }`}>
                          {venueStatus === 'ACTIVE' ? 'Hoạt động' : venueStatus === 'MAINTENANCE' ? 'Bảo trì' : 'Đóng cửa'}
                        </span>
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
            /* MOBILE SCREEN 2: Venue Detail & Facilities list */
            <div className="space-y-4">
              <div className="flex justify-between items-center select-none">
                <button 
                  onClick={() => setMobileScreen('list')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Quay lại
                </button>

                {/* 3-dots action menu on mobile */}
                <div className="relative">
                  <button
                    onClick={() => setIsVenueMenuOpen(!isVenueMenuOpen)}
                    className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  {isVenueMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsVenueMenuOpen(false)} />
                      <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-40 overflow-hidden">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setIsVenueMenuOpen(false);
                              handleOpenEditVenue();
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                          >
                            Chỉnh sửa thông tin
                          </button>
                          <button
                            onClick={() => {
                              setIsVenueMenuOpen(false);
                              setIsVenueStatusModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                          >
                            Đổi trạng thái vận hành
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
                <div className="space-y-1">
                  <h2 className="text-base font-black text-slate-800">{activeVenue.name}</h2>
                  <p className="text-[10px] text-slate-400 font-bold leading-normal">{activeVenue.location}</p>
                </div>
              </div>

              {/* Booking Alert Banner */}
              {actionRequiredBookings.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-4 flex justify-between items-center text-xs font-bold text-red-750 animate-pulse select-none">
                  <span>Có {actionRequiredBookings.length} đơn đặt sân cần hoàn tiền / đổi lịch gấp.</span>
                  <button 
                    onClick={() => setIsQueueModalOpen(true)}
                    className="bg-red-600 hover:bg-red-750 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition-all"
                  >
                    Xử lý
                  </button>
                </div>
              )}

              {/* Mobile Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl select-none">
                <button
                  onClick={() => setActiveTab('facilities')}
                  className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all ${
                    activeTab === 'facilities' ? 'bg-white text-brand-emerald shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Quản lý sân bãi
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all ${
                    activeTab === 'overview' ? 'bg-white text-brand-emerald shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Tổng quan chỉ số
                </button>
              </div>

              {activeTab === 'overview' ? (
                /* Mobile Tab 1: Overview and Charts */
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-sm flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Doanh thu hôm nay</span>
                        <h4 className="text-base font-black text-slate-800">{formatVND(todayRevenue)}</h4>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-brand-emerald flex items-center justify-center text-sm font-bold">💵</div>
                    </div>
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-sm flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Hiệu suất lấp đầy</span>
                        <h4 className="text-base font-black text-slate-800">{avgOccupancy}%</h4>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">📈</div>
                    </div>
                  </div>

                  {/* SVG Charts on Mobile */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider text-center">Trạng thái hoạt động</h3>
                    <div className="flex justify-center select-none">
                      <svg width="150" height="150" viewBox="0 0 150 150">
                        <circle cx="75" cy="75" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                        {totalOpCourts > 0 ? (
                          <>
                            {/* ACTIVE segment (Green) */}
                            {activeCount > 0 && (
                              <circle 
                                cx="75" cy="75" r="50" fill="transparent" 
                                stroke="#10b981" strokeWidth="16" 
                                strokeDasharray={`${(activeCount / totalOpCourts) * 2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                                strokeDashoffset={0}
                                transform="rotate(-90 75 75)"
                              />
                            )}
                            {/* MAINTENANCE segment (Yellow) */}
                            {maintCount > 0 && (
                              <circle 
                                cx="75" cy="75" r="50" fill="transparent" 
                                stroke="#f59e0b" strokeWidth="16" 
                                strokeDasharray={`${(maintCount / totalOpCourts) * 2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                                strokeDashoffset={-((activeCount / totalOpCourts) * 2 * Math.PI * 50)}
                                transform="rotate(-90 75 75)"
                              />
                            )}
                            {/* CLOSED segment (Red) */}
                            {closedCount > 0 && (
                              <circle 
                                cx="75" cy="75" r="50" fill="transparent" 
                                stroke="#ef4444" strokeWidth="16" 
                                strokeDasharray={`${(closedCount / totalOpCourts) * 2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                                strokeDashoffset={-(((activeCount + maintCount) / totalOpCourts) * 2 * Math.PI * 50)}
                                transform="rotate(-90 75 75)"
                              />
                            )}
                          </>
                        ) : null}
                        <text x="75" y="72" textAnchor="middle" className="text-lg font-black text-slate-800" dy=".3em">{totalOpCourts}</text>
                        <text x="75" y="90" textAnchor="middle" className="text-[8px] font-bold text-slate-400" dy=".3em">SÂN BÃI</text>
                      </svg>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                      <div className="space-y-1">
                        <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                        <span className="block text-slate-650">Hoạt động: {activeCount}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-full" />
                        <span className="block text-slate-650">Bảo trì: {maintCount}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full" />
                        <span className="block text-slate-650">Đóng cửa: {closedCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mobile Tab 2: Facility stack list */
                <div className="space-y-4 pb-20">
                  <div className="flex justify-between items-center bg-white border border-slate-200/60 p-3.5 rounded-2xl select-none">
                    <span className="text-xs font-black text-slate-700">Danh sách sân ({activeCourts.length})</span>
                    <button 
                      onClick={() => setSelectedCourtIds(prev => prev.length === activeCourts.length ? [] : activeCourts.map(c => c.id))}
                      className="text-[10px] font-black text-brand-emerald hover:underline cursor-pointer"
                    >
                      {selectedCourtIds.length === activeCourts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {activeCourts.map(court => {
                      const details = getCourtDetails(court);
                      const isSelected = selectedCourtIds.includes(court.id);
                      
                      return (
                        <div 
                          key={court.id}
                          className={`bg-white border rounded-3xl p-4 shadow-sm space-y-3 transition-all relative ${
                            isSelected ? 'border-brand-emerald ring-2 ring-brand-emerald/10' : 'border-slate-200/60'
                          }`}
                        >
                          <div className="absolute top-4 right-4 z-10">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleSelectCourt(court.id)}
                              className="w-4 h-4 rounded text-brand-emerald border-slate-300 focus:ring-brand-emerald cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1 pr-6 select-none">
                            <h4 className="font-black text-slate-800 text-sm">{details.name}</h4>
                            <div className="flex gap-1.5 items-center">
                              <span className="text-[9px] bg-slate-100 border text-slate-600 px-2 py-0.5 rounded font-black uppercase">
                                {court.sportName}
                              </span>
                              {details.surcharge > 0 && (
                                <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-black">
                                  +{formatVND(details.surcharge)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold border-t border-b border-slate-100 py-2.5 select-none">
                            <div className="space-y-1">
                              <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Live Status</span>
                              <span className={`inline-block px-2.5 py-0.5 rounded-md border text-[9px] font-black uppercase ${
                                details.liveStatus === 'AVAILABLE' ? 'bg-emerald-50 text-brand-emerald border-emerald-100' :
                                details.liveStatus === 'IN_USE' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                'bg-red-50 text-red-500 border-red-100'
                              }`}>
                                {details.liveStatus === 'AVAILABLE' ? 'Trống' : 
                                 details.liveStatus === 'IN_USE' ? 'Đang có khách' : 'Bảo trì'}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <span className="text-slate-400 block uppercase tracking-wider text-[8px]">Tỉ lệ lấp đầy</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-700">{details.occupancy}%</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      details.occupancy > 75 ? 'bg-brand-emerald' : 
                                      details.occupancy > 50 ? 'bg-blue-500' : 'bg-slate-400'
                                    }`} 
                                    style={{ width: `${details.occupancy}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-extrabold select-none">
                            <div>
                              <span className="text-slate-400 text-[8px] block uppercase">Doanh thu/ngày</span>
                              <span className="text-brand-emerald font-black">{formatVND(details.performanceRevenue)}</span>
                            </div>
                            
                            <button 
                              onClick={() => handleOpenEditCourt(court)}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] rounded-xl border border-slate-200"
                            >
                              Cấu hình
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Bulk actions floating bar */}
          {selectedCourtIds.length > 0 && mobileScreen === 'detail' && activeTab === 'facilities' && (
            <div className="fixed bottom-20 left-4 right-4 z-50 bg-primary text-on-primary rounded-3xl p-4 shadow-xl border border-white/10 flex flex-col gap-2 select-none animate-slideUp">
              <div className="flex justify-between items-center text-xs font-bold px-1 border-b border-white/10 pb-2">
                <span>Đã chọn: {selectedCourtIds.length} sân</span>
                <button 
                  onClick={() => setSelectedCourtIds([])}
                  className="text-brand-yellow font-black cursor-pointer uppercase tracking-widest text-[9px]"
                >
                  Hủy chọn
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkMaintenance(true)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-extrabold text-[10px] py-2.5 rounded-xl transition-all cursor-pointer border border-white/10 text-center"
                >
                  Bảo trì
                </button>
                <button
                  onClick={() => handleBulkMaintenance(false)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-extrabold text-[10px] py-2.5 rounded-xl transition-all cursor-pointer border border-white/10 text-center"
                >
                  Hoạt động
                </button>
                <button
                  onClick={handleOpenBulkSurcharge}
                  className="flex-1 bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-[10px] py-2.5 rounded-xl transition-all cursor-pointer text-center"
                >
                  Phụ phí
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* DESKTOP MASTER-DETAIL LAYOUT */
        <div className="flex gap-6 flex-1 min-h-0">
          
          {/* LEFT SIDEBAR (MASTER VIEW): Venue Selector & Search */}
          <aside className="w-72 bg-white border border-slate-200/60 rounded-3xl shadow-sm p-4 flex flex-col flex-shrink-0 select-none">
            <div className="space-y-1 pb-3.5 border-b border-slate-100">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Danh sách cụm sân</h2>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal">Chọn cụm sân bên dưới để quản lý vận hành</p>
            </div>

            {/* Create venue trigger desktop */}
            <button
              onClick={() => setIsCreateVenueModalOpen(true)}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-brand-emerald font-extrabold text-[10px] py-3 rounded-xl border border-emerald-100 transition-all text-center mt-3 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <svg className="w-3.5 h-3.5 text-brand-emerald animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Tạo cụm sân mới
            </button>

            <div className="my-3.5 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Tìm kiếm cụm sân..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-slate-700 font-semibold"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 matrix-scroll pr-1">
              {filteredVenues.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold leading-relaxed">
                  Không tìm thấy cụm sân
                </div>
              ) : (
                filteredVenues.map(venue => {
                  const isSelected = venue.id === activeVenueId;
                  const venueCourtsCount = courts.filter(c => c.venueId === venue.id).length;
                  const venueStatus = venue.status || 'ACTIVE';
                  
                  return (
                    <div 
                      key={venue.id}
                      onClick={() => {
                        setSelectedVenueId(venue.id);
                        setSelectedCourtIds([]);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected 
                          ? 'bg-emerald-50/70 border-emerald-100 text-brand-emerald shadow-xs' 
                          : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <h4 className={`text-xs font-black truncate ${isSelected ? 'text-brand-emerald' : 'text-slate-800 group-hover:text-slate-900'}`}>
                          {venue.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold truncate leading-normal">
                          {venueCourtsCount} sân trực thuộc
                        </p>
                      </div>

                      <span 
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white ${
                          venueStatus === 'ACTIVE' ? 'bg-emerald-500' :
                          venueStatus === 'MAINTENANCE' ? 'bg-amber-400' :
                          'bg-red-500'
                        }`} 
                        title={
                          venueStatus === 'ACTIVE' ? 'Đang hoạt động' : 
                          venueStatus === 'MAINTENANCE' ? 'Bảo trì' : 'Đóng cửa khẩn cấp'
                        }
                      />
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* MAIN CONTENT AREA (DETAIL VIEW): Active Venue Operations */}
          <section className="flex-1 bg-white border border-slate-200/60 rounded-3xl shadow-sm p-6 flex flex-col min-w-0">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-slate-100 select-none flex-shrink-0">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-800 tracking-tight">{activeVenue.name}</h1>
                  
                  {/* 3-dots actions menu button */}
                  <div className="relative">
                    <button
                      onClick={() => setIsVenueMenuOpen(!isVenueMenuOpen)}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-850 rounded-xl transition-all cursor-pointer"
                      title="Hành động cụm sân"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    
                    {isVenueMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsVenueMenuOpen(false)} />
                        <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-40 overflow-hidden">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setIsVenueMenuOpen(false);
                                handleOpenEditVenue();
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                            >
                              Chỉnh sửa thông tin
                            </button>
                            <button
                              onClick={() => {
                                setIsVenueMenuOpen(false);
                                setIsVenueStatusModalOpen(true);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
                            >
                              Đổi trạng thái vận hành
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-450 font-bold leading-normal truncate" title={activeVenue.location}>
                  Địa chỉ: {activeVenue.location}
                </p>
              </div>
            </div>

            {/* Warning Alert Banner */}
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
                  className="bg-red-600 hover:bg-red-750 text-white font-extrabold text-[10px] px-4.5 py-2.5 rounded-xl transition-all cursor-pointer border-b-2 border-red-850"
                >
                  Giải quyết ngay
                </button>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-slate-100 mt-4 select-none flex-shrink-0">
              <button 
                onClick={() => setActiveTab('facilities')}
                className={`pb-3 text-xs font-black tracking-wider transition-all cursor-pointer relative ${
                  activeTab === 'facilities' ? 'text-brand-emerald border-b-2 border-brand-emerald' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                QUẢN LÝ SÂN BÃI
              </button>
              <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-xs font-black tracking-wider transition-all cursor-pointer relative ${
                  activeTab === 'overview' ? 'text-brand-emerald border-b-2 border-brand-emerald' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                TỔNG QUAN CHỈ SỐ
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto mt-4 matrix-scroll min-h-0 relative">
              
              {activeTab === 'overview' ? (
                /* Tab 1: Redesigned Overview with high fidelity custom Pie and Bar charts */
                <div className="space-y-6 pb-6 select-none">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Doanh thu hôm nay</p>
                        <h3 className="text-xl font-black text-slate-800">{formatVND(todayRevenue)}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center font-bold text-lg">💰</div>
                    </div>
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hiệu suất lấp đầy</p>
                        <h3 className="text-xl font-black text-slate-800">{avgOccupancy}%</h3>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center font-bold text-lg">📈</div>
                    </div>
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng đơn đặt lịch</p>
                        <h3 className="text-xl font-black text-slate-800">{totalBookingsCount} đơn</h3>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-lg">🗓️</div>
                    </div>
                  </div>

                  {/* SVG Charts Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* SVG Pie Chart (Donut Chart representing Court Statuses) */}
                    <div className="bg-white border border-slate-250/60 rounded-3xl p-6 shadow-sm flex flex-col items-center">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-6">Tỉ lệ Trạng thái Sân bóng</h4>
                      
                      <div className="relative flex justify-center items-center h-48 w-48">
                        <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                          {/* Donut background circle */}
                          <circle cx="90" cy="90" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
                          
                          {totalOpCourts > 0 ? (
                            <>
                              {/* ACTIVE segment (Green) */}
                              {activeCount > 0 && (
                                <circle 
                                  cx="90" cy="90" r={r} fill="transparent" 
                                  stroke="#10b981" strokeWidth="18" 
                                  strokeDasharray={`${lenActive} ${circumference}`}
                                  strokeDashoffset={0}
                                />
                              )}
                              {/* MAINTENANCE segment (Yellow) */}
                              {maintCount > 0 && (
                                <circle 
                                  cx="90" cy="90" r={r} fill="transparent" 
                                  stroke="#f59e0b" strokeWidth="18" 
                                  strokeDasharray={`${lenMaint} ${circumference}`}
                                  strokeDashoffset={-lenActive}
                                />
                              )}
                              {/* CLOSED segment (Red) */}
                              {closedCount > 0 && (
                                <circle 
                                  cx="90" cy="90" r={r} fill="transparent" 
                                  stroke="#ef4444" strokeWidth="18" 
                                  strokeDasharray={`${lenClosed} ${circumference}`}
                                  strokeDashoffset={-(lenActive + lenMaint)}
                                />
                              )}
                            </>
                          ) : null}
                        </svg>
                        
                        {/* Donut center texts */}
                        <div className="absolute text-center">
                          <h4 className="text-2xl font-black text-slate-800 leading-none">{totalOpCourts}</h4>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mt-1">Sân bóng</span>
                        </div>
                      </div>

                      {/* Legends */}
                      <div className="grid grid-cols-3 gap-6 pt-5 w-full text-center text-[10px] font-bold border-t border-slate-100 mt-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                            <span className="text-slate-800">Hoạt động</span>
                          </div>
                          <span className="text-slate-400 block text-xs">{activeCount} sân</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                            <span className="text-slate-800">Bảo trì</span>
                          </div>
                          <span className="text-slate-400 block text-xs">{maintCount} sân</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                            <span className="text-slate-800">Đóng cửa</span>
                          </div>
                          <span className="text-slate-400 block text-xs">{closedCount} sân</span>
                        </div>
                      </div>
                    </div>

                    {/* SVG/CSS Bar Chart representing Court Revenue/Occupancy */}
                    <div className="bg-white border border-slate-250/60 rounded-3xl p-6 shadow-sm flex flex-col">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-6 text-center">Hiệu quả sân bóng (Doanh thu ước tính)</h4>
                      
                      <div className="flex-1 flex items-end justify-around h-48 border-b border-slate-200 pb-2 px-2">
                        {activeCourts.length === 0 ? (
                          <div className="text-xs text-slate-400 font-bold self-center">Chưa có dữ liệu thống kê sân bóng</div>
                        ) : (
                          activeCourts.map(court => {
                            const details = getCourtDetails(court);
                            // Normalize heights based on a max value of 1.500.000
                            const maxVal = 1500000;
                            const barHeight = details.performanceRevenue > 0
                              ? Math.min(Math.round((details.performanceRevenue / maxVal) * 120), 120)
                              : 10;
                            
                            return (
                              <div key={court.id} className="flex flex-col items-center group relative w-12">
                                {/* Hover tooltip */}
                                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-10">
                                  {formatVND(details.performanceRevenue)}
                                </div>
                                
                                {/* Bar */}
                                <div 
                                  className={`w-8 rounded-t-lg transition-all duration-500 ${
                                    getCourtOpStatus(court.id) === 'ACTIVE' ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' :
                                    getCourtOpStatus(court.id) === 'MAINTENANCE' ? 'bg-amber-400' : 'bg-red-400'
                                  }`}
                                  style={{ height: `${barHeight}px` }}
                                />
                                
                                {/* Label (cut/truncated) */}
                                <span className="text-[9px] font-bold text-slate-500 truncate w-12 text-center mt-2.5">
                                  {details.name.replace('Cụm Sân Bóng Đá Sporta ', '').replace('Sân Cầu Lông Sporta ', '')}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                      
                      <span className="text-[8px] text-slate-400 text-center font-bold mt-2 uppercase tracking-widest">Danh sách các sân bóng trong cụm</span>
                    </div>

                  </div>
                </div>
              ) : (
                /* Tab 2: Facilities operational table without quick toggle switch */
                <div className="pb-24">
                  {activeCourts.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-450 font-bold">
                      Chưa có sân nào được cấu hình trong cụm sân này.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                          <th className="py-3.5 pl-2 w-10">
                            <input 
                              type="checkbox" 
                              checked={selectedCourtIds.length === activeCourts.length && activeCourts.length > 0}
                              onChange={handleSelectAll}
                              className="w-4 h-4 rounded text-brand-emerald border-slate-300 focus:ring-brand-emerald cursor-pointer"
                            />
                          </th>
                          <th className="py-3.5">Tên sân bóng</th>
                          <th className="py-3.5">Trạng thái hoạt động</th>
                          <th className="py-3.5">Tỉ lệ lấp đầy</th>
                          <th className="py-3.5">Hiệu quả vận hành</th>
                          <th className="py-3.5 pr-2 text-right">Thao tác nâng cao</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                        {activeCourts.map(court => {
                          const details = getCourtDetails(court);
                          const isSelected = selectedCourtIds.includes(court.id);
                          
                          return (
                            <tr 
                              key={court.id} 
                              className={`hover:bg-slate-50/50 transition-colors ${
                                isSelected ? 'bg-emerald-50/20' : ''
                              }`}
                            >
                              <td className="py-4 pl-2">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => handleSelectCourt(court.id)}
                                  className="w-4 h-4 rounded text-brand-emerald border-slate-300 focus:ring-brand-emerald cursor-pointer"
                                />
                              </td>
                              <td className="py-4">
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-slate-800 text-xs">{details.name}</span>
                                  <div className="flex gap-2 items-center">
                                    <span className="text-[9px] bg-slate-100 border text-slate-500 px-1.5 py-0.5 rounded leading-none select-none">
                                      {court.sportName}
                                    </span>
                                    {details.surcharge > 0 && (
                                      <span className="text-[9px] bg-amber-50 border border-amber-200 text-amber-600 px-1.5 py-0.5 rounded leading-none select-none">
                                        + Phụ thu: {formatVND(details.surcharge)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 select-none">
                                <span className={`inline-block px-2.5 py-0.5 rounded-md border text-[9px] font-black uppercase ${
                                  details.liveStatus === 'AVAILABLE' ? 'bg-emerald-50 text-brand-emerald border-emerald-100' :
                                  details.liveStatus === 'IN_USE' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  details.liveStatus === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  'bg-red-50 text-red-655 border-red-100'
                                }`}>
                                  {details.liveStatus === 'AVAILABLE' ? 'Trống' : 
                                   details.liveStatus === 'IN_USE' ? 'Đang có khách' : 
                                   details.liveStatus === 'MAINTENANCE' ? 'Bảo trì' : 'Đóng cửa'}
                                </span>
                              </td>
                              <td className="py-4">
                                <div className="flex items-center gap-2 max-w-[130px] select-none">
                                  <span className="font-extrabold text-slate-700 w-8">{details.occupancy}%</span>
                                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${
                                        details.occupancy > 75 ? 'bg-brand-emerald' : 
                                        details.occupancy > 50 ? 'bg-blue-500' : 'bg-slate-400'
                                      }`} 
                                      style={{ width: `${details.occupancy}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 select-none">
                                <div className="space-y-0.5">
                                  <span className="text-slate-700 font-extrabold">{formatVND(details.performanceRevenue)}</span>
                                  <span className="block text-[9px] text-slate-400 font-bold font-mono">ID: {court.id.substring(0, 8)}...</span>
                                </div>
                              </td>
                              <td className="py-4 pr-2 text-right select-none">
                                <div className="flex items-center justify-end gap-3.5">
                                  {/* Cấu hình button replaces quick toggle switch */}
                                  <button 
                                    onClick={() => handleOpenEditCourt(court)}
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] rounded-xl transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Cấu hình
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

            </div>

            {/* Desktop Floating Action Bar */}
            {selectedCourtIds.length > 0 && activeTab === 'facilities' && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-primary text-on-primary rounded-2xl px-6 py-4 shadow-[0_16px_36px_rgba(0,53,39,0.3)] border border-white/10 flex items-center gap-6 select-none animate-slideUp">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-none">Đã lựa chọn {selectedCourtIds.length} sân bóng</span>
                  <span className="text-[9px] text-white/50 font-bold mt-1 uppercase tracking-widest">Thao tác hàng loạt</span>
                </div>
                
                <div className="h-6 w-px bg-white/20" />

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleBulkMaintenance(true)}
                    className="bg-white/10 hover:bg-white/15 text-white font-extrabold text-[10px] px-4.5 py-2.5 rounded-xl transition-all cursor-pointer border border-white/10"
                  >
                    Bảo trì hàng loạt
                  </button>
                  <button 
                    onClick={() => handleBulkMaintenance(false)}
                    className="bg-white/10 hover:bg-white/15 text-white font-extrabold text-[10px] px-4.5 py-2.5 rounded-xl transition-all cursor-pointer border border-white/10"
                  >
                    Bật hoạt động hàng loạt
                  </button>
                  <button 
                    onClick={handleOpenBulkSurcharge}
                    className="bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-[10px] px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Cài đặt phụ phí
                  </button>
                  
                  <button 
                    onClick={() => setSelectedCourtIds([])}
                    className="text-white/60 hover:text-white font-extrabold text-[10px] px-2 py-2 transition-all cursor-pointer"
                  >
                    Hủy chọn
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>
      )}

      {/* MODAL 1: MOCK BOOKINGS ACTION REQUIRED QUEUE */}
      <Modal
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
        title="Danh sách đơn đặt sân cần giải quyết khẩn cấp"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-750 p-4 rounded-2xl flex items-start gap-3 select-none">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-1 text-xs">
              <h4 className="font-black text-red-800 uppercase tracking-tight">Quy tắc hủy đặt lịch khẩn cấp</h4>
              <p className="leading-relaxed font-bold">
                Do cụm sân bị chuyển sang trạng thái <strong>Đóng cửa khẩn cấp (CLOSED)</strong>, hệ thống đã ngắt tự động toàn bộ lịch trình.
                Chủ sân cần liên hệ các khách hàng bên dưới để tiến hành bồi hoàn tiền mặt, tặng điểm Sporta đổi lịch, hoặc thảo luận rời lịch.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
            {actionRequiredBookings.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-450 font-bold select-none">
                Không còn đơn đặt sân nào cần xử lý.
              </div>
            ) : (
              actionRequiredBookings.map(booking => (
                <div 
                  key={booking.id} 
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-xs text-slate-800">{booking.customerName}</span>
                      <span className="text-[9px] font-mono text-slate-400 font-bold select-none">({booking.id})</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold select-none">Số điện thoại: {booking.phoneNumber}</p>
                    <div className="flex flex-wrap gap-2 pt-1 select-none">
                      <span className="text-[9px] bg-white border border-slate-200 text-slate-650 px-2 py-0.5 rounded font-bold">
                        Sân: {booking.courtName}
                      </span>
                      <span className="text-[9px] bg-white border border-slate-200 text-slate-650 px-2 py-0.5 rounded font-bold">
                        Lịch: {booking.date} | {booking.time}
                      </span>
                      <span className="text-[9px] bg-emerald-50 border border-emerald-250 text-emerald-700 px-2 py-0.5 rounded font-bold">
                        Đã thanh toán: {formatVND(booking.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center select-none">
                    <button
                      onClick={() => handleResolveBooking(booking.id, 'refund')}
                      className="bg-red-650 hover:bg-red-750 text-white font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Hoàn tiền
                    </button>
                    <button
                      onClick={() => handleResolveBooking(booking.id, 'points')}
                      className="bg-emerald-50 hover:bg-emerald-100 text-brand-emerald border border-emerald-100 font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Tặng điểm
                    </button>
                    <button
                      onClick={() => handleResolveBooking(booking.id, 'reschedule')}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Đổi lịch
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL 2: BULK SURCHARGE APPLICATION */}
      <Modal
        isOpen={isSurchargeModalOpen}
        onClose={() => setIsSurchargeModalOpen(false)}
        title="Cấu hình phụ phí hàng loạt"
        maxWidth="sm"
        footer={
          <>
            <button 
              type="button"
              onClick={() => setIsSurchargeModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
            >
              Hủy
            </button>
            <button 
              type="button"
              onClick={handleApplySurcharge}
              className="bg-brand-yellow hover:bg-yellow-400 text-primary border-b-2 border-yellow-600 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Áp dụng
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-bold select-none leading-relaxed">
            Nhập số tiền phụ phí (VND/giờ) sẽ được áp dụng thêm vào giá thuê cố định cho {surchargeCourtIds.length} sân bóng đang được chọn.
          </p>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block select-none">Mức phụ phí thêm (VND)</label>
            <div className="relative flex items-center">
              <input 
                type="number"
                value={surchargeAmount}
                onChange={(e) => setSurchargeAmount(e.target.value)}
                className="w-full text-xs font-bold text-slate-755 px-3.5 py-2.5 pr-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
                min={0}
                placeholder="VD: 50000"
              />
              <span className="absolute right-3.5 text-[10px] font-extrabold text-slate-400 select-none">VND</span>
            </div>
            {surchargeAmount && !isNaN(parseFloat(surchargeAmount)) && (
              <p className="text-[9px] text-brand-emerald font-black select-none">
                Quy đổi: +{formatVND(parseFloat(surchargeAmount))} phụ thu / giờ
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL 3: REDESIGNED EDIT COURT DETAILS & PRICE CONFIG */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa chi tiết & Cấu hình giá sân"
        maxWidth="lg"
        footer={
          <>
            <button 
              type="button" 
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
            >
              Đóng
            </button>
            <button 
              type="button"
              onClick={handleSaveCourtConfig}
              disabled={uploadingCover || uploadingDetail}
              className="bg-brand-yellow hover:bg-yellow-400 text-primary border-b-2 border-yellow-600 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              Lưu cấu hình
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Court Name */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Tên sân bóng</label>
              <input 
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giá thuê cố định (VND/h)</label>
              <div className="relative flex items-center">
                <input 
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 pr-14 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald"
                />
                <span className="absolute right-3.5 text-[10px] font-extrabold text-slate-400">VND/h</span>
              </div>
            </div>

            {/* Open / Close Time dropdowns */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giờ mở cửa</label>
              <select
                value={editOpening}
                onChange={(e) => setEditOpening(e.target.value)}
                className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-emerald"
              >
                {TIME_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giờ đóng cửa</label>
              <select
                value={editClosing}
                onChange={(e) => setEditClosing(e.target.value)}
                className="w-full text-xs font-bold text-slate-755 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-emerald"
              >
                {TIME_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Approval Status Dropdown */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Trạng thái phê duyệt (Hệ thống)</label>
              <select
                value={editApprovalStatus}
                onChange={(e) => setEditApprovalStatus(e.target.value as any)}
                className="w-full text-xs font-bold text-slate-755 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-emerald"
              >
                <option value="APPROVED">Đã duyệt hoạt động</option>
                <option value="PENDING">Chờ Admin duyệt</option>
                <option value="REJECTED">Từ chối duyệt</option>
              </select>
            </div>

            {/* Operational Status Dropdown */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Trạng thái vận hành (Chủ sân)</label>
              <select
                value={editOpStatus}
                onChange={(e) => setEditOpStatus(e.target.value as any)}
                className="w-full text-xs font-bold text-slate-755 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-emerald"
              >
                <option value="ACTIVE">Hoạt động (Xanh)</option>
                <option value="MAINTENANCE">Bảo trì (Vàng)</option>
                <option value="CLOSED">Đóng cửa (Đỏ)</option>
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giới thiệu chi tiết</label>
              <textarea 
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none h-16 resize-none"
              />
            </div>
          </div>

          {/* Media upload section (Cloudflare R2) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Tài liệu hình ảnh sân bóng</h4>
            
            {/* 1. Cover Image */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Ảnh bìa sân bãi</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="h-28 w-44 bg-slate-50 border border-dashed border-slate-250 rounded-2xl overflow-hidden relative flex-shrink-0 flex items-center justify-center text-slate-350 font-bold text-[10px] uppercase">
                  {editCoverImage ? (
                    <img src={editCoverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>Xem trước</span>
                  )}
                  {uploadingCover && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 w-full">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nhập liên kết ảnh bìa hoặc chọn tệp..."
                      value={editCoverImage}
                      onChange={(e) => setEditCoverImage(e.target.value)}
                      className="flex-1 text-xs font-bold text-slate-650 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                    />
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={coverInputRef}
                      onChange={handleCoverUpload}
                      className="hidden" 
                    />
                    <button 
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="bg-emerald-50 hover:bg-emerald-100 text-brand-emerald border border-emerald-100 font-extrabold text-[10px] px-3.5 py-2 rounded-xl active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Chọn ảnh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Detail Images */}
            <div className="space-y-2 pt-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Ảnh chi tiết tổng quan</label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    ref={detailInputRef}
                    onChange={handleDetailUpload}
                    className="hidden" 
                  />
                  <button 
                    type="button"
                    onClick={() => detailInputRef.current?.click()}
                    disabled={uploadingDetail}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-755 border border-slate-200 font-extrabold text-[10px] px-4 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Tải thêm ảnh chi tiết
                  </button>
                </div>

                {editDetailImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                    {editDetailImages.map((imgUrl, index) => (
                      <div key={index} className="aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden relative">
                        <img src={imgUrl} alt={`Detail ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveDetailImage(index)}
                          className="absolute top-1 right-1 bg-red-650 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-md cursor-pointer text-[9px]"
                          title="Xóa ảnh"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </Modal>

      {/* MODAL 4: CREATE VENUE */}
      <Modal
        isOpen={isCreateVenueModalOpen}
        onClose={() => setIsCreateVenueModalOpen(false)}
        title="Tạo cụm sân mới"
        maxWidth="md"
        footer={
          <>
            <button 
              type="button" 
              onClick={() => setIsCreateVenueModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-505 hover:bg-slate-50 font-extrabold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button 
              type="button"
              onClick={() => handleCreateVenue()}
              className="bg-brand-emerald text-white font-extrabold text-xs px-6 py-2.5 rounded-xl border-b-2 border-emerald-950 cursor-pointer"
            >
              Tạo cụm sân
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateVenue} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Tên cụm sân *</label>
            <input 
              type="text"
              placeholder="VD: Cụm Sân Pickleball Q3"
              value={newVenueName}
              onChange={(e) => setNewVenueName(e.target.value)}
              className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-emerald focus:ring-1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Địa chỉ cụm sân *</label>
            <input 
              type="text"
              placeholder="VD: 145 Điện Biên Phủ, Quận 3, TP. Hồ Chí Minh"
              value={newVenueLocation}
              onChange={(e) => setNewVenueLocation(e.target.value)}
              className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-emerald focus:ring-1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giới thiệu cụm sân</label>
            <textarea 
              placeholder="Mô tả cơ sở vật chất, bãi đỗ xe, dịch vụ..."
              value={newVenueDescription}
              onChange={(e) => setNewVenueDescription(e.target.value)}
              className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-emerald h-20 resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL 5: EDIT VENUE DETAILS */}
      <Modal
        isOpen={isEditVenueModalOpen}
        onClose={() => setIsEditVenueModalOpen(false)}
        title="Chỉnh sửa thông tin cụm sân"
        maxWidth="md"
        footer={
          <>
            <button 
              type="button" 
              onClick={() => setIsEditVenueModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-505 hover:bg-slate-50 font-extrabold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button 
              type="button"
              onClick={handleEditVenue}
              className="bg-brand-emerald text-white font-extrabold text-xs px-6 py-2.5 rounded-xl border-b-2 border-emerald-950 cursor-pointer"
            >
              Lưu thay đổi
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Tên cụm sân *</label>
            <input 
              type="text"
              value={editVenueName}
              onChange={(e) => setEditVenueName(e.target.value)}
              className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Địa chỉ chi tiết *</label>
            <input 
              type="text"
              value={editVenueLocation}
              onChange={(e) => setEditVenueLocation(e.target.value)}
              className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giới thiệu cụm sân</label>
            <textarea 
              value={editVenueDescription}
              onChange={(e) => setEditVenueDescription(e.target.value)}
              className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none h-20 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL 6: EDIT VENUE STATUS WITH WARNING */}
      <Modal
        isOpen={isVenueStatusModalOpen}
        onClose={() => setIsVenueStatusModalOpen(false)}
        title="Thay đổi trạng thái cụm sân vận hành"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-amber-55/40 border border-amber-250 text-amber-700 p-4 rounded-2xl flex items-start gap-2.5 select-none">
            <span className="text-lg">⚠️</span>
            <div className="space-y-1 text-xs">
              <h4 className="font-black text-amber-800 uppercase">Lưu ý quan trọng</h4>
              <p className="leading-relaxed font-bold">
                Thay đổi trạng thái cụm sân sẽ ảnh hưởng trực tiếp đến trạng thái hoạt động của toàn bộ sân bãi bên trong.
                Hệ thống sẽ đồng bộ hóa trạng thái mới của cụm sân xuống toàn bộ sân bãi tương ứng.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 select-none">Chọn trạng thái vận hành mới</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 select-none">
              <button
                onClick={() => handleVenueStatusChange('ACTIVE')}
                className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10 transition-all flex flex-col items-center gap-2 cursor-pointer"
              >
                <span className="w-4.5 h-4.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-black text-slate-800">Hoạt động</span>
                <span className="text-[9px] text-slate-400 font-bold text-center">Bật toàn bộ các sân hoạt động</span>
              </button>
              
              <button
                onClick={() => handleVenueStatusChange('MAINTENANCE')}
                className="p-4 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/10 transition-all flex flex-col items-center gap-2 cursor-pointer"
              >
                <span className="w-4.5 h-4.5 rounded-full bg-amber-400" />
                <span className="text-xs font-black text-slate-800">Bảo trì</span>
                <span className="text-[9px] text-slate-400 font-bold text-center">Tạm ngưng hoạt động nhận khách</span>
              </button>

              <button
                onClick={() => handleVenueStatusChange('CLOSED')}
                className="p-4 rounded-2xl border border-slate-200 hover:border-red-500 hover:bg-red-50/10 transition-all flex flex-col items-center gap-2 cursor-pointer"
              >
                <span className="w-4.5 h-4.5 rounded-full bg-red-500" />
                <span className="text-xs font-black text-slate-800">Đóng cửa</span>
                <span className="text-[9px] text-slate-400 font-bold text-center">Đóng cửa toàn cụm và xử lý đơn</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};
