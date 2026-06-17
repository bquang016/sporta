import React from "react";

interface SidebarProps {
    currentTab: string;
    setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
    const menuItems = [
        { id: "dashboard", label: "Dashboard Thống Kê", icon: "📊" },
        { id: "facilities", label: "Kiểm Duyệt Sân", icon: "🏟️" },
        { id: "owners", label: "Quản Lý Chủ Sân", icon: "🤝" },
        { id: "users", label: "Quản Lý Người Dùng", icon: "👥" },
        { id: "settings", label: "Cấu Hình Hệ Thống", icon: "⚙️" },
    ];

    return (
        <aside className="w-64 bg-primary text-on-primary h-screen fixed left-0 top-0 flex flex-col z-20 border-r border-outline-variant/10">
            {/* Brand Header */}
            <div className="p-6 border-b border-outline-variant/10 flex items-center gap-3 bg-primary-container/20">
                <span className="text-2xl text-brand-yellow">⚡</span>
                <div>
                    <h1 className="text-lg font-extrabold tracking-tight text-on-primary">SPORTA</h1>
                    <p className="text-xs text-on-primary-container/80 font-medium">Hệ Thống Admin</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = currentTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-DEFAULT text-sm font-semibold transition-all duration-150 cursor-pointer text-left group ${isActive
                                    ? "bg-secondary-container text-on-secondary-container shadow-xs"
                                    : "text-on-primary/70 hover:bg-primary-container hover:text-on-primary"
                                }`}
                        >
                            <span className={`text-base transition-transform duration-150 group-hover:scale-110 ${isActive ? "text-on-secondary-container" : "text-on-primary/50 group-hover:text-on-primary"}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-outline-variant/10 bg-primary-container/10 text-center">
                <p className="text-xs text-on-primary/40">Sporta Admin v1.0.0</p>
            </div>
        </aside>
    );
};