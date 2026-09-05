import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { API_BASE_URL } from '@/api/config';

interface LockReason {
  id: number;
  role: string;
  reasonText: string;
  isDefault: boolean;
}

interface SmartLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (category: string, detail: string) => Promise<void>;
  roleType: 'PLAYER' | 'OWNER';
  userName: string;
  userEmail: string;
}

export const SmartLockModal: React.FC<SmartLockModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  roleType,
  userName,
  userEmail
}) => {
  const { showToast } = useToast();
  const [reasons, setReasons] = useState<LockReason[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [detailReason, setDetailReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Configuration mode states (Super Admin only)
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [newReasonText, setNewReasonText] = useState<string>('');
  const [isAddingReason, setIsAddingReason] = useState<boolean>(false);
  const [isDeletingReason, setIsDeletingReason] = useState<number | null>(null);

  const adminRole = localStorage.getItem('role') || 'ADMIN';
  const isSuperAdmin = adminRole === 'SUPER_ADMIN';

  // Fetch lock reasons from backend
  const fetchReasons = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/lock-reasons?role=${roleType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể tải danh sách lý do');
      }
      const data = await response.json();
      setReasons(data);
      
      // Auto select first reason if available
      if (data.length > 0) {
        setSelectedReason(data[0].reasonText);
      } else {
        setSelectedReason('Khác');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi kết nối máy chủ khi tải lý do');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReasons();
      setDetailReason('');
      setShowConfig(false);
      setNewReasonText('');
    }
  }, [isOpen, roleType]);

  // Handle adding new lock reason
  const handleAddReason = async () => {
    if (!newReasonText.trim()) {
      showToast('warning', 'Vui lòng nhập nội dung lý do mới');
      return;
    }
    setIsAddingReason(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/lock-reasons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: roleType,
          reasonText: newReasonText.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Thêm lý do thất bại');
      }

      showToast('success', 'Đã thêm lý do khóa mới');
      setNewReasonText('');
      fetchReasons();
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi thêm lý do');
    } finally {
      setIsAddingReason(false);
    }
  };

  // Handle deleting a lock reason
  const handleDeleteReason = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lý do khóa này?')) return;
    setIsDeletingReason(id);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/lock-reasons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Xóa lý do thất bại');
      }

      showToast('success', 'Đã xóa lý do khóa thành công');
      fetchReasons();
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi xóa lý do');
    } finally {
      setIsDeletingReason(null);
    }
  };

  // Handle locking user
  const handleConfirmLock = async () => {
    if (!selectedReason) {
      showToast('warning', 'Vui lòng chọn danh mục lý do khóa');
      return;
    }
    if (!detailReason.trim()) {
      showToast('warning', 'Vui lòng nhập mô tả chi tiết hành vi vi phạm (bắt buộc)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(selectedReason, detailReason.trim());
      onClose();
    } catch (err: any) {
      // Toast error is handled by caller or we can show it here
      showToast('error', err.message || 'Khóa tài khoản thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={`Khóa Tài Khoản: ${roleType === 'PLAYER' ? 'Người Chơi' : 'Chủ Sân'}`}
      footer={
        <div className="flex gap-3 justify-end w-full">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmLock}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {isSubmitting ? 'Đang thực hiện...' : 'Xác nhận khóa'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* User Card Info */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase text-red-600 bg-red-50 border border-red-200/50 px-2.5 py-0.5 rounded-full">
              Tác vụ cảnh báo
            </span>
          </div>
          <p className="text-sm font-bold text-slate-800 mt-1">
            Họ Tên: <span className="font-black text-brand-emerald">{userName}</span>
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Email: <span className="font-mono">{userEmail}</span>
          </p>
        </div>

        {/* Dropdown with Gear Icon */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Lý do gợi ý có sẵn <span className="text-red-500">*</span>
            </label>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className={`p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-brand-emerald transition-all duration-300 focus:outline-none cursor-pointer ${showConfig ? 'rotate-45 text-brand-emerald bg-emerald-50' : ''}`}
                title="Cấu hình danh sách lý do khóa"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="flex-1 px-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all cursor-pointer"
              disabled={isLoading || showConfig}
            >
              {isLoading ? (
                <option>Đang tải danh sách lý do...</option>
              ) : (
                <>
                  {reasons.map((r) => (
                    <option key={r.id} value={r.reasonText}>
                      {r.reasonText}
                    </option>
                  ))}
                  <option value="Khác">Khác (Nhập chi tiết ở ô mô tả)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Super Admin Inline Configuration Panel */}
        {showConfig && isSuperAdmin && (
          <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top duration-300">
            <h4 className="text-xs font-black text-brand-emerald uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald"></span>
              Cấu hình lý do khóa (Chỉ Super Admin)
            </h4>

            {/* List reasons with delete */}
            <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 pr-1 matrix-scroll">
              {reasons.map((r) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600 font-semibold leading-normal flex-1">
                    {r.reasonText}
                    {r.isDefault && (
                      <span className="text-[10px] bg-slate-200 text-slate-500 font-bold uppercase px-1.5 py-0.5 rounded ml-2 select-none">
                        Mặc định
                      </span>
                    )}
                  </span>
                  {!r.isDefault && (
                    <button
                      type="button"
                      disabled={isDeletingReason !== null}
                      onClick={() => handleDeleteReason(r.id)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa lý do này"
                    >
                      {isDeletingReason === r.id ? (
                        <span className="text-[10px] font-black">Xóa...</span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              ))}
              {reasons.length === 0 && (
                <p className="text-xs text-slate-400 font-semibold text-center py-4">Chưa có lý do tùy chỉnh nào.</p>
              )}
            </div>

            {/* Add new reason form */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập lý do khóa mới..."
                value={newReasonText}
                onChange={(e) => setNewReasonText(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/10 transition-all"
                disabled={isAddingReason}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddReason();
                }}
              />
              <Button
                variant="primary"
                onClick={handleAddReason}
                disabled={isAddingReason}
                size="sm"
                className="bg-brand-emerald text-white text-xs font-bold px-4 py-2"
              >
                {isAddingReason ? 'Thêm...' : 'Thêm'}
              </Button>
            </div>
          </div>
        )}

        {/* Textarea detailReason */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Mô tả chi tiết hành vi vi phạm <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={detailReason}
            onChange={(e) => setDetailReason(e.target.value)}
            placeholder={
              selectedReason === 'Khác'
                ? "Nhập chi tiết hành vi vi phạm thực tế của người dùng để làm cơ sở khóa tài khoản (Bắt buộc nhập)..."
                : `Nhập chi tiết hành vi vi phạm thực tế liên quan đến lý do "${selectedReason}"...`
            }
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all resize-none"
            disabled={isSubmitting}
            required
          />
          <p className="text-[10px] text-slate-400 font-bold leading-normal">
            Lưu ý: Nội dung ghi chú này sẽ được hiển thị cho người dùng biết lý do cụ thể khi tài khoản của họ bị chặn.
          </p>
        </div>
      </div>
    </Modal>
  );
};
