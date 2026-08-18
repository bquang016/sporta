import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface BannerUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const BannerUploader: React.FC<BannerUploaderProps> = ({ value, onChange, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate ratio 16:9 here in real app, we will simulate upload
    try {
      setUploading(true);
      // Giả lập gọi API upload S3
      const fakeUrl = URL.createObjectURL(file);
      setTimeout(() => {
        onChange(fakeUrl);
        setUploading(false);
      }, 1000);
    } catch (err) {
      alert('Lỗi tải ảnh lên');
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 group">
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
          className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-blue-500 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <span className="font-medium">Tải lên ảnh banner</span>
              <span className="text-sm mt-1">Tỷ lệ 16:9 (1920x1080px)</span>
            </>
          )}
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
