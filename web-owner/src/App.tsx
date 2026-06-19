// Sporta Owner App Routing
import { Routes, Route, Navigate } from 'react-router-dom'
import { MobileHome } from './pages/MobileHome'
import { DesktopHome } from './pages/DesktopHome'
import { MatrixPage } from './pages/MatrixPage'
import { ScanPage } from './pages/ScanPage'
import { FacilityPage } from './pages/FacilityPage'
import { VenuePage } from './pages/VenuePage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage } from './pages/LoginPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { useIsMobile } from './hooks/useIsMobile'

function App() {
  const isMobile = useIsMobile();
  const Home = isMobile ? MobileHome : DesktopHome;

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/matrix" element={<MatrixPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/facility" element={<FacilityPage />} />
        <Route path="/venues" element={<VenuePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
