/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, TRAINING_PHASES } from '../types';

/**
 * Downloads the original portfolio-wide onboarding report in HTML/Print format
 */
export function downloadExecutiveReport(projects: Project[], selectedProject?: Project | null) {
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalProjects = projects.length;
  const activeCount = projects.filter(p => p.status === 'Active').length;
  const closedCount = projects.filter(p => p.status === 'Closed').length;
  const delayedCount = projects.filter(p => p.status === 'Delayed').length;

  const averageCompletion = Math.round(
    projects.reduce((sum, p) => {
      const activeMilestones = p.milestones.filter(m => m.status !== 'Not Required');
      const completedWt = activeMilestones.filter(m => m.status === 'Completed').reduce((s, m) => s + m.weightage, 0);
      const totalWt = activeMilestones.reduce((s, m) => s + m.weightage, 0);
      return sum + (totalWt > 0 ? (completedWt / totalWt) * 100 : 0);
    }, 0) / (totalProjects || 1)
  );

  const projectsToRender = selectedProject ? [selectedProject] : projects;

  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Executive Onboarding & Milestone Compliance Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 40px 20px;
            line-height: 1.5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #0f172a;
            padding-bottom: 24px;
            margin-bottom: 30px;
        }
        .header-title h1 {
            font-size: 28px;
            font-weight: 900;
            color: #0f172a;
            margin: 0;
            letter-spacing: -0.05em;
            text-transform: uppercase;
        }
        .header-title p {
            font-size: 11px;
            color: #64748b;
            font-family: monospace;
            margin: 4px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: bold;
        }
        .meta-box {
            text-align: right;
        }
        .meta-box .date {
            font-size: 13px;
            font-weight: bold;
            color: #475569;
        }
        .meta-box .ref {
            font-size: 11px;
            color: #94a3b8;
            font-family: monospace;
            margin-top: 4px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 35px;
        }
        .stat-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 16px;
            border-radius: 12px;
            text-align: center;
        }
        .stat-card .label {
            font-size: 10px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
        }
        .stat-card .value {
            font-size: 24px;
            font-weight: 850;
            color: #0f172a;
        }
        .project-section {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            margin-bottom: 35px;
            overflow: hidden;
            background: #ffffff;
        }
        .project-header {
            background-color: #0f172a;
            color: #ffffff;
            padding: 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .project-header h2 {
            font-size: 18px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.02em;
        }
        .project-header .id-badge {
            background-color: rgba(255,255,255,0.15);
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-family: monospace;
            font-weight: bold;
        }
        .project-details-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 24px;
            background-color: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }
        .detail-item .lbl {
            font-size: 10px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .detail-item .val {
            font-size: 13px;
            font-weight: bold;
            color: #1e293b;
        }
        .detail-item .val-highlight {
            color: #0d9488;
            font-weight: 800;
        }
        .table-container {
            padding: 24px;
        }
        .table-container h3 {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 0;
            margin-bottom: 16px;
            color: #475569;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .m-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 12px;
        }
        .m-table th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
            padding: 12px;
            border-bottom: 2px solid #e2e8f0;
        }
        .m-table td {
            padding: 12px;
            border-bottom: 1px solid #f1f5f9;
        }
        .m-table tr:hover {
            background-color: #f8fafc;
        }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-completed { background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .badge-progress { background-color: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
        .badge-pending { background-color: #fffbeb; color: #854d0e; border: 1px solid #fef3c7; }
        .badge-notrequired { background-color: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }
        .rag-dot {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-weight: bold;
        }
        .rag-dot::before {
            content: "";
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        .rag-Green::before { background-color: #10b981; }
        .rag-Amber::before { background-color: #f59e0b; }
        .rag-Red::before { background-color: #ef4444; }
        .curriculum-section {
            margin-top: 40px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
        }
        .curriculum-header {
            background-color: #334155;
            color: #ffffff;
            padding: 16px 24px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
        @media print {
            body { background-color: #ffffff; padding: 0; }
            .container { border: none; box-shadow: none; padding: 0; }
            .project-section { page-break-inside: avoid; }
            .curriculum-section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-title">
                <h1>ONBOARDING & MILESTONE COMPLIANCE</h1>
                <p>Executive Portfolio Status Report</p>
            </div>
            <div class="meta-box">
                <div class="date">${dateStr}</div>
                <div class="ref">REF: OCR-${Math.floor(Math.random() * 90000) + 10000}</div>
            </div>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="label">Total Managed Portfolios</div>
                <div class="value">${totalProjects}</div>
            </div>
            <div class="stat-card">
                <div class="label">Active Onboardings</div>
                <div class="value" style="color: #0d9488;">${activeCount}</div>
            </div>
            <div class="stat-card">
                <div class="label">Average Completion Rate</div>
                <div class="value" style="color: #4f46e5;">${averageCompletion}%</div>
            </div>
            <div class="stat-card">
                <div class="label">Delayed Accounts</div>
                <div class="value" style="color: #e11d48;">${delayedCount}</div>
            </div>
        </div>
        ${projectsToRender.map(p => {
          const activeMilestones = p.milestones.filter(m => m.status !== 'Not Required');
          const completedWt = activeMilestones.filter(m => m.status === 'Completed').reduce((sum, m) => sum + m.weightage, 0);
          const totalWt = activeMilestones.reduce((sum, m) => sum + m.weightage, 0);
          const completion = totalWt > 0 ? Math.round((completedWt / totalWt) * 100) : 0;
          return `
          <div class="project-section">
              <div class="project-header">
                  <h2>${p.customerName}</h2>
                  <span class="id-badge">${p.id}</span>
              </div>
              <div class="project-details-grid">
                  <div class="detail-item">
                      <div class="lbl">Project Owner (PM)</div>
                      <div class="val">${p.projectOwner}</div>
                  </div>
                  <div class="detail-item">
                      <div class="lbl">Primary Sales Representative</div>
                      <div class="val">${p.salesperson}</div>
                  </div>
                  <div class="detail-item">
                      <div class="lbl">Go-Live Target Date</div>
                      <div class="val val-highlight">${p.goLiveDate}</div>
                  </div>
                  <div class="detail-item">
                      <div class="lbl">Adoption Progress</div>
                      <div class="val" style="font-weight: 850; color: #0d9488;">${completion}% Completed</div>
                  </div>
              </div>
              <div class="table-container">
                  <h3>
                      <span>Milestone Verification Checklist (22 Deliverables Waterfall)</span>
                      <span style="font-size: 11px; color: #64748b; font-weight: normal;">Active Multipliers: ${activeMilestones.length} nodes</span>
                  </h3>
                  <table class="m-table">
                      <thead>
                          <tr>
                              <th style="width: 40px; text-align: center;">No</th>
                              <th>Onboarding Deliverable Scope</th>
                              <th style="width: 90px;">Start Date</th>
                              <th style="width: 90px;">End Date</th>
                              <th style="text-align: right; width: 70px;">Weight</th>
                              <th style="width: 100px;">Status</th>
                              <th style="width: 80px;">RAG Level</th>
                              <th>Remarks & Technical Logs</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${p.milestones.map(m => {
                            const badgeClass = m.status === 'Completed' ? 'badge-completed' :
                                               m.status === 'In Progress' ? 'badge-progress' :
                                               m.status === 'Not Required' ? 'badge-notrequired' : 'badge-pending';
                            return `
                            <tr>
                                <td style="text-align: center; color: #94a3b8; font-weight: bold; font-family: monospace;">${m.no.toString().padStart(2, '0')}</td>
                                <td style="font-weight: bold; color: #1e293b;">${m.name}</td>
                                <td style="font-family: monospace; color: #475569;">${m.startDate}</td>
                                <td style="font-family: monospace; color: #475569;">${m.endDate}</td>
                                <td style="text-align: right; font-weight: bold; font-family: monospace; color: #4f46e5;">${m.weightage}%</td>
                                <td><span class="badge ${badgeClass}">${m.status}</span></td>
                                <td><span class="rag-dot rag-${m.rag}">${m.rag}</span></td>
                                <td style="color: #64748b; font-size: 11px;">${m.remarks || '—'}</td>
                            </tr>
                            `;
                          }).join('')}
                      </tbody>
                  </table>
              </div>
          </div>
          `;
        }).join('')}
        <div class="curriculum-section">
            <div class="curriculum-header">
                Standard Onboarding Training Curriculum (15 Sessions Lifecycle)
            </div>
            <div style="padding: 24px;">
                <table class="m-table">
                    <thead>
                        <tr>
                            <th style="width: 90px; text-align: center;">Phase</th>
                            <th>Category Subject</th>
                            <th style="width: 100px; text-align: center;">Days Allocation</th>
                            <th style="width: 100px; text-align: center;">Sessions</th>
                            <th>Key Modules & Subsystems Covered</th>
                            <th>Target Adoption Focus</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${TRAINING_PHASES.map(row => `
                        <tr>
                            <td style="text-align: center; font-weight: bold; color: #0f172a; background-color: #f8fafc; font-family: monospace;">${row.phase}</td>
                            <td><span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background-color: #f1f5f9; color: #334155;">${row.category}</span></td>
                            <td style="text-align: center; font-weight: bold; font-family: monospace;">${row.days}</td>
                            <td style="text-align: center; font-weight: 850; color: #4f46e5; font-family: monospace;">${row.sessions}</td>
                            <td style="font-weight: 600; color: #334155;">${row.keyModules}</td>
                            <td style="color: #64748b; font-size: 11px;">${row.focusArea}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="footer">
            <p><strong>NUCORE SOFTWARE SOLUTIONS — CONFIDENTIAL CUSTOMER ONBOARDING OPERATIONS</strong></p>
            <p style="margin-top: 4px;">This report serves as an official SLA record. Generated through the Authorized System Administrator Console.</p>
        </div>
    </div>
</body>
</html>`;

  const filename = selectedProject 
    ? `Onboarding_Report_${selectedProject.customerName.replace(/\s+/g, '_')}.html`
    : `Executive_Onboarding_Portfolio_Report.html`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const newWin = window.open();
    if (newWin) {
      newWin.document.write(htmlContent);
      newWin.document.close();
    }
  }
}

/**
 * Builds HTML code for the AI-generated report content
 */
function buildAiReportHtml(title: string, reportData: any, project: Project, reportType: string): string {
  const rag = reportData.ragRating || 'Green';
  const ragColors: Record<string, { bg: string, text: string, border: string }> = {
    'Green': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    'Amber': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    'Red': { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' }
  };
  const color = ragColors[rag] || ragColors['Green'];

  const milestonesListHtml = project.milestones.map(m => {
    const badgeBg = m.status === 'Completed' ? '#dcfce7' : m.status === 'In Progress' ? '#dbeafe' : '#f1f5f9';
    const badgeText = m.status === 'Completed' ? '#15803d' : m.status === 'In Progress' ? '#1d4ed8' : '#475569';
    return `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px; text-align: center; color: #64748b;">${m.no}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 11px; color: #1e293b;">${m.name}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px; color: #475569;">${m.startDate}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px; color: #475569;">${m.endDate}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;"><span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; background-color: ${badgeBg}; color: ${badgeText};">${m.status}</span></td>
      </tr>
    `;
  }).join('');

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; background: #ffffff;">
      <!-- Title Block -->
      <div style="border-bottom: 3px solid #006a66; padding-bottom: 16px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td>
              <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase;">
                ${title}
              </h1>
              <p style="font-size: 10px; color: #64748b; font-family: monospace; margin: 4px 0 0 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                Nucore Onboarding Advisory &bull; Enterprise Compliance Audit
              </p>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; background-color: ${color.bg}; color: ${color.text}; border: 1px solid ${color.border};">
                RAG Level: ${rag}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Account Metadata -->
      <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px; font-size: 12px;">
        <tr>
          <td style="padding: 12px; width: 50%; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
            <strong style="color: #475569;">Customer Account:</strong> <span style="color: #0f172a; font-weight: bold;">${project.customerName}</span>
          </td>
          <td style="padding: 12px; width: 50%; border-bottom: 1px solid #e2e8f0;">
            <strong style="color: #475569;">Onboarding ID:</strong> <span style="color: #0f172a; font-family: monospace;">${project.id}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border-right: 1px solid #e2e8f0;">
            <strong style="color: #475569;">Project Owner (PM):</strong> <span style="color: #0f172a; font-weight: bold;">${project.projectOwner}</span>
          </td>
          <td>
            <strong style="color: #475569;">Go-Live Target Date:</strong> <span style="color: #006a66; font-weight: bold;">${project.goLiveDate}</span>
          </td>
        </tr>
      </table>

      <!-- Executive Summary Section -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 14px; font-weight: bold; color: #006a66; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 10px;">
          I. Executive Summary
        </h2>
        <p style="font-size: 11.5px; text-align: justify; margin: 0; color: #334155; line-height: 1.6;">
          ${reportData.executiveSummary}
        </p>
      </div>

      <!-- Tactical / Historical Highlights -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 14px; font-weight: bold; color: #006a66; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 10px;">
          II. ${reportType === 'weekly' ? 'Weekly Updates & Key Milestones Completed' : 'Core Historical Lifecycle Highlights'}
        </h2>
        <div style="font-size: 11.5px; color: #334155; margin: 0; padding-left: 4px;">
          ${reportData.weeklyHighlights.split('\n').map((line: string) => {
            if (!line.trim()) return '';
            const cleaned = line.replace(/^[-\*\s•\d\.]+\s*/, '');
            return `<div style="margin-bottom: 6px; display: flex; align-items: flex-start;">
              <span style="color: #006a66; margin-right: 8px; font-weight: bold;">&bull;</span>
              <span>${cleaned}</span>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Milestone Performance Overview -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 14px; font-weight: bold; color: #006a66; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 10px;">
          III. Milestone Health & Completion Rate
        </h2>
        <p style="font-size: 11.5px; margin-bottom: 12px; color: #334155;">
          ${reportData.milestonePerformance}
        </p>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; border-right: 1px solid #e2e8f0; text-align: center; width: 40px;">No</th>
              <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; border-right: 1px solid #e2e8f0; text-align: left;">Deliverable Description</th>
              <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; border-right: 1px solid #e2e8f0; text-align: left; width: 90px;">Start Date</th>
              <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; border-right: 1px solid #e2e8f0; text-align: left; width: 90px;">End Date</th>
              <th style="padding: 8px 10px; border-bottom: 2px solid #cbd5e1; text-align: center; width: 100px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${milestonesListHtml}
          </tbody>
        </table>
      </div>

      <!-- Action Plan Section -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 14px; font-weight: bold; color: #006a66; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 10px;">
          IV. Strategic Action Plan & Critical Path
        </h2>
        <div style="font-size: 11.5px; color: #334155; margin: 0; padding-left: 4px;">
          ${reportData.actionPlan.split('\n').map((line: string, index: number) => {
            if (!line.trim()) return '';
            const cleaned = line.replace(/^[-\*\s•\d\.]+\s*/, '');
            return `<div style="margin-bottom: 8px; display: flex; align-items: flex-start;">
              <span style="background-color: #006a66; color: #ffffff; border-radius: 50%; width: 16px; height: 16px; display: inline-flex; justify-content: center; align-items: center; font-size: 9px; font-weight: bold; margin-right: 8px; shrink: 0; margin-top: 2px;">
                ${index + 1}
              </span>
              <span>${cleaned}</span>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Document Compliance Disclaimer -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 40px; text-align: center; font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
        <p style="margin: 0; font-weight: bold;">Confidential Audit &bull; Nucore Software Solutions Private Limited</p>
        <p style="margin: 3px 0 0 0;">Report hash: ${Math.random().toString(36).substr(2, 9).toUpperCase()} &bull; Security Level: Restricted</p>
      </div>
    </div>
  `;
}

/**
 * Generates and downloads the report as a beautiful styled MS Word compatible Document
 */
export function downloadAiReportWord(title: string, reportData: any, project: Project, reportType: string) {
  const contentHtml = buildAiReportHtml(title, reportData, project, reportType);
  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; }
      </style>
    </head>
    <body style="padding: 40px;">
      ${contentHtml}
    </body>
    </html>
  `;
  const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.doc`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers native high-fidelity print window on a hidden iframe to save as a professional PDF
 */
export function downloadAiReportPdf(title: string, reportData: any, project: Project, reportType: string) {
  const contentHtml = buildAiReportHtml(title, reportData, project, reportType);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(`
      <html>
      <head>
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background-color: #ffffff;
            color: #1e293b;
            padding: 30px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${contentHtml}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.parent.document.body.removeChild(window.frameElement);
            }, 100);
          }
        </script>
      </body>
      </html>
    `);
    doc.close();
  }
}

/**
 * Generates and downloads the Custom AI Report as a beautifully formatted PDF
 */
export function downloadCustomReportPdf(reportData: any) {
  const rag = reportData.ragRating || 'Green';
  const ragColors: Record<string, { bg: string, text: string, border: string }> = {
    'Green': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    'Amber': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    'Red': { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' }
  };
  const color = ragColors[rag.includes('Green') ? 'Green' : rag.includes('Amber') ? 'Amber' : 'Red'] || ragColors['Green'];

  const graphicalBarsHtml = (reportData.graphicalData || []).map((item: any) => `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #334155;">
        <span>${item.label}</span>
        <span>${item.value}%</span>
      </div>
      <div style="background-color: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden; width: 100%;">
        <div style="background-color: #006a66; height: 100%; width: ${item.value}%; border-radius: 4px;"></div>
      </div>
    </div>
  `).join('');

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; background: #ffffff;">
      <!-- Title Block -->
      <div style="border-bottom: 3px solid #006a66; padding-bottom: 16px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td>
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase;">
                ${reportData.title || 'Enterprise Advisory Custom Report'}
              </h1>
              <p style="font-size: 10px; color: #64748b; font-family: monospace; margin: 4px 0 0 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                Nucore Custom AI Engine &bull; ${reportData.scopeLabel || 'Executive Insight Audit'}
              </p>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; background-color: ${color.bg}; color: ${color.text}; border: 1px solid ${color.border};">
                RAG Status: ${rag}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Executive Narrative -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 13px; font-weight: bold; color: #006a66; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 10px;">
          I. Executive Commentary
        </h2>
        <p style="font-size: 11px; text-align: justify; margin: 0; color: #334155; line-height: 1.6;">
          ${reportData.executiveSummary}
        </p>
      </div>

      <!-- Graphical Representation -->
      <div style="margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px;">
        <h2 style="font-size: 13px; font-weight: bold; color: #006a66; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 12px;">
          II. Graphical Analytics & Key Metrics Representation
        </h2>
        ${graphicalBarsHtml || '<p style="font-size: 11px; color: #64748b;">No graphical metrics generated.</p>'}
      </div>

      <!-- Milestone Performance Narrative -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 13px; font-weight: bold; color: #006a66; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 10px;">
          III. Deliverable Alignment & Risks Analysis
        </h2>
        <p style="font-size: 11px; text-align: justify; margin: 0; color: #334155;">
          ${reportData.milestonePerformance}
        </p>
      </div>

      <!-- Highlights list -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 13px; font-weight: bold; color: #006a66; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 10px;">
          IV. Priority Findings & Process Highlights
        </h2>
        <div style="font-size: 11px; color: #334155;">
          ${(reportData.highlights || []).map((item: string) => `
            <div style="margin-bottom: 6px; display: flex; align-items: flex-start;">
              <span style="color: #006a66; margin-right: 8px; font-weight: bold;">&bull;</span>
              <span>${item}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Action steps -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 13px; font-weight: bold; color: #006a66; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 0; margin-bottom: 10px;">
          V. Strategic Remediation Road-Ahead
        </h2>
        <div style="font-size: 11px; color: #334155;">
          ${(reportData.actionPlan || []).map((item: string, index: number) => `
            <div style="margin-bottom: 8px; display: flex; align-items: flex-start;">
              <span style="background-color: #006a66; color: #ffffff; border-radius: 50%; width: 16px; height: 16px; display: inline-flex; justify-content: center; align-items: center; font-size: 9px; font-weight: bold; margin-right: 8px; shrink: 0; margin-top: 2px;">
                ${index + 1}
              </span>
              <span>${item}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Security Stamp -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 40px; text-align: center; font-size: 9px; color: #94a3b8; text-transform: uppercase;">
        <p style="margin: 0; font-weight: bold;">Authorized Nucore AI Advisory System</p>
        <p style="margin: 3px 0 0 0;">Report Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(`
      <html>
      <head>
        <title>${reportData.title || 'Custom_Report'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background-color: #ffffff;
            color: #1e293b;
            padding: 35px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.parent.document.body.removeChild(window.frameElement);
            }, 100);
          }
        </script>
      </body>
      </html>
    `);
    doc.close();
  }
}

/**
 * Generates and downloads the Custom AI Report as a beautifully styled Excel spreadsheet
 */
export function downloadCustomReportExcel(reportData: any) {
  const title = reportData.title || 'Enterprise Custom Report';
  const scope = reportData.scopeLabel || 'Executive Analysis';
  const rag = reportData.ragRating || 'Green';
  
  let excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        table { border-collapse: collapse; margin-bottom: 24px; }
        td, th { border: 1px solid #cbd5e1; padding: 8px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; }
        th { background-color: #0f172a; color: #ffffff; font-weight: bold; text-align: left; }
        .main-header { font-size: 16px; font-weight: bold; color: #006a66; text-align: center; background-color: #f1f5f9; border: 2px solid #006a66; }
        .section-header { font-size: 12px; font-weight: bold; background-color: #e2e8f0; color: #1e293b; }
        .meta-label { font-weight: bold; color: #475569; background-color: #f8fafc; }
        .metric-value { font-weight: bold; color: #006a66; text-align: right; }
        .rag-cell { font-weight: bold; text-align: center; }
        .bullet-point { font-style: italic; color: #334155; }
      </style>
    </head>
    <body>
      <!-- Report Title -->
      <table>
        <tr>
          <th colspan="4" class="main-header">${title.toUpperCase()}</th>
        </tr>
        <tr>
          <td class="meta-label">Scope:</td>
          <td colspan="3">${scope}</td>
        </tr>
        <tr>
          <td class="meta-label">RAG Status:</td>
          <td colspan="3" class="rag-cell" style="background-color: ${rag.includes('Red') ? '#fee2e2' : rag.includes('Amber') ? '#fef3c7' : '#dcfce7'}; color: ${rag.includes('Red') ? '#b91c1c' : rag.includes('Amber') ? '#b45309' : '#15803d'};">${rag}</td>
        </tr>
        <tr>
          <td class="meta-label">Timestamp:</td>
          <td colspan="3">${new Date().toLocaleString()}</td>
        </tr>
      </table>

      <!-- Executive Commentary -->
      <table>
        <tr>
          <th colspan="4" class="section-header">I. EXECUTIVE COMMENTARY</th>
        </tr>
        <tr>
          <td colspan="4" style="text-align: justify; vertical-align: top;">${reportData.executiveSummary}</td>
        </tr>
      </table>

      <!-- Graphical Analytics (Represented as Data Table for Excel Plotting) -->
      <table>
        <tr>
          <th colspan="2" class="section-header">II. GRAPHICAL ANALYTICS METRICS DATA</th>
          <th colspan="2" style="background-color: #f1f5f9; color: #475569; font-size: 10px; font-style: italic;">Select these rows to plot a bar chart in Excel</th>
        </tr>
        <tr style="background-color: #f8fafc; font-weight: bold;">
          <td colspan="2">Metric Category Description</td>
          <td colspan="2" style="text-align: right;">Target Score / Value (%)</td>
        </tr>
        ${(reportData.graphicalData || []).map((item: any) => `
          <tr>
            <td colspan="2" style="font-weight: 600;">${item.label}</td>
            <td colspan="2" class="metric-value">${item.value}%</td>
          </tr>
        `).join('')}
      </table>

      <!-- Milestone Deliverables Narrative -->
      <table>
        <tr>
          <th colspan="4" class="section-header">III. DELIVERABLES ALIGNMENT & RISK STATUS</th>
        </tr>
        <tr>
          <td colspan="4">${reportData.milestonePerformance}</td>
        </tr>
      </table>

      <!-- Highlights -->
      <table>
        <tr>
          <th colspan="4" class="section-header">IV. PRIORITY PROCESS FINDINGS</th>
        </tr>
        ${(reportData.highlights || []).map((item: string) => `
          <tr>
            <td style="width: 25px; text-align: center; font-weight: bold; color: #006a66;">&bull;</td>
            <td colspan="3" class="bullet-point">${item}</td>
          </tr>
        `).join('')}
      </table>

      <!-- Action Plan -->
      <table>
        <tr>
          <th colspan="4" class="section-header">V. STRATEGIC REMEDIATION ROAD AHEAD</th>
        </tr>
        ${(reportData.actionPlan || []).map((item: string, index: number) => `
          <tr>
            <td style="width: 25px; text-align: center; font-weight: bold; background-color: #f8fafc;">${index + 1}</td>
            <td colspan="3" style="font-weight: 500;">${item}</td>
          </tr>
        `).join('')}
      </table>

      <p style="font-size: 9px; color: #94a3b8; font-family: sans-serif;">Generated by Nucore AI Advisory Excel Integration. Confidentially Restricted.</p>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}_Report.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads the Custom AI Report as a beautifully styled Word document
 */
export function downloadCustomReportWord(reportData: any) {
  const title = reportData.title || 'Enterprise Custom Report';
  const scope = reportData.scopeLabel || 'Executive Analysis';
  const rag = reportData.ragRating || 'Green';
  
  const ragColors: Record<string, { bg: string, text: string, border: string }> = {
    'Green': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    'Amber': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    'Red': { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' }
  };
  const color = ragColors[rag.includes('Green') ? 'Green' : rag.includes('Amber') ? 'Amber' : 'Red'] || ragColors['Green'];

  const graphicalBarsHtml = (reportData.graphicalData || []).map((item: any) => `
    <tr style="margin-bottom: 8px;">
      <td style="font-weight: bold; width: 250px; font-size: 11px; padding: 4px; border-bottom: 1px solid #e2e8f0;">${item.label}</td>
      <td style="font-weight: bold; width: 50px; text-align: right; color: #006a66; font-size: 11px; padding: 4px; border-bottom: 1px solid #e2e8f0;">${item.value}%</td>
      <td style="width: 200px; padding: 4px; border-bottom: 1px solid #e2e8f0;">
        <div style="background-color: #e2e8f0; width: 100%; height: 10px;">
          <div style="background-color: #006a66; height: 100%; width: ${item.value}%;"></div>
        </div>
      </td>
    </tr>
  `).join('');

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; }
        h1 { font-size: 20pt; color: #0f172a; border-bottom: 3px solid #006a66; padding-bottom: 10px; margin-bottom: 20px; text-transform: uppercase; }
        h2 { font-size: 12pt; color: #006a66; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px; margin-bottom: 10px; text-transform: uppercase; }
        p { font-size: 10.5pt; color: #334155; text-align: justify; }
        .bullet-point { font-size: 10.5pt; color: #334155; margin-bottom: 6px; }
        .action-step { font-size: 10.5pt; color: #334155; margin-bottom: 8px; }
        .meta-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .meta-table td { padding: 4px 8px; font-size: 10pt; }
        .graph-table { width: 100%; margin-top: 10px; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <!-- Header -->
      <h1>${title}</h1>
      
      <table class="meta-table">
        <tr>
          <td style="width: 15%; font-weight: bold; color: #64748b;">SCOPE:</td>
          <td style="width: 50%; font-weight: bold;">${scope}</td>
          <td style="width: 15%; font-weight: bold; color: #64748b; text-align: right;">STATUS:</td>
          <td style="width: 20%; font-weight: bold; color: ${color.text}; background-color: ${color.bg}; text-align: center; border: 1px solid ${color.border};">${rag.toUpperCase()}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #64748b;">DATE:</td>
          <td>${new Date().toLocaleString()}</td>
          <td colspan="2"></td>
        </tr>
      </table>

      <!-- Executive Commentary -->
      <h2>I. Executive Commentary</h2>
      <p>${reportData.executiveSummary}</p>

      <!-- Graphical Analytics -->
      <h2>II. Graphical Analytics & Key Metrics</h2>
      <table class="graph-table">
        ${graphicalBarsHtml || '<tr><td>No metrics defined</td></tr>'}
      </table>

      <!-- Milestone Deliverables Narrative -->
      <h2>III. Deliverable Alignment & Risks Analysis</h2>
      <p>${reportData.milestonePerformance}</p>

      <!-- Highlights -->
      <h2>IV. Priority Findings & Process Highlights</h2>
      <div>
        ${(reportData.highlights || []).map((item: string) => `
          <div class="bullet-point">&bull; ${item}</div>
        `).join('')}
      </div>

      <!-- Action Plan -->
      <h2>V. Strategic Remediation Road-Ahead</h2>
      <div>
        ${(reportData.actionPlan || []).map((item: string, index: number) => `
          <div class="action-step"><b>${index + 1}.</b> ${item}</div>
        `).join('')}
      </div>

      <!-- Footer Stamp -->
      <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 40px; text-align: center; font-size: 8.5pt; color: #94a3b8;">
        <b>AUTHORIZED NUCORE AI ADVISORY SYSTEM</b><br/>
        Confidential &bull; Generated dynamically per advisory prompt instruction.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}_Report.doc`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


