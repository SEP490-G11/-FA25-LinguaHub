import { z } from 'zod';

// Certificate validation schema
export const certificateSchema = z.object({
  certificateName: z
    .string()
    .min(1, 'Certificate name is required')
    .max(200, 'Certificate name must not exceed 200 characters'),
  documentUrl: z
    .string()
    .min(1, 'Document URL is required')
    .url('Must be a valid URL'),
});

// Tutor application validation schema
export const tutorApplicationSchema = z.object({
  experience: z
    .number({ message: 'Experience must be a number' })
    .min(0, 'Experience cannot be negative')
    .max(100, 'Experience must not exceed 100 years'),
  specialization: z
    .string()
    .min(3, 'Specialization must be at least 3 characters')
    .max(200, 'Specialization must not exceed 200 characters'),
  teachingLanguage: z
    .string()
    .min(2, 'Teaching language is required')
    .max(50, 'Teaching language must not exceed 50 characters'),
  bio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio must not exceed 1000 characters'),
  certificates: z
    .array(certificateSchema)
    .min(1, 'At least one certificate is required'),
});

// Export type inference for TypeScript
export type TutorApplicationFormData = z.infer<typeof tutorApplicationSchema>;
export type CertificateFormData = z.infer<typeof certificateSchema>;
