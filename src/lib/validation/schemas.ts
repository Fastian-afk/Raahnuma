import { z } from 'zod';

/** Valid provinces on a Pakistani CNIC */
export const ProvinceSchema = z.enum([
  'punjab',
  'sindh',
  'kpk',
  'balochistan',
  'islamabad',
  'ajk',
  'gilgit_baltistan',
]);

export const EmploymentTypeSchema = z.enum([
  'daily_wage',
  'salaried',
  'self_employed',
  'unemployed',
  'retired',
  'agricultural',
  'domestic_worker',
  'unknown',
]);

/** CNIC format: 12345-1234567-1 (dashes optional) */
export const CnicSchema = z
  .string()
  .regex(/^\d{5}-?\d{7}-?\d$/, 'CNIC must be 13 digits in format 12345-1234567-1')
  .optional();

/**
 * Structured profile extracted by NLP layer.
 * All fields optional — rules engine handles missing data via INSUFFICIENT_DATA status.
 */
export const UserProfileSchema = z.object({
  province: ProvinceSchema.optional(),
  householdSize: z.number().int().min(1).max(30).optional(),
  monthlyIncome: z.number().min(0).max(10_000_000).optional(),
  employmentType: EmploymentTypeSchema.optional(),
  hasSchoolAgeChildren: z.boolean().optional(),
  schoolAgeChildrenCount: z.number().int().min(0).max(15).optional(),
  childrenGenders: z.array(z.enum(['male', 'female'])).optional(),
  childrenSchoolLevels: z
    .array(z.enum(['primary', 'secondary', 'higher_secondary']))
    .optional(),
  hasPregnantMember: z.boolean().optional(),
  hasLactatingMember: z.boolean().optional(),
  hasDisabledMember: z.boolean().optional(),
  hasChildrenUnder2: z.boolean().optional(),
  isKafaalatBeneficiary: z.boolean().optional(),
  estimatedPMTScore: z.number().min(0).max(100).optional(),
  isWidow: z.boolean().optional(),
  isOrphan: z.boolean().optional(),
  hasChronicIllness: z.boolean().optional(),
  cnicNumber: CnicSchema,
  headOfHousehold: z.enum(['male', 'female']).optional(),
  numberOfEarners: z.number().int().min(0).max(10).optional(),
  ownsLand: z.boolean().optional(),
  ownsMotorcycle: z.boolean().optional(),
  ownsRefrigerator: z.boolean().optional(),
  livesInRuralArea: z.boolean().optional(),
});

export const ExtractedProfileResponseSchema = z.object({
  extracted_profile: UserProfileSchema,
  ready_to_assess: z.boolean(),
  /** NLP need labels — addresses qualifier feedback on need classification */
  identified_needs: z
    .array(
      z.enum([
        'financial_support',
        'education_support',
        'nutrition_support',
        'healthcare',
        'seasonal_aid',
        'housing',
        'employment',
      ])
    )
    .optional(),
  /** Confidence in profile extraction (0–1) */
  extraction_confidence: z.number().min(0).max(1).optional(),
  /** Whether human escalation is recommended */
  needs_human_review: z.boolean().optional(),
});

export const ChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(50),
  language: z.enum(['en', 'ur', 'sd', 'ps', 'pn', 'bl']).default('en'),
});

export const OcrRequestSchema = z.object({
  /** Base64-encoded image data (without data URL prefix) */
  imageBase64: z.string().min(100).max(15_000_000),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  documentType: z.enum(['cnic', 'b_form', 'other']).default('cnic'),
});

export const TtsRequestSchema = z.object({
  text: z.string().min(1).max(2000),
  language: z.enum(['en', 'ur', 'sd', 'ps', 'pn', 'bl']).default('en'),
});

export type ValidatedUserProfile = z.infer<typeof UserProfileSchema>;
