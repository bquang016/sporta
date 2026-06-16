import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileLayout } from '../layout/MobileLayout';
import { DesktopLayout } from '../layout/DesktopLayout';
import { getLoggedInUser } from '../../utils/auth';

export const ProtectedRoute = () => {
  const user = getLoggedInUser();
  const isMobile = useIsMobile();
  const Layout = isMobile ? MobileLayout : DesktopLayout;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'OWNER') {
    // If authenticated but not an owner, deny access
    localStorage.removeItem('accessToken');
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ error: 'Tài khoản không có quyền truy cập trang quản lý chủ sân.' }} 
      />
    );
  }

  // Wrap the nested route content (Outlet) inside the Layout
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;
