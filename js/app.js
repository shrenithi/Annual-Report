/**
 * Core Application Controller for the Annual Report Management System.
 * Sequentially structured to support CORS-free file:// execution.
 */

// Global App State
let state = {
  departments: [],
  currentUser: null,
  currentView: "dashboard", 
  isDarkMode: true,
  currentLang: "en", // "en" or "ta"
  isSidebarCollapsed: false,
  
  // Editor View State
  activeEditorDepId: null,
  activeEditorTab: "general", // "general", "publications", "grants", "placements", "achievements", "history", "files"
  tempDepData: null,
  editorHistoryStack: [],
  editorRedoStack: []
};

const ICONS = {
  dashboard: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`,
  departments: `<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  compiler: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  settings: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  sun: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  alert: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  briefcase: `<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  bookOpen: `<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  award: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  graduation: `<svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`,
  comparison: `<svg viewBox="0 0 24 24"><path d="M17 3h-2v18h2V3zM7 11H5v10h2V11zm10 4H7v2h10v-2zm0-8H7v2h10V7z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  analytics: `<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  logout: `<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  bell: `<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`
};

// Global Toast display trigger
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  let icon = ICONS.check;
  if (type === "error" || type === "danger") icon = ICONS.trash;
  else if (type === "warning" || type === "info") icon = ICONS.alert;

  toast.innerHTML = `
    <span style="display: flex; flex-shrink: 0; width: 18px; height: 18px;">
      ${icon}
    </span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// Bind custom window listener to catch toasts from sub-modules
window.addEventListener("show-toast", (e) => {
  showToast(e.detail.message, e.detail.type);
});

// App shell layout components render
function renderSidebar() {
  const sidebarContainer = document.getElementById("sidebar-container");
  if (!sidebarContainer || !state.currentUser) return;

  const showSettings = window.canManageSettings(state.currentUser);

  sidebarContainer.innerHTML = `
    <aside class="sidebar ${state.isSidebarCollapsed ? "collapsed" : ""}">
      <div class="brand-section" style="display:flex; align-items:center; width:100%; flex-shrink:0; margin-bottom: 25px;">
        <div class="brand-logo" style="flex-shrink:0;">A</div>
        <div class="brand-name" style="margin-left:12px;">${window.t("brandName", state.currentLang)}</div>
        
        <button id="sidebar-toggle-btn" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:12px; margin-left:auto; display:block;">
          ${state.isSidebarCollapsed ? "▶" : "◀"}
        </button>
      </div>
      
      <ul class="nav-menu">
        <li>
            <a class="nav-item ${state.currentView === "dashboard" ? "active" : ""}" data-view="dashboard">
              ${ICONS.dashboard} <span>${window.t("dashboard", state.currentLang)}</span>
            </a>
          </li>
          <li>
            <a class="nav-item ${state.currentView === "departments" || state.currentView === "editor" ? "active" : ""}" data-view="departments">
              ${ICONS.departments} <span>${window.t("departments", state.currentLang)}</span>
            </a>
          </li>
          ${state.currentUser.role !== "Student / Public Viewer" ? `
            <li>
              <a class="nav-item ${state.currentView === "users" ? "active" : ""}" data-view="users">
                <span style="font-size: 18px; margin-right: 4px;">👥</span> <span>Users Management</span>
              </a>
            </li>
          ` : ""}
          <li>
            <a class="nav-item ${state.currentView === "dms" ? "active" : ""}" data-view="dms">
              <span style="font-size: 18px; margin-right: 4px;">📂</span> <span>Document Center</span>
            </a>
          </li>
          <li>
            <a class="nav-item ${state.currentView === "students" ? "active" : ""}" data-view="students">
              <span style="font-size: 18px; margin-right: 4px;">🎓</span> <span>Students Hub</span>
            </a>
          </li>
          <li>
            <a class="nav-item ${state.currentView === "placements" ? "active" : ""}" data-view="placements">
              <span style="font-size: 18px; margin-right: 4px;">💼</span> <span>Placements Center</span>
            </a>
          </li>
          <li>
            <a class="nav-item ${state.currentView === "accreditation" ? "active" : ""}" data-view="accreditation">
              <span style="font-size: 18px; margin-right: 4px;">📜</span> <span>Quality Accreditation</span>
            </a>
          </li>
          <li>
            <a class="nav-item ${state.currentView === "approvals" ? "active" : ""}" data-view="approvals">
              <span style="font-size: 18px; margin-right: 4px;">✍️</span> <span>Workflow Approvals</span>
            </a>
          </li>
          <li>
            <a class="nav-item ${state.currentView === "security" ? "active" : ""}" data-view="security">
              <span style="font-size: 18px; margin-right: 4px;">🛡️</span> <span>Security Center</span>
            </a>
          </li>
          <li>
            <a class="nav-item ${state.currentView === "compiler" ? "active" : ""}" data-view="compiler">
              ${ICONS.compiler} <span>${window.t("reportBuilder", state.currentLang)}</span>
            </a>
          </li>
          <li>
            <a class="nav-item ${state.currentView === "analytics" ? "active" : ""}" data-view="analytics">
              ${ICONS.analytics} <span>${window.t("analytics", state.currentLang)}</span>
            </a>
          </li>
          <li>
            <a class="nav-item ${state.currentView === "comparison" ? "active" : ""}" data-view="comparison">
              ${ICONS.comparison} <span>${window.t("comparison", state.currentLang)}</span>
            </a>
          </li>
          <li>
            <a class="nav-item ${state.currentView === "leaderboard" ? "active" : ""}" data-view="leaderboard">
              <span style="font-size:18px; margin-right:4px;">🏆</span> <span>${state.currentLang === "en" ? "Leaderboard" : "மதிப்பீட்டுப் பலகை"}</span>
            </a>
          </li>
          <li>
            <a class="nav-item ${state.currentView === "calendar" ? "active" : ""}" data-view="calendar">
              ${ICONS.calendar} <span>${window.t("calendar", state.currentLang)}</span>
            </a>
          </li>
          ${showSettings ? `
            <li>
              <a class="nav-item ${state.currentView === "settings" ? "active" : ""}" data-view="settings">
                ${ICONS.settings} <span>${window.t("settings", state.currentLang)}</span>
              </a>
            </li>
          ` : ""}
      </ul>

      <div class="sidebar-footer" style="display:flex; flex-direction:column; gap:12px; border-top:1px solid var(--border); padding-top:15px; flex-shrink:0; width:100%;">
        <!-- Theme & Tamil Toggle Grid -->
        <div style="display:flex; gap:10px; width:100%;">
          <button class="toggle-btn" id="theme-toggle" style="flex:1; justify-content:center; padding:8px; font-size:11px;">
            ${state.isDarkMode ? ICONS.sun + " Light" : ICONS.moon + " Dark"}
          </button>
          
          <button class="toggle-btn" id="lang-toggle" style="flex:1; justify-content:center; padding:8px; font-size:11px; font-weight:600;">
            ${state.currentLang === "en" ? "தமிழ்" : "English"}
          </button>
        </div>

        <button class="toggle-btn" id="logout-btn" style="width:100%; justify-content:center; background: rgba(239, 68, 68, 0.1); color:#ef4444; border:1px solid rgba(239, 68, 68, 0.2);">
          ${ICONS.logout} <span>${window.t("logout", state.currentLang)}</span>
        </button>
      </div>
    </aside>
  `;

  // Apply expanded/collapsed main offsets
  const contentPane = document.getElementById("content-pane");
  if (contentPane) {
    if (state.isSidebarCollapsed) contentPane.classList.add("expanded");
    else contentPane.classList.remove("expanded");
  }

  // Bind Menu Click Routes
  sidebarContainer.querySelectorAll("[data-view]").forEach(item => {
    item.addEventListener("click", (e) => {
      const view = e.currentTarget.getAttribute("data-view");
      navigateTo(view);
    });
  });

  // Bind footer events
  sidebarContainer.querySelector("#theme-toggle")?.addEventListener("click", toggleTheme);
  sidebarContainer.querySelector("#lang-toggle")?.addEventListener("click", toggleLanguage);
  sidebarContainer.querySelector("#logout-btn")?.addEventListener("click", () => {
    window.logoutUser();
    state.currentUser = null;
    window.destroyCharts();
    initApp();
  });

  // Bind Sidebar Collapse toggle
  sidebarContainer.querySelector("#sidebar-toggle-btn").addEventListener("click", () => {
    state.isSidebarCollapsed = !state.isSidebarCollapsed;
    renderSidebar();
  });
}

function toggleTheme() {
  state.isDarkMode = !state.isDarkMode;
  if (state.isDarkMode) {
    document.body.classList.remove("light-theme");
    localStorage.setItem("annual_report_portal_theme", "dark");
  } else {
    document.body.classList.add("light-theme");
    localStorage.setItem("annual_report_portal_theme", "light");
  }
  
  renderSidebar();
  
  if (state.currentView === "dashboard") {
    window.renderDashboardCharts(state.departments, state.isDarkMode);
  } else if (state.currentView === "analytics") {
    window.renderAnalyticsPanel(document.getElementById("content-pane").firstChild);
  } else if (state.currentView === "comparison") {
    window.renderDepartmentComparison(document.getElementById("content-pane").firstChild);
  }
}

function toggleLanguage() {
  state.currentLang = state.currentLang === "en" ? "ta" : "en";
  renderSidebar();
  navigateTo(state.currentView);
}

// Router Navigation state coordinator
async function navigateTo(view, params = {}) {
  state.currentView = view;
  window.destroyCharts();

  document.querySelectorAll(".nav-item").forEach(item => {
    if (item.getAttribute("data-view") === view) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  const contentPane = document.getElementById("content-pane");
  if (!contentPane) return;
  contentPane.innerHTML = "";

  const pageWrapper = document.createElement("div");
  pageWrapper.className = "animate-fade-in";
  contentPane.appendChild(pageWrapper);

  // Render Page Header Profile dropdown menu + bell notifications
  await renderTopHeader(pageWrapper);

  const viewContainer = document.createElement("div");
  viewContainer.style.marginTop = "20px";
  pageWrapper.appendChild(viewContainer);

  switch (view) {
    case "dashboard":
      await drawDashboardView(viewContainer);
      break;
    case "departments":
      await window.renderDepartmentsManagement(viewContainer);
      break;
    case "users":
      await window.renderUsersManagement(viewContainer);
      break;
    case "dms":
      await window.renderDocumentManagementSystem(viewContainer);
      break;
    case "students":
      await window.renderStudentAchievementsSystem(viewContainer);
      break;
    case "placements":
      await window.renderPlacementManagementSystem(viewContainer);
      break;
    case "accreditation":
      await window.renderAccreditationSystem(viewContainer);
      break;
    case "approvals":
      await window.renderCentralizedWorkflowSystem(viewContainer);
      break;
    case "security":
      await window.renderSecurityManagementSystem(viewContainer);
      break;
    case "editor":
      await drawDepartmentEditorView(viewContainer, params.id);
      break;
    case "compiler":
      await drawReportCompilerView(viewContainer);
      break;
    case "analytics":
      await window.renderAnalyticsPanel(viewContainer);
      break;
    case "comparison":
      await window.renderDepartmentComparison(viewContainer);
      break;
    case "leaderboard":
      await window.renderLeaderboardPanel(viewContainer);
      break;
    case "calendar":
      await window.renderAcademicCalendar(viewContainer, state.currentUser);
      break;
    case "settings":
      await drawSettingsView(viewContainer);
      break;
    default:
      viewContainer.innerHTML = `<h3>View Not Found</h3>`;
  }

  // Draw floating Quick Action FAB in corner
  drawFloatingActionButton(pageWrapper);
}

async function renderTopHeader(parentContainer) {
  const settings = await window.getSettings();
  const notifs = await window.getNotifications();
  const unreadCount = notifs.filter(n => !n.read).length;

  const header = document.createElement("header");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.paddingBottom = "15px";
  header.style.borderBottom = "1px solid var(--border)";

  header.innerHTML = `
    <!-- Institution Details -->
    <div>
      <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--primary); letter-spacing: 0.5px; font-family: var(--font-title);">
        ${settings.academicYear} Academic Report Sync
      </span>
      <h2 style="font-family: var(--font-title); font-size: 16px; font-weight: 600; color: var(--text-main); margin-top: 2px;">
        ${settings.instituteName}
      </h2>
    </div>

    <!-- Center Search trigger -->
    <div style="flex-grow:0.4; max-width:240px; position:relative; cursor:pointer;" id="header-search-palette-trigger">
      <div style="background:var(--card-bg); border:1px solid var(--border); border-radius:8px; padding:6px 12px; font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center;">
        <span>Search commands...</span>
        <kbd style="font-size:9px; background:rgba(255,255,255,0.06); padding:2px 4px; border-radius:4px; border:1px solid var(--border);">Ctrl+K</kbd>
      </div>
    </div>

    <!-- Notification bell + user info dropdown -->
    <div style="display:flex; align-items:center; gap:20px; position:relative;">
      
      <!-- Bell -->
      <div style="position:relative; cursor:pointer;" id="bell-notif-trigger">
        <span style="display:flex; width:22px; height:22px; color:var(--text-muted);">
          ${ICONS.bell}
        </span>
        ${unreadCount > 0 ? `
          <span style="position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font-size:9px; font-weight:bold; border-radius:50%; width:15px; height:15px; display:flex; align-items:center; justify-content:center;">
            ${unreadCount}
          </span>
        ` : ""}
      </div>

      <!-- Notifications Dropdown Box -->
      <div id="notifications-box-dropdown" class="glass-card" style="display:none; position:absolute; top:35px; right:150px; width:300px; max-height:360px; overflow-y:auto; z-index:1000; padding:15px; box-shadow: var(--shadow);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:8px;">
          <strong style="font-size:12px;">Notifications</strong>
          <button class="btn btn-sm" id="mark-notifs-read-btn" style="font-size:10px; padding:3px 6px;">Mark all read</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;" id="dropdown-notif-list">
          ${notifs.length === 0 ? '<p style="font-size:11px; color:var(--text-muted); text-align:center;">No recent alerts.</p>' : notifs.map(n => `
            <div style="font-size:11px; padding:8px; border-radius:6px; background: ${n.read ? "transparent" : "rgba(14, 165, 233, 0.05)"}; border: 1px solid ${n.read ? "transparent" : "rgba(14, 165, 233, 0.15)"}">
              <p style="margin:0; font-weight:${n.read ? "normal" : "600"};">${n.message}</p>
              <span style="font-size:9px; color:var(--text-muted);">${n.timestamp}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- User Profile widget -->
      <div style="display:flex; align-items:center; gap:10px; border-left:1px solid var(--border); padding-left:20px;">
        <img src="${state.currentUser.avatar}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:1px solid var(--primary);">
        <div style="text-align:left;">
          <div style="font-size:12px; font-weight:600; color:var(--text-main); font-family:var(--font-title);">${state.currentUser.name}</div>
          <div style="font-size:10px; color:var(--text-muted); display:flex; align-items:center; gap:4px;">
            <span class="status-badge" style="padding:2px 4px; font-size:8px; border-radius:4px;">${state.currentUser.role}</span>
            <span>${state.currentUser.department.toUpperCase()}</span>
          </div>
        </div>
      </div>

    </div>
  `;

  parentContainer.appendChild(header);

  // Bind search click palette trigger
  header.querySelector("#header-search-palette-trigger").addEventListener("click", () => {
    if (window.triggerCommandPalette) window.triggerCommandPalette();
  });

  // Bind notification bell dropdown toggling
  const trigger = header.querySelector("#bell-notif-trigger");
  const dropdown = header.querySelector("#notifications-box-dropdown");
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    if (dropdown) dropdown.style.display = "none";
  });

  header.querySelector("#mark-notifs-read-btn")?.addEventListener("click", async (e) => {
    e.stopPropagation();
    await window.markAllNotificationsRead();
    showToast("Notifications cleared", "info");
    navigateTo(state.currentView);
  });
}

function drawFloatingActionButton(parent) {
  const existingFab = document.getElementById("floating-quick-action-fab");
  if (existingFab) existingFab.remove();

  const fab = document.createElement("button");
  fab.id = "floating-quick-action-fab";
  fab.innerHTML = "⚡";
  fab.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    border: none;
    color: #ffffff;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 999;
    transition: transform 0.2s;
  `;

  fab.addEventListener("mouseenter", () => fab.style.transform = "scale(1.1)");
  fab.addEventListener("mouseleave", () => fab.style.transform = "scale(1)");
  fab.addEventListener("click", () => {
    if (window.triggerCommandPalette) window.triggerCommandPalette();
  });

  parent.appendChild(fab);
}

// ----------------- PAGE VIEWS DRAWERS -----------------

// 1. Dashboard View
// Global preferences config helper
const CUSTOM_DASHBOARD_KEY = "arm_dashboard_custom_layout_v2";

function loadWidgetsConfig() {
  const defaults = [
    { id: "widget-kpis", title: "Summary KPI Cards", visible: true, order: 0 },
    { id: "widget-progress", title: "Milestones Progress Tracker", visible: true, order: 1 },
    { id: "widget-deadline", title: "Deadline Countdown Tracker", visible: true, order: 2 },
    { id: "widget-ai-insights", title: "AI Insights & Risk Audits", visible: true, order: 3 },
    { id: "widget-diagnostics", title: "System Diagnostics & Status", visible: true, order: 4 },
    { id: "widget-actions", title: "Quick Actions Shortcuts", visible: true, order: 5 },
    { id: "widget-analytics", title: "Accreditation Analytics", visible: true, order: 6 },
    { id: "widget-table", title: "Recent Submissions Table", visible: true, order: 7 },
    { id: "widget-leaderboard", title: "Department Leaderboard", visible: true, order: 8 },
    { id: "widget-timeline", title: "Activity Audit Logs", visible: true, order: 9 },
    { id: "widget-events", title: "Upcoming Milestones Events", visible: true, order: 10 }
  ];
  try {
    const saved = localStorage.getItem(CUSTOM_DASHBOARD_KEY);
    if (saved) return JSON.parse(saved);
  } catch(e){}
  return defaults;
}

function saveWidgetsConfig(config) {
  localStorage.setItem(CUSTOM_DASHBOARD_KEY, JSON.stringify(config));
}

// ----------------- WIDGETS RENDERING HELPERS -----------------

function renderKpiWidget(deps, settings) {
  const totalFaculty = deps.reduce((s, d) => s + d.facultyCount, 0);
  const totalStudents = deps.reduce((s, d) => s + d.studentCount, 0);
  const totalPubs = deps.reduce((s, d) => s + (d.metrics?.publications?.length || 0), 0);
  const totalGrants = deps.reduce((s, d) => s + (d.metrics?.grants || []).reduce((acc,curr)=>acc+curr.amount, 0), 0) / 100000;
  const approvedCount = deps.filter(d => d.status === "Approved").length;
  const submittedCount = deps.filter(d => d.status === "Submitted").length;
  const pendingCount = deps.filter(d => d.status === "Draft" || d.status === "Rejected").length;

  return `
    <div class="stats-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
      <div class="stat-card" style="border-left: 4px solid var(--primary); padding:15px; position:relative; background:var(--card-bg); border-radius:10px;">
        <span style="font-size:10px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Total Departments</span>
        <h2 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${deps.length}</h2>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:9px; color:var(--text-muted);">
          <span>Active portals</span>
          <svg viewBox="0 0 100 30" width="60" height="18"><path d="M0 20 L20 15 L40 25 L60 10 L80 15 L100 5" fill="none" stroke="var(--primary)" stroke-width="1.5"/></svg>
        </div>
      </div>
      <div class="stat-card" style="border-left: 4px solid var(--success); padding:15px; position:relative; background:var(--card-bg); border-radius:10px;">
        <span style="font-size:10px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Reports Approved</span>
        <h2 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${approvedCount}</h2>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:9px; color:var(--success);">
          <span>↑ +12.4% vs LY</span>
          <svg viewBox="0 0 100 30" width="60" height="18"><path d="M0 25 L25 20 L50 15 L75 10 L100 5" fill="none" stroke="var(--success)" stroke-width="1.5"/></svg>
        </div>
      </div>
      <div class="stat-card" style="border-left: 4px solid var(--warning); padding:15px; position:relative; background:var(--card-bg); border-radius:10px;">
        <span style="font-size:10px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Pending reviews</span>
        <h2 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${pendingCount}</h2>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:9px; color:var(--warning);">
          <span>Requires review</span>
          <svg viewBox="0 0 100 30" width="60" height="18"><path d="M0 5 L30 15 L60 10 L100 25" fill="none" stroke="var(--warning)" stroke-width="1.5"/></svg>
        </div>
      </div>
      <div class="stat-card" style="border-left: 4px solid var(--secondary); padding:15px; position:relative; background:var(--card-bg); border-radius:10px;">
        <span style="font-size:10px; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Publications logged</span>
        <h2 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${totalPubs}</h2>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:9px; color:var(--secondary);">
          <span>↑ +18.2% vs LY</span>
          <svg viewBox="0 0 100 30" width="60" height="18"><path d="M0 20 Q30 5, 60 15 T100 2" fill="none" stroke="var(--secondary)" stroke-width="1.5"/></svg>
        </div>
      </div>
    </div>
  `;
}

function renderProgressWidget(deps) {
  const approved = deps.filter(d => d.status === "Approved").length;
  const overallProgress = Math.round((approved / deps.length) * 100);

  return `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div>
        <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
          <span>Institutional Completion Rate</span>
          <strong>${overallProgress}% Approved</strong>
        </div>
        <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
          <div style="width:${overallProgress}%; height:100%; background:linear-gradient(to right, var(--success), var(--primary));"></div>
        </div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
          <span>Research Data Completion</span>
          <strong>88% Verified</strong>
        </div>
        <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
          <div style="width:88%; height:100%; background:var(--primary);"></div>
        </div>
      </div>
    </div>
  `;
}

function renderDeadlineWidget(deps) {
  // Mock July 30, 2026 deadline. July 8 current date = 22 days remaining
  const daysRemaining = 22;
  const progress = 70;
  const isApproaching = daysRemaining < 10;

  return `
    <div style="display:flex; flex-direction:column; gap:12px; text-align:left;">
      <div style="padding:12px; border-radius:8px; background:${isApproaching ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.05)"}; border:1px solid ${isApproaching ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.1)"};">
        <span style="font-size:10px; color:var(--text-muted); font-weight:bold;">SUBMISSION DEADLINE: JULY 30, 2026</span>
        <h2 style="font-family:var(--font-title); font-size:20px; font-weight:800; color:${isApproaching ? "var(--danger)" : "var(--success)"}; margin:3px 0;">
          ${daysRemaining} Days Remaining
        </h2>
      </div>
      <div>
        <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden; margin-bottom:10px;">
          <div style="width:${progress}%; height:100%; background:var(--primary);"></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:10px;">
          <div style="background:rgba(255,255,255,0.02); padding:6px; border-radius:4px;">
            <span style="color:var(--text-muted); display:block;">Completed</span>
            <strong>${deps.filter(d => d.status === "Approved").length} Departments</strong>
          </div>
          <div style="background:rgba(255,255,255,0.02); padding:6px; border-radius:4px;">
            <span style="color:var(--text-muted); display:block;">Outstanding Drafts</span>
            <strong>${deps.filter(d => d.status === "Draft" || d.status === "Rejected").length} Departments</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAIInsightsWidget(deps) {
  return `
    <div style="font-size: 13px; color: var(--text-main); line-height: 1.6; display: flex; flex-direction: column; gap: 10px; text-align:left;">
      <p>🔮 <strong>AI Summary:</strong> Institution performance grew by <strong>18%</strong> year-over-year. The CSE department is leading research publications, while ECE has secured significant VLSI funding. Gaps detected in Mechanical Engineering patent logs.</p>
      <div style="border-top: 1px dashed var(--border); padding-top: 10px; font-size: 12px; color: var(--text-muted);">
        <strong>Recommendations:</strong>
        <ul style="margin-left: 20px; margin-top: 5px; list-style-type: square; display: flex; flex-direction: column; gap: 4px;">
          <li>Approve pending reports for ECE to release consolidated compilation.</li>
          <li>Encourage ME department to sync outstanding files proof sheets.</li>
        </ul>
      </div>
    </div>
  `;
}

function renderDiagnosticsWidget(deps) {
  return `
    <div style="display: flex; flex-direction: column; gap: 12px; font-size: 12px; text-align:left;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
        <span style="color: var(--text-muted);">Local Storage Usage</span>
        <strong>${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB / 5 MB</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
        <span style="color: var(--text-muted);">Database Integrity</span>
        <span style="color: var(--success); font-weight: bold;">CONNECTED / HEALTHY</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
        <span style="color: var(--text-muted);">AI Models Status</span>
        <span style="color: var(--primary); font-weight: bold;">98% READY (LOCAL)</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding-bottom: 4px;">
        <span style="color: var(--text-muted);">Institutional Index</span>
        <strong>${Math.round((deps.filter(d => d.status === "Approved").length / deps.length) * 100)}% Published</strong>
      </div>
    </div>
  `;
}

function renderActionsWidget(deps) {
  const role = state.currentUser.role;
  let buttons = "";

  if (role === "Super Admin" || role === "Principal") {
    buttons = `
      <button class="btn btn-sm btn-primary" style="justify-content:center;" onclick="navigateTo('departments')">✍️ Approve Reports</button>
      <button class="btn btn-sm" style="justify-content:center; background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.2);" onclick="navigateTo('settings')">📥 Backup Data</button>
      <button class="btn btn-sm" style="justify-content:center; background:rgba(168,85,247,0.1); color:#a855f7; border:1px solid rgba(168,85,247,0.2);" onclick="navigateTo('compiler')">📃 Compile Report</button>
    `;
  } else {
    buttons = `
      <button class="btn btn-sm btn-primary" style="justify-content:center;" onclick="navigateTo('departments')">✍️ Edit Department</button>
      <button class="btn btn-sm" style="justify-content:center;" onclick="navigateTo('calendar')">📅 Add Event</button>
      <button class="btn btn-sm" style="justify-content:center;" onclick="navigateTo('comparison')">📊 Compare Metrics</button>
    `;
  }

  return `
    <div style="display:grid; grid-template-columns:1fr; gap:10px;">
      ${buttons}
    </div>
  `;
}

function renderAnalyticsWidget(deps) {
  const activeTab = state.activeDashboardTab || "research";

  return `
    <div style="display:flex; flex-direction:column; gap:15px;">
      <!-- Tabs header selector -->
      <div style="display:flex; gap:10px; border-bottom:1px solid var(--border); padding-bottom:10px; overflow-x:auto;">
        <button class="tab-btn btn-xs ${activeTab === "research" ? "active" : ""}" data-tab-id="research">Research Output</button>
        <button class="tab-btn btn-xs ${activeTab === "placements" ? "active" : ""}" data-tab-id="placements">Career Placements</button>
        <button class="tab-btn btn-xs ${activeTab === "funding" ? "active" : ""}" data-tab-id="funding">Funding & Status</button>
      </div>

      <!-- Fullscreen and export controls -->
      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:-5px;">
        <button class="btn btn-xs" id="btn-chart-export">📥 Export Image</button>
      </div>

      <!-- Canvases grid -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; min-height:280px;">
        ${activeTab === "research" ? `
          <div style="height:250px; display:flex; flex-direction:column;">
            <span style="font-size:11px; color:var(--text-muted); margin-bottom:10px; display:block; text-align:left;">Publications Citations Output</span>
            <div style="flex-grow:1; position:relative;"><canvas id="publicationsChart"></canvas></div>
          </div>
          <div style="height:250px; display:flex; flex-direction:column;">
            <span style="font-size:11px; color:var(--text-muted); margin-bottom:10px; display:block; text-align:left;">Faculty Contribution Share</span>
            <div style="flex-grow:1; position:relative;"><canvas id="shareChart"></canvas></div>
          </div>
        ` : activeTab === "placements" ? `
          <div style="height:250px; display:flex; flex-direction:column;">
            <span style="font-size:11px; color:var(--text-muted); margin-bottom:10px; display:block; text-align:left;">Average Placement Packages (LPA)</span>
            <div style="flex-grow:1; position:relative;"><canvas id="placementsChart"></canvas></div>
          </div>
          <div style="height:250px; display:flex; flex-direction:column;">
            <span style="font-size:11px; color:var(--text-muted); margin-bottom:10px; display:block; text-align:left;">Placements Hires Trend</span>
            <div style="flex-grow:1; position:relative;"><canvas id="placementTrendChart"></canvas></div>
          </div>
        ` : `
          <div style="height:250px; display:flex; flex-direction:column;">
            <span style="font-size:11px; color:var(--text-muted); margin-bottom:10px; display:block; text-align:left;">Sponsored Research Grants</span>
            <div style="flex-grow:1; position:relative;"><canvas id="fundingChart"></canvas></div>
          </div>
          <div style="height:250px; display:flex; flex-direction:column;">
            <span style="font-size:11px; color:var(--text-muted); margin-bottom:10px; display:block; text-align:left;">Submission Workflow Standings</span>
            <div style="flex-grow:1; position:relative;"><canvas id="statusChart"></canvas></div>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderTableWidget(deps) {
  const searchTerm = state.dashboardSearchTerm || "";
  const filtered = deps.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination config
  const itemsPerPage = 3;
  const currentPage = state.dashboardTablePage || 1;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <!-- Table filters header -->
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
        <input type="text" class="form-control" id="table-search-input" value="${searchTerm}" placeholder="Filter by department name..." style="max-width:240px; font-size:11px; padding:6px 12px;">
        <span style="font-size:11px; color:var(--text-muted);">${filtered.length} entries found</span>
      </div>

      <!-- Table element -->
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:11px; text-align:left;">
          <thead>
            <tr style="border-bottom:1px solid var(--border);">
              <th style="padding:10px; color:var(--text-muted);">Department</th>
              <th style="padding:10px; color:var(--text-muted);">HOD / Submitter</th>
              <th style="padding:10px; color:var(--text-muted);">Status</th>
              <th style="padding:10px; color:var(--text-muted);">Last Sync</th>
              <th style="padding:10px; color:var(--text-muted); text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.length === 0 ? `<tr><td colspan="5" style="padding:20px; text-align:center; color:var(--text-muted);">No matching reports found.</td></tr>` : paginated.map(d => `
              <tr style="border-bottom:1px dashed var(--border); transition:background 0.2s;" class="table-row-hover">
                <td style="padding:10px; font-weight:bold;">${d.name}</td>
                <td style="padding:10px;">${d.head}</td>
                <td style="padding:10px;">${window.getStatusBadgeHtml(d.status)}</td>
                <td style="padding:10px; color:var(--text-muted);">${d.lastUpdated}</td>
                <td style="padding:10px; text-align:right; display:flex; gap:6px; justify-content:flex-end;">
                  <button class="btn btn-sm btn-xs btn-preview-report" data-preview-id="${d.id}" style="padding:2px 6px;">Preview</button>
                  <button class="btn btn-sm btn-xs" style="padding:2px 6px;" onclick="navigateTo('editor', { id: '${d.id}' })">Edit</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <!-- Pagination footer controls -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; border-top:1px solid var(--border); padding-top:10px;">
        <span style="font-size:11px; color:var(--text-muted);">Page ${currentPage} of ${totalPages}</span>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-sm" id="btn-table-prev" ${currentPage === 1 ? "disabled" : ""} style="padding:4px 8px;">Previous</button>
          <button class="btn btn-sm" id="btn-table-next" ${currentPage === totalPages ? "disabled" : ""} style="padding:4px 8px;">Next</button>
        </div>
      </div>
    </div>
  `;
}

function renderLeaderboardWidget(deps) {
  const getScore = (d) => {
    const publicationsScore = (d.metrics?.publications || []).reduce((acc, curr) => acc + (curr.citations || 0), 0) * 10;
    const grantsScore = ((d.metrics?.grants || []).reduce((acc, curr) => acc + (curr.amount || 0), 0) / 10000);
    const placementsScore = (d.metrics?.placements || []).reduce((acc, curr) => acc + (curr.studentsPlaced || 0), 0) * 15;
    const patentsScore = (d.metrics?.patents || []).length * 50;
    return Math.round(publicationsScore + grantsScore + placementsScore + patentsScore);
  };

  const ranked = deps.map(d => ({
    id: d.id,
    name: d.name,
    score: getScore(d),
    pct: window.calculateReportProgress(d).percentage
  })).sort((a,b) => b.score - a.score);

  return `
    <div style="display:flex; flex-direction:column; gap:10px; text-align:left;">
      ${ranked.map((d, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-radius:6px; background:rgba(255,255,255,0.02); font-size:11px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <strong style="color:var(--primary); font-size:13px;">#${idx + 1}</strong>
            <span>${d.name}</span>
            ${idx === 0 ? `<span style="background:var(--primary-glow); color:var(--primary); font-size:8px; padding:1px 4px; border-radius:4px; font-weight:bold;">TOP</span>` : ""}
          </div>
          <span style="font-weight:bold;">${d.score.toLocaleString()} pts</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderTimelineWidget(logs) {
  return `
    <div style="display:flex; flex-direction:column; gap:15px; max-height:220px; overflow-y:auto; text-align:left;">
      ${logs.length === 0 ? '<p style="font-size:11px; color:var(--text-muted); text-align:center;">No activity recorded.</p>' : logs.map(l => `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; border-bottom:1px dashed var(--border); padding-bottom:8px;">
          <div>
            <span style="font-weight:600; color:var(--primary);">${l.username}</span>
            <span style="margin-left: 5px;">${l.action}</span>
          </div>
          <span style="color:var(--text-muted); font-size:9px;">${l.timestamp}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderEventsWidget(deps) {
  const events = [
    { name: "Accreditation Submission deadline", date: "July 30, 2026", type: "accreditation" },
    { name: "CSE National Research Symposium", date: "July 18, 2026", type: "event" },
    { name: "Faculty publications verification", date: "July 15, 2026", type: "audit" }
  ];

  return `
    <div style="display:flex; flex-direction:column; gap:10px; text-align:left;">
      ${events.map(e => `
        <div style="padding:10px; border-radius:6px; background:rgba(255,255,255,0.02); border:1px solid var(--border); font-size:11px;">
          <div style="display:flex; justify-content:space-between; font-weight:600; margin-bottom:3px;">
            <span>${e.name}</span>
            <span style="font-size:9px; background:var(--primary-glow); color:var(--primary); padding:1px 5px; border-radius:4px;">${e.type.toUpperCase()}</span>
          </div>
          <span style="color:var(--text-muted); font-size:10px;">Scheduled: ${e.date}</span>
        </div>
      `).join("")}
    </div>
  `;
}

// ----------------- MAIN VIEW BUILDER -----------------

async function drawDashboardView(container) {
  const deps = state.departments;
  const settings = await window.getSettings();
  const logs = await window.getActivityLogs();

  // Load custom widgets configurations
  dashboardWidgets = loadWidgetsConfig();
  const sortedWidgets = [...dashboardWidgets].sort((a, b) => a.order - b.order);

  // Initialize active tab if blank
  if (!state.activeDashboardTab) state.activeDashboardTab = "research";

  // Build Greeting
  const currentHour = new Date().getHours();
  let greeting = "Good Morning";
  if (currentHour >= 12 && currentHour < 17) greeting = "Good Afternoon";
  else if (currentHour >= 17) greeting = "Good Evening";

  const leftWidgetIds = ["widget-kpis", "widget-analytics", "widget-table"];
  const rightWidgetIds = ["widget-progress", "widget-deadline", "widget-ai-insights", "widget-leaderboard", "widget-timeline", "widget-events", "widget-actions", "widget-diagnostics"];

  const renderSingleWidgetHtml = (w) => {
    if (!w.visible) return "";
    const content = widgetRenderers[w.id](deps, settings, logs);
    return `
      <div class="glass-card widget-card animate-fade-in" id="${w.id}" style="padding: 22px; border-radius:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px;">
          <h3 style="font-family: var(--font-title); font-size: 11px; font-weight: 700; color: var(--text-main); text-transform:uppercase; letter-spacing:0.5px;">${w.title}</h3>
          <div class="widget-controls">
            <button class="widget-control-btn btn-move-up" data-widget-id="${w.id}" title="Move Up">▲</button>
            <button class="widget-control-btn btn-move-down" data-widget-id="${w.id}" title="Move Down">▼</button>
            <button class="widget-control-btn btn-fullscreen" data-widget-id="${w.id}" title="Fullscreen">⛶</button>
            <button class="widget-control-btn btn-close-widget" data-widget-id="${w.id}" title="Hide">✕</button>
          </div>
        </div>
        <div class="widget-body">
          ${content}
        </div>
      </div>
    `;
  };

  const leftWidgetsHtml = sortedWidgets
    .filter(w => leftWidgetIds.includes(w.id))
    .map(w => renderSingleWidgetHtml(w))
    .join("");

  const rightWidgetsHtml = sortedWidgets
    .filter(w => rightWidgetIds.includes(w.id))
    .map(w => renderSingleWidgetHtml(w))
    .join("");

  container.innerHTML = `
    <!-- Top Welcome Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px; border-bottom:1px solid var(--border); padding-bottom:15px;">
      <div>
        <h1 style="font-family: var(--font-title); font-size: 20px; font-weight: 700; color: var(--text-main);">
          ${greeting}, Welcome back!
        </h1>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
          ${state.currentUser.name} &bull; ${state.currentUser.role} &bull; AY ${settings.academicYear} &bull; ${new Date().toLocaleDateString()}
        </p>
      </div>
      <button class="btn btn-sm btn-primary" id="btn-open-customizer" style="display:flex; align-items:center; gap:6px;">
        ⚙️ Customize Layout
      </button>
    </div>

    <style>
      .dashboard-grid-responsive {
        display: grid;
        grid-template-columns: 2.2fr 1fr;
        gap: 25px;
        align-items: start;
      }
      @media (max-width: 1024px) {
        .dashboard-grid-responsive {
          grid-template-columns: 1fr !important;
        }
      }
    </style>

    <!-- Widgets layout container -->
    <div class="dashboard-grid-responsive">
      <!-- Left Column -->
      <div style="display:flex; flex-direction:column; gap:20px;">
        ${leftWidgetsHtml}
      </div>
      <!-- Right Column (Sidebar Details) -->
      <div style="display:flex; flex-direction:column; gap:20px;">
        ${rightWidgetsHtml}
      </div>
    </div>

    <!-- CUSTOMIZER MODAL OVERLAY -->
    <div id="widget-customizer-modal" class="glass-card" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:10000; width:90%; max-width:480px; padding:25px; box-shadow:var(--shadow);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px;">
        <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700;">Customize Dashboard Layout</h3>
        <button class="btn btn-sm" id="widget-customizer-close" style="padding:4px 8px;">✕</button>
      </div>
      <p style="font-size:11px; color:var(--text-muted); margin-bottom:15px;">Enable or disable visibility, and rearrange widget rendering order.</p>
      <div id="widget-customizer-list" style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px; max-height:260px; overflow-y:auto;">
        <!-- Populated dynamically -->
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn btn-sm" id="widget-customizer-restore">Restore Defaults</button>
        <button class="btn btn-sm btn-primary" id="widget-customizer-save">Apply Changes</button>
      </div>
    </div>

    <!-- PREVIEW REPORT OVERLAY MODAL -->
    <div id="report-preview-modal-overlay" class="glass-card" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:10000; justify-content:center; align-items:center; padding:20px;">
      <div class="glass-card" style="width:100%; max-width:550px; padding:25px; box-shadow:var(--shadow); background:var(--bg);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px;">
          <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700;" id="preview-modal-title">Department details</h3>
          <button class="btn btn-sm" id="preview-modal-close" style="padding:4px 8px;">✕</button>
        </div>
        <div id="preview-modal-body" style="font-size:12px; display:flex; flex-direction:column; gap:12px; text-align:left;">
          <!-- Loaded dynamically -->
        </div>
      </div>
    </div>
  `;

  // Bind customizer open
  container.querySelector("#btn-open-customizer").addEventListener("click", () => {
    const modal = document.getElementById("widget-customizer-modal");
    const list = document.getElementById("widget-customizer-list");
    
    list.innerHTML = dashboardWidgets.map((w, idx) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px dashed var(--border);">
        <label style="cursor:pointer; font-size:12px; display:flex; align-items:center; gap:8px;">
          <input type="checkbox" class="chk-widget-visible" data-widget-id="${w.id}" ${w.visible ? "checked" : ""}>
          <span>${w.title}</span>
        </label>
        <div style="display:flex; gap:5px;">
          <button class="btn btn-xs btn-modal-up" data-widget-id="${w.id}">▲</button>
          <button class="btn btn-xs btn-modal-down" data-widget-id="${w.id}">▼</button>
        </div>
      </div>
    `).join("");

    // Bind modal moves
    list.querySelectorAll(".btn-modal-up").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-widget-id");
        const idx = dashboardWidgets.findIndex(w => w.id === id);
        if (idx > 0) {
          const temp = dashboardWidgets[idx].order;
          dashboardWidgets[idx].order = dashboardWidgets[idx - 1].order;
          dashboardWidgets[idx - 1].order = temp;
          dashboardWidgets.sort((a,b) => a.order - b.order);
          // Re-sort indexes sequentially
          dashboardWidgets.forEach((w, i) => w.order = i);
          // Re-render modal list
          container.querySelector("#btn-open-customizer").click();
        }
      });
    });

    list.querySelectorAll(".btn-modal-down").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-widget-id");
        const idx = dashboardWidgets.findIndex(w => w.id === id);
        if (idx !== -1 && idx < dashboardWidgets.length - 1) {
          const temp = dashboardWidgets[idx].order;
          dashboardWidgets[idx].order = dashboardWidgets[idx + 1].order;
          dashboardWidgets[idx + 1].order = temp;
          dashboardWidgets.sort((a,b) => a.order - b.order);
          dashboardWidgets.forEach((w, i) => w.order = i);
          container.querySelector("#btn-open-customizer").click();
        }
      });
    });

    modal.style.display = "block";
  });

  // Close Customizer
  document.getElementById("widget-customizer-close").addEventListener("click", () => {
    document.getElementById("widget-customizer-modal").style.display = "none";
  });

  // Restore Defaults
  document.getElementById("widget-customizer-restore").addEventListener("click", () => {
    localStorage.removeItem(CUSTOM_DASHBOARD_KEY);
    showToast("Restored default dashboard layout.", "info");
    navigateTo("dashboard");
  });

  // Save Customizer Changes
  document.getElementById("widget-customizer-save").addEventListener("click", () => {
    const checkboxes = document.querySelectorAll(".chk-widget-visible");
    checkboxes.forEach(c => {
      const id = c.getAttribute("data-widget-id");
      const w = dashboardWidgets.find(item => item.id === id);
      if (w) w.visible = c.checked;
    });

    saveWidgetsConfig(dashboardWidgets);
    document.getElementById("widget-customizer-modal").style.display = "none";
    showToast("Dashboard custom layout applied!", "success");
    navigateTo("dashboard");
  });

  // Bind inline reordering buttons inside widget cards
  container.querySelectorAll(".btn-move-up").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-widget-id");
      const idx = dashboardWidgets.findIndex(w => w.id === id);
      if (idx > 0) {
        const temp = dashboardWidgets[idx].order;
        dashboardWidgets[idx].order = dashboardWidgets[idx - 1].order;
        dashboardWidgets[idx - 1].order = temp;
        saveWidgetsConfig(dashboardWidgets);
        navigateTo("dashboard");
      }
    });
  });

  container.querySelectorAll(".btn-move-down").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-widget-id");
      const idx = dashboardWidgets.findIndex(w => w.id === id);
      if (idx !== -1 && idx < dashboardWidgets.length - 1) {
        const temp = dashboardWidgets[idx].order;
        dashboardWidgets[idx].order = dashboardWidgets[idx + 1].order;
        dashboardWidgets[idx + 1].order = temp;
        saveWidgetsConfig(dashboardWidgets);
        navigateTo("dashboard");
      }
    });
  });

  // Bind close widget
  container.querySelectorAll(".btn-close-widget").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-widget-id");
      const w = dashboardWidgets.find(item => item.id === id);
      if (w) {
        w.visible = false;
        saveWidgetsConfig(dashboardWidgets);
        navigateTo("dashboard");
        showToast(`${w.title} hidden. Restore under Layout config.`, "info");
      }
    });
  });

  // Bind fullscreen widget
  container.querySelectorAll(".btn-fullscreen").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-widget-id");
      const card = document.getElementById(id);
      if (card) {
        card.classList.toggle("fullscreen");
        // Re-render charts to fit the fullscreen canvas
        if (id === "widget-analytics") {
          setTimeout(() => {
            window.renderDashboardCharts(deps, state.isDarkMode, state.activeDashboardTab);
          }, 100);
        }
      }
    });
  });

  // Bind Tab clicks in Analytics Widget
  container.querySelectorAll(".tab-btn[data-tab-id]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const tabId = e.target.getAttribute("data-tab-id");
      state.activeDashboardTab = tabId;
      
      // Refresh the analytics widget content in DOM directly
      const analyticsBody = container.querySelector("#widget-analytics .widget-body");
      if (analyticsBody) {
        analyticsBody.innerHTML = renderAnalyticsWidget(deps);
        // Rebind click for the refresh
        navigateTo("dashboard");
      }
    });
  });

  // Bind Export Image inside Analytics Widget
  const exportBtn = container.querySelector("#btn-chart-export");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const canvases = container.querySelectorAll("#widget-analytics canvas");
      if (canvases.length > 0) {
        const link = document.createElement("a");
        link.download = `apex_analytics_${state.activeDashboardTab}_report.png`;
        link.href = canvases[0].toDataURL("image/png");
        link.click();
        showToast("Chart export completed successfully!", "success");
      } else {
        showToast("No active chart canvas detected.", "warning");
      }
    });
  }

  // Bind table filters (real-time search)
  const tableSearch = container.querySelector("#table-search-input");
  if (tableSearch) {
    tableSearch.addEventListener("input", (e) => {
      state.dashboardSearchTerm = e.target.value;
      state.dashboardTablePage = 1; // Reset page
      const tableBody = container.querySelector("#widget-table .widget-body");
      if (tableBody) {
        tableBody.innerHTML = renderTableWidget(deps);
        navigateTo("dashboard");
      }
    });
  }

  // Bind table pagination
  const btnPrev = container.querySelector("#btn-table-prev");
  const btnNext = container.querySelector("#btn-table-next");

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      state.dashboardTablePage = (state.dashboardTablePage || 1) - 1;
      navigateTo("dashboard");
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      state.dashboardTablePage = (state.dashboardTablePage || 1) + 1;
      navigateTo("dashboard");
    });
  }

  // Bind quick preview modal overlay
  container.querySelectorAll(".btn-preview-report").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.getAttribute("data-preview-id");
      const d = deps.find(item => item.id === id);
      if (d) {
        const modal = document.getElementById("report-preview-modal-overlay");
        const body = document.getElementById("preview-modal-body");
        document.getElementById("preview-modal-title").textContent = `${d.name} Report Preview`;
        
        body.innerHTML = `
          <p><strong>Head of Department:</strong> ${d.head}</p>
          <p><strong>Faculty Members logged:</strong> ${d.facultyCount}</p>
          <p><strong>Student Strength count:</strong> ${d.studentCount}</p>
          <p><strong>Workflow Status:</strong> ${window.getStatusBadgeHtml(d.status)}</p>
          <hr style="border:0; border-top:1px dashed var(--border); margin:10px 0;">
          <p><strong>Publications citations index count:</strong> ${(d.metrics.publications || []).reduce((s,p)=>s+p.citations, 0)}</p>
          <p><strong>Grants total value secured:</strong> ₹${((d.metrics.grants || []).reduce((s,g)=>s+g.amount, 0)).toLocaleString()}</p>
        `;
        modal.style.display = "flex";
      }
    });
  });

  // Close Quick Preview Modal
  document.getElementById("preview-modal-close").addEventListener("click", () => {
    document.getElementById("report-preview-modal-overlay").style.display = "none";
  });

  // Draw Chart.js widgets based on active tab
  setTimeout(() => {
    window.renderDashboardCharts(deps, state.isDarkMode, state.activeDashboardTab);
  }, 120);
}

// Global mapping of widgets renderers
const widgetRenderers = {
  "widget-kpis": (deps, settings) => renderKpiWidget(deps, settings),
  "widget-progress": (deps) => renderProgressWidget(deps),
  "widget-deadline": (deps) => renderDeadlineWidget(deps),
  "widget-ai-insights": (deps) => renderAIInsightsWidget(deps),
  "widget-diagnostics": (deps) => renderDiagnosticsWidget(deps),
  "widget-actions": (deps) => renderActionsWidget(deps),
  "widget-analytics": (deps) => renderAnalyticsWidget(deps),
  "widget-table": (deps) => renderTableWidget(deps),
  "widget-leaderboard": (deps) => renderLeaderboardWidget(deps),
  "widget-timeline": (deps, settings, logs) => renderTimelineWidget(logs),
  "widget-events": (deps) => renderEventsWidget(deps)
};


// 2. Departments Grid list view
async function drawDepartmentsListView(container) {
  container.innerHTML = `
    <div class="top-nav">
      <div class="page-header">
        <h1>Department Portals</h1>
        <p>Monitor submission checklists, workflow approvals, and audit progress logs</p>
      </div>
    </div>

    <div class="departments-grid" id="departments-list-grid">
      <!-- Loaded dynamically -->
    </div>
  `;

  const grid = container.querySelector("#departments-list-grid");
  
  state.departments.forEach(d => {
    const isEditAllowed = window.canEditReport(state.currentUser, d.id, d.status);
    const progress = window.calculateReportProgress(d).percentage;

    const card = document.createElement("div");
    card.className = "dept-card animate-fade-in";
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <span style="font-size: 10px; font-weight: 700; color: var(--primary); text-transform: uppercase; font-family: var(--font-title);">${d.id} portal</span>
        ${window.getStatusBadgeHtml(d.status)}
      </div>

      <h2 style="font-family: var(--font-title); font-size: 16px; font-weight: 700; margin-bottom: 5px; color: var(--text-main);">${d.name}</h2>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px;">Head: <strong>${d.head}</strong></p>

      <div style="display:flex; justify-content:space-between; font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">
        <span>Report Completion</span>
        <span style="font-weight: 700; color: var(--primary);">${progress}%</span>
      </div>
      <!-- Mini Progress bar -->
      <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden; margin-bottom: 20px;">
        <div style="width: ${progress}%; height:100%; background:linear-gradient(to right, var(--primary), var(--secondary));"></div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top:1px solid var(--border); padding-top: 15px;">
        <span style="font-size: 11px; color: var(--text-muted);">Sync: ${d.lastUpdated}</span>
        <button class="btn btn-sm ${isEditAllowed ? "btn-primary" : ""}" data-edit-id="${d.id}">
          ${isEditAllowed ? window.t("editReport", state.currentLang) : "View Report"}
        </button>
      </div>
    `;

    grid.appendChild(card);

    card.querySelector(`[data-edit-id="${d.id}"]`).addEventListener("click", () => {
      navigateTo("editor", { id: d.id });
    });
  });
}

// 3. Department editor view (Redesigned 12-Step Stepper Wizard)
async function drawDepartmentEditorView(container, depId) {
  const originalDep = await window.getDepartment(depId);
  if (!originalDep) {
    navigateTo("departments");
    return;
  }

  // Session variables
  state.activeEditorDepId = depId;
  state.tempDepData = JSON.parse(JSON.stringify(originalDep));
  window.currentEditorReportState = state.tempDepData;

  if (typeof state.wizardStep === "undefined") state.wizardStep = 1;

  // Clear history stacks
  state.editorHistoryStack = [];
  state.editorRedoStack = [];

  const stepsList = [
    { num: 1, name: "Basic Info" },
    { num: 2, name: "Dept Profile" },
    { num: 3, name: "Faculty Details" },
    { num: 4, name: "Student Stats" },
    { num: 5, name: "Events Conducted" },
    { num: 6, name: "Research Output" },
    { num: 7, name: "Career Placements" },
    { num: 8, name: "Achievements" },
    { num: 9, name: "Image Gallery" },
    { num: 10, name: "Attachments" },
    { num: 11, name: "Preview Report" },
    { num: 12, name: "Submit Portal" }
  ];

  const drawEditorFrame = () => {
    // Calculate checklist completion %
    const checklist = getLiveChecklistStatus(state.tempDepData);
    const checkedCount = Object.values(checklist).filter(Boolean).length;
    const completionPct = Math.round((checkedCount / 9) * 100);

    container.innerHTML = `
      <!-- Stepper Controls Top Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:15px;">
        <div style="display:flex; align-items:center; gap:15px;">
          <button class="btn btn-sm" id="editor-back-btn">← Portals</button>
          <span style="font-size:11px; color:var(--text-muted);">Editing: <strong style="color:var(--text-main); text-transform:uppercase;">${depId} Report</strong></span>
          <span id="auto-save-indicator" style="font-size:11px; color:var(--success); opacity:0.6; transition:opacity 0.3s;"></span>
        </div>
        
        <div style="display:flex; gap:10px; align-items:center;">
          <button class="btn btn-sm" id="editor-undo-btn" style="padding:6px 10px;" title="Undo">↩️ Undo</button>
          <button class="btn btn-sm" id="editor-redo-btn" style="padding:6px 10px;" title="Redo">↪️ Redo</button>
          <button class="btn" id="editor-save-draft-btn">Save Draft</button>
        </div>
      </div>

      <!-- Main Stepper Grid layout -->
      <div style="display: grid; grid-template-columns: 210px 1fr 310px; gap: 20px; text-align:left;">
        
        <!-- Left Steps Column -->
        <div class="glass-card" style="padding: 15px; border-radius: 12px; display:flex; flex-direction:column; gap:6px; height:fit-content;">
          <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:10px; color:var(--text-muted); text-transform:uppercase;">Submission Wizard</h4>
          ${stepsList.map(s => `
            <button class="tab-btn btn-xs step-nav-btn ${state.wizardStep === s.num ? "active" : ""}" data-step-num="${s.num}" style="width:100%; text-align:left; font-size:11px; padding:8px 10px; border-radius:6px; display:flex; align-items:center; justify-content:space-between;">
              <span>${s.num}. ${s.name}</span>
              ${state.wizardStep > s.num ? `<span style="color:var(--success); font-weight:bold;">✓</span>` : ""}
            </button>
          `).join("")}
        </div>

        <!-- Center Form Workspace -->
        <div style="display:flex; flex-direction:column; gap:15px;">
          <!-- Progress bar -->
          <div class="glass-card" style="padding:10px 15px; border-radius:8px; display:flex; align-items:center; justify-content:space-between; font-size:11px;">
            <span>Wizard Progress</span>
            <div style="width:60%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
              <div style="width:${Math.round((state.wizardStep / 12) * 100)}%; height:100%; background:linear-gradient(to right, var(--primary), var(--secondary));"></div>
            </div>
            <strong>Step ${state.wizardStep} of 12</strong>
          </div>

          <div class="glass-card" style="padding: 25px; min-height: 480px; position:relative;" id="editor-form-pane">
            <!-- Active step form fields -->
          </div>

          <!-- Wizard prev/next bottom bar buttons -->
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <button class="btn" id="wizard-prev-btn" ${state.wizardStep === 1 ? "disabled" : ""}>Previous Step</button>
            <button class="btn btn-primary" id="wizard-next-btn">${state.wizardStep === 12 ? "Submit Report" : "Next Step"}</button>
          </div>
        </div>

        <!-- Right Side Widgets (Checklist, AI Assistant, Review Comments) -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          
          <!-- Live Checklist card -->
          <div class="glass-card" style="padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; color:var(--text-main); text-transform:uppercase;">Checklist</h4>
              <span style="font-size:10px; font-weight:bold; color:var(--primary);">${completionPct}% Complete</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px; font-size:10px; color:var(--text-muted);">
              <div style="display:flex; align-items:center; gap:6px; color:${checklist.vision ? "var(--success)" : "var(--danger)"};">
                <span>${checklist.vision ? "✓" : "✖"}</span> <span>Vision Added</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px; color:${checklist.mission ? "var(--success)" : "var(--danger)"};">
                <span>${checklist.mission ? "✓" : "✖"}</span> <span>Mission Added</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px; color:${checklist.faculty ? "var(--success)" : "var(--danger)"};">
                <span>${checklist.faculty ? "✓" : "✖"}</span> <span>Faculty Members Added</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px; color:${checklist.studentStats ? "var(--success)" : "var(--danger)"};">
                <span>${checklist.studentStats ? "✓" : "✖"}</span> <span>Student Stats Filled</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px; color:${checklist.events ? "var(--success)" : "var(--danger)"};">
                <span>${checklist.events ? "✓" : "✖"}</span> <span>Events Logged</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px; color:${checklist.research ? "var(--success)" : "var(--danger)"};">
                <span>${checklist.research ? "✓" : "✖"}</span> <span>Publications/Research</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px; color:${checklist.placements ? "var(--success)" : "var(--danger)"};">
                <span>${checklist.placements ? "✓" : "✖"}</span> <span>Placement Records</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px; color:${checklist.gallery ? "var(--success)" : "var(--danger)"};">
                <span>${checklist.gallery ? "✓" : "✖"}</span> <span>Photo Gallery Uploaded</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px; color:${checklist.attachments ? "var(--success)" : "var(--danger)"};">
                <span>${checklist.attachments ? "✓" : "✖"}</span> <span>Proofs & Files Attached</span>
              </div>
            </div>
          </div>

          <!-- AI Assistant card -->
          <div class="glass-card" style="padding: 20px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:14px; background:linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; font-weight:bold; font-family:var(--font-title);">AI Advisor</span>
              <span style="background:var(--primary-glow); color:var(--primary); font-size:8px; padding:2px 6px; border-radius:10px; font-weight:bold;">Local LLM</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <button class="btn btn-sm btn-xs" id="ai-generate-summary-btn">✍️ Draft Academic Summary</button>
              <button class="btn btn-sm btn-xs" id="ai-audit-gaps-btn">⚠️ Audit Compliance Gaps</button>
            </div>
            <div id="ai-assistant-output-box" class="glass-card" style="display:none; padding:10px; font-size:11px; max-height:160px; overflow-y:auto; background:rgba(255,255,255,0.01); border-color:rgba(14,165,233,0.15)"></div>
          </div>

          <!-- Review Comments card -->
          <div class="glass-card" style="padding: 20px;" id="editor-signature-workflow-card">
            <!-- Review status comments -->
          </div>

        </div>

      </div>
    `;

    // Bind frame listeners
    container.querySelector("#editor-back-btn").addEventListener("click", () => {
      clearInterval(autoSaveTimer);
      navigateTo("departments");
    });

    container.querySelector("#editor-save-draft-btn").addEventListener("click", async () => {
      await saveActiveFormValues();
      await window.saveDepartment(state.tempDepData);
      await window.saveVersion(state.tempDepData.id, state.tempDepData, state.currentUser.username);
      showToast("Draft saved to Local Storage.", "success");
      navigateTo("departments");
    });

    container.querySelectorAll(".step-nav-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        await saveActiveFormValues();
        state.wizardStep = parseInt(e.currentTarget.getAttribute("data-step-num"));
        drawEditorFrame();
      });
    });

    container.querySelector("#wizard-prev-btn").addEventListener("click", async () => {
      if (state.wizardStep > 1) {
        await saveActiveFormValues();
        state.wizardStep--;
        drawEditorFrame();
      }
    });

    container.querySelector("#wizard-next-btn").addEventListener("click", async () => {
      await saveActiveFormValues();
      if (state.wizardStep < 12) {
        state.wizardStep++;
        drawEditorFrame();
      } else {
        // Step 12 Submission
        if (!window.canSubmitReport(state.currentUser, state.tempDepData.id)) {
          showToast("Access Denied: Only Department Head HOD can submit reports.", "error");
          return;
        }
        clearInterval(autoSaveTimer);
        const updated = await window.submitForReview(state.tempDepData.id, state.currentUser.username);
        if (updated) {
          showToast("Report submitted successfully!", "success");
          navigateTo("departments");
        }
      }
    });

    // Undo/Redo click
    container.querySelector("#editor-undo-btn").addEventListener("click", () => {
      if (state.editorHistoryStack.length > 0) {
        const prev = state.editorHistoryStack.pop();
        state.editorRedoStack.push(JSON.stringify(state.tempDepData));
        state.tempDepData = JSON.parse(prev);
        window.currentEditorReportState = state.tempDepData;
        drawEditorFrame();
        showToast("Undo applied", "info");
      }
    });

    container.querySelector("#editor-redo-btn").addEventListener("click", () => {
      if (state.editorRedoStack.length > 0) {
        const next = state.editorRedoStack.pop();
        state.editorHistoryStack.push(JSON.stringify(state.tempDepData));
        state.tempDepData = JSON.parse(next);
        window.currentEditorReportState = state.tempDepData;
        drawEditorFrame();
        showToast("Redo applied", "info");
      }
    });

    // AI Advisor clicks
    const aiBox = container.querySelector("#ai-assistant-output-box");
    const triggerAI = async (action) => {
      aiBox.style.display = "block";
      aiBox.innerHTML = `<div class="loading-spinner" style="width:12px; height:12px; margin:0 auto;"></div>`;
      await window.generateAIContent(action, state.tempDepData, (chunk) => {
        aiBox.innerHTML = chunk
          .replace(/### (.*)/g, '<h5 style="color:var(--primary); font-weight:bold; margin-bottom:5px;">$1</h5>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      });
    };
    container.querySelector("#ai-generate-summary-btn").addEventListener("click", () => triggerAI("summary"));
    container.querySelector("#ai-audit-gaps-btn").addEventListener("click", () => triggerAI("missing"));

    // Render active form step
    drawFormPane(container.querySelector("#editor-form-pane"), state.tempDepData);

    // Draw signature review
    drawSignatureWorkflowPanel(container.querySelector("#editor-signature-workflow-card"), state.tempDepData);
  };

  const pushHistoryState = () => {
    if (state.editorHistoryStack.length >= 20) state.editorHistoryStack.shift();
    state.editorHistoryStack.push(JSON.stringify(state.tempDepData));
    state.editorRedoStack = [];
  };
  window.pushEditorHistoryState = pushHistoryState;

  // Auto save trigger (10 seconds)
  const autoSaveTimer = setInterval(async () => {
    if (state.currentView !== "editor" || state.activeEditorDepId !== depId) {
      clearInterval(autoSaveTimer);
      return;
    }
    await saveActiveFormValues();
    await window.saveDepartment(state.tempDepData);
    const indicator = document.getElementById("auto-save-indicator");
    if (indicator) {
      indicator.innerHTML = `✔️ Saved`;
      indicator.style.opacity = "1";
      setTimeout(() => { if (indicator) indicator.style.opacity = "0.6"; }, 1500);
    }
  }, 10000);

  // Render initial layout
  drawEditorFrame();
}

// ----------------- LIVE CHECKLIST CALCULATOR -----------------

function getLiveChecklistStatus(d) {
  if (!d.metrics) d.metrics = {};
  return {
    vision: d.vision && d.vision.length > 5,
    mission: d.mission && d.mission.length > 5,
    faculty: d.facultyList && d.facultyList.length > 0,
    studentStats: d.studentCount > 0,
    events: d.metrics.events && d.metrics.events.length > 0,
    research: d.metrics.publications && d.metrics.publications.length > 0,
    placements: d.metrics.placements && d.metrics.placements.length > 0,
    gallery: d.gallery && d.gallery.length > 0,
    attachments: d.fileAttachments && d.fileAttachments.length > 0
  };
}

// ----------------- SAVE ACTIVE FORM FIELDS TO MEMORY BUFFER -----------------

async function saveActiveFormValues() {
  const pane = document.getElementById("editor-form-pane");
  if (!pane) return;
  const d = state.tempDepData;
  const step = state.wizardStep;

  if (step === 1) {
    const ay = pane.querySelector("#ay-input")?.value;
    if (ay) d.academicYear = ay;
    const title = pane.querySelector("#title-input")?.value;
    if (title) d.reportTitle = title;
    const prep = pane.querySelector("#prep-input")?.value;
    if (prep) d.preparedBy = prep;
  }
  
  else if (step === 2) {
    const name = pane.querySelector("#profile-name")?.value;
    if (name) d.name = name;
    const vis = pane.querySelector("#profile-vision")?.value;
    if (vis) d.vision = vis;
    const miss = pane.querySelector("#profile-mission")?.value;
    if (miss) d.mission = miss;
    const ab = pane.querySelector("#profile-about")?.value;
    if (ab) d.about = ab;
  }

  else if (step === 4) {
    const ug = parseInt(pane.querySelector("#stud-ug")?.value) || 0;
    const pg = parseInt(pane.querySelector("#stud-pg")?.value) || 0;
    const sch = parseInt(pane.querySelector("#stud-sch")?.value) || 0;
    d.studentCount = ug + pg + sch;
  }
}

// ----------------- WIZARD STEP FORMS DRAWER -----------------

function drawFormPane(pane, dep) {
  if (!dep.metrics) dep.metrics = {};
  pane.innerHTML = "";
  const step = state.wizardStep;

  // Step 1: Basic Information
  if (step === 1) {
    pane.innerHTML = `
      <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; margin-bottom:15px; color:var(--text-main);">Step 1: Report Basic Information</h3>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="form-group">
          <label>Academic Calendar Year</label>
          <input type="text" class="form-control" id="ay-input" value="${dep.academicYear || "2025-26"}" required>
        </div>
        <div class="form-group">
          <label>Report Title</label>
          <input type="text" class="form-control" id="title-input" value="${dep.reportTitle || "Annual Milestones Evaluation"}" required>
        </div>
        <div class="form-group">
          <label>Prepared By (Coordinator Name)</label>
          <input type="text" class="form-control" id="prep-input" value="${dep.preparedBy || dep.head}" required>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:11px; margin-top:5px;">
          <div><strong>Department Code:</strong> <span style="text-transform:uppercase; color:var(--primary); font-weight:bold;">${dep.id}</span></div>
          <div><strong>Workflow Status:</strong> <span style="font-weight:bold;">${dep.status}</span></div>
        </div>
      </div>
    `;
  }

  // Step 2: Department Profile
  else if (step === 2) {
    pane.innerHTML = `
      <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; margin-bottom:15px; color:var(--text-main);">Step 2: Department Profile</h3>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="form-group">
          <label>Department Name</label>
          <input type="text" class="form-control" id="profile-name" value="${dep.name}" required>
        </div>
        <div class="form-group">
          <label>Vision Statement</label>
          <textarea class="form-control" id="profile-vision" rows="2" style="font-size:11px;">${dep.vision || ""}</textarea>
        </div>
        <div class="form-group">
          <label>Mission Statement</label>
          <textarea class="form-control" id="profile-mission" rows="2" style="font-size:11px;">${dep.mission || ""}</textarea>
        </div>
        <div class="form-group">
          <label>About Department</label>
          <textarea class="form-control" id="profile-about" rows="3" style="font-size:11px;">${dep.about || ""}</textarea>
        </div>
      </div>
    `;
  }

  // Step 3: Faculty Details
  else if (step === 3) {
    const list = dep.facultyList || [];
    pane.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; color:var(--text-main);">Step 3: Faculty Details</h3>
        <button class="btn btn-sm btn-primary" id="btn-add-fac-wizard">+ Add Member</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto;" id="fac-list-wizard-container">
        ${list.length === 0 ? '<p style="color:var(--text-muted); text-align:center; font-size:11px;">No faculty profiles logged.</p>' : list.map((f, idx) => `
          <div style="padding:10px; border-radius:6px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>${f.name}</strong> <span style="font-size:10px; color:var(--text-muted);">${f.qualification}</span>
              <span style="display:block; font-size:10px; color:var(--text-muted); margin-top:2px;">${f.designation} &bull; Spec: ${f.specialization}</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-xs btn-primary" style="padding:2px 5px; font-size:9px;" data-edit-fac-idx="${idx}">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" style="padding:3px;" data-del-fac-idx="${idx}">${ICONS.trash}</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    pane.querySelector("#btn-add-fac-wizard").addEventListener("click", () => {
      const name = prompt("Enter Faculty Name:");
      const qual = prompt("Enter Qualification (e.g. M.Tech, Ph.D):");
      const desig = prompt("Enter Designation (e.g. Associate Professor):");
      const spec = prompt("Enter Specialization area:");

      if (name && qual && desig) {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        if (!dep.facultyList) dep.facultyList = [];
        dep.facultyList.push({ name, qualification: qual, designation: desig, specialization: spec, email: `${name.toLowerCase().replace(/\s/g, "")}@apex.edu`, phone: "+91 98765 00000" });
        drawFormPane(pane, dep);
      }
    });

    pane.querySelectorAll("[data-edit-fac-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-edit-fac-idx"));
        const f = dep.facultyList[idx];
        const name = prompt("Edit Faculty Name:", f.name);
        const qual = prompt("Edit Qualification:", f.qualification);
        const desig = prompt("Edit Designation:", f.designation);
        const spec = prompt("Edit Specialization:", f.specialization);

        if (name && qual && desig) {
          if (window.pushEditorHistoryState) window.pushEditorHistoryState();
          f.name = name;
          f.qualification = qual;
          f.designation = desig;
          f.specialization = spec;
          drawFormPane(pane, dep);
        }
      });
    });

    pane.querySelectorAll("[data-del-fac-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        const idx = parseInt(e.currentTarget.getAttribute("data-del-fac-idx"));
        dep.facultyList.splice(idx, 1);
        drawFormPane(pane, dep);
      });
    });
  }

  // Step 4: Student Statistics
  else if (step === 4) {
    const ug = Math.round(dep.studentCount * 0.8) || 120;
    const pg = Math.round(dep.studentCount * 0.15) || 20;
    const sch = dep.studentCount - ug - pg || 5;

    pane.innerHTML = `
      <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; margin-bottom:15px; color:var(--text-main);">Step 4: Student Enrollment Statistics</h3>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
          <div class="form-group">
            <label>Undergraduate (UG)</label>
            <input type="number" class="form-control" id="stud-ug" value="${ug}">
          </div>
          <div class="form-group">
            <label>Postgraduate (PG)</label>
            <input type="number" class="form-control" id="stud-pg" value="${pg}">
          </div>
          <div class="form-group">
            <label>Research Scholars</label>
            <input type="number" class="form-control" id="stud-sch" value="${sch}">
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; background:rgba(255,255,255,0.01); border:1px solid var(--border); padding:15px; border-radius:8px; margin-top:10px;">
          <div>
            <span style="font-size:11px; color:var(--text-muted);">Automatically Calculated Strength</span>
            <h2 style="font-family:var(--font-title); font-size:24px; font-weight:800; color:var(--primary); margin:5px 0;">
              ${dep.studentCount} Students
            </h2>
          </div>
          <div style="font-size:10px; color:var(--text-muted);">
            <div>Boys Count (60%): <strong>${Math.round(dep.studentCount * 0.6)}</strong></div>
            <div style="margin-top:4px;">Girls Count (40%): <strong>${dep.studentCount - Math.round(dep.studentCount * 0.6)}</strong></div>
          </div>
        </div>
      </div>
    `;
  }

  // Step 5: Events Conducted
  else if (step === 5) {
    const list = dep.metrics.events || [];
    pane.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; color:var(--text-main);">Step 5: Event Management</h3>
        <button class="btn btn-sm btn-primary" id="btn-add-event-wizard">+ Add Event</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto;">
        ${list.length === 0 ? '<p style="color:var(--text-muted); text-align:center; font-size:11px;">No events recorded.</p>' : list.map((e, idx) => `
          <div style="padding:10px; border-radius:6px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>${e.title}</strong>
              <span style="display:block; font-size:10px; color:var(--text-muted); margin-top:2px;">Venue: ${e.venue} &bull; Date: ${e.date}</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-xs btn-primary" style="padding:2px 5px; font-size:9px;" data-edit-event-idx="${idx}">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" style="padding:3px;" data-del-event-idx="${idx}">${ICONS.trash}</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    pane.querySelector("#btn-add-event-wizard").addEventListener("click", () => {
      const title = prompt("Enter Event Title:");
      const venue = prompt("Enter Event Venue:");
      const date = prompt("Enter Date (e.g. July 12, 2026):");

      if (title && venue) {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        if (!dep.metrics.events) dep.metrics.events = [];
        dep.metrics.events.push({ title, venue, date });
        drawFormPane(pane, dep);
      }
    });

    pane.querySelectorAll("[data-edit-event-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-edit-event-idx"));
        const ev = dep.metrics.events[idx];
        const title = prompt("Edit Event Title:", ev.title);
        const venue = prompt("Edit Event Venue:", ev.venue);
        const date = prompt("Edit Date:", ev.date);

        if (title && venue) {
          if (window.pushEditorHistoryState) window.pushEditorHistoryState();
          ev.title = title;
          ev.venue = venue;
          ev.date = date;
          drawFormPane(pane, dep);
        }
      });
    });

    pane.querySelectorAll("[data-del-event-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        const idx = parseInt(e.currentTarget.getAttribute("data-del-event-idx"));
        dep.metrics.events.splice(idx, 1);
        drawFormPane(pane, dep);
      });
    });
  }

  // Step 6: Research Output
  else if (step === 6) {
    const list = dep.metrics.publications || [];
    pane.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; color:var(--text-main);">Step 6: Research & Publications</h3>
        <button class="btn btn-sm btn-primary" id="btn-add-pub-wizard">+ Add Publication</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto;">
        ${list.length === 0 ? '<p style="color:var(--text-muted); text-align:center; font-size:11px;">No research publications logged.</p>' : list.map((p, idx) => `
          <div style="padding:10px; border-radius:6px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>${p.title}</strong>
              <span style="display:block; font-size:10px; color:var(--text-muted); margin-top:2px;">Authors: ${p.authors} &bull; Citations: ${p.citations}</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-xs btn-primary" style="padding:2px 5px; font-size:9px;" data-edit-pub-idx="${idx}">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" style="padding:3px;" data-del-pub-idx="${idx}">${ICONS.trash}</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    pane.querySelector("#btn-add-pub-wizard").addEventListener("click", () => {
      const title = prompt("Enter Paper Title:");
      const authors = prompt("Enter Authors:");
      const citations = parseInt(prompt("Enter Citations:", "0")) || 0;

      if (title && authors) {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        if (!dep.metrics.publications) dep.metrics.publications = [];
        dep.metrics.publications.push({ title, authors, venue: "IEEE Journal", year: 2025, citations });
        drawFormPane(pane, dep);
      }
    });

    pane.querySelectorAll("[data-edit-pub-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-edit-pub-idx"));
        const p = dep.metrics.publications[idx];
        const title = prompt("Edit Paper Title:", p.title);
        const authors = prompt("Edit Authors:", p.authors);
        const citations = parseInt(prompt("Edit Citations:", p.citations)) || 0;

        if (title && authors) {
          if (window.pushEditorHistoryState) window.pushEditorHistoryState();
          p.title = title;
          p.authors = authors;
          p.citations = citations;
          drawFormPane(pane, dep);
        }
      });
    });

    pane.querySelectorAll("[data-del-pub-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        const idx = parseInt(e.currentTarget.getAttribute("data-del-pub-idx"));
        dep.metrics.publications.splice(idx, 1);
        drawFormPane(pane, dep);
      });
    });
  }

  // Step 7: Career Placements
  else if (step === 7) {
    const list = dep.metrics.placements || [];
    pane.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; color:var(--text-main);">Step 7: Student Career Placements</h3>
        <button class="btn btn-sm btn-primary" id="btn-add-placement-wizard">+ Add Record</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto;">
        ${list.length === 0 ? '<p style="color:var(--text-muted); text-align:center; font-size:11px;">No placements logged.</p>' : list.map((p, idx) => `
          <div style="padding:10px; border-radius:6px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>${p.company}</strong>
              <span style="display:block; font-size:10px; color:var(--text-muted); margin-top:2px;">Placed: ${p.studentsPlaced} &bull; Package: ${p.packageLpa} LPA</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-xs btn-primary" style="padding:2px 5px; font-size:9px;" data-edit-place-idx="${idx}">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" style="padding:3px;" data-del-place-idx="${idx}">${ICONS.trash}</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    pane.querySelector("#btn-add-placement-wizard").addEventListener("click", () => {
      const company = prompt("Enter Company Name:");
      const packageLpa = parseFloat(prompt("Enter Package LPA:", "6.0")) || 6.0;
      const count = parseInt(prompt("Students placed:", "1")) || 1;

      if (company) {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        if (!dep.metrics.placements) dep.metrics.placements = [];
        dep.metrics.placements.push({ company, packageLpa, studentsPlaced: count });
        drawFormPane(pane, dep);
      }
    });

    pane.querySelectorAll("[data-edit-place-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-edit-place-idx"));
        const pl = dep.metrics.placements[idx];
        const company = prompt("Edit Company Name:", pl.company);
        const packageLpa = parseFloat(prompt("Edit Package LPA:", pl.packageLpa)) || 6.0;
        const count = parseInt(prompt("Edit Students placed:", pl.studentsPlaced)) || 1;

        if (company) {
          if (window.pushEditorHistoryState) window.pushEditorHistoryState();
          pl.company = company;
          pl.packageLpa = packageLpa;
          pl.studentsPlaced = count;
          drawFormPane(pane, dep);
        }
      });
    });

    pane.querySelectorAll("[data-del-place-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        const idx = parseInt(e.currentTarget.getAttribute("data-del-place-idx"));
        dep.metrics.placements.splice(idx, 1);
        drawFormPane(pane, dep);
      });
    });
  }

  // Step 8: Achievements
  else if (step === 8) {
    const list = dep.metrics.achievements || [];
    pane.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; color:var(--text-main);">Step 8: Achievements & Awards</h3>
        <button class="btn btn-sm btn-primary" id="btn-add-ach-wizard">+ Add Milestone</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto;">
        ${list.length === 0 ? '<p style="color:var(--text-muted); text-align:center; font-size:11px;">No milestones logged.</p>' : list.map((a, idx) => `
          <div style="padding:10px; border-radius:6px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>[${a.category}] ${a.detail}</strong>
              <span style="display:block; font-size:10px; color:var(--text-muted); margin-top:2px;">Recipient: ${a.recipient}</span>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-xs btn-primary" style="padding:2px 5px; font-size:9px;" data-edit-ach-idx="${idx}">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" style="padding:3px;" data-del-ach-idx="${idx}">${ICONS.trash}</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    pane.querySelector("#btn-add-ach-wizard").addEventListener("click", () => {
      const detail = prompt("Enter award detail:");
      const recipient = prompt("Enter Recipient:");
      const category = prompt("Category (Faculty/Student):", "Student Award");

      if (detail && recipient) {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        if (!dep.metrics.achievements) dep.metrics.achievements = [];
        dep.metrics.achievements.push({ detail, recipient, category });
        drawFormPane(pane, dep);
      }
    });

    pane.querySelectorAll("[data-edit-ach-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-edit-ach-idx"));
        const ac = dep.metrics.achievements[idx];
        const detail = prompt("Edit Award Detail:", ac.detail);
        const recipient = prompt("Edit Recipient:", ac.recipient);
        const category = prompt("Edit Category:", ac.category);

        if (detail && recipient) {
          if (window.pushEditorHistoryState) window.pushEditorHistoryState();
          ac.detail = detail;
          ac.recipient = recipient;
          ac.category = category;
          drawFormPane(pane, dep);
        }
      });
    });

    pane.querySelectorAll("[data-del-ach-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        const idx = parseInt(e.currentTarget.getAttribute("data-del-ach-idx"));
        dep.metrics.achievements.splice(idx, 1);
        drawFormPane(pane, dep);
      });
    });
  }

  // Step 9: Image Gallery
  else if (step === 9) {
    const list = dep.gallery || [];
    pane.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; color:var(--text-main);">Step 9: Image Gallery Showcase</h3>
        <button class="btn btn-sm btn-primary" id="btn-gallery-wizard-add">+ Add Pic</button>
        <input type="file" id="gal-wizard-input-hidden" style="display:none;" accept="image/*">
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
        ${list.length === 0 ? '<p style="color:var(--text-muted); font-size:11px; grid-column:span 3;">No images uploaded.</p>' : list.map((g, idx) => `
          <div style="aspect-ratio:1.2; border-radius:8px; border:1px solid var(--border); overflow:hidden; position:relative;">
            <img src="${g.url}" style="width:100%; height:100%; object-fit:cover;">
            <button class="btn btn-sm btn-danger" style="position:absolute; top:4px; right:4px; padding:2px;" data-del-gal-idx="${idx}">✕</button>
          </div>
        `).join("")}
      </div>
    `;

    const hiddenInput = pane.querySelector("#gal-wizard-input-hidden");
    pane.querySelector("#btn-gallery-wizard-add").addEventListener("click", () => hiddenInput.click());

    hiddenInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        const base64 = await window.fileToBase64(file);
        if (!dep.gallery) dep.gallery = [];
        dep.gallery.push({ url: base64, caption: file.name, date: new Date().toLocaleDateString() });
        drawFormPane(pane, dep);
      }
    });

    pane.querySelectorAll("[data-del-gal-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        const idx = parseInt(e.currentTarget.getAttribute("data-del-gal-idx"));
        dep.gallery.splice(idx, 1);
        drawFormPane(pane, dep);
      });
    });
  }

  // Step 10: File Attachments
  else if (step === 10) {
    const list = dep.fileAttachments || [];
    pane.innerHTML = `
      <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; margin-bottom:15px; color:var(--text-main);">Step 10: File Proofs & PDF Attachments</h3>
      
      <div style="border:2px dashed var(--border); padding:25px; border-radius:10px; text-align:center; cursor:pointer; margin-bottom:15px;" id="file-wizard-dropzone">
        <input type="file" id="file-wizard-input-hidden" style="display:none;" multiple>
        <span style="font-size:11px; color:var(--text-muted);">Click or drag proofs documents here (PDF, DOCX, ZIP up to 10MB)</span>
      </div>

      <div style="display:grid; grid-template-columns:1fr; gap:10px;">
        ${list.length === 0 ? '<p style="color:var(--text-muted); font-size:11px; text-align:center;">No attachments uploaded.</p>' : list.map((f, idx) => `
          <div style="padding:10px; border-radius:6px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; font-size:11px; background:rgba(255,255,255,0.01);">
            <span>📄 ${f.name} (${f.size})</span>
            <button class="btn btn-sm btn-danger" style="padding:3px;" data-del-attach-id="${f.id}">✕</button>
          </div>
        `).join("")}
      </div>
    `;

    const drop = pane.querySelector("#file-wizard-dropzone");
    const input = pane.querySelector("#file-wizard-input-hidden");

    drop.addEventListener("click", () => input.click());

    input.addEventListener("change", async (e) => {
      if (window.pushEditorHistoryState) window.pushEditorHistoryState();
      const files = Array.from(e.target.files);
      if (!dep.fileAttachments) dep.fileAttachments = [];
      for (let f of files) {
        const meta = await window.processUploadedFile(f);
        dep.fileAttachments.push(meta);
      }
      drawFormPane(pane, dep);
    });

    pane.querySelectorAll("[data-del-attach-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (window.pushEditorHistoryState) window.pushEditorHistoryState();
        const id = e.currentTarget.getAttribute("data-del-attach-id");
        dep.fileAttachments = dep.fileAttachments.filter(f => f.id !== id);
        drawFormPane(pane, dep);
      });
    });
  }

  // Step 11: Preview Page
  else if (step === 11) {
    pane.innerHTML = `
      <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; margin-bottom:15px; color:var(--text-main);">Step 11: Report Compilations Preview</h3>
      
      <div style="padding:25px; border:1px solid var(--border); background:#fff; color:#111; border-radius:8px; display:flex; flex-direction:column; gap:15px; font-size:11px; line-height:1.5;">
        <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:10px;">
          <h2 style="font-family:var(--font-title); font-size:16px; font-weight:bold; margin:0;">${dep.name.toUpperCase()}</h2>
          <span style="font-size:10px; text-transform:uppercase;">Academic Evaluation Report &bull; AY ${dep.academicYear}</span>
        </div>

        <div>
          <strong>1. Vision & Mission:</strong>
          <p style="margin:5px 0 0 10px; font-style:italic;">"${dep.vision}"</p>
        </div>

        <div>
          <strong>2. Student & Faculty Strength:</strong>
          <table style="width:100%; border-collapse:collapse; margin-top:5px; font-size:10px; text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid #000;">
                <th>Category</th>
                <th>Strength count</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Faculty Members count</td><td>${dep.facultyCount}</td></tr>
              <tr><td>Student Enrollment count</td><td>${dep.studentCount}</td></tr>
            </tbody>
          </table>
        </div>

        <div>
          <strong>3. Research Publications citations output:</strong>
          <p style="margin:5px 0 0 10px;">Total citations: ${(dep.metrics.publications || []).reduce((s,p)=>s+p.citations, 0)} logged.</p>
        </div>
      </div>
    `;
  }

  // Step 12: Submit
  else if (step === 12) {
    pane.innerHTML = `
      <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; margin-bottom:15px; color:var(--text-main);">Step 12: Submit for Institutional Review</h3>
      
      <div style="display:flex; flex-direction:column; gap:15px; text-align:left;">
        <div style="padding:15px; border-radius:8px; background:var(--primary-glow); border:1px solid var(--primary); font-size:12px;">
          <h4>IQAC Workflow Verification Pipeline</h4>
          <p style="margin-top:5px; color:var(--text-muted); font-size:11px;">Completing the checklist verifies that accreditation rules are checked. Submission locks files from future changes.</p>
        </div>

        <div class="form-group">
          <label>IQAC Auditor / Reviewer Comments</label>
          <textarea class="form-control" rows="3" placeholder="Auditor feedback comments show here..." readonly style="font-size:11px;">${dep.workflowComments || "No review comments submitted."}</textarea>
        </div>
      </div>
    `;
  }
}

function drawSignatureWorkflowPanel(card, dep) {
  card.innerHTML = "";
  const role = state.currentUser.role;

  card.innerHTML = `
    <h3 style="font-family: var(--font-title); font-size:14px; font-weight:600; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:6px;">
      Workflow Verification
    </h3>
    <div style="font-size:11px; margin-bottom:15px;">
      Current State: ${window.getStatusBadgeHtml(dep.status)}
    </div>
  `;

  const commentsTimeline = document.createElement("div");
  commentsTimeline.style.display = "flex";
  commentsTimeline.style.flexDirection = "column";
  commentsTimeline.style.gap = "8px";
  commentsTimeline.style.marginBottom = "20px";
  commentsTimeline.innerHTML = (dep.approvalHistory || []).map(h => `
    <div style="font-size:11px; background:rgba(255,255,255,0.02); padding:8px; border-radius:6px; border:1px solid var(--border);">
      <div style="display:flex; justify-content:space-between; font-weight:600; color:var(--primary); margin-bottom:4px;">
        <span>${h.step} &bull; ${h.user}</span>
        <span style="font-size:9px; color:var(--text-muted);">${h.timestamp}</span>
      </div>
      <p style="margin:0; font-style:italic;">"${h.comment}"</p>
    </div>
  `).join("");

  card.appendChild(commentsTimeline);

  if (role === "HOD" && dep.status === "Submitted") {
    const hodActionBox = document.createElement("div");
    hodActionBox.innerHTML = `
      <div class="form-group" style="margin-top:15px;">
        <label style="font-size:11px;">Review comments</label>
        <textarea id="hod-review-comment" class="form-control" style="font-size:11px; height:60px;" placeholder="Add verification details..."></textarea>
      </div>
      <div style="display:flex; gap:10px; margin-top:10px;">
        <button class="btn btn-sm btn-danger" style="flex:1;" id="hod-reject-btn">Reject</button>
        <button class="btn btn-sm btn-primary" style="flex:1;" id="hod-review-btn">Accept Review</button>
      </div>
    `;
    card.appendChild(hodActionBox);

    hodActionBox.querySelector("#hod-reject-btn").addEventListener("click", async () => {
      const comment = document.getElementById("hod-review-comment").value.trim();
      const updated = await window.reviewByHOD(dep.id, state.currentUser.username, comment, true);
      if (updated) {
        showToast("Report rejected back to Faculty.", "warning");
        navigateTo("departments");
      }
    });

    hodActionBox.querySelector("#hod-review-btn").addEventListener("click", async () => {
      const comment = document.getElementById("hod-review-comment").value.trim();
      const updated = await window.reviewByHOD(dep.id, state.currentUser.username, comment, false);
      if (updated) {
        showToast("Report verified by HOD and sent to Principal.", "success");
        navigateTo("departments");
      }
    });
  }

  else if (role === "Principal" && dep.status === "Under Review") {
    const princActionBox = document.createElement("div");
    princActionBox.innerHTML = `
      <div class="form-group" style="margin-top:15px;">
        <label style="font-size:11px;">Review Comments</label>
        <textarea id="princ-review-comment" class="form-control" style="font-size:11px; height:60px;" placeholder="Final approval notes..."></textarea>
      </div>
      
      <div style="margin-top:15px;">
        <label style="font-size:11px; display:block; margin-bottom:5px;">Select Signature Authorization Mode</label>
        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <label style="font-size:10px; cursor:pointer;"><input type="radio" name="sig-mode" value="draw" checked> Draw Signature</label>
          <label style="font-size:10px; cursor:pointer;"><input type="radio" name="sig-mode" value="type"> Type Cursive</label>
        </div>

        <div id="sig-draw-pane">
          <canvas id="signature-canvas-element" width="220" height="100" style="border:1px solid var(--border); border-radius:6px; background:#fff; cursor:crosshair;"></canvas>
          <button class="btn btn-sm" id="clear-sig-btn" style="margin-top:5px; font-size:10px; padding:3px 6px;">Clear Pad</button>
        </div>

        <div id="sig-type-pane" style="display:none;">
          <input type="text" id="sig-typed-name" class="form-control" style="font-size:11px;" value="${state.currentUser.name}" placeholder="Type name...">
        </div>
      </div>

      <div style="display:flex; gap:10px; margin-top:15px;">
        <button class="btn btn-sm btn-danger" style="flex:1;" id="princ-reject-btn">Reject</button>
        <button class="btn btn-sm btn-primary" style="flex:1;" id="princ-approve-btn">Approve & Sign</button>
      </div>
      
      <canvas id="hidden-sig-text-canvas" width="220" height="100" style="display:none;"></canvas>
    `;
    card.appendChild(princActionBox);

    const canvas = princActionBox.querySelector("#signature-canvas-element");
    const pad = window.initSignaturePad(canvas);

    princActionBox.querySelectorAll('input[name="sig-mode"]').forEach(radio => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "draw") {
          document.getElementById("sig-draw-pane").style.display = "block";
          document.getElementById("sig-type-pane").style.display = "none";
        } else {
          document.getElementById("sig-draw-pane").style.display = "none";
          document.getElementById("sig-type-pane").style.display = "block";
        }
      });
    });

    princActionBox.querySelector("#clear-sig-btn").addEventListener("click", () => pad.clear());

    princActionBox.querySelector("#princ-reject-btn").addEventListener("click", async () => {
      const comment = document.getElementById("princ-review-comment").value.trim();
      const updated = await window.approveByPrincipal(dep.id, state.currentUser.username, comment, null, true);
      if (updated) {
        showToast("Report rejected back to draft for correction.", "warning");
        navigateTo("departments");
      }
    });

    princActionBox.querySelector("#princ-approve-btn").addEventListener("click", async () => {
      const comment = document.getElementById("princ-review-comment").value.trim();
      
      let signatureImg = null;
      const sigMode = princActionBox.querySelector('input[name="sig-mode"]:checked').value;
      
      if (sigMode === "draw") {
        signatureImg = pad.save();
      } else {
        const typedName = document.getElementById("sig-typed-name").value.trim() || state.currentUser.name;
        const textCanvas = document.getElementById("hidden-sig-text-canvas");
        signatureImg = window.generateTypedSignature(textCanvas, typedName, "cursive");
      }

      const updated = await window.approveByPrincipal(dep.id, state.currentUser.username, comment, signatureImg, false);
      if (updated) {
        showToast("Report Approved and Digitally Signed!", "success");
        navigateTo("departments");
      }
    });
  }
}

async function drawReportCompilerView(container) {
  const deps = state.departments;
  const settings = await window.getSettings();

  // Navigation tabs state
  if (typeof state.activeReportCompilerTab === "undefined") state.activeReportCompilerTab = "dashboard"; // "dashboard", "wizard", "templates", "schedule"

  // Selected format and watermark state
  let selectedFormat = "pdf";
  let selectedWatermark = "";

  // Scheduled reports state
  let scheduled = [];
  try {
    scheduled = JSON.parse(localStorage.getItem("arm_scheduled_reports")) || [
      { id: "sch_1", title: "IQAC Quality Audit Report", frequency: "Monthly", nextRun: "2026-08-01" },
      { id: "sch_2", title: "NBA Outcomes Compliance Summary", frequency: "Yearly", nextRun: "2026-12-15" }
    ];
  } catch(e){}

  // History state
  let historyLogs = [
    { id: "hist_1", title: "Consolidated_Annual_Report_2025-26", format: "PDF", date: "2026-07-08 10:20", size: "2.4 MB" },
    { id: "hist_2", title: "NAAC_Self_Study_Draft_v1", format: "DOCX", date: "2026-07-08 11:05", size: "4.1 MB" }
  ];

  // Predefined templates library
  const templatesList = [
    { id: "modern", title: "Modern University (Standard)", description: "Default institutional template layout with basic aggregates.", theme: "modern" },
    { id: "naac", title: "NAAC Assessment Template", description: "Double-bordered traditional design matching accreditation cycles.", theme: "naac" },
    { id: "nba", title: "NBA Outcomes Template", description: "Outcomes based assessment sheets with quantitative indicators.", theme: "nba" },
    { id: "corporate", title: "Corporate Summary Template", description: "Vibrant accents, compact grids, and executive highlights.", theme: "corporate" },
    { id: "gov", title: "Government College Traditional", description: "Formal layout, black headers, and double-line page breaks.", theme: "gov" }
  ];

  const drawWorkspace = () => {
    container.innerHTML = `
      <div class="top-nav" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; text-align:left;">
        <div class="page-header">
          <h1>Enterprise Report Center</h1>
          <p>Consolidate approved departmental achievements into NAAC/NBA compliance reports</p>
        </div>

        <div class="glass-card" style="padding:6px; border-radius:10px; display:flex; gap:6px;">
          <button class="btn btn-sm btn-xs sub-tab-btn-comp ${state.activeReportCompilerTab === "dashboard" ? "btn-primary" : ""}" data-tab="dashboard">📊 Dashboard</button>
          <button class="btn btn-sm btn-xs sub-tab-btn-comp ${state.activeReportCompilerTab === "wizard" ? "btn-primary" : ""}" data-tab="wizard">✍️ Builder Wizard</button>
          <button class="btn btn-sm btn-xs sub-tab-btn-comp ${state.activeReportCompilerTab === "templates" ? "btn-primary" : ""}" data-tab="templates">📜 Template Library</button>
          <button class="btn btn-sm btn-xs sub-tab-btn-comp ${state.activeReportCompilerTab === "schedule" ? "btn-primary" : ""}" data-tab="schedule">⏳ Automations</button>
        </div>
      </div>

      <div id="compiler-tab-viewport"></div>
    `;

    container.querySelectorAll(".sub-tab-btn-comp").forEach(btn => {
      btn.addEventListener("click", (e) => {
        state.activeReportCompilerTab = e.currentTarget.getAttribute("data-tab");
        drawWorkspace();
      });
    });

    renderActiveTab(container.querySelector("#compiler-tab-viewport"));
  };

  const renderActiveTab = (viewport) => {
    const tab = state.activeReportCompilerTab;

    if (tab === "dashboard") {
      viewport.innerHTML = `
        <!-- KPI Cards Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:25px; text-align:left;">
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Total Reports Generated</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">18 Compiled</h3>
            <span style="font-size:9px; color:var(--success);">✓ Synced locally</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Reports This Month</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">4 Generated</h3>
            <span style="font-size:9px; color:var(--success);">+2 vs last month</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Scheduled automation</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${scheduled.length} Active</h3>
            <span style="font-size:9px; color:var(--primary);">Monthly trigger pipelines</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Favorite templates</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">3 Saved</h3>
            <span style="font-size:9px; color:var(--text-muted);">NAAC & NBA layout presets</span>
          </div>
        </div>

        <div class="glass-card" style="padding:22px; text-align:left;">
          <h3 style="font-family:var(--font-title); font-size:14px; font-weight:600; border-bottom:1px solid var(--border); padding-bottom:6px; margin-bottom:15px;">Recently Downloaded Reports</h3>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
            ${historyLogs.map(log => `
              <div style="padding:10px; border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.01);">
                <div>
                  <strong>📄 ${log.title}</strong>
                  <span style="display:block; font-size:9px; color:var(--text-muted); margin-top:2px;">Generated: ${log.date} &bull; Size: ${log.size} (${log.format})</span>
                </div>
                <button class="btn btn-sm btn-xs" onclick="alert('Downloading compiled file...')">Download</button>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    else if (tab === "wizard") {
      viewport.innerHTML = `
        <div style="display: grid; grid-template-columns: 1.5fr 2.5fr; gap: 25px; text-align:left;">
          
          <!-- Compiler configs sidebar -->
          <div class="glass-card" style="padding: 22px; display: flex; flex-direction: column; gap: 15px; height: fit-content;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:600; border-bottom:1px solid var(--border); padding-bottom:6px;">
              Configuration Presets
            </h3>

            <div class="form-group">
              <label>Academic Year</label>
              <input type="text" class="form-control" id="comp-ay" value="${settings.academicYear}" readonly>
            </div>

            <div class="form-group">
              <label>Layout Theme Template</label>
              <select class="form-control" id="comp-theme-selector">
                <option value="modern" ${settings.reportTheme === "modern" ? "selected" : ""}>Modern University (Standard)</option>
                <option value="naac" ${settings.reportTheme === "naac" ? "selected" : ""}>NAAC Assessment Layout</option>
                <option value="nba" ${settings.reportTheme === "nba" ? "selected" : ""}>NBA Outcomes Layout</option>
                <option value="corporate" ${settings.reportTheme === "corporate" ? "selected" : ""}>Corporate Summary style</option>
                <option value="gov" ${settings.reportTheme === "gov" ? "selected" : ""}>Government College Traditional</option>
              </select>
            </div>

            <div class="form-group">
              <label>Document Watermark</label>
              <select class="form-control" id="comp-watermark-selector">
                <option value="">No Watermark</option>
                <option value="DRAFT">DRAFT</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="OFFICIAL">OFFICIAL</option>
                <option value="APPROVED">APPROVED</option>
              </select>
            </div>

            <div class="form-group">
              <label>Export Format</label>
              <select class="form-control" id="comp-format-selector">
                <option value="pdf">Adobe PDF (.pdf)</option>
                <option value="word">Microsoft Word (.docx)</option>
                <option value="excel">Microsoft Excel (.xlsx)</option>
                <option value="csv">Standard CSV (.csv)</option>
              </select>
            </div>

            <h3 style="font-family:var(--font-title); font-size:12px; font-weight:600; margin-top:10px;">Select Departments</h3>
            <div style="display:flex; flex-direction:column; gap:8px; max-height:120px; overflow-y:auto; font-size:11px;">
              ${deps.map(d => `
                <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" class="compiler-dep-chk" value="${d.id}" ${d.status === "Approved" ? "checked" : ""} ${d.status !== "Approved" ? "disabled" : ""}>
                  <span>${d.name} (${d.status})</span>
                </label>
              `).join("")}
            </div>

            <button class="btn btn-primary" id="compile-trigger-btn" style="margin-top:10px; justify-content:center;">
              Compile & Export Document
            </button>

            <button class="btn" id="email-trigger-btn" style="justify-content:center; background:rgba(168,85,247,0.1); color:#a855f7; border:1px solid rgba(168,85,247,0.2);">
              📧 Email Compiled Report
            </button>
          </div>

          <!-- Live Preview Block -->
          <div class="glass-card" style="padding:22px; display:flex; flex-direction:column; gap:15px; height:100%;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:600; border-bottom:1px solid var(--border); padding-bottom:6px;">
              Live Report Preview
            </h3>

            <!-- Hidden canvas for local QR Code drawing -->
            <canvas id="qr-comp-canvas" width="128" height="128" style="display:none;"></canvas>

            <div style="border:1px solid var(--border); border-radius:8px; flex-grow:1; min-height:540px; background:#fff; overflow:hidden;">
              <iframe id="report-live-iframe" style="width:100%; height:100%; border:none; background:#fff;"></iframe>
            </div>
          </div>

        </div>

        <!-- Email Dispatch Dialog Modal (Hidden by default) -->
        <div id="email-dispatch-modal" class="glass-card" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; width: 100%; max-width: 400px; padding: 30px; box-shadow: var(--shadow);">
          <h3 style="font-family: var(--font-title); font-size: 16px; margin-bottom: 20px;">Email Integrated PDF Report</h3>
          <form id="email-dispatch-form" style="display: flex; flex-direction: column; gap: 15px;">
            <div class="form-group">
              <label>Recipient Email Address</label>
              <input type="email" id="email-to-input" class="form-control" required placeholder="e.g. board@apexuniversity.edu">
            </div>
            <div class="form-group">
              <label>Subject</label>
              <input type="text" id="email-subject-input" class="form-control" value="Apex Annual Consolidated Report - AY ${settings.academicYear}">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 15px;">
              <button type="button" class="btn" id="email-modal-cancel">Cancel</button>
              <button type="submit" class="btn btn-primary" id="email-submit-btn-loader">Send Email</button>
            </div>
          </form>
        </div>
      `;

      const iframe = viewport.querySelector("#report-live-iframe");
      const qrCanvas = viewport.querySelector("#qr-comp-canvas");

      const compileAndPreview = () => {
        const checkedIds = Array.from(viewport.querySelectorAll(".compiler-dep-chk:checked")).map(chk => chk.value);
        const selected = deps.filter(d => checkedIds.includes(d.id));

        const verificationUrl = `https://apexuniversity.edu/verify/reports?ay=${settings.academicYear}&deps=${checkedIds.join(",")}`;
        window.drawQRCode(qrCanvas, verificationUrl);
        const qrBase64 = qrCanvas.toDataURL("image/png");

        const tempSettings = JSON.parse(JSON.stringify(settings));
        tempSettings.reportTheme = viewport.querySelector("#comp-theme-selector").value;

        selectedWatermark = viewport.querySelector("#comp-watermark-selector").value;

        const documentHtml = window.compileReportHTML(selected, tempSettings, qrBase64, selectedWatermark);
        
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(documentHtml);
        doc.close();
      };

      compileAndPreview();

      viewport.querySelector("#comp-theme-selector").addEventListener("change", compileAndPreview);
      viewport.querySelector("#comp-watermark-selector").addEventListener("change", compileAndPreview);
      viewport.querySelectorAll(".compiler-dep-chk").forEach(chk => chk.addEventListener("change", compileAndPreview));

      // Export trigger
      viewport.querySelector("#compile-trigger-btn").addEventListener("click", () => {
        const format = viewport.querySelector("#comp-format-selector").value;
        if (format === "pdf") {
          window.startConfetti();
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          historyLogs.push({
            id: "hist_" + Date.now(),
            title: `Consolidated_Report_${Date.now()}`,
            format: "PDF",
            date: new Date().toISOString().replace("T"," ").substring(0,16),
            size: "2.5 MB"
          });
          drawWorkspace();
        } else {
          let docContent = "Report Title,Academic Year\n";
          docContent += `Consolidated Report,${settings.academicYear}\n`;
          const blob = new Blob([docContent], { type: "text/csv" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `consolidated_report_ay${settings.academicYear}.${format === "excel" ? "xlsx" : format === "word" ? "docx" : "csv"}`;
          a.click();
          showToast(`Document compiled and downloaded in ${format.toUpperCase()} format!`, "success");
        }
      });

      // Email dispatch triggers
      const emailModal = viewport.querySelector("#email-dispatch-modal");
      viewport.querySelector("#email-trigger-btn").addEventListener("click", () => {
        emailModal.style.display = "block";
      });

      viewport.querySelector("#email-modal-cancel").addEventListener("click", () => {
        emailModal.style.display = "none";
      });

      viewport.querySelector("#email-dispatch-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = viewport.querySelector("#email-submit-btn-loader");
        btn.innerHTML = `<div class="loading-spinner" style="width:12px; height:12px; margin-right:6px;"></div> Sending...`;
        
        await new Promise(res => setTimeout(res, 1200));
        
        emailModal.style.display = "none";
        showToast("Consolidated PDF emailed successfully!", "success");
        drawWorkspace();
      });
    }

    else if (tab === "templates") {
      viewport.innerHTML = `
        <h3 style="font-family:var(--font-title); font-size:14px; font-weight:600; border-bottom:1px solid var(--border); padding-bottom:6px; margin-bottom:15px; text-align:left;">Template Presets Library</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:15px; text-align:left;">
          ${templatesList.map(tmpl => `
            <div class="glass-card" style="padding:15px; border-radius:10px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
              <div>
                <strong style="font-size:12px; color:var(--primary);">${tmpl.title}</strong>
                <p style="font-size:9px; color:var(--text-muted); margin:5px 0 0 0;">${tmpl.description}</p>
              </div>
              <button class="btn btn-sm btn-xs btn-primary btn-apply-tmpl" data-theme="${tmpl.theme}" style="width:100%;">Use Template</button>
            </div>
          `).join("")}
        </div>
      `;

      viewport.querySelectorAll(".btn-apply-tmpl").forEach(btn => {
        btn.onclick = () => {
          settings.reportTheme = btn.getAttribute("data-theme");
          window.saveSettings(settings).then(() => {
            state.activeReportCompilerTab = "wizard";
            showToast("Template layout presets applied!", "success");
            drawWorkspace();
          });
        };
      });
    }

    else if (tab === "schedule") {
      viewport.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; text-align:left;">
          <h3 style="font-family:var(--font-title); font-size:14px; font-weight:600; border-bottom:1px solid var(--border); padding-bottom:6px; flex-grow:1;">Automated Scheduled Reports</h3>
          <button class="btn btn-sm" id="btn-add-scheduled-report">+ Schedule drives</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; font-size:11px; text-align:left;">
          ${scheduled.map(sch => `
            <div style="padding:10px; border-radius:6px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.01);">
              <div>
                <strong>${sch.title}</strong>
                <span style="display:block; font-size:9px; color:var(--text-muted); margin-top:2px;">Trigger: ${sch.frequency} &bull; Next Execution: ${sch.nextRun}</span>
              </div>
              <button class="btn btn-sm btn-xs btn-danger btn-del-scheduled" data-id="${sch.id}">✕</button>
            </div>
          `).join("")}
        </div>
      `;

      viewport.querySelector("#btn-add-scheduled-report").onclick = () => {
        const title = prompt("Enter Report Title to schedule:");
        const freq = prompt("Enter Frequency (e.g. Monthly, Yearly):", "Monthly");
        if (title && freq) {
          scheduled.push({ id: "sch_" + Date.now(), title, frequency: freq, nextRun: "2026-08-01" });
          localStorage.setItem("arm_scheduled_reports", JSON.stringify(scheduled));
          renderActiveTab(viewport);
        }
      };

      viewport.querySelectorAll(".btn-del-scheduled").forEach(btn => {
        btn.onclick = (e) => {
          const id = e.currentTarget.getAttribute("data-id");
          scheduled = scheduled.filter(x => x.id !== id);
          localStorage.setItem("arm_scheduled_reports", JSON.stringify(scheduled));
          renderActiveTab(viewport);
        };
      });
    }
  };

  drawWorkspace();
}

// 5. System configuration Settings View
async function drawSettingsView(container) {
  const settings = await window.getSettings();
  const currentUser = window.getCurrentUser();

  // Navigation tab state
  if (typeof state.activeSettingsSubTab === "undefined") state.activeSettingsSubTab = "general"; // "general", "profile", "appearance", "accessibility", "system"

  const drawWorkspace = () => {
    container.innerHTML = `
      <div class="top-nav">
        <div class="page-header">
          <h1>SaaS Settings Panel</h1>
          <p>Configure user profiles, layouts themes, accessibility tokens, and database backups</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 3fr; gap:25px; text-align:left;">
        
        <!-- Sidebar Navigation List -->
        <div class="glass-card" style="padding:15px; display:flex; flex-direction:column; gap:8px; height:fit-content;">
          <button class="btn btn-sm btn-xs settings-nav-btn ${state.activeSettingsSubTab === "general" ? "btn-primary" : ""}" data-tab="general" style="width:100%; text-align:left;">⚙️ General Config</button>
          <button class="btn btn-sm btn-xs settings-nav-btn ${state.activeSettingsSubTab === "profile" ? "btn-primary" : ""}" data-tab="profile" style="width:100%; text-align:left;">👤 User Profile</button>
          <button class="btn btn-sm btn-xs settings-nav-btn ${state.activeSettingsSubTab === "appearance" ? "btn-primary" : ""}" data-tab="appearance" style="width:100%; text-align:left;">🎨 Appearance</button>
          <button class="btn btn-sm btn-xs settings-nav-btn ${state.activeSettingsSubTab === "accessibility" ? "btn-primary" : ""}" data-tab="accessibility" style="width:100%; text-align:left;">👁️ Accessibility</button>
          <button class="btn btn-sm btn-xs settings-nav-btn ${state.activeSettingsSubTab === "system" ? "btn-primary" : ""}" data-tab="system" style="width:100%; text-align:left;">💻 System Status</button>
        </div>

        <!-- Selected Pane Viewport -->
        <div id="settings-pane-viewport"></div>

      </div>
    `;

    container.querySelectorAll(".settings-nav-btn").forEach(btn => {
      btn.onclick = (e) => {
        state.activeSettingsSubTab = e.currentTarget.getAttribute("data-tab");
        drawWorkspace();
      };
    });

    renderActivePane(container.querySelector("#settings-pane-viewport"));
  };

  const renderActivePane = (pane) => {
    const tab = state.activeSettingsSubTab;

    if (tab === "general") {
      pane.innerHTML = `
        <div class="glass-card" style="padding:25px; display:flex; flex-direction:column; gap:20px;">
          <h3 style="font-family:var(--font-title); font-size:15px; font-weight:600; border-bottom:1px solid var(--border); padding-bottom:8px; margin:0;">Institutional Configuration</h3>
          
          <form id="settings-form-general" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div class="form-group" style="grid-column:span 2;">
              <label>Institution Name</label>
              <input type="text" class="form-control" id="sett-inst-name" value="${settings.instituteName}" required>
            </div>
            <div class="form-group">
              <label>Active Academic Year</label>
              <input type="text" class="form-control" id="sett-ay" value="${settings.academicYear}" required>
            </div>
            <div class="form-group">
              <label>Consolidated Report Header</label>
              <input type="text" class="form-control" id="sett-header" value="${settings.reportHeader || ""}">
            </div>
            <div class="form-group">
              <label>Consolidated Report Footer</label>
              <input type="text" class="form-control" id="sett-footer" value="${settings.reportFooter || ""}">
            </div>
            <div class="form-group">
              <label>Default Layout Template Theme</label>
              <select class="form-control" id="sett-theme">
                <option value="modern" ${settings.reportTheme === "modern" ? "selected" : ""}>Modern</option>
                <option value="naac" ${settings.reportTheme === "naac" ? "selected" : ""}>NAAC Assessment</option>
                <option value="nba" ${settings.reportTheme === "nba" ? "selected" : ""}>NBA Outcomes</option>
              </select>
            </div>

            <div style="grid-column:span 2; display:flex; justify-content:flex-end;">
              <button type="submit" class="btn btn-primary">Save Config Changes</button>
            </div>
          </form>
        </div>
      `;

      pane.querySelector("#settings-form-general").onsubmit = async (e) => {
        e.preventDefault();
        settings.instituteName = pane.querySelector("#sett-inst-name").value.trim();
        settings.academicYear = pane.querySelector("#sett-ay").value.trim();
        settings.reportHeader = pane.querySelector("#sett-header").value.trim();
        settings.reportFooter = pane.querySelector("#sett-footer").value.trim();
        settings.reportTheme = pane.querySelector("#sett-theme").value;
        await window.saveSettings(settings);
        showToast("General institutional configurations saved successfully!", "success");
        drawWorkspace();
      };
    }

    else if (tab === "profile") {
      pane.innerHTML = `
        <div class="glass-card" style="padding:25px; display:flex; flex-direction:column; gap:20px;">
          <h3 style="font-family:var(--font-title); font-size:15px; font-weight:600; border-bottom:1px solid var(--border); padding-bottom:8px; margin:0;">User profile Details</h3>
          
          <div style="display:flex; gap:20px; align-items:center;">
            <div style="width:70px; height:70px; border-radius:50%; background:var(--primary-glow); color:var(--primary); font-size:24px; font-weight:bold; display:flex; justify-content:center; align-items:center; border:2px solid var(--border);">
              ${currentUser.name.charAt(0)}
            </div>
            <div>
              <strong style="font-size:14px; color:var(--text-main);">${currentUser.name}</strong>
              <span style="display:block; font-size:10px; color:var(--text-muted); margin-top:2px;">Role profile: <strong>${currentUser.role}</strong> &bull; Dept: <strong>${currentUser.department || "All"}</strong></span>
            </div>
          </div>

          <form id="settings-form-profile" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div class="form-group">
              <label>Full Display Name</label>
              <input type="text" class="form-control" id="profile-name" value="${currentUser.name}" required>
            </div>
            <div class="form-group">
              <label>Registered Email</label>
              <input type="email" class="form-control" id="profile-email" value="${currentUser.username}@apexuniversity.edu" readonly>
            </div>
            <div class="form-group">
              <label>Office Phone</label>
              <input type="text" class="form-control" id="profile-phone" value="+91 98765 43210">
            </div>
            <div class="form-group">
              <label>Staff Employee ID</label>
              <input type="text" class="form-control" id="profile-empid" value="EMP-2026-9041" readonly>
            </div>

            <div style="grid-column:span 2; display:flex; justify-content:flex-end;">
              <button type="submit" class="btn btn-primary">Save Profile changes</button>
            </div>
          </form>
        </div>
      `;

      pane.querySelector("#settings-form-profile").onsubmit = (e) => {
        e.preventDefault();
        currentUser.name = pane.querySelector("#profile-name").value.trim();
        window.saveCurrentUser(currentUser);
        showToast("Profile details updated successfully!", "success");
        drawWorkspace();
      };
    }

    else if (tab === "appearance") {
      pane.innerHTML = `
        <div class="glass-card" style="padding:25px; display:flex; flex-direction:column; gap:20px;">
          <h3 style="font-family:var(--font-title); font-size:15px; font-weight:600; border-bottom:1px solid var(--border); padding-bottom:8px; margin:0;">Appearance & Themes</h3>
          
          <form id="settings-form-appearance" style="display:flex; flex-direction:column; gap:15px;">
            <div class="form-group">
              <label>SaaS Accent Color Scheme</label>
              <select class="form-control" id="sett-color-accent">
                <option value="default" ${!localStorage.getItem("arm_portal_accent") ? "selected" : ""}>SaaS Sky Dark (Default)</option>
                <option value="blue" ${localStorage.getItem("arm_portal_accent") === "blue" ? "selected" : ""}>Classic Royal Blue</option>
                <option value="purple" ${localStorage.getItem("arm_portal_accent") === "purple" ? "selected" : ""}>Neon Purple Vibe</option>
                <option value="green" ${localStorage.getItem("arm_portal_accent") === "green" ? "selected" : ""}>Emerald Forest Green</option>
              </select>
            </div>

            <div class="form-group">
              <label>Layout Spacing Mode</label>
              <select class="form-control" id="sett-spacing-mode">
                <option value="comfortable" ${localStorage.getItem("arm_spacing_mode") !== "compact" ? "selected" : ""}>Comfortable SaaS margins</option>
                <option value="compact" ${localStorage.getItem("arm_spacing_mode") === "compact" ? "selected" : ""}>Compact Grid mode</option>
              </select>
            </div>

            <div style="display:flex; justify-content:flex-end; margin-top:10px;">
              <button type="submit" class="btn btn-primary">Apply Appearance settings</button>
            </div>
          </form>
        </div>
      `;

      pane.querySelector("#settings-form-appearance").onsubmit = (e) => {
        e.preventDefault();
        const accent = pane.querySelector("#sett-color-accent").value;
        const spacing = pane.querySelector("#sett-spacing-mode").value;

        // Accent
        if (accent === "default") {
          localStorage.removeItem("arm_portal_accent");
          document.body.removeAttribute("data-theme");
        } else {
          localStorage.setItem("arm_portal_accent", accent);
          document.body.setAttribute("data-theme", accent);
        }

        // Spacing
        localStorage.setItem("arm_spacing_mode", spacing);

        showToast("Theme and appearance updates applied!", "success");
        drawWorkspace();
      };
    }

    else if (tab === "accessibility") {
      pane.innerHTML = `
        <div class="glass-card" style="padding:25px; display:flex; flex-direction:column; gap:20px;">
          <h3 style="font-family:var(--font-title); font-size:15px; font-weight:600; border-bottom:1px solid var(--border); padding-bottom:8px; margin:0;">Accessibility settings</h3>
          
          <form id="settings-form-accessibility" style="display:flex; flex-direction:column; gap:15px; font-size:11px;">
            <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
              <input type="checkbox" id="access-high-contrast" ${localStorage.getItem("arm_access_contrast") === "true" ? "checked" : ""}>
              <span>Enable High Contrast accessibility borders</span>
            </label>

            <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
              <input type="checkbox" id="access-large-text" ${localStorage.getItem("arm_access_largetext") === "true" ? "checked" : ""}>
              <span>Enable Large Text font layouts (18px root sizing)</span>
            </label>

            <div style="display:flex; justify-content:flex-end; margin-top:10px;">
              <button type="submit" class="btn btn-primary">Apply accessibility updates</button>
            </div>
          </form>
        </div>
      `;

      pane.querySelector("#settings-form-accessibility").onsubmit = (e) => {
        e.preventDefault();
        const contrast = pane.querySelector("#access-high-contrast").checked;
        const largeText = pane.querySelector("#access-large-text").checked;

        localStorage.setItem("arm_access_contrast", contrast);
        localStorage.setItem("arm_access_largetext", largeText);

        if (largeText) {
          document.documentElement.style.fontSize = "18px";
        } else {
          document.documentElement.style.fontSize = "16px";
        }

        showToast("Accessibility settings applied successfully!", "success");
        drawWorkspace();
      };
    }

    else if (tab === "system") {
      pane.innerHTML = `
        <div class="glass-card" style="padding:25px; display:flex; flex-direction:column; gap:20px;">
          <h3 style="font-family:var(--font-title); font-size:15px; font-weight:600; border-bottom:1px solid var(--border); padding-bottom:8px; margin:0;">Database Backup & Recovery</h3>
          <p style="font-size:11px; color:var(--text-muted); margin:0;">Export the entire localized database state as a JSON file, or restore a previous session file.</p>

          <div style="display:flex; flex-wrap:wrap; gap:15px; font-size:11px;">
            <button class="btn btn-primary" id="settings-export-btn">📥 Export JSON Database</button>
            <button class="btn" id="settings-import-btn-trigger" style="background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.2)">📤 Restore JSON Backup</button>
            <input type="file" id="settings-import-file-hidden" style="display:none;" accept=".json">
            <button class="btn btn-danger" id="settings-reset-btn">⚠️ Factory Reset Database</button>
          </div>
        </div>
      `;

      // DB export JSON helper
      pane.querySelector("#settings-export-btn").addEventListener("click", () => {
        const dbDump = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("arm_portal") || key.startsWith("annual_report"))) {
            dbDump[key] = localStorage.getItem(key);
          }
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbDump, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `apex_database_backup_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        showToast("Database file downloaded!", "success");
      });

      // Import JSON Recovery trigger
      const fileTrigger = pane.querySelector("#settings-import-btn-trigger");
      const fileHidden = pane.querySelector("#settings-import-file-hidden");
      
      fileTrigger.addEventListener("click", () => fileHidden.click());
      
      fileHidden.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const text = await file.text();
            const dump = JSON.parse(text);
            Object.keys(dump).forEach(k => localStorage.setItem(k, dump[k]));
            showToast("Database state recovered successfully!", "success");
            location.reload();
          } catch(err) {
            showToast("Failed to parse JSON file.", "danger");
          }
        }
      });

      pane.querySelector("#settings-reset-btn").onclick = () => {
        if (confirm("Reset current database changes and reload seeds?")) {
          localStorage.clear();
          showToast("Database factory reset completed.", "warning");
          location.reload();
        }
      };
    }
  };

  drawWorkspace();
}

// ----------------- APP INITIALIZATION -----------------

async function initApp() {
  state.currentUser = window.getCurrentUser();

  const appContainer = document.getElementById("app-container");
  if (!appContainer) return;

  appContainer.innerHTML = "";

  if (!state.currentUser) {
    const loginWrapper = document.createElement("div");
    loginWrapper.className = "content-pane-login";
    loginWrapper.style.width = "100%";
    appContainer.appendChild(loginWrapper);
    
    window.renderLoginScreen(loginWrapper, (user) => {
      state.currentUser = user;
      initApp();
      showToast(`Welcome back, ${user.name}!`, "success");
    }, state.currentLang, window.t);
  } else {
    appContainer.innerHTML = `
      <div id="sidebar-container"></div>
      <div style="display:flex; flex-direction:column; flex-grow:1; height:100vh; overflow:hidden;">
        <!-- Sticky Global Search Header -->
        <header style="height:60px; background:rgba(15,23,42,0.25); backdrop-filter:blur(8px); border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 30px; justify-content:space-between; flex-shrink:0; position:relative; z-index:9000;">
          <div style="position:relative; width:100%; max-width:480px;">
            <input type="text" id="global-header-search-input" placeholder="Search reports, faculty, students, departments, events, research, placements..." style="width:100%; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:30px; padding:8px 18px 8px 36px; color:var(--text-main); font-size:12px; outline:none; border-color:var(--border);">
            <span style="position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:14px; color:var(--text-muted);">🔍</span>
            
            <!-- Live Suggestions Dropdown Box -->
            <div id="global-search-suggestions-box" class="glass-card" style="display:none; position:absolute; top:42px; left:0; width:100%; max-height:360px; overflow-y:auto; border-radius:12px; box-shadow:var(--shadow); padding:15px; text-align:left; z-index:9500;">
              <!-- Suggestions injected dynamically -->
            </div>
          </div>
          <div style="display:flex; gap:15px; align-items:center;">
            <span style="font-size:11px; background:var(--primary-glow); padding:4px 8px; border-radius:4px; font-weight:bold; color:var(--primary); cursor:pointer;" onclick="window.triggerCommandPalette()">Ctrl + K</span>
            <div style="font-size:11px; color:var(--text-muted);">${state.currentUser.name} (${state.currentUser.role})</div>
          </div>
        </header>
        <main class="content-pane" id="content-pane" style="flex-grow:1; overflow-y:auto; padding:30px; box-sizing:border-box;">
          <!-- SPA view panes loaded here -->
        </main>
      </div>
    `;
    
    state.departments = await window.getDepartments();

    // Render Sidebar
    renderSidebar();
    
    // Initialize Global Search Box listener
    initGlobalHeaderSearch();

    // Route to Dashboard
    navigateTo(state.currentView);
  }
}

async function initGlobalHeaderSearch() {
  const input = document.getElementById("global-header-search-input");
  const suggestionsBox = document.getElementById("global-search-suggestions-box");
  if (!input || !suggestionsBox) return;

  let activeItems = [];
  let selectedIdx = -1;

  // Get search history from localStorage
  const getSearchHistory = () => {
    try {
      return JSON.parse(localStorage.getItem("arm_search_history")) || ["CSE", "Placement", "Accreditation", "2025-26"];
    } catch(e) { return []; }
  };

  const saveSearchTerm = (term) => {
    if (!term) return;
    const history = getSearchHistory();
    const updated = [term, ...history.filter(t => t !== term)].slice(0, 5);
    localStorage.setItem("arm_search_history", JSON.stringify(updated));
  };

  const showHistoryAndChips = () => {
    const history = getSearchHistory();
    
    suggestionsBox.innerHTML = `
      <div style="margin-bottom:12px;">
        <div style="font-size:9px; font-weight:bold; color:var(--primary); text-transform:uppercase; margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:2px;">Filter Chips</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;" id="search-chip-container">
          <span class="btn btn-sm btn-xs btn-search-chip" data-query="Research">Research</span>
          <span class="btn btn-sm btn-xs btn-search-chip" data-query="Events">Events</span>
          <span class="btn btn-sm btn-xs btn-search-chip" data-query="Placements">Placements</span>
          <span class="btn btn-sm btn-xs btn-search-chip" data-query="Approved">Approved</span>
          <span class="btn btn-sm btn-xs btn-search-chip" data-query="Pending">Pending</span>
        </div>
      </div>

      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:9px; font-weight:bold; color:var(--primary); text-transform:uppercase; margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:2px;">
          <span>Recent Searches</span>
          <span style="cursor:pointer; color:var(--text-muted);" id="clear-search-history-btn">Clear</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${history.length === 0 ? '<div style="font-size:10px; color:var(--text-muted);">No recent searches.</div>' : history.map(term => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 8px; border-radius:4px; font-size:11px;" class="table-row-hover">
              <span class="history-item-click" style="cursor:pointer; flex-grow:1;" data-query="${term}">🔍 ${term}</span>
              <span class="btn-delete-history-item" data-query="${term}" style="cursor:pointer; font-size:9px; color:var(--text-muted); padding:2px 5px;">✕</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // Chip click listeners
    suggestionsBox.querySelectorAll(".btn-search-chip, .history-item-click").forEach(el => {
      el.onclick = () => {
        input.value = el.getAttribute("data-query");
        input.dispatchEvent(new Event("input"));
      };
    });

    // Clear history
    const clearBtn = suggestionsBox.querySelector("#clear-search-history-btn");
    if (clearBtn) {
      clearBtn.onclick = () => {
        localStorage.setItem("arm_search_history", JSON.stringify([]));
        showHistoryAndChips();
      };
    }

    // Delete single item
    suggestionsBox.querySelectorAll(".btn-delete-history-item").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const term = btn.getAttribute("data-query");
        const history = getSearchHistory();
        const updated = history.filter(t => t !== term);
        localStorage.setItem("arm_search_history", JSON.stringify(updated));
        showHistoryAndChips();
      };
    });

    suggestionsBox.style.display = "block";
  };

  // Keyboard navigation
  const updateSelection = () => {
    suggestionsBox.querySelectorAll(".sug-result-row").forEach((el, idx) => {
      if (idx === selectedIdx) {
        el.style.background = "var(--primary-glow)";
        el.style.borderColor = "rgba(14, 165, 233, 0.15)";
      } else {
        el.style.background = "transparent";
        el.style.borderColor = "transparent";
      }
    });
  };

  input.addEventListener("keydown", (e) => {
    if (suggestionsBox.style.display !== "block") return;
    const items = suggestionsBox.querySelectorAll(".sug-result-row");
    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIdx = (selectedIdx + 1) % items.length;
      updateSelection();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIdx = (selectedIdx - 1 + items.length) % items.length;
      updateSelection();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIdx >= 0 && selectedIdx < activeItems.length) {
        const item = activeItems[selectedIdx];
        saveSearchTerm(input.value.trim());
        suggestionsBox.style.display = "none";
        input.value = "";
        navigateTo(item.view, item.params);
      }
    }
  });

  // Click outside listener to hide suggestions box
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = "none";
    }
  });

  input.addEventListener("focus", () => {
    if (input.value.trim().length === 0) {
      showHistoryAndChips();
    } else {
      input.dispatchEvent(new Event("input"));
    }
  });

  input.addEventListener("input", async () => {
    const q = input.value.trim().toLowerCase();
    if (q.length === 0) {
      showHistoryAndChips();
      return;
    }

    const matched = [];

    // 1. Search Departments
    state.departments.forEach(d => {
      if (d.name.toLowerCase().includes(q) || d.id.includes(q)) {
        matched.push({
          title: `Department: ${d.name}`,
          category: "Department",
          view: "editor",
          params: { id: d.id },
          dept: d.id.toUpperCase()
        });
      }
    });

    // 2. Search Placements
    try {
      const placements = await window.getPlacementsDb();
      placements.forEach(p => {
        if (p.studentName.toLowerCase().includes(q) || p.companyName.toLowerCase().includes(q) || p.jobRole.toLowerCase().includes(q)) {
          matched.push({
            title: `${p.studentName} Placed at ${p.companyName}`,
            category: "Placements",
            view: "placements",
            params: {},
            dept: p.department.toUpperCase()
          });
        }
      });
    } catch(e){}

    // 3. Search Students Achievements
    try {
      const students = await window.getStudentsDb();
      students.forEach(st => {
        if (st.name.toLowerCase().includes(q) || st.regNumber.includes(q)) {
          matched.push({
            title: `Student: ${st.name} (${st.regNumber})`,
            category: "Students Hub",
            view: "students",
            params: {},
            dept: st.department.toUpperCase()
          });
        }
        st.achievements.forEach(ach => {
          if (ach.title.toLowerCase().includes(q) || ach.category.toLowerCase().includes(q)) {
            matched.push({
              title: `Award: ${ach.title} (${ach.position})`,
              category: "Students Hub",
              view: "students",
              params: {},
              dept: st.department.toUpperCase()
            });
          }
        });
      });
    } catch(e){}

    // 4. Search Academic Calendar Events
    try {
      const events = await window.getEventsDb();
      events.forEach(evt => {
        if (evt.name.toLowerCase().includes(q) || evt.category.toLowerCase().includes(q)) {
          matched.push({
            title: `Event: ${evt.name}`,
            category: "Academic Calendar",
            view: "calendar",
            params: {},
            dept: evt.department.toUpperCase()
          });
        }
      });
    } catch(e){}

    // Render results
    suggestionsBox.innerHTML = "";
    activeItems = matched.slice(0, 10);
    selectedIdx = -1;

    if (activeItems.length === 0) {
      suggestionsBox.innerHTML = `
        <div style="padding:15px 0; text-align:center; color:var(--text-muted); font-size:11px;">
          <p style="margin:0 0 5px 0;">No matching records found.</p>
          <span style="font-size:9px; color:var(--primary); cursor:pointer;" onclick="document.getElementById('global-header-search-input').value=''; document.getElementById('global-header-search-input').dispatchEvent(new Event('input'))">Clear search query</span>
        </div>
      `;
    } else {
      // Group by Category
      const categories = {};
      activeItems.forEach(item => {
        if (!categories[item.category]) categories[item.category] = [];
        categories[item.category].push(item);
      });

      let overallIdx = 0;
      Object.keys(categories).forEach(cat => {
        const catHeader = document.createElement("div");
        catHeader.style.cssText = "font-size:9px; font-weight:bold; color:var(--primary); text-transform:uppercase; margin-bottom:6px; border-bottom:1px solid var(--border); padding-bottom:2px;";
        catHeader.textContent = cat;
        suggestionsBox.appendChild(catHeader);

        categories[cat].forEach(item => {
          const sug = document.createElement("div");
          sug.className = "sug-result-row";
          sug.style.cssText = "padding:6px 10px; border-radius:6px; cursor:pointer; font-size:11px; transition:background 0.2s; border:1px solid transparent; margin-bottom:3px;";
          sug.innerHTML = `
            <span style="font-weight:600; color:var(--text-main); display:block;">${item.title}</span>
            <span style="font-size:9px; color:var(--text-muted);">Dept: ${item.dept}</span>
          `;
          
          const currentIdx = overallIdx;
          sug.addEventListener("mouseenter", () => {
            selectedIdx = currentIdx;
            updateSelection();
          });

          sug.addEventListener("click", () => {
            saveSearchTerm(input.value.trim());
            suggestionsBox.style.display = "none";
            input.value = "";
            navigateTo(item.view, item.params);
          });

          suggestionsBox.appendChild(sug);
          overallIdx++;
        });
      });
    }

    suggestionsBox.style.display = "block";
  });
}

// Bind load trigger
document.addEventListener("DOMContentLoaded", () => {
  // Read theme from local storage
  const theme = localStorage.getItem("annual_report_portal_theme");
  if (theme === "light") {
    state.isDarkMode = false;
    document.body.classList.add("light-theme");
  } else {
    state.isDarkMode = true;
    document.body.classList.remove("light-theme");
  }

  // Load custom color scheme theme
  const accentTheme = localStorage.getItem("arm_portal_accent");
  if (accentTheme) {
    document.body.setAttribute("data-theme", accentTheme);
  }

  // Initialize Command Palette hook (Ctrl + K)
  window.initCommandPalette(
    (view, params) => navigateTo(view, params),
    (triggerName) => {
      if (triggerName === "factory-reset") {
        if (confirm("Reset local database logs to initial state?")) {
          window.resetDatabase().then(() => {
            localStorage.removeItem("arm_portal_accent");
            showToast("Database reset to default settings", "info");
            setTimeout(() => location.reload(), 800);
          });
        }
      } else if (triggerName === "export-db") {
        const exportBtn = document.getElementById("settings-export-btn");
        if (exportBtn) exportBtn.click();
        else showToast("Navigate to Settings panel to export data.", "warning");
      } else if (triggerName === "toggle-lang") {
        toggleLanguage();
      }
    }
  );

  initApp();

  window.addEventListener("resize", () => {
    if (state.currentView === "dashboard") {
      window.renderDashboardCharts(state.departments, state.isDarkMode, state.activeDashboardTab);
    }
  });
});
