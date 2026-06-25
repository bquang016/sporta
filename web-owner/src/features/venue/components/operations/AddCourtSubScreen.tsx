import React, { useRef } from 'react';
import { Dropdown } from '../../../../components/ui/Dropdown';
import type { DropdownOption } from '../../../../components/ui/Dropdown';

interface AddCourtSubScreenProps {
  onClose: () => void;
  onSubmit: () => void;
  name: string;
  setName: (val: string) => void;
  sportId: string;
  setSportId: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  openingTime: string;
  setOpeningTime: (val: string) => void;
  closingTime: string;
  setClosingTime: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  coverImage: string;
  setCoverImage: (val: string) => void;
  detailImages: string[];
  termsAccepted: boolean;
  setTermsAccepted: (val: boolean) => void;
  onOpenTerms: () => void;
  uploadingCover: boolean;
  uploadingDetail: boolean;
  validationErrors: Record<string, string>;
  TIME_OPTIONS: DropdownOption[];
  SPORT_OPTIONS: DropdownOption[];
  onUploadCover: (file: File) => void;
  onUploadDetail: (files: FileList) => void;
  onRemoveDetailImage: (index: number) => void;
  formatVND: (amount: number) => string;
}

export const AddCourtSubScreen = ({
  onClose,
  onSubmit,
  name,
  setName,
  sportId,
  setSportId,
  price,
  setPrice,
  openingTime,
  setOpeningTime,
  closingTime,
  setClosingTime,
  location,
  setLocation,
  description,
  setDescription,
  coverImage,
  setCoverImage,
  detailImages,
  termsAccepted,
  setTermsAccepted,
  onOpenTerms,
  uploadingCover,
  uploadingDetail,
  validationErrors,
  TIME_OPTIONS,
  SPORT_OPTIONS,
  onUploadCover,
  onUploadDetail,
  onRemoveDetailImage,
  formatVND,
}: AddCourtSubScreenProps) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCover(file);
    }
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUploadDetail(files);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 flex flex-col min-w-0 font-sans animate-fadeIn">
      {/* Sub-Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6 flex-shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-black rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <div>
            <h1 className="text-base font-black text-slate-800 uppercase tracking-tight">Thêm sân mới</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Gửi đơn đề xuất phê duyệt sân mới lên Admin</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto pr-1 space-y-6 matrix-scroll">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Court Name */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
              Tên sân thi đấu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Sân bóng rổ 3x3 số 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 ${
                validationErrors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
              }`}
            />
            {validationErrors.name && (
              <p className="text-[9px] text-red-500 font-bold">{validationErrors.name}</p>
            )}
          </div>

          {/* Sport Selector */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
              Môn thể thao <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={SPORT_OPTIONS}
              value={sportId}
              onChange={setSportId}
              placeholder="Chọn môn thể thao"
              className="w-full"
            />
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
              Giá thuê theo giờ (VND/h) <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                placeholder="VD: 150000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full text-xs font-bold text-slate-700 pl-3.5 pr-12 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 ${
                  validationErrors.price
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
                }`}
                min={0}
              />
              <span className="absolute right-3.5 text-[10px] font-extrabold text-slate-400">VND/h</span>
            </div>
            {validationErrors.price && (
              <p className="text-[9px] text-red-500 font-bold">{validationErrors.price}</p>
            )}
            {price && !isNaN(parseFloat(price)) && (
              <p className="text-[9px] text-brand-emerald font-black">
                Quy đổi hiển thị: {formatVND(parseFloat(price))}
              </p>
            )}
          </div>

          {/* Smart Time picker dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Giờ mở cửa <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={TIME_OPTIONS}
                value={openingTime}
                onChange={setOpeningTime}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                Giờ đóng cửa <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={TIME_OPTIONS}
                value={closingTime}
                onChange={setClosingTime}
                className="w-full"
              />
            </div>
            {validationErrors.time && (
              <p className="text-[9px] text-red-500 font-bold col-span-2">{validationErrors.time}</p>
            )}
          </div>

          {/* Location */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
              Vị trí / Địa chỉ chi tiết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Sân trong nhà số 1, 15 Dịch Vọng Hậu, Cầu Giấy, Hà Nội"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 ${
                validationErrors.location
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
              }`}
            />
            {validationErrors.location && (
              <p className="text-[9px] text-red-500 font-bold">{validationErrors.location}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giới thiệu chi tiết sân</label>
            <textarea
              placeholder="Mô tả chất lượng cỏ/thảm đấu, hệ thống lưới, đèn chiếu sáng, tiện ích đi kèm..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald h-16 resize-none"
            />
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Hình ảnh lưu trữ sân</h4>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
              Ảnh bìa sân bãi <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="h-28 w-44 bg-slate-50 border border-dashed border-slate-200 rounded-2xl overflow-hidden relative flex-shrink-0 flex items-center justify-center text-slate-300 font-bold text-[10px] uppercase">
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
                  <input
                    type="text"
                    placeholder="Dán liên kết ảnh trực tiếp hoặc chọn tải ảnh..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className={`flex-1 text-xs font-bold text-slate-650 px-3.5 py-2 rounded-xl border bg-slate-50/50 ${
                      validationErrors.coverImage ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={coverInputRef}
                    onChange={handleCoverChange}
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
                {validationErrors.coverImage && (
                  <p className="text-[9px] text-red-500 font-bold">{validationErrors.coverImage}</p>
                )}
                <p className="text-[8.5px] text-slate-400 font-semibold leading-relaxed">
                  Định dạng ảnh khuyên dùng: JPG, PNG. Kích thước tối đa 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Detail Images */}
          <div className="space-y-2 pt-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
              Ảnh chi tiết tổng quan (tùy chọn)
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={detailInputRef}
                  onChange={handleDetailChange}
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
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                    </svg>
                  )}
                  Tải thêm ảnh chi tiết
                </button>
              </div>

              {detailImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                  {detailImages.map((imgUrl, index) => (
                    <div key={index} className="aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden relative">
                      <img src={imgUrl} alt={`Detail ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => onRemoveDetailImage(index)}
                        className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md cursor-pointer transition-all"
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

        {/* Terms and Conditions Checkbox */}
        <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 rounded text-brand-emerald border-slate-300 focus:ring-brand-emerald cursor-pointer"
            />
            <label htmlFor="terms-checkbox" className="text-xs text-slate-650 font-bold select-none cursor-pointer">
              Tôi đồng ý với{' '}
              <button
                type="button"
                onClick={onOpenTerms}
                className="text-brand-emerald hover:underline font-black focus:outline-none"
              >
                Chính sách & Điều kiện/Điều khoản
              </button>{' '}
              của hệ thống Sporta.
            </label>
          </div>
          {validationErrors.terms && (
            <p className="text-[9px] text-red-500 font-bold pl-6">{validationErrors.terms}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex justify-end gap-3 select-none">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
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
            Gửi đơn đăng ký
          </button>
        </div>
      </form>
    </div>
  );
};
