/**
 * Enterprise Placement Management System Controller.
 * Sequentially structured to support CORS-free file:// execution.
 */

const PLACEMENTS_DB_KEY = "arm_placements_v5";

async function getPlacementsDb() {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(PLACEMENTS_DB_KEY)) || [];
  } catch(e){}

  if (list.length === 0) {
    list = [
      {
        id: "place_rec_1",
        studentName: "Abhishek Raman",
        regNumber: "311522104001",
        department: "cse",
        batch: "2022-26",
        cgpa: 8.92,
        email: "abhishek@apex.edu",
        phone: "+91 98765 33001",
        companyName: "Google India",
        industry: "IT / Tech",
        location: "Bangalore",
        website: "https://google.com",
        hrName: "Jane Doe",
        hrEmail: "jane.doe@google.com",
        hrPhone: "+91 90000 12345",
        companyCategory: "Super Dream",
        recruitmentType: "On Campus",
        jobRole: "Software Engineer",
        packageLpa: 22.5,
        ctc: 2250000,
        fixedPay: 1800000,
        variablePay: 450000,
        offerDate: "2026-04-10",
        joiningDate: "2026-07-01",
        offerStatus: "Approved",
        offerType: "Full Time",
        workMode: "Hybrid",
        multipleOffers: false,
        ppoEligibility: false,
        timeline: [
          { stage: "Draft", user: "placement_officer", timestamp: "04/10/2026" },
          { stage: "Approved", user: "admin", timestamp: "04/12/2026" }
        ]
      },
      {
        id: "place_rec_2",
        studentName: "Meera Krishnan",
        regNumber: "311522104042",
        department: "cse",
        batch: "2022-26",
        cgpa: 9.15,
        email: "meera@apex.edu",
        phone: "+91 98765 33042",
        companyName: "Intel India",
        industry: "Core / Hardware",
        location: "Hyderabad",
        website: "https://intel.com",
        hrName: "John Smith",
        hrEmail: "john.smith@intel.com",
        hrPhone: "+91 90000 54321",
        companyCategory: "Dream",
        recruitmentType: "Internship to PPO",
        jobRole: "Silicon Validation Engineer",
        packageLpa: 14.2,
        ctc: 1420000,
        fixedPay: 1200000,
        variablePay: 220000,
        offerDate: "2026-05-02",
        joiningDate: "2026-07-15",
        offerStatus: "Approved",
        offerType: "PPO",
        workMode: "Onsite",
        multipleOffers: true,
        ppoEligibility: true,
        timeline: [
          { stage: "Draft", user: "placement_officer", timestamp: "05/02/2026" },
          { stage: "Approved", user: "admin", timestamp: "05/03/2026" }
        ]
      }
    ];
    localStorage.setItem(PLACEMENTS_DB_KEY, JSON.stringify(list));
  }
  return list;
}

async function savePlacementsDb(list) {
  localStorage.setItem(PLACEMENTS_DB_KEY, JSON.stringify(list));
}

// ----------------- MAIN UI RENDERER -----------------

async function renderPlacementManagementSystem(container) {
  const records = await getPlacementsDb();
  const currentUser = window.getCurrentUser();

  // Navigation tabs
  if (typeof state.activePlacementSubTab === "undefined") state.activePlacementSubTab = "dashboard"; // "dashboard", "registry", "companies", "analytics"
  if (typeof state.placementSearchQuery === "undefined") state.placementSearchQuery = "";
  if (typeof state.placementFilterDept === "undefined") state.placementFilterDept = "";
  if (typeof state.placementWizardStep === "undefined") state.placementWizardStep = 1;

  // Selected company profile preview buffer
  let activeCompanyId = null;

  // Temp wizard buffer
  if (typeof state.tempWizardPlacement === "undefined") {
    state.tempWizardPlacement = {
      studentName: "", regNumber: "", department: "cse", batch: "2022-26", cgpa: 8.5, email: "", phone: "",
      companyName: "", industry: "IT / Tech", location: "Bangalore", website: "", hrName: "", hrEmail: "", hrPhone: "", companyCategory: "IT Company", recruitmentType: "On Campus",
      jobRole: "Software Engineer", packageLpa: 8.0, ctc: 800000, fixedPay: 700000, variablePay: 100000,
      offerDate: new Date().toISOString().split("T")[0], joiningDate: new Date().toISOString().split("T")[0],
      offerStatus: "Approved", offerType: "Full Time", workMode: "Onsite", multipleOffers: false, ppoEligibility: false
    };
  }

  const drawMainLayout = () => {
    container.innerHTML = `
      <div class="top-nav" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
        <div class="page-header">
          <h1>Placement Management Center</h1>
          <p>Track recruitment indices, company drives, CTC packages distributions, and student selections</p>
        </div>

        <div class="glass-card" style="padding:6px; border-radius:10px; display:flex; gap:6px;">
          <button class="btn btn-sm btn-xs tab-btn-sub ${state.activePlacementSubTab === "dashboard" ? "btn-primary" : ""}" data-tab="dashboard">📊 Dashboard</button>
          <button class="btn btn-sm btn-xs tab-btn-sub ${state.activePlacementSubTab === "registry" ? "btn-primary" : ""}" data-tab="registry">📋 Student Placements</button>
          <button class="btn btn-sm btn-xs tab-btn-sub ${state.activePlacementSubTab === "companies" ? "btn-primary" : ""}" data-tab="companies">🏢 Partner Companies</button>
          <button class="btn btn-sm btn-xs tab-btn-sub ${state.activePlacementSubTab === "analytics" ? "btn-primary" : ""}" data-tab="analytics">📈 Metrics Analytics</button>
        </div>
      </div>

      <div id="placement-tab-viewport"></div>
    `;

    container.querySelectorAll(".tab-btn-sub").forEach(btn => {
      btn.addEventListener("click", (e) => {
        state.activePlacementSubTab = e.currentTarget.getAttribute("data-tab");
        activeCompanyId = null;
        drawMainLayout();
      });
    });

    renderActiveTab(container.querySelector("#placement-tab-viewport"));
  };

  const renderActiveTab = (viewport) => {
    const tab = state.activePlacementSubTab;

    if (activeCompanyId) {
      renderCompanyProfile(viewport, activeCompanyId);
      return;
    }

    if (tab === "dashboard") {
      const totalPlaced = records.length;
      const companies = new Set(records.map(r => r.companyName)).size;
      const highest = Math.max(...records.map(r => r.packageLpa), 0);
      const average = (records.reduce((s,r) => s + r.packageLpa, 0) / (totalPlaced || 1)).toFixed(1);

      viewport.innerHTML = `
        <!-- KPI Cards Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:25px; text-align:left;">
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Companies Visited</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${companies} Corporate</h3>
            <span style="font-size:9px; color:var(--success);">📈 +4 partner tie-ups</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Students Placed</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${totalPlaced} Selections</h3>
            <span style="font-size:9px; color:var(--success);">88% Placement rate</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Highest Salary CTC</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${highest} LPA</h3>
            <span style="font-size:9px; color:var(--primary);">Super Dream Category</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Average CTC Package</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${average} LPA</h3>
            <span style="font-size:9px; color:var(--success);">+12% vs last year</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:20px; text-align:left;">
          <!-- Left placements share -->
          <div class="glass-card" style="padding:22px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase;">Recruitment type share</h3>
            
            <div style="display:flex; flex-direction:column; gap:12px; font-size:11px;">
              ${["On Campus", "Internship to PPO"].map(type => {
                const count = records.filter(r => r.recruitmentType === type).length;
                const pct = records.length ? Math.round((count / records.length) * 100) : 0;
                return `
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                      <span style="font-weight:bold; color:var(--primary);">${type}</span>
                      <span>${count} selections (${pct}%)</span>
                    </div>
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
                      <div style="width:${pct}%; height:100%; background:linear-gradient(to right, var(--primary), var(--secondary));"></div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Top placed students checklist -->
          <div class="glass-card" style="padding:22px; display:flex; flex-direction:column; gap:15px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; margin:0;">Super Dream Offers</h3>
            <div style="display:flex; flex-direction:column; gap:10px; max-height:220px; overflow-y:auto; font-size:11px;">
              ${records.map(r => `
                <div style="padding:10px; border-radius:6px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong>${r.studentName}</strong>
                    <span style="display:block; font-size:9px; color:var(--text-muted); margin-top:2px;">Company: ${r.companyName} &bull; ${r.jobRole}</span>
                  </div>
                  <strong style="color:var(--success);">${r.packageLpa} LPA</strong>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }

    else if (tab === "registry") {
      const sTerm = state.placementSearchQuery.toLowerCase();
      const displayRecs = records.filter(r => {
        const matchSearch = r.studentName.toLowerCase().includes(sTerm) || r.companyName.toLowerCase().includes(sTerm) || r.regNumber.includes(sTerm);
        const matchDept = state.placementFilterDept ? r.department === state.placementFilterDept : true;
        return matchSearch && matchDept;
      });

      viewport.innerHTML = `
        <div class="glass-card" style="padding:15px; border-radius:12px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; text-align:left;">
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
            <input type="text" class="form-control" id="place-reg-search" value="${state.placementSearchQuery}" placeholder="Search student, company..." style="max-width:240px; font-size:11px; padding:6px 12px;">
            
            <select class="form-control" id="place-filter-dept" style="max-width:140px; font-size:11px; padding:6px;">
              <option value="">All Departments</option>
              <option value="cse" ${state.placementFilterDept === "cse" ? "selected" : ""}>CSE</option>
              <option value="ece" ${state.placementFilterDept === "ece" ? "selected" : ""}>ECE</option>
              <option value="me" ${state.placementFilterDept === "me" ? "selected" : ""}>ME</option>
            </select>

            <button class="btn btn-sm" id="btn-export-place-csv">Export Excel</button>
          </div>

          ${currentUser.role !== "Student / Public Viewer" ? `
            <button class="btn btn-sm btn-primary" id="btn-open-place-wizard-modal">+ Log Placement</button>
          ` : ""}
        </div>

        <div class="glass-card" style="padding:15px; border-radius:12px; overflow-x:auto; text-align:left;">
          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border);">
                <th style="padding:10px;">Reg Number</th>
                <th style="padding:10px;">Student Name</th>
                <th style="padding:10px;">Department</th>
                <th style="padding:10px;">Company</th>
                <th style="padding:10px;">Role</th>
                <th style="padding:10px;">Package</th>
                <th style="padding:10px;">Joining Date</th>
                <th style="padding:10px; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${displayRecs.length === 0 ? `<tr><td colspan="8" style="padding:20px; text-align:center; color:var(--text-muted);">No placement records logged.</td></tr>` : displayRecs.map(r => `
                <tr style="border-bottom:1px dashed var(--border); transition:background 0.2s;" class="table-row-hover">
                  <td style="padding:10px; font-weight:bold;">${r.regNumber}</td>
                  <td style="padding:10px;">${r.studentName}</td>
                  <td style="padding:10px; text-transform:uppercase; color:var(--primary); font-weight:bold;">${r.department}</td>
                  <td style="padding:10px; font-weight:bold;">${r.companyName}</td>
                  <td style="padding:10px;">${r.jobRole}</td>
                  <td style="padding:10px; color:var(--success); font-weight:bold;">${r.packageLpa} LPA</td>
                  <td style="padding:10px; color:var(--text-muted);">${r.joiningDate}</td>
                  <td style="padding:10px; text-align:right;">
                    <button class="btn btn-sm btn-xs btn-preview-place-rec" data-rec-id="${r.id}">Offer Proof</button>
                    ${currentUser.role !== "Student / Public Viewer" ? `
                      <button class="btn btn-sm btn-xs btn-danger btn-delete-place-rec" data-rec-id="${r.id}">✕</button>
                    ` : ""}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- LOG PLACEMENT STEPPER WIZARD OVERLAY -->
        <div id="place-wizard-modal-overlay" class="glass-card" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:11000; justify-content:center; align-items:center; padding:20px;">
          <div class="glass-card" style="width:90%; max-width:620px; height:80vh; padding:25px; box-shadow:var(--shadow); background:var(--bg); display:flex; flex-direction:column; gap:15px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px;">
              <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700;">Add Placement Offer Stepper</h3>
              <button class="btn btn-sm" id="place-wizard-close" style="padding:4px 8px;">✕</button>
            </div>
            
            <!-- Indicators -->
            <div style="display:flex; justify-content:space-between; font-size:9px; color:var(--text-muted); margin-bottom:10px; border-bottom:1px dashed var(--border); padding-bottom:10px;">
              <span style="color:${state.placementWizardStep >= 1 ? "var(--primary)" : ""}; font-weight:bold;">1. Student Details</span>
              <span style="color:${state.placementWizardStep >= 2 ? "var(--primary)" : ""}; font-weight:bold;">2. Company Details</span>
              <span style="color:${state.placementWizardStep >= 3 ? "var(--primary)" : ""}; font-weight:bold;">3. Offer Details</span>
              <span style="color:${state.placementWizardStep >= 4 ? "var(--primary)" : ""}; font-weight:bold;">4. Preview & Submit</span>
            </div>

            <div style="flex-grow:1; overflow-y:auto;" id="place-wizard-body">
              <!-- Wizard fields -->
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:15px;">
              <button class="btn btn-sm" id="btn-place-wiz-prev" ${state.placementWizardStep === 1 ? "disabled" : ""}>Previous</button>
              <button class="btn btn-sm btn-primary" id="btn-place-wiz-next">${state.placementWizardStep === 4 ? "Publish Offer" : "Next"}</button>
            </div>
          </div>
        </div>
      `;

      // Directory search list
      container.querySelector("#place-reg-search").addEventListener("input", (e) => {
        state.placementSearchQuery = e.target.value;
        renderActiveTab(viewport);
      });

      container.querySelector("#place-filter-dept").addEventListener("change", (e) => {
        state.placementFilterDept = e.target.value;
        renderActiveTab(viewport);
      });

      // Wizard show
      container.querySelector("#btn-open-place-wizard-modal")?.addEventListener("click", () => {
        state.placementWizardStep = 1;
        document.getElementById("place-wizard-modal-overlay").style.display = "flex";
        drawWizardStep();
      });

      container.querySelector("#place-wizard-close")?.addEventListener("click", () => {
        document.getElementById("place-wizard-modal-overlay").style.display = "none";
      });

      // Export CSV
      container.querySelector("#btn-export-place-csv").addEventListener("click", () => {
        let csv = "RegNumber,Name,Department,Company,Role,PackageLPA,JoiningDate\n";
        displayRecs.forEach(r => {
          csv += `${r.regNumber},${r.studentName},${r.department},${r.companyName},${r.jobRole},${r.packageLpa},${r.joiningDate}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "students_placements_ledger.csv";
        a.click();
      });

      // Preview offer proof
      container.querySelectorAll(".btn-preview-place-rec").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.getAttribute("data-rec-id");
          const r = records.find(item => item.id === id);
          if (r) {
            const w = window.open();
            w.document.write(`
              <h2>PLACEMENT OFFER VERIFICATION PROOF</h2>
              <p><strong>Student Name:</strong> ${r.studentName} (${r.regNumber})</p>
              <p><strong>Company:</strong> ${r.companyName} &bull; <strong>Job Role:</strong> ${r.jobRole}</p>
              <p><strong>Package:</strong> ₹${r.ctc.toLocaleString()} CTC (${r.packageLpa} LPA)</p>
              <p><strong>Offer Date:</strong> ${r.offerDate}</p>
              <hr>
              <p><em>Simulated digitally verified letter. Verification ID: ${r.id}</em></p>
            `);
            w.document.close();
          }
        });
      });

      // Delete placement rec
      container.querySelectorAll(".btn-delete-place-rec").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.currentTarget.getAttribute("data-rec-id");
          let list = await getPlacementsDb();
          const target = list.find(x => x.id === id);
          if (target && confirm(`Permanently delete ${target.studentName} placement record at ${target.companyName}?`)) {
            list = list.filter(x => x.id !== id);
            await savePlacementsDb(list);
            showToast("Placement offer deleted.", "warning");
            navigateTo("students"); // Redraw Students tab (acting as combined place view)
          }
        });
      });

      // Wizard nav controls
      container.querySelector("#btn-place-wiz-prev")?.addEventListener("click", () => {
        if (state.placementWizardStep > 1) {
          saveActiveWizardValues();
          state.placementWizardStep--;
          drawWizardStep();
        }
      });

      container.querySelector("#btn-place-wiz-next")?.addEventListener("click", async () => {
        saveActiveWizardValues();
        if (state.placementWizardStep < 4) {
          state.placementWizardStep++;
          drawWizardStep();
        } else {
          // Publish Placement
          const list = await getPlacementsDb();
          state.tempWizardPlacement.id = "place_rec_" + Date.now();
          list.push(JSON.parse(JSON.stringify(state.tempWizardPlacement)));
          await savePlacementsDb(list);

          // Reset temp
          state.tempWizardPlacement = undefined;

          document.getElementById("place-wizard-modal-overlay").style.display = "none";
          showToast("Student Placement record added!", "success");
          navigateTo("students"); // Reload
        }
      });
    }

    else if (tab === "companies") {
      const companies = Array.from(new Set(records.map(r => r.companyName)));
      viewport.innerHTML = `
        <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; text-align:left;">Partner Companies Directory</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:15px; text-align:left;">
          ${companies.map(cName => {
            const cRecs = records.filter(r => r.companyName === cName);
            const highest = Math.max(...cRecs.map(r => r.packageLpa), 0);
            return `
              <div class="glass-card" style="padding:15px; border-radius:10px;">
                <h4 style="font-family:var(--font-title); font-weight:bold; font-size:13px; color:var(--primary); margin:0 0 5px 0;">${cName}</h4>
                <div style="font-size:11px; color:var(--text-muted);">
                  <div>Selections: <strong>${cRecs.length} Students</strong></div>
                  <div style="margin-top:2px;">Highest CTC: <strong>${highest} LPA</strong></div>
                </div>
                <button class="btn btn-sm btn-xs btn-view-company" data-company-name="${cName}" style="margin-top:10px; width:100%;">Company Profile</button>
              </div>
            `;
          }).join("")}
        </div>
      `;

      container.querySelectorAll(".btn-view-company").forEach(btn => {
        btn.addEventListener("click", (e) => {
          activeCompanyId = e.currentTarget.getAttribute("data-company-name");
          drawMainLayout();
        });
      });
    }

    else if (tab === "analytics") {
      viewport.innerHTML = `
        <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; text-align:left;">Placement Salary Analytics</h3>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; text-align:left;">
          <!-- SVG Placements Doughnut -->
          <div class="glass-card" style="padding:22px; text-align:center;">
            <h4 style="font-family:var(--font-title); font-weight:bold; font-size:12px; margin-bottom:15px;">Salary packages distribution</h4>
            <div style="display:flex; justify-content:center; align-items:center; height:180px;">
              <svg viewBox="0 0 100 100" width="140" height="140">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" stroke-width="12" stroke-dasharray="251" stroke-dashoffset="80" transform="rotate(-90 50 50)"/>
              </svg>
            </div>
            <span style="font-size:10px; color:var(--text-muted);">Blue arc represents packages > 10 LPA</span>
          </div>

          <!-- SVG Placements growth trend -->
          <div class="glass-card" style="padding:22px; text-align:center;">
            <h4 style="font-family:var(--font-title); font-weight:bold; font-size:12px; margin-bottom:15px;">Year-on-year Placement growth</h4>
            <div style="display:flex; justify-content:center; align-items:center; height:180px;">
              <svg viewBox="0 0 200 100" width="100%" height="100%">
                <path d="M10,90 Q50,40 100,50 T190,10" fill="none" stroke="var(--success)" stroke-width="4"/>
                <circle cx="190" cy="10" r="6" fill="var(--secondary)"/>
              </svg>
            </div>
            <span style="font-size:10px; color:var(--text-muted);">Annual reports aggregates</span>
          </div>
        </div>
      `;
    }
  };

  const renderCompanyProfile = (viewport, companyName) => {
    const cRecs = records.filter(r => r.companyName === companyName);
    const target = cRecs[0];

    viewport.innerHTML = `
      <div style="display:flex; gap:15px; margin-bottom:20px; align-items:center;">
        <button class="btn btn-sm" id="btn-comp-back">← Partner Companies</button>
        <h3 style="font-family:var(--font-title); font-size:16px; font-weight:700;">Company Recruiting Profile</h3>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 2.5fr; gap:20px; text-align:left;">
        <!-- Left details panel -->
        <div class="glass-card" style="padding:22px; height:fit-content; display:flex; flex-direction:column; gap:15px;">
          <div>
            <h3 style="font-family:var(--font-title); font-size:16px; font-weight:700; margin:0; color:var(--primary);">${companyName}</h3>
            <span style="font-size:10px; color:var(--text-muted);">${target.industry}</span>
          </div>

          <div style="border-top:1px solid var(--border); padding-top:15px; display:flex; flex-direction:column; gap:8px; font-size:11px;">
            <div>HQ Location: <strong>${target.location}</strong></div>
            <div>HR Contact: <strong>${target.hrName}</strong></div>
            <div>HR Email: <strong>${target.hrEmail}</strong></div>
            <div>HR Phone: <strong>${target.hrPhone}</strong></div>
            <div>Website: <a href="${target.website}" target="_blank" style="color:var(--primary);">${target.website}</a></div>
          </div>
        </div>

        <!-- Right selected students roster -->
        <div class="glass-card" style="padding:22px; display:flex; flex-direction:column; gap:15px;">
          <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; margin:0;">Recruited Students</h3>
          
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${cRecs.map(r => `
              <div style="padding:10px; border-radius:6px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; font-size:11px;">
                <div>
                  <strong>${r.studentName}</strong> (${r.regNumber})
                  <span style="display:block; font-size:9px; color:var(--text-muted); margin-top:2px;">Role: ${r.jobRole} &bull; Dept: ${r.department.toUpperCase()}</span>
                </div>
                <strong style="color:var(--success);">${r.packageLpa} LPA</strong>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    viewport.querySelector("#btn-comp-back").addEventListener("click", () => {
      activeCompanyId = null;
      renderActiveTab(viewport);
    });
  };

  const saveActiveWizardValues = () => {
    const body = document.getElementById("place-wizard-body");
    if (!body) return;
    const w = state.tempWizardPlacement;
    const step = state.placementWizardStep;

    if (step === 1) {
      const name = body.querySelector("#wiz-stud-name")?.value;
      if (name) w.studentName = name;
      const reg = body.querySelector("#wiz-stud-reg")?.value;
      if (reg) w.regNumber = reg;
    }
    
    else if (step === 2) {
      const cName = body.querySelector("#wiz-comp-name")?.value;
      if (cName) w.companyName = cName;
      const loc = body.querySelector("#wiz-comp-loc")?.value;
      if (loc) w.location = loc;
    }

    else if (step === 3) {
      const role = body.querySelector("#wiz-job-role")?.value;
      if (role) w.jobRole = role;
      const pkg = parseFloat(body.querySelector("#wiz-package")?.value) || 8.0;
      w.packageLpa = pkg;
      w.ctc = pkg * 100000;
    }
  };

  const drawWizardStep = () => {
    const body = document.getElementById("place-wizard-body");
    const step = state.placementWizardStep;
    const w = state.tempWizardPlacement;

    const prevBtn = document.getElementById("btn-place-wiz-prev");
    const nextBtn = document.getElementById("btn-place-wiz-next");
    if (prevBtn) prevBtn.disabled = step === 1;
    if (nextBtn) nextBtn.textContent = step === 4 ? "Publish Offer" : "Next";

    if (step === 1) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 1: Student Academic Profile</h4>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group">
            <label>Student Register Number</label>
            <input type="text" class="form-control" id="wiz-stud-reg" value="${w.regNumber}" placeholder="311522104001" required>
          </div>
          <div class="form-group">
            <label>Student Full Name</label>
            <input type="text" class="form-control" id="wiz-stud-name" value="${w.studentName}" placeholder="Abhishek Raman" required>
          </div>
        </div>
      `;
    }

    else if (step === 2) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 2: Recruiting Company Details</h4>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group">
            <label>Company Name</label>
            <input type="text" class="form-control" id="wiz-comp-name" value="${w.companyName}" placeholder="Google India" required>
          </div>
          <div class="form-group">
            <label>Job Location</label>
            <input type="text" class="form-control" id="wiz-comp-loc" value="${w.location}" placeholder="Bangalore" required>
          </div>
        </div>
      `;
    }

    else if (step === 3) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 3: Offer Package Details</h4>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group">
            <label>Job Role</label>
            <input type="text" class="form-control" id="wiz-job-role" value="${w.jobRole}" placeholder="Software Engineer" required>
          </div>
          <div class="form-group">
            <label>Salary package CTC (LPA)</label>
            <input type="number" step="0.1" class="form-control" id="wiz-package" value="${w.packageLpa}">
          </div>
        </div>
      `;
    }

    else if (step === 4) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 4: Preview & Submit</h4>
        <div style="font-size:11px; line-height:1.6; display:flex; flex-direction:column; gap:10px; background:rgba(255,255,255,0.01); border:1px solid var(--border); padding:15px; border-radius:8px;">
          <div><strong>Student Name:</strong> ${w.studentName} (${w.regNumber})</div>
          <div><strong>Recruiting Company:</strong> ${w.companyName} (${w.location})</div>
          <div><strong>Job Role:</strong> ${w.jobRole}</div>
          <div><strong>CTC Package LPA:</strong> ${w.packageLpa} LPA</div>
        </div>
      `;
    }
  };

  // Draw Main
  drawMainLayout();
}

// Bind to window to share globally
window.getPlacementsDb = getPlacementsDb;
window.savePlacementsDb = savePlacementsDb;
window.renderPlacementManagementSystem = renderPlacementManagementSystem;
