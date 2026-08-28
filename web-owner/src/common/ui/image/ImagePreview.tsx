import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../utils';

export interface ImagePreviewProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = 'Image Preview',
  isOpen,
  onClose,
  className,
}) => {
  // Disable body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center font-sans select-none animate-fadeIn">
      {/* Dark blur backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating container card */}
      <div className={cn('relative z-10 flex flex-col items-center justify-center max-w-[90vw] max-h-[85vh] p-2', className)}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-2 text-white hover:text-slate-200 transition-colors p-2 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scaled Image */}
        <img
          src={src}
          alt={alt}
          className="rounded-3xl max-w-full max-h-[80vh] object-contain shadow-2xl border border-white/5 animate-fadeIn"
        />
      </div>
    </div>,
    document.body
  );
};

ImagePreview.displayName = 'ImagePreview';
export default ImagePreview;
