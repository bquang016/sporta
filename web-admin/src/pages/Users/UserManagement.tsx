import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// Mock data
const mockUsers = [
    { id: 'U001', name: 'Le Thi D', role: 'Player', email: 'd@example.com', status: 'active', joinedAt: '2026-01-10' },
    { id: 'U002', name: 'Nguyen Van E', role: 'Owner', email: 'e@example.com', status: 'active', joinedAt: '2026-02-15' },
    { id: 'U003', name: 'Tran Binh F', role: 'Player', email: 'f@example.com', status: 'banned', joinedAt: '2026-03-20' },
];

export const UserManagement: React.FC = () => {
    const [users] = useState(mockUsers);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-on-background">Quản Lý Người Dùng & Chủ Sân</h1>
                    <p className="text-on-surface-variant mt-1 text-sm">Quản lý tài khoản, phân quyền và trạng thái hoạt động.</p>
                </div>
                <div className="space-x-2">
                    <Button variant="ghost">Xuất CSV</Button>
                    <Button variant="primary">Thêm Người Dùng</Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-outline-variant/20 flex gap-4">
                    <input type="text" placeholder="Tìm kiếm theo tên, email..." className="px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-md text-sm w-80 text-on-surface placeholder:text-on-surface-variant" />
                    <select className="px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-md text-sm text-on-surface">
                        <option value="all">Tất cả vai trò</option>
                        <option value="owner">Chủ Sân</option>
                        <option value="player">Người Chơi</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-container text-on-surface font-medium border-b border-outline-variant/20">
                            <tr>
                                <th className="px-6 py-4">Mã User</th>
                                <th className="px-6 py-4">Họ Tên</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Vai Trò</th>
                                <th className="px-6 py-4">Ngày Tham Gia</th>
                                <th className="px-6 py-4">Trạng Thái</th>
                                <th className="px-6 py-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-on-surface-variant">{user.id}</td>
                                    <td className="px-6 py-4 font-medium">{user.name}</td>
                                    <td className="px-6 py-4 text-on-surface-variant">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={user.role === 'Owner' ? 'info' : 'default'}>{user.role}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-on-surface-variant">{user.joinedAt}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                                            {user.status === 'active' ? 'Hoạt Động' : 'Bị Khóa'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button variant="ghost" size="sm">Chi Tiết</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
