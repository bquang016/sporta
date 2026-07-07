import React, { useState, useRef, useEffect } from 'react';

interface ImageLightboxProps {
  src: string;
  onClose: () => void;
}

export const ImageLightbox = ({ src, onClose }: ImageLightboxProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);

  // Reset controls on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (scale <= 1) return; // Only allow panning when zoomed in
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center z-[9999] select-none select-none pointer-events-auto animate-fadeIn font-sans">
      
      {/* ── TOP CONTROL PANEL ─────────────────────────────────────────────────── */}
      <div className="absolute top-5 left-0 right-0 px-6 flex items-center justify-between z-10">
        {/* Zoom Indicator */}
        <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          Tỷ lệ: {Math.round(scale * 100)}%
        </span>

        {/* Action Controls */}
        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Thu nhỏ"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-450 hover:text-white hover:bg-white/10 text-xs font-black uppercase tracking-wider cursor-pointer"
            title="Đưa về mặc định"
          >
            1:1
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Phóng to"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-slate-350 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          title="Đóng xem trước"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── IMAGE WRAPPER ZONE ────────────────────────────────────────────────── */}
      <div 
        className={`w-full h-full flex items-center justify-center overflow-hidden cursor-default ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={src}
          alt="Zoom Preview"
          draggable="false"
          onMouseDown={handleMouseDown}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            maxHeight: '85vh',
            maxWidth: '90vw',
            objectFit: 'contain'
          }}
          className="rounded-lg shadow-2xl pointer-events-auto"
        />
      </div>

    </div>
  );
};
export default ImageLightbox;
