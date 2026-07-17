/**
 * AI Content Integration Assistant.
 * Sequentially structured to support CORS-free file:// execution.
 */

const aiDelay = (ms) => new Promise(res => setTimeout(res, ms));

const MOCK_AI_RESPONSES = {
  grammar: (text) => {
    return `### Adjusted & Polished Text:\n\n${text.replace(/\bdata\b/gi, "datasets").replace(/\bget\b/gi, "acquire").replace(/\bmake\b/gi, "formulate")}\n\n*Refined for professional academic publication tone (passive voice transitions, formal vocabulary matching).*`;
  },
  
  missing: (dep) => {
    const gaps = [];
    if (!dep.metrics.patents || dep.metrics.patents.length === 0) gaps.push("Patent registrations and IP filings are blank. Consider adding filed/granted records.");
    if (!dep.metrics.consultancy || dep.metrics.consultancy.length === 0) gaps.push("Consultancy projects are empty. Verify if industrial consultancy occurred.");
    if (dep.facultyCount < 15) gaps.push("Faculty count is below institutional benchmarks. Verify if adjunct faculty logs are updated.");
    if (gaps.length === 0) return "### AI Data Audit Result:\n\n✔️ No significant data gaps detected. All mandatory compliance logs (publications, grants, placements, and events) are complete.";
    return `### AI Data Audit Result:\n\n⚠️ **${gaps.length} Potential Data Gaps Found:**\n\n` + gaps.map(g => `- ${g}`).join("\n");
  },

  highlights: (dep) => {
    const pubs = dep.metrics.publications || [];
    const placements = dep.metrics.placements || [];
    const grants = dep.metrics.grants || [];

    const topPub = pubs.sort((a,b) => b.citations - a.citations)[0];
    const topPlaced = placements.sort((a,b) => b.studentsPlaced - a.studentsPlaced)[0];
    const maxGrant = grants.sort((a,b) => b.amount - a.amount)[0];

    let lines = [];
    if (topPub) lines.push(`High Impact Research: "${topPub.title}" has gathered ${topPub.citations} citations since publication.`);
    if (topPlaced) lines.push(`Placement Success: Placed ${topPlaced.studentsPlaced} graduates at ${topPlaced.company} with average package benchmarking.`);
    if (maxGrant) lines.push(`Funding Lead: Secured ₹${(maxGrant.amount/100000).toFixed(1)} Lakh from ${maxGrant.agency} for research development.`);

    if (lines.length === 0) return "### Department Key Highlights:\n\nNo significant highlights could be auto-extracted. Add publications or placement records to analyze.";
    return `### AI Extracted Highlights:\n\n` + lines.map(l => `- **${l.split(":")[0]}:** ${l.split(":")[1]}`).join("\n");
  },

  recommendations: (dep) => {
    return `### AI Strategic Recommendations (AY 2026-27):\n\n1. **Research Funding Diversification:** While the current grant budget stands at ₹${((dep.metrics.grants || []).reduce((s,g)=>s+g.amount, 0)/100000).toFixed(1)} Lakh, we recommend applying to international collaborative grants (such as Horizon Europe or Indo-US research forums).\n2. **IP Filings Acceleration:** Establish a departmental patent committee to guide faculty through utility patent submissions.\n3. **Placement Tie-ups:** Establish specialized corporate internship programs to boost placement ratios.`;
  },

  execSummary: (dep) => {
    const pubs = dep.metrics.publications || [];
    const grants = dep.metrics.grants || [];
    const placements = dep.metrics.placements || [];

    const totalPubs = pubs.length;
    const totalGrants = grants.reduce((s,g) => s + g.amount, 0);
    const totalPlaced = placements.reduce((s,p) => s + p.studentsPlaced, 0);

    return `### Executive Academic Summary: ${dep.name}\n\nUnder the leadership of **${dep.head}**, the department has shown steady academic achievements during the 2025-2026 academic cycle. The teaching and research faculty, comprising **${dep.facultyCount}** members, has published **${totalPubs}** peer-reviewed articles. \n\nResearch funding remains active with a total value of **₹${(totalGrants/100000).toFixed(1)} Lakh** across sponsored projects. In student placements, **${totalPlaced}** graduating students secured corporate hires. This report validates the department's continuous focus on research excellence and student career pathways.`;
  }
};

async function generateAIContent(actionType, contextData, onChunkCallback) {
  await aiDelay(1500);

  let fullResponse = "";
  
  if (actionType === "summary") {
    fullResponse = MOCK_AI_RESPONSES.execSummary(contextData);
  } else if (actionType === "grammar") {
    fullResponse = MOCK_AI_RESPONSES.grammar(contextData);
  } else if (actionType === "missing") {
    fullResponse = MOCK_AI_RESPONSES.missing(contextData);
  } else if (actionType === "highlights") {
    fullResponse = MOCK_AI_RESPONSES.highlights(contextData);
  } else if (actionType === "recommendations") {
    fullResponse = MOCK_AI_RESPONSES.recommendations(contextData);
  } else {
    fullResponse = `### Simulated AI Output:\n\nRefined query options for ${contextData.name || "selected view"}. Ready for integration.`;
  }

  const words = fullResponse.split(" ");
  let output = "";
  for (let i = 0; i < words.length; i++) {
    output += (i === 0 ? "" : " ") + words[i];
    onChunkCallback(output);
    await aiDelay(35);
  }
}

// Bind to window to share globally
window.generateAIContent = generateAIContent;
