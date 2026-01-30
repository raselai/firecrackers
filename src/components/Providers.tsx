'use client';

import { usePathname } from 'next/navigation';
import { AuthContextProvider } from '@/contexts/AuthContext';
import { CartContextProvider } from '@/contexts/CartContext';
import { I18nProvider } from '@/i18n/I18nProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immediateAuthPrefixes = ['/login', '/signup', '/cart', '/checkout', '/account', '/admin', '/products'];
  const shouldDeferAuth = !immediateAuthPrefixes.some((prefix) => pathname.startsWith(prefix));

  return (
    <I18nProvider>
      <AuthContextProvider deferInit={shouldDeferAuth}>
        <CartContextProvider>{children}</CartContextProvider>
      </AuthContextProvider>
    </I18nProvider>
  );
}
