import React, { useState, useMemo } from 'react';
import { Printer, Download, Calculator, FileText, Building2, Check, X } from 'lucide-react';
import { Commission, Language, User } from '../types';
import { translations } from '../localization/translations';

interface CommissionClaimModalProps {
  commissions: Commission[];
  initialSelectedIds?: string[];
  currentUser: User;
  lang: Language;
  onClose: () => void;
}

export const CommissionClaimModal: React.FC<CommissionClaimModalProps> = ({
  commissions,
  initialSelectedIds,
  currentUser,
  lang,
  onClose,
}) => {
  const t = translations[lang];
  const isAr = lang === 'ar';

  // Default selected deals: passed initial IDs, or all 'due' commissions, or first commission
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialSelectedIds && initialSelectedIds.length > 0) return initialSelectedIds;
    const dueIds = commissions.filter(c => c.status === 'due').map(c => c.id);
    if (dueIds.length > 0) return dueIds;
    return commissions.length > 0 ? [commissions[0].id] : [];
  });

  // Editable Beneficiary Company Info (Company entitled to the commission)
  const [companyName, setCompanyName] = useState(
    isAr ? `مكتب ${currentUser.nameAr} للوساطة العقارية` : `${currentUser.nameEn} Real Estate Brokerage`
  );
  const [crNumber, setCrNumber] = useState('1010849201');
  const [taxNumber, setTaxNumber] = useState('310492817200003');
  const [bankName, setBankName] = useState(isAr ? 'البنك التجاري الدولي (CIB)' : 'Commercial International Bank (CIB)');
  const [iban, setIban] = useState('EG38 0019 0005 0000 0002 6318 0002 1');
  const [includeVat, setIncludeVat] = useState(true);
  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'preview'>('preview');

  const claimRef = useMemo(() => {
    const year = new Date().getFullYear();
    const num = Math.floor(1000 + (commissions.length * 137) % 8900);
    return `CLM-${year}-${num}`;
  }, [commissions.length]);

  const issueDate = new Date().toISOString().slice(0, 10);

  const selectedDeals = useMemo(() => {
    return commissions.filter(c => selectedIds.includes(c.id));
  }, [commissions, selectedIds]);

  const subtotal = useMemo(() => {
    return selectedDeals.reduce((sum, c) => sum + c.commissionAmount, 0);
  }, [selectedDeals]);

  const vatValue = includeVat ? subtotal * 0.14 : 0;
  const grandTotal = subtotal + vatValue;

  const toggleDeal = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Trigger clean A4 PDF Print
  const handlePrintPdf = () => {
    window.print();
  };

  // Download standalone A4 HTML file that opens & prints identically as A4 anywhere
  const handleDownloadA4Html = () => {
    const dir = isAr ? 'rtl' : 'ltr';
    const rowsHtml = selectedDeals.map((d, idx) => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:center;">${idx + 1}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-family:monospace;">${d.dealRef}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;">
          <strong>${isAr ? d.projectNameAr : d.projectNameEn}</strong><br/>
          <span style="font-size:11px;color:#64748b;">${d.unitNumber} - ${d.clientName}</span>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-family:monospace;">${formatMoney(d.dealAmount)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-family:monospace;text-align:center;">${d.commissionRate}%</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-weight:700;">${formatMoney(d.commissionAmount)}</td>
      </tr>
    `).join('');

    const htmlDoc = `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <title>${claimRef} - ${t.claimDocTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 0; }
    body { margin: 0; padding: 0; background: #f1f5f9; font-family: 'Cairo', Arial, sans-serif; color: #0f172a; }
    .a4-page { width: 210mm; min-height: 297mm; margin: 12mm auto; background: #fff; padding: 15mm; box-sizing: border-box; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    @media print { body { background: #fff; } .a4-page { margin: 0; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="a4-page">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #065f46;padding-bottom:14px;margin-bottom:18px;">
      <div>
        <div style="font-size:20px;font-weight:700;color:#065f46;">${companyName}</div>
        <div style="font-size:12px;color:#475569;margin-top:4px;">${t.beneficiaryCR}: ${crNumber} | ${t.beneficiaryTax}: ${taxNumber}</div>
        <div style="font-size:12px;color:#475569;">${t.licenseNumber}: ${currentUser.licenseNumber}</div>
      </div>
      <div style="text-align:${isAr ? 'left' : 'right'};">
        <div style="font-size:15px;font-weight:700;color:#0f172a;">${t.claimDocTitle}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">${t.claimRefLabel}: <strong>${claimRef}</strong></div>
        <div style="font-size:12px;color:#64748b;">${t.claimDateLabel}: <strong>${issueDate}</strong></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;font-size:12px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;">
        <div style="color:#065f46;font-weight:700;margin-bottom:6px;">${t.claimToLabel}</div>
        <div style="font-weight:700;font-size:14px;">${t.companyName}</div>
        <div style="color:#475569;margin-top:2px;">${isAr ? 'الإدارة المالية ومسيرات العمولات' : 'Finance & Commission Disbursement Dept.'}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;">
        <div style="color:#065f46;font-weight:700;margin-bottom:6px;">${t.claimFromLabel}</div>
        <div style="font-weight:700;font-size:14px;">${companyName}</div>
        <div style="color:#475569;margin-top:2px;">${isAr ? currentUser.nameAr : currentUser.nameEn} (${currentUser.brokerId})</div>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px;">
      <thead>
        <tr style="background:#065f46;color:#fff;">
          <th style="padding:10px 8px;">#</th>
          <th style="padding:10px 8px;">${t.dealRef}</th>
          <th style="padding:10px 8px;">${t.projectName}</th>
          <th style="padding:10px 8px;">${t.dealValue}</th>
          <th style="padding:10px 8px;">${t.commissionRate}</th>
          <th style="padding:10px 8px;">${t.netCommission}</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>

    <div style="display:flex;justify-content:flex-end;margin-bottom:22px;">
      <div style="width:280px;border:1px solid #e2e8f0;border-radius:10px;padding:12px;font-size:13px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span>${t.subtotalCommission}</span>
          <strong style="font-family:monospace;">${formatMoney(subtotal)} ${t.currency}</strong>
        </div>
        ${includeVat ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#475569;">
          <span>${t.vatAmount}</span>
          <strong style="font-family:monospace;">${formatMoney(vatValue)} ${t.currency}</strong>
        </div>` : ''}
        <div style="display:flex;justify-content:space-between;border-top:2px solid #065f46;padding-top:8px;margin-top:8px;font-size:15px;color:#065f46;">
          <strong>${t.grandTotalClaim}</strong>
          <strong style="font-family:monospace;">${formatMoney(grandTotal)} ${t.currency}</strong>
        </div>
      </div>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px;font-size:12px;margin-bottom:36px;">
      <div style="font-weight:700;color:#065f46;margin-bottom:4px;">${t.claimBankBoxTitle}</div>
      <div>${t.beneficiaryBank}: <strong>${bankName}</strong></div>
      <div>${t.beneficiaryIban}: <strong style="font-family:monospace;">${iban}</strong></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:40px;font-size:12px;text-align:center;">
      <div>
        <div style="font-weight:700;margin-bottom:48px;">${t.claimSignatureBeneficiary}</div>
        <div style="border-top:1px dashed #94a3b8;padding-top:6px;color:#64748b;">${companyName}</div>
      </div>
      <div>
        <div style="font-weight:700;margin-bottom:48px;">${t.claimSignatureOmran}</div>
        <div style="border-top:1px dashed #94a3b8;padding-top:6px;color:#64748b;">${t.companyName}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Omran_Commission_Claim_A4_${claimRef}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Modal Bar (hidden during print) */}
        <div className="no-print px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {t.claimModalTitle}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {claimRef} · {selectedDeals.length} {isAr ? 'صفقات مختارة' : 'selected deals'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadA4Html}
              disabled={selectedDeals.length === 0}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadA4File}</span>
            </button>

            <button
              onClick={handlePrintPdf}
              disabled={selectedDeals.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{t.downloadA4Pdf}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              aria-label={t.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Switcher: Edit vs A4 Preview */}
        <div className="no-print flex lg:hidden p-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 gap-1">
          <button
            onClick={() => setActiveMobileTab('edit')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeMobileTab === 'edit'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.claimStepEdit}
          </button>
          <button
            onClick={() => setActiveMobileTab('preview')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeMobileTab === 'preview'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.claimStepPreview}
          </button>
        </div>

        {/* Main Split Body: Left/Right Form + Live A4 Paper */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Panel: Company Details & Deal Calculator */}
          <div
            className={`no-print lg:col-span-5 overflow-y-auto p-4 sm:p-5 bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 space-y-5 ${
              activeMobileTab === 'edit' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Beneficiary Company Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>{t.beneficiarySection}</span>
              </h3>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t.beneficiaryCompany}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t.beneficiaryCR}
                  </label>
                  <input
                    type="text"
                    value={crNumber}
                    onChange={(e) => setCrNumber(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t.beneficiaryTax}
                  </label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t.beneficiaryBank}
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t.beneficiaryIban}
                </label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Select Deals */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{t.selectDealsForClaim}</span>
                </h3>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{t.includeVat}</span>
                </label>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pe-1">
                {commissions.map((deal) => {
                  const checked = selectedIds.includes(deal.id);
                  return (
                    <button
                      key={deal.id}
                      type="button"
                      onClick={() => toggleDeal(deal.id)}
                      className={`w-full text-start p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-colors ${
                        checked
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          checked ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                        }`}>
                          {checked && <Check className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">
                            {isAr ? deal.projectNameAr : deal.projectNameEn}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {deal.dealRef} · {deal.commissionRate}%
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                        {formatMoney(deal.commissionAmount)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Calculation Summary Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{t.subtotalCommission}</span>
                <span className="font-mono font-semibold">{formatMoney(subtotal)} {t.currency}</span>
              </div>
              {includeVat && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>{t.vatAmount}</span>
                  <span className="font-mono font-semibold">{formatMoney(vatValue)} {t.currency}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                <span>{t.grandTotalClaim}</span>
                <span className="font-mono">{formatMoney(grandTotal)} {t.currency}</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Official A4 Paper Preview (and Print Root) */}
          <div
            className={`lg:col-span-7 overflow-y-auto p-4 sm:p-6 bg-slate-200/80 dark:bg-slate-950 flex flex-col items-center ${
              activeMobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Actual A4 Sheet */}
            <div className="a4-print-root w-full max-w-[210mm] min-h-[260mm] bg-white text-slate-900 rounded-xl shadow-lg border border-slate-300 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                {/* A4 Letterhead */}
                <div className="flex items-start justify-between gap-4 border-b-2 border-emerald-800 pb-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-lg shrink-0">
                        ع
                      </div>
                      <div>
                        <h1 className="text-base sm:text-lg font-bold text-emerald-900 leading-tight">
                          {companyName}
                        </h1>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {t.beneficiaryCR}: <span className="font-mono">{crNumber}</span> · {t.beneficiaryTax}: <span className="font-mono">{taxNumber}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <div className="text-sm font-bold text-slate-900">{t.claimDocTitle}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {t.claimRefLabel}: <span className="font-mono font-bold text-slate-800">{claimRef}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {t.claimDateLabel}: <span className="font-mono font-semibold text-slate-800">{issueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Addressed To / Submitted By Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                      {t.claimToLabel}
                    </span>
                    <div className="font-bold text-slate-900 text-sm">{t.companyName}</div>
                    <div className="text-slate-600 mt-0.5">
                      {isAr ? 'الإدارة المالية ومسيرات العمولات' : 'Finance & Commission Disbursement Dept.'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                      {t.claimFromLabel}
                    </span>
                    <div className="font-bold text-slate-900 text-sm">{companyName}</div>
                    <div className="text-slate-600 mt-0.5">
                      {isAr ? currentUser.nameAr : currentUser.nameEn} · <span className="font-mono">{currentUser.brokerId}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {t.licenseNumber}: <span className="font-mono">{currentUser.licenseNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Itemized Commissions Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-emerald-800 text-white">
                        <th className="py-2.5 px-2 text-center font-semibold">#</th>
                        <th className="py-2.5 px-2 text-start font-semibold">{t.dealRef}</th>
                        <th className="py-2.5 px-2 text-start font-semibold">{t.projectName}</th>
                        <th className="py-2.5 px-2 text-end font-semibold">{t.dealValue}</th>
                        <th className="py-2.5 px-2 text-center font-semibold">%</th>
                        <th className="py-2.5 px-2 text-end font-semibold">{t.netCommission}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedDeals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            {isAr ? 'يرجى اختيار صفقة واحدة على الأقل لحساب المطالبة' : 'Please select at least one deal'}
                          </td>
                        </tr>
                      ) : (
                        selectedDeals.map((deal, index) => (
                          <tr key={deal.id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-2 text-center text-slate-500">{index + 1}</td>
                            <td className="py-2.5 px-2 font-mono font-medium text-slate-700">{deal.dealRef}</td>
                            <td className="py-2.5 px-2">
                              <div className="font-semibold text-slate-900">
                                {isAr ? deal.projectNameAr : deal.projectNameEn}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {deal.unitNumber} · {deal.clientName}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-end font-mono tabular-nums text-slate-700">
                              {formatMoney(deal.dealAmount)}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                              {deal.commissionRate}%
                            </td>
                            <td className="py-2.5 px-2 text-end font-mono tabular-nums font-bold text-slate-900">
                              {formatMoney(deal.commissionAmount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals Block */}
                <div className="flex justify-end mb-6">
                  <div className="w-full sm:w-72 rounded-xl border border-slate-200 p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{t.subtotalCommission}</span>
                      <span className="font-mono font-semibold tabular-nums">
                        {formatMoney(subtotal)} {t.currency}
                      </span>
                    </div>
                    {includeVat && (
                      <div className="flex justify-between text-slate-600">
                        <span>{t.vatAmount}</span>
                        <span className="font-mono font-semibold tabular-nums">
                          {formatMoney(vatValue)} {t.currency}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t-2 border-emerald-800 text-sm font-bold text-emerald-900">
                      <span>{t.grandTotalClaim}</span>
                      <span className="font-mono tabular-nums">
                        {formatMoney(grandTotal)} {t.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Transfer Details Box */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="font-bold text-emerald-900">{t.claimBankBoxTitle}</div>
                  <div className="text-slate-700">
                    {t.beneficiaryBank}: <strong className="text-slate-900">{bankName}</strong>
                  </div>
                  <div className="text-slate-700">
                    {t.beneficiaryIban}: <strong className="font-mono text-slate-900">{iban}</strong>
                  </div>
                </div>
              </div>

              {/* Signatures & Stamp Footer */}
              <div className="grid grid-cols-2 gap-8 pt-10 mt-8 text-xs text-center">
                <div>
                  <div className="font-bold text-slate-800 mb-12">{t.claimSignatureBeneficiary}</div>
                  <div className="border-t border-dashed border-slate-400 pt-1.5 text-slate-500">
                    {companyName}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-800 mb-12">{t.claimSignatureOmran}</div>
                  <div className="border-t border-dashed border-slate-400 pt-1.5 text-slate-500">
                    {t.companyName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
