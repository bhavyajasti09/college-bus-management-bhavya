import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { Bus, Sun, Moon, LogOut, Menu, X, Shield, User, Navigation, ArrowRight } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const getDashboardViewForRole = () => {
    if (!user) return 'login';
    switch (user.role) {
      case 'admin':
        return 'admin-dashboard';
      case 'coordinator':
        return 'coordinator-dashboard';
      case 'driver':
        return 'driver-dashboard';
      case 'student':
        return 'student-dashboard';
      default:
        return 'home';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/90 light:border-slate-200 light:bg-white/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 transition-opacity hover:opacity-90 dark:text-white light:text-slate-900"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
            <Bus className="h-5 w-5" />
          </div>
          <span className="flex items-center gap-1 font-bold text-xl tracking-tight">
            Campus<span className="text-cyan-400 light:text-blue-600">Ride</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (4-5 items) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-600">
          <button
            onClick={() => handleNavClick('live-track')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-cyan-400 light:hover:text-blue-600 ${
              currentView === 'live-track' ? 'text-cyan-400 font-semibold light:text-blue-600' : ''
            }`}
          >
            Track Bus
          </button>
          <button
            onClick={() => handleNavClick('routes')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-cyan-400 light:hover:text-blue-600 ${
              currentView === 'routes' ? 'text-cyan-400 font-semibold light:text-blue-600' : ''
            }`}
          >
            Routes & Stops
          </button>
          <button
            onClick={() => handleNavClick('schedule')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-cyan-400 light:hover:text-blue-600 ${
              currentView === 'schedule' ? 'text-cyan-400 font-semibold light:text-blue-600' : ''
            }`}
          >
            Schedules
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-cyan-400 light:hover:text-blue-600 ${
              currentView === 'about' ? 'text-cyan-400 font-semibold light:text-blue-600' : ''
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-cyan-400 light:hover:text-blue-600 ${
              currentView === 'contact' ? 'text-cyan-400 font-semibold light:text-blue-600' : ''
            }`}
          >
            Support
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 transition-colors hover:border-slate-700 hover:text-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 light:border-slate-200 light:bg-slate-100 light:text-slate-700"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick(getDashboardViewForRole())}
                className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-900/40 hover:border-cyan-400 light:border-blue-200 light:bg-blue-50 light:text-blue-700"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 light:bg-blue-200 light:text-blue-800">
                  {user.role === 'admin' ? (
                    <Shield className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                </div>
                <span className="font-semibold capitalize">{user.role} Portal</span>
              </button>

              <button
                onClick={logout}
                title="Sign Out"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition-colors hover:border-red-900 hover:text-red-400 dark:border-slate-800 light:border-slate-200 light:bg-slate-100 light:text-slate-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleNavClick('login')}
                className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors whitespace-nowrap shrink-0 dark:text-slate-300 light:text-slate-700 light:hover:text-slate-900"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 whitespace-nowrap shrink-0"
              >
                <span>Student Pass</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 dark:border-slate-800 light:border-slate-200 light:bg-slate-100 light:text-slate-700"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 py-4 space-y-3 dark:bg-slate-950/95 light:bg-white light:border-slate-200 shadow-xl">
          <button
            onClick={() => handleNavClick('live-track')}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-cyan-400 dark:text-slate-300 light:text-slate-700 light:hover:bg-slate-100"
          >
            <Navigation className="h-4 w-4 text-cyan-400" />
            Track Bus Live
          </button>
          <button
            onClick={() => handleNavClick('routes')}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-cyan-400 dark:text-slate-300 light:text-slate-700 light:hover:bg-slate-100"
          >
            Routes & Stops
          </button>
          <button
            onClick={() => handleNavClick('schedule')}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-cyan-400 dark:text-slate-300 light:text-slate-700 light:hover:bg-slate-100"
          >
            Transit Schedule
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-cyan-400 dark:text-slate-300 light:text-slate-700 light:hover:bg-slate-100"
          >
            About Us
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-cyan-400 dark:text-slate-300 light:text-slate-700 light:hover:bg-slate-100"
          >
            Support & Help
          </button>
          <div className="pt-2 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full rounded-lg border border-slate-700 py-2 text-center text-xs font-semibold text-slate-200 hover:bg-slate-900 light:border-slate-300 light:text-slate-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full rounded-lg bg-cyan-500 py-2 text-center text-xs font-semibold text-slate-950 hover:bg-cyan-400 font-bold"
                >
                  Register For Bus Pass
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavClick(getDashboardViewForRole())}
                className="w-full rounded-lg bg-cyan-600 py-2 text-center text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Go to {user?.role.toUpperCase()} Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
