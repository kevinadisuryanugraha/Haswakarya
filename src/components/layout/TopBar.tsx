import React from "react";
import Link from "next/link";
import {
  Printer,
  Mail,
  ShieldCheck,
  Award,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { COMPANY_INFO } from "@/data/haswakarya-data";

export const TopBar: React.FC = () => {
  return (
    <aside
      aria-label="Corporate quick contacts and compliance credentials"
      className="w-full bg-[#06122A] text-slate-300 border-b border-navy-800 text-xs font-medium"
    >
      <div className="max-w-7xl xl:max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-row items-center justify-between gap-3 sm:gap-4 min-h-[38px]">
        {/* Left Side: Corporate Communication Channels */}
        <div className="flex items-center gap-3 sm:gap-4 xl:gap-5 min-w-0">
          {/* WhatsApp 24/7 Hotline */}
          <a
            href={COMPANY_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors group whitespace-nowrap shrink-0"
            title="Chat via Official WhatsApp 24/7 Hotline"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="font-semibold text-white hidden sm:inline">WhatsApp:</span>
            <span className="whitespace-nowrap font-medium text-slate-200">{COMPANY_INFO.phoneWhatsApp}</span>
          </a>

          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
            |
          </span>

          {/* Official Email Dispatch */}
          <a
            href={`mailto:${COMPANY_INFO.email}`}
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors group whitespace-nowrap shrink-0"
            title="Official Crewing Inquiries & CV Dispatch"
            aria-label={`Email ${COMPANY_INFO.email}`}
          >
            <Mail className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap font-medium text-slate-200">{COMPANY_INFO.email}</span>
          </a>

          <span className="text-slate-600 hidden xl:inline" aria-hidden="true">
            |
          </span>

          {/* Batam Head Office Fax */}
          <a
            href={`tel:${COMPANY_INFO.headOfficeStructured.fax?.replace(/[^0-9+]/g, "") || "+62778326066"}`}
            className="hidden xl:inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            title="Batam Head Office Fax Coordinate"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Fax: {COMPANY_INFO.fax}</span>
          </a>
        </div>

        {/* Right Side: Compliance Credentials & Operational Active Status */}
        <div className="hidden lg:flex items-center gap-3.5 xl:gap-4 shrink-0 text-slate-300">
          {/* SIUKAK & NIB Legal Credential */}
          <Link
            href="#legals"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-medium group shrink-0"
            title="Verified SIUKAK Kementerian Perhubungan RI"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
            <span>
              SIUKAK &amp; NIB:{" "}
              <strong className="font-bold text-white tracking-wide">
                {COMPANY_INFO.nib}
              </strong>
            </span>
          </Link>

          <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" aria-hidden="true" />

          {/* MLC 2006 Standard */}
          <div className="inline-flex items-center gap-1.5 text-slate-300 shrink-0" title="ILO MLC 2006 Regulation Compliant">
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>MLC 2006 Compliant</span>
          </div>

          <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0 hidden xl:inline-block" aria-hidden="true" />

          {/* Office Hubs */}
          <Link
            href="#contact"
            className="hidden 2xl:inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors shrink-0"
            title="Batam Head Office & Jakarta Branch Office"
          >
            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Batam HQ &amp; Jakarta Branch</span>
          </Link>

          <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0 hidden 2xl:inline-block" aria-hidden="true" />

          {/* Operational Hours Indicator */}
          <div className="hidden xl:inline-flex items-center gap-1.5 text-[10px] text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-medium tracking-wide shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>GMT+7 (WIB) Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TopBar;
