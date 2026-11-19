import React, { useState } from 'react';
import { Lock, User as UserIcon, Globe, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Language, User } from '../types';
import { translations } from '../localization/translations';
import { INITIAL_USERS } from '../data/mockData';
import { authenticateBroker } from '../services/apiService';

interface LoginModalProps {
  lang: Language;
  onToggleLang: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  lang,
  onToggleLang,
  onLoginSuccess,
}) => {
  const t = translations[lang];

  const [username, setUsername] = useState('ahmed.omran');
  const [password, setPassword] = useState('omran123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await authenticateBroker(username, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || t.loginError);
      }
    } catch {
      setErrorMessage(t.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (u: User) => {
    setUsername(u.username);
    setPassword('omran123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      {/* Brand Hero Lockup */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-950 p-1 shadow-xl shadow-emerald-950/30 items-center justify-center text-amber-300 font-bold text-3xl">
          <span>ع</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.appName}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          {t.portalSubtitle}
        </p>

        {/* Language switch */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onToggleLang}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'ar' ? 'English (Switch to LTR)' : 'عربي (التبديل للعربية)'}</span>
          </button>
        </div>
      </div>

      {/* Main Login Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5 space-y-4 transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t.loginTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.loginSubtitle}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.username}
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.usernamePlaceholder}
                className="w-full h-10 ps-9 pe-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.password}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full h-10 ps-9 pe-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>{t.rememberMe}</span>
            </label>
          </div>

          {/* Sign In CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
          >
            <span>{isLoading ? t.loading : t.loginBtn}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>

        {/* Demo Accounts Pill List */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            {t.demoAccountsTitle}
          </span>
          <div className="space-y-1.5">
            {INITIAL_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectDemo(u)}
                className={`w-full text-start p-2 rounded-xl text-xs border flex items-center justify-between transition-colors ${
                  username === u.username
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <strong className="block font-semibold">
                    {lang === 'ar' ? u.nameAr : u.nameEn}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {u.username} · {u.brokerId} · {u.tier}
                  </span>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
