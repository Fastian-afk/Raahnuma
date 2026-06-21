'use client';

import React from 'react';
import { AssessmentResult } from '@/lib/rules-engine/types';
import { useLanguage } from '@/lib/i18n/context';
import ResultCard from './ResultCard';
import SmsGenerator from './SmsGenerator';
import NearbyOffices from './NearbyOffices';
import { Share2, Printer, Copy, Check } from 'lucide-react';
import {
  shareViaWhatsApp,
  copyResultsToClipboard,
  printResults,
} from '@/lib/utils/share-print';

interface ResultsPanelProps {
  results: AssessmentResult;
  className?: string;
  showNearby?: boolean;
}

export default function ResultsPanel({
  results,
  className = '',
  showNearby = true,
}: ResultsPanelProps) {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await copyResultsToClipboard(results, language);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  return (
    <div className={`flex flex-col ${className}`} id="results-panel">
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between no-print">
        <h3 className="font-bold text-cream">{t('results.title')}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => shareViaWhatsApp(results, language)}
            className="p-1.5 rounded-lg hover:bg-emerald-800/40 text-sage-500"
            title={t('share.whatsapp')}
            aria-label={t('share.whatsapp')}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-emerald-800/40 text-sage-500"
            title={t('share.copy')}
            aria-label={t('share.copy')}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={printResults}
            className="p-1.5 rounded-lg hover:bg-emerald-800/40 text-sage-500"
            title={t('share.print')}
            aria-label={t('share.print')}
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="glass-gold rounded-xl p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-400">
                {results.likelyEligibleCount}
              </div>
              <div className="text-[10px] text-sage-500">{t('results.likely')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {results.mayBeEligibleCount}
              </div>
              <div className="text-[10px] text-sage-500">{t('results.maybe')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-sage-500">
                {results.totalProgramsChecked}
              </div>
              <div className="text-[10px] text-sage-500">Checked</div>
            </div>
          </div>
        </div>

        {(results.crossProgramAlerts[language]?.length || 0) > 0 && (
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <h4 className="text-xs font-semibold text-emerald-400 mb-2">
              🔗 Cross-Program Alerts
            </h4>
            {(results.crossProgramAlerts[language] || results.crossProgramAlerts.ur || results.crossProgramAlerts.en || []).map(
              (alert, i) => (
                <p key={i} className="text-xs text-sage-300 mb-1">
                  {alert}
                </p>
              )
            )}
          </div>
        )}

        {results.results.map((result) => (
          <ResultCard key={result.programId} result={result} lang={language} />
        ))}

        <SmsGenerator />

        {showNearby && results.profile.province && (
          <NearbyOffices province={results.profile.province} />
        )}

        <div className="p-3 rounded-xl bg-gold-500/5 border border-gold-500/20">
          <p className="text-[11px] text-gold-400/80 leading-relaxed">
            ⚠️ {results.disclaimer[language] || results.disclaimer.ur || results.disclaimer.en}
          </p>
        </div>
      </div>
    </div>
  );
}
