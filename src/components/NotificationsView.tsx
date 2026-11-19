import React, { useState } from 'react';
import { Bell, CheckCheck, DollarSign, Megaphone, Info, CheckCircle2 } from 'lucide-react';
import { AppNotification, Language, NotificationType } from '../types';
import { translations } from '../localization/translations';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../services/apiService';

interface NotificationsViewProps {
  notifications: AppNotification[];
  lang: Language;
  brokerId: string;
  onRefresh: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  lang,
  brokerId,
  onRefresh,
}) => {
  const t = translations[lang];
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(brokerId);
    onRefresh();
  };

  const handleItemClick = async (notif: AppNotification) => {
    setSelectedNotif(notif);
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
      onRefresh();
    }
  };

  const filtered = notifications.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
            <Bell className="w-4 h-4" />
            <span>{t.companyName}</span>
            <span aria-hidden="true">·</span>
            <span>{t.notificationsTitle}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {t.notificationsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.notificationsSubtitle}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{t.markAllRead}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
            filterType === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500'
          }`}
        >
          {t.all} ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('payout')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
            filterType === 'payout' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold' : 'text-slate-500'
          }`}
        >
          {t.notifTypePayout}
        </button>
        <button
          onClick={() => setFilterType('announcement')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
            filterType === 'announcement' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500'
          }`}
        >
          {t.notifTypeAnnouncement}
        </button>
        <button
          onClick={() => setFilterType('deal')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
            filterType === 'deal' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500'
          }`}
        >
          {t.notifTypeDeal}
        </button>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
            <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t.noNotifications}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isPayout = item.type === 'payout';
            const isAnnouncement = item.type === 'announcement';

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  !item.read
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isPayout 
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      : isAnnouncement
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {isPayout ? <DollarSign className="w-5 h-5" /> :
                     isAnnouncement ? <Megaphone className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {isPayout ? t.notifTypePayout : isAnnouncement ? t.notifTypeAnnouncement : t.notifTypeDeal}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" title={t.unreadCount} />
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                      {lang === 'ar' ? item.titleAr : item.titleEn}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                      {lang === 'ar' ? item.messageAr : item.messageEn}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {selectedNotif.type === 'payout' ? t.notifTypePayout : t.notifTypeAnnouncement}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {new Date(selectedNotif.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'ar' ? selectedNotif.titleAr : selectedNotif.titleEn}
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {lang === 'ar' ? selectedNotif.messageAr : selectedNotif.messageEn}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
