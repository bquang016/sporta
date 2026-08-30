import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { ContractPreview } from '../../registration/components/ContractPreview';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';
import { ArrowLeft, Download, Printer } from 'lucide-react';

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

interface ContractFullscreenModalProps {
  contract: ContractInfo;
  onClose: () => void;
}

export const ContractFullscreenModal: React.FC<ContractFullscreenModalProps> = ({ contract, onClose }) => {
  useBodyScrollLock(true);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const personalInfo = {
    fullName: contract.ownerFullName,
    idNumber: contract.ownerIdCard,
    idFrontImage: null,
    idBackImage: null,
    phone: '', 
    dateOfBirth: '',
    hometown: '',
  };

  const venueInfo = {
    name: contract.venueName,
    province: '',
    district: '',
    ward: '',
    addressDetail: contract.venueAddress || '',
    coverImage: null,
    registrationImages: [],
    latitude: 0,
    longitude: 0,
    description: '',
    sportId: null,
    subCourtCount: 1,
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999999] overflow-y-auto print:bg-white print:overflow-visible font-sans animate-fadeIn select-none">
      {/* Top Header - Sticky with safe area padding */}
      <div 
        className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4 sm:px-6 shadow-sm print:hidden"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0.5rem)', paddingBottom: '0.5rem' }}
      >
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="touch-target w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div className="min-w-0">
            <h3 className="font-black text-slate-800 text-sm sm:text-base tracking-tight truncate">
              Văn Bản Hợp Đồng Điện Tử
            </h3>
            <p className="text-[10px] sm:text-xs font-mono font-bold text-slate-500">
              Mã: {contract.contractCode}
            </p>
          </div>
        </div>

        <button 
          type="button"
          onClick={handlePrint}
          className="touch-target flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-emerald active:bg-emerald-950 text-white font-black text-xs hover:bg-emerald-800 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">In / Tải về (PDF)</span>
          <span className="sm:hidden">Tải PDF</span>
        </button>
      </div>

      {/* Contract Paper Content */}
      <div 
        className="py-6 sm:py-10 px-3 sm:px-6 flex justify-center print:py-0 print:px-0" 
        ref={printRef}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}
      >
        <ContractPreview 
          personalInfo={personalInfo}
          venueInfo={venueInfo as any}
          isSigned={true}
          signatureData={{
            timestamp: contract.signedAt,
            ip: contract.signedIpAddress || 'Hệ thống Sporta'
          }}
          contractCode={contract.contractCode}
        />
      </div>
    </div>,
    document.body
  );
};
export default ContractFullscreenModal;
