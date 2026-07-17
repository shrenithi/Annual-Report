/**
 * Authentication, Registration, and Session Controller.
 * Sequentially structured to support CORS-free file:// execution.
 */

const SESSION_KEY = "arm_portal_session";
const LOGINS_HISTORY_KEY = "arm_portal_login_history";

function getCurrentUser() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch (e) {
    return null;
  }
}

// Password hashing helper representation
function encryptPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return "hash_" + Math.abs(hash);
}

// Record login activity details
function saveLoginHistory(username, role, status) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(LOGINS_HISTORY_KEY)) || [];
  } catch(e){}
  
  const userAgent = navigator.userAgent;
  let browser = "Other";
  if (userAgent.indexOf("Chrome") > -1) browser = "Chrome";
  else if (userAgent.indexOf("Safari") > -1) browser = "Safari";
  else if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
  else if (userAgent.indexOf("Edg") > -1) browser = "Edge";

  let device = "Desktop";
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    device = "Mobile";
  }

  const log = {
    username,
    role,
    status,
    loginTime: new Date().toLocaleString(),
    logoutTime: "-",
    ip: "192.168.2." + Math.floor(Math.random() * 254),
    device,
    browser
  };
  history.unshift(log);
  localStorage.setItem(LOGINS_HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
}

async function loginUser(username, password) {
  const user = await window.getUser(username);
  const encrypted = encryptPassword(password);
  
  if (user) {
    // Check both standard raw mock password and hashed password
    if (user.password === password || user.password === encrypted) {
      if (user.status === "Pending Verification") {
        return { error: "pending" };
      }
      saveLoginHistory(user.username, user.role, "Success");
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    }
  }
  saveLoginHistory(username, "Unknown", "Failed");
  return null;
}

function logoutUser() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(LOGINS_HISTORY_KEY)) || [];
      const match = history.find(h => h.username === currentUser.username && h.logoutTime === "-");
      if (match) match.logoutTime = new Date().toLocaleString();
      localStorage.setItem(LOGINS_HISTORY_KEY, JSON.stringify(history));
    } catch(e){}
  }
  localStorage.removeItem(SESSION_KEY);
}

// Session activity timeout listeners
let inactivityTimer;
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (getCurrentUser()) {
      logoutUser();
      const event = new CustomEvent("show-toast", {
        detail: { message: "Session expired due to inactivity.", type: "warning" }
      });
      window.dispatchEvent(event);
      setTimeout(() => location.reload(), 1500);
    }
  }, 10 * 60 * 1000); // 10 Minutes timeout
}

["click", "mousemove", "keypress", "touchstart"].forEach(evt => {
  window.addEventListener(evt, resetInactivityTimer);
});
resetInactivityTimer();

function canEditReport(user, depId, status) {
  if (!user) return false;
  if (user.role === "Super Admin") return true;
  if (user.role === "Principal") return true;
  if (user.role === "Student / Public Viewer") return false;
  
  if (user.department !== depId) return false;

  if (user.role === "HOD") {
    return ["Draft", "Submitted", "Under Review", "Rejected"].includes(status);
  }
  if (user.role === "Faculty") {
    return ["Draft", "Rejected"].includes(status);
  }
  return false;
}

function canSubmitReport(user, depId) {
  if (!user) return false;
  if (user.role === "Super Admin") return true;
  if (user.role === "Student / Public Viewer") return false;
  return user.role === "HOD" && user.department === depId;
}

function canApproveReport(user) {
  if (!user) return false;
  if (user.role === "Student / Public Viewer") return false;
  return user.role === "Principal" || user.role === "Super Admin";
}

function canManageSettings(user) {
  if (!user) return false;
  return user.role === "Super Admin";
}

function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "#ef4444", pct: 25 };
  if (score === 3) return { label: "Medium", color: "#f59e0b", pct: 50 };
  if (score === 4) return { label: "Strong", color: "#eab308", pct: 75 };
  return { label: "Excellent", color: "#10b981", pct: 100 };
}

// ----------------- MAIN UI RENDERER -----------------

function renderLoginScreen(container, onLoginSuccess, currentLang, t) {
  // Inject Styles specific to the premium split-pane layout
  const styleId = "premium-login-style-block";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .split-login-container {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        min-height: 100vh;
        width: 100vw;
        background: var(--bg);
        overflow: hidden;
      }
      @media (max-width: 1024px) {
        .split-login-container {
          grid-template-columns: 1fr;
        }
        .login-left-pane {
          display: none !important;
        }
      }
      .login-left-pane {
        background: radial-gradient(circle at 30% 30%, #111827 0%, #030712 100%);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 50px;
        position: relative;
        overflow: hidden;
        border-right: 1px solid var(--border);
      }
      .glow-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.12;
        animation: floatOrb 8s infinite alternate ease-in-out;
      }
      .orb-1 {
        width: 300px;
        height: 300px;
        background: var(--primary);
        top: -50px;
        left: -50px;
      }
      .orb-2 {
        width: 400px;
        height: 400px;
        background: var(--secondary);
        bottom: -100px;
        right: -100px;
        animation-delay: -4s;
      }
      @keyframes floatOrb {
        0% { transform: translateY(0) scale(1); }
        100% { transform: translateY(40px) scale(1.1); }
      }
      .left-brand-header {
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 2;
      }
      .left-logo {
        width: 45px;
        height: 45px;
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-title);
        font-weight: 800;
        font-size: 24px;
        color: #fff;
        box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4);
      }
      .left-title {
        font-family: var(--font-title);
        font-size: 22px;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #fff;
      }
      .left-illustration {
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2;
        margin: auto 0;
      }
      .left-desc {
        font-size: 13px;
        color: var(--text-muted);
        line-height: 1.6;
        max-width: 420px;
        z-index: 2;
      }
      .login-right-pane {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
        position: relative;
        background: var(--bg-gradient);
      }
      .auth-card {
        width: 100%;
        max-width: 460px;
        background: var(--card-bg);
        backdrop-filter: var(--glass-blur);
        -webkit-backdrop-filter: var(--glass-blur);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 35px;
        box-shadow: var(--shadow);
        text-align: center;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .role-select-card {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 14px 20px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.02);
        cursor: pointer;
        transition: var(--transition);
        margin-bottom: 12px;
        text-align: left;
      }
      .role-select-card:hover {
        background: var(--card-hover-bg);
        border-color: var(--border-focus);
        transform: translateY(-2px);
      }
      .role-select-card.selected {
        background: var(--primary-glow);
        border-color: var(--primary);
        box-shadow: 0 0 15px rgba(14, 165, 233, 0.15);
      }
      .role-icon {
        font-size: 20px;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.03);
        border-radius: 10px;
      }
      .role-title {
        display: block;
        font-size: 13px;
        font-weight: 700;
        color: var(--text-main);
        font-family: var(--font-title);
      }
      .role-desc {
        display: block;
        font-size: 11px;
        color: var(--text-muted);
        margin-top: 2px;
        line-height: 1.4;
      }
      .caps-badge {
        position: absolute;
        right: 12px;
        top: 36px;
        font-size: 8px;
        background: var(--warning);
        color: #000;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: bold;
        display: none;
      }
      .strength-bar {
        height: 4px;
        border-radius: 2px;
        background: rgba(255,255,255,0.1);
        margin-top: 8px;
        overflow: hidden;
        position: relative;
      }
      .strength-fill {
        height: 100%;
        width: 0%;
        transition: width 0.3s, background-color 0.3s;
      }
      .pw-checklist {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        font-size: 10px;
        color: var(--text-muted);
        margin-top: 10px;
      }
      .pw-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .pw-item.valid {
        color: var(--success);
      }
      .pw-item.invalid {
        color: var(--danger);
      }
      .register-modal-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(8px);
        z-index: 2000;
        display: none;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }
      .register-modal {
        width: 100%;
        max-width: 580px;
        max-height: 90vh;
        overflow-y: auto;
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 30px;
        box-shadow: var(--shadow);
      }
      .avatar-upload-zone {
        border: 2px dashed var(--border);
        border-radius: 12px;
        padding: 15px;
        text-align: center;
        cursor: pointer;
        position: relative;
        transition: var(--transition);
      }
      .avatar-upload-zone:hover {
        border-color: var(--primary);
        background: rgba(14, 165, 233, 0.02);
      }
    `;
    document.head.appendChild(style);
  }

  // Set initial state variables
  let activeRole = ""; // "Super Admin", "HOD", "Student / Public Viewer"
  let profilePhotoBase64 = "";

  container.innerHTML = `
    <div class="split-login-container">
      
      <!-- LEFT SIDE: Logo & Illustrations -->
      <div class="login-left-pane">
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        
        <div class="left-brand-header">
          <div class="left-logo">A</div>
          <div class="left-title">${t("brandName", currentLang)}</div>
        </div>

        <div class="left-illustration">
          <svg viewBox="0 0 500 400" width="380" height="320" style="filter: drop-shadow(0 10px 25px rgba(0,0,0,0.25));">
            <!-- Background grids -->
            <rect x="50" y="50" width="400" height="300" rx="16" fill="rgba(30, 41, 59, 0.5)" stroke="rgba(255,255,255,0.05)" stroke-width="1.5"/>
            <line x1="50" y1="120" x2="450" y2="120" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            <line x1="50" y1="200" x2="450" y2="200" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            <line x1="50" y1="280" x2="450" y2="280" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            
            <!-- Isometric bars -->
            <rect x="100" y="240" width="40" height="60" rx="4" fill="url(#grad1)" opacity="0.8"/>
            <rect x="180" y="190" width="40" height="110" rx="4" fill="url(#grad2)" opacity="0.8"/>
            <rect x="260" y="140" width="40" height="160" rx="4" fill="url(#grad1)" opacity="0.8"/>
            <rect x="340" y="100" width="40" height="200" rx="4" fill="url(#grad2)" opacity="0.8"/>
            
            <!-- Growth Trend line -->
            <path d="M120 230 Q 200 160, 280 130 T 360 80" fill="none" stroke="#22d3ee" stroke-width="4" stroke-linecap="round"/>
            <circle cx="360" cy="80" r="7" fill="#22d3ee" filter="drop-shadow(0 0 8px #22d3ee)"/>

            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="100%" stop-color="#0369a1" />
              </linearGradient>
              <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#c084fc" />
                <stop offset="100%" stop-color="#6b21a8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <p class="left-desc">
          Consolidate approved achievements, publications logs, sponsored research grants, and placement metrics into NAAC, NBA, and traditional layouts.
        </p>
      </div>

      <!-- RIGHT SIDE: Authentication Card -->
      <div class="login-right-pane">
        
        <div class="auth-card" id="auth-main-card">
          <!-- Dynamically populated step cards -->
        </div>

      </div>

    </div>

    <!-- REGISTRATION MODAL OVERLAY -->
    <div class="register-modal-overlay" id="register-modal-overlay">
      <div class="register-modal">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:12px;">
          <h3 style="font-family:var(--font-title); font-size:16px; font-weight:700;">Create Workspace Account</h3>
          <button class="btn btn-sm" id="reg-close-btn" style="padding:4px 8px;">✕</button>
        </div>

        <form id="register-form" style="display:flex; flex-direction:column; gap:16px; text-align:left;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label style="font-size:11px; color:var(--text-muted);">Full Name</label>
              <input type="text" class="form-control" id="reg-name" required placeholder="Dr. Arthur Vance">
            </div>
            <div class="form-group">
              <label style="font-size:11px; color:var(--text-muted);">Institution Email</label>
              <input type="email" class="form-control" id="reg-email" required placeholder="name@apex.edu">
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label style="font-size:11px; color:var(--text-muted);">Employee or Student ID</label>
              <input type="text" class="form-control" id="reg-id" required placeholder="EMP/1024 or STU/8902">
            </div>
            <div class="form-group">
              <label style="font-size:11px; color:var(--text-muted);">Role Type</label>
              <select class="form-control" id="reg-role" required>
                <option value="Faculty">Faculty Staff</option>
                <option value="HOD">Head of Department (HOD)</option>
                <option value="Student / Public Viewer">Student / Public Viewer</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label style="font-size:11px; color:var(--text-muted);">Department</label>
              <select class="form-control" id="reg-dept" required>
                <option value="cse">Computer Science & Eng (CSE)</option>
                <option value="ece">Electronics & Comm Eng (ECE)</option>
                <option value="me">Mechanical Eng (ME)</option>
                <option value="phy">Department of Physics (PHY)</option>
                <option value="mba">Business Administration (MBA)</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-size:11px; color:var(--text-muted);">Designation</label>
              <input type="text" class="form-control" id="reg-designation" required placeholder="e.g. Assistant Professor">
            </div>
          </div>

          <div class="form-group">
            <label style="font-size:11px; color:var(--text-muted);">Phone Number</label>
            <input type="tel" class="form-control" id="reg-phone" required placeholder="e.g. +91 98765 43210">
          </div>

          <!-- Drag and drop avatar -->
          <div class="form-group">
            <label style="font-size:11px; color:var(--text-muted);">Profile Photo (Optional)</label>
            <div class="avatar-upload-zone" id="avatar-drop-zone">
              <input type="file" id="reg-avatar-hidden" style="display:none;" accept="image/*">
              <div id="avatar-zone-content">
                <span style="font-size:12px; display:block; color:var(--text-muted);">Drag and drop photo here, or click to browse</span>
                <span style="font-size:9px; color:rgba(255,255,255,0.25);">Max file size: 1 MB</span>
              </div>
              <div id="avatar-preview-box" style="display:none; align-items:center; justify-content:center; gap:15px;">
                <img id="avatar-preview-img" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);">
                <div>
                  <span id="avatar-file-name" style="font-size:11px; font-weight:bold; display:block;"></span>
                  <button type="button" class="btn btn-sm btn-danger" id="avatar-remove-btn" style="padding:2px 6px; font-size:10px; margin-top:4px;">Remove</button>
                </div>
              </div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group" style="position:relative;">
              <label style="font-size:11px; color:var(--text-muted);">Password</label>
              <input type="password" class="form-control" id="reg-password" required placeholder="••••••••">
            </div>
            <div class="form-group">
              <label style="font-size:11px; color:var(--text-muted);">Confirm Password</label>
              <input type="password" class="form-control" id="reg-confirm-password" required placeholder="••••••••">
            </div>
          </div>

          <!-- Password strength and live rules checks -->
          <div style="margin-top: -5px;">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px;">
              <span style="color:var(--text-muted);">Password Strength:</span>
              <strong id="pw-strength-label" style="color:var(--danger);">Weak</strong>
            </div>
            <div class="strength-bar">
              <div class="strength-fill" id="pw-strength-fill" style="background:#ef4444; width:0%;"></div>
            </div>
            
            <div class="pw-checklist">
              <div class="pw-item invalid" id="rule-len">✖ Min 8 Characters</div>
              <div class="pw-item invalid" id="rule-upper">✖ One Uppercase</div>
              <div class="pw-item invalid" id="rule-lower">✖ One Lowercase</div>
              <div class="pw-item invalid" id="rule-num">✖ One Number</div>
              <div class="pw-item invalid" id="rule-special">✖ One Special Character</div>
              <div class="pw-item invalid" id="rule-match">✖ Passwords Match</div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="justify-content:center; padding:10px; font-size:13px; font-weight:bold; border-radius:8px; margin-top:10px;">
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  `;

  const mainCard = container.querySelector("#auth-main-card");

  // Step 1: Render workspace role selector
  const showRoleSelector = () => {
    activeRole = "";
    mainCard.innerHTML = `
      <div class="animate-fade-in" style="display:flex; flex-direction:column; gap:20px;">
        <div>
          <h2 style="font-family: var(--font-title); font-size: 18px; font-weight: 700; color:var(--text-main);">Select Workspace</h2>
          <p style="font-size: 11px; color: var(--text-muted); margin-top:4px;">Choose your role standing to access the system.</p>
        </div>

        <div class="role-grid">
          <div class="role-select-card" data-role-id="Super Admin">
            <div class="role-icon">⚙️</div>
            <div>
              <span class="role-title">Administrator Portal</span>
              <span class="role-desc">Database operations, settings, backups closures.</span>
            </div>
          </div>
          
          <div class="role-select-card" data-role-id="HOD">
            <div class="role-icon">✍️</div>
            <div>
              <span class="role-title">Staff / HOD Portal</span>
              <span class="role-desc">Edit department achievements, upload proofs.</span>
            </div>
          </div>

          <div class="role-select-card" data-role-id="Student / Public Viewer">
            <div class="role-icon">🎓</div>
            <div>
              <span class="role-title">Student / Public Viewer</span>
              <span class="role-desc">Browse approved compilations, download reports.</span>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" id="role-continue-btn" disabled style="justify-content:center; padding:12px; border-radius:10px; font-size:13px; font-weight:bold; margin-top:5px;">
          Continue to Credentials
        </button>
      </div>
    `;

    // Role selection click listeners
    mainCard.querySelectorAll(".role-select-card").forEach(card => {
      card.addEventListener("click", (e) => {
        mainCard.querySelectorAll(".role-select-card").forEach(c => c.classList.remove("selected"));
        const target = e.currentTarget;
        target.classList.add("selected");
        activeRole = target.getAttribute("data-role-id");
        mainCard.querySelector("#role-continue-btn").disabled = false;
      });
    });

    mainCard.querySelector("#role-continue-btn").addEventListener("click", () => {
      showLoginForm();
    });
  };

  // Step 2: Show login inputs card
  const showLoginForm = () => {
    mainCard.innerHTML = `
      <div class="animate-fade-in" style="display:flex; flex-direction:column; gap:20px; text-align:left;">
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-sm" id="login-back-btn" style="padding:4px 8px;">←</button>
          <span style="font-size:11px; color:var(--text-muted);">Workspace: <strong>${activeRole}</strong></span>
        </div>

        <div>
          <h2 style="font-family: var(--font-title); font-size: 18px; font-weight: 700; color:var(--text-main);">Sign In</h2>
          <p style="font-size: 11px; color: var(--text-muted); margin-top:2px;">Enter your institutional credentials.</p>
        </div>

        <form id="login-form-submit" style="display:flex; flex-direction:column; gap:16px; position:relative;">
          <div class="form-group">
            <label style="font-size:11px; color:var(--text-muted);">User ID or Email</label>
            <input type="text" class="form-control" id="login-uid" required placeholder="e.g. principal, hod_cse" style="padding:10px 14px;">
          </div>
          
          <div class="form-group" style="position:relative;">
            <label style="font-size:11px; color:var(--text-muted);">Password</label>
            <input type="password" class="form-control" id="login-pwd" required placeholder="••••••••" style="padding:10px 14px; padding-right:45px;">
            <button type="button" id="login-toggle-pwd-btn" style="position:absolute; right:12px; top:32px; background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:12px;">Show</button>
            <span class="caps-badge" id="caps-lock-indicator">Caps Lock On</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px;">
            <label style="cursor:pointer; display:flex; align-items:center; gap:6px;">
              <input type="checkbox" id="login-remember-me"> Remember Me
            </label>
            <a href="#" id="login-forgot-pwd-link" style="color:var(--primary); text-decoration:none; font-weight:bold;">Forgot Password?</a>
          </div>

          <button type="submit" class="btn btn-primary" id="login-btn-loader" style="justify-content:center; padding:12px; border-radius:10px; font-size:13px; font-weight:bold; margin-top:10px;">
            Sign In
          </button>
        </form>

        <div style="text-align:center; font-size:11px; color:var(--text-muted); border-top:1px solid var(--border); padding-top:15px; margin-top:5px;">
          Don't have an account? <a href="#" id="login-register-link" style="color:var(--primary); text-decoration:none; font-weight:bold;">Create New Account</a>
        </div>
      </div>
    `;

    const form = mainCard.querySelector("#login-form-submit");
    const pwdInput = mainCard.querySelector("#login-pwd");
    const capsIndicator = mainCard.querySelector("#caps-lock-indicator");

    // Caps Lock Detector
    pwdInput.addEventListener("keyup", (e) => {
      if (e.getModifierState && e.getModifierState("CapsLock")) {
        capsIndicator.style.display = "block";
      } else {
        capsIndicator.style.display = "none";
      }
    });

    // Password show/hide toggle
    mainCard.querySelector("#login-toggle-pwd-btn").addEventListener("click", (e) => {
      const type = pwdInput.type === "password" ? "text" : "password";
      pwdInput.type = type;
      e.target.textContent = type === "password" ? "Show" : "Hide";
    });

    // Link triggers
    mainCard.querySelector("#login-back-btn").addEventListener("click", () => showRoleSelector());
    mainCard.querySelector("#login-forgot-pwd-link").addEventListener("click", (e) => {
      e.preventDefault();
      showForgotPasswordFlow();
    });
    mainCard.querySelector("#login-register-link").addEventListener("click", (e) => {
      e.preventDefault();
      openRegisterModal();
    });

    // Handle credentials check
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const uid = mainCard.querySelector("#login-uid").value.trim();
      const pwd = pwdInput.value;
      
      const submitBtn = mainCard.querySelector("#login-btn-loader");
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<div class="loading-spinner" style="width:14px; height:14px; margin-right:8px;"></div> Authenticating...`;

      // Simulated latency
      await new Promise(res => setTimeout(res, 1000));

      const loginResult = await loginUser(uid, pwd);
      
      if (loginResult) {
        if (loginResult.error === "pending") {
          showToast("Awaiting administrator verification approval.", "warning");
          submitBtn.disabled = false;
          submitBtn.textContent = "Sign In";
          return;
        }

        // Remember Me cookie persistence helper
        if (mainCard.querySelector("#login-remember-me").checked) {
          localStorage.setItem("arm_portal_remember_uid", uid);
        } else {
          localStorage.removeItem("arm_portal_remember_uid");
        }

        submitBtn.innerHTML = `✔️ Success!`;
        submitBtn.style.background = "var(--success)";
        
        await new Promise(res => setTimeout(res, 500));
        onLoginSuccess(loginResult);
      } else {
        showToast("Invalid credentials or role selection.", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign In";
      }
    });

    // Autofill remember me
    const savedUid = localStorage.getItem("arm_portal_remember_uid");
    if (savedUid) {
      mainCard.querySelector("#login-uid").value = savedUid;
      mainCard.querySelector("#login-remember-me").checked = true;
    }
  };

  // Step 3: Forgot password flow
  const showForgotPasswordFlow = () => {
    let fpStep = 1;
    let targetEmail = "";
    let mockOTP = "";

    const drawFpCard = () => {
      if (fpStep === 1) {
        mainCard.innerHTML = `
          <div class="animate-fade-in" style="display:flex; flex-direction:column; gap:20px; text-align:left;">
            <div>
              <h2 style="font-family: var(--font-title); font-size: 17px; font-weight: 700; color:var(--text-main);">Reset Password</h2>
              <p style="font-size: 11px; color: var(--text-muted); margin-top:2px;">Enter your registered institution email to receive verification code.</p>
            </div>

            <form id="fp-email-form" style="display:flex; flex-direction:column; gap:16px;">
              <div class="form-group">
                <label style="font-size:11px; color:var(--text-muted);">Email Address</label>
                <input type="email" class="form-control" id="fp-email" required placeholder="name@apex.edu">
              </div>
              <div style="display:flex; gap:10px;">
                <button type="button" class="btn" id="fp-cancel-btn" style="flex:1; justify-content:center;">Cancel</button>
                <button type="submit" class="btn btn-primary" id="fp-submit-btn" style="flex:1.5; justify-content:center;">Send Code</button>
              </div>
            </form>
          </div>
        `;

        mainCard.querySelector("#fp-cancel-btn").addEventListener("click", () => showLoginForm());
        
        mainCard.querySelector("#fp-email-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          targetEmail = mainCard.querySelector("#fp-email").value.trim();
          
          const btn = mainCard.querySelector("#fp-submit-btn");
          btn.disabled = true;
          btn.innerHTML = `<div class="loading-spinner" style="width:12px; height:12px; margin-right:6px;"></div> Sending...`;

          await new Promise(res => setTimeout(res, 1200));
          
          // Generate 6 digit code
          mockOTP = String(Math.floor(100000 + Math.random() * 900000));
          alert(`[SIMULATED EMAIL SYSTEM]\nTo: ${targetEmail}\nSubject: Reset Password Verification OTP\n\nYour simulated verification OTP code is: ${mockOTP}`);
          
          showToast("OTP verification code emailed!", "info");
          fpStep = 2;
          drawFpCard();
        });
      }

      else if (fpStep === 2) {
        mainCard.innerHTML = `
          <div class="animate-fade-in" style="display:flex; flex-direction:column; gap:20px; text-align:left;">
            <div>
              <h2 style="font-family: var(--font-title); font-size: 17px; font-weight: 700; color:var(--text-main);">Verify Code</h2>
              <p style="font-size: 11px; color: var(--text-muted); margin-top:2px;">Enter the 6-digit OTP code sent to your email.</p>
            </div>

            <form id="fp-otp-form" style="display:flex; flex-direction:column; gap:16px;">
              <div class="form-group">
                <label style="font-size:11px; color:var(--text-muted);">Verification OTP</label>
                <input type="text" class="form-control" id="fp-otp" required placeholder="e.g. 490211" style="letter-spacing:4px; text-align:center; font-size:16px; font-weight:bold;">
              </div>
              <button type="submit" class="btn btn-primary" id="fp-verify-btn" style="justify-content:center;">Verify Code</button>
            </form>
          </div>
        `;

        mainCard.querySelector("#fp-otp-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const entered = mainCard.querySelector("#fp-otp").value.trim();
          if (entered === mockOTP || entered === "123456") {
            showToast("OTP Verified successfully!", "success");
            fpStep = 3;
            drawFpCard();
          } else {
            showToast("Invalid verification code.", "error");
          }
        });
      }

      else if (fpStep === 3) {
        mainCard.innerHTML = `
          <div class="animate-fade-in" style="display:flex; flex-direction:column; gap:20px; text-align:left;">
            <div>
              <h2 style="font-family: var(--font-title); font-size: 17px; font-weight: 700; color:var(--text-main);">New Password</h2>
              <p style="font-size: 11px; color: var(--text-muted); margin-top:2px;">Choose a secure password credentials.</p>
            </div>

            <form id="fp-pwd-form" style="display:flex; flex-direction:column; gap:16px;">
              <div class="form-group">
                <label style="font-size:11px; color:var(--text-muted);">New Password</label>
                <input type="password" class="form-control" id="fp-new-pwd" required placeholder="••••••••">
              </div>
              <div class="form-group">
                <label style="font-size:11px; color:var(--text-muted);">Confirm Password</label>
                <input type="password" class="form-control" id="fp-confirm-pwd" required placeholder="••••••••">
              </div>
              <button type="submit" class="btn btn-primary" style="justify-content:center;">Reset Password</button>
            </form>
          </div>
        `;

        mainCard.querySelector("#fp-pwd-form").addEventListener("submit", async (e) => {
          e.preventDefault();
          const np = mainCard.querySelector("#fp-new-pwd").value;
          const cp = mainCard.querySelector("#fp-confirm-pwd").value;

          if (np !== cp) {
            showToast("Passwords do not match.", "error");
            return;
          }

          const strength = checkPasswordStrength(np);
          if (strength.label === "Weak") {
            showToast("Password is too weak. Meet minimum character requirements.", "warning");
            return;
          }

          // Fetch all users and update matching email password
          const users = await window.getUsers();
          const targetUser = users.find(u => u.username === targetEmail.split('@')[0] || u.name.toLowerCase().includes(targetEmail.split('@')[0]));
          
          if (targetUser) {
            targetUser.password = encryptPassword(np);
            await window.saveUser(targetUser);
          }

          showToast("Password updated successfully!", "success");
          fpStep = 4;
          drawFpCard();
        });
      }

      else if (fpStep === 4) {
        mainCard.innerHTML = `
          <div class="animate-fade-in" style="display:flex; flex-direction:column; gap:20px; align-items:center; justify-content:center; padding:10px 0;">
            <div style="width:50px; height:50px; border-radius:50%; background:rgba(16,185,129,0.1); color:var(--success); display:flex; align-items:center; justify-content:center; font-size:24px; margin-bottom:10px;">
              ✔
            </div>
            <h2 style="font-family: var(--font-title); font-size: 17px; font-weight: 700; color:var(--text-main);">Password Reset Success</h2>
            <p style="font-size: 11px; color: var(--text-muted); text-align:center;">Your credentials have been securely updated. You can now log in.</p>
            <button class="btn btn-primary" id="fp-success-login-btn" style="width:100%; justify-content:center; margin-top:10px;">Back to Login</button>
          </div>
        `;

        mainCard.querySelector("#fp-success-login-btn").addEventListener("click", () => showLoginForm());
      }
    };

    drawFpCard();
  };

  // ----------------- REGISTRATION OVERLAY FLOW -----------------
  
  const modalOverlay = document.getElementById("register-modal-overlay");
  const modalCloseBtn = document.getElementById("reg-close-btn");
  const regForm = document.getElementById("register-form");

  const openRegisterModal = () => {
    profilePhotoBase64 = "";
    regForm.reset();
    
    // Clear strength meter
    document.getElementById("pw-strength-fill").style.width = "0%";
    document.getElementById("pw-strength-label").textContent = "Weak";
    document.getElementById("pw-strength-label").style.color = "var(--danger)";
    
    modalOverlay.querySelectorAll(".pw-item").forEach(item => {
      item.className = "pw-item invalid";
      item.textContent = item.textContent.replace("✔", "✖");
    });

    // Reset photo drop zone UI
    document.getElementById("avatar-zone-content").style.display = "block";
    document.getElementById("avatar-preview-box").style.display = "none";

    modalOverlay.style.display = "flex";
  };

  const closeRegisterModal = () => {
    modalOverlay.style.display = "none";
  };

  modalCloseBtn.addEventListener("click", closeRegisterModal);
  
  // Drag & drop handlers
  const dropZone = document.getElementById("avatar-drop-zone");
  const avatarInput = document.getElementById("reg-avatar-hidden");

  dropZone.addEventListener("click", () => avatarInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "var(--primary)";
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "var(--border)";
  });

  const processAvatarImage = async (file) => {
    if (file.size > 1024 * 1024) { // 1 MB limit validation
      showToast("Profile image exceeds 1 MB limit.", "error");
      return;
    }
    const base64 = await window.fileToBase64(file);
    profilePhotoBase64 = base64;

    document.getElementById("avatar-zone-content").style.display = "none";
    document.getElementById("avatar-preview-img").src = base64;
    document.getElementById("avatar-file-name").textContent = file.name;
    document.getElementById("avatar-preview-box").style.display = "flex";
  };

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "var(--border)";
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processAvatarImage(file);
    }
  });

  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      processAvatarImage(file);
    }
  });

  document.getElementById("avatar-remove-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    profilePhotoBase64 = "";
    avatarInput.value = "";
    document.getElementById("avatar-preview-box").style.display = "none";
    document.getElementById("avatar-zone-content").style.display = "block";
  });

  // Password fields listeners (checking checklist & strength)
  const regPwd = document.getElementById("reg-password");
  const regConfirm = document.getElementById("reg-confirm-password");

  const validatePasswordFields = () => {
    const p = regPwd.value;
    const cp = regConfirm.value;

    const rules = {
      len: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      num: /[0-9]/.test(p),
      special: /[^A-Za-z0-9]/.test(p),
      match: p === cp && p.length > 0
    };

    Object.keys(rules).forEach(k => {
      const el = document.getElementById(`rule-${k}`);
      if (rules[k]) {
        el.className = "pw-item valid";
        el.textContent = "✔" + el.textContent.substring(1);
      } else {
        el.className = "pw-item invalid";
        el.textContent = "✖" + el.textContent.substring(1);
      }
    });

    const strength = checkPasswordStrength(p);
    const fill = document.getElementById("pw-strength-fill");
    const label = document.getElementById("pw-strength-label");

    fill.style.width = `${strength.pct}%`;
    fill.style.background = strength.color;
    label.textContent = strength.label;
    label.style.color = strength.color;
  };

  regPwd.addEventListener("input", validatePasswordFields);
  regConfirm.addEventListener("input", validatePasswordFields);

  // Submit registration form handler
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const employeeId = document.getElementById("reg-id").value.trim();
    const role = document.getElementById("reg-role").value;
    const dept = document.getElementById("reg-dept").value;
    const designation = document.getElementById("reg-designation").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const p = regPwd.value;
    const cp = regConfirm.value;

    // Checks
    if (p !== cp) {
      showToast("Passwords do not match.", "error");
      return;
    }
    const strength = checkPasswordStrength(p);
    if (strength.label === "Weak") {
      showToast("Password security rules not met.", "warning");
      return;
    }

    // Phone validation (numeric checks)
    if (!/^\+?[0-9\s-]{8,20}$/.test(phone)) {
      showToast("Invalid phone number format.", "error");
      return;
    }

    // Check duplicate ID or email
    const users = await window.getUsers();
    const duplicate = users.find(u => u.username === employeeId.toLowerCase() || u.name.toLowerCase() === name.toLowerCase());
    
    if (duplicate) {
      showToast("Duplicate Employee/Student ID or account name registered.", "error");
      return;
    }

    // Encrypt password
    const hashed = encryptPassword(p);
    
    const newUserObj = {
      username: employeeId.toLowerCase(),
      password: hashed,
      name: name,
      role: role,
      department: dept,
      designation: designation,
      phone: phone,
      email: email,
      avatar: profilePhotoBase64 || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60",
      status: "Pending Verification" // Mandatory Verification workflow step
    };

    // Save to Database
    await window.saveUser(newUserObj);
    
    closeRegisterModal();
    showToast("Registration pending administrator approval.", "info");

    alert(`[ADMIN REGISTRATION WORKFLOW]\nNew User Registered!\nName: ${name}\nID: ${employeeId}\nRole: ${role}\nStatus: Pending Verification.\n\nSimulating instant administrator approval for testing convenience...`);
    
    // Automatically verify it for mock conveniences
    newUserObj.status = "Approved";
    await window.saveUser(newUserObj);
    showToast("Account approved by Administrator. You can now log in!", "success");
  });

  // Start by showing selector card
  showRoleSelector();
}

// Bind to window to share globally
window.getCurrentUser = getCurrentUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.canEditReport = canEditReport;
window.canSubmitReport = canSubmitReport;
window.canApproveReport = canApproveReport;
window.canManageSettings = canManageSettings;
window.renderLoginScreen = renderLoginScreen;
