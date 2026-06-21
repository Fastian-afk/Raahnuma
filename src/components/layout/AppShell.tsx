'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, LANGUAGE_CONFIG } from '@/lib/i18n/context';
import type { Language } from '@/lib/rules-engine/types';
import { useTheme } from '@/lib/theme/context';
import {
  Home, MessageCircle, BookOpen, CheckSquare, Map,
  Library, Heart, Menu, X, Globe, ChevronDown,
  Compass, Palette, PanelLeftClose, PanelLeftOpen, Sun, Moon
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
  const [themeDropdown, setThemeDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { theme, setTheme } = useTheme();

  const THEMES = [
    { code: 'emerald-dark' as const, nameKey: 'theme.emerald_dark', icon: Moon },
    { code: 'emerald-light' as const, nameKey: 'theme.emerald_light', icon: Sun },
    { code: 'royal-dark' as const, nameKey: 'theme.royal_dark', icon: Palette },
    { code: 'slate-dark' as const, nameKey: 'theme.slate_dark', icon: Palette },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-surface-secondary border-border-subtle shrink-0 ${
          isRTL ? 'border-l' : 'border-r'
        } transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-0 overflow-hidden opacity-0 border-none' : 'w-64 opacity-100'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg glow-gold group-hover:scale-105 transition-transform shrink-0">
              <Compass className="w-5 h-5 text-emerald-950" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-cream tracking-wide truncate">{t('app.name')}</h1>
              <p className="text-xs text-sage-500 truncate">{t('app.tagline')}</p>
            </div>
          </Link>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg text-sage-400 hover:text-cream hover:bg-emerald-800/40 transition-colors cursor-pointer shrink-0"
            title={t('sidebar.collapse')}
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
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
                <Icon className={`w-5 h-5 ${isActive ? 'text-gold-400' : ''} shrink-0`} />
                <span className="truncate">{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Language & Theme Selectors */}
        <div className="p-4 border-t border-border-subtle space-y-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdown(!langDropdown);
                setThemeDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass text-sm text-sage-400 hover:text-cream transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gold-400" />
                {LANGUAGES.find(l => l.code === language)?.native}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${langDropdown ? 'rotate-180' : ''}`} />
            </button>
            {langDropdown && (
              <div className="absolute bottom-full mb-2 left-0 right-0 glass rounded-xl overflow-hidden shadow-xl z-50 border border-border-subtle">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdown(false);
                    }}
                    className={`w-full ${
                      isRTL ? 'text-right' : 'text-left'
                    } px-4 py-2.5 text-sm transition-colors cursor-pointer ${
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

          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setThemeDropdown(!themeDropdown);
                setLangDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass text-sm text-sage-400 hover:text-cream transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gold-400" />
                {t(`theme.${theme.replace('-', '_')}`)}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${themeDropdown ? 'rotate-180' : ''}`} />
            </button>
            {themeDropdown && (
              <div className="absolute bottom-full mb-2 left-0 right-0 glass rounded-xl overflow-hidden shadow-xl z-50 border border-border-subtle">
                {THEMES.map(tOption => {
                  const ThemeIcon = tOption.icon;
                  return (
                    <button
                      key={tOption.code}
                      onClick={() => {
                        setTheme(tOption.code);
                        setThemeDropdown(false);
                      }}
                      className={`w-full ${
                        isRTL ? 'text-right' : 'text-left'
                      } px-4 py-2.5 text-sm transition-colors flex items-center gap-2 cursor-pointer ${
                        theme === tOption.code
                          ? 'bg-emerald-700/40 text-gold-400'
                          : 'text-sage-400 hover:bg-emerald-800/40 hover:text-cream'
                      }`}
                    >
                      <ThemeIcon className="w-4 h-4 text-gold-400 shrink-0" />
                      <span>{t(tOption.nameKey)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-[10px] text-sage-600 text-center leading-normal">{t('footer.disclaimer')}</p>
        </div>
      </aside>

      {/* Desktop Reopen Trigger */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className={`hidden lg:flex fixed top-4 ${
            isRTL ? 'right-4' : 'left-4'
          } z-50 p-3 rounded-xl bg-surface-secondary border border-border-subtle hover:bg-emerald-800/40 text-cream transition-all hover:scale-105 shadow-xl glow-gold cursor-pointer`}
          title={t('sidebar.expand')}
        >
          <PanelLeftOpen className="w-5 h-5 text-gold-400 animate-pulse" />
        </button>
      )}

      {/* Mobile Header + Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface-secondary border-b border-border-subtle z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-emerald-800/40 cursor-pointer">
            <Menu className="w-5 h-5 text-cream" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
              <Compass className="w-4 h-4 text-emerald-950" />
            </div>
            <span className="font-bold text-cream">{t('app.name')}</span>
          </Link>
          <div className="relative">
            <button onClick={() => { setLangDropdown(!langDropdown); setThemeDropdown(false); }} className="p-2 rounded-lg hover:bg-emerald-800/40 cursor-pointer">
              <Globe className="w-5 h-5 text-sage-400" />
            </button>
            {langDropdown && (
              <div className={`absolute top-full mt-2 glass rounded-xl overflow-hidden shadow-xl z-50 border border-border-subtle min-w-36 ${isRTL ? 'left-0' : 'right-0'}`}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setLangDropdown(false); }}
                    className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-2.5 text-sm transition-colors cursor-pointer ${
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
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-emerald-800/40 cursor-pointer">
                  <X className="w-5 h-5 text-sage-400" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive ? 'bg-emerald-800/50 text-gold-400 border border-gold-500/20 glow-gold' : 'text-sage-500 hover:text-cream hover:bg-emerald-800/30'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="truncate">{t(item.key)}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Sidebar Selectors */}
              <div className="p-4 border-t border-border-subtle space-y-3">
                {/* Mobile Language */}
                <div className="relative">
                  <button
                    onClick={() => { setLangDropdown(!langDropdown); setThemeDropdown(false); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl glass text-xs text-sage-400 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gold-400 animate-spin-slow" />
                      {LANGUAGES.find(l => l.code === language)?.native}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {langDropdown && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 glass rounded-xl overflow-hidden z-50 border border-border-subtle">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => { setLanguage(lang.code); setLangDropdown(false); setSidebarOpen(false); }}
                          className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-2 text-xs transition-colors cursor-pointer ${
                            language === lang.code ? 'bg-emerald-700/40 text-gold-400' : 'text-sage-400 hover:bg-emerald-800/40'
                          }`}
                        >
                          {lang.native}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Theme */}
                <div className="relative">
                  <button
                    onClick={() => { setThemeDropdown(!themeDropdown); setLangDropdown(false); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl glass text-xs text-sage-400 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-gold-400" />
                      {t(`theme.${theme.replace('-', '_')}`)}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {themeDropdown && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 glass rounded-xl overflow-hidden z-50 border border-border-subtle">
                      {THEMES.map(tOption => {
                        const ThemeIcon = tOption.icon;
                        return (
                          <button
                            key={tOption.code}
                            onClick={() => { setTheme(tOption.code); setThemeDropdown(false); setSidebarOpen(false); }}
                            className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-2 text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                              theme === tOption.code ? 'bg-emerald-700/40 text-gold-400' : 'text-sage-400 hover:bg-emerald-800/40'
                            }`}
                          >
                            <ThemeIcon className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                            <span>{t(tOption.nameKey)}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
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
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[10px] truncate max-w-[64px]">{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
