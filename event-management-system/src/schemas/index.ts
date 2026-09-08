import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  role: z.enum(['PARTICIPANT', 'ORGANIZER']).default('PARTICIPANT'),
  phone: z.string().optional().or(z.literal('')),
  institution: z.string().optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak sesuai',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const eventBaseSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  categoryId: z.string().uuid('Invalid category'),
  description: z.string().optional(),
  bannerUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  address: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  registrationStart: z.string(),
  registrationEnd: z.string(),
  maxParticipants: z.number().int().positive().optional(),
});

export const createEventSchema = eventBaseSchema
  .extend({
    startDate: eventBaseSchema.shape.startDate.refine((date) => new Date(date) > new Date(), {
      message: 'Start date must be in the future',
    }),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  }).refine((data) => new Date(data.registrationEnd) > new Date(data.registrationStart), {
    message: 'Registration end must be after registration start',
    path: ['registrationEnd'],
  });

export const updateEventSchema = eventBaseSchema.partial();

export const ticketBaseSchema = z.object({
  name: z.string().min(2, 'Ticket name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  quota: z.number().int().min(1, 'Quota must be at least 1'),
  saleStart: z.string(),
  saleEnd: z.string(),
});

export const createTicketSchema = ticketBaseSchema.refine((data) => new Date(data.saleEnd) > new Date(data.saleStart), {
  message: 'Sale end must be after sale start',
  path: ['saleEnd'],
});

export const updateTicketSchema = ticketBaseSchema.partial();

export const registrationSchema = z.object({
  ticketId: z.string().min(1, 'Pilih jenis tiket'),
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional().or(z.literal('')),
  institution: z.string().optional().or(z.literal('')),
  additionalInfo: z.string().optional().or(z.literal('')),
});

export const checkInSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  institution: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ORGANIZER', 'PARTICIPANT']),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
