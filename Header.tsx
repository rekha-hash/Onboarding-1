/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, HelpCircle, Bell, User, Flag, AlertTriangle, Calendar, Upload, CheckCircle2 } from 'lucide-react';
import { Project, AppUser } from '../types';
import { parseDate } from '../utils/dateUtils';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: string;
  loggedInUser: AppUser;
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onUpdateUser: (u: AppUser) => void;
  onOpenHelp: () => void;
}

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  currentUser,
  loggedInUser,
  projects,
  onSelectProject,
  onUpdateUser,
  onOpenHelp
}: HeaderProps) {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter projects for search autocomplete
  const matchingProjects = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return projects.filter(p => {
      const matchName = p.customerName.toLowerCase().includes(query);
      const matchOwner = p.projectOwner.toLowerCase().includes(query);
      const matchId = p.id.toLowerCase().includes(query);
      const matchCOB = p.cobNumber?.toLowerCase().includes(query);
      const matchONB = p.onboardingNumber?.toLowerCase().includes(query);
      return matchName || matchOwner || matchId || matchCOB || matchONB;
    });
  }, [searchQuery, projects]);

  // Calculate dynamic notifications for approaching/overdue milestone deadlines
  const deadlineNotifications = useMemo(() => {
    const list: Array<{ id: string; type: 'approaching' | 'overdue'; customer: string; milestone: string; date: string; project: Project }> = [];
    const today = new Date();
    
    projects.forEach(p => {
      p.milestones.forEach(m => {
        if (m.status === 'In Progress' || m.status === 'Pending') {
          const endDate = parseDate(m.endDate);
          if (!isNaN(endDate.getTime())) {
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
              list.push({
                id: `${p.id}-${m.no}-overdue`,
                type: 'overdue',
                customer: p.customerName,
                milestone: m.name,
                date: m.endDate,
                project: p
              });
            } else if (diffDays <= 3) {
              list.push({
                id: `${p.id}-${m.no}-approaching`,
                type: 'approaching',
                customer: p.customerName,
                milestone: m.name,
                date: m.endDate,
                project: p
              });
            }
          }
        }
      });
    });
    return list;
  }, [projects]);

  // Handle profile picture file upload
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert("Please select a photo smaller than 1.5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        onUpdateUser({
          ...loggedInUser,
          avatar: base64Str
        });
        alert("🎉 Profile picture updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile image URL or base64 placeholder
  const avatarUrl = loggedInUser.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAAXVZNGxM4i5bu4RRX09ZJJIYeUVFTBHMO7OkQEMoQfMOOUt1fW6L3lJqOZvc6QqEfF8HPUUTHAZHzggv0t8h_tzIOLrNmrNoT-PcbYFdvpjHvSJn--x32RuzdPg9Td17O4odK6jNG7EkB_YnOcq69sD0_WZLVuPDl3lzup-leDbtcsvHRpeJerE9ImXnaeSTsBunAMO51b6zVa-5ZRT1h0D7jYhVMCYvA3yez6QLR295BPlecDpNVq9nF61_nKayEl2M8gYQBPTo";

  return (
    <header className="bg-white flex justify-between items-center w-full px-6 h-16 sticky top-0 z-30 border-b border-slate-200 shadow-sm ml-64 max-w-[calc(100vw-16rem)]">
      <div className="flex items-center gap-4">
        <div className="text-xl font-black text-slate-900 tracking-tight flex items-center">
          <span>PROJECT WORKFLOW</span>
        </div>
        <div className="h-6 w-px bg-slate-200 mx-2"></div>
        
        {/* Global Search Autocomplete Bar */}
        <div className="relative" ref={searchContainerRef}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs focus:ring-1 focus:ring-indigo-500 w-72 transition-all font-semibold text-slate-700" 
            placeholder="Search Project Name, Owner, COB..."
            id="global-search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-200/60 hover:bg-slate-200 px-1.5 py-0.5 rounded font-bold font-mono"
            >
              CLEAR
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && matchingProjects.length > 0 && (
            <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 max-h-80 overflow-y-auto">
              <div className="px-3.5 py-1 text-[9px] font-mono font-bold text-slate-450 uppercase tracking-widest border-b border-slate-100 pb-2 mb-1">
                Matching Onboarding Workspaces
              </div>
              {matchingProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p);
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50/80 flex items-start gap-2.5 transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="mt-0.5 w-6 h-6 rounded bg-[#81f2eb]/40 border border-[#006f6a]/20 flex items-center justify-center font-mono text-[9px] font-extrabold text-[#006f6a]">
                    ONB
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-xs font-bold text-slate-800 truncate">{p.customerName}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-mono">
                      <span>ONB: {p.onboardingNumber || p.id}</span>
                      {p.cobNumber && p.cobNumber !== p.onboardingNumber && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>COB: {p.cobNumber}</span>
                        </>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-500">{p.projectOwner}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenHelp}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          title="Help Guide"
          id="hdr-help-btn"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Dynamic Deadline Notifications Bell */}
        <div className="relative" ref={notifContainerRef}>
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors relative cursor-pointer"
            title="Milestone Alerts"
            id="hdr-notif-btn"
          >
            <Bell className="w-5 h-5" />
            {deadlineNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2.5 max-h-[380px] overflow-y-auto">
              <div className="px-4 py-1.5 border-b border-slate-100 flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest">
                  Milestone Deadline Alerts
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                  {deadlineNotifications.length} active
                </span>
              </div>
              
              {deadlineNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400 text-xs italic flex flex-col items-center gap-1.5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <span>All milestone timelines are currently in alignment. No approaching or overdue targets!</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {deadlineNotifications.map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        onSelectProject(notif.project);
                        setShowNotifDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50/70 flex items-start gap-3 transition-colors"
                    >
                      {notif.type === 'overdue' ? (
                        <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-amber-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                            {notif.customer}
                          </span>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${notif.type === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                            {notif.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-normal line-clamp-2">
                          Milestone "{notif.milestone}" target {notif.type === 'overdue' ? 'was missed on' : 'approaches on'} {notif.date}.
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Area with base64 Photo Upload */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
          <div className="text-right">
            <div className="text-xs font-bold leading-none text-slate-800">
              {currentUser === 'All Owners' ? 'Sarah Jenkins' : currentUser}
            </div>
            <div className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold mt-1">
              {loggedInUser.role}
            </div>
          </div>
          
          <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
            <img 
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm group-hover:opacity-80 transition-opacity" 
              src={avatarUrl}
              alt="User avatar"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="w-3.5 h-3.5 text-white" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
