import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';
import { Lock, Mail, Bus, ArrowRight, Shield, User, KeyRound, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, loginAsDemo, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password, selectedRole);
      // Navigate to respective dashboard
      if (selectedRole === 'admin') onNavigate('admin-dashboard');
      else if (selectedRole === 'coordinator') onNavigate('coordinator-dashboard');
      else if (selectedRole === 'driver') onNavigate('driver-dashboard');
      else onNavigate('student-dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    setError(null);
    try {
      await loginAsDemo(role);
      if (role === 'admin') onNavigate('admin-dashboard');
      else if (role === 'coordinator') onNavigate('coordinator-dashboard');
      else if (role === 'driver') onNavigate('driver-dashboard');
      else onNavigate('student-dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-950 light:bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25">
            <Bus className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight dark:text-white light:text-slate-900">
            Campus<span className="text-cyan-400 light:text-blue-600">Ride</span>
          </span>
        </button>
        <h2 className="text-2xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
          Sign In to Your Transit Portal
        </h2>
        <p className="mt-1 text-xs text-slate-400 light:text-slate-600">
          Select your institutional role to access live telemetry, passes, and dispatch controls.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Quick Demo Logins Box (One-click instantaneous role testing) */}
        <div className="mb-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/40 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              1-Click Demo Logins
            </span>
            <span className="text-[10px] text-slate-400">Instant Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="flex items-center justify-between p-2.5 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/50 text-left transition-colors"
            >
              <div>
                <div className="text-xs font-bold text-purple-200">Administrator</div>
                <div className="text-[10px] text-purple-400/80">Full Fleet & DB</div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-purple-400" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('coordinator')}
              className="flex items-center justify-between p-2.5 rounded-xl border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/50 text-left transition-colors"
            >
              <div>
                <div className="text-xs font-bold text-blue-200">Coordinator</div>
                <div className="text-[10px] text-blue-400/80">Trips & Approvals</div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('driver')}
              className="flex items-center justify-between p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/50 text-left transition-colors"
            >
              <div>
                <div className="text-xs font-bold text-amber-200">Bus Driver</div>
                <div className="text-[10px] text-amber-400/80">GPS & QR Scanner</div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student')}
              className="flex items-center justify-between p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 text-left transition-colors"
            >
              <div>
                <div className="text-xs font-bold text-cyan-200">College Student</div>
                <div className="text-[10px] text-cyan-400/80">Digital QR Pass</div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Main Form Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 light:border-slate-200 light:bg-white">
          {/* Role Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Select Your Role:
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {(['student', 'driver', 'coordinator', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-1.5 text-[11px] font-bold rounded-lg capitalize transition-colors ${
                    selectedRole === r
                      ? 'bg-cyan-500 text-slate-950 font-extrabold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-950/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder={`${selectedRole}@campusride.edu`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Credentials...' : `Sign In as ${selectedRole.toUpperCase()}`}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>New student without a transit pass? </span>
            <button
              onClick={() => onNavigate('register')}
              className="font-bold text-cyan-400 hover:underline"
            >
              Register Account Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
