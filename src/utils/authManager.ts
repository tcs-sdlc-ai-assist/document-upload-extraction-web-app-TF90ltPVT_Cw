import type { UserCredentials } from '@/types';
import { LOCAL_STORAGE_KEYS, ERROR_MESSAGES } from '@/constants';
import { logAction, logError } from '@/utils/logger';
import { setSession, clearSession, getSession } from '@/utils/sessionManager';

interface AuthResult {
  success: boolean;
  error?: string;
}

function _getUsers(): UserCredentials[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as UserCredentials[];
  } catch {
    return [];
  }
}

function _saveUsers(users: UserCredentials[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
}

async function _hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function signup(username: string, password: string): Promise<AuthResult> {
  if (!username || !username.trim()) {
    return { success: false, error: 'Username is required.' };
  }

  if (!password || !password.trim()) {
    return { success: false, error: 'Password is required.' };
  }

  const trimmedUsername = username.trim();

  const users = _getUsers();
  const duplicate = users.find((u) => u.username === trimmedUsername);

  if (duplicate) {
    return { success: false, error: ERROR_MESSAGES.DUPLICATE_USERNAME(trimmedUsername) };
  }

  const passwordHash = await _hashPassword(password);

  const newUser: UserCredentials = {
    username: trimmedUsername,
    passwordHash,
  };

  users.push(newUser);
  _saveUsers(users);

  setSession(trimmedUsername);
  logAction('SIGNUP', { username: trimmedUsername });

  return { success: true };
}

export async function login(username: string, password: string): Promise<AuthResult> {
  if (!username || !username.trim()) {
    return { success: false, error: 'Username is required.' };
  }

  if (!password || !password.trim()) {
    return { success: false, error: 'Password is required.' };
  }

  const trimmedUsername = username.trim();
  const users = _getUsers();
  const user = users.find((u) => u.username === trimmedUsername);

  if (!user) {
    logError('LOGIN_FAILED', { username: trimmedUsername, reason: 'User not found' });
    return { success: false, error: ERROR_MESSAGES.INVALID_CREDENTIALS };
  }

  const passwordHash = await _hashPassword(password);

  if (passwordHash !== user.passwordHash) {
    logError('LOGIN_FAILED', { username: trimmedUsername, reason: 'Incorrect password' });
    return { success: false, error: ERROR_MESSAGES.INVALID_CREDENTIALS };
  }

  setSession(trimmedUsername);
  logAction('LOGIN', { username: trimmedUsername });

  return { success: true };
}

export function logout(): void {
  clearSession();
  logAction('LOGOUT');
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}