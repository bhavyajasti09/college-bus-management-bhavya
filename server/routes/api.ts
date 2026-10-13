import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/store.ts';
import {
  verifyAuthToken,
  requireRoles,
  generateToken,
  AuthenticatedRequest,
} from '../middleware/auth.ts';
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
} from '../models/types.ts';

const router = Router();

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================

// Login
router.post('/auth/login', async (req, res): Promise<void> => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    res.status(401).json({ error: 'Invalid email address or account does not exist.' });
    return;
  }

  if (role && user.role !== role) {
    res.status(403).json({ error: `Account exists but role is ${user.role}, not ${role}.` });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.password || '');
  if (!isMatch) {
    res.status(401).json({ error: 'Incorrect password provided.' });
    return;
  }

  const token = generateToken(user);
  const { password: _, ...safeUser } = user;

  res.json({
    token,
    user: safeUser,
    message: `Welcome back, ${user.name}!`,
  });
});

// Student Registration
router.post('/auth/register', (req, res): void => {
  const { name, email, password, phone, department, rollNumber, pickupStopId, routeId } = req.body;

  if (!name || !email || !password || !rollNumber) {
    res.status(400).json({ error: 'Please provide all required fields (Name, Email, Password, Roll No).' });
    return;
  }

  const existing = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() || u.rollNumber === rollNumber
  );

  if (existing) {
    res.status(400).json({ error: 'Student with this email or roll number is already registered.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser: IUser = {
    id: `usr_student_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'student',
    phone: phone || '',
    department: department || 'General Engineering',
    rollNumber,
    assignedRouteId: routeId || 'route_1',
    pickupStopId: pickupStopId || 'stop_1_2',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Auto-create initial pending bus pass application
  const route = db.routes.find((r) => r.id === newUser.assignedRouteId) || db.routes[0];
  const stop = route.stops.find((s) => s.id === newUser.pickupStopId) || route.stops[0];

  const initialPass: IBusPass = {
    id: `pass_${Date.now()}`,
    passNumber: `BP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    studentId: newUser.id,
    studentName: newUser.name,
    studentRollNumber: newUser.rollNumber!,
    studentDepartment: newUser.department!,
    routeId: route.id,
    routeName: route.name,
    pickupStopId: stop.id,
    pickupStopName: stop.name,
    academicYear: '2026-2027',
    semester: 'Semester 1',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    qrCodeData: 'PENDING_APPROVAL',
    feeAmount: 380,
    feePaid: false,
    createdAt: new Date().toISOString(),
  };
  db.busPasses.push(initialPass);

  const token = generateToken(newUser);
  const { password: _, ...safeUser } = newUser;

  res.status(201).json({
    token,
    user: safeUser,
    message: 'Student account registered successfully! Bus pass application submitted.',
  });
});

// Forgot Password Flow
router.post('/auth/forgot-password', (req, res): void => {
  const { email, newPassword, verificationCode } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    res.status(404).json({ error: 'No account registered with this email address.' });
    return;
  }

  if (verificationCode && newPassword) {
    // Reset password
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(newPassword, salt);
    user.updatedAt = new Date().toISOString();
    res.json({ message: 'Password has been reset successfully! You can now log in.' });
    return;
  }

  // Generate demo code
  res.json({
    message: 'Verification code sent to registered institutional email.',
    demoCode: '849201',
  });
});

// Current User Profile
router.get('/auth/me', verifyAuthToken, (req: AuthenticatedRequest, res: Response): void => {
  const { password: _, ...safeUser } = req.user!;
  res.json({ user: safeUser });
});

// Update Profile
router.put('/auth/profile', verifyAuthToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const { name, phone, department, pickupStopId, assignedRouteId } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (department) user.department = department;
  if (pickupStopId) user.pickupStopId = pickupStopId;
  if (assignedRouteId) user.assignedRouteId = assignedRouteId;
  user.updatedAt = new Date().toISOString();

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, message: 'Profile updated successfully.' });
});

// ==========================================
// 2. BUS MANAGEMENT (CRUD & STATUS)
// ==========================================

router.get('/buses', (req, res): void => {
  const { status, fuelType, search } = req.query;
  let results = [...db.buses];

  if (status) {
    results = results.filter((b) => b.status === status);
  }
  if (fuelType) {
    results = results.filter((b) => b.fuelType === fuelType);
  }
  if (search) {
    const s = String(search).toLowerCase();
    results = results.filter(
      (b) =>
        b.busNumber.toLowerCase().includes(s) ||
        b.registrationNumber.toLowerCase().includes(s) ||
        b.model.toLowerCase().includes(s)
    );
  }

  res.json({ buses: results, total: results.length });
});

router.post('/buses', verifyAuthToken, requireRoles('admin'), (req, res): void => {
  const { busNumber, registrationNumber, capacity, model, year, fuelType, features } = req.body;

  if (!busNumber || !registrationNumber || !capacity) {
    res.status(400).json({ error: 'Bus Number, Registration Number, and Capacity are required.' });
    return;
  }

  const newBus: IBus = {
    id: `bus_${Date.now()}`,
    busNumber,
    registrationNumber,
    capacity: Number(capacity),
    occupiedSeats: 0,
    model: model || 'Standard Electric Transit',
    year: Number(year) || new Date().getFullYear(),
    fuelType: fuelType || 'electric',
    batteryOrFuelLevel: 100,
    status: 'idle',
    features: Array.isArray(features) ? features : ['GPS', 'AC', 'CCTV'],
    odometerKm: 0,
    nextServiceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currentLocation: {
      latitude: 12.9716,
      longitude: 77.5946,
      speed: 0,
      heading: 0,
      lastUpdated: new Date().toISOString(),
      isSimulated: true,
    },
  };

  db.buses.push(newBus);
  res.status(201).json({ bus: newBus, message: `Bus ${newBus.busNumber} added successfully.` });
});

router.put('/buses/:id', verifyAuthToken, requireRoles('admin', 'coordinator'), (req, res): void => {
  const bus = db.buses.find((b) => b.id === req.params.id);
  if (!bus) {
    res.status(404).json({ error: 'Bus not found.' });
    return;
  }

  Object.assign(bus, req.body);
  res.json({ bus, message: `Bus ${bus.busNumber} updated successfully.` });
});

router.delete('/buses/:id', verifyAuthToken, requireRoles('admin'), (req, res): void => {
  const index = db.buses.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Bus not found.' });
    return;
  }

  const deleted = db.buses.splice(index, 1)[0];
  res.json({ message: `Bus ${deleted.busNumber} deleted successfully.` });
});

router.patch('/buses/:id/status', verifyAuthToken, requireRoles('admin', 'coordinator', 'driver'), (req, res): void => {
  const bus = db.buses.find((b) => b.id === req.params.id);
  if (!bus) {
    res.status(404).json({ error: 'Bus not found.' });
    return;
  }

  const { status, driverId, currentRouteId } = req.body;
  if (status) bus.status = status;
  if (driverId !== undefined) bus.driverId = driverId;
  if (currentRouteId !== undefined) bus.currentRouteId = currentRouteId;

  res.json({ bus, message: 'Bus status updated.' });
});

// ==========================================
// 3. ROUTES & STOPS
// ==========================================

router.get('/routes', (_req, res): void => {
  res.json({ routes: db.routes });
});

router.post('/routes', verifyAuthToken, requireRoles('admin', 'coordinator'), (req, res): void => {
  const { name, routeCode, origin, destination, totalDistanceKm, estimatedDurationMins, stops } = req.body;

  if (!name || !routeCode || !origin || !destination) {
    res.status(400).json({ error: 'Route name, code, origin and destination are required.' });
    return;
  }

  const newRoute: IRoute = {
    id: `route_${Date.now()}`,
    name,
    routeCode,
    origin,
    destination,
    totalDistanceKm: Number(totalDistanceKm) || 10,
    estimatedDurationMins: Number(estimatedDurationMins) || 30,
    stops: stops || [],
    assignedBusIds: [],
    activeTripsCount: 0,
    isActive: true,
  };

  db.routes.push(newRoute);
  res.status(201).json({ route: newRoute, message: 'New transit route created.' });
});

router.put('/routes/:id', verifyAuthToken, requireRoles('admin', 'coordinator'), (req, res): void => {
  const route = db.routes.find((r) => r.id === req.params.id);
  if (!route) {
    res.status(404).json({ error: 'Route not found.' });
    return;
  }

  Object.assign(route, req.body);
  res.json({ route, message: 'Route updated successfully.' });
});

router.delete('/routes/:id', verifyAuthToken, requireRoles('admin'), (req, res): void => {
  const index = db.routes.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Route not found.' });
    return;
  }

  const deleted = db.routes.splice(index, 1)[0];
  res.json({ message: `Route ${deleted.name} deleted.` });
});

// ==========================================
// 4. DRIVERS & STUDENTS DIRECTORY
// ==========================================

router.get('/drivers', verifyAuthToken, (_req, res): void => {
  const drivers = db.users
    .filter((u) => u.role === 'driver')
    .map(({ password: _, ...safe }) => {
      const bus = db.buses.find((b) => b.driverId === safe.id || b.id === safe.assignedBusId);
      return { ...safe, assignedBus: bus ? bus.busNumber : 'Unassigned' };
    });
  res.json({ drivers });
});

router.post('/drivers', verifyAuthToken, requireRoles('admin'), (req, res): void => {
  const { name, email, phone, licenseNumber, assignedBusId } = req.body;

  if (!name || !email || !licenseNumber) {
    res.status(400).json({ error: 'Name, email, and CDL license number are required.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const defaultPassword = bcrypt.hashSync('Driver@123', salt);

  const newDriver: IUser = {
    id: `usr_driver_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password: defaultPassword,
    role: 'driver',
    phone: phone || '',
    licenseNumber,
    assignedBusId,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newDriver);

  if (assignedBusId) {
    const bus = db.buses.find((b) => b.id === assignedBusId);
    if (bus) bus.driverId = newDriver.id;
  }

  const { password: _, ...safe } = newDriver;
  res.status(201).json({ driver: safe, message: 'Driver created successfully. Default password is Driver@123' });
});

router.get('/students', verifyAuthToken, (req: AuthenticatedRequest, res: Response): void => {
  const { search, routeId } = req.query;
  let students = db.users.filter((u) => u.role === 'student');

  if (routeId) {
    students = students.filter((s) => s.assignedRouteId === routeId);
  }
  if (search) {
    const q = String(search).toLowerCase();
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
        s.email.toLowerCase().includes(q)
    );
  }

  const safeStudents = students.map(({ password: _, ...safe }) => {
    const pass = db.busPasses.find((p) => p.studentId === safe.id);
    return {
      ...safe,
      busPassStatus: pass ? pass.status : 'None',
      busPassId: pass?.id,
    };
  });

  res.json({ students: safeStudents, total: safeStudents.length });
});

// ==========================================
// 5. BUS PASSES & QR VERIFICATION
// ==========================================

router.get('/passes', verifyAuthToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  if (user.role === 'student') {
    const studentPasses = db.busPasses.filter((p) => p.studentId === user.id);
    res.json({ passes: studentPasses });
    return;
  }

  // Admin / Coordinator view all
  res.json({ passes: db.busPasses });
});

router.post('/passes', verifyAuthToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const { routeId, pickupStopId, semester, academicYear } = req.body;

  const route = db.routes.find((r) => r.id === routeId);
  if (!route) {
    res.status(400).json({ error: 'Selected transit route does not exist.' });
    return;
  }

  const stop = route.stops.find((s) => s.id === pickupStopId) || route.stops[0];

  const newPass: IBusPass = {
    id: `pass_${Date.now()}`,
    passNumber: `BP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    studentId: user.id,
    studentName: user.name,
    studentRollNumber: user.rollNumber || 'STU-2026',
    studentDepartment: user.department || 'Undergraduate',
    routeId: route.id,
    routeName: route.name,
    pickupStopId: stop.id,
    pickupStopName: stop.name,
    academicYear: academicYear || '2026-2027',
    semester: semester || 'Current Term',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    qrCodeData: 'PENDING_APPROVAL',
    feeAmount: 380,
    feePaid: false,
    createdAt: new Date().toISOString(),
  };

  db.busPasses.push(newPass);
  res.status(201).json({ pass: newPass, message: 'Bus pass application submitted for coordinator review.' });
});

router.patch('/passes/:id/approve', verifyAuthToken, requireRoles('admin', 'coordinator'), (req: AuthenticatedRequest, res: Response): void => {
  const pass = db.busPasses.find((p) => p.id === req.params.id);
  if (!pass) {
    res.status(404).json({ error: 'Bus pass application not found.' });
    return;
  }

  pass.status = 'approved';
  pass.approvedBy = req.user!.name;
  pass.approvedAt = new Date().toISOString();
  pass.qrCodeData = JSON.stringify({
    passId: pass.id,
    passNumber: pass.passNumber,
    rollNumber: pass.studentRollNumber,
    studentName: pass.studentName,
    route: pass.routeName,
    stop: pass.pickupStopName,
    validUntil: pass.validUntil,
    timestamp: Date.now(),
    securitySeal: `CR-SEAL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
  });

  // Notify student
  db.notifications.push({
    id: `notif_${Date.now()}`,
    title: 'Bus Pass Approved!',
    message: `Your campus bus pass application (${pass.passNumber}) has been approved. Your digital QR boarding pass is now active.`,
    type: 'success',
    targetRole: 'student',
    targetUserId: pass.studentId,
    createdAt: new Date().toISOString(),
    read: false,
  });

  res.json({ pass, message: 'Bus pass approved successfully.' });
});

router.patch('/passes/:id/reject', verifyAuthToken, requireRoles('admin', 'coordinator'), (req, res): void => {
  const pass = db.busPasses.find((p) => p.id === req.params.id);
  if (!pass) {
    res.status(404).json({ error: 'Bus pass application not found.' });
    return;
  }

  const { reason } = req.body;
  pass.status = 'rejected';
  pass.rejectionReason = reason || 'Document verification incomplete.';

  res.json({ pass, message: 'Bus pass application rejected.' });
});

// QR Code Verification endpoint (used by driver scanner)
router.post('/passes/verify', verifyAuthToken, requireRoles('driver', 'coordinator', 'admin'), (req, res): void => {
  const { qrPayload, manualRollNo } = req.body;

  let pass: IBusPass | undefined;

  if (qrPayload) {
    try {
      const parsed = JSON.parse(qrPayload);
      if (parsed.passId) {
        pass = db.busPasses.find((p) => p.id === parsed.passId);
      }
    } catch {
      // Direct string search
      pass = db.busPasses.find((p) => p.passNumber === qrPayload || p.id === qrPayload);
    }
  }

  if (!pass && manualRollNo) {
    pass = db.busPasses.find((p) => p.studentRollNumber.toLowerCase() === manualRollNo.toLowerCase());
  }

  if (!pass) {
    res.status(404).json({ valid: false, error: 'No matching student bus pass found.' });
    return;
  }

  if (pass.status !== 'approved') {
    res.status(400).json({
      valid: false,
      error: `Bus pass is not active. Status: ${pass.status.toUpperCase()}`,
      pass,
    });
    return;
  }

  const isExpired = new Date(pass.validUntil) < new Date();
  if (isExpired) {
    res.status(400).json({ valid: false, error: 'Bus pass has expired. Renewal required.', pass });
    return;
  }

  res.json({
    valid: true,
    pass,
    message: `Pass verified for ${pass.studentName} (${pass.studentRollNumber})`,
  });
});

// ==========================================
// 6. TRIPS & LIVE BUS GPS
// ==========================================

router.get('/trips', (_req, res): void => {
  res.json({ trips: db.trips });
});

router.post('/trips', verifyAuthToken, requireRoles('admin', 'coordinator'), (req, res): void => {
  const { busId, routeId, driverId, direction, scheduledStartTime, scheduledEndTime } = req.body;

  const bus = db.buses.find((b) => b.id === busId);
  const route = db.routes.find((r) => r.id === routeId);
  const driver = db.users.find((u) => u.id === driverId);

  if (!bus || !route) {
    res.status(400).json({ error: 'Valid Bus and Route are required.' });
    return;
  }

  const newTrip: ITrip = {
    id: `trip_${Date.now()}`,
    tripCode: `TRIP-${route.routeCode}-${Math.floor(10 + Math.random() * 90)}`,
    busId: bus.id,
    busNumber: bus.busNumber,
    routeId: route.id,
    routeName: route.name,
    driverId: driver ? driver.id : 'usr_driver_1',
    driverName: driver ? driver.name : 'Assigned Driver',
    direction: direction || 'inbound_morning',
    scheduledStartTime: scheduledStartTime || '07:30 AM',
    scheduledEndTime: scheduledEndTime || '08:15 AM',
    status: 'scheduled',
    currentStopIndex: 0,
    passengersBoarded: 0,
    isSimulatingGps: true,
  };

  db.trips.push(newTrip);
  res.status(201).json({ trip: newTrip, message: 'Trip scheduled successfully.' });
});

router.patch('/trips/:id/start', verifyAuthToken, requireRoles('driver', 'coordinator', 'admin'), (req, res): void => {
  const trip = db.trips.find((t) => t.id === req.params.id);
  if (!trip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  trip.status = 'in_progress';
  trip.actualStartTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  trip.isSimulatingGps = true;

  const bus = db.buses.find((b) => b.id === trip.busId);
  if (bus) {
    bus.status = 'active';
    bus.currentRouteId = trip.routeId;
  }

  res.json({ trip, message: `Trip ${trip.tripCode} has started! Live location broadcast active.` });
});

router.patch('/trips/:id/end', verifyAuthToken, requireRoles('driver', 'coordinator', 'admin'), (req, res): void => {
  const trip = db.trips.find((t) => t.id === req.params.id);
  if (!trip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  trip.status = 'completed';
  trip.actualEndTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  trip.isSimulatingGps = false;

  const bus = db.buses.find((b) => b.id === trip.busId);
  if (bus) {
    bus.status = 'idle';
    bus.occupiedSeats = 0;
  }

  res.json({ trip, message: `Trip ${trip.tripCode} ended successfully.` });
});

// Update location directly from driver's device or simulation
router.patch('/trips/:id/location', verifyAuthToken, requireRoles('driver', 'coordinator', 'admin'), (req, res): void => {
  const trip = db.trips.find((t) => t.id === req.params.id);
  if (!trip) {
    res.status(404).json({ error: 'Trip not found.' });
    return;
  }

  const { latitude, longitude, speed, heading, isSimulated } = req.body;
  const bus = db.buses.find((b) => b.id === trip.busId);

  if (bus) {
    bus.currentLocation = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      speed: Number(speed) || 0,
      heading: Number(heading) || 0,
      lastUpdated: new Date().toISOString(),
      isSimulated: isSimulated !== undefined ? isSimulated : true,
    };
  }

  res.json({ message: 'GPS coordinate updated.', location: bus?.currentLocation });
});

// Live Bus Tracking feed for map
router.get('/tracking/live', (_req, res): void => {
  const activeBuses = db.buses.map((b) => {
    const route = db.routes.find((r) => r.id === b.currentRouteId);
    const activeTrip = db.trips.find((t) => t.busId === b.id && t.status === 'in_progress');
    const driver = db.users.find((u) => u.id === b.driverId);

    return {
      busId: b.id,
      busNumber: b.busNumber,
      registrationNumber: b.registrationNumber,
      status: b.status,
      batteryOrFuelLevel: b.batteryOrFuelLevel,
      fuelType: b.fuelType,
      capacity: b.capacity,
      occupiedSeats: b.occupiedSeats,
      routeName: route ? route.name : 'Depot / Idle',
      routeCode: route ? route.routeCode : 'STANDBY',
      driverName: driver ? driver.name : 'Assigned Staff',
      currentLocation: b.currentLocation || {
        latitude: 12.9716,
        longitude: 77.5946,
        speed: 0,
        heading: 0,
        lastUpdated: new Date().toISOString(),
        isSimulated: true,
      },
      tripCode: activeTrip?.tripCode,
      disclaimer: 'DEMO DATA: Simulated Campus Transit GPS Coordinates',
    };
  });

  res.json({
    timestamp: new Date().toISOString(),
    buses: activeBuses,
    isSimulatedFeed: true,
    totalActive: activeBuses.filter((b) => b.status === 'active').length,
  });
});

// ==========================================
// 7. ATTENDANCE SCANNING & REPORTING
// ==========================================

router.get('/attendance', verifyAuthToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  if (user.role === 'student') {
    const records = db.attendance.filter((a) => a.studentId === user.id);
    res.json({ attendance: records });
    return;
  }

  res.json({ attendance: db.attendance });
});

router.post('/attendance/scan', verifyAuthToken, requireRoles('driver', 'coordinator', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  const { studentId, passId, tripId, stopName } = req.body;

  const student = db.users.find((u) => u.id === studentId || u.rollNumber === studentId);
  const pass = db.busPasses.find((p) => p.id === passId || (student && p.studentId === student.id));

  if (!student && !pass) {
    res.status(404).json({ error: 'Student or Pass record not found.' });
    return;
  }

  const matchedStudent = student || db.users.find((u) => u.id === pass?.studentId);
  if (!matchedStudent) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  // Prevent duplicate boarding scan within same trip today
  const alreadyBoarded = db.attendance.find(
    (a) =>
      a.studentId === matchedStudent.id &&
      a.tripId === (tripId || 'trip_1') &&
      new Date(a.scannedAt).toDateString() === new Date().toDateString()
  );

  if (alreadyBoarded) {
    res.status(400).json({
      error: `Duplicate boarding! ${matchedStudent.name} was already marked boarded today at ${new Date(alreadyBoarded.scannedAt).toLocaleTimeString()}.`,
      alreadyBoarded,
    });
    return;
  }

  const record: IAttendance = {
    id: `att_${Date.now()}`,
    studentId: matchedStudent.id,
    studentName: matchedStudent.name,
    studentRollNumber: matchedStudent.rollNumber || 'STU-001',
    busPassId: pass ? pass.id : 'pass_auto',
    tripId: tripId || 'trip_1',
    busId: 'bus_1',
    busNumber: 'CR-01',
    routeId: 'route_1',
    stopName: stopName || pass?.pickupStopName || 'Main Campus Gate',
    scannedAt: new Date().toISOString(),
    status: 'boarded',
    verifiedBy: `${req.user!.name} (${req.user!.role})`,
  };

  db.attendance.unshift(record);

  // Increment bus passenger count
  const activeBus = db.buses.find((b) => b.id === record.busId);
  if (activeBus && activeBus.occupiedSeats < activeBus.capacity) {
    activeBus.occupiedSeats += 1;
  }

  res.status(201).json({
    attendance: record,
    message: `Boarding verified for ${matchedStudent.name} (${matchedStudent.rollNumber})!`,
  });
});

// ==========================================
// 8. FEES & PAYMENTS
// ==========================================

router.get('/payments', verifyAuthToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  if (user.role === 'student') {
    const studentPayments = db.payments.filter((p) => p.studentId === user.id);
    res.json({ payments: studentPayments });
    return;
  }

  res.json({ payments: db.payments });
});

router.post('/payments/pay', verifyAuthToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const { busPassId, amount, paymentMethod } = req.body;

  const pass = db.busPasses.find((p) => p.id === busPassId);
  if (!pass) {
    res.status(404).json({ error: 'Bus pass application not found.' });
    return;
  }

  const payment: IPayment = {
    id: `pay_${Date.now()}`,
    transactionId: `TXN-${Date.now().toString().slice(-8)}`,
    studentId: user.id,
    studentName: user.name,
    busPassId: pass.id,
    amount: Number(amount) || pass.feeAmount,
    currency: 'USD',
    paymentMethod: paymentMethod || 'Credit Card',
    status: 'paid',
    receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    paidAt: new Date().toISOString(),
    semester: pass.semester,
  };

  db.payments.unshift(payment);
  pass.feePaid = true;
  pass.paymentId = payment.id;

  res.status(201).json({ payment, message: 'Transport fee paid successfully! Digital receipt generated.' });
});

// ==========================================
// 9. FLEET MAINTENANCE & WORK ORDERS
// ==========================================

router.get('/maintenance', verifyAuthToken, (_req, res): void => {
  res.json({ maintenance: db.maintenance });
});

router.post('/maintenance', verifyAuthToken, requireRoles('driver', 'coordinator', 'admin'), (req: AuthenticatedRequest, res: Response): void => {
  const { busId, issueDescription, priority, serviceType, cost } = req.body;
  const bus = db.buses.find((b) => b.id === busId);

  if (!bus || !issueDescription) {
    res.status(400).json({ error: 'Bus and issue description are required.' });
    return;
  }

  const newTicket: IMaintenance = {
    id: `maint_${Date.now()}`,
    ticketId: `MNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    busId: bus.id,
    busNumber: bus.busNumber,
    reportedBy: `${req.user!.name} (${req.user!.role})`,
    issueDescription,
    priority: priority || 'medium',
    status: 'pending',
    serviceType: serviceType || 'Routine Inspection',
    cost: Number(cost) || 0,
    reportedAt: new Date().toISOString(),
  };

  db.maintenance.unshift(newTicket);
  if (priority === 'urgent' || priority === 'high') {
    bus.status = 'maintenance';
  }

  res.status(201).json({ ticket: newTicket, message: 'Maintenance report logged and dispatch notified.' });
});

router.patch('/maintenance/:id', verifyAuthToken, requireRoles('admin', 'coordinator'), (req, res): void => {
  const ticket = db.maintenance.find((m) => m.id === req.params.id);
  if (!ticket) {
    res.status(404).json({ error: 'Maintenance ticket not found.' });
    return;
  }

  const { status, mechanicNotes, cost } = req.body;
  if (status) {
    ticket.status = status;
    if (status === 'completed') {
      ticket.completedAt = new Date().toISOString();
      const bus = db.buses.find((b) => b.id === ticket.busId);
      if (bus && bus.status === 'maintenance') {
        bus.status = 'active';
      }
    }
  }
  if (mechanicNotes) ticket.mechanicNotes = mechanicNotes;
  if (cost !== undefined) ticket.cost = Number(cost);

  res.json({ ticket, message: 'Maintenance ticket updated.' });
});

// ==========================================
// 10. NOTIFICATIONS
// ==========================================

router.get('/notifications', verifyAuthToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const userNotifs = db.notifications.filter(
    (n) => n.targetRole === 'all' || n.targetRole === user.role || n.targetUserId === user.id
  );
  res.json({ notifications: userNotifs });
});

router.post('/notifications', verifyAuthToken, requireRoles('admin', 'coordinator'), (req, res): void => {
  const { title, message, type, targetRole } = req.body;

  if (!title || !message) {
    res.status(400).json({ error: 'Title and message are required.' });
    return;
  }

  const notif: INotification = {
    id: `notif_${Date.now()}`,
    title,
    message,
    type: type || 'info',
    targetRole: targetRole || 'all',
    createdAt: new Date().toISOString(),
    read: false,
  };

  db.notifications.unshift(notif);
  res.status(201).json({ notification: notif, message: 'Broadcast notification dispatched.' });
});

router.patch('/notifications/:id/read', verifyAuthToken, (req, res): void => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// ==========================================
// 11. ANALYTICS & DASHBOARD METRICS
// ==========================================

router.get('/analytics/dashboard', verifyAuthToken, (_req, res): void => {
  const totalBuses = db.buses.length;
  const activeBuses = db.buses.filter((b) => b.status === 'active').length;
  const maintenanceBuses = db.buses.filter((b) => b.status === 'maintenance').length;
  const idleBuses = db.buses.filter((b) => b.status === 'idle').length;

  const totalStudents = db.users.filter((u) => u.role === 'student').length;
  const totalDrivers = db.users.filter((u) => u.role === 'driver').length;
  const pendingPasses = db.busPasses.filter((p) => p.status === 'pending').length;
  const activeTrips = db.trips.filter((t) => t.status === 'in_progress').length;

  const totalRevenue = db.payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  // Fleet occupancy calculations
  const totalCapacity = db.buses.reduce((sum, b) => sum + b.capacity, 0);
  const occupiedSeats = db.buses.reduce((sum, b) => sum + b.occupiedSeats, 0);
  const fleetUtilizationRate = totalCapacity > 0 ? Math.round((occupiedSeats / totalCapacity) * 100) : 0;

  // Chart data: weekly boarding counts
  const weeklyAttendance = [
    { day: 'Mon', boardings: 245, onTimeRate: 98 },
    { day: 'Tue', boardings: 260, onTimeRate: 96 },
    { day: 'Wed', boardings: 275, onTimeRate: 99 },
    { day: 'Thu', boardings: 250, onTimeRate: 94 },
    { day: 'Fri', boardings: 230, onTimeRate: 97 },
    { day: 'Sat', boardings: 85, onTimeRate: 100 },
  ];

  // Route utilization breakdown
  const routeDistribution = db.routes.map((r) => {
    const studentsOnRoute = db.users.filter((u) => u.assignedRouteId === r.id).length;
    return {
      name: r.name,
      students: studentsOnRoute || 18,
      distance: r.totalDistanceKm,
    };
  });

  res.json({
    metrics: {
      totalBuses,
      activeBuses,
      maintenanceBuses,
      idleBuses,
      totalStudents,
      totalDrivers,
      pendingPasses,
      activeTrips,
      totalRevenue,
      fleetUtilizationRate,
    },
    weeklyAttendance,
    routeDistribution,
  });
});

export default router;
