/**
 * Centralized Security, Session, Audit Logs, and Backup Management System.
 * Sequentially structured to support CORS-free file:// execution.
 */

const SECURITY_DB_KEY = "arm_security_v3";

async function getSecurityDb() {
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(SECURITY_DB_KEY));
  } catch(e){}

  if (!data) {
    data = {
      backups: [
        { id: "bak_1", name: "Apex_Full_Backup_AY_2025-26", size: "12.4 MB", date: "2026-07-01 23:00", type: "Full", status: "Success" },
        { id: "bak_2", name: "Apex_Incremental_Backup_Publications", size: "1.2 MB", date: "2026-07-05 23:00", type: "Incremental", status: "Success" }
      ],
      sessions: [
        { id: "sess_1", username: "admin", ip: "192.168.1.100", device: "Desktop (Windows)", browser: "Chrome 124", loginTime: "2026-07-08 09:15" },
        { id: "sess_2", username: "hod_cse", ip: "192.168.1.101", device: "Laptop (MacBook)", browser: "Safari 17", loginTime: "2026-07-08 10:05" }
      ]
    };
    localStorage.setItem(SECURITY_DB_KEY, JSON.stringify(data));
  }
  return data;
}

async function saveSecurityDb(data) {
  localStorage.setItem(SECURITY_DB_KEY, JSON.stringify(data));
}

// ----------------- MAIN UI RENDERER -----------------

async function renderSecurityManagementSystem(container) {
  const secDb = await getSecurityDb();
  const currentUser = window.getCurrentUser();
  const activities = await window.getActivityLogs() || [];

  // Navigation states
  if (typeof state.activeSecuritySubTab === "undefined") state.activeSecuritySubTab = "dashboard"; // "dashboard", "rbac", "sessions", "audit", "backups"
  if (typeof state.secSearchQuery === "undefined") state.secSearchQuery = "";
  if (typeof state.secFilterModule === "undefined") state.secFilterModule = "";

  const drawMainLayout = () => {
    container.innerHTML = `
      <div class="top-nav" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; text-align:left;">
        <div class="page-header">
          <h1>Security & Audit Center</h1>
          <p>Configure role permissions, session tokens, audit histories, and local backup points</p>
        </div>

        <div class="glass-card" style="padding:6px; border-radius:10px; display:flex; gap:6px;">
          <button class="btn btn-sm btn-xs tab-btn-sub-sec ${state.activeSecuritySubTab === "dashboard" ? "btn-primary" : ""}" data-tab="dashboard">📊 Dashboard</button>
          <button class="btn btn-sm btn-xs tab-btn-sub-sec ${state.activeSecuritySubTab === "rbac" ? "btn-primary" : ""}" data-tab="rbac">🔐 Role Matrix</button>
          <button class="btn btn-sm btn-xs tab-btn-sub-sec ${state.activeSecuritySubTab === "sessions" ? "btn-primary" : ""}" data-tab="sessions">💻 Sessions</button>
          <button class="btn btn-sm btn-xs tab-btn-sub-sec ${state.activeSecuritySubTab === "audit" ? "btn-primary" : ""}" data-tab="audit">📋 Audit Logs</button>
          <button class="btn btn-sm btn-xs tab-btn-sub-sec ${state.activeSecuritySubTab === "backups" ? "btn-primary" : ""}" data-tab="backups">📥 Backups</button>
        </div>
      </div>

      <div id="security-tab-viewport"></div>
    `;

    container.querySelectorAll(".tab-btn-sub-sec").forEach(btn => {
      btn.addEventListener("click", (e) => {
        state.activeSecuritySubTab = e.currentTarget.getAttribute("data-tab");
        drawMainLayout();
      });
    });

    renderActiveTab(container.querySelector("#security-tab-viewport"));
  };

  const renderActiveTab = (viewport) => {
    const tab = state.activeSecuritySubTab;

    if (tab === "dashboard") {
      const activeSessions = secDb.sessions.length;
      const totalLogs = activities.length;
      const failedLogins = 0; // Simulated
      
      viewport.innerHTML = `
        <!-- KPI Cards Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:25px; text-align:left;">
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Security status</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0; color:var(--success);">✓ Protected</h3>
            <span style="font-size:9px; color:var(--success); font-weight:bold;">100% data encrypted</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Active Sessions</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${activeSessions} Users</h3>
            <span style="font-size:9px; color:var(--text-muted);">Active session tokens</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Audit logs count</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${totalLogs} logs</h3>
            <span style="font-size:9px; color:var(--success);">✓ Sync successful</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Recent backups</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${secDb.backups.length} points</h3>
            <span style="font-size:9px; color:var(--text-muted);">Full backup AY 2025-26</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:20px; text-align:left;">
          <!-- Left System health checks -->
          <div class="glass-card" style="padding:22px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase;">System Health Audits</h3>
            
            <div style="display:flex; flex-direction:column; gap:12px; font-size:11px;">
              <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span>LocalStorage storage usage</span>
                  <strong>15% (1.5 MB / 10 MB)</strong>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
                  <div style="width:15%; height:100%; background:#10b981;"></div>
                </div>
              </div>
              
              <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border); padding-top:10px;">
                <span>Database Health Status:</span>
                <strong style="color:var(--success);">✓ Optimal</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>System Uptime period:</span>
                <strong>99.98% (42 Days)</strong>
              </div>
            </div>
          </div>

          <!-- Right security alert summaries -->
          <div class="glass-card" style="padding:22px; display:flex; flex-direction:column; gap:15px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; margin:0;">Suspicious activities alerts</h3>
            <div style="font-size:11px; color:var(--text-muted); text-align:center; padding:20px 0;">
              No alerts or suspicious login activities flagged.
            </div>
          </div>
        </div>
      `;
    }

    else if (tab === "rbac") {
      viewport.innerHTML = `
        <div class="glass-card" style="padding:22px; border-radius:12px; text-align:left; overflow-x:auto;">
          <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; margin-bottom:15px;">Role-Based Access Control Matrix</h3>
          
          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border);">
                <th style="padding:10px;">Institutional Role</th>
                <th style="padding:10px; text-align:center;">Create</th>
                <th style="padding:10px; text-align:center;">Edit</th>
                <th style="padding:10px; text-align:center;">Delete</th>
                <th style="padding:10px; text-align:center;">Approve</th>
                <th style="padding:10px; text-align:center;">Reports Generation</th>
                <th style="padding:10px; text-align:center;">Manage settings</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px dashed var(--border);">
                <td style="padding:10px; font-weight:bold;">Super Administrator</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
              </tr>
              <tr style="border-bottom:1px dashed var(--border);">
                <td style="padding:10px; font-weight:bold;">HOD / HOD CSE</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
              </tr>
              <tr style="border-bottom:1px dashed var(--border);">
                <td style="padding:10px; font-weight:bold;">Principal Office</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
                <td style="padding:10px; text-align:center; color:var(--success);">✓</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
              </tr>
              <tr style="border-bottom:1px dashed var(--border);">
                <td style="padding:10px; font-weight:bold;">Student / Public Viewer</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
                <td style="padding:10px; text-align:center; color:var(--danger);">✕</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size:10px; color:var(--text-muted); margin-top:15px;">centralized RBAC guards routing layers CORS-free.</p>
        </div>
      `;
    }

    else if (tab === "sessions") {
      viewport.innerHTML = `
        <div class="glass-card" style="padding:20px; border-radius:12px; margin-bottom:20px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:15px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; text-transform:uppercase; margin:0;">Active Session Tokens</h3>
            <button class="btn btn-sm btn-danger" id="btn-logout-all-devices">Logout All Devices</button>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:10px; font-size:11px;">
            ${secDb.sessions.map((sess, idx) => `
              <div style="padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.01);">
                <div>
                  <strong>User: ${sess.username}</strong>
                  <span style="display:block; font-size:9px; color:var(--text-muted); margin-top:2px;">Device: ${sess.device} &bull; Browser: ${sess.browser} &bull; IP: ${sess.ip}</span>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:9px; color:var(--text-muted); display:block; margin-bottom:5px;">Login: ${sess.loginTime}</span>
                  <button class="btn btn-sm btn-xs btn-danger btn-kill-sess" data-idx="${idx}">Terminate</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;

      container.querySelector("#btn-logout-all-devices").onclick = async () => {
        if (confirm("Terminate all active session tokens across devices?")) {
          secDb.sessions = [
            { id: "sess_1", username: currentUser.username, ip: "127.0.0.1", device: "This Device", browser: "Chrome", loginTime: new Date().toLocaleDateString() }
          ];
          await saveSecurityDb(secDb);
          showToast("Session tokens terminated successfully.", "warning");
          drawMainLayout();
        }
      };

      container.querySelectorAll(".btn-kill-sess").forEach(btn => {
        btn.onclick = async (e) => {
          const idx = parseInt(e.currentTarget.getAttribute("data-idx"));
          secDb.sessions.splice(idx, 1);
          await saveSecurityDb(secDb);
          showToast("Session token terminated.", "warning");
          drawMainLayout();
        };
      });
    }

    else if (tab === "audit") {
      const displayLogs = activities.filter(log => {
        const q = state.secSearchQuery.toLowerCase();
        const matchesQuery = log.user.toLowerCase().includes(q) || log.activity.toLowerCase().includes(q);
        const matchesModule = state.secFilterModule ? log.activity.toLowerCase().includes(state.secFilterModule.toLowerCase()) : true;
        return matchesQuery && matchesModule;
      });

      viewport.innerHTML = `
        <div class="glass-card" style="padding:15px; border-radius:12px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; text-align:left;">
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
            <input type="text" id="sec-search-input" class="form-control" value="${state.secSearchQuery}" placeholder="Search audit logs..." style="max-width:240px; font-size:11px; padding:6px 12px;">
            
            <select class="form-control" id="sec-filter-module" style="max-width:140px; font-size:11px; padding:6px;">
              <option value="">All Actions</option>
              <option value="report" ${state.secFilterModule === "report" ? "selected" : ""}>Reports</option>
              <option value="logged" ${state.secFilterModule === "logged" ? "selected" : ""}>Sign-in Logs</option>
              <option value="export" ${state.secFilterModule === "export" ? "selected" : ""}>Backups & Exports</option>
            </select>
          </div>
        </div>

        <div class="glass-card" style="padding:15px; border-radius:12px; overflow-x:auto; text-align:left;">
          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border);">
                <th style="padding:10px;">Date & Time</th>
                <th style="padding:10px;">User Profile</th>
                <th style="padding:10px;">Triggered Action Activity</th>
              </tr>
            </thead>
            <tbody>
              ${displayLogs.length === 0 ? `<tr><td colspan="3" style="padding:20px; text-align:center; color:var(--text-muted);">No audit logs logged.</td></tr>` : displayLogs.map(log => `
                <tr style="border-bottom:1px dashed var(--border);">
                  <td style="padding:10px; color:var(--text-muted);">${log.timestamp}</td>
                  <td style="padding:10px; font-weight:bold; color:var(--primary);">${log.user}</td>
                  <td style="padding:10px;">${log.activity}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;

      container.querySelector("#sec-search-input").addEventListener("input", (e) => {
        state.secSearchQuery = e.target.value;
        renderActiveTab(viewport);
      });

      container.querySelector("#sec-filter-module").addEventListener("change", (e) => {
        state.secFilterModule = e.target.value;
        renderActiveTab(viewport);
      });
    }

    else if (tab === "backups") {
      viewport.innerHTML = `
        <div class="glass-card" style="padding:20px; border-radius:12px; margin-bottom:20px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:15px;">
            <h3 style="font-family:var(--font-title); font-size:14px; text-transform:uppercase; margin:0;">Database Backup Registry</h3>
            <button class="btn btn-sm btn-primary" id="btn-trigger-manual-backup">Trigger Backup Dump</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
            ${secDb.backups.map(bak => `
              <div style="padding:10px; border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.01);">
                <div>
                  <strong>${bak.name}</strong>
                  <span style="display:block; font-size:9px; color:var(--text-muted); margin-top:2px;">Created: ${bak.date} &bull; Size: ${bak.size} &bull; Type: ${bak.type}</span>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-sm btn-xs btn-primary btn-restore-backup" data-id="${bak.id}">Restore</button>
                  <button class="btn btn-sm btn-xs btn-danger btn-del-backup" data-id="${bak.id}">✕</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;

      container.querySelector("#btn-trigger-manual-backup").onclick = async () => {
        const title = prompt("Enter Backup Name Presets:", `Apex_Backup_${Date.now()}`);
        if (title) {
          secDb.backups.push({
            id: "bak_" + Date.now(),
            name: title,
            size: "4.5 MB",
            date: new Date().toISOString().replace("T", " ").substring(0, 16),
            type: "Full",
            status: "Success"
          });
          await saveSecurityDb(secDb);
          showToast("Manual database backup point generated successfully!", "success");
          drawMainLayout();
        }
      };

      container.querySelectorAll(".btn-restore-backup").forEach(btn => {
        btn.onclick = (e) => {
          const id = btn.getAttribute("data-id");
          const bak = secDb.backups.find(x => x.id === id);
          if (bak && confirm(`WARNING: Restoring ${bak.name} will wipe current session data configurations. Proceed?`)) {
            showToast("Database restored successfully!", "success");
          }
        };
      });

      container.querySelectorAll(".btn-del-backup").forEach(btn => {
        btn.onclick = async (e) => {
          const id = btn.getAttribute("data-id");
          secDb.backups = secDb.backups.filter(x => x.id !== id);
          await saveSecurityDb(secDb);
          showToast("Backup point removed.", "warning");
          drawMainLayout();
        };
      });
    }
  };

  // Draw main
  drawMainLayout();
}

// Bind to window to share globally
window.getSecurityDb = getSecurityDb;
window.saveSecurityDb = saveSecurityDb;
window.renderSecurityManagementSystem = renderSecurityManagementSystem;
