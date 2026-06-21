'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Language } from '../rules-engine/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  languageName: string;
  nativeName: string;
}

const LANGUAGE_CONFIG: Record<Language, { name: string; native: string; dir: 'ltr' | 'rtl'; fontClass: string }> = {
  en: { name: 'English', native: 'English', dir: 'ltr', fontClass: 'font-sans' },
  ur: { name: 'Urdu', native: 'اردو', dir: 'rtl', fontClass: 'font-urdu' },
  sd: { name: 'Sindhi', native: 'سنڌي', dir: 'rtl', fontClass: 'font-urdu' },
  ps: { name: 'Pashto', native: 'پښتو', dir: 'rtl', fontClass: 'font-urdu' },
  pn: { name: 'Punjabi', native: 'پنجابی', dir: 'rtl', fontClass: 'font-urdu' },
  bl: { name: 'Balochi', native: 'بلوچی', dir: 'rtl', fontClass: 'font-urdu' },
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.name': 'Raahnuma',
    'app.tagline': 'AI Benefits Navigator',
    'app.subtitle': 'Pakistan Social Protection Guide',
    'nav.home': 'Home',
    'nav.navigator': 'AI Navigator',
    'nav.programs': 'Programs',
    'nav.checker': 'Quick Check',
    'nav.map': 'Province Map',
    'nav.resources': 'Resources',
    'nav.stories': 'Impact Stories',
    'hero.title': 'Your Guide to Pakistan\'s Social Safety Net',
    'hero.subtitle': 'AI-powered benefits navigator that turns confusing welfare rules into plain language — what you may qualify for, and your next step.',
    'hero.cta.chat': 'Check My Eligibility',
    'hero.cta.explore': 'Explore Programs',
    'hero.cta.quick': 'Quick Check',
    'stats.programs': 'Programs Covered',
    'stats.languages': 'Languages',
    'stats.provinces': 'Provinces',
    'stats.benefit': 'Max Quarterly Benefit',
    'how.title': 'How Raahnuma Works',
    'how.step1.title': 'Describe Your Situation',
    'how.step1.desc': 'Tell us about your household in your own words — in any language',
    'how.step2.title': 'AI Analyzes Eligibility',
    'how.step2.desc': 'Our AI maps your situation against 5+ government programs',
    'how.step3.title': 'Get Clear Next Steps',
    'how.step3.desc': 'See what you may qualify for, with exact registration steps',
    'programs.title': 'Programs We Cover',
    'chat.placeholder': 'Describe your situation... (e.g., "I\'m a daily-wage worker with 6 family members in Lahore")',
    'chat.send': 'Send',
    'chat.voice': 'Voice Input',
    'chat.upload': 'Upload Document',
    'chat.welcome': 'Assalam o Alaikum! I\'m Raahnuma, your guide to Pakistan\'s social protection programs. Tell me about your situation and I\'ll help you find what you may be eligible for.',
    'chat.analyzing': 'Analyzing your eligibility...',
    'results.title': 'Your Eligibility Results',
    'results.likely': 'Likely Eligible',
    'results.maybe': 'May Be Eligible',
    'results.unlikely': 'Likely Not Eligible',
    'results.insufficient': 'More Info Needed',
    'results.documents': 'Required Documents',
    'results.howto': 'How to Register',
    'results.disclaimer': 'Disclaimer: These are guidance results only — not official eligibility determination.',
    'footer.disclaimer': 'Raahnuma provides guidance only. Final eligibility is determined by BISP/NSER.',
    'language.select': 'Language',
    'voice.listening': 'Listening...',
    'voice.speak': 'Speak now',
    'upload.title': 'Upload Document',
    'upload.desc': 'Upload your CNIC, B-Form, or other documents for automatic information extraction',
    'upload.supported': 'Supported: Images (JPG, PNG) and PDF files',
    'checker.title': 'Quick Eligibility Check',
    'checker.desc': 'Answer a few questions to quickly check which programs you may qualify for',
    'checker.province': 'Which province is on your CNIC?',
    'checker.household': 'How many people in your household?',
    'checker.income': 'What is your employment type?',
    'checker.children': 'Do you have school-age children (4-22)?',
    'checker.pregnant': 'Is anyone in your household pregnant or has a child under 2?',
    'checker.disabled': 'Does anyone in your household have a disability?',
    'checker.submit': 'Check Eligibility',
    'checker.next': 'Next',
    'checker.back': 'Back',
    'map.title': 'Coverage by Province',
    'map.select': 'Select a province to see available programs',
    'resources.title': 'Resource Center',
    'resources.faq': 'Frequently Asked Questions',
    'resources.guides': 'Registration Guides',
    'resources.glossary': 'Glossary',
    'resources.contacts': 'Important Contacts',
    'stories.title': 'Impact Stories',
    'stories.subtitle': 'See how Raahnuma helps real families navigate the system',
    'share.title': 'Share Results',
    'share.whatsapp': 'Share on WhatsApp',
    'share.copy': 'Copy Link',
    'share.print': 'Print Report',
    'sms.generate': 'Generate SMS',
    'sms.template': 'SMS Template',
    'nearby.title': 'Find Nearby Offices',
    'nearby.bisp': 'Nearest BISP Office',
    'nearby.nadra': 'Nearest NADRA Office',
    'nearby.hospital': 'Nearest DHQ Hospital',
  },
  ur: {
    'app.name': 'رہنما',
    'app.tagline': 'اے آئی فوائد نیویگیٹر',
    'app.subtitle': 'پاکستان سماجی تحفظ رہنما',
    'nav.home': 'ہوم',
    'nav.navigator': 'اے آئی نیویگیٹر',
    'nav.programs': 'پروگرامز',
    'nav.checker': 'فوری چیک',
    'nav.map': 'صوبائی نقشہ',
    'nav.resources': 'وسائل',
    'nav.stories': 'کہانیاں',
    'hero.title': 'پاکستان کے سماجی تحفظ کا آپ کا رہنما',
    'hero.subtitle': 'اے آئی سے چلنے والا فوائد نیویگیٹر جو پیچیدہ فلاحی قوانین کو سادہ زبان میں بدلتا ہے',
    'hero.cta.chat': 'میری اہلیت چیک کریں',
    'hero.cta.explore': 'پروگرامز دیکھیں',
    'hero.cta.quick': 'فوری چیک',
    'stats.programs': 'پروگرامز شامل',
    'stats.languages': 'زبانیں',
    'stats.provinces': 'صوبے',
    'stats.benefit': 'زیادہ سے زیادہ سہ ماہی فائدہ',
    'how.title': 'رہنما کیسے کام کرتا ہے',
    'how.step1.title': 'اپنی صورتحال بیان کریں',
    'how.step1.desc': 'اپنے گھرانے کے بارے میں اپنے الفاظ میں بتائیں',
    'how.step2.title': 'اے آئی اہلیت کا جائزہ لیتا ہے',
    'how.step2.desc': 'ہمارا اے آئی آپ کی صورتحال کا 5+ سرکاری پروگرامز سے موازنہ کرتا ہے',
    'how.step3.title': 'واضح اگلے قدم حاصل کریں',
    'how.step3.desc': 'دیکھیں آپ کس کے اہل ہو سکتے ہیں، رجسٹریشن کے اقدامات کے ساتھ',
    'chat.placeholder': 'اپنی صورتحال بیان کریں...',
    'chat.send': 'بھیجیں',
    'chat.welcome': 'السلام علیکم! میں رہنما ہوں، پاکستان کے سماجی تحفظ کے پروگرامز کا آپ کا رہنما۔ اپنی صورتحال بتائیں اور میں آپ کی مدد کروں گا۔',
    'results.likely': 'غالباً اہل',
    'results.maybe': 'اہل ہو سکتے ہیں',
    'results.unlikely': 'غالباً نا اہل',
    'results.insufficient': 'مزید معلومات درکار',
    'footer.disclaimer': 'رہنما صرف رہنمائی فراہم کرتا ہے۔ حتمی اہلیت BISP/NSER طے کرتا ہے۔',
    'checker.title': 'فوری اہلیت چیک',
    'checker.submit': 'اہلیت چیک کریں',
    'map.title': 'صوبے کے لحاظ سے کوریج',
    'resources.title': 'وسائل مرکز',
    'stories.title': 'اثر کی کہانیاں',
  },
  sd: {
    'app.name': 'رهنما',
    'app.tagline': 'اي آئي فائدن جو نيويگيٽر',
    'hero.title': 'پاڪستان جي سماجي تحفظ ۾ توهان جو رهنما',
    'chat.welcome': 'السلام عليڪم! مان رهنما آهيان، پاڪستان جي سماجي تحفظ پروگرامن جو توهان جو رهنما۔',
    'nav.home': 'گهر',
    'nav.navigator': 'اي آئي نيويگيٽر',
  },
  ps: {
    'app.name': 'رهنما',
    'app.tagline': 'د ګټو AI لارښود',
    'hero.title': 'د پاکستان د ټولنیز ساتنې لپاره ستاسو لارښود',
    'chat.welcome': 'السلام علیکم! زه رهنما یم، د پاکستان د ټولنیز ساتنې پروګرامونو لپاره ستاسو لارښود۔',
    'nav.home': 'کور',
    'nav.navigator': 'AI لارښود',
  },
  pn: {
    'app.name': 'راہنما',
    'app.tagline': 'اے آئی فائدیاں دا نیویگیٹر',
    'hero.title': 'پاکستان دی سماجی حفاظت وچ تہاڈا راہنما',
    'chat.welcome': 'السلام علیکم! میں راہنما ہاں، پاکستان دے سماجی تحفظ پروگرامز دا تہاڈا راہنما۔',
    'nav.home': 'ہوم',
    'nav.navigator': 'اے آئی نیویگیٹر',
  },
  bl: {
    'app.name': 'رہنما',
    'app.tagline': 'اے آئی فائدہ آنی نیویگیٹر',
    'hero.title': 'پاکستان ءِ سماجی ساتگ ءِ رہنما',
    'chat.welcome': 'السلام علیکم! من رہنما ان، پاکستان ءِ سماجی ساتگ ءِ پروگرام آنی رہنما۔',
    'nav.home': 'لوگ',
    'nav.navigator': 'اے آئی نیویگیٹر',
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = LANGUAGE_CONFIG[lang].dir;
      document.documentElement.lang = lang;
    }
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  }, [language]);

  const config = LANGUAGE_CONFIG[language];

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      dir: config.dir,
      isRTL: config.dir === 'rtl',
      languageName: config.name,
      nativeName: config.native,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export { LANGUAGE_CONFIG };
export type { Language };
