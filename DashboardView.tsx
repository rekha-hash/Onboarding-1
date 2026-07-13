/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Folder, 
  Flag, 
  Percent, 
  AlertTriangle, 
  Filter, 
  Download, 
  BrainCircuit, 
  Activity, 
  ChevronRight,
  TrendingUp,
  Bolt
} from 'lucide-react';
import { Project } from '../types';
import MilestoneTrendChart from './MilestoneTrendChart';

interface DashboardViewProps {
  projects: Project[];
  setSelectedProject: (project: Project) => void;
  setTab: (tab: string) => void;
  searchQuery: string;
  onDownloadReport: () => void;
}

export default function DashboardView({ 
  projects, 
  setSelectedProject, 
  setTab,
  searchQuery,
  onDownloadReport
}: DashboardViewProps) {

  // Dynamic calculations based on state
  const totalProjects = projects.length;
  
  // Calculate average completion rate of active projects
  const activeProjects = projects.filter(p => p.status !== 'Closed');
  const finishedProjects = projects.filter(p => p.status === 'Closed');

  const calculateCompletionForProject = (project: Project) => {
    const act = project.milestones.filter(m => m.status !== 'Not Required');
    if (act.length === 0) return 0;
    const totalWt = act.reduce((sum, m) => sum + m.weightage, 0);
    const completedWt = act
      .filter(m => m.status === 'Completed')
      .reduce((sum, m) => sum + m.weightage, 0);
    return totalWt > 0 ? Math.round((completedWt / totalWt) * 100) : 0;
  };

  const overallCompletionSum = projects.reduce((acc, p) => acc + calculateCompletionForProject(p), 0);
  const overallAvgCompletion = totalProjects > 0 ? Math.round(overallCompletionSum / totalProjects) : 0;

  // Active milestones count across all active projects
  const totalActiveMilestones = projects.reduce((acc, p) => {
    return acc + p.milestones.filter(m => m.status === 'In Progress' || m.status === 'Completed').length;
  }, 0);

  // Pending Actions
  const totalPendingActions = projects.reduce((acc, p) => {
    return acc + p.milestones.filter(m => m.status === 'Pending' && m.rag === 'Red').length;
  }, 0);

  const [activeFilter, setActiveFilter] = useState<'Active' | 'In Progress' | 'Closed' | 'All'>('Active');

  // Filter projects by search query & selected tab filter
  const filteredAndTabProjects = projects.filter(p => {
    // Search query filter
    const query = searchQuery.toLowerCase();
    const matchesQuery = (
      p.customerName.toLowerCase().includes(query) ||
      p.projectOwner.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      (p.cobNumber && p.cobNumber.toLowerCase().includes(query)) ||
      (p.onboardingNumber && p.onboardingNumber.toLowerCase().includes(query))
    );
    if (!matchesQuery) return false;

    // Tab filter
    const comp = calculateCompletionForProject(p);
    if (activeFilter === 'Active') return p.status === 'Active';
    if (activeFilter === 'In Progress') return p.status === 'Active' && comp < 100;
    if (activeFilter === 'Closed') return p.status === 'Closed';
    return true; // All
  });

  return (
    <div className="p-6 ml-64 max-w-[calc(100vw-16rem)] overflow-y-auto">
      
      {/* Header section with page identity */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Onboarding Dashboard</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">CUSTOMER ONBOARDING REPORT & PERFORMANCE LOG</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onDownloadReport}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-transform hover:scale-[1.02] flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Portfolio Report</span>
          </button>
          <button 
            onClick={() => setTab('projects')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-transform hover:scale-[1.02] flex items-center gap-1.5 shadow-sm"
          >
            <span>Navigate to All Projects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Bento Grid metrics boxes matching mockup Image 5 layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Box 1: Total Projects */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between hover:border-indigo-500 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Projects</span>
            <Folder className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">{totalProjects}</div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+3 this month</span>
            </div>
          </div>
        </div>

        {/* Box 2: Active Milestones */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between hover:border-indigo-500 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Active Milestones</span>
            <Flag className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">{totalActiveMilestones}</div>
            <div className="text-[11px] text-slate-500 font-bold mt-1">
              <span>86% On-Track with timeline</span>
            </div>
          </div>
        </div>

        {/* Box 3: Overall Completion */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl col-span-1 relative overflow-hidden group hover:border-indigo-500 transition-all shadow-sm">
          <div className="flex justify-between items-start z-10 relative">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Overall Completion</span>
            <Percent className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="mt-4 z-10 relative">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">{overallAvgCompletion}%</div>
            <div className="w-full bg-slate-100 h-1.5 mt-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-1000" 
                style={{ width: `${overallAvgCompletion}%` }}
              ></div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none transform group-hover:scale-110 transition-transform">
            <Bolt className="w-20 h-20 text-slate-900" />
          </div>
        </div>

        {/* Box 4: Pending Actions */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl border-l-4 border-l-rose-500 flex flex-col justify-between hover:border-indigo-500 transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Critical Blockers</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">
              {totalPendingActions.toString().padStart(2, '0')}
            </div>
            <div className="text-[11px] text-rose-600 font-bold mt-1">
              <span>Requires Attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* D3 Milestone Trends Section */}
      <MilestoneTrendChart projects={projects} />

      {/* Dashboard Layout Split: Main Table Left, Challenges Sidebar Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Project Overview Table (9 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-800">Onboarding Status Report</h2>
              <p className="text-[10px] text-slate-400 font-mono">CLIENT ADOPTION progress tracking</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onDownloadReport}
                className="text-[10px] font-bold font-mono px-3 py-1.5 border border-[#006a66] bg-emerald-50 text-[#006a66] shadow-sm hover:bg-emerald-100/50 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" /> Export Summary
              </button>
            </div>
          </div>

          {/* Filter tabs row (Active, In Progress, Closed, All) */}
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/30 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {(['Active', 'In Progress', 'Closed', 'All'] as const).map((tab) => {
                const count = projects.filter(p => {
                  const comp = calculateCompletionForProject(p);
                  if (tab === 'Active') return p.status === 'Active';
                  if (tab === 'In Progress') return p.status === 'Active' && comp < 100;
                  if (tab === 'Closed') return p.status === 'Closed';
                  return true;
                }).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeFilter === tab
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab}</span>
                    <span className={`ml-1.5 text-[10px] font-mono px-1 rounded ${
                      activeFilter === tab ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                    }`}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Showing {filteredAndTabProjects.length} of {projects.length} Projects
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono text-[10px] uppercase font-bold tracking-wider">
                  <th className="px-6 py-3 border-r border-slate-800">Customer Name / Onboarding Number</th>
                  <th className="px-6 py-3 border-r border-slate-800">Project Owner</th>
                  <th className="px-6 py-3 border-r border-slate-800 text-center">Go Live</th>
                  <th className="px-6 py-3 border-r border-slate-800 text-center">Completion %</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndTabProjects.map((p) => {
                  const comp = calculateCompletionForProject(p);
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedProject(p)}
                      className="hover:bg-slate-50/75 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 flex items-center gap-1.5">
                          <span>{p.customerName}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-600 transition-opacity" />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono font-semibold mt-0.5">
                          ONB: {p.onboardingNumber || p.id}
                          {p.cobNumber && p.cobNumber !== p.onboardingNumber && ` • COB: ${p.cobNumber}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700">
                            {p.projectOwner.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{p.projectOwner}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-750 font-mono text-xs">
                        {p.goLiveDate || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[140px] mx-auto">
                          <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-1">
                            <span className="text-slate-700">{comp}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-700 ${
                                comp === 100 
                                  ? 'bg-slate-900' 
                                  : comp > 70 
                                  ? 'bg-[#006a66]' 
                                  : 'bg-indigo-600'
                              }`} 
                              style={{ width: `${comp}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border ${
                          p.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : p.status === 'Closed' 
                            ? 'bg-slate-100 text-slate-600 border-slate-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`rag-indicator mr-1.5 ${
                            p.status === 'Active' 
                              ? 'bg-emerald-500 animate-pulse' 
                              : p.status === 'Closed' 
                              ? 'bg-slate-400' 
                              : 'bg-amber-500'
                          }`}></span> 
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredAndTabProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-400 italic font-medium">
                      No onboarding projects found in this tab matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100">
            <button 
              onClick={() => setTab('projects')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
            >
              <span>View and Modify All Active Onboarding Sheets</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Widgets Sidebar (4 cols) mirroring Image 5 details */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Current Challenges List Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Current Onboarding Challenges</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3.5 group">
                <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 transition-colors group-hover:bg-rose-500 group-hover:text-white">
                  <span className="text-[10px] font-mono font-bold">W1</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Weekly Plan Generation</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                    Delay in synchronization with partner calendar assets & holidays.
                  </p>
                  <span className="inline-block mt-1 px-1.5 py-0.2 select-none text-[8px] font-mono font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100 rounded-sm">
                    CRITICAL PRIORITY
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3.5 group">
                <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 transition-colors group-hover:bg-[#006a66] group-hover:text-white">
                  <span className="text-[10px] font-mono font-bold">W2</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Project Plan Templates</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                    New customer accounts onboardings missing customized SLA metrics models.
                  </p>
                  <span className="inline-block mt-1 px-1.5 py-0.2 select-none text-[8px] font-mono font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-[#81f2eb] rounded-sm">
                    ACTIVE PROJECT TASK
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3.5 group">
                <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                  <span className="text-[10px] font-mono font-bold">W3</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Milestone Auto-calculators</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                    Automated timeline updates failing to recompute sequence for delayed nodes.
                  </p>
                  <span className="inline-block mt-1 px-1.5 py-0.2 select-none text-[8px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 rounded-sm">
                    UNDER PM REASSESSMENT
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Quarterly Goal progress card */}
          <div className="bg-slate-900 text-white p-6 rounded-xl relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                QUARTERLY ENTERPRISE GOAL
              </span>
              <h4 className="text-base font-bold text-white tracking-tight shrink-0 mb-3">
                On track for 15% adoption growth
              </h4>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-extrabold tracking-tight leading-none">74.2%</div>
                <div className="text-[10px] font-mono text-[#81f2eb] font-semibold mb-0.5">
                  +2.4% from LW
                </div>
              </div>
              <button 
                onClick={() => alert("Strategic Plan document downloaded!")}
                className="mt-5 bg-[#81f2eb]/90 hover:bg-[#81f2eb] text-[#001a42] font-bold text-xs py-2 px-4 rounded w-full transition-colors font-mono uppercase tracking-wider shadow-sm"
              >
                View Strategy Report
              </button>
            </div>
            
            {/* Dark background graphic */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500 to-teal-500 opacity-10 rounded-full blur-xl pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Bottom status and metadata bar mirroring mockup dashboard section */}
      <div className="mt-8 border-t border-slate-200 pt-5 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#006a66] animate-pulse" />
          <span>System Status: <span className="font-bold text-slate-800">Operational</span> (Last Sync: 2m ago)</span>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 border-2 border-white flex items-center justify-center text-[8px] font-bold shadow-sm">JD</div>
            <div className="w-6 h-6 rounded-full bg-teal-200 text-teal-800 border-2 border-white flex items-center justify-center text-[8px] font-bold shadow-sm">MK</div>
            <div className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 border-2 border-white flex items-center justify-center text-[8px] font-bold shadow-sm">AM</div>
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 border-2 border-white flex items-center justify-center text-[8px] font-bold shadow-sm">+12</div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Currently monitoring onboarding timelines across 4 departments
          </span>
        </div>
      </div>

    </div>
  );
}
