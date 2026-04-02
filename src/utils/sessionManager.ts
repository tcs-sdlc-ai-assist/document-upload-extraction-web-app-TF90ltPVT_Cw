import { LOCAL_STORAGE_KEYS } from '@/constants';
import { logAction } from '@/utils/logger';

export function getSession(): string | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION);
    if (!raw) {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

export function setSession(username: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SESSION, username);
    logAction('SESSION_SET', { username });
  } catch (error) {
    console.error('Failed to set session:', error);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION);
    logAction('SESSION_CLEARED');
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}