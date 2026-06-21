'use client';

import React from 'react';
import { Province } from '@/lib/rules-engine/types';
import { getOfficesByProvince } from '@/lib/data/nearby-offices';
import { useLanguage } from '@/lib/i18n/context';
import { MapPin, Phone, Building2, Hospital, CreditCard } from 'lucide-react';

const TYPE_ICONS = {
  bisp: Building2,
  nadra: CreditCard,
  dhq_hospital: Hospital,
  bisp_tehsil: Building2,
};

interface NearbyOfficesProps {
  province: Province;
}

export default function NearbyOffices({ province }: NearbyOfficesProps) {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const offices = getOfficesByProvince(province);

  if (offices.length === 0) return null;

  return (
    <div className="glass rounded-xl p-4 border border-border-subtle no-print">
      <h4 className="text-sm font-bold text-cream mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-rose-400" />
        {t('nearby.title')}
      </h4>
      <div className="space-y-3">
        {offices.map((office) => {
          const Icon = TYPE_ICONS[office.type] || Building2;
          return (
            <div
              key={office.id}
              className="p-3 rounded-lg bg-surface-secondary/50 border border-border-subtle"
            >
              <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-cream">
                    {language === 'en' ? office.name.en : (office.name.ur || office.name.en)}
                  </p>
                  <p className="text-xs text-sage-400 mt-0.5">
                    {language === 'en' ? office.address.en : (office.address.ur || office.address.en)}
                  </p>
                  {office.phone && (
                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {office.phone}
                    </p>
                  )}
                  {office.hours && (
                    <p className="text-[10px] text-sage-500 mt-0.5">
                      {language === 'en' ? office.hours.en : (office.hours.ur || office.hours.en)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
