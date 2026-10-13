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
} from '../types/index.ts';

const TOKEN_KEY = 'campusride_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string; role?: string }) =>
    request<{ token: string; user: IUser; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (studentData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    department?: string;
    rollNumber: string;
    pickupStopId?: string;
    routeId?: string;
  }) =>
    request<{ token: string; user: IUser; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),

  getMe: () => request<{ user: IUser }>('/auth/me'),

  updateProfile: (profile: Partial<IUser>) =>
    request<{ user: IUser; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  forgotPassword: (data: { email: string; verificationCode?: string; newPassword?: string }) =>
    request<{ message: string; demoCode?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Buses
  getBuses: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ buses: IBus[]; total: number }>(`/buses${q ? `?${q}` : ''}`);
  },

  createBus: (bus: Partial<IBus>) =>
    request<{ bus: IBus; message: string }>('/buses', {
      method: 'POST',
      body: JSON.stringify(bus),
    }),

  updateBus: (id: string, bus: Partial<IBus>) =>
    request<{ bus: IBus; message: string }>(`/buses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bus),
    }),

  deleteBus: (id: string) =>
    request<{ message: string }>(`/buses/${id}`, {
      method: 'DELETE',
    }),

  updateBusStatus: (id: string, payload: { status: string; driverId?: string; currentRouteId?: string }) =>
    request<{ bus: IBus; message: string }>(`/buses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Routes
  getRoutes: () => request<{ routes: IRoute[] }>('/routes'),

  createRoute: (route: Partial<IRoute>) =>
    request<{ route: IRoute; message: string }>('/routes', {
      method: 'POST',
      body: JSON.stringify(route),
    }),

  updateRoute: (id: string, route: Partial<IRoute>) =>
    request<{ route: IRoute; message: string }>(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(route),
    }),

  deleteRoute: (id: string) =>
    request<{ message: string }>(`/routes/${id}`, {
      method: 'DELETE',
    }),

  // Drivers & Students
  getDrivers: () => request<{ drivers: (IUser & { assignedBus?: string })[] }>('/drivers'),

  createDriver: (data: { name: string; email: string; phone?: string; licenseNumber: string; assignedBusId?: string }) =>
    request<{ driver: IUser; message: string }>('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStudents: (params?: { search?: string; routeId?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ students: (IUser & { busPassStatus: string; busPassId?: string })[]; total: number }>(
      `/students${q ? `?${q}` : ''}`
    );
  },

  // Bus Passes
  getPasses: () => request<{ passes: IBusPass[] }>('/passes'),

  applyPass: (data: { routeId: string; pickupStopId: string; semester?: string; academicYear?: string }) =>
    request<{ pass: IBusPass; message: string }>('/passes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approvePass: (id: string) =>
    request<{ pass: IBusPass; message: string }>(`/passes/${id}/approve`, {
      method: 'PATCH',
    }),

  rejectPass: (id: string, reason: string) =>
    request<{ pass: IBusPass; message: string }>(`/passes/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  verifyPass: (payload: { qrPayload?: string; manualRollNo?: string }) =>
    request<{ valid: boolean; pass: IBusPass; message: string; error?: string }>('/passes/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Trips & Location
  getTrips: () => request<{ trips: ITrip[] }>('/trips'),

  createTrip: (data: Partial<ITrip>) =>
    request<{ trip: ITrip; message: string }>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  startTrip: (id: string) =>
    request<{ trip: ITrip; message: string }>(`/trips/${id}/start`, {
      method: 'PATCH',
    }),

  endTrip: (id: string) =>
    request<{ trip: ITrip; message: string }>(`/trips/${id}/end`, {
      method: 'PATCH',
    }),

  updateTripLocation: (id: string, coords: { latitude: number; longitude: number; speed: number; heading: number }) =>
    request<{ message: string; location: IBus['currentLocation'] }>(`/trips/${id}/location`, {
      method: 'PATCH',
      body: JSON.stringify(coords),
    }),

  getLiveTracking: () =>
    request<{
      timestamp: string;
      buses: {
        busId: string;
        busNumber: string;
        registrationNumber: string;
        status: string;
        batteryOrFuelLevel: number;
        fuelType: string;
        capacity: number;
        occupiedSeats: number;
        routeName: string;
        routeCode: string;
        driverName: string;
        currentLocation: {
          latitude: number;
          longitude: number;
          speed: number;
          heading: number;
          lastUpdated: string;
          isSimulated: boolean;
        };
        tripCode?: string;
        disclaimer: string;
      }[];
      isSimulatedFeed: boolean;
      totalActive: number;
    }>('/tracking/live'),

  // Attendance
  getAttendance: () => request<{ attendance: IAttendance[] }>('/attendance'),

  scanAttendance: (data: { studentId?: string; passId?: string; tripId?: string; stopName?: string }) =>
    request<{ attendance: IAttendance; message: string }>('/attendance/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Payments
  getPayments: () => request<{ payments: IPayment[] }>('/payments'),

  payFee: (data: { busPassId: string; amount?: number; paymentMethod?: string }) =>
    request<{ payment: IPayment; message: string }>('/payments/pay', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Maintenance
  getMaintenance: () => request<{ maintenance: IMaintenance[] }>('/maintenance'),

  createMaintenance: (data: Partial<IMaintenance>) =>
    request<{ ticket: IMaintenance; message: string }>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMaintenance: (id: string, data: Partial<IMaintenance>) =>
    request<{ ticket: IMaintenance; message: string }>(`/maintenance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: () => request<{ notifications: INotification[] }>('/notifications'),

  createNotification: (data: Partial<INotification>) =>
    request<{ notification: INotification; message: string }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // Analytics
  getAnalytics: () =>
    request<{
      metrics: {
        totalBuses: number;
        activeBuses: number;
        maintenanceBuses: number;
        idleBuses: number;
        totalStudents: number;
        totalDrivers: number;
        pendingPasses: number;
        activeTrips: number;
        totalRevenue: number;
        fleetUtilizationRate: number;
      };
      weeklyAttendance: { day: string; boardings: number; onTimeRate: number }[];
      routeDistribution: { name: string; students: number; distance: number }[];
    }>('/analytics/dashboard'),
};
