import React, { useState } from 'react';
import type { VenueResponse } from '../../types';
import { ConfirmModal } from '../../../../common/ui/overlay/ConfirmModal';

interface DraftFloaterProps {
  drafts: VenueResponse[];
  onResume: (venue: VenueResponse) => void;
  onDelete: (id: string) => Promise<void>;
}

export const DraftFloater = ({ drafts, onResume, onDelete }: DraftFloaterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getSportIcon = (sportId?: number) => {
    switch (sportId) {
      case 1:
        return (
          <span className="text-emerald-600 bg-emerald-50 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase border border-emerald-100">
            F
          </span>
        );
      case 2:
        return (
          <span className="text-orange-600 bg-orange-50 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase border border-orange-100">
            B
          </span>
        );
      case 3:
        return (
          <span className="text-sky-600 bg-sky-50 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase border border-sky-100">
            P
          </span>
        );
      case 4:
        return (
          <span className="text-amber-600 bg-amber-50 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase border border-amber-100">
            K
          </span>
        );
      default:
        return (
          <span className="text-slate-600 bg-slate-50 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase border border-slate-100">
            S
          </span>
        );
    }
  };

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIdToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!idToDelete) return;
    try {
      setDeletingId(idToDelete);
      await onDelete(idToDelete);
      localStorage.removeItem(`sporta_venue_draft_${idToDelete}`);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setIdToDelete(null);
    }
  };

  const formatUpdateDate = (dateString?: string) => {
    if (!dateString) return 'Vừa xong';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Vừa xong';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none font-sans flex flex-col items-end">
      
      {/* ── EXPANDED DRAFT LIST PANEL ────────────────────────────────────────── */}
      {isOpen && (
        <div className="mb-3.5 bg-white border border-slate-200/80 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-4.5 w-85 max-h-96 flex flex-col space-y-3.5 animate-slideDown overflow-hidden select-none pointer-events-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 block animate-pulse" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Bản nháp cụm sân ({drafts.length})
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-650 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* List Content */}
          <div className="overflow-y-auto space-y-2 flex-grow max-h-60 matrix-scroll pr-1 select-none">
            {drafts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                Không có bản nháp cụm sân nào đang chờ hoàn thiện.
              </div>
            ) : (
              drafts.map(draft => (
                <div
                  key={draft.id}
                  onClick={() => { onResume(draft); setIsOpen(false); }}
                  className="bg-slate-50/50 hover:bg-emerald-50/20 border border-slate-150 rounded-2xl p-2.5 flex items-center justify-between cursor-pointer transition-all active:scale-98 shadow-3xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Thumbnail or sport icon */}
                    {draft.coverImage ? (
                      <img
                        src={draft.coverImage}
                        alt="Thumbnail"
                        className="w-8 h-8 rounded-lg object-cover border border-slate-150 flex-shrink-0"
                      />
                    ) : (
                      getSportIcon(draft.sport?.id)
                    )}
                    
                    {/* Title and Date */}
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[11px] font-black text-slate-750 truncate leading-tight group-hover:text-brand-emerald transition-colors">
                        {draft.name || 'Cụm sân chưa đặt tên'}
                      </h5>
                      <span className="text-[8px] text-slate-400 font-bold block mt-0.5">
                        Cập nhật: {formatUpdateDate(draft.updatedAt as string || draft.createdAt as string)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onResume(draft); setIsOpen(false); }}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-brand-emerald hover:border-brand-emerald/30 transition-all cursor-pointer shadow-3xs"
                      title="Tiếp tục chỉnh sửa"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    
                    <button
                      type="button"
                      disabled={deletingId === draft.id}
                      onClick={(e) => handleDeleteClick(e, draft.id)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer shadow-3xs disabled:opacity-50"
                      title="Xóa bản nháp"
                    >
                      {deletingId === draft.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-650 rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ── TRIGGER BUTTON ───────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-slate-800 hover:bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer relative border border-slate-700/60"
        title="Danh sách bản nháp"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        
        {/* Count Badge */}
        {drafts.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-900 font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs animate-bounce">
            {drafts.length}
          </span>
        )}
      </button>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setIdToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bản nháp"
        message="CẢNH BÁO: Bạn có chắc chắn muốn xóa bản nháp cụm sân này? Thao tác này sẽ xóa vĩnh viễn dữ liệu nháp và không thể khôi phục."
        confirmText="Xóa bản nháp"
        cancelText="Hủy"
        variant="danger"
      />

    </div>
  );
};
export default DraftFloater;
