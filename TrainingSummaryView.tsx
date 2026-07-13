/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { TrainingPhaseSummary, TRAINING_PHASES } from '../types';
import { BookOpen, Activity, Landmark, FileDown, Save, RefreshCw } from 'lucide-react';

export default function TrainingSummaryView() {
  const [phases, setPhases] = useState<TrainingPhaseSummary[]>(() => {
    const saved = localStorage.getItem('onboarding_training_phases');
    return saved ? JSON.parse(saved) : TRAINING_PHASES;
  });

  useEffect(() => {
    localStorage.setItem('onboarding_training_phases', JSON.stringify(phases));
  }, [phases]);

  // Handle inline edits
  const handleFieldChange = (index: number, field: keyof TrainingPhaseSummary, value: any) => {
    setPhases(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value
      };
      return copy;
    });
  };

  // Reset training phases back to original templates
  const handleResetToBaseline = () => {
    if (confirm("Are you sure you want to revert all custom training updates back to the 15-session standard baseline?")) {
      setPhases(TRAINING_PHASES);
      alert("Reverted training Phases to baseline templates successfully!");
    }
  };

  // Export to beautifully styled XML Excel Spreadsheet format
  const handleExportExcel = () => {
    let excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; margin-bottom: 24px; }
          td, th { border: 1px solid #cbd5e1; padding: 10px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; }
          th { background-color: #0f172a; color: #ffffff; font-weight: bold; text-align: left; }
          .title-header { font-size: 16px; font-weight: bold; color: #006a66; text-align: center; background-color: #f1f5f9; border: 2px solid #cbd5e1; }
          .footer-row { background-color: #0f172a; color: #ffffff; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <th colspan="6" class="title-header">ONBOARDING TRAINING PHASE SUMMARY MATRIX</th>
          </tr>
          <tr>
            <th>Phase ID</th>
            <th>Subject Category</th>
            <th>Days Allocation</th>
            <th>Total Sessions</th>
            <th>Key Modules & Subsystem Training</th>
            <th>Adopt Goal Focus Area</th>
          </tr>
          ${phases.map(p => `
            <tr>
              <td><b>${p.phase}</b></td>
              <td>${p.category}</td>
              <td>${p.days}</td>
              <td>${p.sessions}</td>
              <td>${p.keyModules}</td>
              <td>${p.focusArea}</td>
            </tr>
          `).join('')}
          <tr class="footer-row">
            <td colspan="2">Total Training Schedule</td>
            <td>${phases.reduce((acc, p) => acc + (Number(p.days) || 0), 0)} Days</td>
            <td>${phases.reduce((acc, p) => acc + (Number(p.sessions) || 0), 0)} Sessions</td>
            <td colspan="2">Standardized Curriculum Alignment System</td>
          </tr>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Onboarding_Training_Phases_Curriculum.xls');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSessions = phases.reduce((acc, p) => acc + (Number(p.sessions) || 0), 0);
  const totalDays = phases.reduce((acc, p) => acc + (Number(p.days) || 0), 0);

  return (
    <div className="p-6 ml-64 max-w-[calc(100vw-16rem)] overflow-y-auto font-sans">
      
      {/* Header section with Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Onboarding Training Phases</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">TRAINING PHASE SUMMARY — EDITABLE INTERACTIVE MATRICES</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToBaseline}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="Reset custom edits to default values"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Template</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-[#006a66] hover:bg-[#00524e] text-white text-xs font-black px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="Export curriculum as beautifully formatted Excel file"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Main explanation text card */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 max-w-xl">
          <BookOpen className="w-8 h-8 text-indigo-600 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-slate-850 uppercase font-mono tracking-widest text-slate-900">Training Implementation Matrix</h3>
            <p className="text-xs text-slate-500 leading-normal mt-1 font-medium">
              You can click directly inside any field in the table below to customize the training days, session weightage, key modules covered, and adoption goals inline. All changes are saved automatically.
            </p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-center shadow-sm shrink-0 font-mono">
          <div className="text-[10px] text-slate-450 uppercase font-bold tracking-widest">Aggregate Schedule</div>
          <div className="text-lg font-black text-slate-800">{totalDays} Workdays • {totalSessions} Sessions</div>
        </div>
      </div>

      {/* Grid Table with inline editable inputs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        
        {/* Table Title Bar */}
        <div className="p-4 bg-slate-900 text-white text-center">
          <h2 className="text-sm font-black font-mono tracking-widest text-[#81f2eb] uppercase">
            EDITABLE TRAINING CURRICULUM BLUEPRINT
          </h2>
          <p className="text-[10px] uppercase font-mono text-slate-400 mt-1 tracking-wider">
            High-Level Curriculum Blueprint &amp; inline adoption editor
          </p>
        </div>

        {/* Table structure */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                <th className="p-4 border-r border-slate-700 w-24 text-center bg-slate-850">Phase ID</th>
                <th className="p-4 border-r border-slate-700 w-44">Subject Category</th>
                <th className="p-4 border-r border-slate-700 w-32 text-center">Days allocation</th>
                <th className="p-4 border-r border-slate-700 w-32 text-center">Total Sessions</th>
                <th className="p-4 border-r border-slate-700">Key Modules &amp; Subsystem Training</th>
                <th className="p-4">Adopt Goal Focus Area</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {phases.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                  
                  {/* Phase ID column */}
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/50 font-mono text-center">
                    {row.phase}
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md text-center ${row.colorClass} shadow-sm w-full`}>
                      {row.category}
                    </span>
                  </td>

                  {/* Days column (Editable Input) */}
                  <td className="p-2 text-center bg-slate-50/20">
                    <input
                      type="number"
                      value={row.days}
                      onChange={(e) => handleFieldChange(idx, 'days', Number(e.target.value) || 0)}
                      className="w-20 text-center font-bold text-slate-700 font-mono bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </td>

                  {/* Sessions column (Editable Input) */}
                  <td className="p-2 text-center bg-indigo-50/10">
                    <input
                      type="number"
                      value={row.sessions}
                      onChange={(e) => handleFieldChange(idx, 'sessions', Number(e.target.value) || 0)}
                      className="w-20 text-center font-bold text-indigo-700 font-mono bg-white border border-indigo-200 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </td>

                  {/* Key Modules column (Editable Input) */}
                  <td className="p-2">
                    <textarea
                      value={row.keyModules}
                      onChange={(e) => handleFieldChange(idx, 'keyModules', e.target.value)}
                      rows={2}
                      className="w-full font-semibold text-slate-800 leading-normal bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-y"
                    />
                  </td>

                  {/* Focus Area column (Editable Input) */}
                  <td className="p-2">
                    <textarea
                      value={row.focusArea}
                      onChange={(e) => handleFieldChange(idx, 'focusArea', e.target.value)}
                      rows={2}
                      className="w-full font-medium text-slate-600 leading-relaxed bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-y"
                    />
                  </td>

                </tr>
              ))}

              {/* Total Aggregate Footer row */}
              <tr className="bg-slate-900 text-white font-mono text-xs font-bold uppercase">
                <td colSpan={2} className="p-4 text-right pr-6 uppercase tracking-wider">
                  Total Training Schedule
                </td>
                <td className="p-4 text-center text-[#81f2eb]">
                  {totalDays} Days
                </td>
                <td className="p-4 text-center text-[#81f2eb]">
                  {totalSessions} Sessions
                </td>
                <td colSpan={2} className="p-4 pl-6 text-[#81f2eb] text-[10px] font-medium tracking-wide">
                  💡 Align onboarding milestones with these session milestones dynamically.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Advisory cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-mono">
            <Landmark className="w-4 h-4 text-[#006a66]" />
            <span>Operational SLA Mandate</span>
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            All customer onboarding contracts default to this 15-session standard curriculum. Specialized plugins or APIs should be custom-scheduled if stated in initial contract appendices.
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-mono">
            <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Adoption Analytics Feedback</span>
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Overall adoption progress (RAG index) is calculated based on milestone weightages completion. Ensure Phase 9 is attained to move customer account into Archived/Closed status.
          </p>
        </div>
      </div>

    </div>
  );
}
