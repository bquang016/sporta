import React, { useRef, useState } from 'react';
import type { VenueInfo } from '../types';
import { useToast } from '../../../components/ui/Toast';
import { ImagePreviewCard } from '../../../components/ui/ImagePreviewCard';
import { ImageLightbox } from '../../../components/ui/ImageLightbox';

interface VenueImagesStepProps {
  venueInfo: VenueInfo;
  onVenueInfoChange: (val: VenueInfo) => void;
  isLoading: boolean;
}

export const VenueImagesStep = ({
  venueInfo,
  onVenueInfoChange,
  isLoading
}: VenueImagesStepProps) => {
  const { showToast } = useToast();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  const [dragOverCover, setDragOverCover] = useState(false);
  const [dragOverDetail, setDragOverDetail] = useState(false);

  // Lightbox Src State
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleUploadCoverFile = (file: File) => {
    onVenueInfoChange({ ...venueInfo, coverImage: file });
    showToast('success', 'Đã thêm ảnh đại diện tạm thời!');
  };

  const handleUploadDetailFiles = (files: FileList) => {
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        validFiles.push(files[i]);
      }
    }
    if (validFiles.length > 0) {
      onVenueInfoChange({
        ...venueInfo,
        detailImages: [...venueInfo.detailImages, ...validFiles]
      });
      showToast('success', `Đã thêm ${validFiles.length} ảnh chi tiết!`);
    } else {
      showToast('warning', 'Vui lòng chỉ tải lên tệp tin hình ảnh');
    }
  };

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCover(false);
    if (isLoading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleUploadCoverFile(file);
      } else {
        showToast('warning', 'Vui lòng chỉ thả tệp tin hình ảnh');
      }
    }
  };

  const handleDetailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDetail(false);
    if (isLoading) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadDetailFiles(files);
    }
  };

  const handleRemoveDetailImage = (index: number) => {
    onVenueInfoChange({
      ...venueInfo,
      detailImages: venueInfo.detailImages.filter((_, i) => i !== index)
    });
    showToast('info', 'Đã gỡ ảnh chi tiết');
  };

  return (
    <div className={`flex-grow overflow-y-auto px-8 py-6 space-y-6 select-none max-w-4xl mx-auto w-full font-sans animate-fadeIn ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="space-y-1">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bước 3: Hình ảnh truyền thông</h3>
        <p className="text-[10px] text-slate-400 font-semibold leading-normal">
          Tải lên ảnh bìa đại diện và bộ sưu tập ảnh chi tiết để thu hút khách hàng đặt sân.
        </p>
      </div>

      {/* ── ① ẢNH BÌA ĐẠI DIỆN (Cover Image) ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-4">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
          Ảnh đại diện (Cover Image) <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <input
            type="file"
            accept="image/*"
            ref={coverInputRef}
            onChange={e => {
              if (e.target.files?.[0]) {
                handleUploadCoverFile(e.target.files[0]);
                e.target.value = '';
              }
            }}
            className="hidden"
          />

          {venueInfo.coverImage ? (
            /* Uploaded Image display with Hover Controls Overlay */
            <div className="group relative aspect-video w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-3xs">
              <img src={URL.createObjectURL(venueInfo.coverImage)} alt="Cover Preview" className="w-full h-full object-cover" />
              
              {/* Hover Transparent Overlay */}
              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-10 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setLightboxSrc(URL.createObjectURL(venueInfo.coverImage!))}
                  className="px-4 py-2 bg-white/15 text-white hover:bg-white/30 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Xem ảnh
                </button>

                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="px-4 py-2 bg-brand-yellow hover:bg-yellow-400 text-brand-emerald text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                  </svg>
                  Thay ảnh
                </button>
              </div>
            </div>
          ) : (
            /* Upload box when empty */
            <div
              onDragOver={e => { e.preventDefault(); setDragOverCover(true); }}
              onDragLeave={() => setDragOverCover(false)}
              onDrop={handleCoverDrop}
              onClick={() => coverInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center aspect-video w-full ${
                dragOverCover ? 'border-brand-emerald bg-emerald-50/10' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-brand-emerald">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700">Kéo thả ảnh bìa vào đây, hoặc click để chọn</p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Hỗ trợ định dạng PNG, JPG, JPEG (tỷ lệ chuẩn 16:9)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ② BỘ SƯU TẬP ẢNH CHI TIẾT ────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
            Bộ sưu tập ảnh chi tiết
          </label>
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
            {venueInfo.detailImages.length} ảnh đã tải lên
          </span>
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          ref={detailInputRef}
          onChange={e => {
            if (e.target.files) {
              handleUploadDetailFiles(e.target.files);
              e.target.value = '';
            }
          }}
          className="hidden"
        />

        <div 
          onDragOver={e => { e.preventDefault(); setDragOverDetail(true); }}
          onDragLeave={() => setDragOverDetail(false)}
          onDrop={handleDetailDrop}
          className={`grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-2xl transition-all ${
            dragOverDetail ? 'bg-emerald-50/10 p-2 border border-dashed border-brand-emerald' : ''
          }`}
        >
          {venueInfo.detailImages.map((file, index) => {
            const imgUrl = URL.createObjectURL(file);
            return (
              <ImagePreviewCard
                key={index}
                src={imgUrl}
                onView={() => setLightboxSrc(imgUrl)}
                onRemove={() => handleRemoveDetailImage(index)}
                aspectRatio="video"
              />
            );
          })}

          <div
            onClick={() => detailInputRef.current?.click()}
            className="aspect-video bg-slate-50/50 hover:bg-slate-50 border-2 border-dashed border-slate-200 hover:border-brand-emerald rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-97 select-none"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100/80 group-hover:bg-emerald-50 flex items-center justify-center text-slate-400 group-hover:text-brand-emerald">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Thêm ảnh</span>
          </div>
        </div>
      </div>

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
};
