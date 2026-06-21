'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { PROGRAMS } from '@/lib/rules-engine/programs';
import AppShell from '@/components/layout/AppShell';
import {
  Compass, ArrowRight, MessageCircle, Brain, ClipboardCheck,
  Banknote, GraduationCap, HeartPulse, ShieldPlus, Package,
  Globe, Mic, FileSearch, Users, Sparkles, ChevronRight,
  MapPin, Phone, CheckCircle2
} from 'lucide-react';

function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const step = end / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <div ref={ref} className="text-3xl md:text-4xl font-bold text-gradient-gold">{prefix}{count.toLocaleString()}{suffix}</div>;
}

const PROGRAM_ICONS: Record<string, React.ReactNode> = {
  kafaalat: <Banknote className="w-6 h-6" />,
  taleemi_wazaif: <GraduationCap className="w-6 h-6" />,
  nashonuma: <HeartPulse className="w-6 h-6" />,
  sehat_sahulat: <ShieldPlus className="w-6 h-6" />,
  ramzan_relief: <Package className="w-6 h-6" />,
};

const FEATURES = [
  { icon: <Globe className="w-6 h-6" />, title: '6 Languages', desc: 'English, Urdu, Sindhi, Pashto, Punjabi, Balochi' },
  { icon: <Mic className="w-6 h-6" />, title: 'Voice Input', desc: 'Speak in your language — AI understands' },
  { icon: <FileSearch className="w-6 h-6" />, title: 'Document Scan', desc: 'Upload CNIC/B-Form for auto-extraction' },
  { icon: <MapPin className="w-6 h-6" />, title: 'Province-Aware', desc: 'Different provinces, different coverage' },
  { icon: <Users className="w-6 h-6" />, title: 'Cross-Program', desc: 'One program can unlock others' },
  { icon: <ShieldPlus className="w-6 h-6" />, title: 'Responsible AI', desc: '"May qualify" — never "you qualify"' },
];

export default function HomePage() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  return (
    <AppShell>
      <div className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          <div className="pattern-overlay" />
          <div className="absolute inset-0 bg-radial-glow" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-gold-400/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `particle-float ${4 + Math.random() * 6}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold text-gold-400 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                USAII Global AI Hackathon 2026
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-cream">{t('hero.title').split(' ').slice(0, -3).join(' ')} </span>
                <span className="text-gradient-gold">{t('hero.title').split(' ').slice(-3).join(' ')}</span>
              </h1>
              
              <p className="text-lg text-sage-400 leading-relaxed max-w-xl">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/navigator"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 text-emerald-950 font-bold text-lg hover:from-gold-500 hover:to-gold-400 transition-all duration-300 shadow-lg hover:shadow-gold-500/25 hover:scale-105 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('hero.cta.chat')}
                </Link>
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass text-cream font-semibold hover:bg-emerald-800/50 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  {t('hero.cta.explore')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Quick stats inline */}
              <div className="flex gap-8 pt-4">
                <div><div className="text-2xl font-bold text-gold-400">5+</div><div className="text-xs text-sage-500">{t('stats.programs')}</div></div>
                <div><div className="text-2xl font-bold text-gold-400">6</div><div className="text-xs text-sage-500">{t('stats.languages')}</div></div>
                <div><div className="text-2xl font-bold text-gold-400">7</div><div className="text-xs text-sage-500">{t('stats.provinces')}</div></div>
              </div>
            </div>

            {/* Right — Compass Visual */}
            <div className={`relative flex items-center justify-center ${isVisible ? 'animate-scale-in delay-300' : 'opacity-0'}`}>
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                {/* Glow background */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-500/10 to-emerald-500/10 blur-3xl" />
                
                {/* Rotating ring */}
                <div className="absolute inset-4 rounded-full border border-gold-500/20 animate-spin-slow" />
                <div className="absolute inset-8 rounded-full border border-emerald-500/15 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
                
                {/* Center compass */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-2xl glow-gold animate-float">
                    <Compass className="w-12 h-12 text-emerald-950" />
                  </div>
                </div>

                {/* Orbiting program icons */}
                {[
                  { icon: <Banknote className="w-5 h-5" />, label: 'Cash', angle: 0, color: 'text-gold-400' },
                  { icon: <GraduationCap className="w-5 h-5" />, label: 'Education', angle: 72, color: 'text-emerald-400' },
                  { icon: <HeartPulse className="w-5 h-5" />, label: 'Nutrition', angle: 144, color: 'text-rose-400' },
                  { icon: <ShieldPlus className="w-5 h-5" />, label: 'Health', angle: 216, color: 'text-blue-400' },
                  { icon: <Package className="w-5 h-5" />, label: 'Relief', angle: 288, color: 'text-purple-400' },
                ].map((item, i) => {
                  const radius = 140;
                  const rad = (item.angle - 90) * (Math.PI / 180);
                  const x = Math.cos(rad) * radius;
                  const y = Math.sin(rad) * radius;
                  return (
                    <div
                      key={i}
                      className="absolute flex flex-col items-center gap-1"
                      style={{
                        left: `calc(50% + ${x}px - 24px)`,
                        top: `calc(50% + ${y}px - 24px)`,
                        animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    >
                      <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="text-[10px] text-sage-500 font-medium">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="relative border-y border-border-subtle bg-surface-secondary/50">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <AnimatedCounter end={5} suffix="+" />
              <p className="text-sm text-sage-500 mt-1">{t('stats.programs')}</p>
            </div>
            <div className="text-center">
              <AnimatedCounter end={6} />
              <p className="text-sm text-sage-500 mt-1">{t('stats.languages')}</p>
            </div>
            <div className="text-center">
              <AnimatedCounter end={7} />
              <p className="text-sm text-sage-500 mt-1">{t('stats.provinces')}</p>
            </div>
            <div className="text-center">
              <AnimatedCounter end={14500} prefix="Rs. " />
              <p className="text-sm text-sage-500 mt-1">{t('stats.benefit')}</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 relative">
          <div className="pattern-overlay" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">{t('how.title')}</h2>
              <p className="text-sage-400 max-w-2xl mx-auto">Three simple steps to discover what you may be eligible for</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: <MessageCircle className="w-8 h-8" />, title: t('how.step1.title'), desc: t('how.step1.desc'), color: 'from-gold-500/20 to-gold-700/20' },
                { step: '02', icon: <Brain className="w-8 h-8" />, title: t('how.step2.title'), desc: t('how.step2.desc'), color: 'from-emerald-500/20 to-emerald-700/20' },
                { step: '03', icon: <ClipboardCheck className="w-8 h-8" />, title: t('how.step3.title'), desc: t('how.step3.desc'), color: 'from-blue-500/20 to-blue-700/20' },
              ].map((item, i) => (
                <div key={i} className="relative group">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-sage-600 z-10">
                      <ChevronRight className="w-8 h-8" />
                    </div>
                  )}
                  <div className="glass rounded-2xl p-8 card-hover h-full">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 text-gold-400 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div className="text-xs text-gold-500 font-mono mb-2">STEP {item.step}</div>
                    <h3 className="text-xl font-bold text-cream mb-3">{item.title}</h3>
                    <p className="text-sage-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Preview */}
        <section className="py-24 bg-surface-secondary/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">{t('programs.title')}</h2>
              <p className="text-sage-400">Pakistan&apos;s major social protection programs — all in one place</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROGRAMS.map((program, i) => (
                <Link href="/programs" key={program.id}>
                  <div
                    className="glass rounded-2xl p-6 card-hover h-full cursor-pointer"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${program.color}15`, color: program.color }}>
                        {PROGRAM_ICONS[program.id]}
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full glass text-sage-400 capitalize">
                        {program.type.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-cream mb-2">{program.name.en}</h3>
                    <p className="text-sm text-gold-400 font-medium mb-3">{program.benefit.en}</p>
                    <p className="text-xs text-sage-500 line-clamp-2">{program.description.en}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                      <span>Learn more</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 relative">
          <div className="pattern-overlay" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">Built for Real People</h2>
              <p className="text-sage-400">Features designed for Pakistan&apos;s most vulnerable communities</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, i) => (
                <div key={i} className="glass rounded-2xl p-6 card-hover">
                  <div className="w-12 h-12 rounded-xl glass-gold flex items-center justify-center text-gold-400 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-cream mb-2">{feature.title}</h3>
                  <p className="text-sm text-sage-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Before/After Impact */}
        <section className="py-24 bg-surface-secondary/30">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">The Impact</h2>
              <p className="text-sage-400">How Raahnuma changes the journey from confusion to clarity</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="rounded-2xl p-8 border border-rose-500/20 bg-rose-500/5">
                <div className="text-sm font-bold text-rose-400 mb-4 flex items-center gap-2">
                  <X className="w-4 h-4" /> BEFORE RAAHNUMA
                </div>
                <div className="space-y-3 text-sm text-sage-400">
                  <p>❌ Amina doesn&apos;t know her family&apos;s PMT score</p>
                  <p>❌ Never heard of the Nashonuma programme</p>
                  <p>❌ Doesn&apos;t know her CNIC works as a health card</p>
                  <p>❌ Misses Rs. 14,500/quarter in cash transfers</p>
                  <p>❌ Her son misses education stipend of Rs. 3,500</p>
                  <p className="text-rose-300 font-medium pt-2">She doesn&apos;t know what exists or how to apply.</p>
                </div>
              </div>
              {/* After */}
              <div className="rounded-2xl p-8 border border-emerald-500/20 bg-emerald-500/5">
                <div className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> AFTER RAAHNUMA
                </div>
                <div className="space-y-3 text-sm text-sage-400">
                  <p>✅ Describes her situation in one paragraph</p>
                  <p>✅ Raahnuma identifies 4 potential programs</p>
                  <p>✅ Told to SMS 8171 to check Kafaalat status</p>
                  <p>✅ Learns Nashonuma requires DHQ hospital visit</p>
                  <p>✅ Discovers her CNIC IS her Sehat Card</p>
                  <p className="text-emerald-300 font-medium pt-2">From &quot;I don&apos;t know&quot; to &quot;I know what to do&quot; in 3 minutes.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-glow" />
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center mx-auto mb-8 glow-gold animate-float">
              <Compass className="w-10 h-10 text-emerald-950" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">
              Ready to find out what you may qualify for?
            </h2>
            <p className="text-sage-400 mb-8 max-w-xl mx-auto">
              Describe your situation in your own words — in English, Urdu, or any provincial language. Raahnuma will guide you.
            </p>
            <Link
              href="/navigator"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 text-emerald-950 font-bold text-xl hover:from-gold-500 hover:to-gold-400 transition-all duration-300 shadow-xl hover:shadow-gold-500/30 hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-6 h-6" />
              {t('hero.cta.chat')}
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function X({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>;
}
