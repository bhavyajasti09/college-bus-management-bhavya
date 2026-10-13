import React from 'react';
import { Shield, Zap, Award, CheckCircle2, Leaf, Clock } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-950 light:bg-slate-50 light:text-slate-900">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
            <Award className="h-3.5 w-3.5" />
            <span>Campus Transit Excellence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
            About CampusRide Transportation
          </h1>
          <p className="mt-4 text-base text-slate-300 light:text-slate-600 leading-relaxed">
            CampusRide is the university's flagship intelligent transit network, established to guarantee safe, zero-emission, and punctual daily commuting for our entire academic community.
          </p>
        </div>

        {/* Hero image showcase */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-72 md:h-96 shadow-2xl">
          <img
            src="/src/assets/images/campus_map_aerial_1791871320710.jpg"
            alt="University Transit Hub Aerial"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Central Campus Transit Operations</h3>
              <p className="text-xs text-slate-300">Coordinating 48+ electric buses across 6 municipal corridors.</p>
            </div>
            <button
              onClick={() => onNavigate('routes')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
            >
              Explore Corridors
            </button>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Safety First Architecture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every vehicle is equipped with dual-lens CCTV, real-time speed monitoring, GPS breadcrumb telemetry, and direct panic communications to campus security dispatch.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>Certified CDL Drivers</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-4">
                <Leaf className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Zero-Emission Sustainability</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                CampusRide is committed to carbon-neutral transit. Our fleet has replaced over 3,200 personal student vehicles daily, saving 420 metric tons of CO₂ each semester.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>Solar Depot Charging</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mb-4">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Automated Precision</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Algorithmic scheduling recalculates traffic delays in real time. QR digital passes eliminate long boarding queues at terminal stops with sub-second verification.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>98.4% On-Time Record</span>
            </div>
          </div>
        </div>

        {/* Administration Info */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white">Need Special Transit Accommodations?</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              We provide accessible ramp-equipped shuttles for students with mobility needs, along with late-night study shuttle services between university libraries and residential colleges.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors shrink-0"
          >
            Contact Operations Desk
          </button>
        </div>
      </div>
    </div>
  );
};
