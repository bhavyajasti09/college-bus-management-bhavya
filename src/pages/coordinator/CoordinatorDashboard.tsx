import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import {
  IBus,
  IRoute,
  IBusPass,
  ITrip,
  IAttendance,
  IMaintenance,
} from '../../types/index.ts';
import { LiveMap } from '../../components/common/LiveMap.tsx';
import {
  Shield,
  Bus,
  Clock,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Printer,
  TrendingUp,
  RotateCw,
} from 'lucide-react';

export const CoordinatorDashboard: React.FC = () => {
  const [buses, setBuses] = useState<IBus[]>([]);
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [passes, setPasses] = useState<IBusPass[]>([]);
  const [attendance, setAttendance] = useState<IAttendance[]>([]);
  const [maintenance, setMaintenance] = useState<IMaintenance[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [bRes, tRes, rRes, pRes, aRes, mRes] = await Promise.all([
        api.getBuses(),
        api.getTrips(),
        api.getRoutes(),
        api.getPasses(),
        api.getAttendance(),
        api.getMaintenance(),
      ]);

      setBuses(bRes.buses);
      setTrips(tRes.trips);
      setRoutes(rRes.routes);
      setPasses(pRes.passes);
      setAttendance(aRes.attendance);
      setMaintenance(mRes.maintenance);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprovePass = async (id: string) => {
    try {
      const res = await api.approvePass(id);
      showToast(res.message);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDispatchBackupBus = async (busId: string, routeId: string) => {
    try {
      await api.updateBusStatus(busId, { status: 'active', currentRouteId: routeId });
      showToast('Standby backup bus dispatched to corridor.');
      loadData();
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
        {/* Coordinator Header */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl shadow-lg shadow-blue-500/25">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                Transport Coordinator Desk
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Dispatch surveillance, student pass application decisions, and corridor incident routing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Export Operational Summary</span>
            </button>
          </div>
        </div>

        {/* 4 Operations KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Active Shuttles</span>
              <Bus className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {buses.filter((b) => b.status === 'active').length}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">On Schedule</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Standby Reserve Buses</span>
              <RotateCw className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-blue-400 font-mono tabular-nums">
              {buses.filter((b) => b.status === 'idle').length}
            </div>
            <span className="text-[11px] text-slate-400">Available to Deploy</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Pending Pass Requests</span>
              <QrCode className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
              {passes.filter((p) => p.status === 'pending').length}
            </div>
            <span className="text-[11px] text-amber-400/80">Requires Review</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Incident Reports</span>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <div className="text-2xl font-extrabold text-red-400 font-mono tabular-nums">
              {maintenance.filter((m) => m.status !== 'completed').length}
            </div>
            <span className="text-[11px] text-slate-400">Depot Maintenance</span>
          </div>
        </div>

        {/* Live Surveillance Radar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Campus Transit Fleet Radar
            </h3>
            <span className="text-xs text-cyan-400 font-mono">
              Live GIS coordinates stream
            </span>
          </div>
          <LiveMap height="460px" showControls={true} />
        </div>

        {/* Pending Transport Requests & Incident Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Bus Passes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Pending Pass Approvals</h3>
              <span className="text-xs text-slate-400">
                {passes.filter((p) => p.status === 'pending').length} requests awaiting
              </span>
            </div>

            <div className="space-y-3">
              {passes
                .filter((p) => p.status === 'pending')
                .map((pass) => (
                  <div
                    key={pass.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{pass.studentName}</span>
                        <span className="font-mono text-cyan-400">({pass.studentRollNumber})</span>
                      </div>
                      <p className="text-slate-400 mt-0.5">
                        {pass.routeName} · {pass.pickupStopName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprovePass(pass.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Approve Pass
                      </button>
                    </div>
                  </div>
                ))}
              {passes.filter((p) => p.status === 'pending').length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  All student pass applications have been processed.
                </div>
              )}
            </div>
          </div>

          {/* Standby Bus Deployment */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Standby Fleet Backup Dispatch</h3>
              <span className="text-xs text-slate-400">Reserve capacity ready</span>
            </div>

            <div className="space-y-3">
              {buses.map((bus) => (
                <div
                  key={bus.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-white block">
                      Bus {bus.busNumber} ({bus.model})
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Capacity: {bus.capacity} seats · Status: <strong className="text-cyan-400 uppercase">{bus.status}</strong>
                    </span>
                  </div>

                  {bus.status === 'idle' ? (
                    <button
                      onClick={() => handleDispatchBackupBus(bus.id, routes[0]?.id || 'route_1')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      Deploy as Backup
                    </button>
                  ) : (
                    <span className="text-slate-500 text-[11px] font-mono">In Service</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
