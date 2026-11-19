import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  FileText,
  Calculator,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { Commission, Language, User } from '../types';
import { translations } from '../localization/translations';
import { CommissionClaimModal } from './CommissionClaimModal';

interface CommissionsViewProps {
  commissions: Commission[];
  currentUser: User;
  lang: Language;
  onRefresh: () => void;
}

export const CommissionsView: React.FC<CommissionsViewProps> = ({
  commissions,
  currentUser,
  lang,
}) => {
  const t = translations[lang];
  const [activeFilter, setActiveFilter] = useState<'all' | 'due' | 'paid' | 'under_review'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [claimModalIds, setClaimModalIds] = useState<string[] | null>(null);

  // Computed Financial Aggregates
  const stats = useMemo(() => {
    let dueTotal = 0;
    let paidTotal = 0;
    let nextPayout: string | null = null;

    commissions.forEach((c) => {
      if (c.status === 'due') {
        dueTotal += c.commissionAmount;
        if (!nextPayout || c.payoutDate < nextPayout) {
          nextPayout = c.payoutDate;
        }
      } else if (c.status === 'paid') {
        paidTotal += c.commissionAmount;
      }
    });

    return {
      dueTotal,
      paidTotal,
      nextPayout: nextPayout || '2026-11-20',
    };
  }, [commissions]);

  // Filtered List
  const filteredCommissions = useMemo(() => {
    return commissions.filter((c) => {
      const matchFilter = activeFilter === 'all' || c.status === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.dealRef.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.projectNameAr.toLowerCase().includes(q) ||
        c.projectNameEn.toLowerCase().includes(q);

      return matchFilter && matchQuery;
    });
  }, [commissions, activeFilter, searchQuery]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto space-y-5">
      {/* Clean Summary Card */}
      <div className="no-print rounded-3xl bg-emerald-900 text-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              {t.commissionsTitle}
            </h1>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              {t.nextPayoutDate}: <span className="font-mono font-semibold text-white">{stats.nextPayout}</span>
            </p>
          </div>

          {/* Primary Action: Calculate & Download A4 Claim */}
          <button
            onClick={() => setClaimModalIds([])}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-colors shrink-0"
          >
            <Calculator className="w-4 h-4" />
            <span>{t.createClaimBtn}</span>
          </button>
        </div>

        {/* 2 Clean Core Figures: Due vs Paid */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-emerald-800/80">
          <div>
            <span className="text-xs text-emerald-200 block">{t.dueCommissions}</span>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-300 mt-0.5">
              {formatCurrency(stats.dueTotal)}{' '}
              <span className="text-xs font-normal text-amber-200">{t.currency}</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-emerald-200 block">{t.paidCommissions}</span>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white mt-0.5">
              {formatCurrency(stats.paidTotal)}{' '}
              <span className="text-xs font-normal text-emerald-200">{t.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Filter Bar + Search */}
      <div className="no-print flex flex-col sm:flex-row gap-2.5">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl overflow-x-auto sm:shrink-0">
          {(
            [
              { id: 'all', label: t.filterAll },
              { id: 'due', label: t.filterDue },
              { id: 'paid', label: t.filterPaid },
              { id: 'under_review', label: t.filterReview },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeFilter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث بالمشروع أو رقم الصفقة...' : 'Search project or deal ref...'}
            className="w-full h-10 ps-9 pe-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Clean Deals List */}
      <div className="no-print space-y-2.5">
        {filteredCommissions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.statementNoData}</p>
          </div>
        ) : (
          filteredCommissions.map((commission) => {
            const isDue = commission.status === 'due';
            const isPaid = commission.status === 'paid';

            return (
              <div
                key={commission.id}
                onClick={() => setSelectedCommission(commission)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        {commission.dealRef}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          isDue
                            ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                            : isPaid
                            ? 'text-slate-600 dark:text-slate-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {isDue ? t.statusDue : isPaid ? t.statusPaid : t.statusReview}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mt-1 truncate">
                      {lang === 'ar' ? commission.projectNameAr : commission.projectNameEn}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1 truncate">
                        <UserIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{commission.clientName}</span>
                      </span>
                      <span className="flex items-center gap-1 shrink-0 font-mono">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{isPaid ? commission.paidDate || commission.payoutDate : commission.payoutDate}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-end shrink-0 flex flex-col items-end">
                    <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(commission.commissionAmount)}{' '}
                      <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400">
                        {t.currency}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setClaimModalIds([commission.id]);
                      }}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'مطالبة A4' : 'A4 Claim'}</span>
                      <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Deal Details Modal */}
      {selectedCommission && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {t.voucherTitle}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                  {selectedCommission.dealRef}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCommission(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t.projectName}</span>
                <span className="font-semibold text-slate-900 dark:text-white text-end">
                  {lang === 'ar' ? selectedCommission.projectNameAr : selectedCommission.projectNameEn}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t.unitNumber}</span>
                <span className="font-mono text-slate-900 dark:text-white">{selectedCommission.unitNumber}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t.clientName}</span>
                <span className="text-slate-900 dark:text-white">{selectedCommission.clientName}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t.dealValue}</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(selectedCommission.dealAmount)} {t.currency}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t.netCommission}</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(selectedCommission.commissionAmount)} {t.currency}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t.payoutDateLabel}</span>
                <span className="font-mono text-slate-900 dark:text-white">{selectedCommission.payoutDate}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const id = selectedCommission.id;
                  setSelectedCommission(null);
                  setClaimModalIds([id]);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{t.createClaimBtn}</span>
              </button>
              <button
                onClick={() => setSelectedCommission(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A4 Commission Claim Calculator & Download Modal */}
      {claimModalIds !== null && (
        <CommissionClaimModal
          commissions={commissions}
          initialSelectedIds={claimModalIds}
          currentUser={currentUser}
          lang={lang}
          onClose={() => setClaimModalIds(null)}
        />
      )}
    </div>
  );
};
