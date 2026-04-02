import type { LogEntry } from '@/types';
import { LOCAL_STORAGE_KEYS, LOG_ROTATION_LIMIT } from '@/constants';

function _persistLog(entry: LogEntry): void {
  try {
    const existing = getLogs();
    existing.push(entry);

    while (existing.length > LOG_ROTATION_LIMIT) {
      existing.shift();
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.LOGS, JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to persist log entry:', error);
  }
}

export function logAction(actionType: string, context: Record<string, unknown> = {}): void {
  const entry: LogEntry = {
    id: crypto.randomUUID(),
    actionType,
    timestamp: new Date().toISOString(),
    context,
    level: 'info',
  };

  _persistLog(entry);
  console.log(`[${entry.level.toUpperCase()}] ${actionType}`, context);
}

export function logError(actionType: string, context: Record<string, unknown> = {}): void {
  const entry: LogEntry = {
    id: crypto.randomUUID(),
    actionType,
    timestamp: new Date().toISOString(),
    context,
    level: 'error',
  };

  _persistLog(entry);
  console.error(`[${entry.level.toUpperCase()}] ${actionType}`, context);
}

export function getLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.LOGS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as LogEntry[];
  } catch {
    return [];
  }
}

export function clearLogs(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LOGS);
  } catch (error) {
    console.error('Failed to clear logs:', error);
  }
}