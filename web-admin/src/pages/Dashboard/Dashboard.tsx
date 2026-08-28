import React, { useState, useEffect } from 'react';
import { AdminKPIStats } from './components/AdminKPIStats';
import { LineChart } from './components/LineChart';
import { AdminActivityLog } from './components/AdminActivityLog';
import { PartnerLeaderboard } from './components/PartnerLeaderboard';
import {
  getAdminDashboardOverview,
  type AdminKpi,
  type AdminChartData,
  type AdminActivity,
  type PartnerData
} from '@/api/adminDashboardApi';

export const Dashboard: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState<string>('this_month');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [metrics, setMetrics] = useState<AdminKpi[]>([
        { label: 'Tổng Doanh Thu', value: '125,000,000 đ', change: '+12%', isPositive: true },
        { 
            label: 'Doanh thu Hoa hồng', 
            value: '12,500,000 đ', 
            change: '+8%', 
            isPositive: true,
            tooltip: 'Tính bằng 10% chiết khấu trung bình nhân với tổng số tiền giao dịch Online thành công.'
        },
        { label: 'Người Dùng Mới', value: '3,456', change: '+5%', isPositive: true },
        { label: 'Lượt Đặt Sân', value: '1,234', change: '+4%', isPositive: true },
        { label: 'Sân Chờ Duyệt', value: '12', change: 'Cần xử lý', isPositive: false },
    ]);

    const [revenueData, setRevenueData] = useState<AdminChartData>({
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        values: [12000000, 15000000, 11000000, 18000000, 25000000, 32000000, 28000000]
    });

    const [userData, setUserData] = useState<AdminChartData>({
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        values: [45, 52, 38, 65, 89, 120, 105]
    });

    const [activities, setActivities] = useState<AdminActivity[]>([
        { id: '1', time: '10:45 Hôm nay', message: 'Hệ thống đã tự động duyệt các sân mới.' },
        { id: '2', time: '09:30 Hôm nay', message: 'Người dùng vừa đăng ký trở thành đối tác.' },
    ]);

    const [leaderboardData, setLeaderboardData] = useState<Record<string, PartnerData[]>>({});

    const fetchOverview = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAdminDashboardOverview(timeFilter);
            if (data) {
                if (data.metrics && data.metrics.length > 0) setMetrics(data.metrics);
                if (data.revenueData && data.revenueData.labels) setRevenueData(data.revenueData);
                if (data.userData && data.userData.labels) setUserData(data.userData);
                if (data.activities && data.activities.length > 0) setActivities(data.activities);
                if (data.leaderboardData) setLeaderboardData(data.leaderboardData);
            }
        } catch (err: any) {
            console.warn('Using client dashboard fallback:', err);
            setError(err.message || 'Không thể kết nối máy chủ');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, [timeFilter]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Tổng Quan</h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium">Theo dõi các chỉ số quan trọng của nền tảng Sporta.</p>
                </div>
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

            {/* Partner Leaderboard */}
            <div className="w-full">
                <PartnerLeaderboard 
                    data={leaderboardData[timeFilter] || []}
                    isLoading={isLoading}
                    error={error}
                    onRetry={fetchOverview}
                    timeFilter={timeFilter}
                    onTimeFilterChange={setTimeFilter}
                />
            </div>

            {/* Activity Log */}
            <div className="w-full">
                <AdminActivityLog activities={activities} />
            </div>
        </div>
    );
};
