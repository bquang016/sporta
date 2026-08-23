// Sporta Owner App Routing
import { Routes, Route, Navigate } from 'react-router-dom'
import { MobileDashboardPage } from './features/dashboard/pages/MobileDashboardPage'
import { DesktopDashboardPage } from './features/dashboard/pages/DesktopDashboardPage'
import { MatrixPage } from './features/booking/pages/MatrixPage'
import { ScanPage } from './features/scan/pages/ScanPage'
import { OperationsPage } from './features/venue/pages/OperationsPage'
import { OperationsProvider } from './hooks/useOperationsState'
import { ProfilePage } from './features/profile/pages/ProfilePage'
import { SettingsPage } from './features/settings/pages/SettingsPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/registration/pages/RegisterPage'
import { SetupPage } from './features/registration/pages/SetupPage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { useIsMobile } from './hooks/useIsMobile'
import { WalletPage } from './features/wallet'
import { VoucherListPage } from './features/voucher/pages/VoucherListPage'
import { VoucherFormPage } from './features/voucher/pages/VoucherFormPage'

function App() {
  const isMobile = useIsMobile();
  const Home = isMobile ? MobileDashboardPage : DesktopDashboardPage;

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/setup" element={<SetupPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/matrix" element={<MatrixPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/operations" element={
          <OperationsProvider>
            <OperationsPage />
          </OperationsProvider>
        } />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/vouchers" element={<VoucherListPage />} />
        <Route path="/vouchers/create" element={<VoucherFormPage />} />
        <Route path="/vouchers/:id/edit" element={<VoucherFormPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
