import React from 'react';
import { Card } from '../../components/ui/Card';

export const Dashboard: React.FC = () => {
    // Mock data
    const metrics = [
        { label: 'Tổng Doanh Thu', value: '125,000,000 đ', change: '+12%', isPositive: true },
        { label: 'Người Dùng Mới', value: '3,456', change: '+5%', isPositive: true },
        { label: 'Lượt Đặt Sân', value: '1,234', change: '-2%', isPositive: false },
        { label: 'Sân Chờ Duyệt', value: '12', change: 'Cần xử lý', isPositive: false },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-on-background">Dashboard Tổng Quan</h1>
                <p className="text-on-surface-variant mt-1 text-sm">Theo dõi các chỉ số quan trọng của nền tảng Sporta.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, idx) => (
                    <Card key={idx} className="p-6">
                        <h3 className="text-sm font-medium text-on-surface-variant">{metric.label}</h3>
                        <p className="text-3xl font-bold text-on-surface mt-2">{metric.value}</p>
                        <div className={`mt-2 text-sm font-medium ${metric.isPositive ? 'text-brand-emerald' : 'text-error'}`}>
                            {metric.change}
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 min-h-[300px] flex items-center justify-center border-dashed border-2 border-outline-variant/30 bg-surface-container-lowest/50">
                    <p className="text-on-surface-variant">Biểu đồ doanh thu (Chờ tích hợp API/Thư viện)</p>
                </Card>
                <Card className="p-6 min-h-[300px] flex items-center justify-center border-dashed border-2 border-outline-variant/30 bg-surface-container-lowest/50">
                    <p className="text-on-surface-variant">Biểu đồ người dùng (Chờ tích hợp API/Thư viện)</p>
                </Card>
            </div>
        </div>
    );
};
