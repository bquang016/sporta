import React, { useState, useEffect } from 'react';
import { ContractFullscreenModal } from './ContractFullscreenModal';

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
}

export const ContractsListModal = ({ isOpen, onClose }: ContractsListModalProps) => {
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(null);

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

      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const response = await fetch(`http://${host}:8387/api/v1/owner/contracts`, {
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

  // If a contract is selected, render the fullscreen view instead
  if (selectedContract) {
    return (
      <ContractFullscreenModal 
        contract={selectedContract} 
        onClose={() => setSelectedContract(null)} 
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">Hợp đồng Hợp tác</h2>
              <p className="text-xs text-slate-500 font-medium">Danh sách các hợp đồng bạn đã ký kết với Sporta</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto matrix-scroll flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-emerald rounded-full animate-spin"></div>
              <p className="mt-4 text-xs font-bold text-slate-500">Đang tải danh sách hợp đồng...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">Chưa có hợp đồng nào</p>
              <p className="text-xs text-slate-500 mt-1">Các hợp đồng sau khi đăng ký cụm sân thành công sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map(contract => (
                <div 
                  key={contract.id}
                  onClick={() => setSelectedContract(contract)}
                  className="p-4 border border-slate-200 rounded-xl hover:border-brand-emerald hover:shadow-md transition-all cursor-pointer bg-white group flex items-center justify-between"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 text-brand-emerald flex items-center justify-center font-bold">
                      PDF
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 group-hover:text-brand-emerald transition-colors">
                        Hợp đồng {contract.venueName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Mã: {contract.contractCode}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Ký ngày: {new Date(contract.signedAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-brand-emerald text-[10px] font-black uppercase tracking-wider">
                      {contract.status === 'ACTIVE' ? 'Đang hiệu lực' : contract.status}
                    </span>
                    <button className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-brand-emerald group-hover:text-white flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
