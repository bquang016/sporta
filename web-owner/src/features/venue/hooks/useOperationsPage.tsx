import React, { useState, useEffect } from 'react';
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

  const activeVenue = venues.find(v => v.id === selectedVenueId) || venues[0];
  const activeVenueId = activeVenue?.id;

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

  // Edit court form states (Simplified: only name, price, status)
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOpStatus, setEditOpStatus] = useState<'ACTIVE' | 'MAINTENANCE'>('ACTIVE');

  // Create venue form states
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueLocation, setNewVenueLocation] = useState('');
  const [newVenueLatitude, setNewVenueLatitude] = useState<number | undefined>(undefined);
  const [newVenueLongitude, setNewVenueLongitude] = useState<number | undefined>(undefined);
  const [newVenueDescription, setNewVenueDescription] = useState('');
  const [newVenueOpeningTime, setNewVenueOpeningTime] = useState('06:00');
  const [newVenueClosingTime, setNewVenueClosingTime] = useState('22:00');
  const [newVenueShiftDuration, setNewVenueShiftDuration] = useState(30);
  const [newVenueSportId, setNewVenueSportId] = useState('1');
  const [newVenueCoverImage, setNewVenueCoverImage] = useState('');
  const [newVenueDetailImages, setNewVenueDetailImages] = useState<string[]>([]);
  const [uploadingNewVenueCover, setUploadingNewVenueCover] = useState(false);
  const [uploadingNewVenueDetail, setUploadingNewVenueDetail] = useState(false);

  // Edit venue form states
  const [editVenueName, setEditVenueName] = useState('');
  const [editVenueLocation, setEditVenueLocation] = useState('');
  const [editVenueLatitude, setEditVenueLatitude] = useState<number | undefined>(undefined);
  const [editVenueLongitude, setEditVenueLongitude] = useState<number | undefined>(undefined);
  const [editVenueDescription, setEditVenueDescription] = useState('');
  const [editVenueOpeningTime, setEditVenueOpeningTime] = useState('06:00');
  const [editVenueClosingTime, setEditVenueClosingTime] = useState('22:00');
  const [editVenueShiftDuration, setEditVenueShiftDuration] = useState(30);
  const [editVenueSportId, setEditVenueSportId] = useState('1');
  const [editVenueCoverImage, setEditVenueCoverImage] = useState('');
  const [editVenueDetailImages, setEditVenueDetailImages] = useState<string[]>([]);
  const [uploadingEditVenueCover, setUploadingEditVenueCover] = useState(false);
  const [uploadingEditVenueDetail, setUploadingEditVenueDetail] = useState(false);

  // Surcharge states
  const [isSurchargeModalOpen, setIsSurchargeModalOpen] = useState(false);
  const [surchargeAmount, setSurchargeAmount] = useState('50000');
  const [surchargeCourtIds, setSurchargeCourtIds] = useState<string[]>([]);

  // Open status modal for a specific venue (from 3-dot menu)
  const [targetVenueForStatus, setTargetVenueForStatus] = useState<string | null>(null);

  // Confirmation flow states for venue status
  const [pendingVenueStatus, setPendingVenueStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'CLOSED' | null>(null);
  const [isConfirmStatusModalOpen, setIsConfirmStatusModalOpen] = useState(false);

  // --- NEW COURT FORM STATES ---
  const [isAddingCourt, setIsAddingCourt] = useState(false);
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtPrice, setNewCourtPrice] = useState('100000');
  const [newCourtStatus, setNewCourtStatus] = useState<'ACTIVE' | 'MAINTENANCE'>('ACTIVE');
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [newCourtValidationErrors, setNewCourtValidationErrors] = useState<Record<string, string>>({});

  const initCleanAddCourt = () => {
    setNewCourtName('');
    setNewCourtPrice('100000');
    setNewCourtStatus('ACTIVE');
    setNewCourtValidationErrors({});
  };

  const handleStartAddCourt = () => {
    initCleanAddCourt();
    setIsAddingCourt(true);
  };

  const handleCancelAddCourt = () => {
    setIsAddingCourt(false);
  };

  const validateNewCourt = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newCourtName.trim()) {
      errors.name = 'Tên sân không được để trống';
    } else if (newCourtName.length < 3) {
      errors.name = 'Tên sân phải có ít nhất 3 ký tự';
    }

    const priceNum = parseFloat(newCourtPrice);
    if (!newCourtPrice || isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Giá thuê phải là số dương lớn hơn 0';
    }

    setNewCourtValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitNewCourt = () => {
    if (!validateNewCourt()) {
      showToast('warning', 'Vui lòng kiểm tra lại thông tin sân');
      return;
    }
    setIsConfirmSubmitOpen(true);
  };

  const handleConfirmSubmitNewCourt = async () => {
    const payload: CourtRequest = {
      name: newCourtName,
      price: parseFloat(newCourtPrice),
      venueId: activeVenueId || '',
      status: newCourtStatus
    };

    try {
      await courtService.registerCourt(payload);
      showToast('success', 'Thêm sân mới thành công!');
      setIsAddingCourt(false);
      initCleanAddCourt();
      await refreshData();
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi thêm sân mới');
    } finally {
      setIsConfirmSubmitOpen(false);
    }
  };

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

  const opDropdownOptions = [
    { value: 'ACTIVE',      label: 'Hoạt động',  icon: <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> },
    { value: 'MAINTENANCE', label: 'Bảo trì',     icon: <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" /> }
  ];

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
    const court = courts.find(c => c.id === courtId);
    return court?.status || 'ACTIVE';
  };

  const getCourtLiveStatus = (court: CourtResponse) => {
    const opStatus = court.status;
    if (opStatus === 'MAINTENANCE') return 'MAINTENANCE';
    const charCodeSum = court.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return charCodeSum % 3 === 0 ? 'IN_USE' : 'AVAILABLE';
  };

  const getCourtOccupancy = (court: CourtResponse) => {
    const opStatus = court.status;
    if (opStatus === 'MAINTENANCE') return 0;
    const charSum = court.name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return 45 + (charSum % 46);
  };

  const getCourtPerformanceRevenue = (court: CourtResponse) => {
    const opStatus = court.status;
    if (opStatus === 'MAINTENANCE') return 0;
    const charSum = court.name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const dailyBookingsCount = Math.floor(charSum % 5) + 1;
    return dailyBookingsCount * court.price;
  };

  const getCourtDetails = (court: CourtResponse) => {
    const name = court.name;
    const price = court.price;
    const surcharge = parseFloat(localStorage.getItem(`court_surcharge_${court.id}`) || '0');
    const opStatus = court.status;
    const liveStatus = getCourtLiveStatus(court);
    const occupancy = getCourtOccupancy(court);
    const performanceRevenue = getCourtPerformanceRevenue(court);
    return { name, price, surcharge, liveStatus, occupancy, performanceRevenue, isMaintenance: opStatus === 'MAINTENANCE' };
  };

  const avgOccupancy = activeCourts.length > 0
    ? Math.round(activeCourts.reduce((sum, c) => sum + getCourtOccupancy(c), 0) / activeCourts.length)
    : 0;

  // Stats for donut chart
  const activeCount = activeCourts.filter(c => c.status === 'ACTIVE').length;
  const maintCount  = activeCourts.filter(c => c.status === 'MAINTENANCE').length;
  const closedCount = 0; // Handled at venue level now
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
      }.`);
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
      await createVenueInfo(
        newVenueName,
        newVenueLocation,
        newVenueDescription,
        newVenueOpeningTime,
        newVenueClosingTime,
        parseInt(newVenueSportId),
        newVenueCoverImage,
        newVenueDetailImages,
        newVenueShiftDuration,
        newVenueLatitude,
        newVenueLongitude
      );
      setIsCreateVenueModalOpen(false);
      setNewVenueName('');
      setNewVenueLocation('');
      setNewVenueLatitude(undefined);
      setNewVenueLongitude(undefined);
      setNewVenueDescription('');
      setNewVenueOpeningTime('06:00');
      setNewVenueClosingTime('22:00');
      setNewVenueShiftDuration(30);
      setNewVenueSportId('1');
      setNewVenueCoverImage('');
      setNewVenueDetailImages([]);
      showToast('success', 'Đã tạo cụm sân mới thành công!');
      await refreshData();
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi tạo cụm sân');
    }
  };

  const handleOpenEditVenue = (venueId?: string) => {
    const target = venueId ? venues.find(v => v.id === venueId) : activeVenue;
    if (!target) return;
    setEditVenueName(target.name);
    setEditVenueLocation(target.location);
    setEditVenueLatitude(target.latitude);
    setEditVenueLongitude(target.longitude);
    setEditVenueDescription(target.description || '');
    setEditVenueOpeningTime(target.openingTime || '06:00');
    setEditVenueClosingTime(target.closingTime || '22:00');
    setEditVenueShiftDuration(target.shiftDurationMinutes || 30);
    setEditVenueSportId(target.sport?.id ? String(target.sport.id) : '1');
    setEditVenueCoverImage(target.coverImage || '');
    setEditVenueDetailImages(target.images ? target.images.map(img => img.imageUrl) : []);
    if (venueId) setSelectedVenueId(venueId);
    setIsEditVenueModalOpen(true);
  };

  const handleEditVenue = async () => {
    if (!editVenueName.trim() || !editVenueLocation.trim()) {
      showToast('error', 'Vui lòng điền đủ Tên và Địa chỉ cụm sân');
      return;
    }
    try {
      await updateVenueInfo(
        activeVenueId!,
        editVenueName,
        editVenueLocation,
        editVenueDescription,
        editVenueOpeningTime,
        editVenueClosingTime,
        parseInt(editVenueSportId),
        editVenueCoverImage,
        editVenueDetailImages,
        editVenueShiftDuration,
        editVenueLatitude,
        editVenueLongitude
      );
      setIsEditVenueModalOpen(false);
      showToast('success', 'Đã cập nhật thông tin cụm sân thành công!');
      await refreshData();
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi cập nhật thông tin cụm sân');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedCourtIds(activeCourts.map(c => c.id));
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
    setEditName(court.name);
    setEditPrice(court.price.toString());
    setEditOpStatus(court.status);
    setIsEditModalOpen(true);
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
      const payload: CourtRequest = {
        name: editName,
        price: priceNum,
        venueId: activeVenueId || '',
        status: editOpStatus,
      };
      await courtService.updateCourt(editingCourt!.id, payload);
      await refreshData();
      setIsEditModalOpen(false);
      showToast('success', 'Đã cập nhật thông tin sân thành công.');
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

  // Image Upload Methods for Venue Form
  const uploadNewVenueCoverFile = async (file: File) => {
    try {
      setUploadingNewVenueCover(true);
      const url = await courtService.uploadImage(file, 'court_cover');
      setNewVenueCoverImage(url);
      showToast('success', 'Tải ảnh bìa lên thành công!');
    } catch {
      showToast('error', 'Lỗi khi upload ảnh bìa');
    } finally {
      setUploadingNewVenueCover(false);
    }
  };

  const uploadNewVenueDetailFiles = async (files: FileList) => {
    try {
      setUploadingNewVenueDetail(true);
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await courtService.uploadImage(files[i], 'court_detail');
        uploadedUrls.push(url);
      }
      setNewVenueDetailImages(prev => [...prev, ...uploadedUrls]);
      showToast('success', `Đã upload ${files.length} ảnh chi tiết!`);
    } catch {
      showToast('error', 'Lỗi khi upload ảnh chi tiết');
    } finally {
      setUploadingNewVenueDetail(false);
    }
  };

  const uploadEditVenueCoverFile = async (file: File) => {
    try {
      setUploadingEditVenueCover(true);
      const url = await courtService.uploadImage(file, 'court_cover');
      setEditVenueCoverImage(url);
      showToast('success', 'Tải ảnh bìa mới lên thành công!');
    } catch {
      showToast('error', 'Lỗi khi upload ảnh bìa');
    } finally {
      setUploadingEditVenueCover(false);
    }
  };

  const uploadEditVenueDetailFiles = async (files: FileList) => {
    try {
      setUploadingEditVenueDetail(true);
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await courtService.uploadImage(files[i], 'court_detail');
        uploadedUrls.push(url);
      }
      setEditVenueDetailImages(prev => [...prev, ...uploadedUrls]);
      showToast('success', `Đã upload thêm ${files.length} ảnh chi tiết!`);
    } catch {
      showToast('error', 'Lỗi khi upload ảnh chi tiết');
    } finally {
      setUploadingEditVenueDetail(false);
    }
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
    setNewVenueDetailImages,
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
    setEditVenueDetailImages,
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
    handleSaveCourtConfig,
    handleResolveBooking,

    // --- NEW COURT FORM / DRAFT EXPORTS ---
    isAddingCourt,
    setIsAddingCourt,
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
    handleRemoveNewVenueDetailImage: (index: number) => setNewVenueDetailImages(prev => prev.filter((_, idx) => idx !== index)),
    handleRemoveEditVenueDetailImage: (index: number) => setEditVenueDetailImages(prev => prev.filter((_, idx) => idx !== index))
  };
};
