import React, { useState } from 'react';
import { 
  MessageSquarePlus, Calendar, Clock, MapPin, Video, 
  Send, AlertCircle, CheckCircle, ChevronDown, 
  Building, ShieldAlert, Sparkles, Filter
} from 'lucide-react';
import { ComplaintRequest, Language, RequestType, RequestPriority } from '../types';
import { translations } from '../localization/translations';
import { submitComplaintRequest } from '../services/apiService';
import confetti from 'canvas-confetti';

interface RequestsViewProps {
  complaints: ComplaintRequest[];
  lang: Language;
  brokerId: string;
  onRefresh: () => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  complaints,
  lang,
  brokerId,
  onRefresh,
}) => {
  const t = translations[lang];

  // Form State
  const [requestType, setRequestType] = useState<RequestType>('appointment');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(t.catCommissionDelay);
  const [department, setDepartment] = useState(t.deptSales);
  const [preferredDate, setPreferredDate] = useState('2026-11-18');
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [meetingFormat, setMeetingFormat] = useState<'hq' | 'virtual'>('hq');
  const [priority, setPriority] = useState<RequestPriority>('normal');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'appointment' | 'complaint'>('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await submitComplaintRequest({
        brokerId,
        type: requestType,
        title: title.trim(),
        categoryAr: category,
        categoryEn: category,
        description: description.trim(),
        preferredDate: requestType === 'appointment' ? preferredDate : undefined,
        preferredTime: requestType === 'appointment' ? preferredTime : undefined,
        meetingFormat: requestType === 'appointment' ? meetingFormat : undefined,
        departmentAr: department,
        departmentEn: department,
        priority,
      });

      // Clear Form
      setTitle('');
      setDescription('');
      setShowSuccessBanner(true);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      onRefresh();
      setTimeout(() => setShowSuccessBanner(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = complaints.filter(c => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Screen Title Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
          <MessageSquarePlus className="w-4 h-4" />
          <span>{t.companyName}</span>
          <span aria-hidden="true">·</span>
          <span>{t.omranBroker}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {t.requestsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.requestsSubtitle}
        </p>
      </div>

      {/* Success Notification Alert */}
      {showSuccessBanner && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="flex-1">
            <strong className="block font-semibold">{t.submitSuccess}</strong>
            <span className="text-[11px] opacity-90">
              {lang === 'ar' ? 'تمت إضافة السجل إلى جدول Complaints في Google Sheets.' : 'Synced directly with Google Sheets "Complaints" table.'}
            </span>
          </div>
        </div>
      )}

      {/* New Request Creation Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t.newRequestBtn}</span>
        </h2>

        {/* Type Switcher: Appointment Request vs Complaint */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setRequestType('appointment')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              requestType === 'appointment'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.tabAppointment}</span>
          </button>
          <button
            type="button"
            onClick={() => setRequestType('complaint')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              requestType === 'complaint'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t.tabComplaint}</span>
          </button>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Subject Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.requestTitle} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={requestType === 'appointment' 
                ? (lang === 'ar' ? 'مثال: طلب مقابلة مع مدير المبيعات بشأن صفقات برج هايتس' : 'e.g., Meeting request with Sales Director regarding Heights deals')
                : (lang === 'ar' ? 'مثال: استفسار عن تحويل عمولة الصفقة OMR-DL-4921' : 'e.g., Inquiry regarding payment transfer for deal OMR-DL-4921')}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Department & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.department}
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value={t.deptSales}>{t.deptSales}</option>
                <option value={t.deptFinance}>{t.deptFinance}</option>
                <option value={t.deptExecutive}>{t.deptExecutive}</option>
                <option value={t.deptLegal}>{t.deptLegal}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value={t.catCommissionDelay}>{t.catCommissionDelay}</option>
                <option value={t.catContractReview}>{t.catContractReview}</option>
                <option value={t.catPartnership}>{t.catPartnership}</option>
                <option value={t.catGeneralSupport}>{t.catGeneralSupport}</option>
              </select>
            </div>
          </div>

          {/* Appointment-specific Fields: Date, Time & Meeting Format */}
          {requestType === 'appointment' && (
            <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                {lang === 'ar' ? 'تنسيق المقابلة والوقت المقترح:' : 'Appointment Logistics & Preferred Schedule:'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {t.preferredDate}
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {t.preferredTime}
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="10:00 AM">10:00 AM - الصباح الباكر</option>
                    <option value="11:30 AM">11:30 AM - قبل الظهر</option>
                    <option value="02:00 PM">02:00 PM - بعد الظهر</option>
                    <option value="04:00 PM">04:00 PM - الفترة المسائية</option>
                  </select>
                </div>
              </div>

              {/* Meeting Venue Format */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t.meetingFormat}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMeetingFormat('hq')}
                    className={`p-2.5 rounded-xl border text-start flex items-center gap-2 transition-colors ${
                      meetingFormat === 'hq'
                        ? 'border-emerald-600 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="leading-tight">{t.meetingHq}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMeetingFormat('virtual')}
                    className={`p-2.5 rounded-xl border text-start flex items-center gap-2 transition-colors ${
                      meetingFormat === 'virtual'
                        ? 'border-emerald-600 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="leading-tight">{t.meetingVirtual}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.priority}
            </label>
            <div className="flex gap-2">
              {(['normal', 'high', 'urgent'] as RequestPriority[]).map((p) => {
                const isSelected = priority === p;
                const label = p === 'normal' ? t.priorityNormal : p === 'high' ? t.priorityHigh : t.priorityUrgent;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
                      isSelected
                        ? p === 'urgent'
                          ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold'
                          : p === 'high'
                          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-700 dark:text-amber-300 font-semibold'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.description} <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-60"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
            <span>{isSubmitting ? t.loading : t.submit}</span>
          </button>
        </form>
      </div>

      {/* History of Past Requests & Appointments */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{t.trackRequestsTitle}</span>
          </h2>

          {/* Filter pill tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterType === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setFilterType('appointment')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterType === 'appointment' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              {lang === 'ar' ? 'المقابلات' : 'Appointments'}
            </button>
            <button
              onClick={() => setFilterType('complaint')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterType === 'complaint' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              {lang === 'ar' ? 'الشكاوى' : 'Inquiries'}
            </button>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.noRequestsYet}</p>
          </div>
        ) : (
          filteredList.map((req) => {
            const isAppointment = req.type === 'appointment';
            const statusLabel = 
              req.status === 'submitted' ? t.reqStatusSubmitted :
              req.status === 'in_review' ? t.reqStatusInReview :
              req.status === 'scheduled' ? t.reqStatusScheduled :
              req.status === 'resolved' ? t.reqStatusResolved : t.reqStatusRejected;

            const statusColor = 
              req.status === 'scheduled' || req.status === 'resolved' ? 'text-emerald-700 dark:text-emerald-400 font-semibold' :
              req.status === 'in_review' ? 'text-amber-700 dark:text-amber-400 font-semibold' :
              'text-slate-600 dark:text-slate-400';

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors"
              >
                {/* Unboxed Metadata row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{req.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {isAppointment ? t.tabAppointment : t.tabComplaint}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>

                  <span className={`text-xs ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {req.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {req.description}
                </p>

                {/* Logistics Strip for Appointments */}
                {isAppointment && (req.preferredDate || req.preferredTime) && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex flex-wrap items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono">{req.preferredDate}</span>
                    </div>
                    {req.preferredTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{req.preferredTime}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      {req.meetingFormat === 'hq' ? (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{lang === 'ar' ? 'مقر عمران الرئيسي' : 'Omran HQ'}</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Google Meet</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Official Omran Feedback if exists */}
                {(req.adminFeedbackAr || req.adminFeedbackEn) && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/50 text-xs space-y-1">
                    <strong className="text-emerald-800 dark:text-emerald-300 block font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.adminFeedback}</span>
                    </strong>
                    <p className="text-emerald-900 dark:text-emerald-100/90 leading-relaxed">
                      {lang === 'ar' ? req.adminFeedbackAr : req.adminFeedbackEn}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
