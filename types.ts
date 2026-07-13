/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MilestoneStatus = 'Completed' | 'Pending' | 'In Progress' | 'Not Required';
export type RAGStatus = 'Green' | 'Amber' | 'Red';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface MilestoneComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Milestone {
  no: number;
  name: string;
  startDate: string; // YYYY-MM-DD format or 'N/A'
  endDate: string;   // YYYY-MM-DD format or 'N/A'
  weightage: number; // percentage weight
  status: MilestoneStatus;
  rag: RAGStatus;
  remarks: string;
  checklist?: ChecklistItem[];
  comments?: MilestoneComment[];
}

export interface ProjectAttachment {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  fileData?: string; // Optional base64/mock content
}

export interface Project {
  id: string; // e.g., #PRJ-8821 or user-defined
  customerName: string;
  projectOwner: string;
  salesperson: string;
  goLiveDate: string; // DD-MM-YYYY format or similar
  status: 'Active' | 'Closed' | 'Delayed';
  milestones: Milestone[];
  createdAt: string;
  cobNumber?: string; // COB / Onboarding Number
  onboardingNumber?: string; // Custom Onboarding Identification Number
  attachments?: ProjectAttachment[];
}

export interface WeeklyTask {
  id: string;
  projectName: string;
  taskName: string;
  completed: boolean;
  dueDate: string;
}

export interface ClosedProject {
  id: string;
  projectName: string;
  owner: string;
  completionDate: string;
  status: 'ARCHIVED';
}

// Default 22 milestones template helper
export const DEFAULT_MILESTONES: Milestone[] = [
  { no: 1, name: 'Kick Off Meeting', startDate: '2025-10-23', endDate: '2025-10-23', weightage: 1, status: 'Completed', rag: 'Green', remarks: 'All stakeholders signed off.' },
  { no: 2, name: 'TRAACS Installation', startDate: '2025-10-27', endDate: '2025-10-27', weightage: 2, status: 'Completed', rag: 'Green', remarks: 'Installation verified.' },
  { no: 3, name: 'Scoping / Gap Analysis', startDate: '2025-10-28', endDate: '2025-11-05', weightage: 10, status: 'Completed', rag: 'Green', remarks: 'Requirements finalized.' },
  { no: 4, name: 'Basic Setup Configuration', startDate: '2025-11-06', endDate: '2025-11-15', weightage: 4, status: 'Completed', rag: 'Green', remarks: 'Setup verified with initial inputs.' },
  { no: 5, name: 'GDS Capture Configuration', startDate: 'N/A', endDate: 'N/A', weightage: 0, status: 'Not Required', rag: 'Green', remarks: 'Not in client scope.' },
  { no: 6, name: 'LCC Capture Configuration', startDate: 'N/A', endDate: 'N/A', weightage: 0, status: 'Not Required', rag: 'Green', remarks: 'Not in client scope.' },
  { no: 7, name: 'Print Format Configuration', startDate: '2025-11-16', endDate: '2025-11-25', weightage: 10, status: 'In Progress', rag: 'Green', remarks: 'They agreed for configured format, later asked customization. CR raised.' },
  { no: 8, name: 'Chart of Account Configuration', startDate: '2025-11-26', endDate: '2025-12-01', weightage: 10, status: 'Completed', rag: 'Green', remarks: 'Charts approved by finance lead.' },
  { no: 9, name: 'Supplier & Customer Configuration', startDate: '2025-11-26', endDate: '2025-12-10', weightage: 5, status: 'Completed', rag: 'Green', remarks: 'Data master synced.' },
  { no: 10, name: 'Document Number Settings Config.', startDate: '2025-11-06', endDate: '2025-11-06', weightage: 1, status: 'Completed', rag: 'Green', remarks: 'Default setting implemented.' },
  { no: 11, name: 'Training / User Acceptance Testing', startDate: '2025-11-11', endDate: '2025-12-18', weightage: 30, status: 'Completed', rag: 'Green', remarks: 'User training complete. High completion score.' },
  { no: 12, name: 'Tax Configuration', startDate: '2025-12-18', endDate: '2025-12-19', weightage: 3, status: 'Completed', rag: 'Green', remarks: 'Tax rules configured & verified.' },
  { no: 13, name: 'User Privileges Configuration', startDate: '2025-12-19', endDate: '2025-12-22', weightage: 1, status: 'Completed', rag: 'Green', remarks: 'Permissions set active.' },
  { no: 14, name: 'Kick Off with API Team', startDate: '2026-01-05', endDate: '2026-01-05', weightage: 2, status: 'Completed', rag: 'Green', remarks: 'CTX team reached out. Small delay occurred.' },
  { no: 15, name: 'Sandbox Setting', startDate: '2026-01-15', endDate: '2026-01-30', weightage: 2, status: 'Completed', rag: 'Green', remarks: 'Sandbox instance is up and testing.' },
  { no: 16, name: 'API Document Sharing', startDate: '2026-01-15', endDate: '2026-01-20', weightage: 1, status: 'Completed', rag: 'Green', remarks: 'Docs delivered to API integrations team.' },
  { no: 17, name: 'UAT', startDate: '2026-02-01', endDate: '2026-02-14', weightage: 5, status: 'Pending', rag: 'Green', remarks: 'Awaiting client internal sign-off.' },
  { no: 18, name: 'Live configurations', startDate: '2026-02-15', endDate: '2026-02-16', weightage: 2, status: 'Completed', rag: 'Green', remarks: 'Configuration loaded in Production.' },
  { no: 19, name: 'Trial Run', startDate: '2026-02-17', endDate: '2026-02-24', weightage: 7, status: 'In Progress', rag: 'Green', remarks: 'Active trial runs undergoing verification.' },
  { no: 20, name: 'Clean DB for Live', startDate: '2026-02-25', endDate: '2026-02-25', weightage: 1, status: 'Pending', rag: 'Green', remarks: 'D-day script ready.' },
  { no: 21, name: 'Pre Live Checklist Verification', startDate: '2026-02-26', endDate: '2026-02-27', weightage: 1, status: 'Pending', rag: 'Green', remarks: 'Checklist to be reviewed by Lead & PM.' },
  { no: 22, name: 'Go Live', startDate: '2026-03-01', endDate: '2026-03-01', weightage: 2, status: 'Pending', rag: 'Green', remarks: 'Launch event scheduling pending.' }
];

// Phase summary data from Image 3 template
export interface TrainingPhaseSummary {
  phase: string;
  category: string;
  days: string;
  sessions: number;
  keyModules: string;
  focusArea: string;
  colorClass: string; // for background color tags in UI
}

export const TRAINING_PHASES: TrainingPhaseSummary[] = [
  { phase: 'Phase 0', category: 'PRE-TRAINING', days: 'Scoping', sessions: 1, keyModules: 'Requirement Discussion, Market Study', focusArea: 'Project Scoping & Planning', colorClass: 'bg-slate-500 text-white' },
  { phase: 'Phase 1', category: 'HOME', days: 'Day 1', sessions: 1, keyModules: 'COA, Company, Department, Financial Year', focusArea: 'System Setup & Configuration', colorClass: 'bg-emerald-600 text-white' },
  { phase: 'Phase 2', category: 'MASTER', days: 'Day 2', sessions: 1, keyModules: 'Partners, Bank, Currency, ROE Settings', focusArea: 'Master Data Configuration', colorClass: 'bg-indigo-600 text-white' },
  { phase: 'Phase 3', category: 'FRONT OFFICE', days: 'Day 3–4', sessions: 2, keyModules: 'Tickets, Refund, Void, Advance Receipt', focusArea: 'Transactional Front-End', colorClass: 'bg-orange-600 text-white' },
  { phase: 'Phase 4', category: 'BACK OFFICE', days: 'Day 5–9', sessions: 5, keyModules: 'Invoice, Payment, Journals, BSP, ADM/ACM', focusArea: 'Back-End Accounting Workflows', colorClass: 'bg-amber-600 text-white' },
  { phase: 'Phase 5', category: 'BACK OFFICE', days: 'Day 10', sessions: 1, keyModules: 'Non-BSP, Supplier, Corporate Card, Bank Recon', focusArea: 'Reconciliation', colorClass: 'bg-amber-700 text-white' },
  { phase: 'Phase 6', category: 'VAT', days: 'Day 11', sessions: 1, keyModules: 'Posting Approval, Input/Output VAT, VAT Submission', focusArea: 'Tax Compliance', colorClass: 'bg-cyan-700 text-white' },
  { phase: 'Phase 7', category: 'ASSETS', days: 'Day 12', sessions: 1, keyModules: 'Asset Master, Purchase, Depreciation, Sales, Write Off', focusArea: 'Fixed Asset Management', colorClass: 'bg-purple-600 text-white' },
  { phase: 'Phase 8', category: 'TOOLS', days: 'Day 13', sessions: 1, keyModules: 'Search, Queries, Audit, Import, Locking', focusArea: 'System Tools & Admin', colorClass: 'bg-blue-600 text-white' },
  { phase: 'Phase 9', category: 'REPORTS', days: 'Day 14', sessions: 1, keyModules: 'Customer, Sales, Financial, Management Reports', focusArea: 'Reporting & Analytics', colorClass: 'bg-green-600 text-white' }
];

export interface AppUser {
  username: string;
  name: string;
  role: 'Administrator' | 'Project Owner' | 'Lead' | 'Salesperson';
  password?: string;
  email?: string;
  status?: 'Active' | 'Pending Password Invite';
  avatar?: string;
}

export interface ProjectOwnerDetail {
  id: string;
  name: string;
  leadName: string; // The lead assigned to this project owner
  department?: string;
  contact?: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  username: string;
  token: string;
  status: 'Pending Set' | 'Password Configured';
}

