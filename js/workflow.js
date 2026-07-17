/**
 * Centralized Enterprise Approval Workflow Engine & Kanban Board.
 * Sequentially structured to support CORS-free file:// execution.
 */

const WORKFLOW_LOGS_KEY = "arm_workflow_history_v2";

async function getWorkflowHistory() {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(WORKFLOW_LOGS_KEY)) || [];
  } catch(e){}

  if (list.length === 0) {
    list = [
      { id: "wf_1", title: "Computer Science & Engineering Annual Report", module: "Annual Report", status: "Submitted", priority: "High", date: "2026-07-01", department: "CSE", uploader: "faculty_cse", approvalNo: "APV-2026-0001", timeline: [
        { stage: "Created", user: "faculty_cse", timestamp: "2026-07-01 09:00", comment: "Initial report draft compiled." },
        { stage: "Submitted", user: "faculty_cse", timestamp: "2026-07-01 11:30", comment: "Submitted for HOD verification." }
      ]},
      { id: "wf_2", title: "National Conference on AI Innovations", module: "Event", status: "Draft", priority: "Medium", date: "2026-07-02", department: "CSE", uploader: "hod_cse", approvalNo: "APV-2026-0002", timeline: [
        { stage: "Created", user: "hod_cse", timestamp: "2026-07-02 10:00", comment: "Event outline draft." }
      ]},
      { id: "wf_3", title: "Google India Placements drive", module: "Placement", status: "Under Review", priority: "High", date: "2026-07-03", department: "All", uploader: "placement_officer", approvalNo: "APV-2026-0003", timeline: [
        { stage: "Created", user: "placement_officer", timestamp: "2026-07-03 14:00", comment: "Log Google placement drive." },
        { stage: "Submitted", user: "placement_officer", timestamp: "2026-07-03 14:30", comment: "Submitted for verification." },
        { stage: "Under Review", user: "admin", timestamp: "2026-07-04 10:00", comment: "Reviewing eligibility criteria." }
      ]},
      { id: "wf_4", title: "Smart India Hackathon Winners Portfolio", module: "Student Achievement", status: "Approved", priority: "Medium", date: "2026-06-28", department: "CSE", uploader: "hod_cse", approvalNo: "APV-2026-0004", timeline: [
        { stage: "Created", user: "hod_cse", timestamp: "2026-06-28 09:00", comment: "Award win logged." },
        { stage: "Approved", user: "admin", timestamp: "2026-06-29 11:00", comment: "Accreditation evidence validated." }
      ]}
    ];
    localStorage.setItem(WORKFLOW_LOGS_KEY, JSON.stringify(list));
  }
  return list;
}

async function saveWorkflowHistory(list) {
  localStorage.setItem(WORKFLOW_LOGS_KEY, JSON.stringify(list));
}

// ----------------- CENTRALIZED VIEW RENDERER -----------------

async function renderCentralizedWorkflowSystem(container) {
  const items = await getWorkflowHistory();
  const currentUser = window.getCurrentUser();

  // Sub tab navigation & selections
  if (typeof state.activeWorkflowSubTab === "undefined") state.activeWorkflowSubTab = "kanban";
  if (typeof state.wfSearchQuery === "undefined") state.wfSearchQuery = "";
  if (typeof state.wfFilterModule === "undefined") state.wfFilterModule = "";
  if (typeof state.selectedWfCardIds === "undefined") state.selectedWfCardIds = [];

  const drawMainLayout = () => {
    container.innerHTML = `
      <div class="top-nav" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; text-align:left;">
        <div class="page-header">
          <h1>Centralized Approvals Inbox</h1>
          <p>Kanban-style review pipelines, digital signature stamps, and audit history logs</p>
        </div>

        <div class="glass-card" style="padding:6px; border-radius:10px; display:flex; gap:6px;">
          <button class="btn btn-sm btn-xs tab-btn-sub-wf ${state.activeWorkflowSubTab === "dashboard" ? "btn-primary" : ""}" data-tab="dashboard">📊 KPI Dashboard</button>
          <button class="btn btn-sm btn-xs tab-btn-sub-wf ${state.activeWorkflowSubTab === "kanban" ? "btn-primary" : ""}" data-tab="kanban">📋 Kanban pipeline</button>
          <button class="btn btn-sm btn-xs tab-btn-sub-wf ${state.activeWorkflowSubTab === "inbox" ? "btn-primary" : ""}" data-tab="inbox">📥 My Task Inbox</button>
        </div>
      </div>

      <div id="workflow-tab-viewport"></div>
    `;

    container.querySelectorAll(".tab-btn-sub-wf").forEach(btn => {
      btn.addEventListener("click", (e) => {
        state.activeWorkflowSubTab = e.currentTarget.getAttribute("data-tab");
        state.selectedWfCardIds = []; // clear selection
        drawMainLayout();
      });
    });

    renderActiveTab(container.querySelector("#workflow-tab-viewport"));
  };

  const renderActiveTab = (viewport) => {
    const tab = state.activeWorkflowSubTab;

    if (tab === "dashboard") {
      const pending = items.filter(x => x.status === "Submitted" || x.status === "Under Review").length;
      const approved = items.filter(x => x.status === "Approved").length;
      const rejected = items.filter(x => x.status === "Rejected").length;
      const correction = items.filter(x => x.status === "Needs Correction").length;

      viewport.innerHTML = `
        <!-- KPI Cards Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:25px; text-align:left;">
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Pending Approvals</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0; color:var(--warning);">${pending} Reviews</h3>
            <span style="font-size:9px; color:var(--text-muted);">Assigned to HOD & Principal</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Approved records</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0; color:var(--success);">${approved} Locked</h3>
            <span style="font-size:9px; color:var(--success);">✓ 100% compliance rate</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Rejected items</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0; color:var(--danger);">${rejected} Items</h3>
            <span style="font-size:9px; color:var(--text-muted);">Returned back to faculty drafts</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Needs Correction</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0; color:var(--warning);">${correction} Items</h3>
            <span style="font-size:9px; color:var(--text-muted);">Pending modifications</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:20px; text-align:left;">
          <div class="glass-card" style="padding:22px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase;">Accreditation approval speed</h3>
            <div style="display:flex; justify-content:center; align-items:center; height:180px;">
              <svg viewBox="0 0 200 100" width="100%" height="100%">
                <path d="M10,90 Q50,40 100,50 T190,10" fill="none" stroke="var(--success)" stroke-width="4"/>
                <circle cx="190" cy="10" r="6" fill="var(--secondary)"/>
              </svg>
            </div>
            <span style="font-size:10px; color:var(--text-muted); display:block; text-align:center;">Average turn-around approval period: 2.1 Days</span>
          </div>

          <div class="glass-card" style="padding:22px; display:flex; flex-direction:column; gap:15px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; margin:0;">Active Review Channels</h3>
            <div style="font-size:11px; display:flex; flex-direction:column; gap:8px;">
              <div>📂 Report Compiler review pipeline: <strong>Active</strong></div>
              <div>💼 Careers & Placements verification: <strong>Active</strong></div>
              <div>📜 Accreditation SSR chapter audits: <strong>Active</strong></div>
            </div>
          </div>
        </div>
      `;
    }

    else if (tab === "kanban") {
      const columns = ["Draft", "Submitted", "Under Review", "Needs Correction", "Approved", "Rejected"];

      viewport.innerHTML = `
        <div class="glass-card" style="padding:15px; border-radius:12px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; text-align:left;">
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
            <input type="text" id="wf-search-input" class="form-control" value="${state.wfSearchQuery}" placeholder="Search ref name..." style="max-width:240px; font-size:11px; padding:6px 12px;">
            
            <select class="form-control" id="wf-filter-module" style="max-width:140px; font-size:11px; padding:6px;">
              <option value="">All Modules</option>
              <option value="Annual Report" ${state.wfFilterModule === "Annual Report" ? "selected" : ""}>Annual Report</option>
              <option value="Event" ${state.wfFilterModule === "Event" ? "selected" : ""}>Event</option>
              <option value="Placement" ${state.wfFilterModule === "Placement" ? "selected" : ""}>Placement</option>
            </select>
          </div>

          <!-- Bulk operations bar -->
          ${state.selectedWfCardIds.length > 0 ? `
            <div style="display:flex; gap:8px; align-items:center;">
              <span style="font-size:11px; color:var(--text-muted); margin-right:10px;">${state.selectedWfCardIds.length} Selected</span>
              <button class="btn btn-sm btn-xs btn-primary btn-bulk-wf-approve">Bulk Approve</button>
              <button class="btn btn-sm btn-xs btn-danger btn-bulk-wf-reject">Bulk Reject</button>
            </div>
          ` : ""}
        </div>

        <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:12px; align-items:start; text-align:left; overflow-x:auto;">
          ${columns.map(col => {
            const colItems = items.filter(x => {
              const matchesSearch = x.title.toLowerCase().includes(state.wfSearchQuery.toLowerCase());
              const matchesModule = state.wfFilterModule ? x.module === state.wfFilterModule : true;
              return x.status === col && matchesSearch && matchesModule;
            });
            return `
              <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:10px; padding:12px; min-height:380px; display:flex; flex-direction:column; gap:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:6px;">
                  <strong style="font-size:11px; color:var(--text-main); font-weight:700;">${col}</strong>
                  <span style="font-size:9px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:10px; font-weight:bold;">${colItems.length}</span>
                </div>

                <div style="display:flex; flex-direction:column; gap:10px; flex-grow:1;">
                  ${colItems.map(item => {
                    const isSelected = state.selectedWfCardIds.includes(item.id);
                    return `
                      <div class="glass-card sug-result-row" style="padding:10px; border-radius:8px; border:1px solid ${isSelected ? "var(--primary)" : "var(--border)"}; cursor:pointer; transition:transform 0.2s; position:relative;">
                        <input type="checkbox" class="wf-card-checkbox" data-wf-id="${item.id}" ${isSelected ? "checked" : ""} style="position:absolute; right:8px; top:8px; z-index:100;">
                        
                        <div class="btn-open-wf-modal" data-wf-id="${item.id}">
                          <span style="font-size:9px; background:var(--primary-glow); color:var(--primary); padding:2px 6px; border-radius:10px; font-weight:bold; text-transform:uppercase;">${item.module}</span>
                          <strong style="font-size:11px; color:var(--text-main); display:block; margin:6px 0 3px 0; padding-right:15px;">${item.title}</strong>
                          <div style="font-size:9px; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center;">
                            <span>Dept: ${item.department}</span>
                            <span style="color:${item.priority === "High" ? "#f87171" : ""};">${item.priority}</span>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <!-- WORKFLOW DETAIL OVERLAY MODAL -->
        <div id="wf-detail-modal-overlay" class="glass-card" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:11000; justify-content:center; align-items:center; padding:20px;">
          <div class="glass-card" style="width:90%; max-width:620px; height:80vh; padding:25px; box-shadow:var(--shadow); background:var(--bg); display:flex; flex-direction:column; gap:15px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px;">
              <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700;">Workflow Action Review</h3>
              <button class="btn btn-sm" id="wf-modal-close" style="padding:4px 8px;">✕</button>
            </div>
            
            <div style="flex-grow:1; overflow-y:auto;" id="wf-modal-body">
              <!-- Loaded dynamically -->
            </div>
          </div>
        </div>
      `;

      // Filter input hooks
      container.querySelector("#wf-search-input").addEventListener("input", (e) => {
        state.wfSearchQuery = e.target.value;
        renderActiveTab(viewport);
      });

      container.querySelector("#wf-filter-module").addEventListener("change", (e) => {
        state.wfFilterModule = e.target.value;
        renderActiveTab(viewport);
      });

      // Card click overlay
      container.querySelectorAll(".btn-open-wf-modal").forEach(card => {
        card.addEventListener("click", (e) => {
          const id = e.currentTarget.getAttribute("data-wf-id");
          openWorkflowModal(id);
        });
      });

      // Checkbox changes for Bulk Selection
      container.querySelectorAll(".wf-card-checkbox").forEach(chk => {
        chk.addEventListener("change", (e) => {
          e.stopPropagation();
          const id = chk.getAttribute("data-wf-id");
          if (chk.checked) {
            state.selectedWfCardIds.push(id);
          } else {
            state.selectedWfCardIds = state.selectedWfCardIds.filter(x => x !== id);
          }
          renderActiveTab(viewport);
        });
      });

      // Bulk actions
      const bulkApprove = container.querySelector(".btn-bulk-wf-approve");
      if (bulkApprove) {
        bulkApprove.onclick = async () => {
          let list = await getWorkflowHistory();
          state.selectedWfCardIds.forEach(id => {
            const target = list.find(x => x.id === id);
            if (target) {
              target.status = currentUser.role === "HOD" ? "Under Review" : "Approved";
            }
          });
          await saveWorkflowHistory(list);
          state.selectedWfCardIds = [];
          showToast("Selected items approved successfully!", "success");
          drawMainLayout();
        };
      }

      const bulkReject = container.querySelector(".btn-bulk-wf-reject");
      if (bulkReject) {
        bulkReject.onclick = async () => {
          let list = await getWorkflowHistory();
          state.selectedWfCardIds.forEach(id => {
            const target = list.find(x => x.id === id);
            if (target) target.status = "Rejected";
          });
          await saveWorkflowHistory(list);
          state.selectedWfCardIds = [];
          showToast("Selected items rejected.", "warning");
          drawMainLayout();
        };
      }
    }

    else if (tab === "inbox") {
      // Filter items pending role approval (HOD CSE sees CSE submitted, Principal sees CSE/ECE Under Review)
      const isHod = currentUser.role === "HOD";
      const isPrincipal = currentUser.role === "Principal";

      const inboxItems = items.filter(x => {
        if (isHod) return x.status === "Submitted" && x.department === currentUser.department?.toUpperCase();
        if (isPrincipal) return x.status === "Under Review";
        return false;
      });

      viewport.innerHTML = `
        <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; text-align:left;">Actionable Reviews</h3>
        
        <div style="display:flex; flex-direction:column; gap:10px; text-align:left;">
          ${inboxItems.length === 0 ? '<p style="font-size:11px; color:var(--text-muted);">No pending reviews assigned to your profile role inbox.</p>' : inboxItems.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 15px; border-radius:8px; background:rgba(255,255,255,0.01); border:1px solid var(--border); font-size:11px;">
              <div>
                <span style="font-size:9px; background:var(--primary-glow); color:var(--primary); padding:2px 6px; border-radius:10px; font-weight:bold; text-transform:uppercase;">${item.module}</span>
                <strong style="font-size:12px; display:block; color:var(--text-main); margin-top:5px;">${item.title}</strong>
                <span style="font-size:9px; color:var(--text-muted);">Submitted: ${item.date} &bull; Uploader: ${item.uploader}</span>
              </div>
              <button class="btn btn-sm btn-primary btn-open-wf-modal-inbox" data-wf-id="${item.id}">Review & Action</button>
            </div>
          `).join("")}
        </div>
      `;

      container.querySelectorAll(".btn-open-wf-modal-inbox").forEach(btn => {
        btn.onclick = (e) => {
          openWorkflowModal(e.currentTarget.getAttribute("data-wf-id"));
        };
      });
    }
  };

  const openWorkflowModal = (id) => {
    const item = items.find(x => x.id === id);
    if (!item) return;

    const overlay = document.getElementById("wf-detail-modal-overlay");
    const body = document.getElementById("wf-modal-body");
    overlay.style.display = "flex";

    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:15px; font-size:11px;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--border); padding-bottom:8px;">
          <div>
            <strong>Name:</strong> ${item.title}
            <span style="display:block; font-size:9px; color:var(--text-muted); margin-top:2px;">Module: ${item.module} &bull; Dept: ${item.department}</span>
          </div>
          <div>Status: <span style="font-weight:bold; color:var(--primary);">${item.status}</span></div>
        </div>

        <div>
          <strong>Document Details:</strong>
          <p style="margin:5px 0 5px 0; color:var(--text-muted);">Submitted by ${item.uploader} on ${item.date}. Verification reference number: <strong>${item.approvalNo || "N/A"}</strong></p>
        </div>

        <!-- Animated Timeline -->
        <div>
          <strong>Audit Timeline Pipeline:</strong>
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px; border-left:2px solid var(--border); padding-left:15px; position:relative;">
            ${(item.timeline || []).map(t => `
              <div style="position:relative; margin-bottom:5px;">
                <div style="position:absolute; left:-21px; top:2px; width:10px; height:10px; border-radius:50%; background:var(--primary);"></div>
                <strong style="color:var(--primary);">${t.stage}</strong>
                <span style="font-size:9px; color:var(--text-muted); margin-left:10px;">${t.timestamp} &bull; ${t.user}</span>
                <p style="margin:2px 0 0 0; color:var(--text-muted); font-style:italic;">"${t.comment}"</p>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Actions -->
        ${currentUser.role !== "Student / Public Viewer" ? `
          <div style="border-top:1px solid var(--border); padding-top:12px; display:flex; flex-direction:column; gap:10px;">
            <strong>Workflow Decision Panel:</strong>
            <div class="form-group">
              <label>Decision comment notes</label>
              <textarea id="wf-action-comments" class="form-control" rows="2" style="font-size:11px;" placeholder="Add verification feedback comment notes..."></textarea>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button class="btn btn-sm btn-danger btn-wf-action-trigger" data-action="Reject" style="flex:1;">Reject draft</button>
              <button class="btn btn-sm btn-wf-action-trigger" data-action="Needs Correction" style="flex:1; background:var(--warning-glow); color:var(--warning);">Correction request</button>
              <button class="btn btn-sm btn-primary btn-wf-action-trigger" data-action="Approve" style="flex:1;">Approve signing</button>
            </div>
          </div>
        ` : ""}
      </div>
    `;

    // Close btn
    document.getElementById("wf-modal-close").onclick = () => {
      overlay.style.display = "none";
    };

    // Action triggers
    body.querySelectorAll(".btn-wf-action-trigger").forEach(btn => {
      btn.onclick = async (e) => {
        const action = e.currentTarget.getAttribute("data-action");
        const comments = body.querySelector("#wf-action-comments").value.trim();
        
        let targetStatus = "Approved";
        if (action === "Reject") targetStatus = "Rejected";
        else if (action === "Needs Correction") targetStatus = "Needs Correction";
        else if (action === "Approve") {
          targetStatus = currentUser.role === "HOD" ? "Under Review" : "Approved";
        }

        const list = await getWorkflowHistory();
        const target = list.find(x => x.id === id);
        if (target) {
          target.status = targetStatus;
          if (!target.timeline) target.timeline = [];
          target.timeline.push({
            stage: targetStatus,
            user: currentUser.username,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            comment: comments || `Action performed: ${action}`
          });

          await saveWorkflowHistory(list);
          showToast(`Workflow status updated to ${targetStatus}!`, "success");
          overlay.style.display = "none";
          renderActiveTab(container.querySelector("#workflow-tab-viewport"));
        }
      };
    });
  };

  // Draw main
  drawMainLayout();
}
function getStatusBadgeHtml(status) {
  const colors = {
    "Draft": "#6c757d",
    "Submitted": "#0d6efd",
    "Under Review": "#fd7e14",
    "Approved": "#198754",
    "Rejected": "#dc3545",
    "Needs Correction": "#ffc107"
  };

  const color = colors[status] || "#6c757d";

  return `
    <span style="
      display:inline-block;
      padding:4px 10px;
      border-radius:999px;
      font-size:12px;
      font-weight:600;
      color:white;
      background:${color};
    ">
      ${status}
    </span>
  `;
}

function calculateReportProgress(depData) {
  if (!depData || !depData.metrics) return { percentage: 0 };
  const sections = ["publications", "grants", "placements", "events", "achievements", "patents", "consultancy", "alumni"];
  let completed = 0;
  sections.forEach(sec => {
    const data = depData.metrics[sec];
    if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
      completed++;
    }
  });
  let percentage = Math.round((completed / sections.length) * 100);
  if (depData.status === "Approved") percentage = 100;
  else if (depData.status === "Under Review") percentage = Math.max(percentage, 85);
  else if (depData.status === "Submitted") percentage = Math.max(percentage, 75);
  else percentage = Math.max(percentage, depData.progress || 10);
  return { percentage };
}

async function submitForReview(depId) {
  const deps = await window.getDepartments();
  const dep = deps.find(d => d.id === depId);
  if (dep) {
    dep.status = "Submitted";
    if (!dep.approvalHistory) dep.approvalHistory = [];
    dep.approvalHistory.push({
      step: "Submitted",
      user: window.getCurrentUser()?.username || "faculty",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      comment: "Submitted report for review."
    });
    await window.saveDepartment(dep);
  }
}

async function reviewByHOD(depId, username, comment, isRejected) {
  const deps = await window.getDepartments();
  const dep = deps.find(d => d.id === depId);
  if (dep) {
    const targetStatus = isRejected ? "Rejected" : "Under Review";
    dep.status = targetStatus;
    if (!dep.approvalHistory) dep.approvalHistory = [];
    dep.approvalHistory.push({
      step: targetStatus,
      user: username || "hod",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      comment: comment || (isRejected ? "Returned for corrections." : "Verified by HOD.")
    });
    await window.saveDepartment(dep);
    return true;
  }
  return false;
}

async function approveByPrincipal(depId, username, comment, signatureImg, isRejected) {
  const deps = await window.getDepartments();
  const dep = deps.find(d => d.id === depId);
  if (dep) {
    const targetStatus = isRejected ? "Rejected" : "Approved";
    dep.status = targetStatus;
    if (!dep.approvalHistory) dep.approvalHistory = [];
    dep.approvalHistory.push({
      step: targetStatus,
      user: username || "principal",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      comment: comment || (isRejected ? "Rejected by Principal." : "Approved by Principal.")
    });
    if (signatureImg) {
      if (!dep.signatures) dep.signatures = {};
      dep.signatures.principal = signatureImg;
    }
    await window.saveDepartment(dep);
    return true;
  }
  return false;
}

async function renderWorkflowTracker(container, depId) {
  const deps = await window.getDepartments();
  const dep = deps.find(d => d.id === depId);
  if (!dep) {
    container.innerHTML = `<p style="font-size:11px; color:var(--text-muted);">No workflow details found.</p>`;
    return;
  }
  const stages = ["Draft", "Submitted", "Under Review", "Approved"];
  const currentStageIdx = stages.indexOf(dep.status);
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; text-align:left;">
      <h4 style="font-family:var(--font-title); font-size:11px; font-weight:700; text-transform:uppercase; margin:0;">Approval Status Tracker</h4>
      <div style="display:flex; justify-content:space-between; align-items:center; position:relative; margin:10px 0;">
        <div style="position:absolute; top:50%; left:0; width:100%; height:2px; background:rgba(255,255,255,0.05); z-index:1; transform:translateY(-50%);"></div>
        ${stages.map((st, idx) => {
          const isActive = idx <= currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          const circleBg = isCurrent ? "var(--primary)" : (isActive ? "var(--success)" : "rgba(255,255,255,0.05)");
          return `
            <div style="display:flex; flex-direction:column; align-items:center; gap:6px; z-index:2; position:relative;">
              <div style="width:20px; height:20px; border-radius:50%; background:${circleBg}; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:bold; color:#fff; border:2px solid var(--border);">
                ${idx + 1}
              </div>
              <span style="font-size:8px; font-weight:${isCurrent ? "bold" : "normal"}; color:${isActive ? "var(--text-main)" : "var(--text-muted)"}">${st}</span>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

// Bind to window to share globally
window.renderCentralizedWorkflowSystem = renderCentralizedWorkflowSystem;
window.getStatusBadgeHtml = getStatusBadgeHtml;
window.calculateReportProgress = calculateReportProgress;
window.submitForReview = submitForReview;
window.reviewByHOD = reviewByHOD;
window.approveByPrincipal = approveByPrincipal;
window.renderWorkflowTracker = renderWorkflowTracker;
