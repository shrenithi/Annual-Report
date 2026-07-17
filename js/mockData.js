/**
 * Pre-filled Mock Database schemas for the Annual Report Management System.
 * Contains user credentials, roles, calendar milestones, department statistics,
 * notifications feed, and activity log records.
 */

const defaultUsers = [
  {
    username: "admin",
    password: "admin123",
    name: "System Super Admin",
    role: "Super Admin",
    department: "All",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60"
  },
  {
    username: "principal",
    password: "principal123",
    name: "Dr. C. Vennila",
    role: "Principal",
    department: "All",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=60"
  },
  {
    username: "hod_cse",
    password: "hod123",
    name: "Dr. Logesh K.",
    role: "HOD",
    department: "cse",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=60"
  },
  {
    username: "hod_ece",
    password: "hod123",
    name: "Dr. Rani M.",
    role: "HOD",
    department: "ece",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60"
  },
  {
    username: "hod_me",
    password: "hod123",
    name: "Dr. Venkatesh P.",
    role: "HOD",
    department: "me",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60"
  },
  {
    username: "hod_civil",
    password: "hod123",
    name: "Dr. Sumitha S.",
    role: "HOD",
    department: "civil",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=60"
  },
  {
    username: "faculty_cse",
    password: "faculty123",
    name: "Dr. Sandeep Patel",
    role: "Faculty",
    department: "cse",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60"
  },
  {
    username: "faculty_ece",
    password: "faculty123",
    name: "Dr. Gomez Addams",
    role: "Faculty",
    department: "ece",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&auto=format&fit=crop&q=60"
  },
  {
    username: "emp/8788",
    password: "bala/8788",
    name: "Bala",
    role: "Faculty",
    department: "cse",
    designation: "Assistant Professor",
    email: "balu8788@gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60"
  }
];

const defaultDepartmentsData = [
  {
    id: "cse",
    name: "Computer Science & Engineering",
    head: "Dr. Logesh K.",
    facultyCount: 28,
    studentCount: 420,
    status: "Approved",
    lastUpdated: "2026-06-15",
    progress: 100,
    approvalHistory: [
      { step: "Draft", user: "faculty_cse", timestamp: "2026-06-01 09:30", comment: "Report initialization." },
      { step: "Submitted", user: "faculty_cse", timestamp: "2026-06-05 14:15", comment: "Ready for HOD review." },
      { step: "Under Review", user: "hod_cse", timestamp: "2026-06-08 11:20", comment: "Data integrity verification in progress." },
      { step: "Approved", user: "principal", timestamp: "2026-06-15 16:45", comment: "Approved for publication. Good progress in AI research." }
    ],
    signatures: {
      hod: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAAC5qT3fAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAET0lEQVR4nO2aW2gcVRiA/5nZ7KZpsmlsoqFpEkspVSpEqFCoqIhQrGBF0YrghV4IL/RBfPDBB/VBrAVfKioivtQHEV/0pUhRkFpFLKUpVlujSTW2SZs2Te87O3t82Nlkd+7OTGZnd5P6w7DsOXv+M//8//nPnLPD53NEiBAhQoQIESJEiBAhQoQIESJEPg/0sAsoFxrWb1Fz82wE90K1Q22A/4U6AN0K7YW6m31eC6oJ6gao81AfMvdV14ZdVzkQ01B72O8H1XGou5jngK4h+8d2eG3I2rCrKjdiGuoGphc+Wc48m9nve93xK6hBqB1QLwB9C/UpUPtsbKscCG/D/E30TzN/D1TnrFwf1HbMe0v326GWoR5lVqscCDfE74L/OfNPoG5iuWao26Gq8zO8BvQy0B02tpUDUbgP/N/YfxfUZ1g+GvK2eD+v+12o70G9AfSMjW2VA2GGPAb+CZYfAfUdLI8CPWpjmxdULdTbQDdD/W5jW+VAWCEPgn+S5cdBfWnI48CXbWzbDLUH6naoO21sqxwIG+Qx8L8CehbU97D8GfBLNraVgHwTqAb1qI1tlQOhhjwC/vegzjL/G6ifY3nAxrbVULtZbg3Ukza2VQ5EyfDHMH/XlJ8A/S2Ww8CXbWzzgqpE3gp1N9T9NrZVDkTJ8K2GfA70t1gOm9+9NrbNhdoAdTvUN21sqxwIN8Sz4H8K9CzLD4K+ZWPbaqiDULdDfcPGtsoBoYfU2O/3hvwY6Ds2ti2GepTlR0HfVjkQfIgfAf8E+F8AvQfKx/I7wFdtbFsK9S2oL1BvhLrBxrYyIIzQx8G/B+oLQLdCnWL5W9C32NhWDPVrqNdRz0P92sa2MoAQQtpP91vN3z/lNwHfZWNbf6gDLPca6kMb28oA/wY6BPXyXg70LdDPgV4FesjGtv5Qh1huG/QjG9sqB2LhNnE3/H9D/g3UeZbfZvkV0L/Z2PYV1I9QLwLdDvUbG9sqBiL7H8P87SZfB30b6D5YvgL6LxvbfsL/HvVDoOehfmJjW8VA/Ge112lIn/lXQe+HmsJyc+Z/AfWkjW1zoX4H+kcoD/VrG9sqB+Ld1T6vIa8CegDqy8xfw78Neq+NbZuhHge6B/RxNrfXy4H43WpP0JDvgXoB6Enmt0C1F/XvU3/x6/x8G2Y/D/Qj0GNAr9jYVjkQi+5u6jTksfmthPoJ88+Avmt+a3DvfQzqNdBHQLfbeP7nQEzc3dRpSAvUBdb3hWovfF1Q51cQJ0M9w3KPMb8FqsHGtsoBeZ+b4jSkifmdUP2H+V9AfYp575b6qg1ZAfUgy/WCepC0t7GtcjC5T7Tf71L+P6EexfJzUN/E8kcoD9tQx1BvoV7E/D0sN9jYVjkQx45vK6CHmP8J5RuoL7EcAPVb0LfA/G+hvoLyj6D+a2Nb5UBk/0P3u+BfAfW1+Q/C//qO874XjF9hfr2NbeVA3H9se4n9vg/qIyz/APXvK/BfB/2VbV1Qj7Dcy1AvAv0t2xrlQPx+tc9r/t+A11gf3v0J9A7Q/wP7j3qXyvUUkAAAAABJRU5ErkJggg=="
    }
  },
  {
    id: "ece",
    name: "Electronics & Communication Engineering",
    head: "Dr. Rani M.",
    facultyCount: 24,
    studentCount: 380,
    status: "Pending Review",
    lastUpdated: "2026-06-17",
    progress: 85,
    approvalHistory: [
      { step: "Draft", user: "faculty_ece", timestamp: "2026-06-03 10:10", comment: "Report structure setup." },
      { step: "Submitted", user: "faculty_ece", timestamp: "2026-06-10 16:30", comment: "Submitted with updated placement and VLSI event metrics." },
      { step: "Under Review", user: "hod_ece", timestamp: "2026-06-17 09:15", comment: "Awaiting final confirmation from Placement Cell." }
    ],
    signatures: {
      hod: null
    },
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
      ],
      patents: [
        { title: "Multiband Antenna Structure for Sub-6GHz Devices", inventor: "Dr. Marcus Thorne", regNumber: "PAT/4059/2025", status: "Published", year: 2025 },
        { title: "Smart Mesh Node for Agricultural Irrigation Control", inventor: "Dr. Gomez Addams", regNumber: "PAT/1120/2026", status: "Filed", year: 2026 }
      ],
      consultancy: [
        { client: "Sigma Semiconductor Inc", project: "Low Power Analog IC Layout", value: 180000, status: "Completed" }
      ],
      alumni: [
        { name: "Priya Sharma", batch: "2022", currentCompany: "Apple Inc. (California)", packageLpa: 65.0 },
        { name: "Anand Verma", batch: "2023", currentCompany: "Qualcomm (Bangalore)", packageLpa: 28.5 }
      ],
      studentPerformance: {
        passPercentage: 92.4,
        averageGpa: 8.2
      }
    }
  },
  {
    id: "me",
    name: "Mechanical Engineering",
    head: "Dr. Venkatesh P.",
    facultyCount: 22,
    studentCount: 350,
    status: "Draft",
    lastUpdated: "2026-06-18",
    progress: 60,
    approvalHistory: [
      { step: "Draft", user: "faculty_cse", timestamp: "2026-06-18 10:00", comment: "Initial report draft." }
    ],
    signatures: {
      hod: null
    },
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
      ],
      patents: [
        { title: "Crash-Resistant Honeycomb Chassis Configuration", inventor: "V. Nair", regNumber: "PAT/3392/2025", status: "Granted", year: 2025 }
      ],
      consultancy: [
        { client: "Dynamic Motors Ltd", project: "Electric Drivetrain Thermal Optimization", value: 340000, status: "Ongoing" }
      ],
      alumni: [
        { name: "Vikram Malhotra", batch: "2021", currentCompany: "Tesla (Berlin)", packageLpa: 52.0 }
      ],
      studentPerformance: {
        passPercentage: 88.5,
        averageGpa: 7.6
      }
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
    progress: 100,
    approvalHistory: [
      { step: "Draft", user: "principal", timestamp: "2026-06-02 08:30", comment: "Report setup." },
      { step: "Approved", user: "principal", timestamp: "2026-06-08 14:30", comment: "Approved. Exceptional research papers citations." }
    ],
    signatures: {
      hod: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAAC5qT3fAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAET0lEQVR4nO2aW2gcVRiA/5nZ7KZpsmlsoqFpEkspVSpEqFCoqIhQrGBF0YrghV4IL/RBfPDBB/VBrAVfKioivtQHEV/0pUhRkFpFLKUpVlujSTW2SZs2Te87O3t82Nlkd+7OTGZnd5P6w7DsOXv+M//8//nPnLPD53NEiBAhQoQIESJEiBAhQoQIESJEPg/0sAsoFxrWb1Fz82wE90K1Q22A/4U6AN0K7YW6m31eC6oJ6gao81AfMvdV14ZdVzkQ01B72O8H1XGou5jngK4h+8d2eG3I2rCrKjdiGuoGphc+Wc48m9nve93xK6hBqB1QLwB9C/UpUPtsbKscCG/D/E30TzN/D1TnrFwf1HbMe0v326GWoR5lVqscCDfE74L/OfNPoG5iuWao26Gq8zO8BvQy0B02tpUDUbgP/N/YfxfUZ1g+GvK2eD+v+12o70G9AfSMjW2VA2GGPAb+CZYfAfUdLI8CPWpjmxdULdTbQDdD/W5jW+VAWCEPgn+S5cdBfWnI48CXbWzbDLUH6naoO21sqxwIG+Qx8L8CehbU97D8GfBLNraVgHwTqAb1qI1tlQOhhjwC/vegzjL/G6ifY3nAxrbVULtZbg3Ukza2VQ5EyfDHMH/XlJ8A/S2Ww8CXbWzzgqpE3gp1N9T9NrZVDkTJ8K2GfA70t1gOm9+9NrbNhdoAdTvUN21sqxwIN8Sz4H8K9CzLD4K+ZWPbaqiDULdDfcPGtsoBoYfU2O/3hvwY6Ds2ti2GepTlR0HfVjkQfIgfAf8E+F8AvQfKx/I7wFdtbFsK9S2oL1BvhLrBxrYyIIzQx8G/B+oLQLdCnWL5W9C32NhWDPVrqNdRz0P92sa2MoAQQtpP91vN3z/lNwHfZWNbf6gDLPca6kMb28oA/wY6BPXyXg70LdDPgV4FesjGtv5Qh1huG/QjG9sqB2LhNnE3/H9D/g3UeZbfZvkV0L/Z2PYV1I9QLwLdDvUbG9sqBiL7H8P87SZfB30b6D5YvgL6LxvbfsL/HvVDoOehfmJjW8VA/Ge112lIn/lXQe+HmsJyc+Z/AfWkjW1zoX4H+kcoD/VrG9sqB+Ld1T6vIa8CegDqy8xfw78Neq+NbZuhHge6B/RxNrfXy4H43WpP0JDvgXoB6Enmt0C1F/XvU3/x6/x8G2Y/D/Qj0GNAr9jYVjkQi+5u6jTksfmthPoJ88+Avmt+a3DvfQzqNdBHQLfbeP7nQEzc3dRpSAvUBdb3hWovfF1Q51cQJ0M9w3KPMb8FqsHGtsoBeZ+b4jSkifmdUP2H+V9AfYp575b6qg1ZAfUgy/WCepC0t7GtcjC5T7Tf71L+P6EexfJzUN/E8kcoD9tQx1BvoV7E/D0sN9jYVjkQx45vK6CHmP8J5RuoL7EcAPVb0LfA/G+hvoLyj6D+a2Nb5UBk/0P3u+BfAfW1+Q/C//qO874XjF9hfr2NbeVA3H9se4n9vg/qIyz/APXvK/BfB/2VbV1Qj7Dcy1AvAv0t2xrlQPx+tc9r/t+A11gf3v0J9A7Q/wP7j3qXyvUUkAAAAABJRU5ErkJggg=="
    },
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
      ],
      patents: [],
      consultancy: [],
      alumni: [
        { name: "Rohan Kapoor", batch: "2020", currentCompany: "CERN (Geneva)", packageLpa: 58.0 }
      ],
      studentPerformance: {
        passPercentage: 94.2,
        averageGpa: 8.5
      }
    }
  },
  {
    id: "civil",
    name: "Civil Engineering",
    head: "Dr. Sumitha S.",
    facultyCount: 16,
    studentCount: 240,
    status: "Pending Review",
    lastUpdated: "2026-06-14",
    progress: 90,
    approvalHistory: [
      { step: "Draft", user: "faculty_cse", timestamp: "2026-06-10 11:30", comment: "Report setup." },
      { step: "Submitted", user: "faculty_cse", timestamp: "2026-06-14 15:45", comment: "Ready for check." }
    ],
    signatures: {
      hod: null
    },
    metrics: {
      publications: [
        { title: "Decentered Organizational Leadership in Remote Work Environments", authors: "B. Thorne, K. Patel", venue: "Harvard Business Review (Case)", year: 2025, citations: 12 },
        { title: "Predictive Analytics for Micro-investor Behavior in Volatile Markets", authors: "T. Vance, J. Gupta", venue: "Journal of Financial Decision Making", year: 2025, citations: 19 },
        { title: "Identity Reporting Standards and Investor Valuation Models", authors: "B. Thorne, M. Ali", venue: "Academy of Management Journal", year: 2026, citations: 7 }
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
      ],
      patents: [],
      consultancy: [
        { client: "National Retails Corp", project: "Supply Chain Rationalization Study", value: 150000, status: "Completed" }
      ],
      alumni: [
        { name: "Sanya Sen", batch: "2023", currentCompany: "McKinsey (Mumbai)", packageLpa: 24.0 }
      ],
      studentPerformance: {
        passPercentage: 96.0,
        averageGpa: 8.7
      }
    }
  }
];

const defaultCalendarEvents = [
  { id: "cal_1", title: "Faculty Submission Deadline", type: "deadline", date: "2026-07-15", department: "All" },
  { id: "cal_2", title: "HOD Evaluation Window", type: "event", date: "2026-07-20", department: "All" },
  { id: "cal_3", title: "Principal Sign-off Deadline", type: "deadline", date: "2026-07-30", department: "All" },
  { id: "cal_4", title: "International Conference (CSE)", type: "conference", date: "2026-07-18", department: "cse" },
  { id: "cal_5", title: "VLSI Designing Workshop (ECE)", type: "workshop", date: "2026-07-22", department: "ece" }
];

const defaultSystemNotifications = [
  { id: "not_1", message: "Annual Report submission window is now open for AY 2025-2026.", type: "announcement", timestamp: "2026-06-01 09:00", read: false },
  { id: "not_2", message: "ECE Department report has been submitted by HOD for Review.", type: "submission", timestamp: "2026-06-17 09:20", read: false },
  { id: "not_3", message: "CSE Department report was Approved by Principal.", type: "approval", timestamp: "2026-06-15 16:50", read: true }
];

const defaultActivityLogs = [
  { id: "log_1", username: "hod_cse", action: "Approved CSE draft and forwarded to Principal", timestamp: "2026-06-14 11:20" },
  { id: "log_2", username: "principal", action: "Signed and Published CSE Annual Report", timestamp: "2026-06-15 16:45" },
  { id: "log_3", username: "faculty_ece", action: "Modified ECE placement stats for Qualcomm", timestamp: "2026-06-17 09:10" }
];
const defaultSystemSettings = {
  instituteName: "Sakthi Engineering College, Trichy",
  logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='40' height='40'><rect x='3' y='3' width='18' height='18' rx='4' fill='url(%23g)'/><path d='M12 6l5 10H7l5-10z' fill='%23fff'/><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%231e3a8a'/><stop offset='1' stop-color='%230ea5e9'/></linearGradient></defs></svg>",
  academicYear: "2025-2026",
  reportTheme: "naac",
  defaultTemplate: "naac",
  reportHeader: "Sakthi Engineering College, Trichy - Integrated Annual Report",
  reportFooter: "Generated by Sakthi Accreditation System"
};

// Bind to window to share globally
window.defaultUsers = defaultUsers;
window.defaultDepartmentsData = defaultDepartmentsData;
window.defaultCalendarEvents = defaultCalendarEvents;
window.defaultSystemNotifications = defaultSystemNotifications;
window.defaultActivityLogs = defaultActivityLogs;
window.defaultSystemSettings = defaultSystemSettings;
