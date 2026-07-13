/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { Project, Milestone } from '../types';
import { AlertCircle, TrendingUp, Calendar, Info } from 'lucide-react';

interface MilestoneTrendChartProps {
  projects: Project[];
}

interface DataPoint {
  date: Date;
  value: number; // Completion percentage (0-100)
}

interface ProjectTrendData {
  projectId: string;
  customerName: string;
  actualData: DataPoint[];
  plannedData: DataPoint[];
  color: string;
}

export default function MilestoneTrendChart({ projects }: MilestoneTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // States
  const [viewMode, setViewMode] = useState<'portfolio' | 'detailed'>('portfolio');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 });
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: Date;
    customerName: string;
    actual: number;
    planned?: number;
    x: number;
    y: number;
  } | null>(null);

  // Colors for active projects
  const colors = ['#0d9488', '#4f46e5', '#f59e0b', '#0891b2', '#db2777', '#7c3aed'];

  const activeProjects = projects.filter(p => p.status !== 'Closed');

  // Set initial selected project if empty
  useEffect(() => {
    if (activeProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(activeProjects[0].id);
    }
  }, [activeProjects, selectedProjectId]);

  // Handle container responsiveness with ResizeObserver as required
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      setDimensions({
        width: Math.max(width, 300),
        height: 320
      });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Helper date parsing
  const parseMilestoneDate = (dateStr: string, defaultDate: Date): Date => {
    if (!dateStr || dateStr === 'N/A') return defaultDate;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? defaultDate : d;
  };

  // Generate date points (bi-weekly intervals from Oct 15, 2025 to Mar 15, 2026)
  const generateDatePoints = (): Date[] => {
    const startDate = new Date('2025-10-15');
    const endDate = new Date('2026-03-15');
    const points: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      points.push(new Date(current));
      current.setDate(current.getDate() + 10); // 10 days steps for smooth resolution
    }
    
    if (points[points.length - 1].getTime() !== endDate.getTime()) {
      points.push(new Date(endDate));
    }
    return points;
  };

  const datePoints = generateDatePoints();

  // Compute actual and planned completion for a project at a specific date
  const computeCompletionAtDate = (
    project: Project,
    date: Date,
    type: 'actual' | 'planned'
  ): number => {
    const activeMilestones = project.milestones.filter(m => m.status !== 'Not Required');
    if (activeMilestones.length === 0) return 0;

    const totalWeight = activeMilestones.reduce((sum, m) => sum + m.weightage, 0) || 100;
    
    let completedWeight = 0;
    
    activeMilestones.forEach(m => {
      if (type === 'actual') {
        if (m.status === 'Completed') {
          const compDate = parseMilestoneDate(m.endDate, new Date('2025-10-15'));
          if (compDate <= date) {
            completedWeight += m.weightage;
          }
        }
      } else {
        // Planned: should be completed on or before m.endDate
        const planDate = parseMilestoneDate(m.endDate, new Date('2025-10-15'));
        if (planDate <= date) {
          completedWeight += m.weightage;
        }
      }
    });

    return Math.min(100, Math.round((completedWeight / totalWeight) * 100));
  };

  // Generate trends data
  const trendData: ProjectTrendData[] = activeProjects.map((p, i) => {
    const actualData: DataPoint[] = datePoints.map(d => ({
      date: d,
      value: computeCompletionAtDate(p, d, 'actual')
    }));

    const plannedData: DataPoint[] = datePoints.map(d => ({
      date: d,
      value: computeCompletionAtDate(p, d, 'planned')
    }));

    return {
      projectId: p.id,
      customerName: p.customerName,
      actualData,
      plannedData,
      color: colors[i % colors.length]
    };
  });

  // Calculate potential delays for alerting
  // We compare the actual completion vs planned completion at the latest point
  const delayAlerts = trendData.map(t => {
    const latestActual = t.actualData[t.actualData.length - 1].value;
    const latestPlanned = t.plannedData[t.plannedData.length - 1].value;
    const gap = latestPlanned - latestActual;
    const projectDetail = activeProjects.find(p => p.id === t.projectId);
    
    return {
      projectId: t.projectId,
      customerName: t.customerName,
      actual: latestActual,
      planned: latestPlanned,
      gap,
      isAtRisk: gap > 15 || projectDetail?.status === 'Delayed',
      color: t.color,
      owner: projectDetail?.projectOwner || 'Unknown'
    };
  }).filter(alert => alert.isAtRisk);

  // Render D3 Line Chart
  useEffect(() => {
    if (!svgRef.current || trendData.length === 0) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: viewMode === 'portfolio' ? 140 : 120, bottom: 40, left: 45 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Min/Max Dates
    const minDate = datePoints[0];
    const maxDate = datePoints[datePoints.length - 1];

    // Scales
    const xScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d));

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(dimensions.width / 90, 8))
      .tickFormat(d3.timeFormat('%b %d') as any);

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    // Append X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '9px')
      .attr('color', '#64748b')
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Append Y axis
    svg.append('g')
      .call(yAxis)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '9px')
      .attr('color', '#64748b');

    // Line generator
    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    if (viewMode === 'portfolio') {
      // Portfolio View: actual trends for all projects
      trendData.forEach(projectTrend => {
        // Path
        svg.append('path')
          .datum(projectTrend.actualData)
          .attr('fill', 'none')
          .attr('stroke', projectTrend.color)
          .attr('stroke-width', 2.5)
          .attr('d', lineGenerator);

        // Interactive transparent overlay for tooltips
        svg.selectAll(`.dot-${projectTrend.projectId}`)
          .data(projectTrend.actualData)
          .enter()
          .append('circle')
          .attr('cx', d => xScale(d.date))
          .attr('cy', d => yScale(d.value))
          .attr('r', 4)
          .attr('fill', projectTrend.color)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1)
          .style('opacity', 0.8)
          .style('cursor', 'pointer')
          .on('mouseover', (event, d) => {
            setHoveredPoint({
              date: d.date,
              customerName: projectTrend.customerName,
              actual: d.value,
              x: xScale(d.date) + margin.left,
              y: yScale(d.value) + margin.top
            });
          })
          .on('mouseout', () => {
            setHoveredPoint(null);
          });

        // Add line labels at the end of the line
        const lastPt = projectTrend.actualData[projectTrend.actualData.length - 1];
        svg.append('text')
          .attr('x', xScale(lastPt.date) + 6)
          .attr('y', yScale(lastPt.value) + 4)
          .attr('fill', projectTrend.color)
          .style('font-family', 'Inter, sans-serif')
          .style('font-size', '10px')
          .style('font-weight', 'bold')
          .text(projectTrend.customerName.split(' ')[0]); // first word
      });

    } else {
      // Detailed View: Selected project actual vs planned
      const selectedTrend = trendData.find(t => t.projectId === selectedProjectId);
      if (selectedTrend) {
        // Planned Line (Dashed)
        svg.append('path')
          .datum(selectedTrend.plannedData)
          .attr('fill', 'none')
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('d', lineGenerator);

        // Actual Line (Solid)
        svg.append('path')
          .datum(selectedTrend.actualData)
          .attr('fill', 'none')
          .attr('stroke', selectedTrend.color)
          .attr('stroke-width', 3)
          .attr('d', lineGenerator);

        // Circles for actual points
        svg.selectAll('.dot-actual')
          .data(selectedTrend.actualData)
          .enter()
          .append('circle')
          .attr('cx', d => xScale(d.date))
          .attr('cy', d => yScale(d.value))
          .attr('r', 5)
          .attr('fill', selectedTrend.color)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.5)
          .on('mouseover', (event, d) => {
            const correspondingPlanned = selectedTrend.plannedData.find(
              p => p.date.getTime() === d.date.getTime()
            )?.value || 0;

            setHoveredPoint({
              date: d.date,
              customerName: selectedTrend.customerName,
              actual: d.value,
              planned: correspondingPlanned,
              x: xScale(d.date) + margin.left,
              y: yScale(d.date) + margin.top
            });
          })
          .on('mouseout', () => {
            setHoveredPoint(null);
          });

        // Legend details
        const legendG = svg.append('g')
          .attr('transform', `translate(${width + 15}, 10)`);

        // Actual legend node
        legendG.append('line')
          .attr('x1', 0).attr('x2', 20)
          .attr('y1', 5).attr('y2', 5)
          .attr('stroke', selectedTrend.color)
          .attr('stroke-width', 3);

        legendG.append('text')
          .attr('x', 25).attr('y', 9)
          .attr('fill', '#1e293b')
          .style('font-family', 'Inter, sans-serif')
          .style('font-size', '10px')
          .style('font-weight', 'bold')
          .text('Actual Adoptions');

        // Planned legend node
        legendG.append('line')
          .attr('x1', 0).attr('x2', 20)
          .attr('y1', 25).attr('y2', 25)
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3,3');

        legendG.append('text')
          .attr('x', 25).attr('y', 29)
          .attr('fill', '#64748b')
          .style('font-family', 'Inter, sans-serif')
          .style('font-size', '10px')
          .style('font-weight', '500')
          .text('Target Timeline');
      }
    }

  }, [dimensions, viewMode, selectedProjectId, trendData]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm font-sans" id="d3-milestone-trend-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Milestone Completion Trends</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
            D3.js interactive performance analytics & baseline deviation audit
          </p>
        </div>

        {/* Custom selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setViewMode('portfolio')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'portfolio'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💼 Portfolio View
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'detailed'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎯 Actual vs Planned
            </button>
          </div>

          {viewMode === 'detailed' && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg p-1.5 font-bold text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {activeProjects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.customerName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart area */}
        <div className="lg:col-span-8 relative" ref={containerRef}>
          <svg ref={svgRef} className="w-full h-[320px] overflow-visible"></svg>

          {/* D3 Tooltip overlay */}
          {hoveredPoint && (
            <div
              className="absolute bg-slate-900 text-white p-3 rounded-lg shadow-lg pointer-events-none z-30 font-sans border border-slate-700 max-w-[200px]"
              style={{
                left: `${hoveredPoint.x - 60}px`,
                top: `${hoveredPoint.y - 110}px`,
              }}
            >
              <div className="text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">
                {hoveredPoint.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-xs font-extrabold text-white truncate mb-1">
                {hoveredPoint.customerName}
              </div>
              <div className="space-y-1 mt-1.5 border-t border-slate-800 pt-1.5">
                <div className="flex justify-between gap-4 text-[11px]">
                  <span className="text-slate-300">Actual:</span>
                  <span className="font-mono font-bold text-teal-400">{hoveredPoint.actual}%</span>
                </div>
                {hoveredPoint.planned !== undefined && (
                  <div className="flex justify-between gap-4 text-[11px]">
                    <span className="text-slate-300">Target:</span>
                    <span className="font-mono font-bold text-slate-400">{hoveredPoint.planned}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar alerting & delays panel */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 font-mono flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Delay & compliance alert</span>
            </h3>

            {delayAlerts.length > 0 ? (
              <div className="space-y-3">
                {delayAlerts.map(alert => (
                  <div
                    key={alert.projectId}
                    className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-3 items-start"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">{alert.customerName}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Completed: <span className="font-bold text-slate-800">{alert.actual}%</span>, Planned target: <span className="font-bold text-slate-800">{alert.planned}%</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[9px] font-mono bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold uppercase">
                          Lagging by {alert.gap}%
                        </span>
                        <span className="text-[9px] text-slate-500 italic">PM: {alert.owner}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">All Adoptions On Track</p>
                  <p className="text-[10px] text-slate-500 max-w-xs leading-normal mt-1">
                    No active onboarding schedules show a completion gap greater than 15%. All PM deliverable chains are stable.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="text-[10px] text-slate-400 font-mono flex justify-between">
              <span>ACTIVE PIPELINE NODES</span>
              <span>GAP ALGORITHM V1.1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
