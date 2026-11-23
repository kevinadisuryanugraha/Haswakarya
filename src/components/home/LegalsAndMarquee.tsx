'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LEGAL_CREDENTIALS, MARITIME_STANDARDS_DETAILED, COMPANY_INFO } from '@/data/haswakarya-data';
import { X, ZoomIn, Shield, ShieldCheck, FileCheck2, Award, ExternalLink, CheckCircle2 } from 'lucide-react';

export function LegalModalViewer() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const activeCredential = LEGAL_CREDENTIALS.find((c) => c.id === openItem);

  return (
    <>
      <section id="legals" className="py-20 bg-surface relative overflow-hidden scroll-mt-24 md:scroll-mt-28">
        {/* Grainient Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-grain opacity-40 z-0" aria-hidden="true" />

        <div className="site-container relative z-10">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="soe-tag mb-4 inline-block text-xs tracking-widest uppercase shadow-xs">Legal Certifications</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4">
              Certified, Licensed &amp; Fully Compliant
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Every aspect of our operations is backed by official government authorizations and strict international maritime standards.
            </p>
          </div>

          {/* Credentials grid with HorizonX cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {LEGAL_CREDENTIALS.map((cred) => (
              <div
                key={cred.id}
                className="horizonx-card rounded-2xl p-7 cursor-pointer relative overflow-hidden group"
                onClick={() => setOpenItem(cred.id)}
              >
                <div className="flex items-start justify-between mb-5">
                  <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-md font-mono">
                    <Shield className="w-3.5 h-3.5" />
                    {cred.code}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md ${
                    cred.status.includes('Active') || cred.status.includes('Compliant')
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" /> {cred.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-navy mb-2 leading-tight group-hover:text-primary transition-colors duration-300">
                  {cred.name}
                </h3>
                <p className="text-xs text-primary font-semibold mb-3">{cred.authority}</p>
                {cred.referenceNumber && (
                  <p className="text-xs text-muted font-mono bg-surface px-2.5 py-1 rounded border border-border-light mb-3 inline-block">
                    Ref: {cred.referenceNumber}
                  </p>
                )}
                <p className="text-sm text-muted leading-relaxed mb-5">{cred.description}</p>

                <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:text-accent transition-colors duration-300">
                  <ZoomIn className="w-4 h-4" />
                  <span>View Document Preview</span>
                </div>
              </div>
            ))}
          </div>

          {/* Winston Regulatory Explainer Callout: SIUKAK & MLC 2006 Standard */}
          <div className="mb-10 p-5 sm:p-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                    Indonesian Maritime Legal Framework
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-navy">
                    Regulatory Transition: SIUPPAK to SIUKAK Authorization
                  </h4>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                Permenhub PM 59/2021 &amp; PP 31/2021
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted leading-relaxed mb-4">
              Under modern Indonesian maritime regulations enacted by the Ministry of Transportation (Kemenhub RI), 
              the crewing license was officially modernized into <strong>SIUKAK</strong> (<em>Surat Izin Usaha Keagenan Awak Kapal</em>). 
              PT Haswakarya Andalan Sedare operates under full SIUKAK authorization and OSS Risk-Based NIB, guaranteeing international vessel owners complete compliance against Port State Control (PSC) crewing detentions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tripartite PKL Syahbandar Endorsement</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Fee to Seafarers (MLC 2006 Reg 1.4)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>P&amp;I Club Medical &amp; Repatriation Shield</span>
              </div>
            </div>
          </div>

          {/* NIB highlight banner with HorizonX Dark */}
          <div className="horizonx-card-dark rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 border border-white/20">
            <div className="flex-shrink-0 relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary border-2 border-sky/40 flex items-center justify-center shadow-md">
                <Award className="w-8 h-8 text-ice" />
              </div>
            </div>
            <div className="flex-grow text-center md:text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/20 text-sky text-[10px] font-mono uppercase tracking-wider mb-2">
                Official Government Entity
              </div>
              <h3 className="text-xl font-extrabold text-white mb-1 font-mono tracking-tight">NIB: {COMPANY_INFO.nib}</h3>
              <p className="text-slate-300 text-sm">
                PT HASWAKARYA ANDALAN SEDARE — Registered on OSS Berbasis Risiko, Pemerintah Republik Indonesia
              </p>
            </div>
            <a
              href={`https://oss.go.id/`}
              target="_blank"
              rel="noopener noreferrer"
              className="shimmer-btn flex-shrink-0 flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all relative z-10"
            >
              <ExternalLink className="w-4 h-4" />
              Verify on OSS
            </a>
          </div>
        </div>
      </section>

      {/* Modal */}
      {openItem && activeCredential && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setOpenItem(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-border-light">
              <div>
                <span className="soe-tag text-xs tracking-widest uppercase mb-2 inline-block">{activeCredential.code}</span>
                <h3 id="legal-modal-title" className="text-lg font-bold text-navy leading-tight">{activeCredential.name}</h3>
              </div>
              <button
                onClick={() => setOpenItem(null)}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            {/* Official Document Preview Frame */}
            <div className="p-6 bg-slate-50 border-b border-border-light flex flex-col items-center justify-center">
              <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-center">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 text-[10px] text-slate-500 font-mono">
                  <span>GOVERNMENT OF INDONESIA / ILO</span>
                  <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    OFFICIALLY VERIFIED
                  </span>
                </div>

                <div className="relative w-full h-48 my-2">
                  <Image
                    src={activeCredential.previewImage}
                    alt={activeCredential.name}
                    fill
                    sizes="400px"
                    className="object-contain"
                  />
                </div>

                <div className="pt-2.5 mt-2 border-t border-slate-100 text-[11px] text-navy font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>PT HASWAKARYA ANDALAN SEDARE • SIUKAK CERTIFIED</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Authority</p>
                  <p className="text-sm font-semibold text-navy">{activeCredential.authority}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Reference</p>
                  <p className="text-sm font-mono text-navy">{activeCredential.referenceNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Status</p>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-green-50 text-green-700 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                    {activeCredential.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Badge</p>
                  <p className="text-sm font-semibold text-primary">{activeCredential.badge}</p>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed">{activeCredential.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function PartnerMarquee() {
  const doubled = [...MARITIME_STANDARDS_DETAILED, ...MARITIME_STANDARDS_DETAILED];

  return (
    <section className="py-14 bg-white border-y border-border-light overflow-hidden">
      <div className="site-container mb-8 text-center">
        <p className="text-muted text-sm uppercase tracking-widest font-semibold">
          International Standards &amp; Official Accreditations
        </p>
      </div>

      <div className="logo-marquee">
        <div className="logo-row">
          {doubled.map((std, idx) => (
            <div key={`${std.id}-${idx}`} className="logo-item flex-shrink-0">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-surface rounded-xl border border-border-light hover:border-primary/40 hover:bg-ice/40 transition-all duration-300">
                <Shield className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs font-bold text-navy tracking-wide">{std.code}</p>
                  <p className="text-xs text-muted">{std.authority.split(' ').slice(0, 2).join(' ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
