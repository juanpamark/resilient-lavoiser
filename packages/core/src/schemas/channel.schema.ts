import { z } from 'zod';

export const ChannelTypeSchema = z.enum([
  'whatsapp',
  'instagram',
  'messenger',
  'webchat',
  'telegram',
]);

export const OnboardingStatusSchema = z.enum([
  'pending',
  'connected',
  'failed',
  'revoked',
]);

export const BillingTypeSchema = z.enum([
  'client_direct_meta',
  'platform_sponsored',
]);

export const ChannelConnectionSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  channel_type: ChannelTypeSchema,
  channel_account_id: z.string().min(1, 'channel_account_id is required'),
  waba_id: z.string().nullable().optional(),
  phone_number: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Must be in E.164 format').nullable().optional(),
  access_token_encrypted: z.string().min(1, 'Encrypted access token is required'),
  webhook_verify_token: z.string().min(8, 'Verify token must be at least 8 chars'),
  is_active: z.boolean().default(true),
  onboarding_status: OnboardingStatusSchema.default('pending'),
  billing_type: BillingTypeSchema.default('client_direct_meta'),
  config: z.record(z.unknown()).default({}),
  connected_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const MetaEmbeddedSignupPayloadSchema = z.object({
  code: z.string().min(1, 'OAuth code is required'),
  waba_id: z.string().min(1, 'WABA ID is required'),
  phone_number_id: z.string().min(1, 'Phone Number ID is required'),
  business_id: z.string().uuid('Valid business UUID is required'),
});

export type ChannelConnectionInput = z.infer<typeof ChannelConnectionSchema>;
export type MetaEmbeddedSignupPayloadInput = z.infer<typeof MetaEmbeddedSignupPayloadSchema>;
