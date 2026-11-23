'use client';

import React, { useId, useState } from 'react';
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { getWhatsAppUrl } from '@/data/haswakarya-data';
import { submitSeafarerApplication } from '@/lib/public/seafarerApplication';

export interface SeafarerApplicationFormProps {
  /** Rank awal yang sudah terpilih saat formulir dibuka. */
  defaultRank?: string;
}

const INITIAL_FORM = {
  fullName: '',
  phoneWhatsApp: '',
  email: '',
  seamanBookNo: '',
  departmentRank: 'Third Officer (Mualim III)',
  cocClass: 'Class III (ANT-III / ATT-III) Operational',
  marlinsScore: '80% – 89% (Verified Standard)',
  seaTimeMonths: '12 – 24 Months',
  vesselTypeExperience: 'Oil & Chemical Tanker (SIRE)',
  readinessDate: 'Immediate (Within 7 Days)',
  additionalNotes: '',
};

const inputClass =
  'w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition';

const labelClass = 'block text-[11px] font-bold text-navy uppercase tracking-wider mb-1.5';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ id, label, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export function SeafarerApplicationForm({ defaultRank }: SeafarerApplicationFormProps) {
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM,
    departmentRank: defaultRank || INITIAL_FORM.departmentRank,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    applicationId: string;
    seamanBookNo: string;
  } | null>(null);

  const update = (name: keyof typeof INITIAL_FORM, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const buildApplicationDispatch = (appId?: string) => {
    return `*OFFICIAL SEAFARER CANDIDATE DOSSIER*
----------------------------------------
*Tracking Ref:* ${appId ? `#${appId.slice(0, 8)}` : 'Submitted to H-COS DB'}
*Candidate Name:* ${formData.fullName || 'Not specified'}
*WhatsApp / Phone:* ${formData.phoneWhatsApp || '-'}
*Email:* ${formData.email || '-'}
*Seaman Book / SID Ref:* ${formData.seamanBookNo || 'Registered Online'}

*MARITIME QUALIFICATIONS & COMPETENCY:*
• *Target Rank:* ${formData.departmentRank}
• *Certificate of Competency (CoC):* ${formData.cocClass}
• *Marlins English Benchmark:* ${formData.marlinsScore}
• *Documented Sea-Time:* ${formData.seaTimeMonths}
• *Primary Vessel Experience:* ${formData.vesselTypeExperience}
• *Availability / Ready-to-Board:* ${formData.readinessDate}
${formData.additionalNotes ? `• *Endorsements & Notes:* ${formData.additionalNotes}` : ''}
----------------------------------------
_Dispatched via Haswakarya Seafarer Career Portal (100% Zero Placement Fee • Permenhub PM 59/2021 & MLC 2006 Reg 1.4.5)_`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const outcome = await submitSeafarerApplication(formData);

      if (outcome.status === 'ok') {
        setSubmissionSuccess(outcome.receipt);
      } else {
        setErrorMessage(outcome.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatchWhatsApp = () => {
    const message = buildApplicationDispatch(submissionSuccess?.applicationId);
    window.open(getWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  const handleReset = () => {
    setSubmissionSuccess(null);
    setErrorMessage(null);
    setFormData({ ...INITIAL_FORM, departmentRank: defaultRank || INITIAL_FORM.departmentRank });
  };

  if (submissionSuccess) {
    return (
      <div
        className="p-6 sm:p-10 text-center space-y-5 animate-in fade-in duration-200"
        role="status"
        aria-live="polite"
      >
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-navy">
            Dossier Registered in the H-COS Database
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Your competency profile now sits in the Haswakarya ATS queue and is being reviewed by our
            Crewing Team.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
          <div className="flex justify-between gap-3">
            <span className="text-slate-500 font-sans">Application ID:</span>
            <span className="font-bold text-navy">#{submissionSuccess.applicationId.slice(0, 12)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500 font-sans">Seaman Book / SID:</span>
            <span className="font-bold text-navy">{submissionSuccess.seamanBookNo}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500 font-sans">Target Rank:</span>
            <span className="font-bold text-primary">{formData.departmentRank}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500 font-sans">ATS Status:</span>
            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
              APPLIED (Stage 1)
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <button
            type="button"
            onClick={handleDispatchWhatsApp}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Notification via WhatsApp Hotline</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-semibold text-xs border border-slate-300 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Submit Another Application</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <div className="flex items-start gap-2.5 rounded-xl border border-sky/40 bg-ice/40 p-3.5 text-[11px] text-navy">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>
          Your dossier goes straight to the H-COS ATS. Fields marked <strong>*</strong> are required.
        </span>
      </div>

      {errorMessage && (
        <div
          className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-medium"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id={fieldId('fullName')} label="Full Name (as printed in Seaman Book) *">
          <input
            id={fieldId('fullName')}
            name="fullName"
            type="text"
            required
            autoComplete="name"
            placeholder="e.g. Capt. Hendra Gunawan"
            value={formData.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field id={fieldId('phoneWhatsApp')} label="WhatsApp Number (Active Hotline) *">
          <input
            id={fieldId('phoneWhatsApp')}
            name="phoneWhatsApp"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+62 812-xxxx-xxxx"
            value={formData.phoneWhatsApp}
            onChange={(e) => update('phoneWhatsApp', e.target.value)}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field id={fieldId('email')} label="Personal Email Address *">
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="seafarer@email.com"
            value={formData.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field id={fieldId('seamanBookNo')} label="Seaman Book No. / SID Number">
          <input
            id={fieldId('seamanBookNo')}
            name="seamanBookNo"
            type="text"
            placeholder="e.g. C.0123456 (Hubla RI)"
            value={formData.seamanBookNo}
            onChange={(e) => update('seamanBookNo', e.target.value)}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field id={fieldId('departmentRank')} label="Applying Rank / Department *">
          <select
            id={fieldId('departmentRank')}
            name="departmentRank"
            required
            value={formData.departmentRank}
            onChange={(e) => update('departmentRank', e.target.value)}
            className={`${inputClass} font-medium`}
          >
            <optgroup label="Deck Department">
              <option value="Master (Nakhoda)">Master (Nakhoda) - ANT I</option>
              <option value="Chief Officer (Mualim I)">Chief Officer (Mualim I) - ANT II</option>
              <option value="Second Officer (Mualim II)">Second Officer (Mualim II) - ANT III</option>
              <option value="Third Officer (Mualim III)">Third Officer (Mualim III) - ANT III</option>
              <option value="Bosun (Serang)">Bosun (Serang)</option>
              <option value="Able Seaman (Juru Mudi)">Able Seaman (Juru Mudi)</option>
            </optgroup>
            <optgroup label="Engine Department">
              <option value="Chief Engineer (KKM)">Chief Engineer (KKM) - ATT I</option>
              <option value="Second Engineer (Masinis II)">Second Engineer (Masinis II) - ATT II</option>
              <option value="Third Engineer (Masinis III)">Third Engineer (Masinis III) - ATT III</option>
              <option value="Oiler (Juru Minyak)">Oiler (Juru Minyak)</option>
            </optgroup>
            <optgroup label="Catering & Support">
              <option value="Chief Cook (Koki Kapal)">Chief Cook (Koki Kapal)</option>
            </optgroup>
          </select>
        </Field>

        <Field id={fieldId('cocClass')} label="Certificate of Competency (CoC)">
          <select
            id={fieldId('cocClass')}
            name="cocClass"
            value={formData.cocClass}
            onChange={(e) => update('cocClass', e.target.value)}
            className={`${inputClass} font-medium`}
          >
            <option value="Class I (ANT-I / ATT-I) Management">
              Class I (ANT-I / ATT-I) Management
            </option>
            <option value="Class II (ANT-II / ATT-II) Management">
              Class II (ANT-II / ATT-II) Management
            </option>
            <option value="Class III (ANT-III / ATT-III) Operational">
              Class III (ANT-III / ATT-III) Operational
            </option>
            <option value="Class IV / V (ANT-IV / ANT-V) Near Coastal">
              Class IV / V (ANT-IV / ANT-V) Near Coastal
            </option>
            <option value="Rating Able Seafarer (STCW II/5 or III/5)">
              Rating Able Seafarer (STCW II/5 or III/5)
            </option>
          </select>
        </Field>

        <Field id={fieldId('marlinsScore')} label="Marlins English Benchmark">
          <select
            id={fieldId('marlinsScore')}
            name="marlinsScore"
            value={formData.marlinsScore}
            onChange={(e) => update('marlinsScore', e.target.value)}
            className={`${inputClass} font-medium`}
          >
            <option value="90% – 100% (High Proficiency)">90% – 100% (High Proficiency)</option>
            <option value="80% – 89% (Verified Standard)">80% – 89% (Verified Standard)</option>
            <option value="70% – 79% (Operational Level)">70% – 79% (Operational Level)</option>
            <option value="Ready to take Haswakarya Marlins Test">
              Ready to take Haswakarya Marlins Test
            </option>
          </select>
        </Field>

        <Field id={fieldId('vesselTypeExperience')} label="Primary Vessel Experience">
          <select
            id={fieldId('vesselTypeExperience')}
            name="vesselTypeExperience"
            value={formData.vesselTypeExperience}
            onChange={(e) => update('vesselTypeExperience', e.target.value)}
            className={`${inputClass} font-medium`}
          >
            <option value="Oil & Chemical Tanker (SIRE)">Oil &amp; Chemical Tanker (SIRE)</option>
            <option value="Dry Bulk Carrier (RightShip)">Dry Bulk Carrier (RightShip)</option>
            <option value="Container Vessel (Boxship)">Container Vessel (Boxship)</option>
            <option value="Harbor & Ocean ASD Tugboat">Harbor &amp; Ocean ASD Tugboat</option>
            <option value="Offshore AHTS / Supply Vessel">Offshore AHTS / Supply Vessel</option>
          </select>
        </Field>

        <Field id={fieldId('seaTimeMonths')} label="Documented Sea-Time Experience">
          <select
            id={fieldId('seaTimeMonths')}
            name="seaTimeMonths"
            value={formData.seaTimeMonths}
            onChange={(e) => update('seaTimeMonths', e.target.value)}
            className={`${inputClass} font-medium`}
          >
            <option value="More than 36 Months">More than 36 Months</option>
            <option value="24 – 36 Months">24 – 36 Months</option>
            <option value="12 – 24 Months">12 – 24 Months</option>
            <option value="Under 12 Months (Junior / Rating)">Under 12 Months (Junior / Rating)</option>
          </select>
        </Field>

        <Field id={fieldId('readinessDate')} label="Readiness Date (Ready to Join)">
          <select
            id={fieldId('readinessDate')}
            name="readinessDate"
            value={formData.readinessDate}
            onChange={(e) => update('readinessDate', e.target.value)}
            className={`${inputClass} font-medium`}
          >
            <option value="Immediate (Within 7 Days)">Immediate (Within 7 Days)</option>
            <option value="Within 14 – 30 Days">Within 14 – 30 Days</option>
            <option value="Next Month (Notice Period)">Next Month (Notice Period)</option>
          </select>
        </Field>
      </div>

      <Field
        id={fieldId('additionalNotes')}
        label="Specific Endorsements / Visas / Notes"
        hint="US C1/D visa, flag-state endorsements, tanker familiarization (OTF/CTF), GMDSS, etc."
      >
        <input
          id={fieldId('additionalNotes')}
          name="additionalNotes"
          type="text"
          placeholder="e.g. Valid US C1/D Visa, Panama Endorsement, OTF/CTF"
          value={formData.additionalNotes}
          onChange={(e) => update('additionalNotes', e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-[11px] text-emerald-800">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          <strong>Zero Placement Fee.</strong> Sesuai Permenhub PM 59/2021 dan ILO MLC 2006 Reg
          1.4.5, pelaut tidak dipungut biaya pendaftaran maupun penempatan.
        </span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Registering dossier to the ATS database…</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Register My Dossier to the ATS</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </>
        )}
      </button>
    </form>
  );
}

export default SeafarerApplicationForm;