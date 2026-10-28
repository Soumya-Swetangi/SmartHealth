import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Full Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  village: z.string().min(1, 'Village name is required'),
  phone: z.string().optional()
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const reportSchema = z.object({
  village: z.string().min(1, 'Please select or enter a village'),
  sourceType: z.enum(['handpump', 'well', 'river', 'pond', 'pipeline', 'other'] as const, {
    errorMap: () => ({ message: 'Please select a water source type' })
  }),
  symptoms: z.array(z.string()).min(1, 'Please select at least one symptom observed'),
  description: z.string().max(500, 'Description should be under 500 characters').optional(),
  latitude: z.number().min(20).max(30).optional(),
  longitude: z.number().min(88).max(98).optional()
});

export type ReportFormData = z.infer<typeof reportSchema>;

export const waterTestSchema = z.object({
  village: z.string().min(1, 'Village is required'),
  sourceType: z.string().min(1, 'Source type is required'),
  reportId: z.string().optional(),
  result: z.enum(['safe', 'unsafe', 'borderline'] as const, {
    errorMap: () => ({ message: 'Result must be safe, unsafe, or borderline' })
  }),
  pH: z.number().min(0).max(14).optional(),
  turbidity: z.number().min(0).optional(),
  chlorine: z.number().min(0).optional(),
  coliform: z.boolean().default(false),
  ecoli: z.boolean().default(false),
  notes: z.string().optional()
});

export type WaterTestFormData = z.infer<typeof waterTestSchema>;
