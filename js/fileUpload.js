/**
 * Enterprise Document Management System (DMS) Controller.
 * Sequentially structured to support CORS-free file:// execution.
 */

const DMS_FILES_KEY = "arm_dms_files_v3";
const DMS_RECYCLE_KEY = "arm_dms_recycle_bin";

// Format file size
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Map file types to icons
function getFileIcon(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  const pdfIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2" style="color:#ef4444;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
  const imgIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2" style="color:#a855f7;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
  const sheetIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2" style="color:#10b981;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
  const genericIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

  if (["pdf"].includes(ext)) return pdfIcon;
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return imgIcon;
  if (["xls", "xlsx", "csv"].includes(ext)) return sheetIcon;
  return genericIcon;
}

// Convert file to Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Seed mock database files if empty
async function getDmsFiles() {
  let files = [];
  try {
    files = JSON.parse(localStorage.getItem(DMS_FILES_KEY)) || [];
  } catch(e){}

  if (files.length === 0) {
    files = [
      {
        id: "dms_1",
        name: "naac_self_study_report.pdf",
        size: "1.2 MB",
        bytes: 1258291,
        type: "application/pdf",
        category: "NAAC Documents",
        tags: ["NAAC", "Accreditation"],
        uploadedBy: "admin",
        department: "cse",
        academicYear: "2025-26",
        uploadDate: "06/18/2026",
        favorite: true,
        version: 1,
        versions: [{ version: 1, name: "naac_self_study_report.pdf", uploadDate: "06/18/2026", base64: "data:application/pdf;base64,JVBERi0xLjQKJ..." }],
        downloads: 24,
        views: 89,
        base64: "data:application/pdf;base64,JVBERi0xLjQKJ...",
        status: "Active"
      },
      {
        id: "dms_2",
        name: "placements_statistics_cse.xlsx",
        size: "340 KB",
        bytes: 348160,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        category: "Placement Records",
        tags: ["Placement", "CSE"],
        uploadedBy: "hod_cse",
        department: "cse",
        academicYear: "2025-26",
        uploadDate: "07/02/2026",
        favorite: false,
        version: 1,
        versions: [{ version: 1, name: "placements_statistics_cse.xlsx", uploadDate: "07/02/2026", base64: "data:application/vnd.ms-excel;base64,..." }],
        downloads: 8,
        views: 31,
        base64: "data:application/vnd.ms-excel;base64,...",
        status: "Active"
      },
      {
        id: "dms_3",
        name: "hackathon_anna_university.jpg",
        size: "180 KB",
        bytes: 184320,
        type: "image/jpeg",
        category: "Event Photos",
        tags: ["Event", "Tamil Nadu", "Anna University"],
        uploadedBy: "admin",
        department: "cse",
        academicYear: "2025-26",
        uploadDate: "07/04/2026",
        favorite: true,
        version: 1,
        versions: [{ version: 1, name: "hackathon_anna_university.jpg", uploadDate: "07/04/2026", base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' width='100%' height='100%'><rect width='100%' height='100%' fill='%230f172a'/><circle cx='80' cy='100' r='50' fill='rgba(14,165,233,0.1)' stroke='%230ea5e9' stroke-width='2'/><text x='150' y='95' font-size='14' fill='%23f8fafc' font-weight='bold' font-family='sans-serif'>ANNA UNIVERSITY</text><text x='150' y='115' font-size='11' fill='%2338bdf8' font-family='sans-serif'>State Hackathon 2026</text><text x='150' y='135' font-size='9' fill='%2364748b' font-family='sans-serif'>Winner: Sakthi Eng College</text></svg>" }],
        downloads: 41,
        views: 120,
        base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' width='100%' height='100%'><rect width='100%' height='100%' fill='%230f172a'/><circle cx='80' cy='100' r='50' fill='rgba(14,165,233,0.1)' stroke='%230ea5e9' stroke-width='2'/><text x='150' y='95' font-size='14' fill='%23f8fafc' font-weight='bold' font-family='sans-serif'>ANNA UNIVERSITY</text><text x='150' y='115' font-size='11' fill='%2338bdf8' font-family='sans-serif'>State Hackathon 2026</text><text x='150' y='135' font-size='9' fill='%2364748b' font-family='sans-serif'>Winner: Sakthi Eng College</text></svg>",
        status: "Active"
      },
      {
        id: "dms_4",
        name: "seminar_iit_madras.jpg",
        size: "210 KB",
        bytes: 215040,
        type: "image/jpeg",
        category: "Event Photos",
        tags: ["Seminar", "Tamil Nadu", "IIT Madras"],
        uploadedBy: "admin",
        department: "ece",
        academicYear: "2025-26",
        uploadDate: "07/05/2026",
        favorite: false,
        version: 1,
        versions: [{ version: 1, name: "seminar_iit_madras.jpg", uploadDate: "07/05/2026", base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' width='100%' height='100%'><rect width='100%' height='100%' fill='%230f172a'/><rect x='40' y='60' width='80' height='80' rx='8' fill='rgba(168,85,247,0.1)' stroke='%23a855f7' stroke-width='2'/><text x='150' y='95' font-size='14' fill='%23f8fafc' font-weight='bold' font-family='sans-serif'>IIT MADRAS</text><text x='150' y='115' font-size='11' fill='%23c084fc' font-family='sans-serif'>IoT Research Seminar</text><text x='150' y='135' font-size='9' fill='%2364748b' font-family='sans-serif'>Venue: IC & SR Auditorium</text></svg>" }],
        downloads: 15,
        views: 45,
        base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' width='100%' height='100%'><rect width='100%' height='100%' fill='%230f172a'/><rect x='40' y='60' width='80' height='80' rx='8' fill='rgba(168,85,247,0.1)' stroke='%23a855f7' stroke-width='2'/><text x='150' y='95' font-size='14' fill='%23f8fafc' font-weight='bold' font-family='sans-serif'>IIT MADRAS</text><text x='150' y='115' font-size='11' fill='%23c084fc' font-family='sans-serif'>IoT Research Seminar</text><text x='150' y='135' font-size='9' fill='%2364748b' font-family='sans-serif'>Venue: IC & SR Auditorium</text></svg>",
        status: "Active"
      },
      {
        id: "dms_5",
        name: "sports_meet_sakthi_college.jpg",
        size: "245 KB",
        bytes: 250880,
        type: "image/jpeg",
        category: "Event Photos",
        tags: ["Sports", "Tamil Nadu", "Sakthi College"],
        uploadedBy: "admin",
        department: "civil",
        academicYear: "2025-26",
        uploadDate: "07/06/2026",
        favorite: true,
        version: 1,
        versions: [{ version: 1, name: "sports_meet_sakthi_college.jpg", uploadDate: "07/06/2026", base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' width='100%' height='100%'><rect width='100%' height='100%' fill='%230f172a'/><polygon points='80,60 120,140 40,140' fill='rgba(16,185,129,0.1)' stroke='%2310b981' stroke-width='2'/><text x='150' y='95' font-size='14' fill='%23f8fafc' font-weight='bold' font-family='sans-serif'>SAKTHI COLLEGE</text><text x='150' y='115' font-size='11' fill='%2334d399' font-family='sans-serif'>Annual Sports Meet 2026</text><text x='150' y='135' font-size='9' fill='%2364748b' font-family='sans-serif'>Overalls Championship Winner</text></svg>" }],
        downloads: 30,
        views: 78,
        base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' width='100%' height='100%'><rect width='100%' height='100%' fill='%230f172a'/><polygon points='80,60 120,140 40,140' fill='rgba(16,185,129,0.1)' stroke='%2310b981' stroke-width='2'/><text x='150' y='95' font-size='14' fill='%23f8fafc' font-weight='bold' font-family='sans-serif'>SAKTHI COLLEGE</text><text x='150' y='115' font-size='11' fill='%2334d399' font-family='sans-serif'>Annual Sports Meet 2026</text><text x='150' y='135' font-size='9' fill='%2364748b' font-family='sans-serif'>Overalls Championship Winner</text></svg>",
        status: "Active"
      }
    ];
    localStorage.setItem(DMS_FILES_KEY, JSON.stringify(files));
  }
  return files;
}

async function saveDmsFiles(list) {
  localStorage.setItem(DMS_FILES_KEY, JSON.stringify(list));
}

// ----------------- MAIN UI RENDERER -----------------

async function renderDocumentManagementSystem(container) {
  const allFiles = await getDmsFiles();
  const currentUser = window.getCurrentUser();
  const isAdmin = currentUser.role === "Super Admin";

  let recycleBin = [];
  try {
    recycleBin = JSON.parse(localStorage.getItem(DMS_RECYCLE_KEY)) || [];
  } catch(e){}

  // Local navigation and filter states
  if (typeof state.dmsSearchTerm === "undefined") state.dmsSearchTerm = "";
  if (typeof state.dmsDeptFilter === "undefined") state.dmsDeptFilter = "";
  if (typeof state.dmsCategoryFilter === "undefined") state.dmsCategoryFilter = "";
  if (typeof state.dmsActiveFolder === "undefined") state.dmsActiveFolder = "Root"; // "Root", "Trash"
  
  let selectedFileIds = [];
  let previewZoom = 100;
  let previewRotate = 0;

  const drawDmsWorkspace = () => {
    // Math Storage aggregates
    const totalBytes = allFiles.reduce((s,f) => s + (f.bytes || 0), 0);
    const pdfCount = allFiles.filter(f => f.name.toLowerCase().endsWith(".pdf")).length;
    const imgCount = allFiles.filter(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f.name)).length;
    const sheetCount = allFiles.filter(f => /\.(xls|xlsx|csv)$/i.test(f.name)).length;

    // Filters logic
    const sTerm = state.dmsSearchTerm.toLowerCase();
    const deptF = state.dmsDeptFilter;
    const catF = state.dmsCategoryFilter;

    let displayFiles = state.dmsActiveFolder === "Trash" ? recycleBin : allFiles.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(sTerm) || f.uploadedBy.toLowerCase().includes(sTerm);
      const matchDept = deptF ? f.department === deptF : true;
      const matchCat = catF ? f.category === catF : true;
      return matchSearch && matchDept && matchCat;
    });

    container.innerHTML = `
      <div class="top-nav" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
        <div class="page-header">
          <h1>Document Management Center</h1>
          <p>Centralized SharePoint audit proofs, templates gallery, and PDF sheets locker</p>
        </div>
      </div>

      <!-- Stats row -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:15px; margin-bottom:20px;">
        <div class="glass-card" style="padding:15px; text-align:left;">
          <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Storage utilization</span>
          <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:5px 0;">${formatBytes(totalBytes)}</h3>
          <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden; margin-top:5px;">
            <div style="width:12%; height:100%; background:var(--primary);"></div>
          </div>
        </div>
        <div class="glass-card" style="padding:15px; text-align:left;">
          <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">PDF Sheets</span>
          <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:5px 0;">${pdfCount} Files</h3>
          <span style="font-size:9px; color:var(--text-muted);">Proofs verification</span>
        </div>
        <div class="glass-card" style="padding:15px; text-align:left;">
          <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Gallery Images</span>
          <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:5px 0;">${imgCount} Pics</h3>
          <span style="font-size:9px; color:var(--text-muted);">Event logs</span>
        </div>
        <div class="glass-card" style="padding:15px; text-align:left;">
          <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Excel Sheets</span>
          <h3 style="font-family:var(--font-title); font-size:20px; font-weight:800; margin:5px 0;">${sheetCount} Books</h3>
          <span style="font-size:9px; color:var(--text-muted);">Tabular evaluations</span>
        </div>
      </div>

      <!-- Controls row -->
      <div class="glass-card" style="padding:15px; border-radius:12px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <input type="text" class="form-control" id="dms-search" value="${state.dmsSearchTerm}" placeholder="Search files..." style="max-width:200px; font-size:11px; padding:6px 12px;">
          
          <select class="form-control" id="dms-filter-dept" style="max-width:140px; font-size:11px; padding:6px;">
            <option value="">All Departments</option>
            <option value="cse" ${state.dmsDeptFilter === "cse" ? "selected" : ""}>CSE</option>
            <option value="ece" ${state.dmsDeptFilter === "ece" ? "selected" : ""}>ECE</option>
            <option value="me" ${state.dmsDeptFilter === "me" ? "selected" : ""}>ME</option>
          </select>
          
          <select class="form-control" id="dms-filter-cat" style="max-width:140px; font-size:11px; padding:6px;">
            <option value="">All Categories</option>
            <option value="NAAC Documents" ${state.dmsCategoryFilter === "NAAC Documents" ? "selected" : ""}>NAAC</option>
            <option value="Placement Records" ${state.dmsCategoryFilter === "Placement Records" ? "selected" : ""}>Placement</option>
            <option value="Research Output" ${state.dmsCategoryFilter === "Research Output" ? "selected" : ""}>Research</option>
          </select>
        </div>

        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm ${state.dmsActiveFolder === "Root" ? "btn-primary" : ""}" id="btn-show-root" style="padding:4px 8px;">📂 Files</button>
          <button class="btn btn-sm ${state.dmsActiveFolder === "Trash" ? "btn-primary" : ""}" id="btn-show-trash" style="padding:4px 8px;">🗑️ Recycle Bin</button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 2.2fr 1fr; gap:20px; text-align:left;">
        
        <!-- Files listing pane -->
        <div>
          <!-- Drag and drop zone -->
          ${state.dmsActiveFolder === "Root" ? `
            <div style="border:2px dashed var(--border); padding:22px; border-radius:12px; text-align:center; cursor:pointer; margin-bottom:20px;" id="dms-drop-zone">
              <input type="file" id="dms-file-hidden" style="display:none;" multiple>
              <span style="font-size:12px; color:var(--text-muted); display:block;">Drag and drop proofs files here or click to browse</span>
              <span style="font-size:9px; color:rgba(255,255,255,0.2); margin-top:4px; display:block;">Supports PDF, Word, Spreadsheets (Max 10MB)</span>
            </div>
          ` : ""}

          <!-- Table files -->
          <div class="glass-card" style="padding:15px; border-radius:12px; overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="border-bottom:1px solid var(--border);">
                  <th style="padding:10px;"><input type="checkbox" id="chk-dms-all" style="cursor:pointer;"></th>
                  <th style="padding:10px;">Type</th>
                  <th style="padding:10px;">File Name</th>
                  <th style="padding:10px;">Size</th>
                  <th style="padding:10px;">Uploaded By</th>
                  <th style="padding:10px;">Dept</th>
                  <th style="padding:10px; text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${displayFiles.length === 0 ? `<tr><td colspan="7" style="padding:20px; text-align:center; color:var(--text-muted);">No documents loaded.</td></tr>` : displayFiles.map(f => `
                  <tr style="border-bottom:1px solid var(--border); transition:background 0.2s;" class="table-row-hover">
                    <td style="padding:10px;"><input type="checkbox" class="chk-dms-file" data-file-id="${f.id}" style="cursor:pointer;" ${selectedFileIds.includes(f.id) ? "checked" : ""}></td>
                    <td style="padding:10px; display:flex; align-items:center; justify-content:center;">${getFileIcon(f.name)}</td>
                    <td style="padding:10px; font-weight:bold;">${f.name}</td>
                    <td style="padding:10px; color:var(--text-muted);">${f.size}</td>
                    <td style="padding:10px;">${f.uploadedBy}</td>
                    <td style="padding:10px; text-transform:uppercase; color:var(--primary); font-weight:bold;">${f.department}</td>
                    <td style="padding:10px; text-align:right;">
                      <button class="btn btn-sm btn-xs btn-preview-dms" data-file-id="${f.id}">Preview</button>
                      ${state.dmsActiveFolder === "Root" ? `
                        <button class="btn btn-sm btn-xs btn-danger btn-delete-dms" data-file-id="${f.id}">✕</button>
                      ` : `
                        <button class="btn btn-sm btn-xs btn-restore-dms" data-file-id="${f.id}">Restore</button>
                      `}
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Storage distribution SVG breakdown -->
        <div class="glass-card" style="padding:25px; border-radius:12px; height:fit-content; display:flex; flex-direction:column; gap:15px;">
          <h4 style="font-family:var(--font-title); font-size:13px; font-weight:700; margin:0; text-transform:uppercase;">Storage distribution</h4>
          
          <div style="display:flex; flex-direction:column; gap:10px; font-size:11px;">
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>PDF Documents</span>
                <strong>${pdfCount} files</strong>
              </div>
              <div style="width:100%; height:5px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                <div style="width:${Math.min((pdfCount / 10) * 100, 100)}%; height:100%; background:#ef4444;"></div>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>Images Logs</span>
                <strong>${imgCount} files</strong>
              </div>
              <div style="width:100%; height:5px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                <div style="width:${Math.min((imgCount / 10) * 100, 100)}%; height:100%; background:#a855f7;"></div>
              </div>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>Excel & CSV Sheets</span>
                <strong>${sheetCount} files</strong>
              </div>
              <div style="width:100%; height:5px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                <div style="width:${Math.min((sheetCount / 10) * 100, 100)}%; height:100%; background:#10b981;"></div>
              </div>
            </div>
          </div>

          <div style="border-top:1px solid var(--border); padding-top:15px; font-size:10px; color:var(--text-muted);">
            <strong>Storage Limit Policy:</strong>
            <p style="margin-top:4px; line-height:1.4;">Accreditation attachments are capped at 5 MB totals per local profile workspace buffer. Archive items regularly to recycle space.</p>
          </div>
        </div>

      </div>

      <!-- BULK OPERATIONS FOR DMS -->
      <div id="dms-bulk-bar" class="glass-card animate-fade-in" style="display:none; position:fixed; bottom:80px; left:50%; transform:translateX(-50%); z-index:1000; padding:15px 25px; border-radius:30px; box-shadow:var(--shadow); align-items:center; gap:20px; background:var(--bg); border:2px solid var(--primary);">
        <span id="dms-bulk-count" style="font-size:11px; font-weight:bold;">0 Selected</span>
        <button class="btn btn-sm btn-xs btn-danger" id="dms-bulk-delete-btn">Bulk Delete</button>
      </div>

      <!-- FILE PREVIEW MODAL OVERLAY -->
      <div id="dms-preview-modal-overlay" class="glass-card" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:11000; justify-content:center; align-items:center; padding:20px;">
        <div class="glass-card" style="width:90%; max-width:820px; height:90vh; padding:25px; box-shadow:var(--shadow); background:var(--bg); display:flex; flex-direction:column; gap:15px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700;" id="dms-preview-title">Document Preview</h3>
            <div style="display:flex; gap:10px;">
              <button class="btn btn-sm btn-xs" id="btn-zoom-in">🔍 +</button>
              <button class="btn btn-sm btn-xs" id="btn-zoom-out">🔍 -</button>
              <button class="btn btn-sm btn-xs" id="btn-rotate-sig">🔄 Rotate</button>
              <button class="btn btn-sm btn-xs btn-primary" id="btn-download-dms">📥 Download</button>
              <button class="btn btn-sm" id="dms-preview-close" style="padding:4px 8px;">✕</button>
            </div>
          </div>
          
          <div style="flex-grow:1; display:grid; grid-template-columns:1.5fr 1fr; gap:20px; overflow:hidden;">
            <!-- Left preview viewport -->
            <div style="background:#090d16; border:1px solid var(--border); border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:auto; position:relative;">
              <div id="dms-preview-frame" style="transition:transform 0.2s;">
                <!-- preview element loaded -->
              </div>
            </div>

            <!-- Right File specs details -->
            <div style="overflow-y:auto; font-size:11px; display:flex; flex-direction:column; gap:12px; border-left:1px solid var(--border); padding-left:20px;">
              <h4 style="font-family:var(--font-title); font-weight:bold; color:var(--primary); font-size:12px;">SPECIFICATIONS</h4>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <div>Uploaded By: <strong id="spec-by" style="color:var(--text-main);"></strong></div>
                <div>Department: <strong id="spec-dept" style="color:var(--text-main); text-transform:uppercase;"></strong></div>
                <div>Size: <strong id="spec-size" style="color:var(--text-main);"></strong></div>
                <div>Date: <strong id="spec-date" style="color:var(--text-main);"></strong></div>
                <div>Version: <strong id="spec-ver" style="color:var(--text-main);"></strong></div>
              </div>

              <!-- Share Link Section -->
              <div style="border-top:1px solid var(--border); padding-top:15px; display:flex; flex-direction:column; gap:8px;">
                <h4 style="font-family:var(--font-title); font-weight:bold; color:var(--primary); font-size:12px;">FILE SHARING</h4>
                <button class="btn btn-sm btn-xs" id="btn-generate-share-link" style="justify-content:center;">🔗 Generate Share Link</button>
                <div id="share-link-output" style="display:none; word-break:break-all; background:rgba(255,255,255,0.02); padding:8px; border-radius:4px; font-family:monospace; font-size:10px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind listeners
    const drop = container.querySelector("#dms-drop-zone");
    const fileInput = container.querySelector("#dms-file-hidden");
    if (drop && fileInput) {
      drop.addEventListener("click", () => fileInput.click());
      
      drop.addEventListener("dragover", (e) => {
        e.preventDefault();
        drop.style.borderColor = "var(--primary)";
      });
      drop.addEventListener("dragleave", () => {
        drop.style.borderColor = "var(--border)";
      });

      const handleUploadFiles = async (files) => {
        const list = await getDmsFiles();
        for (let file of files) {
          if (file.size > 10 * 1024 * 1024) { // 10MB limit check
            showToast(`File ${file.name} exceeds 10MB size limit.`, "error");
            continue;
          }
          const base64 = await fileToBase64(file);
          list.push({
            id: "dms_" + Date.now() + "_" + Math.floor(Math.random() * 100),
            name: file.name,
            size: formatBytes(file.size),
            bytes: file.size,
            type: file.type,
            category: "General Documents",
            tags: ["New"],
            uploadedBy: currentUser.username,
            department: currentUser.department,
            academicYear: "2025-26",
            uploadDate: new Date().toLocaleDateString(),
            favorite: false,
            version: 1,
            versions: [{ version: 1, name: file.name, uploadDate: new Date().toLocaleDateString(), base64 }],
            downloads: 0,
            views: 0,
            base64,
            status: "Active"
          });
        }
        await saveDmsFiles(list);
        showToast("Files uploaded successfully!", "success");
        navigateTo("dms");
      };

      drop.addEventListener("drop", (e) => {
        e.preventDefault();
        drop.style.borderColor = "var(--border)";
        handleUploadFiles(Array.from(e.dataTransfer.files));
      });

      fileInput.addEventListener("change", (e) => {
        handleUploadFiles(Array.from(e.target.files));
      });
    }

    // Filters event listeners
    container.querySelector("#dms-search").addEventListener("input", (e) => {
      state.dmsSearchTerm = e.target.value;
      drawDmsWorkspace();
    });

    container.querySelector("#dms-filter-dept").addEventListener("change", (e) => {
      state.dmsDeptFilter = e.target.value;
      drawDmsWorkspace();
    });

    container.querySelector("#dms-filter-cat").addEventListener("change", (e) => {
      state.dmsCategoryFilter = e.target.value;
      drawDmsWorkspace();
    });

    // Root / Trash switches
    container.querySelector("#btn-show-root").addEventListener("click", () => {
      state.dmsActiveFolder = "Root";
      navigateTo("dms");
    });
    container.querySelector("#btn-show-trash").addEventListener("click", () => {
      state.dmsActiveFolder = "Trash";
      navigateTo("dms");
    });

    // Checkbox checklist bindings
    container.querySelectorAll(".chk-dms-file").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const id = e.target.getAttribute("data-file-id");
        if (e.target.checked) {
          if (!selectedFileIds.includes(id)) selectedFileIds.push(id);
        } else {
          selectedFileIds = selectedFileIds.filter(fId => fId !== id);
        }
        updateBulkBar();
      });
    });

    const chkAll = container.querySelector("#chk-dms-all");
    if (chkAll) {
      chkAll.addEventListener("change", (e) => {
        const chks = container.querySelectorAll(".chk-dms-file");
        selectedFileIds = [];
        chks.forEach(c => {
          c.checked = e.target.checked;
          if (e.target.checked) selectedFileIds.push(c.getAttribute("data-file-id"));
        });
        updateBulkBar();
      });
    }

    const updateBulkBar = () => {
      const bar = container.querySelector("#dms-bulk-bar");
      if (!bar) return;
      if (selectedFileIds.length > 0) {
        bar.style.display = "flex";
        container.querySelector("#dms-bulk-count").textContent = `${selectedFileIds.length} files selected`;
      } else {
        bar.style.display = "none";
      }
    };

    // Bulk Delete Click trigger
    container.querySelector("#dms-bulk-delete-btn")?.addEventListener("click", async () => {
      if (confirm(`Move ${selectedFileIds.length} files to Recycle Bin?`)) {
        let list = await getDmsFiles();
        
        // Move to Recycle Bin
        const toRecycle = list.filter(f => selectedFileIds.includes(f.id));
        recycleBin.push(...toRecycle);
        localStorage.setItem(DMS_RECYCLE_KEY, JSON.stringify(recycleBin));

        // Filter out from main
        list = list.filter(f => !selectedFileIds.includes(f.id));
        await saveDmsFiles(list);

        showToast("Selected files moved to Recycle Bin.", "warning");
        navigateTo("dms");
      }
    });

    // Single Delete click
    container.querySelectorAll(".btn-delete-dms").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-file-id");
        let list = await getDmsFiles();
        const target = list.find(f => f.id === id);
        if (target && confirm(`Move ${target.name} to Recycle Bin?`)) {
          recycleBin.push(target);
          localStorage.setItem(DMS_RECYCLE_KEY, JSON.stringify(recycleBin));
          
          list = list.filter(f => f.id !== id);
          await saveDmsFiles(list);

          showToast("File archived in Recycle Bin.", "info");
          navigateTo("dms");
        }
      });
    });

    // Restore single file click
    container.querySelectorAll(".btn-restore-dms").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-file-id");
        const target = recycleBin.find(f => f.id === id);
        if (target) {
          const list = await getDmsFiles();
          list.push(target);
          await saveDmsFiles(list);

          recycleBin = recycleBin.filter(f => f.id !== id);
          localStorage.setItem(DMS_RECYCLE_KEY, JSON.stringify(recycleBin));

          showToast("File restored successfully!", "success");
          navigateTo("dms");
        }
      });
    });

    // Preview File Modal click
    container.querySelectorAll(".btn-preview-dms").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-file-id");
        const list = state.dmsActiveFolder === "Trash" ? recycleBin : allFiles;
        const f = list.find(item => item.id === id);
        if (f) {
          showFilePreview(f);
        }
      });
    });
  };

  // Preview overlay logic
  const showFilePreview = (f) => {
    previewZoom = 100;
    previewRotate = 0;

    const overlay = document.getElementById("dms-preview-modal-overlay");
    document.getElementById("dms-preview-title").textContent = `Preview: ${f.name}`;
    
    // Set specifications
    document.getElementById("spec-by").textContent = f.uploadedBy;
    document.getElementById("spec-dept").textContent = f.department;
    document.getElementById("spec-size").textContent = f.size;
    document.getElementById("spec-date").textContent = f.uploadDate;
    document.getElementById("spec-ver").textContent = f.version;

    // Viewport preview render element
    const viewport = document.getElementById("dms-preview-frame");
    const isImage = /\.(png|jpg|jpeg|webp|svg)$/i.test(f.name);
    
    if (isImage) {
      viewport.innerHTML = `<img src="${f.base64}" id="preview-img-target" style="max-width:100%; max-height:400px; transform: scale(1) rotate(0deg);">`;
    } else {
      viewport.innerHTML = `
        <div style="padding:30px; text-align:center; color:#fff;">
          <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" fill="none" stroke-width="1.5" style="margin:0 auto 15px; color:var(--primary);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span style="font-size:12px; display:block; font-weight:bold;">${f.name}</span>
          <span style="font-size:10px; color:var(--text-muted); display:block; margin-top:5px;">Document preview is simulated. Click Download to save file locally.</span>
        </div>
      `;
    }

    const updateImgTransform = () => {
      const img = document.getElementById("preview-img-target");
      if (img) {
        img.style.transform = `scale(${previewZoom / 100}) rotate(${previewRotate}deg)`;
      }
    };

    // Zoom rotation button hooks
    document.getElementById("btn-zoom-in").onclick = () => {
      previewZoom += 20;
      updateImgTransform();
    };
    document.getElementById("btn-zoom-out").onclick = () => {
      if (previewZoom > 40) {
        previewZoom -= 20;
        updateImgTransform();
      }
    };
    document.getElementById("btn-rotate-sig").onclick = () => {
      previewRotate = (previewRotate + 90) % 360;
      updateImgTransform();
    };

    // Download file
    document.getElementById("btn-download-dms").onclick = () => {
      const a = document.createElement("a");
      a.href = f.base64;
      a.download = f.name;
      a.click();
    };

    // Share link generation
    const shareBtn = document.getElementById("btn-generate-share-link");
    const shareOutput = document.getElementById("share-link-output");
    
    shareOutput.style.display = "none";
    shareBtn.onclick = () => {
      const link = `http://localhost:8000/share?file_id=${f.id}`;
      shareOutput.textContent = link;
      shareOutput.style.display = "block";
      showToast("Share link generated!", "info");
    };

    overlay.style.display = "flex";

    document.getElementById("dms-preview-close").addEventListener("click", () => {
      overlay.style.display = "none";
    });
  };

  // Draw initial list workspace
  drawDmsWorkspace();
}

// Bind to window to share globally
window.fileToBase64 = fileToBase64;
window.formatBytes = formatBytes;
window.getFileIcon = getFileIcon;
window.getDmsFiles = getDmsFiles;
window.saveDmsFiles = saveDmsFiles;
window.renderDocumentManagementSystem = renderDocumentManagementSystem;
