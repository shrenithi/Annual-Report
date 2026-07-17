/**
 * Version History Control Module.
 * Sequentially structured to support CORS-free file:// execution.
 */

function computeReportDiff(oldData, newData) {
  const diffs = [];

  if (oldData.head !== newData.head) {
    diffs.push({ field: "Head of Department", oldVal: oldData.head, newVal: newData.head, type: "update" });
  }
  if (oldData.facultyCount !== newData.facultyCount) {
    diffs.push({ field: "Faculty Count", oldVal: oldData.facultyCount, newVal: newData.facultyCount, type: "update" });
  }
  if (oldData.studentCount !== newData.studentCount) {
    diffs.push({ field: "Student Count", oldVal: oldData.studentCount, newVal: newData.studentCount, type: "update" });
  }
  if (oldData.status !== newData.status) {
    diffs.push({ field: "Workflow Status", oldVal: oldData.status, newVal: newData.status, type: "update" });
  }

  const compareArrays = (keyName, displayName, identifierKey) => {
    const oldArr = oldData.metrics[keyName] || [];
    const newArr = newData.metrics[keyName] || [];

    oldArr.forEach(oldItem => {
      const match = newArr.find(newItem => newItem[identifierKey] === oldItem[identifierKey]);
      if (!match) {
        diffs.push({ field: displayName, oldVal: oldItem[identifierKey], newVal: "", type: "delete" });
      }
    });

    newArr.forEach(newItem => {
      const match = oldArr.find(oldItem => oldItem[identifierKey] === newItem[identifierKey]);
      if (!match) {
        diffs.push({ field: displayName, oldVal: "", newVal: newItem[identifierKey], type: "add" });
      }
    });
  };

  compareArrays("publications", "Publication added/removed", "title");
  compareArrays("grants", "Grant added/removed", "title");
  compareArrays("placements", "Placement added/removed", "company");
  compareArrays("events", "Event added/removed", "name");
  compareArrays("achievements", "Achievement added/removed", "detail");
  compareArrays("patents", "Patent added/removed", "title");

  return diffs;
}

async function renderVersionHistory(container, depId, currentUsername, onRestoreCallback) {
  const versions = await window.getVersions(depId);
  
  if (versions.length === 0) {
    container.innerHTML = `
      <div class="empty-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p>No previous versions stored. Save department report changes to populate version logs.</p>
      </div>
    `;
    return;
  }

  const sortedVersions = [...versions].reverse();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <h3 style="font-family: var(--font-title); font-size: 15px; font-weight:600; color: var(--text-main);">
        Stored Version Log (Total: ${sortedVersions.length})
      </h3>
      
      <div style="display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto;">
        ${sortedVersions.map((v, idx) => `
          <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-radius: 8px;">
            <div>
              <span style="font-weight: 600; font-family: var(--font-title); font-size: 13px;">Version Stamp ${sortedVersions.length - idx}</span>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                Saved by: <strong>${v.username}</strong> &bull; Timestamp: ${v.timestamp}
              </div>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-sm" data-action="compare" data-ver-id="${v.versionId}">Compare Diffs</button>
              <button class="btn btn-sm btn-primary" data-action="restore" data-ver-id="${v.versionId}">Restore This Version</button>
            </div>
          </div>
        `).join("")}
      </div>
      
      <div id="diff-results-box" class="glass-card" style="display: none; padding: 20px;">
        <h4 style="font-family: var(--font-title); margin-bottom: 15px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
          Version Comparison Log
        </h4>
        <div id="diff-content-list" style="display: flex; flex-direction: column; gap: 10px;"></div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-action="compare"]').forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const verId = e.target.getAttribute("data-ver-id");
      const targetVer = sortedVersions.find(v => v.versionId === verId);
      const currentReportState = window.currentEditorReportState; 
      
      if (targetVer && currentReportState) {
        const diffList = computeReportDiff(targetVer.data, currentReportState);
        const diffBox = document.getElementById("diff-results-box");
        const diffContent = document.getElementById("diff-content-list");
        
        diffBox.style.display = "block";
        diffContent.innerHTML = "";
        
        if (diffList.length === 0) {
          diffContent.innerHTML = `<p style="font-size: 13px; color: var(--success);">✔️ No differences found between active editor draft and selected version.</p>`;
          return;
        }

        diffContent.innerHTML = diffList.map(d => {
          if (d.type === "update") {
            return `
              <div style="font-size: 13px; display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 6px;">
                <span><strong>${d.field}:</strong></span>
                <span>
                  <span style="color: var(--danger); text-decoration: line-through; margin-right: 10px;">${d.oldVal}</span>
                  <span style="color: var(--success); font-weight: 600;">${d.newVal}</span>
                </span>
              </div>
            `;
          } else if (d.type === "add") {
            return `
              <div style="font-size: 13px; display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 6px; color: var(--success);">
                <span>➕ <strong>${d.field}:</strong></span>
                <span>${d.newVal}</span>
              </div>
            `;
          } else {
            return `
              <div style="font-size: 13px; display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 6px; color: var(--danger);">
                <span>➖ <strong>${d.field}:</strong></span>
                <span style="text-decoration: line-through;">${d.oldVal}</span>
              </div>
            `;
          }
        }).join("");
      }
    });
  });

  container.querySelectorAll('[data-action="restore"]').forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const verId = e.target.getAttribute("data-ver-id");
      const targetVer = sortedVersions.find(v => v.versionId === verId);
      if (targetVer) {
        if (confirm(`Are you sure you want to restore the report data to version saved on ${targetVer.timestamp}? Current changes will be overwritten.`)) {
          onRestoreCallback(targetVer.data);
        }
      }
    });
  });
}

// Bind to window to share globally
window.computeReportDiff = computeReportDiff;
window.renderVersionHistory = renderVersionHistory;
