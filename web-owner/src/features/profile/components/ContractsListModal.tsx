import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ContractFullscreenModal } from './ContractFullscreenModal';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';
import { API_BASE_URL } from '../../../services/apiConfig';
import { 
  FileText, 
  ShieldCheck, 
  Building2, 
  Eye, 
  X, 
  Download
} from 'lucide-react';

interface ContractsListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContractInfo {
  id: number;
  contractCode: string;
  venueName: string;
  digitalSignatureHash: string;
  signedIpAddress: string;
  signedAt: string;
  status: string;
  ownerFullName: string;
  ownerIdCard: string;
  venueAddress?: string;
}

export const ContractsListModal: React.FC<ContractsListModalProps> = ({ isOpen, onClose }) => {
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(null);

  useBodyScrollLock(isOpen || !!selectedContract);

  useEffect(() => {
    if (isOpen) {
      fetchContracts();
    }
  }, [isOpen]);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/owner/contracts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !selectedContract) return null;
  if (typeof document === 'undefined') return null;

  // If a contract is selected, render the fullscreen view instead
  if (selectedContract) {
    return createPortal(
      <ContractFullscreenModal 
        contract={selectedContract} 
        onClose={() => setSelectedContract(null)} 
      />,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-0 sm:p-4 select-none">
      {/* Backdrop Dismiss */}
      <div className="fixed inset-0" onClick={onClose} />
      
      {/* Container: Bottom Sheet on Mobile, Centered Card on Desktop */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl z-10 flex flex-col max-h-[88dvh] sm:max-h-[85vh] animate-slideUp sm:animate-in sm:zoom-in-95 duration-200 overflow-hidden font-sans border border-slate-200/80"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-[#064e3b] to-emerald-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-brand-yellow backdrop-blur-md shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black tracking-tight text-white">Hợp Đồng & Pháp Lý</h2>
                <span className="px-2 py-0.2 rounded-full bg-brand-yellow text-[#064e3b] text-[9px] font-black uppercase">
                  Điện tử
                </span>
              </div>
              <p className="text-[11px] text-white/70 font-medium mt-0.5">Danh sách văn bản hợp tác ký kết với Sporta</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="touch-target w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors backdrop-blur-md"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-slate-200 border-t-brand-emerald rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">Đang tải danh sách hợp đồng...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="py-10 text-center space-y-3 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800">Chưa có hợp đồng nào</h4>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Khi bạn tạo cụm sân mới và hoàn tất ký điện tử, hợp đồng sẽ hiển thị tại đây.</p>
              </div>
            </div>
          ) : (
            contracts.map((c) => (
              <div 
                key={c.id} 
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-all space-y-3 relative overflow-hidden"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-brand-emerald" />
                        <span>ĐÃ KÝ KẾT • CÓ HIỆU LỰC</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {c.contractCode}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight pt-0.5 truncate flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{c.venueName}</span>
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedContract(c)}
                    className="touch-target px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-brand-emerald text-xs font-black flex items-center gap-1 active:scale-95 transition-all shrink-0 shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem chi tiết</span>
                  </button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-100 bg-slate-50/60 -mx-4 -mb-4 p-4 rounded-b-3xl">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Chủ thể ký kết</span>
                    <span className="font-black text-slate-800 truncate block mt-0.5">{c.ownerFullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Số CCCD / CMND</span>
                    <span className="font-mono font-bold text-slate-700 truncate block mt-0.5">{c.ownerIdCard || 'Đã xác minh'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 font-bold block">Thời gian ký kết</span>
                    <span className="font-bold text-slate-700 truncate block mt-0.5">
                      {new Date(c.signedAt).toLocaleDateString('vi-VN')} {new Date(c.signedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
export default ContractsListModal;
