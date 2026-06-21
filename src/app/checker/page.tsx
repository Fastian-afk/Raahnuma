'use client';
import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import ResultsPanel from '@/components/results/ResultsPanel';
import { useLanguage } from '@/lib/i18n/context';
import { evaluateEligibility } from '@/lib/rules-engine/evaluator';
import { UserProfile, Province, EmploymentType, AssessmentResult } from '@/lib/rules-engine/types';
import {
  ChevronLeft, MapPin, Users, Briefcase, GraduationCap, Heart,
  ArrowRight, RotateCcw, MessageCircle, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

const PROVINCE_TRANSLATIONS: Record<Province, Record<string, string>> = {
  punjab: { en: 'Punjab', ur: 'پنجاب', sd: 'پنجاب', ps: 'پنجاب', pn: 'پنجاب', bl: 'پنجاب' },
  sindh: { en: 'Sindh', ur: 'سندھ', sd: 'سنڌ', ps: 'سندھ', pn: 'سندھ', bl: 'سندھ' },
  kpk: { en: 'Khyber Pakhtunkhwa', ur: 'خیبرپختونخوا', sd: 'خيبر پختونخوا', ps: 'خيبر پښتونخوا', pn: 'خیبر پختونخوا', bl: 'خیبر پختونخوا' },
  balochistan: { en: 'Balochistan', ur: 'بلوچستان', sd: 'بلوچستان', ps: 'بلوچستان', pn: 'بلوچستان', bl: 'بلوچستان' },
  islamabad: { en: 'Islamabad (ICT)', ur: 'اسلام آباد', sd: 'اسلام آباد', ps: 'اسلام آباد', pn: 'اسلام آباد', bl: 'اسلام آباد' },
  ajk: { en: 'Azad Jammu & Kashmir', ur: 'آزاد جموں و کشمیر', sd: 'آزاد ڪشمير', ps: 'آزاد کشمیر', pn: 'آزاد کشمیر', bl: 'آزاد کشمیر' },
  gilgit_baltistan: { en: 'Gilgit-Baltistan', ur: 'گلگت بلتستان', sd: 'گلگت بلتستان', ps: 'گلگت بلتستان', pn: 'گلگت بلتستان', bl: 'گلگت بلتستان' }
};

const PROVINCES: { value: Province }[] = [
  { value: 'punjab' },
  { value: 'sindh' },
  { value: 'kpk' },
  { value: 'balochistan' },
  { value: 'islamabad' },
  { value: 'ajk' },
  { value: 'gilgit_baltistan' },
];

const EMPLOYMENT_TRANSLATIONS: Record<EmploymentType, Record<string, string>> = {
  daily_wage: {
    en: 'Daily Wage Worker',
    ur: 'دیہاڑی دار مزدور',
    sd: 'ڏهاڙي تي ڪم ڪندڙ مزدور',
    ps: 'ورځنی مزدوري کونکی',
    pn: 'دیہاڑی دار مزدور',
    bl: 'روچ کاریں مزدور'
  },
  agricultural: {
    en: 'Agricultural / Farming',
    ur: 'زراعت / کاشتکاری',
    sd: 'زراعت / آبادگاري',
    ps: 'کرنه او مالداري',
    pn: 'کاشتکاری / کھیتی باڑی',
    bl: 'کاشتکاری / کہن'
  },
  domestic_worker: {
    en: 'Domestic Worker',
    ur: 'گھریلو ملازم',
    sd: 'گهريلو ملازم',
    ps: 'کورنی کارکونکی',
    pn: 'گھریلو ملازم',
    bl: 'لوگی کارندہ'
  },
  self_employed: {
    en: 'Self-Employed / Small Business',
    ur: 'ذاتی کاروبار / چھوٹا کاروبار',
    sd: 'ذاتي ڪاروبار / ننڍو واپار',
    ps: 'خپلواک کاروبار / وړوکی تجارت',
    pn: 'اپنا کاروبار',
    bl: 'وتی کاروبار'
  },
  salaried: {
    en: 'Salaried Employee',
    ur: 'تنخواہ دار ملازم',
    sd: 'پگهاردار ملازم',
    ps: 'معاش خور کارمند',
    pn: 'نوکری پیشہ',
    bl: 'ماہانہ تنخواہ والا'
  },
  unemployed: {
    en: 'Unemployed',
    ur: 'بے روزگار',
    sd: 'بيروزگار',
    ps: 'وزګار',
    pn: 'بے روزگار',
    bl: 'بے روزگار'
  },
  retired: {
    en: 'Retired',
    ur: 'ریٹائرڈ',
    sd: 'ريٽائرڊ',
    ps: 'تقاعد شوی',
    pn: 'ریٹائرڈ',
    bl: 'ریٹائرڈ'
  },
  unknown: {
    en: 'Unknown',
    ur: 'نامعلوم',
    sd: 'نامعلوم',
    ps: 'نامعلوم',
    pn: 'نامعلوم',
    bl: 'نامعلوم'
  }
};

const EMPLOYMENT_TYPES: { value: EmploymentType }[] = [
  { value: 'daily_wage' },
  { value: 'agricultural' },
  { value: 'domestic_worker' },
  { value: 'self_employed' },
  { value: 'salaried' },
  { value: 'unemployed' },
  { value: 'retired' },
];

const STEPS = [
  { id: 'province', icon: <MapPin className="w-5 h-5" /> },
  { id: 'household', icon: <Users className="w-5 h-5" /> },
  { id: 'income', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'children', icon: <GraduationCap className="w-5 h-5" /> },
  { id: 'kafaalat', icon: <ShieldCheck className="w-5 h-5" /> },
  { id: 'health', icon: <Heart className="w-5 h-5" /> },
];

export default function CheckerPage() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [profile, setProfile] = useState<UserProfile>({});

  const handleSubmit = () => {
    const assessment = evaluateEligibility(profile);
    setResults(assessment);
  };

  const reset = () => { setStep(0); setProfile({}); setResults(null); };

  if (results) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8 no-print">
            <div>
              <h1 className="text-3xl font-bold text-cream">
                {t('checker.results')}
              </h1>
              <p className="text-sage-400 mt-1">
                {t('checker.results.desc')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sage-400 hover:text-cream text-sm"
              >
                <RotateCcw className="w-4 h-4" /> {t('checker.start_over')}
              </button>
              <Link
                href="/navigator"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-emerald-950 text-sm font-bold"
              >
                <MessageCircle className="w-4 h-4" /> {t('checker.talk_to_ai')}
              </Link>
            </div>
          </div>
          <div className="glass rounded-2xl overflow-hidden">
            <ResultsPanel results={results} className="max-h-none" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-cream mb-2">{t('checker.title')}</h1>
          <p className="text-sage-400">{t('checker.desc')}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${i <= step ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'glass text-sage-600'}`}>{s.icon}</div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-gold-500/50' : 'bg-border-subtle'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Step 0: Province */}
          {step === 0 && (
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-cream mb-6">{t('checker.province')}</h2>
              <div className="grid grid-cols-2 gap-3">
                {PROVINCES.map(p => (
                  <button key={p.value} onClick={() => { setProfile(prev => ({ ...prev, province: p.value })); setStep(1); }}
                    className={`p-4 rounded-xl text-left transition-all ${profile.province === p.value ? 'bg-gold-500/15 border border-gold-500/30 text-gold-400' : 'glass text-sage-400 hover:text-cream hover:bg-emerald-800/30'}`}>
                    <div className="font-medium text-sm">{PROVINCE_TRANSLATIONS[p.value][language] || PROVINCE_TRANSLATIONS[p.value].en}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Household */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-cream mb-6">{t('checker.household')}</h2>
              <div className="grid grid-cols-4 gap-3">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                  <button key={n} onClick={() => { setProfile(prev => ({ ...prev, householdSize: n })); setStep(2); }}
                    className={`p-4 rounded-xl text-center font-bold text-lg transition-all ${profile.householdSize === n ? 'bg-gold-500/15 border border-gold-500/30 text-gold-400' : 'glass text-sage-400 hover:text-cream'}`}>
                    {n}{n === 12 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Employment */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-cream mb-6">{t('checker.income')}</h2>
              <div className="space-y-3">
                {EMPLOYMENT_TYPES.map(e => (
                  <button key={e.value} onClick={() => { setProfile(prev => ({ ...prev, employmentType: e.value })); setStep(3); }}
                    className={`w-full p-4 rounded-xl text-left transition-all ${profile.employmentType === e.value ? 'bg-gold-500/15 border border-gold-500/30 text-gold-400' : 'glass text-sage-400 hover:text-cream hover:bg-emerald-800/30'}`}>
                    {EMPLOYMENT_TRANSLATIONS[e.value][language] || EMPLOYMENT_TRANSLATIONS[e.value].en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Children */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-cream mb-6">{t('checker.children')}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { setProfile(prev => ({ ...prev, hasSchoolAgeChildren: true })); }}
                    className={`p-6 rounded-xl text-center transition-all ${profile.hasSchoolAgeChildren === true ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'glass text-sage-400 hover:text-cream'}`}>
                    <div className="text-2xl mb-2">✓</div>{t('yes')}
                  </button>
                  <button onClick={() => { setProfile(prev => ({ ...prev, hasSchoolAgeChildren: false })); setStep(4); }}
                    className={`p-6 rounded-xl text-center transition-all ${profile.hasSchoolAgeChildren === false ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' : 'glass text-sage-400 hover:text-cream'}`}>
                    <div className="text-2xl mb-2">✗</div>{t('no')}
                  </button>
                </div>
                {profile.hasSchoolAgeChildren && (
                  <div className="animate-fade-in-up">
                    <p className="text-sm text-sage-400 mb-3">How many school-age children?</p>
                    <div className="flex gap-3">
                      {[1,2,3,4,5,6].map(n => (
                        <button key={n} onClick={() => { setProfile(prev => ({ ...prev, schoolAgeChildrenCount: n })); setStep(4); }}
                          className="w-12 h-12 rounded-xl glass text-sage-400 hover:text-cream font-bold">{n}{n===6?'+':''}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Kafaalat beneficiary status */}
          {step === 4 && (
            <div className="animate-fade-in-up">
              <h2 className="text-xl font-bold text-cream mb-2">
                {t('checker.kafaalat.q')}
              </h2>
              <p className="text-sm text-sage-400 mb-6">
                {t('checker.kafaalat.desc')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setProfile((prev) => ({ ...prev, isKafaalatBeneficiary: true }));
                    setStep(5);
                  }}
                  className="p-6 rounded-xl text-center glass text-sage-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                >
                  {t('yes')}
                </button>
                <button
                  onClick={() => {
                    setProfile((prev) => ({ ...prev, isKafaalatBeneficiary: false }));
                    setStep(5);
                  }}
                  className="p-6 rounded-xl text-center glass text-sage-400 hover:text-cream"
                >
                  {t('no_sure')}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Health */}
          {step === 5 && (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h2 className="text-xl font-bold text-cream mb-3">{t('checker.pregnant')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() =>
                      setProfile((prev) => ({ ...prev, hasPregnantMember: true }))
                    }
                    className={`p-4 rounded-xl text-center transition-all ${
                      profile.hasPregnantMember
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : 'glass text-sage-400 hover:text-cream'
                    }`}
                  >
                    {t('yes')}
                  </button>
                  <button
                    onClick={() =>
                      setProfile((prev) => ({ ...prev, hasPregnantMember: false }))
                    }
                    className={`p-4 rounded-xl text-center transition-all ${
                      profile.hasPregnantMember === false
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                        : 'glass text-sage-400 hover:text-cream'
                    }`}
                  >
                    {t('no')}
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-cream mb-3">
                  {t('checker.pregnant.infant')}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() =>
                      setProfile((prev) => ({ ...prev, hasChildrenUnder2: true }))
                    }
                    className={`p-4 rounded-xl text-center transition-all ${
                      profile.hasChildrenUnder2
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : 'glass text-sage-400 hover:text-cream'
                    }`}
                  >
                    {t('yes')}
                  </button>
                  <button
                    onClick={() =>
                      setProfile((prev) => ({ ...prev, hasChildrenUnder2: false }))
                    }
                    className={`p-4 rounded-xl text-center transition-all ${
                      profile.hasChildrenUnder2 === false
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                        : 'glass text-sage-400 hover:text-cream'
                    }`}
                  >
                    {t('no')}
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-cream mb-3">{t('checker.disabled')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setProfile((prev) => ({ ...prev, hasDisabledMember: true }))}
                    className={`p-4 rounded-xl text-center transition-all ${
                      profile.hasDisabledMember
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : 'glass text-sage-400 hover:text-cream'
                    }`}
                  >
                    {t('yes')}
                  </button>
                  <button
                    onClick={() => setProfile((prev) => ({ ...prev, hasDisabledMember: false }))}
                    className={`p-4 rounded-xl text-center transition-all ${
                      profile.hasDisabledMember === false
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                        : 'glass text-sage-400 hover:text-cream'
                    }`}
                  >
                    {t('no')}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  profile.hasPregnantMember === undefined ||
                  profile.hasChildrenUnder2 === undefined ||
                  profile.hasDisabledMember === undefined
                }
                className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 text-emerald-950 font-bold text-lg hover:from-gold-500 hover:to-gold-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {t('checker.submit')} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Back button */}
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="mt-6 flex items-center gap-2 text-sm text-sage-500 hover:text-cream transition-colors">
              <ChevronLeft className="w-4 h-4" /> {t('checker.back')}
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
