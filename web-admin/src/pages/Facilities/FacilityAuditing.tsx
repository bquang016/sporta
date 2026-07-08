import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RegistrationDetailModal } from './RegistrationDetailModal';

export const FacilityAuditing: React.FC = () => {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);

    const fetchRegistrations = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:8387/api/v1/admin/registrations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!res.ok) {
                throw new Error('Không thể tải dữ liệu đăng ký');
            }
            const data = await res.json();
            setRegistrations(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const openDetail = (id: string) => {
        setSelectedRegistrationId(id);
        setIsDetailModalOpen(true);
    };

    const renderStatus = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge variant="warning">Chờ Duyệt</Badge>;
            case 'APPROVED': return <Badge variant="success">Đã Duyệt</Badge>;
            case 'REJECTED': return <Badge variant="error">Đã Từ Chối</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-on-background">Kiểm Duyệt Sân Thể Thao</h1>
                    <p className="text-on-surface-variant mt-1 text-sm">Xem xét và phê duyệt các cơ sở vật chất mới đăng ký trên hệ thống.</p>
                </div>
                <Button variant="outline" onClick={fetchRegistrations} disabled={isLoading}>
                    Tải Lại
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-container text-on-surface font-medium border-b border-outline-variant/20">
                            <tr>
                                <th className="px-6 py-4">Mã Đăng Ký</th>
                                <th className="px-6 py-4">Tên Cơ Sở</th>
                                <th className="px-6 py-4">Chủ Sân</th>
                                <th className="px-6 py-4">Địa Chỉ</th>
                                <th className="px-6 py-4">Ngày Yêu Cầu</th>
                                <th className="px-6 py-4">Trạng Thái</th>
                                <th className="px-6 py-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <LoadingSpinner size="md" />
                                        <div className="text-on-surface-variant mt-3">Đang tải dữ liệu...</div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-red-500 font-medium">
                                        Lỗi: {error}
                                    </td>
                                </tr>
                            ) : registrations.length > 0 ? (
                                registrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-on-surface-variant text-xs">
                                            {reg.id.substring(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-brand-emerald">{reg.venueName}</td>
                                        <td className="px-6 py-4 font-medium">{reg.fullName}</td>
                                        <td className="px-6 py-4 text-on-surface-variant truncate max-w-[200px]" title={`${reg.ward}, ${reg.district}, ${reg.province}`}>
                                            {reg.district}, {reg.province}
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            {new Date(reg.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderStatus(reg.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => openDetail(reg.id)}>Xem Chi Tiết</Button>
                                            {reg.status === 'PENDING' && (
                                                <Button variant="primary" size="sm">Duyệt</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-on-surface-variant">
                                        Không có đăng ký nào đang chờ duyệt.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <RegistrationDetailModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                registrationId={selectedRegistrationId} 
            />
        </div>
    );
};
