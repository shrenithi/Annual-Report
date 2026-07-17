/**
 * User Accounts Management module.
 * Sequentially structured to support CORS-free file:// execution.
 */

async function renderUsersManagement(container) {
  const users = await window.getUsers();
  const currentUser = window.getCurrentUser();
  const isAdmin = currentUser.role === "Super Admin";
  const isHOD = currentUser.role === "HOD";

  // Filter users list if HOD (only see users inside their own department)
  let visibleUsers = users;
  if (isHOD) {
    visibleUsers = users.filter(u => u.department === currentUser.department);
  }

  // State storage
  if (typeof state.userViewMode === "undefined") state.userViewMode = "cards"; // "cards" or "table"
  if (typeof state.userSearchTerm === "undefined") state.userSearchTerm = "";
  if (typeof state.userRoleFilter === "undefined") state.userRoleFilter = "";
  if (typeof state.userStatusFilter === "undefined") state.userStatusFilter = "";
  
  // Selection stacks for bulk actions
  let selectedUserIds = [];

  const drawList = () => {
    const sTerm = state.userSearchTerm.toLowerCase();
    const roleF = state.userRoleFilter;
    const statusF = state.userStatusFilter;

    // Filter Visible users
    let filtered = visibleUsers.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(sTerm) || 
                          u.username.toLowerCase().includes(sTerm) || 
                          u.email.toLowerCase().includes(sTerm);
      const matchRole = roleF ? u.role === roleF : true;
      const matchStatus = statusF ? u.status === statusF : true;
      return matchSearch && matchRole && matchStatus;
    });

    let viewHtml = "";

    // Card View
    if (state.userViewMode === "cards") {
      viewHtml = `
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
          ${filtered.map(u => {
            const statusColor = getStatusBadgeColor(u.status);
            return `
              <div class="glass-card user-select-card" style="padding:20px; border-radius:12px; display:flex; flex-direction:column; gap:12px; position:relative; text-align:left;">
                ${isAdmin ? `
                  <input type="checkbox" class="chk-bulk-user" data-username="${u.username}" style="position:absolute; top:15px; right:15px; cursor:pointer;" ${selectedUserIds.includes(u.username) ? "checked" : ""}>
                ` : ""}
                <div style="display:flex; align-items:center; gap:12px;">
                  <img src="${u.avatar}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);">
                  <div>
                    <h4 style="font-family:var(--font-title); font-size:14px; font-weight:700; margin:0;">${u.name}</h4>
                    <span style="font-size:10px; color:var(--text-muted);">${u.designation || "Staff"}</span>
                  </div>
                </div>
                
                <div style="font-size:11px; display:flex; flex-direction:column; gap:6px; border-top:1px solid var(--border); padding-top:10px; color:var(--text-muted);">
                  <div><strong>ID:</strong> <span style="color:var(--text-main);">${u.username.toUpperCase()}</span></div>
                  <div><strong>Email:</strong> <span style="color:var(--text-main);">${u.email}</span></div>
                  <div><strong>Role:</strong> <span style="color:var(--text-main);">${u.role}</span></div>
                  <div><strong>Dept:</strong> <span style="color:var(--text-main);">${u.department.toUpperCase()}</span></div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; border-top:1px dashed var(--border); padding-top:8px;">
                  <span class="status-badge" style="background:${statusColor.bg}; color:${statusColor.fg}; font-size:9px;">${u.status}</span>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-sm btn-xs btn-view-profile" data-username="${u.username}">View Profile</button>
                    ${isAdmin ? `<button class="btn btn-sm btn-xs btn-edit-user" data-username="${u.username}">Edit</button>` : ""}
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
                ${isAdmin ? `<th style="padding:12px;"><input type="checkbox" id="chk-bulk-user-all" style="cursor:pointer;"></th>` : ""}
                <th style="padding:12px;">Photo</th>
                <th style="padding:12px;">Name</th>
                <th style="padding:12px;">ID</th>
                <th style="padding:12px;">Role</th>
                <th style="padding:12px;">Department</th>
                <th style="padding:12px;">Email</th>
                <th style="padding:12px;">Status</th>
                <th style="padding:12px; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `<tr><td colspan="9" style="padding:20px; text-align:center; color:var(--text-muted);">No users found.</td></tr>` : filtered.map(u => {
                const statusColor = getStatusBadgeColor(u.status);
                return `
                  <tr style="border-bottom:1px solid var(--border); transition:background 0.2s;" class="table-row-hover">
                    ${isAdmin ? `<td style="padding:12px;"><input type="checkbox" class="chk-bulk-user" data-username="${u.username}" style="cursor:pointer;" ${selectedUserIds.includes(u.username) ? "checked" : ""}></td>` : ""}
                    <td style="padding:12px;"><img src="${u.avatar}" style="width:28px; height:28px; border-radius:50%; object-fit:cover;"></td>
                    <td style="padding:12px; font-weight:bold;">${u.name}</td>
                    <td style="padding:12px; text-transform:uppercase;">${u.username}</td>
                    <td style="padding:12px;">${u.role}</td>
                    <td style="padding:12px; text-transform:uppercase;">${u.department}</td>
                    <td style="padding:12px; color:var(--text-muted);">${u.email}</td>
                    <td style="padding:12px;"><span class="status-badge" style="background:${statusColor.bg}; color:${statusColor.fg}; font-size:8px;">${u.status}</span></td>
                    <td style="padding:12px; text-align:right; display:flex; gap:6px; justify-content:flex-end;">
                      <button class="btn btn-sm btn-xs btn-view-profile" data-username="${u.username}" style="padding:2px 6px;">View</button>
                      ${isAdmin ? `<button class="btn btn-sm btn-xs btn-edit-user" data-username="${u.username}" style="padding:2px 6px;">Edit</button>` : ""}
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    container.querySelector("#users-list-area").innerHTML = viewHtml;

    // Bind checklist triggers
    container.querySelectorAll(".chk-bulk-user").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const uid = e.target.getAttribute("data-username");
        if (e.target.checked) {
          if (!selectedUserIds.includes(uid)) selectedUserIds.push(uid);
        } else {
          selectedUserIds = selectedUserIds.filter(id => id !== uid);
        }
        updateBulkBar();
      });
    });

    // Checkbox All trigger
    const chkAll = container.querySelector("#chk-bulk-user-all");
    if (chkAll) {
      chkAll.addEventListener("change", (e) => {
        const visibleChks = container.querySelectorAll(".chk-bulk-user");
        selectedUserIds = [];
        visibleChks.forEach(chk => {
          chk.checked = e.target.checked;
          const uid = chk.getAttribute("data-username");
          if (e.target.checked) selectedUserIds.push(uid);
        });
        updateBulkBar();
      });
    }

    // Bind profiles buttons
    container.querySelectorAll(".btn-view-profile").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const uid = e.target.getAttribute("data-username");
        showUserProfile(uid);
      });
    });

    // Bind edit buttons
    container.querySelectorAll(".btn-edit-user").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const uid = e.target.getAttribute("data-username");
        openEditUserModal(uid);
      });
    });
  };

  const updateBulkBar = () => {
    const bar = container.querySelector("#bulk-actions-bar");
    if (!bar) return;
    if (selectedUserIds.length > 0) {
      bar.style.display = "flex";
      container.querySelector("#bulk-count-label").textContent = `${selectedUserIds.length} users selected`;
    } else {
      bar.style.display = "none";
    }
  };

  // Status Colors Mapper
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Active": return { bg: "rgba(16, 185, 129, 0.1)", fg: "#10b981" };
      case "Pending Verification": case "Pending Approval": return { bg: "rgba(245, 158, 11, 0.1)", fg: "#f59e0b" };
      case "Suspended": case "Locked": return { bg: "rgba(239, 68, 68, 0.1)", fg: "#ef4444" };
      default: return { bg: "rgba(148, 163, 184, 0.1)", fg: "#94a3b8" };
    }
  };

  // Render layout frame
  container.innerHTML = `
    <div class="top-nav" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
      <div class="page-header">
        <h1>Workspace User Accounts</h1>
        <p>Manage profile roles, approvals, and verify credentials mappings</p>
      </div>
      
      ${isAdmin ? `
        <button class="btn btn-primary" id="btn-create-new-user">+ Add User Profile</button>
      ` : ""}
    </div>

    <!-- Filters and Views toggler row -->
    <div class="glass-card" style="padding:15px; border-radius:12px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <input type="text" class="form-control" id="user-search" value="${state.userSearchTerm}" placeholder="Search Name, Email..." style="max-width:200px; font-size:11px; padding:6px 12px;">
        
        <select class="form-control" id="filter-user-role" style="max-width:140px; font-size:11px; padding:6px;">
          <option value="">All Roles</option>
          <option value="Super Admin" ${state.userRoleFilter === "Super Admin" ? "selected" : ""}>Admin</option>
          <option value="Principal" ${state.userRoleFilter === "Principal" ? "selected" : ""}>Principal</option>
          <option value="HOD" ${state.userRoleFilter === "HOD" ? "selected" : ""}>HOD</option>
          <option value="Faculty" ${state.userRoleFilter === "Faculty" ? "selected" : ""}>Faculty</option>
          <option value="Student / Public Viewer" ${state.userRoleFilter === "Student / Public Viewer" ? "selected" : ""}>Student / Viewer</option>
        </select>

        <select class="form-control" id="filter-user-status" style="max-width:140px; font-size:11px; padding:6px;">
          <option value="">All Statuses</option>
          <option value="Active" ${state.userStatusFilter === "Active" ? "selected" : ""}>Active</option>
          <option value="Pending Verification" ${state.userStatusFilter === "Pending Verification" ? "selected" : ""}>Pending</option>
          <option value="Suspended" ${state.userStatusFilter === "Suspended" ? "selected" : ""}>Suspended</option>
          <option value="Locked" ${state.userStatusFilter === "Locked" ? "selected" : ""}>Locked</option>
        </select>
      </div>

      <div style="display:flex; gap:8px;">
        <button class="btn btn-sm ${state.userViewMode === "cards" ? "btn-primary" : ""}" id="btn-toggle-view-cards" style="padding:4px 8px;">🎴 Cards</button>
        <button class="btn btn-sm ${state.userViewMode === "table" ? "btn-primary" : ""}" id="btn-toggle-view-table" style="padding:4px 8px;">📋 Table</button>
      </div>
    </div>

    <!-- Active List Area -->
    <div id="users-list-area"></div>

    <!-- BULK ACTIONS BAR (HIDDEN BY DEFAULT) -->
    <div id="bulk-actions-bar" class="glass-card animate-fade-in" style="display:none; position:fixed; bottom:80px; left:50%; transform:translateX(-50%); z-index:1000; padding:15px 25px; border-radius:30px; box-shadow:var(--shadow); display:none; align-items:center; gap:20px; background:var(--bg); border:2px solid var(--primary);">
      <span id="bulk-count-label" style="font-size:11px; font-weight:bold;">0 Selected</span>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-sm btn-xs" id="btn-bulk-activate" style="background:rgba(16,185,129,0.1); color:#10b981;">Activate</button>
        <button class="btn btn-sm btn-xs" id="btn-bulk-deactivate" style="background:rgba(245,158,11,0.1); color:#f59e0b;">Deactivate</button>
        <button class="btn btn-sm btn-xs btn-danger" id="btn-bulk-delete">Delete</button>
      </div>
    </div>

    <!-- EDIT PROFILE / CREATE USER MODAL OVERLAY -->
    <div id="user-editor-modal-overlay" class="glass-card" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:10000; justify-content:center; align-items:center; padding:20px;">
      <div class="glass-card" style="width:100%; max-width:520px; padding:25px; box-shadow:var(--shadow); background:var(--bg); max-height:90vh; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px;">
          <h3 style="font-family:var(--font-title); font-size:15px; font-weight:700;" id="user-editor-title">User Account Parameters</h3>
          <button class="btn btn-sm" id="user-editor-close" style="padding:4px 8px;">✕</button>
        </div>
        <form id="user-editor-form" style="display:flex; flex-direction:column; gap:12px; text-align:left; font-size:11px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-control" id="ed-name" required placeholder="Dr. Arthur">
            </div>
            <div class="form-group">
              <label>Institution Email</label>
              <input type="email" class="form-control" id="ed-email" required placeholder="name@apex.edu">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Employee / Student ID</label>
              <input type="text" class="form-control" id="ed-id" required placeholder="EMP/100">
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" class="form-control" id="ed-phone" required placeholder="+91 99999 99999">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Department</label>
              <select class="form-control" id="ed-dept" required>
                <option value="cse">CSE</option>
                <option value="ece">ECE</option>
                <option value="me">ME</option>
                <option value="phy">PHY</option>
                <option value="mba">MBA</option>
              </select>
            </div>
            <div class="form-group">
              <label>Designation</label>
              <input type="text" class="form-control" id="ed-designation" placeholder="Professor">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>System Role Mapping</label>
              <select class="form-control" id="ed-role" required>
                <option value="Faculty">Faculty Staff</option>
                <option value="HOD">Head of Department (HOD)</option>
                <option value="Principal">Principal Executive</option>
                <option value="Super Admin">System Administrator</option>
                <option value="Student / Public Viewer">Student / Public Viewer</option>
              </select>
            </div>
            <div class="form-group">
              <label>Account Status</label>
              <select class="form-control" id="ed-status" required>
                <option value="Active">Active</option>
                <option value="Pending Verification">Pending Approval</option>
                <option value="Suspended">Suspended</option>
                <option value="Locked">Locked</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Login Password (Plaintext edit)</label>
            <input type="password" class="form-control" id="ed-pwd" placeholder="Enter new password to reset">
          </div>

          <button type="submit" class="btn btn-primary" style="justify-content:center; padding:10px; font-weight:bold; margin-top:10px;">Save User Account</button>
        </form>
      </div>
    </div>

    <!-- PROFILE VIEW DETAILS OVERLAY MODAL -->
    <div id="user-profile-modal-overlay" class="glass-card" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:10000; justify-content:center; align-items:center; padding:20px;">
      <div class="glass-card" style="width:100%; max-width:600px; padding:30px; box-shadow:var(--shadow); background:var(--bg); max-height:90vh; overflow-y:auto;" id="profile-modal-content-target">
        <!-- Loaded dynamically -->
      </div>
    </div>
  `;

  // Bind view toggles
  container.querySelector("#btn-toggle-view-cards").addEventListener("click", () => {
    state.userViewMode = "cards";
    navigateTo("users");
  });
  container.querySelector("#btn-toggle-view-table").addEventListener("click", () => {
    state.userViewMode = "table";
    navigateTo("users");
  });

  // Filters inputs
  const searchInput = container.querySelector("#user-search");
  searchInput.addEventListener("input", (e) => {
    state.userSearchTerm = e.target.value;
    drawList();
  });

  const roleFilter = container.querySelector("#filter-user-role");
  roleFilter.addEventListener("change", (e) => {
    state.userRoleFilter = e.target.value;
    drawList();
  });

  const statusFilter = container.querySelector("#filter-user-status");
  statusFilter.addEventListener("change", (e) => {
    state.userStatusFilter = e.target.value;
    drawList();
  });

  // Open Create User Modal
  const btnCreate = container.querySelector("#btn-create-new-user");
  if (btnCreate) {
    btnCreate.addEventListener("click", () => {
      openCreateUserModal();
    });
  }

  // Bind Bulk Actions buttons
  container.querySelector("#btn-bulk-activate")?.addEventListener("click", async () => {
    if (confirm(`Activate all ${selectedUserIds.length} selected accounts?`)) {
      const list = await window.getUsers();
      list.forEach(u => {
        if (selectedUserIds.includes(u.username)) u.status = "Active";
      });
      await saveAllUsers(list);
      showToast("Selected accounts activated.", "success");
      navigateTo("users");
    }
  });

  container.querySelector("#btn-bulk-deactivate")?.addEventListener("click", async () => {
    if (confirm(`Deactivate all ${selectedUserIds.length} selected accounts?`)) {
      const list = await window.getUsers();
      list.forEach(u => {
        if (selectedUserIds.includes(u.username)) u.status = "Suspended";
      });
      await saveAllUsers(list);
      showToast("Selected accounts suspended.", "info");
      navigateTo("users");
    }
  });

  container.querySelector("#btn-bulk-delete")?.addEventListener("click", async () => {
    if (confirm(`WARNING: Wiping out ${selectedUserIds.length} accounts! Continue?`)) {
      const list = await window.getUsers();
      const filteredList = list.filter(u => !selectedUserIds.includes(u.username));
      await saveAllUsers(filteredList);
      showToast("Selected accounts deleted.", "warning");
      navigateTo("users");
    }
  });

  // Save updated list helper
  const saveAllUsers = async (list) => {
    localStorage.setItem("annual_report_portal_users", JSON.stringify(list));
    visibleUsers = list;
    if (isHOD) {
      visibleUsers = list.filter(u => u.department === currentUser.department);
    }
  };

  // Create User Flow
  let activeEditingUid = null;
  const openCreateUserModal = () => {
    activeEditingUid = null;
    document.getElementById("user-editor-title").textContent = "Add New Workspace Profile";
    document.getElementById("user-editor-form").reset();
    document.getElementById("ed-id").readOnly = false;
    document.getElementById("user-editor-modal-overlay").style.display = "flex";
  };

  const openEditUserModal = async (uid) => {
    activeEditingUid = uid;
    const target = users.find(u => u.username === uid);
    if (target) {
      document.getElementById("user-editor-title").textContent = `Edit User: ${target.name}`;
      document.getElementById("ed-name").value = target.name;
      document.getElementById("ed-email").value = target.email;
      document.getElementById("ed-id").value = target.username;
      document.getElementById("ed-id").readOnly = true;
      document.getElementById("ed-phone").value = target.phone || "";
      document.getElementById("ed-dept").value = target.department;
      document.getElementById("ed-designation").value = target.designation || "";
      document.getElementById("ed-role").value = target.role;
      document.getElementById("ed-status").value = target.status;
      document.getElementById("ed-pwd").value = "";
      
      document.getElementById("user-editor-modal-overlay").style.display = "flex";
    }
  };

  // Submit form handler
  document.getElementById("user-editor-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("ed-name").value.trim();
    const email = document.getElementById("ed-email").value.trim();
    const uid = document.getElementById("ed-id").value.trim().toLowerCase();
    const phone = document.getElementById("ed-phone").value.trim();
    const dept = document.getElementById("ed-dept").value;
    const designation = document.getElementById("ed-designation").value.trim();
    const role = document.getElementById("ed-role").value;
    const status = document.getElementById("ed-status").value;
    const pwd = document.getElementById("ed-pwd").value;

    const list = await window.getUsers();
    
    if (activeEditingUid) {
      // Edit mode
      const match = list.find(u => u.username === activeEditingUid);
      if (match) {
        match.name = name;
        match.email = email;
        match.phone = phone;
        match.department = dept;
        match.designation = designation;
        match.role = role;
        match.status = status;
        if (pwd) match.password = window.encryptPassword ? window.encryptPassword(pwd) : pwd;
      }
    } else {
      // Create mode
      const duplicate = list.find(u => u.username === uid);
      if (duplicate) {
        showToast("Employee / Student ID already registered.", "error");
        return;
      }
      
      list.push({
        username: uid,
        name,
        email,
        phone,
        department: dept,
        designation,
        role,
        status,
        password: pwd ? (window.encryptPassword ? window.encryptPassword(pwd) : pwd) : "hash_12345",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60"
      });
    }

    await saveAllUsers(list);
    document.getElementById("user-editor-modal-overlay").style.display = "none";
    showToast("User details saved successfully!", "success");
    navigateTo("users");
  });

  document.getElementById("user-editor-close").addEventListener("click", () => {
    document.getElementById("user-editor-modal-overlay").style.display = "none";
  });

  // User Profile details modal view
  const showUserProfile = async (uid) => {
    const target = users.find(u => u.username === uid);
    if (!target) return;

    const overlay = document.getElementById("user-profile-modal-overlay");
    const content = document.getElementById("profile-modal-content-target");

    // Retrieve login logs for this user
    let historyLogs = [];
    try {
      historyLogs = JSON.parse(localStorage.getItem("arm_portal_login_history")) || [];
    } catch(e){}
    const userLogs = historyLogs.filter(h => h.username === uid);

    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:10px;">
        <h3 style="font-family:var(--font-title); font-size:16px; font-weight:700;">User Account Profile</h3>
        <button class="btn btn-sm" id="btn-close-profile-modal" style="padding:4px 8px;">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:20px; text-align:left; font-size:12px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <img src="${target.avatar}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);">
          <div>
            <h2 style="font-family:var(--font-title); font-size:18px; font-weight:800; margin:0; color:var(--text-main);">${target.name}</h2>
            <p style="color:var(--text-muted); font-size:11px; margin-top:2px;">${target.designation || "Faculty Member"} &bull; ${target.department.toUpperCase()}</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; background:rgba(255,255,255,0.01); border:1px solid var(--border); padding:15px; border-radius:10px;">
          <div><strong>Workspace Role:</strong> <span style="color:var(--text-main);">${target.role}</span></div>
          <div><strong>System ID:</strong> <span style="color:var(--text-main); text-transform:uppercase;">${target.username}</span></div>
          <div><strong>Contact Email:</strong> <span style="color:var(--text-main);">${target.email}</span></div>
          <div><strong>Contact Phone:</strong> <span style="color:var(--text-main);">${target.phone || "+91 99999 99999"}</span></div>
          <div><strong>Account Status:</strong> <span class="status-badge" style="background:rgba(16,185,129,0.1); color:#10b981; font-size:9px;">${target.status}</span></div>
          <div><strong>Workspace Sync:</strong> <span style="color:var(--text-main);">ACTIVE</span></div>
        </div>

        <!-- Own Profile Actions (Change Password) -->
        ${currentUser.username === uid ? `
          <div style="border-top:1px solid var(--border); padding-top:15px;">
            <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; margin-bottom:10px;">Update Workspace Password</h4>
            <form id="profile-change-pwd-form" style="display:flex; flex-direction:column; gap:10px;">
              <input type="password" class="form-control" id="profile-old-pwd" required placeholder="Current Password" style="padding:8px 12px; font-size:11px;">
              <input type="password" class="form-control" id="profile-new-pwd" required placeholder="New Password (min 8 chars)" style="padding:8px 12px; font-size:11px;">
              <button type="submit" class="btn btn-sm btn-primary" style="align-self:flex-start; font-size:11px; padding:6px 12px;">Save Password</button>
            </form>
          </div>
        ` : ""}

        <!-- Login history logs widget -->
        <div style="border-top:1px solid var(--border); padding-top:15px;">
          <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; margin-bottom:10px;">Recent Authentication Logs</h4>
          <div style="display:flex; flex-direction:column; gap:8px; max-height:120px; overflow-y:auto; font-size:10px;">
            ${userLogs.length === 0 ? '<p style="color:var(--text-muted);">No login transactions logged.</p>' : userLogs.map(l => `
              <div style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--border); padding-bottom:5px;">
                <span>🕒 ${l.loginTime} &bull; ${l.device} (${l.browser})</span>
                <strong style="color:var(--success);">${l.status}</strong>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    overlay.style.display = "flex";

    content.querySelector("#btn-close-profile-modal").addEventListener("click", () => {
      overlay.style.display = "none";
    });

    // Password change submission
    const pwdForm = content.querySelector("#profile-change-pwd-form");
    if (pwdForm) {
      pwdForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const oldP = content.querySelector("#profile-old-pwd").value;
        const newP = content.querySelector("#profile-new-pwd").value;

        if (newP.length < 8) {
          showToast("Password must be at least 8 characters.", "error");
          return;
        }

        const list = await window.getUsers();
        const match = list.find(u => u.username === uid);
        const encryptedOld = window.encryptPassword ? window.encryptPassword(oldP) : oldP;

        if (match && (match.password === oldP || match.password === encryptedOld)) {
          match.password = window.encryptPassword ? window.encryptPassword(newP) : newP;
          await saveAllUsers(list);
          showToast("Password updated successfully!", "success");
          overlay.style.display = "none";
        } else {
          showToast("Incorrect current password.", "error");
        }
      });
    }
  };

  // Draw initial list
  drawList();
}

window.renderUsersManagement = renderUsersManagement;
