import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header.tsx';
import DashboardPage from './pages/Dashboard';
import RestaurantsPage from './pages/Restaurants';
import MenusPage from './pages/Menus';
import RecommendationsPage from './pages/Recommendations';
import BotSettingsPage from './pages/BotSettings.tsx';
import LoginPage from './pages/Login.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// 메인 레이아웃 컴포넌트
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden md:ml-64">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// 앱 컴포넌트
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/restaurants" element={
            <ProtectedRoute>
              <MainLayout>
                <RestaurantsPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/menus" element={
            <ProtectedRoute>
              <MainLayout>
                <MenusPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/recommendations" element={
            <ProtectedRoute>
              <MainLayout>
                <RecommendationsPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/bot-settings" element={
            <ProtectedRoute>
              <MainLayout>
                <BotSettingsPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;