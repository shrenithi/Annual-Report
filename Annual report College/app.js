/**
 * Application Controller & Router for the Annual Report Portal.
 * Interacts with window.PortalData, window.PortalCharts, window.PortalTemplates.
 */
(function() {
  // Destructure bindings from global namespaces
  const { getDepartmentsData, saveDepartmentsData, resetDepartmentsData } = window.PortalData;
  const { renderDashboardCharts } = window.PortalCharts;
  const { compileReport, REPORT_THEMES } = window.PortalTemplates;

  // Global Application State
  let state = {
    departments: [],
    currentView: "dashboard", // "dashboard", "departments", "editor", "compiler", "settings"
    isDarkMode: true,
    
    // Editor State
    activeEditorDepId: null,
    activeEditorTab: "general",
    tempDepData: null, // Temporary storage for edits before saving
    
    // Compiler State
    compilerConfig: {
      title: "Institutional Annual Integration Report",
      subtitle: "Apex Institute of Higher Education",
      academicYear: "2025-2026",
      theme: "corporate",
      includePending: true,
      customMessage: "It is with great pride that we present the integrated accomplishments of our diverse academic departments. This report represents a combined effort towards research excellence and student placement achievements.",
      sections: {
        cover: true,
        toc: true,
        executiveSummary: true,
        publications: true,
        grants: true,
        placements: true,
        events: true,
        achievements: true
      },
      selectedDepartments: [] // empty means all
    }
  };

  // SVG Icon Helpers
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
    graduation: `<svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`
  };

  /**
   * Triggers a glassmorphic toast notification.
   */
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
    if (type === "error") icon = ICONS.trash;
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

  /**
   * Initializes the application on DOM load.
   */
  document.addEventListener("DOMContentLoaded", () => {
    // Load initial data
    state.departments = getDepartmentsData();
    
    // Set up theme from local storage if existing
    const storedTheme = localStorage.getItem("annual_report_portal_theme");
    if (storedTheme === "light") {
      state.isDarkMode = false;
      document.body.classList.add("light-theme");
    } else {
      state.isDarkMode = true;
      document.body.classList.remove("light-theme");
    }
    
    // Pre-fill selected departments for compiler
    state.compilerConfig.selectedDepartments = state.departments.map(d => d.id);
    
    // Draw shell and bind event listeners
    renderSidebar();
    navigateTo(state.currentView);
    
    // Add global resize handler for charts
    window.addEventListener("resize", () => {
      if (state.currentView === "dashboard") {
        renderDashboardCharts(state.departments, state.isDarkMode);
      }
    });
  });

  /**
   * Renders the navigation sidebar with SVG icons.
   */
  function renderSidebar() {
    const sidebar = document.getElementById("sidebar-container");
    if (!sidebar) return;

    sidebar.innerHTML = `
      <aside class="sidebar">
        <div>
          <div class="brand-section">
            <div class="brand-logo">A</div>
            <div class="brand-name">Apex Reports</div>
          </div>
          
          <ul class="nav-menu">
            <li>
              <a class="nav-item ${state.currentView === "dashboard" ? "active" : ""}" data-view="dashboard">
                ${ICONS.dashboard} Dashboard
              </a>
            </li>
            <li>
              <a class="nav-item ${state.currentView === "departments" ? "active" : ""}" data-view="departments">
                ${ICONS.departments} Departments
              </a>
            </li>
            <li>
              <a class="nav-item ${state.currentView === "compiler" ? "active" : ""}" data-view="compiler">
                ${ICONS.compiler} Report Builder
              </a>
            </li>
            <li>
              <a class="nav-item ${state.currentView === "settings" ? "active" : ""}" data-view="settings">
                ${ICONS.settings} System Config
              </a>
            </li>
          </ul>
        </div>

        <div class="sidebar-footer">
          <div class="theme-toggle-wrapper">
            <span>Theme</span>
            <button class="toggle-btn" id="theme-toggle">
              ${state.isDarkMode ? ICONS.sun + " Light Mode" : ICONS.moon + " Dark Mode"}
            </button>
          </div>
        </div>
      </aside>
    `;

    // Bind navigation listeners
    sidebar.querySelectorAll("[data-view]").forEach(item => {
      item.addEventListener("click", (e) => {
        const view = e.currentTarget.getAttribute("data-view");
        navigateTo(view);
      });
    });

    // Bind theme toggle listener
    sidebar.querySelector("#theme-toggle")?.addEventListener("click", toggleTheme);
  }

  /**
   * Controls SPA routing.
   */
  function navigateTo(view, params = {}) {
    state.currentView = view;
    
    // Update sidebar active highlights
    document.querySelectorAll(".nav-item").forEach(item => {
      if (item.getAttribute("data-view") === view) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Clear page container and render specific pane
    const contentPane = document.getElementById("content-pane");
    if (!contentPane) return;
    
    contentPane.innerHTML = "";
    
    // Fade in animation wrapper
    const pageWrapper = document.createElement("div");
    pageWrapper.className = "animate-fade-in";
    contentPane.appendChild(pageWrapper);

    switch (view) {
      case "dashboard":
        renderDashboard(pageWrapper);
        break;
      case "departments":
        renderDepartmentsList(pageWrapper);
        break;
      case "editor":
        renderDepartmentEditor(pageWrapper, params.id);
        break;
      case "compiler":
        renderReportCompiler(pageWrapper);
        break;
      case "settings":
        renderSettings(pageWrapper);
        break;
    }
  }

  /**
   * Toggles Light/Dark themes and updates charts immediately.
   */
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
    
    // Re-draw chart instances if currently on dashboard
    if (state.currentView === "dashboard") {
      renderDashboardCharts(state.departments, state.isDarkMode);
    }
  }

  /* ==========================================================================
     Dashboard View Rendering
     ========================================================================== */
  function renderDashboard(container) {
    const totalDeps = state.departments.length;
    const approvedDeps = state.departments.filter(d => d.status === "Approved").length;
    
    let totalFaculty = 0;
    let totalPublications = 0;
    let totalGrants = 0;

    state.departments.forEach(d => {
      totalFaculty += d.facultyCount || 0;
      if (d.metrics) {
        totalPublications += (d.metrics.publications || []).length;
        totalGrants += (d.metrics.grants || []).reduce((acc, curr) => acc + curr.amount, 0);
      }
    });

    const formatLakhs = (val) => {
      return `₹${(val / 100000).toFixed(1)} L`;
    };

    container.innerHTML = `
      <div class="top-nav">
        <div class="page-header">
          <h1>Institute Overview</h1>
          <p>Annual Integration Report Statistics for Academic Year 2025-2026</p>
        </div>
        <div class="top-actions">
          <button class="btn btn-primary" id="dashboard-compile-btn">
            ${ICONS.compiler} Compile Report
          </button>
        </div>
      </div>

      <!-- Metrics Cards Grid -->
      <div class="metrics-grid">
        <div class="glass-card">
          <div class="metric-header">
            <span>Submission Status</span>
            <div class="metric-icon-wrapper">${ICONS.check}</div>
          </div>
          <div class="metric-value">${approvedDeps}/${totalDeps}</div>
          <div class="metric-sub">Reports integrated & approved</div>
        </div>
        
        <div class="glass-card">
          <div class="metric-header">
            <span>Total Research Faculty</span>
            <div class="metric-icon-wrapper">${ICONS.graduation}</div>
          </div>
          <div class="metric-value">${totalFaculty}</div>
          <div class="metric-sub">Across all departments</div>
        </div>

        <div class="glass-card">
          <div class="metric-header">
            <span>Publications Total</span>
            <div class="metric-icon-wrapper">${ICONS.bookOpen}</div>
          </div>
          <div class="metric-value">${totalPublications}</div>
          <div class="metric-sub">Academic journal submissions</div>
        </div>

        <div class="glass-card">
          <div class="metric-header">
            <span>Research Funding</span>
            <div class="metric-icon-wrapper">${ICONS.briefcase}</div>
          </div>
          <div class="metric-value">${formatLakhs(totalGrants)}</div>
          <div class="metric-sub">Total active project grants</div>
        </div>
      </div>

      <!-- Visual Charts Row -->
      <div class="chart-row">
        <div class="glass-card chart-card">
          <div class="chart-header">
            <h3>Publications vs. Project Grants</h3>
          </div>
          <div class="chart-container">
            <canvas id="publicationsChart"></canvas>
          </div>
        </div>
        
        <div class="glass-card chart-card">
          <div class="chart-header">
            <h3>Department Activity Share</h3>
          </div>
          <div class="chart-container">
            <canvas id="shareChart"></canvas>
          </div>
        </div>
      </div>

      <div class="glass-card chart-card" style="height: 300px; margin-bottom: 30px;">
        <div class="chart-header">
          <h3>Campus Placements & Package Benchmarks</h3>
        </div>
        <div class="chart-container">
          <canvas id="placementsChart"></canvas>
        </div>
      </div>

      <!-- Department Status Overview -->
      <div class="glass-card">
        <div class="section-title-bar">
          <h2>Departmental Report Integration List</h2>
        </div>
        
        <div class="department-list">
          ${state.departments.map(dep => {
            const badgeClass = dep.status.toLowerCase().replace(" ", "-");
            const pubCount = dep.metrics?.publications?.length || 0;
            const grantSum = (dep.metrics?.grants || []).reduce((sum, g) => sum + g.amount, 0);
            
            return `
              <div class="glass-card dep-row" style="padding: 12px 20px; border-radius: 8px;">
                <div class="dep-name-col">
                  <span class="dep-name">${dep.name}</span>
                  <span class="dep-head">HoD: ${dep.head}</span>
                </div>
                <div class="dep-stat-item hide-mobile">
                  <span class="dep-stat-label">Research / Funding</span>
                  <strong>${pubCount} Pubs</strong> &nbsp;|&nbsp; <strong>${formatLakhs(grantSum)}</strong>
                </div>
                <div class="dep-stat-item hide-mobile">
                  <span class="dep-stat-label">Last Updated</span>
                  <span>${dep.lastUpdated}</span>
                </div>
                <div>
                  <span class="status-badge ${badgeClass}">${dep.status}</span>
                </div>
                <div style="text-align: right;">
                  <button class="btn btn-sm" data-edit-dep="${dep.id}">
                    Edit Report
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Bind Navigation actions
    container.querySelector("#dashboard-compile-btn")?.addEventListener("click", () => navigateTo("compiler"));
    container.querySelectorAll("[data-edit-dep]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const depId = e.currentTarget.getAttribute("data-edit-dep");
        navigateTo("editor", { id: depId });
      });
    });

    // Render ChartJS elements
    renderDashboardCharts(state.departments, state.isDarkMode);
  }

  /* ==========================================================================
     Departments Card Grid View
     ========================================================================== */
  function renderDepartmentsList(container) {
    container.innerHTML = `
      <div class="top-nav">
        <div class="page-header">
          <h1>Department Reports</h1>
          <p>Review submission status, metrics, and manage departmental reports</p>
        </div>
      </div>

      <div class="metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
        ${state.departments.map(dep => {
          const badgeClass = dep.status.toLowerCase().replace(" ", "-");
          const pubCount = dep.metrics?.publications?.length || 0;
          const grantSum = (dep.metrics?.grants || []).reduce((sum, g) => sum + g.amount, 0);
          const placedCount = (dep.metrics?.placements || []).reduce((sum, p) => sum + p.studentsPlaced, 0);
          const eventCount = dep.metrics?.events?.length || 0;

          return `
            <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="metric-header" style="margin-bottom: 8px;">
                  <span class="status-badge ${badgeClass}">${dep.status}</span>
                  <span style="font-size: 11px; color: var(--text-muted);">${dep.lastUpdated}</span>
                </div>
                <h3 style="font-family: var(--font-title); font-size: 18px; margin-bottom: 4px; color: var(--text-main);">${dep.name}</h3>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px;">HoD: ${dep.head}</p>
                
                <div style="border-top: 1px solid var(--border); padding-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 25px;">
                  <div style="font-size: 12px;">
                    <span style="color: var(--text-muted); display: block;">Publications</span>
                    <strong>${pubCount} Papers</strong>
                  </div>
                  <div style="font-size: 12px;">
                    <span style="color: var(--text-muted); display: block;">Grants Value</span>
                    <strong>₹${(grantSum / 100000).toFixed(1)} Lakh</strong>
                  </div>
                  <div style="font-size: 12px;">
                    <span style="color: var(--text-muted); display: block;">Students Placed</span>
                    <strong>${placedCount} Hires</strong>
                  </div>
                  <div style="font-size: 12px;">
                    <span style="color: var(--text-muted); display: block;">Hosted Events</span>
                    <strong>${eventCount} Seminars</strong>
                  </div>
                </div>
              </div>
              
              <div style="display: flex; gap: 10px;">
                <button class="btn btn-primary btn-sm" style="flex-grow: 1; justify-content: center;" data-edit-dep="${dep.id}">
                  Manage Report
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    container.querySelectorAll("[data-edit-dep]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const depId = e.currentTarget.getAttribute("data-edit-dep");
        navigateTo("editor", { id: depId });
      });
    });
  }

  /* ==========================================================================
     Department Editor View Rendering (Interactive SPA Tabs)
     ========================================================================== */
  function renderDepartmentEditor(container, depId) {
    if (!depId) {
      navigateTo("departments");
      return;
    }

    const dep = state.departments.find(d => d.id === depId);
    if (!dep) {
      navigateTo("departments");
      return;
    }

    if (state.activeEditorDepId !== depId) {
      state.activeEditorDepId = depId;
      state.tempDepData = JSON.parse(JSON.stringify(dep));
      state.activeEditorTab = "general";
    }

    const tempDep = state.tempDepData;

    container.innerHTML = `
      <button class="btn btn-sm editor-back-btn" id="editor-back">
        ${ICONS.arrowLeft} Back to Departments
      </button>

      <div class="glass-card editor-layout">
        <!-- Editor Header -->
        <div class="editor-header-card">
          <div>
            <h2 style="font-family: var(--font-title); font-size: 22px; color: var(--text-main);">${tempDep.name}</h2>
            <p style="font-size: 12px; color: var(--text-muted);">Manage and review departmental data fields before integrating them</p>
          </div>
          <div>
            <div class="form-group" style="margin: 0; flex-direction: row; align-items: center; gap: 10px;">
              <label style="white-space: nowrap;">Report Status:</label>
              <select class="form-control" id="editor-status-select" style="padding: 6px 12px;">
                <option value="Draft" ${tempDep.status === "Draft" ? "selected" : ""}>Draft</option>
                <option value="Pending Review" ${tempDep.status === "Pending Review" ? "selected" : ""}>Pending Review</option>
                <option value="Approved" ${tempDep.status === "Approved" ? "selected" : ""}>Approved</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Inner Navigation Tabs -->
        <div class="tab-menu">
          <button class="tab-btn ${state.activeEditorTab === "general" ? "active" : ""}" data-tab="general">General Info</button>
          <button class="tab-btn ${state.activeEditorTab === "publications" ? "active" : ""}" data-tab="publications">Publications (${tempDep.metrics.publications.length})</button>
          <button class="tab-btn ${state.activeEditorTab === "grants" ? "active" : ""}" data-tab="grants">Research Grants (${tempDep.metrics.grants.length})</button>
          <button class="tab-btn ${state.activeEditorTab === "placements" ? "active" : ""}" data-tab="placements">Placements (${tempDep.metrics.placements.length})</button>
          <button class="tab-btn ${state.activeEditorTab === "events" ? "active" : ""}" data-tab="events">Events (${tempDep.metrics.events.length})</button>
          <button class="tab-btn ${state.activeEditorTab === "achievements" ? "active" : ""}" data-tab="achievements">Achievements (${(tempDep.metrics.achievements || []).length})</button>
        </div>

        <!-- Tab Content Area -->
        <div id="editor-tab-content">
          <!-- Rendered dynamically -->
        </div>

        <!-- Editor Footer Action Row -->
        <div style="display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid var(--border); padding-top: 20px;">
          <button class="btn" id="editor-cancel">Cancel</button>
          <button class="btn btn-primary" id="editor-save">${ICONS.check} Save Department Report</button>
        </div>
      </div>
    `;

    container.querySelector("#editor-back").addEventListener("click", () => navigateTo("departments"));
    container.querySelector("#editor-cancel").addEventListener("click", () => navigateTo("departments"));
    container.querySelector("#editor-save").addEventListener("click", saveEditorChanges);
    
    container.querySelector("#editor-status-select").addEventListener("change", (e) => {
      state.tempDepData.status = e.target.value;
    });

    container.querySelectorAll("[data-tab]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        state.activeEditorTab = e.target.getAttribute("data-tab");
        renderEditorTabContent();
        
        container.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
      });
    });

    renderEditorTabContent();
  }

  function renderEditorTabContent() {
    const contentDiv = document.getElementById("editor-tab-content");
    if (!contentDiv) return;

    const tempDep = state.tempDepData;
    contentDiv.innerHTML = "";

    switch (state.activeEditorTab) {
      case "general":
        contentDiv.innerHTML = `
          <div class="form-grid-2">
            <div class="form-group">
              <label for="dep-head-input">Head of Department (HoD)</label>
              <input type="text" class="form-control" id="dep-head-input" value="${tempDep.head}">
            </div>
            <div class="form-group">
              <label for="dep-faculty-input">Total Faculty Members</label>
              <input type="number" class="form-control" id="dep-faculty-input" value="${tempDep.facultyCount}">
            </div>
            <div class="form-group">
              <label for="dep-student-input">Total Enrolled Students</label>
              <input type="number" class="form-control" id="dep-student-input" value="${tempDep.studentCount}">
            </div>
          </div>
        `;
        contentDiv.querySelector("#dep-head-input").addEventListener("input", (e) => tempDep.head = e.target.value);
        contentDiv.querySelector("#dep-faculty-input").addEventListener("input", (e) => tempDep.facultyCount = parseInt(e.target.value) || 0);
        contentDiv.querySelector("#dep-student-input").addEventListener("input", (e) => tempDep.studentCount = parseInt(e.target.value) || 0);
        break;

      case "publications":
        renderPublicationsTab(contentDiv, tempDep);
        break;

      case "grants":
        renderGrantsTab(contentDiv, tempDep);
        break;

      case "placements":
        renderPlacementsTab(contentDiv, tempDep);
        break;

      case "events":
        renderEventsTab(contentDiv, tempDep);
        break;

      case "achievements":
        renderAchievementsTab(contentDiv, tempDep);
        break;
    }
  }

  /* --- Editor Tab Render Helpers --- */

  function renderPublicationsTab(container, tempDep) {
    const list = tempDep.metrics.publications;
    container.innerHTML = `
      <div class="table-manager">
        <div class="table-manager-header">
          <h3>Research Papers List</h3>
        </div>
        
        <table class="custom-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Authors</th>
              <th>Journal / Conference</th>
              <th>Year</th>
              <th>Citations</th>
              <th style="width: 50px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((pub, idx) => `
              <tr>
                <td><strong>${pub.title}</strong></td>
                <td>${pub.authors}</td>
                <td><em>${pub.venue}</em></td>
                <td>${pub.year}</td>
                <td>${pub.citations}</td>
                <td>
                  <button class="btn btn-sm btn-danger" style="padding: 4px;" data-delete-idx="${idx}">
                    ${ICONS.trash}
                  </button>
                </td>
              </tr>
            `).join("")}
            
            <tr style="background: rgba(14, 165, 233, 0.03);">
              <td><input type="text" class="form-control form-control-sm" id="new-pub-title" placeholder="Paper title..."></td>
              <td><input type="text" class="form-control form-control-sm" id="new-pub-authors" placeholder="A. Smith, B. Doe..."></td>
              <td><input type="text" class="form-control form-control-sm" id="new-pub-venue" placeholder="IEEE, Nature, etc..."></td>
              <td><input type="number" class="form-control form-control-sm" id="new-pub-year" value="2026" style="width: 80px;"></td>
              <td><input type="number" class="form-control form-control-sm" id="new-pub-citations" value="0" style="width: 70px;"></td>
              <td>
                <button class="btn btn-sm btn-primary" style="padding: 4px;" id="add-pub-btn">
                  ${ICONS.plus}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    container.querySelector("#add-pub-btn").addEventListener("click", () => {
      const title = container.querySelector("#new-pub-title").value.trim();
      const authors = container.querySelector("#new-pub-authors").value.trim();
      const venue = container.querySelector("#new-pub-venue").value.trim();
      const year = parseInt(container.querySelector("#new-pub-year").value) || 2026;
      const citations = parseInt(container.querySelector("#new-pub-citations").value) || 0;

      if (!title || !authors || !venue) {
        showToast("Please enter title, authors, and publication venue", "warning");
        return;
      }

      list.push({ title, authors, venue, year, citations });
      renderEditorTabContent();
    });

    container.querySelectorAll("[data-delete-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-delete-idx"));
        list.splice(idx, 1);
        renderEditorTabContent();
      });
    });
  }

  function renderGrantsTab(container, tempDep) {
    const list = tempDep.metrics.grants;
    container.innerHTML = `
      <div class="table-manager">
        <div class="table-manager-header">
          <h3>Research Funding Projects</h3>
        </div>
        
        <table class="custom-table">
          <thead>
            <tr>
              <th>Project Title</th>
              <th>Funding Agency</th>
              <th>Amount (₹)</th>
              <th>Duration</th>
              <th>Status</th>
              <th style="width: 50px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((g, idx) => `
              <tr>
                <td><strong>${g.title}</strong></td>
                <td>${g.agency}</td>
                <td>₹${g.amount.toLocaleString("en-IN")}</td>
                <td>${g.duration}</td>
                <td><span class="status-badge ${g.status.toLowerCase()}">${g.status}</span></td>
                <td>
                  <button class="btn btn-sm btn-danger" style="padding: 4px;" data-delete-idx="${idx}">
                    ${ICONS.trash}
                  </button>
                </td>
              </tr>
            `).join("")}
            
            <tr style="background: rgba(14, 165, 233, 0.03);">
              <td><input type="text" class="form-control" id="new-grant-title" placeholder="Project name..."></td>
              <td><input type="text" class="form-control" id="new-grant-agency" placeholder="NSF, SERB, Space..."></td>
              <td><input type="number" class="form-control" id="new-grant-amount" placeholder="Amount in INR..."></td>
              <td><input type="text" class="form-control" id="new-grant-dur" placeholder="3 Years..." style="width: 100px;"></td>
              <td>
                <select class="form-control" id="new-grant-stat" style="width: 120px;">
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td>
                <button class="btn btn-sm btn-primary" style="padding: 4px;" id="add-grant-btn">
                  ${ICONS.plus}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    container.querySelector("#add-grant-btn").addEventListener("click", () => {
      const title = container.querySelector("#new-grant-title").value.trim();
      const agency = container.querySelector("#new-grant-agency").value.trim();
      const amount = parseInt(container.querySelector("#new-grant-amount").value) || 0;
      const duration = container.querySelector("#new-grant-dur").value.trim() || "3 Years";
      const status = container.querySelector("#new-grant-stat").value;

      if (!title || !agency || amount <= 0) {
        showToast("Please fill in project title, agency, and a positive funding amount", "warning");
        return;
      }

      list.push({ title, agency, amount, duration, status });
      renderEditorTabContent();
    });

    container.querySelectorAll("[data-delete-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-delete-idx"));
        list.splice(idx, 1);
        renderEditorTabContent();
      });
    });
  }

  function renderPlacementsTab(container, tempDep) {
    const list = tempDep.metrics.placements;
    container.innerHTML = `
      <div class="table-manager">
        <div class="table-manager-header">
          <h3>Campus Recruiter Placements</h3>
        </div>
        
        <table class="custom-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Students Placed</th>
              <th>Package (LPA)</th>
              <th style="width: 50px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((p, idx) => `
              <tr>
                <td><strong>${p.company}</strong></td>
                <td>${p.studentsPlaced}</td>
                <td>₹${p.packageLpa} LPA</td>
                <td>
                  <button class="btn btn-sm btn-danger" style="padding: 4px;" data-delete-idx="${idx}">
                    ${ICONS.trash}
                  </button>
                </td>
              </tr>
            `).join("")}
            
            <tr style="background: rgba(14, 165, 233, 0.03);">
              <td><input type="text" class="form-control" id="new-pl-company" placeholder="Google, Amazon..."></td>
              <td><input type="number" class="form-control" id="new-pl-count" placeholder="Placed..."></td>
              <td><input type="number" step="0.1" class="form-control" id="new-pl-package" placeholder="LPA..."></td>
              <td>
                <button class="btn btn-sm btn-primary" style="padding: 4px;" id="add-pl-btn">
                  ${ICONS.plus}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    container.querySelector("#add-pl-btn").addEventListener("click", () => {
      const company = container.querySelector("#new-pl-company").value.trim();
      const studentsPlaced = parseInt(container.querySelector("#new-pl-count").value) || 0;
      const packageLpa = parseFloat(container.querySelector("#new-pl-package").value) || 0.0;

      if (!company || studentsPlaced <= 0 || packageLpa <= 0) {
        showToast("Please provide valid company name, placement count, and salary package", "warning");
        return;
      }

      list.push({ company, studentsPlaced, packageLpa });
      renderEditorTabContent();
    });

    container.querySelectorAll("[data-delete-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-delete-idx"));
        list.splice(idx, 1);
        renderEditorTabContent();
      });
    });
  }

  function renderEventsTab(container, tempDep) {
    const list = tempDep.metrics.events;
    container.innerHTML = `
      <div class="table-manager">
        <div class="table-manager-header">
          <h3>Academic Events & Conferences</h3>
        </div>
        
        <table class="custom-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Attendees</th>
              <th style="width: 50px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((ev, idx) => `
              <tr>
                <td><strong>${ev.name}</strong></td>
                <td>${ev.type}</td>
                <td>${ev.date}</td>
                <td>${ev.attendees}</td>
                <td>
                  <button class="btn btn-sm btn-danger" style="padding: 4px;" data-delete-idx="${idx}">
                    ${ICONS.trash}
                  </button>
                </td>
              </tr>
            `).join("")}
            
            <tr style="background: rgba(14, 165, 233, 0.03);">
              <td><input type="text" class="form-control" id="new-ev-name" placeholder="Name..."></td>
              <td>
                <select class="form-control" id="new-ev-type" style="width: 130px;">
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Hackathon">Hackathon</option>
                </select>
              </td>
              <td><input type="date" class="form-control" id="new-ev-date" style="width: 140px;"></td>
              <td><input type="number" class="form-control" id="new-ev-attendees" placeholder="Count..." style="width: 90px;"></td>
              <td>
                <button class="btn btn-sm btn-primary" style="padding: 4px;" id="add-ev-btn">
                  ${ICONS.plus}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    container.querySelector("#new-ev-date").value = new Date().toISOString().split('T')[0];

    container.querySelector("#add-ev-btn").addEventListener("click", () => {
      const name = container.querySelector("#new-ev-name").value.trim();
      const type = container.querySelector("#new-ev-type").value;
      const date = container.querySelector("#new-ev-date").value;
      const attendees = parseInt(container.querySelector("#new-ev-attendees").value) || 0;

      if (!name || !date || attendees <= 0) {
        showToast("Please provide event name, date, and estimated number of attendees", "warning");
        return;
      }

      list.push({ name, type, date, attendees });
      renderEditorTabContent();
    });

    container.querySelectorAll("[data-delete-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-delete-idx"));
        list.splice(idx, 1);
        renderEditorTabContent();
      });
    });
  }

  function renderAchievementsTab(container, tempDep) {
    if (!tempDep.metrics.achievements) {
      tempDep.metrics.achievements = [];
    }
    const list = tempDep.metrics.achievements;

    container.innerHTML = `
      <div class="table-manager">
        <div class="table-manager-header">
          <h3>Notable Awards & Recognitions</h3>
        </div>
        
        <table class="custom-table">
          <thead>
            <tr>
              <th>Achievement Detail</th>
              <th>Recipient</th>
              <th>Category</th>
              <th style="width: 50px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((ac, idx) => `
              <tr>
                <td><strong>${ac.detail}</strong></td>
                <td>${ac.recipient}</td>
                <td><span class="status-badge approved" style="font-size:10px;">${ac.category}</span></td>
                <td>
                  <button class="btn btn-sm btn-danger" style="padding: 4px;" data-delete-idx="${idx}">
                    ${ICONS.trash}
                  </button>
                </td>
              </tr>
            `).join("")}
            
            <tr style="background: rgba(14, 165, 233, 0.03);">
              <td><input type="text" class="form-control" id="new-ac-detail" placeholder="Detail..."></td>
              <td><input type="text" class="form-control" id="new-ac-recipient" placeholder="Recipient..."></td>
              <td>
                <select class="form-control" id="new-ac-cat" style="width: 140px;">
                  <option value="Faculty Award">Faculty Award</option>
                  <option value="Student Award">Student Award</option>
                  <option value="Fellowship">Fellowship</option>
                  <option value="Research Award">Research Award</option>
                  <option value="Competition">Competition</option>
                </select>
              </td>
              <td>
                <button class="btn btn-sm btn-primary" style="padding: 4px;" id="add-ac-btn">
                  ${ICONS.plus}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    container.querySelector("#add-ac-btn").addEventListener("click", () => {
      const detail = container.querySelector("#new-ac-detail").value.trim();
      const recipient = container.querySelector("#new-ac-recipient").value.trim();
      const category = container.querySelector("#new-ac-cat").value;

      if (!detail || !recipient) {
        showToast("Please fill out award description and recipient name", "warning");
        return;
      }

      list.push({ detail, recipient, category });
      renderEditorTabContent();
    });

    container.querySelectorAll("[data-delete-idx]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-delete-idx"));
        list.splice(idx, 1);
        renderEditorTabContent();
      });
    });
  }

  function saveEditorChanges() {
    const index = state.departments.findIndex(d => d.id === state.activeEditorDepId);
    if (index !== -1) {
      state.tempDepData.lastUpdated = new Date().toISOString().split('T')[0];
      state.departments[index] = state.tempDepData;
      saveDepartmentsData(state.departments);
      state.activeEditorDepId = null;
      state.tempDepData = null;
      showToast("Department report updated successfully!", "success");
      navigateTo("departments");
    }
  }

  function exportDatabase() {
    try {
      const dataStr = JSON.stringify(state.departments, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `apex_reports_backup_${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      showToast("Report database backup downloaded!", "info");
    } catch (e) {
      showToast("Failed to export database backup.", "error");
    }
  }

  function importDatabase(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported) && imported.length > 0 && imported[0].id) {
          state.departments = imported;
          saveDepartmentsData(imported);
          showToast("Database restored successfully!", "success");
          navigateTo("dashboard");
        } else {
          showToast("Invalid backup file structure.", "error");
        }
      } catch (err) {
        showToast("Failed to parse JSON file.", "error");
      }
    };
    reader.readAsText(file);
  }

  /* ==========================================================================
     Report Compiler & PDF Preview View Rendering
     ========================================================================== */
  function renderReportCompiler(container) {
    if (!state.compilerConfig.selectedDepartments || state.compilerConfig.selectedDepartments.length === 0) {
      state.compilerConfig.selectedDepartments = state.departments.map(d => d.id);
    }

    container.innerHTML = `
      <div class="top-nav">
        <div class="page-header">
          <h1>Integrated Report Compiler</h1>
          <p>Customize components, styles, and filter departments to construct the institutional annual report</p>
        </div>
      </div>

      <div class="compiler-layout">
        <!-- Left side: Compiler Options Form -->
        <div class="glass-card compiler-settings">
          <div style="border-bottom: 1px solid var(--border); padding-bottom: 15px;">
            <h3 style="font-family: var(--font-title); font-size: 15px; font-weight:600; margin-bottom: 5px;">Report Details</h3>
            
            <div class="form-group">
              <label>Main Report Title</label>
              <input type="text" class="form-control" id="comp-title-input" value="${state.compilerConfig.title}">
            </div>
            <div class="form-group">
              <label>Institution Subtitle</label>
              <input type="text" class="form-control" id="comp-sub-input" value="${state.compilerConfig.subtitle}">
            </div>
            <div class="form-group">
              <label>Academic Year</label>
              <select class="form-control" id="comp-year-select">
                <option value="2025-2026" ${state.compilerConfig.academicYear === "2025-2026" ? "selected" : ""}>2025-2026</option>
                <option value="2026-2027" ${state.compilerConfig.academicYear === "2026-2027" ? "selected" : ""}>2026-2027</option>
              </select>
            </div>
          </div>

          <div style="border-bottom: 1px solid var(--border); padding-bottom: 15px;">
            <h3 style="font-family: var(--font-title); font-size: 15px; font-weight:600; margin-bottom: 5px;">Aesthetics & Layout</h3>
            
            <div class="form-group">
              <label>Design Theme Template</label>
              <select class="form-control" id="comp-theme-select">
                ${Object.keys(REPORT_THEMES).map(key => `
                  <option value="${key}" ${state.compilerConfig.theme === key ? "selected" : ""}>${REPORT_THEMES[key].name}</option>
                `).join("")}
              </select>
            </div>
          </div>

          <div style="border-bottom: 1px solid var(--border); padding-bottom: 15px;">
            <h3 style="font-family: var(--font-title); font-size: 15px; font-weight:600; margin-bottom: 5px;">Filter Data</h3>
            
            <label class="check-item" style="margin-top: 10px;">
              <input type="checkbox" id="comp-pending-check" ${state.compilerConfig.includePending ? "checked" : ""}>
              <span>Include Pending Review reports</span>
            </label>
            
            <div class="form-group" style="margin-top: 15px;">
              <label>Select Departments to Include</label>
              <div class="check-list">
                ${state.departments.map(dep => {
                  const isChecked = state.compilerConfig.selectedDepartments.includes(dep.id);
                  return `
                    <label class="check-item">
                      <input type="checkbox" class="dep-filter-checkbox" data-dep-id="${dep.id}" ${isChecked ? "checked" : ""}>
                      <span>${dep.name} (${dep.status})</span>
                    </label>
                  `;
                }).join("")}
              </div>
            </div>
          </div>

          <div style="border-bottom: 1px solid var(--border); padding-bottom: 15px;">
            <h3 style="font-family: var(--font-title); font-size: 15px; font-weight:600; margin-bottom: 5px;">Report Chapters</h3>
            <div class="check-list">
              <label class="check-item">
                <input type="checkbox" class="sec-toggle-checkbox" data-sec="cover" ${state.compilerConfig.sections.cover ? "checked" : ""}>
                <span>Cover Page</span>
              </label>
              <label class="check-item">
                <input type="checkbox" class="sec-toggle-checkbox" data-sec="toc" ${state.compilerConfig.sections.toc ? "checked" : ""}>
                <span>Table of Contents</span>
              </label>
              <label class="check-item">
                <input type="checkbox" class="sec-toggle-checkbox" data-sec="executiveSummary" ${state.compilerConfig.sections.executiveSummary ? "checked" : ""}>
                <span>Executive Summary & stats</span>
              </label>
              <label class="check-item">
                <input type="checkbox" class="sec-toggle-checkbox" data-sec="publications" ${state.compilerConfig.sections.publications ? "checked" : ""}>
                <span>Publications</span>
              </label>
              <label class="check-item">
                <input type="checkbox" class="sec-toggle-checkbox" data-sec="grants" ${state.compilerConfig.sections.grants ? "checked" : ""}>
                <span>Research Grants</span>
              </label>
              <label class="check-item">
                <input type="checkbox" class="sec-toggle-checkbox" data-sec="placements" ${state.compilerConfig.sections.placements ? "checked" : ""}>
                <span>Placements</span>
              </label>
              <label class="check-item">
                <input type="checkbox" class="sec-toggle-checkbox" data-sec="events" ${state.compilerConfig.sections.events ? "checked" : ""}>
                <span>Events & Conferences</span>
              </label>
              <label class="check-item">
                <input type="checkbox" class="sec-toggle-checkbox" data-sec="achievements" ${state.compilerConfig.sections.achievements ? "checked" : ""}>
                <span>Notable Achievements</span>
              </label>
            </div>
          </div>

          <div>
            <h3 style="font-family: var(--font-title); font-size: 15px; font-weight:600; margin-bottom: 5px;">Director's / Custom Message</h3>
            <textarea class="form-control" id="comp-msg-input" style="font-size: 12px; height: 100px;">${state.compilerConfig.customMessage}</textarea>
          </div>
        </div>

        <!-- Right side: Realtime HTML Render Frame -->
        <div class="compiler-preview-pane">
          <div class="preview-bar">
            <span class="preview-title">Live Preview (A4 layout representation)</span>
            <button class="btn btn-primary btn-sm" id="trigger-print-btn">
              ${ICONS.check} Print / Save as PDF
            </button>
          </div>
          <iframe class="preview-iframe" id="report-preview-frame"></iframe>
        </div>
      </div>
    `;

    const titleInput = container.querySelector("#comp-title-input");
    const subInput = container.querySelector("#comp-sub-input");
    const yearSelect = container.querySelector("#comp-year-select");
    const themeSelect = container.querySelector("#comp-theme-select");
    const pendingCheck = container.querySelector("#comp-pending-check");
    const msgInput = container.querySelector("#comp-msg-input");

    const updatePreview = () => {
      state.compilerConfig.title = titleInput.value.trim();
      state.compilerConfig.subtitle = subInput.value.trim();
      state.compilerConfig.academicYear = yearSelect.value;
      state.compilerConfig.theme = themeSelect.value;
      state.compilerConfig.includePending = pendingCheck.checked;
      state.compilerConfig.customMessage = msgInput.value;

      const compiledHtml = compileReport(state.departments, state.compilerConfig);
      
      const iframe = document.getElementById("report-preview-frame");
      if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(compiledHtml);
        doc.close();
      }
    };

    [titleInput, subInput, msgInput].forEach(inp => inp.addEventListener("input", updatePreview));
    [yearSelect, themeSelect, pendingCheck].forEach(sel => sel.addEventListener("change", updatePreview));

    container.querySelectorAll(".dep-filter-checkbox").forEach(chk => {
      chk.addEventListener("change", () => {
        const depId = chk.getAttribute("data-dep-id");
        const selected = state.compilerConfig.selectedDepartments;
        if (chk.checked) {
          if (!selected.includes(depId)) selected.push(depId);
        } else {
          state.compilerConfig.selectedDepartments = selected.filter(id => id !== depId);
        }
        updatePreview();
      });
    });

    container.querySelectorAll(".sec-toggle-checkbox").forEach(chk => {
      chk.addEventListener("change", () => {
        const secName = chk.getAttribute("data-sec");
        state.compilerConfig.sections[secName] = chk.checked;
        updatePreview();
      });
    });

    container.querySelector("#trigger-print-btn")?.addEventListener("click", () => {
      const iframe = document.getElementById("report-preview-frame");
      if (iframe) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
    });

    updatePreview();
  }

  /* ==========================================================================
     Settings/Configuration View Rendering
     ========================================================================== */
  function renderSettings(container) {
    container.innerHTML = `
      <div class="top-nav">
        <div class="page-header">
          <h1>System Configuration</h1>
          <p>Manage system storage, configuration files, backup databases, and restore original data values</p>
        </div>
      </div>

      <div class="glass-card" style="max-width: 650px; display: flex; flex-direction: column; gap: 25px; margin-bottom: 30px;">
        <div>
          <h3 style="font-family: var(--font-title); font-size: 16px; font-weight: 600; color: var(--text-main); border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 15px;">
            Backup & Restore Database
          </h3>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px;">
            Export the current report workspace containing all modified, added, and integrated departmental records. 
            You can load this backup file later or import it on another machine.
          </p>
          <div style="display: flex; align-items: center; gap: 15px;">
            <button class="btn btn-primary" id="export-backup-btn">
              ${ICONS.compiler} Export Workspace Backup (.json)
            </button>
            <button class="btn" id="trigger-import-btn">
              ${ICONS.plus} Restore Backup File
            </button>
            <input type="file" id="import-file-input" accept=".json" style="display: none;">
          </div>
        </div>
      </div>

      <div class="glass-card" style="max-width: 650px; display: flex; flex-direction: column; gap: 20px;">
        <h3 style="font-family: var(--font-title); font-size: 16px; font-weight: 600; color: var(--text-main); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
          Reset Storage
        </h3>
        
        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6;">
          Revert all department reports back to their initial pre-filled states, erasing any edits you have made.
        </p>

        <div class="help-alert">
          ${ICONS.alert}
          <div>
            <strong>Resetting Storage Data:</strong><br>
            Doing this will wipe any modifications, newly added publications, placements, and achievements, 
            reloading the default sample departmental logs.
          </div>
        </div>

        <div style="display: flex; gap: 15px; margin-top: 10px;">
          <button class="btn btn-danger" id="reset-storage-btn">
            ${ICONS.trash} Reset Local Storage Data
          </button>
        </div>
      </div>
    `;

    // Bind Backup/Restore actions
    container.querySelector("#export-backup-btn")?.addEventListener("click", exportDatabase);
    
    const importInput = container.querySelector("#import-file-input");
    container.querySelector("#trigger-import-btn")?.addEventListener("click", () => {
      importInput.click();
    });
    importInput?.addEventListener("change", importDatabase);

    container.querySelector("#reset-storage-btn")?.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all department reports to their default pre-filled states? This will overwrite your changes.")) {
        state.departments = resetDepartmentsData();
        showToast("System database reset successfully!", "success");
        navigateTo("dashboard");
      }
    });
  }
})();
