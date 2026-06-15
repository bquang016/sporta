// Sporta Owner App Routing
import { Routes, Route, Navigate } from 'react-router-dom'
import { MobileHome } from './pages/MobileHome'
import { DesktopHome } from './pages/DesktopHome'
import { MatrixPage } from './pages/MatrixPage'
import { ScanPage } from './pages/ScanPage'
import { FacilityPage } from './pages/FacilityPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { MobileLayout } from './components/layout/MobileLayout'
import { DesktopLayout } from './components/layout/DesktopLayout'
import { useIsMobile } from './hooks/useIsMobile'

function App() {
  const isMobile = useIsMobile();

  const Layout = isMobile ? MobileLayout : DesktopLayout;
  const Home = isMobile ? MobileHome : DesktopHome;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matrix" element={<MatrixPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/facility" element={<FacilityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
