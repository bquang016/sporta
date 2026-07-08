import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

interface Staff {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'BANNED';
  createdAt: string;
}

export const StaffManagement = () => {
  const { showToast } = useToast();
  
  // Data State
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Deactivate Modal State
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState<boolean>(false);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);

  // Fetch staff list from backend
  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8387/api/v1/admin/users?role=ADMIN&search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Không thể tải danh sách nhân sự từ máy chủ.');
      }
      const data = await response.json();
      setStaffList(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStaff();
  };

  // Handle Create Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      showToast('error', 'Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    if (password.length < 6) {
      showToast('error', 'Mật khẩu khởi tạo phải có ít nhất 6 ký tự.');
      return;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8387/api/v1/admin/users/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Tạo tài khoản Admin thất bại.');
      }

      showToast('success', 'Tạo tài khoản Admin vận hành thành công!');
      setIsCreateOpen(false);
      // Reset form
      setFullName('');
      setEmail('');
      setPassword('');
      // Refresh list
      fetchStaff();
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra khi tạo tài khoản.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Deactivate Admin (Soft Delete)
  const handleDeactivateConfirm = async () => {
    if (!selectedStaff) return;
    setIsDeactivating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8387/api/v1/admin/users/${selectedStaff.id}/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Vô hiệu hóa tài khoản thất bại.');
      }

      showToast('success', `Đã vô hiệu hóa tài khoản Admin "${selectedStaff.fullName}" thành công.`);
      setIsDeactivateOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err: any) {
      showToast('error', err.message || 'Có lỗi xảy ra khi vô hiệu hóa tài khoản.');
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col flex-1 min-h-0">
      {/* Title section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-on-background">Quản Lý Nhân Sự Nội Bộ</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Quản lý tài khoản, trạng thái hoạt động của các Admin vận hành cấp dưới.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setIsCreateOpen(true)}
          className="bg-brand-emerald hover:bg-emerald-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Tạo Admin mới</span>
        </Button>
      </div>

      {/* Card Wrapper */}
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
                setTimeout(() => fetchStaff(), 0);
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
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải danh sách nhân sự...</span>
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
              <Button variant="primary" onClick={fetchStaff} size="sm" className="mt-2 bg-brand-emerald text-white">
                Thử lại
              </Button>
            </div>
          ) : staffList.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Không Tìm Thấy Kết Quả</h3>
              <p className="text-xs text-slate-400 font-semibold">Chưa có tài khoản nhân sự Admin nào được tạo.</p>
            </div>
          ) : (
            /* Table Data */
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/50 sticky top-0 backdrop-blur-sm z-10 select-none">
                <tr>
                  <th className="px-6 py-3.5">Mã Admin</th>
                  <th className="px-6 py-3.5">Họ Tên</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Ngày Tham Gia</th>
                  <th className="px-6 py-3.5">Trạng Thái</th>
                  <th className="px-6 py-3.5 text-center w-24">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {staffList.map((user) => {
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
                        <Badge variant="success">Hoạt Động</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedStaff(user);
                              setIsDeactivateOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50/50 flex items-center gap-1.5 font-bold py-1.5 px-3 rounded-lg transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Vô hiệu hóa</span>
                          </Button>
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

      {/* Deactivate Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeactivateOpen}
        onClose={() => {
          setIsDeactivateOpen(false);
          setSelectedStaff(null);
        }}
        onConfirm={handleDeactivateConfirm}
        title="Xác nhận vô hiệu hóa nhân sự"
        message={`Bạn có chắc chắn muốn vô hiệu hóa tài khoản Admin của "${selectedStaff?.fullName}"? Sau khi vô hiệu hóa, tài khoản này sẽ bị khóa vĩnh viễn và không thể đăng nhập lại.`}
        confirmText={isDeactivating ? "Đang xử lý..." : "Vô hiệu hóa"}
        cancelText="Hủy bỏ"
        variant="danger"
      />

      {/* Create Admin Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setFullName('');
          setEmail('');
          setPassword('');
        }}
        maxWidth="md"
        title="Tạo Tài Khoản Admin Mới"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateOpen(false);
                setFullName('');
                setEmail('');
                setPassword('');
              }}
              disabled={isCreating}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateAdmin}
              disabled={isCreating}
              className="bg-brand-emerald text-white font-bold"
            >
              {isCreating ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-0.5">
              Họ và tên nhân sự <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
              required
              disabled={isCreating}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-0.5">
              Địa chỉ Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="vi_du@sporta.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
              required
              disabled={isCreating}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider pl-0.5">
              Mật khẩu khởi tạo <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Nhập tối thiểu 6 ký tự..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
              required
              disabled={isCreating}
            />
          </div>

          <p className="text-[10px] text-slate-400 font-bold leading-normal pt-1">
            Lưu ý: Tài khoản Admin sau khi tạo sẽ được kích hoạt quyền quản trị vận hành mặc định (duyệt sân, quản lý người chơi, xem thống kê) trên hệ thống Sporta.
          </p>
        </form>
      </Modal>
    </div>
  );
};
