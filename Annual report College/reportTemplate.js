/**
 * Handles compilation, configuration, and rendering of the Annual Report templates.
 * Attached to window.PortalTemplates to run locally under file:// protocol.
 */
(function() {
  const REPORT_THEMES = {
    academic: {
      name: "Academic Classic",
      fontFamily: "'Playfair Display', Georgia, serif",
      primaryColor: "#1e3a8a", // Deep Navy
      secondaryColor: "#b45309", // Warm Amber
      accentColor: "#0f172a",
      bodyFont: "'Merriweather', 'Times New Roman', serif",
      cardBg: "#f8fafc",
      borderColor: "#e2e8f0"
    },
    corporate: {
      name: "Modern Corporate",
      fontFamily: "'Outfit', 'Inter', sans-serif",
      primaryColor: "#0d9488", // Teal
      secondaryColor: "#0f172a", // Slate
      accentColor: "#f43f5e", // Rose
      bodyFont: "'Inter', sans-serif",
      cardBg: "#ffffff",
      borderColor: "#e2e8f0"
    },
    minimal: {
      name: "Minimalist Tech",
      fontFamily: "'Courier New', Courier, monospace",
      primaryColor: "#111827", // Charcoal
      secondaryColor: "#4b5563", // Gray
      accentColor: "#2563eb", // Royal Blue
      bodyFont: "'Outfit', sans-serif",
      cardBg: "#fafafa",
      borderColor: "#e5e7eb"
    }
  };

  window.PortalTemplates = {
    REPORT_THEMES,
    
    compileReport: function(departments, config) {
      const theme = REPORT_THEMES[config.theme] || REPORT_THEMES.corporate;
      const activeDeps = departments.filter(dep => {
        if (config.selectedDepartments && !config.selectedDepartments.includes(dep.id)) {
          return false;
        }
        if (!config.includePending && dep.status !== "Approved") {
          return false;
        }
        return true;
      });

      let totalPublications = 0;
      let totalGrants = 0;
      let totalStudentsPlaced = 0;
      let totalEvents = 0;
      let totalFaculty = 0;

      activeDeps.forEach(dep => {
        totalFaculty += dep.facultyCount || 0;
        if (dep.metrics) {
          totalPublications += (dep.metrics.publications || []).length;
          totalGrants += (dep.metrics.grants || []).reduce((acc, curr) => acc + curr.amount, 0);
          totalStudentsPlaced += (dep.metrics.placements || []).reduce((acc, curr) => acc + curr.studentsPlaced, 0);
          totalEvents += (dep.metrics.events || []).length;
        }
      });

      const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0
        }).format(val);
      };

      let tocHtml = "";
      if (config.sections.toc) {
        tocHtml = `
          <div class="page-break section-toc">
            <h2>Table of Contents</h2>
            <ul class="toc-list">
              ${config.sections.executiveSummary ? '<li><a href="#executive-summary">1. Executive Summary</a></li>' : ''}
              <li><a href="#departmental-reports">2. Departmental Reports</a></li>
              ${activeDeps.map((dep, idx) => `
                <li class="toc-sub"><a href="#dep-${dep.id}">2.${idx + 1} ${dep.name}</a></li>
              `).join("")}
            </ul>
          </div>
        `;
      }

      let execSummaryHtml = "";
      if (config.sections.executiveSummary) {
        execSummaryHtml = `
          <div class="page-break" id="executive-summary">
            <h2>1. Executive Summary</h2>
            <p class="intro-paragraph">
              This comprehensive annual report details the academic, research, and placement achievements of the institute's participating departments. 
              Through collaborative efforts, faculty excellence, and student dedication, we continue to push the boundaries of higher education and impactful research.
            </p>
            
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Total Faculty</h3>
                <div class="summary-value">${totalFaculty}</div>
                <p>Active teaching & research staff</p>
              </div>
              <div class="summary-card">
                <h3>Publications</h3>
                <div class="summary-value">${totalPublications}</div>
                <p>Academic & peer-reviewed papers</p>
              </div>
              <div class="summary-card">
                <h3>Research Funding</h3>
                <div class="summary-value">${formatCurrency(totalGrants)}</div>
                <p>Total active research grants</p>
              </div>
              <div class="summary-card">
                <h3>Students Placed</h3>
                <div class="summary-value">${totalStudentsPlaced}</div>
                <p>Successful campus placements</p>
              </div>
            </div>

            <div class="charts-row">
              <div class="chart-container-dummy">
                <h4>Publications Contribution by Department</h4>
                <div class="mini-bar-chart">
                  ${activeDeps.map(dep => {
                    const count = (dep.metrics.publications || []).length;
                    const pct = totalPublications > 0 ? (count / totalPublications) * 100 : 0;
                    return `
                      <div class="bar-row">
                        <span class="bar-label">${dep.name}</span>
                        <div class="bar-track">
                          <div class="bar-fill" style="width: ${pct}%"></div>
                        </div>
                        <span class="bar-val">${count}</span>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            </div>
          </div>
        `;
      }

      const departmentsHtml = activeDeps.map((dep, depIdx) => {
        const pubList = (dep.metrics.publications || []).map(pub => `
          <li class="publication-item">
            <strong>${pub.title}</strong><br>
            <span class="pub-details">${pub.authors} &mdash; <em>${pub.venue}</em> (${pub.year}) &bull; Citations: ${pub.citations}</span>
          </li>
        `).join("");

        const grantList = (dep.metrics.grants || []).map(grant => `
          <tr>
            <td>${grant.title}</td>
            <td>${grant.agency}</td>
            <td>${formatCurrency(grant.amount)}</td>
            <td>${grant.duration}</td>
            <td><span class="badge ${grant.status.toLowerCase()}">${grant.status}</span></td>
          </tr>
        `).join("");

        const placementList = (dep.metrics.placements || []).map(pl => `
          <div class="placement-pill">
            <strong>${pl.company}</strong>: ${pl.studentsPlaced} students (${pl.packageLpa} LPA Avg)
          </div>
        `).join("");

        const eventList = (dep.metrics.events || []).map(ev => `
          <div class="event-item">
            <div class="event-meta"><strong>${ev.name}</strong> (${ev.type})</div>
            <div class="event-details">Date: ${ev.date} &bull; Attendees: ${ev.attendees}</div>
          </div>
        `).join("");

        const achievementList = (dep.metrics.achievements || []).map(ac => `
          <div class="achievement-item">
            <strong>[${ac.category}]</strong> ${ac.detail} &mdash; <em>${ac.recipient}</em>
          </div>
        `).join("");

        return `
          <div class="page-break department-section" id="dep-${dep.id}">
            <h3>2.${depIdx + 1} ${dep.name}</h3>
            <div class="dep-header-meta">
              <strong>Head of Department:</strong> ${dep.head} &nbsp;|&nbsp; 
              <strong>Faculty:</strong> ${dep.facultyCount} &nbsp;|&nbsp; 
              <strong>Students:</strong> ${dep.studentCount}
            </div>

            ${config.sections.publications && pubList.length > 0 ? `
              <div class="sub-section">
                <h4>Research & Publications</h4>
                <ul class="publications-list">${pubList}</ul>
              </div>
            ` : ""}

            ${config.sections.grants && grantList.length > 0 ? `
              <div class="sub-section">
                <h4>Research Grants & Funding</h4>
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>Project Title</th>
                      <th>Funding Agency</th>
                      <th>Amount</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${grantList}
                  </tbody>
                </table>
              </div>
            ` : ""}

            ${config.sections.placements && placementList.length > 0 ? `
              <div class="sub-section">
                <h4>Student Placements & Careers</h4>
                <div class="placements-container">${placementList}</div>
              </div>
            ` : ""}

            ${config.sections.events && eventList.length > 0 ? `
              <div class="sub-section">
                <h4>Events, Seminars & Workshops</h4>
                <div class="events-container">${eventList}</div>
              </div>
            ` : ""}

            ${config.sections.achievements && achievementList.length > 0 ? `
              <div class="sub-section">
                <h4>Notable Achievements & Awards</h4>
                <div class="achievements-container">${achievementList}</div>
              </div>
            ` : ""}
          </div>
        `;
      }).join("");

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${config.title} - ${config.academicYear}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;1,300&display=swap');

    :root {
      --primary: ${theme.primaryColor};
      --secondary: ${theme.secondaryColor};
      --accent: ${theme.accentColor};
      --font-title: ${theme.fontFamily};
      --font-body: ${theme.bodyFont};
      --card-bg: ${theme.cardBg};
      --border-color: ${theme.borderColor};
    }

    body {
      font-family: var(--font-body);
      color: #334155;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    @page {
      size: A4;
      margin: 20mm;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .page-break:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 257mm;
      padding: 10mm 5mm;
      box-sizing: border-box;
    }

    .cover-header {
      border-bottom: 2px solid var(--primary);
      padding-bottom: 10px;
    }

    .cover-header h4 {
      margin: 0;
      font-family: 'Outfit', sans-serif;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--secondary);
    }

    .cover-body {
      margin: auto 0;
    }

    .cover-title {
      font-family: var(--font-title);
      font-size: 42px;
      font-weight: 700;
      color: var(--primary);
      line-height: 1.1;
      margin-bottom: 10px;
    }

    .cover-subtitle {
      font-size: 20px;
      font-family: 'Outfit', sans-serif;
      color: #64748b;
      margin-bottom: 40px;
    }

    .cover-meta {
      border-left: 4px solid var(--secondary);
      padding-left: 15px;
      margin-top: 20px;
      font-family: 'Outfit', sans-serif;
    }

    .cover-meta p {
      margin: 5px 0;
      font-size: 14px;
    }

    .cover-footer {
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid var(--border-color);
      padding-top: 10px;
      font-family: 'Outfit', sans-serif;
    }

    h1, h2, h3, h4 {
      color: var(--primary);
      font-family: var(--font-title);
    }

    h2 {
      font-size: 28px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 8px;
      margin-top: 40px;
    }

    h3 {
      font-size: 22px;
      color: var(--primary);
      margin-top: 30px;
      border-left: 4px solid var(--primary);
      padding-left: 10px;
    }

    h4 {
      font-size: 16px;
      color: var(--secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    .intro-paragraph {
      font-size: 16px;
      line-height: 1.8;
      color: #475569;
      margin-bottom: 30px;
    }

    .custom-message-box {
      background-color: var(--card-bg);
      border-left: 4px solid var(--primary);
      padding: 15px 20px;
      margin: 30px 0;
      font-style: italic;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 30px 0;
    }

    .summary-card {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }

    .summary-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      border: none;
      padding: 0;
    }

    .summary-value {
      font-size: 36px;
      font-weight: 700;
      color: var(--primary);
      font-family: 'Outfit', sans-serif;
      margin-bottom: 5px;
    }

    .summary-card p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }

    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0 25px 0;
      font-size: 13px;
    }

    .report-table th, .report-table td {
      border: 1px solid var(--border-color);
      padding: 10px 12px;
      text-align: left;
    }

    .report-table th {
      background-color: var(--card-bg);
      color: var(--primary);
      font-weight: 600;
    }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      font-size: 11px;
      border-radius: 4px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .badge.ongoing {
      background-color: #fef3c7;
      color: #d97706;
    }
    .badge.completed {
      background-color: #d1fae5;
      color: #059669;
    }

    .toc-list {
      list-style: none;
      padding: 0;
      margin: 30px 0;
    }

    .toc-list li {
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 500;
    }

    .toc-list li.toc-sub {
      margin-left: 20px;
      font-size: 14px;
      font-weight: normal;
    }

    .toc-list a {
      color: #334155;
      text-decoration: none;
      display: flex;
      justify-content: space-between;
    }

    .toc-list a::after {
      content: "........................................................................................................................................";
      white-space: nowrap;
      overflow: hidden;
      margin: 0 10px;
      color: #cbd5e1;
      flex-grow: 1;
      text-align: right;
    }

    .dep-header-meta {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 10px 15px;
      margin-bottom: 25px;
      font-size: 13px;
      color: #475569;
      font-family: 'Outfit', sans-serif;
    }

    .sub-section {
      margin-bottom: 30px;
    }

    .publications-list {
      padding-left: 20px;
    }

    .publication-item {
      margin-bottom: 12px;
      font-size: 13px;
    }

    .pub-details {
      color: #64748b;
    }

    .placements-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }

    .placement-pill {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 12px;
    }

    .events-container, .achievements-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 10px;
    }

    .event-item, .achievement-item {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 12px 15px;
      font-size: 13px;
    }

    .event-meta {
      color: var(--primary);
      margin-bottom: 5px;
    }

    .event-details {
      color: #64748b;
      font-size: 11px;
    }

    .mini-bar-chart {
      margin-top: 15px;
    }

    .bar-row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      font-size: 12px;
    }

    .bar-label {
      width: 150px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bar-track {
      flex-grow: 1;
      height: 12px;
      background-color: #f1f5f9;
      border-radius: 6px;
      margin: 0 15px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background-color: var(--primary);
      border-radius: 6px;
    }

    .bar-val {
      width: 30px;
      text-align: right;
      font-weight: 600;
    }

    @media screen {
      body {
        background-color: #f1f5f9;
        padding: 40px 10px;
      }
      .preview-wrapper {
        max-width: 210mm;
        margin: 0 auto;
        background-color: #ffffff;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        padding: 20mm;
        border-radius: 8px;
        min-height: 297mm;
      }
    }
  </style>
</head>
<body>
  <div class="preview-wrapper">
    <div class="page-break cover-page">
      <div class="cover-header">
        <h4>Annual Report Submission</h4>
      </div>
      
      <div class="cover-body">
        <div class="cover-title">${config.title}</div>
        <div class="cover-subtitle">${config.subtitle || "Institutional Integration Report"}</div>
        
        <div class="cover-meta">
          <p><strong>Academic Year:</strong> ${config.academicYear}</p>
          <p><strong>Generated On:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Departments Integrated:</strong> ${activeDeps.length} of ${departments.length}</p>
        </div>

        ${config.customMessage ? `
          <div class="custom-message-box">
            ${config.customMessage.replace(/\n/g, "<br>")}
          </div>
        ` : ""}
      </div>
      
      <div class="cover-footer">
        <p>&copy; ${new Date().getFullYear()} ${config.subtitle || "Institutional Integration Report"}. All rights reserved. Generated via Annual Report Portal.</p>
      </div>
    </div>

    ${tocHtml}

    ${execSummaryHtml}

    <div id="departmental-reports">
      <h2 class="page-break">2. Departmental Reports</h2>
      ${departmentsHtml}
    </div>
  </div>
</body>
</html>
`;
    }
  };
})();
