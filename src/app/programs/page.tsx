'use client';
import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useLanguage } from '@/lib/i18n/context';
import { PROGRAMS, getProgramById } from '@/lib/rules-engine/programs';
import { Program, ProgramType } from '@/lib/rules-engine/types';
import {
  Banknote, GraduationCap, HeartPulse, ShieldPlus, Package,
  Filter, Search, ChevronDown, ChevronUp, ExternalLink,
  MessageSquare, Phone, Globe, MapPin, FileText, Info, GitCompare, X
} from 'lucide-react';

const PROGRAM_ICONS: Record<string, React.ReactNode> = {
  kafaalat: <Banknote className="w-6 h-6" />,
  taleemi_wazaif: <GraduationCap className="w-6 h-6" />,
  nashonuma: <HeartPulse className="w-6 h-6" />,
  sehat_sahulat: <ShieldPlus className="w-6 h-6" />,
  ramzan_relief: <Package className="w-6 h-6" />,
};

const TYPE_FILTERS: { type: ProgramType | 'all'; labelKey: string; icon: React.ReactNode }[] = [
  { type: 'all', labelKey: 'All Programs', icon: <Filter className="w-4 h-4" /> },
  { type: 'cash_transfer', labelKey: 'Cash Transfer', icon: <Banknote className="w-4 h-4" /> },
  { type: 'education', labelKey: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
  { type: 'nutrition', labelKey: 'Nutrition', icon: <HeartPulse className="w-4 h-4" /> },
  { type: 'healthcare', labelKey: 'Healthcare', icon: <ShieldPlus className="w-4 h-4" /> },
  { type: 'seasonal', labelKey: 'Seasonal', icon: <Package className="w-4 h-4" /> },
];

export default function ProgramsPage() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<ProgramType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const comparePrograms = compareIds
    .map((id) => PROGRAMS.find((p) => p.id === id))
    .filter(Boolean) as Program[];

  const getTranslation = (field: any) => {
    if (!field) return '';
    return field[language] || field.ur || field.en || '';
  };

  const getTranslationList = (field: any): string[] => {
    if (!field) return [];
    return field[language] || field.ur || field.en || [];
  };

  const filtered = PROGRAMS.filter(p => {
    if (filter !== 'all' && p.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = Object.values(p.name).some(val => typeof val === 'string' && val.toLowerCase().includes(q));
      const descMatch = Object.values(p.description).some(val => typeof val === 'string' && val.toLowerCase().includes(q));
      return nameMatch || descMatch || p.shortName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cream mb-2">{t('programs.title')}</h1>
          <p className="text-sage-400">{t('programs.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-600" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('programs.search_placeholder')}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass bg-transparent text-cream placeholder-sage-600 text-sm outline-none focus:border-gold-500/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.type}
                onClick={() => setFilter(f.type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  filter === f.type
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'glass text-sage-500 hover:text-cream'
                }`}
              >
                {f.icon} {f.labelKey}
              </button>
            ))}
          </div>
        </div>

        {/* Compare bar */}
        {compareIds.length > 0 && (
          <div className="mb-6 p-4 rounded-xl glass border border-gold-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-sage-300">
              <GitCompare className="w-4 h-4 text-gold-400" />
              {compareIds.length} {t('programs.compare_bar')}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCompare(true)}
                disabled={compareIds.length < 2}
                className="px-4 py-2 rounded-lg bg-gold-500/15 text-gold-400 text-sm font-medium disabled:opacity-40"
              >
                {t('programs.compare_btn')}
              </button>
              <button
                onClick={() => setCompareIds([])}
                className="px-3 py-2 rounded-lg glass text-sage-500 text-sm"
              >
                {t('programs.compare_clear')}
              </button>
            </div>
          </div>
        )}

        {showCompare && comparePrograms.length >= 2 && (
          <div className="mb-8 glass rounded-2xl overflow-hidden border border-gold-500/20">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
              <h2 className="font-bold text-cream flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-gold-400" /> {t('programs.compare_title')}
              </h2>
              <button onClick={() => setShowCompare(false)} className="text-sage-500 hover:text-cream">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left p-4 text-sage-400 font-medium">{t('programs.feature')}</th>
                    {comparePrograms.map((p) => (
                      <th key={p.id} className="text-left p-4 text-cream font-bold min-w-[180px]">
                        {getTranslation(p.name)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-subtle">
                    <td className="p-4 text-sage-400">{t('programs.benefit_col')}</td>
                    {comparePrograms.map((p) => (
                      <td key={p.id} className="p-4 text-gold-400">
                        {getTranslation(p.benefit)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="p-4 text-sage-400">{t('programs.type_col')}</td>
                    {comparePrograms.map((p) => (
                      <td key={p.id} className="p-4 text-sage-300 capitalize">
                        {p.type.replace('_', ' ')}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="p-4 text-sage-400">{t('programs.dep_col')}</td>
                    {comparePrograms.map((p) => (
                      <td key={p.id} className="p-4 text-sage-300">
                        {p.dependsOn?.map(uid => getTranslation(getProgramById(uid)?.name) || uid).join(', ') || 'None'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="p-4 text-sage-400">{t('programs.reg_col')}</td>
                    {comparePrograms.map((p) => (
                      <td key={p.id} className="p-4 text-sage-300">
                        {p.registrationChannels
                          .map((ch) => ch.smsCode || ch.type)
                          .slice(0, 2)
                          .join(', ')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-sage-400">{t('programs.doc_col')}</td>
                    {comparePrograms.map((p) => (
                      <td key={p.id} className="p-4 text-sage-300">
                        {getTranslationList(p.requiredDocuments)
                          .slice(0, 3)
                          .join('; ')}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Programs */}
        <div className="space-y-6">
          {filtered.map(program => {
            const isExpanded = expandedId === program.id;
            return (
              <div key={program.id} className="glass rounded-2xl overflow-hidden card-hover">
                <div className="p-6 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : program.id)}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${program.color}15`, color: program.color }}>
                      {PROGRAM_ICONS[program.id]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-cream">{getTranslation(program.name)}</h3>
                        <span className="text-xs px-3 py-1 rounded-full capitalize" style={{ backgroundColor: `${program.color}15`, color: program.color }}>
                          {program.type.replace('_', ' ')}
                        </span>
                        {program.dependsOn && (
                          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                            Requires: {program.dependsOn.map(uid => getTranslation(getProgramById(uid)?.name) || uid).join(', ')}
                          </span>
                        )}
                      </div>
                      <p className="text-gold-400 font-medium mt-1">{getTranslation(program.benefit)}</p>
                      <p className="text-sm text-sage-400 mt-2 line-clamp-2">{getTranslation(program.description)}</p>
                    </div>
                    <button className="text-sage-500 shrink-0 mt-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(program.id);
                      }}
                      className={`shrink-0 mt-2 p-2 rounded-lg text-xs ${
                        compareIds.includes(program.id)
                          ? 'bg-gold-500/20 text-gold-400'
                          : 'glass text-sage-500 hover:text-gold-400'
                      }`}
                      title="Add to compare"
                    >
                      <GitCompare className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-border-subtle pt-6 animate-fade-in-up">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Eligibility Criteria */}
                      <div>
                        <h4 className="text-sm font-bold text-cream mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-gold-400" /> Eligibility Criteria</h4>
                        <div className="space-y-2">
                          {program.eligibilityCriteria.map(c => (
                            <div key={c.id} className="flex items-start gap-2 text-sm">
                              <span className={`text-xs px-1.5 py-0.5 rounded mt-0.5 ${c.weight === 'required' ? 'bg-rose-500/10 text-rose-400' : c.weight === 'strong_indicator' ? 'bg-gold-500/10 text-gold-400' : 'bg-sage-500/10 text-sage-400'}`}>
                                {c.weight === 'required' ? 'Required' : c.weight === 'strong_indicator' ? 'Important' : 'Info'}
                              </span>
                              <span className="text-sage-300">{getTranslation(c.description)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Documents & Registration */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-bold text-cream mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-gold-400" /> Required Documents</h4>
                          <ul className="space-y-1.5">
                            {getTranslationList(program.requiredDocuments).map((d, i) => (
                              <li key={i} className="text-sm text-sage-300 flex items-start gap-2"><span className="text-emerald-400">•</span> {d}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-cream mb-3">How to Register</h4>
                          <div className="space-y-3">
                            {program.registrationChannels.map((ch, i) => (
                              <div key={i} className="glass rounded-lg p-3 flex items-start gap-3">
                                {ch.type === 'sms' && <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                                {ch.type === 'web_portal' && <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                                {ch.type === 'helpline' && <Phone className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />}
                                {ch.type === 'in_person' && <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                                <div className="text-xs text-sage-300">
                                  {getTranslation(ch.details)}
                                  {ch.smsCode && <div className="mt-1"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">SMS to {ch.smsCode}</span></div>}
                                  {ch.url && <a href={ch.url} target="_blank" rel="noopener noreferrer" className="mt-1 text-blue-400 hover:underline flex items-center gap-1">{ch.url.replace('https://','')} <ExternalLink className="w-3 h-3" /></a>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Important Notes */}
                    {program.importantNotes && (
                      <div className="mt-6 p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
                        <h4 className="text-sm font-bold text-gold-400 mb-2">Important Notes</h4>
                        <ul className="space-y-1">
                          {getTranslationList(program.importantNotes).map((n, i) => (
                            <li key={i} className="text-xs text-sage-300">{n}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Province Variations */}
                    {program.provinceVariations && (
                      <div className="mt-6">
                        <h4 className="text-sm font-bold text-cream mb-3">Province-Specific Coverage</h4>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {program.provinceVariations.map(pv => (
                            <div key={pv.province} className="glass rounded-lg p-3">
                              <div className="text-xs font-bold text-cream capitalize mb-1">{pv.province.replace('_', ' ')}</div>
                              <p className="text-[11px] text-sage-400">{getTranslation(pv.description)}</p>
                              {pv.hospitalType && (
                                <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full ${pv.hospitalType === 'private_only' ? 'bg-gold-500/10 text-gold-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                  {pv.hospitalType === 'private_only' ? 'Private Only' : pv.hospitalType === 'public_only' ? 'Public Only' : 'Public + Private'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
