import { AssessmentResult, Language } from '@/lib/rules-engine/types';

function formatResultSummary(results: AssessmentResult, lang: Language): string {
  const lines: string[] = [];

  const headers: Record<Language, string> = {
    en: '🏛️ Raahnuma Eligibility Summary',
    ur: '🏛️ رہنما اہلیت خلاصہ',
    sd: '🏛️ رهنما اهليت جو خلاصو',
    ps: '🏛️ د رهنما وړتیا لنډیز',
    pn: '🏛️ راہنما اہلیت دا خلاصہ',
    bl: '🏛️ رہنما اہلیت ءِ خلاصہ'
  };

  lines.push(headers[lang] || headers.en);
  lines.push('─'.repeat(30));

  for (const r of results.results) {
    if (r.status === 'LIKELY_NOT_ELIGIBLE') continue;
    const name = r.program.name[lang] || r.program.name.ur || r.program.name.en;
    
    let statusText = '';
    if (r.status === 'LIKELY_ELIGIBLE') {
      const texts: Record<Language, string> = {
        en: 'Likely Eligible',
        ur: 'غالباً اہل',
        sd: 'غالباً اهل',
        ps: 'احتمالي وړ',
        pn: 'غالباً اہل',
        bl: 'غالباً لائق'
      };
      statusText = texts[lang] || texts.en;
    } else {
      const texts: Record<Language, string> = {
        en: 'May Be Eligible',
        ur: 'اہل ہو سکتے ہیں',
        sd: 'اهل ٿي سگهو ٿا',
        ps: 'کیدای شي وړ وي',
        pn: 'اہل ہو سکدے او',
        bl: 'لائق بوت کنائت'
      };
      statusText = texts[lang] || texts.en;
    }
    lines.push(`• ${name}: ${statusText}`);
  }

  lines.push('');
  const disclaimerText = results.disclaimer[lang] || results.disclaimer.ur || results.disclaimer.en;
  lines.push(disclaimerText);
  lines.push('');
  lines.push('https://raahnuma.vercel.app');

  return lines.join('\n');
}

export function shareViaWhatsApp(results: AssessmentResult, lang: Language = 'en'): void {
  const text = encodeURIComponent(formatResultSummary(results, lang));
  window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
}

export function copyResultsToClipboard(
  results: AssessmentResult,
  lang: Language = 'en'
): Promise<void> {
  const text = formatResultSummary(results, lang);
  return navigator.clipboard.writeText(text);
}

export function printResults(): void {
  window.print();
}

export function generateSmsBody(
  type: 'kafaalat' | 'sehat',
  cnic: string
): { to: string; body: string } {
  const normalized = cnic.replace(/-/g, '');
  if (type === 'kafaalat') {
    return { to: '8171', body: normalized };
  }
  return { to: '8500', body: normalized };
}

export function openSmsApp(type: 'kafaalat' | 'sehat', cnic: string): void {
  const { to, body } = generateSmsBody(type, cnic);
  const smsUrl = `sms:${to}?body=${encodeURIComponent(body)}`;
  window.location.href = smsUrl;
}
