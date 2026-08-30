import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '../../types/notification.types';
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  CheckCheck, 
  RotateCw, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  X,
  ExternalLink,
  Layers,
  Inbox,
  AlertCircle,
  Tag
} from 'lucide-react';

interface MobileNotificationCenterProps {
  notifications: NotificationItem[];
  unreadCount?: number;
  loading: boolean;
  refetch: () => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

type CategoryFilter = 'ALL' | 'BOOKING' | 'SUPPORT' | 'SYSTEM';
type ReadStatusFilter = 'ALL' | 'UNREAD';

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  } catch {
    return dateStr;
  }
}

export const MobileNotificationCenter: React.FC<MobileNotificationCenterProps> = ({
  notifications,
  unreadCount: _unreadCount,
  loading,
  refetch,
  markAsRead,
  markAllAsRead
}) => {
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [readFilter, setReadFilter] = useState<ReadStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  // Filter out wallet / payment notifications as required in business rules
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
    const booking = activeNotifications.filter(n => getCategory(n.type) === 'BOOKING').length;
    return { total, unread, support, booking };
  }, [activeNotifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return activeNotifications.filter(n => {
      const isUnread = !(n.isRead ?? n.read);
      if (readFilter === 'UNREAD' && !isUnread) return false;

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

  const getMeta = (type: string) => {
    const cat = getCategory(type);
    switch (cat) {
      case 'BOOKING':
        return {
          label: 'Đơn đặt sân',
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          iconBg: 'bg-purple-100 text-purple-700',
          icon: <Calendar className="w-4 h-4" />,
          cta: 'Xem lịch sân'
        };
      case 'SUPPORT':
        return {
          label: 'Hỗ trợ / Ticket',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          iconBg: 'bg-amber-100 text-amber-700',
          icon: <MessageSquare className="w-4 h-4" />,
          cta: 'Xử lý ticket'
        };
      default:
        return {
          label: 'Hệ thống',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          iconBg: 'bg-emerald-100 text-[#064e3b]',
          icon: <Sparkles className="w-4 h-4" />,
          cta: 'Xem chi tiết'
        };
    }
  };

  return (
    <div 
      className="flex flex-col min-h-dvh bg-slate-100/60 select-none pb-24"
      style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* 1. STICKY LIQUID GLASS HEADER WITH SAFE-AREA */}
      <header
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-2xs"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
      >
        <div className="flex items-center justify-between px-3 h-13">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="touch-target w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition-transform"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-slate-800 tracking-tight">Thông báo</h1>
                {stats.unread > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                    {stats.unread} mới
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {stats.unread > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="touch-target px-2.5 py-1.5 bg-emerald-50 active:bg-emerald-100 text-[#064e3b] text-[10px] font-extrabold rounded-xl border border-emerald-200 flex items-center gap-1 active:scale-95 transition-all"
                title="Đã đọc tất cả"
              >
                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Đọc hết</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => refetch()}
              className="touch-target w-9 h-9 rounded-xl bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-transform"
              title="Làm mới"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#064e3b]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN MOBILE CONTENT */}
      <main className="px-4 py-3 space-y-3">
        {/* 3 KPI Summary Pills Carousel */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-2.5 border border-slate-200/70 shadow-2xs flex flex-col justify-between">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Tổng số</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-black text-slate-800">{stats.total}</span>
              <Inbox className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-2.5 border border-rose-200/80 shadow-2xs flex flex-col justify-between">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-600">Chưa đọc</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-black text-rose-600">{stats.unread}</span>
              {stats.unread > 0 ? (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-2.5 border border-purple-200/80 shadow-2xs flex flex-col justify-between">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-700">Đặt sân</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-black text-purple-900">{stats.booking}</span>
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200/70 shadow-2xs space-y-2">
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm tiêu đề, mã tham chiếu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-brand-emerald focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips (Horizontal Scrollable) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scroll-x-touch pb-0.5">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'BOOKING', label: 'Đơn đặt sân' },
              { id: 'SUPPORT', label: 'Hỗ trợ' },
              { id: 'SYSTEM', label: 'Hệ thống' },
            ].map(tab => {
              const isActive = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id as CategoryFilter)}
                  className={`touch-target shrink-0 min-h-[30px] px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#064e3b] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            {/* Read Filter Toggle Pill */}
            <button
              type="button"
              onClick={() => setReadFilter(prev => prev === 'ALL' ? 'UNREAD' : 'ALL')}
              className={`touch-target shrink-0 min-h-[30px] px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                readFilter === 'UNREAD'
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              {readFilter === 'UNREAD' ? '• Chỉ chưa đọc' : 'Tất cả trạng thái'}
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-black text-slate-800">Không có thông báo nào</h3>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                {searchQuery || categoryFilter !== 'ALL' || readFilter !== 'ALL'
                  ? 'Không tìm thấy thông báo khớp với bộ lọc hiện tại'
                  : 'Mọi thông báo về đơn đặt và yêu cầu hỗ trợ sẽ xuất hiện tại đây.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const isUnread = !(item.isRead ?? item.read);
              const meta = getMeta(item.type);

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className={`p-3.5 rounded-2xl border transition-all active:scale-[0.99] cursor-pointer flex flex-col gap-2 relative shadow-xs ${
                    isUnread
                      ? 'bg-white border-slate-200/90 ring-1 ring-emerald-500/30'
                      : 'bg-white/80 border-slate-200/60'
                  }`}
                >
                  {/* Top line: Category pill, timestamp, unread dot */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                        {meta.icon}
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${meta.bg}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">
                        {formatDateTime(item.createdAt)}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Body Title & Snippet */}
                  <div className="space-y-0.5">
                    <h3 className={`text-xs leading-snug ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                      {item.content}
                    </p>
                  </div>

                  {/* Bottom Line: Reference code & CTA Link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {item.referenceId ? (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        #{item.referenceId}
                      </span>
                    ) : (
                      <span />
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleActionCTA(item, e)}
                      className="touch-target min-h-[30px] px-3 py-1 bg-slate-100 active:bg-[#064e3b] active:text-white hover:text-[#064e3b] text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1"
                    >
                      <span>{meta.cta}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* 3. NOTIFICATION DETAIL BOTTOM SHEET */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedNotification(null)}
          />
          <div 
            className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-10 animate-slideUp space-y-4 max-h-[85dvh] overflow-y-auto"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${getMeta(selectedNotification.type).iconBg}`}>
                  {getMeta(selectedNotification.type).icon}
                </div>
                <div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${getMeta(selectedNotification.type).bg}`}>
                    {getMeta(selectedNotification.type).label}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    {formatDateTime(selectedNotification.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Content */}
            <div className="space-y-2 py-1">
              <h2 className="text-sm font-black text-slate-900 leading-snug">
                {selectedNotification.title}
              </h2>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                  {selectedNotification.content}
                </p>
              </div>

              {selectedNotification.referenceId && (
                <div className="flex items-center gap-2 p-2.5 bg-slate-100/80 rounded-xl text-xs font-mono text-slate-600">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mã tham chiếu:</span>
                  <strong className="text-slate-800 font-black">#{selectedNotification.referenceId}</strong>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-bold transition-all min-h-[44px]"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => handleActionCTA(selectedNotification)}
                className="flex-1 py-3.5 rounded-2xl bg-[#064e3b] active:bg-emerald-950 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <span>{getMeta(selectedNotification.type).cta}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default MobileNotificationCenter;
