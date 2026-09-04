'use client';
import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useLanguage } from '@/lib/i18n/context';
import { MultilingualText, MultilingualList, Language } from '@/lib/rules-engine/types';
import { MapPin, Users, Briefcase, ArrowRight, CheckCircle2, ChevronRight, Heart, X } from 'lucide-react';
import Link from 'next/link';

interface ImpactStory {
  id: string;
  name: MultilingualText;
  province: MultilingualText;
  initials: string;
  situation: MultilingualText;
  before: MultilingualList;
  after: MultilingualList;
  programs: string[];
  potentialBenefit: MultilingualText;
  color: string;
}

export const STORIES: ImpactStory[] = [
  {
    id: 'amina',
    name: { en: 'Amina Bibi', ur: 'آمنہ بی بی', sd: 'آمنه بي بي', ps: 'امنه بي بي', pn: 'آمنہ بی بی', bl: 'آمنہ بی بی' },
    province: { en: 'Rural Sindh', ur: 'سندھ (دیہی)', sd: 'سندھ (ڳوٺاڻو)', ps: 'سندھ (کلي)', pn: 'سندھ (پینڈو)', bl: 'سندھ (دیہی)' },
    initials: 'AB',
    situation: {
      en: 'Amina is a pregnant mother living in a 6-person household in rural Sindh. Her husband is a daily-wage brick kiln laborer with highly unstable income. Amina was unaware of nutrition support programs and struggled to afford school expenses for her son in class 4.',
      ur: 'آمنہ ایک حاملہ ماں ہے جو دیہی سندھ میں 6 افراد کے خاندان کے ساتھ رہتی ہے۔ اس کا شوہر بھٹے پر کام کرنے والا دیہاڑی دار مزدور ہے۔ وہ بچوں کے تعلیمی اخراجات اور غذائی قلت کا شکار تھی۔',
      sd: 'آمنه هڪ حامله ماءُ آهي جيڪا ٻهراڙي واري سنڌ ۾ رهي ٿي. سندس مڙس سرن جي بٺي تي ڪم ڪندڙ مزدور آهي.',
      ps: 'آمنه امیندواره مور ده چې په کليوال سیند کې اوسیږي. میړه یې د خښتو په بټۍ کې کار کوي.',
      pn: 'آمنہ اک حاملہ ماں اے جیہڑی پینڈو سندھ وچ رہندی اے۔ اوہدا شوہر بھٹے تے کم کردا اے۔',
      bl: 'آمنہ یک حاملہ ماتیں کہ سندھ ءِ لوگ ءَ زندگی کنت۔ آئی ءِ مرد پٹے کار کنت۔'
    },
    before: {
      en: [
        'Had no knowledge of BISP NSER survey or PMT scoring criteria',
        'Was completely unaware of the Nashonuma nutrition support program',
        'Did not know her CNIC served as a Sehat Card for emergency healthcare',
        'Missed Rs. 14,500/quarter cash transfers due to NSER registration confusion',
        'Son missed class 4 education stipends of Rs. 3,000/quarter'
      ],
      ur: [
        'خاندان کے بی آئی ایس پی پی ایم ٹی (PMT) سکور اور سروے کا علم نہیں تھا',
        'حمل کے دوران نشونما پروگرام کے تحت ملنے والی غذائی امداد سے بے خبر تھیں',
        'معلوم نہیں تھا کہ شناختی کارڈ ہی صحت کارڈ کے طور پر استعمال ہو سکتا ہے',
        'سہ ماہی کفالت وظیفہ 14,500 روپے حاصل کرنے کا طریقہ معلوم نہیں تھا',
        'پرائمری اسکول میں پڑھتے بیٹے کا تعلیمی وظیفہ ضائع ہو رہا تھا'
      ],
      sd: [
        'BISP NSER سروي يا PMT اسڪور جو علم نه هو',
        'نشونما پروگرام جي غذائي مدد بابت خبر نه هئي',
        'سڃاڻپ ڪارڊ کي صحت ڪارڊ طور استعمال ڪرڻ جي خبر نه هئي'
      ],
      ps: [
        'د BISP NSER سروې او نمرې په اړه معلومات نه درلودل',
        'د نشونما د تغذیې پروګرام په اړه بې خبره وه',
        'نه پوهیده چې شناختي کارډ د صحت کارت په توګه کارول کیدی شي'
      ],
      pn: [
        'BISP NSER سروے دا پتہ نہیں سی',
        'نشونما پروگرام دا علم نہیں سی',
        'شناختی کارڈ ہی ہیلتھ کارڈ ہون دا پتہ نہیں سی'
      ],
      bl: [
        'BISP NSER سروے ءِ بارہ ءَ زانشت نہ ات',
        'نشونما پروگرام ءِ بارہ ءَ ہچ معلومات نہ ات',
        'شناختی کارڈ ہی ہیلتھ کارڈ انت اے چیز ءِ بارہ ءَ بے خبر ات'
      ]
    },
    after: {
      en: [
        'Identified eligibility for Kafaalat, Nashonuma, Sehat Card, and Taleemi Wazaif in 3 minutes',
        'Guided to register NSER survey dynamically by visiting nearby Tehsil office',
        'Enrolled in Nashonuma nutrition program by visiting DHQ facilitation centre',
        'Unlocked Sehat Card universal healthcare access at empaneled hospitals',
        'Secured quarterly education stipends for her son upon Kafaalat activation'
      ],
      ur: [
        'رہنما کی مدد سے چند منٹ میں 4 مختلف فلاحی پروگراموں کے لیے اہلیت معلوم کی',
        'قریبی تحصیل دفتر جا کر متحرک NSER سروے کروانے کی تفصیلی رہنمائی ملی',
        'ڈی ایچ کیو ہسپتال کے نشونما مرکز سے مفت غذائی پیکیٹ حاصل کرنا شروع کیے',
        'شناختی کارڈ کے ذریعے نجی رجسٹرڈ ہسپتالوں میں مفت داخل علاج کی سہولت پائی',
        'کفالت فعال ہونے پر بیٹے کے تعلیمی وظائف کی رجسٹریشن مکمل کروائی'
      ],
      sd: [
        'رہنما ذريعي فوري طور تي 4 پروگرامن لاءِ اهليت جي رهنمائي ملي',
        'قريبي آفيس وڃي NSER سروي ڪرائڻ جو طريقو معلوم ڪيو',
        'نشونما پروگرام مان مفت غذائي سپليمينٽ حاصل ڪيا'
      ],
      ps: [
        'د رهنما له لارې په څو دقیقو کې د ۴ پروګرامونو لپاره وړتیا معلومه کړه',
        'په نږدې دفتر کې د سروې ترسره کولو لاره ورته وښودل شوه',
        'د روغتون له نشونما مرکز څخه یې وړیا تغذيوي توکي ترلاسه کړل'
      ],
      pn: [
        'راہنما نال 4 فلاحی پروگراماں لئی اہلیت دا پتہ چلیا',
        'NSER سروے لئی قریبی تحصیل دفتر جان دی رہنمائی لبھی',
        'نشونما پروگرام توں مفت غذائی پیکٹ حاصل کیتے'
      ],
      bl: [
        'رہنما ءِ کمک ءَ چنت منٹ ءَ 4 مختلفیں پروگرامانی واستہ اہلیت معلوم کت',
        'قریبی تحصیل دفتر ءَ سروے کنگ ءِ سرپدی دیگ بوت',
        'نشونما مرکز چہ مفتیں غذائی پیکیٹ حاصل کنگ بنگیج کت'
      ]
    },
    programs: ['Kafaalat', 'Taleemi Wazaif', 'Nashonuma', 'Sehat Card'],
    potentialBenefit: {
      en: 'Rs. 20,500+ per quarter + Free Specialized Nutrition supplements',
      ur: '20,500 روپے سے زائد فی سہ ماہی + مفت غذائی سپلیمنٹس',
      sd: 'ٽماهي 20,500 کان وڌيڪ + مفت غذائي سپليمينٽس',
      ps: 'درې میاشتنی ۲۰،۵۰۰ روپۍ + وړیا تغذیوي توکي',
      pn: '20,500 روپے توں ودھ فی سہ ماہی + مفت راشن',
      bl: '20,500 کلدار چہ گیش سہ ماہی + مفت غذائی سامان'
    },
    color: '#E3BE7E',
  },
  {
    id: 'hassan',
    name: { en: 'Hassan Ali', ur: 'حسن علی', sd: 'حسن علي', ps: 'حسن علي', pn: 'حسن علی', bl: 'حسن علی' },
    province: { en: 'Punjab', ur: 'پنجاب', sd: 'پنجاب', ps: 'پنجاب', pn: 'پنجاب', bl: 'پنجاب' },
    initials: 'HA',
    situation: {
      en: 'Hassan is an unemployed factory worker in Lahore. After losing his job, he struggled to meet basic utility costs and buy essential medication for his wife, who suffers from a chronic respiratory illness.',
      ur: 'حسن لاہور کا رہائشی ہے جو فیکٹری بند ہونے کی وجہ سے بے روزگار ہو گیا تھا۔ وہ گھر کے راشن اور اپنی بیمار بیوی کے علاج کے اخراجات کی وجہ سے شدید پریشان تھا۔',
      sd: 'حسن لاهور جو رهواسي آهي جيڪو فيڪٽري مان نوڪري ختم ٿيڻ سبب بيروزگار ٿي ويو هو.',
      ps: 'حسن په لاهور کې اوسېدونکی وزګار فابریکې کارګر دی چې د دندې له لاسه ورکولو وروسته اندېښمن و.',
      pn: 'حسن لاہور دا رہن والا اے جیہڑا فیکٹری بند ہون توں بے روزگار ہو گیا سی۔',
      bl: 'حسن لاہور ءِ جہمنندے کہ فیکٹری بند بیگ چہ بے روزگار بوتگ ات۔'
    },
    before: {
      en: [
        'Assumed Sehat Card covered outpatient OPD charges and routine doctor checkups',
        'Did not know Punjab Sehat Card works only at private empaneled hospitals',
        'Was unaware of seasonal Utility Stores Corporation Ramzan Relief subsidies',
        'Believed BISP was exclusively reserved for widows'
      ],
      ur: [
        'سمجھتے تھے کہ صحت کارڈ ڈاکٹر کی فیس (OPD) اور عام دوائیوں کے لیے بھی کام کرتا ہے',
        'علم نہیں تھا کہ پنجاب میں صحت کارڈ صرف مخصوص پرائیویٹ ہسپتالوں میں داخل ہونے پر چلتا ہے',
        'رمضان المبارک کے دوران یوٹیلیٹی اسٹورز پر ملنے والے مفت راشن پیکیج کا پتہ نہیں تھا',
        'خیال تھا کہ بی آئی ایس پی کی نقد مالی امداد صرف بیوہ خواتین کے لیے مخصوص ہے'
      ],
      sd: [
        'سمجهندو هو ته هيلٿ ڪارڊ عام او پي ڊي (OPD) لاءِ به ڪم ڪري ٿو',
        'پنجاب ۾ هيلٿ ڪارڊ صرف خانگي اسپتالن ۾ هلڻ جي خبر نه هئي',
        'رمضان ريليف پروگرام بابت ڪا خبر نه هئي'
      ],
      ps: [
        'فکر یې کاوه چې روغتیايي کارت د او پي ډي (OPD) لپاره هم کارول کیږي',
        'نه پوهیده چې په پنجاب کې یوازې په خصوصي روغتونونو کې کار کوي',
        'د روژې په میاشت کې د خوراکي توکو د مرستې په اړه معلومات نه درلودل'
      ],
      pn: [
        'سمجھدا سی صحت کارڈ او پی ڈی لئی وی چلدا اے',
        'پنجاب وچ صحت کارڈ صرف پرائیویٹ ہسپتالاں لئی ہون دا پتہ نہیں سی',
        'رمضان راشن پروگرام دا پتہ نہیں سی'
      ],
      bl: [
        'زانشت کہ صحت کارڈ او پی ڈی واستہ کار کنت',
        'پنجاب ءَ صحت کارڈ صرف نجی ہسپتالاں کار کنت اے چیز ءِ بارہ ءَ بے خبر ات',
        'رمضان راشن پروگرام ءِ بارہ ءَ ہچ زانشت نہ ات'
      ]
    },
    after: {
      en: [
        'Clarified Sehat Card is strictly for in-patient emergency admissions (not OPD)',
        'Learned that in Punjab, Sehat Card works exclusively at private empaneled hospitals',
        'Discovered Kafaalat eligibility threshold is based on NSER PMT proxy, not gender',
        'Utilized SMS 8171 to check and enroll for Utility Stores Ramzan Relief food package'
      ],
      ur: [
        'رہنما نے واضح کیا کہ صحت کارڈ صرف داخل مریضوں (سرجری/داخلہ) کے لیے کارآمد ہے',
        'معلوم ہوا کہ پنجاب میں علاج کے لیے نجی رجسٹرڈ ہسپتالوں کا انتخاب لازمی ہے',
        'معلوم ہوا کہ کم آمدنی کی وجہ سے وہ نقد امداد کے لیے بی آئی ایس پی سروے کروا سکتے ہیں',
        'رمضان پیکیج کی تصدیق کے لیے 8171 پر میسج بھیجا اور یوٹیلیٹی اسٹور سے راشن حاصل کیا'
      ],
      sd: [
        'رهنما واضح ڪيو ته صحت ڪارڊ صرف داخل مريضن لاءِ آهي',
        'معلوم ڪيو ته پنجاب ۾ علاج صرف پرائيويٽ اسپتالن ۾ ٿيندو',
        'رمضان راشن لاءِ 8171 تي ايس ايم ايس موڪليو'
      ],
      ps: [
        'رهنما واضح کړه چې روغتیايي کارت یوازې د بستر کیدو لپاره کارول کیږي',
        'پوه شو چې په پنجاب کې باید خصوصي روغتون غوره کړي',
        'د رمضان مرستې د معلومولو لپاره یې 8171 ته ایس ایم ایس واستوه'
      ],
      pn: [
        'راہنما نے واضح کیتا کہ صحت کارڈ صرف داخل ہون لئی اے',
        'پنجاب وچ پرائیویٹ ہسپتالاں دی لسٹ دا پتہ چلیا',
        '8171 تے ایس ایم ایس بھیج کے رمضان راشن حاصل کیتا'
      ],
      bl: [
        'رہنما ءَ واضح کت کہ صحت کارڈ صرف داخل مریضانی واستہ انت',
        'پنجاب ءَ نجی ہسپتالاں وتی علاج کنائینگ ءِ سرپدی رس ات',
        'رمضان پیکیج واستہ 8171 ءَ ایس ایم ایس کناں و راشن حاصل کت'
      ]
    },
    programs: ['Kafaalat', 'Sehat Card', 'Ramzan Relief'],
    potentialBenefit: {
      en: 'Rs. 14,500/quarter + Sehat Card Hospitalization Cover + USC Subsidies',
      ur: '14,500 روپے فی سہ ماہی + ہسپتال علاج کوریج + رمضان راشن سبسڈی',
      sd: 'ٽماهي 14,500 + اسپتال علاج + رمضان راشن سبسڊي',
      ps: 'درې میاشتنی ۱۴،۵۰۰ روپۍ + د روغتون وړیا درملنه + د خوراکي توکو مرسته',
      pn: '14,500 روپے فی سہ ماہی + ہسپتال دا مفت علاج + رمضان راشن',
      bl: '14,500 کلدار سہ ماہی + ہسپتال کوریج + رمضان راشن سبسڈی'
    },
    color: '#60A5FA',
  },
  {
    id: 'bibi_zainab',
    name: { en: 'Bibi Zainab', ur: 'بی بی زینب', sd: 'بي بي زينب', ps: 'بي بي زينب', pn: 'بی بی زینب', bl: 'بی بی زینب' },
    province: { en: 'Khyber Pakhtunkhwa', ur: 'خیبرپختونخوا', sd: 'خيبر پختونخوا', ps: 'خيبر پښتونخوا', pn: 'خیبر پختونخوا', bl: 'خیبر پختونخوا' },
    initials: 'BZ',
    situation: {
      en: 'Bibi Zainab is a disabled widow supporting two school-going grandchildren in Peshawar. She has no stable source of household income and relies on neighbors for financial assistance.',
      ur: 'بی بی زینب پشاور کی رہائشی ایک معذور بیوہ ہیں جو اپنے دو اسکول جانے والے پوتوں کی سرپرستی کر رہی ہیں۔ ان کے پاس آمدنی کا کوئی مستقل ذریعہ نہیں تھا۔',
      sd: 'بي بي زينب پشاور جي هڪ معذور بيوهه آهي جيڪا پنهنجي ٻن پوتين کي پڙهائي پئي.',
      ps: 'بي بي زينب په پېښور کې معلوله کونډه ده چې د ښوونځي دوه ماشومان پالي.',
      pn: 'بی بی زینب پشاور دی رہن والی معذور بیوہ اے جیہڑی دو یتیماں نوں پال رہی اے۔',
      bl: 'بی بی زینب پشاور ءِ یک معذوریں بیوہ اے کہ وتی دویں چورگاں پالگ ءَ انت۔'
    },
    before: {
      en: [
        'Did not know that having a disabled family member raises the NSER PMT eligibility score limit from 32 to 37',
        'Was unaware of Taleemi Wazaif education stipends for secondary school grandchildren',
        'Did not know KP Sehat Card Plus covers treatment at both public and private empaneled hospitals'
      ],
      ur: [
        'معلوم نہیں تھا کہ معذور افراد کے خاندان کے لیے بی آئی ایس پی کا پی ایم ٹی (PMT) سکور حد 32 سے بڑھا کر 37 کر دیا جاتا ہے',
        'اسکول جانے والے بچوں کے لیے تعلیمی وظائف (Taleemi Wazaif) کا پتہ نہیں تھا',
        'خیبر پختونخوا صحت کارڈ پلس کے وسیع تر دائرہ کار (سرکاری و نجی دونوں ہسپتالوں) سے ناواقف تھیں'
      ],
      sd: [
        'معذورن جي ڪري PMT اسڪور حد 32 مان وڌي 37 ٿيڻ جي خبر نه هئي',
        'ٻارن جي تعليمي وظيفي جي باري ۾ معلومات نه هئي',
        'KPK صحت ڪارڊ جي سرڪاري ۽ خانگي اسپتالن واري سهولت کان ناواقف هئي'
      ],
      ps: [
        'نه پوهیدله چې د معلول غړي په درلودلو سره د PMT وړتیا نمره له ۳۲ څخه ۳۷ ته لوړیږي',
        'د ماشومانو د تعلیمي وظیفو په اړه بې خبره وه',
        'د خیبر پښتونخوا د روغتیا کارت د اسانتیاو په اړه معلومات نه درلودل'
      ],
      pn: [
        'معذوری دی وجہ توں PMT سکور حد 32 توں 37 ہون دا پتہ نہیں سی',
        'بچیاں دے تعلیمی وظائف دا پتہ نہیں سی',
        'کے پی صحت کارڈ دے سرکاری ہسپتالاں وچ چلن دا پتہ نہیں سی'
      ],
      bl: [
        'معذوری ءِ وجہ ءَ چہ PMT اسکور 32 ءَ چہ گیش 37 بیت اے چیز ءَ سرپد نہ ات',
        'چورگانی تعلیمی وظائف ءِ بارہ ءَ بے خبر ات',
        'کے پی صحت کارڈ پلس ءِ بارہ ءَ ہچ زانشت نہ ات'
      ]
    },
    after: {
      en: [
        'Identified she qualifies for Kafaalat under the relaxed PMT score limit of 37',
        'Discovered she can get Rs. 4,000/quarter for her granddaughter and Rs. 3,500/quarter for her grandson under Taleemi Wazaif',
        'Confirmed KP Sehat Card covers 100% free treatment at major Peshawar public and private hospitals'
      ],
      ur: [
        'رہنما کی مدد سے معلوم ہوا کہ معذوری کارڈ کی وجہ سے وہ 37 پی ایم ٹی سکور کے تحت بھی کفالت کے اہل ہیں',
        'معلوم ہوا کہ ان کی پوتی کے لیے 4,000 روپے اور پوتے کے لیے 3,500 روپے تعلیمی وظیفہ مل سکتا ہے',
        'تصدیق ہوئی کہ پشاور کے بڑے سرکاری اور نجی ہسپتالوں میں صحت کارڈ پلس کے ذریعے مفت علاج ممکن ہے'
      ],
      sd: [
        'آساني سان Kafaalat لاءِ اهل ٿي وئي معذوري جي رعايت تحت',
        'ٻارن لاءِ ٽماهي وظيفو چيڪ ڪيو جيڪو 7,500 رپيا ٿئي ٿو',
        'پشاور جي وڏن اسپتالن ۾ مفت علاج جي تصديق ڪئي'
      ],
      ps: [
        'د معلولیت د اسانتیا له امله په ۳۷ نمره د کفالت وړ وبلل شوه',
        'معلومه یې کړه چې د لمسیانو لپاره درې میاشتنی ۷،۵۰۰ روپۍ وظیفه ترلاسه کولی شي',
        'تصدیق یې کړ چې په پیښور کې وړیا روغتیايي خدمات ترلاسه کولی شي'
      ],
      pn: [
        'معذوری کارڈ دی وجہ توں کفالت لئی اہل قرار دتی گئی',
        'دوواں یتیماں لئی تعلیمی وظائف دی رجسٹریشن کروائی',
        'کے پی ہسپتالاں وچ مفت علاج دی تصدیق ہوئی'
      ],
      bl: [
        'رہنما ءَ چہ سرپد بوت کہ معذوری کارڈ ءِ سوب ءَ چہ 37 پی ایم ٹی اسکور ءَ لائق انت',
        'چورگانی وظیفہ (Rs. 7,500) ءِ بارہ ءَ سرپدی رس ات',
        'کے پی ءِ ہسپتالاں مفتیں علاج ءِ تصدیق بوت'
      ]
    },
    programs: ['Kafaalat', 'Taleemi Wazaif', 'Sehat Card Plus'],
    potentialBenefit: {
      en: 'Up to Rs. 22,000+ per quarter + Complete Healthcare cover',
      ur: 'تقریباً 22,000 روپے فی سہ ماہی + ہسپتال علاج کی مکمل کوریج',
      sd: 'ٽماهي 22,000 تائين + اسپتال علاج جي مڪمل سهولت',
      ps: 'تر ۲۲،۰۰۰ روپۍ پورې درې میاشتنی + د وړیا درملنې بشپړ پوښښ',
      pn: '22,000 روپے توں ودھ فی سہ ماہی + ہسپتال دا مفت علاج',
      bl: '22,000 کلدار سہ ماہی + ہسپتال علاج ءِ مکمل کوریج'
    },
    color: '#34D399',
  },
  {
    id: 'fatima',
    name: { en: 'Fatima Jan', ur: 'فاطمہ جان', sd: 'فاطمه جان', ps: 'فاطمه جان', pn: 'فاطمہ جان', bl: 'فاطمہ جان' },
    province: { en: 'Balochistan', ur: 'بلوچستان', sd: 'بلوچستان', ps: 'بلوچستان', pn: 'بلوچستان', bl: 'بلوچستان' },
    initials: 'FJ',
    situation: {
      en: 'Fatima is a young mother of an 8-month-old infant in rural Quetta. Her husband is a small-scale seasonal farmer. Fatima was struggling with maternal health issues and could not afford proper infant nutrition supplements.',
      ur: 'فاطمہ کوئٹہ کے دیہی علاقے کی رہائشی ہے اور 8 ماہ کے بچے کی ماں ہے۔ اس کا شوہر ایک چھوٹا کسان ہے۔ فاطمہ کو زچگی کے بعد صحت کے مسائل اور بچے کی خوراک کی پریشانی تھی۔',
      sd: 'فاطمه ڪوئيٽا جي ٻهراڙي واري علائقي جي رهواسي آهي ۽ 8 مهينن جي ٻار جي ماءُ آهي.',
      ps: 'فاطمه په کویټه کې د یو ۸ میاشتني ماشوم مور ده چې د زچګۍ روغتیايي ستونزې یې لرلې.',
      pn: 'فاطمہ کوئٹہ دی رہن والی 8 مہینے دے بچے دی ماں اے, شوہر کسان اے۔',
      bl: 'فاطمہ کوئٹہ ءِ یک لوگے ءَ نشتگیں 8 ماہ ءِ چورگ ءِ مات انت۔ مرد کسانیں زارتے کنت۔'
    },
    before: {
      en: [
        'Did not know Nashonuma nutrition centers provide specialized dietary support for lactating mothers and infants free of cost',
        'Was unaware that children under 2 years old qualify for direct financial nutrition stipends',
        'Believed health cards were only active in Punjab or Islamabad'
      ],
      ur: [
        'معلوم نہیں تھا کہ نشونما مراکز حاملہ اور دودھ پلانے والی ماؤں کے لیے مفت غذائی خوراک فراہم کرتے ہیں',
        'پتہ نہیں تھا کہ 2 سال سے کم عمر بچوں کو اضافی مالی امداد فراہم کی جاتی ہے',
        'خیال تھا کہ صحت کارڈ صرف پنجاب یا اسلام آباد کے شہریوں کے لیے ہے، بلوچستان میں فعال نہیں'
      ],
      sd: [
        'نشونما پروگرام ذريعي ماءُ ۽ ٻار کي ملندڙ مفت غذائي مدد جي خبر نه هئي',
        '2 سالن کان ننڍي ٻار جي مالي وظيفي کان ناواقف هئي',
        'سمجهندي هئي ته صحت ڪارڊ بلوچستان ۾ فعال ناهي'
      ],
      ps: [
        'د نشونما د وړیا تغذیوي توکو د ویشلو په اړه معلومات نه درلودل',
        'نه پوهیدله چې تر ۲ کلونو کم ماشومان هم وظیفه ترلاسه کولی شي',
        'فکر یې کاوه چې روغتیايي کارت په بلوچستان کې نشته'
      ],
      pn: [
        'نشونما پروگرام لئی ماواں تے بچیاں نوں مفت خوراک ملن دا پتہ نہیں سی',
        '2 سال توں چھوٹے بچیاں لئی وظيفے دا پتہ نہیں سی',
        'سمجھدی سی صحت کارڈ بلوچستان وچ نہیں چلدا'
      ],
      bl: [
        'نشونما مرکز چہ ماواں ءُ چورگاں واستہ مفتیں غذائی سپلیمنٹس ءِ بارہ ءَ سرپد نہ ات',
        'چورگانی وظيفہ (چہ 2 سال ءَ کستر) ءِ بارہ ءَ بے خبر ات',
        'زانشت کہ صحت کارڈ بلوچستان ءَ کار نہ کنت'
      ]
    },
    after: {
      en: [
        'Learned her infant qualifies for specialized supplementary nutrition at the nearby Quetta DHQ hospital center',
        'Discovered she can claim an additional Rs. 2,000/quarter cash under Nashonuma for health compliance',
        'Confirmed Balochistan Sehat Card provides universal cover at both public and private hospitals on their empaneled list'
      ],
      ur: [
        'رہنما کی مدد سے معلوم ہوا کہ ان کا بچہ کوئٹہ ڈی ایچ کیو ہسپتال کے نشونما مرکز سے مفت غذا کا حقدار ہے',
        'معلوم ہوا کہ زچگی کے بعد صحت کی حاضری پر انہیں سہ ماہی 2,000 روپے اضافی نقد دیے جائیں گے',
        'تصدیق ہوئی کہ بلوچستان صحت کارڈ کے تحت کوئٹہ کے بڑے ہسپتالوں میں مفت داخل علاج کی سہولت موجود ہے'
      ],
      sd: [
        'معلوم ڪيائين ته سندس ٻار قريبي اسپتال مان مفت غذائي سپليمينٽ حاصل ڪري سگهي ٿو',
        'نشونما تحت ٽماهي 2,000 رپيا اضافي رقم چيڪ ڪيائين',
        'بلوچستان ۾ صحت ڪارڊ جي فعال هجڻ جي تصديق ڪيائين'
      ],
      ps: [
        'پوهه شوه چې ماشوم یې په نږدې روغتون کې د وړیا تغذیې حقدار دی',
        'د نشونما لاندې د درې میاشتني ۲،۰۰۰ روپۍ اضافي مرستې تصدیق یې وکړ',
        'په بلوچستان کې د صحت کارت د فعالیت تصدیق یې وکړ'
      ],
      pn: [
        'کوئٹہ ہسپتال وچ نشونما مرکز توں مفت خوراک حاصل کیتی',
        'نشونما پروگرام دے تحت 2,000 روپے فی سہ ماہی دا پتہ چلیا',
        'بلوچستان وچ صحت کارڈ دے فعال ہون دی تصدیق ہوئی'
      ],
      bl: [
        'کوئٹہ ہسپتال ءَ نشونما مرکز چہ وتی چورگ ءِ واستہ مفتیں راشن حاصل کت',
        'نشونما پروگرام ءَ چہ سہ ماہی 2,000 کلدار ءِ گیشیں زر ءِ بارہ ءَ سرپدی رس ات',
        'بلوچستان ءَ صحت کارڈ ءِ فعال بیگ ءِ تصدیق بوت'
      ]
    },
    programs: ['Kafaalat', 'Nashonuma', 'Sehat Card'],
    potentialBenefit: {
      en: 'Rs. 16,500/quarter + Specialized Nutrition Supplements + Sehat Card Cover',
      ur: '16,500 روپے فی سہ ماہی + مفت غذائی سپلیمنٹس + ہسپتال مفت علاج',
      sd: 'ٽماهي 16,500 + مفت غذائي غذا + اسپتال علاج',
      ps: 'درې میاشتنی ۱۶،۵۰۰ روپۍ + وړیا تغذیوي توکي + د روغتون وړیا درملنه',
      pn: '16,500 روپے فی سہ ماہی + مفت خوراک + ہسپتال دا مفت علاج',
      bl: '16,500 کلدار سہ ماہی + مفتیں راشن + ہسپتال کوریج'
    },
    color: '#C084FC',
  },
  {
    id: 'tariq',
    name: { en: 'Tariq Baloch', ur: 'طارق بلوچ', sd: 'طارق بلوچ', ps: 'طارق بلوچ', pn: 'طارق بلوچ', bl: 'طارق بلوچ' },
    province: { en: 'Rural Balochistan', ur: 'بلوچستان (دیہی)', sd: 'بلوچستان (ڳوٺاڻو)', ps: 'بلوچستان (کلي)', pn: 'بلوچستان (پینڈو)', bl: 'بلوچستان (دیہی)' },
    initials: 'TB',
    situation: {
      en: 'Tariq is a daily-wage agricultural farmer with 5 children. His eldest daughter has a physical disability. Tariq struggled to afford travel expenses to Quetta for NADRA registration and was unaware of disabled welfare thresholds.',
      ur: 'طارق ایک غریب کسان ہے جس کے 5 بچے ہیں۔ اس کی بڑی بیٹی معذور ہے۔ طارق کے پاس نادرا دفتر تک جانے کا کرایہ نہیں تھا اور وہ معذور افراد کے لیے مقرر کردہ آسان شرائط سے ناواقف تھا۔',
      sd: 'طارق هڪ غريب هاري آهي جنهن کي 5 ٻار آهن. سندس وڏي ڌي معذور آهي.',
      ps: 'طارق یو غریب بزګر دی چې ۵ ماشومان لري. لور یې معلولیت لري او د تګ راتګ وس یې نه درلود.',
      pn: 'طارق اک غریب کسان اے، 5 بچے نیں تے بڑی دھی معذور اے۔',
      bl: 'طارق یک غریبیں کسانیں کہ آئی ءِ 5 چورگ انت۔ مستریں جنک معذور انت۔'
    },
    before: {
      en: [
        'Did not know that having a disabled child raises the BISP PMT score eligibility threshold to 37',
        'Was unaware that children enrolled in government schools receive Taleemi Wazaif stipends',
        'Believed NADRA special disability registration was costly and complicated'
      ],
      ur: [
        'معلوم نہیں تھا کہ معذور بچے کی موجودگی میں بی آئی ایس پی اہلیت کے لیے پی ایم ٹی (PMT) سکور حد 37 تک بڑھ جاتی ہے',
        'سرکاری اسکولوں میں پڑھنے والے بچوں کے تعلیمی وظائف کے بارے میں کوئی معلومات نہیں تھیں',
        'خیال تھا کہ معذور افراد کے خصوصی شناختی کارڈ کا حصول انتہائی پیچیدہ اور مہنگا ہے'
      ],
      sd: [
        'معذور ٻار جي ڪري PMT سکور وڌڻ جو علم نه هوس',
        'اسڪول ويندڙ ٻارن جي تعليمي وظيفن جي خبر نه هئس',
        'سڃاڻپ ڪارڊ ٺهرائڻ کي ڏکيو سمجهندو هو'
      ],
      ps: [
        'د معلول غړي له امله د PMT نمرې د لوړوالي خبر نه و',
        'د ماشومانو د تعلیمي وظیفو په اړه معلومات نه درلودل',
        'د معلولیت کارت جوړول ورته ستونزمن ښکاریدل'
      ],
      pn: [
        'معذور بچے دی وجہ توں PMT سکور حد ودھن دا پتہ نہیں سی',
        'سرکاری اسکول دے تعلیمی وظائف دا پتہ نہیں سی',
        'معذوری شناختی کارڈ بنوان نوں اوکھا سمجھدا سی'
      ],
      bl: [
        'معذوریں چورگ ءِ بیگ ءِ سوب ءَ چہ PMT اسکور ءِ گیش بیگ ءِ بارہ ءَ بے خبر ات',
        'اسکول روگءِ عمرءِ چورگانی تعلیمی وظائف ءِ بارہ ءَ معلومات نہ ات',
        'معذوری کارڈ ءِ بنوان ءَ اوکھا زانت'
      ]
    },
    after: {
      en: [
        'Discovered Kafaalat eligibility threshold is relaxed to 37 for households with disabled members',
        'Guided on obtaining the NADRA Special CNIC with disability logo free of charge',
        'Enrolled 3 of his school-going children in Taleemi Wazaif, securing Rs. 10,500/quarter',
        'Unlocked Sehat Card cover at the local DHQ hospital for his daughter\'s treatment'
      ],
      ur: [
        'رہنما نے بتایا کہ خاندان میں معذور فرد کی وجہ سے وہ 37 پی ایم ٹی سکور کے تحت بھی نقد امداد کے حقدار ہیں',
        'نادرا سے خصوصی معذوری علامت والا شناختی کارڈ بالکل مفت حاصل کرنے کی مرحلہ وار رہنمائی ملی',
        'تین اسکول جانے والے بچوں کے لیے تعلیمی وظائف کے تحت سہ ماہی 10,500 روپے حاصل کیے',
        'مقامی ڈی ایچ کیو ہسپتال میں بیٹی کے مفت علاج کے لیے صحت کارڈ کے استعمال کا طریقہ سیکھا'
      ],
      sd: [
        'رعايت تحت Kafaalat لاءِ اهل ٿيو',
        'خصوصي سڃاڻپ ڪارڊ ٺهرائڻ جو طريقو معلوم ڪيائين',
        '3 ٻارن لاءِ ٽماهي 10,500 رپيا وظيفو چيڪ ڪيائين'
      ],
      ps: [
        'د معلول غړي په اساس په ۳۷ نمره د کفالت وړ وبلل شو',
        'د معلولیت لرونکي شناختي کارډ د جوړولو لارښوونه ورته وشوه',
        'د خپلو دریو ماشومانو لپاره درې میاشتنی ۱۰،۵۰۰ روپۍ وظیفه تایید کړه'
      ],
      pn: [
        'اہلیت دی آسان شرط نال کفالت لئی فارم جمع کروایا',
        'معذوری شناختی کارڈ نادرا توں مفت بنوان دا پتہ چلیا',
        '3 بچیاں لئی تعلیمی وظیفہ حاصل کیتا'
      ],
      bl: [
        'معذوری ءِ سوب ءَ چہ 37 پی ایم ٹی اسکور ءَ لائق بیگ ءِ معلوم بوت',
        'نادرا چہ معذوری نشان والا شناختی کارڈ مفت جوڑ کنگ ءِ طریقہ سیکھا',
        '3 چورگانی وظیفہ (Rs. 10,500) ءِ رجسٹریشن کروائی',
        'ڈی ایچ کیو ہسپتال ءَ بیٹی ءِ مفت علاج واستہ صحت کارڈ کارمرز کت'
      ]
    },
    programs: ['Kafaalat', 'Taleemi Wazaif', 'Sehat Card'],
    potentialBenefit: {
      en: 'Rs. 25,000+ per quarter + Free Specialized Medical Treatment',
      ur: '25,000 روپے سے زائد فی سہ ماہی + ہسپتال میں مفت علاج کی سہولت',
      sd: 'ٽماهي 25,000 کان وڌيڪ + اسپتال ۾ مفت علاج',
      ps: 'تر ۲۵،۰۰۰ روپۍ پورې درې میاشتنی + د وړیا درملنې اسانتیا',
      pn: '25,000 روپے توں ودھ فی سہ ماہی + ہسپتال وچ مفت علاج',
      bl: '25,000 کلدار چہ گیش سہ ماہی + ہسپتال ءَ مفتیں علاج'
    },
    color: '#60A5FA',
  },
  {
    id: 'sajida',
    name: { en: 'Sajida Bibi', ur: 'ساجدہ بی بی', sd: 'ساجده بي بي', ps: 'ساجده بي بي', pn: 'ساجدہ بی بی', bl: 'ساجدہ بی بی' },
    province: { en: 'Khyber Pakhtunkhwa', ur: 'خیبرپختونخوا', sd: 'خيبر پختونخوا', ps: 'خيبر پښتونخوا', pn: 'خیبر پختونخوا', bl: 'خیبر پختونخوا' },
    initials: 'SB',
    situation: {
      en: 'Sajida is a widowed mother in Peshawar who earns a small income through home tailoring. She has an infant baby (12 months) and a daughter in high school. Sajida had no inheritance or financial support after her husband\'s demise.',
      ur: 'ساجدہ پشاور کی رہائشی بیوہ ہیں جو سلائی کڑھائی کر کے قلیل آمدنی کماتی ہیں۔ ان کا ایک 12 ماہ کا بچہ اور ایک بیٹی ہائی اسکول میں پڑھتی ہے۔ ساجدہ کے پاس کوئی مدد نہیں تھی۔',
      sd: 'ساجده پشاور جي هڪ بيوهه آهي جيڪا گهر ۾ سبڻ جو ڪم ڪري ٿي.',
      ps: 'ساجده په پېښور کې کونډه ده چې په کور کې جامې ګنډي او لږ عاید لري.',
      pn: 'ساجدہ پشاور دی رہن والی بیوہ اے جیہڑی سلائی کڑھائی دا کم کردی اے۔',
      bl: 'ساجدہ پشاور ءِ یک بیوہے کہ سلائی کڑھائی کنت ءُ کسانیں درآمدے است۔'
    },
    before: {
      en: [
        'Believed government benefits required land ownership documents or political connections',
        'Was unaware Kafaalat automatically unlocks secondary education stipends for girls',
        'Did not know she qualified for free milk and infant nutrition packets at nearby THQ hospital'
      ],
      ur: [
        'خیال تھا کہ حکومتی امداد کے لیے زمین کے کاغذات یا سیاسی اثر و رسوخ کی ضرورت ہوتی ہے',
        'علم نہیں تھا کہ بے نظیر کفالت کے ذریعے بیٹیوں کے اسکول اور کالج کے وظائف خودکار کھل جاتے ہیں',
        'مقامی تحصیل ہسپتال سے بچوں کے لیے مفت دودھ اور مقوی غذائی پیکیٹ ملنے کا علم نہیں تھا'
      ],
      sd: [
        'سمجهندي هئي ته سرڪاري مدد لاءِ سياسي سفارشن جي ضرورت هوندي آهي',
        'ڪفالت جي ذريعي نياڻين لاءِ وڌيڪ تعليمي وظيفن جي خبر نه هئس',
        'تحصيل اسپتال مان مفت کير ۽ ٻارن جي غذا ملڻ جي خبر نه هئس'
      ],
      ps: [
        'فکر یې کاوه چې دولتي مرستې سیاسي واسطو ته اړتیا لري',
        'نه پوهیدله چې د نجونو لپاره لوړ تعلیمي وظایف په خپله خلاصیږي',
        'له روغتون څخه د وړیا شیدو او خوراکي توکو د ترلاسه کولو خبر نه وه'
      ],
      pn: [
        'سرکاری امداد لئی سیاسی سفارش دی لوڑ سمجھدی سی',
        'کفالت دے تحت کڑیاں لئی وظائف ملن دا پتہ نہیں سی',
        'مفت خوراک تے راشن دا پتہ نہیں سی'
      ],
      bl: [
        'سرکاری فلاحی پروگراماں واستہ سفارش یا کاغذات المی انت اے چیز ءَ وہمی ات',
        'زانشت کہ کفالت ءِ وسیلہ ءَ چہ چورگانی تعلیمی وظیفہ وت بہ وت پچ بیت',
        'ہسپتال ءَ چہ مفتیں چورگ غذا ءِ ملگ چہ بے خبر ات'
      ]
    },
    after: {
      en: [
        'Discovered she qualifies for unconditional BISP cash transfers without any asset requirements',
        'Registered her daughter in high school for secondary education stipend of Rs. 4,000/quarter',
        'Enrolled her 12-month-old child in the Nashonuma nutrition center at Peshawar THQ hospital',
        'Successfully used Sehat Card for family checkup during emergency'
      ],
      ur: [
        'رہنما کی مدد سے معلوم ہوا کہ بی آئی ایس پی کی نقد امداد کے لیے کسی اثاثے یا سفارش کی ضرورت نہیں',
        'ہائی اسکول میں پڑھتی بیٹی کے لیے سہ ماہی 4,000 روپے کا سیکنڈری تعلیمی وظیفہ فعال کروایا',
        'پشاور تحصیل ہسپتال کے نشونما مرکز سے اپنے 12 ماہ کے بچے کے لیے مفت مقوی غذا حاصل کی',
        'ایمرجنسی کی صورت میں ہسپتال میں صحت کارڈ کے ذریعے خاندان کا مفت علاج کروایا'
      ],
      sd: [
        'معلوم ڪيائين ته Kafaalat مالي مدد لاءِ ڪنهن سفارش جي ضرورت ناهي',
        'ڌي لاءِ ٽماهي 4,000 رپيا وظيفو فعال ڪرايائين',
        'ٻار لاءِ نشونما مرڪز مان مفت راشن حاصل ڪيائين'
      ],
      ps: [
        'پوهه شوه چې د BISP نغدي مرستې لپاره کوم واسطې ته اړتیا نشته',
        'د خپلې لور لپاره درې میاشتنی ۴،۰۰۰ روپۍ تعلیمي وظیفه خلاصه کړه',
        'د روغتون له نشونما مرکز څخه یې د خپل ماشوم لپاره وړیا تغذیه ترلاسه کړه'
      ],
      pn: [
        'راہنما توں پتہ چلیا کہ کفالت لئی کسے سفارش دی لوڑ نہیں',
        'دھی لئی ہائی اسکول دا وظیفہ شروع کروایا',
        'نشونما مرکز توں بچے لئی مفت راشن حاصل کیتا'
      ],
      bl: [
        'رہنما ءَ چہ معلوم بوت کہ BISP ءِ زر ءِ شوہاز ءَ واستہ سفارش پکار نہ انت',
        'ہائی اسکول ءَ وانگیں بیٹی ءِ واستہ Rs. 4,000 وظیفہ ءِ رجسٹریشن کروائی',
        'نشونما مرکز چہ چورگ واستہ مفتیں راشن حاصل کت'
      ]
    },
    programs: ['Kafaalat', 'Taleemi Wazaif', 'Nashonuma'],
    potentialBenefit: {
      en: 'Rs. 20,500/quarter + Specialized Nutrition supplement',
      ur: '20,500 روپے فی سہ ماہی + مفت غذائی پیکیٹ',
      sd: 'ٽماهي 20,500 + مفت غذائي پيڪيٽ',
      ps: 'درې میاشتنی ۲۰،۵۰۰ روپۍ + د وړیا خوراکي توکو کڅوړه',
      pn: '20,500 روپے فی سہ ماہی + مفت راشن',
      bl: '20,500 کلدار سہ ماہی + مفتیں راشن پیکیج'
    },
    color: '#34D399',
  }
];

export default function StoriesPage() {
  const { t, language } = useLanguage();
  const [activeStory, setActiveStory] = useState(0);
  const story = STORIES[activeStory];

  const getTranslation = (field: any) => {
    if (!field) return '';
    return field[language] || field.ur || field.en || '';
  };

  const getTranslationList = (field: any): string[] => {
    if (!field) return [];
    return field[language] || field.ur || field.en || [];
  };

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
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-400 flex items-center justify-center font-bold text-sm shrink-0 border border-gold-500/10">
                {s.initials}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">{getTranslation(s.name)}</div>
                <div className="text-[10px] text-sage-500">{getTranslation(s.province)}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Active story */}
        <div className="animate-fade-in-up" key={story.id}>
          {/* Profile card */}
          <div className="glass rounded-2xl p-6 mb-8" style={{ borderColor: `${story.color}30` }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/10 text-gold-400 flex items-center justify-center font-bold text-xl shrink-0 border border-gold-500/20 shadow-lg">
                {story.initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-cream">
                  {getTranslation(story.name)} 
                  <span className="text-sage-500 text-lg font-normal"> ({story.name.ur})</span>
                </h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-sage-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold-400" /> {getTranslation(story.province)}</span>
                </div>
              </div>
            </div>
            <p className="text-sage-300 text-sm leading-relaxed">{getTranslation(story.situation)}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {story.programs.map(p => (
                <span key={p} className="text-xs px-3 py-1 rounded-full glass text-sage-400">{p}</span>
              ))}
            </div>
          </div>

          {/* Before/After */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl p-6 border border-rose-500/20 bg-rose-500/5">
              <h3 className="text-sm font-bold text-rose-400 mb-4 uppercase tracking-wider">{t('stories.before')}</h3>
              <ul className="space-y-3">
                {getTranslationList(story.before).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-sage-400">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/5">
              <h3 className="text-sm font-bold text-emerald-400 mb-4 uppercase tracking-wider">{t('stories.after')}</h3>
              <ul className="space-y-3">
                {getTranslationList(story.after).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-sage-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Potential benefit */}
          <div className="glass-gold rounded-2xl p-6 text-center">
            <p className="text-sm text-sage-400 mb-2">{t('stories.potential')}</p>
            <p className="text-3xl font-bold text-gradient-gold">{getTranslation(story.potentialBenefit)}</p>
            <Link href="/navigator" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-emerald-950 font-bold text-sm hover:from-gold-500 hover:to-gold-400 transition-all cursor-pointer">
              {t('hero.cta.chat')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
