import React from "react";

interface HeaderProps {
    currentTab: string;
}

export const Header: React.FC<HeaderProps> = ({ currentTab }) => {
    const getTitle = () => {
        switch (currentTab) {
            case "dashboard": return "Tổng Quan Hệ Thống";
            case "facilities": return "Danh Sách Sân Chờ Phê Duyệt";
            case "owners": return "Quản Lý Đối Tác & Chủ Sân";
            case "users": return "Quản Lý Người Dùng Hệ Thống";
            case "settings": return "Cài Đặt Cấu Hình Hệ Thống";
            default: return "Quản Trị Hệ Thống";
        }
    };

    return (
        <header className="h-16 bg-surface-container-lowest border-b border-surface-container fixed top-0 right-0 left-64 flex items-center justify-between px-8 z-10">
            {/* Dynamic Title */}
            <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-primary-container rounded-full" />
                <h2 className="text-lg font-bold text-on-surface tracking-tight">
                    {getTitle()}
                </h2>
            </div>

            {/* Admin Quick Info */}
            <div className="flex items-center gap-6">
                {/* Antigravity Framework Agent Status Badge */}
                <div className="flex items-center gap-2 bg-primary-container/10 px-3 py-1.5 rounded-full border border-primary-container/20">
                    <span className="w-1.5 h-1.5 bg-brand-yellow rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-on-primary-container uppercase tracking-wider">Antigravity Active</span>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 border-l border-surface-container pl-6">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-on-primary font-bold text-xs">
                        ĐN
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-on-surface">Đinh Trần Nguyên</span>
                        <span className="text-xs text-on-surface-variant">Super Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
}; 