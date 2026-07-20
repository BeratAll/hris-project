'use client';

import { useState, useMemo } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import theme from './theme';

/**
 * ThemeRegistry — MUI + Emotion SSR Entegrasyonu
 *
 * Next.js App Router, server-side rendering sırasında Emotion stil
 * etiketlerini HTML'e enjekte etmelidir (flash-of-unstyled-content önleme).
 *
 * Bu bileşen:
 * 1. Emotion cache oluşturur
 * 2. SSR sırasında stilleri HTML <head>'e enjekte eder
 * 3. MUI ThemeProvider + CssBaseline sarmalayıcı sağlar
 */
export default function ThemeRegistry({ children }) {
  const [cache] = useState(() => {
    const emotionCache = createCache({ key: 'mui', prepend: true });
    emotionCache.compat = true;
    return emotionCache;
  });

  useServerInsertedHTML(() => {
    const entries = Object.entries(cache.inserted);

    if (entries.length === 0) {
      return null;
    }

    const names = [];
    let styles = '';

    for (const [name, style] of entries) {
      if (typeof style === 'string') {
        names.push(name);
        styles += style;
      }
    }

    // Enjekte edilen stilleri cache'den temizle (tekrarı önle)
    names.forEach((name) => {
      delete cache.inserted[name];
    });

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
