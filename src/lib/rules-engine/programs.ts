import { Program, UserProfile, ConditionStatus } from './types';

function checkIncome(profile: UserProfile): ConditionStatus {
  if (profile.monthlyIncome === undefined && profile.employmentType === undefined) return 'UNKNOWN';
  if (profile.monthlyIncome !== undefined && profile.monthlyIncome <= 35000) return 'MET';
  if (profile.employmentType && ['daily_wage', 'unemployed', 'agricultural', 'domestic_worker'].includes(profile.employmentType)) return 'MET';
  if (profile.monthlyIncome !== undefined && profile.monthlyIncome > 60000) return 'UNMET';
  return 'UNKNOWN';
}

function checkPMTProxy(profile: UserProfile): ConditionStatus {
  if (profile.estimatedPMTScore !== undefined) {
    return profile.estimatedPMTScore < 32 ? 'MET' : 'UNMET';
  }
  // Proxy estimation based on known correlates
  let score = 0;
  let factors = 0;
  if (profile.employmentType) {
    factors++;
    if (['daily_wage', 'unemployed', 'agricultural', 'domestic_worker'].includes(profile.employmentType)) score++;
  }
  if (profile.householdSize !== undefined) {
    factors++;
    if (profile.householdSize >= 5) score++;
  }
  if (profile.livesInRuralArea !== undefined) {
    factors++;
    if (profile.livesInRuralArea) score++;
  }
  if (profile.ownsLand !== undefined) {
    factors++;
    if (!profile.ownsLand) score++;
  }
  if (profile.numberOfEarners !== undefined) {
    factors++;
    if (profile.numberOfEarners <= 1) score++;
  }
  if (factors === 0) return 'UNKNOWN';
  const ratio = score / factors;
  if (ratio >= 0.6) return 'MET';
  if (ratio <= 0.3) return 'UNMET';
  return 'UNKNOWN';
}

export const PROGRAMS: Program[] = [
  {
    id: 'kafaalat',
    name: { en: 'Benazir Kafaalat', ur: 'بے نظیر کفالت' },
    shortName: 'Kafaalat',
    type: 'cash_transfer',
    icon: 'banknote',
    color: '#E3BE7E',
    benefit: {
      en: 'Rs. 14,500 per quarter (Rs. 4,833/month)',
      ur: 'فی سہ ماہی 14,500 روپے'
    },
    description: {
      en: 'Unconditional cash transfer program for the poorest households in Pakistan, administered by BISP. Eligibility is determined through the National Socio-Economic Registry (NSER) Dynamic Survey and Proxy Means Test (PMT) scoring system.',
      ur: 'پاکستان کے غریب ترین گھرانوں کے لیے غیر مشروط نقد رقم کی منتقلی کا پروگرام'
    },
    eligibilityCriteria: [
      {
        id: 'kafaalat_pmt',
        description: { en: 'Household PMT score below 32 (or below 37 for persons with disabilities)', ur: 'گھرانے کا PMT سکور 32 سے کم ہو' },
        evaluate: (p) => {
          if (p.hasDisabledMember && p.estimatedPMTScore !== undefined) {
            return p.estimatedPMTScore < 37 ? 'MET' : 'UNMET';
          }
          return checkPMTProxy(p);
        },
        weight: 'required'
      },
      {
        id: 'kafaalat_cnic',
        description: { en: 'Valid CNIC (Computerized National Identity Card) required', ur: 'درست شناختی کارڈ ضروری ہے' },
        evaluate: (p) => p.cnicNumber ? 'MET' : 'UNKNOWN',
        weight: 'required'
      },
      {
        id: 'kafaalat_income',
        description: { en: 'Low-income household (daily wage, unemployed, or monthly income under Rs. 35,000)', ur: 'کم آمدنی والا گھرانہ' },
        evaluate: checkIncome,
        weight: 'strong_indicator'
      },
      {
        id: 'kafaalat_female_head',
        description: { en: 'Payment is made to the female head of household', ur: 'ادائیگی خاتون سربراہ کو کی جاتی ہے' },
        evaluate: () => 'MET', // informational
        weight: 'supporting'
      }
    ],
    requiredDocuments: {
      en: ['CNIC (original)', 'B-Form for children (if applicable)', 'Mobile phone registered to CNIC'],
      ur: ['شناختی کارڈ (اصل)', 'بچوں کا بی فارم', 'شناختی کارڈ پر رجسٹرڈ موبائل فون']
    },
    registrationChannels: [
      { type: 'sms', details: { en: 'Send your CNIC number via SMS to 8171 to check eligibility status', ur: 'اپنا شناختی کارڈ نمبر 8171 پر SMS کریں' }, smsCode: '8171' },
      { type: 'web_portal', details: { en: 'Check status online at 8171.bisp.gov.pk', ur: '8171.bisp.gov.pk پر آن لائن چیک کریں' }, url: 'https://8171.bisp.gov.pk' },
      { type: 'helpline', details: { en: 'Call BISP helpline 0800-26477', ur: 'BISP ہیلپ لائن 0800-26477 پر کال کریں' }, phone: '0800-26477' },
      { type: 'in_person', details: { en: 'Visit nearest BISP Tehsil office with CNIC', ur: 'قریبی BISP تحصیل دفتر جائیں' } }
    ],
    importantNotes: {
      en: [
        'Payment is made quarterly (every 3 months)',
        'Amount was increased to Rs. 14,500 in 2024',
        'Biometric verification (thumb impression) required for withdrawal',
        'Government employees and their households are NOT eligible'
      ],
      ur: [
        'ادائیگی سہ ماہی ہوتی ہے',
        'رقم 2024 میں بڑھا کر 14,500 روپے کی گئی',
        'نکلوانے کے لیے بائیومیٹرک تصدیق ضروری ہے'
      ]
    },
    paymentFrequency: 'Quarterly',
    lastUpdated: '2026-06-01'
  },
  {
    id: 'taleemi_wazaif',
    name: { en: 'Taleemi Wazaif (Education Stipend)', ur: 'تعلیمی وظائف' },
    shortName: 'Taleemi Wazaif',
    type: 'education',
    icon: 'graduation-cap',
    color: '#5BBFA0',
    benefit: {
      en: 'Rs. 2,500/quarter (primary boys), Rs. 3,000 (primary girls), Rs. 3,500 (secondary boys), Rs. 4,000 (secondary girls), Rs. 4,500 (higher secondary)',
      ur: 'فی سہ ماہی 2,500 سے 4,500 روپے تک'
    },
    description: {
      en: 'Conditional cash transfer for education. Children of Kafaalat beneficiary households receive quarterly stipends for school attendance. Girls receive higher amounts to encourage female education.',
      ur: 'تعلیم کے لیے مشروط نقد رقم کی منتقلی۔ کفالت کے مستفید گھرانوں کے بچوں کو اسکول حاضری پر وظائف ملتے ہیں'
    },
    eligibilityCriteria: [
      {
        id: 'tw_kafaalat',
        description: { en: 'Household must be an active Kafaalat beneficiary', ur: 'گھرانہ کفالت کا فعال مستفید ہونا چاہیے' },
        evaluate: (p) => {
          if (p.isKafaalatBeneficiary === true) return 'MET';
          if (p.isKafaalatBeneficiary === false) return 'UNMET';
          return 'UNKNOWN';
        },
        weight: 'required'
      },
      {
        id: 'tw_school_age',
        description: { en: 'Must have school-age children (4-22 years) enrolled in school', ur: 'اسکول جانے کی عمر کے بچے ہونے چاہئیں' },
        evaluate: (p) => {
          if (p.hasSchoolAgeChildren === true) return 'MET';
          if (p.hasSchoolAgeChildren === false) return 'UNMET';
          return 'UNKNOWN';
        },
        weight: 'required'
      },
      {
        id: 'tw_attendance',
        description: { en: 'Children must maintain minimum 70% school attendance', ur: 'بچوں کی کم از کم 70% حاضری ہونی چاہیے' },
        evaluate: () => 'UNKNOWN', // can't determine remotely
        weight: 'required'
      }
    ],
    requiredDocuments: {
      en: ['CNIC of parent/guardian', 'B-Form of child', 'School enrollment certificate', 'Attendance record from school'],
      ur: ['والدین کا شناختی کارڈ', 'بچے کا بی فارم', 'اسکول داخلہ سرٹیفکیٹ', 'اسکول سے حاضری کا ریکارڈ']
    },
    registrationChannels: [
      { type: 'in_person', details: { en: 'Registration happens automatically if you are a Kafaalat beneficiary with school-age children', ur: 'کفالت مستفید ہونے پر خودکار رجسٹریشن ہوتی ہے' } },
      { type: 'helpline', details: { en: 'Contact BISP helpline 0800-26477 for enrollment status', ur: 'BISP ہیلپ لائن پر رابطہ کریں' }, phone: '0800-26477' }
    ],
    dependsOn: ['kafaalat'],
    importantNotes: {
      en: [
        'Girls receive HIGHER stipends than boys at every level (to encourage female education)',
        'Compliance is verified through school attendance records',
        'You must already be a Kafaalat beneficiary to qualify',
        'Stipend amount increases with education level'
      ],
      ur: [
        'لڑکیوں کو ہر سطح پر لڑکوں سے زیادہ وظیفہ ملتا ہے',
        'کفالت کا مستفید ہونا ضروری ہے'
      ]
    },
    paymentFrequency: 'Quarterly',
    lastUpdated: '2026-06-01'
  },
  {
    id: 'nashonuma',
    name: { en: 'Nashonuma (Nutrition Program)', ur: 'نشونما' },
    shortName: 'Nashonuma',
    type: 'nutrition',
    icon: 'heart-pulse',
    color: '#FB7185',
    benefit: {
      en: 'Specialized nutritious food (SNF) supplements + Rs. 2,000/quarter additional cash for pregnant/lactating women',
      ur: 'خصوصی غذائی سپلیمنٹس + حاملہ/دودھ پلانے والی خواتین کے لیے اضافی 2,000 روپے فی سہ ماہی'
    },
    description: {
      en: 'Stunting prevention program providing specialized nutritious food and conditional cash transfers to pregnant/lactating women and children under 2 years from Kafaalat beneficiary households.',
      ur: 'بچوں میں پست قامتی کی روک تھام کا پروگرام - حاملہ/دودھ پلانے والی خواتین اور 2 سال سے کم عمر بچوں کے لیے'
    },
    eligibilityCriteria: [
      {
        id: 'nash_kafaalat',
        description: { en: 'Must be an active Kafaalat beneficiary household', ur: 'کفالت کا فعال مستفید گھرانہ ہونا ضروری' },
        evaluate: (p) => {
          if (p.isKafaalatBeneficiary === true) return 'MET';
          if (p.isKafaalatBeneficiary === false) return 'UNMET';
          return 'UNKNOWN';
        },
        weight: 'required'
      },
      {
        id: 'nash_pregnant',
        description: { en: 'Must have pregnant/lactating woman OR child under 2 years in household', ur: 'حاملہ/دودھ پلانے والی خاتون یا 2 سال سے کم عمر بچہ ہونا ضروری' },
        evaluate: (p) => {
          if (p.hasPregnantMember || p.hasLactatingMember || p.hasChildrenUnder2) return 'MET';
          if (p.hasPregnantMember === false && p.hasLactatingMember === false && p.hasChildrenUnder2 === false) return 'UNMET';
          return 'UNKNOWN';
        },
        weight: 'required'
      }
    ],
    requiredDocuments: {
      en: ['CNIC of mother/guardian', 'B-Form of child (if applicable)', 'Pregnancy confirmation from health facility'],
      ur: ['ماں/سرپرست کا شناختی کارڈ', 'بچے کا بی فارم', 'صحت مرکز سے حمل کی تصدیق']
    },
    registrationChannels: [
      {
        type: 'in_person',
        details: {
          en: '⚠️ IMPORTANT: You can ONLY register in person at a Nashonuma Facilitation Centre, typically located inside District Headquarters Hospital (DHQ) or Tehsil Headquarters Hospital (THQ). Online registration is NOT available.',
          ur: '⚠️ اہم: صرف ذاتی طور پر نشونما مرکز پر رجسٹریشن ہو سکتی ہے، جو عام طور پر ڈسٹرکٹ ہیڈ کوارٹر ہسپتال میں ہوتا ہے'
        },
        location: 'DHQ/THQ Hospital Nashonuma Centre'
      }
    ],
    dependsOn: ['kafaalat'],
    importantNotes: {
      en: [
        '⚠️ Registration is IN-PERSON ONLY at DHQ/THQ hospitals — NOT available online',
        'Regular health checkups at the Nashonuma Centre are required',
        'The specialized nutritious food (SNF) is provided free of cost',
        'You must already be a Kafaalat beneficiary to qualify'
      ],
      ur: [
        '⚠️ رجسٹریشن صرف ذاتی طور پر DHQ/THQ ہسپتالوں میں ہوتی ہے',
        'کفالت کا مستفید ہونا ضروری ہے'
      ]
    },
    paymentFrequency: 'Quarterly (cash) + Monthly (food supplements)',
    lastUpdated: '2026-06-01'
  },
  {
    id: 'sehat_sahulat',
    name: { en: 'Sehat Sahulat / PM Health Card', ur: 'صحت سہولت / وزیراعظم ہیلتھ کارڈ' },
    shortName: 'Sehat Card',
    type: 'healthcare',
    icon: 'shield-plus',
    color: '#60A5FA',
    benefit: {
      en: 'Free in-patient hospital treatment up to Rs. 1,000,000/year per family',
      ur: 'فی خاندان سالانہ 10 لاکھ روپے تک مفت ہسپتال علاج'
    },
    description: {
      en: 'Universal health coverage program. Your CNIC itself serves as your health card — no separate card needed. Coverage includes in-patient treatment (surgeries, hospitalization) but NOT outpatient/OPD visits or routine checkups.',
      ur: 'آپ کا شناختی کارڈ ہی آپ کا ہیلتھ کارڈ ہے۔ داخلی مریضوں کا علاج شامل ہے لیکن OPD نہیں'
    },
    eligibilityCriteria: [
      {
        id: 'sehat_cnic',
        description: { en: 'Valid CNIC required — your CNIC IS your Sehat Card', ur: 'شناختی کارڈ ضروری ہے — آپ کا شناختی کارڈ ہی صحت کارڈ ہے' },
        evaluate: (p) => p.cnicNumber ? 'MET' : 'UNKNOWN',
        weight: 'required'
      },
      {
        id: 'sehat_province',
        description: { en: 'Coverage and hospital access varies by province on your CNIC', ur: 'آپ کے شناختی کارڈ پر صوبے کے مطابق کوریج مختلف ہے' },
        evaluate: (p) => p.province ? 'MET' : 'UNKNOWN',
        weight: 'required'
      }
    ],
    requiredDocuments: {
      en: ['CNIC (this IS your health card)', 'Hospital admission documents'],
      ur: ['شناختی کارڈ (یہی آپ کا ہیلتھ کارڈ ہے)', 'ہسپتال داخلے کے کاغذات']
    },
    registrationChannels: [
      { type: 'sms', details: { en: 'SMS your CNIC number to 8500 to check coverage status', ur: 'اپنا شناختی کارڈ نمبر 8500 پر SMS کریں' }, smsCode: '8500' },
      { type: 'web_portal', details: { en: 'Check coverage at pmhealthprogram.gov.pk', ur: 'آن لائن چیک کریں' }, url: 'https://pmhealthprogram.gov.pk' },
      { type: 'helpline', details: { en: 'Call Sehat Sahulat helpline 0800-00-786', ur: 'ہیلپ لائن 0800-00-786' }, phone: '0800-00-786' }
    ],
    provinceVariations: [
      {
        province: 'punjab',
        description: { en: 'Punjab Sehat Card currently works ONLY at private empaneled hospitals — NOT at government hospitals', ur: 'پنجاب میں صحت کارڈ صرف نجی ہسپتالوں میں کام کرتا ہے' },
        isAvailable: true,
        hospitalType: 'private_only',
        restrictions: ['Private empaneled hospitals only', 'In-patient treatment only (no OPD)']
      },
      {
        province: 'kpk',
        description: { en: 'KP runs its own Sehat Card Plus program with broader coverage at both public and private hospitals', ur: 'خیبرپختونخوا میں صحت کارڈ پلس پروگرام ہے' },
        isAvailable: true,
        hospitalType: 'both'
      },
      {
        province: 'sindh',
        description: { en: 'Sindh has its own Peoples Health Card (Awami Sehat Card) with provincial administration', ur: 'سندھ میں عوامی صحت کارڈ ہے' },
        isAvailable: true,
        hospitalType: 'both'
      },
      {
        province: 'balochistan',
        description: { en: 'Balochistan Sehat Card operates through both public and private empaneled hospitals', ur: 'بلوچستان میں سرکاری اور نجی دونوں ہسپتالوں میں کام کرتا ہے' },
        isAvailable: true,
        hospitalType: 'both'
      },
      {
        province: 'islamabad',
        description: { en: 'Islamabad is covered under the federal PM Health Card program', ur: 'اسلام آباد وفاقی پروگرام کے تحت آتا ہے' },
        isAvailable: true,
        hospitalType: 'both'
      },
      {
        province: 'ajk',
        description: { en: 'AJK is covered under the federal Sehat Sahulat program', ur: 'آزاد کشمیر وفاقی پروگرام کے تحت' },
        isAvailable: true,
        hospitalType: 'both'
      },
      {
        province: 'gilgit_baltistan',
        description: { en: 'Gilgit-Baltistan is covered under the federal Sehat Sahulat program', ur: 'گلگت بلتستان وفاقی پروگرام کے تحت' },
        isAvailable: true,
        hospitalType: 'both'
      }
    ],
    importantNotes: {
      en: [
        '⚠️ COVERS IN-PATIENT TREATMENT ONLY — OPD visits and routine checkups are NOT covered',
        'Your CNIC is your health card — no separate card needed',
        'In Punjab, the card ONLY works at private empaneled hospitals',
        'Coverage up to Rs. 10 Lakh (1,000,000) per family per year',
        'Secondary care: Rs. 400,000/year | Tertiary/specialized: Rs. 1,000,000/year'
      ],
      ur: [
        '⚠️ صرف داخلی مریضوں کا علاج شامل ہے — OPD شامل نہیں',
        'شناختی کارڈ ہی ہیلتھ کارڈ ہے',
        'پنجاب میں صرف نجی ہسپتالوں میں کام کرتا ہے'
      ]
    },
    paymentFrequency: 'Per treatment (cashless at empaneled hospitals)',
    lastUpdated: '2026-06-01'
  },
  {
    id: 'ramzan_relief',
    name: { en: 'Ramzan Relief Package', ur: 'رمضان ریلیف پیکیج' },
    shortName: 'Ramzan Relief',
    type: 'seasonal',
    icon: 'package',
    color: '#C084FC',
    benefit: {
      en: 'Free food package containing flour, sugar, cooking oil, pulses, and other essentials during Ramadan',
      ur: 'رمضان میں مفت راشن پیکیج — آٹا، چینی، تیل، دالیں'
    },
    description: {
      en: 'Seasonal food assistance program during Ramadan providing essential food items to low-income families. Usually distributed through designated Utility Stores and distribution points.',
      ur: 'رمضان المبارک کے دوران کم آمدنی والے خاندانوں کو ضروری اشیائے خوردونوش فراہم کرنے کا پروگرام'
    },
    eligibilityCriteria: [
      {
        id: 'ramzan_cnic',
        description: { en: 'Valid CNIC required', ur: 'شناختی کارڈ ضروری ہے' },
        evaluate: (p) => p.cnicNumber ? 'MET' : 'UNKNOWN',
        weight: 'required'
      },
      {
        id: 'ramzan_income',
        description: { en: 'Low-income household', ur: 'کم آمدنی والا گھرانہ' },
        evaluate: checkIncome,
        weight: 'strong_indicator'
      }
    ],
    requiredDocuments: {
      en: ['CNIC (original)', 'Utility Store Corporation card (if registered)'],
      ur: ['شناختی کارڈ', 'یوٹیلیٹی سٹور کارڈ']
    },
    registrationChannels: [
      { type: 'in_person', details: { en: 'Visit designated Utility Stores Corporation (USC) outlets or government distribution points during Ramadan', ur: 'رمضان میں یوٹیلیٹی سٹور یا حکومتی تقسیم مراکز پر جائیں' } },
      { type: 'sms', details: { en: 'Check registration via SMS to 8171', ur: '8171 پر SMS سے چیک کریں' }, smsCode: '8171' }
    ],
    importantNotes: {
      en: [
        'This is a seasonal program — only available during Ramadan',
        'Distribution points and eligibility criteria may vary by year',
        'Kafaalat beneficiaries are usually automatically included'
      ],
      ur: [
        'یہ صرف رمضان میں دستیاب ہے',
        'کفالت مستفیدین عام طور پر خودکار شامل ہوتے ہیں'
      ]
    },
    paymentFrequency: 'Annual (during Ramadan)',
    lastUpdated: '2026-06-01'
  }
];

export function getProgramById(id: string): Program | undefined {
  return PROGRAMS.find(p => p.id === id);
}

export function getProgramsByType(type: Program['type']): Program[] {
  return PROGRAMS.filter(p => p.type === type);
}
