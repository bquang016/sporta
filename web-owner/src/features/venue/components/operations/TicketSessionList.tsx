import React, { useState } from 'react';
import type { TicketSessionResponse, TestTicketResponse } from '../../types/ticket.types';
import { getSportLevelLabel } from '../../hooks/useTicketSessions';
import { Users, Tag, Clock, Calendar, ShieldCheck, Ticket, Copy, Check } from 'lucide-react';
import { Modal } from '../../../../common/ui/overlay/Modal';

interface TicketSessionListProps {
  sessions: TicketSessionResponse[];
  loading: boolean;
  onCreateClick: () => void;
  onScanClick: () => void;
  getTestTickets: (sessionId: string) => Promise<TestTicketResponse[]>;
}

export const TicketSessionList: React.FC<TicketSessionListProps> = ({
  sessions,
  loading,
  onCreateClick,
  onScanClick,
  getTestTickets,
}) => {
  const [testTicketsModalOpen, setTestTicketsModalOpen] = useState(false);
  const [testTickets, setTestTickets] = useState<TestTicketResponse[]>([]);
  const [loadingTestTickets, setLoadingTestTickets] = useState(false);
  const [selectedSessionName, setSelectedSessionName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleOpenTestTickets = async (sessionId: string, courtName: string, timeStr: string) => {
    setLoadingTestTickets(true);
    setTestTickets([]);
    setSelectedSessionName(`${courtName} (${timeStr})`);
    setTestTicketsModalOpen(true);
    try {
      const tickets = await getTestTickets(sessionId);
      setTestTickets(tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTestTickets(false);
    }
  };

  const handleCopyToken = (token: string, ticketId: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(ticketId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-10 h-10 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400">Đang tải danh sách ca xé vé...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header operations row */}
      <div className="flex justify-between items-center bg-white border border-slate-200/60 p-4 rounded-3xl shadow-sm">
        <div className="space-y-0.5">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Danh sách ca xé vé</h3>
          <p className="text-[10px] text-slate-400 font-semibold leading-normal">
            Hôm nay sân đấu có {sessions.length} ca xé vé đang vận hành
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onScanClick}
            className="bg-primary hover:bg-slate-800 text-white font-extrabold text-[10px] px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 border-b-2 border-slate-950 uppercase tracking-wider"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-yellow animate-pulse" />
            Quét QR Check-in
          </button>
          <button
            onClick={onCreateClick}
            className="bg-brand-emerald hover:bg-emerald-800 text-white font-extrabold text-[10px] px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 border-b-2 border-emerald-950 uppercase tracking-wider"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Tạo ca xé vé
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-16 shadow-sm flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center shadow-xs">
            <Ticket className="w-8 h-8 text-slate-350" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-800">Chưa có ca xé vé nào trong hôm nay</h4>
            <p className="text-xs text-slate-400 font-semibold max-w-sm leading-relaxed">
              Tạo ca xé vé để khách lẻ có thể đăng ký tham gia ghép cặp, chia sẻ chi phí chơi thể thao.
            </p>
          </div>
          <button
            onClick={onCreateClick}
            className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-brand-emerald text-xs font-black rounded-xl transition-all cursor-pointer uppercase tracking-wider"
          >
            Tạo trận ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sessions.map((session) => {
            const bookedPercent = Math.min(100, (session.bookedSlots / session.maxSlots) * 100);
            const timeStr = `${session.startTime.substring(0, 5)} - ${session.endTime.substring(0, 5)}`;
            const isFull = session.bookedSlots >= session.maxSlots;

            return (
              <div
                key={session.id}
                className="bg-white border border-slate-200/70 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Court Name & Status Tag */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800">{session.courtName}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-bold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{timeStr}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border tracking-widest ${
                      isFull
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-emerald-50 text-brand-emerald border-emerald-100'
                    }`}
                  >
                    {isFull ? 'Đầy chỗ' : 'Còn trống'}
                  </span>
                </div>

                {/* Properties: Level, Price */}
                <div className="grid grid-cols-2 gap-3.5 py-3 border-y border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Trình độ</p>
                      <p className="text-xs font-extrabold text-slate-750 truncate">
                        {getSportLevelLabel(session.sportLevel)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Giá vé</p>
                      <p className="text-xs font-extrabold text-brand-emerald">
                        {formatVND(session.pricePerTicket)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar slots */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
                    <span>Số lượng vé</span>
                    <span>
                      {session.bookedSlots}/{session.maxSlots} slots
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isFull ? 'bg-amber-400' : 'bg-brand-emerald'
                      }`}
                      style={{ width: `${bookedPercent}%` }}
                    />
                  </div>
                </div>

                {/* Test button code copy */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenTestTickets(session.id, session.courtName, timeStr)}
                    className="text-[10px] font-black text-slate-450 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5 text-slate-400" />
                    Vé test (Lấy mã QR)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Internal Test Tickets Code Modal */}
      <Modal
        isOpen={testTicketsModalOpen}
        onClose={() => setTestTicketsModalOpen(false)}
        title="Danh sách vé test (QR Token)"
        maxWidth="md"
      >
        <div className="space-y-4 py-1">
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Đây là các vé thử nghiệm được tạo tự động cho trận xé vé: <strong className="text-slate-800">{selectedSessionName}</strong>. 
            Sao chép mã Token và dán vào tab **Nhập mã thủ công** để mô phỏng quét camera check-in.
          </p>

          {loadingTestTickets ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : testTickets.length === 0 ? (
            <div className="text-center text-xs text-slate-400 font-bold py-6">
              Không tìm thấy vé test cho ca này.
            </div>
          ) : (
            <div className="space-y-3.5">
              {testTickets.map((t) => (
                <div key={t.ticketId} className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex justify-between items-center border-b border-slate-200/50 pb-1.5">
                    <span className="text-xs font-black text-slate-850">{t.customerName}</span>
                    <button
                      onClick={() => handleCopyToken(t.qrCodeToken, t.ticketId)}
                      className={`text-[9px] font-black px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                        copiedId === t.ticketId
                          ? 'bg-emerald-50 text-brand-emerald border-emerald-100'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {copiedId === t.ticketId ? (
                        <>
                          <Check className="w-3 h-3" />
                          Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Sao chép Token
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-[9px] bg-slate-900 text-slate-400 p-2.5 rounded-xl break-all max-h-24 overflow-y-auto select-all">
                    {t.qrCodeToken}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setTestTicketsModalOpen(false)}
            className="w-full py-2.5 mt-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
          >
            Đóng lại
          </button>
        </div>
      </Modal>
    </div>
  );
};
