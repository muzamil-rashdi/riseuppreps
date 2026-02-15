# RiseUp Preps Academy (RUPA) - Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Authentication & Authorization](#authentication--authorization)
9. [Frontend Architecture](#frontend-architecture)
10. [Backend Architecture](#backend-architecture)
11. [Docker Setup](#docker-setup)
12. [Common Tasks](#common-tasks)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

RiseUp Preps Academy is a non-profit student performance tracking platform designed to create a transparent bridge between sponsors/donors and the students they fund. The platform tracks academic performance (marks, attendance), financial expenditure, and provides rich dashboards for all stakeholders.

### Roles

| Role | Description |
|------|-------------|
| **ADMIN** | Full system control - manages users, subjects, finances, announcements, assignments |
| **SPONSOR** | Views assigned students' performance, marks, attendance, and financial records |
| **TEACHER** | Creates quizzes, enters marks, marks attendance for assigned subjects/students |
| **STUDENT** | Views own marks/attendance, manages profile, uploads documents, posts updates |

### Key Features

- **Invite-based registration** - Admin sends email invitations with role pre-assigned
- **Academic tracking** - Quiz/test marks entry by teachers, attendance tracking
- **Financial transparency** - Admin records all expenses per student, sponsors can view breakdowns
- **Sponsor-Student assignment** - Many-to-many relationships managed by admin
- **Messaging** - Sponsor <-> Admin messaging system
- **Announcements** - Admin broadcasts to all users
- **Notifications** - In-app notifications for marks, finance updates, announcements, messages
- **PDF Reports** - Student report cards, financial reports, admin summaries
- **File uploads** - Student documents, financial receipts, avatars
- **Dark mode** - Toggle between light and dark themes

---

## Technology Stack

### Backend
- **Runtime:** Node.js 20 (Alpine)
- **Framework:** Express.js 4
- **Language:** TypeScript 5.7
- **ORM:** Prisma 6.3 (with PostgreSQL)
- **Auth:** JSON Web Tokens (jsonwebtoken)
- **Validation:** Zod
- **Email:** Nodemailer (Gmail SMTP)
- **PDF Generation:** Puppeteer (with Chromium)
- **File Upload:** Multer
- **Security:** Helmet, CORS, express-rate-limit
- **Password Hashing:** bcryptjs

### Frontend
- **Framework:** React 19
- **Language:** TypeScript 5.7
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **State Management:** Zustand 5 (client state) + TanStack Query 5 (server state)
- **Routing:** React Router 7
- **Forms:** React Hook Form 7 + Zod validation
- **Charts:** Recharts 2
- **Animations:** Framer Motion 12
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Infrastructure
- **Database:** PostgreSQL 16 (Alpine)
- **Reverse Proxy:** Nginx (Alpine)
- **Containerization:** Docker + Docker Compose
- **Volumes:** PostgreSQL data, uploaded files, frontend dist

---

## Project Structure

```
rafay/
├── docker-compose.yml          # Docker orchestration (4 services)
├── .env                        # Environment variables (DO NOT COMMIT)
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore rules
├── PROJECT_DOCUMENTATION.md    # This file
│
├── backend/
│   ├── Dockerfile              # Backend container (Node.js + Chromium)
│   ├── package.json            # Dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration
│   ├── .eslintrc.js            # ESLint configuration
│   │
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (15 models, 4 enums)
│   │   ├── seed.ts             # Seeds default admin user
│   │   └── migrations/         # Auto-generated migration files
│   │
│   └── src/
│       ├── index.ts            # Server entry point (starts Express)
│       ├── app.ts              # Express app setup (middleware, routes, error handler)
│       │
│       ├── config/
│       │   ├── env.ts          # Environment variable validation (Zod)
│       │   ├── prisma.ts       # Prisma client singleton
│       │   └── email.ts        # Nodemailer transporter config
│       │
│       ├── middleware/
│       │   ├── auth.ts         # JWT verification middleware
│       │   ├── rbac.ts         # Role-based access control
│       │   ├── validate.ts     # Zod request validation middleware
│       │   ├── upload.ts       # Multer file upload configuration
│       │   ├── rateLimiter.ts  # Rate limiting (general + auth)
│       │   └── errorHandler.ts # Global error handler (AppError, Zod, Prisma)
│       │
│       ├── routes/
│       │   ├── index.ts        # Route aggregator + common routes
│       │   ├── auth.routes.ts
│       │   ├── admin.routes.ts
│       │   ├── teacher.routes.ts
│       │   ├── sponsor.routes.ts
│       │   ├── student.routes.ts
│       │   ├── message.routes.ts
│       │   ├── notification.routes.ts
│       │   └── report.routes.ts
│       │
│       ├── controllers/        # Request handlers (parse input, call service, send response)
│       │   ├── auth.controller.ts
│       │   ├── admin.controller.ts
│       │   ├── teacher.controller.ts
│       │   ├── sponsor.controller.ts
│       │   ├── student.controller.ts
│       │   ├── message.controller.ts
│       │   ├── notification.controller.ts
│       │   └── report.controller.ts
│       │
│       ├── services/           # Business logic layer
│       │   ├── auth.service.ts       # Login, register, refresh, password reset
│       │   ├── user.service.ts       # User CRUD, invitations, subjects, assignments
│       │   ├── quiz.service.ts       # Quiz/test CRUD
│       │   ├── marks.service.ts      # Marks entry + sponsor notifications
│       │   ├── attendance.service.ts # Attendance marking + records
│       │   ├── finance.service.ts    # Financial record CRUD + summaries
│       │   ├── message.service.ts    # Messaging between sponsor <-> admin
│       │   ├── notification.service.ts # In-app notifications
│       │   ├── email.service.ts      # Email sending (invite, marks, finance)
│       │   └── report.service.ts     # PDF generation (Puppeteer)
│       │
│       ├── validators/         # Zod schemas for request validation
│       │   ├── auth.validators.ts
│       │   ├── admin.validators.ts
│       │   ├── teacher.validators.ts
│       │   ├── student.validators.ts
│       │   └── message.validators.ts
│       │
│       ├── types/
│       │   └── index.ts        # Express type augmentation (req.user)
│       │
│       └── utils/
│           ├── jwt.ts          # Token generation/verification
│           ├── password.ts     # bcrypt hash/compare
│           ├── pagination.ts   # Pagination helpers
│           └── helpers.ts      # Response helpers (sendSuccess)
│
├── frontend/
│   ├── Dockerfile              # Multi-stage build (Node builder -> Nginx)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts          # Vite config with @ path alias
│   ├── tailwind.config.ts      # Tailwind CSS configuration
│   ├── postcss.config.js
│   ├── components.json         # shadcn/ui configuration
│   ├── index.html
│   │
│   └── src/
│       ├── main.tsx            # Entry point (React, Router, QueryClient, Toaster)
│       ├── App.tsx             # Root component with all routes
│       ├── index.css           # Tailwind imports + CSS variables
│       │
│       ├── api/                # API client layer
│       │   ├── client.ts       # Axios instance with auth interceptor + auto-refresh
│       │   ├── auth.api.ts     # Login, register, refresh, logout, forgot/reset password
│       │   ├── admin.api.ts    # All admin endpoints
│       │   ├── teacher.api.ts  # Teacher endpoints
│       │   ├── sponsor.api.ts  # Sponsor endpoints
│       │   ├── student.api.ts  # Student endpoints
│       │   ├── message.api.ts  # Messaging endpoints
│       │   ├── common.api.ts   # Shared endpoints (subjects, announcements, notifications)
│       │   └── report.api.ts   # PDF report downloads
│       │
│       ├── components/
│       │   ├── ui/             # shadcn/ui components (18 components)
│       │   │   ├── button.tsx, card.tsx, dialog.tsx, input.tsx, label.tsx
│       │   │   ├── select.tsx, textarea.tsx, badge.tsx, avatar.tsx
│       │   │   ├── tabs.tsx, tooltip.tsx, separator.tsx, scroll-area.tsx
│       │   │   ├── dropdown-menu.tsx, alert-dialog.tsx, popover.tsx
│       │   │   ├── toast.tsx, toaster.tsx, use-toast.ts
│       │   │   └── checkbox.tsx
│       │   │
│       │   ├── common/         # Reusable application components
│       │   │   ├── DataTable.tsx      # Generic data table with TanStack Table
│       │   │   ├── StatsCard.tsx      # Dashboard statistics card
│       │   │   ├── FileUpload.tsx     # File upload with drag & drop
│       │   │   ├── ConfirmDialog.tsx  # Confirmation modal
│       │   │   ├── EmptyState.tsx     # Empty state placeholder
│       │   │   ├── LoadingSpinner.tsx # Loading indicator
│       │   │   └── PageHeader.tsx     # Page title + description + action
│       │   │
│       │   ├── charts/         # Recharts-based visualization
│       │   │   ├── PerformanceChart.tsx  # Line chart for marks trend
│       │   │   ├── AttendanceChart.tsx   # Bar/pie chart for attendance
│       │   │   └── FinanceChart.tsx      # Bar chart for financial breakdown
│       │   │
│       │   └── layout/         # Dashboard layout components
│       │       ├── DashboardLayout.tsx   # Main layout with sidebar + header
│       │       ├── Sidebar.tsx           # Role-based navigation sidebar
│       │       └── Header.tsx            # Top bar with user info + theme toggle
│       │
│       ├── pages/
│       │   ├── Landing.tsx         # Public landing page (hero, stats, features)
│       │   ├── Login.tsx           # Login form
│       │   ├── Register.tsx        # Invite-based registration form
│       │   ├── ForgotPassword.tsx  # Password reset request
│       │   │
│       │   ├── admin/              # Admin-only pages
│       │   │   ├── Dashboard.tsx       # Stats, charts, recent activity
│       │   │   ├── Users.tsx           # User list + management
│       │   │   ├── Invitations.tsx     # Send invitations
│       │   │   ├── Assignments.tsx     # Sponsor-student assignments
│       │   │   ├── Subjects.tsx        # Subject CRUD
│       │   │   ├── Finance.tsx         # Financial records CRUD
│       │   │   ├── Announcements.tsx   # Create/manage announcements
│       │   │   ├── Messages.tsx        # Admin <-> Sponsor messaging
│       │   │   └── Reports.tsx         # PDF report generation
│       │   │
│       │   ├── teacher/            # Teacher-only pages
│       │   │   ├── Dashboard.tsx       # Overview + quick actions
│       │   │   ├── Quizzes.tsx         # Quiz/test CRUD
│       │   │   ├── MarksEntry.tsx      # Enter marks per student
│       │   │   ├── Attendance.tsx      # Mark attendance
│       │   │   └── Students.tsx        # View assigned students
│       │   │
│       │   ├── sponsor/            # Sponsor-only pages
│       │   │   ├── Dashboard.tsx       # Sponsored students overview
│       │   │   ├── Students.tsx        # Student list
│       │   │   ├── StudentDetail.tsx   # Detailed student view (marks, attendance, finance)
│       │   │   └── Messages.tsx        # Message admin
│       │   │
│       │   └── student/            # Student-only pages
│       │       ├── Dashboard.tsx       # Performance overview
│       │       ├── Profile.tsx         # Edit bio, goals, thank-you message
│       │       ├── Marks.tsx           # View own marks
│       │       ├── Attendance.tsx      # View own attendance
│       │       ├── Documents.tsx       # Upload/manage documents
│       │       ├── Achievements.tsx    # Track achievements
│       │       └── Updates.tsx         # Blog/journal posts
│       │
│       ├── hooks/
│       │   ├── useAuth.ts             # Auth utility hook
│       │   └── useNotifications.ts    # Notification polling hook
│       │
│       ├── store/
│       │   ├── authStore.ts           # Zustand auth state (persisted)
│       │   ├── themeStore.ts          # Theme state (light/dark)
│       │   └── sidebarStore.ts        # Sidebar collapse state
│       │
│       ├── lib/
│       │   └── utils.ts               # shadcn/ui utility (cn function)
│       │
│       ├── types/
│       │   └── index.ts               # All TypeScript interfaces
│       │
│       └── utils/
│           ├── constants.ts           # App-wide constants
│           └── formatters.ts          # Date, currency, percentage formatters
│
└── nginx/
    └── nginx.conf                     # Reverse proxy + static file config
```

---

## Getting Started

### Prerequisites
- Docker Desktop installed and running
- Git (for version control)

### Quick Start (Docker - Production)

```bash
# 1. Clone the repository
git clone <repository-url>
cd rafay

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your actual values (see Environment Variables section)

# 3. Build and start all services
docker compose up --build

# 4. Access the application
# Frontend: http://localhost
# Backend API: http://localhost/api
# Direct backend: http://localhost:4000/api
```

### Local Development (Without Docker)

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed     # Creates default admin user
npm run dev             # Starts on port 4000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev             # Starts on port 5173
```

### Default Admin Credentials
After seeding, login with:
- **Email:** Value of `ADMIN_EMAIL` in .env (default: `admin@riseuppreps.org`)
- **Password:** Value of `ADMIN_PASSWORD` in .env (default: `Admin@RiseUp2024!`)

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `rupa_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `secure_password_here` |
| `POSTGRES_DB` | Database name | `rupa_db` |
| `DATABASE_URL` | Full PostgreSQL connection string | Auto-constructed in Docker |
| `JWT_ACCESS_SECRET` | Secret for access tokens (64+ chars) | Random string |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (64+ chars) | Random string |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `NODE_ENV` | Environment mode | `production` or `development` |
| `PORT` | Backend port | `4000` |
| `BACKEND_URL` | Backend base URL | `http://localhost:4000` |
| `FRONTEND_URL` | Frontend base URL | `http://localhost` |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USER` | SMTP username/email | `your_email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | Gmail app password |
| `SMTP_FROM` | Sender display name | `"RiseUp Preps <email>"` |
| `ADMIN_EMAIL` | Default admin email | `admin@riseuppreps.org` |
| `ADMIN_PASSWORD` | Default admin password | `Admin@RiseUp2024!` |
| `ADMIN_FIRST_NAME` | Admin first name | `Admin` |
| `ADMIN_LAST_NAME` | Admin last name | `User` |
| `MAX_FILE_SIZE` | Max upload size in bytes | `10485760` (10MB) |
| `UPLOAD_DIR` | Upload directory path | `/app/uploads` (Docker) |

**Gmail SMTP Setup:** Generate an App Password at [Google Account > Security > App Passwords](https://myaccount.google.com/apppasswords). Use that as `SMTP_PASS`.

---

## Database Schema

### Models Overview

| Model | Description | Key Relations |
|-------|-------------|---------------|
| **User** | All platform users | Has role (ADMIN/SPONSOR/TEACHER/STUDENT) |
| **RefreshToken** | JWT refresh tokens | Belongs to User |
| **Invitation** | Email invitations | Created by User (admin) |
| **StudentProfile** | Extended student info | One-to-one with User |
| **SponsorStudent** | Sponsor-student mapping | Many-to-many (User <-> User) |
| **Subject** | Academic subjects | Created by admin |
| **TeacherSubject** | Teacher-subject mapping | Many-to-many |
| **Quiz** | Tests/quizzes | Belongs to Subject + Teacher |
| **Mark** | Student quiz scores | Belongs to Quiz + Student |
| **Attendance** | Daily attendance | Belongs to Student + Subject |
| **FinancialRecord** | Expense records | Belongs to Student, created by Admin |
| **Message** | Direct messages | Sender + Receiver (both Users) |
| **Announcement** | Broadcast messages | Created by Admin |
| **Notification** | In-app notifications | Belongs to User |
| **StudentDocument** | Uploaded files | Belongs to Student |
| **StudentAchievement** | Achievement records | Belongs to Student |
| **StudentUpdate** | Blog/journal posts | Belongs to Student |

### Enums

```
Role:             ADMIN | SPONSOR | TEACHER | STUDENT
AttendanceStatus: PRESENT | ABSENT | LATE
FinanceCategory:  FEES | BOOKS | UNIFORM | TRANSPORT | MEALS | OTHER
NotificationType: MARKS_POSTED | FINANCIAL_UPDATE | ANNOUNCEMENT | MESSAGE | SYSTEM
```

### Database Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (visual DB browser)
npx prisma studio

# Seed the database
npm run prisma:seed
```

---

## API Endpoints

All API endpoints are prefixed with `/api`.

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login with email + password | No |
| POST | `/auth/register/:token` | Register via invite link | No |
| POST | `/auth/refresh` | Refresh access token | Cookie |
| POST | `/auth/logout` | Logout (clear tokens) | Yes |
| POST | `/auth/forgot-password` | Request password reset email | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| GET | `/auth/me` | Get current user profile | Yes |

### Admin (`/api/admin`) - ADMIN only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Dashboard stats |
| GET | `/admin/users` | List users (filterable by `?role=`) |
| POST | `/admin/invitations` | Send invite email |
| GET | `/admin/invitations` | List all invitations |
| PUT | `/admin/users/:id` | Update user |
| DELETE | `/admin/users/:id` | Deactivate user |
| POST | `/admin/assignments` | Assign sponsor to student(s) |
| DELETE | `/admin/assignments/:id` | Remove assignment |
| GET | `/admin/assignments` | List all assignments |
| POST | `/admin/subjects` | Create subject |
| PUT | `/admin/subjects/:id` | Update subject |
| DELETE | `/admin/subjects/:id` | Deactivate subject |
| POST | `/admin/finance` | Create financial record |
| PUT | `/admin/finance/:id` | Update financial record |
| DELETE | `/admin/finance/:id` | Delete financial record |
| GET | `/admin/finance` | List records (`?studentId=`, `?category=`) |
| GET | `/admin/finance/summary` | Financial summary stats |
| GET | `/admin/finance/student/:id` | Student financial records |
| POST | `/admin/announcements` | Create announcement |
| PUT | `/admin/announcements/:id` | Update announcement |
| DELETE | `/admin/announcements/:id` | Delete announcement |
| POST | `/admin/teacher-subject` | Assign teacher to subject |
| DELETE | `/admin/teacher-subject` | Remove teacher-subject |

### Teacher (`/api/teacher`) - TEACHER only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/teacher/students` | List teacher's students |
| GET | `/teacher/subjects` | List assigned subjects |
| POST | `/teacher/quizzes` | Create quiz |
| PUT | `/teacher/quizzes/:id` | Update quiz |
| GET | `/teacher/quizzes` | List quizzes |
| POST | `/teacher/marks` | Enter student marks |
| PUT | `/teacher/marks/:id` | Update marks |
| POST | `/teacher/attendance` | Mark attendance |
| GET | `/teacher/attendance` | Get attendance records |

### Sponsor (`/api/sponsor`) - SPONSOR only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sponsor/dashboard` | Sponsor overview |
| GET | `/sponsor/students` | List sponsored students |
| GET | `/sponsor/students/:id` | Student detail + performance |
| GET | `/sponsor/students/:id/marks` | Student marks history |
| GET | `/sponsor/students/:id/attendance` | Student attendance |
| GET | `/sponsor/students/:id/finance` | Student financial breakdown |

### Student (`/api/student`) - STUDENT only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/profile` | Get own profile |
| PUT | `/student/profile` | Update profile |
| GET | `/student/marks` | Get own marks |
| GET | `/student/attendance` | Get own attendance |
| POST | `/student/documents` | Upload document |
| DELETE | `/student/documents/:id` | Delete document |
| POST | `/student/achievements` | Add achievement |
| PUT | `/student/achievements/:id` | Update achievement |
| DELETE | `/student/achievements/:id` | Delete achievement |
| POST | `/student/updates` | Create blog post |
| PUT | `/student/updates/:id` | Update blog post |
| DELETE | `/student/updates/:id` | Delete blog post |

### Messages (`/api/messages`) - ADMIN & SPONSOR

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages` | List conversations |
| GET | `/messages/:userId` | Messages with specific user |
| POST | `/messages` | Send message |
| PUT | `/messages/:id/read` | Mark as read |

### Common (All authenticated users)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | List all active subjects |
| GET | `/api/announcements` | List active announcements |
| GET | `/api/notifications` | Get user's notifications |
| PUT | `/api/notifications/:id/read` | Mark notification as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| GET | `/api/health` | Health check |

### Reports (`/api/reports`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reports/student/:id` | Student report card PDF | ADMIN, SPONSOR |
| GET | `/reports/finance/:studentId` | Financial report PDF | ADMIN, SPONSOR |
| GET | `/reports/admin/summary` | Admin summary PDF | ADMIN |

---

## Authentication & Authorization

### JWT Flow

1. **Login** (`POST /api/auth/login`)
   - Returns `accessToken` (in response body) + `refreshToken` (httpOnly cookie)
   - Access token expires in 15 minutes
   - Refresh token expires in 7 days

2. **API Requests**
   - Send access token in `Authorization: Bearer <token>` header
   - Frontend Axios interceptor handles this automatically

3. **Token Refresh** (`POST /api/auth/refresh`)
   - When access token expires (401 response), auto-refreshes using refresh cookie
   - Implements token rotation: old refresh token is deleted, new one issued
   - Axios interceptor handles this transparently

4. **Invite-based Registration**
   - Admin creates invitation -> email sent with invite link
   - Link contains JWT token with email + role encoded
   - User clicks link -> registration page with pre-filled email + role
   - User sets password -> account created -> redirect to login

### RBAC Middleware

Role-based access control is applied at the route level:

```typescript
// Example from admin.routes.ts
router.use(authenticate);               // Verify JWT
router.use(authorize('ADMIN'));          // Only ADMIN role allowed
```

The `authenticate` middleware extracts user info from JWT and attaches it to `req.user`:

```typescript
// Available in all authenticated routes
req.user.userId  // User UUID
req.user.role    // 'ADMIN' | 'SPONSOR' | 'TEACHER' | 'STUDENT'
req.user.email   // User email
```

---

## Frontend Architecture

### State Management

| Store | Library | Purpose |
|-------|---------|---------|
| `authStore.ts` | Zustand (persisted) | User session, tokens, login/logout |
| `themeStore.ts` | Zustand (persisted) | Light/dark theme preference |
| `sidebarStore.ts` | Zustand | Sidebar collapse state |

Server state (API data) is managed by **TanStack Query** in each page component.

### Routing

Routes are defined in `App.tsx` with role-based protection:

```
/                    -> Landing page (or redirect to dashboard if logged in)
/login               -> Login page
/register/:token     -> Invite registration
/forgot-password     -> Password reset

/admin/*             -> Admin pages (ADMIN only)
/teacher/*           -> Teacher pages (TEACHER only)
/sponsor/*           -> Sponsor pages (SPONSOR only)
/student/*           -> Student pages (STUDENT only)
```

The `ProtectedRoute` wrapper checks authentication and role before rendering.

### API Client

The Axios client (`api/client.ts`) includes:
- Base URL configuration
- Auto-attach Authorization header
- Automatic 401 -> refresh token -> retry mechanism
- On refresh failure -> redirect to login

### Adding a New Page

1. Create the page component in `frontend/src/pages/<role>/YourPage.tsx`
2. Add the route in `frontend/src/App.tsx` under the appropriate role section
3. Add a navigation link in `frontend/src/components/layout/Sidebar.tsx`
4. Add API functions in `frontend/src/api/<role>.api.ts`

### Adding a New UI Component (shadcn/ui)

shadcn/ui components live in `frontend/src/components/ui/`. To add more:

```bash
cd frontend
npx shadcn@latest add <component-name>
# Example: npx shadcn@latest add table
```

---

## Backend Architecture

### Request Flow

```
Client Request
  -> Nginx (port 80)
    -> /api/* proxied to Backend (port 4000)
      -> Express middleware chain:
         1. helmet (security headers)
         2. cors (cross-origin)
         3. body parsing (JSON + URL-encoded)
         4. cookie-parser
         5. rate limiter
         6. Router -> Route -> authenticate -> authorize -> Controller
         7. Controller calls Service (business logic)
         8. Service uses Prisma (database)
         9. Response sent back
      -> errorHandler (catches all errors)
```

### Adding a New Feature (Backend)

1. **Schema**: Add/modify models in `backend/prisma/schema.prisma`
2. **Migration**: Run `npx prisma migrate dev --name <name>`
3. **Validator**: Create Zod schema in `backend/src/validators/`
4. **Service**: Add business logic in `backend/src/services/`
5. **Controller**: Create request handler in `backend/src/controllers/`
6. **Routes**: Wire up in `backend/src/routes/`
7. **Register**: Import route in `backend/src/routes/index.ts`

### Error Handling

The global error handler (`middleware/errorHandler.ts`) catches:
- `AppError` - Custom application errors with status codes
- `ZodError` - Validation errors (returns field-level details)
- `PrismaClientKnownRequestError` - Database constraint violations
- Unhandled errors - Returns 500 with generic message in production

To throw errors in services:
```typescript
import { AppError } from '../middleware/errorHandler';
throw new AppError('User not found', 404);
throw new AppError('Insufficient permissions', 403);
```

### File Uploads

Files are handled by Multer middleware (`middleware/upload.ts`):
- **Allowed types**: JPEG, PNG, WebP, PDF, DOC, DOCX
- **Max size**: 10MB (configurable via `MAX_FILE_SIZE`)
- **Storage**: `/app/uploads/` in Docker (persistent volume)
- **Served by**: Nginx at `/uploads/*`

### Email Notifications

Emails are sent asynchronously (fire-and-forget with `.catch(console.error)`):
- **Invite email**: When admin creates an invitation
- **Marks notification**: When teacher enters marks (sent to sponsors)
- **Finance notification**: When admin adds financial record (sent to sponsors)
- **Password reset**: When user requests password reset

Configure Gmail SMTP in `.env` using an [App Password](https://myaccount.google.com/apppasswords).

---

## Docker Setup

### Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| `postgres` | rupa-postgres | 5432 | PostgreSQL database |
| `backend` | rupa-backend | 4000 | Node.js API server |
| `frontend` | rupa-frontend-builder | - | Builds React app, copies to shared volume |
| `nginx` | rupa-nginx | 80 | Reverse proxy + static file server |

### Volumes

| Volume | Purpose |
|--------|---------|
| `postgres_data` | Persistent database storage |
| `frontend_dist` | Built frontend files shared with Nginx |
| `uploads_data` | User-uploaded files shared between backend and Nginx |

### Docker Commands

```bash
# Build and start everything
docker compose up --build

# Start in background
docker compose up --build -d

# Stop all services
docker compose down

# Stop and remove volumes (CAUTION: deletes all data)
docker compose down -v

# View logs
docker compose logs -f              # All services
docker compose logs -f backend      # Backend only
docker compose logs -f postgres     # Database only

# Restart a single service
docker compose restart backend

# Execute command in running container
docker compose exec backend sh
docker compose exec postgres psql -U rupa_user -d rupa_db

# Rebuild a single service
docker compose up --build backend
```

### Backend Dockerfile Details

The backend Dockerfile:
1. Starts from `node:20-alpine`
2. Installs Chromium (for Puppeteer PDF generation)
3. Runs `npm install`
4. Runs `npx prisma generate` (generates Prisma client)
5. Runs `npm run build` (TypeScript compilation)
6. On startup: runs `prisma migrate deploy` then `prisma:seed` then `npm start`

### Frontend Dockerfile Details

The frontend Dockerfile uses multi-stage build:
1. **Stage 1 (builder)**: `node:20-alpine` - installs deps, runs `npm run build`
2. **Stage 2**: `nginx:alpine` - copies built files to `/usr/share/nginx/html`
3. In docker-compose, the built files are copied to a shared volume for the main Nginx service

---

## Common Tasks

### Adding a New User Role Feature

**Example: Add a "Reports" page for Teachers**

1. Create backend endpoint:
   ```
   backend/src/routes/teacher.routes.ts     -> Add route
   backend/src/controllers/teacher.controller.ts -> Add handler
   backend/src/services/report.service.ts   -> Add logic
   ```

2. Create frontend API function:
   ```
   frontend/src/api/teacher.api.ts          -> Add API call
   ```

3. Create frontend page:
   ```
   frontend/src/pages/teacher/Reports.tsx   -> New page component
   ```

4. Register route in `frontend/src/App.tsx`:
   ```tsx
   <Route path="reports" element={<TeacherReports />} />
   ```

5. Add sidebar link in `frontend/src/components/layout/Sidebar.tsx`

### Modifying the Database

1. Edit `backend/prisma/schema.prisma`
2. Run migration:
   ```bash
   cd backend
   npx prisma migrate dev --name describe_your_change
   ```
3. Update relevant services, controllers, validators
4. Update frontend types in `frontend/src/types/index.ts`

### Adding a New Finance Category

1. Add to the `FinanceCategory` enum in `backend/prisma/schema.prisma`:
   ```prisma
   enum FinanceCategory {
     FEES
     BOOKS
     UNIFORM
     TRANSPORT
     MEALS
     TUTORING    // <- New
     OTHER
   }
   ```
2. Run `npx prisma migrate dev --name add_tutoring_category`
3. Update the frontend select dropdowns in `pages/admin/Finance.tsx`

### Changing JWT Token Expiration

Edit the `.env` file:
```bash
JWT_ACCESS_EXPIRES_IN=30m    # Change from 15m to 30m
JWT_REFRESH_EXPIRES_IN=14d   # Change from 7d to 14 days
```
Restart the backend service: `docker compose restart backend`

---

## Troubleshooting

### Docker Build Fails

**"unable to get image... dockerDesktopLinuxEngine"**
- Ensure Docker Desktop is running
- Try restarting Docker Desktop
- On Windows, ensure WSL 2 backend is enabled

**npm install fails in Docker**
- Check internet connectivity
- Try `docker compose build --no-cache`

### Backend Won't Start

**"Prisma client not generated"**
```bash
docker compose exec backend npx prisma generate
docker compose restart backend
```

**"Migration failed"**
```bash
docker compose exec backend npx prisma migrate deploy
# Or reset (DELETES ALL DATA):
docker compose exec backend npx prisma migrate reset --force
```

### Frontend Build Errors

**TypeScript errors about unused variables**
- Already configured: `noUnusedLocals: false` in `tsconfig.json`

**Module not found errors**
- Check path aliases: `@/` maps to `./src/` (configured in `vite.config.ts` and `tsconfig.json`)

### Database Connection Issues

```bash
# Check if postgres is healthy
docker compose ps

# Connect directly to postgres
docker compose exec postgres psql -U rupa_user -d rupa_db

# Check database logs
docker compose logs postgres
```

### Email Not Sending

1. Verify Gmail SMTP credentials in `.env`
2. Ensure you're using a Gmail App Password (not your regular password)
3. Check backend logs: `docker compose logs -f backend`
4. Gmail may block "less secure apps" - use App Passwords instead

### Port Conflicts

If port 80 or 5432 is already in use:
```yaml
# In docker-compose.yml, change the left side of port mapping:
ports:
  - "8080:80"   # Use port 8080 instead of 80
  - "5433:5432" # Use port 5433 instead of 5432
```

---

## Key Files Quick Reference

| When you want to... | Edit this file |
|----------------------|----------------|
| Change database schema | `backend/prisma/schema.prisma` |
| Add backend API endpoint | `backend/src/routes/<role>.routes.ts` |
| Add business logic | `backend/src/services/<service>.ts` |
| Add validation rules | `backend/src/validators/<name>.validators.ts` |
| Add frontend page | `frontend/src/pages/<role>/Page.tsx` |
| Add frontend route | `frontend/src/App.tsx` |
| Add sidebar navigation | `frontend/src/components/layout/Sidebar.tsx` |
| Add API call from frontend | `frontend/src/api/<role>.api.ts` |
| Change TypeScript types | `frontend/src/types/index.ts` |
| Modify auth behavior | `backend/src/middleware/auth.ts` + `frontend/src/store/authStore.ts` |
| Change styling/theme | `frontend/src/index.css` + `frontend/tailwind.config.ts` |
| Modify Docker setup | `docker-compose.yml` + `backend/Dockerfile` |
| Change Nginx proxy rules | `nginx/nginx.conf` |
| Change environment config | `.env` + `backend/src/config/env.ts` |
