'use client';

import React from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  FileCheck2,
  Anchor,
  Building2,
  User,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { COMPANY_INFO } from '@/data/haswakarya-data';

export interface PklContractData {
  id: string;
  contractNo: string;
  rank: string;
  signOnDate: string;
  durationMonths: number;
  monthlyBasicWageUsd?: number | null;
  monthlyBasicWageIdr?: number | null;
  allotmentPercentage: number;
  onboardCashAdvance: number;
  insurancePolicyNo?: string | null;
  status: string;
  seafarer: {
    seamanBookNo: string;
    passportNo?: string | null;
    placeOfBirth: string;
    dateOfBirth: string;
    homeAddress: string;
    emergencyContact: string;
    emergencyPhone: string;
    user: {
      fullName: string;
      email: string;
      phone?: string | null;
    };
  };
  vessel: {
    name: string;
    imoNumber: string;
    flag: string;
    vesselType: string;
    dwt: number;
    grt: number;
    ownerName: string;
    tradingArea: string;
  };
}

export interface PklDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  contract: PklContractData | null;
}

export function PklDocumentViewer({
  isOpen,
  onClose,
  contract,
}: PklDocumentViewerProps) {
  if (!isOpen || !contract) return null;

  const handlePrint = () => {
    window.print();
  };

  const wageDisplay = contract.monthlyBasicWageUsd
    ? `USD $${contract.monthlyBasicWageUsd.toLocaleString('en-US')} / Bulan`
    : contract.monthlyBasicWageIdr
    ? `IDR Rp ${contract.monthlyBasicWageIdr.toLocaleString('id-ID')} / Bulan`
    : 'USD $2,400 / Bulan (Standard ITF-MLC)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Container */}
      <div
        className="relative bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-300 z-10 flex flex-col max-h-[94vh] overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none print:max-h-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header (Hidden in Print) */}
        <div className="bg-[#06122A] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-navy-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold tracking-wide">
              Pratinjau Dokumen Hukum: PERJANJIAN KERJA LAUT (PKL TRIPARTIT)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-[#0c2b52] text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="p-4 sm:p-10 overflow-y-auto space-y-5 sm:space-y-6 text-slate-800 text-xs sm:text-sm font-serif leading-relaxed bg-[#fdfdfd]">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-double border-slate-800 pb-4 space-y-1">
            <div className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              REPUBLIK INDONESIA • KEMENTERIAN PERHUBUNGAN
            </div>
            <div className="font-sans text-xs font-bold text-slate-700 uppercase">
              DIREKTORAT JENDERAL PERHUBUNGAN LAUT
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 uppercase font-sans tracking-tight pt-1">
              PERJANJIAN KERJA LAUT (SEAFARER EMPLOYMENT AGREEMENT)
            </h1>
            <div className="font-mono text-xs font-semibold text-slate-600">
              NOMOR KONTRAK: <span className="text-navy font-bold">{contract.contractNo}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-sans italic">
              Berdasarkan Permenhub RI No. PM 59/2021, KUHD Buku II Bab IV, dan ILO Maritime Labour Convention (MLC) 2006 Standard A2.1
            </div>
          </div>

          {/* Tripartite Statement */}
          <div className="space-y-2">
            <p className="text-justify indent-6">
              Pada hari ini, disepakati dan ditandatangani <strong>Perjanjian Kerja Laut (PKL)</strong> oleh dan antara pihak-pihak di bawah ini:
            </p>

            <div className="space-y-3 pt-2 font-sans text-xs">
              {/* Pihak 1: Shipowner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">
                  I. PIHAK PERTAMA (PEMILIK / OPERATOR KAPAL - PRINCIPAL):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                  <div>Perusahaan: <strong>{contract.vessel.ownerName}</strong></div>
                  <div>Armada Kapal: <strong>{contract.vessel.name}</strong></div>
                  <div>Nomor IMO: <span className="font-mono">{contract.vessel.imoNumber}</span></div>
                  <div>Bendera / Flag: <strong>{contract.vessel.flag}</strong> (DWT: {contract.vessel.dwt.toLocaleString()} T)</div>
                </div>
              </div>

              {/* Pihak 2: Manning Agency */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">
                  II. PIHAK KEDUA (KEAGENAN AWAK KAPAL RESMI - CREW MANNING AGENT):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                  <div>Badan Usaha: <strong>{COMPANY_INFO.entityName}</strong></div>
                  <div>Izin Resmi: <strong>SIUKAK Kemenhub RI &amp; NIB {COMPANY_INFO.nib}</strong></div>
                  <div>Alamat Kantor: Batam Head Office &amp; Jakarta Branch</div>
                  <div>Kepatuhan: <strong>MLC 2006 Reg 1.4 Fully Compliant</strong></div>
                </div>
              </div>

              {/* Pihak 3: Seafarer */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">
                  III. PIHAK KETIGA (AWAK KAPAL / PELAUT INDONESIA):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                  <div>Nama Lengkap: <strong>{contract.seafarer.user.fullName}</strong></div>
                  <div>Nomor Buku Pelaut (Seaman Book): <strong className="font-mono">{contract.seafarer.seamanBookNo}</strong></div>
                  <div>Jabatan / Rank di Kapal: <strong className="text-primary">{contract.rank.replace(/_/g, ' ')}</strong></div>
                  <div>Tempat / Tanggal Lahir: {contract.seafarer.placeOfBirth}, {new Date(contract.seafarer.dateOfBirth).toLocaleDateString('id-ID')}</div>
                  <div>Alamat Domisili: {contract.seafarer.homeAddress}</div>
                  <div>Kontak Darurat: {contract.seafarer.emergencyContact} ({contract.seafarer.emergencyPhone})</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pasal 1: Masa Perjanjian */}
          <div className="space-y-1">
            <h2 className="font-bold text-slate-900 font-sans text-xs uppercase border-b border-slate-200 pb-0.5">
              PASAL 1: MASA PERJANJIAN &amp; PENUGASAN (PERIOD OF EMPLOYMENT)
            </h2>
            <p className="text-justify indent-6">
              Pihak Ketiga disetujui untuk dipekerjakan di atas kapal <strong>{contract.vessel.name}</strong> dengan jabatan <strong>{contract.rank.replace(/_/g, ' ')}</strong> untuk jangka waktu penugasan selama <strong>{contract.durationMonths} (enam) bulan</strong>, terhitung sejak tanggal Sign-On <strong>{new Date(contract.signOnDate).toLocaleDateString('id-ID')}</strong>, dengan opsi perpanjangan otomatis maksimal 3 (tiga) bulan atas persetujuan tertulis kedua belah pihak.
            </p>
          </div>

          {/* Pasal 2: Hak Upah & Allotment */}
          <div className="space-y-1">
            <h2 className="font-bold text-slate-900 font-sans text-xs uppercase border-b border-slate-200 pb-0.5">
              PASAL 2: UPAH, UANG SAKU, DAN ALOKASI KELUARGA (ALLOTMENT)
            </h2>
            <p className="text-justify indent-6">
              Pihak Pertama dan Pihak Kedua menjamin pembayaran upah bulanan kepada Pihak Ketiga dengan rincian:
            </p>
            <table className="w-full text-xs font-sans border border-slate-300 mt-2">
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-slate-50">
                  <td className="p-2 font-bold w-1/2">Gaji Pokok Bulanan (Basic Monthly Wage):</td>
                  <td className="p-2 font-bold font-mono text-navy">{wageDisplay}</td>
                </tr>
                <tr>
                  <td className="p-2">Alokasi Transfer Keluarga (Family Remittance Allotment):</td>
                  <td className="p-2 font-mono">{contract.allotmentPercentage}% (Ditransfer langsung ke rekening keluarga)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-2">Uang Saku Tunai di Kapal (Onboard Cash Advance):</td>
                  <td className="p-2 font-mono">{contract.onboardCashAdvance}% (Diberikan di atas kapal)</td>
                </tr>
                <tr>
                  <td className="p-2">Polis Asuransi Jiwa &amp; Kecelakaan Kerja:</td>
                  <td className="p-2 font-mono text-slate-600">{contract.insurancePolicyNo || 'P&I Club War Risk & Maritime Compensation Standard'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pasal 3: Jam Kerja & Kesejahteraan */}
          <div className="space-y-1">
            <h2 className="font-bold text-slate-900 font-sans text-xs uppercase border-b border-slate-200 pb-0.5">
              PASAL 3: JAM KERJA, CUTI, DAN HAK REPATRIASI (MLC 2006 STANDARD A2.5)
            </h2>
            <p className="text-justify indent-6">
              1. Jam kerja dan jam istirahat tunduk penuh pada STCW 1978/2010 Manila Amendments (minimal 10 jam istirahat per periode 24 jam).<br />
              2. Seluruh biaya repatriasi ke pelabuhan asal (Batam / Jakarta) ditanggung 100% oleh Pihak Pertama dan Pihak Kedua apabila kontrak berakhir secara wajar, kapal mengalami musibah laut, atau atas alasan medis yang disahkan dokter P&amp;I Club.<br />
              3. Sesuai Permenhub PM 59/2021 Pasal 36, Pihak Kedua <strong>menjamin tidak membebankan biaya penempatan (Zero Placement Fee)</strong> kepada Pihak Ketiga.
            </p>
          </div>

          {/* Tripartite Signature Blocks */}
          <div className="pt-8 border-t border-slate-300 font-sans">
            <div className="grid grid-cols-1 gap-6 text-center text-xs sm:grid-cols-3 sm:gap-4">
              <div className="space-y-8 sm:space-y-12 min-w-0">
                <div className="text-[11px] font-bold text-slate-600">PIHAK PERTAMA<br />Pemilik / Operator Kapal</div>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 break-words">
                  {contract.vessel.ownerName}
                  <div className="text-[10px] text-slate-400 font-normal">Superintendent / Principal</div>
                </div>
              </div>

              <div className="space-y-8 sm:space-y-12 min-w-0">
                <div className="text-[11px] font-bold text-slate-600">PIHAK KEDUA<br />PT Haswakarya Andalan Sedare</div>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 break-words">
                  Capt. H. Sulaeman Noor, M.Mar
                  <div className="text-[10px] text-slate-400 font-normal">Direktur Keagenan Awak Kapal</div>
                </div>
              </div>

              <div className="space-y-8 sm:space-y-12 min-w-0">
                <div className="text-[11px] font-bold text-slate-600">PIHAK KETIGA<br />Awak Kapal (Pelaut)</div>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                  {contract.seafarer.user.fullName}
                  <div className="text-[10px] text-slate-400 font-normal font-mono">{contract.seafarer.seamanBookNo}</div>
                </div>
              </div>
            </div>

            {/* Official Certification Stamp / Syahbandar Endorsement */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Dokumen sah terdaftar dalam Database Kementerian Perhubungan RI &amp; Sistem H-COS.</span>
              </div>
              <div className="font-mono">
                Status: <strong className="text-navy">{contract.status}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PklDocumentViewer;
