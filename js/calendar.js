/**
 * Enterprise Event Management System & Academic Calendar Controller.
 * Sequentially structured to support CORS-free file:// execution.
 */

const EVENTS_DB_KEY = "arm_events_v3";

async function getEventsDb() {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(EVENTS_DB_KEY)) || [];
  } catch(e){}

  if (list.length === 0) {
    list = [
      {
        id: "evt_1",
        name: "National Conference on AI Innovations",
        category: "Conference",
        department: "cse",
        academicYear: "2025-26",
        type: "National",
        description: "Annual academic research gathering.",
        objective: "Promote AI research",
        expectedOutcome: "50 Scopus publications",
        startDate: "2026-07-15",
        endDate: "2026-07-16",
        startTime: "09:00",
        endTime: "16:00",
        tags: ["Research", "AI"],
        status: "Upcoming",
        venue: {
          name: "Dr. APJ Abdul Kalam Auditorium",
          building: "Science Block",
          hall: "Auditorium 1",
          capacity: 350,
          projector: true,
          wifi: true
        },
        organizers: [
          { name: "Dr. Arthur Pendelton", designation: "Professor", department: "cse", email: "arthur@apex.edu", phone: "+91 98765 11111", responsibilities: "General Chair" }
        ],
        chiefGuest: {
          name: "Dr. Sundar Pichai",
          designation: "CEO",
          organization: "Google Inc.",
          bio: "Technologist and CEO."
        },
        participants: {
          registered: 250,
          attended: 235,
          absent: 15,
          faculty: 30,
          students: 200,
          external: 20
        },
        budget: {
          expected: 150000,
          approved: 120000,
          actual: 110000,
          remaining: 10000
        },
        gallery: [],
        fileAttachments: []
      },
      {
        id: "evt_2",
        name: "Workshop on VLSI Chip Layout Design",
        category: "Workshop",
        department: "ece",
        academicYear: "2025-26",
        type: "Technical",
        description: "Hands-on chip prototyping layout design.",
        objective: "Train students on CAD tools",
        expectedOutcome: "Working layout designs",
        startDate: "2026-07-20",
        endDate: "2026-07-21",
        startTime: "10:00",
        endTime: "17:00",
        tags: ["VLSI", "ECE"],
        status: "Upcoming",
        venue: {
          name: "DSP Laboratories Block C",
          building: "VLSI Center",
          hall: "Lab 3",
          capacity: 60,
          projector: true,
          wifi: true
        },
        organizers: [
          { name: "Dr. Ramesh Babu", designation: "HOD ECE", department: "ece", email: "ramesh@apex.edu", phone: "+91 98765 22222", responsibilities: "Convener" }
        ],
        chiefGuest: {
          name: "Dr. Kumar Mangalam",
          designation: "Director",
          organization: "ISRO Labs",
          bio: "Principal Scientist."
        },
        participants: {
          registered: 80,
          attended: 75,
          absent: 5,
          faculty: 10,
          students: 65,
          external: 5
        },
        budget: {
          expected: 80000,
          approved: 70000,
          actual: 65000,
          remaining: 5000
        },
        gallery: [],
        fileAttachments: []
      }
    ];
    localStorage.setItem(EVENTS_DB_KEY, JSON.stringify(list));
  }
  return list;
}

async function saveEventsDb(list) {
  localStorage.setItem(EVENTS_DB_KEY, JSON.stringify(list));
}

// ----------------- MAIN VIEW DRAW HANDLER -----------------

async function renderAcademicCalendar(container, currentUser) {
  const events = await getEventsDb();

  // Navigation sub-tabs
  if (typeof state.activeEventTab === "undefined") state.activeEventTab = "dashboard"; // "dashboard", "list", "calendar"
  if (typeof state.eventWizardStep === "undefined") state.eventWizardStep = 1;
  if (typeof state.eventSearchTerm === "undefined") state.eventSearchTerm = "";
  if (typeof state.eventFilterDept === "undefined") state.eventFilterDept = "";

  // Temporary wizard registration buffer
  if (typeof state.tempWizardEvent === "undefined") {
    state.tempWizardEvent = {
      name: "", category: "Workshop", department: currentUser.department || "cse", academicYear: "2025-26", type: "Technical", description: "", objective: "", expectedOutcome: "",
      startDate: new Date().toISOString().split("T")[0], endDate: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "16:00", tags: [], status: "Upcoming",
      venue: { name: "", building: "", hall: "", capacity: 100, projector: true, wifi: true },
      organizers: [], chiefGuest: { name: "", designation: "", organization: "", bio: "" },
      participants: { registered: 100, attended: 95, absent: 5, faculty: 10, students: 85, external: 5 },
      budget: { expected: 50000, approved: 45000, actual: 40000, remaining: 5000 },
      gallery: [], fileAttachments: []
    };
  }

  const drawContainerFrame = () => {
    container.innerHTML = `
      <div class="top-nav" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
        <div class="page-header">
          <h1>Events & Academic Planner</h1>
          <p>Schedule guest lectures, seminars, workshops audits, and NAAC accreditation milestones</p>
        </div>

        <!-- Menu Tabs -->
        <div class="glass-card" style="padding:6px; border-radius:10px; display:flex; gap:6px;">
          <button class="btn btn-sm btn-xs tab-evt-btn ${state.activeEventTab === "dashboard" ? "btn-primary" : ""}" data-tab="dashboard">📊 Dashboard</button>
          <button class="btn btn-sm btn-xs tab-evt-btn ${state.activeEventTab === "list" ? "btn-primary" : ""}" data-tab="list">📋 Event Registry</button>
          <button class="btn btn-sm btn-xs tab-evt-btn ${state.activeEventTab === "calendar" ? "btn-primary" : ""}" data-tab="calendar">📅 Interactive Calendar</button>
        </div>
      </div>

      <!-- Tab Viewport Workspace -->
      <div id="event-tab-viewport"></div>
    `;

    // Tab bindings
    container.querySelectorAll(".tab-evt-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        state.activeEventTab = e.currentTarget.getAttribute("data-tab");
        drawContainerFrame();
      });
    });

    renderActiveTab(container.querySelector("#event-tab-viewport"));
  };

  const renderActiveTab = (viewport) => {
    const tab = state.activeEventTab;

    if (tab === "dashboard") {
      const upcoming = events.filter(e => e.status === "Upcoming").length;
      const totalBudget = events.reduce((s,e) => s + (e.budget.actual || 0), 0);
      const totalPart = events.reduce((s,e) => s + (e.participants.registered || 0), 0);

      viewport.innerHTML = `
        <!-- KPI summary rows -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:25px; text-align:left;">
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Total Logged Events</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${events.length} Events</h3>
            <span style="font-size:9px; color:var(--success);">📈 +2 from previous month</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Upcoming Deadlines</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${upcoming} Milestones</h3>
            <span style="font-size:9px; color:var(--text-muted);">NAAC & NBA reviews scheduled</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Total actual Budget</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">₹${totalBudget.toLocaleString()}</h3>
            <span style="font-size:9px; color:var(--primary);">Accreditation grants</span>
          </div>
          <div class="glass-card" style="padding:18px;">
            <span style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">Registered Participants</span>
            <h3 style="font-family:var(--font-title); font-size:24px; font-weight:800; margin:5px 0;">${totalPart} Persons</h3>
            <span style="font-size:9px; color:var(--success);">92% Attendance Average</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:20px; text-align:left;">
          <!-- Left analytics graphs breakdown -->
          <div class="glass-card" style="padding:22px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase;">Department Breakdown</h3>
            
            <div style="display:flex; flex-direction:column; gap:12px; font-size:11px;">
              ${["cse", "ece", "me"].map(dept => {
                const count = events.filter(e => e.department === dept).length;
                const pct = events.length ? Math.round((count / events.length) * 100) : 0;
                return `
                  <div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                      <span style="text-transform:uppercase; font-weight:bold; color:var(--primary);">${dept} Department</span>
                      <span>${count} events (${pct}%)</span>
                    </div>
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
                      <div style="width:${pct}%; height:100%; background:linear-gradient(to right, var(--primary), var(--secondary));"></div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Right activity logs -->
          <div class="glass-card" style="padding:22px; display:flex; flex-direction:column; gap:15px;">
            <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:8px; text-transform:uppercase; margin:0;">Upcoming Schedule</h3>
            <div style="display:flex; flex-direction:column; gap:10px; max-height:220px; overflow-y:auto; font-size:11px;">
              ${events.map(e => `
                <div style="padding:10px; border-radius:6px; background:rgba(255,255,255,0.01); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong>${e.name}</strong>
                    <span style="display:block; font-size:9px; color:var(--text-muted); margin-top:2px;">Venue: ${e.venue.name} &bull; ${e.startDate}</span>
                  </div>
                  <span style="background:var(--primary-glow); color:var(--primary); font-size:9px; padding:2px 6px; border-radius:10px; font-weight:bold; text-transform:uppercase;">${e.status}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }

    else if (tab === "list") {
      const sTerm = state.eventSearchTerm.toLowerCase();
      const displayEvents = events.filter(e => e.name.toLowerCase().includes(sTerm));

      viewport.innerHTML = `
        <div class="glass-card" style="padding:15px; border-radius:12px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; text-align:left;">
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
            <input type="text" class="form-control" id="evt-registry-search" value="${state.eventSearchTerm}" placeholder="Search events..." style="max-width:240px; font-size:11px; padding:6px 12px;">
          </div>
          ${currentUser.role !== "Student / Public Viewer" ? `
            <button class="btn btn-sm btn-primary" id="btn-open-wizard-modal">+ Create Event Wizard</button>
          ` : ""}
        </div>

        <div class="glass-card" style="padding:15px; border-radius:12px; overflow-x:auto; text-align:left;">
          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border);">
                <th style="padding:10px;">Event Title</th>
                <th style="padding:10px;">Category</th>
                <th style="padding:10px;">Dept</th>
                <th style="padding:10px;">Venue</th>
                <th style="padding:10px;">Date</th>
                <th style="padding:10px;">Budget</th>
                <th style="padding:10px; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${displayEvents.length === 0 ? `<tr><td colspan="7" style="padding:20px; text-align:center; color:var(--text-muted);">No events found.</td></tr>` : displayEvents.map(e => `
                <tr style="border-bottom:1px dashed var(--border); transition:background 0.2s;" class="table-row-hover">
                  <td style="padding:10px; font-weight:bold;">${e.name}</td>
                  <td style="padding:10px;">${e.category}</td>
                  <td style="padding:10px; text-transform:uppercase; color:var(--primary); font-weight:bold;">${e.department}</td>
                  <td style="padding:10px; color:var(--text-muted);">${e.venue.name}</td>
                  <td style="padding:10px;">${e.startDate}</td>
                  <td style="padding:10px;">₹${e.budget.actual.toLocaleString()}</td>
                  <td style="padding:10px; text-align:right;">
                    <button class="btn btn-sm btn-xs" id="btn-print-evt-${e.id}">Print PDF</button>
                    ${currentUser.role !== "Student / Public Viewer" ? `
                      <button class="btn btn-sm btn-xs btn-danger btn-delete-evt" data-evt-id="${e.id}">✕</button>
                    ` : ""}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- CREATE EVENT MULTI-STEP WIZARD OVERLAY -->
        <div id="evt-wizard-modal-overlay" class="glass-card" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(8px); z-index:11000; justify-content:center; align-items:center; padding:20px;">
          <div class="glass-card" style="width:90%; max-width:680px; height:80vh; padding:25px; box-shadow:var(--shadow); background:var(--bg); display:flex; flex-direction:column; gap:15px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:8px;">
              <h3 style="font-family:var(--font-title); font-size:14px; font-weight:700;">Add Event Stepper Wizard</h3>
              <button class="btn btn-sm" id="evt-wizard-close" style="padding:4px 8px;">✕</button>
            </div>
            
            <!-- Step Indicators -->
            <div style="display:flex; justify-content:space-between; font-size:9px; color:var(--text-muted); margin-bottom:10px; border-bottom:1px dashed var(--border); padding-bottom:10px;">
              <span style="color:${state.eventWizardStep >= 1 ? "var(--primary)" : ""}; font-weight:bold;">1. Basic Info</span>
              <span style="color:${state.eventWizardStep >= 2 ? "var(--primary)" : ""}; font-weight:bold;">2. Venue</span>
              <span style="color:${state.eventWizardStep >= 3 ? "var(--primary)" : ""}; font-weight:bold;">3. Chief Guest</span>
              <span style="color:${state.eventWizardStep >= 4 ? "var(--primary)" : ""}; font-weight:bold;">4. Budget</span>
              <span style="color:${state.eventWizardStep >= 5 ? "var(--primary)" : ""}; font-weight:bold;">5. Preview & Publish</span>
            </div>

            <div style="flex-grow:1; overflow-y:auto;" id="evt-wizard-body">
              <!-- Wizard step loaded here -->
            </div>

            <!-- Footer navigation -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:15px;">
              <button class="btn btn-sm" id="btn-wiz-prev" ${state.eventWizardStep === 1 ? "disabled" : ""}>Previous</button>
              <button class="btn btn-sm btn-primary" id="btn-wiz-next">${state.eventWizardStep === 5 ? "Publish Event" : "Next"}</button>
            </div>
          </div>
        </div>
      `;

      // Search filters
      container.querySelector("#evt-registry-search").addEventListener("input", (e) => {
        state.eventSearchTerm = e.target.value;
        renderActiveTab(viewport);
      });

      // Wizard show triggers
      const openWizardBtn = container.querySelector("#btn-open-wizard-modal");
      if (openWizardBtn) {
        openWizardBtn.addEventListener("click", () => {
          state.eventWizardStep = 1;
          document.getElementById("evt-wizard-modal-overlay").style.display = "flex";
          drawWizardStep();
        });
      }

      // Close modal click
      container.querySelector("#evt-wizard-close")?.addEventListener("click", () => {
        document.getElementById("evt-wizard-modal-overlay").style.display = "none";
      });

      // Print PDF triggers
      events.forEach(e => {
        container.querySelector(`#btn-print-evt-${e.id}`)?.addEventListener("click", () => {
          const w = window.open();
          w.document.write(`
            <style>body{font-family:sans-serif; padding:30px; line-height:1.6;} table{width:100%; border-collapse:collapse; margin-top:20px;} th,td{border:1px solid #000; padding:8px; text-align:left;}</style>
            <h2>${e.name.toUpperCase()}</h2>
            <p><strong>Category:</strong> ${e.category} &bull; <strong>Department:</strong> ${e.department.toUpperCase()}</p>
            <p><strong>Venue:</strong> ${e.venue.name}</p>
            <p><strong>Timeline Date:</strong> ${e.startDate}</p>
            <p><strong>Budget Approved:</strong> ₹${e.budget.approved.toLocaleString()}</p>
            <p><strong>Registered participants:</strong> ${e.participants.registered}</p>
            <script>window.print();</script>
          `);
          w.document.close();
        });
      });

      // Delete triggers
      container.querySelectorAll(".btn-delete-evt").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.currentTarget.getAttribute("data-evt-id");
          let list = await getEventsDb();
          const target = list.find(x => x.id === id);
          if (target && confirm(`Permanently delete ${target.name}?`)) {
            list = list.filter(x => x.id !== id);
            await saveEventsDb(list);
            showToast("Event registry updated.", "warning");
            navigateTo("calendar"); // Redraw
          }
        });
      });

      // Wizard Nav controls
      container.querySelector("#btn-wiz-prev")?.addEventListener("click", () => {
        if (state.eventWizardStep > 1) {
          saveActiveWizardValues();
          state.eventWizardStep--;
          drawWizardStep();
        }
      });

      container.querySelector("#btn-wiz-next")?.addEventListener("click", async () => {
        saveActiveWizardValues();
        if (state.eventWizardStep < 5) {
          state.eventWizardStep++;
          drawWizardStep();
        } else {
          // Publish Event
          const list = await getEventsDb();
          state.tempWizardEvent.id = "evt_" + Date.now();
          list.push(JSON.parse(JSON.stringify(state.tempWizardEvent)));
          await saveEventsDb(list);

          // Reset temp buffer
          state.tempWizardEvent = undefined;

          document.getElementById("evt-wizard-modal-overlay").style.display = "none";
          showToast("New Event published and scheduled!", "success");
          navigateTo("calendar"); // Reload tab
        }
      });
    }

    else if (tab === "calendar") {
      // Draw month calendar view (similar to existing)
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      let dateObj = new Date();
      let currentMonth = dateObj.getMonth();
      let currentYear = dateObj.getFullYear();

      const drawCalendarGrid = () => {
        viewport.innerHTML = `
          <div style="display: grid; grid-template-columns: 2.2fr 1fr; gap: 25px;">
            <!-- Calendar Grid Card -->
            <div class="glass-card" style="padding: 25px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button class="btn btn-sm" id="cal-prev-month">◀ Prev</button>
                <h3 style="font-family: var(--font-title); font-size: 16px; font-weight: 700;" id="cal-month-title">
                  ${monthNames[currentMonth]} ${currentYear}
                </h3>
                <button class="btn btn-sm" id="cal-next-month">Next ▶</button>
              </div>

              <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: 600; font-size: 12px; color: var(--text-muted); margin-bottom: 10px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;" id="calendar-days-grid">
                <!-- Loaded dynamically -->
              </div>
            </div>

            <!-- Sidebar Timeline details -->
            <div class="glass-card" style="padding: 25px; display: flex; flex-direction: column; gap: 20px;">
              <h3 style="font-family: var(--font-title); font-size: 15px; font-weight: 600; border-bottom: 1px solid var(--border); padding-bottom: 6px;">
                Milestones Timeline List
              </h3>
              <div style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto;" id="cal-timeline-list">
                <!-- Loaded dynamically -->
              </div>
            </div>
          </div>
        `;

        const daysGrid = viewport.querySelector("#calendar-days-grid");
        const timelineList = viewport.querySelector("#cal-timeline-list");

        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

        daysGrid.innerHTML = "";

        for (let i = 0; i < firstDayIndex; i++) {
          const blank = document.createElement("div");
          blank.style.height = "70px";
          daysGrid.appendChild(blank);
        }

        for (let day = 1; day <= totalDays; day++) {
          const cellDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = events.filter(e => e.startDate === cellDateStr);

          const cell = document.createElement("div");
          cell.style.cssText = `
            height: 70px;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 5px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 11px;
            position: relative;
            background: rgba(255, 255, 255, 0.01);
          `;

          cell.innerHTML = `
            <span style="font-weight: 600; color: var(--text-main);">${day}</span>
            <div style="display: flex; flex-direction: column; gap: 3px; width: 100%; overflow: hidden;">
              ${dayEvents.slice(0, 2).map(e => `
                <div style="font-size: 8px; padding: 2px 4px; border-radius: 3px; background: rgba(14, 165, 233, 0.15); color: #38bdf8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${e.name}">
                  ${e.name}
                </div>
              `).join("")}
            </div>
          `;

          daysGrid.appendChild(cell);
        }

        timelineList.innerHTML = events.length === 0 ? '<p style="font-size: 12px; color: var(--text-muted);">No calendar records logged.</p>' : events.map(e => `
          <div class="glass-card" style="padding: 12px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px;">
            <div style="text-align: left;">
              <span style="font-weight: 600; font-size: 12px; display: block; color: var(--text-main);">${e.name}</span>
              <span style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 2px;">
                Target Date: <strong>${e.startDate}</strong> &bull; Dept: ${e.department.toUpperCase()}
              </span>
              <span style="font-size: 9px; padding: 2px 6px; border-radius: 10px; display: inline-block; margin-top: 5px; font-weight: bold; background: rgba(14, 165, 233, 0.1); color: #38bdf8;">
                ${e.category.toUpperCase()}
              </span>
            </div>
          </div>
        `).join("");

        viewport.querySelector("#cal-prev-month").addEventListener("click", () => {
          currentMonth--;
          if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
          }
          drawCalendarGrid();
        });

        viewport.querySelector("#cal-next-month").addEventListener("click", () => {
          currentMonth++;
          if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
          }
          drawCalendarGrid();
        });
      };

      drawCalendarGrid();
    }
  };

  const saveActiveWizardValues = () => {
    const body = document.getElementById("evt-wizard-body");
    if (!body) return;
    const w = state.tempWizardEvent;
    const step = state.eventWizardStep;

    if (step === 1) {
      const name = body.querySelector("#wiz-name")?.value;
      if (name) w.name = name;
      const cat = body.querySelector("#wiz-category")?.value;
      if (cat) w.category = cat;
      const desc = body.querySelector("#wiz-desc")?.value;
      if (desc) w.description = desc;
      const start = body.querySelector("#wiz-start")?.value;
      if (start) w.startDate = start;
    }
    
    else if (step === 2) {
      const vName = body.querySelector("#wiz-vname")?.value;
      if (vName) w.venue.name = vName;
      const vBld = body.querySelector("#wiz-vbuilding")?.value;
      if (vBld) w.venue.building = vBld;
    }

    else if (step === 3) {
      const cgName = body.querySelector("#wiz-cgname")?.value;
      if (cgName) w.chiefGuest.name = cgName;
      const cgOrg = body.querySelector("#wiz-cgorg")?.value;
      if (cgOrg) w.chiefGuest.organization = cgOrg;
    }

    else if (step === 4) {
      const exp = parseInt(body.querySelector("#wiz-bexp")?.value) || 0;
      w.budget.expected = exp;
      w.budget.approved = exp;
      w.budget.actual = exp;
    }
  };

  const drawWizardStep = () => {
    const body = document.getElementById("evt-wizard-body");
    const step = state.eventWizardStep;
    const w = state.tempWizardEvent;

    // Previous/Next footer button toggles
    const prevBtn = document.getElementById("btn-wiz-prev");
    const nextBtn = document.getElementById("btn-wiz-next");
    if (prevBtn) prevBtn.disabled = step === 1;
    if (nextBtn) nextBtn.textContent = step === 5 ? "Publish Event" : "Next";

    if (step === 1) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 1: Basic Event Information</h4>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group">
            <label>Event Title</label>
            <input type="text" class="form-control" id="wiz-name" value="${w.name}" required>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Event Category</label>
              <select class="form-control" id="wiz-category" style="padding:6px;">
                <option value="Workshop" ${w.category === "Workshop" ? "selected" : ""}>Workshop</option>
                <option value="Seminar" ${w.category === "Seminar" ? "selected" : ""}>Seminar</option>
                <option value="Conference" ${w.category === "Conference" ? "selected" : ""}>Conference</option>
                <option value="Guest Lecture" ${w.category === "Guest Lecture" ? "selected" : ""}>Guest Lecture</option>
                <option value="Hackathon" ${w.category === "Hackathon" ? "selected" : ""}>Hackathon</option>
              </select>
            </div>
            <div class="form-group">
              <label>Target Date</label>
              <input type="date" class="form-control" id="wiz-start" value="${w.startDate}">
            </div>
          </div>
          <div class="form-group">
            <label>Description & Scope</label>
            <textarea class="form-control" id="wiz-desc" rows="3" style="font-size:11px;">${w.description}</textarea>
          </div>
        </div>
      `;
    }

    else if (step === 2) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 2: Venue Allocation Details</h4>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group">
            <label>Venue / Hall Name</label>
            <input type="text" class="form-control" id="wiz-vname" value="${w.venue.name || "Dr. A.P.J. Abdul Kalam Auditorium"}" required>
          </div>
          <div class="form-group">
            <label>Building / Block</label>
            <input type="text" class="form-control" id="wiz-vbuilding" value="${w.venue.building || "Academic Block C"}" required>
          </div>
          <div style="display:flex; gap:15px; font-size:11px; margin-top:5px;">
            <label style="cursor:pointer;"><input type="checkbox" checked> Projector Available</label>
            <label style="cursor:pointer;"><input type="checkbox" checked> Wi-Fi Connectivity</label>
          </div>
        </div>
      `;
    }

    else if (step === 3) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 3: Chief Guest & Affiliations</h4>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group">
            <label>Chief Guest Full Name</label>
            <input type="text" class="form-control" id="wiz-cgname" value="${w.chiefGuest.name || ""}" placeholder="Dr. Sundar Pichai">
          </div>
          <div class="form-group">
            <label>Organization / Corporate Body</label>
            <input type="text" class="form-control" id="wiz-cgorg" value="${w.chiefGuest.organization || ""}" placeholder="Google Inc.">
          </div>
        </div>
      `;
    }

    else if (step === 4) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 4: Budget Allocations</h4>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group">
            <label>Expected Budget Expenditures (INR)</label>
            <input type="number" class="form-control" id="wiz-bexp" value="${w.budget.expected || 50000}">
          </div>
          <span style="font-size:10px; color:var(--text-muted);">Allocations require IQAC Admin approval verification audits.</span>
        </div>
      `;
    }

    else if (step === 5) {
      body.innerHTML = `
        <h4 style="font-family:var(--font-title); font-size:12px; font-weight:700; margin-bottom:12px; color:var(--primary); text-transform:uppercase;">Step 5: Review & Publish Event</h4>
        <div style="font-size:11px; line-height:1.6; display:flex; flex-direction:column; gap:10px; background:rgba(255,255,255,0.01); border:1px solid var(--border); padding:15px; border-radius:8px;">
          <div><strong>Event Name:</strong> ${w.name || "[Not Entered]"}</div>
          <div><strong>Category:</strong> ${w.category}</div>
          <div><strong>Allocated Venue:</strong> ${w.venue.name}</div>
          <div><strong>Chief Guest:</strong> ${w.chiefGuest.name} (${w.chiefGuest.organization})</div>
          <div><strong>Expected Budget:</strong> ₹${w.budget.expected.toLocaleString()}</div>
        </div>
      `;
    }
  };

  // Draw frame initial
  drawContainerFrame();
}

// Bind to window to share globally
window.getEventsDb = getEventsDb;
window.saveEventsDb = saveEventsDb;
window.renderAcademicCalendar = renderAcademicCalendar;
