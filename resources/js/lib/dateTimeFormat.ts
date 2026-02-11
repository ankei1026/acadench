/**
 * Utility functions for consistent date and time formatting across the application
 * Uses 12-hour format with AM/PM
 */

export const formatDate = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

export const formatTime = (time: string | Date): string => {
  try {
    const d = typeof time === 'string' ? new Date(time) : time;
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'N/A';
  }
};

export const formatDateTime = (dateTime: string | Date): { date: string; time: string } => {
  try {
    const d = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    return {
      date: d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  } catch {
    return { date: 'N/A', time: 'N/A' };
  }
};

export const format12HourTime = (time: string): string => {
  if (!time) return 'N/A';
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  } catch {
    return time;
  }
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  const start = format12HourTime(startTime);
  const end = format12HourTime(endTime);
  return `${start} - ${end}`;
};
