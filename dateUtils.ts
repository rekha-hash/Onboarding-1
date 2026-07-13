import { Milestone } from '../types';

/**
 * Formats a Date object as DD-MM-YYYY
 */
export function formatDate(date: Date): string {
  if (!date || isNaN(date.getTime())) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

/**
 * Parses a DD-MM-YYYY or YYYY-MM-DD string into a Date object
 */
export function parseDate(str: string): Date {
  if (!str || str === 'N/A' || str === '') return new Date(NaN);
  
  // If DD-MM-YYYY or YYYY-MM-DD
  if (str.includes('-')) {
    const parts = str.split('-');
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
  return new Date(str);
}

/**
 * Adds a specified number of working days to a starting date, excluding Saturday (6) and Sunday (0).
 * Note: standard sequencing duration has 1-based start. So 1 working day means same day end.
 */
export function addWorkingDays(startDateStr: string, days: number): string {
  let date = parseDate(startDateStr);
  if (isNaN(date.getTime())) return startDateStr;
  
  // Roll forward to next working day if start is on a weekend
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }

  let addedDays = 0;
  while (addedDays < days - 1) { // 1-based: duration of 1 day ends on same day
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  return formatDate(date);
}

/**
 * Calculates the next active working day after a given date string.
 */
export function getNextWorkingDay(dateStr: string): string {
  let date = parseDate(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  do {
    date.setDate(date.getDate() + 1);
  } while (date.getDay() === 0 || date.getDay() === 6);
  
  return formatDate(date);
}

/**
 * Re-sequences all milestones sequentially starting from Kick-off (No. 1)
 * excluding Saturdays and Sundays.
 */
export function sequenceMilestonesFromKickoff(milestones: Milestone[], kickoffStartDate: string): Milestone[] {
  let currentStartDate = kickoffStartDate;
  
  return milestones.map((m) => {
    if (m.status === 'Not Required') {
      return { ...m, startDate: 'N/A', endDate: 'N/A' };
    }
    
    const durationDays = Math.max(1, Math.round(m.weightage * 1.5));
    
    // Roll current start to a working day
    let dateObj = parseDate(currentStartDate);
    while (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
      dateObj.setDate(dateObj.getDate() + 1);
    }
    const actualStart = formatDate(dateObj);
    const actualEnd = addWorkingDays(actualStart, durationDays);
    
    // Setup start date for the next milestone in sequence
    currentStartDate = getNextWorkingDay(actualEnd);
    
    return {
      ...m,
      startDate: m.no === 1 ? kickoffStartDate : actualStart,
      endDate: actualEnd
    };
  });
}
