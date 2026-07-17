/**
 * Enterprise Accreditation Management System Controller.
 * Sequentially structured to support CORS-free file:// execution.
 */

const ACCREDITATION_DB_KEY = "arm_accreditation_v3";

async function getAccreditationDb() {
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(ACCREDITATION_DB_KEY));
  } catch(e){}

  if (!data) {
    data = {
      readinessPct: 82,
      lastScore: "3.72 (A++)",
      nextDate: "2027-11-20",
      criteriaList: [
        {
          id: "crit_1",
          num: 1,
          name: "Curricular Aspects",
          completionPct: 90,
          evidenceCount: 14,
          pendingItems: 1,
          status: "Under Review",
          subCriteria: [
            { id: "sub_1_1", name: "Curriculum Design & Planning", weightage: 100, dept: "IQAC", status: "Completed", deadline: "2026-07-25" },
            { id: "sub_1_2", name: "Academic Flexibility", weightage: 50, dept: "All Departments", status: "Pending Review", deadline: "2026-07-30" }
          ]
        },
        {
          id: "crit_2",
          num: 2,
          name: "Teaching-Learning and Evaluation",
          completionPct: 85,
          evidenceCount: 22,
          pendingItems: 3,
          status: "Active",
          subCriteria: [
            { id: "sub_2_1", name: "Student Enrollment & Profile", weightage: 150, dept: "Admin", status: "Completed", deadline: "2026-07-20" },
            { id: "sub_2_2", name: "Catering to Student Diversity", weightage: 50, dept: "All Departments", status: "Pending Review", deadline: "2026-07-28" }
          ]
        },
        {
          id: "crit_3",
          num: 3,
          name: "Research, Innovations and Extension",
          completionPct: 65,
          evidenceCount: 8,
          pendingItems: 6,
          status: "Needs Action",
          subCriteria: [
            { id: "sub_3_1", name: "Promotion of Research & Facilities", weightage: 120, dept: "Research", status: "In Progress", deadline: "2026-07-30" },
            { id: "sub_3_2", name: "Resource Mobilization for Research", weightage: 80, dept: "HOD CSE", status: "Missing Evidence", deadline: "2026-07-22" }
          ]
        },
        {
          id: "crit_4",
          num: 4,
          name: "Infrastructure and Learning Resources",
          completionPct: 95,
          evidenceCount: 18,
          pendingItems: 0,
          status: "Completed",
          subCriteria: [
            { id: "sub_4_1", name: "Physical Facilities", weightage: 100, dept: "Admin", status: "Completed", deadline: "2026-07-15" }
          ]
        },
        {
          id: "crit_5",
          num: 5,
          name: "Student Support and Progression",
          completionPct: 75,
          evidenceCount: 12,
          pendingItems: 2,
          status: "Active",
          subCriteria: [
            { id: "sub_5_1", name: "Student Mentoring & Support", weightage: 130, dept: "HOD ECE", status: "Completed", deadline: "2026-07-28" }
          ]
        },
        {
          id: "crit_6",
          num: 6,
          name: "Governance, Leadership and Management",
          completionPct: 80,
          evidenceCount: 16,
          pendingItems: 1,
          status: "Under Review",
          subCriteria: [
            { id: "sub_6_1", name: "Institutional Vision & Strategy", weightage: 100, dept: "Principal", status: "Completed", deadline: "2026-07-10" }
          ]
        },
        {
          id: "crit_7",
          num: 7,
          name: "Institutional Values and Best Practices",
          completionPct: 92,
          evidenceCount: 11,
          pendingItems: 0,
          status: "Completed",
          subCriteria: [
            { id: "sub_7_1", name: "Green Campus Initiatives", weightage: 100, dept: "IQAC", status: "Completed", deadline: "2026-07-12" }
          ]
        }
      ],
      ssrChapters: [
        { id: "ssr_1", title: "Executive Summary", status: "Completed", updatedBy: "admin", date: "06/20/2026" },
        { id: "ssr_2", title: "Profile of the Institution", status: "Completed", updatedBy: "admin", date: "06/25/2026" },
        { id: "ssr_3", title: "Evaluative Department Reports", status: "Under Review", updatedBy: "hod_cse", date: "07/02/2026" }
      ]
    };
    localStorage.setItem(ACCREDITATION_DB_KEY, JSON.stringify(data));
  }
  return data;
}

async function saveAccreditationDb(data) {
  localStorage.setItem(ACCREDITATION_DB_KEY, JSON.stringify(data));
}

// ----------------- MAIN UI RENDERER -----------------

async function renderAccreditationSystem(container) {
  const accDb = await getAccreditationDb();
  const currentUser = window.getCurrentUser();

  // Navigation states
  if (typeof state.activeAccSubTab === "undefined") state.activeAccSubTab = "dashboard"; // "dashboard", "criteria", "ssr", "gap"
  if (typeof state.activeCriterionIndex === "undefined") state.activeCriterionIndex = 0; // Criterion index for accordion focus
  if (typeof state.accSearchTerm === "undefined") state.accSearchTerm = "";

  const drawMainLayout = () => {
    container.innerHTML = `
      <div class="top-nav" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
        <div class="page-header">
          <h1>Accreditation Management System</h1>
          <p>Centralized repository for NAAC Self Study Reports, NBA compliance checklists, and IQAC evidence audits</p>
        </div>

        <div class="glass-card" style="padding:6px; border-radius:10px; display:flex; gap:6px;">
          <button class="btn btn-sm btn-xs tab-btn-sub ${state.activeAccSubTab === "dashboard" ? "btn-primary" : ""}" data-tab="dashboard">📊 Executive Dashboard</button>
          <button class="btn btn-sm btn-xs tab-btn-sub ${state.activeAccSubTab === "criteria" ? "btn-primary" : ""}" data-tab="criteria">📋 Accordion Criteria</button>
          <button class="btn btn-sm btn-xs tab-btn-sub ${state.activeAccSubTab === "ssr" ? "btn-primary" : ""}" data-tab="ssr">📜 SSR Chapters</button>
          <button class="btn btn-sm btn-xs tab-btn-sub ${state.activeAccSubTab === "gap" ? "btn-primary" : ""}" data-tab="gap">⚠️ Gap Audit</button>
        </div>
      </div>

      <div id="accreditation-tab-viewport"></div>
    `;

    container.querySelectorAll(".tab-btn-sub").forEach(btn => {
      btn.addEventListener("click", (e) => {
        state.activeAccSubTab = e.currentTarget.getAttribute("data-tab");
        drawMainLayout();
      });
    });

    renderActiveTab(container.querySelector("#accreditation-tab-viewport"));
  };

  const renderActiveTab = (viewport) => {
    const tab = state.activeAccSubTab;

    if (tab === "dashboard") {
      const overall = accDb.readinessPct;
      const statusText = overall > 80 ? "Excellent" : overall > 60 ? "Good" : "Needs Improvement";
      const totalEvidence = accDb.criteriaList.reduce((s,c) => s + c.evidenceCount, 0);
      const pendingItems = accDb.criteriaList.reduce((s,c) => s + c.pendingItems, 0);

      viewport.innerHTML = `
        <!-- KPI Cards Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:25px; text-align:left;">
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Readiness score</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0; color:var(--success);">${overall}% Ready</h3>
            <span style="font-size:9px; color:var(--success); font-weight:bold;">Status: ${statusText}</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Audit Evidence Files</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${totalEvidence} Documents</h3>
            <span style="font-size:9px; color:var(--text-muted);">PDF attachments verified</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Pending reviews</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0; color:var(--warning);">${pendingItems} Metrics</h3>
            <span style="font-size:9px; color:var(--warning);">HOD reviews required</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Last accreditation score</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0; color:var(--primary);">${accDb.lastScore}</h3>
            <span style="font-size:9px; color:var(--text-muted);">Target: Cycle 3 next year</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:20px; text-align:left;">
          <!-- Left Criteria Readiness progress bars -->
          <div class="glass-card" style="padding:22px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase;">Accreditation criteria progress</h3>
            
            <div style="display:flex; flex-direction:column; gap:12px; font-size:11px;">
              ${accDb.criteriaList.map(c => `
                <div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="font-weight:bold; color:var(--primary);">Criterion ${c.num}: ${c.name}</span>
                    <span>${c.completionPct}%</span>
                  </div>
                  <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
                    <div style="width:${c.completionPct}%; height:100%; background:linear-gradient(to right, var(--primary), var(--secondary));"></div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Right deadline alerts -->
          <div class="glass-card" style="padding:22px; display:flex; flex-direction:column; gap:15px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; margin:0;">Upcoming deadliness</h3>
            <div style="display:flex; flex-direction:column; gap:10px; max-height:220px; overflow-y:auto; font-size:11px;">
              <div style="padding:10px; border-radius:6px; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.15); color:#f87171;">
                <strong>Criterion 3: Promotion of Research</strong>
                <span style="display:block; font-size:9px; margin-top:2px;">Due: July 30, 2026 &bull; Assigned: HOD CSE</span>
              </div>
              <div style="padding:10px; border-radius:6px; background:rgba(255,255,255,0.01); border:1px solid var(--border);">
                <strong>Criterion 1: Curriculum Flexibility</strong>
                <span style="display:block; font-size:9px; color:var(--text-muted); margin-top:2px;">Due: July 25, 2026 &bull; Assigned: IQAC</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    else if (tab === "criteria") {
      viewport.innerHTML = `
        <div class="glass-card" style="padding:20px; border-radius:12px; margin-bottom:20px; text-align:left;">
          <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; margin-bottom:15px;">Accreditation criteria registry</h3>
          
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${accDb.criteriaList.map((c, idx) => `
              <div class="glass-card" style="padding:15px; border-radius:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" class="btn-toggle-crit-accordion" data-idx="${idx}">
                  <div>
                    <strong style="color:var(--primary); font-size:12px;">Criterion ${c.num}: ${c.name}</strong>
                    <span style="display:block; font-size:10px; color:var(--text-muted); margin-top:3px;">Completion: ${c.completionPct}% &bull; Evidence: ${c.evidenceCount} Files</span>
                  </div>
                  <span style="font-size:14px;">${state.activeCriterionIndex === idx ? "▼" : "▶"}</span>
                </div>

                ${state.activeCriterionIndex === idx ? `
                  <div style="margin-top:15px; border-top:1px dashed var(--border); padding-top:15px;">
                    <h4 style="font-size:11px; font-weight:bold; color:var(--primary); margin-bottom:10px;">SUB-CRITERIA & METRICS</h4>
                    <div style="display:flex; flex-direction:column; gap:10px; font-size:11px;">
                      ${c.subCriteria.map(sub => `
                        <div style="padding:10px; border-radius:6px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.01);">
                          <div>
                            <strong>${sub.name}</strong>
                            <span style="display:block; font-size:9px; color:var(--text-muted); margin-top:2px;">Assigned: ${sub.dept} &bull; Deadline: ${sub.deadline} &bull; Weightage: ${sub.weightage}</span>
                          </div>
                          <div style="text-align:right;">
                            <span style="background:var(--primary-glow); color:var(--primary); font-size:9px; padding:2px 6px; border-radius:10px; font-weight:bold; text-transform:uppercase;">${sub.status}</span>
                            ${currentUser.role !== "Student / Public Viewer" ? `
                              <button class="btn btn-sm btn-xs btn-primary btn-upload-crit-evidence" data-crit-id="${c.id}" data-sub-id="${sub.id}" style="display:block; margin-top:5px; font-size:9px; padding:2px 4px;">+ Add Evidence</button>
                            ` : ""}
                          </div>
                        </div>
                      `).join("")}
                    </div>
                  </div>
                ` : ""}
              </div>
            `).join("")}
          </div>
        </div>

        <input type="file" id="crit-evidence-hidden" style="display:none;">
      `;

      // Accordion toggle bindings
      container.querySelectorAll(".btn-toggle-crit-accordion").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const idx = parseInt(e.currentTarget.getAttribute("data-idx"));
          state.activeCriterionIndex = state.activeCriterionIndex === idx ? -1 : idx;
          drawMainLayout();
        });
      });

      // Upload evidence click handler
      container.querySelectorAll(".btn-upload-crit-evidence").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const critId = e.currentTarget.getAttribute("data-crit-id");
          const subId = e.currentTarget.getAttribute("data-sub-id");
          
          const uploader = container.querySelector("#crit-evidence-hidden");
          uploader.onchange = async (evt) => {
            const file = evt.target.files[0];
            if (file) {
              const targetCrit = accDb.criteriaList.find(c => c.id === critId);
              if (targetCrit) {
                targetCrit.evidenceCount++;
                const targetSub = targetCrit.subCriteria.find(s => s.id === subId);
                if (targetSub) {
                  targetSub.status = "Pending Review";
                }
                await saveAccreditationDb(accDb);
                showToast("Accreditation evidence document logged successfully!", "success");
                drawMainLayout();
              }
            }
          };
          uploader.click();
        });
      });
    }

    else if (tab === "ssr") {
      viewport.innerHTML = `
        <div class="glass-card" style="padding:22px; border-radius:12px; text-align:left;">
          <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; margin-bottom:15px;">NAAC Self Study Report Chapters</h3>
          
          <div style="display:flex; flex-direction:column; gap:10px; font-size:11px;">
            ${accDb.ssrChapters.map(ch => `
              <div style="padding:12px; border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.01);">
                <div>
                  <strong>${ch.title}</strong>
                  <span style="display:block; font-size:9px; color:var(--text-muted); margin-top:2px;">Last Modified: ${ch.date} &bull; Author: ${ch.updatedBy}</span>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                  <span style="background:var(--primary-glow); color:var(--primary); font-size:9px; padding:2px 6px; border-radius:10px; font-weight:bold; text-transform:uppercase;">${ch.status}</span>
                  <button class="btn btn-sm btn-xs" onclick="window.open('','','width=600,height=400').document.write('<h2>${ch.title} Preview</h2>')">Preview</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    else if (tab === "gap") {
      viewport.innerHTML = `
        <div class="glass-card" style="padding:22px; border-radius:12px; text-align:left;">
          <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; margin-bottom:15px; color:var(--warning);">Accreditation Gap Analysis</h3>
          
          <div style="display:flex; flex-direction:column; gap:12px; font-size:11px;">
            <div style="padding:12px; border-radius:8px; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.15); display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="color:#f87171;">MISSING: Resource Mobilization proofs (Crit 3)</strong>
                <span style="display:block; font-size:9px; color:#f87171; margin-top:2px;">Target weightage 80 points. No evidence spreadsheets uploaded yet.</span>
              </div>
              <span style="font-size:9px; font-weight:bold; background:#7f1d1d; color:#f87171; padding:2px 6px; border-radius:4px; text-transform:uppercase;">CRITICAL</span>
            </div>

            <div style="padding:12px; border-radius:8px; background:rgba(234,179,8,0.05); border:1px solid rgba(234,179,8,0.15); display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="color:#facc15;">EXPIRED: Environmental Audits Certificate (Crit 7)</strong>
                <span style="display:block; font-size:9px; color:#facc15; margin-top:2px;">Green Auditing document dated 2024. Needs update scan.</span>
              </div>
              <span style="font-size:9px; font-weight:bold; background:#713f12; color:#facc15; padding:2px 6px; border-radius:4px; text-transform:uppercase;">WARNING</span>
            </div>

            <div style="padding:12px; border-radius:8px; background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.15); display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="color:#34d399;">COMPLIANT: Physical Facility logs (Crit 4)</strong>
                <span style="display:block; font-size:9px; color:#34d399; margin-top:2px;">Classrooms and laboratories maps fully updated.</span>
              </div>
              <span style="font-size:9px; font-weight:bold; background:#064e3b; color:#34d399; padding:2px 6px; border-radius:4px; text-transform:uppercase;">OK</span>
            </div>
          </div>
        </div>
      `;
    }
  };

  // Draw initial layout
  drawMainLayout();
}

// Bind to window to share globally
window.getAccreditationDb = getAccreditationDb;
window.saveAccreditationDb = saveAccreditationDb;
window.renderAccreditationSystem = renderAccreditationSystem;
