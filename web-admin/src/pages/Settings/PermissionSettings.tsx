import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Permission {
  id: number;
  role: string;
  feature: string;
  isAllowed: boolean;
}

const PERMISSION_GROUPS = [
  {
    groupName: 'QUẢN LÝ BẢNG ĐIỀU KHIỂN',
    features: [
      { key: 'VIEW_DASHBOARD', name: 'Xem bảng điều khiển', desc: 'Quyền xem số liệu thống kê tổng quan của hệ thống' }
    ]
  },
  {
    groupName: 'QUẢN LÝ SÂN BÃI',
    features: [
      { key: 'MANAGE_FACILITIES', name: 'Quản lý sân bãi', desc: 'Quyền kiểm duyệt, thay đổi trạng thái sân bãi' }
    ]
  },
  {
    groupName: 'QUẢN LÝ TÀI KHOẢN',
    features: [
      { key: 'MANAGE_OWNERS', name: 'Quản lý chủ sân', desc: 'Quyền xét duyệt, xem và quản lý tài khoản chủ sân' },
      { key: 'MANAGE_USERS', name: 'Quản lý người dùng', desc: 'Quyền xem và quản lý người chơi' }
    ]
  },
  {
    groupName: 'CÀI ĐẶT HỆ THỐNG',
    features: [
      { key: 'MANAGE_SYSTEM', name: 'Cài đặt chung', desc: 'Thay đổi tên web, logo và cấu hình hệ thống' }
    ]
  }
];

const ROLES = [
  {
    id: 'SUPER_ADMIN',
    name: 'SUPER_ADMIN',
    subtitle: 'Toàn quyền',
    isRoot: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    activeIcon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    )
  },
  {
    id: 'ADMIN',
    name: 'ADMIN',
    subtitle: 'Tùy chỉnh quyền',
    isRoot: false,
    icon: (
      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 'OWNER',
    name: 'OWNER',
    subtitle: 'Tùy chỉnh quyền',
    isRoot: false,
    icon: (
      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 'PLAYER',
    name: 'PLAYER',
    subtitle: 'Tùy chỉnh quyền',
    isRoot: false,
    icon: (
      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  }
];

export const PermissionSettings = () => {
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const token = localStorage.getItem('accessToken');
  const currentRole = localStorage.getItem('role');

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8387/api/v1/admin/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Không thể tải dữ liệu phân quyền');
      const data = await response.json();
      setPermissions(data);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentRole === 'SUPER_ADMIN') {
      fetchPermissions();
    }
  }, [currentRole]);

  const handleToggle = (featureKey: string) => {
    if (selectedRole !== 'ADMIN') return; // Currently only ADMIN permissions are editable

    setPermissions(prev => {
      // If the permission exists, toggle it
      const exists = prev.find(p => p.feature === featureKey);
      if (exists) {
        return prev.map(p => p.feature === featureKey ? { ...p, isAllowed: !p.isAllowed } : p);
      }
      // If it doesn't exist, create it locally as allowed: true
      return [...prev, { id: Date.now(), role: 'ADMIN', feature: featureKey, isAllowed: true }];
    });
  };

  const handleSave = async () => {
    if (selectedRole !== 'ADMIN') return;

    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    // Send all defined features. If not in state, it's false.
    const updates = PERMISSION_GROUPS.flatMap(group => 
      group.features.map(f => {
        const p = permissions.find(p => p.feature === f.key);
        return {
          feature: f.key,
          isAllowed: p ? p.isAllowed : false
        };
      })
    );

    try {
      const response = await fetch('http://localhost:8387/api/v1/admin/permissions', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Lỗi khi lưu cài đặt phân quyền');
      
      setMessage({ text: 'Lưu thay đổi thành công!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (currentRole !== 'SUPER_ADMIN') {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-xl font-bold mt-1 text-slate-800">Không có quyền truy cập</h3>
          <p className="text-sm text-slate-500 mt-2">Chỉ Super Admin mới có quyền truy cập cài đặt hệ thống.</p>
        </div>
      </div>
    );
  }

  const activeRoleConfig = ROLES.find(r => r.id === selectedRole) || ROLES[0];
  const isReadOnly = activeRoleConfig.isRoot || selectedRole !== 'ADMIN';

  const isFeatureAllowed = (featureKey: string) => {
    if (activeRoleConfig.isRoot) return true;
    if (selectedRole !== 'ADMIN') return false;
    const p = permissions.find(p => p.feature === featureKey);
    return p ? p.isAllowed : false;
  };

  return (
    <div className="max-w-6xl mx-auto font-sans h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản lý Phân quyền</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Thiết lập và tùy chỉnh quyền hạn dựa trên vai trò hệ thống.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Column - Role List */}
        <div className="w-full lg:w-[280px] shrink-0 h-full flex flex-col">
          <Card className="p-3 h-full flex flex-col !rounded-2xl border-slate-100 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-3 pt-2 pb-3">Danh sách vai trò</h3>
            
            <div className="space-y-1.5 flex-1">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                    selectedRole === r.id 
                      ? 'bg-cyan-50/50 border-cyan-100' 
                      : 'bg-transparent border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      selectedRole === r.id 
                        ? 'bg-primary-container text-brand-yellow shadow-sm' 
                        : 'bg-surface-variant/40 text-outline group-hover:bg-surface-variant group-hover:text-on-surface'
                    }`}>
                      {selectedRole === r.id && r.activeIcon ? r.activeIcon : r.icon}
                    </div>
                    <div className="text-left">
                      <h4 className={`text-xs font-black transition-colors ${selectedRole === r.id ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}>{r.name}</h4>
                      <p className={`text-[10px] font-medium transition-colors ${selectedRole === r.id ? 'text-primary/60' : 'text-outline'}`}>{r.subtitle}</p>
                    </div>
                  </div>
                  {r.isRoot && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[8px] font-black uppercase tracking-wider">ROOT</span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4 pb-2 px-1 border-t border-dashed border-slate-200 mt-2">
              <button className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2 text-xs font-bold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm vai trò mới
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column - Permission Details */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <Card className="flex-1 flex flex-col overflow-hidden !rounded-2xl border-slate-100 shadow-sm">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-on-surface tracking-tight">Quyền hạn của: <span className="text-primary">{activeRoleConfig.name}</span></h2>
                  <p className="text-sm text-outline font-medium">{activeRoleConfig.subtitle}</p>
                </div>
              </div>
              
              <Button
                onClick={handleSave}
                disabled={isReadOnly || isSaving}
                variant="primary"
                size="md"
                className="!text-sm flex items-center gap-2 px-5 py-2.5 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-500 font-bold"
              >
                {isSaving ? (
                  <LoadingSpinner size="sm" color="primary" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
                Lưu
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-scroll flex-1">
              
              {message.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  <span>{message.text}</span>
                </div>
              )}

              {activeRoleConfig.isRoot && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 mb-8 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-primary mb-1.5 uppercase tracking-wider">Hệ thống bảo vệ: SUPER ADMIN</h4>
                    <p className="text-sm text-primary/80 font-medium leading-relaxed">
                      Vai trò SUPER_ADMIN là vai trò gốc của hệ thống. Tất cả các quyền hạn đã được kích hoạt mặc định và không thể bị tước bỏ.
                    </p>
                  </div>
                </div>
              )}

              {selectedRole === 'ADMIN' && (
                <div className="bg-primary-container/5 border border-primary-container/10 rounded-2xl p-5 mb-8 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-on-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-primary-container mb-1.5 uppercase tracking-wider">Cấu hình phân quyền động</h4>
                    <p className="text-sm text-primary-container/80 font-medium leading-relaxed">
                      Quản trị viên Super Admin có thể bật tắt các quyền hạn dành riêng cho vai trò Admin. Sau khi lưu, Admin cần đăng nhập lại.
                    </p>
                  </div>
                </div>
              )}
              
              {selectedRole !== 'ADMIN' && !activeRoleConfig.isRoot && (
                <div className="bg-surface-variant/20 border border-surface-variant/50 rounded-2xl p-5 mb-8 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-outline-variant flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-on-surface-variant mb-1.5 uppercase tracking-wider">Chưa hỗ trợ phân quyền tùy chỉnh</h4>
                    <p className="text-sm text-outline font-medium leading-relaxed">
                      Tính năng phân quyền tùy chỉnh cho vai trò này hiện chưa khả dụng. Các quyền hiển thị bên dưới chỉ mang tính chất minh họa.
                    </p>
                  </div>
                </div>
              )}

              {isLoading && selectedRole === 'ADMIN' ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner size="lg" color="primary" />
                </div>
              ) : (
                <div className="space-y-8">
                  {PERMISSION_GROUPS.map((group, idx) => (
                    <div key={idx}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-4 bg-slate-300 rounded-full" />
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{group.groupName}</h3>
                        <div className="flex-1 h-[1px] bg-slate-100" />
                      </div>
                      
                      <div className="space-y-4 pl-4">
                        {group.features.map(feature => {
                          const allowed = isFeatureAllowed(feature.key);
                          return (
                            <div key={feature.key} className="flex items-center justify-between group">
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">{feature.name}</h4>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{feature.desc}</p>
                              </div>
                              
                              <label className={`relative inline-flex items-center ${isReadOnly ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer'} transition-transform`}>
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={allowed} 
                                  onChange={() => handleToggle(feature.key)}
                                  disabled={isReadOnly}
                                />
                                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:bg-brand-yellow"></div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Thay đổi quyền hạn sẽ có hiệu lực sau khi vai trò được lưu và người dùng đăng nhập lại.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PermissionSettings;
