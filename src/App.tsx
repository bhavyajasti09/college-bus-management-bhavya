import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';

// Public Pages
import { HomePage } from './pages/public/HomePage.tsx';
import { LiveTrackPage } from './pages/public/LiveTrackPage.tsx';
import { RoutesPage } from './pages/public/RoutesPage.tsx';
import { SchedulePage } from './pages/public/SchedulePage.tsx';
import { AboutPage } from './pages/public/AboutPage.tsx';
import { ContactPage } from './pages/public/ContactPage.tsx';
import { LoginPage } from './pages/public/LoginPage.tsx';
import { RegisterPage } from './pages/public/RegisterPage.tsx';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage.tsx';

// Protected Dashboards
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { StudentDashboard } from './pages/student/StudentDashboard.tsx';
import { DriverDashboard } from './pages/driver/DriverDashboard.tsx';
import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard.tsx';

function MainApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');

  // Handle URL hash changes for deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentView(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guard protected routes
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center text-cyan-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Initializing CampusRide...
            </span>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'live-track':
        return <LiveTrackPage />;
      case 'routes':
        return <RoutesPage onNavigate={navigateTo} />;
      case 'schedule':
        return <SchedulePage onNavigate={navigateTo} />;
      case 'about':
        return <AboutPage onNavigate={navigateTo} />;
      case 'contact':
        return <ContactPage />;
      case 'login':
        return <LoginPage onNavigate={navigateTo} />;
      case 'register':
        return <RegisterPage onNavigate={navigateTo} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={navigateTo} />;

      // Protected Role Portals
      case 'admin-dashboard':
        if (!isAuthenticated || user?.role !== 'admin') {
          return <LoginPage onNavigate={navigateTo} />;
        }
        return <AdminDashboard />;

      case 'student-dashboard':
        if (!isAuthenticated) {
          return <LoginPage onNavigate={navigateTo} />;
        }
        return <StudentDashboard />;

      case 'driver-dashboard':
        if (!isAuthenticated || (user?.role !== 'driver' && user?.role !== 'admin')) {
          return <LoginPage onNavigate={navigateTo} />;
        }
        return <DriverDashboard />;

      case 'coordinator-dashboard':
        if (!isAuthenticated || (user?.role !== 'coordinator' && user?.role !== 'admin')) {
          return <LoginPage onNavigate={navigateTo} />;
        }
        return <CoordinatorDashboard />;

      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  const isDashboardView = currentView.endsWith('-dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 dark:bg-slate-950 light:bg-slate-50 light:text-slate-900 transition-colors duration-200">
      <Navbar currentView={currentView} onNavigate={navigateTo} />
      <div className="flex-1">{renderContent()}</div>
      {!isDashboardView && <Footer onNavigate={navigateTo} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
