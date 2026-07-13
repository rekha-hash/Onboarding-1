import { Milestone } from '../types';

/**
 * Parses any date format (YYYY-MM-DD, DD-MM-YYYY, or Date objects) into a valid Date.
 */
export function parseDate(dateInput: Date | string): Date {
  if (dateInput instanceof Date) {
    return new Date(dateInput.getTime());
  }
  
  if (!dateInput || dateInput === 'N/A' || dateInput === '') {
    return new Date(NaN);
  }

  if (dateInput.includes('-')) {
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        // DD-MM-YYYY
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
  }
  
  const parsed = new Date(dateInput);
  return parsed;
}

/**
 * Formats a Date object to YYYY-MM-DD string
 */
export function formatDateToISO(date: Date): string {
  if (isNaN(date.getTime())) return 'N/A';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Checks if a given Date is a weekend (Saturday or Sunday)
 * Modified: Always returns false to include weekends as consecutive days.
 */
export function isWeekend(date: Date): boolean {
  return false; // Sat/Sun are treated as consecutive days
}

/**
 * Rolls back a specified number of days from a given date (consecutive calendar days).
 */
export function getBusinessDaysBefore(date: Date, numDays: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() - numDays);
  return result;
}

/**
 * Adds a specified number of days to a starting date (consecutive calendar days).
 */
export function addBusinessDays(startDate: Date, numDays: number): Date {
  const result = new Date(startDate.getTime());
  result.setDate(result.getDate() + numDays);
  return result;
}

/**
 * Dynamic business-day timeline scheduler utilizing the Hamilton Method of Apportionment.
 * Spans active milestones sequentially over exactly 30 business days, ending on Go-Live.
 */
export function calculate30DayMilestoneSequence(goLiveDateStr: string, milestones: Milestone[]): Milestone[] {
  const goLiveDate = parseDate(goLiveDateStr);
  if (isNaN(goLiveDate.getTime())) {
    return milestones;
  }

  // Adjust go-live to a working day if it falls on a weekend
  let adjustedGoLive = new Date(goLiveDate.getTime());
  while (isWeekend(adjustedGoLive)) {
    adjustedGoLive.setDate(adjustedGoLive.getDate() - 1);
  }

  // Filter active milestones
  const activeMilestones = milestones.filter(m => m.status !== 'Not Required');
  const inactiveMilestones = milestones.filter(m => m.status === 'Not Required');

  const M = activeMilestones.length;
  if (M === 0) {
    return milestones;
  }

  // 1. Calculate project start date (Day 1) by rolling back exactly 29 business days from Day 30 (Go-Live)
  const projectStartDate = getBusinessDaysBefore(adjustedGoLive, 29);

  // 2. Allocate 30 days among active milestones proportional to weightages (Hamilton Method)
  const totalProjectDays = 30;
  const totalWeight = activeMilestones.reduce((sum, m) => sum + (m.weightage || 0), 0) || 1;

  // Initial allocations: quotas
  const quotas = activeMilestones.map(m => (m.weightage || 0) * totalProjectDays / totalWeight);
  let durations = quotas.map(q => Math.max(1, Math.floor(q)));

  let sumDurations = durations.reduce((sum, d) => sum + d, 0);

  // Adjust sum to exactly 30 days
  if (sumDurations > totalProjectDays) {
    // If we exceeded 30 days (due to min of 1 day), reduce durations of highest-weight elements
    // that have duration > 1
    while (sumDurations > totalProjectDays) {
      let candidateIdx = -1;
      let maxQuotaDiff = -Infinity;

      for (let i = 0; i < M; i++) {
        if (durations[i] > 1) {
          const diff = durations[i] - quotas[i];
          if (diff > maxQuotaDiff) {
            maxQuotaDiff = diff;
            candidateIdx = i;
          }
        }
      }

      if (candidateIdx !== -1) {
        durations[candidateIdx]--;
        sumDurations--;
      } else {
        // Fallback: decrement first element with duration > 1
        const fallbackIdx = durations.findIndex(d => d > 1);
        if (fallbackIdx !== -1) {
          durations[fallbackIdx]--;
          sumDurations--;
        } else {
          break; // All durations are 1, cannot reduce further without violating min of 1 day
        }
      }
    }
  } else if (sumDurations < totalProjectDays) {
    // If we have remaining days, distribute them to elements with largest fractional quotas
    const allocatedIndices = new Set<number>();
    while (sumDurations < totalProjectDays) {
      let candidateIdx = -1;
      let maxFraction = -1;

      for (let i = 0; i < M; i++) {
        if (!allocatedIndices.has(i)) {
          const fraction = quotas[i] - Math.floor(quotas[i]);
          if (fraction > maxFraction) {
            maxFraction = fraction;
            candidateIdx = i;
          }
        }
      }

      if (candidateIdx !== -1) {
        durations[candidateIdx]++;
        sumDurations++;
        allocatedIndices.add(candidateIdx);
      } else {
        // Fallback: add to the element with largest weightage
        let maxWeightIdx = 0;
        let maxWeight = -1;
        for (let i = 0; i < M; i++) {
          if ((activeMilestones[i].weightage || 0) > maxWeight) {
            maxWeight = activeMilestones[i].weightage || 0;
            maxWeightIdx = i;
          }
        }
        durations[maxWeightIdx]++;
        sumDurations++;
      }
    }
  }

  // 3. Map durations to chronological dates
  let currentStartDayOffset = 0;
  const mappedActive = activeMilestones.map((m, idx) => {
    const duration = durations[idx];
    
    // Calculate calendar dates based on business day offsets from project start
    const milestoneStartObj = addBusinessDays(projectStartDate, currentStartDayOffset);
    const milestoneEndObj = addBusinessDays(milestoneStartObj, duration - 1);

    // Update current start offset for the next milestone
    currentStartDayOffset += duration;

    return {
      ...m,
      startDate: formatDateToISO(milestoneStartObj),
      endDate: formatDateToISO(milestoneEndObj)
    };
  });

  // Keep inactive milestones as 'N/A'
  const mappedInactive = inactiveMilestones.map(m => ({
    ...m,
    startDate: 'N/A',
    endDate: 'N/A'
  }));

  // Re-combine and sort by milestone number (no) to preserve sequential structure
  return [...mappedActive, ...mappedInactive].sort((a, b) => a.no - b.no);
}
