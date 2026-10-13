import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  IBus,
  IRoute,
  IBusPass,
  IAttendance,
  IPayment,
  INotification,
} from '../../types/index.ts';
import { LiveMap } from '../../components/common/LiveMap.tsx';
import {
  QrCode,
  Bus,
  Clock,
  Calendar,
  CreditCard,
  Bell,
  CheckCircle,
  AlertCircle,
  Phone,
  User,
  Shield,
  Download,
  Printer,
  Navigation,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'pass' | 'track' | 'attendance' | 'payments' | 'profile'>('pass');

  const [passes, setPasses] = useState<IBusPass[]>([]);
  const [attendance, setAttendance] = useState<IAttendance[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [buses, setBuses] = useState<IBus[]>([]);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPassToPay, setSelectedPassToPay] = useState<IBusPass | null>(null);

  const [applyForm, setApplyForm] = useState({
    routeId: 'route_1',
    pickupStopId: 'stop_1_2',
    semester: 'Semester 4',
  });

  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'UPI' | 'Net Banking'>('Credit Card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [editProfile, setEditProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });

  const loadStudentData = async () => {
    try {
      const [pRes, aRes, payRes, nRes, rRes, bRes] = await Promise.all([
        api.getPasses(),
        api.getAttendance(),
        api.getPayments(),
        api.getNotifications(),
        api.getRoutes(),
        api.getBuses(),
      ]);

      setPasses(pRes.passes);
      setAttendance(aRes.attendance);
      setPayments(payRes.payments);
      setNotifications(nRes.notifications);
      setRoutes(rRes.routes);
      setBuses(bRes.buses);

      // Generate QR Code image for the approved pass if available
      const approvedPass = pRes.passes.find((p) => p.status === 'approved') || pRes.passes[0];
      if (approvedPass && approvedPass.qrCodeData && approvedPass.status === 'approved') {
        const url = await QRCode.toDataURL(approvedPass.qrCodeData, {
          width: 260,
          margin: 1.5,
          color: { dark: '#0284c7', light: '#ffffff' },
        });
        setQrDataUrl(url);
      }
    } catch (err) {
      console.error('Failed to load student data:', err);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentPass = passes.find((p) => p.status === 'approved') || passes[0];
  const assignedBus = buses.find((b) => b.id === (user?.assignedBusId || 'bus_1')) || buses[0];
  const assignedRoute = routes.find((r) => r.id === (user?.assignedRouteId || 'route_1')) || routes[0];
  const assignedStop = assignedRoute?.stops.find((s) => s.id === user?.pickupStopId) || assignedRoute?.stops[1];

  const handleApplyPass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.applyPass({
        routeId: applyForm.routeId,
        pickupStopId: applyForm.pickupStopId,
        semester: applyForm.semester,
      });
      setApplyModalOpen(false);
      showToast(res.message);
      loadStudentData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePayFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPassToPay) return;
    setIsProcessingPayment(true);
    try {
      const res = await api.payFee({
        busPassId: selectedPassToPay.id,
        amount: selectedPassToPay.feeAmount,
        paymentMethod,
      });
      setIsProcessingPayment(false);
      setPayModalOpen(false);
      showToast(res.message);
      loadStudentData();
    } catch (err: any) {
      setIsProcessingPayment(false);
      alert(err.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile(editProfile);
      showToast(res.message);
      refreshUser();
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
        {/* Welcome Profile Header */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-extrabold text-2xl shadow-lg shadow-cyan-500/25">
              {user?.name.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">
                  Welcome, {user?.name || 'Student'}!
                </h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  {user?.rollNumber || 'CS-2024-042'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {user?.department || 'Computer Science & AI'} · Designated Stop: <strong className="text-slate-200">{assignedStop?.name || 'Greenwood Heights'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setApplyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
            >
              Apply / Renew Pass
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Navigation className="h-3.5 w-3.5 text-cyan-400" />
              <span>Track Bus {assignedBus?.busNumber}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pass')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'pass'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Digital QR Pass
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'track'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Bus Tracking Radar
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Attendance Logs ({attendance.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transport Fees & Receipts
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Student Profile
          </button>
        </div>

        {/* TAB 1: DIGITAL QR BUS PASS */}
        {activeTab === 'pass' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* The Digital QR Pass Card */}
            <div className="lg:col-span-5 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/40 p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Pass Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 font-bold">
                    <Bus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Campus Transit Pass</h3>
                    <span className="text-[10px] text-cyan-400 font-mono">Academic Term 2026</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    currentPass?.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {currentPass?.status || 'Pending'}
                </span>
              </div>

              {/* QR Code Container */}
              <div className="my-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Digital Boarding Pass QR"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <QrCode className="h-16 w-16 text-slate-400 mb-2" />
                    <span className="text-xs">QR Code generated upon coordinator approval</span>
                  </div>
                )}
                <span className="mt-2 text-[10px] text-slate-500 font-mono">
                  Scan with Driver Terminal at Boarding
                </span>
              </div>

              {/* Pass Details */}
              <div className="space-y-2.5 text-xs pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-bold text-white">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Roll Number:</span>
                  <span className="font-mono text-cyan-400">{user?.rollNumber || 'CS-2024-042'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Bus:</span>
                  <span className="font-mono font-bold text-white">Bus {assignedBus?.busNumber} ({assignedBus?.model})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Designated Stop:</span>
                  <span className="text-slate-200">{assignedStop?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Validity Period:</span>
                  <span className="font-mono text-slate-300">Until {currentPass?.validUntil || '2026-06-30'}</span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Pass</span>
                </button>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <Shield className="h-3.5 w-3.5" />
                  <span>ISO 27001 Cryptographic Seal</span>
                </div>
              </div>
            </div>

            {/* Quick Transit Status Info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Daily Bus Schedule Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span>Today's Transit Schedule & Pickup Times</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      🌅 Morning Pickup
                    </span>
                    <div className="text-xl font-mono font-extrabold text-emerald-400">
                      {assignedStop?.scheduledTimeMorning || '07:28 AM'}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Bus {assignedBus?.busNumber} arrives at {assignedStop?.name}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      🌆 Evening Return
                    </span>
                    <div className="text-xl font-mono font-extrabold text-amber-400">
                      {assignedStop?.scheduledTimeEvening || '05:32 PM'}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Departing Central Terminal to your designated stop
                    </p>
                  </div>
                </div>

                {/* Driver Contact Box */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Assigned Driver: </span>
                    <strong className="text-slate-200">Marcus Vance (CDL-NY)</strong>
                  </div>
                  <a
                    href="tel:5552348901"
                    className="flex items-center gap-1 text-cyan-400 hover:underline font-semibold"
                  >
                    <Phone className="h-3 w-3" />
                    <span>Call Driver / Dispatch</span>
                  </a>
                </div>
              </div>

              {/* Pass Application History */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">Your Bus Pass Applications</h3>
                  <button
                    onClick={() => setApplyModalOpen(true)}
                    className="text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    + New Term Application
                  </button>
                </div>

                <div className="space-y-3">
                  {passes.map((pass) => (
                    <div
                      key={pass.id}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-cyan-400">
                            {pass.passNumber}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold">{pass.semester}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {pass.routeName} · {pass.pickupStopName}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {!pass.feePaid && (
                          <button
                            onClick={() => {
                              setSelectedPassToPay(pass);
                              setPayModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Pay Fee (${pass.feeAmount})
                          </button>
                        )}
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE MAP RADAR */}
        {activeTab === 'track' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Live Radar: Bus {assignedBus?.busNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Tracking your assigned shuttle along Corridor {assignedRoute?.routeCode}.
                </p>
              </div>
            </div>
            <LiveMap selectedBusId={assignedBus?.id} height="520px" showControls={true} />
          </div>
        )}

        {/* TAB 3: ATTENDANCE HISTORY */}
        {activeTab === 'attendance' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Personal Boarding Ledger</h3>
                <p className="text-xs text-slate-400">Verified QR scans recorded when boarding campus buses.</p>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                Total Boardings: {attendance.length}
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Bus</th>
                  <th className="py-3 px-4">Boarding Stop</th>
                  <th className="py-3 px-4">Verified By</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {attendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-300">
                      {new Date(att.scannedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {att.busNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      {att.stopName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {att.verifiedBy}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px]">
                        <CheckCircle className="h-3 w-3" />
                        <span>Boarded</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: PAYMENTS & RECEIPTS */}
        {activeTab === 'payments' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Transport Fee Receipts</h3>
                <p className="text-xs text-slate-400">Semester bus pass payment transactions and digital invoices.</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {p.semester}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ${p.amount} {p.currency}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {new Date(p.paidAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                      >
                        <Printer className="h-3 w-3" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="max-w-xl rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">Update Contact & Student Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editProfile.name}
                  onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mobile Phone</label>
                <input
                  type="text"
                  value={editProfile.phone}
                  onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={editProfile.department}
                  onChange={(e) => setEditProfile({ ...editProfile, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-bold text-slate-950 text-xs transition-colors"
              >
                Save Profile Updates
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal: Apply For Bus Pass */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Apply for Semester Bus Pass</h3>
            <form onSubmit={handleApplyPass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Transit Corridor</label>
                <select
                  value={applyForm.routeId}
                  onChange={(e) => {
                    const r = routes.find((rt) => rt.id === e.target.value);
                    setApplyForm({
                      ...applyForm,
                      routeId: e.target.value,
                      pickupStopId: r?.stops[0]?.id || '',
                    });
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.routeCode} — {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pickup Stop</label>
                <select
                  value={applyForm.pickupStopId}
                  onChange={(e) => setApplyForm({ ...applyForm, pickupStopId: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  {routes
                    .find((r) => r.id === applyForm.routeId)
                    ?.stops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.scheduledTimeMorning})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Term / Semester</label>
                <input
                  type="text"
                  value={applyForm.semester}
                  onChange={(e) => setApplyForm({ ...applyForm, semester: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Fee */}
      {payModalOpen && selectedPassToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Pay Semester Bus Pass Fee</h3>
            <p className="text-xs text-slate-400 mb-4">
              Pass #{selectedPassToPay.passNumber} · Term: {selectedPassToPay.semester}
            </p>

            <form onSubmit={handlePayFee} className="space-y-4">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between text-sm">
                <span className="text-slate-400">Total Payable Amount:</span>
                <span className="font-mono font-bold text-emerald-400 text-base">
                  ${selectedPassToPay.feeAmount}.00 USD
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Credit Card', 'UPI', 'Net Banking'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethod === m
                          ? 'border-cyan-400 bg-cyan-950 text-cyan-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {isProcessingPayment ? 'Processing...' : `Pay $${selectedPassToPay.feeAmount} Now`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
