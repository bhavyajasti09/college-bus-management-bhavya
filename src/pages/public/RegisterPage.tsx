import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { IRoute } from '../../types/index.ts';
import { User, Mail, Lock, Phone, GraduationCap, MapPin, Bus, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, isLoading } = useAuth();
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: 'Computer Science & Engineering',
    rollNumber: '',
    routeId: 'route_1',
    pickupStopId: 'stop_1_2',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getRoutes().then((res) => {
      setRoutes(res.routes);
      if (res.routes.length > 0) {
        setFormData((prev) => ({
          ...prev,
          routeId: res.routes[0].id,
          pickupStopId: res.routes[0].stops[0]?.id || '',
        }));
      }
    }).catch(console.error);
  }, []);

  const selectedRoute = routes.find((r) => r.id === formData.routeId) || routes[0];

  const handleRouteChange = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    setFormData({
      ...formData,
      routeId,
      pickupStopId: route?.stops[0]?.id || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        department: formData.department,
        rollNumber: formData.rollNumber,
        routeId: formData.routeId,
        pickupStopId: formData.pickupStopId,
      });
      onNavigate('student-dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-950 light:bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 mb-3 hover:opacity-90 transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
            <Bus className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight dark:text-white light:text-slate-900">
            Campus<span className="text-cyan-400 light:text-blue-600">Ride</span>
          </span>
        </button>
        <h2 className="text-2xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
          Student Bus Pass Registration
        </h2>
        <p className="mt-1 text-xs text-slate-400 light:text-slate-600">
          Register your academic credentials to generate your semester transit pass and access live bus tracking.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 light:border-slate-200 light:bg-white">
          {error && (
            <div className="mb-5 p-3 rounded-xl border border-red-500/30 bg-red-950/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="student@campus.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Roll Number and Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student Roll / ID Number *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="CS-2024-042"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Academic Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option>Computer Science & Engineering</option>
                  <option>Mechanical & Aerospace</option>
                  <option>Electrical & Electronics</option>
                  <option>Biomedical Sciences</option>
                  <option>Business Administration</option>
                  <option>Architecture & Design</option>
                </select>
              </div>
            </div>

            {/* Route & Pickup Stop Selection */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>Designated Transit Corridor & Stop</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Select Corridor:
                  </label>
                  <select
                    value={formData.routeId}
                    onChange={(e) => handleRouteChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.routeCode} — {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Designated Pickup Stop:
                  </label>
                  <select
                    value={formData.pickupStopId}
                    onChange={(e) => setFormData({ ...formData, pickupStopId: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {selectedRoute?.stops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.scheduledTimeMorning})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password and Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 chars"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Re-type password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Creating Student Profile...' : 'Complete Registration & Submit Pass'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Already hold a CampusRide registration? </span>
            <button
              onClick={() => onNavigate('login')}
              className="font-bold text-cyan-400 hover:underline"
            >
              Sign In to Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
