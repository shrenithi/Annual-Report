/**
 * Interactive Department Metrics Comparison matrix.
 * Sequentially structured to support CORS-free file:// execution.
 */

async function renderDepartmentComparison(container) {
  const deps = await window.getDepartments();

  container.innerHTML = `
    <div class="top-nav" style="margin-bottom: 25px;">
      <div class="page-header">
        <h1>${window.t("metricsComparison", state.currentLang)}</h1>
        <p>${window.t("metricsComparisonDesc", state.currentLang)}</p>
      </div>
    </div>

    <!-- Select checkboxes row -->
    <div class="glass-card" style="padding: 20px; border-radius: 12px; margin-bottom: 25px;">
      <h3 style="font-family: var(--font-title); font-size: 13px; font-weight:600; margin-bottom: 12px;">${window.t("selectDeps", state.currentLang)}</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 15px;">
        ${deps.map(d => `
          <label style="cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px;">
            <input type="checkbox" class="comp-selector-chk" value="${d.id}" checked>
            <span>${d.name}</span>
          </label>
        `).join("")}
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 25px;">
      <!-- Comparison Table Card -->
      <div class="glass-card" style="padding: 25px; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;" id="comparison-data-table">
          <!-- Loaded dynamically -->
        </table>
      </div>

      <!-- Comparative Charts Side-by-Side Panel -->
      <div style="display: flex; flex-direction: column; gap: 25px;">
        <!-- Comparison Chart Card 1 -->
        <div class="glass-card" style="padding: 25px; height: 210px; display: flex; flex-direction: column;">
          <h3 style="font-family: var(--font-title); font-size: 12px; font-weight: 600; margin-bottom: 10px; text-transform: uppercase;">${window.t("grantsFundingComp", state.currentLang)}</h3>
          <div style="flex-grow: 1; position: relative;">
            <canvas id="compChartCanvas"></canvas>
          </div>
        </div>

        <!-- Comparison Chart Card 2 -->
        <div class="glass-card" style="padding: 25px; height: 210px; display: flex; flex-direction: column;">
          <h3 style="font-family: var(--font-title); font-size: 12px; font-weight: 600; margin-bottom: 10px; text-transform: uppercase;">${window.t("semesterPassRateLabel", state.currentLang)}</h3>
          <div style="flex-grow: 1; position: relative;">
            <canvas id="compSemesterChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Approvals flow comparison -->
    <div class="glass-card" style="padding: 25px; margin-top: 25px; text-align: left;" id="workflow-comparison-flowpath-card">
      <!-- Loaded dynamically -->
    </div>

    <!-- Semester Results & Arrear Audits -->
    <div class="glass-card" style="padding: 25px; margin-top: 25px; text-align: left;" id="semester-results-arrears-card">
      <!-- Loaded dynamically -->
    </div>
  `;

  let comparisonChartInstance = null;
  let comparisonSemesterChartInstance = null;

  const rebuildComparison = () => {
    const selectedIds = Array.from(container.querySelectorAll(".comp-selector-chk:checked")).map(c => c.value);
    const selectedDeps = deps.filter(d => selectedIds.includes(d.id));

    // Draw Table
    const table = container.querySelector("#comparison-data-table");
    if (selectedDeps.length === 0) {
      table.innerHTML = `<tr><td style="padding: 20px; text-align: center; color: var(--text-muted);">No departments selected.</td></tr>`;
      if (comparisonChartInstance) {
        comparisonChartInstance.destroy();
        comparisonChartInstance = null;
      }
      if (comparisonSemesterChartInstance) {
        comparisonSemesterChartInstance.destroy();
        comparisonSemesterChartInstance = null;
      }
      return;
    }

    table.innerHTML = `
      <thead>
        <tr style="border-bottom: 1px solid var(--border);">
          <th style="padding: 10px; font-weight: 600; color: var(--text-muted);">Metric / Parameter</th>
          ${selectedDeps.map(d => `<th style="padding: 10px; font-weight: 700; color: var(--primary); font-family: var(--font-title);">${d.id.toUpperCase()}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px dashed var(--border);">
          <td style="padding: 12px; font-weight: 600;">Faculty Count</td>
          ${selectedDeps.map(d => `<td style="padding: 12px;">${d.facultyCount}</td>`).join("")}
        </tr>
        <tr style="border-bottom: 1px dashed var(--border);">
          <td style="padding: 12px; font-weight: 600;">Student Strength</td>
          ${selectedDeps.map(d => `<td style="padding: 12px;">${d.studentCount}</td>`).join("")}
        </tr>
        <tr style="border-bottom: 1px dashed var(--border);">
          <td style="padding: 12px; font-weight: 600;">Research Papers</td>
          ${selectedDeps.map(d => `<td style="padding: 12px;">${d.metrics?.publications?.length || 0}</td>`).join("")}
        </tr>
        <tr style="border-bottom: 1px dashed var(--border);">
          <td style="padding: 12px; font-weight: 600;">Grants Value (INR)</td>
          ${selectedDeps.map(d => {
            const sum = (d.metrics?.grants || []).reduce((acc, curr) => acc + curr.amount, 0);
            return `<td style="padding: 12px; font-weight:600; color:var(--success);">₹${sum.toLocaleString()}</td>`;
          }).join("")}
        </tr>
        <tr style="border-bottom: 1px dashed var(--border);">
          <td style="padding: 12px; font-weight: 600;">Placements logged</td>
          ${selectedDeps.map(d => `<td style="padding: 12px;">${d.metrics?.placements?.length || 0}</td>`).join("")}
        </tr>
        <tr style="border-bottom: 1px dashed var(--border);">
          <td style="padding: 12px; font-weight: 600;">Patents filed</td>
          ${selectedDeps.map(d => `<td style="padding: 12px;">${d.metrics?.patents?.length || 0}</td>`).join("")}
        </tr>
        <tr style="border-bottom: 1px dashed var(--border);">
          <td style="padding: 12px; font-weight: 600;">Semester Pass Rate</td>
          ${selectedDeps.map(d => {
            const pass = d.metrics?.studentPerformance?.passPercentage || (d.id === "cse" ? 96.2 : (d.id === "ece" ? 92.4 : (d.id === "me" ? 88.5 : 90.0)));
            return `<td style="padding: 12px; font-weight:bold; color:var(--primary);">${pass}%</td>`;
          }).join("")}
        </tr>
        <tr style="border-bottom: 1px solid var(--border);">
          <td style="padding: 12px; font-weight: 600;">Workflow status</td>
          ${selectedDeps.map(d => `<td style="padding: 12px;">${window.getStatusBadgeHtml(d.status)}</td>`).join("")}
        </tr>
      </tbody>
    `;

    // Draw Flowchart Timeline comparing selected departments
    const flowContainer = container.querySelector("#workflow-comparison-flowpath-card");
    if (flowContainer) {
      const stages = ["Draft", "Submitted", "Under Review", "Approved"];
      flowContainer.innerHTML = `
        <h3 style="font-family: var(--font-title); font-size: 14px; font-weight: 600; margin-bottom: 20px;">${window.t("flowpathsComp", state.currentLang)}</h3>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${selectedDeps.map(d => {
            const currentIdx = stages.indexOf(d.status);
            return `
              <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
                <div style="width: 140px; font-weight: bold; font-family: var(--font-title); text-transform: uppercase; color: var(--primary); font-size: 11px;">
                  ${d.name} (${d.id.toUpperCase()})
                </div>
                <div style="display: flex; align-items: center; gap: 8px; flex-grow: 1;">
                  ${stages.map((st, idx) => {
                    const isCompleted = idx <= currentIdx;
                    const isActive = idx === currentIdx;
                    const circleColor = isActive ? "var(--primary)" : (isCompleted ? "var(--success)" : "rgba(255,255,255,0.05)");
                    const textColor = isCompleted ? "var(--text-main)" : "var(--text-muted)";
                    const connectorColor = idx < currentIdx ? "var(--success)" : "rgba(255,255,255,0.05)";
                    return `
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.01); border: 1px solid var(--border); padding: 4px 10px; border-radius: 999px; font-size: 10px;">
                          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${circleColor}; display: inline-block;"></span>
                          <span style="color: ${textColor}; font-weight: ${isActive ? "bold" : "normal"}">${st}</span>
                        </div>
                        ${idx < stages.length - 1 ? `<span style="color: ${connectorColor}; font-size: 12px;">➔</span>` : ""}
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    // Draw Semester Results & Arrears Analysis Card
    const arrearsContainer = container.querySelector("#semester-results-arrears-card");
    if (arrearsContainer) {
      const arrearData = {
        cse: {
          pass: 96.2,
          totalArrears: 12,
          subjects: [
            { code: "CS8401", name: "Database Management Systems", count: 5 },
            { code: "CS8402", name: "Operating Systems", count: 4 },
            { code: "CS8403", name: "Design & Analysis of Algorithms", count: 3 }
          ]
        },
        ece: {
          pass: 92.4,
          totalArrears: 18,
          subjects: [
            { code: "EC8502", name: "Digital Communication", count: 8 },
            { code: "EC8503", name: "Transmission Lines & Waveguides", count: 6 },
            { code: "EC8504", name: "Microprocessors & Microcontrollers", count: 4 }
          ]
        },
        me: {
          pass: 88.5,
          totalArrears: 24,
          subjects: [
            { code: "ME8601", name: "Design of Transmission Systems", count: 12 },
            { code: "ME8602", name: "Heat & Mass Transfer", count: 8 },
            { code: "ME8603", name: "Finite Element Analysis", count: 4 }
          ]
        },
        civil: {
          pass: 90.0,
          totalArrears: 15,
          subjects: [
            { code: "CE8702", name: "Structural Analysis II", count: 7 },
            { code: "CE8703", name: "Design of Reinforced Concrete", count: 5 },
            { code: "CE8704", name: "Environmental Engineering", count: 3 }
          ]
        },
        phy: {
          pass: 94.2,
          totalArrears: 4,
          subjects: [
            { code: "PH8201", name: "Solid State Physics", count: 3 },
            { code: "PH8202", name: "Electromagnetism", count: 1 }
          ]
        }
      };

      // Determine which selected department has the highest arrears
      let maxArrearsDept = null;
      let maxArrearsCount = -1;
      selectedDeps.forEach(d => {
        const data = arrearData[d.id] || { totalArrears: 0 };
        if (data.totalArrears > maxArrearsCount) {
          maxArrearsCount = data.totalArrears;
          maxArrearsDept = d;
        }
      });

      arrearsContainer.innerHTML = `
        <h3 style="font-family: var(--font-title); font-size: 14px; font-weight: 600; margin-bottom: 15px; border-bottom: 1px solid var(--border); padding-bottom: 8px; text-transform: uppercase;">
          ${window.t("resultsArrearsMatrix", state.currentLang)}
        </h3>
        
        <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 20px;">
          <!-- Left: Table of Arrears & Subjects -->
          <div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border); color: var(--text-muted);">
                  <th style="padding: 8px 4px;">Department</th>
                  <th style="padding: 8px 4px;">Pass Rate</th>
                  <th style="padding: 8px 4px;">Total Arrears</th>
                  <th style="padding: 8px 4px;">Subject Arrears Count Breakdown</th>
                </tr>
              </thead>
              <tbody>
                ${selectedDeps.map(d => {
                  const data = arrearData[d.id] || { pass: 90, totalArrears: 0, subjects: [] };
                  return `
                    <tr style="border-bottom: 1px dashed var(--border);">
                      <td style="padding: 10px 4px; font-weight: bold; text-transform: uppercase;">${d.id}</td>
                      <td style="padding: 10px 4px; color: var(--success); font-weight: bold;">${data.pass}%</td>
                      <td style="padding: 10px 4px; font-weight: bold; color: ${data.totalArrears > 15 ? "var(--danger)" : "var(--text-main)"}">${data.totalArrears}</td>
                      <td style="padding: 10px 4px;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                          ${data.subjects.map(s => `
                            <span style="font-size: 10px; color: var(--text-muted);">
                              &bull; <strong>${s.code}</strong> (${s.name}): <strong style="color: var(--primary);">${s.count} students</strong>
                            </span>
                          `).join("")}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>

          <!-- Right: Insights Audit Card -->
          <div style="display: flex; flex-direction: column; gap: 15px;">
            ${maxArrearsDept ? `
              <div class="glass-card" style="padding: 15px; border-left: 4px solid var(--danger); background: rgba(239, 68, 68, 0.03); border-radius: 8px;">
                <h4 style="font-family: var(--font-title); font-size: 11px; font-weight: 700; color: var(--danger); text-transform: uppercase; margin: 0 0 6px 0;">⚠️ Critical Arrears Alert</h4>
                <p style="font-size: 10px; color: var(--text-muted); margin: 0; line-height: 1.4;">
                  <strong>${maxArrearsDept.name} (${maxArrearsDept.id.toUpperCase()})</strong> has the highest number of arrears at **${maxArrearsCount} total**. The primary academic bottleneck is subject **${arrearData[maxArrearsDept.id].subjects[0].code}** with **${arrearData[maxArrearsDept.id].subjects[0].count} students** failing to clear. Immediate remedial coaching sessions are recommended.
                </p>
              </div>
            ` : ""}
            
            <div class="glass-card" style="padding: 15px; border-left: 4px solid var(--success); background: rgba(16, 185, 129, 0.03); border-radius: 8px;">
              <h4 style="font-family: var(--font-title); font-size: 11px; font-weight: 700; color: var(--success); text-transform: uppercase; margin: 0 0 6px 0;">💡 Actionable Insights</h4>
              <p style="font-size: 10px; color: var(--text-muted); margin: 0; line-height: 1.4;">
                Remedial classes scheduled during Saturdays for subjects with > 5 student arrears will sync with the Academic Calendar.
              </p>
            </div>
          </div>
        </div>
      `;
    }

    // Draw Chart
    if (typeof Chart === "undefined") {
      console.warn("Chart.js not loaded. Skipping comparative chart.");
      return;
    }

    // 1. Grants Funding Chart
    const ctx = container.querySelector("#compChartCanvas").getContext("2d");
    if (comparisonChartInstance) comparisonChartInstance.destroy();

    const chartData = {
      labels: selectedDeps.map(d => d.id.toUpperCase()),
      datasets: [{
        label: "Funding (Lakhs)",
        data: selectedDeps.map(d => ((d.metrics?.grants || []).reduce((acc, curr) => acc + curr.amount, 0)) / 100000),
        backgroundColor: [
          "rgba(14, 165, 233, 0.4)",
          "rgba(168, 85, 247, 0.4)",
          "rgba(16, 185, 129, 0.4)",
          "rgba(245, 158, 11, 0.4)"
        ],
        borderColor: [
          "#0ea5e9",
          "#a855f7",
          "#10b981",
          "#f59e0b"
        ],
        borderWidth: 1.5,
        borderRadius: 6
      }]
    };

    comparisonChartInstance = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "#94a3b8" }
          },
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8" }
          }
        }
      }
    });

    // 2. Semester Pass Rate Chart
    const ctxSemester = container.querySelector("#compSemesterChartCanvas").getContext("2d");
    if (comparisonSemesterChartInstance) comparisonSemesterChartInstance.destroy();

    const semesterChartData = {
      labels: selectedDeps.map(d => d.id.toUpperCase()),
      datasets: [{
        label: "Pass Percentage",
        data: selectedDeps.map(d => d.metrics?.studentPerformance?.passPercentage || (d.id === "cse" ? 96.2 : (d.id === "ece" ? 92.4 : (d.id === "me" ? 88.5 : 90.0)))),
        backgroundColor: [
          "rgba(16, 185, 129, 0.4)",
          "rgba(14, 165, 233, 0.4)",
          "rgba(245, 158, 11, 0.4)",
          "rgba(168, 85, 247, 0.4)"
        ],
        borderColor: [
          "#10b981",
          "#0ea5e9",
          "#f59e0b",
          "#a855f7"
        ],
        borderWidth: 1.5,
        borderRadius: 6
      }]
    };

    comparisonSemesterChartInstance = new Chart(ctxSemester, {
      type: "bar",
      data: semesterChartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "#94a3b8" },
            min: 50,
            max: 100
          },
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8" }
          }
        }
      }
    });
  };

  rebuildComparison();

  container.querySelectorAll(".comp-selector-chk").forEach(c => {
    c.addEventListener("change", rebuildComparison);
  });
}

// Bind to window to share globally
window.renderDepartmentComparison = renderDepartmentComparison;
