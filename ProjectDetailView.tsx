/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect, Fragment } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  History, 
  Clock, 
  CalendarDays,
  Sparkles,
  Link2,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  Send
} from 'lucide-react';
import { Project, Milestone, MilestoneStatus, RAGStatus, ChecklistItem, MilestoneComment } from '../types';
import { downloadAiReportWord, downloadAiReportPdf, downloadCustomReportPdf, downloadCustomReportExcel, downloadCustomReportWord } from '../utils/reportGenerator';
import { addWorkingDays, getNextWorkingDay, sequenceMilestonesFromKickoff } from '../utils/dateUtils';

function formatToDDMMYYYY(dateStr: string): string {
  if (!dateStr || dateStr === 'N/A' || dateStr === '—' || dateStr === '') return dateStr || '—';
  
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      return dateStr; // already DD-MM-YYYY
    }
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch (e) {}

  return dateStr;
}

function parseDateForComparison(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'N/A' || dateStr === '—' || dateStr === '') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(d.getTime())) return d;
    } else {
      // DD-MM-YYYY
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      if (!isNaN(d.getTime())) return d;
    }
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? null : fallback;
}

interface ProjectDetailViewProps {
  project: Project;
  allProjects?: Project[];
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
  onDownloadProjectReport: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  currentActiveUser?: any;
}

export default function ProjectDetailView({ 
  project, 
  allProjects = [],
  onBack, 
  onUpdateProject,
  onDownloadProjectReport,
  onDeleteProject,
  currentActiveUser
}: ProjectDetailViewProps) {

  // Selected Milestone for Editing state
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  // Checklist state inside milestone editor
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistItemText, setNewChecklistItemText] = useState('');

  // Comments state inside milestone editor
  const [milestoneComments, setMilestoneComments] = useState<MilestoneComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Row expansion state
  const [expandedMilestoneNo, setExpandedMilestoneNo] = useState<number | null>(null);

  // Bulk Selection and Update states
  const [selectedMilestones, setSelectedMilestones] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<MilestoneStatus>('Completed');
  const [bulkRAG, setBulkRAG] = useState<RAGStatus>('Green');

  useEffect(() => {
    setSelectedMilestones([]);
  }, [project.id]);

  const handleBulkUpdate = () => {
    if (selectedMilestones.length === 0) return;

    const updatedMilestones = project.milestones.map(m => {
      if (selectedMilestones.includes(m.no)) {
        return {
          ...m,
          status: bulkStatus,
          rag: bulkRAG,
        };
      }
      return m;
    });

    const isAllCompleted = updatedMilestones
      .filter(m => m.status !== 'Not Required')
      .every(m => m.status === 'Completed');

    onUpdateProject({
      ...project,
      milestones: updatedMilestones,
      status: isAllCompleted ? 'Closed' : project.status
    });

    setActivities([
      {
        id: Date.now().toString(),
        text: `Bulk updated status to "${bulkStatus}" and RAG to "${bulkRAG}" for ${selectedMilestones.length} milestones (Nos: ${selectedMilestones.sort((a,b)=>a-b).map(no => `#${no.toString().padStart(2, '0')}`).join(', ')})`,
        time: 'Just now'
      },
      ...activities
    ]);

    setSelectedMilestones([]);
    alert(`Successfully bulk updated status to "${bulkStatus}" for ${selectedMilestones.length} milestones!`);
  };

  // AI report states
  const [reportType, setReportType] = useState<'weekly' | 'total'>('weekly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReportData, setAiReportData] = useState<any | null>(null);
  const [genStep, setGenStep] = useState('');

  const handleGenerateAiReport = async () => {
    setIsGenerating(true);
    setAiReportData(null);
    
    // Process steps to provide professional look and feel
    const steps = [
      "Contacting Nucore AI Copilot Services...",
      "Analyzing 22-deliverable compliance history...",
      "Synthesizing RAG status indices & timelines...",
      "Structuring descriptive Executive Summary...",
      "Formulating high-level forward Action Plan..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setGenStep(steps[i]);
      await new Promise(res => setTimeout(res, 850));
    }

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, reportType })
      });

      if (!response.ok) {
        throw new Error("Failed to generate report from server side AI service");
      }

      const data = await response.json();
      setAiReportData(data);
    } catch (err: any) {
      alert(`⚠️ Error generating AI Report: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Custom AI prompt states
  const [customPromptText, setCustomPromptText] = useState('');
  const [customReportSelectedProjectId, setCustomReportSelectedProjectId] = useState<string>(project.id || '');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customReportData, setCustomReportData] = useState<any | null>(null);
  const [customGenStep, setCustomGenStep] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerSearchDropdown, setShowCustomerSearchDropdown] = useState(false);

  useEffect(() => {
    setCustomReportSelectedProjectId(project.id);
    setCustomerSearchQuery(`${project.customerName} (ONB: ${project.onboardingNumber || project.id})`);
    setCustomReportData(null);
  }, [project.id, project.customerName]);

  const handleGenerateCustomReport = async () => {
    setIsGeneratingCustom(true);
    setCustomReportData(null);
    
    const steps = [
      "Accessing Custom Prompt Advisory Pipelines...",
      "Searching & compiling database indices...",
      "Synthesizing graphical metrics...",
      "Drafting descriptive executive findings...",
      "Compiling complete compact custom report..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setCustomGenStep(steps[i]);
      await new Promise(res => setTimeout(res, 800));
    }

    try {
      const response = await fetch("/api/generate-custom-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          selectedProjectId: customReportSelectedProjectId, 
          customPrompt: customPromptText,
          projects: allProjects
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate custom AI report from server");
      }

      const data = await response.json();
      setCustomReportData(data);
    } catch (err: any) {
      alert(`⚠️ Error generating Custom AI Report: ${err.message || err}`);
    } finally {
      setIsGeneratingCustom(false);
    }
  };
  
  // Local form state for milestone editor
  const [editName, setEditName] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editWeightage, setEditWeightage] = useState(0);
  const [editStatus, setEditStatus] = useState<MilestoneStatus>('Pending');
  const [editRAG, setEditRAG] = useState<RAGStatus>('Green');
  const [editRemarks, setEditRemarks] = useState('');
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);

  // Add new milestone form state
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newWeightage, setNewWeightage] = useState(5);
  const [newRemarks, setNewRemarks] = useState('');
  const [newDateValidationError, setNewDateValidationError] = useState<string | null>(null);

  // Activity logs inside the detail view
  const [activities, setActivities] = useState<Array<{id: string, text: string, time: string}>>([
    { id: '1', text: `${project.projectOwner} updated Milestone #04 status to In Progress`, time: 'Today, 10:45 AM' },
    { id: '2', text: `Milestone #02 marked as Completed by System Agent`, time: 'Yesterday, 4:20 PM' },
    { id: '3', text: `Project onboarding initiated under Lead ${project.projectOwner}`, time: 'Last week' }
  ]);

  // Project documents list
  const [documents, setDocuments] = useState<Array<{ name: string, ext: 'pdf' | 'docx' | 'xlsx' }>>([
    { name: 'Project_Charter.pdf', ext: 'pdf' },
    { name: 'Tech_Specs_V2.docx', ext: 'docx' }
  ]);
  const [newDocName, setNewDocName] = useState('');

  // Calculate dynamic stats from milestones
  const activeMilestones = project.milestones.filter(m => m.status !== 'Not Required');
  
  const totalMilestonesCount = project.milestones.length;
  const completedCount = project.milestones.filter(m => m.status === 'Completed').length;
  const inProgressCount = project.milestones.filter(m => m.status === 'In Progress').length;
  const pendingCount = project.milestones.filter(m => m.status === 'Pending').length;
  const notRequiredCount = project.milestones.filter(m => m.status === 'Not Required').length;

  // Weightage calculation
  const totalWeightForCalc = activeMilestones.reduce((sum, m) => sum + m.weightage, 0);
  const completedWeightCombined = activeMilestones
    .filter(m => m.status === 'Completed')
    .reduce((sum, m) => sum + m.weightage, 0);

  const completionPercentage = totalWeightForCalc > 0 
    ? Math.round((completedWeightCombined / totalWeightForCalc) * 100) 
    : 0;

  // Let's handle milestone editing submission
  const startEditing = (m: Milestone) => {
    setEditingMilestone(m);
    setEditName(m.name);
    setEditStartDate(m.startDate);
    setEditEndDate(m.endDate);
    setEditWeightage(m.weightage);
    setEditStatus(m.status);
    setEditRAG(m.rag);
    setEditRemarks(m.remarks);
    setChecklistItems(m.checklist || []);
    setNewChecklistItemText('');
    setDateValidationError(null);
    setMilestoneComments(m.comments || []);
    setNewCommentText('');
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: 'TASK-' + Date.now() + Math.random().toString(36).substring(2, 5).toUpperCase(),
      text: newChecklistItemText.trim(),
      checked: false
    };
    setChecklistItems([...checklistItems, newItem]);
    setNewChecklistItemText('');
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const author = currentActiveUser?.name || currentActiveUser?.username || 'Rekha (Nucore)';
    const newComment: MilestoneComment = {
      id: 'COMM-' + Date.now() + Math.random().toString(36).substring(2, 5).toUpperCase(),
      author,
      text: newCommentText.trim(),
      createdAt: new Date().toLocaleString()
    };
    setMilestoneComments([...milestoneComments, newComment]);
    setNewCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    setMilestoneComments(milestoneComments.filter(c => c.id !== commentId));
  };

  const handleInlineAddComment = (milestoneNo: number, text: string) => {
    if (!text.trim()) return;
    const author = currentActiveUser?.name || currentActiveUser?.username || 'Rekha (Nucore)';
    const newComment: MilestoneComment = {
      id: 'COMM-' + Date.now() + Math.random().toString(36).substring(2, 5).toUpperCase(),
      author,
      text: text.trim(),
      createdAt: new Date().toLocaleString()
    };

    const updatedMilestones = project.milestones.map(m => {
      if (m.no === milestoneNo) {
        return {
          ...m,
          comments: [...(m.comments || []), newComment]
        };
      }
      return m;
    });

    onUpdateProject({
      ...project,
      milestones: updatedMilestones
    });

    setActivities([
      {
        id: Date.now().toString(),
        text: `Feedback comment added to Milestone #${milestoneNo.toString().padStart(2, '0')} by ${author}`,
        time: 'Just now'
      },
      ...activities
    ]);
  };

  const handleInlineDeleteComment = (milestoneNo: number, commentId: string) => {
    const updatedMilestones = project.milestones.map(m => {
      if (m.no === milestoneNo) {
        return {
          ...m,
          comments: (m.comments || []).filter(c => c.id !== commentId)
        };
      }
      return m;
    });

    onUpdateProject({
      ...project,
      milestones: updatedMilestones
    });
  };

  const handleInlineToggleChecklist = (milestoneNo: number, itemId: string, checked: boolean) => {
    const updatedMilestones = project.milestones.map(m => {
      if (m.no === milestoneNo) {
        const updatedChecklist = (m.checklist || []).map(c => 
          c.id === itemId ? { ...c, checked } : c
        );
        return {
          ...m,
          checklist: updatedChecklist
        };
      }
      return m;
    });

    onUpdateProject({
      ...project,
      milestones: updatedMilestones
    });
  };

  const saveMilestoneChanges = () => {
    if (!editingMilestone) return;

    // Validate that endDate does not occur before startDate
    const startParsed = parseDateForComparison(editStartDate);
    const endParsed = parseDateForComparison(editEndDate);
    if (startParsed && endParsed && endParsed < startParsed) {
      const errorMsg = "The milestone's End Date cannot be earlier than its Start Date.";
      setDateValidationError(errorMsg);
      alert(`⚠️ Validation Error: ${errorMsg}`);
      return;
    }
    setDateValidationError(null);

    // Build modern activities logger item
    const statusChanged = editingMilestone.status !== editStatus;
    const logText = statusChanged 
      ? `Milestone #${editingMilestone.no.toString().padStart(2, '0')} stat modified from "${editingMilestone.status}" to "${editStatus}"`
      : `Milestone #${editingMilestone.no.toString().padStart(2, '0')} details recalculated by Owner`;

    let updatedMilestones = project.milestones.map(m => {
      if (m.no === editingMilestone.no) {
        return {
          ...m,
          name: editName,
          startDate: editStartDate,
          endDate: editEndDate,
          weightage: Number(editWeightage),
          status: editStatus,
          rag: editRAG,
          remarks: editRemarks,
          checklist: checklistItems,
          comments: milestoneComments
        };
      }
      return m;
    });

    // If Kick Off (No. 1) start date is changed, auto-recalculate all subsequent dates excluding Saturdays & Sundays!
    if (editingMilestone.no === 1 && editingMilestone.startDate !== editStartDate) {
      updatedMilestones = sequenceMilestonesFromKickoff(updatedMilestones, editStartDate);
    }

    const updatedProject: Project = {
      ...project,
      milestones: updatedMilestones,
      status: completionPercentage >= 100 ? 'Closed' : project.status
    };

    onUpdateProject(updatedProject);
    setActivities([
      { id: Date.now().toString(), text: logText, time: 'Just now' },
      ...activities
    ]);
    setEditingMilestone(null);
  };

  // Auto-calculation logic based on handwritten page: "Start and end of each milestone should be auto-calculated sequencing"
  // If the user clicks this, it starts from the first milestone's start date and spaces each milestone sequentially!
  const triggerAutoCalculateSequence = () => {
    let currentStartDate = '2025-10-23'; // baseline
    const firstActive = project.milestones.find(m => m.startDate !== 'N/A' && m.startDate !== '');
    if (firstActive) {
      currentStartDate = firstActive.startDate;
    }

    const updatedMilestones = sequenceMilestonesFromKickoff(project.milestones, currentStartDate);

    onUpdateProject({
      ...project,
      milestones: updatedMilestones
    });

    setActivities([
      { id: Date.now().toString(), text: `All milestones sequenced sequentially using working-day timeline rules (excluding weekends).`, time: 'Just now' },
      ...activities
    ]);

    alert("⚡ Sequential Timeline Calculations Applied successfully! Milestone start & end dates have been automated sequentially excluding Saturdays & Sundays.");
  };

  // Add customized Milestone
  const handleAddMilestone = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    // Validate that newEndDate does not occur before newStartDate
    const startParsed = parseDateForComparison(newStartDate);
    const endParsed = parseDateForComparison(newEndDate);
    if (startParsed && endParsed && endParsed < startParsed) {
      const errorMsg = "The milestone's End Date cannot be earlier than its Start Date.";
      setNewDateValidationError(errorMsg);
      alert(`⚠️ Validation Error: ${errorMsg}`);
      return;
    }
    setNewDateValidationError(null);

    const nextNo = project.milestones.length > 0 
      ? Math.max(...project.milestones.map(m => m.no)) + 1 
      : 1;

    const added: Milestone = {
      no: nextNo,
      name: newName,
      startDate: newStartDate || '2025-12-01',
      endDate: newEndDate || '2025-12-05',
      weightage: Number(newWeightage),
      status: 'Pending',
      rag: 'Green',
      remarks: newRemarks || 'Custom client scope.'
    };

    const updatedProject: Project = {
      ...project,
      milestones: [...project.milestones, added]
    };

    onUpdateProject(updatedProject);
    setActivities([
      { id: Date.now().toString(), text: `New milestone added: "${newName}" (#${nextNo})`, time: 'Just now' },
      ...activities
    ]);

    // reset fields
    setNewName('');
    setNewRemarks('');
    setNewStartDate('');
    setNewEndDate('');
    setNewDateValidationError(null);
    setIsAddingMilestone(false);
  };

  // Removing milestone
  const deleteMilestone = (no: number) => {
    if (!confirm(`Are you sure you want to delete Milestone #${no}?`)) return;

    const updated = project.milestones.filter(m => m.no !== no);
    onUpdateProject({
      ...project,
      milestones: updated
    });

    setActivities([
      { id: Date.now().toString(), text: `Milestone #${no} was deleted by project leader`, time: 'Just now' },
      ...activities
    ]);
  };

  // Adding project documents links
  const handleAddDocument = (e: FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const extension = newDocName.toLowerCase().endsWith('.docx') ? 'docx' : 'pdf';
    setDocuments([...documents, { name: newDocName, ext: extension }]);
    setNewDocName('');
    alert(`File "${newDocName}" registered successfully!`);
  };

  return (
    <div className="p-6 ml-64 max-w-[calc(100vw-16rem)] overflow-y-auto">
      
      {/* Back CTA control */}
      <button 
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase font-mono tracking-wider bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm"
        id="detail-back-btn"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to List</span>
      </button>

      {/* Header Info Section matching Image 4 header layout */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm mb-6 flex flex-wrap justify-between items-end gap-4 border-t-[4px] border-t-slate-900">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">CUSTOMER NAME</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.customerName}</h1>
          
          <div className="flex flex-wrap gap-8 mt-4 pt-2">
            <div>
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest font-bold">Onboarding Number</p>
              <p className="text-sm font-bold text-[#006a66] font-mono">{project.onboardingNumber || project.id}</p>
            </div>
            {project.cobNumber && project.cobNumber !== project.onboardingNumber && (
              <div>
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">COB Number</p>
                <p className="text-sm font-bold text-slate-800 font-mono">{project.cobNumber}</p>
              </div>
            )}
            <div>
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Project Owner</p>
              <p className="text-sm font-bold text-slate-800">{project.projectOwner}</p>
            </div>
            <div>
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Primary Salesperson</p>
              <p className="text-sm font-bold text-slate-800">{project.salesperson}</p>
            </div>
            <div>
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest font-bold">Go-Live Target Date</p>
              <p className="text-sm font-bold text-[#006a66] flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{project.goLiveDate}</span>
              </p>
            </div>
            <div>
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Workflow State</p>
              <select
                value={project.status}
                onChange={(e) => {
                  const updatedStatus = e.target.value as any;
                  onUpdateProject({
                    ...project,
                    status: updatedStatus
                  });
                }}
                className={`inline-flex items-center px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold border outline-none bg-white cursor-pointer ${
                  project.status === 'Active' 
                    ? 'text-emerald-800 border-emerald-300 bg-emerald-50 font-black' 
                    : project.status === 'Closed' 
                    ? 'text-slate-750 border-slate-300 bg-slate-50 font-black' 
                    : 'text-amber-800 border-amber-300 bg-amber-50 font-black'
                }`}
              >
                <option value="Active">🟢 Active</option>
                <option value="Closed">⚫ Closed</option>
                <option value="Pending">🟡 Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic sequencing & export buttons */}
        <div className="flex gap-2">
          <button 
            onClick={triggerAutoCalculateSequence}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            title="Auto-calculates start & end dates based on sequential duration matching Image 1 requirements"
            id="btn-auto-sequence"
          >
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>⚡ Sequenced Calculation</span>
          </button>
          
          <button 
            onClick={() => onDownloadProjectReport(project)}
            className="px-3.5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            id="btn-export-pdf"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>

          <button 
            onClick={() => setIsAddingMilestone(true)}
            className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            id="btn-new-milestone"
          >
            <Plus className="w-4 h-4" />
            <span>New Milestone</span>
          </button>

          <button 
            onClick={() => {
              if (confirm(`CRITICAL WARNING: Are you sure you want to permanently delete the onboarding project for "${project.customerName}"? All milestones and logs will be lost.`)) {
                onDeleteProject(project.id);
              }
            }}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            title="Permanently delete project"
            id="btn-delete-project"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Delete Project</span>
          </button>
        </div>
      </div>

      {/* Adding milestone form dialog drawer/overlay if clicked */}
      {isAddingMilestone && (
        <form onSubmit={handleAddMilestone} className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add Client Onboarding Custom Milestone</span>
          </h3>
          {newDateValidationError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{newDateValidationError}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Milestone Name</label>
              <input 
                type="text" 
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. ERP Trial Operations" 
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Start Date</label>
              <input 
                type="date"
                required
                value={newStartDate}
                onChange={e => setNewStartDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">End Date</label>
              <input 
                type="date" 
                required
                value={newEndDate}
                onChange={e => setNewEndDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Weight % (e.g. 5)</label>
              <input 
                type="number" 
                required
                min={0}
                max={100}
                value={newWeightage}
                onChange={e => setNewWeightage(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Remarks &amp; Work Breakdown Notes</label>
            <input 
              type="text" 
              value={newRemarks}
              onChange={e => setNewRemarks(e.target.value)}
              placeholder="e.g., Awaiting external API sandbox configuration keys." 
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            />
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => setIsAddingMilestone(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-250 rounded hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
            >
              Add Node
            </button>
          </div>
        </form>
      )}

      {/* Editing milestone modal/drawer inline overlay */}
      {editingMilestone && (
        <div className="bg-[#eef4ff] border border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-1.5">
            <Edit3 className="w-4 h-4 text-indigo-600" />
            <span>Update Milestone No. {editingMilestone.no} — {editingMilestone.name}</span>
          </h3>
          {dateValidationError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{dateValidationError}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Milestone Title</label>
              <input 
                type="text" 
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Start Date</label>
              <input 
                type="text" 
                value={editStartDate}
                onChange={e => setEditStartDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-semibold font-mono"
                placeholder="YYYY-MM-DD or N/A"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">End Date</label>
              <input 
                type="text" 
                value={editEndDate}
                onChange={e => setEditEndDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-semibold font-mono"
                placeholder="YYYY-MM-DD or N/A"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Weightage (Multiplier/Percentage)</label>
              <input 
                type="number" 
                value={editWeightage}
                onChange={e => setEditWeightage(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-semibold"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">Status State</label>
              <select 
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as MilestoneStatus)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-bold"
              >
                <option value="Completed">✅ Completed</option>
                <option value="In Progress">🔄 In Progress</option>
                <option value="Pending">⏳ Pending</option>
                <option value="Not Required">❌ Not Required</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">RAG Escalation Level</label>
              <select 
                value={editRAG}
                onChange={e => setEditRAG(e.target.value as RAGStatus)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-bold"
              >
                <option value="Green">🟢 Green - On Schedule</option>
                <option value="Amber">🟡 Amber - Minor Block</option>
                <option value="Red">🔴 Red - Milestone Overdue</option>
              </select>
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">RAG Note Remarks</label>
              <input 
                type="text" 
                value={editRemarks}
                onChange={e => setEditRemarks(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Milestone Checklist Sub-editor */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
              📋 Milestone Checklist Items
            </h4>
            
            {/* List existing items */}
            {checklistItems.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic mb-3">No checklist items defined for this milestone yet. Add one below!</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto mb-3 pr-1">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded px-2.5 py-1.5 hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={item.checked} 
                        onChange={(e) => {
                          setChecklistItems(checklistItems.map(c => c.id === item.id ? { ...c, checked: e.target.checked } : c));
                        }}
                        className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={`text-xs ${item.checked ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                        {item.text}
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setChecklistItems(checklistItems.filter(c => c.id !== item.id))}
                      className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new checklist item form */}
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Add checklist item (e.g. Gather signatures, configuration backup...)"
                value={newChecklistItemText}
                onChange={(e) => setNewChecklistItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button 
                type="button"
                onClick={handleAddChecklistItem}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Milestone Notes & Feedback Comments Sub-editor */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>💬 Milestone Notes & Feedback Comments</span>
            </h4>
            
            {/* List existing comments */}
            {milestoneComments.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic mb-3">No feedback comments or notes added yet for this milestone.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3 pr-1">
                {milestoneComments.map((comment) => (
                  <div key={comment.id} className="bg-white border border-slate-100 rounded-lg p-2.5 shadow-xs flex flex-col gap-1 hover:border-indigo-100 transition-colors">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="font-bold text-indigo-600 flex items-center gap-1">
                        <User className="w-2.5 h-2.5" />
                        {comment.author}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span>{comment.createdAt}</span>
                        <button 
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-slate-350 hover:text-rose-600 transition-colors p-0.5 rounded"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add new comment form */}
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Type a milestone note or project feedback..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button 
                type="button"
                onClick={handleAddComment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded transition-colors flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Post Note</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => setEditingMilestone(null)}
              className="px-3.5 py-2 font-bold text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={saveMilestoneChanges}
              className="px-3.5 py-2 font-bold text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save Milestone Progress
            </button>
          </div>
        </div>
      )}

      {/* Main Milestone Table matching mockup Image 4 and Image 2 */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Milestone Checklist Model</h2>
            <p className="text-[10px] text-slate-400 font-mono">Weightage-calculated progress alignment</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedMilestones.length > 0 && (
              <button
                onClick={() => setSelectedMilestones([])}
                className="text-xs text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 transition-colors"
              >
                Clear Selection ({selectedMilestones.length})
              </button>
            )}
            <span className="text-xs bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">
              Total active deliverables: {activeMilestones.length}
            </span>
          </div>
        </div>

        {/* BULK ACTION BAR - CUSTOMER REQUIREMENT */}
        {selectedMilestones.length > 0 && (
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-3.5 flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 animate-fade-in" id="milestones-bulk-actions-bar">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold font-mono">
                {selectedMilestones.length}
              </span>
              <span className="text-xs font-bold text-slate-100">
                Milestones selected for batch operation
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="bulk-status-select" className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Status:</label>
                <select
                  id="bulk-status-select"
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as MilestoneStatus)}
                  className="text-xs border border-slate-700 rounded bg-slate-800 text-white px-2 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Completed">✅ Completed</option>
                  <option value="In Progress">🔄 In Progress</option>
                  <option value="Pending">⏳ Pending</option>
                  <option value="Not Required">❌ Not Required</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="bulk-rag-select" className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">RAG Health:</label>
                <select
                  id="bulk-rag-select"
                  value={bulkRAG}
                  onChange={(e) => setBulkRAG(e.target.value as RAGStatus)}
                  className="text-xs border border-slate-700 rounded bg-slate-800 text-white px-2 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Green">🟢 Green</option>
                  <option value="Amber">🟡 Amber</option>
                  <option value="Red">🔴 Red</option>
                </select>
              </div>

              <button
                onClick={handleBulkUpdate}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded shadow-md transition-colors cursor-pointer"
                id="btn-apply-bulk-update"
              >
                Apply to Selected
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3.5 border-r border-slate-800 w-10 text-center">
                  <input 
                    type="checkbox"
                    id="checkbox-select-all-milestones"
                    aria-label="Select all milestones"
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                    checked={selectedMilestones.length === project.milestones.length && project.milestones.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMilestones(project.milestones.map(m => m.no));
                      } else {
                        setSelectedMilestones([]);
                      }
                    }}
                  />
                </th>
                <th className="p-3.5 border-r border-slate-800 w-12 text-center">No</th>
                <th className="p-3.5 border-r border-slate-800">Onboarding Scope Milestone</th>
                <th className="p-3.5 border-r border-slate-800 w-32">Start Date</th>
                <th className="p-3.5 border-r border-slate-800 w-32">End Date</th>
                <th className="p-3.5 border-r border-slate-800 w-24 text-right">Weightage</th>
                <th className="p-3.5 border-r border-slate-800 w-32">Status</th>
                <th className="p-3.5 border-r border-slate-800 w-28">RAG Index</th>
                <th className="p-3.5 border-r border-slate-800">Remarks &amp; Feedback Notes</th>
                <th className="p-3.5 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {project.milestones.map((m) => (
                <Fragment key={m.no}>
                  <tr 
                    className={`hover:bg-slate-50/70 transition-colors group ${
                      selectedMilestones.includes(m.no) 
                        ? 'bg-indigo-50/40' 
                        : m.status === 'Completed' 
                        ? 'bg-slate-50/30' 
                        : ''
                    }`}
                  >
                    <td className="p-3 text-center border-r border-slate-100 w-10">
                      <input 
                        type="checkbox"
                        id={`checkbox-milestone-${m.no}`}
                        aria-label={`Select milestone ${m.name}`}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                        checked={selectedMilestones.includes(m.no)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMilestones([...selectedMilestones, m.no]);
                          } else {
                            setSelectedMilestones(selectedMilestones.filter(no => no !== m.no));
                          }
                        }}
                      />
                    </td>
                    <td className="p-3 text-center text-xs font-mono font-bold text-slate-400 border-r border-slate-100">
                      {m.no.toString().padStart(2, '0')}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800 text-xs">{m.name}</div>
                      {m.checklist && m.checklist.length > 0 && (
                        <div className="mt-1 flex flex-col gap-1 max-w-xs">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono font-bold">
                            <span>📋 Checklist:</span>
                            <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {m.checklist.filter(c => c.checked).length} of {m.checklist.length} done
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-1 transition-all duration-300" 
                              style={{ width: `${(m.checklist.filter(c => c.checked).length / m.checklist.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Notes & Comments trigger buttons */}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {m.comments && m.comments.length > 0 ? (
                          <button 
                            onClick={() => setExpandedMilestoneNo(expandedMilestoneNo === m.no ? null : m.no)}
                            className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            <MessageSquare className="w-2.5 h-2.5 text-amber-500" />
                            <span>{m.comments.length} feedback note{m.comments.length > 1 ? 's' : ''}</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => setExpandedMilestoneNo(expandedMilestoneNo === m.no ? null : m.no)}
                            className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded cursor-pointer transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <MessageSquare className="w-2.5 h-2.5 text-slate-400" />
                            <span>+ Add feedback note</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-xs font-mono font-medium text-slate-600">
                      {formatToDDMMYYYY(m.startDate)}
                    </td>
                    <td className="p-3 text-xs font-mono font-medium text-slate-600">
                      {formatToDDMMYYYY(m.endDate)}
                    </td>
                    <td className="p-3 text-right text-xs font-mono font-bold text-slate-700">
                      {m.weightage}%
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                        m.status === 'Completed' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : m.status === 'In Progress' 
                          ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' 
                          : m.status === 'Not Required'
                          ? 'bg-slate-100 text-slate-400 border border-slate-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className={`status-chip flex items-center gap-1.5 px-2 py-0.5 border text-[9px] font-mono rounded font-bold ${
                        m.rag === 'Green' ? 'rag-green' : m.rag === 'Amber' ? 'rag-amber' : 'rag-red'
                      }`}>
                        <span className={`rag-indicator ${
                          m.rag === 'Green' ? 'bg-green-500' : m.rag === 'Amber' ? 'bg-amber-500 text-amber-500' : 'bg-rose-500 text-rose-500'
                        }`}></span>
                        {m.rag}
                      </div>
                    </td>
                    <td className="p-3">
                      <p className={`text-xs max-w-xs truncate ${m.status === 'In Progress' ? 'italic text-indigo-700 font-semibold' : 'text-slate-500 font-medium'}`}>
                        {m.remarks || '—'}
                      </p>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex gap-1.5 items-center justify-center">
                        <button 
                          onClick={() => setExpandedMilestoneNo(expandedMilestoneNo === m.no ? null : m.no)}
                          className={`p-1 rounded transition-colors ${
                            expandedMilestoneNo === m.no 
                              ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                          }`}
                          title={expandedMilestoneNo === m.no ? "Collapse feedback" : "Expand feedback & notes"}
                        >
                          {expandedMilestoneNo === m.no ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button 
                          onClick={() => startEditing(m)}
                          className="p-1 text-indigo-500 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit milestone status/dates"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button 
                          onClick={() => deleteMilestone(m.no)}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                          title="Delete milestone scope"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedMilestoneNo === m.no && (
                    <tr className="bg-slate-50/40">
                      <td colSpan={10} className="p-4 bg-slate-50/70 border-t border-b border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-7xl mx-auto">
                          {/* Left Panel: Inline Checklist */}
                          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
                              <span>📋 Checklist Tasks</span>
                            </h4>
                            {(!m.checklist || m.checklist.length === 0) ? (
                              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                                <p className="text-[11px] text-slate-400 italic">No checklist items defined for this milestone.</p>
                                <button 
                                  onClick={() => startEditing(m)}
                                  className="mt-2 text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                                >
                                  Open Editor to Add Items
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                {m.checklist.map((item) => (
                                  <label 
                                    key={item.id} 
                                    className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-md px-2.5 py-1.5 hover:bg-slate-100/60 transition-colors cursor-pointer"
                                  >
                                    <input 
                                      type="checkbox" 
                                      checked={item.checked} 
                                      onChange={(e) => handleInlineToggleChecklist(m.no, item.id, e.target.checked)}
                                      className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <span className={`text-xs ${item.checked ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-semibold'}`}>
                                      {item.text}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Right Panel: Project-Specific Feedback & Comments */}
                          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between min-h-[220px]">
                            <div>
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
                                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                                <span>💬 Feedback &amp; Project Notes</span>
                              </h4>

                              {(!m.comments || m.comments.length === 0) ? (
                                <p className="text-[11px] text-slate-400 italic py-4">No notes or feedback comments recorded yet. Add project-specific feedback below.</p>
                              ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto mb-3 pr-1">
                                  {m.comments.map((comment) => (
                                    <div key={comment.id} className="bg-slate-50 border border-slate-100 rounded-md p-2 flex flex-col gap-0.5 hover:border-slate-200 transition-colors">
                                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                                        <span className="font-bold text-indigo-600 flex items-center gap-0.5">
                                          <User className="w-2.5 h-2.5" />
                                          {comment.author}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <span>{comment.createdAt}</span>
                                          <button 
                                            type="button"
                                            onClick={() => handleInlineDeleteComment(m.no, comment.id)}
                                            className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded"
                                            title="Delete note"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{comment.text}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Inline comment form */}
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const input = form.elements.namedItem('inlineCommentText') as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  handleInlineAddComment(m.no, input.value);
                                  input.value = '';
                                }
                              }}
                              className="flex gap-1.5 pt-2 border-t border-slate-100 mt-2"
                            >
                              <input 
                                type="text"
                                name="inlineCommentText"
                                placeholder="Type feedback or project-specific notes..."
                                required
                                className="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                              />
                              <button 
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                <Send className="w-2.5 h-2.5" />
                                <span>Post</span>
                              </button>
                            </form>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI EXECUTIVE STATUS REPORTS CARD - CUSTOMER REQUIREMENT */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 border border-slate-800 p-6 rounded-xl shadow-lg mb-6 text-white font-sans">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-stretch">
          <div className="max-w-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Authorized AI Copilot Console
                </span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Nucore Executive AI Report Builder</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Leverage advanced Gemini 3.5 Flash models to build, preview, and download descriptive status updates. Every draft includes an executive summary, high-level deliverables review, milestone evaluation, and an action plan to keep the go-live target date on track.
              </p>
            </div>

            {/* Scope selection and triggers */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800/60 mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-bold">Report Update Scope</label>
                <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800/80 p-0.5">
                  <button
                    type="button"
                    onClick={() => { setReportType('weekly'); setAiReportData(null); }}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${reportType === 'weekly' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-450 hover:text-slate-200'}`}
                  >
                    📅 Weekly Update
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReportType('total'); setAiReportData(null); }}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${reportType === 'total' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-450 hover:text-slate-200'}`}
                  >
                    📊 Total Project Update
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 self-end">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateAiReport}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  id="btn-ai-generate"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>{isGenerating ? "Synthesizing Report..." : "Draft with Nucore AI"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel: Preview and Actions */}
          <div className="w-full lg:max-w-md bg-white/5 border border-white/10 p-4 rounded-xl shadow-inner flex-1 flex flex-col justify-between min-h-[300px] font-mono text-xs">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-6 h-full space-y-3 my-auto">
                <div className="relative w-10 h-10">
                  <span className="absolute inset-0 rounded-full border-4 border-teal-500/25 animate-ping"></span>
                  <span className="absolute inset-0 rounded-full border-4 border-t-teal-400 animate-spin"></span>
                </div>
                <div className="text-center">
                  <p className="text-teal-300 font-bold tracking-tight animate-pulse">{genStep}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">Nucore Advisory Pipeline Active</p>
                </div>
              </div>
            ) : isGeneratingCustom ? (
              <div className="flex flex-col items-center justify-center py-6 h-full space-y-3 my-auto">
                <div className="relative w-10 h-10">
                  <span className="absolute inset-0 rounded-full border-4 border-indigo-550/25 animate-ping"></span>
                  <span className="absolute inset-0 rounded-full border-4 border-t-indigo-400 animate-spin"></span>
                </div>
                <div className="text-center">
                  <p className="text-indigo-300 font-bold tracking-tight animate-pulse">{customGenStep}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">Custom AI Prompt Advisor Active</p>
                </div>
              </div>
            ) : customReportData ? (
              <div className="space-y-4 flex flex-col justify-between h-full animate-fade-in">
                <div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div className="max-w-[70%]">
                      <span className="text-teal-400 font-bold uppercase tracking-wider text-[8px]">{customReportData.scopeLabel || "Advisory Report"}</span>
                      <h4 className="font-sans font-black text-white text-xs mt-0.5 truncate" title={customReportData.title}>
                        {customReportData.title}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                      customReportData.ragRating?.toLowerCase().includes('red') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      customReportData.ragRating?.toLowerCase().includes('amber') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      RAG: {customReportData.ragRating?.split(' ')[0] || 'Green'}
                    </span>
                  </div>

                  {/* Graphical representation inside preview */}
                  <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg mt-3 font-sans">
                    <p className="text-[9px] font-mono tracking-wider uppercase text-slate-400 font-bold mb-2.5 flex justify-between">
                      <span>📊 Graphical Metric Adherence</span>
                      <span className="text-teal-400 font-bold">Standard UI Preview</span>
                    </p>
                    <div className="space-y-2">
                      {customReportData.graphicalData && customReportData.graphicalData.length > 0 ? (
                        customReportData.graphicalData.map((item: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
                              <span>{item.label}</span>
                              <span className="text-teal-400 font-mono">{item.value}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-teal-500 rounded-full transition-all duration-500" 
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[10px] text-slate-500 italic">No graphical metrics returned.</div>
                      )}
                    </div>
                  </div>

                  {/* Micro text summary preview */}
                  <div className="mt-3 bg-slate-900/25 border border-slate-850 p-2.5 rounded-lg max-h-36 overflow-y-auto">
                    <p className="text-[9px] font-mono uppercase text-indigo-400 font-bold mb-1">Executive Summary Narrative</p>
                    <p className="text-[11px] text-slate-350 leading-relaxed font-sans">
                      {customReportData.executiveSummary}
                    </p>
                  </div>
                </div>

                {/* Custom Exporters CTAs */}
                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/10 font-sans">
                  <button
                    type="button"
                    onClick={() => downloadCustomReportPdf(customReportData)}
                    className="flex items-center justify-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors shadow cursor-pointer"
                    id="btn-custom-pdf"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-100" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadCustomReportWord(customReportData)}
                    className="flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow cursor-pointer"
                    id="btn-custom-word"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-100" />
                    <span>Download Word</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadCustomReportExcel(customReportData)}
                    className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow cursor-pointer"
                    id="btn-custom-excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
                    <span>Download Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomReportData(null);
                      setCustomPromptText('');
                      if (project) {
                        setCustomReportSelectedProjectId(project.id);
                        setCustomerSearchQuery(`${project.customerName} (ONB: ${project.onboardingNumber || project.id})`);
                      }
                    }}
                    className="flex items-center justify-center py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    id="btn-custom-reset"
                  >
                    <span>Reset & Try New Prompt</span>
                  </button>
                </div>
              </div>
            ) : aiReportData ? (
              <div className="space-y-4 flex flex-col justify-between h-full animate-fade-in">
                <div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Draft Ready:</span>
                      <h4 className="font-sans font-black text-white text-xs mt-0.5 truncate">
                        {reportType === 'weekly' ? 'Weekly Tactical Status' : 'Comprehensive Lifecycle Update'}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      aiReportData.ragRating === 'Red' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      aiReportData.ragRating === 'Amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      RAG: {aiReportData.ragRating || 'Green'}
                    </span>
                  </div>

                  {/* Micro preview */}
                  <p className="text-[11px] text-slate-350 line-clamp-4 leading-relaxed font-sans mt-3">
                    {aiReportData.executiveSummary}
                  </p>
                </div>

                {/* Exporters CTAs */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 font-sans">
                  <button
                    type="button"
                    onClick={() => downloadAiReportPdf(
                      `${project.customerName} - ${reportType === 'weekly' ? 'Weekly Update' : 'Total Project Update'}`,
                      aiReportData,
                      project,
                      reportType
                    )}
                    className="flex items-center justify-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow cursor-pointer text-xs"
                    id="btn-ai-pdf"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadAiReportWord(
                      `${project.customerName} - ${reportType === 'weekly' ? 'Weekly Update' : 'Total Project Update'}`,
                      aiReportData,
                      project,
                      reportType
                    )}
                    className="flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow cursor-pointer text-xs"
                    id="btn-ai-word"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Word</span>
                  </button>
                </div>
              </div>
            ) : (
              // INTERACTIVE CUSTOM PROMPT EXPORTER - IDLE VIEW
              <div className="flex flex-col justify-between h-full space-y-3 font-sans" id="custom-ai-exporter-panel">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-amber-400 font-bold font-mono tracking-wider uppercase text-[10px] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Interactive AI Exporter</span>
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono uppercase bg-slate-800/80 px-1.5 py-0.5 rounded">Idle mode</span>
                  </div>

                  {/* Customer Select / Search box */}
                  <div className="relative">
                    <label className="text-[10px] font-mono tracking-wider text-slate-350 uppercase font-bold block mb-1">
                      Select Customer Workspace:
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Type to search customers..."
                        value={customerSearchQuery}
                        onChange={(e) => {
                          setCustomerSearchQuery(e.target.value);
                          setShowCustomerSearchDropdown(true);
                        }}
                        onFocus={() => setShowCustomerSearchDropdown(true)}
                        className="w-full text-xs border border-slate-700 rounded bg-slate-900/95 text-white px-2.5 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomerSearchDropdown(!showCustomerSearchDropdown)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 hover:text-white font-bold transition-all text-xs"
                        title="Search / Select customers list"
                        id="btn-search-customers"
                      >
                        🔍
                      </button>
                    </div>

                    {/* Dropdown list for customers filter */}
                    {showCustomerSearchDropdown && (
                      <div className="absolute z-10 left-0 right-0 mt-1 bg-slate-900 border border-slate-750 rounded-lg shadow-xl max-h-40 overflow-y-auto font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomReportSelectedProjectId('');
                            setCustomerSearchQuery('None - Compact Portfolio-Wide Report');
                            setShowCustomerSearchDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-teal-400 hover:bg-slate-800 transition-colors border-b border-slate-800"
                        >
                          📋 None (High-Level Compact Portfolio Report)
                        </button>
                        {allProjects
                          .filter(p => 
                            p.customerName.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
                            p.id.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                            (p.onboardingNumber && p.onboardingNumber.toLowerCase().includes(customerSearchQuery.toLowerCase())) ||
                            customerSearchQuery.includes(p.id) ||
                            (p.onboardingNumber && customerSearchQuery.includes(p.onboardingNumber))
                          )
                          .map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setCustomReportSelectedProjectId(p.id);
                                setCustomerSearchQuery(`${p.customerName} (ONB: ${p.onboardingNumber || p.id})`);
                                setShowCustomerSearchDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors flex justify-between items-center ${
                                customReportSelectedProjectId === p.id ? 'bg-indigo-950/50 text-indigo-300 border-l-2 border-indigo-500' : ''
                              }`}
                            >
                              <span className="font-semibold truncate">{p.customerName}</span>
                              <span className="font-mono text-[9px] text-slate-500">ONB: {p.onboardingNumber || p.id}</span>
                            </button>
                          ))
                        }
                      </div>
                    )}
                  </div>

                  {/* Standard reference prompt templates */}
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-slate-350 uppercase font-bold block mb-1">
                      💡 Quick Advisory Templates (Standard Reference):
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 mb-1">
                      {[
                        {
                          title: "⏳ Timeline drift audit",
                          desc: "Review onboarding dates & delays",
                          prompt: "Provide an analytical review of onboarding timelines, highlight delayed items, and estimate general drift on delivery schedules."
                        },
                        {
                          title: "🔴 Status roadblocks",
                          desc: "Audit red/amber status nodes",
                          prompt: "Provide a comprehensive audit of all Red and Amber milestones, detail current roadblocks, and outline specific remedial actions."
                        },
                        {
                          title: "📊 Checklist & scope",
                          desc: "Checklist accomplishments audit",
                          prompt: "Perform a deep-dive analysis on scope completion, identifying training velocity bottlenecks and onboarding checklist achievements."
                        },
                        {
                          title: "💼 Compact portfolio",
                          desc: "General complete portfolio summary",
                          prompt: "Summarize high-level portfolio KPIs, average onboarding completion, and critical customer milestones across all current accounts.",
                          clearProject: true
                        }
                      ].map((tmpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCustomPromptText(tmpl.prompt);
                            if (tmpl.clearProject) {
                              setCustomReportSelectedProjectId('');
                              setCustomerSearchQuery('None - Compact Portfolio-Wide Report');
                            }
                          }}
                          className="text-left p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/40 transition-all text-[10px] flex flex-col justify-between font-sans group cursor-pointer"
                          title={tmpl.prompt}
                        >
                          <span className="font-bold text-slate-200 group-hover:text-teal-400 transition-colors">{tmpl.title}</span>
                          <span className="text-[8px] text-slate-500 leading-normal mt-0.5">{tmpl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Prompt Text Area */}
                  <div>
                    <label className="text-[10px] font-mono tracking-wider text-slate-350 uppercase font-bold block mb-1">
                      Report Prompt & Instructions:
                    </label>
                    <textarea
                      value={customPromptText}
                      onChange={(e) => setCustomPromptText(e.target.value)}
                      placeholder="e.g., Generate a roadmap overview focusing on current roadblocks. Or 'Compare all timelines and highlight overdue training scopes'."
                      rows={3}
                      className="w-full text-xs border border-slate-700 rounded bg-slate-900/95 text-white p-2 font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 leading-normal"
                      id="input-custom-report-prompt"
                    />
                  </div>
                </div>

                {/* Generate CTA Button */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    type="button"
                    disabled={isGeneratingCustom}
                    onClick={handleGenerateCustomReport}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    id="btn-custom-ai-generate"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Generate Custom Prompt Report</span>
                  </button>
                  <p className="text-[9px] text-slate-500 mt-1.5 text-center font-mono">
                    Generates standardized narrative & graphical representation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Completion Box, Stats, Activity, and Documents Footer matching mockup Details tab layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        
        {/* Dynamic overall progress indicator */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between col-span-1">
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">OVERALL COMPLETION</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{completionPercentage}%</h2>
            <div className="text-[10px] text-slate-400 font-mono leading-tight">
              Calculated on active weightages.
            </div>
          </div>
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path 
                className="text-slate-100" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3.5"
              ></path>
              <path 
                className="text-[#006a66] transition-all duration-700" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="currentColor" 
                strokeDasharray={`${completionPercentage}, 100`}
                strokeLinecap="round" 
                strokeWidth="3.5"
              ></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-700 font-bold font-mono">
              Adopt
            </div>
          </div>
        </div>

        {/* Deliverables Stats Grid Box */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm col-span-1 md:col-span-3 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-150">
          <div className="px-4 first:pl-0">
            <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-slate-400" />
              <span>Adopt Blocks</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-800">{totalMilestonesCount}</span>
              <span className="text-[10px] text-slate-400 font-mono">Nodes</span>
            </div>
          </div>

          <div className="px-4">
            <p className="text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Completed</span>
            </p>
            <div className="flex items-end gap-1.5">
              <span className="text-xl font-extrabold text-[#006a66]">{completedCount}</span>
              <span className="text-[10px] text-slate-400 font-mono">Done</span>
            </div>
          </div>

          <div className="px-4">
            <p className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>In Progress</span>
            </p>
            <div className="flex items-end gap-1.5">
              <span className="text-xl font-extrabold text-indigo-700">{inProgressCount}</span>
              <span className="text-[10px] text-slate-400 font-mono">Live</span>
            </div>
          </div>

          <div className="px-4 last:pr-0">
            <p className="text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending</span>
            </p>
            <div className="flex items-end gap-1.5">
              <span className="text-xl font-extrabold text-amber-700">{pendingCount}</span>
              <span className="text-[10px] text-slate-400 font-mono">Await</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs and documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent updates timeline */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <History className="w-4 h-4 text-[#006a66]" />
            <span>Recent Timeline Activity</span>
          </h3>
          
          <div className="space-y-4">
            {activities.map(act => (
              <div key={act.id} className="flex gap-4 items-start border-l-2 border-slate-100 pl-4 relative">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-400"></div>
                <div>
                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">{act.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono font-semibold">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF and docx templates documents attachment list */}
        <div className="bg-[#eef4ff] border border-slate-200 p-5 rounded-xl">
          <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Project Documents</span>
          </h3>
          <p className="text-[11px] text-slate-500 mb-4 leading-normal">
            Quick file management for client onboarding contracts.
          </p>
          
          <div className="space-y-2 mb-4">
            {documents.map((doc, idx) => (
              <div 
                key={idx} 
                onClick={() => alert(`Downloading "${doc.name}" directly to your workstation downloads...`)}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-[#006a66] cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <FileText className={`w-3.5 h-3.5 ${doc.ext === 'pdf' ? 'text-rose-500' : 'text-blue-500'}`} />
                  <span>{doc.name}</span>
                </span>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-850" />
              </div>
            ))}
          </div>

          <form onSubmit={handleAddDocument} className="flex gap-1.5">
            <input 
              type="text" 
              value={newDocName}
              onChange={e => setNewDocName(e.target.value)}
              placeholder="e.g. SLA_Addendum.pdf"
              className="flex-1 bg-white border border-slate-200 text-xs px-2 py-1.5 rounded focus:ring-1 focus:ring-indigo-500 font-medium"
            />
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-[10px] font-mono uppercase px-3 py-1.5 rounded transition-colors"
            >
              Add Contract
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
