/**
 * Enterprise Student Achievement Management System Controller.
 * Sequentially structured to support CORS-free file:// execution.
 */

const STUDENTS_DB_KEY = "arm_students_v5";

async function getStudentsDb() {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(STUDENTS_DB_KEY)) || [];
  } catch(e){}

  if (list.length === 0) {
    list = [
      {
        id: "stud_1",
        regNumber: "311522104001",
        name: "Abhishek Raman",
        department: "cse",
        batch: "2022-26",
        section: "A",
        cgpa: 8.92,
        email: "abhishek@apex.edu",
        phone: "+91 98765 33001",
        placementStatus: "Placed",
        achievements: [
          {
            id: "ach_1_1",
            title: "First Place in Smart India Hackathon",
            category: "Hackathon",
            description: "Developed offline mapping utilities for remote rescue teams.",
            date: "2026-03-10",
            academicYear: "2025-26",
            organizer: "AICTE India",
            level: "National",
            position: "1st Place",
            prizeAmount: 100000,
            outcome: "Direct incubator pitch invitation",
            remarks: "Highly appreciated by reviewers",
            status: "Approved"
          },
          {
            id: "ach_1_2",
            title: "Azure Cloud Solutions Architect Certification",
            category: "Certification",
            description: "Cleared AZ-305 exam with 92% score.",
            date: "2026-04-15",
            academicYear: "2025-26",
            organizer: "Microsoft",
            level: "International",
            position: "Certified",
            prizeAmount: 0,
            outcome: "Skills benchmark badge",
            remarks: "",
            status: "Approved"
          }
        ],
        internships: [
          { company: "Intel India", role: "Hardware Engineer Intern", duration: "6 Months", stipend: 35000, status: "Completed" }
        ],
        placements: [
          { company: "Google India", role: "Software Engineer", packageLpa: 22.5, status: "Accepted" }
        ],
        higherStudies: [],
        researchPapers: [],
        certifications: [
          { name: "Azure Solutions Architect", provider: "Microsoft", issueDate: "2026-04-15", expiryDate: "2028-04-15", credentialId: "MS-AZ-305", verificationLink: "https://learn.microsoft.com" }
        ]
      },
      {
        id: "stud_2",
        regNumber: "311522104042",
        name: "Meera Krishnan",
        department: "cse",
        batch: "2022-26",
        section: "B",
        cgpa: 9.15,
        email: "meera@apex.edu",
        phone: "+91 98765 33042",
        placementStatus: "Higher Studies",
        achievements: [
          {
            id: "ach_2_1",
            title: "Outstanding Research Paper Award at IEEE Symposium",
            category: "Research Paper",
            description: "Presented paper on quantum cryptography protocols.",
            date: "2026-05-02",
            academicYear: "2025-26",
            organizer: "IEEE Madras Section",
            level: "National",
            position: "Best Paper",
            prizeAmount: 15000,
            outcome: "Scopus index publication",
            remarks: "Recommended for journal print",
            status: "Approved"
          }
        ],
        internships: [],
        placements: [],
        higherStudies: [
          { university: "Carnegie Mellon University", country: "USA", program: "M.S. in Computer Science", admissionDate: "2026-08-20", scholarship: 15000 }
        ],
        researchPapers: [
          { title: "Quantum Cryptography Protocols", journal: "IEEE Transactions", scopus: true, sci: true, doi: "10.1109/TQE.2026.123", link: "https://ieeexplore.ieee.org" }
        ],
        certifications: []
      }
    ];
    localStorage.setItem(STUDENTS_DB_KEY, JSON.stringify(list));
  }
  return list;
}

async function saveStudentsDb(list) {
  localStorage.setItem(STUDENTS_DB_KEY, JSON.stringify(list));
}

// ----------------- MAIN VIEW RENDERER -----------------

async function renderStudentAchievementsSystem(container) {
  const students = await getStudentsDb();
  const currentUser = window.getCurrentUser();

  // Navigation states
  if (typeof state.activeStudentSubView === "undefined") state.activeStudentSubView = "dashboard"; // "dashboard", "directory", "leaderboard", "analytics"
  if (typeof state.studentSearchTerm === "undefined") state.studentSearchTerm = "";
  if (typeof state.studentFilterDept === "undefined") state.studentFilterDept = "";
  if (typeof state.studentWizardStep === "undefined") state.studentWizardStep = 1;
  if (typeof state.activeStudentProfileId === "undefined") state.activeStudentProfileId = null;

  // Selected student buffer for managing portfolios (Internships, Placements etc.)
  let editingStudentId = null;

  // Temp wizard creation buffer
  if (typeof state.tempWizardAchievement === "undefined") {
    state.tempWizardAchievement = {
      studentReg: "",
      title: "",
      category: "Hackathon",
      description: "",
      date: new Date().toISOString().split("T")[0],
      academicYear: "2025-26",
      organizer: "",
      level: "National",
      position: "1st Place",
      prizeAmount: 0,
      outcome: "",
      remarks: "",
      status: "Approved"
    };
  }

  const drawMainWorkspace = () => {
    container.innerHTML = `
      <div class="top-nav" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
        <div class="page-header">
          <h1>Student Achievements Portal</h1>
          <p>Monitor placement indexes, international certifications, hackathon awards, and research papers</p>
        </div>

        <div class="glass-card" style="padding:6px; border-radius:10px; display:flex; gap:6px;">
          <button class="btn btn-sm btn-xs sub-tab-btn ${state.activeStudentSubView === "dashboard" ? "btn-primary" : ""}" data-tab="dashboard">📊 KPI Dashboard</button>
          <button class="btn btn-sm btn-xs sub-tab-btn ${state.activeStudentSubView === "directory" ? "btn-primary" : ""}" data-tab="directory">📋 Student Directory</button>
          <button class="btn btn-sm btn-xs sub-tab-btn ${state.activeStudentSubView === "leaderboard" ? "btn-primary" : ""}" data-tab="leaderboard">🏆 Top Achievers</button>
          <button class="btn btn-sm btn-xs sub-tab-btn ${state.activeStudentSubView === "analytics" ? "btn-primary" : ""}" data-tab="analytics">📈 Charts Analysis</button>
        </div>
      </div>

      <div id="student-ach-viewport"></div>
    `;

    container.querySelectorAll(".sub-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        state.activeStudentSubView = e.currentTarget.getAttribute("data-tab");
        state.activeStudentProfileId = null; 
        drawMainWorkspace();
      });
    });

    renderActiveTab(container.querySelector("#student-ach-viewport"));
  };

  const renderActiveTab = (viewport) => {
    const tab = state.activeStudentSubView;

    if (state.activeStudentProfileId) {
      renderStudentProfile(viewport, state.activeStudentProfileId);
      return;
    }

    if (tab === "dashboard") {
      // Aggregate stats
      const totalStud = students.length;
      const totalAch = students.reduce((s,st) => s + st.achievements.length, 0);
      const placed = students.filter(st => st.placementStatus === "Placed").length;
      const internships = students.reduce((s,st) => s + st.internships.length, 0);
      const higher = students.filter(st => st.placementStatus === "Higher Studies").length;
      
      const hackathons = students.reduce((s,st) => s + st.achievements.filter(a => a.category === "Hackathon").length, 0);
      const certifications = students.reduce((s,st) => s + st.certifications.length, 0);
      const research = students.reduce((s,st) => s + st.researchPapers.length, 0);
      const sports = students.reduce((s,st) => s + st.achievements.filter(a => a.category === "Sports").length, 0);
      const cultural = students.reduce((s,st) => s + st.achievements.filter(a => a.category === "Cultural").length, 0);
      const startups = students.reduce((s,st) => s + st.achievements.filter(a => a.category === "Startup").length, 0);
      const awards = students.reduce((s,st) => s + st.achievements.filter(a => a.category === "Award").length, 0);

      viewport.innerHTML = `
        <!-- 12 KPI Cards Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:15px; margin-bottom:20px; text-align:left;">
          
          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Total Students</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${totalStud}</h3>
            <span style="font-size:8px; color:var(--success);">+14% Increase</span>
          </div>

          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Total Achievements</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${totalAch}</h3>
            <span style="font-size:8px; color:var(--success);">+24% Increase</span>
          </div>

          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Placement Offers</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${placed}</h3>
            <span style="font-size:8px; color:var(--primary);">Avg 9.8 LPA</span>
          </div>

          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Internships</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${internships}</h3>
            <span style="font-size:8px; color:var(--success);">+12% Increase</span>
          </div>

          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Higher Studies</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${higher}</h3>
            <span style="font-size:8px; color:var(--primary);">Global Admits</span>
          </div>

          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Hackathons</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${hackathons}</h3>
            <span style="font-size:8px; color:var(--success);">+30% Growth</span>
          </div>

          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Certifications</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${certifications}</h3>
            <span style="font-size:8px; color:var(--success);">Cloud & Core Tech</span>
          </div>

          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Research Papers</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${research}</h3>
            <span style="font-size:8px; color:var(--success);">Scopus Indexed</span>
          </div>

          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Sports Medals</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${sports}</h3>
            <span style="font-size:8px; color:var(--primary);">Zonal & National</span>
          </div>

          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Cultural Achievements</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${cultural}</h3>
            <span style="font-size:8px; color:var(--text-muted);">Symposium events</span>
          </div>

          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Startups Founded</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${startups}</h3>
            <span style="font-size:8px; color:var(--success);">Incubation ready</span>
          </div>

          <div class="glass-card" style="padding:15px; border-radius:10px;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Special Awards</div>
            <h3 style="font-family:var(--font-title); font-size:22px; font-weight:800; margin:5px 0;">${awards}</h3>
            <span style="font-size:8px; color:var(--primary);">Institutional merits</span>
          </div>

        </div>

        <!-- Secondary analytical breakdown row -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; text-align:left;">
          <div class="glass-card" style="padding:20px;">
            <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; margin-bottom:12px; text-transform:uppercase;">Accreditation Achievements share</h4>
            <div style="display:flex; flex-direction:column; gap:12px; font-size:11px;">
              <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span>CSE placements rate</span>
                  <strong>90% Placed</strong>
                </div>
                <div style="width:100%; height:5px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                  <div style="width:90%; height:100%; background:#10b981;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span>ECE certifications rate</span>
                  <strong>75% Certified</strong>
                </div>
                <div style="width:100%; height:5px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                  <div style="width:75%; height:100%; background:#3b82f6;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-card" style="padding:20px; display:flex; flex-direction:column; justify-content:flex-start; text-align:left;">
            <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; margin-bottom:12px; text-transform:uppercase;">Recruiters & Salaries</h4>
            <div style="font-size:18px; font-weight:bold; color:var(--primary); margin-bottom:5px;">342 Placements SECURED</div>
            <div style="font-size:10px; color:var(--text-muted); margin-bottom:10px;">Peak Package: <strong style="color:var(--success);">22.5 LPA (Google)</strong> &bull; Avg: <strong>6.8 LPA</strong></div>
            <div style="border-top:1px solid var(--border); padding-top:8px;">
              <span style="font-size:8px; color:var(--text-muted); font-weight:bold; display:block; text-transform:uppercase; margin-bottom:6px;">Top Partners:</span>
              <div style="display:flex; flex-wrap:wrap; gap:4px;">
                <span style="font-size:8px; background:rgba(255,255,255,0.03); border:1px solid var(--border); padding:2px 5px; border-radius:4px; font-weight:bold; color:var(--text-main);">Qualcomm</span>
                <span style="font-size:8px; background:rgba(255,255,255,0.03); border:1px solid var(--border); padding:2px 5px; border-radius:4px; font-weight:bold; color:var(--text-main);">Zoho</span>
                <span style="font-size:8px; background:rgba(255,255,255,0.03); border:1px solid var(--border); padding:2px 5px; border-radius:4px; font-weight:bold; color:var(--text-main);">TCS</span>
                <span style="font-size:8px; background:rgba(255,255,255,0.03); border:1px solid var(--border); padding:2px 5px; border-radius:4px; font-weight:bold; color:var(--text-main);">Cognizant</span>
                <span style="font-size:8px; background:rgba(255,255,255,0.03); border:1px solid var(--border); padding:2px 5px; border-radius:4px; font-weight:bold; color:var(--text-main);">Intel</span>
                <span style="font-size:8px; background:rgba(255,255,255,0.03); border:1px solid var(--border); padding:2px 5px; border-radius:4px; font-weight:bold; color:var(--text-main);">Goldman Sachs</span>
              </div>
            </div>
          </div>

          <div class="glass-card" style="padding:20px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
            <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; margin-bottom:8px; text-transform:uppercase;">Accreditation Ready</h4>
            <div style="font-size:20px; font-weight:bold; color:var(--success);">✓ A++ Rank Ready</div>
            <p style="font-size:9px; color:var(--text-muted); margin-top:5px; max-width:200px;">Student portfolio data compliance audits are updated successfully.</p>
          </div>
        </div>
      `;
    }

    else if (tab === "directory") {
      const sTerm = state.studentSearchTerm.toLowerCase();
      const displayStudents = students.filter(st => {
        const matchSearch = st.name.toLowerCase().includes(sTerm) || st.regNumber.includes(sTerm);
        const matchDept = state.studentFilterDept ? st.department === state.studentFilterDept : true;
        return matchSearch && matchDept;
      });

      viewport.innerHTML = `
        <div class="glass-card" style="padding:15px; border-radius:12px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; text-align:left;">
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
            <input type="text" class="form-control" id="stud-dir-search" value="${state.studentSearchTerm}" placeholder="Search register number, name..." style="max-width:240px; font-size:11px; padding:6px 12px;">
            
            <select class="form-control" id="stud-filter-dept" style="max-width:140px; font-size:11px; padding:6px;">
              <option value="">All Departments</option>
              <option value="cse" ${state.studentFilterDept === "cse" ? "selected" : ""}>CSE</option>
              <option value="ece" ${state.studentFilterDept === "ece" ? "selected" : ""}>ECE</option>
              <option value="me" ${state.studentFilterDept === "me" ? "selected" : ""}>ME</option>
            </select>

            <button class="btn btn-sm" id="btn-export-students-csv">Export Excel</button>
          </div>

          ${currentUser.role !== "Student / Public Viewer" ? `
            <button class="btn btn-sm btn-primary" id="btn-open-ach-wizard-modal">+ Log Achievement</button>
          ` : ""}
        </div>

        <div class="glass-card" style="padding:15px; border-radius:12px; overflow-x:auto; text-align:left;">
          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border);">
                <th style="padding:10px;">Reg Number</th>
                <th style="padding:10px;">Student Name</th>
                <th style="padding:10px;">Department</th>
                <th style="padding:10px;">Batch</th>
                <th style="padding:10px;">CGPA</th>
                <th style="padding:10px;">Placement status</th>
                <th style="padding:10px;">Achievements</th>
                <th style="padding:10px; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${displayStudents.length === 0 ? `<tr><td colspan="8" style="padding:20px; text-align:center; color:var(--text-muted);">No student records logged.</td></tr>` : displayStudents.map(st => `
                <tr style="border-bottom:1px dashed var(--border); transition:background 0.2s;" class="table-row-hover">
                  <td style="padding:10px; font-weight:bold;">${st.regNumber}</td>
                  <td style="padding:10px;">${st.name}</td>
                  <td style="padding:10px; text-transform:uppercase; color:var(--primary); font-weight:bold;">${st.department}</td>
                  <td style="padding:10px;">${st.batch}</td>
                  <td style="padding:10px;">${st.cgpa}</td>
                  <td style="padding:10px; color:var(--text-muted);">${st.placementStatus}</td>
                  <td style="padding:10px; font-weight:bold;">${st.achievements.length} logged</td>
                  <td style="padding:10px; text-align:right; display:flex; gap:6px; justify-content:flex-end;">
                    <button class="btn btn-sm btn-xs btn-view-profile" data-stud-id="${st.id}">View Profile</button>
                    ${currentUser.role !== "Student / Public Viewer" ? `
                      <button class="btn btn-sm btn-xs btn-primary btn-manage-portfolio" data-stud-id="${st.id}">Manage</button>
                    ` : ""}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- LOG ACHIEVEMENT STEPPER WIZARD OVERLAY -->
        <div id="ach-wizard-modal-overlay" class="glass-card" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:11000; justify-content:center; align-items:center; padding:20px;">
          <div class="glass-card" style="width:90%; max-width:620px; height:80vh; padding:25px; box-shadow:var(--shadow); background:var(--bg); display:flex; flex-direction:column; gap:15px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px;">
              <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700;">Log Student Achievement</h3>
              <button class="btn btn-sm" id="ach-wizard-close" style="padding:4px 8px;">✕</button>
            </div>
            
            <!-- Stepper indicators -->
            <div style="display:flex; justify-content:space-between; font-size:9px; color:var(--text-muted); margin-bottom:10px; border-bottom:1px dashed var(--border); padding-bottom:10px;">
              <span style="color:${state.studentWizardStep >= 1 ? "var(--primary)" : ""}; font-weight:bold;">1. Student Link</span>
              <span style="color:${state.studentWizardStep >= 2 ? "var(--primary)" : ""}; font-weight:bold;">2. Award Details</span>
              <span style="color:${state.studentWizardStep >= 3 ? "var(--primary)" : ""}; font-weight:bold;">3. Preview & Log</span>
            </div>

            <div style="flex-grow:1; overflow-y:auto;" id="ach-wizard-body">
              <!-- Wizard fields injected -->
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:15px;">
              <button class="btn btn-sm" id="btn-ach-wiz-prev" ${state.studentWizardStep === 1 ? "disabled" : ""}>Previous</button>
              <button class="btn btn-sm btn-primary" id="btn-ach-wiz-next">${state.studentWizardStep === 3 ? "Log Award" : "Next"}</button>
            </div>
          </div>
        </div>

        <!-- PORTFOLIO MANAGE MODAL OVERLAY -->
        <div id="portfolio-manage-modal-overlay" class="glass-card" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:11000; justify-content:center; align-items:center; padding:20px;">
          <div class="glass-card" style="width:90%; max-width:620px; height:80vh; padding:25px; box-shadow:var(--shadow); background:var(--bg); display:flex; flex-direction:column; gap:15px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px;">
              <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700;">Manage Portfolio Records</h3>
              <button class="btn btn-sm" id="port-modal-close" style="padding:4px 8px;">✕</button>
            </div>
            
            <div style="flex-grow:1; overflow-y:auto; display:flex; flex-direction:column; gap:15px;">
              <div style="display:flex; gap:10px;">
                <button class="btn btn-sm btn-xs port-tab-btn btn-primary" data-ptab="intern">Internships</button>
                <button class="btn btn-sm btn-xs port-tab-btn" data-ptab="place">Placements</button>
                <button class="btn btn-sm btn-xs port-tab-btn" data-ptab="cert">Certifications</button>
              </div>

              <div id="portfolio-tab-viewport" style="border:1px solid var(--border); padding:15px; border-radius:8px; min-height:260px;"></div>
            </div>
          </div>
        </div>
      `;

      // Directory search inputs
      container.querySelector("#stud-dir-search").addEventListener("input", (e) => {
        state.studentSearchTerm = e.target.value;
        renderActiveTab(viewport);
      });

      container.querySelector("#stud-filter-dept").addEventListener("change", (e) => {
        state.studentFilterDept = e.target.value;
        renderActiveTab(viewport);
      });

      // Wizard show
      container.querySelector("#btn-open-ach-wizard-modal")?.addEventListener("click", () => {
        state.studentWizardStep = 1;
        document.getElementById("ach-wizard-modal-overlay").style.display = "flex";
        drawWizardStep();
      });

      container.querySelector("#ach-wizard-close")?.addEventListener("click", () => {
        document.getElementById("ach-wizard-modal-overlay").style.display = "none";
      });

      // Export to CSV
      container.querySelector("#btn-export-students-csv").addEventListener("click", () => {
        let csv = "RegNumber,Name,Department,Batch,CGPA,PlacementStatus,Achievements\n";
        displayStudents.forEach(st => {
          csv += `${st.regNumber},${st.name},${st.department},${st.batch},${st.cgpa},${st.placementStatus},${st.achievements.length}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "students_achievements_directory.csv";
        a.click();
      });

      // View Profile click
      container.querySelectorAll(".btn-view-profile").forEach(btn => {
        btn.addEventListener("click", (e) => {
          state.activeStudentProfileId = e.currentTarget.getAttribute("data-stud-id");
          drawMainWorkspace();
        });
      });

      // Manage Portfolio click
      container.querySelectorAll(".btn-manage-portfolio").forEach(btn => {
        btn.addEventListener("click", (e) => {
          editingStudentId = e.currentTarget.getAttribute("data-stud-id");
          document.getElementById("portfolio-manage-modal-overlay").style.display = "flex";
          renderPortfolioTab("intern");
        });
      });

      container.querySelector("#port-modal-close").addEventListener("click", () => {
        document.getElementById("portfolio-manage-modal-overlay").style.display = "none";
        renderActiveTab(viewport);
      });

      const renderPortfolioTab = (tabName) => {
        const targetStud = students.find(st => st.id === editingStudentId);
        if (!targetStud) return;
        const subV = document.getElementById("portfolio-tab-viewport");

        // Set active style
        container.querySelectorAll(".port-tab-btn").forEach(b => {
          b.classList.toggle("btn-primary", b.getAttribute("data-ptab") === tabName);
        });

        if (tabName === "intern") {
          const list = targetStud.internships || [];
          subV.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <strong>Internships Log</strong>
              <button class="btn btn-sm btn-xs btn-primary" id="btn-add-intern-sub">+ Add</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${list.map((intern, idx) => `
                <div style="padding:8px; border:1px solid var(--border); border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                  <div>🏢 ${intern.company} &bull; ${intern.role} (${intern.duration})</div>
                  <button class="btn btn-sm btn-xs btn-danger btn-del-intern" data-idx="${idx}">✕</button>
                </div>
              `).join("")}
            </div>
          `;

          subV.querySelector("#btn-add-intern-sub").onclick = async () => {
            const comp = prompt("Enter Company Name:");
            const role = prompt("Enter Internship Role:");
            const dur = prompt("Enter Duration (e.g. 3 Months):");
            if (comp && role && dur) {
              if (!targetStud.internships) targetStud.internships = [];
              targetStud.internships.push({ company: comp, role, duration: dur, stipend: 0, status: "Active" });
              await saveStudentsDb(students);
              renderPortfolioTab("intern");
            }
          };

          subV.querySelectorAll(".btn-del-intern").forEach(b => {
            b.onclick = async (e) => {
              const idx = parseInt(e.currentTarget.getAttribute("data-idx"));
              targetStud.internships.splice(idx, 1);
              await saveStudentsDb(students);
              renderPortfolioTab("intern");
            };
          });
        }

        else if (tabName === "place") {
          const list = targetStud.placements || [];
          subV.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <strong>Placements Log</strong>
              <button class="btn btn-sm btn-xs btn-primary" id="btn-add-place-sub">+ Add</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${list.map((p, idx) => `
                <div style="padding:8px; border:1px solid var(--border); border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                  <div>💼 ${p.company} &bull; ${p.role} (${p.packageLpa} LPA)</div>
                  <button class="btn btn-sm btn-xs btn-danger btn-del-place" data-idx="${idx}">✕</button>
                </div>
              `).join("")}
            </div>
          `;

          subV.querySelector("#btn-add-place-sub").onclick = async () => {
            const comp = prompt("Enter Company Name:");
            const role = prompt("Enter Job Role:");
            const pkg = parseFloat(prompt("Enter Package LPA:", "6.5")) || 6.5;
            if (comp && role) {
              if (!targetStud.placements) targetStud.placements = [];
              targetStud.placements.push({ company: comp, role, packageLpa: pkg, status: "Accepted" });
              targetStud.placementStatus = "Placed";
              await saveStudentsDb(students);
              renderPortfolioTab("place");
            }
          };

          subV.querySelectorAll(".btn-del-place").forEach(b => {
            b.onclick = async (e) => {
              const idx = parseInt(e.currentTarget.getAttribute("data-idx"));
              targetStud.placements.splice(idx, 1);
              if (targetStud.placements.length === 0) targetStud.placementStatus = "Unplaced";
              await saveStudentsDb(students);
              renderPortfolioTab("place");
            };
          });
        }

        else if (tabName === "cert") {
          const list = targetStud.certifications || [];
          subV.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <strong>Certifications Log</strong>
              <button class="btn btn-sm btn-xs btn-primary" id="btn-add-cert-sub">+ Add</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${list.map((c, idx) => `
                <div style="padding:8px; border:1px solid var(--border); border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                  <div>📜 ${c.name} (${c.provider})</div>
                  <button class="btn btn-sm btn-xs btn-danger btn-del-cert" data-idx="${idx}">✕</button>
                </div>
              `).join("")}
            </div>
          `;

          subV.querySelector("#btn-add-cert-sub").onclick = async () => {
            const name = prompt("Enter Certificate Name:");
            const prov = prompt("Enter Provider (e.g. AWS, Coursera):");
            if (name && prov) {
              if (!targetStud.certifications) targetStud.certifications = [];
              targetStud.certifications.push({ name, provider: prov, issueDate: "", expiryDate: "", credentialId: "", verificationLink: "" });
              await saveStudentsDb(students);
              renderPortfolioTab("cert");
            }
          };

          subV.querySelectorAll(".btn-del-cert").forEach(b => {
            b.onclick = async (e) => {
              const idx = parseInt(e.currentTarget.getAttribute("data-idx"));
              targetStud.certifications.splice(idx, 1);
              await saveStudentsDb(students);
              renderPortfolioTab("cert");
            };
          });
        }
      };

      container.querySelectorAll(".port-tab-btn").forEach(btn => {
        btn.onclick = (e) => {
          renderPortfolioTab(e.currentTarget.getAttribute("data-ptab"));
        };
      });

      // Wizard Nav controls
      container.querySelector("#btn-ach-wiz-prev")?.addEventListener("click", () => {
        if (state.studentWizardStep > 1) {
          saveActiveWizardValues();
          state.studentWizardStep--;
          drawWizardStep();
        }
      });

      container.querySelector("#btn-ach-wiz-next")?.addEventListener("click", async () => {
        saveActiveWizardValues();
        if (state.studentWizardStep < 3) {
          state.studentWizardStep++;
          drawWizardStep();
        } else {
          // Log Achievement to Student
          const list = await getStudentsDb();
          const target = list.find(st => st.regNumber === state.tempWizardAchievement.studentReg);
          if (!target) {
            showToast("Error: Entered student register number not found.", "error");
            return;
          }

          state.tempWizardAchievement.id = "ach_" + Date.now();
          target.achievements.push(JSON.parse(JSON.stringify(state.tempWizardAchievement)));
          await saveStudentsDb(list);

          // Reset temp
          state.tempWizardAchievement = undefined;

          document.getElementById("ach-wizard-modal-overlay").style.display = "none";
          showToast("Achievement logged to student profile successfully!", "success");
          navigateTo("calendar"); // Reload tab
        }
      });
    }

    else if (tab === "leaderboard") {
      // Rank students based on achievements count
      const ranked = [...students].sort((a,b) => b.achievements.length - a.achievements.length);

      viewport.innerHTML = `
        <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; text-align:left;">Top Performers Leaderboard</h3>
        
        <div style="display:flex; flex-direction:column; gap:10px; text-align:left;">
          ${ranked.map((st, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 15px; border-radius:8px; background:rgba(255,255,255,0.01); border:1px solid var(--border); font-size:11px;">
              <div style="display:flex; align-items:center; gap:12px;">
                <strong style="color:var(--primary); font-size:14px;">#${idx + 1}</strong>
                <div>
                  <strong style="font-size:12px; display:block; color:var(--text-main);">${st.name}</strong>
                  <span style="font-size:9px; color:var(--text-muted);">${st.regNumber} &bull; Dept: ${st.department.toUpperCase()}</span>
                </div>
              </div>
              <div style="text-align:right;">
                <strong style="font-size:12px; color:var(--success);">${st.achievements.length} Achievements</strong>
                <span style="font-size:9px; color:var(--text-muted); display:block;">CGPA: ${st.cgpa}</span>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }

    else if (tab === "analytics") {
      viewport.innerHTML = `
        <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; text-align:left;">Interactive Metrics Analytics</h3>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; text-align:left;">
          <!-- SVG Placements Doughnut -->
          <div class="glass-card" style="padding:22px; text-align:center;">
            <h4 style="font-family:var(--font-title); font-weight:bold; font-size:12px; margin-bottom:15px;">Placement Statistics share</h4>
            <div style="display:flex; justify-content:center; align-items:center; height:180px;">
              <svg viewBox="0 0 100 100" width="140" height="140">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--success)" stroke-width="12" stroke-dasharray="251" stroke-dashoffset="60" transform="rotate(-90 50 50)"/>
              </svg>
            </div>
            <span style="font-size:10px; color:var(--text-muted);">Green arc represents accepted job offers</span>
          </div>

          <!-- SVG Placements growth trend -->
          <div class="glass-card" style="padding:22px; text-align:center;">
            <h4 style="font-family:var(--font-title); font-weight:bold; font-size:12px; margin-bottom:15px;">Internship growth trends</h4>
            <div style="display:flex; justify-content:center; align-items:center; height:180px;">
              <svg viewBox="0 0 200 100" width="100%" height="100%">
                <path d="M10,90 Q40,50 80,60 T140,20 T190,10" fill="none" stroke="var(--primary)" stroke-width="4"/>
                <circle cx="190" cy="10" r="6" fill="var(--secondary)"/>
              </svg>
            </div>
            <span style="font-size:10px; color:var(--text-muted);">Quarterly internships records</span>
          </div>
        </div>
      `;
    }
  };

  const renderStudentProfile = (viewport, id) => {
    const st = students.find(x => x.id === id);
    if (!st) return;

    viewport.innerHTML = `
      <div style="display:flex; gap:15px; margin-bottom:20px; align-items:center;">
        <button class="btn btn-sm" id="btn-profile-back">← Directory</button>
        <h3 style="font-family:var(--font-title); font-size:16px; font-weight:700;">Student Academic Profile</h3>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 2.5fr; gap:20px; text-align:left;">
        <!-- Left details panel -->
        <div class="glass-card" style="padding:22px; height:fit-content; display:flex; flex-direction:column; gap:15px;">
          <div style="text-align:center;">
            <div style="width:70px; height:70px; border-radius:50%; background:var(--primary-glow); color:var(--primary); font-size:24px; font-weight:bold; display:flex; align-items:center; justify-content:center; margin:0 auto 10px;">
              ${st.name.charAt(0)}
            </div>
            <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700; margin:0;">${st.name}</h3>
            <span style="font-size:10px; color:var(--text-muted);">${st.regNumber}</span>
          </div>

          <div style="border-top:1px solid var(--border); padding-top:15px; display:flex; flex-direction:column; gap:8px; font-size:11px;">
            <div>Department: <strong style="text-transform:uppercase; color:var(--primary);">${st.department}</strong></div>
            <div>Academic Batch: <strong>${st.batch}</strong></div>
            <div>Cumulative CGPA: <strong style="color:var(--success);">${st.cgpa}</strong></div>
            <div>Placement: <strong>${st.placementStatus}</strong></div>
          </div>
        </div>

        <!-- Right lists and portfolios tabs -->
        <div class="glass-card" style="padding:22px; display:flex; flex-direction:column; gap:20px;">
          <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; margin:0;">Portfolio Milestones</h3>
          
          <!-- Achievements List -->
          <div>
            <h4 style="font-family:var(--font-title); font-weight:bold; color:var(--primary); font-size:12px; margin-bottom:10px;">AWARDS & ACHIEVEMENTS</h4>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${st.achievements.length === 0 ? '<p style="font-size:11px; color:var(--text-muted);">No awards logged.</p>' : st.achievements.map(a => `
                <div style="padding:10px; border-radius:6px; border:1px solid var(--border); background:rgba(255,255,255,0.01); font-size:11px;">
                  <div style="display:flex; justify-content:space-between; font-weight:bold;">
                    <span>${a.title}</span>
                    <span style="color:var(--success); font-size:9px;">${a.position}</span>
                  </div>
                  <p style="margin:5px 0 0; color:var(--text-muted); font-size:10px;">${a.description}</p>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Placements & Internships -->
          <div style="border-top:1px solid var(--border); padding-top:15px;">
            <h4 style="font-family:var(--font-title); font-weight:bold; color:var(--primary); font-size:12px; margin-bottom:10px;">INTERNSHIPS & PLACEMENTS</h4>
            <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
              ${st.placements.map(p => `
                <div>🏢 Placed at <strong>${p.company}</strong> as <strong>${p.role}</strong> with package <strong>${p.packageLpa} LPA</strong></div>
              `).join("")}
              ${st.internships.map(i => `
                <div>💼 Interned at <strong>${i.company}</strong> as <strong>${i.role}</strong> (${i.duration})</div>
              `).join("")}
              ${st.placements.length === 0 && st.internships.length === 0 ? '<p style="color:var(--text-muted); font-size:11px;">No records logged.</p>' : ""}
            </div>
          </div>
        </div>
      </div>
    `;

    viewport.querySelector("#btn-profile-back").addEventListener("click", () => {
      state.activeStudentProfileId = null;
      renderActiveTab(viewport);
    });
  };

  const saveActiveWizardValues = () => {
    const body = document.getElementById("ach-wizard-body");
    if (!body) return;
    const w = state.tempWizardAchievement;
    const step = state.studentWizardStep;

    if (step === 1) {
      const reg = body.querySelector("#wiz-ach-reg")?.value;
      if (reg) w.studentReg = reg;
    }
    
    else if (step === 2) {
      const title = body.querySelector("#wiz-ach-title")?.value;
      if (title) w.title = title;
      const cat = body.querySelector("#wiz-ach-cat")?.value;
      if (cat) w.category = cat;
      const desc = body.querySelector("#wiz-ach-desc")?.value;
      if (desc) w.description = desc;
    }
  };

  const drawWizardStep = () => {
    const body = document.getElementById("ach-wizard-body");
    const step = state.studentWizardStep;
    const w = state.tempWizardAchievement;

    const prevBtn = document.getElementById("btn-ach-wiz-prev");
    const nextBtn = document.getElementById("btn-ach-wiz-next");
    if (prevBtn) prevBtn.disabled = step === 1;
    if (nextBtn) nextBtn.textContent = step === 3 ? "Log Award" : "Next";

    if (step === 1) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 1: Link Student Profile</h4>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group">
            <label>Student Register Number</label>
            <input type="text" class="form-control" id="wiz-ach-reg" value="${w.studentReg}" placeholder="311522104001" required>
          </div>
          <span style="font-size:10px; color:var(--text-muted);">Enter the target register number from directory catalog to link this award.</span>
        </div>
      `;
    }

    else if (step === 2) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 2: Award details</h4>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group">
            <label>Award / Achievement Title</label>
            <input type="text" class="form-control" id="wiz-ach-title" value="${w.title}" placeholder="Smart India Hackathon 2026 Winner" required>
          </div>
          <div class="form-group">
            <label>Category Classification</label>
            <select class="form-control" id="wiz-ach-cat" style="padding:6px;">
              <option value="Hackathon" ${w.category === "Hackathon" ? "selected" : ""}>Hackathon</option>
              <option value="Certification" ${w.category === "Certification" ? "selected" : ""}>Certification</option>
              <option value="Research Paper" ${w.category === "Research Paper" ? "selected" : ""}>Research Paper</option>
              <option value="Placement" ${w.category === "Placement" ? "selected" : ""}>Placement</option>
              <option value="Sports" ${w.category === "Sports" ? "selected" : ""}>Sports</option>
            </select>
          </div>
          <div class="form-group">
            <label>Brief Description</label>
            <textarea class="form-control" id="wiz-ach-desc" rows="3" style="font-size:11px;">${w.description}</textarea>
          </div>
        </div>
      `;
    }

    else if (step === 3) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 3: Preview & Log</h4>
        <div style="font-size:11px; line-height:1.6; display:flex; flex-direction:column; gap:10px; background:rgba(255,255,255,0.01); border:1px solid var(--border); padding:15px; border-radius:8px;">
          <div><strong>Student Reg Number:</strong> ${w.studentReg || "[Not Linked]"}</div>
          <div><strong>Award Name:</strong> ${w.title || "[Not Entered]"}</div>
          <div><strong>Category Tag:</strong> ${w.category}</div>
        </div>
      `;
    }
  };

  // Draw Main
  drawMainWorkspace();
}

// Bind to window to share globally
window.getStudentsDb = getStudentsDb;
window.saveStudentsDb = saveStudentsDb;
window.renderStudentAchievementsSystem = renderStudentAchievementsSystem;
