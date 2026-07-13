import React, { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { ReconciliationRecord } from './ReconciliationTable';

interface ReconciliationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ReconciliationRecord | null;
  onConfirmReconcile: (record: ReconciliationRecord) => void;
  formatCurrency: (val: number) => string;
}

// Sub-interface for transaction breakdown
interface MockBookingBreakdown {
  bookingId: string;
  customerName: string;
  playDate: string;
  timeSlot: string;
  paymentMethod: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
}

export const ReconciliationDetailModal: React.FC<ReconciliationDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onConfirmReconcile,
  formatCurrency
}) => {
  const { showToast } = useToast();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', `Đã sao chép ${label}!`);
  };

  // Generate dynamic mock breakdowns based on the selected reconciliation record details
  const breakdownList = useMemo<MockBookingBreakdown[]>(() => {
    if (!record) return [];

    // Let's create high-fidelity sub-bookings that sum up to grossAmount
    // We'll generate 2-3 items dynamically so it matches any amount nicely
    const count = 3;
    const baseAmount = Math.floor(record.grossAmount / count);
    const playDates = ['2026-07-08', '2026-07-10', '2026-07-11'];
    const timeSlots = ['17:30 - 19:00', '19:00 - 20:30', '18:00 - 20:00'];
    const customers = ['Nguyễn Hoàng Long', 'Trần Lê Quốc Anh', 'Phạm Minh Đức'];
    const paymentMethods = ['MOMO', 'VNPAY', 'MOMO'];

    const items: MockBookingBreakdown[] = [];
    let accumulatedGross = 0;

    for (let i = 0; i < count; i++) {
      let gross = baseAmount;
      // Adjust last item to equal exactly the grossAmount due to rounding division
      if (i === count - 1) {
        gross = record.grossAmount - accumulatedGross;
      }
      accumulatedGross += gross;

      const comm = Math.round(gross * record.commissionRate);
      const net = gross - comm;

      items.push({
        bookingId: `BK-99${201 + i + parseInt(record.id.slice(-2) || '0')}`,
        customerName: customers[i],
        playDate: playDates[i],
        timeSlot: timeSlots[i],
        paymentMethod: paymentMethods[i],
        grossAmount: gross,
        commissionAmount: comm,
        netAmount: net
      });
    }

    return items;
  }, [record]);

  if (!record) return null;

  // Map user bank to VietQR standard Bank Codes (MB, VCB, TCB, BIDV, etc.)
  // If not recognized, we fall back to a default format
  const getVietQRBankCode = (bankName: string) => {
    const uppercaseName = bankName.toUpperCase();
    if (uppercaseName.includes('MB') || uppercaseName.includes('MILITARY')) return 'MB';
    if (uppercaseName.includes('TECHCOMBANK') || uppercaseName.includes('TCB')) return 'TCB';
    if (uppercaseName.includes('VIETCOMBANK') || uppercaseName.includes('VCB')) return 'VCB';
    if (uppercaseName.includes('BIDV')) return 'BIDV';
    if (uppercaseName.includes('VIETINBANK') || uppercaseName.includes('CTG')) return 'ICB';
    if (uppercaseName.includes('ACB')) return 'ACB';
    if (uppercaseName.includes('VPBANK') || uppercaseName.includes('VPB')) return 'VPB';
    if (uppercaseName.includes('SACOMBANK')) return 'STB';
    return 'MB'; // Fallback to MB
  };

  const bankCode = getVietQRBankCode(record.bankName);
  
  // Format transfer description (message format: "Sporta thanh toan doi soat [Cụm sân] [Chu kỳ]")
  // Remove accents and special characters for standard bank message parsing
  const cleanVietnamese = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const cleanFacility = cleanVietnamese(record.facilityCluster).slice(0, 15).replace(/\s/g, '');
  const cleanCycle = record.cycle.replace(/[^0-9]/g, '').slice(0, 8);
  const transferMessage = `SPORTA DS ${cleanFacility} K${cleanCycle}`;

  // VietQR endpoint format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-compact2.jpg?amount=<AMOUNT>&addInfo=<MESSAGE>&accountName=<ACCOUNT_NAME>
  const vietQrUrl = `https://img.vietqr.io/image/${bankCode}-${record.bankAccountNo}-compact2.jpg?amount=${record.netPayoutAmount}&addInfo=${encodeURIComponent(transferMessage)}&accountName=${encodeURIComponent(record.bankAccountName)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={`Chi tiết đối soát: ${record.facilityCluster}`}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1 select-none">
            {record.reconciledAt ? `Thanh toán lúc: ${new Date(record.reconciledAt).toLocaleString('vi-VN')}` : 'Chưa đối soát chuyển khoản'}
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} size="sm" className="text-xs">
              Đóng
            </Button>
            {record.status === 'PENDING' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onConfirmReconcile(record);
                }}
                className="bg-brand-emerald text-white font-bold text-xs"
              >
                Xác nhận đã chuyển khoản
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Section: Split Info & VietQR Code */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Billing & Owner Details (Col: 7) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Owner Section */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Đối tác thụ hưởng</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500">Tên chủ sân: <span className="font-bold text-slate-800">{record.ownerName}</span></p>
                <p className="text-xs font-semibold text-slate-500">Email liên hệ: <span className="font-mono font-bold text-slate-700">{record.ownerEmail}</span></p>
                <p className="text-xs font-semibold text-slate-500">Cụm sân bãi: <span className="font-bold text-slate-800">{record.facilityCluster}</span></p>
                <p className="text-xs font-semibold text-slate-500">Kỳ đối soát: <span className="font-bold text-amber-700">{record.cycle}</span></p>
              </div>
            </div>

            {/* Bank details with quick copies */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tài khoản thanh toán</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Ngân hàng nhận:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">{record.bankName}</span>
                    <button
                      onClick={() => handleCopy(record.bankName, 'tên ngân hàng')}
                      className="p-1 rounded text-slate-400 hover:text-brand-emerald hover:bg-slate-200/50 transition-colors"
                      title="Sao chép tên ngân hàng"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 font-mono text-sm">{record.bankAccountNo}</span>
                    <button
                      onClick={() => handleCopy(record.bankAccountNo, 'số tài khoản')}
                      className="p-1 rounded text-slate-400 hover:text-brand-emerald hover:bg-slate-200/50 transition-colors"
                      title="Sao chép số tài khoản"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Chủ tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 uppercase">{record.bankAccountName}</span>
                    <button
                      onClick={() => handleCopy(record.bankAccountName, 'tên chủ tài khoản')}
                      className="p-1 rounded text-slate-400 hover:text-brand-emerald hover:bg-slate-200/50 transition-colors"
                      title="Sao chép tên chủ tài khoản"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial summaries */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cân đối tài chính</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Tổng tiền đặt cọc/thanh toán Online:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(record.grossAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Phần hoa hồng Sporta giữ lại ({(record.commissionRate * 100).toFixed(0)}%):</span>
                  <span className="font-bold text-red-500">-{formatCurrency(record.commissionAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2 font-semibold">
                  <span className="text-slate-800 font-bold">Số dư thực thanh toán cho đối tác:</span>
                  <span className="font-black text-brand-emerald text-sm">{formatCurrency(record.netPayoutAmount)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* VietQR dynamic code generator (Col: 5) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 self-start">VietQR Chuyển Khoản Nhanh</h4>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col items-center w-full max-w-[280px] lg:max-w-full text-center">
              
              {record.status === 'PENDING' ? (
                <>
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl mb-3 shadow-inner">
                    <img 
                      src={vietQrUrl} 
                      alt="VietQR Payout Code" 
                      className="w-48 h-48 object-contain rounded-xl select-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Quét QR chuyển tiền</p>
                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed max-w-[220px]">
                      Mở app ngân hàng quét mã này để điền sẵn TK nhận, số tiền <span className="font-bold text-brand-emerald">{formatCurrency(record.netPayoutAmount)}</span> và nội dung chuyển.
                    </p>
                  </div>
                  <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 w-full flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500 font-bold truncate">Nội dung: {transferMessage}</span>
                    <button
                      onClick={() => handleCopy(transferMessage, 'nội dung chuyển tiền')}
                      className="text-[9px] font-black text-brand-emerald uppercase tracking-wider pl-1.5"
                    >
                      Copy
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-brand-emerald flex items-center justify-center border border-emerald-100">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Đã hoàn thành</p>
                    <p className="text-[10px] text-slate-400 font-medium max-w-[200px] leading-relaxed">
                      Kỳ đối soát này đã được thanh toán và lưu lịch sử thành công.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Transaction Breakdown (list of bookings) */}
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bảng phân rã giao dịch cấu thành</h4>
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="max-h-56 overflow-y-auto matrix-scroll">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/50 sticky top-0 backdrop-blur-sm z-10 select-none">
                  <tr>
                    <th className="px-4 py-2.5">Mã đơn</th>
                    <th className="px-4 py-2.5">Khách hàng</th>
                    <th className="px-4 py-2.5">Ngày chơi</th>
                    <th className="px-4 py-2.5">Thời gian</th>
                    <th className="px-4 py-2.5 text-right">Khách trả</th>
                    <th className="px-4 py-2.5 text-right text-red-500">Hoa hồng</th>
                    <th className="px-4 py-2.5 text-right text-brand-emerald">Thực nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                  {breakdownList.map((item) => (
                    <tr key={item.bookingId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">#{item.bookingId}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{item.customerName}</td>
                      <td className="px-4 py-3 text-slate-500 font-medium">
                        {new Date(item.playDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-bold">{item.timeSlot}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.grossAmount)}</td>
                      <td className="px-4 py-3 text-right text-red-500 font-semibold">-{formatCurrency(item.commissionAmount)}</td>
                      <td className="px-4 py-3 text-right font-black text-brand-emerald">{formatCurrency(item.netAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};
