'use client';
import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useLanguage } from '@/lib/i18n/context';
import { Province } from '@/lib/rules-engine/types';
import { PROGRAMS } from '@/lib/rules-engine/programs';
import { MapPin, CheckCircle2, XCircle, AlertTriangle, ShieldPlus, Info } from 'lucide-react';

const PROVINCE_DATA: Record<Province, { name: string; nameUr: string; population: string; color: string; x: number; y: number; width: number; height: number }> = {
  punjab: { name: 'Punjab', nameUr: 'پنجاب', population: '110M+', color: '#E3BE7E', x: 45, y: 45, width: 22, height: 28 },
  sindh: { name: 'Sindh', nameUr: 'سندھ', population: '47M+', color: '#5BBFA0', x: 30, y: 65, width: 20, height: 25 },
  kpk: { name: 'Khyber Pakhtunkhwa', nameUr: 'خیبرپختونخوا', population: '35M+', color: '#60A5FA', x: 40, y: 18, width: 18, height: 20 },
  balochistan: { name: 'Balochistan', nameUr: 'بلوچستان', population: '12M+', color: '#C084FC', x: 12, y: 38, width: 30, height: 35 },
  islamabad: { name: 'Islamabad', nameUr: 'اسلام آباد', population: '2M+', color: '#FB7185', x: 52, y: 30, width: 5, height: 5 },
  ajk: { name: 'Azad Kashmir', nameUr: 'آزاد کشمیر', population: '4M+', color: '#34D399', x: 55, y: 15, width: 10, height: 12 },
  gilgit_baltistan: { name: 'Gilgit-Baltistan', nameUr: 'گلگت بلتستان', population: '1.5M+', color: '#FBBF24', x: 50, y: 2, width: 25, height: 16 },
};

export default function MapPage() {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<Province | null>(null);
  const isEn = language === 'en';
  const selectedData = selected ? PROVINCE_DATA[selected] : null;

  const getProvincePrograms = (province: Province) => {
    return PROGRAMS.map(program => {
      const variation = program.provinceVariations?.find(v => v.province === province);
      return { program, variation, isAvailable: variation ? variation.isAvailable : true };
    });
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
          <div className="glass rounded-2xl p-8 relative" style={{ minHeight: '500px' }}>
            <div className="relative w-full h-full" style={{ minHeight: '450px' }}>
              {Object.entries(PROVINCE_DATA).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelected(key as Province)}
                  className={`absolute rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer group ${
                    selected === key ? 'ring-2 ring-gold-400 scale-105 z-10' : 'hover:scale-105 hover:z-10'
                  }`}
                  style={{
                    left: `${data.x}%`, top: `${data.y}%`,
                    width: `${data.width}%`, height: `${data.height}%`,
                    backgroundColor: selected === key ? `${data.color}30` : `${data.color}15`,
                    border: `1px solid ${data.color}40`,
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold" style={{ color: data.color }}>{data.name}</div>
                    <div className="text-[10px] text-sage-500">{data.nameUr}</div>
                  </div>
                </button>
              ))}
            </div>
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
                      <h2 className="text-2xl font-bold text-cream">{selectedData.name}</h2>
                      <p className="text-sage-400 text-sm">{selectedData.nameUr} · Population: {selectedData.population}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-cream">Program Coverage</h3>
                {getProvincePrograms(selected).map(({ program, variation }) => (
                  <div key={program.id} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-cream text-sm">{isEn ? program.name.en : program.name.ur}</h4>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-gold-400 mb-2">{isEn ? program.benefit.en : program.benefit.ur}</p>
                    {variation && (
                      <div className="p-3 rounded-lg bg-gold-500/5 border border-gold-500/20 mt-2">
                        <p className="text-xs text-sage-300">{isEn ? variation.description.en : variation.description.ur}</p>
                        {variation.hospitalType && (
                          <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full ${
                            variation.hospitalType === 'private_only' ? 'bg-gold-500/10 text-gold-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {variation.hospitalType === 'private_only' ? '⚠️ Private Hospitals Only' : '✓ Public + Private'}
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
                        <h4 className="text-sm font-bold text-gold-400">Important for Punjab Residents</h4>
                        <p className="text-xs text-sage-300 mt-1">The Sehat Card in Punjab ONLY works at private empaneled hospitals. Government hospitals are NOT covered. Also, only in-patient treatment is covered — routine OPD visits and checkups are NOT included.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-sage-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Select a province</p>
                  <p className="text-sm">Click on the map to view program coverage</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
