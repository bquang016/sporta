import React, { useRef, useState } from 'react';
import { FileText, Paperclip, X } from 'lucide-react';
import { cn } from '../utils';
import { FormField } from './FormField';
import type { FormFieldProps } from './FormField';
import { IconButton } from '../buttons/IconButton';

export interface FileUploadProps
  extends Omit<FormFieldProps, 'children' | 'className'> {
  value?: File[];
  onChange?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  multiple?: boolean;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
  wrapperClassName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  helperText,
  error,
  required,
  disabled,
  value = [],
  onChange,
  onRemove,
  multiple = false,
  maxSizeMB = 10,
  accept,
  className,
  wrapperClassName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localErrors, setLocalErrors] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const validFiles: File[] = [];
      let errorMsg = '';

      filesArray.forEach((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          errorMsg = `File ${file.name} vượt quá giới hạn ${maxSizeMB}MB`;
        } else {
          validFiles.push(file);
        }
      });

      setLocalErrors(errorMsg);

      if (validFiles.length > 0 && onChange) {
        onChange(multiple ? [...value, ...validFiles] : [validFiles[0]]);
      }
      e.target.value = '';
    }
  };

  const triggerSelect = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <div className="space-y-3 font-sans">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          className="hidden"
        />

        {/* Trigger Button */}
        <button
          type="button"
          onClick={triggerSelect}
          disabled={disabled}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase text-slate-700 tracking-wider transition-all duration-200 hover:border-slate-350 hover:bg-slate-50 active:scale-[0.98] focus:outline-none',
            disabled && 'opacity-50 cursor-not-allowed active:scale-100 hover:bg-white border-slate-200',
            className
          )}
        >
          <Paperclip className="w-4 h-4 text-slate-450 stroke-[2.5]" />
          <span>Chọn file đính kèm</span>
        </button>

        {/* Selected Files List */}
        {value.length > 0 && (
          <ul className="divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-slate-50/20 overflow-hidden">
            {value.map((file, idx) => (
              <li
                key={file.name + idx}
                className="flex items-center justify-between p-3 gap-4 text-xs font-semibold text-slate-700 animate-fadeIn"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-450 shadow-sm flex-shrink-0">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-slate-800 font-bold max-w-[200px] xs:max-w-[300px]">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold leading-tight">
                      {formatSize(file.size)}
                    </span>
                  </div>
                </div>
                {!disabled && onRemove && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(idx)}
                    aria-label={`Remove file ${file.name}`}
                    className="text-slate-450 hover:text-slate-650 p-1 w-7 h-7"
                  >
                    <X className="w-4 h-4" />
                  </IconButton>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </FormField>
  );
};

FileUpload.displayName = 'FileUpload';
export default FileUpload;
