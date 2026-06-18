import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { FacilityAuditing } from "./pages/Facilities/FacilityAuditing";
import { UserManagement } from "./pages/Users/UserManagement";

function App() {
  const renderContent = (currentTab: string) => {
    switch (currentTab) {
      case "dashboard":
        return <Dashboard />;
      case "facilities":
        return <FacilityAuditing />;
      case "users":
      case "owners":
        return <UserManagement />;
      case "settings":
        return (
          <div className="bg-surface rounded-xl p-6 shadow-sm border border-outline-variant/20 min-h-[500px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold mt-1 text-on-surface">Cài đặt hệ thống</h3>
              <p className="text-sm text-on-surface-variant mt-2">Tính năng đang được phát triển.</p>
            </div>
          </div>
        );
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <AdminLayout>
      {(currentTab) => renderContent(currentTab)}
    </AdminLayout>
  );
}

export default App;