import React, { useRef } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Dropdown } from '../../../../components/ui/Dropdown';
import type { DropdownOption } from '../../../../components/ui/Dropdown';

interface CourtConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  name: string;
  setName: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  opening: string;
  setOpening: (val: string) => void;
  closing: string;
  setClosing: (val: string) => void;
  approvalStatus: string;
  setApprovalStatus: (val: any) => void;
  opStatus: string;
  setOpStatus: (val: any) => void;
  description: string;
  setDescription: (val: string) => void;
  coverImage: string;
  setCoverImage: (val: string) => void;
  detailImages: string[];
  uploadingCover: boolean;
  uploadingDetail: boolean;
  hourDropdownOptions: DropdownOption[];
  approvalDropdownOptions: DropdownOption[];
  opDropdownOptions: DropdownOption[];
  onUploadCover: (file: File) => void;
  onUploadDetail: (files: FileList) => void;
  onRemoveDetailImage: (index: number) => void;
  formatVND: (amount: number) => string;
}

export const CourtConfigModal = ({
  isOpen,
  onClose,
  onSave,
  name,
  setName,
  price,
  setPrice,
  opening,
  setOpening,
  closing,
  setClosing,
  approvalStatus,
  setApprovalStatus,
  opStatus,
  setOpStatus,
  description,
  setDescription,
  coverImage,
  setCoverImage,
  detailImages,
  uploadingCover,
  uploadingDetail,
  hourDropdownOptions,
  approvalDropdownOptions,
  opDropdownOptions,
  onUploadCover,
  onUploadDetail,
  onRemoveDetailImage,
  formatVND
}: CourtConfigModalProps) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadCover(file);
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) onUploadDetail(files);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title="Chỉnh sửa chi tiết & Cấu hình giá sân" maxWidth="lg"
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all">
            Đóng
          </button>
          <button type="button" onClick={onSave} disabled={uploadingCover || uploadingDetail}
            className="bg-brand-yellow hover:bg-yellow-400 text-primary border-b-2 border-yellow-600 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-60">
            <svg className="w-4 h-4 text-emerald-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Lưu cấu hình
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Court Name */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Tên sân bãi</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" />
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giá thuê cố định (VND/h)</label>
            <div className="relative flex items-center">
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 pr-14 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1" />
              <span className="absolute right-3.5 text-[10px] font-extrabold text-slate-400">VND/h</span>
            </div>
            {price && !isNaN(parseFloat(price)) && (
              <p className="text-[9px] text-brand-emerald font-black">Hiển thị: {formatVND(parseFloat(price))}</p>
            )}
          </div>

          {/* Opening Time */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giờ mở cửa</label>
            <Dropdown options={hourDropdownOptions} value={opening} onChange={setOpening} placeholder="Chọn giờ mở cửa" />
          </div>

          {/* Closing Time */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giờ đóng cửa</label>
            <Dropdown options={hourDropdownOptions} value={closing} onChange={setClosing} placeholder="Chọn giờ đóng cửa" />
          </div>

          {/* Approval Status */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Trạng thái phê duyệt (Hệ thống)</label>
            <Dropdown options={approvalDropdownOptions} value={approvalStatus} onChange={val => setApprovalStatus(val as any)} placeholder="Chọn trạng thái phê duyệt" />
          </div>

          {/* Operational Status */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Trạng thái vận hành (Chủ sân)</label>
            <Dropdown options={opDropdownOptions} value={opStatus} onChange={val => setOpStatus(val as any)} placeholder="Chọn trạng thái vận hành" />
          </div>

          {/* Description */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giới thiệu chi tiết</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full text-xs font-bold text-slate-750 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none h-16 resize-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald" />
          </div>
        </div>

        {/* Media Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Hình ảnh sân bãi (Cloudflare R2)</h4>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Ảnh bìa sân bãi</label>
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
                  <input type="text" placeholder="Nhập liên kết ảnh bìa hoặc chọn tệp..."
                    value={coverImage} onChange={e => setCoverImage(e.target.value)}
                    className="flex-1 text-xs font-bold text-slate-650 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-brand-emerald" />
                  <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverChange} className="hidden" />
                  <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}
                    className="bg-emerald-50 hover:bg-emerald-100 text-brand-emerald border border-emerald-100 font-extrabold text-[10px] px-3.5 py-2 rounded-xl active:scale-95 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60">
                    Chọn ảnh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Images */}
          <div className="space-y-2 pt-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Ảnh chi tiết tổng quan</label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="file" accept="image/*" multiple ref={detailInputRef} onChange={handleDetailChange} className="hidden" />
                <button type="button" onClick={() => detailInputRef.current?.click()} disabled={uploadingDetail}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-extrabold text-[10px] px-4 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60">
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
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {detailImages.map((imgUrl, index) => (
                    <div key={index} className="aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden relative">
                      <img src={imgUrl} alt={`Detail ${index}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => onRemoveDetailImage(index)}
                        className="absolute top-1 right-1 bg-red-650 hover:bg-red-850 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md cursor-pointer"
                        title="Xóa ảnh">
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
      </div>
    </Modal>
  );
};
