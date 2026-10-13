import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { IRoute } from '../../types/index.ts';
import { LiveMap } from '../../components/common/LiveMap.tsx';
import { MapPin, Clock, ArrowRight, DollarSign, Bus } from 'lucide-react';

interface RoutesPageProps {
  onNavigate: (view: string) => void;
}

export const RoutesPage: React.FC<RoutesPageProps> = ({ onNavigate }) => {
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getRoutes().then((res) => {
      setRoutes(res.routes);
      if (res.routes.length > 0) {
        setSelectedRouteId(res.routes[0].id);
      }
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.routeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.stops.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 dark:bg-slate-950 light:bg-slate-50 light:text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>Network Corridors</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
              Campus Bus Routes & Designated Stops
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Official university shuttle corridors connecting residential complexes, research parks, and metro interchanges directly to the Central Academic Quadrant.
            </p>
          </div>
          <button
            onClick={() => onNavigate('register')}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all shrink-0"
          >
            Apply For Bus Pass
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Filter by route name, code, or stop location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading transit corridors...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Route List Tabs */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Available Routes ({filteredRoutes.length})
              </h3>
              {filteredRoutes.map((route) => {
                const isSelected = route.id === selectedRouteId;
                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-slate-900 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                          {route.routeCode}
                        </span>
                        <h4 className="font-bold text-base text-white">{route.name}</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-mono tabular-nums">
                        {route.totalDistanceKm} km
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 mb-3">
                      <div>Origin: <strong className="text-slate-200">{route.origin}</strong></div>
                      <div>Terminal: <strong className="text-slate-200">{route.destination}</strong></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/70 font-mono tabular-nums">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        ~{route.estimatedDurationMins} mins
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="h-3.5 w-3.5 text-blue-400" />
                        {route.stops.length} Stops
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Bus className="h-3.5 w-3.5" />
                        {route.assignedBusIds.length || 1} Buses
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Route Details & Stops */}
            {activeRoute && (
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs text-cyan-400 font-mono uppercase font-bold tracking-wider">
                        Active Selection: {activeRoute.routeCode}
                      </span>
                      <h3 className="text-xl font-extrabold text-white mt-0.5">
                        {activeRoute.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => onNavigate('schedule')}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>Full Timetable</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Sequence of Stops */}
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Stops & Departure Timetable
                  </h4>
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                    {activeRoute.stops.map((stop, index) => (
                      <div
                        key={stop.id}
                        className="relative flex items-start gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/60"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-400 text-xs font-extrabold font-mono z-10 shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-200">{stop.name}</span>
                            <span className="text-xs text-emerald-400 font-mono font-semibold">
                              ${stop.fare}/term
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-xs font-mono tabular-nums text-slate-400">
                            <span>Morning Pickup: <strong className="text-slate-200">{stop.scheduledTimeMorning}</strong></span>
                            <span>Evening Drop: <strong className="text-slate-200">{stop.scheduledTimeEvening}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Corridor Map */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Corridor Live Telemetry Map
                  </h4>
                  <LiveMap selectedRouteId={activeRoute.id} height="360px" showControls={false} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
