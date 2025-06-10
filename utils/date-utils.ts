import { format, isValid, parseISO } from 'date-fns';

// Helper function to format dates
export function formatDate(dateString: string): string {
  try {
    // Try different date formats
    const date = new Date(dateString);
    if (isValid(date)) {
      return format(date, 'PPP');
    }

    // Try ISO format
    const isoDate = parseISO(dateString);
    if (isValid(isoDate)) {
      return format(isoDate, 'PPP');
    }
  } catch (e) {
    // Not a valid date string
    console.error('Error formatting date:', e);
  }
  return dateString;
}

// Helper to check if a string is a date
export function isDateString(value: string): boolean {
  if (!value) return false;

  try {
    // Check common date formats
    const date = new Date(value);
    if (isValid(date)) return true;

    // Check ISO format
    const isoDate = parseISO(value);
    if (isValid(isoDate)) return true;

    // Check YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return isValid(new Date(value));
    }
  } catch {
    return false;
  }

  return false;
}

// Helper to check if a value is a date object
export function isDateObject(value: string | Date): value is Date {
  return value instanceof Date;
}

// Format relative time for git history
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return format(date, 'MMM d');
    }
  } catch {
    return dateString;
  }
}
