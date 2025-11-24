import type { LoadLevel, Priority, QueueType } from '@/types';

/**
 * Parse duration string (e.g., "25m", "1h", "90m") to milliseconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(m|h|s)?$/i);
  if (!match) return 0;

  const value = parseInt(match[1], 10);
  const unit = (match[2] || 'm').toLowerCase();

  switch (unit) {
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return value * 60 * 1000;
  }
}

/**
 * Format milliseconds to display string (e.g., "25:00", "1:30:00")
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '00:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format relative time (e.g., "5 minutes ago", "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get color class for load level
 */
export function getLoadLevelColor(level: LoadLevel): string {
  switch (level) {
    case 'low':
      return 'text-green-600';
    case 'medium':
      return 'text-amber-600';
    case 'high':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get background color class for load level
 */
export function getLoadLevelBgColor(level: LoadLevel): string {
  switch (level) {
    case 'low':
      return 'bg-green-500';
    case 'medium':
      return 'bg-amber-500';
    case 'high':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Get priority badge class
 */
export function getPriorityClass(priority: Priority): string {
  switch (priority) {
    case 'high':
      return 'badge-high';
    case 'medium':
      return 'badge-medium';
    case 'low':
      return 'badge-low';
    default:
      return 'badge';
  }
}

/**
 * Get queue badge class
 */
export function getQueueClass(queue: QueueType): string {
  switch (queue) {
    case 'action':
      return 'badge-action';
    case 'reference':
      return 'badge-reference';
    case 'backburner':
      return 'badge-backburner';
    default:
      return 'badge';
  }
}

/**
 * Convert load level to numeric value for charts
 */
export function loadLevelToNumber(level: LoadLevel): number {
  switch (level) {
    case 'low':
      return 1;
    case 'medium':
      return 2;
    case 'high':
      return 3;
    default:
      return 0;
  }
}

/**
 * Convert numeric value back to load level
 */
export function numberToLoadLevel(value: number): LoadLevel {
  if (value <= 1) return 'low';
  if (value <= 2) return 'medium';
  return 'high';
}

/**
 * Generate unique ID for client-side use
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Class names utility (like clsx/classnames)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get keyboard shortcut display string
 */
export function formatShortcut(shortcut: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return shortcut
    .replace('cmd', isMac ? '⌘' : 'Ctrl')
    .replace('alt', isMac ? '⌥' : 'Alt')
    .replace('shift', isMac ? '⇧' : 'Shift')
    .replace(/\+/g, ' + ');
}

/**
 * Common task categories
 */
export const TASK_CATEGORIES = [
  { value: 'work', label: 'Work' },
  { value: 'home', label: 'Home' },
  { value: 'health', label: 'Health' },
  { value: 'family', label: 'Family' },
  { value: 'finance', label: 'Finance' },
  { value: 'admin', label: 'Admin' },
  { value: 'project', label: 'Project' },
  { value: 'learning', label: 'Learning' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
];

/**
 * Common emotions for tagging
 */
export const EMOTIONS = [
  { value: 'anxious', label: 'Anxious', icon: '😰' },
  { value: 'overwhelmed', label: 'Overwhelmed', icon: '😵' },
  { value: 'frustrated', label: 'Frustrated', icon: '😤' },
  { value: 'angry', label: 'Angry', icon: '😠' },
  { value: 'sad', label: 'Sad', icon: '😢' },
  { value: 'tired', label: 'Tired', icon: '😴' },
  { value: 'stressed', label: 'Stressed', icon: '😓' },
  { value: 'scattered', label: 'Scattered', icon: '🌀' },
  { value: 'content', label: 'Content', icon: '😌' },
  { value: 'focused', label: 'Focused', icon: '🎯' },
  { value: 'energized', label: 'Energized', icon: '⚡' },
  { value: 'calm', label: 'Calm', icon: '🧘' },
];

/**
 * Decompression methods
 */
export const DECOMPRESS_METHODS = [
  { value: 'walk', label: 'Walk' },
  { value: 'music', label: 'Music' },
  { value: 'shower', label: 'Shower' },
  { value: 'meditation', label: 'Meditation' },
  { value: 'dark_room', label: 'Dark Room' },
  { value: 'silence', label: 'Silence' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'nature', label: 'Nature' },
  { value: 'breathing', label: 'Breathing' },
  { value: 'nap', label: 'Power Nap' },
];

/**
 * Focus duration options
 */
export const FOCUS_DURATIONS = [
  { value: '25m', label: '25 min', description: 'Pomodoro' },
  { value: '50m', label: '50 min', description: 'Deep Work' },
  { value: '90m', label: '90 min', description: 'Flow State' },
  { value: '15m', label: '15 min', description: 'Quick Focus' },
];

/**
 * Time scopes for threads
 */
export const TIME_SCOPES = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'long_term', label: 'Long Term' },
];

/**
 * Storage options for ideas
 */
export const IDEA_STORAGE_OPTIONS = [
  { value: 'logbook', label: 'Logbook' },
  { value: 'notion', label: 'Notion' },
  { value: 'email', label: 'Email to Self' },
  { value: 'notes', label: 'Notes App' },
  { value: 'calendar', label: 'Calendar' },
];
