import { z } from 'zod';

/**
 * Skema aksi pengelolaan tautan vetting.
 * `rotate` menerbitkan token baru dan mematikan yang lama; `revoke` mematikan
 * tautan tanpa pengganti. Alasan bersifat opsional namun dicatat di audit.
 */
export const tokenActionSchema = z.object({
  action: z.enum(['rotate', 'revoke']),
  reason: z.string().trim().max(500).optional(),
});

export type TokenActionInput = z.infer<typeof tokenActionSchema>;

export const TOKEN_TTL_DAYS = 30;
