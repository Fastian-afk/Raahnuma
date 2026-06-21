import { AssessmentResult } from '@/lib/rules-engine/types';

function formatResultSummary(results: AssessmentResult, lang: 'en' | 'ur'): string {
  const isEn = lang === 'en';
  const lines: string[] = [];

  lines.push(isEn ? '🏛️ Raahnuma Eligibility Summary' : '🏛️ رہنما اہلیت خلاصہ');
  lines.push('─'.repeat(30));

  for (const r of results.results) {
    if (r.status === 'LIKELY_NOT_ELIGIBLE') continue;
    const name = isEn ? r.program.name.en : r.program.name.ur;
    const status =
      r.status === 'LIKELY_ELIGIBLE'
        ? isEn
          ? 'Likely Eligible'
          : 'غالباً اہل'
        : isEn
          ? 'May Be Eligible'
          : 'اہل ہو سکتے ہیں';
    lines.push(`• ${name}: ${status}`);
  }

  lines.push('');
  lines.push(isEn ? results.disclaimer.en : results.disclaimer.ur);
  lines.push('');
  lines.push('https://raahnuma.vercel.app');

  return lines.join('\n');
}

export function shareViaWhatsApp(results: AssessmentResult, lang: 'en' | 'ur' = 'en'): void {
  const text = encodeURIComponent(formatResultSummary(results, lang));
  window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
}

export function copyResultsToClipboard(
  results: AssessmentResult,
  lang: 'en' | 'ur' = 'en'
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
