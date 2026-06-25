// Sporta Owner App Routing
import { Routes, Route, Navigate } from 'react-router-dom'
import { MobileDashboardPage } from './features/dashboard/pages/MobileDashboardPage'
import { DesktopDashboardPage } from './features/dashboard/pages/DesktopDashboardPage'
import { MatrixPage } from './pages/MatrixPage'
import { ScanPage } from './pages/ScanPage'
import { OperationsPage } from './features/venue/pages/OperationsPage'
import { OperationsProvider } from './hooks/useOperationsState'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './features/registration/pages/RegisterPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { useIsMobile } from './hooks/useIsMobile'

function App() {
  const isMobile = useIsMobile();
  const Home = isMobile ? MobileDashboardPage : DesktopDashboardPage;

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
