import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { cn } from '../utils';
import { FormField } from './FormField';
import type { FormFieldProps } from './FormField';

export interface ImageUploadProps
  extends Omit<FormFieldProps, 'children' | 'className'> {
  value?: string[]; // Existing URLs
  onChange?: (files: File[]) => void;
  onRemoveUrl?: (url: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
  wrapperClassName?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  helperText,
  error,
  required,
  disabled,
  value = [],
  onChange,
  onRemoveUrl,
  multiple = false,
  maxFiles = 5,
  maxSizeMB = 5,
  accept = 'image/*',
  className,
  wrapperClassName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localErrors, setLocalErrors] = useState<string>('');

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    let errorMsg = '';

    const currentCount = value.length;
    if (!multiple && files.length > 0) {
      // For single uploads, only take the first one
      const file = files[0];
      if (file.size > maxSizeMB * 1024 * 1024) {
        errorMsg = `Kích thước ảnh vượt quá ${maxSizeMB}MB`;
      } else {
        validFiles.push(file);
      }
    } else {
      if (currentCount + files.length > maxFiles) {
        errorMsg = `Tối đa được tải lên ${maxFiles} ảnh`;
      }
      files.forEach((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          errorMsg = `Ảnh ${file.name} vượt quá ${maxSizeMB}MB`;
        } else if (currentCount + validFiles.length < maxFiles) {
          validFiles.push(file);
        }
      });
    }

    setLocalErrors(errorMsg);
    return validFiles;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(filesArray);
      if (validFiles.length > 0 && onChange) {
        onChange(validFiles);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const validFiles = validateFiles(filesArray);
      if (validFiles.length > 0 && onChange) {
        onChange(validFiles);
      }
      // Reset input value so same file can be uploaded again
      e.target.value = '';
    }
  };

  const triggerSelect = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const activeError = error || localErrors;

  return (
    <FormField
      label={label}
      helperText={helperText}
      error={activeError}
      required={required}
      disabled={disabled}
      className={cn('w-full', wrapperClassName)}
    >
      <div className="space-y-4">
        {/* Upload Trigger Area */}
        {(!multiple && value.length === 0) || (multiple && value.length < maxFiles) ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerSelect}
            className={cn(
              'border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 bg-slate-50/50',
              isDragOver
                ? 'border-brand-emerald bg-brand-emerald/5 scale-[0.99]'
                : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50',
              disabled && 'opacity-50 cursor-not-allowed hover:bg-slate-50/50 hover:border-slate-200',
              className
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple={multiple}
              accept={accept}
              disabled={disabled}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
              <Upload className="w-5 h-5 text-slate-500" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Tải ảnh lên
              </p>
              <p className="text-[10px] font-semibold text-slate-450">
                Kéo thả ảnh hoặc nhấp để duyệt file. Tối đa {maxSizeMB}MB/ảnh.
              </p>
            </div>
          </div>
        ) : null}

        {/* Thumbnail Preview Area */}
        {value.length > 0 && (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
            {value.map((url, idx) => (
              <div
                key={url + idx}
                className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100/90 shadow-sm animate-fadeIn"
              >
                <img
                  src={url}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {!disabled && onRemoveUrl && (
                  <button
                    type="button"
                    onClick={() => onRemoveUrl(url)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white flex items-center justify-center transition-colors shadow-sm focus:outline-none"
                    aria-label="Xóa ảnh"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
};

ImageUpload.displayName = 'ImageUpload';
export default ImageUpload;
