import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AdminLayoutProps {
    children: (currentTab: string) => React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [currentTab, setCurrentTab] = useState<string>("dashboard");

    return (
        <div className="min-h-screen bg-background font-sans text-on-background flex antialiased">
            {/* Sidebar cố định bên trái */}
            <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

            {/* Toàn bộ khu vực nội dung bên phải */}
            <div className="flex-1 flex flex-col pl-64">
                {/* Header trên cùng */}
                <Header currentTab={currentTab} />

                {/* Vùng hiển thị các View chức năng */}
                <main className="flex-1 p-8 pt-24 w-full mx-auto">
                    {children(currentTab)}
                </main>
            </div>
        </div>
    );
};