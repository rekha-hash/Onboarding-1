/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, 
  FolderGit2, 
  Flag, 
  Calendar, 
  BarChart3, 
  Plus, 
  Settings, 
  LogOut,
  Users,
  ShieldAlert,
  FolderLock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { AppUser } from '../types';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onOpenQuickUpdate: () => void;
  onOpenAddProject: () => void;
  loggedInUser: AppUser;
  onLogout: () => void;
}

export default function Sidebar({ 
  currentTab, 
  setTab, 
  onOpenQuickUpdate, 
  onOpenAddProject,
  loggedInUser,
  onLogout
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col p-4 gap-2 border-r border-[#cbd5e1] bg-[#eef4ff] w-64 z-40 shadow-sm font-sans">
      <div className="mb-6 px-2">
        <div className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-indigo-600" />
          <span>Project Control</span>
        </div>
        <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mt-0.5 font-semibold">
          Project Tracking
        </div>
      </div>

      {/* Authenticated User Status Profile */}
      {loggedInUser.role === 'Administrator' && (
        <div className="mb-6 px-2 bg-white/80 p-3 rounded-lg border border-slate-250 shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-450 font-bold mb-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-500" />
            <span>Active Authenticated Session:</span>
          </div>
          <div className="font-black text-xs text-slate-800 tracking-tight mt-1 truncate">
            {loggedInUser.name}
          </div>
          <div className="text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-150 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">
            {loggedInUser.role}
          </div>
        </div>
      )}

      <nav className="flex-1 flex flex-col gap-1.5">
        <button 
          onClick={() => setTab('dashboard')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${
            currentTab === 'dashboard' 
              ? 'bg-[#81f2eb]/70 text-[#006f6a] border-l-4 border-[#006a66]' 
              : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
          }`}
          id="tab-dashboard-btn"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button 
          onClick={() => setTab('projects')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${
            currentTab === 'projects' || currentTab === 'project-detail'
              ? 'bg-[#81f2eb]/70 text-[#006f6a] border-l-4 border-[#006a66]' 
              : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
          }`}
          id="tab-projects-btn"
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects</span>
        </button>

        <button 
          onClick={() => setTab('milestones')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${
            currentTab === 'milestones' 
              ? 'bg-[#81f2eb]/70 text-[#006f6a] border-l-4 border-[#006a66]' 
              : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
          }`}
          id="tab-milestones-btn"
        >
          <Flag className="w-4 h-4" />
          <span>Milestones</span>
        </button>

        <button 
          onClick={() => setTab('weekly-updates')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${
            currentTab === 'weekly-updates' 
              ? 'bg-[#81f2eb]/70 text-[#006f6a] border-l-4 border-[#006a66]' 
              : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
          }`}
          id="tab-weekly-btn"
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Updates</span>
        </button>

        <button 
          onClick={() => setTab('training-phases')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${
            currentTab === 'training-phases' 
              ? 'bg-[#81f2eb]/70 text-[#006f6a] border-l-4 border-[#006a66]' 
              : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
          }`}
          id="tab-training-btn"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Training Phases</span>
        </button>

        <button 
          onClick={() => setTab('interactive-agent')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${
            currentTab === 'interactive-agent' 
              ? 'bg-gradient-to-r from-indigo-100/80 to-sky-100/80 text-indigo-700 border-l-4 border-indigo-600 font-bold' 
              : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
          }`}
          id="tab-agent-btn"
        >
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>Interactive AI Agent</span>
        </button>

        {loggedInUser.role === 'Administrator' && (
          <button 
            onClick={() => setTab('user-management')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${
              currentTab === 'user-management' 
                ? 'bg-[#81f2eb]/70 text-[#006f6a] border-l-4 border-[#006a66]' 
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
            id="tab-users-btn"
          >
            <FolderLock className="w-4 h-4" />
            <span>Access &amp; Directory</span>
          </button>
        )}

        <button 
          onClick={() => setTab('help-faq')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left font-semibold text-sm ${
            currentTab === 'help-faq' 
              ? 'bg-[#81f2eb]/70 text-[#006f6a] border-l-4 border-[#006a66]' 
              : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
          }`}
          id="tab-help-btn"
        >
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span>Help &amp; FAQ</span>
        </button>

        <div className="mt-4 pt-3 border-t border-slate-300">
          <button 
            onClick={onOpenAddProject} 
            className="w-full bg-slate-900 text-white hover:bg-slate-800 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all font-bold text-xs"
            id="quick-add-project-btn"
          >
            <Plus className="w-4 h-4" />
            <span>New Onboarding</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-col gap-1 border-t border-slate-300 pt-3">
        <button 
          onClick={onOpenQuickUpdate}
          className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-200/50 rounded-lg text-left text-xs font-semibold"
          id="quick-update-sidebar-btn"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Quick Settings</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-left text-xs font-semibold"
          id="logout-btn"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
}
