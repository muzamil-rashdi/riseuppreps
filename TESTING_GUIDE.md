# RiseUp Preps Academy - Testing Guide

This guide walks you through testing every feature of the platform. Follow the steps in order, as some features depend on data created in previous steps.

---

## Prerequisites

1. All Docker containers are running:
   ```bash
   docker compose up --build -d
   docker compose ps  # All 4 containers should show "Up"
   ```
2. Open `http://localhost` in your browser

---

## 1. Landing Page

- [ ] Visit `http://localhost` - the landing page should display
- [ ] Verify hero section, features section, and stats are visible
- [ ] Check "Login" button in the header navigates to `/login`
- [ ] Verify responsive layout (resize browser or use dev tools)
- [ ] Check dark mode isn't applied initially (light theme is default)

---

## 2. Admin Login

- [ ] Go to `http://localhost/login`
- [ ] Enter credentials: `admin@riseuppreps.org` / `Admin@RiseUp2024!`
- [ ] Click "Login"
- [ ] Verify redirect to `/admin` dashboard
- [ ] Verify sidebar shows: Dashboard, Users, Invitations, Assignments, Subjects, Finance, Announcements, Messages, Reports

---

## 3. Theme Toggle

- [ ] Click the moon/sun icon in the header (top right)
- [ ] Verify the entire UI switches between light and dark mode
- [ ] Refresh the page - theme preference should persist
- [ ] Toggle back to light mode

---

## 4. Admin - User Management

### 4.1 Send Invitations
- [ ] Click **Invitations** in sidebar
- [ ] Click "Send Invitation" button
- [ ] Fill in:
  - Email: `teacher1@test.com`
  - Role: `TEACHER`
- [ ] Click "Send"
- [ ] Verify the invitation appears in the list
- [ ] Repeat for:
  - `sponsor1@test.com` / `SPONSOR`
  - `student1@test.com` / `STUDENT`
  - `student2@test.com` / `STUDENT`

> **Note:** If SMTP is configured (see `.env`), real invitation emails will be sent. Otherwise, copy the invite token from the invitations list.

### 4.2 Register Users (via Invite Links)
For each invitation:
- [ ] Copy the invite token from the invitations list (or check backend logs)
- [ ] Open a new browser/incognito window
- [ ] Navigate to `http://localhost/register/<token>`
- [ ] Fill in first name, last name, and password (min 8 chars)
- [ ] Click "Create Account"
- [ ] Verify redirect to the correct role dashboard

**Suggested test accounts:**

| Role | Email | Password | First Name | Last Name |
|------|-------|----------|------------|-----------|
| Teacher | teacher1@test.com | Teacher123! | John | Smith |
| Sponsor | sponsor1@test.com | Sponsor123! | Sarah | Johnson |
| Student | student1@test.com | Student123! | Ahmed | Khan |
| Student | student2@test.com | Student123! | Maria | Garcia |

### 4.3 View Users
- [ ] Log back in as admin
- [ ] Click **Users** in sidebar
- [ ] Verify all registered users appear in the list
- [ ] Test role filter tabs (All, Sponsors, Teachers, Students)
- [ ] Click edit (pencil icon) on a user - update their name
- [ ] Verify the update is reflected in the list

---

## 5. Admin - Subjects Management

### 5.1 Create Subjects
- [ ] Click **Subjects** in sidebar
- [ ] Click "Add Subject"
- [ ] Create these subjects:
  - Mathematics (description: "Algebra, Geometry, Calculus")
  - English (description: "Literature, Grammar, Writing")
  - Science (description: "Physics, Chemistry, Biology")
- [ ] Verify subjects appear as cards in the list
- [ ] Test editing a subject (click "Edit" button)
- [ ] Test deactivating a subject (click "Deactivate" button)

### 5.2 Assign Teachers to Subjects
- [ ] On the Mathematics card, click the **"Manage"** button
- [ ] A dialog opens with **Teachers** and **Students** tabs
- [ ] In the **Teachers** tab, select "John Smith" from the dropdown and click "Add"
- [ ] Verify John Smith appears in the assigned teachers list
- [ ] Close the dialog
- [ ] Repeat: Open Manage on English, assign John Smith
- [ ] Verify teacher count badges show on the subject cards (e.g., "1 Teacher")

### 5.3 Enroll Students in Subjects
- [ ] On the Mathematics card, click **"Manage"**
- [ ] Switch to the **Students** tab
- [ ] Select "Ahmed Khan" and click "Add"
- [ ] Select "Maria Garcia" and click "Add"
- [ ] Verify both students appear in the enrolled students list
- [ ] Close the dialog
- [ ] Repeat: Enroll both students in English and Science
- [ ] Verify student count badges show on the subject cards (e.g., "2 Students")

> **Important:** Students MUST be enrolled in subjects before teachers can enter marks or attendance for them. This is how the platform knows which students belong to which class.

### 5.4 Test Removing Assignments
- [ ] Open Manage on any subject
- [ ] Click the X button next to a teacher or student to remove them
- [ ] Verify they disappear from the list and reappear in the dropdown
- [ ] Re-add them if needed for further testing

---

## 6. Admin - Sponsor-Student Assignments

- [ ] Click **Assignments** in sidebar
- [ ] Click "Create Assignment"
- [ ] Assign Sponsor (Sarah Johnson) to Student (Ahmed Khan)
- [ ] Repeat: Assign Sarah Johnson to Student (Maria Garcia)
- [ ] Verify both assignments appear in the list
- [ ] Test removing an assignment (click trash icon)
- [ ] Re-create the assignment if needed for further testing

---

## 7. Admin - Financial Records

- [ ] Click **Finance** in sidebar
- [ ] Click "Add Record"
- [ ] Create a record:
  - Student: Ahmed Khan
  - Category: FEES
  - Amount: 500.00
  - Date: Today
  - Description: "Monthly tuition fee"
- [ ] Click "Add Record"
- [ ] Verify the record appears in the table
- [ ] Add more records with different categories (BOOKS, UNIFORM, TRANSPORT)
- [ ] Test filters (by student, by category)
- [ ] Verify summary cards show correct totals
- [ ] Test deleting a record

---

## 8. Admin - Announcements

- [ ] Click **Announcements** in sidebar
- [ ] Click "Create Announcement"
- [ ] Create:
  - Title: "Welcome to RiseUp Preps Academy"
  - Body: "We are excited to launch our new platform..."
- [ ] Verify the announcement appears
- [ ] Test editing and deleting announcements

---

## 9. Admin - Messages

- [ ] Click **Messages** in sidebar
- [ ] The inbox should show conversations (empty initially)
- [ ] After a sponsor sends a message (Step 13), check back here

---

## 10. Admin - Reports

- [ ] Click **Reports** in sidebar
- [ ] Test generating a Student Report (select Ahmed Khan)
- [ ] Test generating a Financial Report
- [ ] Test generating an Admin Summary
- [ ] Verify PDF downloads work (requires data from previous steps)

---

## 11. Admin - Profile

- [ ] Click the user avatar in the top-right header
- [ ] Click "Profile" from the dropdown
- [ ] Verify you're on `/admin/profile`
- [ ] Update first name or phone number
- [ ] Click "Save Changes"
- [ ] Verify the name updates in the header

---

## 12. Teacher Dashboard

- [ ] Log out (click avatar > Log out)
- [ ] Log in as: `teacher1@test.com` / `Teacher123!`
- [ ] Verify redirect to `/teacher`
- [ ] Verify sidebar shows: Dashboard, Quizzes, Enter Marks, Attendance, Students

### 12.1 Create Quiz
- [ ] Click **Quizzes** in sidebar
- [ ] Click "Create Quiz"
- [ ] Verify the Subject dropdown shows **Mathematics** and **English** (the subjects assigned to this teacher in Step 5.2)
- [ ] Fill in:
  - Name: "Math Quiz 1"
  - Subject: Mathematics
  - Date: Today
  - Total Marks: 100
  - Description: "Algebra basics"
- [ ] Verify quiz appears in the list

> **If the Subject dropdown is empty:** Go back to admin, open Subjects > Manage on the subject, and assign the teacher (Step 5.2).

### 12.2 Enter Marks
- [ ] Click **Enter Marks** in sidebar
- [ ] Select Quiz: "Math Quiz 1"
- [ ] Verify only students **enrolled in Mathematics** appear (Ahmed Khan, Maria Garcia — from Step 5.3)
- [ ] Enter marks for Ahmed Khan: 85/100
- [ ] Click "Submit Mark"
- [ ] Enter marks for Maria Garcia: 72/100
- [ ] Click "Submit Mark"
- [ ] Verify both marks appear in the "Entered Marks" table below

> **If no students appear:** Go back to admin, open Subjects > Manage on Mathematics, and enroll the students (Step 5.3).

### 12.3 Mark Attendance
- [ ] Click **Attendance** in sidebar
- [ ] Select Subject: Mathematics
- [ ] Verify only students **enrolled in Mathematics** appear in the attendance table
- [ ] Select Date: Today
- [ ] Mark Ahmed Khan: PRESENT
- [ ] Mark Maria Garcia: LATE
- [ ] Click "Submit Attendance"
- [ ] Verify success message appears
- [ ] Verify records appear in the "Recent Attendance Records" section

### 12.4 View Students
- [ ] Click **Students** in sidebar
- [ ] Verify teacher can see students in their assigned subjects

---

## 13. Sponsor Dashboard

- [ ] Log out
- [ ] Log in as: `sponsor1@test.com` / `Sponsor123!`
- [ ] Verify redirect to `/sponsor`
- [ ] Verify sidebar shows: Dashboard, My Students, Messages

### 13.1 View Sponsored Students
- [ ] Click **My Students** in sidebar
- [ ] Verify Ahmed Khan and Maria Garcia appear
- [ ] Click on Ahmed Khan to view details
- [ ] Verify you can see:
  - Student profile information
  - Marks (Math Quiz 1: 85/100)
  - Attendance records
  - Financial records ($500 fee)

### 13.2 Performance Charts
- [ ] On the student detail page, verify charts render:
  - Performance chart (marks over time)
  - Attendance chart (present/absent/late breakdown)
  - Finance chart (category breakdown)

### 13.3 Send Message to Admin
- [ ] Click **Messages** in sidebar
- [ ] Click "New Message"
- [ ] Send a message to Admin
  - Subject: "Question about student progress"
  - Body: "Hello, I wanted to ask about..."
- [ ] Verify message appears in the conversation

---

## 14. Student Dashboard

- [ ] Log out
- [ ] Log in as: `student1@test.com` / `Student123!`
- [ ] Verify redirect to `/student`
- [ ] Verify sidebar shows: Dashboard, My Marks, Attendance, Profile, Documents, Achievements, My Updates

### 14.1 View Marks
- [ ] Click **My Marks** in sidebar
- [ ] Verify Math Quiz 1 shows 85/100

### 14.2 View Attendance
- [ ] Click **Attendance** in sidebar
- [ ] Verify today's attendance shows "PRESENT" for Mathematics

### 14.3 Update Profile
- [ ] Click **Profile** in sidebar
- [ ] Fill in:
  - Grade: "10th"
  - Date of Birth: Select a date
  - Bio: "I love learning mathematics and science"
  - Goals: "To become an engineer"
  - Thank You Message: "Thank you to my sponsors for supporting my education"
- [ ] Click "Save Changes"
- [ ] Verify the left side preview updates

### 14.4 Upload Document
- [ ] Click **Documents** in sidebar
- [ ] Click "Upload Document"
- [ ] Upload a PDF or image file
- [ ] Add title: "Report Card"
- [ ] Verify document appears in the list

### 14.5 Add Achievement
- [ ] Click **Achievements** in sidebar
- [ ] Click "Add Achievement"
- [ ] Fill in:
  - Title: "Math Competition Winner"
  - Description: "Won 1st place in regional math competition"
  - Date: Recent date
- [ ] Verify achievement appears

### 14.6 Create Blog Update
- [ ] Click **My Updates** in sidebar
- [ ] Click "New Post"
- [ ] Fill in:
  - Title: "My first month at RiseUp Preps"
  - Content: "I'm so grateful for this opportunity..."
- [ ] Verify the post appears

---

## 15. Cross-Role Verification

After completing all the above:

### 15.1 Sponsor sees student content
- [ ] Log in as sponsor
- [ ] View Ahmed Khan's detail page
- [ ] Verify you can see:
  - Profile bio and goals
  - Thank you message
  - Achievements
  - Blog updates
  - Documents (if viewable)

### 15.2 Admin sees everything
- [ ] Log in as admin
- [ ] Check Messages - verify sponsor's message is there
- [ ] Reply to the sponsor's message
- [ ] Check Dashboard stats reflect all created data

### 15.3 Notifications
- [ ] Log in as sponsor
- [ ] Check notifications bell (top right)
- [ ] Verify notifications for marks posted, financial updates

---

## 16. Navigation & UI Tests

- [ ] **Sidebar collapse**: Click the hamburger/chevron to collapse sidebar, verify it works
- [ ] **Mobile responsive**: Resize to mobile width, verify sidebar becomes a drawer
- [ ] **Breadcrumbs**: Navigate to sub-pages, verify breadcrumbs update correctly
- [ ] **404 handling**: Navigate to a non-existent URL like `/admin/nonexistent` - should redirect
- [ ] **Auth redirect**: Try accessing `/admin` while logged out - should redirect to `/login`
- [ ] **Role protection**: Try accessing `/admin` while logged in as a teacher - should redirect to `/teacher`

---

## 18. Email Notifications

If SMTP is configured in `.env` (currently using Hostinger SMTP), these actions trigger real emails:

- [ ] **Invitation email**: Send an invitation from admin — recipient receives email with "Accept Invitation" button
- [ ] **Marks notification**: When teacher enters marks, the student's sponsor receives an email
- [ ] **Message notification**: When sponsor sends a message, admin receives an email notification

> Check backend logs for email errors: `docker compose logs backend | grep -i email`

---

## 19. API Health Check

```bash
# Health endpoint
curl http://localhost/api/health

# Expected: {"status":"ok","timestamp":"..."}
```

---

## 20. Docker Verification

```bash
# Check all containers are running
docker compose ps

# Check backend logs for errors
docker compose logs backend

# Check nginx is proxying correctly
curl -s http://localhost/api/health
curl -s http://localhost/ | head -5

# Restart a service if needed
docker compose restart backend
```

---

## Common Issues During Testing

| Issue | Solution |
|-------|----------|
| "Network Error" on API calls | Check backend is running: `docker compose logs backend` |
| Login succeeds but stays on login page | Clear localStorage: `localStorage.clear()` then refresh |
| Invite registration link doesn't work | Check if token is expired. Send a new invitation |
| File upload fails | Check `MAX_FILE_SIZE` env var. Default is 10MB |
| Dark mode doesn't persist | Check browser localStorage for `rupa-theme` key |
| Sidebar links don't work | Hard refresh (Ctrl+Shift+R) to get latest frontend build |
| "Failed to load dashboard" | Backend may not have data yet. Complete steps in order |
| PDF report is blank | Puppeteer needs Chromium. Check backend logs for errors |
| Quiz subject dropdown is empty | Teacher must be assigned to subjects (Admin > Subjects > Manage > Teachers tab) |
| No students appear in marks/attendance | Students must be enrolled in the subject (Admin > Subjects > Manage > Students tab) |
| Email not sending | Check SMTP credentials in `.env`. Check backend logs: `docker compose logs backend` |

---

## Test Data Summary

After completing all tests, you should have:

| Entity | Count |
|--------|-------|
| Users | 5 (1 admin + 1 teacher + 1 sponsor + 2 students) |
| Subjects | 3 (Mathematics, English, Science) |
| Teacher-Subject assignments | 2 (John Smith -> Math, English) |
| Student-Subject enrollments | 6 (2 students x 3 subjects) |
| Sponsor-Student assignments | 2 (Sarah -> Ahmed, Maria) |
| Quizzes | 1+ |
| Marks entries | 2+ |
| Attendance records | 2+ |
| Financial records | 4+ |
| Announcements | 1+ |
| Messages | 1+ |
| Student documents | 1+ |
| Student achievements | 1+ |
| Student blog posts | 1+ |
