/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Language, User, Commission, ComplaintRequest, 
  AppNotification, AppsScriptConfig 
} from './types';
import { translations } from './localization/translations';
import { 
  getCurrentUser, logoutUser, getCommissions, 
  getComplaints, getNotifications, getAppsScriptConfig 
} from './services/apiService';
import { MobileFrame } from './components/MobileFrame';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { CommissionsView } from './components/CommissionsView';
import { RequestsView } from './components/RequestsView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { LoginModal } from './components/LoginModal';
import { AppsScriptHubModal } from './components/AppsScriptHubModal';

export default function App() {
  // Localization & RTL State
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('omran_lang') as Language) || 'ar';
  });

  // Dark Mode State
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('omran_theme') === 'dark';
  });

  // View Mode: Default to clean full-screen responsive layout
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Current Logged-in User
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());

  // Active Bottom Navigation Tab
  const [activeTab, setActiveTab] = useState<NavTab>('commissions');

  // Apps Script Hub Modal
  const [showAppsScriptHub, setShowAppsScriptHub] = useState(false);
  const [appsScriptConfig, setAppsScriptConfig] = useState<AppsScriptConfig>(() => getAppsScriptConfig());

  // Data Collections
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [complaints, setComplaints] = useState<ComplaintRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Sync Language and Direction with DOM
  useEffect(() => {
    localStorage.setItem('omran_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Sync Dark Theme with DOM
  useEffect(() => {
    localStorage.setItem('omran_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Fetch all user records
  const loadUserData = useCallback(async (brokerId: string) => {
    try {
      const [comms, comps, notifs, cfg] = await Promise.all([
        getCommissions(brokerId),
        getComplaints(brokerId),
        getNotifications(brokerId),
        getAppsScriptConfig()
      ]);
      setCommissions(comms);
      setComplaints(comps);
      setNotifications(notifs);
      setAppsScriptConfig(cfg);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Auto-refresh immediately on open
    loadUserData(currentUser.brokerId);

    // Auto-refresh whenever user returns to the app (mobile/browser foreground)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUserData(currentUser.brokerId);
      }
    };

    const handleFocus = () => {
      loadUserData(currentUser.brokerId);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentUser, loadUserData]);

  // Handlers
  const handleToggleLang = () => {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleToggleDark = () => {
    setIsDark(prev => !prev);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('commissions');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={isDark ? 'dark' : ''}>
      <MobileFrame enabled={isMobileFrame}>
        {!currentUser ? (
          /* Authentication Screen */
          <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center transition-colors">
            <LoginModal
              lang={lang}
              onToggleLang={handleToggleLang}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        ) : (
          /* Authenticated Broker Portal Layout */
          <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 transition-colors">
            {/* Simplified Clean Header */}
            <HeaderBar
              lang={lang}
              onToggleLang={handleToggleLang}
              isDark={isDark}
              onToggleDark={handleToggleDark}
              onOpenProfile={() => setActiveTab('profile')}
              userName={lang === 'ar' ? currentUser.nameAr : currentUser.nameEn}
              brokerId={currentUser.brokerId}
            />

            {/* Screen Content View */}
            <main className="flex-1 relative">
              {activeTab === 'commissions' && (
                <CommissionsView
                  commissions={commissions}
                  currentUser={currentUser}
                  lang={lang}
                  onRefresh={() => loadUserData(currentUser.brokerId)}
                />
              )}

              {activeTab === 'requests' && (
                <RequestsView
                  complaints={complaints}
                  lang={lang}
                  brokerId={currentUser.brokerId}
                  onRefresh={() => loadUserData(currentUser.brokerId)}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsView
                  notifications={notifications}
                  lang={lang}
                  brokerId={currentUser.brokerId}
                  onRefresh={() => loadUserData(currentUser.brokerId)}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  currentUser={currentUser}
                  lang={lang}
                  onToggleLang={handleToggleLang}
                  isDark={isDark}
                  onToggleDark={handleToggleDark}
                  appsScriptConfig={appsScriptConfig}
                  onOpenAppsScriptHub={() => setShowAppsScriptHub(true)}
                  onLogout={handleLogout}
                  onUserChanged={(newUser) => {
                    setCurrentUser(newUser);
                    loadUserData(newUser.brokerId);
                  }}
                />
              )}
            </main>

            {/* Mobile Bottom Navigation (fixed bottom anchor with 4 destinations) */}
            <BottomNav
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab)}
              lang={lang}
              unreadCount={unreadCount}
            />

            {/* Google Apps Script & Standalone Play Store Deployment Modal */}
            {showAppsScriptHub && (
              <AppsScriptHubModal
                config={appsScriptConfig}
                lang={lang}
                onClose={() => setShowAppsScriptHub(false)}
                onConfigUpdated={(newConfig) => setAppsScriptConfig(newConfig)}
                onRefreshData={() => loadUserData(currentUser.brokerId)}
              />
            )}
          </div>
        )}
      </MobileFrame>
    </div>
  );
}
