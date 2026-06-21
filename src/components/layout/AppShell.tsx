'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, LANGUAGE_CONFIG } from '@/lib/i18n/context';
import type { Language } from '@/lib/rules-engine/types';
import {
  Home, MessageCircle, BookOpen, CheckSquare, Map,
  Library, Heart, Menu, X, Globe, ChevronDown,
  Compass, Volume2, VolumeX
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'nav.home', href: '/', icon: Home },
  { key: 'nav.navigator', href: '/navigator', icon: MessageCircle },
  { key: 'nav.programs', href: '/programs', icon: BookOpen },
  { key: 'nav.checker', href: '/checker', icon: CheckSquare },
  { key: 'nav.map', href: '/map', icon: Map },
  { key: 'nav.resources', href: '/resources', icon: Library },
  { key: 'nav.stories', href: '/stories', icon: Heart },
];

const LANGUAGES: { code: Language; native: string }[] = [
  { code: 'en', native: 'English' },
  { code: 'ur', native: 'اردو' },
  { code: 'sd', native: 'سنڌي' },
  { code: 'ps', native: 'پښتو' },
  { code: 'pn', native: 'پنجابی' },
  { code: 'bl', native: 'بلوچی' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const pathname = usePathname();
  const { t, language, setLanguage, isRTL } = useLanguage();

  return (
    <div className={`flex h-screen overflow-hidden ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 bg-surface-secondary border-border-subtle shrink-0 ${isRTL ? 'border-l' : 'border-r'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-border-subtle">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg glow-gold group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-cream tracking-wide">{t('app.name')}</h1>
              <p className="text-xs text-sage-500">{t('app.tagline')}</p>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-800/50 text-gold-400 border border-gold-500/20 glow-gold'
                    : 'text-sage-500 hover:text-cream hover:bg-emerald-800/30'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-gold-400' : ''}`} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* Language Selector */}
        <div className="p-4 border-t border-border-subtle">
          <div className="relative">
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass text-sm text-sage-400 hover:text-cream transition-colors"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {LANGUAGES.find(l => l.code === language)?.native}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${langDropdown ? 'rotate-180' : ''}`} />
            </button>
            {langDropdown && (
              <div className="absolute bottom-full mb-2 left-0 right-0 glass rounded-xl overflow-hidden shadow-xl z-50 border border-border-subtle">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setLangDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      language === lang.code
                        ? 'bg-emerald-700/40 text-gold-400'
                        : 'text-sage-400 hover:bg-emerald-800/40 hover:text-cream'
                    }`}
                  >
                    {lang.native}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-sage-600 text-center">{t('footer.disclaimer')}</p>
        </div>
      </aside>

      {/* Mobile Header + Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface-secondary border-b border-border-subtle z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-emerald-800/40">
            <Menu className="w-5 h-5 text-cream" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
              <Compass className="w-4 h-4 text-emerald-950" />
            </div>
            <span className="font-bold text-cream">{t('app.name')}</span>
          </Link>
          <div className="relative">
            <button onClick={() => setLangDropdown(!langDropdown)} className="p-2 rounded-lg hover:bg-emerald-800/40">
              <Globe className="w-5 h-5 text-sage-400" />
            </button>
            {langDropdown && (
              <div className={`absolute top-full mt-2 glass rounded-xl overflow-hidden shadow-xl z-50 border border-border-subtle min-w-36 ${isRTL ? 'left-0' : 'right-0'}`}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setLangDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      language === lang.code ? 'bg-emerald-700/40 text-gold-400' : 'text-sage-400 hover:bg-emerald-800/40'
                    }`}
                  >
                    {lang.native}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className={`absolute top-0 bottom-0 w-72 bg-surface-secondary shadow-2xl flex flex-col animate-slide-in-right ${isRTL ? 'right-0' : 'left-0'}`}>
              <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                <span className="font-bold text-cream text-lg">{t('app.name')}</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-emerald-800/40">
                  <X className="w-5 h-5 text-sage-400" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive ? 'bg-emerald-800/50 text-gold-400' : 'text-sage-500 hover:text-cream hover:bg-emerald-800/30'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {t(item.key)}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden flex items-center justify-around border-t border-border-subtle bg-surface-secondary py-2 px-1">
          {NAV_ITEMS.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'text-gold-400' : 'text-sage-600 hover:text-sage-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
