import React, { useState } from 'react';
import { 
  Database, Copy, Check, ExternalLink, Play, 
  Terminal, ShieldCheck, CheckCircle2, AlertTriangle, 
  Layers, Code2, Smartphone, Download
} from 'lucide-react';
import { AppsScriptConfig, Language } from '../types';
import { translations } from '../localization/translations';
import { 
  testAppsScriptConnection, 
  saveAppsScriptConfig, 
  resetLocalData 
} from '../services/apiService';
import { APPS_SCRIPT_SOURCE_CODE, NATIVE_BUILD_GUIDE_MD } from '../services/appsScriptBackendCode';

interface AppsScriptHubModalProps {
  config: AppsScriptConfig;
  lang: Language;
  onClose: () => void;
  onConfigUpdated: (newConfig: AppsScriptConfig) => void;
  onRefreshData: () => void;
}

export const AppsScriptHubModal: React.FC<AppsScriptHubModalProps> = ({
  config,
  lang,
  onClose,
  onConfigUpdated,
  onRefreshData,
}) => {
  const t = translations[lang];

  const [webAppUrl, setWebAppUrl] = useState(config.webAppUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedGuide, setCopiedGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'code' | 'schema' | 'android'>('connect');

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testAppsScriptConnection(webAppUrl);
      setTestResult(res);
      if (res.success) {
        const updated: AppsScriptConfig = {
          webAppUrl: webAppUrl.trim(),
          isConnected: true,
          isSimulated: false,
          lastSyncTime: new Date().toISOString()
        };
        saveAppsScriptConfig(updated);
        onConfigUpdated(updated);
        onRefreshData();
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleSimulated = () => {
    const updated: AppsScriptConfig = {
      ...config,
      isConnected: false,
      isSimulated: true
    };
    saveAppsScriptConfig(updated);
    onConfigUpdated(updated);
    setTestResult({
      success: true,
      message: lang === 'ar' ? 'تم التحويل إلى وضع المحاكاة المحلي السريع.' : 'Switched to local simulated state mode.'
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SOURCE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyGuide = () => {
    navigator.clipboard.writeText(NATIVE_BUILD_GUIDE_MD);
    setCopiedGuide(true);
    setTimeout(() => setCopiedGuide(false), 2500);
  };

  const handleResetData = () => {
    resetLocalData();
    onRefreshData();
    alert(lang === 'ar' ? 'تمت إعادة ضبط البيانات التجريبية بنجاح!' : 'Local data reset to initial demo seeds!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t.appsScriptTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.appsScriptSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 shrink-0 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'connect'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ar' ? '1. ربط الرابط المباشر' : '1. Connect Web App'}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ar' ? '2. كود Apps Script (Code.gs)' : '2. Apps Script Code'}
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'schema'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ar' ? '3. هيكلة الجداول الأربعة' : '3. 4 Sheets Schema'}
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'android'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ar' ? '4. تصدير APK / Play Store' : '4. Android Play Store'}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* TAB 1: CONNECT WEB APP */}
          {activeTab === 'connect' && (
            <div className="space-y-4">
              {/* Connection Status Card */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                config.isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}>
                {config.isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <strong className="block font-bold">
                    {config.isConnected ? t.connected : t.simulated}
                  </strong>
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                    {config.isConnected
                      ? (lang === 'ar' ? 'التطبيق متصل الآن بقاعدة بيانات Google Sheets الحية الخاصة بك عبر Apps Script Web App.' : 'App is live-synced with your deployed Google Apps Script Web App.')
                      : (lang === 'ar' ? 'التطبيق يعمل حالياً في وضع المحاكاة المحلي السريع ببيانات عمران النموذجية. يمكنك ربط رابط تطبيق الويب الفعلي أدناه في أي وقت.' : 'App is currently running in local simulator mode with realistic Omran demo records. You can plug in your live deployed Web App URL below at any time.')}
                  </p>
                </div>
              </div>

              {/* Web App URL Form */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.webAppUrlInput}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder={t.webAppUrlPlaceholder}
                    className="flex-1 h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting || !webAppUrl.trim()}
                    className="h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isTesting ? t.testing : t.testConnection}</span>
                  </button>
                </div>
              </div>

              {/* Test Result Feedback */}
              {testResult && (
                <div className={`p-3 rounded-xl text-xs ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                }`}>
                  <div className="font-semibold">{testResult.message}</div>
                </div>
              )}

              {/* Fast Fallback / Demo Reset Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {config.isConnected && (
                  <button
                    onClick={handleToggleSimulated}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    {t.useMockMode}
                  </button>
                )}
                <button
                  onClick={handleResetData}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  {lang === 'ar' ? 'إعادة ضبط البيانات التجريبية' : 'Reset Demo Records'}
                </button>
              </div>

              {/* Quick Deployment Instructions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <strong className="block text-slate-800 dark:text-slate-200 font-bold">
                  {lang === 'ar' ? 'خطوات النشر السريع خلال دقيقتين:' : '2-Minute Deployment Steps:'}
                </strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-xs">
                  <li>
                    {lang === 'ar' ? 'افتح جدول Google جديد ثم اذهب إلى الإضافات > Apps Script.' : 'Open a Google Sheet -> Extensions -> Apps Script.'}
                  </li>
                  <li>
                    {lang === 'ar' ? 'انسخ الكود من التبويب الثاني (Code.gs) والصقه بالكامل.' : 'Copy Code.gs from Tab 2 and replace all existing script content.'}
                  </li>
                  <li>
                    {lang === 'ar' ? 'اضغط تشغيل على دالة initializeOmranDatabase لتوليد الجداول الأربعة وترويساتها تلقائياً!' : 'Run function initializeOmranDatabase to auto-provision all 4 sheets and headers.'}
                  </li>
                  <li>
                    {lang === 'ar' ? 'اضغط نشر (Deploy) -> نشر جديد -> تطبيق ويب (Web App) -> اجعل الوصول متاحاً للجميع (Anyone).' : 'Click Deploy -> New Deployment -> Web App -> Set Access to "Anyone".'}
                  </li>
                  <li>
                    {lang === 'ar' ? 'انسخ الرابط الناتج والصقه في الحقل أعلاه.' : 'Paste the resulting Web App URL above and hit Test Connection.'}
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: APPS SCRIPT CODE */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Google Apps Script (Code.gs)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.appsScriptCodeDesc}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors shrink-0"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? t.copied : t.copyAppsScriptCode}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="max-h-[380px] overflow-auto p-4 rounded-2xl bg-slate-950 text-emerald-300 text-[11px] font-mono leading-relaxed border border-slate-800 selection:bg-emerald-800">
                  {APPS_SCRIPT_SOURCE_CODE}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: 4 SHEETS SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {t.sheetStructureTitle}
              </h3>

              <div className="space-y-3">
                {/* Users Sheet */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{t.sheetUsers}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {lang === 'ar' ? 'أعمدة الجدول المطلوبة في ورقة "Users":' : 'Required headers for "Users" tab:'}
                  </p>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg font-mono text-[10px] text-slate-700 dark:text-slate-300 overflow-x-auto">
                    ID | Username | Password | BrokerID | Role | NameAr | NameEn | Phone | Email | BranchAr | BranchEn | LicenseNumber | Tier
                  </div>
                </div>

                {/* Commissions Sheet */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs mb-1">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>{t.sheetCommissions}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {lang === 'ar' ? 'أعمدة الجدول المطلوبة في ورقة "Broker Commissions":' : 'Required headers for "Broker Commissions" tab:'}
                  </p>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg font-mono text-[10px] text-slate-700 dark:text-slate-300 overflow-x-auto">
                    ID | BrokerID | DealRef | ProjectNameAr | ProjectNameEn | UnitNumber | ClientName | DealAmount | CommissionRate | CommissionAmount | Status | PayoutDate | PaidDate | InvoiceRef | PaymentVoucher | NotesAr | NotesEn
                  </div>
                </div>

                {/* Complaints Sheet */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs mb-1">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>{t.sheetComplaints}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {lang === 'ar' ? 'أعمدة الجدول المطلوبة في ورقة "Complaints":' : 'Required headers for "Complaints" tab:'}
                  </p>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg font-mono text-[10px] text-slate-700 dark:text-slate-300 overflow-x-auto">
                    ID | BrokerID | Type | Title | CategoryAr | CategoryEn | Description | PreferredDate | PreferredTime | MeetingFormat | DepartmentAr | DepartmentEn | Priority | Status | CreatedAt | AdminFeedbackAr | AdminFeedbackEn
                  </div>
                </div>

                {/* Notifications Sheet */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs mb-1">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>{t.sheetNotifications}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {lang === 'ar' ? 'أعمدة الجدول المطلوبة في ورقة "Notifications":' : 'Required headers for "Notifications" tab:'}
                  </p>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg font-mono text-[10px] text-slate-700 dark:text-slate-300 overflow-x-auto">
                    ID | BrokerID | TitleAr | TitleEn | MessageAr | MessageEn | Type | CreatedAt | Read | ActionRef
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANDROID PLAY STORE .AAB / .APK GUIDE */}
          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {t.nativeBuildTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.nativeBuildDesc}
                  </p>
                </div>
                <button
                  onClick={handleCopyGuide}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700 transition-colors shrink-0"
                >
                  {copiedGuide ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGuide ? t.copied : 'نسخ دليل البناء'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed max-h-[380px] overflow-auto border border-slate-800">
                <pre className="whitespace-pre-wrap">{NATIVE_BUILD_GUIDE_MD}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
