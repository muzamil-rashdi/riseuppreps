in RUPA document in this folder it is my project idea a rough idea you can say now make a perfect overall project idea out of it by asking me so many question and make a full proof idea that project you build for me frontend + backend 
i want dockerized backend which be built with just docker compose build up --build command for backend and other things like frontend i want in react i want completely fully functionolal integerated  project that you will build for me and also this is not a learning projct this go in production so use all the best practices and for doing a functionolity if you make a dicision dont go for quick fixes or quick implementation because i want perfect and best practices used project and also UI and the design hsould like one of the peach and out clagg so that if financer or a donnor sees my tool he should be flattered and he should get a vibe of professionalism so UI should as best as possible and for athetntication i want JWT token used now go eahd make a full proof plan and ask me duckemtn and make a document accordingly and then we'll move towards the implemnetation
Let me first find and read the RUPA document in your folder.

Globpattern: "**/*RUPA*"
Found 1 file
Globpattern: "**/*rupa*"
No files found
Globpattern: "**/*Rupa*"
No files found
Found RUPA.docx. Let me read it.

Read c:\Users\s\Desktop\rafay\RUPA.docx
The file is a .docx binary file. Let me extract the text content from it.

Bash Extract text from RUPA.docx
IN
python -c "
import zipfile
import xml.etree.ElementTree as ET

docx_path = r'c:\Users\s\Desktop\rafay\RUPA.docx'
with zipfile.ZipFile(docx_path, 'r') as z:
    xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    paragraphs = tree.findall('.//w:p', ns)
    for p in paragraphs:
        texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
        if texts:
            print(''.join(texts))
        else:
            print()
"

OUT
RiseUp Preps Academy

Project idea:I need a website, currently I am running a non profit coaching for needy studentsfor which I want an application by which donnor/sponsors can track down the performance of the students they are currently funding for.in which we will have 3 roles studentsponsor teacheradmin(only 1)sponsor will get to know the progress of the students they are paying forteacher will create the quizes and tests where he will list down the marks particular students got in that quizand student will be able to see only there own recordand admin can see the data overall like which sponsor is funding which students and all the tests records and history each and everything and can kick out any student or teacher of the organizationimportant quizes will not be taken or given on our website only just marks will be uploadedExcellent project idea! This has the potential to create a powerful, transparent connection between sponsors and students, which is crucial for a non-profit. Let's break down your request comprehensively.

### **1. Requirements (High-Level Summary)**

A web application with four user roles (Admin, Sponsor, Teacher, Student) to track student academic performance, funded by sponsors, with centralized oversight by an admin.

---

### **2. Feasibility Report**

*   **Technical Feasibility:** **HIGH.** This is a standard CRUD (Create, Read, Update, Delete) web application with role-based access control. The technologies you mentioned (Django, React, PostgreSQL) are perfectly suited for this task. No complex real-time features or advanced AI is required, keeping the technical complexity manageable.
*   **Operational Feasibility:** **MEDIUM to HIGH.** The success will depend on user adoption (Teachers consistently uploading marks, Sponsors actively logging in). A clean, intuitive UI/UX is critical. Training materials or simple guides for Teachers and Sponsors will be necessary.
*   **Economic Feasibility:** **HIGH (as a non-profit).** The long-term benefits of increased donor trust, transparency, and retention likely outweigh the initial development and ongoing hosting costs. It can be built in phases to manage costs.

---

### **3. Cost and Budget Analysis**

Costs can vary wildly based on who builds it (volunteer, agency, freelance developer) and where they are located.

*   **Development (Largest Cost):**
    *   **Freelancer/Dev Agency:** Could range from $5,000 to $25,000+ depending on features and polish.
    *   **In-house/Volunteer:** Significantly reduced cost, only time investment.
*   **Hosting & Infrastructure (Monthly/Annual):**
    *   **Backend/DB Hosting (e.g., AWS, DigitalOcean, Heroku):** $20 - $100/month.
    *   **Frontend Hosting (e.g., Vercel, Netlify):** $0 - $20/month (can be free for basic use).
    *   **Domain Name:** ~$10 - $15/year.
*   **Maintenance & Support (Ongoing):**
    *   Bug fixes, security updates, minor feature tweaks. Budget 10-20% of initial development cost per year.

**Recommendation:** Start with a **Minimum Viable Product (MVP)** to validate the idea with your users without a massive initial investment.

---

### **4. Technology Stack Recommendation**

Your proposed stack is **excellent** and industry-standard.

*   **Backend: Django & Django REST Framework (DRF)**
    *   **Why:** Django's "batteries-included" philosophy is perfect for this. It has built-in admin panels, robust security, and a clear structure. DRF makes creating a clean API for the React frontend straightforward.
*   **Frontend: React.js**
    *   **Why:** Creates a fast, dynamic, and modern user interface. Huge ecosystem of libraries. Allows for a clear separation between the frontend and backend.
*   **Database: PostgreSQL**
    *   **Why:** Powerful, open-source, and reliable. Handles complex relationships (like Sponsor->Student->Quiz) very well. The default choice for Django in production.
*   **Authentication: JWT (JSON Web Tokens)**
    *   **Why:** Secure and scalable for API-based authentication. Perfect for a React/Django REST setup.

**Verdict: Proceed with Django REST Framework + React + PostgreSQL. It's a solid choice.**

---

### **5. Plan and Architecture**

**High-Level Architecture:**
```
[React Frontend] <--(HTTP API Calls)--> [Django REST Framework API] <--(Database Queries)--> [PostgreSQL Database]
```

**Development Plan (Phased Approach):**

*   **Phase 1: MVP (Core Functionality)**
    *   Set up basic Django project with DRF and PostgreSQL.
    *   Implement User Authentication & Role-based Permissions (Admin, Teacher, Sponsor, Student).
    *   Admin Panel: Create and manage all users, assign students to sponsors.
    *   Teacher: Add students, create "Subjects" or "Courses", and input marks for quizzes/tests.
    *   Student & Sponsor: Basic dashboards to view the student's marks.
*   **Phase 2: Enhanced Features**
    *   Develop richer dashboards with charts/graphs for progress visualization (e.g., using Chart.js).
    *   Implement notification system (e.g., email to sponsor when new marks are uploaded).
    *   Add file uploads for teachers (e.g., uploading scanned report cards).
    *   Student profile pages with bio and goals.
*   **Phase 3: Polish & Scale**
    *   Improve UI/UX design.
    *   Add more advanced reporting for admins.
    *   Implement features like announcements, blogs, or sponsor testimonials.

---

### **6. Complete Functional and Non-Functional Requirements**

#### **Functional Requirements**

1.  **User Management (Admin)**
    *   Create, view, update, and deactivate (kick out) all user accounts (Students, Teachers, Sponsors).
    *   Assign one or more Students to a Sponsor.
    *   View a comprehensive overview of all relationships and data.

2.  **Dashboard (All Roles)**
    *   **Admin:** System overview (total users, recent activity, financial summary if integrated).
    *   **Sponsor:** List of sponsored students. Clicking a student shows their detailed performance (marks, progress charts).
    *   **Teacher:** List of their students. Interface to manage quizzes and input marks.
    *   **Student:** View their own marks and progress.

3.  **Academic Record Management (Teacher)**
    *   Create a "Quiz/Test" entry (Name, Date, Subject, Total Marks).
    *   Input marks for multiple students at once for a specific quiz.
    *   View and edit historical marks for their students.

4.  **Performance Tracking (Sponsor & Student)**
    *   View a list of all quizzes/tests for a student.
    *   See marks in a table and visualized in a graph (e.g., trend over time, subject-wise comparison).

5.  **Authentication & Authorization**
    *   Secure login/logout.
    *   System must enforce permissions based on role (e.g., a Student cannot see another student's data).

#### **Non-Functional Requirements**

1.  **Performance:** Pages should load in under 3 seconds. The dashboard should feel responsive.
2.  **Security:** **CRITICAL.** Data must be encrypted in transit (HTTPS) and at rest. Strong protection against SQL Injection and XSS (Django and React handle this well by default). Passwords must be hashed.
3.  **Usability:** The interface must be intuitive and easy to use for non-technical users (Sponsors and Teachers). It should be responsive and work well on desktop, tablet, and mobile.
4.  **Availability:** The website should have 99%+ uptime.
5.  **Scalability:** The architecture should allow for an increasing number of users and data without significant performance degradation.

---

### **7. Functionalities and Features**

**Core Features (MVP):**
*   Secure Login for all roles.
*   Admin Panel for full control.
*   Teacher's Marks Entry System.
*   Sponsor & Student Dashboards to view performance.

**Enhanced Features:**
*   **Visual Analytics:** Line charts, bar graphs for marks over time and by subject.
*   **Notifications:** Email alerts for sponsors (e.g., "A new quiz score has been posted for [Student Name]").
*   **Document Upload:** Teachers can upload supporting documents (scanned answer sheets, report cards).
*   **Student Profiles:** Students can write bio, future goals, and a "Thank You" message for their sponsor.
*   **Messaging System:** A secure, internal messaging system (e.g., Sponsor can message the Admin).
*   **Announcements:** Admin/Teachers can post announcements visible to all or specific users.
*   **Data Export:** Allow sponsors/admins to export student reports as PDFs.

---

### **8. Additional Suggestions & Questions**

**Suggestions:**
1.  **Privacy First:** Be transparent about what data is shared. Get consent from parents/guardians for students, especially if photos are used.
2.  **Gamification (Long-term):** Consider adding badges or certificates for student milestones to increase engagement.
3.  **Sponsor Onboarding:** Create a simple guide or video explaining how sponsors can use the portal. This is key to adoption.
4.  **Phased Rollout:** Don't build everything at once. Start with the MVP, get it into the hands of a few teachers and sponsors, and gather feedback.

**Questions for You:**
1.  **Scale:** How many users do you anticipate initially? (e.g., 10 sponsors, 50 students, 5 teachers). This affects hosting choices.
2.  **Data Import:** Do you have existing student/sponsor data in Excel/Sheets? If so, we need a plan to import it.
3.  **Financial Tracking:** Is the goal *only* for academic tracking, or do you also want sponsors to see a financial breakdown of how their funds are used (e.g., fees, books, uniform)?
4.  **Design:** Do you have an existing brand/logo/color scheme for "RiseUp Preps Academy" that should be used?
5.  **Deployment:** Who will be responsible for deploying and maintaining the website after it's built? Do you have technical support?

---

This provides a solid foundation for your "RiseUp Preps Academy" project. By following this phased and well-structured plan, you can build a tool that significantly enhances the impact and transparency of your non-profit.
I've read through your RUPA document for RiseUp Preps Academy. It's a solid foundation - a non-profit student performance tracking platform with 4 roles (Admin, Sponsor, Teacher, Student).

Before I build the full plan, I need to nail down several details. Let me start with the most critical questions:

AskUserQuestion
OUT
User has answered your questions: "What is your expected initial scale? (number of students, sponsors, teachers)"="Medium (50-200 students)", "Do you want financial tracking alongside academic tracking? (i.e., sponsors see how their funds are used - fees, books, uniform breakdown)"="both financial and academic full", "Do you have existing branding (logo, color scheme) for RiseUp Preps Academy?"="I'll provide later", "Which features do you want in the FIRST release (MVP)? Select all that apply."="Everything". You can now continue with the user's answers in mind.
Great - medium scale, full financial + academic tracking, all features in first release. Now let me dig deeper into specifics:

AskUserQuestion
OUT
User has answered your questions: "For the financial tracking: Who enters the financial data? And what kind of expenses are tracked?"="Admin enters all", "Can one sponsor fund multiple students, and can one student have multiple sponsors?"="Many-to-Many", "For email notifications - what email service do you plan to use or should I set up?"="Gmail SMTP", "How should the Teacher's marks entry work in detail?"="Manual per student". You can now continue with the user's answers in mind.
Got it. A few more important questions to finalize the scope:

AskUserQuestion
OUT
User has answered your questions: "For the messaging system - who can message whom?"="Sponsor <-> Admin only", "For the Student Profile - what information should students be able to fill in?"="Rich profile", "For the backend - the document mentions Django. Do you want Django (Python) or are you open to Node.js/Express as well?"="Your recommendation", "Do you need a public-facing landing page for the website (visible to non-logged-in visitors) to attract sponsors?"="Yes, full landing page". You can now continue with the user's answers in mind.
Excellent. A couple more critical questions and then I'll build the full plan:

AskUserQuestion
OUT
User has answered your questions: "Where do you plan to deploy this application in production?"="I don't know yet", "For file uploads (receipts, student documents, profile photos) - where should they be stored?"="Local server storage", "Should the admin be able to create/register ALL user accounts, or can sponsors/teachers self-register?"="Invite-based", "What subjects/courses are the students studying? Is there a fixed set or should teachers define them?"="Admin-defined". You can now continue with the user's answers in mind.
Great. A few final questions to tie up loose ends:

AskUserQuestion
OUT
User has answered your questions: "For PDF export - what reports should be exportable as PDF?"="All reports", "Should the system track student attendance, or only quiz/test marks?"="Marks + Attendance", "For announcements - who can create them and who sees them?"="Admin only -> Everyone", "Do you want a dark mode option in the UI, or a single polished light theme?"="Your recommendation". You can now continue with the user's answers in mind.
I now have a comprehensive understanding of your requirements. Let me design the full architecture and write the plan.

Update Todos

Gather all requirements from user via Q&A

Design architecture and write comprehensive plan

Review plan and get user approval
Write C:\Users\s\.claude\plans\wiggly-munching-kahn.md
743 lines
# RiseUp Preps Academy - Full Implementation Plan

## Context

**Problem:** RiseUp Preps Academy is a non-profit coaching organization for needy students. Currently, there is no system for sponsors/donors to track the academic performance and financial usage of the students they fund. This lack of transparency can reduce donor confidence and retention.

**Goal:** Build a production-grade, full-stack web application that creates a transparent bridge between sponsors and students. The platform tracks academic performance (marks, attendance), financial expenditure, and provides rich dashboards - all designed to impress financiers/donors with its professionalism.

**This is a production application, not a learning project.** Every decision prioritizes best practices, security, scalability, and polished UI.

---

## Technology Stack

### Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL
**Why Node.js over Django:**
- Full TypeScript across the entire stack = shared types, shared validation, one language for maintenance
- Prisma ORM provides type-safe database queries with auto-generated types
- Native JSON handling (no serialization overhead)
- Massive npm ecosystem for PDF generation, email, file handling
- Same developer skillset can maintain both frontend and backend

### Frontend: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
**Why this combination:**
- **Vite** - Fastest build tool, instant HMR
- **Tailwind CSS** - Utility-first CSS, consistent design system
- **shadcn/ui** - Beautiful, accessible, production-ready components (used by Vercel, linear, cal.com) - gives that premium polished look that impresses donors
- **Recharts** - Clean data visualization for performance charts
- **TanStack Query** - Server state management with caching
- **Zustand** - Lightweight client state management
- **React Router v6** - Client-side routing
- **React Hook Form + Zod** - Form handling with validation (Zod schemas shared with backend)

### Infrastructure
- **Docker Compose** - Backend + PostgreSQL + Nginx (single `docker compose up --build`)
- **JWT** - Access token (15min) + Refresh token (7 days) with httpOnly cookies
- **Gmail SMTP** via Nodemailer for email notifications
- **Local file storage** with Docker volume mount
- **Nginx** - Reverse proxy + static file serving

### UI Theme
- **Light-first with dark mode toggle** - Clean, airy light theme as default (best for donor impressions), with a dark mode option. Professional typography, generous whitespace, subtle micro-animations.

---

## Database Schema

### Core Tables

```
User
├── id (UUID, PK)
├── email (unique)
├── password_hash
├── first_name
├── last_name
├── role (ADMIN | SPONSOR | TEACHER | STUDENT)
├── phone
├── avatar_url
├── is_active (default true)
├── created_at
└── updated_at

Invitation
├── id (UUID, PK)
├── email
├── role
├── token (unique)
├── expires_at
├── invited_by (FK -> User)
├── used_at (nullable)
└── created_at

StudentProfile
├── id (UUID, PK)
├── user_id (FK -> User, unique)
├── grade
├── date_of_birth
├── address
├── bio
├── goals
├── thank_you_message
├── enrollment_date
└── updated_at

SponsorStudent (M2M)
├── id (UUID, PK)
├── sponsor_id (FK -> User)
├── student_id (FK -> User)
├── start_date
├── is_active (default true)
└── created_at
```

### Academic Tables

```
Subject
├── id (UUID, PK)
├── name
├── description
├── created_by (FK -> User, admin)
├── is_active
└── created_at

TeacherSubject (M2M)
├── id (UUID, PK)
├── teacher_id (FK -> User)
└── subject_id (FK -> Subject)

Quiz
├── id (UUID, PK)
├── name
├── subject_id (FK -> Subject)
├── teacher_id (FK -> User)
├── date
├── total_marks
├── description
└── created_at

Mark
├── id (UUID, PK)
├── quiz_id (FK -> Quiz)
├── student_id (FK -> User)
├── marks_obtained
├── remarks
└── created_at

Attendance
├── id (UUID, PK)
├── student_id (FK -> User)
├── subject_id (FK -> Subject)
├── date
├── status (PRESENT | ABSENT | LATE)
├── marked_by (FK -> User, teacher)
├── remarks
└── created_at
```

### Financial Tables

```
FinancialRecord
├── id (UUID, PK)
├── student_id (FK -> User)
├── category (FEES | BOOKS | UNIFORM | TRANSPORT | MEALS | OTHER)
├── amount (decimal)
├── description
├── date
├── receipt_url (nullable)
├── created_by (FK -> User, admin)
└── created_at
```

### Communication Tables

```
Message
├── id (UUID, PK)
├── sender_id (FK -> User)
├── receiver_id (FK -> User)
├── subject
├── body
├── is_read (default false)
├── created_at
└── updated_at

Announcement
├── id (UUID, PK)
├── title
├── body
├── created_by (FK -> User, admin)
├── is_active (default true)
└── created_at

Notification
├── id (UUID, PK)
├── user_id (FK -> User)
├── title
├── body
├── type (MARKS_POSTED | FINANCIAL_UPDATE | ANNOUNCEMENT | MESSAGE | SYSTEM)
├── is_read (default false)
├── link (nullable, for navigation)
└── created_at
```

### Student Content Tables

```
StudentDocument
├── id (UUID, PK)
├── student_id (FK -> User)
├── title
├── description
├── file_url
├── file_type
└── uploaded_at

StudentAchievement
├── id (UUID, PK)
├── student_id (FK -> User)
├── title
├── description
├── date
└── created_at

StudentUpdate (blog/journal)
├── id (UUID, PK)
├── student_id (FK -> User)
├── title
├── content
├── created_at
└── updated_at
```

---

## API Endpoints

### Auth
```
POST   /api/auth/login              - Login (returns JWT tokens)
POST   /api/auth/refresh             - Refresh access token
POST   /api/auth/logout              - Logout (clear refresh token)
POST   /api/auth/register/:token     - Register via invite link
POST   /api/auth/forgot-password     - Send password reset email
POST   /api/auth/reset-password      - Reset password with token
GET    /api/auth/me                  - Get current user profile
```

### Admin - User Management
```
GET    /api/admin/users              - List all users (filterable by role)
POST   /api/admin/invitations        - Send invite (email + role)
DELETE /api/admin/users/:id          - Deactivate user (kick out)
PUT    /api/admin/users/:id          - Update user details
GET    /api/admin/dashboard          - Admin overview stats
```

### Admin - Sponsor-Student Assignments
```
POST   /api/admin/assignments        - Assign student(s) to sponsor
DELETE /api/admin/assignments/:id    - Remove assignment
GET    /api/admin/assignments        - List all assignments
```

### Admin - Subjects
```
POST   /api/admin/subjects           - Create subject
PUT    /api/admin/subjects/:id       - Update subject
DELETE /api/admin/subjects/:id       - Deactivate subject
GET    /api/subjects                 - List all subjects (all roles)
```

### Admin - Financial Records
```
POST   /api/admin/finance            - Create financial record
PUT    /api/admin/finance/:id        - Update record
DELETE /api/admin/finance/:id        - Delete record
GET    /api/admin/finance            - List all records (filterable)
GET    /api/admin/finance/student/:id - Records for specific student
GET    /api/admin/finance/summary    - Financial summary/stats
```

### Admin - Announcements
```
POST   /api/admin/announcements      - Create announcement
PUT    /api/admin/announcements/:id  - Update announcement
DELETE /api/admin/announcements/:id  - Delete announcement
```

### Teacher
```
GET    /api/teacher/students         - List teacher's students
GET    /api/teacher/subjects         - List teacher's assigned subjects
POST   /api/teacher/quizzes          - Create quiz/test
PUT    /api/teacher/quizzes/:id      - Update quiz
GET    /api/teacher/quizzes          - List teacher's quizzes
POST   /api/teacher/marks            - Enter marks for a student
PUT    /api/teacher/marks/:id        - Update marks
POST   /api/teacher/attendance       - Mark attendance
GET    /api/teacher/attendance       - Get attendance records
```

### Sponsor
```
GET    /api/sponsor/students         - List sponsored students
GET    /api/sponsor/students/:id     - Student detail + performance
GET    /api/sponsor/students/:id/marks     - Student marks history
GET    /api/sponsor/students/:id/attendance - Student attendance
GET    /api/sponsor/students/:id/finance   - Financial breakdown
GET    /api/sponsor/dashboard        - Sponsor overview
```

### Student
```
GET    /api/student/profile          - Get own profile
PUT    /api/student/profile          - Update profile (bio, goals, etc.)
GET    /api/student/marks            - Get own marks
GET    /api/student/attendance       - Get own attendance
POST   /api/student/documents        - Upload document
DELETE /api/student/documents/:id    - Delete own document
POST   /api/student/achievements     - Add achievement
PUT    /api/student/achievements/:id - Update achievement
DELETE /api/student/achievements/:id - Delete achievement
POST   /api/student/updates          - Create blog/update post
PUT    /api/student/updates/:id      - Edit update
DELETE /api/student/updates/:id      - Delete update
```

### Messages (Sponsor <-> Admin only)
```
GET    /api/messages                 - List conversations
GET    /api/messages/:userId         - Get messages with specific user
POST   /api/messages                 - Send message
PUT    /api/messages/:id/read        - Mark as read
```

### Common
```
GET    /api/announcements            - List active announcements
GET    /api/notifications            - Get user's notifications
PUT    /api/notifications/:id/read   - Mark notification as read
PUT    /api/notifications/read-all   - Mark all as read
```

### Reports (PDF)
```
GET    /api/reports/student/:id      - Student report card PDF
GET    /api/reports/finance/:studentId - Financial report PDF
GET    /api/reports/admin/summary    - Admin summary report PDF
```

---

## Project Structure

```
rafay/
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts              (seed admin user + sample data)
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts             (app entry point)
│   │   ├── app.ts               (Express app setup)
│   │   ├── config/
│   │   │   ├── env.ts           (environment validation with Zod)
│   │   │   ├── prisma.ts        (Prisma client singleton)
│   │   │   └── email.ts         (Nodemailer config)
│   │   ├── middleware/
│   │   │   ├── auth.ts          (JWT verification)
│   │   │   ├── rbac.ts          (role-based access control)
│   │   │   ├── validate.ts      (Zod request validation)
│   │   │   ├── upload.ts        (Multer file upload)
│   │   │   ├── rateLimiter.ts   (rate limiting)
│   │   │   └── errorHandler.ts  (global error handler)
│   │   ├── routes/
│   │   │   ├── index.ts         (route aggregator)
│   │   │   ├── auth.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   ├── teacher.routes.ts
│   │   │   ├── sponsor.routes.ts
│   │   │   ├── student.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── report.routes.ts
│   │   ├── controllers/
│   │   │   └── ... (matching routes)
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── quiz.service.ts
│   │   │   ├── marks.service.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── finance.service.ts
│   │   │   ├── message.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── email.service.ts
│   │   │   └── report.service.ts (PDF generation)
│   │   ├── validators/
│   │   │   └── ... (Zod schemas per domain)
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── jwt.ts
│   │       ├── password.ts      (bcrypt hashing)
│   │       ├── pagination.ts
│   │       └── helpers.ts
│   └── uploads/                  (Docker volume mount)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   │   └── assets/              (static images, favicon)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   │   ├── client.ts        (Axios instance with interceptors)
│   │   │   ├── auth.api.ts
│   │   │   ├── admin.api.ts
│   │   │   ├── teacher.api.ts
│   │   │   ├── sponsor.api.ts
│   │   │   ├── student.api.ts
│   │   │   ├── message.api.ts
│   │   │   └── report.api.ts
│   │   ├── components/
│   │   │   ├── ui/              (shadcn/ui components)
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── charts/
│   │   │   │   ├── PerformanceChart.tsx
│   │   │   │   ├── AttendanceChart.tsx
│   │   │   │   └── FinanceChart.tsx
│   │   │   ├── common/
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   └── EmptyState.tsx
│   │   │   └── forms/
│   │   │       ├── LoginForm.tsx
│   │   │       ├── MarksEntryForm.tsx
│   │   │       ├── QuizForm.tsx
│   │   │       └── FinanceForm.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Users.tsx
│   │   │   │   ├── Invitations.tsx
│   │   │   │   ├── Assignments.tsx
│   │   │   │   ├── Subjects.tsx
│   │   │   │   ├── Finance.tsx
│   │   │   │   ├── Announcements.tsx
│   │   │   │   ├── Reports.tsx
│   │   │   │   └── Messages.tsx
│   │   │   ├── teacher/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Quizzes.tsx
│   │   │   │   ├── MarksEntry.tsx
│   │   │   │   ├── Attendance.tsx
│   │   │   │   └── Students.tsx
│   │   │   ├── sponsor/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Students.tsx
│   │   │   │   ├── StudentDetail.tsx
│   │   │   │   └── Messages.tsx
│   │   │   └── student/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Profile.tsx
│   │   │       ├── Marks.tsx
│   │   │       ├── Attendance.tsx
│   │   │       ├── Documents.tsx
│   │   │       ├── Achievements.tsx
│   │   │       └── Updates.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useTheme.ts
│   │   │   └── useNotifications.ts
│   │   ├── store/
│   │   │   ├── authStore.ts     (Zustand)
│   │   │   └── themeStore.ts
│   │   ├── lib/
│   │   │   └── utils.ts         (shadcn/ui utility)
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── formatters.ts
│   │       └── constants.ts
│   └── components.json          (shadcn/ui config)
│
└── nginx/
    └── nginx.conf               (reverse proxy config)
```

---

## Docker Architecture

```yaml
# docker-compose.yml services:
services:
  postgres:
    image: postgres:16-alpine
    volumes: postgres_data:/var/lib/postgresql/data
    environment: from .env
    healthcheck: pg_isready

  backend:
    build: ./backend
    depends_on: postgres (healthy)
    volumes: ./backend/uploads:/app/uploads
    environment: from .env
    command: runs migrations then starts server

  nginx:
    image: nginx:alpine
    ports: 80:80
    depends_on: backend
    volumes: ./nginx/nginx.conf, ./frontend/dist
```

**Single command to run:** `docker compose up --build`

The frontend is built separately (`npm run build` in frontend/) and served as static files by Nginx. Nginx proxies `/api/*` requests to the backend container.

---

## Key Implementation Details

### Authentication Flow
1. Admin sends invite via email → invite link with JWT token
2. User clicks link → registration page with pre-filled email + role
3. User sets password → account created → redirect to login
4. Login → server returns access token (15min, in memory) + refresh token (7 days, httpOnly cookie)
5. Access token sent in Authorization header for all API calls
6. On 401 → auto-refresh using refresh token → retry request
7. Refresh token rotation on each refresh (old token invalidated)

### Role-Based Access Control (RBAC)
- Middleware checks JWT → extracts role → validates against allowed roles for each route
- Fine-grained: Teachers can only see/modify their own students' marks
- Sponsors can only see data for students assigned to them
- Students can only see their own data

### Email Notifications (Gmail SMTP)
Triggered on:
- New marks posted → notify sponsor(s) of that student
- Financial record added → notify sponsor(s)
- New announcement → notify all users
- New message → notify recipient
- Invite sent → invite email with registration link

### PDF Generation (using `puppeteer` or `@react-pdf/renderer` server-side)
- Student Report Card: grades, marks trend, attendance summary
- Financial Report: expense breakdown per student with charts
- Admin Summary: overall stats, all students, all sponsors

### File Upload
- Multer middleware handles multipart uploads
- Files stored in `./backend/uploads/` (Docker volume)
- Served via Nginx static file serving at `/uploads/*`
- File size limit: 10MB
- Allowed types: images (jpg, png, webp), documents (pdf, doc, docx)

---

## Frontend Pages & UI Design

### Landing Page (Public)
- Hero section with mission statement and call-to-action
- Impact stats (students helped, sponsors, success stories) - animated counters
- "How It Works" section (3-step process for sponsors)
- Testimonials section
- "Become a Sponsor" CTA with contact info
- Footer with organization details

### Login / Register Pages
- Clean, centered card design
- Social proof elements (trusted by X sponsors)

### Dashboard Layouts (Per Role)

**Admin Dashboard:**
- Stats cards: Total Students, Sponsors, Teachers, Active Assignments
- Recent activity feed
- Quick actions: Invite User, Create Subject, Post Announcement
- Charts: Student enrollment over time, Financial overview

**Sponsor Dashboard:**
- "Your Sponsored Students" cards with photos, names, grade
- Performance summary per student (mini chart)
- Recent marks/updates notifications
- Quick message to admin

**Teacher Dashboard:**
- "Your Students" list
- Recent quizzes created
- Quick action: Create Quiz, Enter Marks, Mark Attendance
- Pending marks entry alerts

**Student Dashboard:**
- Performance overview chart
- Recent marks table
- Attendance summary (calendar heat map)
- Quick links to profile, documents, achievements

---

## Implementation Order

### Phase 1: Project Setup & Infrastructure
1. Initialize monorepo structure
2. Set up backend: Express + TypeScript + Prisma
3. Set up frontend: Vite + React + TypeScript + Tailwind + shadcn/ui
4. Configure Docker Compose (PostgreSQL + Backend + Nginx)
5. Set up environment variables (.env)
6. Configure ESLint + Prettier for both projects

### Phase 2: Authentication & Core Backend
7. Prisma schema for all tables + initial migration
8. JWT auth middleware (access + refresh tokens)
9. Auth routes (login, register, refresh, logout, forgot/reset password)
10. RBAC middleware
11. Admin routes: user management, invitations
12. Seed script (create default admin user)

### Phase 3: Academic Module
13. Subjects CRUD (admin)
14. Teacher-Subject assignment
15. Quiz/Test CRUD (teacher)
16. Marks entry (teacher, per student)
17. Attendance marking (teacher)
18. Student marks/attendance views

### Phase 4: Financial Module
19. Financial records CRUD (admin)
20. Financial summary/stats endpoints
21. Sponsor financial view endpoints

### Phase 5: Communication Module
22. Messages (sponsor <-> admin)
23. Announcements (admin → all)
24. Notifications system + email triggers

### Phase 6: Student Content Module
25. Student profile (bio, goals, thank you)
26. Document upload
27. Achievements CRUD
28. Student updates/blog posts

### Phase 7: Reports & PDF
29. Student report card PDF
30. Financial report PDF
31. Admin summary report PDF

### Phase 8: Frontend - Foundation
32. Project setup with routing, auth store, API client
33. Landing page
34. Login / Register / Forgot Password pages
35. Dashboard layout (sidebar, header, theme toggle)
36. Protected route wrappers per role

### Phase 9: Frontend - Admin Pages
37. Admin Dashboard with stats + charts
38. User Management page (list, invite, deactivate)
39. Sponsor-Student Assignments page
40. Subjects Management page
41. Financial Records page
42. Announcements page
43. Messages page (inbox style)

### Phase 10: Frontend - Teacher Pages
44. Teacher Dashboard
45. Quiz management (create, list, edit)
46. Marks entry form (select quiz → select student → enter marks)
47. Attendance marking (date picker → student list → mark status)

### Phase 11: Frontend - Sponsor Pages
48. Sponsor Dashboard (student cards with mini charts)
49. Student Detail page (marks, attendance, finance, profile)
50. Performance charts (line, bar, pie)
51. Messages page

### Phase 12: Frontend - Student Pages
52. Student Dashboard
53. Profile editor (bio, goals, thank you message, avatar)
54. Marks & Attendance views
55. Documents upload/management
56. Achievements management
57. Blog/Updates editor

### Phase 13: Polish & Production
58. Dark mode implementation
59. Loading states, error boundaries, empty states
60. Responsive design audit (mobile, tablet, desktop)
61. Security audit (CORS, rate limiting, input sanitization, HTTPS headers)
62. Performance optimization (lazy loading, code splitting)
63. Final Docker Compose configuration + production Nginx config

---

## Verification Plan

### Backend Testing
- Seed the database and verify admin can log in
- Test invite flow: send invite → register → login
- Test RBAC: verify each role can only access their endpoints
- Test marks entry workflow end-to-end
- Test financial record CRUD
- Test message flow between sponsor and admin
- Test PDF generation for all report types

### Frontend Testing
- Verify landing page renders correctly
- Test complete auth flow (invite → register → login → dashboard)
- Verify each role sees only their dashboard and data
- Test marks entry form as teacher
- Verify sponsor can see student performance charts
- Test file upload (student documents, receipts)
- Test dark mode toggle
- Test responsive layouts on mobile viewport

### Integration Testing
- `docker compose up --build` starts all services correctly
- Frontend communicates with backend through Nginx proxy
- File uploads persist in Docker volume
- Email notifications are sent via Gmail SMTP
- PDF downloads work for all report types

### Key Files to Create/Modify
- `docker-compose.yml` - Docker orchestration
- `backend/Dockerfile` - Backend container
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/index.ts` - Server entry point
- `backend/src/middleware/auth.ts` - JWT middleware
- `backend/src/middleware/rbac.ts` - Role-based access
- `frontend/src/App.tsx` - Root component with routing
- `frontend/src/pages/Landing.tsx` - Public landing page
- `nginx/nginx.conf` - Reverse proxy configuration
- `.env.example` - Environment variable template
Update Todos

Gather all requirements from user via Q&A

Design architecture and write comprehensive plan

Review plan and get user approval
The comprehensive plan is written. Here's a summary of what I've designed:

RiseUp Preps Academy - A production-grade full-stack platform with:

Tech Stack:

Backend: Node.js + Express + TypeScript + Prisma ORM + PostgreSQL (recommended over Django for full-stack TypeScript consistency, shared types/validation, and easier long-term maintenance)
Frontend: React + TypeScript + Vite + Tailwind CSS + shadcn/ui (premium component library used by Vercel, Linear, Cal.com)
Infrastructure: Docker Compose (single docker compose up --build), Nginx reverse proxy, JWT auth with refresh tokens, Gmail SMTP
Key Features (all in v1):

4 roles: Admin, Sponsor, Teacher, Student
Full academic tracking (marks + attendance)
Full financial tracking (admin enters, sponsors view breakdown)
Many-to-many sponsor-student assignments
Invite-based registration
Rich student profiles (bio, goals, documents, achievements, blog posts)
Sponsor <-> Admin messaging
Admin announcements
Email notifications on key events
PDF export for all reports
Professional landing page
Light theme + dark mode toggle
Charts/visualizations (Recharts)
13-phase implementation covering ~63 deliverables, from infrastructure setup through final production polish.

The full plan with database schema, all API endpoints, project structure, and verification steps is in the plan file. Please review it:

Claude’s Plan
RiseUp Preps Academy - Full Implementation Plan
Context
Problem: RiseUp Preps Academy is a non-profit coaching organization for needy students. Currently, there is no system for sponsors/donors to track the academic performance and financial usage of the students they fund. This lack of transparency can reduce donor confidence and retention.

Goal: Build a production-grade, full-stack web application that creates a transparent bridge between sponsors and students. The platform tracks academic performance (marks, attendance), financial expenditure, and provides rich dashboards - all designed to impress financiers/donors with its professionalism.

This is a production application, not a learning project. Every decision prioritizes best practices, security, scalability, and polished UI.

Technology Stack
Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL
Why Node.js over Django:

Full TypeScript across the entire stack = shared types, shared validation, one language for maintenance
Prisma ORM provides type-safe database queries with auto-generated types
Native JSON handling (no serialization overhead)
Massive npm ecosystem for PDF generation, email, file handling
Same developer skillset can maintain both frontend and backend
Frontend: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
Why this combination:

Vite - Fastest build tool, instant HMR
Tailwind CSS - Utility-first CSS, consistent design system
shadcn/ui - Beautiful, accessible, production-ready components (used by Vercel, linear, cal.com) - gives that premium polished look that impresses donors
Recharts - Clean data visualization for performance charts
TanStack Query - Server state management with caching
Zustand - Lightweight client state management
React Router v6 - Client-side routing
React Hook Form + Zod - Form handling with validation (Zod schemas shared with backend)
Infrastructure
Docker Compose - Backend + PostgreSQL + Nginx (single docker compose up --build)
JWT - Access token (15min) + Refresh token (7 days) with httpOnly cookies
Gmail SMTP via Nodemailer for email notifications
Local file storage with Docker volume mount
Nginx - Reverse proxy + static file serving
UI Theme
Light-first with dark mode toggle - Clean, airy light theme as default (best for donor impressions), with a dark mode option. Professional typography, generous whitespace, subtle micro-animations.
Database Schema
Core Tables

User
├── id (UUID, PK)
├── email (unique)
├── password_hash
├── first_name
├── last_name
├── role (ADMIN | SPONSOR | TEACHER | STUDENT)
├── phone
├── avatar_url
├── is_active (default true)
├── created_at
└── updated_at

Invitation
├── id (UUID, PK)
├── email
├── role
├── token (unique)
├── expires_at
├── invited_by (FK -> User)
├── used_at (nullable)
└── created_at

StudentProfile
├── id (UUID, PK)
├── user_id (FK -> User, unique)
├── grade
├── date_of_birth
├── address
├── bio
├── goals
├── thank_you_message
├── enrollment_date
└── updated_at

SponsorStudent (M2M)
├── id (UUID, PK)
├── sponsor_id (FK -> User)
├── student_id (FK -> User)
├── start_date
├── is_active (default true)
└── created_at
Academic Tables

Subject
├── id (UUID, PK)
├── name
├── description
├── created_by (FK -> User, admin)
├── is_active
└── created_at

TeacherSubject (M2M)
├── id (UUID, PK)
├── teacher_id (FK -> User)
└── subject_id (FK -> Subject)

Quiz
├── id (UUID, PK)
├── name
├── subject_id (FK -> Subject)
├── teacher_id (FK -> User)
├── date
├── total_marks
├── description
└── created_at

Mark
├── id (UUID, PK)
├── quiz_id (FK -> Quiz)
├── student_id (FK -> User)
├── marks_obtained
├── remarks
└── created_at

Attendance
├── id (UUID, PK)
├── student_id (FK -> User)
├── subject_id (FK -> Subject)
├── date
├── status (PRESENT | ABSENT | LATE)
├── marked_by (FK -> User, teacher)
├── remarks
└── created_at
Financial Tables

FinancialRecord
├── id (UUID, PK)
├── student_id (FK -> User)
├── category (FEES | BOOKS | UNIFORM | TRANSPORT | MEALS | OTHER)
├── amount (decimal)
├── description
├── date
├── receipt_url (nullable)
├── created_by (FK -> User, admin)
└── created_at
Communication Tables

Message
├── id (UUID, PK)
├── sender_id (FK -> User)
├── receiver_id (FK -> User)
├── subject
├── body
├── is_read (default false)
├── created_at
└── updated_at

Announcement
├── id (UUID, PK)
├── title
├── body
├── created_by (FK -> User, admin)
├── is_active (default true)
└── created_at

Notification
├── id (UUID, PK)
├── user_id (FK -> User)
├── title
├── body
├── type (MARKS_POSTED | FINANCIAL_UPDATE | ANNOUNCEMENT | MESSAGE | SYSTEM)
├── is_read (default false)
├── link (nullable, for navigation)
└── created_at
Student Content Tables

StudentDocument
├── id (UUID, PK)
├── student_id (FK -> User)
├── title
├── description
├── file_url
├── file_type
└── uploaded_at

StudentAchievement
├── id (UUID, PK)
├── student_id (FK -> User)
├── title
├── description
├── date
└── created_at

StudentUpdate (blog/journal)
├── id (UUID, PK)
├── student_id (FK -> User)
├── title
├── content
├── created_at
└── updated_at
API Endpoints
Auth

POST   /api/auth/login              - Login (returns JWT tokens)
POST   /api/auth/refresh             - Refresh access token
POST   /api/auth/logout              - Logout (clear refresh token)
POST   /api/auth/register/:token     - Register via invite link
POST   /api/auth/forgot-password     - Send password reset email
POST   /api/auth/reset-password      - Reset password with token
GET    /api/auth/me                  - Get current user profile
Admin - User Management

GET    /api/admin/users              - List all users (filterable by role)
POST   /api/admin/invitations        - Send invite (email + role)
DELETE /api/admin/users/:id          - Deactivate user (kick out)
PUT    /api/admin/users/:id          - Update user details
GET    /api/admin/dashboard          - Admin overview stats
Admin - Sponsor-Student Assignments

POST   /api/admin/assignments        - Assign student(s) to sponsor
DELETE /api/admin/assignments/:id    - Remove assignment
GET    /api/admin/assignments        - List all assignments
Admin - Subjects

POST   /api/admin/subjects           - Create subject
PUT    /api/admin/subjects/:id       - Update subject
DELETE /api/admin/subjects/:id       - Deactivate subject
GET    /api/subjects                 - List all subjects (all roles)
Admin - Financial Records

POST   /api/admin/finance            - Create financial record
PUT    /api/admin/finance/:id        - Update record
DELETE /api/admin/finance/:id        - Delete record
GET    /api/admin/finance            - List all records (filterable)
GET    /api/admin/finance/student/:id - Records for specific student
GET    /api/admin/finance/summary    - Financial summary/stats
Admin - Announcements

POST   /api/admin/announcements      - Create announcement
PUT    /api/admin/announcements/:id  - Update announcement
DELETE /api/admin/announcements/:id  - Delete announcement
Teacher

GET    /api/teacher/students         - List teacher's students
GET    /api/teacher/subjects         - List teacher's assigned subjects
POST   /api/teacher/quizzes          - Create quiz/test
PUT    /api/teacher/quizzes/:id      - Update quiz
GET    /api/teacher/quizzes          - List teacher's quizzes
POST   /api/teacher/marks            - Enter marks for a student
PUT    /api/teacher/marks/:id        - Update marks
POST   /api/teacher/attendance       - Mark attendance
GET    /api/teacher/attendance       - Get attendance records
Sponsor

GET    /api/sponsor/students         - List sponsored students
GET    /api/sponsor/students/:id     - Student detail + performance
GET    /api/sponsor/students/:id/marks     - Student marks history
GET    /api/sponsor/students/:id/attendance - Student attendance
GET    /api/sponsor/students/:id/finance   - Financial breakdown
GET    /api/sponsor/dashboard        - Sponsor overview
Student

GET    /api/student/profile          - Get own profile
PUT    /api/student/profile          - Update profile (bio, goals, etc.)
GET    /api/student/marks            - Get own marks
GET    /api/student/attendance       - Get own attendance
POST   /api/student/documents        - Upload document
DELETE /api/student/documents/:id    - Delete own document
POST   /api/student/achievements     - Add achievement
PUT    /api/student/achievements/:id - Update achievement
DELETE /api/student/achievements/:id - Delete achievement
POST   /api/student/updates          - Create blog/update post
PUT    /api/student/updates/:id      - Edit update
DELETE /api/student/updates/:id      - Delete update
Messages (Sponsor <-> Admin only)

GET    /api/messages                 - List conversations
GET    /api/messages/:userId         - Get messages with specific user
POST   /api/messages                 - Send message
PUT    /api/messages/:id/read        - Mark as read
Common

GET    /api/announcements            - List active announcements
GET    /api/notifications            - Get user's notifications
PUT    /api/notifications/:id/read   - Mark notification as read
PUT    /api/notifications/read-all   - Mark all as read
Reports (PDF)

GET    /api/reports/student/:id      - Student report card PDF
GET    /api/reports/finance/:studentId - Financial report PDF
GET    /api/reports/admin/summary    - Admin summary report PDF
Project Structure

rafay/
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts              (seed admin user + sample data)
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts             (app entry point)
│   │   ├── app.ts               (Express app setup)
│   │   ├── config/
│   │   │   ├── env.ts           (environment validation with Zod)
│   │   │   ├── prisma.ts        (Prisma client singleton)
│   │   │   └── email.ts         (Nodemailer config)
│   │   ├── middleware/
│   │   │   ├── auth.ts          (JWT verification)
│   │   │   ├── rbac.ts          (role-based access control)
│   │   │   ├── validate.ts      (Zod request validation)
│   │   │   ├── upload.ts        (Multer file upload)
│   │   │   ├── rateLimiter.ts   (rate limiting)
│   │   │   └── errorHandler.ts  (global error handler)
│   │   ├── routes/
│   │   │   ├── index.ts         (route aggregator)
│   │   │   ├── auth.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   ├── teacher.routes.ts
│   │   │   ├── sponsor.routes.ts
│   │   │   ├── student.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── report.routes.ts
│   │   ├── controllers/
│   │   │   └── ... (matching routes)
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── quiz.service.ts
│   │   │   ├── marks.service.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── finance.service.ts
│   │   │   ├── message.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── email.service.ts
│   │   │   └── report.service.ts (PDF generation)
│   │   ├── validators/
│   │   │   └── ... (Zod schemas per domain)
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── jwt.ts
│   │       ├── password.ts      (bcrypt hashing)
│   │       ├── pagination.ts
│   │       └── helpers.ts
│   └── uploads/                  (Docker volume mount)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   │   └── assets/              (static images, favicon)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   │   ├── client.ts        (Axios instance with interceptors)
│   │   │   ├── auth.api.ts
│   │   │   ├── admin.api.ts
│   │   │   ├── teacher.api.ts
│   │   │   ├── sponsor.api.ts
│   │   │   ├── student.api.ts
│   │   │   ├── message.api.ts
│   │   │   └── report.api.ts
│   │   ├── components/
│   │   │   ├── ui/              (shadcn/ui components)
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── charts/
│   │   │   │   ├── PerformanceChart.tsx
│   │   │   │   ├── AttendanceChart.tsx
│   │   │   │   └── FinanceChart.tsx
│   │   │   ├── common/
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   └── EmptyState.tsx
│   │   │   └── forms/
│   │   │       ├── LoginForm.tsx
│   │   │       ├── MarksEntryForm.tsx
│   │   │       ├── QuizForm.tsx
│   │   │       └── FinanceForm.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Users.tsx
│   │   │   │   ├── Invitations.tsx
│   │   │   │   ├── Assignments.tsx
│   │   │   │   ├── Subjects.tsx
│   │   │   │   ├── Finance.tsx
│   │   │   │   ├── Announcements.tsx
│   │   │   │   ├── Reports.tsx
│   │   │   │   └── Messages.tsx
│   │   │   ├── teacher/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Quizzes.tsx
│   │   │   │   ├── MarksEntry.tsx
│   │   │   │   ├── Attendance.tsx
│   │   │   │   └── Students.tsx
│   │   │   ├── sponsor/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Students.tsx
│   │   │   │   ├── StudentDetail.tsx
│   │   │   │   └── Messages.tsx
│   │   │   └── student/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Profile.tsx
│   │   │       ├── Marks.tsx
│   │   │       ├── Attendance.tsx
│   │   │       ├── Documents.tsx
│   │   │       ├── Achievements.tsx
│   │   │       └── Updates.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useTheme.ts
│   │   │   └── useNotifications.ts
│   │   ├── store/
│   │   │   ├── authStore.ts     (Zustand)
│   │   │   └── themeStore.ts
│   │   ├── lib/
│   │   │   └── utils.ts         (shadcn/ui utility)
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── formatters.ts
│   │       └── constants.ts
│   └── components.json          (shadcn/ui config)
│
└── nginx/
    └── nginx.conf               (reverse proxy config)
Docker Architecture

# docker-compose.yml services:
services:
  postgres:
    image: postgres:16-alpine
    volumes: postgres_data:/var/lib/postgresql/data
    environment: from .env
    healthcheck: pg_isready

  backend:
    build: ./backend
    depends_on: postgres (healthy)
    volumes: ./backend/uploads:/app/uploads
    environment: from .env
    command: runs migrations then starts server

  nginx:
    image: nginx:alpine
    ports: 80:80
    depends_on: backend
    volumes: ./nginx/nginx.conf, ./frontend/dist
Single command to run: docker compose up --build

The frontend is built separately (npm run build in frontend/) and served as static files by Nginx. Nginx proxies /api/* requests to the backend container.

Key Implementation Details
Authentication Flow
Admin sends invite via email → invite link with JWT token
User clicks link → registration page with pre-filled email + role
User sets password → account created → redirect to login
Login → server returns access token (15min, in memory) + refresh token (7 days, httpOnly cookie)
Access token sent in Authorization header for all API calls
On 401 → auto-refresh using refresh token → retry request
Refresh token rotation on each refresh (old token invalidated)
Role-Based Access Control (RBAC)
Middleware checks JWT → extracts role → validates against allowed roles for each route
Fine-grained: Teachers can only see/modify their own students' marks
Sponsors can only see data for students assigned to them
Students can only see their own data
Email Notifications (Gmail SMTP)
Triggered on:

New marks posted → notify sponsor(s) of that student
Financial record added → notify sponsor(s)
New announcement → notify all users
New message → notify recipient
Invite sent → invite email with registration link
PDF Generation (using puppeteer or @react-pdf/renderer server-side)
Student Report Card: grades, marks trend, attendance summary
Financial Report: expense breakdown per student with charts
Admin Summary: overall stats, all students, all sponsors
File Upload
Multer middleware handles multipart uploads
Files stored in ./backend/uploads/ (Docker volume)
Served via Nginx static file serving at /uploads/*
File size limit: 10MB
Allowed types: images (jpg, png, webp), documents (pdf, doc, docx)
Frontend Pages & UI Design
Landing Page (Public)
Hero section with mission statement and call-to-action
Impact stats (students helped, sponsors, success stories) - animated counters
"How It Works" section (3-step process for sponsors)
Testimonials section
"Become a Sponsor" CTA with contact info
Footer with organization details
Login / Register Pages
Clean, centered card design
Social proof elements (trusted by X sponsors)
Dashboard Layouts (Per Role)
Admin Dashboard:

Stats cards: Total Students, Sponsors, Teachers, Active Assignments
Recent activity feed
Quick actions: Invite User, Create Subject, Post Announcement
Charts: Student enrollment over time, Financial overview
Sponsor Dashboard:

"Your Sponsored Students" cards with photos, names, grade
Performance summary per student (mini chart)
Recent marks/updates notifications
Quick message to admin
Teacher Dashboard:

"Your Students" list
Recent quizzes created
Quick action: Create Quiz, Enter Marks, Mark Attendance
Pending marks entry alerts
Student Dashboard:

Performance overview chart
Recent marks table
Attendance summary (calendar heat map)
Quick links to profile, documents, achievements
Implementation Order
Phase 1: Project Setup & Infrastructure
Initialize monorepo structure
Set up backend: Express + TypeScript + Prisma
Set up frontend: Vite + React + TypeScript + Tailwind + shadcn/ui
Configure Docker Compose (PostgreSQL + Backend + Nginx)
Set up environment variables (.env)
Configure ESLint + Prettier for both projects
Phase 2: Authentication & Core Backend
Prisma schema for all tables + initial migration
JWT auth middleware (access + refresh tokens)
Auth routes (login, register, refresh, logout, forgot/reset password)
RBAC middleware
Admin routes: user management, invitations
Seed script (create default admin user)
Phase 3: Academic Module
Subjects CRUD (admin)
Teacher-Subject assignment
Quiz/Test CRUD (teacher)
Marks entry (teacher, per student)
Attendance marking (teacher)
Student marks/attendance views
Phase 4: Financial Module
Financial records CRUD (admin)
Financial summary/stats endpoints
Sponsor financial view endpoints
Phase 5: Communication Module
Messages (sponsor <-> admin)
Announcements (admin → all)
Notifications system + email triggers
Phase 6: Student Content Module
Student profile (bio, goals, thank you)
Document upload
Achievements CRUD
Student updates/blog posts
Phase 7: Reports & PDF
Student report card PDF
Financial report PDF
Admin summary report PDF
Phase 8: Frontend - Foundation
Project setup with routing, auth store, API client
Landing page
Login / Register / Forgot Password pages
Dashboard layout (sidebar, header, theme toggle)
Protected route wrappers per role
Phase 9: Frontend - Admin Pages
Admin Dashboard with stats + charts
User Management page (list, invite, deactivate)
Sponsor-Student Assignments page
Subjects Management page
Financial Records page
Announcements page
Messages page (inbox style)
Phase 10: Frontend - Teacher Pages
Teacher Dashboard
Quiz management (create, list, edit)
Marks entry form (select quiz → select student → enter marks)
Attendance marking (date picker → student list → mark status)
Phase 11: Frontend - Sponsor Pages
Sponsor Dashboard (student cards with mini charts)
Student Detail page (marks, attendance, finance, profile)
Performance charts (line, bar, pie)
Messages page
Phase 12: Frontend - Student Pages
Student Dashboard
Profile editor (bio, goals, thank you message, avatar)
Marks & Attendance views
Documents upload/management
Achievements management
Blog/Updates editor
Phase 13: Polish & Production
Dark mode implementation
Loading states, error boundaries, empty states
Responsive design audit (mobile, tablet, desktop)
Security audit (CORS, rate limiting, input sanitization, HTTPS headers)
Performance optimization (lazy loading, code splitting)
Final Docker Compose configuration + production Nginx config
Verification Plan
Backend Testing
Seed the database and verify admin can log in
Test invite flow: send invite → register → login
Test RBAC: verify each role can only access their endpoints
Test marks entry workflow end-to-end
Test financial record CRUD
Test message flow between sponsor and admin
Test PDF generation for all report types
Frontend Testing
Verify landing page renders correctly
Test complete auth flow (invite → register → login → dashboard)
Verify each role sees only their dashboard and data
Test marks entry form as teacher
Verify sponsor can see student performance charts
Test file upload (student documents, receipts)
Test dark mode toggle
Test responsive layouts on mobile viewport
Integration Testing
docker compose up --build starts all services correctly
Frontend communicates with backend through Nginx proxy
File uploads persist in Docker volume
Email notifications are sent via Gmail SMTP
PDF downloads work for all report types
Key Files to Create/Modify
docker-compose.yml - Docker orchestration
backend/Dockerfile - Backend container
backend/prisma/schema.prisma - Database schema
backend/src/index.ts - Server entry point
backend/src/middleware/auth.ts - JWT middleware
backend/src/middleware/rbac.ts - Role-based access
frontend/src/App.tsx - Root component with routing
frontend/src/pages/Landing.tsx - Public landing page
nginx/nginx.conf - Reverse proxy configuration
.env.example - Environment variable template