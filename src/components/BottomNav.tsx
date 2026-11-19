import React from 'react';
import { DollarSign, MessageSquarePlus, Bell, UserCheck } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../localization/translations';

export type NavTab = 'commissions' | 'requests' | 'notifications' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  lang: Language;
  unreadCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  lang,
  unreadCount,
}) => {
  const t = translations[lang];

  const items: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'commissions', label: t.navCommissions, icon: DollarSign },
    { id: 'requests', label: t.navRequests, icon: MessageSquarePlus },
    { id: 'notifications', label: t.navNotifications, icon: Bell },
    { id: 'profile', label: t.navProfile, icon: UserCheck },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="no-print fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors shadow-lg shadow-slate-900/5"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-1">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] relative transition-colors ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -end-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight mt-1 truncate max-w-[80px]">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
