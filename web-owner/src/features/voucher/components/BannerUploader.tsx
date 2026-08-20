import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropUtils';

interface BannerUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const BannerUploader: React.FC<BannerUploaderProps> = ({ value, onChange, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
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
      });
      reader.readAsDataURL(file);
    }
  };

  const showCroppedImage = useCallback(async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      setUploading(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      // Giả lập upload lên S3
      setTimeout(() => {
        onChange(croppedImage);
        setImageSrc(null);
        setUploading(false);
      }, 1000);
    } catch (e) {
      console.error(e);
      alert('Lỗi cắt ảnh');
      setUploading(false);
    }
  }, [imageSrc, croppedAreaPixels, onChange]);

  if (imageSrc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl flex flex-col items-center shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-on-surface">Cắt ảnh Banner (16:9)</h3>
          <div className="relative w-full h-96 bg-surface-variant rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="mt-4 w-full flex items-center gap-4">
            <span className="text-sm font-medium text-on-surface">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-brand-emerald"
            />
          </div>
          <div className="mt-6 flex gap-4 w-full justify-end">
            <button
              type="button"
              onClick={() => {
                setImageSrc(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="px-4 py-2 border border-outline rounded-md text-on-surface hover:bg-surface-variant transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={showCroppedImage}
              disabled={uploading}
              className="px-4 py-2 bg-brand-emerald text-white rounded-md flex items-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Check className="w-4 h-4" />
              )}
              {uploading ? 'Đang xử lý...' : 'Cắt & Tải lên'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {value ? (
        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-outline-variant group">
          <img src={value} alt="Banner" className="w-full h-full object-cover" />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100 transition-colors"
                title="Xóa ảnh"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:border-brand-emerald transition-colors disabled:opacity-50"
        >
          <Upload className="w-8 h-8 mb-2 text-outline" />
          <span className="font-medium">Tải lên ảnh banner</span>
          <span className="text-sm mt-1">Tỷ lệ 16:9 (1920x1080px)</span>
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
