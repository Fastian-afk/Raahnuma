'use client';
import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useLanguage } from '@/lib/i18n/context';
import { MapPin, Users, Briefcase, ArrowRight, CheckCircle2, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';

const STORIES = [
  {
    id: 'amina',
    name: 'Amina',
    nameUr: 'آمنہ',
    province: 'Sindh',
    avatar: '👩',
    situation: 'Pregnant woman, husband is a daily-wage laborer, 6-person household in rural Sindh, son in class 4',
    situationUr: 'حاملہ خاتون، شوہر دیہاڑی دار مزدور، سندھ میں 6 افراد کا گھرانہ',
    before: [
      'Didn\'t know her family\'s PMT score',
      'Never heard of the Nashonuma programme',
      'Didn\'t know her CNIC works as a health card',
      'Missing Rs. 14,500/quarter in cash transfers',
      'Son missing Rs. 3,000/quarter education stipend',
    ],
    after: [
      'Discovered she may qualify for 4 programs',
      'Told to SMS 8171 to check Kafaalat status',
      'Learned Nashonuma requires DHQ hospital visit',
      'Found out her CNIC IS her Sehat Card',
      'Son can get Taleemi Wazaif if Kafaalat is active',
    ],
    programs: ['Kafaalat', 'Taleemi Wazaif', 'Nashonuma', 'Sehat Card'],
    potentialBenefit: 'Up to Rs. 20,500+ per quarter',
    color: '#E3BE7E',
  },
  {
    id: 'hassan',
    name: 'Hassan',
    nameUr: 'حسن',
    province: 'Punjab',
    avatar: '👨',
    situation: 'Unemployed father of 3, recently lost factory job in Lahore, wife has chronic illness',
    situationUr: 'بے روزگار باپ، لاہور میں 3 بچے، بیوی کو دائمی بیماری',
    before: [
      'Thought Sehat Card covers all hospital visits',
      'Didn\'t know Punjab restricts to private hospitals only',
      'Assumed OPD visits are covered',
      'Didn\'t know about Ramzan Relief packages',
    ],
    after: [
      'Learned Sehat Card is IN-PATIENT only (not OPD)',
      'Discovered Punjab = private hospitals only',
      'May qualify for Kafaalat with unemployment',
      'Directed to Ramzan Relief distribution points',
    ],
    programs: ['Kafaalat', 'Sehat Card', 'Ramzan Relief'],
    potentialBenefit: 'Healthcare + Rs. 14,500/quarter',
    color: '#60A5FA',
  },
  {
    id: 'bibi_zainab',
    name: 'Bibi Zainab',
    nameUr: 'بی بی زینب',
    province: 'KP',
    avatar: '👵',
    situation: 'Widow with disability, 2 grandchildren (school-age) in Peshawar, no income source',
    situationUr: 'معذور بیوہ، پشاور میں 2 پوتے اسکول جاتے ہیں، آمدنی کا ذریعہ نہیں',
    before: [
      'Didn\'t know disability relaxes PMT threshold to 37',
      'Grandchildren not enrolled in Taleemi Wazaif',
      'Unaware of KP\'s broader Sehat Card Plus coverage',
      'No knowledge of cross-program benefits',
    ],
    after: [
      'PMT threshold of 37 (not 32) applies for disability',
      'Both grandchildren may get Taleemi Wazaif',
      'KP Sehat Card covers public AND private hospitals',
      'Qualifying for Kafaalat unlocks education stipends',
    ],
    programs: ['Kafaalat', 'Taleemi Wazaif', 'Sehat Card Plus'],
    potentialBenefit: 'Up to Rs. 23,500+ per quarter',
    color: '#34D399',
  },
  {
    id: 'fatima',
    name: 'Fatima',
    nameUr: 'فاطمہ',
    province: 'Balochistan',
    avatar: '👩‍🍼',
    situation: 'Young mother with infant (8 months), husband is a farmer, 4-person household in rural Quetta',
    situationUr: 'نوجوان ماں، 8 ماہ کا بچہ، شوہر کسان، قریب قلعت میں 4 افراد',
    before: [
      'Didn\'t know Nashonuma provides free nutritious food',
      'Unaware infant qualifies for nutrition support',
      'Thought BISP is only for widows',
      'No knowledge of how to register',
    ],
    after: [
      'Baby under 2 qualifies for Nashonuma nutrition',
      'Must visit DHQ hospital Nashonuma Centre',
      'Agricultural income may qualify for Kafaalat',
      'Sehat Card works at both public and private hospitals in Balochistan',
    ],
    programs: ['Kafaalat', 'Nashonuma', 'Sehat Card'],
    potentialBenefit: 'Nutrition support + Rs. 16,500/quarter',
    color: '#C084FC',
  },
];

export default function StoriesPage() {
  const { t, language } = useLanguage();
  const [activeStory, setActiveStory] = useState(0);
  const isEn = language === 'en';
  const story = STORIES[activeStory];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-cream mb-2">{t('stories.title')}</h1>
          <p className="text-sage-400">{t('stories.subtitle')}</p>
        </div>

        {/* Story selector */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {STORIES.map((s, i) => (
            <button key={s.id} onClick={() => setActiveStory(i)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl shrink-0 transition-all ${
                i === activeStory ? 'bg-gold-500/15 border border-gold-500/30 text-cream' : 'glass text-sage-500 hover:text-cream'
              }`}>
              <span className="text-2xl">{s.avatar}</span>
              <div className="text-left">
                <div className="text-sm font-bold">{s.name}</div>
                <div className="text-[10px] text-sage-500">{s.province}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Active story */}
        <div className="animate-fade-in-up" key={story.id}>
          {/* Profile card */}
          <div className="glass rounded-2xl p-6 mb-8" style={{ borderColor: `${story.color}30` }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{story.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold text-cream">{story.name} <span className="text-sage-500 text-lg font-normal">({story.nameUr})</span></h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-sage-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {story.province}</span>
                </div>
              </div>
            </div>
            <p className="text-sage-300 text-sm leading-relaxed">{isEn ? story.situation : story.situationUr}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {story.programs.map(p => (
                <span key={p} className="text-xs px-3 py-1 rounded-full glass text-sage-400">{p}</span>
              ))}
            </div>
          </div>

          {/* Before/After */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl p-6 border border-rose-500/20 bg-rose-500/5">
              <h3 className="text-sm font-bold text-rose-400 mb-4 uppercase tracking-wider">Before Raahnuma</h3>
              <ul className="space-y-3">
                {story.before.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-sage-400">
                    <span className="text-rose-400">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/5">
              <h3 className="text-sm font-bold text-emerald-400 mb-4 uppercase tracking-wider">After Raahnuma</h3>
              <ul className="space-y-3">
                {story.after.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-sage-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Potential benefit */}
          <div className="glass-gold rounded-2xl p-6 text-center">
            <p className="text-sm text-sage-400 mb-2">Potential Benefit</p>
            <p className="text-3xl font-bold text-gradient-gold">{story.potentialBenefit}</p>
            <Link href="/navigator" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-emerald-950 font-bold text-sm hover:from-gold-500 hover:to-gold-400 transition-all">
              Check Your Eligibility <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
