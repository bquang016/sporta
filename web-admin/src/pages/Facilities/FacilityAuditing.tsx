import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Mock data
const mockFacilities = [
    { id: 'F001', name: 'Sân Bóng Đá Chảo Lửa', owner: 'Nguyen Van A', address: '123 Cộng Hòa, Tân Bình', status: 'pending', createdAt: '2026-06-18' },
    { id: 'F002', name: 'Sân Cầu Lông Tân Phú', owner: 'Tran Thi B', address: '45 Lũy Bán Bích, Tân Phú', status: 'pending', createdAt: '2026-06-17' },
    { id: 'F003', name: 'Sân Tennis Quận 7', owner: 'Le Van C', address: 'Nguyễn Văn Linh, Q7', status: 'pending', createdAt: '2026-06-16' },
];

export const FacilityAuditing: React.FC = () => {
    const [facilities] = useState(mockFacilities);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-on-background">Kiểm Duyệt Sân Thể Thao</h1>
                <p className="text-on-surface-variant mt-1 text-sm">Xem xét và phê duyệt các cơ sở vật chất mới đăng ký trên hệ thống.</p>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-container text-on-surface font-medium border-b border-outline-variant/20">
                            <tr>
                                <th className="px-6 py-4">Mã Sân</th>
                                <th className="px-6 py-4">Tên Sân</th>
                                <th className="px-6 py-4">Chủ Sân</th>
                                <th className="px-6 py-4">Địa Chỉ</th>
                                <th className="px-6 py-4">Ngày Yêu Cầu</th>
                                <th className="px-6 py-4">Trạng Thái</th>
                                <th className="px-6 py-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                            {facilities.length > 0 ? facilities.map((facility) => (
                                <tr key={facility.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-on-surface-variant">{facility.id}</td>
                                    <td className="px-6 py-4 font-medium">{facility.name}</td>
                                    <td className="px-6 py-4 text-on-surface-variant">{facility.owner}</td>
                                    <td className="px-6 py-4 text-on-surface-variant truncate max-w-xs">{facility.address}</td>
                                    <td className="px-6 py-4 text-on-surface-variant">{facility.createdAt}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant="warning">Chờ Duyệt</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button variant="ghost" size="sm">Xem Chi Tiết</Button>
                                        <Button variant="primary" size="sm">Duyệt</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant">
                                        Không có sân nào đang chờ duyệt.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
