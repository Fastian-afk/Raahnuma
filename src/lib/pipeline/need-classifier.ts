import { UserProfile } from '@/lib/rules-engine/types';

export type NeedCategory =
  | 'financial_support'
  | 'education_support'
  | 'nutrition_support'
  | 'healthcare'
  | 'seasonal_aid'
  | 'housing'
  | 'employment';

export interface ClassifiedNeeds {
  needs: NeedCategory[];
  urgency: 'low' | 'medium' | 'high';
  ambiguityScore: number;
  /** True when input is too vague for reliable assessment */
  requiresClarification: boolean;
  clarificationPrompt?: { en: string; ur: string };
}

const AMBIGUOUS_PATTERNS = [
  /^(i('m| am) )?(just )?struggl/i,
  /need help/i,
  /don't know what to do/i,
  /مشکل/i,
  /مدد/i,
];

/**
 * Rule-based need classifier — runs after NLP profile extraction.
 * Maps structured profile + raw text signals to need categories for the recommendation engine.
 * This is separate from the LLM (qualifier feedback: NLP creates inputs, engine uses them).
 */
export function classifyNeeds(
  profile: UserProfile,
  rawText?: string
): ClassifiedNeeds {
  const needs: NeedCategory[] = [];
  let ambiguityScore = 0;

  if (rawText) {
    const isAmbiguous =
      AMBIGUOUS_PATTERNS.some((p) => p.test(rawText)) &&
      !profile.province &&
      !profile.employmentType &&
      profile.householdSize === undefined;

    if (isAmbiguous) {
      ambiguityScore += 0.6;
    }
  }

  const fieldCount = [
    profile.province,
    profile.householdSize,
    profile.employmentType,
    profile.monthlyIncome,
  ].filter((v) => v !== undefined).length;

  if (fieldCount <= 1) ambiguityScore += 0.3;

  if (
    profile.employmentType === 'unemployed' ||
    profile.employmentType === 'daily_wage' ||
    (profile.monthlyIncome !== undefined && profile.monthlyIncome < 30000)
  ) {
    needs.push('financial_support');
  }

  if (profile.hasSchoolAgeChildren) {
    needs.push('education_support');
  }

  if (profile.hasPregnantMember || profile.hasLactatingMember || profile.hasChildrenUnder2) {
    needs.push('nutrition_support');
  }

  if (profile.hasDisabledMember || profile.hasChronicIllness) {
    needs.push('healthcare');
  }

  if (profile.province) {
    needs.push('healthcare');
  }

  if (needs.length === 0 && fieldCount === 0) {
    needs.push('financial_support');
  }

  const uniqueNeeds = [...new Set(needs)];

  let urgency: 'low' | 'medium' | 'high' = 'medium';
  if (profile.employmentType === 'unemployed' && (profile.householdSize ?? 0) > 4) {
    urgency = 'high';
  }
  if (profile.hasPregnantMember || profile.hasChildrenUnder2) {
    urgency = 'high';
  }

  const requiresClarification = ambiguityScore >= 0.5 && uniqueNeeds.length <= 1;

  return {
    needs: uniqueNeeds,
    urgency,
    ambiguityScore: Math.min(1, ambiguityScore),
    requiresClarification,
    clarificationPrompt: requiresClarification
      ? {
          en: 'I want to help, but I need a bit more detail. Are you looking for financial support (cash assistance), education stipends, nutrition support, healthcare coverage, or something else?',
          ur: 'میں مدد کرنا چاہتا/چاہتی ہوں، لیکن مجھے تھوڑی اور تفصیل درکار ہے۔ کیا آپ مالی مدد، تعلیمی وظائف، غذائی سپورٹ، صحت کی سہولت، یا کچھ اور تلاش کر رہے ہیں؟',
        }
      : undefined,
  };
}

/** Maps need categories to program IDs for the recommendation engine ranking boost */
export const NEED_TO_PROGRAMS: Record<NeedCategory, string[]> = {
  financial_support: ['kafaalat', 'ramzan_relief'],
  education_support: ['taleemi_wazaif'],
  nutrition_support: ['nashonuma'],
  healthcare: ['sehat_sahulat'],
  seasonal_aid: ['ramzan_relief'],
  housing: ['kafaalat'],
  employment: ['kafaalat'],
};
