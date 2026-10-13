export type UserRole = 'admin' | 'student' | 'driver' | 'coordinator';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  department?: string;
  rollNumber?: string;
  assignedBusId?: string;
  assignedRouteId?: string;
  pickupStopId?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BusStatus = 'active' | 'maintenance' | 'idle' | 'out_of_service';

export interface IBus {
  id: string;
  busNumber: string; // e.g., "CR-01"
  registrationNumber: string; // e.g., "KA-01-EA-4521"
  capacity: number; // e.g., 48
  occupiedSeats: number;
  model: string; // e.g., "Tata Ultra EV Electric / Volvo B8R"
  year: number;
  fuelType: 'electric' | 'diesel' | 'cng';
  batteryOrFuelLevel: number; // percentage 0-100
  status: BusStatus;
  currentRouteId?: string;
  driverId?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    speed: number; // km/h
    heading: number; // degrees
    lastUpdated: string;
    isSimulated: boolean;
  };
  features: string[]; // e.g. ["AC", "WiFi", "GPS", "CCTV", "Wheelchair Ramp"]
  odometerKm: number;
  nextServiceDate: string;
}

export interface IRouteStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
  scheduledTimeMorning: string; // "07:30 AM"
  scheduledTimeEvening: string; // "05:15 PM"
  fare: number;
  registeredStudentsCount: number;
}

export interface IRoute {
  id: string;
  name: string; // e.g., "North Campus Express"
  routeCode: string; // e.g., "R-101"
  origin: string;
  destination: string;
  totalDistanceKm: number;
  estimatedDurationMins: number;
  stops: IRouteStop[];
  assignedBusIds: string[];
  activeTripsCount: number;
  isActive: boolean;
}

export type BusPassStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface IBusPass {
  id: string;
  passNumber: string; // e.g., "BP-2026-8492"
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  studentDepartment: string;
  routeId: string;
  routeName: string;
  pickupStopId: string;
  pickupStopName: string;
  academicYear: string;
  semester: string;
  validFrom: string;
  validUntil: string;
  status: BusPassStatus;
  qrCodeData: string;
  feeAmount: number;
  feePaid: boolean;
  paymentId?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface ITrip {
  id: string;
  tripCode: string; // e.g., "TRIP-2026-041"
  busId: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  driverId: string;
  driverName: string;
  direction: 'inbound_morning' | 'outbound_evening' | 'special';
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: TripStatus;
  currentStopIndex: number;
  passengersBoarded: number;
  isSimulatingGps: boolean;
  notes?: string;
}

export interface IAttendance {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  busPassId: string;
  tripId: string;
  busId: string;
  busNumber: string;
  routeId: string;
  stopName: string;
  scannedAt: string;
  status: 'boarded' | 'missed' | 'rejected';
  verifiedBy: string; // driver or coordinator name/id
}

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface IPayment {
  id: string;
  transactionId: string;
  studentId: string;
  studentName: string;
  busPassId: string;
  amount: number;
  currency: string;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Campus Cash';
  status: PaymentStatus;
  receiptNumber: string;
  paidAt: string;
  semester: string;
}

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed';

export interface IMaintenance {
  id: string;
  ticketId: string;
  busId: string;
  busNumber: string;
  reportedBy: string;
  issueDescription: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  serviceType: 'Routine Inspection' | 'Brake System' | 'Battery & Motor' | 'Tyre Replacement' | 'AC Repair' | 'Emergency Breakdown';
  cost: number;
  reportedAt: string;
  completedAt?: string;
  mechanicNotes?: string;
}

export interface INotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  targetRole: 'all' | 'student' | 'driver' | 'coordinator' | 'admin';
  targetUserId?: string;
  createdAt: string;
  read: boolean;
  relatedRouteId?: string;
  relatedBusId?: string;
}
