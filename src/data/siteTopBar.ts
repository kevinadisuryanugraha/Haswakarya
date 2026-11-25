import { COMPANY_INFO } from '@/data/haswakarya-data';

/**
 * Model strip TopBar: satu sumber teks untuk strip kontak & kepatuhan.
 *
 * Nilai diturunkan dari `COMPANY_INFO` agar konsisten dengan seluruh halaman situs.
 *
 * Tangga reveal dirancang presisi agar Zone Left (Kontak) dan Zone Right (Kredensial)
 * selalu memiliki buffer ruang kosong minimal 200px di tengah pada semua resolusi,
 * sehingga TIDAK AKAN PERNAH bertabrakan, berdempetan, atau bertumpuk.
 */

export type TopBarItemId = 'whatsapp' | 'email' | 'fax' | 'nib' | 'mlc' | 'hubs' | 'status';

export type TopBarTone = 'emerald' | 'sky' | 'slate' | 'amber' | 'accent' | 'none';

export interface TopBarLink {
  id: TopBarItemId;
  label: string;
  value: string;
  shortValue?: string;
  href: string | null;
  external?: boolean;
  tone: TopBarTone;
  title: string;
  ariaLabel?: string;
}

export interface TopBarSource {
  phoneWhatsApp: string;
  whatsappUrl: string;
  email: string;
  fax?: string;
  nib: string;
}

export interface TopBarModel {
  contacts: TopBarLink[];
  credentials: TopBarLink[];
  status: TopBarLink;
}

/**
 * Tangga prioritas responsif:
 * - Layar < 640px  : WhatsApp saja (ringkas).
 * - Layar 640px+   : WhatsApp + Email + NIB + Status.
 * - Layar 1024px+  : WhatsApp + Email + NIB + MLC + Status (lega, buffer ~300px).
 * - Layar 1536px+  : Fax dan Hubs Batam/Jakarta aktif (buffer ~350px).
 *
 * Fax dan Hubs TIDAK boleh tampil di bawah 1536px agar tidak mendesak kredensial NIB/MLC.
 */
export const TOP_BAR_REVEAL: Record<TopBarItemId, string> = {
  whatsapp: 'inline-flex',
  email: 'hidden sm:inline-flex',
  fax: 'hidden 2xl:inline-flex',
  nib: 'hidden md:inline-flex',
  mlc: 'hidden lg:inline-flex',
  hubs: 'hidden 2xl:inline-flex',
  status: 'hidden md:inline-flex',
};

export const TOP_BAR_MAX_HEIGHT = 42;

export function buildTopBarModel(source: TopBarSource): TopBarModel {
  const contacts: TopBarLink[] = [
    {
      id: 'whatsapp',
      label: 'WhatsApp:',
      value: source.phoneWhatsApp,
      href: source.whatsappUrl,
      external: true,
      tone: 'emerald',
      title: 'Chat via Official WhatsApp 24/7 Hotline',
      ariaLabel: `WhatsApp ${source.phoneWhatsApp}`,
    },
    {
      id: 'email',
      label: '',
      value: source.email,
      href: `mailto:${source.email}`,
      tone: 'sky',
      title: 'Official Crewing Inquiries & CV Dispatch',
      ariaLabel: `Email ${source.email}`,
    },
  ];

  const fax = source.fax?.trim();
  if (fax) {
    contacts.push({
      id: 'fax',
      label: 'Fax:',
      value: fax,
      href: null,
      tone: 'slate',
      title: 'Batam Head Office Fax Coordinate',
    });
  }

  const credentials: TopBarLink[] = [
    {
      id: 'nib',
      label: 'SIUKAK & NIB:',
      value: source.nib,
      href: '/#legals',
      tone: 'sky',
      title: 'Verified SIUKAK Kementerian Perhubungan RI',
    },
    {
      id: 'mlc',
      label: '',
      value: 'MLC 2006 Compliant',
      shortValue: 'MLC 2006',
      href: null,
      tone: 'amber',
      title: 'ILO MLC 2006 Regulation Compliant',
    },
    {
      id: 'hubs',
      label: '',
      value: 'Batam HQ & Jakarta Branch',
      href: '/#contact',
      tone: 'accent',
      title: 'Batam Head Office & Jakarta Branch Office',
    },
  ];

  const status: TopBarLink = {
    id: 'status',
    label: '',
    value: 'GMT+7 (WIB) Active',
    href: null,
    tone: 'none',
    title: 'Operational hours: GMT+7 (WIB) 24/7',
  };

  return { contacts, credentials, status };
}

export const TOP_BAR: TopBarModel = buildTopBarModel(COMPANY_INFO);
