/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  HelpCircle, 
  TrendingUp, 
  AlertTriangle, 
  ListTodo, 
  BarChart, 
  CheckCircle,
  FileText, 
  FileSpreadsheet, 
  CornerDownRight, 
  Loader2, 
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Globe,
  Activity
} from 'lucide-react';
import { Project } from '../types';
import { 
  downloadCustomReportPdf, 
  downloadCustomReportExcel, 
  downloadCustomReportWord 
} from '../utils/reportGenerator';

interface InteractiveAgentViewProps {
  projects: Project[];
}

export default function InteractiveAgentView({ projects }: InteractiveAgentViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [useWebGrounding, setUseWebGrounding] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [generationError, setGenerationError] = useState<string>('');

  // Standard reference templates
  const promptTemplates = [
    {
      title: "⏳ Timeline Drift Audit",
      desc: "Audit onboarding dates, trial runs & delays",
      prompt: "Provide an analytical review of onboarding timelines, highlight delayed items, and estimate general drift on delivery schedules.",
      projectIdNeeded: true
    },
    {
      title: "🔴 Status Roadblocks",
      desc: "Deep-dive of red/amber milestones",
      prompt: "Provide a comprehensive audit of all Red and Amber milestones, detail current roadblocks, and outline specific remedial actions.",
      projectIdNeeded: true
    },
    {
      title: "📊 Checklist & Scope UAT",
      desc: "Analyze training velocity & accomplishments",
      prompt: "Perform a deep-dive analysis on scope completion, identifying training velocity bottlenecks and onboarding checklist achievements.",
      projectIdNeeded: true
    },
    {
      title: "💼 Compact Portfolio KPIs",
      desc: "High-level summary across all accounts",
      prompt: "Summarize high-level portfolio KPIs, average onboarding completion, and critical customer milestones across all current accounts.",
      projectIdNeeded: false
    }
  ];

  const handleSelectTemplate = (tmpl: typeof promptTemplates[0]) => {
    setCustomPrompt(tmpl.prompt);
    if (!tmpl.projectIdNeeded) {
      setSelectedProjectId('');
    } else if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError('');
    setGeneratedReport(null);

    const steps = [
      "1/4: Parsing application database & onboarding metrics...",
      "2/4: Activating Google Search web grounding crawler...",
      "3/4: Benchmarking local project metrics against industry delivery standards...",
      "4/4: Synthesizing expert AI advisory insights & formulating remediation plans..."
    ];

    try {
      // Animated step transition simulation
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, i === 1 ? 1200 : 800));
      }

      const response = await fetch("/api/generate-custom-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedProjectId: selectedProjectId || undefined,
          customPrompt: customPrompt || "Provide a comprehensive onboarding advisory report",
          projects,
          useWebGrounding
        })
      });

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedReport(data);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Failed to contact Gemini Advisory API server.");
    } finally {
      setIsGenerating(false);
      setCurrentStep('');
    }
  };

  const getSelectedProjectName = () => {
    if (!selectedProjectId) return "Entire Active Portfolio (Compact)";
    const p = projects.find(item => item.id === selectedProjectId);
    return p ? `${p.customerName} (ONB: ${p.onboardingNumber || p.id})` : "Selected Workspace";
  };

  return (
    <div className="p-6 ml-64 max-w-[calc(100vw-16rem)] min-h-screen overflow-y-auto font-sans">
      {/* Module Header */}
      <div className="mb-6 flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Interactive AI Agent</h1>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">
            Enterprise Status Synthesizer &amp; External Grounding Reporter
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full font-mono font-bold">
          <Globe className="w-3.5 h-3.5 animate-spin-slow" />
          <span>WEB-INTEGRATED ACTIVE MODEL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Input Configuration Column (1/3 width) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              <span>Report Target Scope</span>
            </h2>

            {/* Target Select Dropdown */}
            <div>
              <label className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold block mb-1.5">
                Target Project Context:
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-lg p-2.5 transition-all text-slate-850 cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">💼 None - Compact Portfolio-Wide Report</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    📈 {p.customerName} (ONB: {p.onboardingNumber || p.id}) — PM: {p.projectOwner}
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-400 font-mono mt-1.5 leading-normal">
                Select a specific customer to feed their direct 22-milestone history, or choose Portfolio-Wide for aggregate metrics.
              </p>
            </div>

            {/* Quick Prompt Templates */}
            <div>
              <label className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold block mb-2">
                💡 Quick Reference Advisory Templates:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {promptTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="text-left p-3 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 transition-all text-xs flex flex-col justify-between cursor-pointer group"
                  >
                    <span className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {tmpl.title}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-normal mt-1">
                      {tmpl.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Search Grounding Switch */}
            <div className="bg-gradient-to-r from-indigo-50 to-sky-50 p-4 rounded-lg border border-indigo-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-indigo-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">AI Web Grounding Sources</span>
                    <span className="text-[10px] text-slate-500 block">Query live industry benchmarks &amp; PM guidelines</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useWebGrounding}
                    onChange={(e) => setUseWebGrounding(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <p className="text-[9px] text-slate-500 font-mono mt-2 leading-relaxed">
                When enabled, the advisory engine uses real-time Google Search to query external tech resources, standards and links them in the generated report.
              </p>
            </div>

            {/* Prompt Instruction TextArea */}
            <div>
              <label className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold block mb-1.5">
                ✏️ Custom Advisory Prompt Instructions:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Type details about what critical metrics or custom timeline aspects you want analyzed..."
                rows={4}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-slate-50 hover:bg-slate-100/50 transition-all text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {/* CTA Trigger Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Advisory Report...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Advisory Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Preview & Download Columns (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Default Empty State */}
          {!isGenerating && !generatedReport && !generationError && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-4 animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-850 tracking-tight">AI Agent Awaiting Instructions</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Configure your target customer scope, toggle the Web Grounding switch to pull up-to-the-minute benchmarks, and click **Generate** to formulate a comprehensive advisory report.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg">
                <span className="text-[10px] font-semibold text-slate-500 px-3 py-1 bg-slate-100 rounded-full">✓ Live Search Grounding</span>
                <span className="text-[10px] font-semibold text-slate-500 px-3 py-1 bg-slate-100 rounded-full">✓ 22-Milestone Analytics</span>
                <span className="text-[10px] font-semibold text-slate-500 px-3 py-1 bg-slate-100 rounded-full">✓ High-Fidelity PDF</span>
                <span className="text-[10px] font-semibold text-slate-500 px-3 py-1 bg-slate-100 rounded-full">✓ Downloadable Excel</span>
              </div>
            </div>
          )}

          {/* Loading Active Pipeline */}
          {isGenerating && (
            <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-850 p-8 shadow-lg flex flex-col justify-center min-h-[400px]">
              <div className="flex items-center gap-3 mb-6">
                <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                <div>
                  <h3 className="text-base font-bold text-slate-100">AI Advisory Engine Synthesizing</h3>
                  <p className="text-[10px] text-teal-400 font-mono uppercase tracking-widest mt-0.5">Integrating database &amp; web standards</p>
                </div>
              </div>

              {/* Steps Progress */}
              <div className="space-y-4">
                <div className="p-3.5 bg-white/5 rounded-lg border border-white/10 font-mono text-xs text-teal-300 animate-pulse">
                  {currentStep}
                </div>

                <div className="text-[11px] text-slate-400 font-sans space-y-1.5 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">⚙</span>
                    <span>Retrieving onboarding timeline profiles...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">⚙</span>
                    <span>Formulating industry delivery benchmarks...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">⚙</span>
                    <span>Computing metrics and risk scores...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {generationError && (
            <div className="bg-red-50 text-red-800 rounded-xl border border-red-200 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 font-bold mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Error Generating Advisory Report</span>
              </div>
              <p className="text-xs text-red-700 leading-relaxed font-mono">
                {generationError}
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Generation</span>
              </button>
            </div>
          )}

          {/* Beautiful Report Preview & Exporters */}
          {generatedReport && (
            <div className="space-y-4">
              
              {/* Export Panel with Clear, Beautiful Icons (PDF, Excel, Word Symbols) */}
              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      📥 Download and Export Formats
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Ready for corporate distribution. High-fidelity layouts with dedicated symbols.
                    </p>
                  </div>
                  <div className="text-[10px] text-teal-400 bg-teal-950/80 border border-teal-900 px-2.5 py-1 rounded font-mono font-bold uppercase self-start sm:self-auto">
                    Report Compiled OK
                  </div>
                </div>

                {/* Exporters Grid with distinct icons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* PDF Button */}
                  <button
                    type="button"
                    onClick={() => downloadCustomReportPdf(generatedReport)}
                    className="flex items-center justify-center gap-2.5 py-3 bg-rose-650 hover:bg-rose-750 text-white font-extrabold rounded-lg text-xs transition-all shadow-md transform hover:scale-[1.01] cursor-pointer"
                    id="download-agent-pdf-btn"
                  >
                    <FileText className="w-4 h-4 text-rose-100" />
                    <span>Download PDF Document</span>
                  </button>

                  {/* Excel Button */}
                  <button
                    type="button"
                    onClick={() => downloadCustomReportExcel(generatedReport)}
                    className="flex items-center justify-center gap-2.5 py-3 bg-emerald-650 hover:bg-emerald-750 text-white font-extrabold rounded-lg text-xs transition-all shadow-md transform hover:scale-[1.01] cursor-pointer"
                    id="download-agent-excel-btn"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                    <span>Download Excel Sheet</span>
                  </button>

                  {/* Word Button */}
                  <button
                    type="button"
                    onClick={() => downloadCustomReportWord(generatedReport)}
                    className="flex items-center justify-center gap-2.5 py-3 bg-blue-650 hover:bg-blue-750 text-white font-extrabold rounded-lg text-xs transition-all shadow-md transform hover:scale-[1.01] cursor-pointer"
                    id="download-agent-word-btn"
                  >
                    <FileText className="w-4 h-4 text-blue-100" />
                    <span>Download Word Report</span>
                  </button>
                </div>
              </div>

              {/* Printable Interactive Preview Container */}
              <div className="bg-white rounded-xl border border-slate-300 p-6 md:p-8 shadow-md space-y-6 text-slate-800">
                
                {/* Document Header */}
                <div className="border-b-2 border-indigo-600 pb-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-snug">
                      {generatedReport.title || "Enterprise Advisory Custom Report"}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-[10px] font-bold uppercase tracking-wide">
                      <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                        {generatedReport.scopeLabel || "Scope Label"}
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-500">
                        Nucore Custom AI Engine
                      </span>
                    </div>
                  </div>

                  {/* RAG Status Rating Display */}
                  <div className="self-start">
                    <div className={`px-4 py-2 rounded-lg border font-bold text-xs uppercase tracking-wider text-center ${
                      generatedReport.ragRating?.toLowerCase().includes('green') 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : generatedReport.ragRating?.toLowerCase().includes('amber')
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      <div className="text-[8px] font-mono text-slate-400 block tracking-widest leading-none mb-1">
                        RAG RATING
                      </div>
                      <span className="text-sm font-black tracking-tight">{generatedReport.ragRating || "Green"}</span>
                    </div>
                  </div>
                </div>

                {/* Executive Narrative */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                    <span>I. Executive Commentary</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify whitespace-pre-line">
                    {generatedReport.executiveSummary}
                  </p>
                </div>

                {/* Graphical Performance Analytics Metrics */}
                {generatedReport.graphicalData && generatedReport.graphicalData.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
                      <span>II. Graphical Analytics &amp; Key Metrics Representation</span>
                      <span className="text-[8px] font-mono text-slate-400 uppercase font-bold tracking-wider">Metrics Derived From Local Data</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {generatedReport.graphicalData.map((item: any, i: number) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{item.label}</span>
                            <span className="text-indigo-600 font-mono">{item.value}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000"
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestone Performance Assessment */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                    <span>III. Deliverable Alignment &amp; Risks Analysis</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {generatedReport.milestonePerformance}
                  </p>
                </div>

                {/* Priority Highlights Findings List */}
                {generatedReport.highlights && generatedReport.highlights.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
                      <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                      <span>IV. Priority Findings &amp; Process Highlights</span>
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                      {generatedReport.highlights.map((item: string, idx: number) => (
                        <li key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs text-slate-700 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action steps Remediation Plan */}
                {generatedReport.actionPlan && generatedReport.actionPlan.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
                      <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
                      <span>V. Strategic Remediation Road-Ahead</span>
                    </h3>
                    <div className="space-y-2">
                      {generatedReport.actionPlan.map((item: string, index: number) => (
                        <div key={index} className="flex gap-3 items-start p-3 bg-indigo-50/40 rounded-lg border border-indigo-100/50">
                          <span className="bg-indigo-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-xs text-slate-750 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounding web resources sources if available */}
                {generatedReport.groundingSources && generatedReport.groundingSources.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6">
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wide">
                        🌐 Integrated Live Web Benchmarks (AI Grounding Sources)
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-3 font-medium">
                      The following web sources were crawled and integrated to formulate the strategic industry recommendations in this report:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {generatedReport.groundingSources.map((src: any, i: number) => (
                        <a 
                          key={i} 
                          href={src.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-indigo-400 rounded-lg text-xs text-indigo-600 hover:text-indigo-800 transition-all font-semibold group"
                        >
                          <span className="truncate max-w-[90%]">{src.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 shrink-0 ml-1.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authentication Validation Footer Stamp */}
                <div className="border-t border-slate-200 pt-4 mt-8 flex flex-col md:flex-row md:justify-between md:items-center text-[10px] text-slate-400 uppercase font-mono tracking-wider gap-2">
                  <div>
                    <span>Authorized Nucore AI Advisory System</span>
                  </div>
                  <div>
                    <span>Compiled: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
