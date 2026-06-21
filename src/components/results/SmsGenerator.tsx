'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { openSmsApp } from '@/lib/utils/share-print';
import { MessageSquare, Send } from 'lucide-react';

export default function SmsGenerator() {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [cnic, setCnic] = useState('');
  const [error, setError] = useState('');
  const [smsType, setSmsType] = useState<'kafaalat' | 'sehat'>('kafaalat');

  const validateCnic = (value: string): boolean => {
    const normalized = value.replace(/-/g, '');
    if (!/^\d{13}$/.test(normalized)) {
      const msgs: Record<string, string> = {
        en: 'Enter a valid 13-digit CNIC (e.g. 12345-1234567-1)',
        ur: 'درست 13 ہندسوں والا CNIC درج کریں',
        sd: 'درست 13 انگن وارو شناختي ڪارڊ نمبر داخل ڪريو',
        ps: 'مهرباني وکړئ درست ۱۳ رقمي شناختي کارډ دننه کړئ',
        pn: 'درست 13 ہندسیاں والا شناختی کارڈ نمبر لکھو',
        bl: 'درستیں 13 رقمی شناختی کارڈ نمبر بہ نویس ات'
      };
      setError(msgs[language] || msgs.en);
      return false;
    }
    setError('');
    return true;
  };

  const handleSend = () => {
    if (!validateCnic(cnic)) return;
    openSmsApp(smsType, cnic);
  };

  const getSmsDesc = () => {
    const descs: Record<string, string> = {
      en: 'Enter your CNIC to open a pre-filled SMS to the official verification number.',
      ur: 'اپنا CNIC درج کریں تاکہ سرکاری تصدیقی نمبر پر SMS کھل جائے۔',
      sd: 'پنهنجو سڃاڻپ ڪارڊ نمبر داخل ڪريو ته جيئن سرڪاري نمبر تي ايس ايم ايس کلي سگهي.',
      ps: 'خپل شناختي کارډ شمیره دننه کړئ ترڅو رسمي شمیرې ته ايس ايم ايس پرانیستل شي.',
      pn: 'اپنا شناختی کارڈ نمبر لکھو تاں جے سرکاری نمبر تے ايس ايم ايس کھل جائے۔',
      bl: 'وتی شناختی کارڈ نمبر ءَ بہ نویس ات داں سرکاری نمبرءِ واستہ ايس ايم ايس پچ بہ بیت۔'
    };
    return descs[language] || descs.en;
  };

  return (
    <div className="glass rounded-xl p-4 border border-border-subtle no-print">
      <h4 className="text-sm font-bold text-cream mb-3 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-emerald-400" />
        {t('sms.generate')}
      </h4>
      <p className="text-xs text-sage-500 mb-3">
        {getSmsDesc()}
      </p>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setSmsType('kafaalat')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            smsType === 'kafaalat'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'glass text-sage-500'
          }`}
        >
          BISP (8171)
        </button>
        <button
          onClick={() => setSmsType('sehat')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            smsType === 'sehat'
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              : 'glass text-sage-500'
          }`}
        >
          Sehat Card (8500)
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={cnic}
          onChange={(e) => {
            setCnic(e.target.value);
            setError('');
          }}
          placeholder="12345-1234567-1"
          className="flex-1 px-3 py-2 rounded-lg glass bg-transparent text-cream text-sm outline-none font-mono"
          maxLength={15}
          aria-label="CNIC number"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 text-emerald-950 text-sm font-bold flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
          SMS
        </button>
      </div>
      {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
    </div>
  );
}
