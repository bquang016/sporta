import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  className,
  ...props
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Range helper
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const getPageNumbers = () => {
    const siblingCount = 1;
    // Pages count is siblingCount + firstPage + lastPage + currentPage + 2*ellipsis
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, '...', lastPageIndex];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    return range(1, totalPages);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-3 w-full font-sans text-xs font-semibold select-none',
        className
      )}
      {...props}
    >
      {/* Description text */}
      <span className="text-slate-400 font-medium">
        Hiển thị <span className="font-bold text-slate-700">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> -{' '}
        <span className="font-bold text-slate-700">{Math.min(currentPage * pageSize, totalItems)}</span> trên{' '}
        <span className="font-bold text-slate-700">{totalItems}</span> kết quả
      </span>

      {/* Pages & Size select */}
      <div className="flex items-center gap-4">
        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none hover:border-slate-350 cursor-pointer text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Buttons List */}
        <nav className="flex items-center gap-1" aria-label="Pagination">
          {/* Prev */}
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all focus:outline-none"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numbers */}
          {pageNumbers.map((page, idx) => {
            const isEllipsis = page === '...';
            const isActive = page === currentPage;

            if (isEllipsis) {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-slate-400"
                >
                  &hellip;
                </span>
              );
            }

            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(Number(page))}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center border transition-all text-xs focus:outline-none',
                  isActive
                    ? 'bg-brand-emerald border-brand-emerald text-white font-black shadow-sm'
                    : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-600'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all focus:outline-none"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  );
};

Pagination.displayName = 'Pagination';
export default Pagination;
