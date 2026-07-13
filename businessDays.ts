/**
 * Business Days Utilities
 * Handles calculations skipping weekends (Saturdays and Sundays)
 */

/**
 * Parses any date format (YYYY-MM-DD, DD-MM-YYYY, or Date objects) into a valid Date.
 */
export function parseDate(dateInput: Date | string): Date {
  if (dateInput instanceof Date) {
    return new Date(dateInput.getTime());
  }
  
  if (!dateInput || dateInput === 'N/A') {
    return new Date(NaN);
  }

  // Handle DD-MM-YYYY or YYYY-MM-DD
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
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Adjusts a date to the nearest business day.
 * If direction is 'forward' (default), it moves to the next Monday if on a weekend.
 * If direction is 'backward', it moves to the previous Friday if on a weekend.
 */
export function adjustToBusinessDay(date: Date, direction: 'forward' | 'backward' = 'forward'): Date {
  const result = new Date(date.getTime());
  while (isWeekend(result)) {
    result.setDate(result.getDate() + (direction === 'forward' ? 1 : -1));
  }
  return result;
}

/**
 * Adds or subtracts business days (skipping Saturdays and Sundays) to/from a starting date.
 */
export function addBusinessDays(startDateInput: Date | string, days: number): Date {
  let date = parseDate(startDateInput);
  if (isNaN(date.getTime())) return date;

  // Align start date to a business day first
  date = adjustToBusinessDay(date, days >= 0 ? 'forward' : 'backward');

  let remainingDays = Math.abs(days);
  const step = days >= 0 ? 1 : -1;

  while (remainingDays > 0) {
    date.setDate(date.getDate() + step);
    if (!isWeekend(date)) {
      remainingDays--;
    }
  }

  return date;
}

/**
 * Calculates start and end dates for a milestone based on a base target date,
 * spacing offset (business days backward from go-live) and duration (business days).
 */
export function calculateMilestoneWindow(
  goLiveDateInput: Date | string,
  businessDaysOffsetBeforeGoLive: number,
  durationBusinessDays: number
): { startDate: string; endDate: string } {
  const goLiveDate = parseDate(goLiveDateInput);
  if (isNaN(goLiveDate.getTime())) {
    return { startDate: 'N/A', endDate: 'N/A' };
  }

  // 1. Calculate startDate by subtracting business days offset from the go-live target
  const startDateObj = addBusinessDays(goLiveDate, -businessDaysOffsetBeforeGoLive);
  
  // 2. Calculate endDate by adding duration business days to the startDateObj
  // Subtracting 1 from duration because a 1-day duration starts and ends on the same business day
  const endOffset = Math.max(0, durationBusinessDays - 1);
  const endDateObj = addBusinessDays(startDateObj, endOffset);

  return {
    startDate: formatDateToISO(startDateObj),
    endDate: formatDateToISO(endDateObj)
  };
}
