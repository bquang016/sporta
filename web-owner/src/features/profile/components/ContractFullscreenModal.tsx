import React, { useRef } from 'react';
import { ContractPreview } from '../../registration/components/ContractPreview';

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

export const ContractFullscreenModal = ({ contract, onClose }: ContractFullscreenModalProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Map API response to the format ContractPreview expects
  const personalInfo = {
    fullName: contract.ownerFullName,
    gender: '',
    phoneNumber: '',
    idNumber: contract.ownerIdCard,
    nationality: 'Việt Nam',
    hometown: '',
    permanentAddress: '',
    idFrontImage: null,
    idBackImage: null,
  };

  // We only have venueAddress in the DTO, so we'll just put it all in province/district
  // since ContractPreview formats it as: `${venueInfo.addressDetail}, ${venueInfo.ward}, ${venueInfo.district}, ${venueInfo.province}`
  // We can just put the full address in addressDetail and leave others empty.
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

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 overflow-y-auto print:bg-white print:overflow-visible">
      {/* Top Header - hidden when printing */}
      <div className="sticky top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-10 flex items-center justify-between px-6 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center transition-all focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h3 className="font-black text-slate-800">Chi tiết Hợp đồng</h3>
            <p className="text-[10px] text-slate-500 font-medium">Mã: {contract.contractCode}</p>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-emerald text-white font-bold text-xs hover:bg-emerald-900 shadow-sm transition-all focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Tải về (PDF)
        </button>
      </div>

      {/* Contract Content */}
      <div className="py-12 px-4 print:py-0 print:px-0" ref={printRef}>
        <ContractPreview 
          personalInfo={personalInfo}
          venueInfo={venueInfo as any}
          isSigned={true}
          signatureData={{
            timestamp: contract.signedAt,
            ip: contract.signedIpAddress || 'Hệ thống lưu trữ'
          }}
          contractCode={contract.contractCode}
        />
      </div>
    </div>
  );
};
