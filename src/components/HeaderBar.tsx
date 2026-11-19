import React from 'react';
import { Globe, Moon, Sun } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../localization/translations';

interface HeaderBarProps {
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenProfile: () => void;
  userName?: string;
  brokerId?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  lang,
  onToggleLang,
  isDark,
  onToggleDark,
  onOpenProfile,
  userName,
  brokerId,
}) => {
  const t = translations[lang];

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Clean Brand Lockup */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 min-w-0 text-start group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-300 font-bold shrink-0">
            <span className="text-base">ع</span>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight truncate">
              {lang === 'ar' ? 'بوابة وسطاء عمران' : 'Omran Broker Hub'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {userName || t.omranBroker} · <span className="font-mono">{brokerId || 'OMR-8842'}</span>
            </div>
          </div>
        </button>

        {/* Minimal Controls: Language & Theme */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors whitespace-nowrap"
            title={t.languageToggle}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          <button
            onClick={onToggleDark}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t.themeToggle}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
