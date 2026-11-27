/**
 * Mock data and JSDoc type definitions for Member 08 (Reports, Approvals & Activity).
 * Structured cleanly so it can be replaced by Appwrite shared services later.
 */

/**
 * @typedef {"inventory" | "store" | "maintenance" | "departmental"} ReportCategoryId
 * @typedef {"Pending" | "Approved" | "Rejected"} ApprovalStatus
 *
 * @typedef {Object} ReportSummaryMetric
 * @property {string} label
 * @property {string} value
 * @property {string} note
 *
 * @typedef {Object} ReportCategory
 * @property {ReportCategoryId} id
 * @property {string} title
 * @property {string} subtitle
 * @property {string} lastGenerated
 * @property {ReportSummaryMetric[]} summary
 * @property {string[]} columns
 * @property {Array<Record<string, string | number>>} rows
 *
 * @typedef {Object} ApprovalRequest
 * @property {string} id
 * @property {string} applicantName
 * @property {string} department
 * @property {string} requestedItem
 * @property {number} quantity
 * @property {string} requestDate
 * @property {"High" | "Medium" | "Low"} priority
 * @property {ApprovalStatus} status
 * @property {string} justification
 * @property {string} [remarks]
 * @property {string} [reviewedBy]
 * @property {string} [reviewedAt]
 *
 * @typedef {Object} AuditEntry
 * @property {string} id
 * @property {string} actor
 * @property {string} actorRole
 * @property {string} action
 * @property {"Approval" | "Report" | "Inventory" | "Store" | "Maintenance"} category
 * @property {string} target
 * @property {string} changeSummary
 * @property {string} timestamp
 */

/** @type {string[]} */
export const REPORT_DEPARTMENTS = [
  "All Departments",
  "IT Division",
  "Legal Division",
  "Patent Examination",
  "Trademark Registry",
  "Administration",
  "Main Store",
];

/** @type {string[]} */
export const REPORT_PERIODS = [
  "Current Quarter (Q4 2026)",
  "Last 30 Days",
  "FY 2026 Full Year",
];

/** @type {ReportCategory[]} */
export const REPORT_CATEGORIES = [
  {
    id: "inventory",
    title: "Inventory Summary",
    subtitle: "Active, assigned, and retired IT assets across NIPO divisions.",
    lastGenerated: "Today, 09:30 AM",
    summary: [
      { label: "Total Registered", value: "148", note: "All IT hardware" },
      { label: "Assigned", value: "112", note: "75.7% utilization" },
      { label: "Available", value: "24", note: "Ready for issue" },
      { label: "Under Repair / Retired", value: "12", note: "8 repair · 4 retired" },
    ],
    columns: ["Asset Code", "Equipment", "Department", "Assignee", "Status", "Period"],
    rows: [
      {
        "Asset Code": "NIPO-LT-042",
        Equipment: "Dell Latitude 5440",
        Department: "Legal Division",
        Assignee: "S. Perera",
        Status: "Assigned",
        Period: "Current Quarter (Q4 2026)",
      },
      {
        "Asset Code": "NIPO-PC-019",
        Equipment: "HP ProDesk 400 G9",
        Department: "Patent Examination",
        Assignee: "K. Wickramasinghe",
        Status: "Assigned",
        Period: "Current Quarter (Q4 2026)",
      },
      {
        "Asset Code": "NIPO-MN-088",
        Equipment: 'Dell 24" P2422H Monitor',
        Department: "Trademark Registry",
        Assignee: "R. Jayasuriya",
        Status: "Available",
        Period: "Last 30 Days",
      },
      {
        "Asset Code": "NIPO-PR-018",
        Equipment: "Canon imageRUNNER 2625i",
        Department: "Administration",
        Assignee: "Shared Floor 2",
        Status: "Maintenance",
        Period: "Last 30 Days",
      },
      {
        "Asset Code": "NIPO-NW-007",
        Equipment: "Cisco Catalyst 2960-X",
        Department: "IT Division",
        Assignee: "Server Room",
        Status: "Assigned",
        Period: "FY 2026 Full Year",
      },
    ],
  },
  {
    id: "store",
    title: "Store & Stock Report",
    subtitle: "Consumables, spare peripherals, and reorder threshold alerts.",
    lastGenerated: "Today, 08:45 AM",
    summary: [
      { label: "Tracked SKUs", value: "36", note: "Active store items" },
      { label: "Healthy Stock", value: "29", note: "Above threshold" },
      { label: "Low Stock Alerts", value: "5", note: "Needs replenishment" },
      { label: "Out of Stock", value: "2", note: "Urgent reorder" },
    ],
    columns: ["SKU", "Item Name", "Department", "On Hand", "Reorder Level", "Period"],
    rows: [
      {
        SKU: "STR-TON-85A",
        "Item Name": "HP 85A Black Toner",
        Department: "Main Store",
        "On Hand": "4 units",
        "Reorder Level": "8 units (Low)",
        Period: "Current Quarter (Q4 2026)",
      },
      {
        SKU: "STR-MON-24",
        "Item Name": '24" IPS Office Monitor',
        Department: "Main Store",
        "On Hand": "14 units",
        "Reorder Level": "5 units (OK)",
        Period: "Last 30 Days",
      },
      {
        SKU: "STR-SSD-512",
        "Item Name": "512GB NVMe Upgrade Kit",
        Department: "IT Division",
        "On Hand": "9 units",
        "Reorder Level": "4 units (OK)",
        Period: "Current Quarter (Q4 2026)",
      },
      {
        SKU: "STR-ETH-C6",
        "Item Name": "Cat6 Patch Cord (3m)",
        Department: "IT Division",
        "On Hand": "0 units",
        "Reorder Level": "15 units (Out)",
        Period: "Last 30 Days",
      },
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance & Warranty",
    subtitle: "Service turnaround, repairs, and upcoming warranty expirations.",
    lastGenerated: "Yesterday, 04:15 PM",
    summary: [
      { label: "Open Tickets", value: "6", note: "2 high priority" },
      { label: "Completed (MTD)", value: "14", note: "Avg 2.4 days" },
      { label: "Expiring in 60d", value: "9", note: "Warranty review" },
      { label: "Hardware Upgrades", value: "11", note: "RAM / SSD" },
    ],
    columns: ["Ticket ID", "Device", "Department", "Issue / Action", "Status", "Period"],
    rows: [
      {
        "Ticket ID": "MNT-2026-041",
        Device: "Canon imageRUNNER 2625i",
        Department: "Administration",
        "Issue / Action": "Paper feed roller replacement",
        Status: "Completed",
        Period: "Last 30 Days",
      },
      {
        "Ticket ID": "MNT-2026-044",
        Device: "Lenovo ThinkPad T14",
        Department: "Patent Examination",
        "Issue / Action": "16GB RAM + thermal paste service",
        Status: "In Progress",
        Period: "Current Quarter (Q4 2026)",
      },
      {
        "Ticket ID": "MNT-2026-046",
        Device: "Epson EcoTank L6290",
        Department: "Trademark Registry",
        "Issue / Action": "Printhead alignment & cleaning",
        Status: "Scheduled",
        Period: "Last 30 Days",
      },
      {
        "Ticket ID": "MNT-2026-039",
        Device: "APC Smart-UPS 1500VA",
        Department: "IT Division",
        "Issue / Action": "Battery module replacement",
        Status: "Completed",
        Period: "FY 2026 Full Year",
      },
    ],
  },
  {
    id: "departmental",
    title: "Departmental Allocation",
    subtitle: "Equipment distribution and annual request utilization by division.",
    lastGenerated: "Today, 10:05 AM",
    summary: [
      { label: "Divisions Covered", value: "6", note: "All NIPO units" },
      { label: "Top Allocation", value: "38", note: "Patent Examination" },
      { label: "Pending Requests", value: "4", note: "Awaiting IT sign-off" },
      { label: "Rollover Items", value: "8", note: "Carried to next year" },
    ],
    columns: ["Department", "Assigned Devices", "Pending Requests", "Budget Utilized", "Period"],
    rows: [
      {
        Department: "Patent Examination",
        "Assigned Devices": "38",
        "Pending Requests": "2",
        "Budget Utilized": "82%",
        Period: "Current Quarter (Q4 2026)",
      },
      {
        Department: "Trademark Registry",
        "Assigned Devices": "29",
        "Pending Requests": "1",
        "Budget Utilized": "74%",
        Period: "Current Quarter (Q4 2026)",
      },
      {
        Department: "Legal Division",
        "Assigned Devices": "19",
        "Pending Requests": "1",
        "Budget Utilized": "68%",
        Period: "Last 30 Days",
      },
      {
        Department: "Administration",
        "Assigned Devices": "16",
        "Pending Requests": "0",
        "Budget Utilized": "61%",
        Period: "FY 2026 Full Year",
      },
      {
        Department: "IT Division",
        "Assigned Devices": "10",
        "Pending Requests": "0",
        "Budget Utilized": "90%",
        Period: "FY 2026 Full Year",
      },
    ],
  },
];

/** @type {ApprovalRequest[]} */
export const INITIAL_APPROVAL_REQUESTS = [
  {
    id: "REQ-2026-014",
    applicantName: "N. Fernando",
    department: "Patent Examination",
    requestedItem: "Dell Latitude 5440 Laptop",
    quantity: 2,
    requestDate: "2026-11-26",
    priority: "High",
    status: "Pending",
    justification: "New patent examiners onboarding in December 2026.",
  },
  {
    id: "REQ-2026-015",
    applicantName: "S. Perera",
    department: "Legal Division",
    requestedItem: '24" Dual Monitor Kit',
    quantity: 3,
    requestDate: "2026-11-25",
    priority: "Medium",
    status: "Pending",
    justification: "Required for side-by-side case document review.",
  },
  {
    id: "REQ-2026-016",
    applicantName: "R. Jayasuriya",
    department: "Trademark Registry",
    requestedItem: "HP 85A Toner Cartridges",
    quantity: 6,
    requestDate: "2026-11-24",
    priority: "High",
    status: "Pending",
    justification: "Registry certificate printing queue running low.",
  },
  {
    id: "REQ-2026-017",
    applicantName: "D. Gunasekara",
    department: "Administration",
    requestedItem: "APC Back-UPS 650VA",
    quantity: 4,
    requestDate: "2026-11-22",
    priority: "Low",
    status: "Pending",
    justification: "Backup power for front-desk reception terminals.",
  },
  {
    id: "REQ-2026-011",
    applicantName: "K. Wickramasinghe",
    department: "Patent Examination",
    requestedItem: "16GB DDR4 RAM Upgrade",
    quantity: 5,
    requestDate: "2026-11-18",
    priority: "Medium",
    status: "Approved",
    justification: "Performance upgrade for patent search workstations.",
    remarks: "Approved from existing Main Store stock.",
    reviewedBy: "Omindu Amarasingha",
    reviewedAt: "2026-11-19 10:15 AM",
  },
];

/** @type {AuditEntry[]} */
export const INITIAL_AUDIT_LOGS = [
  {
    id: "AUD-1042",
    actor: "Omindu Amarasingha",
    actorRole: "IT Officer",
    action: "Approved Request",
    category: "Approval",
    target: "REQ-2026-011",
    changeSummary: "Status changed Pending → Approved (5 × 16GB DDR4 RAM Upgrade)",
    timestamp: "2026-11-27 10:15 AM",
  },
  {
    id: "AUD-1041",
    actor: "Oshani Umesha",
    actorRole: "Store Keeper",
    action: "Issued Store Stock",
    category: "Store",
    target: "STR-MON-24",
    changeSummary: "Issued 4 × 24\" IPS Monitors to Legal Division (Qty 18 → 14)",
    timestamp: "2026-11-27 09:18 AM",
  },
  {
    id: "AUD-1040",
    actor: "Yehan C. Fernando",
    actorRole: "IT Technician",
    action: "Completed Maintenance",
    category: "Maintenance",
    target: "MNT-2026-041",
    changeSummary: "Canon imageRUNNER 2625i marked Completed after roller replacement",
    timestamp: "2026-11-26 03:26 PM",
  },
  {
    id: "AUD-1039",
    actor: "Samadhi Dewmini",
    actorRole: "HR / Asset Coordinator",
    action: "Assigned Equipment",
    category: "Inventory",
    target: "NIPO-LT-042",
    changeSummary: "Assigned Dell Latitude 5440 to S. Perera (Legal Division)",
    timestamp: "2026-11-26 11:40 AM",
  },
  {
    id: "AUD-1038",
    actor: "Omindu Amarasingha",
    actorRole: "IT Officer",
    action: "Exported Report",
    category: "Report",
    target: "Departmental Allocation",
    changeSummary: "Generated CSV snapshot for Q4 2026 management review",
    timestamp: "2026-11-25 04:50 PM",
  },
];
