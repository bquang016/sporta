import React from 'react';
import type { VenueResponse, CourtResponse } from '../../types';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Plus, 
  Edit3, 
  Power, 
  Trash2, 
  ArrowRight, 
  Layers, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface MobileVenueManagerTabProps {
  venues: VenueResponse[];
  courts: CourtResponse[];
  activeVenueId: string | null;
  draftVenues: any[];
  onSelectVenue: (venueId: string) => void;
  onCreateVenue: () => void;
  onEditVenue: (venueId: string) => void;
  onOpenVenueStatus: (venueId: string) => void;
  onResumeDraft: (draft: any) => void;
  onDeleteDraft: (draftId: string) => void;
  formatVND: (n: number) => string;
}

export const MobileVenueManagerTab: React.FC<MobileVenueManagerTabProps> = ({
  venues,
  courts,
  activeVenueId,
  draftVenues,
  onSelectVenue,
  onCreateVenue,
  onEditVenue,
  onOpenVenueStatus,
  onResumeDraft,
  onDeleteDraft,
  formatVND: _formatVND
}) => {
  return (
    <div className="space-y-4 px-4 pb-8 select-none" style={{ touchAction: 'pan-y' }}>
      {/* 1. Create Venue Header CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Danh sách cơ sở ({venues.length})</h3>
          <p className="text-[10px] text-slate-400 font-medium">Quản lý và thiết lập các cụm sân của bạn</p>
        </div>

        <button
          type="button"
          onClick={onCreateVenue}
          className="touch-target bg-brand-emerald active:bg-emerald-950 text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1 active:scale-95 border-b-2 border-emerald-950"
        >
          <Plus className="w-3.5 h-3.5 text-brand-yellow stroke-[3]" />
          <span>Thêm cụm mới</span>
        </button>
      </div>

      {/* 2. Draft Venues Banner (If any) */}
      {draftVenues && draftVenues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-600" />
            <span>Bản nháp chưa gửi duyệt ({draftVenues.length})</span>
          </h4>
          {draftVenues.map((draft, idx) => (
            <div 
              key={draft.id || idx}
              className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="min-w-0">
                <p className="text-xs font-black text-amber-950 truncate">
                  {draft.name || 'Bản nháp cơ sở mới'}
                </p>
                <p className="text-[10px] text-amber-700 font-medium truncate mt-0.5">
                  Lưu lúc: {draft.savedAt ? new Date(draft.savedAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onResumeDraft(draft)}
                  className="touch-target px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-2xs"
                >
                  Tiếp tục
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteDraft(draft.id)}
                  className="touch-target p-1.5 text-amber-700 hover:text-red-600 rounded-lg"
                  title="Xóa bản nháp"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Venues List Cards */}
      <div className="space-y-3">
        {venues.map(venue => {
          const venueCourts = courts.filter(c => c.venueId === venue.id);
          const isSelected = activeVenueId === venue.id;
          const status = venue.status || 'ACTIVE';

          return (
            <div
              key={venue.id}
              className={`bg-white rounded-3xl p-4 border transition-all shadow-2xs space-y-3 ${
                isSelected 
                  ? 'border-brand-emerald ring-2 ring-brand-emerald/20 bg-emerald-50/10' 
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Header: Name, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black shadow-2xs ${
                    isSelected ? 'bg-brand-emerald text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 truncate tracking-tight">
                      {venue.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{venue.addressDetail || venue.location || 'Địa chỉ đang cập nhật'}</span>
                    </p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                  status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-900 border border-amber-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {status === 'ACTIVE' ? 'Đang mở' : 'Tạm đóng'}
                </span>
              </div>

              {/* Venue Specs Strip */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-600">
                <div className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>{venueCourts.length} sân trực thuộc</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{venue.openingTime || '06:00'} - {venue.closingTime || '23:00'}</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onSelectVenue(venue.id)}
                  className={`touch-target col-span-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-transform ${
                    isSelected 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>{isSelected ? 'Đang chọn' : 'Vận hành'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEditVenue(venue.id)}
                  className="touch-target col-span-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 active:scale-95"
                >
                  <Edit3 className="w-3 h-3 text-slate-500" />
                  <span>Sửa thông tin</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenVenueStatus(venue.id)}
                  className="touch-target col-span-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 active:scale-95"
                >
                  <Power className="w-3 h-3 text-slate-500" />
                  <span>Đổi trạng thái</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default MobileVenueManagerTab;
