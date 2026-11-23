import { COMPANY_INFO } from '@/data/haswakarya-data';

export type HubOfficeTone = 'hq' | 'branch';

export interface HubOffice {
  id: string;
  /** Peran kantor, tampil sebagai lencana kecil di kartu. */
  role: 'HQ' | 'Branch';
  name: string;
  /** Derajat-menit-detik persis seperti yang tampil di layar. */
  coordinates: string;
  address: string;
  contactLabel: string;
  contactValue: string;
  /** Tautan peta jadi, sudah diturunkan dari `coordinates`. */
  mapsUrl: string;
  tone: HubOfficeTone;
}

/** Jaminan SIUKAK/MLC/STCW yang tampil di pita CTA. */
export const CTA_TRUST_MARKS = ['SIUKAK Kemenhub RI', 'MLC 2006 Compliant', 'STCW 2010 Standard'] as const;

const DMS_PATTERN = /(\d+)°\s*(\d+)'\s*(\d+)"\s*([NSEW])/g;

/**
 * Ubah pasangan koordinat DMS ("1°06'44\"N 103°58'28\"E") menjadi desimal.
 * Mengembalikan null bila format tidak dikenali, supaya pemanggil tidak
 * diam-diam memakai angka yang salah.
 */
export function dmsToDecimalPair(value: string): { lat: number; lng: number } | null {
  const matches = Array.from(value.matchAll(DMS_PATTERN));
  if (matches.length !== 2) return null;

  const toDecimal = (deg: string, min: string, sec: string, hemi: string) => {
    const decimal = Number(deg) + Number(min) / 60 + Number(sec) / 3600;
    return hemi === 'S' || hemi === 'W' ? -decimal : decimal;
  };

  const [first, second] = matches;
  return {
    lat: toDecimal(first[1], first[2], first[3], first[4]),
    lng: toDecimal(second[1], second[2], second[3], second[4]),
  };
}

/**
 * Bangun URL Google Maps dari koordinat DMS. Null bila format rusak, supaya
 * kartu bisa memilih tidak merender tautan alih-alih menebak lokasi.
 */
export function mapsUrlFromDms(value: string): string | null {
  const pair = dmsToDecimalPair(value);
  if (!pair) return null;
  return `https://www.google.com/maps/search/?api=1&query=${pair.lat.toFixed(5)},${pair.lng.toFixed(5)}`;
}

const BATAM_COORDINATES = "1°06'44\"N 103°58'28\"E";
const JAKARTA_COORDINATES = "6°09'12\"S 106°47'33\"E";

export const HUB_OFFICES: HubOffice[] = [
  {
    id: 'batam-hq',
    role: 'HQ',
    name: 'Batam Head Office',
    coordinates: BATAM_COORDINATES,
    address: 'Ruko Tiban Mas Blok A No. 59-60, Tiban Lama, Batam, Kepulauan Riau',
    contactLabel: 'Fax',
    contactValue: COMPANY_INFO.fax,
    mapsUrl: mapsUrlFromDms(BATAM_COORDINATES) ?? 'https://www.google.com/maps/search/?q=Tiban+Mas+Batam',
    tone: 'hq',
  },
  {
    id: 'jakarta-branch',
    role: 'Branch',
    name: 'Jakarta Branch Office',
    coordinates: JAKARTA_COORDINATES,
    address: 'Seasons City Unit A 29 Bj, Jl. Prof. Dr. Latumeten No. 33, Jakarta Barat',
    contactLabel: 'Hotline',
    contactValue: COMPANY_INFO.phoneWhatsApp,
    mapsUrl: mapsUrlFromDms(JAKARTA_COORDINATES) ?? 'https://www.google.com/maps/search/?q=Seasons+City+Jakarta',
    tone: 'branch',
  },
];
