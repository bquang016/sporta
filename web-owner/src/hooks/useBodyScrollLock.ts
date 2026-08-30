import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;
let originalBodyOverflow = '';
let originalBodyPosition = '';
let originalBodyTop = '';
let originalBodyWidth = '';
let originalBodyTouchAction = '';
let originalHtmlOverflow = '';

export const lockBodyScroll = () => {
  if (typeof document === 'undefined') return;

  lockCount++;
  if (lockCount === 1) {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    originalBodyOverflow = document.body.style.overflow;
    originalBodyPosition = document.body.style.position;
    originalBodyTop = document.body.style.top;
    originalBodyWidth = document.body.style.width;
    originalBodyTouchAction = document.body.style.touchAction;
    originalHtmlOverflow = document.documentElement.style.overflow;

    // Lock both html and body
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
    document.body.style.touchAction = 'none';
  }
};

export const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.position = originalBodyPosition;
    document.body.style.top = originalBodyTop;
    document.body.style.width = originalBodyWidth;
    document.body.style.touchAction = originalBodyTouchAction;
    
    // Restore exact scroll position
    window.scrollTo(0, savedScrollY);
  }
};

/**
 * React hook that robustly prevents body & html scrolling (including mobile touch-scroll elasticity)
 * whenever isLocked is true.
 */
export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      lockBodyScroll();
      return () => {
        unlockBodyScroll();
      };
    }
  }, [isLocked]);
};

export default useBodyScrollLock;
