import React, { useState } from 'react';
import { VenueRevisionAuditing } from './VenueRevisionAuditing';
import { NewVenueAuditing } from './NewVenueAuditing';
import { MatchDisputeAuditing } from './MatchDisputeAuditing';

export const FacilityAuditing: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'NEW_VENUES' | 'VENUE_REVISIONS' | 'MATCH_DISPUTES'>('NEW_VENUES');

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-on-background">Kiểm Duyệt & Tranh Chấp Trận Đấu</h1>
                    <p className="text-on-surface-variant mt-1 text-sm">Xem xét phê duyệt cụm sân mới, yêu cầu thay đổi thông tin và giải quyết tranh chấp kết quả ghép trận.</p>
                </div>
            </div>

            {/* TABS */}
            <div className="flex border-b border-outline-variant/30">
                <button
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'NEW_VENUES'
                            ? 'border-brand-emerald text-brand-emerald'
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => setActiveTab('NEW_VENUES')}
                >
                    Cụm sân mới
                </button>
                <button
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === 'VENUE_REVISIONS'
                            ? 'border-brand-emerald text-brand-emerald'
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => setActiveTab('VENUE_REVISIONS')}
                >
                    Yêu cầu thay đổi
                </button>
                <button
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === 'MATCH_DISPUTES'
                            ? 'border-brand-emerald text-brand-emerald'
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => setActiveTab('MATCH_DISPUTES')}
                >
                    ⚠️ Tranh chấp ghép trận
                </button>
            </div>

            {activeTab === 'VENUE_REVISIONS' ? (
                <VenueRevisionAuditing />
            ) : activeTab === 'MATCH_DISPUTES' ? (
                <MatchDisputeAuditing />
            ) : (
                <NewVenueAuditing />
            )}
        </div>
    );
};
