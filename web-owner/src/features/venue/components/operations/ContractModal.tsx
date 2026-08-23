import React, { useRef } from 'react';
import { useVenueWizard } from './VenueWizardContext';
import { ContractPreview } from './ContractPreview';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOtp: () => void;
}

export const ContractModal = ({
  isOpen,
  onClose,
  onOpenOtp,
}: ContractModalProps) => {
  const { isAgreedToTerms, setIsAgreedToTerms, isContractSigned, signatureData } = useVenueWizard();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 overflow-hidden animate-fadeIn">
      {/* ── HEADER ── */}
      <div className="shrink-0 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10 print:hidden">
        <div>
          <h2 className="text-lg font-black text-slate-800">Hợp đồng Hợp tác Dịch vụ</h2>
          <p className="text-[11px] text-slate-500 font-medium">Vui lòng đọc kỹ và ký xác nhận bằng mã OTP</p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── BODY (Scrollable Contract) ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100/50 print:p-0 print:bg-white" ref={printRef}>
        <div className="max-w-4xl mx-auto print:max-w-full">
          <ContractPreview />

          {!isContractSigned && (
            <div className="mt-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5">
                  <input
                    id="terms-modal"
                    type="checkbox"
                    checked={isAgreedToTerms}
                    onChange={(e) => setIsAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 border border-slate-300 rounded bg-slate-50 focus:ring-3 focus:ring-brand-emerald/30 checked:bg-brand-emerald checked:border-brand-emerald transition-colors cursor-pointer"
                  />
                </div>
                <label htmlFor="terms-modal" className="text-sm font-medium text-slate-700 leading-relaxed cursor-pointer select-none">
                  Tôi đã đọc, hiểu và đồng ý với toàn bộ <span className="font-bold text-slate-900">Điều khoản Hợp đồng Hợp tác Dịch vụ Sporta</span>. Tôi cam kết các thông tin cung cấp ở trên là hoàn toàn chính xác.
                </label>
              </div>
            </div>
          )}

          {/* Success Download Prompt */}
          {isContractSigned && (
            <div className="mt-6 bg-emerald-50 p-6 rounded-xl border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-emerald-800 font-bold text-base">Ký kết thành công!</h4>
                  <p className="text-emerald-600/80 text-xs font-medium">Bạn có muốn tải bản sao hợp đồng về máy (PDF)?</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white border border-emerald-300 text-emerald-700 font-bold text-xs rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Tải xuống PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER (Actions) ── */}
      {!isContractSigned && (
        <div className="shrink-0 h-20 bg-white border-t border-slate-200 px-6 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] print:hidden z-10">
          <div className="text-xs text-slate-500 font-medium">
            Cuộn xuống để đọc hết nội dung hợp đồng
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenOtp();
              }}
              disabled={!isAgreedToTerms}
              className={`px-8 py-2.5 rounded-xl text-white font-black text-xs shadow-md transition-all cursor-pointer ${
                isAgreedToTerms
                  ? 'bg-brand-emerald hover:bg-emerald-700 active:scale-95'
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              Ký bằng OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
