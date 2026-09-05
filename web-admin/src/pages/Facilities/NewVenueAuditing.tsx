import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { API_BASE_URL } from '@/api/config';

export const NewVenueAuditing: React.FC = () => {
    const { showToast } = useToast();
    const [venues, setVenues] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

    // Approval State
    const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
    
    // Rejection State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchVenues = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/venues/pending`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!res.ok) {
                throw new Error('Không thể tải danh sách cụm sân mới');
            }
            const data = await res.json();
            setVenues(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    const handleApprove = async () => {
        if (!selectedVenueId) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/venues/${selectedVenueId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!res.ok) throw new Error('Duyệt thất bại');
            
            showToast('success', 'Đã phê duyệt cụm sân thành công.');
            setIsApproveConfirmOpen(false);
            fetchVenues();
        } catch (err: any) {
            showToast('error', 'Lỗi: ' + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedVenueId || !rejectReason.trim()) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/venues/${selectedVenueId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: rejectReason })
            });
            if (!res.ok) throw new Error('Từ chối thất bại');
            
            showToast('success', 'Đã từ chối cụm sân thành công.');
            setIsRejectModalOpen(false);
            setRejectReason('');
            fetchVenues();
        } catch (err: any) {
            showToast('error', 'Lỗi: ' + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderStatus = (approvalStatus: string) => {
        switch (approvalStatus) {
            case 'PENDING': return <Badge variant="warning">Chờ Duyệt</Badge>;
            case 'APPROVED': return <Badge variant="success">Đã Duyệt</Badge>;
            case 'REJECTED': return <Badge variant="error">Đã Từ Chối</Badge>;
            default: return <Badge>{approvalStatus}</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col flex-1 min-h-0">
            <Card className="overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm border border-slate-200/80 rounded-2xl">
                <div className="p-4 border-b border-outline-variant/10 flex justify-end gap-4 flex-shrink-0 bg-slate-50/50">
                    <Button variant="outline" size="sm" onClick={fetchVenues} disabled={isLoading}>
                        Tải Lại
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto matrix-scroll min-h-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/50 sticky top-0 backdrop-blur-sm z-10 select-none">
                            <tr>
                                <th className="px-6 py-3.5">Mã Sân</th>
                                <th className="px-6 py-3.5">Tên Cụm Sân</th>
                                <th className="px-6 py-3.5">Môn Thể Thao</th>
                                <th className="px-6 py-3.5">Địa Chỉ</th>
                                <th className="px-6 py-3.5">Trạng Thái</th>
                                <th className="px-6 py-3.5 text-right w-32">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <LoadingSpinner size="md" />
                                        <div className="text-slate-500 mt-3 font-semibold text-xs uppercase tracking-widest">Đang tải dữ liệu...</div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-red-500 font-medium">
                                        Lỗi: {error}
                                    </td>
                                </tr>
                            ) : venues.length > 0 ? (
                                venues.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="px-6 py-4 font-black text-slate-400">
                                            #{v.id.substring(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 font-black text-brand-emerald">{v.name}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{v.sportName}</td>
                                        <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]" title={v.location}>
                                            {v.district}, {v.province}
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderStatus(v.approvalStatus)}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {v.approvalStatus === 'PENDING' && (
                                                <>
                                                    <Button variant="danger" size="sm" onClick={() => {
                                                        setSelectedVenueId(v.id);
                                                        setIsRejectModalOpen(true);
                                                    }}>Từ chối</Button>
                                                    <Button variant="primary" size="sm" onClick={() => {
                                                        setSelectedVenueId(v.id);
                                                        setIsApproveConfirmOpen(true);
                                                    }}>Duyệt</Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-semibold text-sm">
                                        Không có cụm sân mới nào đang chờ duyệt.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Approval Confirmation */}
            <ConfirmModal
                isOpen={isApproveConfirmOpen}
                onClose={() => setIsApproveConfirmOpen(false)}
                onConfirm={handleApprove}
                title="Xác nhận duyệt cụm sân"
                message="Bạn có chắc chắn muốn phê duyệt cụm sân này? Sau khi duyệt, sân sẽ được hiển thị cho người chơi."
                confirmText={isProcessing ? "Đang xử lý..." : "Duyệt"}
                cancelText="Hủy"
                variant="success"
            />

            {/* Rejection Modal */}
            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => !isProcessing && setIsRejectModalOpen(false)}
                title="Từ chối cụm sân"
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
                    <p className="text-sm text-slate-600 font-medium">Vui lòng nhập lý do từ chối (bắt buộc):</p>
                    <textarea
                        className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald outline-none transition-all"
                        rows={4}
                        placeholder="Ví dụ: Thông tin không hợp lệ, hình ảnh không đúng..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    );
};
