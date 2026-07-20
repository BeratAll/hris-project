import { Roboto } from 'next/font/google';
import ThemeRegistry from '@/theme/ThemeRegistry';
import StoreProvider from '@/store/StoreProvider';

/**
 * Root Layout — Uygulama Kök Düzeni
 *
 * Tüm sayfaları saran en üst düzey layout:
 * 1. Google Fonts (Roboto) entegrasyonu
 * 2. StoreProvider (Redux)
 * 3. ThemeRegistry (MUI + Emotion SSR)
 */

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata = {
  title: 'HRIS — İnsan Kaynakları Yönetim Sistemi',
  description: 'İnşaat firması personel yönetimi, izin takibi, bordro ve organizasyon yönetim sistemi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={roboto.variable} style={{ margin: 0 }}>
        <StoreProvider>
          <ThemeRegistry>
            {children}
          </ThemeRegistry>
        </StoreProvider>
      </body>
    </html>
  );
}
