# 🚌 CampusRide — Advanced College Bus Management System

A smart, secure, and modern campus transportation management platform designed for colleges, universities, and educational institutions. CampusRide simplifies transportation operations with live bus tracking, digital QR bus passes, route scheduling, student attendance, and fleet management.

## 🌟 Features

### 🏫 Public Portal
- Interactive landing page with campus transportation details.
- Searchable bus routes and designated stops.
- Morning, evening, and weekend bus schedules.
- Student registration and digital bus pass applications.
- Role-based authentication and password recovery.
- Support, emergency dispatch, and Lost & Found services.

### 🗺️ Live Bus Tracking
- Interactive maps using Leaflet and OpenStreetMap.
- Bus locations, routes, and pickup stops.
- Bus speed, direction, and seating occupancy indicators.
- Route-based filtering and individual bus tracking.
- Clearly identified simulated GPS data for demonstration.

### 🎫 Digital QR Bus Passes
- QR code generation for approved bus passes.
- Driver QR scanner and student roll number verification.
- Semester validity checks.
- Duplicate boarding scan prevention.
- Digital attendance records with timestamps and trip details.

### 📊 Role-Based Dashboards

**Administrator**
- Manage buses, routes, drivers, and students.
- Approve or reject bus pass applications.
- Track maintenance records and transport fees.
- View fleet status and attendance analytics.

**Student**
- View digital QR bus passes.
- Track assigned buses and view schedules.
- Access driver contact information.
- View transport fee receipts and manage profiles.

**Driver**
- Start and end trips.
- Enable or disable GPS tracking.
- Validate student bus passes.
- Update stop progress and report delays or breakdowns.

**Transport Coordinator**
- Monitor the fleet.
- Arrange standby buses.
- Review pass applications.
- Export transportation reports.

## 🔐 Demo Credentials

Use the demo login buttons or the following credentials to explore each role.

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@campusride.edu` | `Admin@123` |
| Coordinator | `coordinator@campusride.edu` | `Coord@123` |
| Driver | `driver@campusride.edu` | `Driver@123` |
| Student | `student@campusride.edu` | `Student@123` |

**Note:** These are demonstration credentials. Replace them with secure, environment-specific accounts before production deployment.

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Leaflet
- Recharts
- QR Code Generator
- Lucide React

### Backend
- Node.js
- Express.js
- Mongoose
- Schema-validated data persistence

### Security
- Bcrypt password hashing
- JWT authentication
- Server-side role-based authorization
- QR pass validation

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` |
