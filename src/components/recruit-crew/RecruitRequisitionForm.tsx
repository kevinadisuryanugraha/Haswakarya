'use client';

import React, { useId, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
  Ship,
} from 'lucide-react';
import { getWhatsAppUrl } from '@/data/haswakarya-data';
import {
  CREW_SCOPE_OPTIONS,
  DEFAULT_CREW_SCOPE,
  DEFAULT_FLAG,
  DEFAULT_MOBILIZATION,
  DEFAULT_VESSEL_TYPE,
  FLAG_OPTIONS,
  MOBILIZATION_OPTIONS,
  VESSEL_OPTIONS,
  submitManningRequisition,
} from '@/lib/public/manningRequisition';

export interface RecruitRequisitionFormProps {
  /** Vessel type yang sudah terpilih dari query `?vessel=` atau kartu armada. */
  defaultVesselType?: string;
}

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

function buildInitialForm(defaultVesselType?: string) {
  return {
    companyName: '',
    contactPerson: '',
    workEmail: '',
    phoneWhatsApp: '',
    vesselName: '',
    imoNumber: '',
    vesselType: defaultVesselType || DEFAULT_VESSEL_TYPE,
    crewScope: DEFAULT_CREW_SCOPE,
    vesselFlag: DEFAULT_FLAG,
    mobilization: DEFAULT_MOBILIZATION,
    joinPort: '',
    expectedJoiningDate: '',
    additionalNotes: '',
  };
}

export function RecruitRequisitionForm({ defaultVesselType }: RecruitRequisitionFormProps) {
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

  const [formData, setFormData] = useState(() => buildInitialForm(defaultVesselType));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ inquiryId: string } | null>(null);

  const update = (name: keyof ReturnType<typeof buildInitialForm>, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const outcome = await submitManningRequisition({
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        workEmail: formData.workEmail,
        phoneWhatsApp: formData.phoneWhatsApp,
        vesselName: formData.vesselName,
        imoNumber: formData.imoNumber,
        vesselType: formData.vesselType,
        targetRanks: formData.crewScope,
        joinPort: formData.joinPort,
        expectedJoiningDate: formData.expectedJoiningDate,
        notes: [
          `Flag state: ${formData.vesselFlag}`,
          `Mobilization window: ${formData.mobilization}`,
          formData.additionalNotes ? `Notes: ${formData.additionalNotes}` : '',
        ]
          .filter(Boolean)
          .join('. '),
      });

      if (outcome.status === 'ok') {
        setReceipt(outcome.receipt);
      } else {
        setErrorMessage(outcome.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatchWhatsApp = () => {
    const message = `*OFFICIAL FLEET MANNING REQUISITION*
----------------------------------------
*Requisition Ref:* ${receipt ? `#${receipt.inquiryId.slice(0, 8)}` : 'Registered to H-COS DB'}
*Company / Principal:* ${formData.companyName || 'Not specified'}
*Representative:* ${formData.contactPerson || 'Shipowner Representative'}
*Contact Email / Phone:* ${formData.workEmail || '-'} / ${formData.phoneWhatsApp || '-'}

*VESSEL & CREW SPECIFICATIONS:*
• *Vessel:* ${formData.vesselName || '-'}${formData.imoNumber ? ` (IMO ${formData.imoNumber})` : ''}
• *Vessel Type:* ${formData.vesselType}
• *Crew Scope Required:* ${formData.crewScope}
• *Flag State:* ${formData.vesselFlag}
• *Joining Port:* ${formData.joinPort || 'To be agreed'}
• *Target Joining Date:* ${formData.expectedJoiningDate || formData.mobilization}
${formData.additionalNotes ? `• *Special Requirements:* ${formData.additionalNotes}` : ''}
----------------------------------------
_Dispatched via Haswakarya Crew Agency Requisition Desk (SIUKAK & MLC 2006 Compliant)_`;

    window.open(getWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  const handleReset = () => {
    setReceipt(null);
    setErrorMessage(null);
    setFormData(buildInitialForm(defaultVesselType));
  };

  if (receipt) {
    return (
      <div className="p-2 sm:p-4 text-center space-y-5" role="status" aria-live="polite">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-navy">Requisition registered in H-COS</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Your manning request is now queued for the Haswakarya crewing desk. A superintendent will
            reply with a shortlist, rate sheet, and mobilization plan.
          </p>
        </div>

        <dl className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500 font-sans">Requisition ref:</dt>
            <dd className="font-bold text-navy">#{receipt.inquiryId.slice(0, 8)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500 font-sans">Company:</dt>
            <dd className="font-bold text-navy text-right">{formData.companyName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500 font-sans">Vessel:</dt>
            <dd className="font-bold text-navy text-right">{formData.vesselName || 'To be confirmed'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500 font-sans">Crew scope:</dt>
            <dd className="font-bold text-primary text-right">{formData.crewScope}</dd>
          </div>
          <div className="flex justify-between gap-3 items-center">
            <dt className="text-slate-500 font-sans">Status:</dt>
            <dd className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
              NEW (Queued)
            </dd>
          </div>
        </dl>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <button
            type="button"
            onClick={handleDispatchWhatsApp}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send copy to the crewing desk</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-semibold text-xs border border-slate-300 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Submit another requisition</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start gap-2.5 rounded-xl border border-sky/40 bg-ice/40 p-3.5 text-[11px] text-navy">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>
          This request is written straight into the H-COS requisition queue. Fields marked{' '}
          <strong>*</strong> are required.
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
        <Field id={fieldId('companyName')} label="Shipowner / Management Company *">
          <input
            id={fieldId('companyName')}
            name="companyName"
            type="text"
            required
            autoComplete="organization"
            placeholder="e.g. Samudera Shipping Lines"
            value={formData.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field id={fieldId('contactPerson')} label="Representative Name *">
          <input
            id={fieldId('contactPerson')}
            name="contactPerson"
            type="text"
            required
            autoComplete="name"
            placeholder="e.g. Capt. Michael Tan (Crew Manager)"
            value={formData.contactPerson}
            onChange={(e) => update('contactPerson', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field id={fieldId('workEmail')} label="Corporate Work Email *">
          <input
            id={fieldId('workEmail')}
            name="workEmail"
            type="email"
            required
            autoComplete="email"
            placeholder="crewing@shipowner.com"
            value={formData.workEmail}
            onChange={(e) => update('workEmail', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field id={fieldId('phoneWhatsApp')} label="Direct Phone / WhatsApp">
          <input
            id={fieldId('phoneWhatsApp')}
            name="phoneWhatsApp"
            type="tel"
            autoComplete="tel"
            placeholder="+65 9123 4567"
            value={formData.phoneWhatsApp}
            onChange={(e) => update('phoneWhatsApp', e.target.value)}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field id={fieldId('vesselName')} label="Vessel Name">
          <input
            id={fieldId('vesselName')}
            name="vesselName"
            type="text"
            placeholder="e.g. MT Samudera Biru"
            value={formData.vesselName}
            onChange={(e) => update('vesselName', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field id={fieldId('imoNumber')} label="IMO Number" hint="7 digits, tanpa prefix IMO.">
          <input
            id={fieldId('imoNumber')}
            name="imoNumber"
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="e.g. 9412345"
            value={formData.imoNumber}
            onChange={(e) => update('imoNumber', e.target.value)}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field id={fieldId('vesselType')} label="Vessel Type">
          <select
            id={fieldId('vesselType')}
            name="vesselType"
            value={formData.vesselType}
            onChange={(e) => update('vesselType', e.target.value)}
            className={inputClass}
          >
            {VESSEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field id={fieldId('crewScope')} label="Crew Manning Scope">
          <select
            id={fieldId('crewScope')}
            name="crewScope"
            value={formData.crewScope}
            onChange={(e) => update('crewScope', e.target.value)}
            className={inputClass}
          >
            {CREW_SCOPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field id={fieldId('vesselFlag')} label="Flag State Administration">
          <select
            id={fieldId('vesselFlag')}
            name="vesselFlag"
            value={formData.vesselFlag}
            onChange={(e) => update('vesselFlag', e.target.value)}
            className={inputClass}
          >
            {FLAG_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field id={fieldId('joinPort')} label="Joining Port">
          <input
            id={fieldId('joinPort')}
            name="joinPort"
            type="text"
            placeholder="e.g. Batam / Singapore OPL / Tanjung Priok"
            value={formData.joinPort}
            onChange={(e) => update('joinPort', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          id={fieldId('expectedJoiningDate')}
          label="Target Joining Date"
          hint="Boleh dikosongkan bila masih negosiasi."
        >
          <input
            id={fieldId('expectedJoiningDate')}
            name="expectedJoiningDate"
            type="date"
            value={formData.expectedJoiningDate}
            onChange={(e) => update('expectedJoiningDate', e.target.value)}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field id={fieldId('mobilization')} label="Mobilization Window">
          <select
            id={fieldId('mobilization')}
            name="mobilization"
            value={formData.mobilization}
            onChange={(e) => update('mobilization', e.target.value)}
            className={inputClass}
          >
            {MOBILIZATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        id={fieldId('additionalNotes')}
        label="Special Requirements"
        hint="Vetting standard, nationalities allowed, wage scale, contract length."
      >
        <textarea
          id={fieldId('additionalNotes')}
          name="additionalNotes"
          rows={3}
          maxLength={1000}
          placeholder="e.g. SIRE 2.0 vetting required, mixed nationality officers, 9-month contract."
          value={formData.additionalNotes}
          onChange={(e) => update('additionalNotes', e.target.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div className="p-3 bg-ice/40 rounded-xl border border-primary/20 flex items-start gap-2.5 text-[11px] text-navy">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>
          <strong>14-day performance warranty.</strong> If a placed crew member fails your competency
          evaluation or the master&apos;s handover assessment, Haswakarya replaces the seafarer with no
          additional agency fee.
        </span>
      </div>

      <div className="pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registering requisition in H-COS…</span>
            </>
          ) : (
            <>
              <Ship className="w-4 h-4" />
              <span>Register requisition</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default RecruitRequisitionForm;