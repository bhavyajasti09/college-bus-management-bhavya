import React from 'react';
import { LiveMap } from '../../components/common/LiveMap.tsx';
import { Navigation, Clock, ShieldCheck, Bus } from 'lucide-react';

export const LiveTrackPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 dark:bg-slate-950 light:bg-slate-50 light:text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <Navigation className="h-3.5 w-3.5" />
              <span>Real-Time Fleet Telemetry</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
              Live Campus Bus Tracking Radar
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Track university shuttles in real-time along North Express, South Metro, and Tech Valley corridors.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Encrypted Transit GIS Feed</span>
            </span>
          </div>
        </div>

        {/* Big Fullscreen Live Map */}
        <LiveMap height="640px" showControls={true} />
      </div>
    </div>
  );
};
