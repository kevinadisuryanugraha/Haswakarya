import { z } from 'zod';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Haswakarya Crewing OS — Validasi Input Endpoint Publik
 * Batas panjang eksplisit + normalisasi agar data ATS tidak tercemar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const trimmed = (min: number, max: number, label: string) =>
  z
    .string({ message: `${label} wajib diisi.` })
    .trim()
    .min(min, `${label} minimal ${min} karakter.`)
    .max(max, `${label} maksimal ${max} karakter.`);

const optionalTrimmed = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter.`)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));

export const seafarerApplicationSchema = z.object({
  fullName: trimmed(2, 120, 'Nama Lengkap'),
  phoneWhatsApp: trimmed(8, 20, 'Nomor WhatsApp').regex(
    /^[+()\-\s\d]{8,20}$/,
    'Nomor WhatsApp tidak valid.'
  ),
  email: z.string().trim().toLowerCase().email('Format email tidak valid.').max(160),
  seamanBookNo: optionalTrimmed(40, 'Nomor Buku Pelaut'),
  departmentRank: trimmed(2, 60, 'Jabatan'),
  cocClass: optionalTrimmed(60, 'Kelas CoC'),
  marlinsScore: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      const parsed = typeof value === 'number' ? value : Number.parseFloat(value.replace(/[^\d.]/g, ''));
      if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) return undefined;
      return parsed;
    }),
  seaTimeMonths: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      const parsed = typeof value === 'number' ? value : Number.parseInt(value.replace(/[^\d]/g, ''), 10);
      if (Number.isNaN(parsed) || parsed < 0 || parsed > 600) return undefined;
      return parsed;
    }),
  vesselTypeExperience: optionalTrimmed(120, 'Pengalaman tipe kapal'),
  readinessDate: optionalTrimmed(60, 'Tanggal kesiapan'),
  additionalNotes: optionalTrimmed(1000, 'Catatan tambahan'),
});

export type SeafarerApplicationInput = z.infer<typeof seafarerApplicationSchema>;

export const manningInquirySchema = z.object({
  companyName: trimmed(2, 160, 'Nama Perusahaan'),
  contactPerson: trimmed(2, 120, 'Contact Person'),
  workEmail: z.string().trim().toLowerCase().email('Format email kerja tidak valid.').max(160),
  phoneWhatsApp: optionalTrimmed(20, 'Nomor WhatsApp'),
  vesselName: optionalTrimmed(120, 'Nama Kapal'),
  imoNumber: optionalTrimmed(20, 'Nomor IMO').refine(
    (value) => value === undefined || /^\d{7}$/.test(value.replace(/^IMO\s*/i, '')),
    'Nomor IMO harus 7 digit.'
  ),
  vesselType: optionalTrimmed(80, 'Tipe Kapal'),
  targetRanks: optionalTrimmed(120, 'Jabatan yang dibutuhkan'),
  joinPort: optionalTrimmed(120, 'Pelabuhan bergabung'),
  expectedJoiningDate: optionalTrimmed(40, 'Tanggal bergabung'),
  notes: optionalTrimmed(1000, 'Catatan'),
});

export type ManningInquiryInput = z.infer<typeof manningInquirySchema>;

export const vettingDecisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REQUEST_REPLACEMENT']),
  signerName: trimmed(3, 120, 'Nama penandatangan'),
  signerRole: optionalTrimmed(80, 'Jabatan penandatangan'),
  remarks: optionalTrimmed(1000, 'Catatan keputusan'),
});

export type VettingDecisionInput = z.infer<typeof vettingDecisionSchema>;

/** Mengubah error zod menjadi pesan tunggal yang ramah pengguna. */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => issue.message)
    .filter((message, index, all) => all.indexOf(message) === index)
    .join(' ');
}

/** Membaca body JSON dengan aman; null bila body bukan JSON valid. */
export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
