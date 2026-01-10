'use client';

import { AuthContextProvider } from '@/contexts/AuthContext';
import { CartContextProvider } from '@/contexts/CartContext';
import { I18nProvider } from '@/i18n/I18nProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthContextProvider>
        <CartContextProvider>{children}</CartContextProvider>
      </AuthContextProvider>
    </I18nProvider>
  );
}
