# CampusRide — Advanced College Bus Management System

A production-grade, secure, and modern SaaS campus transportation management platform engineered for universities, colleges, and educational transit authorities.

---

## 🌟 Key Features

### 1. Public Portal
- **Interactive Landing Page**: Hero section with university transit backdrop, animated typography, quick stop timetable search, and live radar preview.
- **Routes & Designated Stops**: Searchable corridors, waypoint distances, stop sequences, and fare structures.
- **Schedules**: Morning pickup, evening drop, and weekend library shuttle timetables with print support.
- **Support & Dispatch**: 24/7 hotline (`+1 800 555-RIDE`), emergency dispatch, and Lost & Found recovery ticket desk.
- **Authentication**: Seamless role-based sign-in with 1-click Demo credentials for all 4 roles.
- **Student Registration**: Automated profile registration with department, roll number, designated pickup stop, and instant bus pass application generation.
- **Password Recovery**: Step-by-step account recovery with simulated 6-digit verification code.

### 2. Live Bus Tracking (Leaflet & OpenStreetMap)
- Real-time GPS coordinates stream on OpenStreetMap.
- Custom styled high-contrast bus markers with pulse rings, speed indicators, heading direction, and seating occupancy.
- Route polylines and interactive pickup stops.
- Prominently labeled with **DEMO DATA: Simulated Campus Transit GPS Coordinates** notice.
- Interactive filter by corridor and focus on individual buses.

### 3. Digital QR Bus Passes & Attendance
- Dynamic QR code generation for approved student passes.
- Driver mobile validator: Driver scans QR code or enters student roll number.
- Automatic verification of semester validity and prevention of duplicate boarding scans on the same trip.
- Complete boarding attendance ledger with timestamp, stop, and trip code.

### 4. Role-Based Dashboards
- **Admin Dashboard**: Fleet registry CRUD, route management, driver accounts, student directory, pass approvals/rejections, maintenance logs, fee ledger, and Recharts boarding velocity & fleet status distribution charts.
- **Student Dashboard**: Digital QR pass with print view, assigned vehicle details, driver contact, timetable arrival times, fee payment portal with generated receipts, and profile manager.
- **Driver Dashboard**: Active trip controls (Start Trip / End Trip), GPS location beacon toggle, student QR validator scanner, stop progression checklist, and vehicle breakdown/delay reporting.
- **Transport Coordinator Dashboard**: Fleet radar surveillance, standby bus backup dispatch, pass approval queue, and operational report exporter.

---

## 🔐 Demo Credentials

All roles can be accessed via 1-click buttons on the Sign In page, or using the credentials below:

| Role | Email | Password | Key Capability |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campusride.edu` | `Admin@123` | Full fleet CRUD, driver management, database analytics |
| **Coordinator** | `coordinator@campusride.edu` | `Coord@123` | Pass approvals, standby backup dispatch, operations reports |
| **Driver** | `driver@campusride.edu` | `Driver@123` | Active trip controls, GPS beacon, QR pass boarding scanner |
| **Student** | `student@campusride.edu` | `Student@123` | Digital QR pass, live bus radar, fee payment receipts |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Maps**: Leaflet, OpenStreetMap
- **Charts**: Recharts
- **QR Codes**: QRCode generator library
- **Icons**: Lucide React
- **Backend**: Node.js, Express.js
- **Database**: Mongoose models with schema-validated persistence store and dual-layer architecture
- **Security**: Bcrypt password hashing, JWT bearer tokens, server-side role validation

---

## 📡 REST API Summary

- `POST /api/auth/login` — Authenticate and receive JWT
- `POST /api/auth/register` — Register student and submit initial pass
- `POST /api/auth/forgot-password` — Password reset flow
- `GET /api/buses` & `POST /api/buses` — Bus fleet management
- `PATCH /api/buses/:id/status` — Update bus active/idle/maintenance state
- `GET /api/routes` & `POST /api/routes` — Transit corridor management
- `GET /api/passes` & `POST /api/passes` — Bus pass applications
- `PATCH /api/passes/:id/approve` — Approve pass and generate cryptographic QR payload
- `POST /api/passes/verify` — Validate QR pass / roll number
- `GET /api/tracking/live` — Live bus GPS telemetry stream
- `POST /api/attendance/scan` — Record student boarding scan
- `POST /api/payments/pay` — Process transport fee and generate digital invoice
- `POST /api/maintenance` — Report mechanical or road delay issue
- `GET /api/analytics/dashboard` — Fleet KPI metrics and ridership analytics
