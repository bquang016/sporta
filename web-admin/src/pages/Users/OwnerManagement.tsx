import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { getLoggedInAdmin } from '@/utils/auth';
import { SmartLockModal } from '@/components/users/SmartLockModal';
import { UserAuditing } from './UserAuditing';
import { API_BASE_URL } from '@/api/config';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'BANNED';
  createdAt: string;
}

// Custom Premium Toggle Switch Component
interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none active:scale-95
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
        ${checked ? 'bg-brand-yellow' : 'bg-slate-300'}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-300 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
};

export const OwnerManagement: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'OWNERS' | 'NEW_REGISTRATIONS'>('OWNERS');

  // Modals status
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLockModalOpen, setIsLockModalOpen] = useState<boolean>(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState<boolean>(false);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

  // Get current logged-in admin details
  const currentAdmin = getLoggedInAdmin();

  // Fetch owners from backend
  const fetchOwners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/users?role=OWNER&search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể tải danh sách chủ sân từ máy chủ.');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOwners();
  };

  // Triggered when Toggle status changes
  const handleToggleChange = (user: User) => {
    setSelectedUser(user);
    if (user.status === 'BANNED') {
      setIsUnlockModalOpen(true);
    } else {
      setIsLockModalOpen(true);
    }
  };

  // Lock account callback API
  const handleConfirmLock = async (category: string, detail: string) => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reasonCategory: category,
          reasonDetail: detail
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Khóa tài khoản thất bại');
      }

      showToast('success', `Đã khóa tài khoản chủ sân "${selectedUser.fullName}" thành công`);
      fetchOwners();
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra khi khóa tài khoản');
      throw err; // Propagate to keep modal loading or open
    }
  };

  // Unlock account callback API
  const handleConfirmUnlock = async () => {
    if (!selectedUser) return;
    setIsUnlocking(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}/unlock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Mở khóa tài khoản thất bại');
      }

      showToast('success', `Đã mở khóa tài khoản chủ sân "${selectedUser.fullName}" thành công`);
      setIsUnlockModalOpen(false);
      fetchOwners();
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra khi mở khóa tài khoản');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col flex-1 min-h-0">
      {/* Title section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-on-background">Quản Lý Chủ Sân</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Quản lý tài khoản, yêu cầu đăng ký và trạng thái hoạt động của Chủ Sân (Owners).</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-outline-variant/30">
        <button
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'OWNERS'
              ? 'border-brand-emerald text-brand-emerald'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('OWNERS')}
        >
          Danh sách chủ sân
        </button>
        <button
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'NEW_REGISTRATIONS'
              ? 'border-brand-emerald text-brand-emerald'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('NEW_REGISTRATIONS')}
        >
          Yêu cầu đăng ký mới
        </button>
      </div>

      {activeTab === 'NEW_REGISTRATIONS' ? (
        <UserAuditing />
      ) : (
      <Card className="overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm border border-slate-200/80 rounded-2xl">
        {/* Search Header */}
        <form onSubmit={handleSearchSubmit} className="p-4 border-b border-outline-variant/10 flex gap-4 flex-shrink-0 bg-slate-50/50">
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 w-full bg-white border border-slate-200 rounded-xl text-xs font-semibold text-on-surface placeholder:text-slate-400 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 transition-all pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-emerald p-1 focus:outline-none cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setTimeout(() => fetchOwners(), 0);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Xóa lọc
            </Button>
          )}
        </form>

        {/* 3 States Management (Loading, Error, Empty) */}
        <div className="flex-1 overflow-y-auto matrix-scroll min-h-0">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner size="lg" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu chủ sân...</span>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200/50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Lỗi Tải Dữ Liệu</h3>
              <p className="text-xs text-slate-500 max-w-sm font-semibold">{error}</p>
              <Button variant="primary" onClick={fetchOwners} size="sm" className="mt-2 bg-brand-emerald text-white">
                Thử lại
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Không Tìm Thấy Kết Quả</h3>
              <p className="text-xs text-slate-400 font-semibold">Không tìm thấy bất kỳ chủ sân nào phù hợp.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/50 sticky top-0 backdrop-blur-sm z-10 select-none">
                <tr>
                  <th className="px-6 py-3.5">Mã Owner</th>
                  <th className="px-6 py-3.5">Họ Tên</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Ngày Tham Gia</th>
                  <th className="px-6 py-3.5">Trạng Thái</th>
                  <th className="px-6 py-3.5 text-center w-24">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((user) => {
                  const isSelf = !!(currentAdmin && user.id === currentAdmin.userId);
                  const isLocked = user.status === 'BANNED';
                  const isChecked = !isLocked;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-400">#{user.id}</td>
                      <td className="px-6 py-4 font-black text-slate-800">{user.fullName}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{user.email}</td>
                      <td className="px-6 py-4 text-slate-500 font-bold">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.status === 'ACTIVE' ? 'warning' : user.status === 'BANNED' ? 'error' : 'default'}>
                          {user.status === 'ACTIVE' ? 'Hoạt Động' : user.status === 'BANNED' ? 'Bị Khóa' : 'Chưa kích hoạt'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center" title={isSelf ? "Bạn không thể tự khóa tài khoản của mình" : ""}>
                          <Toggle
                            checked={isChecked}
                            onChange={() => handleToggleChange(user)}
                            disabled={isSelf}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
      )}

      {/* Lock Popup Smart Action Modal */}
      <SmartLockModal
        isOpen={isLockModalOpen}
        onClose={() => {
          setIsLockModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmLock}
        roleType="OWNER"
        userName={selectedUser?.fullName || ''}
        userEmail={selectedUser?.email || ''}
      />

      {/* Unlock Confirmation Modal */}
      <ConfirmModal
        isOpen={isUnlockModalOpen}
        onClose={() => {
          setIsUnlockModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmUnlock}
        title="Xác nhận mở khóa tài khoản"
        message={`Bạn có chắc chắn muốn mở khóa tài khoản của chủ sân "${selectedUser?.fullName}"? Sau khi mở khóa, chủ sân sẽ có thể đăng nhập và quản lý sân đấu bình thường.`}
        confirmText={isUnlocking ? "Đang mở..." : "Mở khóa"}
        cancelText="Hủy bỏ"
        variant="unlock"
      />
    </div>
  );
}
