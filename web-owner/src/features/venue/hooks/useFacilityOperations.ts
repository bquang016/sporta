import React, { useState, useEffect } from 'react';
import { courtService } from '../services/courtService';
import type { CourtResponse, VenueResponse, CourtRequest } from '../types';
import { useToast } from '../../../components/ui/Toast';
import type { DropdownOption } from '../../../components/ui/Dropdown';

export const useFacilityOperations = () => {
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats Toggle State
  const [showStats, setShowStats] = useState(() => {
    const saved = localStorage.getItem('showFacilityStats');
    return saved !== 'false';
  });

  // Filter States (Courts)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [selectedVenueFilter, setSelectedVenueFilter] = useState<string>('ALL');

  // Modal States
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<CourtResponse | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  
  // Toast Notification
  const { showToast } = useToast();

  // Form States (Court)
  const [courtName, setCourtName] = useState('');
  const [courtPrice, setCourtPrice] = useState<string>('100000');
  const [courtDescription, setCourtDescription] = useState('');
  const [courtCoverImage, setCourtCoverImage] = useState('');
  const [courtOpeningTime, setCourtOpeningTime] = useState('06:00');
  const [courtClosingTime, setCourtClosingTime] = useState('22:00');
  const [courtLocation, setCourtLocation] = useState('');
  const [courtSportId, setCourtSportId] = useState<string>('1');
  const [courtVenueId, setCourtVenueId] = useState<string>('');
  const [courtDetailImages, setCourtDetailImages] = useState<string[]>([]);

  // File Upload State Indicators
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingDetail, setUploadingDetail] = useState(false);

  // Form Validation Errors
  const [courtValidationErrors, setCourtValidationErrors] = useState<Record<string, string>>({});

  // Generate Smart Time Options (00:00 to 23:30 in 30-min intervals)
  const TIME_OPTIONS: DropdownOption[] = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, '0');
    const minutes = (i % 2 === 0 ? '00' : '30');
    const timeStr = `${hours}:${minutes}`;
    return { value: timeStr, label: timeStr };
  });

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedCourts, fetchedVenues] = await Promise.all([
        courtService.getCourts(),
        courtService.getVenues()
      ]);
      setCourts(fetchedCourts);
      setVenues(fetchedVenues);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Không thể kết nối API hệ thống. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleStats = () => {
    localStorage.setItem('showFacilityStats', (!showStats).toString());
    setShowStats(!showStats);
  };

  // Format currency: 150000 -> 150.000 VND
  const formatVND = (amount: number) => {
    if (isNaN(amount)) return '0 VND';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VND";
  };

  // Validate Court Form
  const validateCourt = (): boolean => {
    const errors: Record<string, string> = {};
    if (!courtName.trim()) {
      errors.name = 'Tên sân không được để trống';
    } else if (courtName.length < 3) {
      errors.name = 'Tên sân phải có ít nhất 3 ký tự';
    }

    const priceNum = parseFloat(courtPrice);
    if (!courtPrice || isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Giá thuê phải là số dương lớn hơn 0';
    }

    if (!courtLocation.trim()) {
      errors.location = 'Địa chỉ vị trí sân không được để trống';
    }

    if (!courtVenueId) {
      errors.venueId = 'Vui lòng chọn một cụm sân cho sân này';
    }

    // Validate opening & closing hours precedence
    const openParts = courtOpeningTime.split(':').map(Number);
    const closeParts = courtClosingTime.split(':').map(Number);
    const openMinutes = openParts[0] * 60 + openParts[1];
    const closeMinutes = closeParts[0] * 60 + closeParts[1];

    if (closeMinutes <= openMinutes) {
      errors.time = 'Giờ đóng cửa phải nằm sau giờ mở cửa';
    }

    setCourtValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open modal for Court registration (New)
  const handleOpenCourtCreate = () => {
    setEditingCourt(null);
    setViewOnly(false);
    setCourtName('');
    setCourtPrice('100000');
    setCourtDescription('');
    setCourtCoverImage('');
    setCourtOpeningTime('06:00');
    setCourtClosingTime('22:00');
    setCourtLocation('');
    setCourtSportId('1');
    setCourtVenueId(venues.length > 0 ? venues[0].id : '');
    setCourtDetailImages([]);
    setCourtValidationErrors({});
    setIsCourtModalOpen(true);
  };

  // Open modal for Court detail (View/Edit)
  const handleOpenCourtDetail = (court: CourtResponse, isViewOnly: boolean) => {
    setEditingCourt(court);
    setViewOnly(isViewOnly);
    setCourtName(court.name);
    setCourtPrice(court.price.toString());
    setCourtDescription(court.description || '');
    setCourtCoverImage(court.coverImage || '');
    setCourtOpeningTime(court.openingTime);
    setCourtClosingTime(court.closingTime);
    setCourtLocation(court.location);
    setCourtSportId(court.sportId.toString());
    setCourtVenueId(court.venueId || '');
    setCourtDetailImages(court.detailImages.map(img => img.imageUrl));
    setCourtValidationErrors({});
    setIsCourtModalOpen(true);
  };

  // Upload Cover Image to R2
  const uploadCoverFile = async (file: File) => {
    try {
      setUploadingCover(true);
      const url = await courtService.uploadImage(file, 'court_cover');
      setCourtCoverImage(url);
      showToast('success', 'Tải ảnh bìa lên Cloudflare R2 thành công!');
    } catch (err) {
      showToast('error', 'Lỗi khi upload ảnh bìa');
    } finally {
      setUploadingCover(false);
    }
  };

  // Upload Detail Images to R2
  const uploadDetailFiles = async (files: FileList) => {
    try {
      setUploadingDetail(true);
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await courtService.uploadImage(files[i], 'court_detail');
        uploadedUrls.push(url);
      }
      setCourtDetailImages(prev => [...prev, ...uploadedUrls]);
      showToast('success', `Đã upload ${files.length} ảnh chi tiết lên R2!`);
    } catch (err) {
      showToast('error', 'Lỗi khi upload ảnh chi tiết');
    } finally {
      setUploadingDetail(false);
    }
  };

  const handleRemoveDetailImage = (index: number) => {
    setCourtDetailImages(prev => prev.filter((_, idx) => idx !== index));
  };

  // Submit Court Form
  const handleSubmitCourt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (viewOnly) return;
    if (!validateCourt()) return;

    const payload: CourtRequest = {
      name: courtName,
      price: parseFloat(courtPrice),
      description: courtDescription,
      coverImage: courtCoverImage,
      openingTime: courtOpeningTime,
      closingTime: courtClosingTime,
      location: courtLocation,
      sportId: parseInt(courtSportId),
      venueId: courtVenueId || null,
      detailImages: courtDetailImages
    };

    try {
      if (editingCourt) {
        const updated = await courtService.updateCourt(editingCourt.id, payload);
        setCourts(prev => prev.map(c => c.id === editingCourt.id ? updated : c));
        showToast('success', 'Cập nhật thông tin sân bãi thành công!');
      } else {
        const created = await courtService.registerCourt(payload);
        setCourts(prev => [created, ...prev]);
        showToast('success', 'Gửi đơn đăng ký sân mới thành công (Đang chờ duyệt)!');
      }
      setIsCourtModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi lưu thông tin sân bãi');
    }
  };

  // Simulator for quick status approvals
  const handleSimulateStatus = async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    try {
      const updated = await courtService.updateStatus(id, status);
      setCourts(prev => prev.map(c => c.id === id ? updated : c));
      showToast('success', `[Mô phỏng Admin] Đã cập nhật trạng thái sân thành ${
        status === 'APPROVED' ? 'Đã duyệt' : status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'
      }`);
    } catch (err) {
      showToast('error', 'Cập nhật giả lập thất bại');
    }
  };

  // Filter courts by query, sport, and venue
  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          court.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSport = selectedSport === 'ALL' || 
                         (selectedSport === 'BONG_DA' && court.sportName === 'Bóng đá') ||
                         (selectedSport === 'CAU_LONG' && court.sportName === 'Cầu lông') ||
                         (selectedSport === 'PICKLEBALL' && court.sportName === 'Pickleball') ||
                         (selectedSport === 'BONG_RO' && court.sportName === 'Bóng rổ');

    const matchesVenue = selectedVenueFilter === 'ALL' || court.venueId === selectedVenueFilter;

    return matchesSearch && matchesSport && matchesVenue;
  });

  // Calculate statistics
  const totalCount = courts.length;
  const approvedCount = courts.filter(c => c.status === 'APPROVED').length;
  const pendingCount = courts.filter(c => c.status === 'PENDING').length;
  const rejectedCount = courts.filter(c => c.status === 'REJECTED').length;

  // Dropdown options mapping
  const SPORT_FILTER_OPTIONS: DropdownOption[] = [
    { value: 'ALL', label: 'Tất cả môn thể thao' },
    { value: 'BONG_DA', label: 'Bóng đá' },
    { value: 'CAU_LONG', label: 'Cầu lông' },
    { value: 'PICKLEBALL', label: 'Pickleball' },
    { value: 'BONG_RO', label: 'Bóng rổ' }
  ];

  const venueFilterOptions: DropdownOption[] = [
    { value: 'ALL', label: 'Tất cả cụm sân' },
    ...venues.map(v => ({ value: v.id, label: v.name }))
  ];

  const SPORT_FORM_OPTIONS: DropdownOption[] = [
    { value: '1', label: 'Bóng đá' },
    { value: '2', label: 'Cầu lông' },
    { value: '3', label: 'Pickleball' },
    { value: '4', label: 'Bóng rổ' }
  ];

  const venueFormOptions: DropdownOption[] = venues.map(v => ({
    value: v.id,
    label: v.name
  }));

  return {
    courts,
    venues,
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
    setCourtDetailImages,
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
  };
};
