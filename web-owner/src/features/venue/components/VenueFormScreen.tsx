import React, { useRef } from 'react';
import { LocationPickerMap } from './LocationPickerMap';
import { Dropdown } from '../../../components/ui/Dropdown';

interface VenueFormScreenProps {
  onClose: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  title: string;
  name: string;
  setName: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  latitude?: number;
  setLatitude?: (val: number) => void;
  longitude?: number;
  setLongitude?: (val: number) => void;
  description: string;
  setDescription: (val: string) => void;
  openingTime: string;
  setOpeningTime: (val: string) => void;
  closingTime: string;
  setClosingTime: (val: string) => void;
  shiftDurationMinutes: number;
  setShiftDurationMinutes: (val: number) => void;
  sportId: string;
  setSportId: (val: string) => void;
  coverImage: string;
  setCoverImage: (val: string) => void;
  detailImages: string[];
  
  // PROPS MỚI: Dành cho Phụ thu
  hasSurcharge: boolean;
  setHasSurcharge: (val: boolean) => void;
  surchargeAmount?: number;
  setSurchargeAmount: (val: number | undefined) => void;
  surchargeDescription: string;
  setSurchargeDescription: (val: string) => void;
  hasPendingRevision?: boolean;

  uploadingCover: boolean;
  uploadingDetail: boolean;
  onUploadCover: (file: File) => void;
  onUploadDetail: (files: FileList) => void;
  onRemoveDetailImage: (index: number) => void;
  validationErrors?: Record<string, string>;
  submitLabel: string;
}

export const VenueFormScreen = ({
  onClose,
  onSubmit,
  title,
  name,
  setName,
  location,
  setLocation,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  description,
  setDescription,
  openingTime,
  setOpeningTime,
  closingTime,
  setClosingTime,
  shiftDurationMinutes,
  setShiftDurationMinutes,
  sportId,
  setSportId,
  coverImage,
  setCoverImage,
  detailImages,
  hasSurcharge,
  setHasSurcharge,
  surchargeAmount,
  setSurchargeAmount,
  surchargeDescription,
  setSurchargeDescription,
  uploadingCover,
  uploadingDetail,
  onUploadCover,
  onUploadDetail,
  onRemoveDetailImage,
  validationErrors = {},
  submitLabel,
  hasPendingRevision
}: VenueFormScreenProps) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, '0');
    const minutes = (i % 2 === 0 ? '00' : '30');
    return `${hours}:${minutes}`;
  });
  const hourDropdownOptions = TIME_OPTIONS.map(t => ({ value: t, label: t }));

  const SPORT_OPTIONS = [
    { value: '1', label: 'Bóng đá' },
    { value: '2', label: 'Cầu lông' },
    { value: '3', label: 'Pickleball' },
    { value: '4', label: 'Bóng rổ' }
  ];

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadCover(file);
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) onUploadDetail(files);
  };

  const getDurationWarning = (): string | null => {
    if (!openingTime || !closingTime || !shiftDurationMinutes) return null;
    try {
      const [openH, openM] = openingTime.split(':').map(Number);
      const [closeH, closeM] = closingTime.split(':').map(Number);
      if (isNaN(openH) || isNaN(openM) || isNaN(closeH) || isNaN(closeM)) return null;

      let totalMin = (closeH * 60 + closeM) - (openH * 60 + openM);
      if (totalMin <= 0) {
        totalMin += 24 * 60;
      }

      if (totalMin % shiftDurationMinutes !== 0) {
        return 'Cảnh báo: Thời gian đóng/mở cửa không khớp với thời lượng ca, sẽ có ca bị dư/thiếu giờ';
      }
    } catch (e) {
      // ignore
    }
    return null;
  };
  const durationWarning = getDurationWarning();

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 font-sans z-10 animate-fadeIn">
      {/* ── TOP HEADER BAR ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between shadow-xs z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 hover:text-slate-800 text-xs font-black rounded-xl border border-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>

          <div className="hidden sm:block w-px h-5 bg-slate-200" />

          <div className="hidden sm:block">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vận hành cụm sân</p>
            <h1 className="text-sm font-black text-slate-800 leading-tight">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onSubmit()}
            disabled={uploadingCover || uploadingDetail}
            className="bg-brand-emerald hover:bg-emerald-900 text-white font-extrabold text-xs px-5 py-2 rounded-xl active:scale-95 transition-all cursor-pointer border-b-2 border-emerald-950 disabled:opacity-60 flex items-center gap-1.5"
          >
            {(uploadingCover || uploadingDetail) && (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {submitLabel}
          </button>
        </div>
      </div>

      {/* ── MAIN BODY: LEFT FORM + RIGHT MAP ─────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* LEFT: Scrollable Form Panel */}
        <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col bg-white border-r border-slate-200 overflow-hidden relative">
          <div className="flex-shrink-0 px-6 pt-5 pb-3 border-b border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thông tin cụm sân</p>
          </div>
          
          {hasPendingRevision && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-2.5">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-xs font-bold text-amber-800">Yêu cầu thay đổi thông tin đang chờ duyệt!</p>
                <p className="text-[10px] text-amber-700 mt-1 leading-relaxed">Bạn đang có yêu cầu thay đổi Tên hoặc Địa chỉ sân chờ Admin phê duyệt. Trong thời gian này, nếu bạn tiếp tục sửa Tên/Địa chỉ thì yêu cầu mới sẽ <b>ghi đè</b> yêu cầu cũ. Hệ thống vẫn hiển thị thông tin cũ cho khách hàng đặt sân.</p>
              </div>
            </div>
          )}

          <form
            onSubmit={e => { e.preventDefault(); onSubmit(e); }}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5 matrix-scroll"
          >
            {/* ① Tên cụm sân */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Tên cụm sân <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Cụm Sân Thể Thao Cầu Giấy"
                value={name}
                onChange={e => setName(e.target.value)}
                className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.name
                    ? 'border-red-400 focus:ring-red-100'
                    : 'border-slate-200 focus:ring-emerald-100 focus:border-brand-emerald'
                }`}
              />
              {validationErrors.name && (
                <p className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                  <span>⚠</span> {validationErrors.name}
                </p>
              )}
            </div>

            {/* ② Môn thể thao */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Môn thể thao chính <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={SPORT_OPTIONS}
                value={sportId}
                onChange={setSportId}
                placeholder="Chọn môn thể thao chính"
                className="w-full"
              />
            </div>

            {/* ③ Giờ mở / đóng cửa */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                Thời gian hoạt động
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block">Mở cửa</span>
                  <Dropdown
                    options={hourDropdownOptions}
                    value={openingTime}
                    onChange={setOpeningTime}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 block">Đóng cửa</span>
                  <Dropdown
                    options={hourDropdownOptions}
                    value={closingTime}
                    onChange={setClosingTime}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* ③.5 Thời lượng ca */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Thời lượng ca (phút) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                placeholder="VD: 30"
                value={shiftDurationMinutes || ''}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setShiftDurationMinutes(isNaN(val) ? 30 : val);
                }}
                className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-emerald transition-all"
              />
              {durationWarning && (
                <p className="text-[10px] text-amber-600 font-bold flex items-start gap-1 bg-amber-50 border border-amber-100 p-2 rounded-lg leading-normal mt-1 animate-fadeIn">
                  <span className="mt-0.5 flex-shrink-0">⚠</span>
                  <span>{durationWarning}</span>
                </p>
              )}
            </div>

            {/* ④ Địa chỉ */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Địa chỉ cụm sân <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Chọn vị trí từ bản đồ hoặc nhập thủ công..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className={`w-full text-xs font-bold text-slate-700 pl-9 pr-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.location
                      ? 'border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:ring-emerald-100 focus:border-brand-emerald'
                  }`}
                />
                <svg className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {validationErrors.location && (
                <p className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                  <span>⚠</span> {validationErrors.location}
                </p>
              )}
              {location && (
                <p className="text-[9px] text-slate-450 font-bold bg-slate-50 border border-slate-150 px-2.5 py-1.5 rounded-lg flex items-start gap-1 leading-relaxed">
                  <svg className="w-2.5 h-2.5 text-brand-emerald flex-shrink-0 mt-px" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {location}
                </p>
              )}
            </div>

            {/* ⑤ Mô tả */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                Giới thiệu & Tiện ích
              </label>
              <textarea
                placeholder="Mô tả các dịch vụ, tiện ích, bãi đậu xe, phòng tắm, trà nước..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-emerald-100 h-20 resize-none transition-all"
              />
            </div>

            {/* ⑥ Phụ thu (Tính năng mới) */}
            <div className="space-y-3 pt-3 pb-2 border-t border-b border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={hasSurcharge}
                    onChange={(e) => setHasSurcharge(e.target.checked)}
                    className="w-4 h-4 text-brand-emerald rounded border-slate-300 focus:ring-brand-emerald cursor-pointer"
                  />
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider group-hover:text-slate-800 transition-colors">
                  Áp dụng Phụ thu chung (VD: Trà đá, Dọn dẹp...)
                </span>
              </label>

              {hasSurcharge && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                      Số tiền phụ thu (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="VD: 20000"
                      value={surchargeAmount || ''}
                      onChange={(e) => setSurchargeAmount(Number(e.target.value))}
                      className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-emerald-100 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                      Mô tả phụ thu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Phí dọn dẹp sân bãi"
                      value={surchargeDescription}
                      onChange={(e) => setSurchargeDescription(e.target.value)}
                      className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-emerald-100 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ⑦ Ảnh bìa */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                Ảnh bìa cụm sân
              </label>
              <div className="flex gap-4 items-start">
                <div className="w-28 h-20 bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-5 h-5 text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {uploadingCover && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Dán URL ảnh bìa..."
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    className="w-full text-xs font-bold text-slate-650 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-emerald-100"
                  />
                  <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverChange} className="hidden" />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="w-full flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-brand-emerald border border-emerald-150 font-extrabold text-[9px] px-3 py-2 rounded-xl active:scale-95 transition-all cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Tải ảnh lên từ máy
                  </button>
                </div>
              </div>
            </div>

            {/* ⑧ Ảnh chi tiết */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Ảnh chi tiết
                </label>
                <span className="text-[9px] text-slate-400 font-bold">{detailImages.length} ảnh</span>
              </div>

              <input type="file" accept="image/*" multiple ref={detailInputRef} onChange={handleDetailChange} className="hidden" />
              <button
                type="button"
                onClick={() => detailInputRef.current?.click()}
                disabled={uploadingDetail}
                className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-150 text-slate-600 border border-slate-200 font-extrabold text-[9px] px-3.5 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                {uploadingDetail ? (
                  <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5 text-slate-450" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                Thêm ảnh chi tiết
              </button>

              {detailImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {detailImages.map((imgUrl, index) => (
                    <div key={index} className="aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden relative group">
                      <img src={imgUrl} alt={`Detail ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => onRemoveDetailImage(index)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-8" />
          </form>
        </div>

        {/* RIGHT: Sticky Full-height Map Panel */}
        <div className="hidden lg:flex flex-col flex-1 relative bg-slate-100">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200/80 flex items-center gap-1.5 pointer-events-none">
            <svg className="w-3 h-3 text-brand-emerald" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Chọn vị trí trên bản đồ</span>
          </div>

          <LocationPickerMap
            fullHeight
            initialLocation={{ lat: latitude || 0, lng: longitude || 0 }}
            initialAddress={location}
            onChange={(data) => {
              setLocation(data.address);
              if (setLatitude) setLatitude(data.lat);
              if (setLongitude) setLongitude(data.lng);
            }}
          />
        </div>
      </div>

      <div className="lg:hidden flex-shrink-0 bg-amber-50 border-t border-amber-200 px-5 py-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <p className="text-[10px] font-bold text-amber-700">Nhập địa chỉ ở trường "Địa chỉ cụm sân" phía trên. Bản đồ có thể xem trên màn hình rộng hơn.</p>
      </div>
    </div>
  );
};