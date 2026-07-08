import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App'
import { ToastProvider } from '@/components/ui/Toast'
import { BrowserRouter } from 'react-router-dom'

// Intercept all API requests to handle 401 Unauthorized or 403 Forbidden globally
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401 || response.status === 403) {
    // Clear tokens and force redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    localStorage.removeItem('permissions');
    
    // Prevent redirect loop if already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  return response;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
