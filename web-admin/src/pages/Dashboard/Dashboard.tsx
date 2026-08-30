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
        { label: 'Tổng Doanh Thu', value: '0 đ', change: 'Doanh thu tích lũy', isPositive: true },
        { 
            label: 'Doanh thu Hoa hồng', 
            value: '0 đ', 
            change: '10% GMV hệ thống', 
            isPositive: true,
            tooltip: 'Tính bằng 10% chiết khấu trung bình nhân với tổng số tiền giao dịch thành công.'
        },
        { label: 'Người Dùng', value: '0', change: 'Tổng tài khoản', isPositive: true },
        { label: 'Lượt Đặt Sân', value: '0', change: 'Tổng lượt đặt', isPositive: true },
        { label: 'Sân Chờ Duyệt', value: '0', change: 'Đã xử lý xong', isPositive: true },
    ]);

    const [revenueData, setRevenueData] = useState<AdminChartData>({
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        values: [0, 0, 0, 0, 0, 0, 0]
    });

    const [userData, setUserData] = useState<AdminChartData>({
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        values: [0, 0, 0, 0, 0, 0, 0]
    });

    const [activities, setActivities] = useState<AdminActivity[]>([]);

    const [leaderboardData, setLeaderboardData] = useState<Record<string, PartnerData[]>>({});

    const fetchOverview = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAdminDashboardOverview(timeFilter);
            if (data) {
                if (data.metrics) setMetrics(data.metrics);
                if (data.revenueData) setRevenueData(data.revenueData);
                if (data.userData) setUserData(data.userData);
                if (data.activities) setActivities(data.activities);
                if (data.leaderboardData) setLeaderboardData(data.leaderboardData);
            }
        } catch (err: any) {
            console.error('Error fetching admin dashboard overview:', err);
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
