import React from 'react';
import { Bus, Shield, Phone, Mail, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-sm dark:border-slate-800 dark:bg-slate-950 light:border-slate-200 light:bg-slate-100 light:text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white">
                <Bus className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg text-white dark:text-white light:text-slate-900">
                Campus<span className="text-cyan-400 light:text-blue-600">Ride</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 light:text-slate-600">
              Advanced campus transportation management platform providing real-time bus tracking, digital QR passes, safety telemetry, and zero-emission fleet logistics.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="h-3.5 w-3.5" />
              <span>Campus Security & ISO 27001 Certified System</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 light:text-slate-900 mb-3">
              Transit Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('live-track')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Live Campus Bus Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('routes')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Bus Routes & Designated Stops
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('schedule')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Semester Transit Schedules
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('register')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Apply For Student Bus Pass
                </button>
              </li>
            </ul>
          </div>

          {/* Operational Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 light:text-slate-900 mb-3">
              Portals & Roles
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Student Portal Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Driver Navigation & Scanner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Transport Coordinator Desk
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Campus Transit Administrator
                </button>
              </li>
            </ul>
          </div>

          {/* 24/7 Helpline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 light:text-slate-900 mb-3">
              Transit Helpline
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-mono text-slate-300 light:text-slate-800 font-semibold">
                  +1 (800) 555-RIDE (24/7)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-cyan-400" />
                <span>transit@campusride.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                <span>Central Bus Terminal, University Gate 1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 light:border-slate-300">
          <div>
            &copy; {new Date().getFullYear()} CampusRide System. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Charter</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">Safety Guidelines</span>
            <span>·</span>
            <span className="hover:text-slate-300 cursor-pointer">Fleet Zero Emissions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
