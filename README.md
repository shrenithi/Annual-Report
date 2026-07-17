# Apex Enterprise Annual Report & Accreditation Portal

A production-ready, enterprise-grade Single Page Application (SPA) designed for educational institutes and universities to compile, review, sign, and submit departmental annual reports, NAAC/NBA quality benchmarks, placements, and student achievements.

Built entirely with standard client-side technologies (HTML5, CSS3, and Vanilla JavaScript) loaded sequentially, this system operates entirely **CORS-free** from the local file system (`file://` protocol) or high-performance static hosting solutions.

---

## 🚀 Key Modules & Architecture

The portal has been developed using a modular architecture divided into dedicated modules:

### 1. Centralized Core & Routing
*   **Database abstraction layer ([js/db.js](file:///c:/Users/user/Documents/Annual%20report%20College/js/db.js)):** Persistent client-side mock database wrappers supporting full CRUD operations over `localStorage` with offline backup/restore points.
*   **Sequential script loader ([index.html](file:///c:/Users/user/Documents/Annual%20report%20College/index.html)):** Registers all javascript scripts sequentially to prevent CORS imports restrictions.
*   **Sticky Search Header & Command Palette ([js/commandPalette.js](file:///c:/Users/user/Documents/Annual%20report%20College/js/commandPalette.js)):** Direct navigation lookup overlay triggered via `Ctrl + K` or by clicking the top global search bar.

### 2. Departmental Portals & Workflow Approvals
*   **12-Step Stepper Submission Wizard ([js/app.js](file:///c:/Users/user/Documents/Annual%20report%20College/js/app.js)):** Step-by-step compilation checklists for HoDs to compile publications, events, placements, and achievements with local draft history undo/redo stacks.
*   **Kanban Workflow Engine ([js/workflow.js](file:///c:/Users/user/Documents/Annual%20report%20College/js/workflow.js)):** Centralized approvals pipeline board with check selections supporting bulk approvals, rejection loops, and audit pipelines timelines.
*   **Digital Signature Pad ([js/signature.js](file:///c:/Users/user/Documents/Annual%20report%20College/js/signature.js)):** Stylized cursive font generators and touch canvases to sign approved records.

### 3. Analytics & Accreditation
*   **Accreditation Management ([js/accreditationManagement.js](file:///c:/Users/user/Documents/Annual%20report%20College/js/accreditationManagement.js)):** Accordion checklist trackers for NAAC Criteria 1 to 7, NBA objectives, and gap-analysis highlights.
*   **Analytics Trends & Gauges ([js/analytics.js](file:///c:/Users/user/Documents/Annual%20report%20College/js/analytics.js)):** Charts, gauges, and comparison tools mapping publication indices, placements, and student records across academic cycles.
*   **Leaderboard Rankings ([js/leaderboard.js](file:///c:/Users/user/Documents/Annual%20report%20College/js/leaderboard.js)):** Ranks department performances dynamically using weighted indicators.

---

## 🛠️ File Structure Directory Map

```text
├── index.html                   # Main template layout entry point
├── styles.css                   # Glassmorphic UI styles, variables, & responsive queries
├── js/
│   ├── app.js                   # Navigation router, main app controllers, & event binders
│   ├── auth.js                  # Login pane, user authentication, & OTP verification
│   ├── db.js                    # Database storage interface
│   ├── mockData.js              # Initial mock seeds
│   ├── userManagement.js        # User account creations, edits, & profiles
│   ├── departmentManagement.js  # Department details, faculty members, & tables
│   ├── fileUpload.js            # Document Center DMS, drag upload, & Recycle Bin
│   ├── calendar.js              # Academic events calendar scheduler
│   ├── studentAchievement.js    # Student portfolios, leaderboards, & achievement steppers
│   ├── placementManagement.js   # Company catalogs, salary grids, & placement steppers
│   ├── accreditationManagement.js # NAAC accordions, readiness indicators, & SSR logs
│   ├── securityManagement.js    # Session termination panel & manual backup points
│   ├── workflow.js              # Kanban boards & workflow approval pipelines
│   ├── reportTemplate.js        # Report builder cover page, watermarks, & print layout
│   ├── versionControl.js        # Document version comparison color-coded diff highlights
│   ├── translation.js           # Bilingual English & Tamil translation keys
│   ├── charts.js                # ChartJS gradients wrappers
│   ├── commandPalette.js        # Ctrl + K command palette drawer
│   ├── confetti.js              # Canvas confetti animations
│   ├── qrCode.js                # Canvas offline QR code drawing engine
│   └── signature.js             # Signature touch canvas & cursive stylizer
```

---

## 🔑 Role Permission Matrix

| Operation | Super Admin | Principal | IQAC Cell | HOD | Faculty | Student/Public |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Manage Users** | ✓ | ✕ | ✕ | ✕ | ✕ | ✕ |
| **System Settings** | ✓ | ✕ | ✕ | ✕ | ✕ | ✕ |
| **View Audit Logs** | ✓ | ✓ | ✓ | ✕ | ✕ | ✕ |
| **Verify reports** | ✓ | ✓ | ✓ | ✓ | ✕ | ✕ |
| **Compile reports** | ✓ | ✓ | ✓ | ✓ | ✕ | ✕ |
| **Edit Department Data** | ✓ | ✕ | ✕ | ✓ (Own) | ✓ (Own) | ✕ |
| **View Public Reports** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 💻 Running the App

### Double-Click Native Load (Offline)
Because files are linked sequentially, you can run the portal offline without a local server:
1. Navigate to the project folder directory.
2. Double-click **`index.html`** to load the application in any modern web browser.

### Local Development Web Server
To launch the application using a hot-reloading dev server:
1. Make sure [Node.js](https://nodejs.org) is installed.
2. Run in your terminal:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` inside your browser.
