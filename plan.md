# Star Educational Academy, Ghotki — Full Implementation Plan
**MERN Stack | Emerald & Cream Theme | Bold Motion/3D | Role-Based Platform**

---

## 0. Brand Facts (from official flyer — use as real seed data)

- **Name:** Star Educational Academy, Ghotki (SEA)
- **Programs:** Coaching for Grades IX, X, XI, XII — Pre-Medical & Pre-Engineering (ECAT/MCAT track)
- **Director:** Sir Irshad Ahmed Ogahi — Physics — 0308-3309704
- **Administrator:** Muhammad Jamil Arain — Mathematics — 0306-3004887
- **Faculty:**
  - Sir Irshad Ahmed Ogahi — Physics
  - Sir Muhammad Jamil Arain — Mathematics
  - Sir Mujahid Hussain Ghoto — Chemistry
  - Sir Noor Hassan Channa — Biology
  - Sir Khalid Hussain Ghoto — English
  - Sir Akshay Kumar Korica — English
- **Achievements (use in animated stats + success stories seed):**
  - 1st Position in MDCAT, District Ghotki, 2025
  - 30 students secured MBBS/BDS admissions, 2025
  - 100% success rate in Pre-Engineering
  - Scholarship-based admissions at IBA Sukkur & IBA Karachi, 2025
- **Session 2026:** Admission forms & advance booking from 20-07-2026; classes commence 10-08-2026; timings 3:15 PM – 7:00 PM
- **Venue:** D.A.V. School, Ladies Bazaar, Ghotki
- **Current domain reference:** admissions.staracademy.edu.pk

This data populates the Hero stats counter, About section, Faculty grid, and initial Success Stories on first deploy — no placeholder "Lorem ipsum" needed.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + Tailwind CSS + Framer Motion |
| 3D/Motion | Spline (embedded scene) or React Three Fiber for hero; Lottie for lightweight icons |
| State | Zustand (lightweight, avoids Redux boilerplate) |
| Backend | Node.js + Express |
| Database | MongoDB (Atlas) + Mongoose |
| Auth | JWT (access + refresh tokens), bcrypt, httpOnly cookies |
| File storage | Cloudinary (images/video thumbnails) + S3-compatible bucket or Cloudinary raw for PDFs/videos |
| Email | Nodemailer (Gmail SMTP or SendGrid) — verification, approval, results notices |
| AI (doc→test) | Gemini API or Claude API, structured JSON output |
| PDF generation | pdf-lib or Puppeteer (challans, downloadable test sheets) |
| Doc parsing | mammoth (docx), pdf-parse (pdf text layer) |
| Deployment | Frontend: Vercel/Netlify. Backend: Render/Railway. DB: MongoDB Atlas. Media: Cloudinary. |

**WhatsApp:** no API integration. Just a styled anchor button: `<a href="https://wa.me/92XXXXXXXXXX" target="_blank">` with icon, hover pulse/glow animation, placed in navbar, footer, and floating action button (bottom-right, all pages).

---

## 2. Site Architecture / Sitemap

```
PUBLIC
 ├─ / (Home)
 ├─ /about
 ├─ /faculty
 ├─ /prospectus
 ├─ /success-stories
 ├─ /contact
 ├─ /lectures (public preview — locked content behind login)
 ├─ /login
 ├─ /register
 └─ /verify-email/:token

STUDENT (protected, role=student, status=approved)
 ├─ /dashboard
 ├─ /dashboard/lectures
 ├─ /dashboard/tests
 ├─ /dashboard/tests/:id/attempt
 ├─ /dashboard/tests/:id/result
 ├─ /dashboard/analytics
 ├─ /dashboard/challan
 └─ /dashboard/settings

TEACHER (protected, role=teacher)
 ├─ /teacher/dashboard
 ├─ /teacher/lectures/upload
 ├─ /teacher/mcq-bank
 ├─ /teacher/mcq-bank/upload-doc
 ├─ /teacher/tests/create
 ├─ /teacher/tests/:id/results
 └─ /teacher/settings

CLERK (protected, role=clerk)
 ├─ /clerk/dashboard
 ├─ /clerk/students (approve/decline)
 ├─ /clerk/challans (create/view)
 ├─ /clerk/success-stories (CRUD)
 └─ /clerk/settings

ADMIN (protected, role=admin)
 ├─ /admin/dashboard
 ├─ /admin/hero-media
 ├─ /admin/faculty
 ├─ /admin/students
 ├─ /admin/staff-accounts
 ├─ /admin/lectures
 ├─ /admin/mcq-bank
 ├─ /admin/tests
 ├─ /admin/mcq-bank/upload-doc
 ├─ /admin/settings (2FA, password)
 └─ /admin/audit-log
```

---

## 3. Design System

**Palette**
- Primary Emerald `#0E4429` — nav, headers, primary buttons
- Accent Gold `#D4A64A` — stars, badges, highlights, hover states
- Background Cream `#FBF8F1` / Alt `#F1ECE0`
- Card Sage `#DCE8DD`
- Text Charcoal `#1C2620`
- Error Terracotta `#C1553B` / Warning Amber `#E0A429` / Success stays emerald family

**Typography**
- Headings: Fraunces or Playfair Display (serif, prestige feel)
- Body/UI: Manrope or Inter (clean, legible at small sizes for dashboards)

**Motion system**
- Hero: full 3D scene (Spline) — star/graduation-cap composed of orbiting subject icons (atom, DNA, ∑ symbol, book), parallax on scroll/mouse
- Section transitions: scroll-triggered background shifts between Hero → About → Faculty → Success Stories
- Faculty cards: tilt-on-hover depth effect
- Stats counter: animated count-up synced to a filling star/growing icon
- Success story cards: unfold/flip reveal, gold star-rating animation
- CTA buttons: magnetic hover pull + click ripple
- **Guardrails:** `prefers-reduced-motion` fallback, 3D lazy-loads after first paint, dashboards (student/teacher/clerk/admin) stay motion-light and fast — animation budget spent on public pages only

---

## 4. Database Schema (MongoDB / Mongoose)

**User**
```
{ _id, fullName, phone, email, passwordHash, role: enum[student,teacher,clerk,admin],
  status: enum[pending,approved,declined,suspended], class: enum[9,10,11,12],
  stream: enum[pre-medical,pre-engineering], emailVerified: bool,
  twoFAEnabled: bool, twoFASecret, lastLogin, createdAt }
```

**Faculty** (public-facing profile, separate from login account)
```
{ _id, name, subject, photoUrl, bio, order, isActive }
```

**HeroMedia**
```
{ _id, imageUrl, caption, order, isActive }
```

**Lecture**
```
{ _id, subject, chapter, title, type: enum[video,notes], fileUrl/videoUrl,
  uploadedBy, class, stream, createdAt }
```

**MCQ**
```
{ _id, subject, chapter, questionText, options: [String x4], correctIndex,
  difficulty, sourceDocId (nullable), confidenceFlag (from AI extraction),
  createdBy, status: enum[pending_review,approved], createdAt }
```

**UploadedDoc** (tracks source docs for MCQ management/filtering)
```
{ _id, fileName, subject, uploadedBy, mcqCount, createdAt }
```

**Test**
```
{ _id, title, subject(s), mcqIds: [ObjectId], numQuestions, durationMinutes,
  mode: enum[practice,test], activeFrom, activeTo, createdBy,
  creationMethod: enum[doc,manual,random], shuffleQuestions: bool, createdAt }
```

**TestAttempt**
```
{ _id, testId, studentId, mode, answers: [{mcqId, selectedIndex}],
  score, totalMarks, startedAt, submittedAt, tabSwitchCount,
  autoSubmitted: bool }
```

**Challan**
```
{ _id, studentId, amount, dueDate, description, status: enum[unpaid,paid],
  createdBy, createdAt, isDeletable: false }
```

**SuccessStory**
```
{ _id, studentName, achievement, photoUrl, year, createdBy, createdAt }
```

**AuditLog**
```
{ _id, actorId, action, targetType, targetId, meta, createdAt }
```

---

## 5. Feature Breakdown by Role

### Public / Parents
- Hero: 3D scene + real photo slider + admissions banner (session dates from flyer)
- About: mission statement, achievements stat counters
- Faculty: grid of 6 faculty cards (photo, name, subject) — pulled from flyer roster
- Prospectus: downloadable PDF
- Success Stories: feed (CRUD by clerk/admin)
- Contact: form (name, email, message → stored + emailed to admin) + embedded map (Ladies Bazaar, Ghotki) + Director/Administrator contact cards
- Social links + WhatsApp floating button (styled `wa.me` link only)
- Fully responsive navbar with mobile drawer, scroll-hide/show behavior

### Lectures Page (public preview → gated)
- Subject filter chips (Physics, Chemistry, Biology, Math, English)
- Toggle: Notes / Video
- Search bar (title match, debounced)
- Locked overlay + "Login to view" CTA for non-authenticated users
- Paginated (or infinite scroll) grid, 50/page for consistency with MCQ bank

### Registration & Auth
- Register: full name, phone, email, password + confirm, class/stream selection
- Email verification link required before login
- Status = "pending" until clerk/admin approves
- Login blocked with clear message if pending/declined
- Password reset flow (forgot password → email link)

### Student Dashboard
- Test list: Practice Mode (untimed/unlimited retries, no effect on analytics) vs Test Mode (timed, one attempt, contributes to analytics)
- Test attempt UI: question navigator, timer (server-validated), auto-submit on time-up, tab-switch/blur detection → warning → auto-submit after threshold, shuffled questions/options
- Result view: submitted test mode shows answer sheet with correct/incorrect marks, score, downloadable PDF
- Lectures/notes: view + download (permission-gated by class/stream)
- AI Analytics: streak counter, average score trend, strong/weak subject breakdown (radar or bar chart), recommended focus areas based on weakest subject %
- Downloadable fee challan
- Settings: change password, update profile photo/phone

### Teacher Dashboard
- View results per test: list of attempts, highest/lowest/average score, individual student breakdown, filter by class/subject
- Upload lecture: video + notes per subject-chapter combo
- Upload doc → AI-assisted MCQ generation:
  1. Upload PDF/DOCX
  2. Extract text (mammoth/pdf-parse)
  3. Send to Gemini/Claude with strict JSON schema prompt
  4. Land in **"Pending Review"** queue — never auto-published
  5. Teacher edits inline (fix text, correct answer, subject/chapter tag)
  6. Explicit "Approve & Publish" action moves it to MCQ Bank
  7. Low-confidence flags (ambiguous OCR/AI uncertainty) surfaced first
- MCQ Bank CRUD: edit/remove/re-tag any MCQ, filter by subject + by source document, paginated 50/page
- Create Test — 3 methods, all support name/question count/time window:
  - From uploaded doc (auto-selects that doc's approved MCQs)
  - Manual selection from bank (checkbox picker with filters)
  - Random selection from bank (subject + count + difficulty filters)
- Change password

### Clerk Dashboard
- Student registrations: approve/decline (cannot delete approved students — enforced server-side, not just hidden in UI)
- Fee challan: customizable creation form (amount, due date, description) → generates downloadable PDF; **cannot delete** issued challans (soft-delete disabled at API level, only "mark paid/unpaid")
- Success Stories: full CRUD (create/edit/delete/reorder)
- Change password

### Admin Dashboard (full control)
- Hero media: CRUD slider images/captions
- Faculty: CRUD (add/remove/reorder faculty cards)
- Students: approve/decline/suspend, view by class/status
- Staff accounts: assign/revoke teacher or clerk role, create new staff logins
- Lectures/MCQ Bank/Tests: full CRUD access (superset of teacher permissions)
- Doc-upload AI MCQ generation: same reviewed pipeline as teacher
- Account settings: name/password change, 2FA setup (TOTP via authenticator app)
- View all accounts: role, class, phone, status, in a searchable/filterable table
- Audit log viewer: who approved/declined/deleted/edited what, when

**Password change** available in all four dashboards (student/teacher/clerk/admin) under Settings.

---

## 6. Security Architecture

- Passwords: bcrypt (cost factor 12), never stored/logged in plaintext
- Auth: JWT access token (15 min) + refresh token (7 days, httpOnly + Secure cookie), rotate on refresh
- RBAC middleware on every protected route — checks role AND status (e.g., student must be `approved`)
- Email verification required before first login
- 2FA (TOTP, e.g., via `speakeasy` + QR) mandatory for admin, optional toggle for teacher/clerk
- Rate limiting (`express-rate-limit`) on auth routes — brute-force protection
- `helmet` for HTTP headers, CORS locked to frontend origin only
- Input validation/sanitization: `express-validator` or `zod` on every endpoint
- File upload validation: whitelist MIME types (pdf, docx, mp4, jpg/png), max size limits, filename sanitization
- Soft-delete + role guard at API layer for "cannot delete" entities (students by clerk, challans) — not just UI hiding, so a direct API call also can't bypass it
- Audit logging middleware on all admin/clerk mutating actions
- Server-authoritative test timer and scoring — client never determines correctness or elapsed time
- HTTPS enforced in production; environment secrets via `.env` (never committed)

---

## 7. API Route Map (high level)

```
/api/auth        POST /register, /login, /logout, /refresh, /verify-email/:token,
                 /forgot-password, /reset-password/:token, /change-password

/api/users       GET /me, PATCH /me
                 (admin) GET /, PATCH /:id/role, PATCH /:id/status, DELETE /:id (admin only, audited)

/api/students    (clerk/admin) GET /pending, PATCH /:id/approve, PATCH /:id/decline

/api/faculty     GET /  (public)
                 (admin) POST /, PATCH /:id, DELETE /:id

/api/hero-media  GET /  (public)
                 (admin) POST /, PATCH /:id, DELETE /:id

/api/lectures    GET /  (filter: subject, type, search, page)
                 (teacher/admin) POST /, PATCH /:id, DELETE /:id

/api/mcq         GET /  (filter: subject, sourceDoc, status, page=50)
                 (teacher/admin) POST /, PATCH /:id, DELETE /:id
                 POST /upload-doc  → triggers AI extraction → pending_review
                 PATCH /:id/approve

/api/tests       GET /  (student: active tests only)
                 (teacher/admin) POST / (method: doc|manual|random), PATCH /:id, DELETE /:id
                 GET /:id/results  (teacher/admin — aggregate + per-student)

/api/attempts    POST /:testId/start, POST /:testId/submit
                 GET /:testId/result (student, own attempt only)
                 GET /:studentId/analytics (streak, avg score, strong/weak subjects)

/api/challans    (clerk/admin) POST /, GET /, PATCH /:id/mark-paid
                 (student) GET /my-challan, GET /:id/download

/api/success-stories  GET / (public)
                       (clerk/admin) POST /, PATCH /:id, DELETE /:id

/api/audit-log   (admin) GET /
```

---

## 8. Notifications (simplified per your correction)

- **Email only** (Nodemailer): registration received, approved/declined, results published, challan issued, password reset
- **WhatsApp:** static styled button/link only — `https://wa.me/92XXXXXXXXXX?text=...` — placed in Navbar, Footer, Contact page, and a floating action button. No backend, no webhook, no API cost.

---

## 9. Suggested Folder Structure

```
star-academy/
 ├─ client/
 │   ├─ src/
 │   │   ├─ components/ (ui/, layout/, animations/)
 │   │   ├─ pages/ (public/, student/, teacher/, clerk/, admin/)
 │   │   ├─ store/ (zustand slices)
 │   │   ├─ services/ (api.js per resource)
 │   │   ├─ hooks/
 │   │   └─ utils/
 ├─ server/
 │   ├─ models/
 │   ├─ routes/
 │   ├─ controllers/
 │   ├─ middleware/ (auth, rbac, rateLimit, upload, audit)
 │   ├─ services/ (aiMcqExtraction.js, emailService.js, pdfService.js)
 │   └─ config/
 └─ README.md
```

---

## 10.5 Performance & Hosting Optimization (Vercel + Render reality check)

Free/low-tier hosting has specific weak points for a platform where students actually sit timed tests. These need to be designed in from day one, not patched later.

**#1 risk: Render free-tier cold starts.** The backend spins down after ~15 min idle; the next request can take 30–50 seconds to wake up. For a marketing site that's mildly annoying — for a student mid-login before a timed test, that's unacceptable. Two options:
- **Recommended:** Render's paid Starter instance (~$7/mo) — always-on, no sleep. Worth it even short-term for the test-taking flow alone.
- **Free workaround:** a scheduled keep-alive ping every 10 minutes (cron-job.org or UptimeRobot, both free) hitting a lightweight `/api/health` endpoint, so the backend never fully sleeps. Not bulletproof (can still miss a window) but works fine for a few months of moderate traffic.

**Frontend (Vercel) — fast by default, but enforce this:**
- Route-based code splitting (`React.lazy` + `Suspense`) — student/teacher/clerk/admin dashboards ship as separate bundles, only loaded after login for that role. Public visitors never download dashboard JS.
- Vercel's CDN edge caching handles static assets automatically — just make sure images/fonts are actually static builds, not inlined base64 blobs.
- Font preloading + subsetting (only the character sets/weights you use — don't ship 6 weights of a serif font for a two-weight design).
- Framer Motion page transitions kept short (200–300ms) — SPA routing means no full page reload anyway; transitions should feel instant, not add perceived delay.

**3D/hero motion — biggest bundle-size and mobile-CPU risk:**
- Lazy-mount the Spline/Three.js scene only when the hero enters viewport (`IntersectionObserver`), never blocking first paint.
- Detect connection quality (`navigator.connection.effectiveType`) and low-end/mobile devices → serve a static hero image/poster instead of the 3D scene. Bold motion on desktop/good connections, graceful fallback on mobile data — this is what keeps "maximal" motion from becoming "slow site" on a Ghotki 4G connection.
- `prefers-reduced-motion` respected throughout, not just on the hero.

**Search & data-heavy pages (Lectures, MCQ Bank):**
- Debounce search input (300ms) — don't fire a request per keystroke.
- MongoDB text indexes on `title`, `subject`, `questionText` fields — search hits an index, not a full collection scan.
- Hard pagination limit of 50 server-side (never send the whole collection to the client "just in case").
- Index all frequently filtered fields: `subject`, `chapter`, `class`, `status`, `testId`, `studentId`.

**Media — don't self-host video/large files on Render:**
- Render's free/starter disk and bandwidth aren't built for video streaming. Host lecture videos via Cloudinary video delivery or unlisted YouTube embeds; the database only stores the reference URL. Images always served through Cloudinary transformation URLs (`f_auto,q_auto,w_auto`) so each device gets a right-sized file, not a full-res image on a phone.

**API-level caching for rarely-changing public data:**
- Faculty list, hero media, success stories, prospectus — these change occasionally, not per-request. Add short-lived cache headers (5–10 min) or a simple in-memory cache (`node-cache`) on those specific GET routes so they don't hit MongoDB on every homepage visit.

**Responsive coverage — explicit breakpoints, not "it looks fine on my laptop":**
- Test/design at 360px, 390px (common phones), 768px (tablet portrait), 1024px (tablet landscape/small laptop), 1440px+.
- Tailwind mobile-first: base styles for phone, `md:`/`lg:` overrides upward — never the reverse.
- Touch targets ≥44px, no hover-only interactions (every hover effect needs a tap-equivalent state, since faculty tilt-cards and magnetic buttons are mouse-first ideas by default).
- Collapsible/drawer navbar on mobile, sticky on scroll for both mobile and desktop.
- For MCQ Bank's 50-per-page list on lower-end phones, consider list virtualization (`react-window`) if rows get render-heavy.

**Monitoring so you actually know if it's slow:**
- `/api/health` endpoint (doubles as the keep-alive ping target).
- Vercel Analytics (free tier) for frontend load times; Render's built-in metrics for backend response times and cold-start frequency — check these weekly during the first month.

---

## 10. Phased Build Roadmap

1. **Setup:** repo scaffold, MongoDB Atlas, env config, base auth (register/login/JWT/roles)
2. **Public site:** Home (hero 3D + slider), About, Faculty, Prospectus, Success Stories, Contact, responsive Navbar/Footer, WhatsApp button
3. **Auth flows:** email verification, approval workflow, password reset, protected route guards
4. **Student dashboard:** lectures view/search/filter, dashboard shell, settings/change password
5. **Test engine:** MCQ model, test creation (manual + random first), attempt flow (practice + test mode), server-side scoring, result/answer-sheet view, PDF export
6. **Teacher tools:** lecture upload, MCQ bank CRUD, results view (aggregate + individual)
7. **AI doc-to-test pipeline:** doc upload → extraction → AI structuring → pending review queue → approve/publish → wire into "create test from doc" method
8. **Clerk tools:** student approval queue, challan creation/download, success stories CRUD
9. **Admin tools:** hero media/faculty CRUD, staff account management, full oversight views, 2FA, audit log
10. **Analytics:** streak/avg/strong-weak computation service, dashboard charts
11. **Polish pass:** motion/3D refinement, reduced-motion fallback, accessibility check, SEO metadata, PWA manifest
12. **Testing & deploy:** role-based QA pass, load test file uploads, deploy (Vercel + Render + Atlas + Cloudinary), point domain

---
