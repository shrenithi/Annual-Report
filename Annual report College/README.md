# Annual Report Portal

A premium, glassmorphic Single Page Application (SPA) designed for educational and research institutes to compile, customize, edit, and integrate departmental annual reports into a single printable document.

This application is built entirely with client-side technologies (HTML5, CSS3, and Vanilla JavaScript) and uses local browser storage for data persistence, ensuring high performance, zero backend maintenance, and ease of deployment.

## 🚀 Key Features

* **Interactive Overview Dashboard:** Aggregated institutional metrics (faculty, publication counts, placement metrics, grants value) accompanied by responsive and animated Chart.js graphs.
* **Granular Department Editor (CRUD):** Form editors allowing HoDs to manage and update:
  * General metrics (student and faculty enrollment count, department head).
  * Academic papers and research publications (title, authors, journal, citation counts).
  * Grants and sponsored projects (awarding agency, value in INR, duration).
  * Placements (companies, number of students hired, salary packages).
  * Hosted events (seminars, conferences, hackathons).
  * Faculty and student achievements.
* **Integrated Report Compiler:** Compile all approved departmental records into a unified HTML publication. Customizations include title/subtitle, academic year selector, inclusion/exclusion of chapters, and three distinct design themes:
  * **Academic Classic:** Formal layout with elegant serif typography and deep navy accent colors.
  * **Modern Corporate:** Minimal layout with modern sans-serif typography and clean teal accent colors.
  * **Minimalist Tech:** Compact layout with monospace headings and charcoal shades.
* **Export & Print layout (`@media print`):** Supports printing the compiled report to paper or saving as a high-quality PDF with page breaks, table styling, and margins tailored for A4 size.
* **Workspace Backups (JSON Import/Export):** Export the entire local database state as a JSON file backup and restore backups to resume editing across browsers or machines.
* **Glassmorphic Notification Engine:** Smooth, animated sliding Toast popups that replace outdated browser alerts.

---

## 🛠️ File Structure

* `index.html`: Main application entry point containing layout slots and script loader sequences.
* `styles.css`: Central stylesheet containing layout variables, glassmorphic elements, grid specifications, and animations.
* `mockData.js`: Central data storage container. Bootstraps sample reports for 5 departments and manages reading/writing to `localStorage`.
* `charts.js`: Visualization controller managing Chart.js configurations, custom linear gradients, and offline safety fallbacks.
* `reportTemplate.js`: Compilation engine that formats active reports into printable HTML structures based on active layout settings.
* `app.js`: Application routing coordinator, data binding triggers, and user interaction event listeners.
* `package.json`: Project metadata and dev dependencies for local server execution.
* `upload.bat`: Automation script to link git and upload local code directly to your GitHub repository.

---

## 💻 Running the App

The portal is designed to run both **offline** (CORS-free) and via a **local web server**.

### Option A: Double-Click (CORS-Free Native Load)
Because variables are mapped to global namespaces, you do not need a server to test the app.
1. Navigate to the project directory.
2. Double-click `index.html` to open it in Chrome, Safari, Firefox, or Edge.

### Option B: Local Web Server (Recommended for Developers)
To run a local hot-reloading dev server using Vite:
1. Make sure [Node.js](https://nodejs.org) is installed on your system.
2. Open your terminal in the project directory.
3. Install development dependencies:
   ```bash
   npm install
   ```
4. Start the local server:
   ```bash
   npm run dev
   ```
5. Open the server link (usually `http://localhost:5173`) in your browser.

---

## 📦 Deployment Instructions

To publish the portal online for your institute:
1. Build the production files (if using Vite build tools):
   ```bash
   npm run build
   ```
2. Simply copy the static assets (`index.html`, `styles.css`, `app.js`, `charts.js`, `mockData.js`, `reportTemplate.js`) and upload them to any static web hosting provider (such as GitHub Pages, Vercel, Netlify, Amazon S3, or your institute's internal Apache/Nginx servers).
