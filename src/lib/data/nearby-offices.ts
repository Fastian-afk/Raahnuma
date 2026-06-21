import { Province } from '@/lib/rules-engine/types';

export interface OfficeLocation {
  id: string;
  name: { en: string; ur: string };
  type: 'bisp' | 'nadra' | 'dhq_hospital' | 'bisp_tehsil';
  province: Province;
  city: string;
  address: { en: string; ur: string };
  phone?: string;
  hours?: { en: string; ur: string };
}

/**
 * Curated static office data for demo purposes.
 * Production: sync from government open data or partner admin dashboard (qualifier feedback).
 */
export const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    id: 'bisp-isb-hq',
    name: { en: 'BISP Headquarters', ur: 'بے نظیر انکم سپورٹ پروگرام ہیڈ کوارٹر' },
    type: 'bisp',
    province: 'islamabad',
    city: 'Islamabad',
    address: { en: 'F-6 Markaz, Islamabad', ur: 'ایف-6 مارکاز، اسلام آباد' },
    phone: '051-9246326',
    hours: { en: 'Mon–Fri 9:00 AM – 5:00 PM', ur: 'پیر–جمعہ صبح 9 بجے سے شام 5 بجے' },
  },
  {
    id: 'bisp-lhr',
    name: { en: 'BISP Punjab Regional Office', ur: 'بے نظیر انکم سپورٹ پنجاب ریجنل آفس' },
    type: 'bisp',
    province: 'punjab',
    city: 'Lahore',
    address: { en: 'Egerton Road, Lahore', ur: 'ایجرٹن روڈ، لاہور' },
    phone: '042-99204961',
  },
  {
    id: 'bisp-khi',
    name: { en: 'BISP Sindh Regional Office', ur: 'بے نظیر انکم سپورٹ سندھ ریجنل آفس' },
    type: 'bisp',
    province: 'sindh',
    city: 'Karachi',
    address: { en: 'Clifton, Karachi', ur: 'کلفٹن، کراچی' },
    phone: '021-99251601',
  },
  {
    id: 'bisp-pesh',
    name: { en: 'BISP KP Regional Office', ur: 'بے نظیر انکم سپورٹ خیبرپختونخوا ریجنل آفس' },
    type: 'bisp',
    province: 'kpk',
    city: 'Peshawar',
    address: { en: 'University Road, Peshawar', ur: 'یونیورسٹی روڈ، پشاور' },
    phone: '091-9213170',
  },
  {
    id: 'nadra-isb',
    name: { en: 'NADRA Registration Center — Islamabad', ur: 'نادرا رجسٹریشن سینٹر — اسلام آباد' },
    type: 'nadra',
    province: 'islamabad',
    city: 'Islamabad',
    address: { en: 'NADRA HQ, Blue Area, Islamabad', ur: 'نادرا ہیڈ کوارٹر، بلیو ایریا، اسلام آباد' },
    phone: '051-111-786-100',
    hours: { en: 'Mon–Sat 9:00 AM – 9:00 PM', ur: 'پیر–ہفتہ صبح 9 بجے سے رات 9 بجے' },
  },
  {
    id: 'nadra-lhr',
    name: { en: 'NADRA Mega Center — Lahore', ur: 'نادرا میگا سینٹر — لاہور' },
    type: 'nadra',
    province: 'punjab',
    city: 'Lahore',
    address: { en: 'DHA Phase 5, Lahore', ur: 'ڈی ایچ اے فیز 5، لاہور' },
    phone: '042-111-786-100',
  },
  {
    id: 'dhq-lhr',
    name: { en: 'Mayo Hospital (DHQ) — Lahore', ur: 'مایو ہسپتال (ڈی ایچ کیو) — لاہور' },
    type: 'dhq_hospital',
    province: 'punjab',
    city: 'Lahore',
    address: { en: 'Outer Ring Road, Lahore', ur: 'آؤٹر رنگ روڈ، لاہور' },
    phone: '042-99211101',
  },
  {
    id: 'dhq-khi',
    name: { en: 'Civil Hospital Karachi (DHQ)', ur: 'سول ہسپتال کراچی (ڈی ایچ کیو)' },
    type: 'dhq_hospital',
    province: 'sindh',
    city: 'Karachi',
    address: { en: 'M.A. Jinnah Road, Karachi', ur: 'ایم اے جناح روڈ، کراچی' },
    phone: '021-99201300',
  },
  {
    id: 'dhq-pesh',
    name: { en: 'Lady Reading Hospital (DHQ) — Peshawar', ur: 'لیڈی ریڈنگ ہسپتال — پشاور' },
    type: 'dhq_hospital',
    province: 'kpk',
    city: 'Peshawar',
    address: { en: 'Hospital Road, Peshawar', ur: 'ہسپتال روڈ، پشاور' },
    phone: '091-9211370',
  },
  {
    id: 'bisp-quetta',
    name: { en: 'BISP Balochistan Regional Office', ur: 'بے نظیر انکم سپورٹ بلوچستان ریجنل آفس' },
    type: 'bisp',
    province: 'balochistan',
    city: 'Quetta',
    address: { en: 'Sariab Road, Quetta', ur: 'سریاب روڈ، کوئٹہ' },
    phone: '081-9202200',
  },
];

export function getOfficesByProvince(province: Province): OfficeLocation[] {
  return OFFICE_LOCATIONS.filter((o) => o.province === province);
}

export function getOfficesByType(
  province: Province,
  type: OfficeLocation['type']
): OfficeLocation[] {
  return OFFICE_LOCATIONS.filter((o) => o.province === province && o.type === type);
}
