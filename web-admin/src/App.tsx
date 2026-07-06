import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Dashboard } from "@/pages/Dashboard/Dashboard";
import { FacilityAuditing } from "@/pages/Facilities/FacilityAuditing";
import { UserManagement } from "@/pages/Users/UserManagement";
import { LoginPage } from "@/pages/Auth/LoginPage";
import { PermissionSettings } from "@/pages/Settings/PermissionSettings";

// A simple wrapper to check auth and permissions
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

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
        return <PermissionSettings />;
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <AdminLayout>
              {(currentTab) => renderContent(currentTab)}
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;