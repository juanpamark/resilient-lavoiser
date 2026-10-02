import { z } from 'zod';

export const DayScheduleSchema = z.object({
  open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:MM'),
  close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:MM'),
  closed: z.boolean().default(false),
});

export const BusinessHoursSchema = z.object({
  timezone: z.string().default('America/Bogota'),
  days: z.object({
    monday: DayScheduleSchema.optional(),
    tuesday: DayScheduleSchema.optional(),
    wednesday: DayScheduleSchema.optional(),
    thursday: DayScheduleSchema.optional(),
    friday: DayScheduleSchema.optional(),
    saturday: DayScheduleSchema.optional(),
    sunday: DayScheduleSchema.optional(),
  }),
});

export const BusinessLocationSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const CreateBusinessSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  description: z.string().max(1000).nullable().optional(),
  timezone: z.string().default('America/Bogota'),
  business_hours: BusinessHoursSchema.nullable().optional(),
  location: BusinessLocationSchema.nullable().optional(),
  settings: z.record(z.unknown()).default({}),
});

export type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>;
