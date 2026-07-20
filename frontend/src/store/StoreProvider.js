'use client';

import { Provider } from 'react-redux';
import store from './store';

/**
 * StoreProvider — Client-Side Redux Provider
 *
 * Next.js App Router'da Redux Provider client component olmalıdır.
 * Bu bileşen root layout'ta ThemeRegistry ile birlikte kullanılır.
 */
export default function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
