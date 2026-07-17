/**
 * Command Palette Controller (Ctrl + K).
 * Sequentially structured to support CORS-free file:// execution.
 */

function initCommandPalette(onNavigate, onCommandTrigger) {
  let modal = document.getElementById("command-palette-modal-overlay");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "command-palette-modal-overlay";
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(8px);
      z-index: 10000;
      justify-content: center;
      align-items: flex-start;
      padding-top: 100px;
    `;
    
    modal.innerHTML = `
      <div class="glass-card" style="width: 100%; max-width: 500px; padding: 15px; border-radius: 12px; box-shadow: var(--shadow);">
        <input type="text" id="command-palette-input" placeholder="Type a view or command..." style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 6px; padding: 10px 15px; color: var(--text-main); font-size: 13px; outline: none; font-family: var(--font-title);">
        
        <div id="command-palette-suggestions-list" style="display: flex; flex-direction: column; gap: 4px; margin-top: 12px; max-height: 250px; overflow-y: auto;">
          <!-- Loaded dynamically -->
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const suggestions = [
    { title: "Go to Dashboard", subtitle: "Jump to main executive metrics screen", action: "navigate", view: "dashboard" },
    { title: "Go to Department Portals", subtitle: "Monitor department report checkers", action: "navigate", view: "departments" },
    { title: "Go to Report Compiler", subtitle: "Generate NAAC/NBA outputs & prints", action: "navigate", view: "compiler" },
    { title: "Go to Analytics Trends", subtitle: "Review multi-year citation graphs", action: "navigate", view: "analytics" },
    { title: "Go to Compare Matrix", subtitle: "Compare department data side-by-side", action: "navigate", view: "comparison" },
    { title: "Go to Rankings Board", subtitle: "View leaderboard and specialty index standings", action: "navigate", view: "leaderboard" },
    { title: "Go to Academic Calendar", subtitle: "Schedule deadlines & reviews", action: "navigate", view: "calendar" },
    { title: "Go to System Configuration", subtitle: "Configure profiles and backup files", action: "navigate", view: "settings" },
    { title: "Trigger Workspace Database Backup", subtitle: "Export all data as JSON files", action: "trigger", command: "export-db" },
    { title: "Toggle UI Language (தமிழ் / English)", subtitle: "Instantly translate labels", action: "trigger", command: "toggle-lang" },
    { title: "Reset Portal Storage (Factory Reset)", subtitle: "Clean local configurations data", action: "trigger", command: "factory-reset" },
    { title: "Edit Department: Computer Science & Eng", subtitle: "Open CSE editor workspace", action: "navigate", view: "editor", params: { id: "cse" } },
    { title: "Edit Department: Electronics & Comm Eng", subtitle: "Open ECE editor workspace", action: "navigate", view: "editor", params: { id: "ece" } },
    { title: "Edit Department: Mechanical Engineering", subtitle: "Open ME editor workspace", action: "navigate", view: "editor", params: { id: "me" } }
  ];

  const input = modal.querySelector("#command-palette-input");
  const list = modal.querySelector("#command-palette-suggestions-list");
  let selectedIndex = 0;

  const filterSuggestions = (filterText) => {
    const filter = filterText.toLowerCase();
    const filtered = suggestions.filter(s => 
      s.title.toLowerCase().includes(filter) || 
      s.subtitle.toLowerCase().includes(filter)
    );

    list.innerHTML = "";
    selectedIndex = 0;

    if (filtered.length === 0) {
      list.innerHTML = `<p style="font-size: 11px; color: var(--text-muted); text-align: center; margin: 10px 0;">No matching shortcuts found.</p>`;
      return;
    }

    filtered.forEach((s, idx) => {
      const item = document.createElement("div");
      item.style.cssText = `
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 2px;
        background: ${idx === selectedIndex ? "var(--primary-glow)" : "transparent"};
        border: 1px solid ${idx === selectedIndex ? "rgba(14, 165, 233, 0.15)" : "transparent"};
      `;
      
      item.innerHTML = `
        <span style="font-size: 12px; font-weight: 600; color: var(--text-main);">${s.title}</span>
        <span style="font-size: 10px; color: var(--text-muted);">${s.subtitle}</span>
      `;

      item.addEventListener("mouseenter", () => {
        selectedIndex = idx;
        updateSelectionHighlight();
      });

      item.addEventListener("click", () => {
        executeItem(s);
      });

      list.appendChild(item);
    });
  };

  const updateSelectionHighlight = () => {
    const children = Array.from(list.children);
    children.forEach((c, idx) => {
      if (idx === selectedIndex) {
        c.style.background = "var(--primary-glow)";
        c.style.borderColor = "rgba(14, 165, 233, 0.15)";
      } else {
        c.style.background = "transparent";
        c.style.borderColor = "transparent";
      }
    });
  };

  const executeItem = (s) => {
    modal.style.display = "none";
    if (s.action === "navigate") {
      onNavigate(s.view, s.params);
    } else {
      onCommandTrigger(s.command);
    }
  };

  const triggerPalette = () => {
    input.value = "";
    modal.style.display = "flex";
    input.focus();
    filterSuggestions("");
  };
  window.triggerCommandPalette = triggerPalette; // Expose globally

  // Key Hooks
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      triggerPalette();
    }

    if (modal.style.display === "flex") {
      const itemsCount = list.children.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % itemsCount;
        updateSelectionHighlight();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + itemsCount) % itemsCount;
        updateSelectionHighlight();
      } else if (e.key === "Enter") {
        e.preventDefault();
        const filter = input.value.toLowerCase();
        const filtered = suggestions.filter(s => 
          s.title.toLowerCase().includes(filter) || 
          s.subtitle.toLowerCase().includes(filter)
        );
        if (filtered[selectedIndex]) {
          executeItem(filtered[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        modal.style.display = "none";
      }
    }
  });

  input.addEventListener("input", (e) => {
    filterSuggestions(e.target.value);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Bind to window to share globally
window.initCommandPalette = initCommandPalette;
