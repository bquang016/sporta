import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '../utils';
import { EmptyState } from '../feedback/EmptyState';
import { Skeleton } from '../display/Skeleton';

export interface TableColumn<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyNode?: React.ReactNode;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  paginationSlot?: React.ReactNode;
  wrapperClassName?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyNode,
  sortKey,
  sortDirection,
  onSortChange,
  paginationSlot,
  className,
  wrapperClassName,
  ...props
}: TableProps<T>) {
  const handleHeaderClick = (column: TableColumn<T>) => {
    if (!column.sortable || !onSortChange) return;

    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortKey === column.key) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    onSortChange(column.key, newDirection);
  };

  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;
    if (sortKey !== column.key) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-brand-emerald animate-fadeIn" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-brand-emerald animate-fadeIn" />
    );
  };

  return (
    <div className={cn('flex flex-col w-full font-sans select-none', wrapperClassName)}>
      {/* Table Container Card */}
      <div className="w-full overflow-x-auto border border-slate-100 bg-white rounded-3xl shadow-sm matrix-scroll">
        <table className={cn('w-full border-collapse text-xs font-semibold text-slate-700', className)} {...props}>
          {/* Header */}
          <thead className="bg-slate-50/75 border-b border-slate-100/90 text-left flex-shrink-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleHeaderClick(col)}
                  className={cn(
                    'px-6 py-4 font-black uppercase tracking-wider text-slate-500 select-none transition-colors duration-150',
                    col.sortable && 'cursor-pointer hover:bg-slate-100/50 hover:text-slate-700',
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                    col.className
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center gap-1.5',
                      col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <span>{col.header}</span>
                    {getSortIcon(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100/70">
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`loader-row-${rIdx}`} className="animate-fadeIn">
                  {columns.map((_, cIdx) => (
                    <td key={`loader-col-${cIdx}`} className="px-6 py-4">
                      <Skeleton variant="text" width={cIdx % 2 === 0 ? '70%' : '50%'} height="12px" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State Row
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  {emptyNode || <EmptyState className="border-none bg-transparent min-h-0 py-4" />}
                </td>
              </tr>
            ) : (
              // Actual Table Rows
              data.map((record, rIdx) => (
                <tr
                  key={record.id || rIdx}
                  className="hover:bg-slate-50/40 transition-colors duration-150"
                >
                  {columns.map((col) => {
                    const value = record[col.key];
                    const alignClass =
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left';

                    return (
                      <td
                        key={col.key}
                        className={cn('px-6 py-4.5 font-semibold text-slate-700', alignClass, col.className)}
                      >
                        {col.render ? col.render(value, record, rIdx) : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Slot */}
      {paginationSlot && <div className="mt-3.5 select-none">{paginationSlot}</div>}
    </div>
  );
}

Table.displayName = 'Table';
export default Table;
