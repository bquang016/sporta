import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';

export const VenueRevisionAuditing: React.FC = () => {
    const [revisions, setRevisions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedRevision, setSelectedRevision] = useState<any | null>(null);
    const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
    
    // Rejection State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchRevisions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('http://localhost:8387/api/v1/admin/venue-revisions/pending', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!res.ok) {
                throw new Error('Không thể tải dữ liệu yêu cầu thay đổi');
            }
            const data = await res.json();
            setRevisions(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRevisions();
    }, []);

    const handleApprove = async () => {
        if (!selectedRevision) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`http://localhost:8387/api/v1/admin/venue-revisions/${selectedRevision.id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if (!res.ok) throw new Error('Duyệt thất bại');
            setIsApproveConfirmOpen(false);
            fetchRevisions();
        } catch (err: any) {
            alert('Lỗi: ' + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRevision || !rejectReason.trim()) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`http://localhost:8387/api/v1/admin/venue-revisions/${selectedRevision.id}/reject`, {
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
            fetchRevisions();
        } catch (err: any) {
            alert('Lỗi: ' + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderDataDiff = (oldData: any, newData: any) => {
        const oldStr = oldData || 'Không có';
        const newStr = newData || 'Không có';
        if (oldStr === newStr) return <span className="text-slate-500">{oldStr}</span>;
        return (
            <div className="flex flex-col gap-1 text-sm">
                <span className="line-through text-red-500 bg-red-50 px-2 py-1 rounded">{oldStr}</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold">{newStr}</span>
            </div>
        );
    };

    const parsedData = React.useMemo(() => {
        if (!selectedRevision || !selectedRevision.pendingData) return null;
        if (typeof selectedRevision.pendingData === 'object') return selectedRevision.pendingData;
        try {
            return JSON.parse(selectedRevision.pendingData);
        } catch (e) {
            console.error("Failed to parse pendingData:", selectedRevision.pendingData, e);
            return null;
        }
    }, [selectedRevision]);

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <Card className="overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-container text-on-surface font-medium border-b border-outline-variant/20">
                            <tr>
                                <th className="px-6 py-4">Tên Cũ</th>
                                <th className="px-6 py-4">Chủ Sân</th>
                                <th className="px-6 py-4">Ngày Yêu Cầu</th>
                                <th className="px-6 py-4">Trạng Thái</th>
                                <th className="px-6 py-4 text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <LoadingSpinner size="md" />
                                        <div className="text-on-surface-variant mt-3">Đang tải dữ liệu...</div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-red-500 font-medium">
                                        Lỗi: {error}
                                    </td>
                                </tr>
                            ) : revisions.length > 0 ? (
                                revisions.map((rev) => (
                                    <tr key={rev.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-700">{rev.oldName}</td>
                                        <td className="px-6 py-4 font-medium">{rev.ownerEmail}</td>
                                        <td className="px-6 py-4 text-on-surface-variant">
                                            {new Date(rev.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="warning">Chờ Duyệt</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setSelectedRevision(rev);
                                                setIsApproveConfirmOpen(true);
                                            }}>Xem Chi Tiết</Button>
                                            <Button variant="danger" size="sm" onClick={() => {
                                                setSelectedRevision(rev);
                                                setIsRejectModalOpen(true);
                                            }}>Từ chối</Button>
                                            <Button variant="primary" size="sm" onClick={() => {
                                                setSelectedRevision(rev);
                                                handleApprove();
                                            }}>Duyệt</Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                                        Không có yêu cầu thay đổi nào đang chờ duyệt.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* View Modal */}
            <Modal
                isOpen={isApproveConfirmOpen && selectedRevision !== null}
                onClose={() => setIsApproveConfirmOpen(false)}
                title="Chi tiết yêu cầu thay đổi"
                maxWidth="2xl"
                footer={
                    <div className="flex gap-3 w-full">
                        <Button variant="ghost" className="flex-1" onClick={() => setIsApproveConfirmOpen(false)} disabled={isProcessing}>Đóng</Button>
                        <Button variant="danger" className="flex-1" onClick={() => {
                            setIsApproveConfirmOpen(false);
                            setIsRejectModalOpen(true);
                        }} disabled={isProcessing}>
                            Từ chối
                        </Button>
                        <Button variant="primary" className="flex-1" onClick={handleApprove} disabled={isProcessing}>
                            {isProcessing ? "Đang xử lý..." : "Duyệt thay đổi"}
                        </Button>
                    </div>
                }
            >
                {selectedRevision && parsedData ? (
                    <div className="space-y-6 py-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">So sánh thay đổi</h4>
                            <div className="grid grid-cols-[120px_1fr] gap-y-4 items-start">
                                <div className="text-sm font-bold text-slate-500 pt-2">Tên sân:</div>
                                <div>{renderDataDiff(selectedRevision.oldName, parsedData.name)}</div>
                                
                                <div className="text-sm font-bold text-slate-500 pt-2">Vị trí:</div>
                                <div>{renderDataDiff(selectedRevision.oldLocation, parsedData.location)}</div>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>Khi được duyệt, thông tin mới sẽ <b>ghi đè</b> thông tin cũ và hiển thị trực tiếp với khách hàng đặt sân.</p>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-red-500">
                        Dữ liệu bản nháp không hợp lệ hoặc đã bị lỗi định dạng từ trước. Vui lòng "Từ chối" yêu cầu này.
                    </div>
                )}
            </Modal>

            {/* Rejection Modal */}
            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => !isProcessing && setIsRejectModalOpen(false)}
                title="Từ chối thay đổi"
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
                        placeholder="Ví dụ: Tên sân chứa từ ngữ không phù hợp..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    );
};
