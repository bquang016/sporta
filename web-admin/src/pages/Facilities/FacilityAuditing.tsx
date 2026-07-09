import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RegistrationDetailModal } from './RegistrationDetailModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Modal } from '@/components/ui/Modal';

export const FacilityAuditing: React.FC = () => {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);

    // Approval State
    const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
    const [isApproveSuccessOpen, setIsApproveSuccessOpen] = useState(false);
    const [temporaryPassword, setTemporaryPassword] = useState('');

    // Rejection State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

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

    const handleApprove = async () => {
        if (!selectedRegistrationId) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`http://localhost:8387/api/v1/admin/registrations/${selectedRegistrationId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!res.ok) throw new Error('Duyệt thất bại');
            const data = await res.json();
            setTemporaryPassword(data.temporaryPassword);
            setIsApproveSuccessOpen(true);
            fetchRegistrations();
        } catch (err: any) {
            alert('Lỗi: ' + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRegistrationId || !rejectReason.trim()) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`http://localhost:8387/api/v1/admin/registrations/${selectedRegistrationId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: rejectReason })
            });
            if (!res.ok) throw new Error('Từ chối thất bại');
            setIsRejectModalOpen(false);
            setRejectReason('');
            fetchRegistrations();
        } catch (err: any) {
            alert('Lỗi: ' + err.message);
        } finally {
            setIsProcessing(false);
        }
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
                                                <>
                                                    <Button variant="danger" size="sm" onClick={() => {
                                                        setSelectedRegistrationId(reg.id);
                                                        setIsRejectModalOpen(true);
                                                    }}>Từ chối</Button>
                                                    <Button variant="primary" size="sm" onClick={() => {
                                                        setSelectedRegistrationId(reg.id);
                                                        setIsApproveConfirmOpen(true);
                                                    }}>Duyệt</Button>
                                                </>
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

            {/* Approval Confirmation */}
            <ConfirmModal
                isOpen={isApproveConfirmOpen}
                onClose={() => setIsApproveConfirmOpen(false)}
                onConfirm={handleApprove}
                title="Xác nhận duyệt đăng ký"
                message="Bạn có chắc chắn muốn phê duyệt cơ sở vật chất này? Hệ thống sẽ tạo tài khoản Chủ Sân tự động."
                confirmText={isProcessing ? "Đang xử lý..." : "Duyệt"}
                cancelText="Hủy"
                variant="success"
            />

            {/* Approval Success / Password Modal */}
            <Modal
                isOpen={isApproveSuccessOpen}
                onClose={() => setIsApproveSuccessOpen(false)}
                title="Duyệt Thành Công"
                maxWidth="sm"
                footer={
                    <Button onClick={() => setIsApproveSuccessOpen(false)} className="w-full">
                        Đóng
                    </Button>
                }
            >
                <div className="py-4 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">Tạo Tài Khoản Thành Công</h4>
                        <p className="text-sm text-slate-500 mt-2">Do hệ thống Email đang bảo trì, vui lòng gửi mật khẩu tạm thời này cho chủ sân để họ có thể đăng nhập:</p>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                        <div className="text-2xl font-mono font-black tracking-widest text-slate-800">
                            {temporaryPassword}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Rejection Modal */}
            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => !isProcessing && setIsRejectModalOpen(false)}
                title="Từ chối đăng ký"
                maxWidth="md"
                dotColor="bg-red-500"
                footer={
                    <div className="flex gap-3 w-full">
                        <Button variant="ghost" className="flex-1" onClick={() => setIsRejectModalOpen(false)} disabled={isProcessing}>Hủy</Button>
                        <Button variant="danger" className="flex-1" onClick={handleReject} disabled={isProcessing || !rejectReason.trim()}>
                            {isProcessing ? 'Đang xử lý...' : 'Từ chối'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4 py-2">
                    <p className="text-sm text-slate-600">Vui lòng nhập lý do từ chối để thông báo cho chủ sân biết (bắt buộc):</p>
                    <textarea
                        className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald outline-none transition-all"
                        rows={4}
                        placeholder="Ví dụ: Hình ảnh CCCD bị mờ, không rõ ràng..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    );
};
