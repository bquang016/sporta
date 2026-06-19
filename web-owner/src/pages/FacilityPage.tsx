import React, { useState, useEffect, useRef } from 'react';
import { courtService } from '../services/courtService';
import type { CourtResponse, CourtRequest, VenueResponse } from '../services/courtService';
import { Dropdown } from '../components/ui/Dropdown';
import type { DropdownOption } from '../components/ui/Dropdown';
import { Modal } from '../components/ui/Modal';

export const FacilityPage = () => {
  // Data States
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
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const coverInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

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

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
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

  // Handle image upload from R2
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
    <div className="flex flex-col flex-1 min-h-0 relative font-sans animate-fadeIn">
      {/* Toast Banner */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-xs font-black text-white flex items-center gap-3 border border-white/10 select-none animate-fadeIn ${
            toast.type === 'success' ? 'bg-emerald-600 shadow-emerald-950/20' : 'bg-red-600 shadow-red-950/20'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {toast.message}
        </div>
      )}

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
      {showStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 select-none animate-fadeIn">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng số sân</p>
              <h3 className="text-2xl font-black text-slate-800">{totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Sân hoạt động</p>
              <h3 className="text-2xl font-black text-brand-emerald">{approvedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Đơn chờ duyệt</p>
              <h3 className="text-2xl font-black text-amber-500">{pendingCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">Bị từ chối duyệt</p>
              <h3 className="text-2xl font-black text-red-500">{rejectedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-650 rounded-3xl p-5 text-xs font-bold text-center mb-6">
          {error}
        </div>
      )}

      {/* LOADER */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold">Đang tải dữ liệu từ máy chủ...</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between select-none">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              {/* Search Bar */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 w-full sm:w-60 text-xs">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Tìm theo tên sân, địa chỉ..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-slate-700 font-semibold"
                />
              </div>

              {/* Custom Dropdown: Sport filter */}
              <Dropdown 
                options={SPORT_FILTER_OPTIONS}
                value={selectedSport}
                onChange={setSelectedSport}
                className="w-full sm:w-48"
              />

              {/* Custom Dropdown: Venue filter */}
              <Dropdown 
                options={venueFilterOptions}
                value={selectedVenueFilter}
                onChange={setSelectedVenueFilter}
                placeholder="Lọc theo cụm sân"
                className="w-full sm:w-48"
              />
            </div>

            {/* Register Action button */}
            <button 
              onClick={handleOpenCourtCreate}
              className="w-full md:w-auto bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap border-b-2 border-emerald-950"
            >
              <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Gửi đơn đăng ký sân mới
            </button>
          </div>

          {/* COURTS LIST GRID */}
          {filteredCourts.length === 0 ? (
            <div className="flex-1 bg-white border border-slate-200/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-sm select-none">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Không có sân bãi</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Không tìm thấy sân bãi nào phù hợp với bộ lọc tìm kiếm của bạn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pr-1">
              {filteredCourts.map(court => (
                <div 
                  key={court.id}
                  className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group relative h-[490px]"
                >
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden flex-shrink-0">
                    {court.coverImage ? (
                      <img 
                        src={court.coverImage} 
                        alt={court.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs uppercase bg-slate-50 select-none">
                        Không có ảnh bìa
                      </div>
                    )}
                    
                    <span className="absolute top-3 left-3 text-[9px] font-black uppercase bg-emerald-950 text-brand-yellow px-2 py-0.5 rounded-md border border-brand-yellow/15 shadow-sm">
                      {court.sportName}
                    </span>

                    <span className={`absolute top-3 right-3 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-sm border border-white/10 ${
                      court.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 
                      court.status === 'REJECTED' ? 'bg-red-655 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {court.status === 'APPROVED' ? 'Đã duyệt' : 
                       court.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-800 text-sm tracking-tight truncate" title={court.name}>{court.name}</h4>
                        {court.venueName && (
                          <span className="inline-block text-[9px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            {court.venueName}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold pt-1">
                          <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="truncate" title={court.location}>{court.location}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 select-none">
                        <div>
                          <span className="text-slate-400 font-bold block mb-0.5">Giờ mở cửa</span>
                          <span className="font-extrabold text-slate-700">{court.openingTime} - {court.closingTime}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block mb-0.5">Giá theo giờ</span>
                          <span className="font-extrabold text-brand-emerald">{formatVND(court.price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-2xl p-2 border border-dashed border-slate-250 flex flex-col gap-1.5 select-none">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Simulator duyệt (Dev)</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />
                        </div>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => handleSimulateStatus(court.id, 'APPROVED')}
                            className={`flex-1 py-1 rounded text-[9px] font-black cursor-pointer transition-all border ${court.status === 'APPROVED' ? 'bg-emerald-50 text-brand-emerald border-brand-emerald/20' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-150'}`}
                          >
                            Duyệt
                          </button>
                          <button 
                            onClick={() => handleSimulateStatus(court.id, 'PENDING')}
                            className={`flex-1 py-1 rounded text-[9px] font-black cursor-pointer transition-all border ${court.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-250' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-150'}`}
                          >
                            Chờ
                          </button>
                          <button 
                            onClick={() => handleSimulateStatus(court.id, 'REJECTED')}
                            className={`flex-1 py-1 rounded text-[9px] font-black cursor-pointer transition-all border ${court.status === 'REJECTED' ? 'bg-red-50 text-red-655 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-150'}`}
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>

                      {court.status === 'APPROVED' ? (
                        <button
                          onClick={() => handleOpenCourtDetail(court, false)}
                          className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11px] py-2.5 rounded-2xl active:scale-98 transition-all cursor-pointer border border-slate-200"
                        >
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Chỉnh sửa chi tiết
                        </button>
                      ) : court.status === 'PENDING' ? (
                        <button
                          onClick={() => handleOpenCourtDetail(court, true)}
                          className="w-full flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-[11px] py-2.5 rounded-2xl active:scale-98 transition-all cursor-pointer border border-amber-200"
                        >
                          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Xem đơn đăng ký
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenCourtDetail(court, true)}
                          className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-655 font-extrabold text-[11px] py-2.5 rounded-2xl active:scale-98 transition-all cursor-pointer border border-red-200"
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Xem lý do từ chối
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PORTAL-BASED MODAL: COURT DETAIL / CREATE / EDIT */}
      <Modal
        isOpen={isCourtModalOpen}
        onClose={() => setIsCourtModalOpen(false)}
        title={viewOnly ? 'Thông tin chi tiết đơn đăng ký' : editingCourt ? 'Chỉnh sửa thông tin sân bãi' : 'Đăng ký sân bãi mới'}
        maxWidth="lg"
        footer={
          <>
            <button 
              type="button" 
              onClick={() => setIsCourtModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
            >
              Đóng
            </button>
            {!viewOnly && (
              <button 
                type="button"
                onClick={() => handleSubmitCourt()}
                disabled={uploadingCover || uploadingDetail}
                className="bg-brand-yellow hover:bg-yellow-400 text-primary border-b-2 border-yellow-600 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 text-emerald-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {editingCourt ? 'Lưu thay đổi' : 'Gửi đơn đăng ký'}
              </button>
            )}
          </>
        }
      >
        <form onSubmit={(e) => handleSubmitCourt(e)} className="space-y-5">
          {/* WARNING REJECTION BANNER (Only in viewOnly, if rejected) */}
          {viewOnly && editingCourt?.status === 'REJECTED' && (
            <div className="bg-red-50 border-2 border-red-200 text-red-750 p-4 rounded-2xl flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-tight text-red-800">Đơn đăng ký bị từ chối bởi Admin</h4>
                <p className="text-[11px] font-bold leading-relaxed">
                  Lý do: "{editingCourt.rejectionReason || 'Không có lý do chi tiết từ admin.'}"
                </p>
                <p className="text-[9px] text-slate-500 font-semibold pt-1">
                  * Mẹo: Khi admin duyệt trực tiếp, bạn sẽ có thể gửi lại hoặc chỉnh sửa sau này.
                </p>
              </div>
            </div>
          )}

          {/* WARNING PENDING BANNER (Only in viewOnly, if pending) */}
          {viewOnly && editingCourt?.status === 'PENDING' && (
            <div className="bg-amber-50 border-2 border-amber-200 text-amber-700 p-4 rounded-2xl flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-tight text-amber-800">Đơn đăng ký đang chờ duyệt</h4>
                <p className="text-[11px] font-bold leading-relaxed">
                  Thông tin của đơn hiện không thể chỉnh sửa trong lúc đang đợi Admin phê duyệt. Bạn có thể xem lại nội dung đơn bên dưới.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Court Name */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Tên sân / cụm sân nhỏ <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="VD: Sân Bóng Mỹ Đình 1"
                value={courtName}
                disabled={viewOnly}
                onChange={(e) => setCourtName(e.target.value)}
                className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 ${
                  courtValidationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
                }`}
              />
              {courtValidationErrors.name && (
                <p className="text-[9px] text-red-500 font-bold">{courtValidationErrors.name}</p>
              )}
            </div>

            {/* Sport Selection (Custom Dropdown) */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Môn thể thao <span className="text-red-500">*</span>
              </label>
              <Dropdown 
                options={SPORT_FORM_OPTIONS}
                value={courtSportId}
                onChange={setCourtSportId}
                disabled={viewOnly}
                className="w-full"
              />
            </div>

            {/* Venue Selection (Custom Dropdown) */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Cụm sân trực thuộc <span className="text-red-500">*</span>
              </label>
              {venues.length === 0 ? (
                <div className="text-slate-400 font-bold text-xs p-2.5 border border-dashed border-red-200 rounded-xl bg-red-50/20 text-center">
                  Bạn chưa có cụm sân nào. Vui lòng tạo cụm sân trước!
                </div>
              ) : (
                <Dropdown 
                  options={venueFormOptions}
                  value={courtVenueId}
                  onChange={setCourtVenueId}
                  disabled={viewOnly}
                  placeholder="Chọn cụm sân"
                  className="w-full"
                />
              )}
              {courtValidationErrors.venueId && (
                <p className="text-[9px] text-red-500 font-bold">{courtValidationErrors.venueId}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Giá thuê theo giờ (VND/h) <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  value={courtPrice}
                  disabled={viewOnly}
                  onChange={(e) => setCourtPrice(e.target.value)}
                  className={`w-full text-xs font-bold text-slate-700 pl-3.5 pr-12 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 ${
                    courtValidationErrors.price ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
                  }`}
                  min={0}
                />
                <span className="absolute right-3.5 text-[10px] font-extrabold text-slate-400">VND/h</span>
              </div>
              {courtValidationErrors.price && (
                <p className="text-[9px] text-red-500 font-bold">{courtValidationErrors.price}</p>
              )}
              {courtPrice && !isNaN(parseFloat(courtPrice)) && (
                <p className="text-[9px] text-brand-emerald font-black">
                  Định dạng hiển thị: {formatVND(parseFloat(courtPrice))}
                </p>
              )}
            </div>

            {/* Smart Time picker dropdowns */}
            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                  Giờ mở cửa <span className="text-red-500">*</span>
                </label>
                <Dropdown 
                  options={TIME_OPTIONS}
                  value={courtOpeningTime}
                  onChange={setCourtOpeningTime}
                  disabled={viewOnly}
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                  Giờ đóng cửa <span className="text-red-500">*</span>
                </label>
                <Dropdown 
                  options={TIME_OPTIONS}
                  value={courtClosingTime}
                  onChange={setCourtClosingTime}
                  disabled={viewOnly}
                  className="w-full"
                />
              </div>
              {courtValidationErrors.time && (
                <p className="text-[9px] text-red-500 font-bold sm:col-span-2">{courtValidationErrors.time}</p>
              )}
            </div>

            {/* Location */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Vị trí / Địa chỉ sân cụ thể <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="VD: Sân số 2, Tầng 3, 15 Dịch Vọng Hậu, Cầu Giấy, Hà Nội"
                value={courtLocation}
                disabled={viewOnly}
                onChange={(e) => setCourtLocation(e.target.value)}
                className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 ${
                  courtValidationErrors.location ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
                }`}
              />
              {courtValidationErrors.location && (
                <p className="text-[9px] text-red-500 font-bold">{courtValidationErrors.location}</p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giới thiệu chi tiết sân</label>
              <textarea 
                placeholder="Giới thiệu về thảm đấu, kích thước, hệ thống lưới, đèn chiếu sáng..."
                value={courtDescription}
                disabled={viewOnly}
                onChange={(e) => setCourtDescription(e.target.value)}
                className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald h-16 resize-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* MEDIA SECTION */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Hình ảnh lưu trữ (Cloudflare R2)</h4>
            
            {/* 1. Cover Image */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Ảnh bìa sân bãi</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="h-28 w-44 bg-slate-50 border border-dashed border-slate-250 rounded-2xl overflow-hidden relative flex-shrink-0 flex items-center justify-center text-slate-300 font-bold text-[10px] uppercase">
                  {courtCoverImage ? (
                    <img src={courtCoverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>Xem trước</span>
                  )}
                  {uploadingCover && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {!viewOnly && (
                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Hoặc dán liên kết ảnh trực tiếp..."
                        value={courtCoverImage}
                        onChange={(e) => setCourtCoverImage(e.target.value)}
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
                        Chọn tệp
                      </button>
                    </div>
                    <p className="text-[8.5px] text-slate-400 font-semibold leading-relaxed">
                      Ảnh bìa sân sẽ tự động phân loại lưu vào thư mục <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-black text-slate-600">courts/covers/</code>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Detail Images */}
            <div className="space-y-2 pt-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Ảnh chi tiết tổng quan</label>
              <div className="space-y-3">
                {!viewOnly && (
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
                      {uploadingDetail ? (
                        <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                        </svg>
                      )}
                      Chọn tải thêm ảnh
                    </button>
                    <span className="text-[9px] text-slate-400 font-semibold flex items-center">
                      Lưu trữ tại R2 folder <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-black mx-1">courts/details/</code>
                    </span>
                  </div>
                )}

                {courtDetailImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                    {courtDetailImages.map((imgUrl, index) => (
                      <div key={index} className="aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden relative">
                        <img src={imgUrl} alt={`Detail ${index}`} className="w-full h-full object-cover" />
                        {!viewOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDetailImage(index)}
                            className="absolute top-1.5 right-1.5 bg-red-650 hover:bg-red-850 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md cursor-pointer"
                            title="Xóa ảnh"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
