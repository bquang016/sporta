import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Check, RotateCcw, RotateCw, ZoomIn, ZoomOut, RefreshCcw, Crop, ImageIcon, AlertCircle } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropUtils';
import { uploadImage } from '../../../api/adminWithdrawalApi';

interface BannerUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const BannerUploader: React.FC<BannerUploaderProps> = ({ value, onChange, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setUploadError(null);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleClose = () => {
    setImageSrc(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setUploading(true);
      setUploadError(null);

      // 1. Crop → blob URL
      const blobUrl = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);

      // 2. blob URL → File
      const blobRes = await fetch(blobUrl);
      const blob = await blobRes.blob();
      const file = new File([blob], `banner-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // 3. Upload to R2
      const imageUrl = await uploadImage(file);

      // 4. Pass permanent URL to parent and close
      onChange(imageUrl);
      setImageSrc(null);
    } catch (e: any) {
      console.error(e);
      setUploadError(e?.message || 'Lỗi khi tải ảnh lên, vui lòng thử lại');
    } finally {
      setUploading(false);
    }
  }, [imageSrc, croppedAreaPixels, rotation, onChange]);

  // ── Crop Modal ───────────────────────────────────────────────────────────────
  if (imageSrc) {
    const zoomPct = ((zoom - 1) / 2) * 100;
    const rotPct = ((rotation + 180) / 360) * 100;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-brand-emerald border border-emerald-100">
                <Crop className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">Cắt ảnh Banner</h3>
                <p className="text-xs font-semibold text-slate-400">Kéo, thu phóng hoặc xoay để chọn vùng tốt nhất · Tỷ lệ 16:9</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Crop canvas */}
          <div
            className="relative w-full bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#f1f5f9_0%_50%)] bg-[length:20px_20px]"
            style={{ height: 360 }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={16 / 9}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              style={{
                containerStyle: { background: 'transparent' },
                cropAreaStyle: {
                  border: '2px solid #10b981',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                },
              }}
            />
            <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg backdrop-blur-sm pointer-events-none">
              16 : 9
            </div>
          </div>

          {/* Controls */}
          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/70 space-y-4">
            {/* Zoom */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider w-16 shrink-0">Thu phóng</span>
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(1, parseFloat((z - 0.1).toFixed(1))))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer"
                style={{ background: `linear-gradient(to right, #10b981 0%, #10b981 ${zoomPct}%, #e2e8f0 ${zoomPct}%, #e2e8f0 100%)` }}
              />
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(3, parseFloat((z + 0.1).toFixed(1))))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-slate-700 w-10 text-right shrink-0">{zoom.toFixed(1)}×</span>
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider w-16 shrink-0">Xoay</span>
              <button
                type="button"
                onClick={() => setRotation(r => r - 90)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                title="Xoay trái 90°"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                value={rotation}
                min={-180}
                max={180}
                step={1}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer"
                style={{ background: `linear-gradient(to right, #e2e8f0 0%, #e2e8f0 ${rotPct}%, #10b981 ${rotPct}%, #10b981 100%)` }}
              />
              <button
                type="button"
                onClick={() => setRotation(r => r + 90)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                title="Xoay phải 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-slate-700 w-10 text-right shrink-0">{rotation}°</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 px-6 py-4 border-t border-slate-100">
            {uploadError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {uploadError}
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-40"
              >
                <RefreshCcw className="w-4 h-4" />
                Đặt lại
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={uploading}
                  className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 text-sm transition-colors disabled:opacity-40"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={uploading}
                  className="px-5 py-2.5 bg-brand-emerald text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 text-sm transition-colors disabled:opacity-60 shadow-sm min-w-[145px] justify-center"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {uploading ? 'Đang tải lên...' : 'Xác nhận & Lưu'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── Upload placeholder / preview ────────────────────────────────────────────
  return (
    <div className="w-full">
      {value ? (
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border-2 border-slate-200 group shadow-sm">
          <img src={value} alt="Banner" className="w-full h-full object-cover" />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Thay ảnh
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Xóa ảnh
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:bg-emerald-50 hover:border-brand-emerald transition-all duration-200 disabled:opacity-50 bg-slate-50 group"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 group-hover:shadow-md transition-all duration-200">
            <Upload className="w-8 h-8 text-brand-emerald" />
          </div>
          <span className="font-black text-slate-700">Tải lên ảnh banner</span>
          <span className="text-sm font-semibold text-slate-400 mt-1">Tỷ lệ 16:9 · Khuyến nghị 1920×1080px · JPG, PNG, WEBP</span>
        </button>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
