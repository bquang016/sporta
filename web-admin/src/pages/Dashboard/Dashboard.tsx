import React from 'react';
import { AdminKPIStats } from './components/AdminKPIStats';
import { LineChart } from './components/LineChart';
import { AdminActivityLog } from './components/AdminActivityLog';

export const Dashboard: React.FC = () => {
    // Mock data
    const metrics = [
        { label: 'Tổng Doanh Thu', value: '125,000,000 đ', change: '+12%', isPositive: true },
        { label: 'Người Dùng Mới', value: '3,456', change: '+5%', isPositive: true },
        { label: 'Lượt Đặt Sân', value: '1,234', change: '-2%', isPositive: false },
        { label: 'Sân Chờ Duyệt', value: '12', change: 'Cần xử lý', isPositive: false },
    ];

    const revenueData = {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        values: [12000000, 15000000, 11000000, 18000000, 25000000, 32000000, 28000000]
    };

    const userData = {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        values: [45, 52, 38, 65, 89, 120, 105]
    };

    const activities = [
        { id: '1', time: '10:45 29/06', message: 'Hệ thống đã tự động duyệt 15 sân mới.' },
        { id: '2', time: '09:30 29/06', message: 'Người dùng ID #4592 vừa nâng cấp lên đối tác.' },
        { id: '3', time: '08:15 29/06', message: 'Cảnh báo: Server tải cao (85%) khu vực MN.' },
        { id: '4', time: '22:00 28/06', message: 'Hoàn thành sao lưu dữ liệu hàng ngày.' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 w-full">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Tổng Quan</h1>
                <p className="text-slate-500 mt-1 text-sm font-medium">Theo dõi các chỉ số quan trọng của nền tảng Sporta.</p>
            </div>

            {/* KPI Stats */}
            <AdminKPIStats metrics={metrics} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChart 
                    title="Biểu đồ doanh thu" 
                    subtitle="Doanh thu tổng hợp trên toàn hệ thống" 
                    data={revenueData} 
                    colorHex="#064E3B"
                    gradientId="revenue-grad"
                    formatValue={(val) => `${new Intl.NumberFormat('vi-VN').format(val)} đ`}
                />
                <LineChart 
                    title="Biểu đồ người dùng mới" 
                    subtitle="Lượng đăng ký mới trong tuần" 
                    data={userData} 
                    colorHex="#2563EB"
                    gradientId="users-grad"
                    formatValue={(val) => `${val} user`}
                />
            </div>

            {/* Activity Log */}
            <div className="w-full">
                <AdminActivityLog activities={activities} />
            </div>
        </div>
    );
};
