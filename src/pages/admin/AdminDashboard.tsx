import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import {
  IBus,
  IRoute,
  IBusPass,
  ITrip,
  IAttendance,
  IPayment,
  IMaintenance,
  INotification,
  IUser,
} from '../../types/index.ts';
import { LiveMap } from '../../components/common/LiveMap.tsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Bus,
  Users,
  Route,
  CreditCard,
  Wrench,
  Bell,
  Shield,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Clock,
  Send,
  Download,
  AlertTriangle,
  Play,
  Square,
  QrCode,
  TrendingUp,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'buses'
  | 'drivers'
  | 'students'
  | 'routes'
  | 'passes'
  | 'trips'
  | 'attendance'
  | 'payments'
  | 'maintenance'
  | 'analytics'
  | 'notifications';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Data States
  const [buses, setBuses] = useState<IBus[]>([]);
  const [drivers, setDrivers] = useState<(IUser & { assignedBus?: string })[]>([]);
  const [students, setStudents] = useState<(IUser & { busPassStatus: string; busPassId?: string })[]>([]);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [passes, setPasses] = useState<IBusPass[]>([]);
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [attendance, setAttendance] = useState<IAttendance[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [maintenance, setMaintenance] = useState<IMaintenance[]>([]);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Modal / Form States
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [newBus, setNewBus] = useState({
    busNumber: '',
    registrationNumber: '',
    capacity: 48,
    model: 'Volvo 9400 Electric Transit',
    fuelType: 'electric' as const,
    year: 2025,
  });

  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    assignedBusId: '',
  });

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    targetRole: 'all' as const,
  });

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const refreshAllData = async () => {
    try {
      const [
        busesRes,
        driversRes,
        studentsRes,
        routesRes,
        passesRes,
        tripsRes,
        attRes,
        payRes,
        maintRes,
        notifRes,
        analyticsRes,
      ] = await Promise.all([
        api.getBuses(),
        api.getDrivers(),
        api.getStudents(),
        api.getRoutes(),
        api.getPasses(),
        api.getTrips(),
        api.getAttendance(),
        api.getPayments(),
        api.getMaintenance(),
        api.getNotifications(),
        api.getAnalytics(),
      ]);

      setBuses(busesRes.buses);
      setDrivers(driversRes.drivers);
      setStudents(studentsRes.students);
      setRoutes(routesRes.routes);
      setPasses(passesRes.passes);
      setTrips(tripsRes.trips);
      setAttendance(attRes.attendance);
      setPayments(payRes.payments);
      setMaintenance(maintRes.maintenance);
      setNotifications(notifRes.notifications);
      setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Failed to load admin dataset:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Bus Actions
  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createBus(newBus);
      setShowAddBusModal(false);
      setNewBus({ busNumber: '', registrationNumber: '', capacity: 48, model: 'Volvo 9400 Electric Transit', fuelType: 'electric', year: 2025 });
      showToast(res.message);
      refreshAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteBus = async (id: string) => {
    if (!window.confirm('Are you sure you want to retire and remove this bus from the active campus fleet?')) return;
    try {
      const res = await api.deleteBus(id);
      showToast(res.message);
      refreshAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleBusStatus = async (bus: IBus, nextStatus: string) => {
    try {
      await api.updateBusStatus(bus.id, { status: nextStatus });
      showToast(`Bus ${bus.busNumber} marked as ${nextStatus.toUpperCase()}`);
      refreshAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Driver Actions
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createDriver(newDriver);
      setShowAddDriverModal(false);
      setNewDriver({ name: '', email: '', phone: '', licenseNumber: '', assignedBusId: '' });
      showToast(res.message);
      refreshAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Pass Actions
  const handleApprovePass = async (id: string) => {
    try {
      const res = await api.approvePass(id);
      showToast(res.message);
      refreshAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectPass = async (id: string) => {
    const reason = window.prompt('Specify rejection reason for student notification:', 'Incomplete residence verification');
    if (!reason) return;
    try {
      const res = await api.rejectPass(id, reason);
      showToast(res.message);
      refreshAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Trip Actions
  const handleStartTrip = async (id: string) => {
    try {
      const res = await api.startTrip(id);
      showToast(res.message);
      refreshAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEndTrip = async (id: string) => {
    try {
      const res = await api.endTrip(id);
      showToast(res.message);
      refreshAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Broadcast Action
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createNotification(newBroadcast);
      setShowBroadcastModal(false);
      setNewBroadcast({ title: '', message: '', type: 'info', targetRole: 'all' });
      showToast(res.message);
      refreshAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row dark:bg-slate-950 light:bg-slate-50 light:text-slate-900">
      {/* Toast */}
      {actionMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-slate-900/95 px-4 py-3 text-xs font-semibold text-cyan-300 shadow-2xl backdrop-blur-md">
          <CheckCircle className="h-4 w-4 text-cyan-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-slate-800 bg-slate-950/90 p-4 shrink-0 flex flex-col justify-between dark:border-slate-800 light:border-slate-200 light:bg-white">
        <div>
          <div className="flex items-center gap-2 px-3 py-3 mb-4 rounded-xl bg-slate-900 border border-slate-800">
            <Shield className="h-5 w-5 text-cyan-400" />
            <div>
              <div className="text-xs font-bold text-white">Transit Control Command</div>
              <div className="text-[10px] text-slate-400">Master Admin Level</div>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'overview'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Fleet Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('buses')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'buses'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bus className="h-4 w-4" />
                <span>Buses Fleet</span>
              </div>
              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {buses.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'routes'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Route className="h-4 w-4" />
                <span>Routes & Corridors</span>
              </div>
              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {routes.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('passes')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'passes'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <QrCode className="h-4 w-4" />
                <span>Bus Passes</span>
              </div>
              {passes.filter((p) => p.status === 'pending').length > 0 && (
                <span className="font-mono text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">
                  {passes.filter((p) => p.status === 'pending').length} pending
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'trips'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4" />
                <span>Trips & Dispatch</span>
              </div>
              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {trips.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'drivers'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4" />
                <span>Staff Drivers</span>
              </div>
              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {drivers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'students'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4" />
                <span>Student Directory</span>
              </div>
              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {students.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'attendance'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span>Attendance Logs</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'payments'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Fees & Receipts</span>
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'maintenance'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="h-4 w-4" />
                <span>Maintenance</span>
              </div>
              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                {maintenance.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Analytics & Charts</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Broadcast Alerts</span>
            </button>
          </nav>
        </div>

        {/* Quick Database Status */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Database Engine:</span>
            <span className="font-mono text-cyan-400 font-bold">MongoDB/Mongoose</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Telemetry Status:</span>
            <span className="font-mono text-emerald-400 font-bold">Live Synced</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* TAB 1: FLEET OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Fleet Command Overview</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time status of university buses, student ridership, and live telemetry feeds.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBroadcastModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <Send className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Broadcast Alert</span>
                </button>
                <button
                  onClick={() => setShowAddBusModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Bus</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Total Campus Buses</span>
                  <Bus className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
                  {buses.length}
                </div>
                <div className="mt-1 text-[11px] text-emerald-400 font-medium">
                  {buses.filter((b) => b.status === 'active').length} Active on Transit Routes
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Active Trips</span>
                  <Clock className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-extrabold text-blue-400 font-mono tabular-nums">
                  {trips.filter((t) => t.status === 'in_progress').length}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {trips.length} Total Scheduled Today
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Pending Pass Requests</span>
                  <QrCode className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
                  {passes.filter((p) => p.status === 'pending').length}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {passes.filter((p) => p.status === 'approved').length} Approved Digital Passes
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Fee Revenue Collected</span>
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
                  ${analytics?.metrics?.totalRevenue || 800}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {payments.length} Semester Invoices
                </div>
              </div>
            </div>

            {/* Live Interactive Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Live Campus Bus Radar
                </h3>
                <span className="text-xs text-cyan-400 font-mono">
                  Telemetry synched with simulated onboard GPS
                </span>
              </div>
              <LiveMap height="460px" showControls={true} />
            </div>

            {/* Attendance & Fleet Utilization Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                <h3 className="text-sm font-bold text-white mb-4">
                  Weekly Student Boarding Velocity
                </h3>
                <div className="h-60 w-full">
                  {analytics?.weeklyAttendance && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.weeklyAttendance}>
                        <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                        />
                        <Bar dataKey="boardings" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                <h3 className="text-sm font-bold text-white mb-4">
                  Fleet Status Distribution
                </h3>
                <div className="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: buses.filter((b) => b.status === 'active').length || 2 },
                          { name: 'Idle', value: buses.filter((b) => b.status === 'idle').length || 1 },
                          { name: 'Maintenance', value: buses.filter((b) => b.status === 'maintenance').length || 1 },
                        ]}
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Active</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Idle</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Maintenance</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUSES MANAGEMENT */}
        {activeTab === 'buses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Campus Bus Fleet Registry</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage electric vehicles, seat capacity, maintenance status, and assigned route telemetry.
                </p>
              </div>
              <button
                onClick={() => setShowAddBusModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Register New Bus</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Bus ID</th>
                    <th className="py-3 px-4">Plate / Registration</th>
                    <th className="py-3 px-4">Model & Year</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Fuel / Power</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {buses.map((bus) => (
                    <tr key={bus.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {bus.busNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {bus.registrationNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        {bus.model} ({bus.year})
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-300">
                        {bus.occupiedSeats} / {bus.capacity} seats
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        <span className="capitalize">{bus.fuelType}</span> ({bus.batteryOrFuelLevel}%)
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            bus.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : bus.status === 'maintenance'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {bus.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              handleToggleBusStatus(bus, bus.status === 'active' ? 'idle' : 'active')
                            }
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                          >
                            Toggle Status
                          </button>
                          <button
                            onClick={() => handleDeleteBus(bus.id)}
                            className="p-1 rounded hover:bg-red-950/40 text-red-400 transition-colors"
                            title="Delete bus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BUS PASSES APPROVAL */}
        {activeTab === 'passes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Student Bus Pass Applications</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review student transport requests, verify residency, and issue encrypted digital QR passes.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Pass #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Corridor & Pickup</th>
                    <th className="py-3 px-4">Validity</th>
                    <th className="py-3 px-4">Fee Status</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {passes.map((pass) => (
                    <tr key={pass.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {pass.passNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        {pass.studentName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {pass.studentDepartment}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {pass.studentRollNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <strong className="text-white block">{pass.routeName}</strong>
                        <span className="text-[11px] text-slate-400">{pass.pickupStopName}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        Until {pass.validUntil}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            pass.feePaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {pass.feePaid ? 'Paid ($' + pass.feeAmount + ')' : 'Pending ($' + pass.feeAmount + ')'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            pass.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : pass.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {pass.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {pass.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprovePass(pass.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectPass(pass.id)}
                              className="px-2.5 py-1 rounded bg-red-900/50 hover:bg-red-800 text-red-200 text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TRIPS & LIVE DISPATCH */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Daily Trips & Dispatch Operations</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitor live shuttle departures, trip progress, and GPS simulation telemetry.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-800 px-2 py-0.5 rounded">
                        {trip.tripCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          trip.status === 'in_progress'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : trip.status === 'completed'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white mb-1">{trip.routeName}</h3>
                    <p className="text-xs text-slate-400 mb-3">Bus: <strong className="text-slate-200">{trip.busNumber}</strong> · Driver: {trip.driverName}</p>

                    <div className="text-xs text-slate-400 space-y-1 font-mono">
                      <div>Scheduled: {trip.scheduledStartTime} — {trip.scheduledEndTime}</div>
                      {trip.actualStartTime && <div>Actual Departure: <strong className="text-emerald-400">{trip.actualStartTime}</strong></div>}
                      <div>Passengers Boarded: <strong className="text-cyan-400">{trip.passengersBoarded} students</strong></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                    {trip.status === 'scheduled' && (
                      <button
                        onClick={() => handleStartTrip(trip.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Start Trip Now</span>
                      </button>
                    )}
                    {trip.status === 'in_progress' && (
                      <button
                        onClick={() => handleEndTrip(trip.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                      >
                        <Square className="h-3.5 w-3.5" />
                        <span>Mark Trip Completed</span>
                      </button>
                    )}
                    {trip.status === 'completed' && (
                      <span className="text-xs text-slate-500 italic text-center w-full">Trip Finished</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ATTENDANCE & BOARDING LOGS */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Student Boarding & Attendance Ledger</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified scans from driver smartphone terminals and validator devices.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Bus & Stop</th>
                    <th className="py-3 px-4">Scanned Timestamp</th>
                    <th className="py-3 px-4">Verified By</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {att.studentName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-400">
                        {att.studentRollNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="font-mono font-bold text-white mr-2">{att.busNumber}</span>
                        <span>{att.stopName}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-400">
                        {new Date(att.scannedAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {att.verifiedBy}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full text-[10px]">
                          <CheckCircle className="h-3 w-3" />
                          <span>Boarded</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: MAINTENANCE & WORK ORDERS */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Fleet Maintenance & Service Records</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track battery health checks, brake repairs, and preventive depot servicing.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {maintenance.map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded">
                        {m.ticketId}
                      </span>
                      <span className="font-bold text-sm text-white">Bus {m.busNumber}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {m.serviceType}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          m.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{m.issueDescription}</p>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Reported by: {m.reportedBy} · Cost: <strong className="text-emerald-400">${m.cost}</strong>
                      {m.mechanicNotes && <span className="block mt-1 text-slate-300">Notes: {m.mechanicNotes}</span>}
                    </div>
                  </div>

                  {m.status !== 'completed' && (
                    <button
                      onClick={async () => {
                        await api.updateMaintenance(m.id, { status: 'completed' });
                        showToast(`Maintenance ticket ${m.ticketId} marked completed.`);
                        refreshAllData();
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: NOTIFICATIONS & BROADCASTS */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Broadcast Alerts & Dispatch Notices</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Push urgent delay warnings, route detours, or semester renewal reminders to students and drivers.
                </p>
              </div>
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Broadcast Alert</span>
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3"
                >
                  <Bell className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">{n.title}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                    <div className="mt-2 text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                      Audience: {n.targetRole}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: DRIVERS */}
        {activeTab === 'drivers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Staff Drivers Directory</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assign licensed drivers to dedicated campus bus routes.
                </p>
              </div>
              <button
                onClick={() => setShowAddDriverModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Driver Account</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drivers.map((d) => (
                <div key={d.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white">{d.name}</h3>
                    <p className="text-xs text-slate-400">{d.email} · {d.phone}</p>
                    <div className="mt-2 text-xs font-mono text-cyan-400">
                      License: {d.licenseNumber || 'CDL-PROVISIONAL'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 rounded">
                      Bus {d.assignedBus || 'Assigned'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: STUDENTS */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Registered Students Database</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  View academic department, roll number, and designated pickup stop.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-right">Bus Pass Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{s.name}</td>
                      <td className="py-3.5 px-4 font-mono text-cyan-400">{s.rollNumber || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-300">{s.department || 'Undergraduate'}</td>
                      <td className="py-3.5 px-4 text-slate-400">{s.email}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                          {s.busPassStatus || 'Enrolled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 10: ROUTES */}
        {activeTab === 'routes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Transit Corridors & Stops</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Route paths, waypoints, stops, and passenger counts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routes.map((r) => (
                <div key={r.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{r.routeCode}</span>
                    <span className="text-xs text-slate-400 font-mono">{r.totalDistanceKm} km</span>
                  </div>
                  <h3 className="font-bold text-base text-white">{r.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{r.origin} → {r.destination}</p>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span>{r.stops.length} Designated Stops</span>
                    <span className="text-emerald-400">{r.activeTripsCount} Active Trips</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 11: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Transport Fee Ledger</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Student payment transactions, semester receipts, and collection auditing.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{p.receiptNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{p.studentName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">${p.amount} {p.currency}</td>
                      <td className="py-3.5 px-4 text-slate-300">{p.paymentMethod}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 12: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Transit Intelligence & Utilization</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Route density, boarding compliance, and on-time performance charts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                <h3 className="text-sm font-bold text-white mb-4">Corridor Passenger Ridership</h3>
                <div className="h-64 w-full">
                  {analytics?.routeDistribution && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.routeDistribution}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155' }} />
                        <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                <h3 className="text-sm font-bold text-white mb-4">On-Time Performance (%)</h3>
                <div className="h-64 w-full">
                  {analytics?.weeklyAttendance && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.weeklyAttendance}>
                        <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                        <YAxis domain={[90, 100]} stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155' }} />
                        <Bar dataKey="onTimeRate" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Add New Bus */}
      {showAddBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Register New Campus Bus</h3>
            <form onSubmit={handleAddBus} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bus Fleet Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CR-09"
                  value={newBus.busNumber}
                  onChange={(e) => setNewBus({ ...newBus, busNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">License Plate Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-EA-9912"
                  value={newBus.registrationNumber}
                  onChange={(e) => setNewBus({ ...newBus, registrationNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    required
                    value={newBus.capacity}
                    onChange={(e) => setNewBus({ ...newBus, capacity: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Power Train</label>
                  <select
                    value={newBus.fuelType}
                    onChange={(e: any) => setNewBus({ ...newBus, fuelType: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  >
                    <option value="electric">Electric (EV)</option>
                    <option value="cng">CNG</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBusModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Save & Register Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Driver */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create Driver Account</h3>
            <form onSubmit={handleAddDriver} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Green"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  placeholder="driver@campusride.edu"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Commercial Driver License (CDL) *</label>
                <input
                  type="text"
                  required
                  placeholder="CDL-NY-492019"
                  value={newDriver.licenseNumber}
                  onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-mono uppercase"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddDriverModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Create Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Broadcast Alert */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Send Fleet Broadcast Alert</h3>
            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Route Deviation on North Express"
                  value={newBroadcast.title}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the detour, delay, or notice..."
                  value={newBroadcast.message}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
                  <select
                    value={newBroadcast.targetRole}
                    onChange={(e: any) => setNewBroadcast({ ...newBroadcast, targetRole: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  >
                    <option value="all">All Users</option>
                    <option value="student">Students Only</option>
                    <option value="driver">Drivers Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newBroadcast.type}
                    onChange={(e: any) => setNewBroadcast({ ...newBroadcast, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="alert">Critical Alert</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Dispatch Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
