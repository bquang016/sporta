import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileLayout } from '../layout/MobileLayout';
import { DesktopLayout } from '../layout/DesktopLayout';
import { getLoggedInUser } from '../../utils/auth';

import ForceChangePasswordModal from '../../features/auth/components/ForceChangePasswordModal';

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

  const mustChangePassword = localStorage.getItem('mustChangePassword') === 'true';
  const snoozeUntil = localStorage.getItem('passwordSnoozeUntil');
  const isSnoozed = snoozeUntil ? new Date(snoozeUntil) > new Date() : false;

  // Only show the modal when: must change password AND snooze is NOT active
  const showChangePasswordReminder = mustChangePassword && !isSnoozed;

  // Wrap the nested route content (Outlet) inside the Layout
  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {showChangePasswordReminder && <ForceChangePasswordModal />}
    </>
  );
};

export default ProtectedRoute;

