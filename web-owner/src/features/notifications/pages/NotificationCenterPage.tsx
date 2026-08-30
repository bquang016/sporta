import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOwnerNotifications } from '../hooks/useOwnerNotifications';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { MobileNotificationCenter } from '../components/mobile/MobileNotificationCenter';
import type { NotificationItem } from '../types/notification.types';

type CategoryFilter = 'ALL' | 'SUPPORT' | 'BOOKING' | 'SYSTEM';
type ReadStatusFilter = 'ALL' | 'UNREAD' | 'READ';

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export const NotificationCenterPage: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, refetch, markAsRead, markAllAsRead } = useOwnerNotifications(10000);

  if (isMobile) {
    return (
      <MobileNotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        refetch={refetch}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
      />
    );
  }

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [readFilter, setReadFilter] = useState<ReadStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;


  // L?c b? ho?n to?n c?c th?ng b?o v? v? doanh thu theo y?u c?u
  const activeNotifications = useMemo(() => {
    return notifications.filter(n => {
      const type = n.type || '';
      if (type.startsWith('WALLET_') || type.includes('WITHDRAWAL') || type.includes('RECONCIL') || type.includes('PAYMENT')) {
        return false;
      }
      return true;
    });
  }, [notifications]);

  // Categorize helper
  const getCategory = (type: string): 'SUPPORT' | 'BOOKING' | 'SYSTEM' => {
    if (type.startsWith('TICKET_') || type.includes('SUPPORT') || type.includes('HELP')) {
      return 'SUPPORT';
    }
    if (type.startsWith('BOOKING_') || type === 'OWNER_NEW_BOOKING' || type.includes('CHECKIN') || type.includes('CANCEL')) {
      return 'BOOKING';
    }
    return 'SYSTEM';
  };

  // KPIs
  const stats = useMemo(() => {
    const total = activeNotifications.length;
    const unread = activeNotifications.filter(n => !(n.isRead ?? n.read)).length;
    const support = activeNotifications.filter(n => getCategory(n.type) === 'SUPPORT').length;
    const operations = activeNotifications.filter(n => getCategory(n.type) === 'BOOKING').length;
    return { total, unread, support, operations };
  }, [activeNotifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return activeNotifications.filter(n => {
      const isUnread = !(n.isRead ?? n.read);
      if (readFilter === 'UNREAD' && !isUnread) return false;
      if (readFilter === 'READ' && isUnread) return false;

      const cat = getCategory(n.type);
      if (categoryFilter !== 'ALL' && cat !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title?.toLowerCase().includes(q);
        const matchContent = n.content?.toLowerCase().includes(q);
        const matchRef = n.referenceId?.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchRef) return false;
      }

      return true;
    });
  }, [activeNotifications, categoryFilter, readFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage]);

  const handleCardClick = (n: NotificationItem) => {
    if (!(n.isRead ?? n.read)) {
      markAsRead(n.id);
    }
    setSelectedNotification(n);
  };

  const handleActionCTA = (n: NotificationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!(n.isRead ?? n.read)) {
      markAsRead(n.id);
    }
    setSelectedNotification(null);

    const cat = getCategory(n.type);
    if (cat === 'BOOKING') {
      if (n.referenceId) {
        navigate('/matrix?bookingId=' + n.referenceId);
      } else {
        navigate('/matrix');
      }
    } else if (n.type.startsWith('VOUCHER_')) {
      navigate('/vouchers');
    } else {
      navigate('/settings');
    }
  };

  const renderCategoryMeta = (type: string) => {
    const cat = getCategory(type);
    switch (cat) {
      case 'SUPPORT':
        return {
          label: 'Hỗ Trợ / Ticket',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          icon: (
            <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          ),
          cta: 'Xử lý Ticket →',
        };
      case 'BOOKING':
        return {
          label: 'Đơn Đặt Sân',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          icon: (
            <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          cta: 'Xem Đơn Đặt →',
        };
      default:
        return {
          label: 'Hệ Thống',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-brand-emerald',
          icon: (
            <svg className="w-5 h-5 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          cta: 'Xem Chi Tiết →',
        };
    }
  };

  return (
    <div className="space-y-5 flex flex-col flex-1 min-h-0">
      {/* 1. 3 KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between hover:border-brand-emerald/30 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TỔNG THÔNG BÁO</span>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        </div>

        {/* Card 2: Unread */}
        <div className="bg-white border border-rose-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between hover:border-rose-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">CHƯA ĐỌC</span>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-rose-600 tracking-tight">{stats.unread}</p>
              {stats.unread > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* Card 3: Operations & Booking */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between hover:border-emerald-300 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">VẬN HÀNH & ĐẶT SÂN</span>
            <p className="text-2xl font-black text-emerald-950 tracking-tight">{stats.operations}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-emerald shadow-2xs">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden flex flex-col flex-1">
        {/* Action Bar / Controls Header */}
        <div className="p-4 md:p-5 border-b border-slate-100/90 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50/50">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'SUPPORT', label: 'Hỗ trợ' },
              { id: 'BOOKING', label: 'Đơn đặt sân' },
              { id: 'SYSTEM', label: 'Khuyến mãi & Hệ thống' },
            ].map(tab => {
              const isActive = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(tab.id as CategoryFilter);
                    setCurrentPage(1);
                  }}
                  className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (
                    isActive
                      ? 'bg-primary text-white shadow-xs scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Actions: Read Status Filter, Pill Search, Mark All & Refresh */}
          <div className="flex flex-wrap items-center gap-2.5 justify-between lg:justify-end">
            {/* Read Filter */}
            <div className="flex items-center bg-white border border-slate-200/90 rounded-full p-0.5 text-xs font-semibold shadow-2xs">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'UNREAD', label: 'Chưa đọc' },
                { id: 'READ', label: 'Đã đọc' },
              ].map(rf => (
                <button
                  key={rf.id}
                  type="button"
                  onClick={() => {
                    setReadFilter(rf.id as ReadStatusFilter);
                    setCurrentPage(1);
                  }}
                  className={'px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ' + (
                    readFilter === rf.id ? 'bg-primary text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            {/* Pill Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Tìm nội dung, tiêu đề..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-1.5 w-full bg-white border border-slate-200/90 rounded-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 pr-8 shadow-2xs"
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
            {stats.unread > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold border border-slate-200 bg-white hover:border-brand-emerald text-brand-emerald transition-all cursor-pointer shadow-2xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Đã đọc tất cả</span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => refetch()}
              className="p-2 rounded-full border border-slate-200 bg-white hover:border-brand-emerald text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
              title="Làm mới"
            >
              <svg className={'w-3.5 h-3.5 ' + (loading ? 'animate-spin text-brand-emerald' : '')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notification Feed: Floating rounded cards matching Web Admin */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {paginatedNotifications.length > 0 ? (
            paginatedNotifications.map(item => {
              const isUnread = !(item.isRead ?? item.read);
              const meta = renderCategoryMeta(item.type);

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className={'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ' + (
                    isUnread
                      ? 'bg-white border-slate-200/90 shadow-xs border-l-4 border-l-brand-emerald hover:border-brand-emerald/40 hover:shadow-md'
                      : 'bg-slate-50/50 border-slate-200/60 opacity-90 hover:opacity-100 hover:bg-white hover:shadow-xs'
                  )}
                >
                  {/* Left: Icon Badge & Content */}
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
                          <span>Mã tham chiếu:</span>
                          <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                            #{item.referenceId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action CTA Button */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => handleActionCTA(item, e)}
                      className="px-4 py-2 rounded-full text-xs font-bold border border-slate-200 hover:border-brand-emerald hover:bg-brand-emerald hover:text-white text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      {meta.cta}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1 shadow-2xs">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">Không có thông báo nào phù hợp</p>
              <p className="text-xs text-slate-400">
                {searchQuery || categoryFilter !== 'ALL' || readFilter !== 'ALL'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                  : 'Bạn sẽ nhận được thông báo khi có hoạt động mới tại cơ sở.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        {filteredNotifications.length > itemsPerPage && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>
              Trang {currentPage} / {totalPages} (Tổng {filteredNotifications.length} thông báo)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
              >
                Trang trước
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedNotification(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ' + renderCategoryMeta(selectedNotification.type).bg + ' ' + renderCategoryMeta(selectedNotification.type).border}>
                  {renderCategoryMeta(selectedNotification.type).icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ' + renderCategoryMeta(selectedNotification.type).bg + ' ' + renderCategoryMeta(selectedNotification.type).text + ' ' + renderCategoryMeta(selectedNotification.type).border}>
                      {renderCategoryMeta(selectedNotification.type).label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">{formatDateTime(selectedNotification.createdAt)}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">{selectedNotification.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-5">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                {selectedNotification.content}
              </p>
              {selectedNotification.referenceId && (
                <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-mono text-slate-600">
                  <span className="text-slate-400 font-sans font-bold">Mã tham chiếu: </span>
                  <span className="font-bold text-slate-800">#{selectedNotification.referenceId}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => handleActionCTA(selectedNotification)}
                className="px-4.5 py-2 bg-primary hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {renderCategoryMeta(selectedNotification.type).cta}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
