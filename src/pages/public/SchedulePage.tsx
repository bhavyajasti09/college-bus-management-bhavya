import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle, Bus, Search, Printer, ArrowRight } from 'lucide-react';

interface SchedulePageProps {
  onNavigate: (view: string) => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'morning' | 'evening' | 'weekend'>('morning');
  const [selectedRoute, setSelectedRoute] = useState<string>('all');

  const scheduleData = [
    {
      routeCode: 'NCR-101',
      routeName: 'North Campus Express',
      busNumber: 'CR-01',
      origin: 'North Ridge Residential',
      terminal: 'Central Engineering Quad',
      morningDepart: '07:15 AM',
      morningArrive: '07:55 AM',
      eveningDepart: '05:00 PM',
      eveningArrive: '05:45 PM',
      weekendDepart: '10:00 AM',
      weekendArrive: '10:40 AM',
      frequency: 'Every 20 mins',
      status: 'On Time',
    },
    {
      routeCode: 'SMS-202',
      routeName: 'South Metro Shuttle',
      busNumber: 'CR-02',
      origin: 'South City Transit Hub',
      terminal: 'Central Engineering Quad',
      morningDepart: '07:05 AM',
      morningArrive: '07:50 AM',
      eveningDepart: '05:00 PM',
      eveningArrive: '05:50 PM',
      weekendDepart: '10:30 AM',
      weekendArrive: '11:15 AM',
      frequency: 'Every 25 mins',
      status: 'On Time',
    },
    {
      routeCode: 'WTV-303',
      routeName: 'West Tech Valley Loop',
      busNumber: 'CR-03',
      origin: 'Valley View Tech Residency',
      terminal: 'Central Engineering Quad',
      morningDepart: '07:20 AM',
      morningArrive: '07:55 AM',
      eveningDepart: '05:15 PM',
      eveningArrive: '05:55 PM',
      weekendDepart: '11:00 AM',
      weekendArrive: '11:35 AM',
      frequency: 'Every 30 mins',
      status: 'On Time',
    },
    {
      routeCode: 'ELV-404',
      routeName: 'East Lake Village Shuttle',
      busNumber: 'CR-05',
      origin: 'East Village Dormitories',
      terminal: 'Central Engineering Quad',
      morningDepart: '07:30 AM',
      morningArrive: '08:00 AM',
      eveningDepart: '05:30 PM',
      eveningArrive: '06:05 PM',
      weekendDepart: '11:30 AM',
      weekendArrive: '12:00 PM',
      frequency: 'Every 15 mins',
      status: 'On Time',
    },
  ];

  const filtered = selectedRoute === 'all'
    ? scheduleData
    : scheduleData.filter((s) => s.routeCode === selectedRoute);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 dark:bg-slate-950 light:bg-slate-50 light:text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>Official Academic Timetable</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight dark:text-white light:text-slate-900">
              Campus Transit Master Schedule
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Morning pickup runs, evening departures, and weekend study shuttles. Timetable operates Monday through Saturday during active academic semesters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print Schedule</span>
            </button>
            <button
              onClick={() => onNavigate('live-track')}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors"
            >
              Track In Real-Time
            </button>
          </div>
        </div>

        {/* Schedule Filter & Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          {/* Segmented Controls (Strictly complies with interactive button controls in constitution) */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('morning')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'morning'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌅 Morning Pickup (Inbound)
            </button>
            <button
              onClick={() => setActiveTab('evening')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'evening'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌆 Evening Drop (Outbound)
            </button>
            <button
              onClick={() => setActiveTab('weekend')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'weekend'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📚 Weekend Library Shuttle
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Filter Corridor:</span>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Corridors</option>
              <option value="NCR-101">NCR-101 (North Express)</option>
              <option value="SMS-202">SMS-202 (South Shuttle)</option>
              <option value="WTV-303">WTV-303 (West Tech)</option>
              <option value="ELV-404">ELV-404 (East Village)</option>
            </select>
          </div>
        </div>

        {/* Timetable Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Route & Bus</th>
                  <th className="py-3.5 px-4">Corridor Name</th>
                  <th className="py-3.5 px-4">Departure Point</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4 text-center">Departure</th>
                  <th className="py-3.5 px-4 text-center">Arrival</th>
                  <th className="py-3.5 px-4 text-center">Frequency</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                {filtered.map((item, idx) => {
                  const departTime =
                    activeTab === 'morning'
                      ? item.morningDepart
                      : activeTab === 'evening'
                      ? item.eveningDepart
                      : item.weekendDepart;
                  const arriveTime =
                    activeTab === 'morning'
                      ? item.morningArrive
                      : activeTab === 'evening'
                      ? item.eveningArrive
                      : item.weekendArrive;

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-850/60 transition-colors font-sans"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-cyan-400">
                        {item.routeCode}
                        <span className="block text-[11px] font-normal text-slate-400 font-mono">
                          Bus: {item.busNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-200">
                        {item.routeName}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {item.origin}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {item.terminal}
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-emerald-400">
                        {departTime}
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-blue-400">
                        {arriveTime}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-400 font-sans">
                        {item.frequency}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          <span>{item.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timetable Notes Notice */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400 leading-relaxed flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>Punctuality Notice:</strong> Students are advised to arrive at designated pickup stops 5 minutes prior to scheduled departure. In cases of inclement weather or road traffic deviations, push alerts are published to the student portal.
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="text-cyan-400 hover:underline font-semibold whitespace-nowrap shrink-0"
          >
            Report Route Delay
          </button>
        </div>
      </div>
    </div>
  );
};
