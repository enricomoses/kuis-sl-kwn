import { z } from 'zod';
import { LIMITS } from '@/constants/validation.constant';

export const loginRequestSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .email('Format email tidak valid.')
    .max(LIMITS.EMAIL_MAX, 'Email terlalu panjang.'),
  password: z
    .string()
    .min(
      LIMITS.PASSWORD_MIN,
      `Kata sandi minimal ${LIMITS.PASSWORD_MIN} karakter.`,
    )
    .max(LIMITS.PASSWORD_MAX, 'Kata sandi terlalu panjang.'),
  next: z.string().trim().max(256).optional(),
});

export const adminSessionProfileSchema = z.strictObject({
  userId: z.uuid(),
  email: z.email(),
  role: z.literal('admin'),
});

export const loginResponseSchema = z.strictObject({
  profile: adminSessionProfileSchema,
  redirectTo: z.string().min(1),
});

export const logoutResponseSchema = z.strictObject({
  signedOut: z.literal(true),
});
