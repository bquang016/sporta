import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { notificationApi } from '@/api/notificationApi';
import type { NotificationItem } from '@/types/notification.types';

type CategoryFilter = 'ALL' | 'SUPPORT' | 'VENUE' | 'FINANCE' | 'BOOKING' | 'USER';
type ReadStatusFilter = 'ALL' | 'UNREAD' | 'READ';

export const NotificationCenterPage: React.FC = () => {
  const { showToast } = useToast();
  const [, setSearchParams] = useSearchParams();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(15);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [readFilter, setReadFilter] = useState<ReadStatusFilter>('ALL');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications(page, pageSize);
      setNotifications(res.content || []);
      setTotalElements(res.totalElements || (res.content ? res.content.length : 0));
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast('error', err.message || 'Không thể tải danh sách thông báo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, pageSize]);

  // Classification helper
  const getCategory = (type?: string): CategoryFilter => {
    if (!type) return 'ALL';
    if (type.includes('TICKET') || type.includes('SUPPORT')) return 'SUPPORT';
    if (type.includes('VENUE') || type.includes('FACILITY')) return 'VENUE';
    if (type.includes('WITHDRAWAL') || type.includes('RECONCIL') || type.includes('WALLET')) return 'FINANCE';
    if (type.includes('BOOKING')) return 'BOOKING';
    if (type.includes('USER') || type.includes('OWNER') || type.includes('STAFF')) return 'USER';
    return 'ALL';
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = totalElements || notifications.length;
    const unread = notifications.filter(n => !(n.isRead ?? n.read)).length;
    const support = notifications.filter(n => getCategory(n.type) === 'SUPPORT').length;
    const operations = notifications.filter(n => {
      const cat = getCategory(n.type);
      return cat === 'BOOKING' || cat === 'FINANCE' || cat === 'VENUE';
    }).length;
    return { total, unread, support, operations };
  }, [notifications, totalElements]);

  // Filtered list
  const filteredList = useMemo(() => {
    return notifications.filter(item => {
      if (categoryFilter !== 'ALL' && getCategory(item.type) !== categoryFilter) {
        return false;
      }
      const isUnread = !(item.isRead ?? item.read);
      if (readFilter === 'UNREAD' && !isUnread) return false;
      if (readFilter === 'READ' && isUnread) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const contentMatch = item.content?.toLowerCase().includes(q);
        const refMatch = item.referenceId?.toLowerCase().includes(q);
        return titleMatch || contentMatch || refMatch;
      }
      return true;
    });
  }, [notifications, categoryFilter, readFilter, searchQuery]);

  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setNotifications(prev =>
        prev.map(item => (item.id === id ? { ...item, isRead: true, read: true } : item))
      );
      await notificationApi.markAsRead(id);
      showToast('success', 'Đã đánh dấu đã đọc thông báo.');
    } catch {
      showToast('error', 'Lỗi khi cập nhật trạng thái thông báo.');
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      setNotifications(prev =>
        prev.map(item => ({ ...item, isRead: true, read: true }))
      );
      await notificationApi.markAllAsRead();
      showToast('success', 'Đã đánh dấu tất cả thông báo là đã đọc!');
    } catch {
      showToast('error', 'Lỗi khi đánh dấu tất cả đã đọc.');
      fetchNotifications();
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNavigateDetail = (item: NotificationItem) => {
    if (!(item.isRead ?? item.read)) {
      handleMarkAsRead(item.id);
    }

    const type = item.type || '';
    if (type.includes('TICKET') || type.includes('SUPPORT')) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('tab', 'tickets');
        if (item.referenceId) next.set('ticketId', item.referenceId);
        return next;
      });
    } else if (type.includes('VENUE') || type.includes('FACILITY')) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('tab', 'facilities');
        return next;
      });
    } else if (type.includes('WITHDRAWAL') || type.includes('RECONCIL')) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('tab', 'reconciliations');
        return next;
      });
    } else if (type.includes('BOOKING')) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('tab', 'transactions');
        return next;
      });
    } else if (type.includes('USER') || type.includes('OWNER')) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('tab', 'users');
        return next;
      });
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return hours + ':' + minutes + ' - ' + day + '/' + month + '/' + year;
    } catch {
      return dateStr;
    }
  };

  const renderCategoryBadge = (type?: string) => {
    const cat = getCategory(type);
    switch (cat) {
      case 'SUPPORT':
        return {
          label: 'Hỗ Trợ / Ticket',
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          icon: (
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          ),
          cta: 'Xử lý Ticket',
        };
      case 'VENUE':
        return {
          label: 'Kiểm Duyệt Sân',
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          icon: (
            <svg className="w-5 h-5 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          cta: 'Xem Kiểm Duyệt',
        };
      case 'FINANCE':
        return {
          label: 'Đối Soát & Ví',
          bg: 'bg-blue-50',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: (
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          cta: 'Kiểm Tra Đối Soát',
        };
      case 'BOOKING':
        return {
          label: 'Đơn Đặt Sân',
          bg: 'bg-purple-50',
          text: 'text-purple-800',
          border: 'border-purple-200',
          icon: (
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          cta: 'Xem Đơn Đặt',
        };
      default:
        return {
          label: 'Hệ Thống',
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          icon: (
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          cta: 'Xem Chi Tiết',
        };
    }
  };

  return (
    <div className="space-y-5 flex flex-col flex-1 min-h-0">
      {/* 1. KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="bg-surface-container-lowest border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-brand-emerald/30 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{'Tổng Thông Báo'}</span>
            <p className="text-2xl font-black text-on-surface tracking-tight">{metrics.total}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        </div>

        {/* Card 2: Unread */}
        <div className="bg-surface-container-lowest border border-rose-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-rose-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">{'Chưa Đọc'}</span>
            <p className="text-2xl font-black text-rose-900 tracking-tight">{metrics.unread}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-100/80 flex items-center justify-center text-rose-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* Card 3: Support */}
        <div className="bg-surface-container-lowest border border-amber-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-amber-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">{'Hỗ Trợ Khách Hàng'}</span>
            <p className="text-2xl font-black text-amber-950 tracking-tight">{metrics.support}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-secondary-container/60 flex items-center justify-center text-secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        </div>

        {/* Card 4: Operations */}
        <div className="bg-surface-container-lowest border border-emerald-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-emerald-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{'Vận Hàng & Đặt Sân'}</span>
            <p className="text-2xl font-black text-emerald-950 tracking-tight">{metrics.operations}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-brand-emerald">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Main Content Card */}
      <Card className="overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm border border-slate-200/80 rounded-2xl bg-white">
        {/* Action Bar: Category Tabs, Read Status & Search */}
        <div className="p-4 border-b border-slate-200/60 flex flex-wrap gap-4 items-center justify-between bg-surface-container-low/40">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-surface-container-high/60 p-1 rounded-2xl border border-slate-200/60">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'SUPPORT', label: 'Hỗ trợ' },
              { id: 'VENUE', label: 'Kiểm duyệt sân' },
              { id: 'FINANCE', label: 'Đối soát & Ví' },
              { id: 'BOOKING', label: 'Đơn đặt sân' },
              { id: 'USER', label: 'Người dùng' },
            ].map(tab => {
              const isActive = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id as CategoryFilter)}
                  className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Actions: Read Status Filter & Search & Mark All */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Read Filter */}
            <div className="flex items-center bg-white border border-slate-200/90 rounded-full p-0.5 text-xs font-semibold">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'UNREAD', label: 'Chưa đọc' },
                { id: 'READ', label: 'Đã đọc' },
              ].map(rf => (
                <button
                  key={rf.id}
                  type="button"
                  onClick={() => setReadFilter(rf.id as ReadStatusFilter)}
                  className={'px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ' + (
                    readFilter === rf.id ? 'bg-brand-emerald text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            {/* Pill Search */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Tìm nội dung, tiêu đề..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="px-4 py-2 w-full bg-white border border-slate-200/90 rounded-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 pr-9 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  &#x2715;
                </button>
              )}
            </div>

            {/* Mark All Read Button */}
            {metrics.unread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="rounded-full px-3.5 py-2 text-xs font-bold border-slate-200 hover:border-brand-emerald text-brand-emerald"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {isMarkingAll ? 'Đang lưu...' : 'Đã đọc tất cả'}
              </Button>
            )}

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              disabled={isLoading}
              className="rounded-full px-3.5 py-2 text-xs font-bold border-slate-200 hover:border-brand-emerald"
            >
              <svg className={'w-3.5 h-3.5 ' + (isLoading ? 'animate-spin' : '')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Notification List Feed */}
        <div className="flex-1 overflow-auto p-4 space-y-3 matrix-scroll">
          {isLoading && notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <LoadingSpinner size="lg" />
              <p className="text-xs text-slate-400 font-medium">{'Đang tải danh sách thông báo...'}</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">{'Không có thông báo nào phù hợp'}</p>
              <p className="text-xs text-slate-400">
                {searchQuery || categoryFilter !== 'ALL' || readFilter !== 'ALL'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                  : 'Bạn sẽ nhận được thông báo khi có hoạt động mới trong hệ thống.'}
              </p>
            </div>
          ) : (
            filteredList.map(item => {
              const isUnread = !(item.isRead ?? item.read);
              const meta = renderCategoryBadge(item.type);

              return (
                <div
                  key={item.id}
                  onClick={() => handleNavigateDetail(item)}
                  className={'p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ' + (
                    isUnread
                      ? 'bg-white border-slate-200/90 shadow-sm border-l-4 border-l-brand-emerald hover:border-brand-emerald/40 hover:shadow-md'
                      : 'bg-surface-container-low/40 border-slate-200/60 opacity-85 hover:opacity-100 hover:bg-white'
                  )}
                >
                  {/* Left: Icon Badge & Body */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className={'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ' + meta.bg + ' ' + meta.border}>
                      {meta.icon}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ' + meta.bg + ' ' + meta.text + ' ' + meta.border}>
                          {meta.label}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        <span className="text-[11px] font-semibold text-slate-400">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>

                      <h4 className={'text-xs font-bold leading-snug ' + (isUnread ? 'text-slate-900 font-extrabold' : 'text-slate-700') + ' group-hover:text-brand-emerald transition-colors'}>
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.content}
                      </p>

                      {item.referenceId && (
                        <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <span>{'Mã tham chiếu:'}</span>
                          <span className="bg-surface-container px-1.5 py-0.5 rounded text-primary font-bold">
                            {item.referenceId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action CTAs */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0 self-center">
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        className="text-[11px] font-bold text-slate-400 hover:text-brand-emerald rounded-xl px-2.5 py-1"
                        title="Đánh dấu đã đọc"
                      >
                        {'Đã đọc'}
                      </Button>
                    )}

                    <Button
                      variant={isUnread ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleNavigateDetail(item)}
                      className={'text-xs font-bold rounded-xl transition-all shadow-xs ' + (
                        isUnread
                          ? 'bg-brand-yellow text-primary hover:bg-brand-yellow/90 font-black border-none'
                          : 'border-slate-200 hover:border-brand-emerald'
                      )}
                    >
                      {meta.cta} {'→'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-200/60 bg-surface-container-low/30 flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">
              {'Trang '}<strong>{page + 1}</strong> / <strong>{totalPages}</strong> ({'Tổng '}<strong>{totalElements}</strong> {'thông báo'})
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0 || isLoading}
                className="rounded-xl px-3 py-1 text-xs font-bold"
              >
                {'← Trang trước'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={page >= totalPages - 1 || isLoading}
                className="rounded-xl px-3 py-1 text-xs font-bold"
              >
                {'Trang sau →'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
