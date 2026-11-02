# MediBook – Healthcare Appointment Booking System
### Final Year LP-IV Software Testing & Quality Assurance (STQA) Mini Project

MediBook is an enterprise-grade, full-stack appointment scheduling platform tailored for clinics and hospitals. The application delivers end-to-end medical appointment lifecycle management, featuring instant doctor specialty discovery, real-time database slot synchronization, automated conflict and double-booking rejection, dedicated patient portals, and a high-security administrative command center.

The entire system is architected to strict STQA (Software Testing & Quality Assurance) standards, containing deterministic, stable `data-testid` attributes across all interactive components for test automation using Python, Selenium WebDriver, and Pytest.

---

## Table of Contents
1. [Project Objectives](#1-project-objectives)
2. [Technology Stack](#2-technology-stack)
3. [System Requirements](#3-system-requirements)
4. [Project Folder Structure](#4-project-folder-structure)
5. [Installation & Setup](#5-installation--setup)
   - [Backend Configuration](#backend-setup-flask--sqlite)
   - [Frontend Configuration](#frontend-setup-react--vite--tailwind)
6. [Database Initialization & Seeding](#6-database-initialization--seeding)
7. [Default Credentials](#7-default-credentials)
8. [Running the Application](#8-running-the-application)
9. [REST API Documentation](#9-rest-api-documentation)
10. [STQA Automated Testing Suite](#10-stqa-automated-testing-suite)
11. [Limitations & Future Enhancements](#11-limitations--future-enhancements)

---

## 1. Project Objectives

- **Eliminate Double-Booking:** Provide multi-tier slot reservation checks in SQLite preventing race conditions or concurrent overlaps.
- **Role-Based Access Control (RBAC):** Ensure cryptographic JWT isolation between patients and clinic administrators.
- **Automated Testability:** Integrate stable, immutable `data-testid` DOM selectors across 100% of critical user journeys for reliable Selenium WebDriver test suites.
- **Real-Time Dynamic Slot Engine:** Auto-compute open vs. booked consultation slots for doctors and release cancelled appointments immediately back into the available pool.

---

## 2. Technology Stack

### Frontend
- **Framework:** React.js 19 + Vite 8
- **Styling:** Tailwind CSS v4 (Design system with `#2563EB` primary, `#0F172A` slate dark)
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios (Centralized interceptors with Bearer token injection)
- **Icons:** Lucide React

### Backend
- **Language:** Python 3.13+
- **Web Framework:** Flask 3.0.3
- **ORM & Database:** Flask-SQLAlchemy 3.1.1 + SQLite
- **Security & Tokens:** Werkzeug (PBKDF2 SHA-256 password hashing) + PyJWT (HS256)
- **CORS:** Flask-CORS

### Quality Assurance & Automated Testing
- **Test Runner:** Pytest 8.3
- **Browser Automation:** Selenium WebDriver 4.26
- **Target Browser:** Google Chrome (Chromium)
- **Reporting:** JUnit XML + Standalone HTML Test Execution Reports

---

## 3. System Requirements

- **Operating System:** Windows 10/11, macOS, or Linux
- **Python:** 3.10 to 3.13
- **Node.js:** v18.x or v20.x+ with npm
- **Web Browser:** Google Chrome (latest version for Selenium automated testing)

---

## 4. Project Folder Structure

```
MediBook/
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── hero.png
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAdmin.js
│   │   │   └── useAppointments.js
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BookAppointment.jsx
│   │   │   ├── BookingConfirmation.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MyAppointments.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── UserDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── instance/
│   │   └── medibook.db
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── appointments.py
│   │   └── auth.py
│   ├── app.py
│   ├── database.py
│   ├── models.py
│   └── requirements.txt
│
├── tests/
│   ├── conftest.py
│   ├── test_api_verification.py
│   ├── test_selenium_suite.py
│   └── README.md
│
├── reports/
│   ├── generate_report.py
│   ├── junit_report.xml
│   ├── report.html
│   └── README.md
│
└── README.md
```

---

## 5. Installation & Setup

### Backend Setup (Flask + SQLite)

1. Open PowerShell or Terminal and navigate to the `backend/` directory:
   ```powershell
   cd backend
   ```

2. Activate the Python virtual environment:
   ```powershell
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1

   # Linux/macOS:
   source venv/bin/activate
   ```

3. Install all required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup (React + Vite + Tailwind)

1. Open a second PowerShell or Terminal window and navigate to the `frontend/` directory:
   ```powershell
   cd frontend
   ```

2. Install Node.js packages:
   ```bash
   npm install
   ```

---

## 6. Database Initialization & Seeding

The SQLite database (`backend/instance/medibook.db`) initializes and self-seeds automatically on the first run of `app.py`.

It automatically seeds:
- 1 Administrator account
- 1 Sample Patient account
- 4 Sample historical & upcoming appointments across Cardiology, Dental Care, General Consultation, and Eye Care

To reset the database at any point during testing:
- Click **Reset Test DB** in the Admin Portal UI (`/admin`)
- Or execute `POST http://127.0.0.1:5000/api/admin/reset-db` with Admin Bearer Token.

---

## 7. Default Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **System Administrator** | `admin@medibook.com` | `AdminPassword123!` | Full Admin Portal (`/admin`), Status Management, DB Reset |
| **Test Patient** | `patient@medibook.com` | `Patient123!` | Patient Portal (`/dashboard`, `/book`, `/my-appointments`) |

---

## 8. Running the Application

### 1. Launch the Backend API Server
In the backend terminal (`backend/` directory with venv active):
```powershell
python app.py
```
- API starts at: **`http://127.0.0.1:5000`**
- Health check: `http://127.0.0.1:5000/api/health`

### 2. Launch the React Frontend Client
In the frontend terminal (`frontend/` directory):
```powershell
npm run dev
```
- Application opens at: **`http://localhost:5173`**

---

## 9. REST API Documentation

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new patient account | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | No |
| `GET` | `/api/auth/me` | Fetch active authenticated profile | Bearer Token |
| `POST` | `/api/auth/logout` | Invalidate client session token | No |

### Appointment Endpoints (`/api`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/categories` | Retrieve medical departments & doctors | No |
| `GET` | `/api/available-slots` | Fetch open & booked slots for doctor/date | No |
| `GET` | `/api/appointments` | List logged-in patient's appointments | Patient Bearer |
| `POST` | `/api/appointments` | Book new appointment (conflict check) | Patient Bearer |
| `GET` | `/api/appointments/<id>` | View single appointment details | Patient/Admin |
| `PUT` | `/api/appointments/<id>/cancel` | Cancel upcoming appointment & release slot | Patient/Admin |
| `GET` | `/api/user/dashboard-stats` | Real-time database metrics for patient | Patient Bearer |

### Admin Endpoints (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | High-level clinic statistics (counts) | Admin Bearer |
| `GET` | `/api/admin/appointments` | Filterable list of all patient bookings | Admin Bearer |
| `PUT` | `/api/admin/appointments/<id>/status` | Update status (pending/confirmed/cancelled/completed) | Admin Bearer |
| `POST` | `/api/admin/reset-db` | Reset and reseed baseline test database | Admin Bearer |

---

## 10. STQA Automated Testing Suite

All critical UI elements incorporate deterministic `data-testid` attributes to comply with automated testing guidelines:

### Executing the Pytest Verification Suite
From project root:
```powershell
backend\venv\Scripts\pytest.exe tests/test_api_verification.py -v --junitxml=reports/junit_report.xml
```

### Generating the Standalone HTML Report
```powershell
backend\venv\Scripts\python.exe reports/generate_report.py
```
Open `reports/report.html` in any browser to inspect test pass rates, execution times, and verification matrices.

### Executing Selenium WebDriver End-to-End Suite
Ensure backend (`http://127.0.0.1:5000`) and frontend (`http://localhost:5173`) are running, then execute:
```powershell
backend\venv\Scripts\pytest.exe tests/test_selenium_suite.py -v
```

---

## 11. Limitations & Future Enhancements

- **SMS/Email Gateway:** Currently simulated via UI notifications; real SMS dispatch via Twilio can be integrated.
- **Multi-Clinic Branches:** Current scope models a central clinic with 5 clinical departments. Multi-tenant multi-branch clinic routing can be expanded in subsequent versions.
- **Payment Processing:** Intentionally excluded per project specification constraint.

