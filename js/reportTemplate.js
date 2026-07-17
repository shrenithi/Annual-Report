/**
 * Consolidated University Annual Report templates compiler.
 * Sequentially structured to support CORS-free file:// execution.
 */

function compileReportHTML(departments, settings, qrBase64 = "", watermark = "", config = {}) {
  
  const selectedTheme = settings.reportTheme || "modern";
  
  let headerStyle = "";
  let accentColor = "#0f172a";
  
  if (selectedTheme === "naac") {
    accentColor = "#1e3a8a";
    headerStyle = "border-bottom: 4px double #1e3a8a; padding-bottom: 15px; margin-bottom: 25px;";
  } else if (selectedTheme === "nba") {
    accentColor = "#0f766e";
    headerStyle = "border-bottom: 3px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px;";
  } else if (selectedTheme === "gov") {
    accentColor = "#b91c1c";
    headerStyle = "border-bottom: 2px solid #b91c1c; padding-bottom: 10px; margin-bottom: 20px;";
  } else { // modern
    accentColor = "#0284c7";
    headerStyle = "border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;";
  }

  // Cover Page
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Consolidated Report Preview</title>
      <style>
        @media print {
          body { background: #fff; color: #000; font-size: 12px; }
          .page-break { page-break-after: always; }
          .no-print { display: none; }
        }
        body {
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
          line-height: 1.6;
          margin: 0;
          padding: 40px;
          background: #ffffff;
          position: relative;
        }
        h1, h2, h3, h4 {
          font-family: 'Outfit', sans-serif;
          color: #0f172a;
          margin-top: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0 25px;
          font-size: 11px;
        }
        table, th, td {
          border: 1px solid #e2e8f0;
        }
        th {
          background-color: #f8fafc;
          padding: 10px;
          font-weight: 600;
          text-align: left;
        }
        td {
          padding: 10px;
        }
        .cover-page {
          height: 100%;
          min-height: 700px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: center;
          padding: 50px;
          box-sizing: border-box;
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80px;
          color: rgba(239, 68, 68, 0.08);
          font-weight: bold;
          text-transform: uppercase;
          pointer-events: none;
          z-index: 10000;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>

      ${watermark ? `<div class="watermark">${watermark}</div>` : ""}

      <!-- Cover page -->
      <div class="cover-page page-break">
        <div style="margin-top: 50px;">
          <h1 style="font-size: 32px; font-weight: 800; color: ${accentColor};">${settings.instituteName}</h1>
          <h2 style="font-size: 20px; font-weight: 500; color: #64748b; margin-top: 10px;">Consolidated Institutional Annual Report</h2>
          <h3 style="font-size: 16px; font-weight: 600; color: #475569; margin-top: 5px;">Academic Cycle: AY ${settings.academicYear}</h3>
        </div>
        
        <div style="margin: 40px auto;">
          <img src="${settings.logo || 'https://via.placeholder.com/80'}" style="width: 80px; height: 80px; border-radius:50%;">
        </div>

        <div style="font-size:11px; color:#64748b; margin-top:20px;">
          <div>Prepared By: <strong>HOD Offices</strong></div>
          <div>Reviewed By: <strong>IQAC Cell</strong></div>
          <div>Approved By: <strong>Principal Office</strong></div>
        </div>

        <div style="margin-bottom: 50px; display: flex; justify-content: space-between; align-items: flex-end; text-align: left;">
          <div>
            <p style="margin: 0; font-size: 11px; color: #64748b;">Generated on: ${new Date().toLocaleDateString()}</p>
            <p style="margin: 3px 0 0; font-size: 11px; color: #64748b;">Template mode: ${selectedTheme.toUpperCase()} layout</p>
          </div>
          ${qrBase64 ? `<img src="${qrBase64}" style="width: 90px; height: 90px;">` : ""}
        </div>
      </div>

      <!-- Table of Contents -->
      <div class="page-break" style="margin-top: 30px; ${headerStyle}">
        <h2 style="color: ${accentColor}; font-size: 22px; font-weight: 700;">Table of Contents</h2>
        <div style="display:flex; flex-direction:column; gap:12px; font-size:12px; margin-top:20px;">
          ${departments.map((d, idx) => `
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #cbd5e1; padding-bottom:4px;">
              <span><strong>Section ${idx + 1}.</strong> ${d.name} Report Summary</span>
              <span>Page ${idx + 2}</span>
            </div>
          `).join("")}
        </div>
      </div>
  `;

  // Compilation details
  departments.forEach((d, idx) => {
    html += `
      <div class="page-break" style="margin-top: 30px; ${headerStyle}">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h2 style="color: ${accentColor}; font-size: 22px; font-weight: 700;">${idx + 1}. ${d.name}</h2>
          <span style="font-size: 10px; color: #64748b; font-weight: bold; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 4px;">DEPT ID: ${d.id.toUpperCase()}</span>
        </div>
        <p style="font-size: 12px; margin-top: 5px; color: #475569;">Head of Department: <strong>${d.head}</strong> &bull; Faculty Count: <strong>${d.facultyCount}</strong> &bull; Student Strength: <strong>${d.studentCount}</strong></p>

        <!-- 1. Publications -->
        <h3 style="font-size: 14px; border-left: 3px solid ${accentColor}; padding-left: 10px; margin-top: 25px; color: #1e293b;">1. Research Publications Output</h3>
        ${(!d.metrics.publications || d.metrics.publications.length === 0) ? '<p style="font-size: 11px; color: #64748b; italic">No research papers logged for this period.</p>' : `
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Authors</th>
                <th>Journal Venue</th>
                <th>Year</th>
                <th>Citations</th>
              </tr>
            </thead>
            <tbody>
              ${d.metrics.publications.map(p => `
                <tr>
                  <td><strong>${p.title}</strong></td>
                  <td>${p.authors}</td>
                  <td>${p.venue}</td>
                  <td>${p.year}</td>
                  <td>${p.citations}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `}

        <!-- 2. Grants -->
        <h3 style="font-size: 14px; border-left: 3px solid ${accentColor}; padding-left: 10px; margin-top: 25px; color: #1e293b;">2. Sponsored Research Funding</h3>
        ${(!d.metrics.grants || d.metrics.grants.length === 0) ? '<p style="font-size: 11px; color: #64748b; italic">No sponsored grants logged for this period.</p>' : `
          <table>
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Funding Agency</th>
                <th>Sanctioned Amount</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${d.metrics.grants.map(g => `
                <tr>
                  <td><strong>${g.title}</strong></td>
                  <td>${g.agency}</td>
                  <td>₹${g.amount.toLocaleString()}</td>
                  <td>${g.duration}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `}

        <!-- Digital Signature Stamps -->
        <div style="margin-top: 40px; display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:20px; font-size:10px; color:#475569;">
          <div>
            <div>Prepared by HOD</div>
            <div style="height:35px; font-family:'Cursive'; font-size:14px; color:${accentColor}; margin-top:5px;">${d.head}</div>
          </div>
          <div>
            <div>Approved by Principal</div>
            ${d.signatures?.hod ? `<img src="${d.signatures.hod}" style="height:35px;">` : `<div style="height:35px; border-bottom:1px solid #cbd5e1; width:100px; margin-top:5px;"></div>`}
          </div>
        </div>

      </div>
    `;
  });

  html += `
    </body>
    </html>
  `;
  return html;
}

// Bind to window to share globally
window.compileReportHTML = compileReportHTML;
