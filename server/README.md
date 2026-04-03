# 1A HK International — LMS Backend Server

Production-grade Node.js + Express + MongoDB backend for the Learning Management System.

---

## Architecture

```
src/
├── config/             # DB connection, Cloudinary
├── controllers/        # Route handlers (business logic)
│   ├── adminController.js
│   ├── analyticsController.js
│   ├── aoController.js              ← NEW
│   ├── assignmentController.js
│   ├── authController.js
│   ├── batchController.js
│   ├── certificateController.js     ← EXTENDED (PDF gen, attendance gate)
│   ├── courseController.js
│   ├── documentController.js
│   ├── examController.js
│   ├── feedbackController.js
│   ├── lessonController.js
│   ├── liveClassController.js
│   ├── messageController.js
│   ├── notificationController.js
│   ├── orientationController.js     ← NEW
│   ├── partnerInstituteController.js ← NEW
│   ├── paymentController.js
│   ├── questionBankController.js
│   ├── settingsController.js
│   ├── studentController.js
│   └── submissionController.js
├── middleware/
│   ├── authMiddleware.js            # JWT verification
│   ├── errorMiddleware.js           # Centralized error handler
│   ├── roleMiddleware.js            # RBAC
│   ├── upload.js                    # Multer (disk + memory)
│   └── validate.js                  # Request validation
├── models/             # Mongoose schemas (22 models)
│   ├── Attendance.js                ← NEW
│   ├── AuditLog.js                  ← NEW
│   ├── AwardingOrganisation.js      ← NEW
│   ├── OrientationSession.js        ← NEW
│   ├── PartnerInstitute.js          ← NEW
│   ├── Registration.js              ← NEW
│   ├── User.js                      ← EXTENDED (new roles)
│   └── ... (15 existing models)
├── routes/             # Express routers
├── services/
│   ├── auditService.js              ← NEW
│   ├── certificateGenerator.js      ← NEW (PDFKit)
│   ├── emailService.js              ← EXTENDED
│   └── notificationService.js       ← NEW
├── utils/
│   ├── ApiError.js                  ← NEW
│   ├── apiResponse.js               ← NEW
│   ├── asyncHandler.js              ← NEW
│   └── easebuzzHash.js
├── app.js
└── server.js
```

---

## Roles & Access Control

| Role               | Access Level                                    |
|--------------------|-------------------------------------------------|
| `super_admin`      | Full access to everything                       |
| `admin`            | Full access (except super_admin management)     |
| `tutor`            | Courses, assignments, batches, live classes      |
| `student`          | Enrolled courses, submissions, quizzes           |
| `partner_institute`| Own students, registrations, documents           |
| `ao`               | Read-only: dashboard, student tracking, reports  |

---

## Setup

```bash
# 1. Clone and install
cd server
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Create uploads directory
mkdir -p uploads

# 4. Run
npm run dev     # Development (nodemon)
npm start       # Production
```

---

## Bugs Fixed from Original Codebase

1. **`authController.js`** — `adminSecretId` was referenced as an undefined variable; fixed to read from `req.body`
2. **`authController.js`** — `req.user.id` vs `req.user._id` inconsistency throughout controllers; standardised to `req.user._id`
3. **`errorMiddleware.js`** — Faulty statusCode ternary logic `res.statusCode === 200 ? err.statusCode || 500 : res.statusCode`; rewritten cleanly
4. **`adminController.js`** — `registerUser` references `adminLoginId` field not in User schema; cleaned up
5. **`notificationRoutes.js`** — Only 2 of 10 controller functions were wired to routes; all endpoints now connected
6. **`analyticsController.js`** — N+1 query pattern in `getReportsData` (loop of `countDocuments`); refactored to aggregation pipelines
7. **`config/db.js`** — Redundant `dotenv.config()` call and `console.log(process.env.MONGO_URI)` leaking secrets; removed
8. **`User.js`** — Role enum only had `student/tutor/admin`; extended for new portal roles
9. **`Notification.js`** — Missing `registration` type in enum
10. **CORS** — `"https://hkinternational.uk/"` had trailing slash causing mismatch; fixed
11. **Missing error propagation** — No `asyncHandler` wrapper meant unhandled promise rejections crashed the server; all controllers now wrapped

---

## New Modules

### 1. Orientation Session + Quiz + Certificate

**Flow:** Create Session → Mark Attendance → Create Quiz → Students Attempt Quiz → Issue Certificate (only if attended + passed)

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/orientation/sessions` | POST | Admin/Tutor | Create session |
| `/api/orientation/sessions` | GET | Any auth | List sessions |
| `/api/orientation/sessions/:id` | GET | Any auth | Get session detail |
| `/api/orientation/sessions/:id` | PUT | Admin/Tutor | Update session |
| `/api/orientation/sessions/:id` | DELETE | Admin | Delete session |
| `/api/orientation/sessions/:sessionId/attendance` | POST | Admin/Tutor | Mark single attendance |
| `/api/orientation/sessions/:sessionId/attendance/bulk` | POST | Admin/Tutor | Bulk mark attendance |
| `/api/orientation/sessions/:sessionId/attendance/csv` | POST | Admin/Tutor | CSV upload attendance |
| `/api/orientation/sessions/:sessionId/attendance` | GET | Admin/Tutor/AO | Get attendance records |
| `/api/orientation/sessions/:sessionId/quiz` | POST | Admin/Tutor | Create quiz for session |
| `/api/orientation/sessions/:sessionId/quiz/attempt` | POST | Student | Attempt quiz |
| `/api/orientation/sessions/:sessionId/quiz/results` | GET | Admin/Tutor/AO | View quiz results |

### 2. Partner Institute Portal

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/partner-institutes/register` | POST | Public | Register institute |
| `/api/partner-institutes/login` | POST | Public | Login |
| `/api/partner-institutes/` | GET | Admin | List all institutes |
| `/api/partner-institutes/:id` | GET | Admin | Get institute detail |
| `/api/partner-institutes/:id/status` | PATCH | Admin | Approve/reject/suspend |
| `/api/partner-institutes/portal/dashboard` | GET | Partner | Dashboard stats |
| `/api/partner-institutes/portal/students` | POST | Partner | Add student |
| `/api/partner-institutes/portal/students/bulk` | POST | Partner | CSV bulk upload |
| `/api/partner-institutes/portal/documents` | POST | Partner | Upload documents |
| `/api/partner-institutes/portal/registrations` | POST | Partner | Create registration |
| `/api/partner-institutes/portal/registrations` | GET | Partner | Track registrations |

### 3. Awarding Organisation (AO) Portal — Read-Only

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/ao/login` | POST | Public | AO login |
| `/api/ao/` | POST | Admin | Create AO |
| `/api/ao/` | GET | Admin | List AOs |
| `/api/ao/:id` | GET | Admin | Get AO detail |
| `/api/ao/:id` | PUT | Admin | Update AO |
| `/api/ao/portal/dashboard` | GET | AO | Dashboard stats |
| `/api/ao/portal/students` | GET | AO | Student tracking |
| `/api/ao/portal/audit-logs` | GET | AO | Audit logs |
| `/api/ao/portal/reports` | GET | AO | Certificates + quiz reports |

### 4. Extended Certificate System

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/certificates/` | POST | Admin | Issue (with attendance+quiz gate) |
| `/api/certificates/:id/download` | GET | Auth | Download PDF |
| `/api/certificates/verify/:certNumber` | GET | Public | Verify certificate |

### 5. Admin Registration Management

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/admin/registrations` | GET | Admin | View all registrations |
| `/api/admin/registrations/:id` | PATCH | Admin | Approve/reject |
| `/api/admin/registrations/export/csv` | GET | Admin | Export CSV |

---

## Existing API Endpoints (Preserved)

| Module | Base Path | Auth |
|---|---|---|
| Auth | `/api/auth` | Public + Protected |
| Courses | `/api/courses` | Role-based |
| Assignments | `/api/assignments` | Role-based |
| Submissions | `/api/submissions` | Role-based |
| Admin | `/api/admin` | Admin only |
| Students | `/api/students` | Student only |
| Messages | `/api/messages` | Any auth |
| Notifications | `/api/notifications` | Any auth |
| Lessons | `/api/lessons` | Role-based |
| Batches | `/api/batches` | Admin/Tutor |
| Live Classes | `/api/live-classes` | Admin/Tutor |
| Exams | `/api/exams` | Admin/Tutor |
| Documents | `/api/documents` | Role-based |
| Feedback | `/api/feedback` | Role-based |
| Certificates | `/api/certificates` | Role-based |
| Question Banks | `/api/question-banks` | Admin/Tutor |
| Settings | `/api/settings` | Admin only |
| Analytics | `/api/analytics` | Admin/Tutor |
| Payments | `/api/payment` | Public (Easebuzz) |

---

## Database Indexes

All models include strategic indexes for query performance:

- `User` — `email` (unique), `role`
- `Registration` — `{student, course}` (unique), `partnerInstitute`, `status`
- `Attendance` — `{orientationSession, student}` (unique)
- `OrientationSession` — `course`, `scheduledDate`
- `PartnerInstitute` — `code` (unique), `status`
- `AuditLog` — `{entity, entityId}`, `performedBy`, `createdAt`
- `Message` — `{senderId, receiverId}` (both directions)
- `Notification` — `{userId, createdAt}`
- `Certificate` — `{studentId, courseId}` (unique)
- `Submission` — `{assignmentId, studentId}` (unique)
- `QuizAttempt` — `{quizId, studentId}` (unique)
- `ExamAttempt` — `{examId, studentId}` (unique)

---

## Key Architectural Decisions

- **asyncHandler** wraps every controller — no unhandled promise rejections
- **ApiError** class for consistent error throwing with HTTP status codes
- **Centralized error middleware** handles Mongoose validation, duplicate key, CastError automatically
- **Services layer** for cross-cutting concerns (email, notifications, audit logs, PDF generation)
- **Lean queries** (`.lean()`) used for read-only endpoints for better performance
- **Aggregation pipelines** replace N+1 query loops in analytics/reports
- **CSV processing** uses streaming parser (csv-parser) with memory storage for file uploads

---

## Environment Variables

See `.env.example` for all required variables.

---

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Database:** MongoDB via Mongoose 8
- **Auth:** JWT (jsonwebtoken)
- **Password:** bcryptjs
- **File Upload:** Multer
- **Email:** Nodemailer
- **PDF:** PDFKit
- **Real-time:** Socket.io
- **Payment:** Easebuzz
- **Cloud Storage:** Cloudinary
- **Security:** Helmet, CORS, express-rate-limit
- **Logging:** Morgan, Winston
