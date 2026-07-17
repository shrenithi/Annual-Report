/**
 * Leaderboard & Rankings panel.
 * Sequentially structured to support CORS-free file:// execution.
 */

async function renderLeaderboardPanel(container) {
  const deps = await window.getDepartments();

  // Score computation algorithm
  const getScore = (d) => {
    const publicationsScore = (d.metrics?.publications || []).reduce((acc, curr) => acc + (curr.citations || 0), 0) * 10;
    const grantsScore = ((d.metrics?.grants || []).reduce((acc, curr) => acc + (curr.amount || 0), 0) / 10000);
    const placementsScore = (d.metrics?.placements || []).reduce((acc, curr) => acc + (curr.studentsPlaced || 0), 0) * 15;
    const patentsScore = (d.metrics?.patents || []).length * 50;

    return Math.round(publicationsScore + grantsScore + placementsScore + patentsScore);
  };

  const rankedDeps = deps.map(d => {
    return {
      id: d.id,
      name: d.name,
      head: d.head,
      score: getScore(d)
    };
  }).sort((a, b) => b.score - a.score);

  container.innerHTML = `
    <div class="top-nav" style="margin-bottom: 25px;">
      <div class="page-header">
        <h1>${window.t("leaderboardTitle", state.currentLang)}</h1>
        <p>${window.t("leaderboardDesc", state.currentLang)}</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 25px;">
      
      <!-- Leaderboard rankings rows -->
      <div class="glass-card" style="padding: 25px;">
        <h3 style="font-family: var(--font-title); font-size: 15px; font-weight: 600; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 6px; text-transform: uppercase;">
          ${window.t("instituteOverview", state.currentLang)}
        </h3>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${rankedDeps.map((d, index) => {
            let medal = "🏅";
            if (index === 0) medal = "🥇";
            else if (index === 1) medal = "🥈";
            else if (index === 2) medal = "🥉";

            return `
              <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-radius: 8px; border: 1px solid ${index < 3 ? "rgba(14, 165, 233, 0.2)" : "var(--border)"}; background: ${index === 0 ? "rgba(14, 165, 233, 0.04)" : "transparent"};">
                <div style="display: flex; align-items: center; gap: 15px;">
                  <span style="font-size: 24px; font-weight: bold; width: 30px; text-align: center;">${medal}</span>
                  <div style="text-align: left;">
                    <span style="font-weight: 700; color: var(--text-main); font-size: 14px; font-family: var(--font-title);">${d.name}</span>
                    <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px;">Head: ${d.head}</span>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 18px; font-weight: 800; color: var(--primary); font-family: var(--font-title);">${d.score.toLocaleString()}</span>
                  <span style="font-size: 9px; color: var(--text-muted); display: block; margin-top: 2px;">Index points</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Right column details -->
      <div>
        <!-- Standing Parameters Card -->
        <div class="glass-card" style="padding: 25px; display: flex; flex-direction: column; gap: 15px; text-align: left;">
          <h3 style="font-family: var(--font-title); font-size: 15px; font-weight: 600; border-bottom: 1px solid var(--border); padding-bottom: 6px; text-transform: uppercase;">
            ${window.t("scoreCalcSetup", state.currentLang)}
          </h3>
          <p style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">
            ${window.t("scoreCalcSetupDesc", state.currentLang)}
          </p>
          <ul style="font-size: 11px; color: var(--text-main); margin-left: 20px; display: flex; flex-direction: column; gap: 8px;">
            <li>📚 ${window.t("citationsLogged", state.currentLang)}</li>
            <li>💰 ${window.t("fundingSecured", state.currentLang)}</li>
            <li>💼 ${window.t("studentsPlacedScore", state.currentLang)}</li>
            <li>💡 ${window.t("patentsFiledScore", state.currentLang)}</li>
          </ul>
        </div>

        <!-- Top Student Achievers Card -->
        <div class="glass-card" style="padding: 25px; display: flex; flex-direction: column; gap: 15px; margin-top: 20px; text-align: left;">
          <h3 style="font-family: var(--font-title); font-size: 15px; font-weight: 600; border-bottom: 1px solid var(--border); padding-bottom: 6px; text-transform: uppercase;">
            ⭐ ${window.t("topStudentAchievers", state.currentLang)}
          </h3>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Student 1 -->
            <div style="display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.01); border: 1px solid var(--border);">
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=60" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary);">
              <div style="font-size: 11px;">
                <strong style="color: var(--text-main); display: block;">Bala Chandra (CSE)</strong>
                <span style="color: var(--success); font-weight: 600; display: block; margin-top: 1px;">Google India Placement (22.5 LPA)</span>
                <span style="color: var(--text-muted); font-size: 9px;">CGPA: 9.85 &bull; Academic Excellence Award</span>
              </div>
            </div>

            <!-- Student 2 -->
            <div style="display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.01); border: 1px solid var(--border);">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary);">
              <div style="font-size: 11px;">
                <strong style="color: var(--text-main); display: block;">Srinidhi S. (ECE)</strong>
                <span style="color: var(--secondary); font-weight: 600; display: block; margin-top: 1px;">National Robocon Winner 2026</span>
                <span style="color: var(--text-muted); font-size: 9px;">Innovator of the Year &bull; IoT Lab Coordinator</span>
              </div>
            </div>

            <!-- Student 3 -->
            <div style="display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.01); border: 1px solid var(--border);">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary);">
              <div style="font-size: 11px;">
                <strong style="color: var(--text-main); display: block;">Dharshini K. (CIVIL)</strong>
                <span style="color: var(--accent); font-weight: 600; display: block; margin-top: 1px;">Structural Design Hackathon (1st Place)</span>
                <span style="color: var(--text-muted); font-size: 9px;">Undergrad Scholar &bull; Best Project Presenter</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

// Bind to window to share globally
window.renderLeaderboardPanel = renderLeaderboardPanel;
