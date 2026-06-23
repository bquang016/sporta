import React, { useRef } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Dropdown } from '../../../components/ui/Dropdown';
import type { DropdownOption } from '../../../components/ui/Dropdown';
import type { CourtResponse } from '../types';

interface FacilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  viewOnly: boolean;
  editingCourt: CourtResponse | null;
  name: string;
  setName: (val: string) => void;
  sportId: string;
  setSportId: (val: string) => void;
  venueId: string;
  setVenueId: (val: string) => void;
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
  uploadingCover: boolean;
  uploadingDetail: boolean;
  validationErrors: Record<string, string>;
  TIME_OPTIONS: DropdownOption[];
  SPORT_FORM_OPTIONS: DropdownOption[];
  venueFormOptions: DropdownOption[];
  onUploadCover: (file: File) => void;
  onUploadDetail: (files: FileList) => void;
  onRemoveDetailImage: (index: number) => void;
  formatVND: (amount: number) => string;
}

export const FacilityFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  viewOnly,
  editingCourt,
  name,
  setName,
  sportId,
  setSportId,
  venueId,
  setVenueId,
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
  uploadingCover,
  uploadingDetail,
  validationErrors,
  TIME_OPTIONS,
  SPORT_FORM_OPTIONS,
  venueFormOptions,
  onUploadCover,
  onUploadDetail,
  onRemoveDetailImage,
  formatVND
}: FacilityFormModalProps) => {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={viewOnly ? 'Thông tin chi tiết đơn đăng ký' : editingCourt ? 'Chỉnh sửa thông tin sân bãi' : 'Đăng ký sân bãi mới'}
      maxWidth="lg"
      footer={
        <>
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
          >
            Đóng
          </button>
          {!viewOnly && (
            <button 
              type="button"
              onClick={() => onSubmit()}
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
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(e); }} className="space-y-5">
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
              value={name}
              disabled={viewOnly}
              onChange={(e) => setName(e.target.value)}
              className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 ${
                validationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
              }`}
            />
            {validationErrors.name && (
              <p className="text-[9px] text-red-500 font-bold">{validationErrors.name}</p>
            )}
          </div>

          {/* Sport Selection (Custom Dropdown) */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
              Môn thể thao <span className="text-red-500">*</span>
            </label>
            <Dropdown 
              options={SPORT_FORM_OPTIONS}
              value={sportId}
              onChange={setSportId}
              disabled={viewOnly}
              className="w-full"
            />
          </div>

          {/* Venue Selection (Custom Dropdown) */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
              Cụm sân trực thuộc <span className="text-red-500">*</span>
            </label>
            {venueFormOptions.length === 0 ? (
              <div className="text-slate-400 font-bold text-xs p-2.5 border border-dashed border-red-200 rounded-xl bg-red-50/20 text-center">
                Bạn chưa có cụm sân nào. Vui lòng tạo cụm sân trước!
              </div>
            ) : (
              <Dropdown 
                options={venueFormOptions}
                value={venueId}
                onChange={setVenueId}
                disabled={viewOnly}
                placeholder="Chọn cụm sân"
                className="w-full"
              />
            )}
            {validationErrors.venueId && (
              <p className="text-[9px] text-red-500 font-bold">{validationErrors.venueId}</p>
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
                value={price}
                disabled={viewOnly}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full text-xs font-bold text-slate-700 pl-3.5 pr-12 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 ${
                  validationErrors.price ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
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
                Định dạng hiển thị: {formatVND(parseFloat(price))}
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
                value={openingTime}
                onChange={setOpeningTime}
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
                value={closingTime}
                onChange={setClosingTime}
                disabled={viewOnly}
                className="w-full"
              />
            </div>
            {validationErrors.time && (
              <p className="text-[9px] text-red-500 font-bold sm:col-span-2">{validationErrors.time}</p>
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
              value={location}
              disabled={viewOnly}
              onChange={(e) => setLocation(e.target.value)}
              className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 ${
                validationErrors.location ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-emerald focus:border-brand-emerald'
              }`}
            />
            {validationErrors.location && (
              <p className="text-[9px] text-red-500 font-bold">{validationErrors.location}</p>
            )}
          </div>

          {/* Description */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giới thiệu chi tiết sân</label>
            <textarea 
              placeholder="Giới thiệu về thảm đấu, kích thước, hệ thống lưới, đèn chiếu sáng..."
              value={description}
              disabled={viewOnly}
              onChange={(e) => setDescription(e.target.value)}
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

              {!viewOnly && (
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Hoặc dán liên kết ảnh trực tiếp..."
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="flex-1 text-xs font-bold text-slate-650 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
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
                    onChange={handleDetailChange}
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

              {detailImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                  {detailImages.map((imgUrl, index) => (
                    <div key={index} className="aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden relative">
                      <img src={imgUrl} alt={`Detail ${index}`} className="w-full h-full object-cover" />
                      {!viewOnly && (
                        <button
                          type="button"
                          onClick={() => onRemoveDetailImage(index)}
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
  );
};
