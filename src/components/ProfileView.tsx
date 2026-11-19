import React, { useState } from 'react';
import { 
  UserCheck, Shield, QrCode, Phone, Mail, MapPin, 
  Award, Globe, Moon, Sun, Database, LogOut, 
  Printer, Share2, Check, RefreshCw
} from 'lucide-react';
import { User, Language, AppsScriptConfig } from '../types';
import { translations } from '../localization/translations';
import { INITIAL_USERS } from '../data/mockData';
import { switchCurrentUser } from '../services/apiService';

interface ProfileViewProps {
  currentUser: User;
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  appsScriptConfig: AppsScriptConfig;
  onOpenAppsScriptHub: () => void;
  onLogout: () => void;
  onUserChanged: (newUser: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  lang,
  onToggleLang,
  isDark,
  onToggleDark,
  appsScriptConfig,
  onOpenAppsScriptHub,
  onLogout,
  onUserChanged,
}) => {
  const t = translations[lang];
  const [copiedId, setCopiedId] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.brokerId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleSwitchAccount = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = INITIAL_USERS.find(u => u.brokerId === e.target.value);
    if (selected) {
      switchCurrentUser(selected);
      onUserChanged(selected);
    }
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
          <Award className="w-4 h-4" />
          <span>{t.companyName}</span>
          <span aria-hidden="true">·</span>
          <span>{t.profileTitle}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {t.profileTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.profileSubtitle}
        </p>
      </div>

      {/* Luxury Digital Broker ID Card */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white shadow-2xl shadow-emerald-950/40 border border-emerald-500/30 overflow-hidden">
        {/* Card Background Pattern Accents */}
        <div className="absolute top-0 end-0 w-64 h-64 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Card Row: Company Lockup & Tier */}
        <div className="relative z-10 flex items-start justify-between gap-3 border-b border-emerald-700/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md">
              <div className="w-full h-full rounded-2xl bg-emerald-950 flex items-center justify-center text-amber-300 font-bold text-xl">
                ع
              </div>
            </div>
            <div>
              <span className="text-[11px] text-emerald-300 font-semibold tracking-wider uppercase block">
                {lang === 'ar' ? 'شركة عمران العقارية' : 'Omran Real Estate'}
              </span>
              <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                {t.omranBroker}
              </span>
            </div>
          </div>

          <div className="text-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/50 border border-amber-500/40 px-2.5 py-1 rounded-full">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>{currentUser.tier === 'Platinum' ? t.tierPlatinum : t.tierGold}</span>
            </span>
          </div>
        </div>

        {/* Card Body: Broker Details & Portrait */}
        <div className="relative z-10 my-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-emerald-300/80 font-medium block">
              {lang === 'ar' ? 'اسم الوسيط المعتمد' : 'Certified Broker Name'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {lang === 'ar' ? currentUser.nameAr : currentUser.nameEn}
            </h2>
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-200/90">
              <span className="font-mono bg-emerald-900/80 px-2 py-0.5 rounded text-amber-300 font-semibold border border-emerald-700/60">
                {currentUser.brokerId}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px]">{currentUser.licenseNumber}</span>
            </div>
          </div>

          {/* Interactive QR Code Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="self-start sm:self-auto p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md flex items-center gap-2.5 transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center">
              <QrCode className="w-8 h-8 text-slate-900 group-hover:scale-105 transition-transform" />
            </div>
            <div className="text-start">
              <span className="text-[11px] text-emerald-300 block font-medium">
                {lang === 'ar' ? 'امسح للتحقق' : 'Scan to Verify'}
              </span>
              <span className="text-xs text-white font-semibold">
                {lang === 'ar' ? 'رمز QR المعتمد' : 'Official QR Code'}
              </span>
            </div>
          </button>
        </div>

        {/* Card Footer: Contact & Branch Details */}
        <div className="relative z-10 pt-4 border-t border-emerald-700/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-200/80">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{lang === 'ar' ? currentUser.branchAr : currentUser.branchEn}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate sm:justify-end">
            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-mono">{currentUser.phone}</span>
          </div>
        </div>
      </div>

      {/* Card Actions: Copy ID & Print Card */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={handleCopyId}
          className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
        >
          {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          <span>{copiedId ? t.copied : `${t.copy} ${currentUser.brokerId}`}</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>{t.printCard}</span>
        </button>
      </div>

      {/* Demo Profile Switcher (Helpful for test evaluations) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-2 transition-colors">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.demoSelectPrompt}</span>
        </label>
        <select
          value={currentUser.brokerId}
          onChange={handleSwitchAccount}
          className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          {INITIAL_USERS.map((u) => (
            <option key={u.id} value={u.brokerId}>
              {lang === 'ar' ? u.nameAr : u.nameEn} ({u.brokerId} - {u.tier})
            </option>
          ))}
        </select>
      </div>

      {/* Application & Portal Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          {t.accountSettings}
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
          {/* Language Toggle */}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>{t.languageToggle}</span>
            </div>
            <button
              onClick={onToggleLang}
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
            >
              {lang === 'ar' ? 'English (LTR)' : 'عربي (RTL)'}
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
              <span>{t.themeToggle}</span>
            </div>
            <button
              onClick={onToggleDark}
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-200 transition-colors"
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          {/* Apps Script Dev Hub Trigger */}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>{t.appsScriptTitle}</span>
            </div>
            <button
              onClick={onOpenAppsScriptHub}
              className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              {lang === 'ar' ? 'إدارة الربط' : 'Configure'}
            </button>
          </div>

          {/* Logout Action */}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-600 font-medium">
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Verification Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.qrCodeTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.qrCodeDesc}
              </p>
            </div>

            {/* Stylized QR Code Visual */}
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-emerald-500/40 inline-block shadow-inner">
              <div className="w-44 h-44 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-between">
                <div className="w-full flex justify-between">
                  <div className="w-10 h-10 border-4 border-white rounded-md p-1">
                    <div className="w-full h-full bg-amber-400" />
                  </div>
                  <div className="w-10 h-10 border-4 border-white rounded-md p-1">
                    <div className="w-full h-full bg-amber-400" />
                  </div>
                </div>
                <div className="text-center font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
                  OMRAN CERTIFIED
                </div>
                <div className="w-full flex justify-between items-end">
                  <div className="w-10 h-10 border-4 border-white rounded-md p-1">
                    <div className="w-full h-full bg-amber-400" />
                  </div>
                  <div className="text-end text-[10px] text-white font-mono font-bold">
                    {currentUser.brokerId}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 font-mono">
              VERIFIED: {currentUser.licenseNumber}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
