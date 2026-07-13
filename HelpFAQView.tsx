/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HelpCircle, BookOpen, Layers, Settings, ShieldAlert, Navigation, ArrowRight } from 'lucide-react';

export default function HelpFAQView() {
  return (
    <div className="p-6 ml-64 max-w-[calc(100vw-16rem)] overflow-y-auto font-sans">
      {/* Title Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-indigo-600" />
          <span>Help Center & FAQ Guide</span>
        </h1>
        <p className="text-xs text-slate-500 font-mono mt-0.5">COMPLETE APPLICATION OPERATING DOCUMENTATION</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Documentation Categories (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Overview */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>1. Website & System Overview</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This **Customer Onboarding Status & Milestone Engine** automates the end-to-end adoption workflow for client deployments. It enables implementation coordinators, sales professionals, and executive leadership to align target timelines, log technical subsystems training, generate custom AI-powered audience status updates, and audit project scopes within a single pane of glass.
            </p>
          </div>

          {/* Section 2: Available Modules */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>2. Available Modules & Features</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-1">📊 Onboarding Dashboard</h3>
                <p className="text-slate-500 leading-relaxed">
                  Real-time portfolio summary. Track total adoptions, active milestone checklists, overall completion percentages, and view D3-powered milestone trend analytics.
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-1">📁 Portfolios & Milestone Sheets</h3>
                <p className="text-slate-500 leading-relaxed">
                  Deep dive into a project. Create customized onboarding records, assign user-defined Onboarding Numbers, manage checklist tasks inline, and log collaborative project feedback notes.
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-1">🎓 Training Module</h3>
                <p className="text-slate-500 leading-relaxed">
                  Define user-training phases, configure specific subject categories, subsystems, modules, and sessions. Export training data seamlessly to Excel.
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-1">🤖 Interactive AI Assistant</h3>
                <p className="text-slate-500 leading-relaxed">
                  Query the intelligent AI using context-aware prompts or generate audience-tailored status reports matching the vocabulary of Customers, Executives, or Project Teams.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Navigation Guide */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
              <Navigation className="w-4 h-4 text-indigo-600" />
              <span>3. Navigation & Common Workflows</span>
            </h2>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[10px]">1</div>
                <div>
                  <p className="font-bold text-slate-800">Switching Modules</p>
                  <p className="text-slate-500 mt-0.5">Use the persistent left sidebar navigation. Click on any module icon to switch screens instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[10px]">2</div>
                <div>
                  <p className="font-bold text-slate-800">Searching Accounts</p>
                  <p className="text-slate-500 mt-0.5">Use the top header global search bar. Type a Project Name, Owner, or COB Onboarding Number to view matching items instantly in the autocomplete menu.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[10px]">3</div>
                <div>
                  <p className="font-bold text-slate-800">Milestone Deadlines & Date Logic</p>
                  <p className="text-slate-500 mt-0.5">
                    Our scheduling system uses the **DD-MM-YYYY** date format. It respects working days by automatically skipping Saturdays and Sundays. Milestone ranges adjust sequentially when updating root start dates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Role-Based Access Control */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              <span>4. Role-Based Permissions Summary</span>
            </h2>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse border border-slate-150 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 font-bold text-slate-700">
                    <th className="p-2.5 border-b border-slate-200">Role</th>
                    <th className="p-2.5 border-b border-slate-200">Permissions</th>
                    <th className="p-2.5 border-b border-slate-200">Authorized Panels</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-600">
                  <tr>
                    <td className="p-2.5 font-bold text-indigo-700">Super Admin / Admin</td>
                    <td className="p-2.5">Read, Write, Edit, Delete, User Configuration</td>
                    <td className="p-2.5">Full System Access, Simulated Active Sessions, Invite Emails</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-800">Project Owner</td>
                    <td className="p-2.5">Read &amp; edit assigned projects, create notes</td>
                    <td className="p-2.5">Dashboard, Personal Projects, Weekly Updates, AI Assistant</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-800">Lead &amp; Sales</td>
                    <td className="p-2.5">Read and review portfolio statistics</td>
                    <td className="p-2.5">Dashboard, Portfolio Reports, Training Schedules</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: FAQ Accordion (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-full">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <span>Frequently Asked Questions</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Q: How do I calculate milestone deadlines automatically?</h4>
                <p className="text-slate-500 leading-relaxed">
                  When adding or editing a project, simply define the Go Live Date. The system uses a working-days algorithm that ignores Saturdays and Sundays to map backwards, creating realistic project timelines.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Q: Where can I manage system users?</h4>
                <p className="text-slate-500 leading-relaxed">
                  Only Super Administrators have permission to view, edit, and create users. Navigate to **Access &amp; Directory** from the sidebar to send invitation links and change role settings.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Q: Can I delete projects?</h4>
                <p className="text-slate-500 leading-relaxed">
                  Yes. Go to the project detailed view, click the trash icon, and fill out a required Deletion Reason. The deletion will be tracked in the secure system audit logs.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Q: How do I export data to Excel or PDF?</h4>
                <p className="text-slate-500 leading-relaxed">
                  Export PDF buttons are available on the dashboard, project views, and weekly updates. To export a training schedule, use the "Export Excel" button inside the Training Summary module.
                </p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-indigo-950 font-medium">
                <span className="font-bold">Need more assistance?</span>
                <p className="text-[11px] text-slate-600 mt-1">Contact your system administrator or send a support request to rekha@nucore.in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
