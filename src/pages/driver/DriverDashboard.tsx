import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  IBus,
  IRoute,
  ITrip,
  IAttendance,
  INotification,
  IBusPass,
} from '../../types/index.ts';
import { LiveMap } from '../../components/common/LiveMap.tsx';
import {
  Bus,
  QrCode,
  Play,
  Square,
  Navigation,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Send,
  Users,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [buses, setBuses] = useState<IBus[]>([]);
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [notifications, setNotifications] = useState<INotification[]>([]);

  // Active Trip State
  const [activeTrip, setActiveTrip] = useState<ITrip | null>(null);
  const [isBroadcastingGps, setIsBroadcastingGps] = useState<boolean>(true);

  // Scanner States
  const [manualRollNo, setManualRollNo] = useState('');
  const [scannedResult, setScannedResult] = useState<{
    valid: boolean;
    pass?: IBusPass;
    message: string;
    error?: string;
  } | null>(null);
  const [recentScans, setRecentScans] = useState<IAttendance[]>([]);

  // Issue Reporting Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    issueDescription: '',
    priority: 'medium' as const,
    serviceType: 'Routine Inspection' as const,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadDriverData = async () => {
    try {
      const [bRes, tRes, rRes, nRes, aRes] = await Promise.all([
        api.getBuses(),
        api.getTrips(),
        api.getRoutes(),
        api.getNotifications(),
        api.getAttendance(),
      ]);

      setBuses(bRes.buses);
      setTrips(tRes.trips);
      setRoutes(rRes.routes);
      setNotifications(nRes.notifications);
      setRecentScans(aRes.attendance.slice(0, 8));

      // Find driver's trip (either in progress or scheduled)
      const current = tRes.trips.find(
        (t) => t.status === 'in_progress' || (t.driverId === user?.id && t.status === 'scheduled')
      ) || tRes.trips[0];
      setActiveTrip(current || null);
    } catch (err) {
      console.error('Failed to load driver data:', err);
    }
  };

  useEffect(() => {
    loadDriverData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const assignedBus = buses.find((b) => b.driverId === user?.id || b.id === 'bus_1') || buses[0];
  const assignedRoute = routes.find((r) => r.id === (activeTrip?.routeId || 'route_1')) || routes[0];

  // Start / End Trip
  const handleStartTrip = async () => {
    if (!activeTrip) return;
    try {
      const res = await api.startTrip(activeTrip.id);
      showToast(res.message);
      loadDriverData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEndTrip = async () => {
    if (!activeTrip) return;
    try {
      const res = await api.endTrip(activeTrip.id);
      showToast(res.message);
      loadDriverData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Scan & Validate Student Pass
  const handleVerifyStudentPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRollNo.trim()) return;

    try {
      const res = await api.verifyPass({ manualRollNo: manualRollNo.trim() });
      if (res.valid && res.pass) {
        // Automatically mark attendance
        const attRes = await api.scanAttendance({
          studentId: res.pass.studentId,
          passId: res.pass.id,
          tripId: activeTrip?.id || 'trip_1',
          stopName: res.pass.pickupStopName,
        });

        setScannedResult({
          valid: true,
          pass: res.pass,
          message: attRes.message,
        });
        showToast(attRes.message);
        setManualRollNo('');
        loadDriverData();
      }
    } catch (err: any) {
      setScannedResult({
        valid: false,
        message: err.message || 'Pass verification failed.',
        error: err.message,
      });
    }
  };

  // Submit Maintenance Issue
  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createMaintenance({
        busId: assignedBus?.id || 'bus_1',
        issueDescription: issueForm.issueDescription,
        priority: issueForm.priority,
        serviceType: issueForm.serviceType,
      });
      setReportModalOpen(false);
      setIssueForm({ issueDescription: '', priority: 'medium', serviceType: 'Routine Inspection' });
      showToast(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 dark:bg-slate-950 light:bg-slate-50 light:text-slate-900">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-cyan-300 shadow-2xl backdrop-blur-md">
          <CheckCircle className="h-4 w-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Driver Header Banner */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-extrabold text-2xl shadow-lg shadow-amber-500/25">
              <Bus className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">
                  Driver Console: {user?.name || 'Staff Driver'}
                </h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {user?.licenseNumber || 'CDL-NY-849302'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Assigned Vehicle: <strong className="text-white">Bus {assignedBus?.busNumber}</strong> ({assignedBus?.model}) · Corridor: <strong className="text-cyan-400">{assignedRoute?.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 text-xs font-bold transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Report Issue / Delay</span>
            </button>
          </div>
        </div>

        {/* Live Trip Action Control Center */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Trip & GPS Controls */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-cyan-400 font-mono font-bold uppercase tracking-wider">
                  Active Mission Status
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Trip {activeTrip?.tripCode || 'TRIP-NCR-01'}
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                  activeTrip?.status === 'in_progress'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeTrip?.status === 'in_progress' ? '● En Route (Live)' : 'Scheduled'}
              </span>
            </div>

            {/* Big Trip Controls */}
            <div className="flex items-center gap-3">
              {activeTrip?.status === 'in_progress' ? (
                <button
                  onClick={handleEndTrip}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-lg shadow-red-600/25 transition-all"
                >
                  <Square className="h-4 w-4" />
                  <span>Complete & End Trip</span>
                </button>
              ) : (
                <button
                  onClick={handleStartTrip}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Scheduled Trip</span>
                </button>
              )}
            </div>

            {/* GPS Broadcast Switch */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Live GPS Location Beacon</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Simulated telemetry broadcast to students and central dispatch.
                </p>
              </div>
              <button
                onClick={() => setIsBroadcastingGps(!isBroadcastingGps)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  isBroadcastingGps
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isBroadcastingGps ? 'TRANSMITTING' : 'PAUSED'}
              </button>
            </div>

            {/* Stop Sequence Checklist */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Route Stop Progression
              </h4>
              <div className="space-y-2">
                {assignedRoute?.stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{stop.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 font-mono">
                      <span>Pickup: <strong className="text-emerald-400">{stop.scheduledTimeMorning}</strong></span>
                      <span>{stop.registeredStudentsCount} Pass Holders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QR Pass Boarding Scanner & Validator */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Student Boarding Validator</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Instant Scan Verification</span>
            </div>

            {/* QR Scan or Type Student ID */}
            <form onSubmit={handleVerifyStudentPass} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Scan QR or Enter Student Roll Number / Pass Code:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-2024-042 or BP-2026-0042"
                    value={manualRollNo}
                    onChange={(e) => setManualRollNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-9 py-2.5 text-xs text-white uppercase font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors shrink-0"
                >
                  Verify & Mark Boarded
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Try demo roll number: <code className="text-cyan-300 font-mono font-bold">CS-2024-042</code> or <code className="text-cyan-300 font-mono font-bold">ME-2024-118</code>
              </p>
            </form>

            {/* Validation Feedback Result */}
            {scannedResult && (
              <div
                className={`p-4 rounded-xl border ${
                  scannedResult.valid
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-red-500/40 bg-red-950/30 text-red-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {scannedResult.valid ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-400 shrink-0" />
                  )}
                  <div className="flex-1 text-xs">
                    <h4 className="font-bold text-sm text-white">
                      {scannedResult.valid ? 'VALID BUS PASS — BOARDING APPROVED' : 'ACCESS DENIED'}
                    </h4>
                    <p className="mt-1">{scannedResult.message}</p>
                    {scannedResult.pass && (
                      <div className="mt-2 text-[11px] text-slate-300 font-mono space-y-0.5">
                        <div>Student: {scannedResult.pass.studentName} ({scannedResult.pass.studentRollNumber})</div>
                        <div>Designated Stop: {scannedResult.pass.pickupStopName}</div>
                        <div>Validity: Until {scannedResult.pass.validUntil}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Scans Log */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Recent Boardings on this Trip ({recentScans.length})
              </h4>
              <div className="space-y-2">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{scan.studentName}</span>
                      <span className="text-[11px] font-mono text-cyan-400">{scan.studentRollNumber}</span>
                    </div>
                    <div className="text-right text-[11px] font-mono text-slate-400">
                      <span className="text-slate-300 block">{scan.stopName}</span>
                      <span>{new Date(scan.scannedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Map Preview for Driver */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Live Corridor Radar Navigation
            </h3>
            <span className="text-xs text-cyan-400 font-mono">
              GPS Beacon Broadcasting Active
            </span>
          </div>
          <LiveMap selectedBusId={assignedBus?.id} height="420px" showControls={false} />
        </div>
      </div>

      {/* Modal: Report Breakdown / Delay */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Report Bus Delay or Mechanical Issue</h3>
            <p className="text-xs text-slate-400 mb-4">
              Instantly notifies campus dispatch and transport coordinators.
            </p>

            <form onSubmit={handleReportIssue} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Category</label>
                <select
                  value={issueForm.serviceType}
                  onChange={(e: any) => setIssueForm({ ...issueForm, serviceType: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  <option value="Emergency Breakdown">Emergency Breakdown</option>
                  <option value="AC Repair">AC / Climate Malfunction</option>
                  <option value="Battery & Motor">Traction Battery Warning</option>
                  <option value="Brake System">Brake Wear Indicator</option>
                  <option value="Routine Inspection">Traffic Delay Detour</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Urgency Level</label>
                <select
                  value={issueForm.priority}
                  onChange={(e: any) => setIssueForm({ ...issueForm, priority: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  <option value="low">Low (Notice)</option>
                  <option value="medium">Medium (Requires Inspection)</option>
                  <option value="high">High (Delay Imminent)</option>
                  <option value="urgent">Urgent (Immediate Backup Bus Needed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe location, road conditions, or vehicle symptoms..."
                  value={issueForm.issueDescription}
                  onChange={(e) => setIssueForm({ ...issueForm, issueDescription: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Transmit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
