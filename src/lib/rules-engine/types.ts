/* ============================================
   RULES ENGINE TYPES
   Core type definitions for Pakistan's 
   social protection system
   ============================================ */

export type Province = 
  | 'punjab' 
  | 'sindh' 
  | 'kpk' 
  | 'balochistan' 
  | 'islamabad' 
  | 'ajk' 
  | 'gilgit_baltistan';

export type EmploymentType = 
  | 'daily_wage' 
  | 'salaried' 
  | 'self_employed' 
  | 'unemployed' 
  | 'retired' 
  | 'agricultural'
  | 'domestic_worker'
  | 'unknown';

export type ProgramType = 
  | 'cash_transfer' 
  | 'education' 
  | 'nutrition' 
  | 'healthcare' 
  | 'seasonal';

export type EligibilityStatus = 
  | 'LIKELY_ELIGIBLE' 
  | 'MAY_BE_ELIGIBLE' 
  | 'LIKELY_NOT_ELIGIBLE'
  | 'INSUFFICIENT_DATA';

export type ConditionStatus = 'MET' | 'UNMET' | 'UNKNOWN';

export interface UserProfile {
  province?: Province;
  householdSize?: number;
  monthlyIncome?: number;
  employmentType?: EmploymentType;
  hasSchoolAgeChildren?: boolean;
  schoolAgeChildrenCount?: number;
  childrenGenders?: ('male' | 'female')[];
  childrenSchoolLevels?: ('primary' | 'secondary' | 'higher_secondary')[];
  hasPregnantMember?: boolean;
  hasLactatingMember?: boolean;
  hasDisabledMember?: boolean;
  hasChildrenUnder2?: boolean;
  isKafaalatBeneficiary?: boolean;
  estimatedPMTScore?: number;
  isWidow?: boolean;
  isOrphan?: boolean;
  hasChronicIllness?: boolean;
  cnicNumber?: string;
  headOfHousehold?: 'male' | 'female';
  numberOfEarners?: number;
  ownsLand?: boolean;
  ownsMotorcycle?: boolean;
  ownsRefrigerator?: boolean;
  livesInRuralArea?: boolean;
}

export interface EligibilityCriterion {
  id: string;
  description: {
    en: string;
    ur: string;
  };
  evaluate: (profile: UserProfile) => ConditionStatus;
  weight: 'required' | 'strong_indicator' | 'supporting';
}

export interface RegistrationChannel {
  type: 'sms' | 'web_portal' | 'in_person' | 'helpline' | 'app';
  details: {
    en: string;
    ur: string;
  };
  smsCode?: string;
  url?: string;
  phone?: string;
  location?: string;
}

export interface ProvinceVariation {
  province: Province;
  description: {
    en: string;
    ur: string;
  };
  isAvailable: boolean;
  restrictions?: string[];
  hospitalType?: 'private_only' | 'public_only' | 'both';
}

export interface Program {
  id: string;
  name: {
    en: string;
    ur: string;
  };
  shortName: string;
  type: ProgramType;
  icon: string;
  color: string;
  benefit: {
    en: string;
    ur: string;
  };
  description: {
    en: string;
    ur: string;
  };
  eligibilityCriteria: EligibilityCriterion[];
  requiredDocuments: {
    en: string[];
    ur: string[];
  };
  registrationChannels: RegistrationChannel[];
  dependsOn?: string[];
  provinceVariations?: ProvinceVariation[];
  importantNotes?: {
    en: string[];
    ur: string[];
  };
  paymentFrequency?: string;
  lastUpdated: string;
}

export interface EligibilityResult {
  programId: string;
  program: Program;
  status: EligibilityStatus;
  confidence: number;
  conditionResults: {
    criterion: EligibilityCriterion;
    status: ConditionStatus;
  }[];
  explanation: {
    en: string;
    ur: string;
  };
  unlockedBy?: string[];
  unlocks?: string[];
  provinceNote?: {
    en: string;
    ur: string;
  };
}

export interface AssessmentResult {
  profile: UserProfile;
  results: EligibilityResult[];
  totalProgramsChecked: number;
  likelyEligibleCount: number;
  mayBeEligibleCount: number;
  crossProgramAlerts: {
    en: string[];
    ur: string[];
  };
  timestamp: string;
  disclaimer: {
    en: string;
    ur: string;
  };
}

export type Language = 'en' | 'ur' | 'sd' | 'ps' | 'pn' | 'bl';

export interface TranslationStrings {
  [key: string]: string | TranslationStrings;
}
