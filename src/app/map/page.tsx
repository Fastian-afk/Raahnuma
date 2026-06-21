'use client';
import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useLanguage } from '@/lib/i18n/context';
import { Province } from '@/lib/rules-engine/types';
import { PROGRAMS } from '@/lib/rules-engine/programs';
import { MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/layout/InteractiveMap'), { ssr: false });

const PROVINCE_DATA: Record<Province, { name: string; population: string; color: string }> = {
  punjab: { name: 'Punjab', population: '110M+', color: '#E3BE7E' },
  sindh: { name: 'Sindh', population: '47M+', color: '#5BBFA0' },
  kpk: { name: 'Khyber Pakhtunkhwa', population: '35M+', color: '#60A5FA' },
  balochistan: { name: 'Balochistan', population: '12M+', color: '#C084FC' },
  islamabad: { name: 'Islamabad', population: '2M+', color: '#FB7185' },
  ajk: { name: 'Azad Kashmir', population: '4M+', color: '#34D399' },
  gilgit_baltistan: { name: 'Gilgit-Baltistan', population: '1.5M+', color: '#FBBF24' },
};

export default function MapPage() {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<Province | null>(null);
  const selectedData = selected ? PROVINCE_DATA[selected] : null;

  const getProvincePrograms = (province: Province) => {
    return PROGRAMS.map(program => {
      const variation = program.provinceVariations?.find(v => v.province === province);
      return { program, variation, isAvailable: variation ? variation.isAvailable : true };
    });
  };

  const getProvinceName = (prov: Province) => {
    const names: Record<Province, Record<string, string>> = {
      punjab: { en: 'Punjab', ur: 'پنجاب', sd: 'پنجاب', ps: 'پنجاب', pn: 'پنجاب', bl: 'پنجاب' },
      sindh: { en: 'Sindh', ur: 'سندھ', sd: 'سنڌ', ps: 'سندھ', pn: 'سندھ', bl: 'سندھ' },
      kpk: { en: 'Khyber Pakhtunkhwa', ur: 'خیبرپختونخوا', sd: 'خيبر پختونخوا', ps: 'خيبر پښتونخوا', pn: 'خیبر پختونخوا', bl: 'خیبر پختونخوا' },
      balochistan: { en: 'Balochistan', ur: 'بلوچستان', sd: 'بلوچستان', ps: 'بلوچستان', pn: 'بلوچستان', bl: 'بلوچستان' },
      islamabad: { en: 'Islamabad', ur: 'اسلام آباد', sd: 'اسلام آباد', ps: 'اسلام آباد', pn: 'اسلام آباد', bl: 'اسلام آباد' },
      ajk: { en: 'Azad Kashmir', ur: 'آزاد کشمیر', sd: 'آزاد ڪشمير', ps: 'آزاد کشمیر', pn: 'آزاد کشمیر', bl: 'آزاد کشمیر' },
      gilgit_baltistan: { en: 'Gilgit-Baltistan', ur: 'گلگت بلتستان', sd: 'گلگت بلتستان', ps: 'گلگت بلتستان', pn: 'گلگت بلتستان', bl: 'گلگت بلتستان' }
    };
    return names[prov]?.[language] || names[prov]?.ur || names[prov]?.en || prov;
  };

  const getTranslation = (field: any) => {
    if (!field) return '';
    return field[language] || field.ur || field.en || '';
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cream mb-2">{t('map.title')}</h1>
          <p className="text-sage-400">{t('map.select')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="glass rounded-2xl p-2 relative h-[500px] overflow-hidden">
            <InteractiveMap selected={selected} onSelect={setSelected} language={language} />
          </div>

          {/* Details Panel */}
          <div>
            {selected && selectedData ? (
              <div className="space-y-6 animate-fade-in-up">
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedData.color}20` }}>
                      <MapPin className="w-7 h-7" style={{ color: selectedData.color }} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-cream">{getProvinceName(selected)}</h2>
                      <p className="text-sage-400 text-sm">{t('map.population')}: {selectedData.population}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-cream">{t('map.coverage_title')}</h3>
                {getProvincePrograms(selected).map(({ program, variation }) => (
                  <div key={program.id} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-cream text-sm">{getTranslation(program.name)}</h4>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-gold-400 mb-2">{getTranslation(program.benefit)}</p>
                    {variation && (
                      <div className="p-3 rounded-lg bg-gold-500/5 border border-gold-500/20 mt-2">
                        <p className="text-xs text-sage-300">{getTranslation(variation.description)}</p>
                        {variation.hospitalType && (
                          <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full ${
                            variation.hospitalType === 'private_only' ? 'bg-gold-500/10 text-gold-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {variation.hospitalType === 'private_only' ? '⚠️ ' + t('map.punjab_warning_title') : '✓ ' + t('map.public_private')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {selected === 'punjab' && (
                  <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-gold-400">{t('map.punjab_warning_title')}</h4>
                        <p className="text-xs text-sage-300 mt-1">{t('map.punjab_warning_desc')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-sage-500 py-20">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30 animate-bounce" />
                  <p className="text-lg font-medium">{t('map.details_placeholder_title')}</p>
                  <p className="text-sm">{t('map.details_placeholder_desc')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
