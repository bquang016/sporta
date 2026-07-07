import React from 'react';

interface ImagePreviewCardProps {
  src: string;
  onView?: () => void;
  onRemove?: () => void;
  onReplace?: () => void;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'auto';
}

export const ImagePreviewCard = ({
  src,
  onView,
  onRemove,
  onReplace,
  className = '',
  aspectRatio = 'video'
}: ImagePreviewCardProps) => {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    auto: 'h-full w-full'
  };

  return (
    <div
      className={`group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all ${aspectClasses[aspectRatio]} ${className}`}
    >
      {/* Background Image */}
      <img
        src={src}
        alt="Preview Thumbnail"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
        loading="lazy"
      />

      {/* Hover Translucent Backdrop & Action Icons */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2.5 z-10 pointer-events-auto">
        {onView && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="p-2 rounded-xl bg-white/15 text-white hover:bg-white/30 cursor-pointer shadow-xs transition-all active:scale-90"
            title="Xem phóng to"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}

        {onReplace && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onReplace(); }}
            className="p-2 rounded-xl bg-white/15 text-white hover:bg-white/30 cursor-pointer shadow-xs transition-all active:scale-90"
            title="Thay đổi ảnh"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
            </svg>
          </button>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-2 rounded-xl bg-red-650/80 text-white hover:bg-red-650 cursor-pointer shadow-xs transition-all active:scale-90"
            title="Gỡ ảnh"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
export default ImagePreviewCard;
