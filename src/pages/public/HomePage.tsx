import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  QrCode,
  Users,
  Search,
  CheckCircle,
  Bus,
} from 'lucide-react';
import { LiveMap } from '../../components/common/LiveMap.tsx';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [searchStop, setSearchStop] = useState('');
  const [quickSearchResults, setQuickSearchResults] = useState<{
    route: string;
    stop: string;
    morningTime: string;
    eveningTime: string;
    bus: string;
  }[] | null>(null);

  const sampleStops = [
    { route: 'North Campus Express (NCR-101)', stop: 'Greenwood Heights & Metro Cross', morningTime: '07:28 AM', eveningTime: '05:32 PM', bus: 'CR-01' },
    { route: 'North Campus Express (NCR-101)', stop: 'North Ridge Residential Suites', morningTime: '07:15 AM', eveningTime: '05:45 PM', bus: 'CR-01' },
    { route: 'South Metro Shuttle (SMS-202)', stop: 'South City Transit Hub', morningTime: '07:05 AM', eveningTime: '05:50 PM', bus: 'CR-02' },
    { route: 'South Metro Shuttle (SMS-202)', stop: 'Lakeside Graduate Apartments', morningTime: '07:22 AM', eveningTime: '05:35 PM', bus: 'CR-02' },
    { route: 'West Tech Valley Loop (WTV-303)', stop: 'Valley View Tech Residency', morningTime: '07:20 AM', eveningTime: '05:40 PM', bus: 'CR-03' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchStop.trim()) {
      setQuickSearchResults(null);
      return;
    }
    const filtered = sampleStops.filter((s) =>
      s.stop.toLowerCase().includes(searchStop.toLowerCase()) ||
      s.route.toLowerCase().includes(searchStop.toLowerCase())
    );
    setQuickSearchResults(filtered);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 dark:bg-slate-950 light:bg-slate-50 light:text-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-[580px] flex items-center justify-center overflow-hidden border-b border-slate-800">
        {/* Background Image with Measured Contrast Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/campus_bus_hero_1791871320539.jpg"
            alt="Modern Campus Transit Bus"
            className="w-full h-full object-cover object-center filter brightness-[0.4] contrast-[1.05]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-c from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center flex flex-col items-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/50 backdrop-blur-md text-xs font-semibold text-cyan-300 shadow-sm shadow-cyan-500/20 mb-6">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>Next-Generation University Mobility</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-mono">100% Electric EV Fleet</span>
          </div>

          {/* Animated Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl">
            Smart Campus <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Transportation</span> for Modern Universities
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Real-time GPS bus tracking, contactless QR attendance passes, automated route scheduling, and zero-emission transit analytics engineered for students and campus staff.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 w-full max-w-md">
            <button
              onClick={() => onNavigate('live-track')}
              className="flex-1 min-w-[160px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Navigation className="h-4 w-4" />
              <span>Track Bus Live</span>
            </button>

            <button
              onClick={() => onNavigate('routes')}
              className="flex-1 min-w-[160px] flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:border-slate-600 hover:text-white"
            >
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span>View Routes</span>
            </button>
          </div>

          {/* Secondary Quick Access Links */}
          <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => onNavigate('login')}
              className="hover:text-cyan-400 transition-colors font-medium flex items-center gap-1"
            >
              <span>Student / Staff Login</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('register')}
              className="hover:text-cyan-400 transition-colors font-medium flex items-center gap-1"
            >
              <span>Apply Digital Bus Pass</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Fleet KPI Metric Bar */}
      <section className="border-b border-slate-800 bg-slate-900/50 py-6 dark:bg-slate-900/50 light:bg-white light:border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <div className="text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">48+</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                Electric Campus Buses
              </div>
            </div>
            <div className="p-3">
              <div className="text-3xl font-extrabold text-blue-400 font-mono tabular-nums">12,500+</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                Daily Student Trips
              </div>
            </div>
            <div className="p-3">
              <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">98.4%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                On-Time Departure Rate
              </div>
            </div>
            <div className="p-3">
              <div className="text-3xl font-extrabold text-purple-400 font-mono tabular-nums">100%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                Real-Time GPS Coverage
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Route & Stop Lookup Widget */}
      <section className="py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 backdrop-blur-md shadow-xl dark:border-slate-800 dark:bg-slate-900/80 light:border-slate-200 light:bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-900">
                Quick Transit & Stop Lookup
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
                Enter your residential community, campus dorm, or stop name to check scheduled bus arrival times.
              </p>
            </div>
            <span className="text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full w-fit">
              Active Term Timetables
            </span>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by stop name (e.g. Greenwood Heights, Lakeside, North Ridge)..."
                value={searchStop}
                onChange={(e) => setSearchStop(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-950 light:border-slate-300 light:bg-slate-50 light:text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-colors shrink-0"
            >
              Search Timetable
            </button>
          </form>

          {/* Results display */}
          {quickSearchResults && (
            <div className="mt-6 border-t border-slate-800 pt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Found {quickSearchResults.length} Matching Scheduled Stops:
              </h4>
              {quickSearchResults.length === 0 ? (
                <div className="text-sm text-slate-400 py-3">
                  No stops found matching "{searchStop}". Please check our full{' '}
                  <button onClick={() => onNavigate('routes')} className="text-cyan-400 underline">
                    Routes & Stops directory
                  </button>
                  .
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickSearchResults.map((res, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-slate-200">{res.stop}</span>
                        <span className="font-mono text-xs text-cyan-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
                          Bus {res.bus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{res.route}</p>
                      <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-2 border-t border-slate-800/60">
                        <span>Morning Pickup: <strong className="text-emerald-400">{res.morningTime}</strong></span>
                        <span>Evening Drop: <strong className="text-amber-400">{res.eveningTime}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Live Map Preview Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <Navigation className="h-3.5 w-3.5" />
              <span>Interactive Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-slate-900">
              Live Campus Transit Network
            </h2>
            <p className="text-sm text-slate-400 light:text-slate-600 mt-1">
              Select any active electric bus to view its current heading, speed, next designated stop, and seating capacity.
            </p>
          </div>
          <button
            onClick={() => onNavigate('live-track')}
            className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Open Fullscreen Radar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <LiveMap height="500px" showControls={true} />
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-slate-900">
            Comprehensive Transit Intelligence
          </h2>
          <p className="text-sm text-slate-400 light:text-slate-600 mt-2">
            Built from the ground up to replace paper passes and manual sign-ins with real-time digital automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="h-44 w-full rounded-xl overflow-hidden mb-5">
                <img
                  src="/src/assets/images/student_boarding_pass_1791871321597.jpg"
                  alt="Digital Pass Scanning"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <QrCode className="h-5 w-5" />
                <h3 className="font-bold text-base text-white">Digital QR Bus Passes</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure encrypted QR passes generated instantly upon coordinator approval. Drivers validate boarding with the integrated scanner, preventing fraudulent access.
              </p>
            </div>
            <ul className="mt-4 pt-4 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Zero duplicate boarding verification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Instant semester validity check</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="h-44 w-full rounded-xl overflow-hidden mb-5">
                <img
                  src="/src/assets/images/bus_fleet_showcase_1791871320604.jpg"
                  alt="Smart Bus Fleet"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Bus className="h-5 w-5" />
                <h3 className="font-bold text-base text-white">Fleet & Driver Dispatch</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated driver assignments, vehicle maintenance scheduling, battery health telemetry, and emergency dispatch alerts for complete transport transparency.
              </p>
            </div>
            <ul className="mt-4 pt-4 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Automated preventive service logs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Driver work shift optimization</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="h-44 w-full rounded-xl overflow-hidden mb-5">
                <img
                  src="/src/assets/images/campus_map_aerial_1791871320710.jpg"
                  alt="Campus Map Aerial"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Clock className="h-5 w-5" />
                <h3 className="font-bold text-base text-white">Precise Timetable Schedules</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time delay tracking, morning and evening semester schedules, notifications on campus road work or weather changes, and automated passenger counting.
              </p>
            </div>
            <ul className="mt-4 pt-4 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Automated delay push notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Custom pickup stop requests</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Role Selector Callout */}
      <section className="py-12 px-4 max-w-5xl mx-auto w-full mb-12">
        <div className="rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/40 p-8 text-center flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Ready to Experience CampusRide?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
            Log in to your respective role dashboard or try our 1-click demo logins for Administrator, Student, Driver, or Transport Coordinator.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
            >
              Access Portal
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Register Student Pass
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
