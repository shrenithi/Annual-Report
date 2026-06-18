/**
 * Default mock data for the Annual Report Portal.
 * This represents the initial state of the reports for different departments.
 * Attached to window.PortalData to run locally under file:// protocol.
 */
(function() {
  const defaultDepartmentsData = [
    {
      id: "cse",
      name: "Computer Science & Engineering",
      head: "Dr. Evelyn Vance",
      facultyCount: 28,
      studentCount: 420,
      status: "Approved",
      lastUpdated: "2026-06-15",
      metrics: {
        publications: [
          { title: "Quantum-Safe Cryptographic Protocols for Decentralized IoT Systems", authors: "E. Vance, A. Roy", venue: "IEEE Transactions on Information Forensics", year: 2025, citations: 24 },
          { title: "Optimization of Multi-modal Transformers for Edge Device Inference", authors: "S. Patel, L. Zhang", venue: "NeurIPS 2025", year: 2025, citations: 18 },
          { title: "Self-Supervised Learning Patterns in Healthcare Diagnostic Imaging", authors: "R. Kumar, E. Vance", venue: "Journal of Medical AI", year: 2026, citations: 5 }
        ],
        grants: [
          { title: "Secure Edge Intelligence for Smart City Infrastructure", agency: "National Science Foundation", amount: 450000, duration: "3 Years", status: "Ongoing" },
          { title: "Neural Architecture Search for Low-Power Microcontrollers", agency: "Intel Research Labs", amount: 120000, duration: "1 Year", status: "Completed" }
        ],
        placements: [
          { company: "Google", studentsPlaced: 12, packageLpa: 38.5 },
          { company: "Microsoft", studentsPlaced: 8, packageLpa: 32.0 },
          { company: "NVIDIA", studentsPlaced: 5, packageLpa: 42.0 },
          { company: "Amazon", studentsPlaced: 15, packageLpa: 28.0 },
          { company: "Accenture", studentsPlaced: 35, packageLpa: 12.0 }
        ],
        events: [
          { name: "International Conference on Intelligent Systems (ICIS 2025)", type: "Conference", date: "2025-11-12", attendees: 350 },
          { name: "HackFest 2026: GenAI for Social Good", type: "Hackathon", date: "2026-03-04", attendees: 180 },
          { name: "Workshop on Distributed Ledger Architectures", type: "Workshop", date: "2026-05-18", attendees: 65 }
        ],
        achievements: [
          { detail: "Dr. Evelyn Vance received the Outstanding Academician Award from the Computer Society.", recipient: "Dr. Evelyn Vance", category: "Faculty Award" },
          { detail: "Student team 'NeuralHack' won 1st prize at the National Smart India Hackathon.", recipient: "Aarav Mehta, Ishita Sen", category: "Student Award" }
        ]
      }
    },
    {
      id: "ece",
      name: "Electronics & Communication Engineering",
      head: "Dr. Marcus Thorne",
      facultyCount: 24,
      studentCount: 380,
      status: "Pending Review",
      lastUpdated: "2026-06-17",
      metrics: {
        publications: [
          { title: "Sub-terahertz Antenna Arrays for 6G Wireless Communication", authors: "M. Thorne, J. Al-Fayed", venue: "IEEE Communications Letters", year: 2025, citations: 31 },
          { title: "Low-Power Mixed-Signal IC Design for Implantable Cardiac Monitors", authors: "H. Gomez, P. Das", venue: "IEEE Journal of Solid-State Circuits", year: 2025, citations: 14 },
          { title: "MEMS Sensor Interfaces with Adaptive Noise Cancellation", authors: "M. Thorne, S. Iyer", venue: "Sensors and Actuators A", year: 2026, citations: 2 }
        ],
        grants: [
          { title: "Development of High-Efficiency Gallium Nitride (GaN) Power Amplifiers", agency: "Department of Space", amount: 380000, duration: "2 Years", status: "Ongoing" },
          { title: "Energy-Harvesting Nodes for Agricultural IoT Mesh Networks", agency: "Ministry of Electronics", amount: 150000, duration: "3 Years", status: "Ongoing" }
        ],
        placements: [
          { company: "Qualcomm", studentsPlaced: 14, packageLpa: 26.5 },
          { company: "Texas Instruments", studentsPlaced: 7, packageLpa: 24.0 },
          { company: "Intel", studentsPlaced: 11, packageLpa: 22.0 },
          { company: "TSMC", studentsPlaced: 3, packageLpa: 35.0 },
          { company: "Tata Communications", studentsPlaced: 22, packageLpa: 8.5 }
        ],
        events: [
          { name: "Semiconductor Design & Technology Summit", type: "Symposium", date: "2025-09-22", attendees: 220 },
          { name: "VLSI Architecture Hands-on Boot Camp", type: "Workshop", date: "2026-02-10", attendees: 80 }
        ],
        achievements: [
          { detail: "Dr. Marcus Thorne was elected as a Senior Member of IEEE.", recipient: "Dr. Marcus Thorne", category: "Fellowship" },
          { detail: "Rohit Nair received the Best Paper Award at the IEEE VLSI Symposium.", recipient: "Rohit Nair", category: "Research Award" }
        ]
      }
    },
    {
      id: "me",
      name: "Mechanical Engineering",
      head: "Dr. Sarah Sterling",
      facultyCount: 22,
      studentCount: 350,
      status: "Draft",
      lastUpdated: "2026-06-18",
      metrics: {
        publications: [
          { title: "Additive Manufacturing of Nickel-Titanium Shape Memory Alloys", authors: "S. Sterling, G. Dubois", venue: "Materials Science and Engineering A", year: 2025, citations: 42 },
          { title: "Topology Optimization of EV Battery Enclosures under Crash Loading", authors: "V. Nair, S. Sterling", venue: "International Journal of Automotive Tech", year: 2025, citations: 9 },
          { title: "Thermal Management Systems for High-Performance Lithium Batteries", authors: "K. Rao, A. Singh", venue: "Thermal Sciences Journal", year: 2026, citations: 4 }
        ],
        grants: [
          { title: "Laser-Based Directed Energy Deposition of Custom Medical Implants", agency: "Department of Biotechnology", amount: 290000, duration: "3 Years", status: "Ongoing" },
          { title: "Aerodynamic Drag Reduction for Electric Commercial Vehicles", agency: "Automotive Research Association", amount: 95000, duration: "1 Year", status: "Completed" }
        ],
        placements: [
          { company: "Tesla", studentsPlaced: 2, packageLpa: 45.0 },
          { company: "Ford Global", studentsPlaced: 8, packageLpa: 15.0 },
          { company: "Caterpillar", studentsPlaced: 12, packageLpa: 12.5 },
          { company: "Larsen & Toubro", studentsPlaced: 25, packageLpa: 7.5 },
          { company: "Tata Motors", studentsPlaced: 18, packageLpa: 9.0 }
        ],
        events: [
          { name: "National Seminar on Sustainable Manufacturing Trends", type: "Seminar", date: "2025-10-05", attendees: 140 },
          { name: "CAD/CAM Fusion Masterclass", type: "Workshop", date: "2026-04-12", attendees: 110 }
        ],
        achievements: [
          { detail: "Dr. Sarah Sterling received the ASME Excellence in Engineering Education Award.", recipient: "Dr. Sarah Sterling", category: "Faculty Award" },
          { detail: "Student Formula Hybrid team placed 3rd globally in efficiency design.", recipient: "ME Hybrid Racing Team", category: "Student Competition" }
        ]
      }
    },
    {
      id: "phy",
      name: "Department of Physics",
      head: "Dr. Alistair Vance",
      facultyCount: 12,
      studentCount: 110,
      status: "Approved",
      lastUpdated: "2026-06-08",
      metrics: {
        publications: [
          { title: "Coherent Spin Transport in Monolayer Transition Metal Dichalcogenides", authors: "A. Vance, C. Wu", venue: "Physical Review Letters", year: 2025, citations: 58 },
          { title: "Phase Transitions in High-Temperature Superconductors under Pressure", authors: "D. Miller, A. Vance", venue: "Nature Materials", year: 2025, citations: 84 },
          { title: "Entanglement Distribution in Hybrid Quantum Optical Networks", authors: "A. Vance, R. Sharma", venue: "Optical Society Letters", year: 2026, citations: 12 }
        ],
        grants: [
          { title: "Quantum Telemetry & Encryption at the Nanoscale", agency: "Defence Research Organization", amount: 600000, duration: "4 Years", status: "Ongoing" },
          { title: "Spectroscopic Profiling of Novel Two-Dimensional Crystals", agency: "Science & Engineering Research Board", amount: 180000, duration: "2 Years", status: "Ongoing" }
        ],
        placements: [
          { company: "IBM Quantum Lab", studentsPlaced: 2, packageLpa: 35.0 },
          { company: "TCS Research", studentsPlaced: 6, packageLpa: 11.5 },
          { company: "ASML", studentsPlaced: 1, packageLpa: 48.0 },
          { company: "Infosys", studentsPlaced: 10, packageLpa: 6.0 }
        ],
        events: [
          { name: "Colloquium on Quantum Foundations & Applications", type: "Seminar", date: "2025-08-14", attendees: 90 },
          { name: "Winter School on Condensed Matter Physics", type: "Workshop", date: "2025-12-18", attendees: 120 }
        ],
        achievements: [
          { detail: "Dr. Alistair Vance was awarded the prestigious Shanti Swarup Bhatnagar Prize.", recipient: "Dr. Alistair Vance", category: "National Award" }
        ]
      }
    },
    {
      id: "mba",
      name: "School of Business Administration",
      head: "Dr. Beatrice Thorne",
      facultyCount: 16,
      studentCount: 240,
      status: "Pending Review",
      lastUpdated: "2026-06-14",
      metrics: {
        publications: [
          { title: "Decentered Organizational Leadership in Remote Work Environments", authors: "B. Thorne, K. Patel", venue: "Harvard Business Review (Case)", year: 2025, citations: 12 },
          { title: "Predictive Analytics for Micro-investor Behaviors in Volatile Markets", authors: "T. Vance, J. Gupta", venue: "Journal of Financial Decision Making", year: 2025, citations: 19 },
          { title: "Sustainability Reporting Standards and Investor Valuation Models", authors: "B. Thorne, M. Ali", venue: "Academy of Management Journal", year: 2026, citations: 7 }
        ],
        grants: [
          { title: "Mapping Socio-economic Impact of Micro-credit in Rural Markets", agency: "United Nations Development Program", amount: 220000, duration: "2 Years", status: "Completed" },
          { title: "Agile Leadership Adaptations in Digital Banking Transformations", agency: "Apex Banking Group", amount: 85000, duration: "1 Year", status: "Ongoing" }
        ],
        placements: [
          { company: "McKinsey & Co", studentsPlaced: 4, packageLpa: 30.0 },
          { company: "Goldman Sachs", studentsPlaced: 6, packageLpa: 26.0 },
          { company: "Deloitte India", studentsPlaced: 18, packageLpa: 14.5 },
          { company: "HDFC Bank", studentsPlaced: 28, packageLpa: 10.0 },
          { company: "Amazon (Product Manager)", studentsPlaced: 5, packageLpa: 24.5 }
        ],
        events: [
          { name: "Global Business & Ethical Leadership Conclave", type: "Conference", date: "2025-09-10", attendees: 400 },
          { name: "Executive Panel on AI Ethics in Corporate Governance", type: "Panel", date: "2026-04-20", attendees: 180 }
        ],
        achievements: [
          { detail: "Dr. Beatrice Thorne appointed as Advisor to the State Economic Council.", recipient: "Dr. Beatrice Thorne", category: "Advisory" },
          { detail: "MBA Case Team won the National Wharton Case Competition Challenge.", recipient: "Sanya Roy, Dev Shah, Ryan Fernandes", category: "Student Competition" }
        ]
      }
    }
  ];

  const STORAGE_KEY = "annual_report_portal_data";

  window.PortalData = {
    defaultDepartmentsData,
    
    getDepartmentsData: function() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDepartmentsData));
        return defaultDepartmentsData;
      }
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing localStorage data, resetting to default", e);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDepartmentsData));
        return defaultDepartmentsData;
      }
    },
    
    saveDepartmentsData: function(data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },
    
    resetDepartmentsData: function() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDepartmentsData));
      return defaultDepartmentsData;
    }
  };
})();
