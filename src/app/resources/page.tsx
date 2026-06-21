'use client';
import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useLanguage } from '@/lib/i18n/context';
import { ChevronDown, ChevronUp, BookOpen, Phone, MessageSquare, FileText, HelpCircle, ExternalLink } from 'lucide-react';

const FAQ_ITEMS = [
  { q: 'What is BISP / Benazir Income Support Programme?', a: 'BISP is Pakistan\'s largest social safety net program, providing cash transfers (Kafaalat), education stipends (Taleemi Wazaif), and nutrition support (Nashonuma) to the poorest households. Eligibility is determined through the National Socio-Economic Registry (NSER) and Proxy Means Test (PMT) scoring.' },
  { q: 'How do I check if I\'m registered for BISP/Kafaalat?', a: 'Send your CNIC number via SMS to 8171. You will receive a reply confirming your registration status and payment details. You can also check online at 8171.bisp.gov.pk or call the helpline at 0800-26477.' },
  { q: 'What is a PMT score and how is it calculated?', a: 'The Proxy Means Test (PMT) score estimates household wealth using the NSER Dynamic Survey. It considers factors like household size, income sources, assets (land, livestock, vehicles), housing conditions, education levels, and geographic location. Households scoring below 32 qualify for Kafaalat. The exact formula is not public.' },
  { q: 'Is my CNIC really my Sehat Card?', a: 'Yes! Your Computerized National Identity Card (CNIC) IS your health card under the Sehat Sahulat programme. No separate card is needed. However, coverage varies by province and only in-patient treatment is covered (not OPD visits or routine checkups).' },
  { q: 'Why does Sehat Card coverage differ by province?', a: 'Pakistan\'s health system is devolved to provinces after the 18th Amendment. Each province runs its own version: Punjab (private hospitals only), KP (Sehat Card Plus with broader coverage), Sindh (Awami Sehat Card), and Balochistan (its own scheme). Federal territories are covered under the PM Health Card program.' },
  { q: 'Can I register for Nashonuma online?', a: '⚠️ No. Nashonuma registration is IN-PERSON ONLY. You must visit a Nashonuma Facilitation Centre, typically located inside a District Headquarters Hospital (DHQ) or Tehsil Headquarters Hospital (THQ). Online registration is NOT available for this program.' },
  { q: 'What documents do I need to apply?', a: 'For most programs: your CNIC (original), B-Form for children, and a mobile phone registered to your CNIC. For Taleemi Wazaif: school enrollment certificate and attendance records. For Nashonuma: pregnancy confirmation from a health facility.' },
  { q: 'Does Raahnuma determine my eligibility?', a: 'No. Raahnuma provides guidance only — it helps you understand which programs you MAY be eligible for based on the information you provide. Final eligibility determination is done by BISP through the NSER Dynamic Survey and PMT scoring system. Always verify through official channels.' },
];

const GUIDES = [
  { title: 'How to Check Kafaalat Status via SMS', steps: ['Open your messaging app', 'Type your 13-digit CNIC number (without dashes)', 'Send to 8171', 'Wait for the reply message with your status', 'If eligible, it will show your payment amount and collection date'], smsTemplate: 'Send: [Your 13-digit CNIC] to 8171' },
  { title: 'How to Check Sehat Card Coverage', steps: ['Open your messaging app', 'Type your 13-digit CNIC number', 'Send to 8500', 'Reply will show your coverage status and empaneled hospitals', 'You can also call 0800-00-786 for more details'], smsTemplate: 'Send: [Your 13-digit CNIC] to 8500' },
  { title: 'How to Register for Nashonuma', steps: ['Confirm you are a Kafaalat beneficiary (SMS 8171)', 'Find your nearest DHQ or THQ hospital', 'Visit the Nashonuma Facilitation Centre inside the hospital', 'Bring your CNIC and pregnancy confirmation', 'Registration is done in person by the centre staff', '⚠️ This CANNOT be done online'] },
];

const GLOSSARY = [
  { term: 'BISP', full: 'Benazir Income Support Programme', desc: 'Pakistan\'s main social safety net' },
  { term: 'CNIC', full: 'Computerized National Identity Card', desc: 'National ID card issued by NADRA' },
  { term: 'NSER', full: 'National Socio-Economic Registry', desc: 'Database used for poverty targeting' },
  { term: 'PMT', full: 'Proxy Means Test', desc: 'Scoring system to estimate household wealth' },
  { term: 'DHQ', full: 'District Headquarters Hospital', desc: 'Main hospital at district level' },
  { term: 'THQ', full: 'Tehsil Headquarters Hospital', desc: 'Main hospital at tehsil level' },
  { term: 'NADRA', full: 'National Database & Registration Authority', desc: 'Issues CNICs' },
  { term: 'OPD', full: 'Outpatient Department', desc: 'Routine doctor visits (NOT covered by Sehat Card)' },
];

const CONTACTS = [
  { name: 'BISP Helpline', number: '0800-26477', type: 'Toll-free' },
  { name: 'BISP SMS Check', number: '8171', type: 'SMS' },
  { name: 'Sehat Card Helpline', number: '0800-00-786', type: 'Toll-free' },
  { name: 'Sehat Card SMS', number: '8500', type: 'SMS' },
  { name: 'NADRA Helpline', number: '1777', type: 'Paid' },
  { name: 'Pakistan Citizen Portal', number: '1166', type: 'Toll-free' },
];

export default function ResourcesPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'guides' | 'glossary' | 'contacts'>('faq');

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cream mb-2">{t('resources.title')}</h1>
          <p className="text-sage-400">Everything you need to know about Pakistan&apos;s social protection programs</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { key: 'faq' as const, label: t('resources.faq'), icon: <HelpCircle className="w-4 h-4" /> },
            { key: 'guides' as const, label: t('resources.guides'), icon: <BookOpen className="w-4 h-4" /> },
            { key: 'glossary' as const, label: t('resources.glossary'), icon: <FileText className="w-4 h-4" /> },
            { key: 'contacts' as const, label: t('resources.contacts'), icon: <Phone className="w-4 h-4" /> },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30' : 'glass text-sage-500 hover:text-cream'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-medium text-cream text-sm pr-4">{item.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-sage-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-sage-500 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 animate-fade-in-up">
                    <p className="text-sm text-sage-300 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Guides */}
        {activeTab === 'guides' && (
          <div className="space-y-6">
            {GUIDES.map((guide, i) => (
              <div key={i} className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-cream mb-4">{guide.title}</h3>
                <ol className="space-y-3">
                  {guide.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-gold-500/15 text-gold-400 flex items-center justify-center shrink-0 text-xs font-bold">{j + 1}</span>
                      <span className="text-sage-300">{step}</span>
                    </li>
                  ))}
                </ol>
                {guide.smsTemplate && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1"><MessageSquare className="w-3 h-3" /> SMS Template</div>
                    <code className="text-sm text-cream font-mono">{guide.smsTemplate}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Glossary */}
        {activeTab === 'glossary' && (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border-subtle">
                <th className="px-5 py-3 text-left text-xs font-bold text-sage-400 uppercase">Term</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-sage-400 uppercase">Full Form</th>
                <th className="px-5 py-3 text-left text-xs font-bold text-sage-400 uppercase hidden sm:table-cell">Description</th>
              </tr></thead>
              <tbody>
                {GLOSSARY.map((item, i) => (
                  <tr key={i} className="border-b border-border-subtle last:border-0">
                    <td className="px-5 py-3 text-sm font-bold text-gold-400">{item.term}</td>
                    <td className="px-5 py-3 text-sm text-cream">{item.full}</td>
                    <td className="px-5 py-3 text-sm text-sage-400 hidden sm:table-cell">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Contacts */}
        {activeTab === 'contacts' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {CONTACTS.map((c, i) => (
              <div key={i} className="glass rounded-xl p-5 card-hover">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass-gold flex items-center justify-center text-gold-400">
                    {c.type === 'SMS' ? <MessageSquare className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-cream text-sm">{c.name}</h4>
                    <p className="text-lg font-mono text-gold-400">{c.number}</p>
                    <span className="text-[10px] text-sage-500">{c.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
