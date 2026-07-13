/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { 
  Sparkles, 
  Download, 
  Share2, 
  Send, 
  CheckCircle, 
  User, 
  Clock, 
  Briefcase,
  AlertOctagon,
  FileText
} from 'lucide-react';
import { Project, ClosedProject, WeeklyTask } from '../types';

interface WeeklyUpdatesViewProps {
  projects: Project[];
  onUpdateProject: (updated: Project) => void;
}

export default function WeeklyUpdatesView({ projects, onUpdateProject }: WeeklyUpdatesViewProps) {
  
  // Weekly Tasks Checklist List
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>([
    { id: 't1', projectName: 'Global Tech Solutions', taskName: 'Kickoff and Scoping Docs signoff', completed: true, dueDate: '2025-10-30' },
    { id: 't2', projectName: 'Aerospace Dynamics', taskName: 'TRAACS Installation validation logs', completed: false, dueDate: '2025-11-05' },
    { id: 't3', projectName: 'Aspiration Integrations', taskName: 'Establish secure Sandbox credentials config', completed: false, dueDate: '2025-11-12' },
    { id: 't4', projectName: 'Apex Logistics', taskName: 'COA financial structure double check', completed: false, dueDate: '2025-11-20' },
  ]);

  // Form states for internal updates
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [internalRemark, setInternalRemark] = useState('');

  // Closed projects history matching Image 6
  const [closedProjects, setClosedProjects] = useState<ClosedProject[]>([
    { id: '#ONB-882', projectName: 'Infrastructure Overhaul', owner: 'Sarah Chen', completionDate: 'May 15, 2024', status: 'ARCHIVED' },
    { id: '#ONB-761', projectName: 'Mobile Client v2.1', owner: 'Marcus Thorne', completionDate: 'May 12, 2024', status: 'ARCHIVED' },
    { id: '#ONB-904', projectName: 'Data Integrity Audit', owner: 'Lisa Ray', completionDate: 'May 08, 2024', status: 'ARCHIVED' },
    { id: '#ONB-212', projectName: 'Security Patch 4.0', owner: 'Dev Team A', completionDate: 'May 01, 2024', status: 'ARCHIVED' }
  ]);

  // Status distributions for charts
  const statusDist = {
    active: 12,
    pending: 4,
    delayed: 2
  };

  // Toggle tasks check
  const toggleTask = (id: string) => {
    setWeeklyTasks(weeklyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Generate tasks dynamically based on active project milestones
  const generateWeeklyTasks = () => {
    const newGenerated: WeeklyTask[] = [];
    let count = 0;

    projects.forEach(p => {
      // Find pending milestones in active projects
      const pendingNode = p.milestones.find(m => m.status === 'Pending' || m.status === 'In Progress');
      if (pendingNode && count < 2) {
        newGenerated.push({
          id: `gen-${p.id}-${Date.now()}-${count}`,
          projectName: p.customerName,
          taskName: `Verify "${pendingNode.name}" status for onboarding compliance`,
          completed: false,
          dueDate: pendingNode.startDate !== 'N/A' ? pendingNode.startDate : '2025-12-01'
        });
        count++;
      }
    });

    if (newGenerated.length === 0) {
      alert("No additional pending milestones found to generate tasks!");
      return;
    }

    setWeeklyTasks([...weeklyTasks, ...newGenerated]);
    alert(`⚡ Generated ${newGenerated.length} critical deliverables tasks for coming week based on active milestones sequence!`);
  };

  // Submit Remarks form linking directly to project milestones notes/history!
  const handleRemarksSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!internalRemark.trim() || !selectedProjectId) {
      alert("Please provide the remark and choose a project.");
      return;
    }

    const targetProject = projects.find(p => p.id === selectedProjectId);
    if (!targetProject) return;

    // Append standard remark to first In Progress/Pending milestone of project as feedback!
    const updatedMilestones = targetProject.milestones.map((m, index) => {
      // update the active milestone
      if (m.status === 'In Progress') {
        return {
          ...m,
          remarks: `${m.remarks ? m.remarks + ' | ' : ''}Lead note: ${internalRemark}`
        };
      }
      return m;
    });

    onUpdateProject({
      ...targetProject,
      milestones: updatedMilestones
    });

    alert(`✅ Remarks submitted for ${targetProject.customerName}! We have written this log directly into the project's active Milestone remarks.`);
    setInternalRemark('');
  };

  return (
    <div className="p-6 ml-64 max-w-[calc(100vw-16rem)] overflow-y-auto">
      
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Weekly Status &amp; Updates</h1>
        <p className="text-xs text-slate-500 font-mono mt-0.5">WEEKLY PROGRESS REPORT & ACTION PLANNING</p>
      </div>

      {/* Primary widgets split grid matching Image 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Left Side: Weekly Plan Generation Checklist */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-sm font-bold text-slate-800">Weekly Plan Generation</h2>
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 leading-normal mb-4">
              Auto-generate tasks for the coming week based on critical milestone dependencies sequentially.
            </p>

            <div className="space-y-3 mb-6">
              {weeklyTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    task.completed 
                      ? 'bg-slate-50 border-slate-200 text-slate-400' 
                      : 'bg-[#eef4ff]/30 border-blue-100 hover:border-indigo-400'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={task.completed} 
                    onChange={() => {}} // toggled by parent div click
                    className="mt-0.5 rounded text-indigo-600 border-slate-300"
                  />
                  <div className="flex-1">
                    <div className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.projectName}
                    </div>
                    <p className={`text-[11px] mt-0.5 ${task.completed ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
                      {task.taskName}
                    </p>
                    <div className="text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase">
                      Due: {task.dueDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={generateWeeklyTasks}
            className="w-full bg-slate-900 border border-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-lg hover:bg-slate-800 transition-colors uppercase font-mono tracking-wider text-center flex items-center justify-center gap-1.5 shadow-sm"
            id="btn-generate-weekly"
          >
            <Sparkles className="w-4.5 h-4.5 text-[#81f2eb]" />
            <span>Generate Tasks Checklist</span>
          </button>
        </div>

        {/* Right Side: Project Completion Report Visual Metrics */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Project Completion Status</h2>
                <p className="text-[10px] text-slate-450 font-mono">Global distribution by owner and status</p>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => alert("Report downloaded successfully!")}
                  className="p-1 px-2 border border-slate-200 text-[10px] font-bold bg-white text-slate-600 rounded flex items-center gap-1 shadow-sm"
                  id="btn-dl-report"
                >
                  <Download className="w-3 h-3" /> Export PDF
                </button>
                <button 
                  onClick={() => alert("Meeting deck link copied to clipboard!")}
                  className="p-1 px-2 border border-slate-200 text-[10px] font-bold bg-white text-slate-600 rounded flex items-center gap-1 shadow-sm"
                  id="btn-share-report"
                >
                  <Share2 className="w-3 h-3" /> Share
                </button>
              </div>
            </div>

            {/* Simulated report distributions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              
              {/* Distribution bars */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  DISTRIBUTION BY STATUS
                </span>
                
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Active Projects ({statusDist.active})</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#006a66] h-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Pending Projects ({statusDist.pending})</span>
                    <span>20%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: '20%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Delayed Projects ({statusDist.delayed})</span>
                    <span>15%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>

              {/* Ownership Pie chart */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-4">
                  OWNERSHIP DELEGATION SPLIT
                </span>
                
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-45" viewBox="0 0 36 36">
                    {/* Segment 1: Tech */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#006a66" strokeWidth="4.2" strokeDasharray="50 100" strokeDashoffset="0"></circle>
                    {/* Segment 2: Ops */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4.2" strokeDasharray="30 100" strokeDashoffset="-50"></circle>
                    {/* Segment 3: Design */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="4.2" strokeDasharray="20 100" strokeDashoffset="-80"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-900 leading-none">18</span>
                    <span className="text-[8px] font-mono uppercase text-slate-400 mt-1 font-bold">Total PMs</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 text-[10px] font-bold font-mono">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#006a66]"></span> Tech</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span> Ops</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></span> Design</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Internal update inputs & Closed Projects log layout matching Image 6 lower-half */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Internal Update submission form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <form onSubmit={handleRemarksSubmit} className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Weekly Internal Update</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Post remarks to active milestones</p>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
                Select Project Scope
              </label>
              <select 
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.customerName} (ONB: {p.onboardingNumber || p.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
                Remarks &amp; Active Milestone Challenges
              </label>
              <textarea 
                required
                rows={4}
                value={internalRemark}
                onChange={e => setInternalRemark(e.target.value)}
                placeholder="Detail any active blocks or key deliverables achieved..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 font-medium leading-relaxed resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#006a66] hover:bg-[#00504d] text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              id="sub-remarks-btn"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Internal Remarks Log</span>
            </button>
          </form>
        </div>

        {/* Right Side: Closed Projects history table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Archived Onboarding Histories</h2>
              <p className="text-[10px] text-slate-400 font-mono">Move completed projects here once live</p>
            </div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded">
              8 Projects Closed This Month
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono text-[9px] uppercase font-bold tracking-wider">
                  <th className="p-3 border-r border-slate-800 w-24">Onboarding Number</th>
                  <th className="p-3 border-r border-slate-800">Customer Project Name</th>
                  <th className="p-3 border-r border-slate-800 w-28">Closed Owner</th>
                  <th className="p-3 border-r border-slate-800 w-28">Live Date</th>
                  <th className="p-3 text-center w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {closedProjects.map(proj => (
                  <tr key={proj.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-[#006a66]">{proj.id}</td>
                    <td className="p-3 font-bold text-slate-800">{proj.projectName}</td>
                    <td className="p-3 text-slate-600 font-semibold">{proj.owner}</td>
                    <td className="p-3 font-mono font-medium text-slate-500">{proj.completionDate}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block bg-slate-100 text-slate-600 border border-slate-200 text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm">
                        {proj.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
