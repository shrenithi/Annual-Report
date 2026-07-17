/**
 * Department Portal & Operations Management module.
 * Sequentially structured to support CORS-free file:// execution.
 */

async function renderDepartmentsManagement(container) {
  const deps = await window.getDepartments();
  const currentUser = window.getCurrentUser();
  const isAdmin = currentUser.role === "Super Admin";
  const isHOD = currentUser.role === "HOD";

  if (typeof state.deptViewMode === "undefined") state.deptViewMode = "cards"; // "cards" or "table"
  if (typeof state.deptSearchTerm === "undefined") state.deptSearchTerm = "";

  const drawDepts = () => {
    const sTerm = state.deptSearchTerm.toLowerCase();
    const filtered = deps.filter(d => 
      d.name.toLowerCase().includes(sTerm) || 
      d.id.toLowerCase().includes(sTerm) || 
      d.head.toLowerCase().includes(sTerm)
    );

    let viewHtml = "";

    if (state.deptViewMode === "cards") {
      viewHtml = `
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(290px, 1fr)); gap:20px;">
          ${filtered.map(d => {
            const progress = window.calculateReportProgress(d).percentage;
            const isEditAllowed = window.canEditReport(currentUser, d.id, d.status);
            return `
              <div class="glass-card dept-card animate-fade-in" style="padding:22px; border-radius:12px; display:flex; flex-direction:column; gap:12px; text-align:left; position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <span style="font-size:10px; font-weight:700; color:var(--primary); text-transform:uppercase; font-family:var(--font-title);">${d.id} Portal</span>
                  ${window.getStatusBadgeHtml(d.status)}
                </div>

                <h3 style="font-family:var(--font-title); font-size:16px; font-weight:700; color:var(--text-main); margin:0;">${d.name}</h3>
                <p style="font-size:11px; color:var(--text-muted); margin:0;">HOD / Head: <strong>${d.head}</strong></p>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:10px; color:var(--text-muted); background:rgba(255,255,255,0.01); padding:8px; border-radius:6px; border:1px solid var(--border);">
                  <div>Faculty: <strong style="color:var(--text-main);">${d.facultyCount}</strong></div>
                  <div>Students: <strong style="color:var(--text-main);">${d.studentCount}</strong></div>
                  <div>Publications: <strong style="color:var(--text-main);">${d.metrics?.publications?.length || 0}</strong></div>
                  <div>Placements: <strong style="color:var(--text-main);">${d.metrics?.placements?.length || 0}</strong></div>
                </div>

                <div>
                  <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-bottom:4px;">
                    <span>Report completion progress</span>
                    <strong style="color:var(--primary);">${progress}%</strong>
                  </div>
                  <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                    <div style="width:${progress}%; height:100%; background:linear-gradient(to right, var(--primary), var(--secondary));"></div>
                  </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:12px; margin-top:5px;">
                  <button class="btn btn-sm btn-xs btn-view-dept-details" data-dept-id="${d.id}">View Details</button>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-sm btn-xs ${isEditAllowed ? "btn-primary" : ""}" onclick="navigateTo('editor', { id: '${d.id}' })">
                      ${isEditAllowed ? "Edit Data" : "View Forms"}
                    </button>
                    ${isAdmin ? `<button class="btn btn-sm btn-xs btn-danger btn-delete-dept" data-dept-id="${d.id}" style="padding:2px 6px;">✕</button>` : ""}
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    } 
    // Table View
    else {
      viewHtml = `
        <div style="overflow-x:auto; background:var(--card-bg); border-radius:12px; border:1px solid var(--border);">
          <table style="width:100%; border-collapse:collapse; text-align:left; font-size:11px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border); background:rgba(255,255,255,0.01);">
                <th style="padding:12px;">ID</th>
                <th style="padding:12px;">Department Name</th>
                <th style="padding:12px;">Head / HOD</th>
                <th style="padding:12px;">Faculty Count</th>
                <th style="padding:12px;">Student Count</th>
                <th style="padding:12px;">Status</th>
                <th style="padding:12px; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `<tr><td colspan="7" style="padding:20px; text-align:center; color:var(--text-muted);">No departments logged.</td></tr>` : filtered.map(d => `
                <tr style="border-bottom:1px solid var(--border); transition:background 0.2s;" class="table-row-hover">
                  <td style="padding:12px; text-transform:uppercase; font-weight:bold;">${d.id}</td>
                  <td style="padding:12px; font-weight:600;">${d.name}</td>
                  <td style="padding:12px;">${d.head}</td>
                  <td style="padding:12px;">${d.facultyCount}</td>
                  <td style="padding:12px;">${d.studentCount}</td>
                  <td style="padding:12px;">${window.getStatusBadgeHtml(d.status)}</td>
                  <td style="padding:12px; text-align:right; display:flex; gap:6px; justify-content:flex-end;">
                    <button class="btn btn-sm btn-xs btn-view-dept-details" data-dept-id="${d.id}" style="padding:2px 6px;">Details</button>
                    <button class="btn btn-sm btn-xs" style="padding:2px 6px;" onclick="navigateTo('editor', { id: '${d.id}' })">Forms</button>
                    ${isAdmin ? `<button class="btn btn-sm btn-xs btn-danger btn-delete-dept" data-dept-id="${d.id}" style="padding:2px 6px;">Delete</button>` : ""}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    container.querySelector("#depts-list-area").innerHTML = viewHtml;

    // Bind preview buttons
    container.querySelectorAll(".btn-view-dept-details").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-dept-id");
        showDepartmentDetails(id);
      });
    });

    // Bind delete buttons
    container.querySelectorAll(".btn-delete-dept").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-dept-id");
        if (confirm(`WARNING: This will permanently delete the ${id.toUpperCase()} department records! Continue?`)) {
          const list = await window.getDepartments();
          const filteredList = list.filter(item => item.id !== id);
          localStorage.setItem("annual_report_portal_departments", JSON.stringify(filteredList));
          showToast(`Department ${id.toUpperCase()} deleted.`, "warning");
          navigateTo("departments");
        }
      });
    });
  };

  // Render Frame
  container.innerHTML = `
    <div class="top-nav" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
      <div class="page-header">
        <h1>Department Management Portals</h1>
        <p>Audit educational milestones, accreditation status, and research logs</p>
      </div>

      ${isAdmin ? `
        <button class="btn btn-primary" id="btn-create-dept">+ Create Department</button>
      ` : ""}
    </div>

    <!-- Filters row -->
    <div class="glass-card" style="padding:15px; border-radius:12px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
      <input type="text" class="form-control" id="dept-search-input" placeholder="Search by name, ID, or head..." style="max-width:260px; font-size:11px; padding:6px 12px;">
      
      <div style="display:flex; gap:8px;">
        <button class="btn btn-sm ${state.deptViewMode === "cards" ? "btn-primary" : ""}" id="btn-toggle-dept-cards" style="padding:4px 8px;">🎴 Cards</button>
        <button class="btn btn-sm ${state.deptViewMode === "table" ? "btn-primary" : ""}" id="btn-toggle-dept-table" style="padding:4px 8px;">📋 Table</button>
      </div>
    </div>

    <!-- Depts List area -->
    <div id="depts-list-area"></div>

    <!-- CREATE DEPARTMENT MODAL -->
    <div id="dept-create-modal-overlay" class="glass-card" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:10000; justify-content:center; align-items:center; padding:20px;">
      <div class="glass-card" style="width:100%; max-width:480px; padding:25px; box-shadow:var(--shadow); background:var(--bg);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px;">
          <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700;">Create Department Portal</h3>
          <button class="btn btn-sm" id="dept-create-close" style="padding:4px 8px;">✕</button>
        </div>
        <form id="dept-create-form" style="display:flex; flex-direction:column; gap:12px; text-align:left; font-size:11px;">
          <div class="form-group">
            <label>Department Code (Unique ID)</label>
            <input type="text" class="form-control" id="cre-dept-id" required placeholder="e.g. civil">
          </div>
          <div class="form-group">
            <label>Department Name</label>
            <input type="text" class="form-control" id="cre-dept-name" required placeholder="e.g. Civil Engineering">
          </div>
          <div class="form-group">
            <label>Head of Department (HOD)</label>
            <input type="text" class="form-control" id="cre-dept-head" required placeholder="e.g. Dr. Frank Miller">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Faculty Members count</label>
              <input type="number" class="form-control" id="cre-dept-faculty" required value="12">
            </div>
            <div class="form-group">
              <label>Student Strength count</label>
              <input type="number" class="form-control" id="cre-dept-students" required value="240">
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="justify-content:center; padding:10px; font-weight:bold; margin-top:10px;">Create Portal</button>
        </form>
      </div>
    </div>

    <!-- DETAIL SCREEN OVERLAY DRAWER -->
    <div id="dept-details-overlay" class="glass-card animate-fade-in" style="display:none; position:fixed; top:0; right:0; width:100vw; max-width:720px; height:100vh; z-index:9000; box-shadow:var(--shadow); background:var(--bg); border-left:1px solid var(--border); overflow-y:auto; padding:30px;">
      <!-- Loaded dynamically -->
    </div>
  `;

  // Bind list interactions
  container.querySelector("#btn-toggle-dept-cards").addEventListener("click", () => {
    state.deptViewMode = "cards";
    navigateTo("departments");
  });
  container.querySelector("#btn-toggle-dept-table").addEventListener("click", () => {
    state.deptViewMode = "table";
    navigateTo("departments");
  });

  const searchInput = container.querySelector("#dept-search-input");
  searchInput.addEventListener("input", (e) => {
    state.deptSearchTerm = e.target.value;
    drawDepts();
  });

  // Open Create Modal
  const btnCreate = container.querySelector("#btn-create-dept");
  if (btnCreate) {
    btnCreate.addEventListener("click", () => {
      document.getElementById("dept-create-form").reset();
      document.getElementById("dept-create-modal-overlay").style.display = "flex";
    });
  }

  document.getElementById("dept-create-close").addEventListener("click", () => {
    document.getElementById("dept-create-modal-overlay").style.display = "none";
  });

  // Create form submit
  document.getElementById("dept-create-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("cre-dept-id").value.trim().toLowerCase();
    const name = document.getElementById("cre-dept-name").value.trim();
    const head = document.getElementById("cre-dept-head").value.trim();
    const faculty = parseInt(document.getElementById("cre-dept-faculty").value);
    const students = parseInt(document.getElementById("cre-dept-students").value);

    const list = await window.getDepartments();
    const duplicate = list.find(d => d.id === id);
    if (duplicate) {
      showToast("Department code already exists.", "error");
      return;
    }

    list.push({
      id,
      name,
      head,
      facultyCount: faculty,
      studentCount: students,
      status: "Draft",
      lastUpdated: new Date().toLocaleDateString(),
      vision: "To be recognized globally for education excellence, cutting edge research, and development of strategic engineers.",
      mission: "To impart quality technical education by creating active learning environments, fostering publication audits, and collaborating with corporate bodies.",
      facultyList: [
        { name: head, qualification: "Ph.D.", designation: "Professor & Head", specialization: "General Systems", email: `${id}_head@apex.edu`, phone: "+91 90000 00001" }
      ],
      gallery: [],
      auditLog: [
        { changer: currentUser.name, detail: "Department portal created.", timestamp: new Date().toLocaleString() }
      ],
      metrics: {
        publications: [],
        grants: [],
        patents: [],
        placements: [],
        events: []
      }
    });

    localStorage.setItem("annual_report_portal_departments", JSON.stringify(list));
    document.getElementById("dept-create-modal-overlay").style.display = "none";
    showToast("Department portal created successfully!", "success");
    navigateTo("departments");
  });

  // Department Details drawer renderer
  const showDepartmentDetails = async (deptId) => {
    const d = deps.find(item => item.id === deptId);
    if (!d) return;

    // Faculty, Gallery details structure setup
    if (!d.facultyList) d.facultyList = [{ name: d.head, qualification: "Ph.D.", designation: "Professor & Head", specialization: "Core research", email: `${d.id}_head@apex.edu`, phone: "+91 99999 88888" }];
    if (!d.gallery) d.gallery = [];
    if (!d.auditLog) d.auditLog = [{ changer: "System Seed", detail: "Initial database seed loaded.", timestamp: new Date().toLocaleString() }];
    if (!d.vision) d.vision = "Provide premium technical resources for future research scholars.";
    if (!d.mission) d.mission = "Deliver quality-driven curriculum audits and industrial placements sync.";

    const drawer = document.getElementById("dept-details-overlay");
    state.activeDetailsTab = "about";

    const drawDrawerContent = () => {
      const active = state.activeDetailsTab;
      
      // Calculate gender chart slices (Boys: 60%, Girls: 40% default)
      const boysCount = Math.round(d.studentCount * 0.6);
      const girlsCount = d.studentCount - boysCount;

      let tabBodyHtml = "";

      if (active === "about") {
        tabBodyHtml = `
          <div style="display:flex; flex-direction:column; gap:16px; text-align:left;">
            <div>
              <strong style="color:var(--primary); font-size:12px; display:block; text-transform:uppercase; margin-bottom:5px;">Department Vision</strong>
              <blockquote style="font-style:italic; border-left:3px solid var(--primary); padding-left:12px; margin:0; color:var(--text-main); font-size:12px;">"${d.vision}"</blockquote>
            </div>
            <div style="margin-top:10px;">
              <strong style="color:var(--secondary); font-size:12px; display:block; text-transform:uppercase; margin-bottom:5px;">Department Mission</strong>
              <blockquote style="font-style:italic; border-left:3px solid var(--secondary); padding-left:12px; margin:0; color:var(--text-main); font-size:12px;">"${d.mission}"</blockquote>
            </div>
            
            <div style="margin-top:15px; border-top:1px solid var(--border); padding-top:15px;">
              <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; margin-bottom:8px;">Programs & Degrees Offered</h4>
              <ul style="margin-left:20px; display:flex; flex-direction:column; gap:4px; font-size:11px; color:var(--text-muted);">
                <li>Bachelor of Engineering (B.E. Honors) - 4 Years</li>
                <li>Master of Technology (M.Tech Specialization) - 2 Years</li>
                <li>Doctor of Philosophy (Ph.D. Research Scholars Focus)</li>
              </ul>
            </div>
          </div>
        `;
      } 
      
      else if (active === "faculty") {
        tabBodyHtml = `
          <div style="display:flex; flex-direction:column; gap:15px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; margin:0;">Active Faculty Members</h4>
              ${isHOD || isAdmin ? `<button class="btn btn-sm btn-xs btn-primary" id="btn-add-faculty-form">+ Add Faculty</button>` : ""}
            </div>

            <!-- Add Faculty inline Form -->
            <form id="add-faculty-inline-form" style="display:none; flex-direction:column; gap:10px; background:rgba(255,255,255,0.02); padding:15px; border-radius:8px; border:1px solid var(--border); font-size:11px;">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <input type="text" class="form-control" id="fac-name" required placeholder="Name (e.g. Dr. Alice)">
                <input type="text" class="form-control" id="fac-qual" required placeholder="Qualification (e.g. M.Tech, Ph.D)">
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <input type="text" class="form-control" id="fac-desig" required placeholder="Designation (e.g. Assistant Professor)">
                <input type="text" class="form-control" id="fac-spec" required placeholder="Specialization (e.g. VLSI, Networks)">
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <input type="email" class="form-control" id="fac-email" required placeholder="Email Address">
                <input type="tel" class="form-control" id="fac-phone" placeholder="Phone Number">
              </div>
              <div style="display:flex; gap:8px; justify-content:flex-end;">
                <button type="button" class="btn btn-sm" id="btn-cancel-fac" style="padding:4px 8px;">Cancel</button>
                <button type="submit" class="btn btn-sm btn-primary" style="padding:4px 8px;">Save Faculty</button>
              </div>
            </form>

            <div style="display:flex; flex-direction:column; gap:10px;">
              ${d.facultyList.map(f => `
                <div style="padding:12px; border-radius:8px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="color:var(--text-main); font-size:12px;">${f.name}</strong> <span style="font-size:10px; color:var(--text-muted);">${f.qualification}</span>
                    <span style="display:block; font-size:10px; color:var(--text-muted); margin-top:2px;">Designation: ${f.designation} &bull; Spec: ${f.specialization}</span>
                    <span style="display:block; font-size:9px; color:var(--primary); margin-top:2px;">✉️ ${f.email}</span>
                  </div>
                  ${isHOD || isAdmin ? `<button class="btn btn-sm btn-xs btn-danger btn-remove-faculty" data-email="${f.email}">✕</button>` : ""}
                </div>
              `).join("")}
            </div>
          </div>
        `;
      } 
      
      else if (active === "students") {
        tabBodyHtml = `
          <div style="display:flex; flex-direction:column; gap:20px; text-align:left;">
            <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; margin:0;">Student Enrollment & Demographics</h4>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:center;">
              <!-- Left stats list -->
              <div style="display:flex; flex-direction:column; gap:10px; font-size:11px;">
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:5px;">
                  <span>Undergraduate Students (UG)</span>
                  <strong>${Math.round(d.studentCount * 0.8)} Students</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:5px;">
                  <span>Postgraduate Students (PG)</span>
                  <strong>${Math.round(d.studentCount * 0.15)} Students</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:5px;">
                  <span>Doctoral Research Scholars</span>
                  <strong>${Math.round(d.studentCount * 0.05)} Scholars</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:5px;">
                  <span>Boys Strength (60%)</span>
                  <strong style="color:var(--primary);">${boysCount} Boys</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding-bottom:5px;">
                  <span>Girls Strength (40%)</span>
                  <strong style="color:var(--secondary);">${girlsCount} Girls</strong>
                </div>
              </div>

              <!-- Right vector gender ratio chart -->
              <div style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <svg viewBox="0 0 100 100" width="100" height="100" style="transform: rotate(-90deg); filter:drop-shadow(0 4px 10px rgba(0,0,0,0.15));">
                  <circle cx="50" cy="50" r="35" fill="transparent" stroke="var(--primary)" stroke-width="12" stroke-dasharray="220" stroke-dashoffset="0"/>
                  <circle cx="50" cy="50" r="35" fill="transparent" stroke="var(--secondary)" stroke-width="12" stroke-dasharray="220" stroke-dashoffset="${220 * 0.6}"/>
                </svg>
                <div style="display:flex; gap:15px; margin-top:15px; font-size:10px;">
                  <span style="display:flex; align-items:center; gap:5px;"><span style="width:8px; height:8px; background:var(--primary); border-radius:50%;"></span> Boys (60%)</span>
                  <span style="display:flex; align-items:center; gap:5px;"><span style="width:8px; height:8px; background:var(--secondary); border-radius:50%;"></span> Girls (40%)</span>
                </div>
              </div>
            </div>
          </div>
        `;
      } 
      
      else if (active === "gallery") {
        tabBodyHtml = `
          <div style="display:flex; flex-direction:column; gap:15px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; margin:0;">Department Photo Showcase</h4>
              ${isHOD || isAdmin ? `
                <button class="btn btn-sm btn-xs btn-primary" id="btn-upload-photo-trigger">+ Add Photo</button>
                <input type="file" id="gallery-file-hidden" style="display:none;" accept="image/*">
              ` : ""}
            </div>

            <!-- Lightbox container -->
            <div id="gallery-lightbox-overlay" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:11000; align-items:center; justify-content:center; padding:35px;">
              <button style="position:absolute; top:20px; right:20px; background:transparent; border:none; color:#fff; font-size:24px; cursor:pointer;" id="lightbox-close-btn">✕</button>
              <img id="lightbox-img-element" style="max-width:90%; max-height:80%; object-fit:contain; border-radius:8px; box-shadow:0 0 30px rgba(255,255,255,0.05);">
              <span id="lightbox-caption" style="position:absolute; bottom:30px; color:#fff; font-size:12px; font-weight:bold;"></span>
            </div>

            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;" id="gallery-grid-pics">
              ${d.gallery.length === 0 ? '<p style="color:var(--text-muted); font-size:11px; grid-column:span 3;">No images uploaded yet.</p>' : d.gallery.map((img, idx) => `
                <div style="position:relative; aspect-ratio:1.3; overflow:hidden; border-radius:8px; border:1px solid var(--border); cursor:pointer;" class="gallery-pic-container">
                  <img src="${img.url}" style="width:100%; height:100%; object-fit:cover;" class="gallery-img-thumb" data-index="${idx}" data-caption="${img.caption}">
                  <span style="position:absolute; bottom:0; left:0; width:100%; background:rgba(0,0,0,0.5); color:#fff; font-size:9px; padding:4px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${img.caption}</span>
                  ${isHOD || isAdmin ? `<button class="btn-remove-photo" data-index="${idx}" style="position:absolute; top:5px; right:5px; background:#ef4444; color:#fff; border:none; border-radius:50%; width:18px; height:18px; font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>` : ""}
                </div>
              `).join("")}
            </div>
          </div>
        `;
      } 
      
      else if (active === "audit") {
        tabBodyHtml = `
          <div style="display:flex; flex-direction:column; gap:12px; text-align:left;">
            <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; margin:0;">Operations Change Logs</h4>
            <div style="display:flex; flex-direction:column; gap:10px; max-height:260px; overflow-y:auto; font-size:10px;">
              ${d.auditLog.map(l => `
                <div style="padding:8px; border-radius:6px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <span style="font-weight:bold; color:var(--primary);">${l.changer}</span>
                    <span style="margin-left:5px; color:var(--text-main);">${l.detail}</span>
                  </div>
                  <span style="color:var(--text-muted); font-size:9px;">${l.timestamp}</span>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }

      drawer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:12px;">
          <div>
            <h2 style="font-family:var(--font-title); font-size:18px; font-weight:800; color:var(--text-main);">${d.name} Portal</h2>
            <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Code: ${d.id} &bull; Head: ${d.head}</span>
          </div>
          <button class="btn btn-sm" id="btn-close-details-drawer" style="padding:4px 10px;">✕ Close</button>
        </div>

        <!-- Detail tabs row -->
        <div class="glass-card" style="padding:6px 12px; border-radius:8px; margin-bottom:20px; display:flex; gap:8px; overflow-x:auto;">
          <button class="tab-btn btn-xs ${active === "about" ? "active" : ""}" data-tab-link="about">About & Vision</button>
          <button class="tab-btn btn-xs ${active === "faculty" ? "active" : ""}" data-tab-link="faculty">Faculty members</button>
          <button class="tab-btn btn-xs ${active === "students" ? "active" : ""}" data-tab-link="students">Student statistics</button>
          <button class="tab-btn btn-xs ${active === "gallery" ? "active" : ""}" data-tab-link="gallery">Photo Gallery</button>
          <button class="tab-btn btn-xs ${active === "audit" ? "active" : ""}" data-tab-link="audit">Audit Change Log</button>
        </div>

        <div style="margin-top:15px; min-height:280px;">
          ${tabBodyHtml}
        </div>
      `;

      // Bind Tab Navigation clicks
      drawer.querySelectorAll("[data-tab-link]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          state.activeDetailsTab = e.target.getAttribute("data-tab-link");
          drawDrawerContent();
        });
      });

      drawer.querySelector("#btn-close-details-drawer").addEventListener("click", () => {
        drawer.style.display = "none";
      });

      // Bind Faculty additions HOD actions
      const showFacFormBtn = drawer.querySelector("#btn-add-faculty-form");
      const facForm = drawer.querySelector("#add-faculty-inline-form");
      if (showFacFormBtn && facForm) {
        showFacFormBtn.addEventListener("click", () => {
          facForm.style.display = "flex";
        });
        drawer.querySelector("#btn-cancel-fac").addEventListener("click", () => {
          facForm.style.display = "none";
        });

        facForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const name = drawer.querySelector("#fac-name").value.trim();
          const qual = drawer.querySelector("#fac-qual").value.trim();
          const desig = drawer.querySelector("#fac-desig").value.trim();
          const spec = drawer.querySelector("#fac-spec").value.trim();
          const email = drawer.querySelector("#fac-email").value.trim();
          const phone = drawer.querySelector("#fac-phone").value.trim();

          d.facultyList.push({ name, qualification: qual, designation: desig, specialization: spec, email, phone });
          d.auditLog.unshift({ changer: currentUser.name, detail: `Added Faculty Member: ${name}`, timestamp: new Date().toLocaleString() });

          await saveUpdatedDepartmentDetails();
          showToast(`Faculty ${name} saved.`, "success");
          drawDrawerContent();
        });
      }

      // Bind Faculty deletions HOD actions
      drawer.querySelectorAll(".btn-remove-faculty").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const email = e.target.getAttribute("data-email");
          const match = d.facultyList.find(f => f.email === email);
          if (match && confirm(`Remove faculty ${match.name} profile from system mappings?`)) {
            d.facultyList = d.facultyList.filter(f => f.email !== email);
            d.auditLog.unshift({ changer: currentUser.name, detail: `Removed Faculty Member: ${match.name}`, timestamp: new Date().toLocaleString() });
            
            await saveUpdatedDepartmentDetails();
            showToast("Faculty profile removed.", "warning");
            drawDrawerContent();
          }
        });
      });

      // Bind Photo Gallery Lightbox and Photo upload flows
      const uploadTrigger = drawer.querySelector("#btn-upload-photo-trigger");
      const hiddenFile = drawer.querySelector("#gallery-file-hidden");
      if (uploadTrigger && hiddenFile) {
        uploadTrigger.addEventListener("click", () => hiddenFile.click());
        hiddenFile.addEventListener("change", async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const cap = prompt("Enter photo caption description:", file.name.split(".")[0]);
          const base64 = await window.fileToBase64(file);

          d.gallery.push({ url: base64, caption: cap || "Showcase Pic", date: new Date().toLocaleDateString() });
          d.auditLog.unshift({ changer: currentUser.name, detail: `Uploaded Photo: ${cap || "Showcase Pic"}`, timestamp: new Date().toLocaleString() });

          await saveUpdatedDepartmentDetails();
          showToast("Photo uploaded successfully!", "success");
          drawDrawerContent();
        });
      }

      // Remove photo
      drawer.querySelectorAll(".btn-remove-photo").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const idx = parseInt(e.target.getAttribute("data-index"));
          if (confirm("Remove this photo from department gallery?")) {
            d.gallery.splice(idx, 1);
            d.auditLog.unshift({ changer: currentUser.name, detail: "Removed photo from gallery.", timestamp: new Date().toLocaleString() });
            
            await saveUpdatedDepartmentDetails();
            showToast("Photo deleted.", "warning");
            drawDrawerContent();
          }
        });
      });

      // Lightbox preview clicks
      drawer.querySelectorAll(".gallery-img-thumb").forEach(thumb => {
        thumb.addEventListener("click", (e) => {
          const src = e.target.src;
          const caption = e.target.getAttribute("data-caption");
          
          const lightbox = drawer.querySelector("#gallery-lightbox-overlay");
          lightbox.querySelector("#lightbox-img-element").src = src;
          lightbox.querySelector("#lightbox-caption").textContent = caption;
          lightbox.style.display = "flex";
        });
      });

      drawer.querySelector("#lightbox-close-btn")?.addEventListener("click", () => {
        drawer.querySelector("#gallery-lightbox-overlay").style.display = "none";
      });
    };

    const saveUpdatedDepartmentDetails = async () => {
      const list = await window.getDepartments();
      const matchIdx = list.findIndex(item => item.id === d.id);
      if (matchIdx !== -1) {
        list[matchIdx] = d;
        localStorage.setItem("annual_report_portal_departments", JSON.stringify(list));
      }
    };

    drawer.style.display = "block";
    drawDrawerContent();
  };

  // Draw initial portal list
  drawDepts();
}

window.renderDepartmentsManagement = renderDepartmentsManagement;
