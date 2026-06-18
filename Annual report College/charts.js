/**
 * Handles initialization and updating of dashboard charts using Chart.js.
 * Attached to window.PortalCharts to run locally under file:// protocol.
 */
(function() {
  let activeCharts = {};

  function createBarGradient(ctx, startColor, endColor) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
  }

  function renderFallbackCharts() {
    const targets = ["publicationsChart", "shareChart", "placementsChart"];
    targets.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.parentNode) {
        el.parentNode.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; color: var(--text-muted); font-size: 12px; padding: 20px; font-family: var(--font-title);">
            <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; stroke: currentColor; fill: none; stroke-width: 2; margin-bottom: 8px; opacity: 0.3;" width="24" height="24">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Visualization requires internet connection to fetch Chart.js.</span>
          </div>
        `;
      }
    });
  }

  window.PortalCharts = {
    renderDashboardCharts: function(departments, isDarkMode = true) {
      if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded. Rendering fallback widgets.");
        renderFallbackCharts();
        return;
      }
      const textColor = isDarkMode ? "#94a3b8" : "#475569";
      const gridColor = isDarkMode ? "rgba(148, 163, 184, 0.08)" : "rgba(71, 85, 105, 0.08)";

      // Clean up existing chart instances to prevent canvas ghosting
      this.destroyCharts();

      // 1. Publications and Grants Comparison Chart
      const pubCtx = document.getElementById("publicationsChart")?.getContext("2d");
      if (pubCtx) {
        const labels = departments.map(d => d.name.replace("Department of ", "").replace("School of ", ""));
        const pubData = departments.map(d => d.metrics?.publications?.length || 0);
        const grantData = departments.map(d => (d.metrics?.grants || []).reduce((acc, curr) => acc + curr.amount, 0) / 100000); // in Lakhs

        const gradPub = createBarGradient(pubCtx, "rgba(56, 189, 248, 0.85)", "rgba(14, 165, 233, 0.2)");
        const gradGrant = createBarGradient(pubCtx, "rgba(168, 85, 247, 0.85)", "rgba(126, 34, 206, 0.2)");

        activeCharts.pubChart = new Chart(pubCtx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Publications Count",
                data: pubData,
                backgroundColor: gradPub,
                borderColor: "rgba(56, 189, 248, 1)",
                borderWidth: 1.5,
                borderRadius: 6,
                yAxisID: "y-pubs"
              },
              {
                label: "Grants (Lakh ₹)",
                data: grantData.map(val => val * 10), // Scale to Lakhs (1 Lakh = 100,000)
                backgroundColor: gradGrant,
                borderColor: "rgba(168, 85, 247, 1)",
                borderWidth: 1.5,
                borderRadius: 6,
                yAxisID: "y-grants"
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: { color: textColor, font: { family: "Outfit" } }
              },
              tooltip: {
                padding: 12,
                backgroundColor: isDarkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)",
                titleColor: isDarkMode ? "#f8fafc" : "#0f172a",
                bodyColor: isDarkMode ? "#cbd5e1" : "#334155",
                borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                borderWidth: 1,
                titleFont: { family: "Outfit", weight: "bold" },
                bodyFont: { family: "Inter" }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: textColor, font: { family: "Outfit", size: 11 } }
              },
              "y-pubs": {
                type: "linear",
                position: "left",
                grid: { color: gridColor },
                ticks: { color: textColor },
                title: { display: true, text: "Publications", color: textColor, font: { family: "Outfit" } }
              },
              "y-grants": {
                type: "linear",
                position: "right",
                grid: { drawOnChartArea: false },
                ticks: { color: textColor },
                title: { display: true, text: "Funding (Lakh ₹)", color: textColor, font: { family: "Outfit" } }
              }
            }
          }
        });
      }

      // 2. Student Placement Success Chart
      const placementCtx = document.getElementById("placementsChart")?.getContext("2d");
      if (placementCtx) {
        const labels = departments.map(d => d.name.replace("Department of ", "").replace("School of ", ""));
        
        const totalPlaced = departments.map(d => (d.metrics?.placements || []).reduce((acc, curr) => acc + curr.studentsPlaced, 0));
        const avgPackage = departments.map(d => {
          const placements = d.metrics?.placements || [];
          if (placements.length === 0) return 0;
          const totalP = placements.reduce((acc, curr) => acc + curr.studentsPlaced, 0);
          if (totalP === 0) return 0;
          const weightedSum = placements.reduce((acc, curr) => acc + (curr.packageLpa * curr.studentsPlaced), 0);
          return parseFloat((weightedSum / totalP).toFixed(1));
        });

        const gradPlaced = createBarGradient(placementCtx, "rgba(20, 184, 166, 0.85)", "rgba(13, 148, 136, 0.2)");

        activeCharts.placementChart = new Chart(placementCtx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Avg Package (LPA)",
                data: avgPackage,
                borderColor: "rgba(244, 63, 94, 1)",
                backgroundColor: "rgba(244, 63, 94, 0.1)",
                borderWidth: 3,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: "rgba(244, 63, 94, 1)",
                pointRadius: 4,
                type: "line"
              },
              {
                label: "Students Placed",
                data: totalPlaced,
                backgroundColor: gradPlaced,
                borderColor: "rgba(20, 184, 166, 1)",
                borderWidth: 1.5,
                borderRadius: 4,
                type: "bar"
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: { color: textColor, font: { family: "Outfit" } }
              },
              tooltip: {
                padding: 12,
                backgroundColor: isDarkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)",
                titleColor: isDarkMode ? "#f8fafc" : "#0f172a",
                bodyColor: isDarkMode ? "#cbd5e1" : "#334155",
                borderWidth: 1,
                borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: textColor, font: { family: "Outfit", size: 11 } }
              },
              y: {
                grid: { color: gridColor },
                ticks: { color: textColor }
              }
            }
          }
        });
      }

      // 3. Department Contribution Doughnut Chart
      const shareCtx = document.getElementById("shareChart")?.getContext("2d");
      if (shareCtx) {
        const labels = departments.map(d => d.name.replace("Department of ", "").replace("School of ", ""));
        const dataVals = departments.map(d => {
          const pubs = d.metrics?.publications?.length || 0;
          const events = d.metrics?.events?.length || 0;
          const achievements = d.metrics?.achievements?.length || 0;
          return pubs + events + achievements;
        });

        const backgroundColors = [
          "rgba(14, 165, 233, 0.8)",  // Sky
          "rgba(168, 85, 247, 0.8)",  // Purple
          "rgba(20, 184, 166, 0.8)",  // Teal
          "rgba(244, 63, 94, 0.8)",   // Rose
          "rgba(234, 179, 8, 0.8)"    // Yellow
        ];

        activeCharts.shareChart = new Chart(shareCtx, {
          type: "doughnut",
          data: {
            labels: labels,
            datasets: [{
              data: dataVals,
              backgroundColor: backgroundColors,
              borderColor: isDarkMode ? "#1e293b" : "#ffffff",
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: { color: textColor, font: { family: "Outfit", size: 11 } }
              },
              tooltip: {
                padding: 12,
                backgroundColor: isDarkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)",
                titleColor: isDarkMode ? "#f8fafc" : "#0f172a",
                bodyColor: isDarkMode ? "#cbd5e1" : "#334155"
              }
            },
            cutout: "70%"
          }
        });
      }
    },

    destroyCharts: function() {
      Object.keys(activeCharts).forEach(key => {
        if (activeCharts[key]) {
          activeCharts[key].destroy();
          activeCharts[key] = null;
        }
      });
      activeCharts = {};
    }
  };
})();
