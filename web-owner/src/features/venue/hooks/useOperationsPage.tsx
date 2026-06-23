import React, { useState, useRef, useEffect } from 'react';
import { useOperations } from '../../../hooks/useOperationsState';
import { courtService } from '../services/courtService';
import type { CourtResponse, VenueResponse, CourtRequest } from '../types';
import { useToast } from '../../../components/ui/Toast';

export const useOperationsPage = () => {
  const { showToast } = useToast();
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
  
  // Per-venue 3-dot menu (tracks which venue's menu is open)
  const [openVenueMenuId, setOpenVenueMenuId] = useState<string | null>(null);

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

  // Open status modal for a specific venue (from 3-dot menu)
  const [targetVenueForStatus, setTargetVenueForStatus] = useState<string | null>(null);

  // Confirmation flow states for venue status
  const [pendingVenueStatus, setPendingVenueStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'CLOSED' | null>(null);
  const [isConfirmStatusModalOpen, setIsConfirmStatusModalOpen] = useState(false);

  // Helper: Format currency 100000 -> 100.000 VND
  const formatVND = (amount: number) => {
    if (isNaN(amount)) return '0 VND';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VND';
  };

  // Smart hour options from 00:00 to 23:30 in 30-min intervals
  const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, '0');
    const minutes = (i % 2 === 0 ? '00' : '30');
    return `${hours}:${minutes}`;
  });
  const hourDropdownOptions = TIME_OPTIONS.map(t => ({ value: t, label: t }));

  const approvalDropdownOptions = [
    { value: 'APPROVED', label: 'Đã duyệt hoạt động' },
    { value: 'PENDING',  label: 'Chờ Admin duyệt' },
    { value: 'REJECTED', label: 'Từ chối duyệt' },
  ];

  const opDropdownOptions = [
    { value: 'ACTIVE',      label: 'Hoạt động',  icon: <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> },
    { value: 'MAINTENANCE', label: 'Bảo trì',     icon: <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" /> },
    { value: 'CLOSED',      label: 'Đóng cửa',   icon: <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" /> },
  ];

  const activeVenue = venues.find(v => v.id === selectedVenueId) || venues[0];
  const activeVenueId = activeVenue?.id;

  const activeCourts = courts.filter(c => c.venueId === activeVenueId);
  const filteredVenues = venues.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const venueBookings = bookings.filter(b => {
    const court = courts.find(c => c.id === b.courtId);
    return court?.venueId === activeVenueId;
  });

  const actionRequiredBookings = venueBookings.filter(b => b.status === 'ACTION_REQUIRED');
  const confirmedBookings = venueBookings.filter(b => b.status === 'CONFIRMED');
  const todayRevenue = confirmedBookings.reduce((sum, b) => sum + b.price, 0);
  const totalBookingsCount = venueBookings.length;

  // Court operational status helpers
  const getCourtOpStatus = (courtId: string) => {
    return (localStorage.getItem(`court_op_status_${courtId}`) || 'ACTIVE') as 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  };

  const getCourtLiveStatus = (court: CourtResponse) => {
    const opStatus = getCourtOpStatus(court.id);
    if (opStatus === 'MAINTENANCE') return 'MAINTENANCE';
    if (opStatus === 'CLOSED') return 'CLOSED';
    if (localStorage.getItem(`court_maint_${court.id}`) === 'true') return 'MAINTENANCE';
    const charCodeSum = court.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return charCodeSum % 3 === 0 ? 'IN_USE' : 'AVAILABLE';
  };

  const getCourtOccupancy = (court: CourtResponse) => {
    const opStatus = getCourtOpStatus(court.id);
    if (opStatus === 'MAINTENANCE' || opStatus === 'CLOSED') return 0;
    const charSum = court.name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return 45 + (charSum % 46);
  };

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

  const getCourtDetails = (court: CourtResponse) => {
    const localName  = localStorage.getItem(`court_name_${court.id}`)  || court.name;
    const localPrice = localStorage.getItem(`court_price_${court.id}`)
      ? parseFloat(localStorage.getItem(`court_price_${court.id}`)!)
      : court.price;
    const surcharge  = localStorage.getItem(`court_surcharge_${court.id}`)
      ? parseFloat(localStorage.getItem(`court_surcharge_${court.id}`)!)
      : 0;
    const opStatus   = getCourtOpStatus(court.id);
    const liveStatus = getCourtLiveStatus(court);
    const occupancy  = getCourtOccupancy(court);
    const performanceRevenue = getCourtPerformanceRevenue(court);
    return { name: localName, price: localPrice, surcharge, liveStatus, occupancy, performanceRevenue, isMaintenance: opStatus === 'MAINTENANCE' };
  };

  const avgOccupancy = activeCourts.length > 0
    ? Math.round(activeCourts.reduce((sum, c) => sum + getCourtOccupancy(c), 0) / activeCourts.length)
    : 0;

  // Stats for donut chart
  const activeCount = activeCourts.filter(c => getCourtOpStatus(c.id) === 'ACTIVE').length;
  const maintCount  = activeCourts.filter(c => getCourtOpStatus(c.id) === 'MAINTENANCE').length;
  const closedCount = activeCourts.filter(c => getCourtOpStatus(c.id) === 'CLOSED').length;
  const totalOpCourts = activeCourts.length;

    const handleVenueStatusSelect = (newStatus: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED') => {
      setPendingVenueStatus(newStatus);
      setIsVenueStatusModalOpen(false);
      setIsConfirmStatusModalOpen(true);
    };

    const handleConfirmVenueStatusChange = async () => {
      if (!activeVenueId || !pendingVenueStatus) return;
      try {
        await changeVenueStatus(activeVenueId, pendingVenueStatus);
        showToast('success', `Đã chuyển trạng thái cụm sân thành: ${
          pendingVenueStatus === 'ACTIVE' ? 'Đang hoạt động' : pendingVenueStatus === 'MAINTENANCE' ? 'Tạm ngưng nhận khách' : 'Đóng cửa khẩn cấp'
        }. Toàn bộ sân bên trong đã được cập nhật.`);
      } catch (err: any) {
        showToast('error', err.message || 'Lỗi khi cập nhật trạng thái cụm sân');
      } finally {
        setPendingVenueStatus(null);
        setIsConfirmStatusModalOpen(false);
      }
    };

    const handleCancelVenueStatusChange = () => {
      setPendingVenueStatus(null);
      setIsConfirmStatusModalOpen(false);
      setIsVenueStatusModalOpen(true);
    };

    const handleOpenVenueStatusFromMenu = (venueId: string) => {
      setSelectedVenueId(venueId);
      setTargetVenueForStatus(venueId);
      setIsVenueStatusModalOpen(true);
    };

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

    const handleOpenEditVenue = (venueId?: string) => {
      const target = venueId ? venues.find(v => v.id === venueId) : activeVenue;
      if (!target) return;
      setEditVenueName(target.name);
      setEditVenueLocation(target.location);
      setEditVenueDescription(target.description || '');
      if (venueId) setSelectedVenueId(venueId);
      setIsEditVenueModalOpen(true);
    };

    const handleEditVenue = async () => {
      if (!editVenueName.trim() || !editVenueLocation.trim()) {
        showToast('error', 'Vui lòng điền đủ Tên và Địa chỉ cụm sân');
        return;
      }
      try {
        await updateVenueInfo(activeVenueId!, editVenueName, editVenueLocation, editVenueDescription);
        setIsEditVenueModalOpen(false);
        showToast('success', 'Đã cập nhật thông tin cụm sân thành công!');
      } catch (err: any) {
        showToast('error', err.message || 'Lỗi khi cập nhật thông tin cụm sân');
      }
    };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedCourtIds(activeCourts.map(c => c.id));
    else setSelectedCourtIds([]);
  };

  const handleSelectCourt = (courtId: string) => {
    setSelectedCourtIds(prev => prev.includes(courtId) ? prev.filter(id => id !== courtId) : [...prev, courtId]);
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

    const handleOpenEditCourt = (court: CourtResponse) => {
      setEditingCourt(court);
      const localName  = localStorage.getItem(`court_name_${court.id}`)  || court.name;
      const localPrice = localStorage.getItem(`court_price_${court.id}`) || court.price.toString();
      const localDesc  = localStorage.getItem(`court_desc_${court.id}`)  || court.description || '';
      const localOpen  = localStorage.getItem(`court_open_${court.id}`)  || court.openingTime;
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

    const uploadCoverFile = async (file: File) => {
      try {
        setUploadingCover(true);
        const url = await courtService.uploadImage(file, 'court_cover');
        setEditCoverImage(url);
        showToast('success', 'Đã tải ảnh bìa mới lên lưu trữ.');
      } catch {
        showToast('error', 'Lỗi khi tải ảnh bìa lên');
      } finally {
        setUploadingCover(false);
      }
    };

    const uploadDetailFiles = async (files: FileList) => {
      try {
        setUploadingDetail(true);
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const url = await courtService.uploadImage(files[i], 'court_detail');
          uploadedUrls.push(url);
        }
        setEditDetailImages(prev => [...prev, ...uploadedUrls]);
        showToast('success', `Đã tải lên thêm ${files.length} ảnh chi tiết.`);
      } catch {
        showToast('error', 'Lỗi khi tải ảnh chi tiết lên');
      } finally {
        setUploadingDetail(false);
      }
    };

    const handleRemoveDetailImage = (index: number) => {
      setEditDetailImages(prev => prev.filter((_, idx) => idx !== index));
    };

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
        if (editApprovalStatus !== editingCourt?.status) {
          await courtService.updateStatus(editingCourt!.id, editApprovalStatus);
        }
        const payload: CourtRequest = {
          name: editName,
          price: priceNum,
          description: editDescription,
          coverImage: editCoverImage,
          openingTime: editOpening,
          closingTime: editClosing,
          location: editLocation,
          sportId: editSportId,
          venueId: activeVenueId || null,
          detailImages: editDetailImages,
        };
        await courtService.updateCourt(editingCourt!.id, payload);
        localStorage.setItem(`court_op_status_${editingCourt!.id}`, editOpStatus);
        localStorage.setItem(`court_name_${editingCourt!.id}`,  editName);
        localStorage.setItem(`court_price_${editingCourt!.id}`, priceNum.toString());
        localStorage.setItem(`court_desc_${editingCourt!.id}`,  editDescription);
        localStorage.setItem(`court_open_${editingCourt!.id}`,  editOpening);
        localStorage.setItem(`court_close_${editingCourt!.id}`, editClosing);
        await refreshData();
        setIsEditModalOpen(false);
        showToast('success', 'Đã đồng bộ và cập nhật thông tin sân thành công.');
      } catch (err: any) {
        showToast('error', err.message || 'Lỗi khi lưu thông tin cấu hình sân');
      }
    };

    const handleResolveBooking = (bookingId: string, action: 'refund' | 'points' | 'reschedule') => {
      resolveBooking(bookingId, action);
      showToast('success', `Đã hoàn tất xử lý: ${
        action === 'refund' ? 'Hoàn trả tiền' : action === 'points' ? 'Tặng điểm thưởng' : 'Chuyển lịch hẹn'
      }`);
    };

  return {
    venues,
    courts,
    bookings,
    selectedVenueId,
    selectedCourtIds,
    loading,
    error,
    refreshData,
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
    setEditDetailImages,
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
    venueBookings,
    actionRequiredBookings,
    confirmedBookings,
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
    getCourtLiveStatus,
    getCourtOccupancy,
    getCourtPerformanceRevenue,
    getCourtDetails,

    // Confirmation Flow States
    pendingVenueStatus,
    setPendingVenueStatus,
    isConfirmStatusModalOpen,
    setIsConfirmStatusModalOpen,

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
  };
};
