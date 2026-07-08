import React, { useState } from 'react';
import { cn } from '../utils';
import { Image } from './Image';
import { ImagePreview } from './ImagePreview';

export interface ImageGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
  gridCols?: 2 | 3 | 4 | 5;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images = [],
  gridCols = 4,
  className,
  ...props
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 xs:grid-cols-3',
    4: 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-4',
    5: 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5',
  };

  if (images.length === 0) return null;

  return (
    <div className={cn('w-full font-sans select-none', className)} {...props}>
      <div className={cn('grid gap-3.5', colClasses[gridCols])}>
        {images.map((url, idx) => (
          <div
            key={url + idx}
            onClick={() => setSelectedImage(url)}
            className="cursor-pointer group relative overflow-hidden rounded-2xl border border-slate-100/90 shadow-sm"
          >
            <Image
              src={url}
              alt={`Gallery Image ${idx + 1}`}
              aspectRatio="square"
              className="group-hover:scale-105 transition-transform duration-300"
            />
            {/* Hover visual overlay */}
            <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Lightbox full-screen popup */}
      {selectedImage && (
        <ImagePreview
          src={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

ImageGallery.displayName = 'ImageGallery';
export default ImageGallery;
