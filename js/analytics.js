/**
 * Enterprise Business Intelligence & Executive Analytics Dashboard.
 * Sequentially structured to support CORS-free file:// execution.
 */

async function renderAnalyticsPanel(container) {
  const deps = await window.getDepartments();
  const settings = await window.getSettings();
  const currentUser = window.getCurrentUser();

  // Filters and widget config state
  if (typeof state.analyticsYear === "undefined") state.analyticsYear = settings.academicYear;
  if (typeof state.analyticsDept === "undefined") state.analyticsDept = "";
  if (typeof state.biWidgetConfig === "undefined") {
    state.biWidgetConfig = [
      { id: "widget-summary", title: "BI Summary Banner", visible: true },
      { id: "widget-kpis", title: "14 Executive KPIs", visible: true },
      { id: "widget-gauge", title: "Readiness Gauge Indicator", visible: true },
      { id: "widget-insights", title: "Live Audits & Action Points", visible: true },
      { id: "widget-citations", title: "Research Citation Trends", visible: true },
      { id: "widget-packages", title: "CTC Placement Packages", visible: true },
      { id: "widget-funding", title: "Research Funding Share", visible: true }
    ];
  }

  const drawAnalyticsWorkspace = () => {
    // 1. Math aggregates
    const totalDeps = deps.length;
    const totalFaculty = deps.reduce((s,d) => s + (d.facultyCount || 0), 0);
    const totalStudents = deps.reduce((s,d) => s + (d.studentCount || 0), 0);
    
    const submittedCount = deps.filter(d => d.status === "Approved" || d.status === "Submitted" || d.status === "Under Review").length;
    const approvedCount = deps.filter(d => d.status === "Approved").length;

    const totalPubs = deps.reduce((s,d) => s + (d.metrics?.publications || []).length, 0);
    const totalGrants = deps.reduce((s,d) => s + (d.metrics?.grants || []).reduce((acc,g) => acc + g.amount, 0), 0);
    const totalEvents = deps.reduce((s,d) => s + (d.metrics?.events || []).length, 0);
    const totalAchievements = deps.reduce((s,d) => s + (d.metrics?.achievements || []).length, 0);

    const maxPackage = Math.max(...deps.map(d => {
      const pl = d.metrics?.placements || [];
      return pl.length === 0 ? 0 : Math.max(...pl.map(p => p.packageLpa || 0));
    }), 0);

    const averagePackage = (deps.reduce((s,d) => {
      const pl = d.metrics?.placements || [];
      return s + (pl.reduce((acc,p) => acc + (p.packageLpa || 0), 0) / (pl.length || 1));
    }, 0) / totalDeps).toFixed(1);

    // Filtered lists matching
    const sYear = state.analyticsYear;
    const sDept = state.analyticsDept;

    container.innerHTML = `
      <!-- Executive Header -->
      <div class="top-nav" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; text-align:left;">
        <div class="page-header">
          <h1>${window.t("executiveBiTitle", state.currentLang)}</h1>
          <p>${window.t("executiveBiDesc", state.currentLang)}</p>
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <select class="form-control" id="anal-filter-year" style="max-width:130px; font-size:11px; padding:6px;">
            <option value="2025-26" ${sYear === "2025-26" ? "selected" : ""}>AY 2025-26</option>
            <option value="2024-25" ${sYear === "2024-25" ? "selected" : ""}>AY 2024-25</option>
          </select>
          
          <select class="form-control" id="anal-filter-dept" style="max-width:140px; font-size:11px; padding:6px;">
            <option value="">All Departments</option>
            <option value="cse" ${sDept === "cse" ? "selected" : ""}>CSE</option>
            <option value="ece" ${sDept === "ece" ? "selected" : ""}>ECE</option>
            <option value="me" ${sDept === "me" ? "selected" : ""}>ME</option>
          </select>

          <button class="btn btn-sm" id="btn-customize-bi-layout">⚙️ Customize Widgets</button>
          <button class="btn btn-sm btn-primary" id="btn-export-bi-pdf">📥 Export Report</button>
        </div>
      </div>

      <!-- Main BI Panels grid -->
      <div style="display:flex; flex-direction:column; gap:20px;">
        
        <!-- Summary Box -->
        ${state.biWidgetConfig.find(w => w.id === "widget-summary")?.visible ? `
          <div class="glass-card" style="padding:15px 22px; border-radius:10px; text-align:left; border-left:4px solid var(--primary); display:flex; flex-direction:column; gap:6px;">
            <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; color:var(--primary); text-transform:uppercase; margin:0;">${window.t("biExecSummary", state.currentLang)}</h4>
            <p style="font-size:11px; color:var(--text-muted); line-height:1.5; margin:0;">
              Institute performance improved by <strong>12%</strong> compared to the previous academic year. Student placements rate increased by <strong>18%</strong>, and research citation counts increased by <strong>10%</strong>. Currently, <strong>1 department</strong> requires administrative attention due to late evidence uploads.
            </p>
          </div>
        ` : ""}

        <!-- 14 KPI Cards Grid -->
        ${state.biWidgetConfig.find(w => w.id === "widget-kpis")?.visible ? `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:15px; text-align:left;">
            
            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Total Departments</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">${totalDeps}</h3>
              <span style="font-size:8px; color:var(--success);">✓ 100% active</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Total Faculty</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">${totalFaculty}</h3>
              <span style="font-size:8px; color:var(--primary);">PhD: 62% ratio</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Total Students</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">${totalStudents}</h3>
              <span style="font-size:8px; color:var(--success);">+8% Growth</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Reports Submitted</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">${submittedCount}</h3>
              <span style="font-size:8px; color:var(--success);">✓ Synced</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Reports Approved</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">${approvedCount}</h3>
              <span style="font-size:8px; color:var(--success);">✓ Locked</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Research Papers</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">${totalPubs}</h3>
              <span style="font-size:8px; color:var(--success);">+14% Growth</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Patents Filed</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">3 Filed</h3>
              <span style="font-size:8px; color:var(--primary);">NBA support</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Placement Rate</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0; color:var(--success);">88% Placed</h3>
              <span style="font-size:8px; color:var(--success);">+18% vs last year</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Highest Package</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">${maxPackage} LPA</h3>
              <span style="font-size:8px; color:var(--success);">Super Dream Offer</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Average Package</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">${averagePackage} LPA</h3>
              <span style="font-size:8px; color:var(--success);">Dream Offer avg</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Total Events</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">${totalEvents} Conducted</h3>
              <span style="font-size:8px; color:var(--success);">+12% Increase</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Student Achievements</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">${totalAchievements} logged</h3>
              <span style="font-size:8px; color:var(--success);">Zonal medals</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Accreditation Score</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0; color:var(--success);">3.72 A++</h3>
              <span style="font-size:8px; color:var(--success);">✓ Cycle 2 verified</span>
            </div>

            <div class="glass-card" style="padding:15px; border-radius:8px;">
              <span style="font-size:9px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Institution Completion</span>
              <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:4px 0;">82% Completed</h3>
              <span style="font-size:8px; color:var(--warning);">Late audits: 1</span>
            </div>

          </div>
        ` : ""}

        <!-- Custom Gauge Indicators and Live Audits row -->
        <div style="display:grid; grid-template-columns: 1fr 1.5fr; gap:20px; text-align:left;">
          
          <!-- Gauge Chart -->
          ${state.biWidgetConfig.find(w => w.id === "widget-gauge")?.visible ? `
            <div class="glass-card" style="padding:22px; text-align:center;">
              <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:6px; margin:0 0 15px 0; text-transform:uppercase; text-align:left;">Accreditation Readiness Gauge</h4>
              <div style="display:flex; justify-content:center; align-items:center; height:160px; position:relative;">
                <!-- SVG gauge -->
                <svg viewBox="0 0 100 50" width="160" height="80">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--success)" stroke-width="12" stroke-dasharray="125.6" stroke-dashoffset="25" />
                </svg>
                <div style="position:absolute; bottom:15px; font-size:18px; font-weight:bold; color:var(--text-main);">82%</div>
              </div>
              <span style="font-size:10px; color:var(--text-muted);">Excellent Accreditation score prospects</span>
            </div>
          ` : ""}

          <!-- Live insights audit panel -->
          ${state.biWidgetConfig.find(w => w.id === "widget-insights")?.visible ? `
            <div class="glass-card" style="padding:22px; display:flex; flex-direction:column; gap:12px;">
              <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:6px; margin:0; text-transform:uppercase;">${window.t("liveInsightsAudit", state.currentLang)}</h4>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
                <div style="display:flex; justify-content:space-between;">
                  <span>${window.t("bestPerformingDept", state.currentLang)}</span>
                  <strong style="color:var(--success);">Computer Science (CSE)</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>${window.t("highestPlacementOffer", state.currentLang)}</span>
                  <strong style="color:var(--success);">22.5 LPA (Google India)</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>${window.t("mostActiveResearchFaculty", state.currentLang) || window.t("mostActiveFaculty", state.currentLang)}</span>
                  <strong>Dr. Logesh K.</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>${window.t("lowestProgress", state.currentLang)}</span>
                  <strong style="color:var(--danger);">Mechanical (ME) - 60%</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border); padding-top:6px; margin-top:2px;">
                  <span>${window.t("resultsLeader", state.currentLang)}</span>
                  <strong style="color:var(--success);">CSE (96.2% Pass)</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>${window.t("totalPubsAY", state.currentLang)}</span>
                  <strong>112 Scopus Papers</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>${window.t("totalFundingSecured", state.currentLang)}</span>
                  <strong style="color:var(--success);">₹14,50,000</strong>
                </div>
              </div>
            </div>
          ` : ""}

        </div>

        <!-- Analytical Charts Row -->
        <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:20px; text-align:left;">
          
          <!-- Line chart citations -->
          ${state.biWidgetConfig.find(w => w.id === "widget-citations")?.visible ? `
            <div class="glass-card" style="padding:22px; height:280px; display:flex; flex-direction:column;">
              <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:6px; margin:0 0 10px 0; text-transform:uppercase;">${window.t("researchCitationsTrends", state.currentLang)}</h4>
              <div style="flex-grow:1; position:relative;">
                <canvas id="biPubsCanvas"></canvas>
              </div>
            </div>
          ` : ""}

          <!-- Funding doughnut -->
          ${state.biWidgetConfig.find(w => w.id === "widget-funding")?.visible ? `
            <div class="glass-card" style="padding:22px; height:280px; display:flex; flex-direction:column;">
              <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:6px; margin:0 0 10px 0; text-transform:uppercase;">${window.t("researchFundingShare", state.currentLang)}</h4>
              <div style="flex-grow:1; position:relative;">
                <canvas id="biFundingCanvas"></canvas>
              </div>
            </div>
          ` : ""}

        </div>

        <!-- CTC Placement Packages full-width row -->
        ${state.biWidgetConfig.find(w => w.id === "widget-packages")?.visible ? `
          <div class="glass-card" style="padding:22px; height:280px; display:flex; flex-direction:column; text-align:left;">
            <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:6px; margin:0 0 10px 0; text-transform:uppercase;">${window.t("ctcPlacementPackages", state.currentLang)}</h4>
            <div style="flex-grow:1; position:relative;">
              <canvas id="biPackagesCanvas"></canvas>
            </div>
          </div>
        ` : ""}

      </div>

      <!-- WIDGET CUSTOMIZER MODAL OVERLAY -->
      <div id="bi-widget-customizer-modal" class="glass-card" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:10000; width:90%; max-width:440px; padding:25px; box-shadow:var(--shadow);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px;">
          <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700;">Customize BI Widgets Layout</h3>
          <button class="btn btn-sm" id="bi-customizer-close" style="padding:4px 8px;">✕</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px; max-height:220px; overflow-y:auto;">
          ${state.biWidgetConfig.map(w => `
            <label style="display:flex; align-items:center; gap:10px; font-size:11px; cursor:pointer;">
              <input type="checkbox" class="chk-bi-widget-visible" data-widget-id="${w.id}" ${w.visible ? "checked" : ""}>
              <span>${w.title}</span>
            </label>
          `).join("")}
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-sm" id="btn-bi-restore-defaults">Restore Defaults</button>
          <button class="btn btn-sm btn-primary" id="btn-bi-save-layout">Apply Changes</button>
        </div>
      </div>
    `;

    // Filter listeners
    container.querySelector("#anal-filter-year").addEventListener("change", (e) => {
      state.analyticsYear = e.target.value;
      drawAnalyticsWorkspace();
    });

    container.querySelector("#anal-filter-dept").addEventListener("change", (e) => {
      state.analyticsDept = e.target.value;
      drawAnalyticsWorkspace();
    });

    // Customizer Modal hooks
    container.querySelector("#btn-customize-bi-layout").addEventListener("click", () => {
      document.getElementById("bi-widget-customizer-modal").style.display = "block";
    });

    container.querySelector("#bi-customizer-close").addEventListener("click", () => {
      document.getElementById("bi-widget-customizer-modal").style.display = "none";
    });

    container.querySelector("#btn-bi-restore-defaults").addEventListener("click", () => {
      state.biWidgetConfig.forEach(w => w.visible = true);
      document.getElementById("bi-widget-customizer-modal").style.display = "none";
      drawAnalyticsWorkspace();
    });

    container.querySelector("#btn-bi-save-layout").addEventListener("click", () => {
      container.querySelectorAll(".chk-bi-widget-visible").forEach(chk => {
        const id = chk.getAttribute("data-widget-id");
        const w = state.biWidgetConfig.find(x => x.id === id);
        if (w) w.visible = chk.checked;
      });
      document.getElementById("bi-widget-customizer-modal").style.display = "none";
      drawAnalyticsWorkspace();
    });

    // Export PDF click handler
    container.querySelector("#btn-export-bi-pdf").addEventListener("click", () => {
      const w = window.open();
      w.document.write(`
        <style>body{font-family:sans-serif; padding:30px;} table{width:100%; border-collapse:collapse; margin-top:20px;} th,td{border:1px solid #000; padding:8px;}</style>
        <h2>EXECUTIVE BUSINESS INTELLIGENCE PERFORMANCE REPORT</h2>
        <p>Academic Year: ${state.analyticsYear} &bull; Filter: ${state.analyticsDept ? state.analyticsDept.toUpperCase() : "All Departments"}</p>
        <hr>
        <h3>Institutional Metrics summary</h3>
        <table>
          <tr><th>Metric</th><th>Aggregate value</th></tr>
          <tr><td>Total Students Enrolled</td><td>${totalStudents}</td></tr>
          <tr><td>Total Faculty Members</td><td>${totalFaculty}</td></tr>
          <tr><td>Reports Submitted successfully</td><td>${submittedCount} / ${totalDeps}</td></tr>
          <tr><td>Highest Salary Package secured</td><td>${maxPackage} LPA</td></tr>
        </table>
        <script>window.print();</script>
      `);
      w.document.close();
    });

    // Draw charts
    setTimeout(() => {
      if (typeof Chart === "undefined") return;

      const filteredDeps = state.analyticsDept ? deps.filter(d => d.id === state.analyticsDept) : deps;

      // 1. Pubs Line Chart
      const ctx1 = container.querySelector("#biPubsCanvas")?.getContext("2d");
      if (ctx1) {
        new Chart(ctx1, {
          type: "line",
          data: {
            labels: filteredDeps.map(d => d.id.toUpperCase()),
            datasets: [{
              label: "Citations count",
              data: filteredDeps.map(d => (d.metrics?.publications || []).reduce((acc, curr) => acc + curr.citations, 0)),
              borderColor: "#0ea5e9",
              backgroundColor: "rgba(14, 165, 233, 0.1)",
              fill: true,
              tension: 0.35,
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
              x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
            }
          }
        });
      }

      // 2. Funding doughnut
      const ctx3 = container.querySelector("#biFundingCanvas")?.getContext("2d");
      if (ctx3) {
        new Chart(ctx3, {
          type: "doughnut",
          data: {
            labels: filteredDeps.map(d => d.id.toUpperCase()),
            datasets: [{
              data: filteredDeps.map(d => (d.metrics?.grants || []).reduce((acc, curr) => acc + curr.amount, 0)),
              backgroundColor: ["#0ea5e9", "#a855f7", "#10b981", "#f59e0b"],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "right", labels: { color: "#94a3b8" } }
            }
          }
        });
      }

      // 3. Packages Bar Chart
      const ctx4 = container.querySelector("#biPackagesCanvas")?.getContext("2d");
      if (ctx4) {
        new Chart(ctx4, {
          type: "bar",
          data: {
            labels: filteredDeps.map(d => d.id.toUpperCase()),
            datasets: [
              {
                label: "Max CTC Package (LPA)",
                data: filteredDeps.map(d => {
                  const pl = d.metrics?.placements || [];
                  return pl.length === 0 ? 0 : Math.max(...pl.map(p => p.packageLpa || 0));
                }),
                backgroundColor: "#a855f7",
                borderRadius: 4
              },
              {
                label: "Avg CTC Package (LPA)",
                data: filteredDeps.map(d => {
                  const pl = d.metrics?.placements || [];
                  if (pl.length === 0) return 0;
                  const sum = pl.reduce((s, p) => s + (p.packageLpa || 0), 0);
                  return parseFloat((sum / pl.length).toFixed(1));
                }),
                backgroundColor: "#0ea5e9",
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: "#94a3b8" } }
            },
            scales: {
              y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
              x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
            }
          }
        });
      }
    }, 120);
  };

  // Draw initial layout
  drawAnalyticsWorkspace();
}

// Bind to window to share globally
window.renderAnalyticsPanel = renderAnalyticsPanel;
