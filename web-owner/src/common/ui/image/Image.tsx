import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../utils';
import { Skeleton } from '../display/Skeleton';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  containerClassName?: string;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = 'Image',
  aspectRatio = 'auto',
  className,
  containerClassName,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video', // 16:9 aspect ratio as recommended for Venue Cards in DESIGN.md
    wide: 'aspect-[21/9]',
    auto: 'aspect-auto',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-50 border border-slate-100/90 rounded-2xl flex items-center justify-center font-sans select-none',
        aspectClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Skeleton screen displayed while loading */}
      {isLoading && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      )}

      {hasError ? (
        // Error placeholder
        <div className="flex flex-col items-center justify-center text-slate-350 p-4 space-y-1.5 animate-fadeIn">
          <ImageOff className="w-6 h-6 stroke-[1.5]" />
          <span className="text-[10px] font-black uppercase tracking-wider">Lỗi tải ảnh</span>
        </div>
      ) : (
        // actual image element
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={cn(
            'w-full h-full object-cover transition-all duration-350 ease-out',
            isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
            className
          )}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

Image.displayName = 'Image';
export default Image;
