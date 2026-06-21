'use client';

import React, { useState } from 'react';
import { EligibilityResult } from '@/lib/rules-engine/types';
import {
  Banknote,
  GraduationCap,
  HeartPulse,
  ShieldPlus,
  Package,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Phone,
  Globe,
  MapPin,
  FileText,
} from 'lucide-react';

const PROGRAM_ICONS: Record<string, React.ReactNode> = {
  kafaalat: <Banknote className="w-5 h-5" />,
  taleemi_wazaif: <GraduationCap className="w-5 h-5" />,
  nashonuma: <HeartPulse className="w-5 h-5" />,
  sehat_sahulat: <ShieldPlus className="w-5 h-5" />,
  ramzan_relief: <Package className="w-5 h-5" />,
};

export const STATUS_CONFIG = {
  LIKELY_ELIGIBLE: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: 'Likely Eligible',
    labelUr: 'غالباً اہل',
    class: 'status-eligible',
    color: '#34D399',
  },
  MAY_BE_ELIGIBLE: {
    icon: <AlertCircle className="w-5 h-5" />,
    label: 'May Be Eligible',
    labelUr: 'اہل ہو سکتے ہیں',
    class: 'status-maybe',
    color: '#FBBF24',
  },
  LIKELY_NOT_ELIGIBLE: {
    icon: <XCircle className="w-5 h-5" />,
    label: 'Likely Not Eligible',
    labelUr: 'غالباً نا اہل',
    class: 'status-unlikely',
    color: '#FB7185',
  },
  INSUFFICIENT_DATA: {
    icon: <HelpCircle className="w-5 h-5" />,
    label: 'More Info Needed',
    labelUr: 'مزید معلومات درکار',
    class: 'status-maybe',
    color: '#94A3B8',
  },
};

interface ResultCardProps {
  result: EligibilityResult;
  lang: string;
  defaultExpanded?: boolean;
}

export default function ResultCard({
  result,
  lang,
  defaultExpanded = false,
}: ResultCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const status = STATUS_CONFIG[result.status];
  const isEn = lang === 'en';

  return (
    <div className="glass rounded-xl overflow-hidden card-hover border border-border-subtle print-result-card">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${result.program.color}15`,
              color: result.program.color,
            }}
          >
            {PROGRAM_ICONS[result.programId]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-bold text-cream text-sm">
                {isEn ? result.program.name.en : result.program.name.ur}
              </h4>
              <span
                className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${status.class}`}
              >
                {isEn ? status.label : status.labelUr}
              </span>
            </div>
            <p className="text-xs text-gold-400 mt-1">
              {isEn ? result.program.benefit.en : result.program.benefit.ur}
            </p>
            {result.confidence < 0.5 && (
              <p className="text-[10px] text-sage-500 mt-1">
                {isEn
                  ? `Confidence: ${Math.round(result.confidence * 100)}% — verify with official channels`
                  : `اعتماد: ${Math.round(result.confidence * 100)}% — سرکاری ذرائع سے تصدیق کریں`}
              </p>
            )}
          </div>
          <button className="text-sage-500 shrink-0" aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border-subtle pt-4 animate-fade-in-up">
          <div>
            <h5 className="text-xs font-semibold text-sage-400 mb-2 uppercase tracking-wider">
              {isEn ? 'Why' : 'وجہ'}
            </h5>
            <p className="text-sm text-sage-300 leading-relaxed">
              {isEn ? result.explanation.en : result.explanation.ur}
            </p>
          </div>

          {result.provinceNote && (
            <div className="p-3 rounded-lg bg-gold-500/5 border border-gold-500/20">
              <p className="text-xs text-gold-400">
                ⚠️ {isEn ? result.provinceNote.en : result.provinceNote.ur}
              </p>
            </div>
          )}

          <div>
            <h5 className="text-xs font-semibold text-sage-400 mb-2 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3" /> {isEn ? 'Documents Needed' : 'ضروری دستاویزات'}
            </h5>
            <ul className="space-y-1">
              {(isEn
                ? result.program.requiredDocuments.en
                : result.program.requiredDocuments.ur
              ).map((doc, i) => (
                <li key={i} className="text-xs text-sage-300 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span> {doc}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-sage-400 mb-2 uppercase tracking-wider">
              {isEn ? 'How to Register' : 'رجسٹریشن کا طریقہ'}
            </h5>
            <div className="space-y-2">
              {result.program.registrationChannels.map((ch, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {ch.type === 'sms' && (
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  )}
                  {ch.type === 'web_portal' && (
                    <Globe className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                  )}
                  {ch.type === 'helpline' && (
                    <Phone className="w-3.5 h-3.5 text-gold-400 mt-0.5 shrink-0" />
                  )}
                  {ch.type === 'in_person' && (
                    <MapPin className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="text-sage-300">
                      {isEn ? ch.details.en : ch.details.ur}
                    </span>
                    {ch.smsCode && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                        {ch.smsCode}
                      </span>
                    )}
                    {ch.url && (
                      <a
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        {ch.url.replace('https://', '')}{' '}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.unlocks && result.unlocks.length > 0 && (
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xs text-emerald-400">
                🔗{' '}
                {isEn
                  ? `Qualifying for this program may also unlock: ${result.unlocks.join(', ')}`
                  : `اس پروگرام کے لیے اہل ہونے سے یہ بھی کھل سکتے ہیں: ${result.unlocks.join(', ')}`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
