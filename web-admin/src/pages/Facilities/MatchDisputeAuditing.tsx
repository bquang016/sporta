import React, { useState, useEffect } from 'react';

interface MatchDisputeItem {
    id: number;
    matchRoomId: number;
    creatorClubName: string;
    matchedClubName: string;
    sportName: string;
    venueName: string;
    courtName: string;
    teamAEvidence?: string;
    teamBEvidence?: string;
    deadline: string;
    status: 'OPEN' | 'RESOLVED_TEAM_A' | 'RESOLVED_TEAM_B' | 'EXPIRED';
    penaltyClubId?: number;
}

export const MatchDisputeAuditing: React.FC = () => {
    const [disputes, setDisputes] = useState<MatchDisputeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState<MatchDisputeItem | null>(null);
    const [winnerTeam, setWinnerTeam] = useState<'A' | 'B'>('A');
    const [winnerGoals, setWinnerGoals] = useState(3);
    const [loserGoals, setLoserGoals] = useState(1);
    const [applyPenalty, setApplyPenalty] = useState(true);
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:8387/api/admin/disputes');
            if (res.ok) {
                const data = await res.json();
                setDisputes(data || []);
            } else {
                // Mock data fallback if backend returns empty or error
                setDisputes([
                    {
                        id: 1,
                        matchRoomId: 101,
                        creatorClubName: 'CLB Bóng Đá Alpha',
                        matchedClubName: 'CLB Tiger Hà Nội',
                        sportName: 'Bóng đá (7v7)',
                        venueName: 'Sân bóng Chùa Hà',
                        courtName: 'Sân 7A',
                        teamAEvidence: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500',
                        teamBEvidence: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500',
                        deadline: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
                        status: 'OPEN',
                    }
                ]);
            }
        } catch (err) {
            console.error("Error fetching disputes:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedDispute) return;
        try {
            setResolving(true);
            const winnerClubId = winnerTeam === 'A' ? 1 : 2;
            const penaltyClubId = applyPenalty ? (winnerTeam === 'A' ? 2 : 1) : undefined;

            const res = await fetch('http://localhost:8387/api/admin/disputes/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchRoomId: selectedDispute.matchRoomId,
                    winnerClubId,
                    winnerGoals,
                    loserGoals,
                    penaltyClubId,
                })
            });

            if (res.ok) {
                alert(`Đã xử lý tranh chấp thành công! Đội ${winnerTeam === 'A' ? selectedDispute.creatorClubName : selectedDispute.matchedClubName} thắng ${winnerGoals}-${loserGoals}. ${applyPenalty ? 'Đã áp dụng án phạt trừ 100 Elo đội cố tình khai báo sai!' : ''}`);
                setSelectedDispute(null);
                fetchDisputes();
            } else {
                alert("Lỗi khi xử lý tranh chấp. Vui lòng kiểm tra lại Backend.");
            }
        } catch (err: any) {
            alert("Lỗi kết nối: " + err.message);
        } finally {
            setResolving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-on-surface mb-2">Tranh Chấp Ghép Trận & Khai Báo Sai Tỉ Số</h2>
                <p className="text-sm text-on-surface-variant">
                    Xem xét bằng chứng hình ảnh do 2 bên tải lên, đưa ra phán quyết tỷ số chính thức và áp dụng án phạt trừ 100 Elo cho đội gian lận.
                </p>
            </div>

            {loading ? (
                <div className="p-12 text-center text-on-surface-variant">Đang tải danh sách tranh chấp...</div>
            ) : disputes.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant bg-surface rounded-xl border border-outline-variant/30">
                    Hiện tại không có trận đấu nào ở trạng thái Tranh chấp (DISPUTED).
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {disputes.map(d => (
                        <div key={d.id} className="bg-surface border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4 hover:border-brand-emerald transition-colors">
                            <div className="flex justify-between items-start border-b border-outline-variant/20 pb-3">
                                <div>
                                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">⚠️ TRANH CHẤP TỈ SỐ</span>
                                    <h3 className="font-bold text-lg text-on-surface mt-2">{d.creatorClubName} VS {d.matchedClubName}</h3>
                                    <p className="text-xs text-on-surface-variant">Sân: {d.venueName} ({d.courtName}) • {d.sportName}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                                    <p className="font-bold text-on-surface mb-1">Bằng chứng Đội A ({d.creatorClubName}):</p>
                                    {d.teamAEvidence ? (
                                        <a href={d.teamAEvidence} target="_blank" rel="noreferrer" className="text-brand-emerald underline block truncate">{d.teamAEvidence}</a>
                                    ) : (
                                        <span className="text-on-surface-variant italic">Chưa tải ảnh bằng chứng</span>
                                    )}
                                </div>
                                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                                    <p className="font-bold text-on-surface mb-1">Bằng chứng Đội B ({d.matchedClubName}):</p>
                                    {d.teamBEvidence ? (
                                        <a href={d.teamBEvidence} target="_blank" rel="noreferrer" className="text-brand-emerald underline block truncate">{d.teamBEvidence}</a>
                                    ) : (
                                        <span className="text-on-surface-variant italic">Chưa tải ảnh bằng chứng</span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedDispute(d);
                                    setWinnerTeam('A');
                                }}
                                className="w-full py-2.5 bg-brand-emerald text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                            >
                                Xử Lý & Đưa Ra Phán Quyết
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Xử Lý Tranh Chấp */}
            {selectedDispute && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-surface border border-outline-variant/30 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                            <h3 className="font-bold text-lg text-on-surface">Phán Quyết Tranh Chấp #{selectedDispute.id}</h3>
                            <button onClick={() => setSelectedDispute(null)} className="text-on-surface-variant hover:text-on-surface">✕</button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="block font-bold text-on-surface mb-2">1. CHỌN ĐỘI THẮNG CUỘC CHÍNH THỨC:</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        className={`p-3 rounded-lg border font-bold text-left transition-colors ${winnerTeam === 'A' ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald' : 'border-outline-variant/30 text-on-surface'}`}
                                        onClick={() => setWinnerTeam('A')}
                                    >
                                        Đội A: {selectedDispute.creatorClubName}
                                    </button>
                                    <button
                                        className={`p-3 rounded-lg border font-bold text-left transition-colors ${winnerTeam === 'B' ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald' : 'border-outline-variant/30 text-on-surface'}`}
                                        onClick={() => setWinnerTeam('B')}
                                    >
                                        Đội B: {selectedDispute.matchedClubName}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-on-surface mb-1">Số bàn đội thắng:</label>
                                    <input
                                        type="number"
                                        className="w-full p-2.5 bg-surface border border-outline-variant/30 rounded-lg font-bold"
                                        value={winnerGoals}
                                        onChange={e => setWinnerGoals(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-on-surface mb-1">Số bàn đội thua:</label>
                                    <input
                                        type="number"
                                        className="w-full p-2.5 bg-surface border border-outline-variant/30 rounded-lg font-bold"
                                        value={loserGoals}
                                        onChange={e => setLoserGoals(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-2">
                                <label className="flex items-center gap-2 font-bold text-amber-500 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={applyPenalty}
                                        onChange={e => setApplyPenalty(e.target.checked)}
                                        className="w-4 h-4 rounded text-brand-emerald"
                                    />
                                    Áp dụng hình phạt trừ 100 Elo (x2 phạt) cho đội gian lận
                                </label>
                                <p className="text-xs text-on-surface-variant">
                                    Đội cố tình khai báo sai tỉ số ({winnerTeam === 'A' ? selectedDispute.matchedClubName : selectedDispute.creatorClubName}) sẽ bị trừ 100 Elo cá nhân của các thành viên tham gia.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setSelectedDispute(null)}
                                className="flex-1 py-2.5 border border-outline-variant/30 rounded-lg font-bold text-on-surface hover:bg-surface-container-low"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={resolving}
                                className="flex-1 py-2.5 bg-brand-emerald text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
                            >
                                {resolving ? 'Đang lưu phán quyết...' : 'Xác Nhận Phán Quyết'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
