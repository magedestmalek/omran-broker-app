import { User, Commission, ComplaintRequest, AppNotification, AppsScriptConfig } from '../types';
import { INITIAL_USERS, INITIAL_COMMISSIONS, INITIAL_COMPLAINTS, INITIAL_NOTIFICATIONS } from '../data/mockData';

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxT5kyo3ZFLYGG9_LFvPc9bQaVf6TZZo1uY1EF4Waqj1t9XAQBbBabt2NFtoJjUOZOS/exec';

const STORAGE_KEYS = {
  CONFIG: 'omran_appsscript_config',
  USERS: 'omran_users_data',
  COMMISSIONS: 'omran_commissions_data',
  COMPLAINTS: 'omran_complaints_data',
  NOTIFICATIONS: 'omran_notifications_data',
  CURRENT_USER: 'omran_current_user',
  LANGUAGE: 'omran_language',
  THEME: 'omran_theme',
};

// Initialize persistent local storage if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(INITIAL_COMMISSIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  const existingConfigRaw = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (!existingConfigRaw) {
    const defaultConfig: AppsScriptConfig = {
      webAppUrl: DEFAULT_APPS_SCRIPT_URL,
      isConnected: true,
      isSimulated: false,
      lastSyncTime: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(defaultConfig));
  } else {
    try {
      const parsed = JSON.parse(existingConfigRaw) as AppsScriptConfig;
      if (!parsed.webAppUrl) {
        const upgraded: AppsScriptConfig = {
          webAppUrl: DEFAULT_APPS_SCRIPT_URL,
          isConnected: true,
          isSimulated: false,
          lastSyncTime: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(upgraded));
      }
    } catch {
      // ignore malformed storage
    }
  }
}

// Get Apps Script config
export function getAppsScriptConfig(): AppsScriptConfig {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return raw
      ? JSON.parse(raw)
      : { webAppUrl: DEFAULT_APPS_SCRIPT_URL, isConnected: true, isSimulated: false };
  } catch {
    return { webAppUrl: DEFAULT_APPS_SCRIPT_URL, isConnected: true, isSimulated: false };
  }
}

// Save Apps Script config
export function saveAppsScriptConfig(config: AppsScriptConfig): void {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

// Test live Google Apps Script Web App URL
export async function testAppsScriptConnection(url: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Invalid Google Apps Script URL. It must begin with https://script.google.com/macros/s/.../exec'
    };
  }

  const startTime = Date.now();
  try {
    const cleanUrl = url.trim();
    const endpoint = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=ping`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const latencyMs = Date.now() - startTime;
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return {
          success: true,
          message: `Connection successful (${latencyMs}ms)! ${data.message || 'API is live.'}`,
          latencyMs
        };
      }
    }
    return {
      success: false,
      message: `Endpoint responded with status ${response.status}. Ensure Web App deployment is set to "Anyone" access.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network error: ${err.message || 'Failed to fetch'}. If CORS is blocked, ensure Web App is deployed with "Execute as: Me" and "Access: Anyone".`
    };
  }
}

// Authentication
export async function authenticateBroker(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  initializeStorage();
  const config = getAppsScriptConfig();

  // If live Apps Script connected, call remote endpoint
  if (config.isConnected && config.webAppUrl) {
    try {
      const endpoint = `${config.webAppUrl}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch {
      // Fallback to local if remote fails
      console.warn('Apps Script login failed, checking local database');
    }
  }

  // Local / Simulation Auth
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const trimmed = username.trim().toLowerCase();
  const matched = users.find(u => 
    u.username.toLowerCase() === trimmed || 
    u.brokerId.toLowerCase() === trimmed
  );

  // Default passwords are accepted for demo simplicity ('omran123' or '123456' or matching username)
  if (matched && (password === 'omran123' || password === '123456' || password.length >= 4)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(matched));
    return { success: true, user: matched };
  }

  return { success: false, error: 'Invalid username or password' };
}

// Get logged-in user
export function getCurrentUser(): User | null {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
    // Default to Ahmed Al-Omari on initial load for instant preview
    const defaultUser = INITIAL_USERS[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    return defaultUser;
  } catch {
    return INITIAL_USERS[0];
  }
}

// Sign Out
export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Switch current demo user
export function switchCurrentUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// Fetch commissions
export async function getCommissions(brokerId: string): Promise<Commission[]> {
  initializeStorage();
  const config = getAppsScriptConfig();

  if (config.isConnected && config.webAppUrl) {
    try {
      const endpoint = `${config.webAppUrl}?action=getCommissions&brokerId=${encodeURIComponent(brokerId)}&_t=${Date.now()}`;
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.commissions)) {
        return data.commissions;
      }
    } catch (e) {
      console.warn('Failed to fetch commissions from Apps Script, using local data', e);
    }
  }

  const allComms: Commission[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMISSIONS) || '[]');
  return allComms.filter(c => !brokerId || c.brokerId === brokerId);
}

// Fetch complaints & appointment requests
export async function getComplaints(brokerId: string): Promise<ComplaintRequest[]> {
  initializeStorage();
  const config = getAppsScriptConfig();

  if (config.isConnected && config.webAppUrl) {
    try {
      const endpoint = `${config.webAppUrl}?action=getComplaints&brokerId=${encodeURIComponent(brokerId)}&_t=${Date.now()}`;
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.complaints)) {
        return data.complaints;
      }
    } catch (e) {
      console.warn('Failed to fetch complaints from Apps Script, using local data', e);
    }
  }

  const allReqs: ComplaintRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLAINTS) || '[]');
  return allReqs.filter(r => !brokerId || r.brokerId === brokerId);
}

// Submit a new complaint or appointment request
export async function submitComplaintRequest(requestData: Omit<ComplaintRequest, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; request: ComplaintRequest }> {
  initializeStorage();
  const config = getAppsScriptConfig();

  const newId = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
  const newRequest: ComplaintRequest = {
    ...requestData,
    id: newId,
    status: 'submitted',
    createdAt: new Date().toISOString(),
  };

  // If live Apps Script connected, post to endpoint
  if (config.isConnected && config.webAppUrl) {
    try {
      await fetch(config.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addComplaint',
          ...newRequest
        })
      });
    } catch (e) {
      console.warn('Remote sync failed, saved locally', e);
    }
  }

  // Save into local storage
  const currentList: ComplaintRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLAINTS) || '[]');
  const updated = [newRequest, ...currentList];
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));

  return { success: true, request: newRequest };
}

// Fetch notifications
export async function getNotifications(brokerId: string): Promise<AppNotification[]> {
  initializeStorage();
  const config = getAppsScriptConfig();

  if (config.isConnected && config.webAppUrl) {
    try {
      const endpoint = `${config.webAppUrl}?action=getNotifications&brokerId=${encodeURIComponent(brokerId)}&_t=${Date.now()}`;
      const res = await fetch(endpoint, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        return data.notifications;
      }
    } catch (e) {
      console.warn('Failed to fetch notifications from Apps Script, using local data', e);
    }
  }

  const allNotifs: AppNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  return allNotifs.filter(n => n.brokerId === 'ALL' || n.brokerId === brokerId);
}

// Mark notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
  initializeStorage();
  const allNotifs: AppNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  const updated = allNotifs.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));

  const config = getAppsScriptConfig();
  if (config.isConnected && config.webAppUrl) {
    try {
      await fetch(config.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markNotificationRead', notificationId: id })
      });
    } catch {}
  }
}

// Mark all as read
export function markAllNotificationsAsRead(brokerId: string): void {
  initializeStorage();
  const allNotifs: AppNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  const updated = allNotifs.map(n => {
    if (n.brokerId === 'ALL' || n.brokerId === brokerId) {
      return { ...n, read: true };
    }
    return n;
  });
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
}

// Reset local data back to initial demo seeds
export function resetLocalData(): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(INITIAL_COMMISSIONS));
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
}
