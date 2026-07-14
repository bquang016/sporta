import React, { useState } from 'react';
import { AdminKPIStats } from './components/AdminKPIStats';
import { LineChart } from './components/LineChart';
import { AdminActivityLog } from './components/AdminActivityLog';
import { PartnerLeaderboard } from './components/PartnerLeaderboard';
import type { PartnerData } from './components/PartnerLeaderboard';

export const Dashboard: React.FC = () => {
    // State to simulate leaderboard statuses (Normal, Loading, Error, Empty)
    const [simulationMode, setSimulationMode] = useState<'normal' | 'loading' | 'error' | 'empty'>('normal');
    // Time filter state
    const [timeFilter, setTimeFilter] = useState<string>('this_month');

    // KPI Metrics including "Doanh thu Hoa hồng"
    const metrics = [
        { label: 'Tổng Doanh Thu', value: '125,000,000 đ', change: '+12%', isPositive: true },
        { 
            label: 'Doanh thu Hoa hồng', 
            value: '12,500,000 đ', 
            change: '+8%', 
            isPositive: true,
            tooltip: 'Tính bằng 10% chiết khấu trung bình nhân với tổng số tiền giao dịch Online thành công.'
        },
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

    // Mock partner leaderboard data with edge cases (duplicate GMV values)
    const leaderboardData: Record<string, PartnerData[]> = {
        this_month: [
            { id: '1', courtName: 'Sân bóng Thành Phát', ownerName: 'Nguyễn Văn Thành', successfulBookings: 240, totalGmv: 120000000, commission: 12000000 },
            { id: '2', courtName: 'Sân bóng Ngôi Sao', ownerName: 'Trần Thanh Sơn', successfulBookings: 180, totalGmv: 95000000, commission: 9500000 },
            // Edge Case: Cụm Sân Đại Học Y and Cụm Sân Viettel have identical GMV (85M).
            // Đại Học Y has more bookings (175 > 150) so it must rank higher (Rank 3 vs Rank 4).
            { id: '3', courtName: 'Cụm Sân Đại Học Y (Trùng GMV)', ownerName: 'Phạm Hồng Thái', successfulBookings: 175, totalGmv: 85000000, commission: 8500000 },
            { id: '4', courtName: 'Cụm Sân Viettel (Trùng GMV)', ownerName: 'Lê Hoàng Long', successfulBookings: 150, totalGmv: 85000000, commission: 8500000 },
            { id: '5', courtName: 'Cụm Sân Thành Lâm', ownerName: 'Vũ Thành Lâm', successfulBookings: 130, totalGmv: 72000000, commission: 7200000 },
            { id: '6', courtName: 'Sân cỏ nhân tạo PVF', ownerName: 'Nguyễn Minh Hải', successfulBookings: 110, totalGmv: 65000000, commission: 6500000 },
            { id: '7', courtName: 'Cụm Sân Đất Việt', ownerName: 'Trịnh Quốc Đất', successfulBookings: 98, totalGmv: 58000000, commission: 5800000 },
            { id: '8', courtName: 'Sân bóng Thăng Long', ownerName: 'Đặng Ngọc Long', successfulBookings: 90, totalGmv: 45000000, commission: 4500000 },
            { id: '9', courtName: 'Sân bóng Đền Lừ', ownerName: 'Bùi Quang Đại', successfulBookings: 70, totalGmv: 35000000, commission: 3500000 },
            { id: '10', courtName: 'Sân bóng Bách Khoa', ownerName: 'Trương Quốc Anh', successfulBookings: 60, totalGmv: 30000000, commission: 3000000 },
            { id: '11', courtName: 'Sân bóng Mỹ Đình', ownerName: 'Lê Văn Mỹ', successfulBookings: 50, totalGmv: 25000000, commission: 2500000 },
        ],
        last_month: [
            { id: '1', courtName: 'Sân bóng Thành Phát', ownerName: 'Nguyễn Văn Thành', successfulBookings: 220, totalGmv: 110000000, commission: 11000000 },
            // Edge Case: Đại Học Y and Ngôi Sao have identical GMV (90M).
            // Đại Học Y has 190 bookings, Ngôi Sao has 170 bookings. Đại Học Y ranks higher.
            { id: '2', courtName: 'Cụm Sân Đại Học Y (Trùng GMV)', ownerName: 'Phạm Hồng Thái', successfulBookings: 190, totalGmv: 90000000, commission: 9000000 },
            { id: '3', courtName: 'Sân bóng Ngôi Sao (Trùng GMV)', ownerName: 'Trần Thanh Sơn', successfulBookings: 170, totalGmv: 90000000, commission: 9000000 },
            { id: '4', courtName: 'Cụm Sân Viettel', ownerName: 'Lê Hoàng Long', successfulBookings: 140, totalGmv: 80000000, commission: 8000000 },
            { id: '5', courtName: 'Cụm Sân Thành Lâm', ownerName: 'Vũ Thành Lâm', successfulBookings: 125, totalGmv: 68000000, commission: 6800000 },
            { id: '6', courtName: 'Sân cỏ nhân tạo PVF', ownerName: 'Nguyễn Minh Hải', successfulBookings: 115, totalGmv: 67000000, commission: 6700000 },
            { id: '7', courtName: 'Cụm Sân Đất Việt', ownerName: 'Trịnh Quốc Đất', successfulBookings: 95, totalGmv: 55000000, commission: 5500000 },
            { id: '8', courtName: 'Sân bóng Thăng Long', ownerName: 'Đặng Ngọc Long', successfulBookings: 88, totalGmv: 42000000, commission: 4200000 },
            { id: '9', courtName: 'Sân bóng Đền Lừ', ownerName: 'Bùi Quang Đại', successfulBookings: 75, totalGmv: 38000000, commission: 3800000 },
            { id: '10', courtName: 'Sân bóng Bách Khoa', ownerName: 'Trương Quốc Anh', successfulBookings: 58, totalGmv: 28000000, commission: 2800000 },
        ],
        year: [
            { id: '1', courtName: 'Sân bóng Thành Phát', ownerName: 'Nguyễn Văn Thành', successfulBookings: 2500, totalGmv: 1250000000, commission: 125000000 },
            { id: '2', courtName: 'Sân bóng Ngôi Sao', ownerName: 'Trần Thanh Sơn', successfulBookings: 2000, totalGmv: 1000000000, commission: 100000000 },
            { id: '3', courtName: 'Cụm Sân Đại Học Y', ownerName: 'Phạm Hồng Thái', successfulBookings: 1850, totalGmv: 925000000, commission: 92500000 },
            { id: '4', courtName: 'Cụm Sân Viettel', ownerName: 'Lê Hoàng Long', successfulBookings: 1600, totalGmv: 800000000, commission: 80000000 },
            // Edge Case: Thành Lâm and PVF have identical GMV (650M).
            // Thành Lâm has 1300 bookings, PVF has 1280 bookings. Thành Lâm ranks higher.
            { id: '5', courtName: 'Cụm Sân Thành Lâm (Trùng GMV)', ownerName: 'Vũ Thành Lâm', successfulBookings: 1300, totalGmv: 650000000, commission: 65000000 },
            { id: '6', courtName: 'Sân cỏ nhân tạo PVF (Trùng GMV)', ownerName: 'Nguyễn Minh Hải', successfulBookings: 1280, totalGmv: 650000000, commission: 65000000 },
            { id: '7', courtName: 'Cụm Sân Đất Việt', ownerName: 'Trịnh Quốc Đất', successfulBookings: 1100, totalGmv: 590000000, commission: 59000000 },
            { id: '8', courtName: 'Sân bóng Thăng Long', ownerName: 'Đặng Ngọc Long', successfulBookings: 980, totalGmv: 490000000, commission: 49000000 },
            { id: '9', courtName: 'Sân bóng Đền Lừ', ownerName: 'Bùi Quang Đại', successfulBookings: 850, totalGmv: 425000000, commission: 42500000 },
            { id: '10', courtName: 'Sân bóng Bách Khoa', ownerName: 'Trương Quốc Anh', successfulBookings: 720, totalGmv: 360000000, commission: 36000000 },
        ]
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Tổng Quan</h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium">Theo dõi các chỉ số quan trọng của nền tảng Sporta.</p>
                </div>
                
                {/* Developer simulation controls */}
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 self-start md:self-auto select-none">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1.5">Mô phỏng Leaderboard:</span>
                    {(['normal', 'loading', 'error', 'empty'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setSimulationMode(mode)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                simulationMode === mode
                                    ? 'bg-white text-brand-emerald shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
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
                    data={simulationMode === 'empty' ? [] : (leaderboardData[timeFilter] || [])}
                    isLoading={simulationMode === 'loading'}
                    error={simulationMode === 'error' ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền internet.' : null}
                    onRetry={() => setSimulationMode('normal')}
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
