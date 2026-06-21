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
    name: {
      en: 'Benazir Kafaalat',
      ur: 'بے نظیر کفالت',
      sd: 'بينظير ڪفالت',
      ps: 'بینظیر کفالت',
      pn: 'بے نظیر کفالت',
      bl: 'بے نظیر کفالت'
    },
    shortName: 'Kafaalat',
    type: 'cash_transfer',
    icon: 'banknote',
    color: '#E3BE7E',
    benefit: {
      en: 'Rs. 14,500 per quarter (Rs. 4,833/month)',
      ur: 'فی سہ ماہی 14,500 روپے (4,833 روپے ماہانہ)',
      sd: 'ٽماهي 14,500 رپيا (4,833 رپيا ماهوار)',
      ps: 'فی درې میاشتې ۱۴،۵۰۰ روپۍ (۴،۸۳۳ روپۍ میاشتنی)',
      pn: 'فی سہ ماہی 14,500 روپے (4,833 روپے ماہوار)',
      bl: 'سہ ماہی 14,500 کلدار (4,833 کلدار ماہانہ)'
    },
    description: {
      en: 'Unconditional cash transfer program for the poorest households in Pakistan, administered by BISP. Eligibility is determined through the National Socio-Economic Registry (NSER) Dynamic Survey and Proxy Means Test (PMT) scoring system.',
      ur: 'پاکستان کے غریب ترین گھرانوں کے لیے غیر مشروط نقد رقم کی منتقلی کا پروگرام جس کا انتظام BISP کے پاس ہے۔ اہلیت کا تعین نادرا اور NSER متحرک سروے کے ذریعے ہوتا ہے۔',
      sd: 'پاڪستان جي غريب ترين گهراڻن لاءِ غير مشروط نقد رقم جي منتقلي جو پروگرام جيڪو BISP پاران هلايو وڃي ٿو.',
      ps: 'د پاکستان ترټولو بې وزله کورنیو لپاره د نغدو پیسو غیر مشروط لیږد برنامه چې د BISP لخوا اداره کیږي.',
      pn: 'پاکستان دے غریب ترین گھرانیاں لئی غیر مشروط نقد رقم دی منتقلی دا پروگرام جیہڑا BISP چلائوندا اے۔',
      bl: 'پاکستان ءِ غریب ترینیں لوگانی واستہ غیر مشروط نقد کمک ءِ منتقلی ءِ پروگرام کہ آئی ءِ انتظام BISP ءِ گوما انت۔'
    },
    eligibilityCriteria: [
      {
        id: 'kafaalat_pmt',
        description: {
          en: 'Household PMT score below 32 (or below 37 for persons with disabilities)',
          ur: 'گھرانے کا PMT سکور 32 سے کم ہو (یا معذور افراد کے لیے 37 سے کم)',
          sd: 'گهر جو PMT اسڪور 32 کان گهٽ هجي (معذورن لاءِ 37 کان گهٽ)',
          ps: 'د کورنۍ PMT نمره له ۳۲ څخه کم وي (د معلولینو لپاره له ۳۷ څخه کم)',
          pn: 'گھر دا PMT سکور 32 توں گھٹ ہووے (یا معذوراں لئی 37 توں گھٹ)',
          bl: 'لوگ ءِ PMT اسکور چہ 32 ءَ کمتر بہ بیت (یا معذوراں واستہ چہ 37 ءَ کمتر)'
        },
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
        description: {
          en: 'Valid CNIC (Computerized National Identity Card) required',
          ur: 'درست شناختی کارڈ ضروری ہے',
          sd: 'درست شناختي ڪارڊ هجڻ ضروري آهي',
          ps: 'درست شناختي کارډ درلودل اړین دي',
          pn: 'درست شناختی کارڈ ضروری اے',
          bl: 'درستیں شناختی کارڈ ءِ بیگ المی انت'
        },
        evaluate: (p) => p.cnicNumber ? 'MET' : 'UNKNOWN',
        weight: 'required'
      },
      {
        id: 'kafaalat_income',
        description: {
          en: 'Low-income household (daily wage, unemployed, or monthly income under Rs. 35,000)',
          ur: 'کم آمدنی والا گھرانہ (دیہاڑی دار، بے روزگار، یا ماہانہ آمدنی 35,000 روپے سے کم)',
          sd: 'گهٽ آمدني وارو گهراڻو (ڏهاڙي وارو، بيروزگار، يا 35,000 کان گهٽ آمدني)',
          ps: 'کم عاید لرونکې کورنۍ (ورځنی مزدوري، وزګار، یا میاشتنی عاید له ۳۵،۰۰۰ روپۍ څخه کم)',
          pn: 'گھٹ آمدنی والا گھرانہ (دیہاڑی دار، بے روزگار، یا ماہوار آمدنی 35,000 توں گھٹ)',
          bl: 'کم درآمدیں لوگ (روچ کار، بے روزگار، یا ماہانہ آمدنی چہ 35,000 ءَ کمتر)'
        },
        evaluate: checkIncome,
        weight: 'strong_indicator'
      },
      {
        id: 'kafaalat_female_head',
        description: {
          en: 'Payment is made to the female head of household',
          ur: 'ادائیگی خاندان کی خاتون سربراہ کو کی جاتی ہے',
          sd: 'ادائيگي گهر جي عورت سربراهه کي ڪئي ويندي آهي',
          ps: 'تادیه د کورنۍ ښځینه مشرې ته کیږي',
          pn: 'ادائیگی گھر دی خاتون سربراہ نوں کیتی جاندی اے',
          bl: 'ادائیگی لوگ ءِ زالبولیں کشر ءَ دیگ بیت'
        },
        evaluate: () => 'MET',
        weight: 'supporting'
      }
    ],
    requiredDocuments: {
      en: ['CNIC (original)', 'B-Form for children (if applicable)', 'Mobile phone registered to CNIC'],
      ur: ['شناختی کارڈ (اصل)', 'بچوں کا بی فارم (اگر لاگو ہو)', 'شناختی کارڈ پر رجسٹرڈ موبائل فون'],
      sd: ['اصل شناختي ڪارڊ', 'ٻارن جو بي فارم', 'شناختي ڪارڊ تي رجسٽرڊ موبائل فون نمبر'],
      ps: ['اصل شناختي کارډ', 'د ماشومانو بي فارم', 'په شناختي کارډ راجستر شوې ګرځنده شمېره'],
      pn: ['شناختی کارڈ (اصل)', 'بچیاں دا بی فارم', 'شناختی کارڈ تے رجسٹرڈ موبائل فون نمبر'],
      bl: ['اصل شناختی کارڈ', 'چورگانی بی فارم', 'شناختی کارڈ ءَ رجسٹرڈیں موبائل نمبر']
    },
    registrationChannels: [
      {
        type: 'sms',
        details: {
          en: 'Send your CNIC number via SMS to 8171 to check eligibility status',
          ur: 'اہلیت کی حالت چیک کرنے کے لیے اپنا شناختی کارڈ نمبر 8171 پر ایس ایم ایس کریں',
          sd: 'اهليت چيڪ ڪرڻ لاءِ پنهنجو شناختي ڪارڊ نمبر 8171 تي ايس ايم ايس ڪريو',
          ps: 'د وړتیا معلومولو لپاره خپل شناختي کارډ نمبر 8171 ته ایس ایم ایس کړئ',
          pn: 'اہلیت چیک کرن لئی اپنا شناختی کارڈ نمبر 8171 تے ایس ایم ایس کرو',
          bl: 'وتی شناختی کارڈ نمبر ءَ 8171 ءَ دیم دی ات داں وتی اہلیت معلوم بہ بیت'
        },
        smsCode: '8171'
      },
      {
        type: 'web_portal',
        details: {
          en: 'Check status online at 8171.bisp.gov.pk',
          ur: '8171.bisp.gov.pk پر آن لائن اہلیت کی تفصیلات دیکھیں',
          sd: 'آن لائن چيڪ ڪريو 8171.bisp.gov.pk تي',
          ps: 'د وړتیا آنلاین کتلو لپاره 8171.bisp.gov.pk ته لاړ شئ',
          pn: '8171.bisp.gov.pk تے آن لائن چیک کرو',
          bl: '8171.bisp.gov.pk ءِ ویب سائٹ ءَ آن لائن اہلیت بچار ات'
        },
        url: 'https://8171.bisp.gov.pk'
      },
      {
        type: 'helpline',
        details: {
          en: 'Call BISP helpline 0800-26477',
          ur: 'بے نظیر انکم سپورٹ کی ہیلپ لائن 0800-26477 پر کال کریں',
          sd: 'BISP هيلپ لائن نمبر 0800-26477 تي ڪال ڪريو',
          ps: 'د BISP هيلپ لائن نمبر 0800-26477 ته زنګ ووهئ',
          pn: 'BISP ہیلپ لائن نمبر 0800-26477 تے کال کرو',
          bl: 'BISP ءِ ہیلپ لائن نمبر 0800-26477 ءَ فون کن ات'
        },
        phone: '0800-26477'
      },
      {
        type: 'in_person',
        details: {
          en: 'Visit nearest BISP Tehsil office with CNIC',
          ur: 'اپنے اصل شناختی کارڈ کے ہمراہ قریبی BISP تحصیل دفتر تشریف لے جائیں',
          sd: 'پنهنجي قريبي BISP تحصيل آفيس جو دورو ڪريو',
          ps: 'خپل نږدې د BISP تحصیل دفتر ته ورشئ',
          pn: 'اپنے قریبی BISP تحصیل دفتر جاؤ',
          bl: 'وتی قریبی BISP ءِ تحصیل دفتر ءَ تشریف بار ات'
        }
      }
    ],
    importantNotes: {
      en: [
        'Payment is made quarterly (every 3 months)',
        'Amount was increased to Rs. 14,500 in 2024',
        'Biometric verification (thumb impression) required for withdrawal',
        'Government employees and their households are NOT eligible'
      ],
      ur: [
        'ادائیگی سہ ماہی بنیاد پر کی جاتی ہے (ہر 3 ماہ بعد)',
        'سال 2024 میں رقم بڑھا کر 14,500 روپے کر دی گئی تھی',
        'رقم نکلوانے کے لیے بائیومیٹرک تصدیق (انگوٹھے کا نشان) لازمی ہے',
        'سرکاری ملازمین اور ان کے گھرانے اس پروگرام کے اہل نہیں ہیں'
      ],
      sd: [
        'ادائيگي ٽماهي ڪئي ويندي آهي',
        'بائيوميٽرڪ تصديق رقم ڪڍڻ لاءِ ضروري آهي',
        'سرڪاري ملازم اهل ناهن'
      ],
      ps: [
        'تادیه په هرو دریو میاشتو کې کیږي',
        'د پیسو اخیستلو لپاره بایومیټریک تصدیق اړین دی',
        'دولتي کارمندان د دې پروګرام مستحق نه دي'
      ],
      pn: [
        'ادائیگی ہر تن مہینے بعد کیتی جاندی اے',
        'بائیومیٹرک تصدیق رقم نکلوان لئی ضروری اے',
        'سرکاری ملازم اہل نہیں ہین'
      ],
      bl: [
        'ادائیگی سہ ماہی (ہمک 3 ماہ ءَ پد) بیت',
        'رقم کشگ واستہ بائیومیٹرک تصدیق المی انت',
        'سرکاری ملازمیں بندہ اہلیت نہ دارنت'
      ]
    },
    paymentFrequency: 'Quarterly',
    lastUpdated: '2026-06-01'
  },
  {
    id: 'taleemi_wazaif',
    name: {
      en: 'Taleemi Wazaif (Education Stipend)',
      ur: 'تعلیمی وظائف',
      sd: 'تعليمي وظائفا',
      ps: 'تعليمي وظیفې',
      pn: 'تعلیمی وظائف',
      bl: 'تعلیمی وظائف'
    },
    shortName: 'Taleemi Wazaif',
    type: 'education',
    icon: 'graduation-cap',
    color: '#5BBFA0',
    benefit: {
      en: 'Rs. 2,500/quarter (primary boys), Rs. 3,000 (primary girls), Rs. 3,500 (secondary boys), Rs. 4,000 (secondary girls), Rs. 4,500 (higher secondary)',
      ur: 'پرائمری: لڑکے 2500 روپے، لڑکیاں 3000 روپے۔ سیکنڈری: لڑکے 3500 روپے، لڑکیاں 4000 روپے۔ ہائر سیکنڈری: 4500 روپے فی سہ ماہی',
      sd: 'ٽماهي 2,500 کان 4,500 رپيا (ڇوڪرين لاءِ وڌيڪ وظيفو)',
      ps: 'درې میاشتنی له ۲،۵۰۰ څخه تر ۴،۵۰۰ روپۍ پورې (د نجونو لپاره لوړ وظایف)',
      pn: 'پرائمری: منڈے 2500 روپے، کڑیاں 3000 روپے فی سہ ماہی',
      bl: 'پرائمری: بچکاں واستہ 2500، جنکاں واستہ 3000 کلدار سہ ماہی'
    },
    description: {
      en: 'Conditional cash transfer for education. Children of Kafaalat beneficiary households receive quarterly stipends for school attendance. Girls receive higher amounts to encourage female education.',
      ur: 'تعلیم کے لیے مشروط نقد رقم کی منتقلی۔ بے نظیر کفالت کی مستفید خواتین کے بچوں کو اسکول حاضری برقرار رکھنے پر وظائف دیے جاتے ہیں، لڑکیوں کے لیے زیادہ رقم مقرر ہے۔',
      sd: 'تعليم لاءِ مشروط مالي مدد جو پروگرام. ڪفالت ڪارڊ رکندڙن جا ٻار اسڪول وڃڻ تي وظيفو حاصل ڪري سگهن ٿا.',
      ps: 'د زده کړې لپاره مشروط مالي ملاتړ. د کفالت ګټه اخیستونکو ماشومان ښوونځي ته د تللو په بدل کې مرستې ترلاسه کوي.',
      pn: 'تعلیم لئی مشروط مالی امداد دا پروگرام۔ کفالت مستفیدین دے بچے وظیفہ حاصل کر سکدے ہین۔',
      bl: 'تعلیم واستہ مشروطیں نقد منتقلی ءِ پروگرام۔ کفالت ءِ فائدہ زوراکیں لوگانی چورگاں اسکول روگ ءَ پد وظیفہ دیگ بیت۔'
    },
    eligibilityCriteria: [
      {
        id: 'tw_kafaalat',
        description: {
          en: 'Household must be an active Kafaalat beneficiary',
          ur: 'گھرانہ بے نظیر کفالت کا باقاعدہ مستفید ہونا چاہیے',
          sd: 'گهر بينظير ڪفالت جو فعال مستفيد هجي',
          ps: 'کورنۍ باید د بینظیر کفالت فعاله ګټه اخیستونکې وي',
          pn: 'گھرانہ بے نظیر کفالت دا سرگرم مستفید ہووے',
          bl: 'خاندان بے نظیر کفالت ءِ فعالیں ممبر بہ بیت'
        },
        evaluate: (p) => {
          if (p.isKafaalatBeneficiary === true) return 'MET';
          if (p.isKafaalatBeneficiary === false) return 'UNMET';
          return 'UNKNOWN';
        },
        weight: 'required'
      },
      {
        id: 'tw_school_age',
        description: {
          en: 'Must have school-age children (4-22 years) enrolled in school',
          ur: 'اسکول جانے کی عمر کے بچے (4 سے 22 سال) اسکول میں داخل ہونے چاہئیں',
          sd: 'اسڪول وڃڻ جي عمر جا ٻار (4-22 سال) اسڪول ۾ داخل هجن',
          ps: 'د ښوونځي عمر لرونکي ماشومان (۴-۲۲ کلن) باید ښوونځي کې شامل وي',
          pn: 'اسکول جان والے بچے (4 توں 22 سال) اسکول داخل ہوون',
          bl: 'لوگ ءَ اسکول روگءِ عمرءِ چورگ (4 چہ 22 سال) بہ بنت'
        },
        evaluate: (p) => {
          if (p.hasSchoolAgeChildren === true) return 'MET';
          if (p.hasSchoolAgeChildren === false) return 'UNMET';
          return 'UNKNOWN';
        },
        weight: 'required'
      },
      {
        id: 'tw_attendance',
        description: {
          en: 'Children must maintain minimum 70% school attendance',
          ur: 'بچوں کی اسکول میں کم از کم 70 فیصد حاضری ضروری ہے',
          sd: 'ٻارن جي اسڪول ۾ حاضري گهٽ ۾ گهٽ 70% هجڻ گهرجي',
          ps: 'ماشومان باید په ښوونځي کې لږترلږه ۷۰٪ حاضري ولري',
          pn: 'بچیاں دی اسکول وچ حاضری گھٹ توں گھٹ 70% ہونی چاہی دی اے',
          bl: 'چورگانی اسکول ءَ حاضری کم چہ کم 70% بہ بیت'
        },
        evaluate: () => 'UNKNOWN',
        weight: 'required'
      }
    ],
    requiredDocuments: {
      en: ['CNIC of parent/guardian', 'B-Form of child', 'School enrollment certificate', 'Attendance record from school'],
      ur: ['والدین یا سرپرست کا شناختی کارڈ', 'بچے کا نادرا کا جاری کردہ بی فارم', 'اسکول داخلہ سرٹیفکیٹ (تصدیق شدہ)', 'اسکول سے حاضری کا ریکارڈ'],
      sd: ['والدین جو سڃاڻپ ڪارڊ', 'ٻار جو بي فارم', 'اسڪول داخلہ سرٽيفڪيٽ'],
      ps: ['د مور او پلار شناختي کارډ', 'د ماشوم بي فارم', 'د ښوونځي د شاملیدو تصدیق پاڼه'],
      pn: ['والدین دا شناختی کارڈ', 'بچے دا بی فارم', 'اسکول داخلہ سرٹیفکیٹ'],
      bl: ['مات ءُ پت ءِ شناختی کارڈ', 'چورگ ءِ بی فارم', 'اسکول ءِ داخلہ فارم']
    },
    registrationChannels: [
      {
        type: 'in_person',
        details: {
          en: 'Registration happens automatically if you are a Kafaalat beneficiary with school-age children',
          ur: 'بے نظیر کفالت کا مستفید ہونے پر بچوں کے تعلیمی وظائف کی رجسٹریشن خودکار ہو جاتی ہے',
          sd: 'ڪفالت مستفيد ٿيڻ تي رجسٽريشن پاڻمرادو ٿي ويندي آهي',
          ps: 'د کفالت د ګټه اخیستنې په صورت کې نوم لیکنه په خپله کیږي',
          pn: 'کفالت دا مستفید ہون تے رجسٹریشن خودبخود ہو جاندی اے',
          bl: 'کفالت ءِ ممبر بیگ ءِ صورت ءَ رجسٹریشن وت بہ وت بیت'
        }
      },
      {
        type: 'helpline',
        details: {
          en: 'Contact BISP helpline 0800-26477 for enrollment status',
          ur: 'وظیفہ اور رجسٹریشن کی تفصیلات کے لیے BISP ہیلپ لائن 0800-26477 پر رابطہ کریں',
          sd: 'تفصيلن لاءِ 0800-26477 تي رابطو ڪريو',
          ps: 'د معلوماتو لپاره 0800-26477 ته اړیکه ونیسئ',
          pn: 'معلومات لئی 0800-26477 تے رابطہ کرو',
          bl: 'گیشیں معلومات واستہ 0800-26477 ءَ فون کن ات'
        },
        phone: '0800-26477'
      }
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
        'ہر تعلیمی سطح پر لڑکیوں کو لڑکوں سے زیادہ وظیفہ ملتا ہے تاکہ خواتین کی تعلیم کی حوصلہ افزائی ہو',
        'وظیفے کے تسلسل کے لیے حاضری کے ریکارڈ کی اسکول کے ذریعے تصدیق کی جاتی ہے',
        'اہلیت کے لیے پہلے سے بے نظیر کفالت کا مستفید ہونا لازمی ہے',
        'تعلیمی درجہ بڑھنے کے ساتھ وظیفے کی رقم میں بھی اضافہ ہوتا ہے'
      ],
      sd: [
        'ڇوڪرين کي ڇوڪرن کان وڌيڪ وظيفو ملي ٿو',
        'حاضري جي تصديق اسڪول رڪارڊ ذريعي ٿيندي آهي',
        'ڪفالت مستفيد هجڻ ضروري آهي'
      ],
      ps: [
        'نجونو ته د هلکانو په پرتله لوړ وظایف ورکول کیږي',
        'د حاضري تایید د ښوونځي د ریکاډ له لارې کیږي',
        'د کفالت ګټه اخیستونکی کیدل اړین دي'
      ],
      pn: [
        'کڑیاں نوں منڈیاں توں ودھ وظیفہ ملدا اے',
        'حاضری دی لوڑ اسکول دے ریکارڈ توں پوری ہوندی اے',
        'کفالت دا ممبر ہونا لازمی اے'
      ],
      bl: [
        'جنکاں واستہ وظیفہ چہ بچکاں ءَ گیش انت',
        'حاضری ءِ جانچ اسکول ءِ ریکارڈ ءَ چہ بیت',
        'کفالت ءِ ممبر بیگ لازمی انت'
      ]
    },
    paymentFrequency: 'Quarterly',
    lastUpdated: '2026-06-01'
  },
  {
    id: 'nashonuma',
    name: {
      en: 'Nashonuma (Nutrition Program)',
      ur: 'نشونما (غذائی پروگرام)',
      sd: 'نشونما (غذائي پروگرام)',
      ps: 'نشونما (د تغذیې پروګرام)',
      pn: 'نشونما (غذائی پروگرام)',
      bl: 'نشونما (غذائی پروگرام)'
    },
    shortName: 'Nashonuma',
    type: 'nutrition',
    icon: 'heart-pulse',
    color: '#FB7185',
    benefit: {
      en: 'Specialized nutritious food (SNF) supplements + Rs. 2,000/quarter additional cash for pregnant/lactating women',
      ur: 'مفت مخصوص غذائی سپلیمنٹس اور حاملہ یا دودھ پلانے والی خواتین کے لیے 2,000 روپے فی سہ ماہی اضافی امداد',
      sd: 'مفت غذائي سپليمنٽس ۽ ٽماهي 2,000 رپيا اضافي مالي مدد',
      ps: 'وړیا تغذیوي توکي او د امیندوارو ښځو لپاره ۲،۰۰۰ روپۍ درې میاشتنۍ نغدي مرسته',
      pn: 'غذائی پیکٹ تے 2,000 روپے فی سہ ماہی اضافی امداد',
      bl: 'غذائی سپلیمنٹس ءُ حاملہ زالبولاں واستہ 2,000 کلدار سہ ماہی اضافی زر'
    },
    description: {
      en: 'Stunting prevention program providing specialized nutritious food and conditional cash transfers to pregnant/lactating women and children under 2 years from Kafaalat beneficiary households.',
      ur: 'بچوں میں نشوونما کی کمی اور پسماندگی کی روک تھام کا پروگرام جو بے نظیر کفالت کے مستفید گھرانوں کی حاملہ یا دودھ پلانے والی ماؤں اور 2 سال سے کم عمر بچوں کو غذائی اشیاء فراہم کرتا ہے۔',
      sd: 'ٻارن جي وڌڻ ۽ صحت لاءِ پروگرام. ڪفالت ڪارڊ هولڊرن جي حامله عورتن ۽ ٻن سالن کان ننڍن ٻارن لاءِ.',
      ps: 'د ماشومانو د خوارځواکۍ مخنیوي پروګرام. د کفالت ګټه اخیستونکو امیندوارو ښځو او تر ۲ کلونو کم عمره ماشومانو لپاره.',
      pn: 'بچیاں دی نشونما لئی پروگرام۔ حاملہ ماواں تے 2 سال توں چھوٹے بچیاں لئی۔',
      bl: 'چورگانی نشونما واستہ پروگرام۔ حاملہ زالبولاں ءُ 2 سال چہ کستریں چورگاں واستہ۔'
    },
    eligibilityCriteria: [
      {
        id: 'nash_kafaalat',
        description: {
          en: 'Must be an active Kafaalat beneficiary household',
          ur: 'گھرانہ بے نظیر کفالت کا فعال مستفید ہونا چاہیے',
          sd: 'گهر بينظير ڪفالت جو فعال مستفيد هجي',
          ps: 'کورنۍ باید د بینظیر کفالت فعاله ګټه اخیستونکې وي',
          pn: 'گھرانہ بے نظیر کفالت دا ممبر ہووے',
          bl: 'خاندان بے نظیر کفالت ءِ فعالیں ممبر بہ بیت'
        },
        evaluate: (p) => {
          if (p.isKafaalatBeneficiary === true) return 'MET';
          if (p.isKafaalatBeneficiary === false) return 'UNMET';
          return 'UNKNOWN';
        },
        weight: 'required'
      },
      {
        id: 'nash_pregnant',
        description: {
          en: 'Must have pregnant/lactating woman OR child under 2 years in household',
          ur: 'گھرانے میں کوئی حاملہ یا دودھ پلانے والی خاتون یا 2 سال سے کم عمر بچہ ہونا چاہیے',
          sd: 'گهر ۾ حامله عورت يا 2 سالن کان ننڍو ٻار هجي',
          ps: 'په کور کې باید امیندواره ښځه یا تر ۲ کلونو کم عمره ماشوم وي',
          pn: 'گھر وچ حاملہ خاتون یا 2 سال توں چھوٹا بچہ ہووے',
          bl: 'لوگ ءَ حاملہ زالبول یا 2 سال چہ کستریں چورگ بہ بیت'
        },
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
      ur: ['ماں یا سرپرست کا شناختی کارڈ', 'بچے کا نادرا کا جاری کردہ بی فارم', 'صحت مرکز یا ہسپتال سے حمل کی تصدیق کی دستاویز'],
      sd: ['ماءُ جو سڃاڻپ ڪارڊ', 'ٻار جو بي فارم', 'حمل جي تصديق جو سرٽيفڪيٽ'],
      ps: ['د مور شناختي کارډ', 'د ماشوم بي فارم', 'د امیندوارۍ د تایید سند'],
      pn: ['ماں دا شناختی کارڈ', 'بچے دا بی فارم', 'حمل دی تصدیق دا کاغذ'],
      bl: ['مات ءِ شناختی کارڈ', 'چورگ ءِ بی فارم', 'حمل ءِ تصدیق نامہ']
    },
    registrationChannels: [
      {
        type: 'in_person',
        details: {
          en: '⚠️ IMPORTANT: You can ONLY register in person at a Nashonuma Facilitation Centre, typically located inside District Headquarters Hospital (DHQ) or Tehsil Headquarters Hospital (THQ). Online registration is NOT available.',
          ur: '⚠️ اہم: آپ صرف ذاتی طور پر نشونما مرکز پر رجسٹریشن کروا سکتے ہیں، جو عام طور پر ڈسٹرکٹ ہیڈ کوارٹر ہسپتال (DHQ) یا تحصیل ہسپتال (THQ) کے اندر واقع ہوتے ہیں۔ آن لائن رجسٹریشن دستیاب نہیں ہے۔',
          sd: '⚠️ اهم: رجسٽريشن صرف ذاتي طور تي DHQ/THQ اسپتال ۾ قائم نشونما مرڪز تي ٿيندي. آن لائن رجسٽريشن دستياب ناهي.',
          ps: '⚠️ مهم: نوم لیکنه یوازې په حضوري ډول په روغتونونو کې د نشونما په مرکز کې کیږي. آنلاین نوم لیکنه نشته.',
          pn: '⚠️ اہم: رجسٹریشن صرف ذاتی طور تے DHQ/THQ ہسپتال وچ نشونما مرکز تے ہوندی اے۔ آن لائن رجسٹریشن نہیں اے۔',
          bl: '⚠️ اہم: رجسٹریشن صرف ذاتی طور ءَ DHQ/THQ ہسپتال ءِ نشونما مرکز ءَ بیت۔ آن لائن رجسٹریشن نہ بیت۔'
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
        '⚠️ رجسٹریشن صرف ذاتی طور پر DHQ/THQ ہسپتالوں کے نشونما مراکز میں ہوتی ہے — آن لائن رجسٹریشن کی کوئی سہولت نہیں ہے',
        'نشونما مرکز پر باقاعدگی سے طبی معائنہ اور حاضری ضروری ہے',
        'مخصوص سپلیمنٹری غذائی خوراک بالکل مفت فراہم کی جاتی ہے',
        'اس پروگرام کے لیے خاندان کا پہلے سے بے نظیر کفالت کا مستفید ہونا لازمی ہے'
      ],
      sd: [
        '⚠️ رجسٽريشن صرف اسپتال ۾ نشونما مرڪز تي ٿيندي',
        'باقاعدگي سان چڪاس ضروري آهي',
        'مفت غذائي غذا ڏني ويندي آهي',
        'ڪفالت ڪارڊ هجڻ لازمي آهي'
      ],
      ps: [
        '⚠️ نوم لیکنه یوازې په روغتون کې په حضوري ډول کیږي',
        'په مرکز کې د روغتیا منظم معاینات اړین دي',
        'تغذیوي توکي په وړیا ډول ورکول کیږي',
        'د کفالت ګټه اخیستونکی کیدل اړین دي'
      ],
      pn: [
        '⚠️ رجسٹریشن صرف ہسپتال وچ نشونما مرکز تے ہوندی اے',
        'باقاعدہ طبی معائنہ ضروری اے',
        'غذائی خوراک بالکل مفت اے',
        'کفالت دا ممبر ہونا لازمی اے'
      ],
      bl: [
        '⚠️ رجسٹریشن صرف ذاتی طور ءَ ہسپتال ءِ نشونما مرکز ءَ بیت',
        'باقاعدگی ءَ معائنہ لازمی انت',
        'غذائی مواد مفت دیگ بیت',
        'کفالت ءِ ممبر بیگ لازمی انت'
      ]
    },
    paymentFrequency: 'Quarterly (cash) + Monthly (food supplements)',
    lastUpdated: '2026-06-01'
  },
  {
    id: 'sehat_sahulat',
    name: {
      en: 'Sehat Sahulat / PM Health Card',
      ur: 'صحت سہولت / وزیراعظم ہیلتھ کارڈ',
      sd: 'صحت سهولت / هيلٿ ڪارڊ',
      ps: 'صحت سهولت / د روغتیا کارت',
      pn: 'صحت سہولت / ہیلتھ کارڈ',
      bl: 'صحت سہولت / ہیلتھ کارڈ'
    },
    shortName: 'Sehat Card',
    type: 'healthcare',
    icon: 'shield-plus',
    color: '#60A5FA',
    benefit: {
      en: 'Free in-patient hospital treatment up to Rs. 1,000,000/year per family',
      ur: 'فی خاندان سالانہ 10 لاکھ روپے تک کا مفت ہسپتال علاج (ان ڈور علاج)',
      sd: 'هر سال في خاندان 10 لک رپين تائين مفت علاج',
      ps: 'په روغتون کې د هرې کورنۍ لپاره په کال کې تر ۱،۰۰۰،۰۰۰ روپۍ پورې وړیا درملنه',
      pn: 'فی خاندان سالانہ 10 لاکھ روپے تیک مفت علاج',
      bl: 'فی خاندان سالانہ 10 لاکھ کلدار تاں مفت ہسپتال علاج'
    },
    description: {
      en: 'Universal health coverage program. Your CNIC itself serves as your health card — no separate card needed. Coverage includes in-patient treatment (surgeries, hospitalization) but NOT outpatient/OPD visits or routine checkups.',
      ur: 'صحت کی عالمی کوریج کا پروگرام۔ آپ کا شناختی کارڈ ہی صحت کارڈ کا کام کرتا ہے۔ کوریج میں صرف داخل مریضوں کا علاج (سرجری، ہسپتال میں داخلہ) شامل ہے، او پی ڈی (OPD) شامل نہیں ہے۔',
      sd: 'يونيورسل هيلٿ پروگرام. سڃاڻپ ڪارڊ ئي صحت ڪارڊ آهي. صرف اسپتال داخل ٿيڻ تي مفت علاج ملندو، او پي ڊي شامل ناهي.',
      ps: 'د روغتیا نړیوال پروګرام. ستاسو شناختي کارډ د روغتیا کارت په توګه کار کوي. په روغتون کې بستر کیدل شامل دي خو او پي ډي (OPD) نشته.',
      pn: 'شناختی کارڈ ہی ہیلتھ کارڈ اے۔ صرف ہسپتال داخل ہون تے علاج مفت اے، او پی ڈی شامل نہیں اے۔',
      bl: 'شمی شناختی کارڈ ہی ہیلتھ کارڈ انت۔ صرف داخل مریضانی مفت علاج بیت، او پی ڈی شامل نہ انت۔'
    },
    eligibilityCriteria: [
      {
        id: 'sehat_cnic',
        description: {
          en: 'Valid CNIC required — your CNIC IS your Sehat Card',
          ur: 'درست شناختی کارڈ ضروری ہے — آپ کا شناختی کارڈ ہی آپ کا صحت کارڈ ہے',
          sd: 'شناختي ڪارڊ هجڻ ضروري آهي — سڃاڻپ ڪارڊ ئي صحت ڪارڊ آهي',
          ps: 'شناختي کارډ درلودل اړین دي — شناختي کارډ ستاسو د روغتیا کارت دی',
          pn: 'شناختی کارڈ ضروری اے — شناختی کارڈ ہی ہیلتھ کارڈ اے',
          bl: 'درست شناختی کارڈ المی انت — شناختی کارڈ ہی ہیلتھ کارڈ انت'
        },
        evaluate: (p) => p.cnicNumber ? 'MET' : 'UNKNOWN',
        weight: 'required'
      },
      {
        id: 'sehat_province',
        description: {
          en: 'Coverage and hospital access varies by province on your CNIC',
          ur: 'ہسپتالوں تک رسائی اور کوریج شناختی کارڈ پر درج صوبے کے مطابق مختلف ہے',
          sd: 'علاج ۽ اسپتال جي کوریج صوبي جي مطابق مختلف آهي',
          ps: 'د روغتیايي خدماتو پوښښ د ایالت په اساس توپیر لري',
          pn: 'کوریج صوبے دے مطابق مختلف اے',
          bl: 'کوریج صوبہ ءِ حساب ءَ مختلف بیت'
        },
        evaluate: (p) => p.province ? 'MET' : 'UNKNOWN',
        weight: 'required'
      }
    ],
    requiredDocuments: {
      en: ['CNIC (this IS your health card)', 'Hospital admission documents'],
      ur: ['اصل شناختی کارڈ (یہی صحت کارڈ ہے)', 'ہسپتال میں داخلے کی دستاویزات'],
      sd: ['اصل شناختي ڪارڊ', 'اسپتال ۾ داخل ٿيڻ جا ڪاغذ'],
      ps: ['اصل شناختي کارډ', 'په روغتون کې د بستر کیدو سندونه'],
      pn: ['اصل شناختی کارڈ', 'ہسپتال داخلے دے کاغذات'],
      bl: ['اصل شناختی کارڈ', 'ہسپتال ءَ داخلہ ءِ کاغذات']
    },
    registrationChannels: [
      {
        type: 'sms',
        details: {
          en: 'SMS your CNIC number to 8500 to check coverage status',
          ur: 'کوریج کی تفصیلات جاننے کے لیے اپنا شناختی کارڈ نمبر 8500 پر ایس ایم ایس کریں',
          sd: 'پنهنجو شناختي ڪارڊ نمبر 8500 تي ايس ايم ايس ڪريو',
          ps: 'خپل شناختي کارډ نمبر 8500 ته ایس ایم ایس کړئ',
          pn: 'اپنا شناختی کارڈ نمبر 8500 تے ایس ایم ایس کرو',
          bl: 'وتی شناختی کارڈ نمبر ءَ 8500 ءَ دیم دی ات'
        },
        smsCode: '8500'
      },
      {
        type: 'web_portal',
        details: {
          en: 'Check coverage at pmhealthprogram.gov.pk',
          ur: 'آن لائن کوریج چیک کرنے کے لیے pmhealthprogram.gov.pk پر جائیں',
          sd: 'آن لائن چيڪ ڪريو pmhealthprogram.gov.pk تي',
          ps: 'د پوښښ آنلاین معلومولو لپاره pmhealthprogram.gov.pk ته لاړ شئ',
          pn: 'pmhealthprogram.gov.pk تے آن لائن چیک کرو',
          bl: 'pmhealthprogram.gov.pk ءِ ویب سائٹ ءَ آن لائن اہلیت بہ چار ات'
        },
        url: 'https://pmhealthprogram.gov.pk'
      },
      {
        type: 'helpline',
        details: {
          en: 'Call Sehat Sahulat helpline 0800-00-786',
          ur: 'صحت سہولت پروگرام کی آفیشل ہیلپ لائن 0800-00-786 پر رابطہ کریں',
          sd: 'هيلپ لائن 0800-00-786 تي ڪال ڪريو',
          ps: 'د هيلپ لائن نمبر 0800-00-786 ته زنګ ووهئ',
          pn: 'ہیلپ لائن نمبر 0800-00-786 تے کال کرو',
          bl: 'ہیلپ لائن نمبر 0800-00-786 ءَ فون کن ات'
        },
        phone: '0800-00-786'
      }
    ],
    provinceVariations: [
      {
        province: 'punjab',
        description: {
          en: 'Punjab Sehat Card currently works ONLY at private empaneled hospitals — NOT at government hospitals',
          ur: 'پنجاب صحت کارڈ فی الحال صرف رجسٹرڈ نجی (پرائیویٹ) ہسپتالوں میں کام کرتا ہے — سرکاری ہسپتالوں میں نہیں',
          sd: 'پنجاب صحت ڪارڊ صرف خانگي اسپتالن ۾ ڪم ڪري ٿو',
          ps: 'د پنجاب صحت کارت یوازې په خصوصي روغتونونو کې کار کوي',
          pn: 'پنجاب صحت کارڈ صرف پرائیویٹ ہسپتالاں وچ چلدا اے',
          bl: 'پنجاب صحت کارڈ صرف نجی ہسپتالاں کار کنت'
        },
        isAvailable: true,
        hospitalType: 'private_only',
        restrictions: ['Private empaneled hospitals only', 'In-patient treatment only (no OPD)']
      },
      {
        province: 'kpk',
        description: {
          en: 'KP runs its own Sehat Card Plus program with broader coverage at both public and private hospitals',
          ur: 'خیبر پختونخوا میں صحت کارڈ پلس کے ذریعے سرکاری اور نجی دونوں ہسپتالوں میں کوریج دی جاتی ہے',
          sd: 'KPK ۾ صحت ڪارڊ پلس سرڪاري ۽ خانگي اسپتالن ۾ ڪم ڪري ٿو',
          ps: 'په خیبر پښتونخوا کې صحت کارت پلس په دولتي او خصوصي روغتونونو کې کار کوي',
          pn: 'کے پی وچ سرکاری تے پرائیویٹ دوواں ہسپتالاں وچ کوریج اے',
          bl: 'کے پی ءَ سرکاری ءُ نجی دویں ہسپتالاں کوریج دیگ بیت'
        },
        isAvailable: true,
        hospitalType: 'both'
      },
      {
        province: 'sindh',
        description: {
          en: 'Sindh has its own Peoples Health Card (Awami Sehat Card) with provincial administration',
          ur: 'سندھ میں عوامی صحت کارڈ کے نام سے صوبائی انتظام کے تحت کوریج فراہم کی جاتی ہے',
          sd: 'سنڌ ۾ عوامي صحت ڪارڊ جي تحت ڪوريج ڏني وڃي ٿي',
          ps: 'په سیند کې د عوامي صحت کارت په واسطه خدمات وړاندې کیږي',
          pn: 'سندھ وچ عوامی صحت کارڈ دے تحت کوریج اے',
          bl: 'سندھ ءَ عوامی صحت کارڈ دے تحت کوریج است'
        },
        isAvailable: true,
        hospitalType: 'both'
      },
      {
        province: 'balochistan',
        description: {
          en: 'Balochistan Sehat Card operates through both public and private empaneled hospitals',
          ur: 'بلوچستان صحت کارڈ کے تحت رجسٹرڈ سرکاری اور نجی دونوں ہسپتالوں میں مفت علاج کی سہولت ہے',
          sd: 'بلوچستان صحت ڪارڊ سرڪاري ۽ خانگي اسپتالن ۾ ڪم ڪري ٿو',
          ps: 'په بلوچستان کې صحت کارت په دولتي او خصوصي روغتونونو کې کار کوي',
          pn: 'بلوچستان وچ سرکاری تے پرائیویٹ ہسپتالاں وچ علاج اے',
          bl: 'بلوچستان ءَ سرکاری ءُ نجی ہسپتالاں علاج ءِ سہولت است'
        },
        isAvailable: true,
        hospitalType: 'both'
      },
      {
        province: 'islamabad',
        description: {
          en: 'Islamabad is covered under the federal PM Health Card program',
          ur: 'اسلام آباد کے شہریوں کے لیے وفاقی صحت سہولت پروگرام کے تحت علاج فراہم کیا جاتا ہے',
          sd: 'اسلام آباد وفاقي هيلٿ ڪارڊ پروگرام جي تحت اچي ٿو',
          ps: 'اسلام اباد د وفاقي روغتیا پروګرام تر پوښښ لاندې دی',
          pn: 'اسلام آباد وفاقی ہیلتھ پروگرام دے تحت اے',
          bl: 'اسلام آباد وفاقی ہیلتھ پروگرام دے تحت انت'
        },
        isAvailable: true,
        hospitalType: 'both'
      },
      {
        province: 'ajk',
        description: {
          en: 'AJK is covered under the federal Sehat Sahulat program',
          ur: 'آزاد کشمیر کے شہری وفاقی صحت سہولت پروگرام کے تحت مفت علاج کے اہل ہیں',
          sd: 'آزاد ڪشمير وفاقي پروگرام جي تحت اچي ٿو',
          ps: 'آزاد کشمیر د وفاقي روغتیا پروګرام تر پوښښ لاندې دی',
          pn: 'آزاد کشمیر وفاقی پروگرام دے تحت اے',
          bl: 'آزاد کشمیر وفاقی پروگرام دے تحت انت'
        },
        isAvailable: true,
        hospitalType: 'both'
      },
      {
        province: 'gilgit_baltistan',
        description: {
          en: 'Gilgit-Baltistan is covered under the federal Sehat Sahulat program',
          ur: 'گلگت بلتستان کے شہری وفاقی صحت سہولت پروگرام کے تحت رجسٹرڈ ہسپتالوں میں مفت علاج کروا سکتے ہیں',
          sd: 'گلگت بلتستان وفاقي صحت پروگرام تحت اچي ٿو',
          ps: 'ګلګت بلتستان د وفاقي روغتیا پروګرام تر پوښښ لاندې دی',
          pn: 'گلگت بلتستان وفاقی پروگرام دے تحت اے',
          bl: 'گلگت بلتستان وفاقی پروگرام دے تحت انت'
        },
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
        '⚠️ صرف داخل مریضوں کا ہسپتال کا علاج مفت ہے — او پی ڈی (OPD) یا ڈاکٹر کی فیس کوریج میں شامل نہیں ہے',
        'آپ کا شناختی کارڈ ہی صحت کارڈ ہے — کسی علیحدہ کارڈ کی ضرورت نہیں ہے',
        'پنجاب میں صحت کارڈ صرف مخصوص رجسٹرڈ نجی ہسپتالوں میں کام کرتا ہے',
        'کوریج کی حد سالانہ فی خاندان 10 لاکھ (1,000,000) روپے تک ہے',
        'ثانوی علاج: 4 لاکھ روپے سالانہ | خصوصی/سرجری علاج: 10 لاکھ روپے سالانہ'
      ],
      sd: [
        '⚠️ صرف اسپتال داخل ٿيڻ تي مفت علاج آهي — OPD شامل ناهي',
        'سڃاڻپ ڪارڊ ئي صحت ڪارڊ آهي',
        'پنجاب ۾ صرف پرائيويٽ اسپتالن ۾ ڪم ڪندو آهي',
        'حد ساليانو 10 لک رپيا في خاندان آهي'
      ],
      ps: [
        '⚠️ یوازې په روغتون کې بستر کیدل وړیا دي — OPD شامل نه دی',
        'شناختي کارډ د روغتیا کارت په توګه کارول کیږي',
        'په پنجاب کې یوازې په شخصي روغتونونو کې کار کوي',
        'پوښښ تر ۱۰ لکو روپیو پورې د هرې کورنۍ لپاره په کال کې دی'
      ],
      pn: [
        '⚠️ صرف ہسپتال داخل ہون تے علاج مفت اے — او پی ڈی شامل نہیں اے۔',
        'شناختی کارڈ ہی ہیلتھ کارڈ اے۔',
        'پنجاب وچ صرف پرائیویٹ ہسپتالاں وچ چلدا اے۔',
        'کوریج سالانہ 10 لاکھ روپے فی خاندان اے۔'
      ],
      bl: [
        '⚠️ صرف داخل مریضانی ہسپتال ءَ علاج مفت بیت — او پی ڈی شامل نہ انت۔',
        'شناختی کارڈ ہی ہیلتھ کارڈ انت۔',
        'پنجاب ءَ صحت کارڈ صرف مخصوص نجی ہسپتالاں کار کنت۔',
        'کوریج سالانہ 10 لاکھ کلدار فی خاندان انت۔'
      ]
    },
    paymentFrequency: 'Per treatment (cashless at empaneled hospitals)',
    lastUpdated: '2026-06-01'
  },
  {
    id: 'ramzan_relief',
    name: {
      en: 'Ramzan Relief Package',
      ur: 'رمضان ریلیف پیکیج',
      sd: 'رمضان ريليف پيڪيج',
      ps: 'د روژې میاشتې د مرستې کڅوړه',
      pn: 'رمضان ریلیف پیکیج',
      bl: 'رمضان ریلیف پیکیج'
    },
    shortName: 'Ramzan Relief',
    type: 'seasonal',
    icon: 'package',
    color: '#C084FC',
    benefit: {
      en: 'Free food package containing flour, sugar, cooking oil, pulses, and other essentials during Ramadan',
      ur: 'رمضان المبارک کے دوران آٹا، چینی، گھی، دالیں اور دیگر اشیاء پر مشتمل مفت راشن/سبسڈی پیکیج',
      sd: 'رمضان ۾ مفت راشن پيڪيج (آٽو، کنڊ، تيل وغيره)',
      ps: 'د روژې په میاشت کې وړیا خوراکي توکي (اوړه، بوره، غوړي او دال)',
      pn: 'رمضان وچ مفت راشن (آٹا، چینی، تیل، دالیں)',
      bl: 'رمضان المبارک ءَ مفت راشن پیکیج (آٹا، چینی، تیل، دالیں)'
    },
    description: {
      en: 'Seasonal food assistance program during Ramadan providing essential food items to low-income families. Usually distributed through designated Utility Stores and distribution points.',
      ur: 'رمضان المبارک کے مقدس مہینے میں کم آمدنی والے مستحق خاندانوں کو اشیائے خوردونوش کی فراہمی کا پروگرام۔ یہ اشیاء یوٹیلیٹی اسٹورز اور حکومت کے مقرر کردہ مراکز سے حاصل کی جا سکتی ہیں۔',
      sd: 'رمضان دوران غريب خاندانن لاءِ راشن پروگرام جيڪو يوٽيليٽي اسٽورن تان ملي ٿو.',
      ps: 'د روژې په میاشت کې د کم عاید لرونکو کورنیو لپاره د خوراکي توکو موسمي مرسته.',
      pn: 'رمضان وچ غریباں لئی راشن پروگرام جیہڑا یوٹیلیٹی اسٹوراں توں لبھدا اے۔',
      bl: 'رمضان ءَ غریبیں لوگاں واستہ راشن پیکیج کہ یوٹیلیٹی اسٹوراں چہ رس ات۔'
    },
    eligibilityCriteria: [
      {
        id: 'ramzan_cnic',
        description: {
          en: 'Valid CNIC required',
          ur: 'درست شناختی کارڈ ضروری ہے',
          sd: 'سڃاڻپ ڪارڊ هجڻ ضروري آهي',
          ps: 'شناختي کارډ درلودل اړین دي',
          pn: 'درست شناختی کارڈ ضروری اے',
          bl: 'درست شناختی کارڈ المی انت'
        },
        evaluate: (p) => p.cnicNumber ? 'MET' : 'UNKNOWN',
        weight: 'required'
      },
      {
        id: 'ramzan_income',
        description: {
          en: 'Low-income household',
          ur: 'کم آمدنی والا مستحق گھرانہ',
          sd: 'گهٽ آمدني وارو گهراڻو',
          ps: 'کم عاید لرونکې کورنۍ',
          pn: 'گھٹ آمدنی والا گھرانہ',
          bl: 'کم درآمدیں لوگ'
        },
        evaluate: checkIncome,
        weight: 'strong_indicator'
      }
    ],
    requiredDocuments: {
      en: ['CNIC (original)', 'Utility Store Corporation card (if registered)'],
      ur: ['اصل شناختی کارڈ', 'یوٹیلیٹی اسٹور کارپوریشن کا کارڈ (اگر رجسٹرڈ ہو)'],
      sd: ['اصل شناختي ڪارڊ', 'يوٽيليٽي اسٽور جو ڪارڊ'],
      ps: ['اصل شناختي کارډ', 'د یوټیلیټي سټور کارت (که راجستر وي)'],
      pn: ['اصل شناختی کارڈ', 'یوٹیلیٹی اسٹور دا کارڈ'],
      bl: ['اصل شناختی کارڈ', 'یوٹیلیٹی اسٹور کارڈ']
    },
    registrationChannels: [
      {
        type: 'in_person',
        details: {
          en: 'Visit designated Utility Stores Corporation (USC) outlets or government distribution points during Ramadan',
          ur: 'رمضان المبارک کے دوران قریبی یوٹیلیٹی اسٹورز (USC) یا حکومت کے قائم کردہ تقسیم کے مراکز پر جائیں',
          sd: 'رمضان ۾ يوٽيليٽي اسٽور يا سرڪاري تقسيم مرڪز تي وڃو',
          ps: 'د روژې په میاشت کې د یوټیلیټي سټورونو یا سرکاري ویشلو مرکزونو ته ورشئ',
          pn: 'رمضان وچ یوٹیلیٹی اسٹور یا سرکاری تقسیم مرکز تے جاؤ',
          bl: 'رمضان ءَ یوٹیلیٹی اسٹور یا سرکاری تقسیم مراکز ءَ بہ رو ات'
        }
      },
      {
        type: 'sms',
        details: {
          en: 'Check registration via SMS to 8171',
          ur: 'رجسٹریشن اور اہلیت کی تفصیلات چیک کرنے کے لیے 8171 پر ایس ایم ایس بھیجیں',
          sd: 'رجسٽريشن چيڪ ڪرڻ لاءِ 8171 تي ايس ايم ايس موڪليو',
          ps: 'د خپل ځان ثبتولو کتلو لپاره 8171 ته ایس ایم ایس وکړئ',
          pn: 'رجسٹریشن چیک کرن لئی 8171 تے ایس ایم ایس کرو',
          bl: 'رجسٹریشن چیک کنگ واستہ 8171 ءَ ایس ایم ایس کن ات'
        },
        smsCode: '8171'
      }
    ],
    importantNotes: {
      en: [
        'This is a seasonal program — only available during Ramadan',
        'Distribution points and eligibility criteria may vary by year',
        'Kafaalat beneficiaries are usually automatically included'
      ],
      ur: [
        'یہ ایک موسمی پروگرام ہے جو صرف رمضان کے مہینے میں دستیاب ہوتا ہے',
        'تقسیم کے مقامات اور اہلیت کا معیار سال بہ سال تبدیل ہو سکتا ہے',
        'بے نظیر کفالت کے مستفید خاندان عام طور پر اس پیکیج میں خودکار شامل ہوتے ہیں'
      ],
      sd: [
        'هي پروگرام صرف رمضان جي مهيني ۾ هوندو آهي',
        'طریقو ۽ اهليت هر سال تبديل ٿي سگهي ٿي',
        'ڪفالت مستفيد پاڻمرادو شامل هوندا آهن'
      ],
      ps: [
        'دا پروګرام یوازې د روژې په میاشت کې وي',
        'د ویشلو مرکزونه او وړتیا هر کال بدلیدلی شي',
        'د کفالت ګټه اخیستونکي په خپله شامل کیږي'
      ],
      pn: [
        'اے پروگرام صرف رمضان دے مہینے ہوندا اے۔',
        'کفالت دے ممبر خودبخود شامل ہوندے ہین۔'
      ],
      bl: [
        'اے پروگرام صرف رمضان المبارک ءِ ماہ ءَ است۔',
        'کفالت ءِ ممبر وت بہ وت شامل بیت۔'
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
