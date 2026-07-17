/**
 * Localization dictionary supporting instant English and Tamil translation toggling.
 */

const locales = {
  en: {
    brandName: "Annual Report Portal",
    dashboard: "Dashboard",
    departments: "Departments",
    reportBuilder: "Report Builder",
    analytics: "Analytics Panel",
    comparison: "Compare Departments",
    calendar: "Academic Calendar",
    settings: "System Config",
    logout: "Log Out",
    welcome: "Welcome back",
    role: "Role",
    
    // Dashboard widgets
    instituteOverview: "Institute Overview",
    subStatsAY: "Annual Integration Report Statistics for Academic Year",
    totalFaculty: "Total Faculty",
    publications: "Publications",
    grants: "Research Funding",
    patents: "Patents Filed/Granted",
    consultancy: "Consultancy Value",
    alumni: "Alumni Tracked",
    students: "Total Students",
    passPercentage: "Avg Pass Percentage",
    eventsConducted: "Events Conducted",
    
    // Statuses
    draft: "Draft",
    submitted: "Submitted",
    underReview: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
    
    // Actions
    editReport: "Edit Report",
    saveReport: "Save Department Report",
    cancel: "Cancel",
    save: "Save",
    add: "Add",
    delete: "Delete",
    submitForApproval: "Submit for Approval",
    approveReport: "Approve Report",
    rejectReport: "Reject Report",
    generateWithAI: "Generate with AI",
    digitalSignature: "Digital Signature",
    exportBackup: "Export Workspace Backup",
    restoreBackup: "Restore Backup File",
    resetStorage: "Reset Storage",
    
    // Headings
    workflowTracker: "Report Progress Tracker",
    approvalHistory: "Approval History & Comments",
    recentActivity: "Recent System Activity Logs",
    notifications: "Notification Center",
    versionHistory: "Version History Control",
    fileAttachments: "File Attachments & Proofs",
    comparisonMatrix: "Department Performance Comparison",
    digitalSignPad: "Sign-off Signature Canvas",
    
    // Prompts
    hodComment: "HOD Review Comments",
    principalComment: "Principal Review Comments",
    enterUsername: "Username",
    enterPassword: "Password",
    loginTitle: "Annual Report Management System",
    loginSubtitle: "Sign in to access your institutional dashboard",

    // Analytics & Comparison
    metricsComparison: "Department Metrics Comparison",
    metricsComparisonDesc: "Analyze key academic metrics and funding distribution side-by-side",
    selectDeps: "Select Departments to Compare:",
    grantsFundingComp: "Grants Funding Comparative (Lakhs)",
    semesterPassRateLabel: "Semester Pass Rate (%)",
    workflowStatus: "Workflow status",
    flowpathsComp: "Institutional Approval Flowpaths Comparison",
    resultsArrearsMatrix: "Semester Results & Arrears Audit Matrix",
    
    // Leaderboard
    leaderboardTitle: "Department Standings & Rankings",
    leaderboardDesc: "Rankings derived from research citation parameters, grants funding, and placement volumes",
    scoreCalcSetup: "Score Calculations Setup",
    scoreCalcSetupDesc: "Rankings are calculated dynamically inside the client database layer using weighted values:",
    citationsLogged: "Citations logged: +10 points / citation",
    fundingSecured: "Funding secured: +1 point / ₹10,000",
    studentsPlacedScore: "Students Placed: +15 points / student",
    patentsFiledScore: "Patents Filed: +50 points / patent",
    topStudentAchievers: "Top Student Achievers",
    
    // Executive Analytics
    executiveBiTitle: "Executive BI Analytics Dashboard",
    executiveBiDesc: "Tableau-style institutional performance audits, placements CTC analytics, and accreditation scorecards",
    biExecSummary: "BI Executive Summary",
    readinessGauge: "Accreditation Readiness Gauge",
    liveInsightsAudit: "Live Insights Audit",
    researchCitationsTrends: "Research Citation Trends",
    researchFundingShare: "Research Funding Share",
    ctcPlacementPackages: "CTC Placement Packages (LPA)",
    bestPerformingDept: "Best Performing Department:",
    highestPlacementOffer: "Highest Placement Offer:",
    mostActiveFaculty: "Most Active Research Faculty:",
    lowestProgress: "Lowest Submission Progress:",
    resultsLeader: "Semester Results Leader:",
    totalPubsAY: "Total Publications (AY 25-26):",
    totalFundingSecured: "Total Funding Secured:"
  },
  
  ta: {
    brandName: "ஆண்டு அறிக்கை போர்டல்",
    dashboard: "முகப்புப்பலகை",
    departments: "துறைகள்",
    reportBuilder: "அறிக்கை உருவாக்குபவர்",
    analytics: "பகுப்பாய்வு குழு",
    comparison: "துறைகள் ஒப்பீடு",
    calendar: "கல்வி நாட்காட்டி",
    settings: "அமைப்பு கட்டமைப்பு",
    logout: "வெளியேறு",
    welcome: "மீண்டும் வருக",
    role: "பங்கு",
    
    // Dashboard widgets
    instituteOverview: "நிறுவனத்தின் கண்ணோட்டம்",
    subStatsAY: "கல்வி ஆண்டிற்கான ஒருங்கிணைந்த அறிக்கை புள்ளிவிவரங்கள்",
    totalFaculty: "மொத்த ஆசிரியர்கள்",
    publications: "ஆராய்ச்சி வெளியீடுகள்",
    grants: "ஆராய்ச்சி நிதி",
    patents: "காப்புரிமைகள்",
    consultancy: "ஆலோசனைக் கட்டணம்",
    alumni: "முன்னாள் மாணவர்கள்",
    students: "மொத்த மாணவர்கள்",
    passPercentage: "சராசரி தேர்ச்சி சதவீதம்",
    eventsConducted: "நடத்தப்பட்ட நிகழ்வுகள்",
    
    // Statuses
    draft: "வரைவு",
    submitted: "சமர்ப்பிக்கப்பட்டது",
    underReview: "மதிப்பாய்வில் உள்ளது",
    approved: "அங்கீகரிக்கப்பட்டது",
    rejected: "நிராகரிக்கப்பட்டது",
    
    // Actions
    editReport: "அறிக்கையைத் தொகு",
    saveReport: "அறிக்கையைச் சேமி",
    cancel: "ரத்து செய்",
    save: "சேமி",
    add: "சேர்",
    delete: "நீக்கு",
    submitForApproval: "ஒப்புதலுக்கு சமர்ப்பி",
    approveReport: "அறிக்கையை அங்கீகரி",
    rejectReport: "அறிக்கையை நிராகரி",
    generateWithAI: "செயற்கை நுண்ணறிவு மூலம் உருவாக்கு",
    digitalSignature: "டிஜிட்டல் கையொப்பம்",
    exportBackup: "காப்புநகல் ஏற்றுமதி செய்",
    restoreBackup: "காப்புநகல் மீட்டமை",
    resetStorage: "தரவை மீட்டமை",
    
    // Headings
    workflowTracker: "அறிக்கை முன்னேற்றக் கண்காணிப்பாளர்",
    approvalHistory: "அங்கீகார வரலாறு மற்றும் கருத்துக்கள்",
    recentActivity: "சமீபத்திய கணினி செயல்பாட்டுப் பதிவுகள்",
    notifications: "அறிவிப்பு மையம்",
    versionHistory: "பதிப்பு வரலாற்று மேலாண்மை",
    fileAttachments: "கோப்பு இணைப்புகள் மற்றும் சான்றுகள்",
    comparisonMatrix: "துறை செயல்திறன் ஒப்பீடு",
    digitalSignPad: "கையொப்பம் வரைதல் பலகை",
    
    // Prompts
    hodComment: "துறைத் தலைவர் கருத்துக்கள்",
    principalComment: "முதல்வர் மதிப்பாய்வு கருத்துக்கள்",
    enterUsername: "பயனர் பெயர்",
    enterPassword: "கடவுச்சொல்",
    loginTitle: "ஆண்டு அறிக்கை மேலாண்மை அமைப்பு",
    loginSubtitle: "உங்கள் நிறுவன முகப்புப் பலகையை அணுக உள்நுழைக",

    // Analytics & Comparison
    metricsComparison: "துறை அளவீடுகள் ஒப்பீடு",
    metricsComparisonDesc: "முக்கிய கல்வி அளவீடுகள் மற்றும் நிதி விநியோகத்தை அருகருகே பகுப்பாய்வு செய்யுங்கள்",
    selectDeps: "ஒப்பிட வேண்டிய துறைகளைத் தேர்ந்தெடுக்கவும்:",
    grantsFundingComp: "மானிய நிதியுதவி ஒப்பீடு (லட்சத்தில்)",
    semesterPassRateLabel: "செமஸ்டர் தேர்ச்சி விகிதம் (%)",
    workflowStatus: "பணிப்பாய்வு நிலை",
    flowpathsComp: "நிறுவன ஒப்புதல் பணிப்பாய்வு ஒப்பீடு",
    resultsArrearsMatrix: "செமஸ்டர் முடிவுகள் மற்றும் அரியர்ஸ் தணிக்கை அட்டவணை",
    
    // Leaderboard
    leaderboardTitle: "துறை நிலைகள் மற்றும் தரவரிசை",
    leaderboardDesc: "ஆராய்ச்சி மேற்கோள் அளவுருக்கள், மானிய நிதி மற்றும் வேலைவாய்ப்பு அளவுகளிலிருந்து பெறப்பட்ட தரவரிசைகள்",
    scoreCalcSetup: "மதிப்பெண் கணக்கீடு கட்டமைப்பு",
    scoreCalcSetupDesc: "வாடிக்கையாளர் தரவுத்தளத்தில் எடையுள்ள மதிப்புகளைப் பயன்படுத்தி தரவரிசைகள் கணக்கிடப்படுகின்றன:",
    citationsLogged: "மேற்கோள்கள்: ஒரு மேற்கோளுக்கு +10 புள்ளிகள்",
    fundingSecured: "நிதியுதவி: ₹10,000-க்கு +1 புள்ளி",
    studentsPlacedScore: "வேலைவாய்ப்பு: ஒரு மாணவருக்கு +15 புள்ளிகள்",
    patentsFiledScore: "காப்புரிமைகள்: ஒரு காப்புரிமைக்கு +50 புள்ளிகள்",
    topStudentAchievers: "சிறந்த சாதனையாளர் மாணவர்கள்",
    
    // Executive Analytics
    executiveBiTitle: "முன்னணி பகுப்பாய்வு முகப்புப்பலகை",
    executiveBiDesc: "நிறுவன செயல்திறன் தணிக்கை, வேலைவாய்ப்பு பகுப்பாய்வு மற்றும் தகுதி மதிப்பெண் அட்டைகள்",
    biExecSummary: "முன்னணி பகுப்பாய்வு சுருக்கம்",
    readinessGauge: "அங்கீகாரத் தயார்நிலை அளவீடு",
    liveInsightsAudit: "நேரடி தணிக்கை நுண்ணறிவு",
    researchCitationsTrends: "ஆராய்ச்சி மேற்கோள் போக்குகள்",
    researchFundingShare: "ஆராய்ச்சி நிதிப் பங்கு",
    ctcPlacementPackages: "சராசரி வேலைவாய்ப்பு ஊதிய தொகுப்புகள் (LPA)",
    bestPerformingDept: "சிறந்த செயல்திறன் கொண்ட துறை:",
    highestPlacementOffer: "அதிகபட்ச ஊதிய வேலைவாய்ப்பு:",
    mostActiveFaculty: "மிகவும் சுறுசுறுப்பான ஆராய்ச்சி ஆசிரியர்:",
    lowestProgress: "குறைந்த சமர்ப்பிப்பு முன்னேற்றம்:",
    resultsLeader: "தேர்ச்சி விகிதத் தலைவர்:",
    totalPubsAY: "மொத்த வெளியீடுகள் (AY 25-26):",
    totalFundingSecured: "பெறப்பட்ட மொத்த நிதியுதவி:"
  }
};

/**
 * Translates a key based on current language selection.
 * @param {string} key 
 * @param {string} lang ('en' or 'ta')
 * @returns {string} Translated text
 */
function t(key, lang = "en") {
  const dictionary = locales[lang] || locales.en;
  return dictionary[key] || locales.en[key] || key;
}

// Bind to window to share globally
window.locales = locales;
window.t = t;
