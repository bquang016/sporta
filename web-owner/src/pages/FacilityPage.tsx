import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { courtService, CourtResponse, CourtRequest } from '../services/courtService';

export const FacilityPage = () => {
  const isMobile = useIsMobile();
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<CourtResponse | null>(null);
  
  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(100000);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [location, setLocation] = useState('');
  const [sportId, setSportId] = useState<number>(1);
  const [detailImages, setDetailImages] = useState<string[]>([]);

  // File Upload State Indicators
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingDetail, setUploadingDetail] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  // Fetch Courts on mount
  const fetchCourts = async () => {
    try {
      setLoading(true);
      const data = await courtService.getCourts();
      setCourts(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Không thể kết nối API. Vui lòng kiểm tra kết nối hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingCourt(null);
    setName('');
    setPrice(100000);
    setDescription('');
    setCoverImage('');
    setOpeningTime('06:00');
    setClosingTime('22:00');
    setLocation('');
    setSportId(1);
    setDetailImages([]);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (court: CourtResponse) => {
    setEditingCourt(court);
    setName(court.name);
    setPrice(court.price);
    setDescription(court.description || '');
    setCoverImage(court.coverImage || '');
    setOpeningTime(court.openingTime);
    setClosingTime(court.closingTime);
    setLocation(court.location);
    setSportId(court.sportId);
    setDetailImages(court.detailImages.map(img => img.imageUrl));
    setIsModalOpen(true);
  };

  // Handle Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const url = await courtService.uploadImage(file, 'court_cover');
      setCoverImage(url);
      showToast('success', 'Tải ảnh bìa lên R2 thành công!');
    } catch (err: any) {
      showToast('error', 'Lỗi tải ảnh lên R2');
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle Detail Images Upload (Multiple)
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
      setDetailImages(prev => [...prev, ...uploadedUrls]);
      showToast('success', `Tải thành công ${files.length} ảnh lên R2!`);
    } catch (err: any) {
      showToast('error', 'Lỗi tải một số ảnh chi tiết');
    } finally {
      setUploadingDetail(false);
    }
  };

  const handleRemoveDetailImage = (indexToRemove: number) => {
    setDetailImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !openingTime || !closingTime || !location) {
      showToast('error', 'Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    const payload: CourtRequest = {
      name,
      price,
      description,
      coverImage,
      openingTime,
      closingTime,
      location,
      sportId,
      detailImages
    };

    try {
      if (editingCourt) {
        // Update
        const updated = await courtService.updateCourt(editingCourt.id, payload);
        setCourts(prev => prev.map(c => c.id === editingCourt.id ? updated : c));
        showToast('success', 'Cập nhật thông tin sân bãi thành công!');
      } else {
        // Create
        const created = await courtService.registerCourt(payload);
        setCourts(prev => [created, ...prev]);
        showToast('success', 'Gửi đơn đăng ký sân mới thành công (Đang chờ duyệt)!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi lưu thông tin sân bãi');
    }
  };

  // Admin status simulation
  const handleSimulateStatus = async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    try {
      const updated = await courtService.updateStatus(id, status);
      setCourts(prev => prev.map(c => c.id === id ? updated : c));
      showToast('success', `[Mô phỏng Admin] Đã cập nhật trạng thái sân thành ${status === 'APPROVED' ? 'Đã duyệt' : status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}`);
    } catch (err) {
      showToast('error', 'Không thể cập nhật trạng thái giả lập');
    }
  };

  // Filter courts list
  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          court.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSport = selectedSport === 'ALL' || 
                         (selectedSport === 'BONG_DA' && court.sportName === 'Bóng đá') ||
                         (selectedSport === 'CAU_LONG' && court.sportName === 'Cầu lông') ||
                         (selectedSport === 'PICKLEBALL' && court.sportName === 'Pickleball') ||
                         (selectedSport === 'BONG_RO' && court.sportName === 'Bóng rổ');

    return matchesSearch && matchesSport;
  });

  // Calculate statistics
  const totalCount = courts.length;
  const approvedCount = courts.filter(c => c.status === 'APPROVED').length;
  const pendingCount = courts.filter(c => c.status === 'PENDING').length;
  const rejectedCount = courts.filter(c => c.status === 'REJECTED').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 relative font-sans animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-xs font-black text-white flex items-center gap-3 border border-white/10 select-none animate-fadeIn ${
            toast.type === 'success' 
              ? 'bg-emerald-600 shadow-emerald-950/20' 
              : 'bg-red-600 shadow-red-950/20'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {toast.message}
        </div>
      )}

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 select-none">
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
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Đang hoạt động</p>
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
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Đang chờ duyệt</p>
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
            <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">Từ chối duyệt</p>
            <h3 className="text-2xl font-black text-red-500">{rejectedCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* FILTER BAR & ACTION */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between select-none">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 w-full sm:w-64 text-xs">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên sân, vị trí..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-slate-700 font-semibold"
            />
          </div>

          {/* Sport Filters */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold border border-slate-200/60 overflow-x-auto max-w-full">
            <button 
              onClick={() => setSelectedSport('ALL')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all ${selectedSport === 'ALL' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setSelectedSport('BONG_DA')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all ${selectedSport === 'BONG_DA' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Bóng đá
            </button>
            <button 
              onClick={() => setSelectedSport('CAU_LONG')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all ${selectedSport === 'CAU_LONG' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Cầu lông
            </button>
            <button 
              onClick={() => setSelectedSport('PICKLEBALL')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all ${selectedSport === 'PICKLEBALL' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Pickleball
            </button>
            <button 
              onClick={() => setSelectedSport('BONG_RO')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all ${selectedSport === 'BONG_RO' ? 'bg-brand-emerald text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Bóng rổ
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleOpenCreateModal}
          className="w-full md:w-auto bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap border-b-2 border-emerald-950"
        >
          <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Gửi đơn đăng ký sân mới
        </button>
      </div>

      {/* ERROR MESSAGE IF ANY */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-3xl p-5 text-xs font-bold text-center mb-6">
          {error}
        </div>
      )}

      {/* LOADER */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold">Đang tải dữ liệu từ Cloudflare R2...</p>
        </div>
      ) : filteredCourts.length === 0 ? (
        <div className="flex-1 bg-white border border-slate-200/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-sm select-none">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 13.5a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Không tìm thấy sân bãi</h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Chưa có cơ sở nào khớp với bộ lọc hoặc tài khoản của bạn chưa đăng ký sân nào. Hãy tạo đơn đăng ký mới!
          </p>
        </div>
      ) : (
        /* COURT GRID LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-1">
          {filteredCourts.map(court => (
            <div 
              key={court.id}
              className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group relative"
            >
              {/* Cover Image */}
              <div className="h-48 w-full bg-slate-100 relative overflow-hidden flex-shrink-0">
                {court.coverImage ? (
                  <img 
                    src={court.coverImage} 
                    alt={court.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs uppercase bg-slate-50 select-none">
                    Chưa có ảnh bìa
                  </div>
                )}
                
                {/* Sport Badge */}
                <span className="absolute top-3 left-3 text-[9px] font-black uppercase bg-emerald-950 text-brand-yellow px-2 py-0.5 rounded-md border border-brand-yellow/15 shadow-sm">
                  {court.sportName}
                </span>

                {/* Status Badge */}
                <span className={`absolute top-3 right-3 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-sm border border-white/10 ${
                  court.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 
                  court.status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {court.status === 'APPROVED' ? 'Đã duyệt' : 
                   court.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                </span>
              </div>

              {/* Court Details */}
              <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="space-y-1">
                  <h4 className="font-black text-slate-800 text-sm tracking-tight truncate" title={court.name}>{court.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
                    <span className="font-extrabold text-brand-emerald">{formatCurrency(court.price)}</span>
                  </div>
                </div>

                {court.description && (
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 italic font-semibold">
                    "{court.description}"
                  </p>
                )}

                {/* Images count info */}
                {court.detailImages.length > 0 && (
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[10px] text-slate-400 font-bold">Ảnh chi tiết ({court.detailImages.length}):</span>
                    <div className="flex gap-1 overflow-hidden">
                      {court.detailImages.slice(0, 4).map((img, idx) => (
                        <div key={img.id || idx} className="w-6 h-6 rounded border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-50">
                          <img src={img.imageUrl} alt="detail" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {court.detailImages.length > 4 && (
                        <div className="w-6 h-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-black border border-slate-200">
                          +{court.detailImages.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="h-px bg-slate-100 my-1" />

                {/* Simulation Panel for Developer testing (Right at bottom of card) */}
                <div className="bg-slate-50 rounded-2xl p-2 border border-dashed border-slate-250 flex flex-col gap-1.5 select-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Simulator duyệt (Dev)</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-ping" />
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
                      className={`flex-1 py-1 rounded text-[9px] font-black cursor-pointer transition-all border ${court.status === 'REJECTED' ? 'bg-red-50 text-red-650 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-150'}`}
                    >
                      Từ chối
                    </button>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEditModal(court)}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11px] py-2.5 rounded-2xl active:scale-98 transition-all cursor-pointer"
                >
                  <svg className="w-4.5 h-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Chỉnh sửa chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none animate-fadeIn">
          {/* Modal Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

          {/* Modal Content */}
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl relative z-10 flex flex-col animate-scaleIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  {editingCourt ? 'Chỉnh sửa thông tin sân bãi' : 'Gửi đơn đăng ký sân bãi mới'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  {editingCourt ? 'Thông tin thay đổi sẽ lưu trực tiếp vào R2' : 'Sân đăng ký mới sẽ ở trạng thái chờ Admin duyệt.'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 matrix-scroll">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Tên sân / cụm sân *</label>
                  <input 
                    type="text" 
                    placeholder="VD: Cụm Sân Pickleball Sporta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
                    required
                  />
                </div>

                {/* Sport selection */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Môn thể thao *</label>
                  <select
                    value={sportId}
                    onChange={(e) => setSportId(parseInt(e.target.value))}
                    className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
                  >
                    <option value={1}>Bóng đá</option>
                    <option value={2}>Cầu lông</option>
                    <option value={3}>Pickleball</option>
                    <option value={4}>Bóng rổ</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giá thuê theo giờ (VND/h) *</label>
                  <input 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value))}
                    className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
                    min={0}
                    required
                  />
                </div>

                {/* Hours Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giờ mở cửa *</label>
                    <input 
                      type="text" 
                      placeholder="06:00"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-center"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giờ đóng cửa *</label>
                    <input 
                      type="text" 
                      placeholder="22:00"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-center"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Vị trí / Địa chỉ *</label>
                  <input 
                    type="text" 
                    placeholder="VD: 15 Dịch Vọng Hậu, Cầu Giấy, Hà Nội"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
                    required
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giới thiệu giới thiệu chi tiết</label>
                  <textarea 
                    placeholder="Giới thiệu về cơ sở vật chất, dịch vụ đi kèm..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald h-20 resize-none"
                  />
                </div>
              </div>

              {/* MEDIA SECTION (R2 Integration) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Quản lý hình ảnh (Tải lên Cloudflare R2)</h4>
                
                {/* 1. Cover Image Upload */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Ảnh bìa đại diện (Hiển thị trang chủ)</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="h-28 w-44 bg-slate-50 border border-dashed border-slate-250 rounded-2xl overflow-hidden relative flex-shrink-0 flex items-center justify-center select-none text-slate-350 font-bold text-[10px] uppercase">
                      {coverImage ? (
                        <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
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
                        {/* URL input */}
                        <input 
                          type="text" 
                          placeholder="Hoặc nhập liên kết ảnh trực tiếp..."
                          value={coverImage}
                          onChange={(e) => setCoverImage(e.target.value)}
                          className="flex-1 text-xs font-bold text-slate-600 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                        />
                        {/* File Upload Hidden Trigger */}
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
                      <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                        Tải tệp ảnh để lưu tự động vào thư mục <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-black">courts/covers/</code> trên Cloudflare R2.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Detail Images Upload (Multiple) */}
                <div className="space-y-2 pt-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Ảnh tổng quan chi tiết (Một sân có nhiều ảnh)</label>
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
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-extrabold text-[10px] px-4 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {uploadingDetail ? (
                          <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                        Tải lên nhiều ảnh chi tiết
                      </button>
                      <span className="text-[9px] text-slate-400 font-semibold flex items-center">
                        Tải ảnh chi tiết vào thư mục <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-black mx-1">courts/details/</code>
                      </span>
                    </div>

                    {/* Previews grid */}
                    {detailImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                        {detailImages.map((imgUrl, index) => (
                          <div key={index} className="aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden relative group">
                            <img src={imgUrl} alt={`Detail ${index}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveDetailImage(index)}
                              className="absolute top-1.5 right-1.5 bg-red-650 hover:bg-red-800 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md opacity-90 transition-colors cursor-pointer"
                              title="Xóa ảnh"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-6 border-t border-slate-150 flex justify-end gap-3 bg-white">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={uploadingCover || uploadingDetail}
                  className="bg-brand-yellow hover:bg-yellow-400 text-primary border-b-2 border-yellow-600 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 text-emerald-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {editingCourt ? 'Lưu thay đổi' : 'Gửi đơn đăng ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
