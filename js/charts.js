/**
 * Main dashboard Chart.js configurations compiler.
 * Sequentially structured to support CORS-free file:// execution.
 */

let publicationsChartInstance = null;
let shareChartInstance = null;
let placementsChartInstance = null;
let placementTrendChartInstance = null;
let fundingChartInstance = null;
let statusChartInstance = null;

function destroyCharts() {
  if (typeof Chart === "undefined") return;
  if (publicationsChartInstance) { publicationsChartInstance.destroy(); publicationsChartInstance = null; }
  if (shareChartInstance) { shareChartInstance.destroy(); shareChartInstance = null; }
  if (placementsChartInstance) { placementsChartInstance.destroy(); placementsChartInstance = null; }
  if (placementTrendChartInstance) { placementTrendChartInstance.destroy(); placementTrendChartInstance = null; }
  if (fundingChartInstance) { fundingChartInstance.destroy(); fundingChartInstance = null; }
  if (statusChartInstance) { statusChartInstance.destroy(); statusChartInstance = null; }
}

function renderDashboardCharts(deps, isDarkMode = true, activeTab = "research") {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js not loaded. Skipping chart rendering.");
    return;
  }
  destroyCharts();

  const primaryColor = "#0ea5e9";
  const secondaryColor = "#a855f7";
  const successColor = "#10b981";
  const warningColor = "#f59e0b";
  const gridColor = "rgba(255, 255, 255, 0.05)";
  const textColor = "#94a3b8";

  // Tab 1: Research & Publications
  if (activeTab === "research") {
    const ctx1 = document.getElementById("publicationsChart")?.getContext("2d");
    if (ctx1) {
      publicationsChartInstance = new Chart(ctx1, {
        type: "bar",
        data: {
          labels: deps.map(d => d.id.toUpperCase()),
          datasets: [
            {
              label: "Publications logged",
              data: deps.map(d => d.metrics?.publications?.length || 0),
              backgroundColor: "rgba(14, 165, 233, 0.4)",
              borderColor: primaryColor,
              borderWidth: 1.5,
              borderRadius: 4
            },
            {
              label: "Citations count (x10)",
              data: deps.map(d => {
                const c = (d.metrics?.publications || []).reduce((acc, curr) => acc + curr.citations, 0);
                return c / 10;
              }),
              type: "line",
              borderColor: secondaryColor,
              backgroundColor: "transparent",
              borderWidth: 2,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { color: textColor, font: { family: "Outfit" } } }
          },
          scales: {
            y: { grid: { color: gridColor }, ticks: { color: textColor } },
            x: { grid: { display: false }, ticks: { color: textColor } }
          }
        }
      });
    }

    const ctx2 = document.getElementById("shareChart")?.getContext("2d");
    if (ctx2) {
      const totalFaculty = deps.reduce((s, d) => s + d.facultyCount, 0);
      shareChartInstance = new Chart(ctx2, {
        type: "doughnut",
        data: {
          labels: deps.map(d => d.id.toUpperCase()),
          datasets: [{
            data: deps.map(d => Math.round((d.facultyCount / totalFaculty) * 100)),
            backgroundColor: [
              "rgba(14, 165, 233, 0.5)",
              "rgba(168, 85, 247, 0.5)",
              "rgba(16, 185, 129, 0.5)",
              "rgba(245, 158, 11, 0.5)"
            ],
            borderColor: "rgba(255, 255, 255, 0.05)",
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "right", labels: { color: textColor } }
          }
        }
      });
    }
  }

  // Tab 2: Career Placements
  else if (activeTab === "placements") {
    const ctx3 = document.getElementById("placementsChart")?.getContext("2d");
    if (ctx3) {
      placementsChartInstance = new Chart(ctx3, {
        type: "bar",
        data: {
          labels: deps.map(d => d.id.toUpperCase()),
          datasets: [{
            label: "Average Package (LPA)",
            data: deps.map(d => {
              const list = d.metrics?.placements || [];
              if (list.length === 0) return 0;
              const sum = list.reduce((acc, curr) => acc + curr.packageLpa, 0);
              return parseFloat((sum / list.length).toFixed(1));
            }),
            backgroundColor: "rgba(16, 185, 129, 0.4)",
            borderColor: successColor,
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor } },
            y: { grid: { display: false }, ticks: { color: textColor } }
          }
        }
      });
    }

    const ctx4 = document.getElementById("placementTrendChart")?.getContext("2d");
    if (ctx4) {
      placementTrendChartInstance = new Chart(ctx4, {
        type: "line",
        data: {
          labels: deps.map(d => d.id.toUpperCase()),
          datasets: [{
            label: "Hired Students Count",
            data: deps.map(d => (d.metrics?.placements || []).reduce((acc, curr) => acc + curr.studentsPlaced, 0)),
            borderColor: primaryColor,
            backgroundColor: "rgba(14, 165, 233, 0.1)",
            fill: true,
            tension: 0.3,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: gridColor }, ticks: { color: textColor } },
            x: { grid: { display: false }, ticks: { color: textColor } }
          }
        }
      });
    }
  }

  // Tab 3: Funding & Accreditations
  else if (activeTab === "funding") {
    const ctx5 = document.getElementById("fundingChart")?.getContext("2d");
    if (ctx5) {
      fundingChartInstance = new Chart(ctx5, {
        type: "radar",
        data: {
          labels: deps.map(d => d.id.toUpperCase()),
          datasets: [{
            label: "Sponsored Grants (Lakhs)",
            data: deps.map(d => {
              const sum = (d.metrics?.grants || []).reduce((acc, curr) => acc + curr.amount, 0);
              return sum / 100000;
            }),
            backgroundColor: "rgba(168, 85, 247, 0.15)",
            borderColor: secondaryColor,
            pointBackgroundColor: secondaryColor,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              grid: { color: "rgba(255,255,255,0.08)" },
              angleLines: { color: "rgba(255,255,255,0.08)" },
              pointLabels: { color: textColor },
              ticks: { display: false }
            }
          }
        }
      });
    }

    const ctx6 = document.getElementById("statusChart")?.getContext("2d");
    if (ctx6) {
      statusChartInstance = new Chart(ctx6, {
        type: "pie",
        data: {
          labels: ["Approved", "Submitted", "Under Review", "Draft"],
          datasets: [{
            data: [
              deps.filter(d => d.status === "Approved").length,
              deps.filter(d => d.status === "Submitted").length,
              deps.filter(d => d.status === "Under Review").length,
              deps.filter(d => d.status === "Draft" || d.status === "Rejected").length
            ],
            backgroundColor: [successColor, primaryColor, warningColor, "rgba(255,255,255,0.1)"],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "right", labels: { color: textColor } }
          }
        }
      });
    }
  }
}

// Bind to window to share globally
window.destroyCharts = destroyCharts;
window.renderDashboardCharts = renderDashboardCharts;
