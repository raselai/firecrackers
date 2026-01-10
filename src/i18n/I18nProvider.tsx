'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultLocale, supportedLocales, translations, type Locale } from './translations';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const getMessage = (locale: Locale, key: string): string | undefined => {
  const parts = key.split('.');
  let current: unknown = translations[locale];

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : undefined;
};

const isSupportedLocale = (value: string | null): value is Locale =>
  Boolean(value && supportedLocales.includes(value as Locale));

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('locale') : null;
    if (isSupportedLocale(stored)) {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.cookie = `locale=${locale}; path=/; max-age=31536000`;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('locale', locale);
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string) => getMessage(locale, key) ?? getMessage(defaultLocale, key) ?? key;
    const setLocale = (nextLocale: Locale) => setLocaleState(nextLocale);
    const toggleLocale = () =>
      setLocaleState((prev) => (prev === 'en' ? 'zh-CN' : 'en'));

    return { locale, setLocale, toggleLocale, t };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
