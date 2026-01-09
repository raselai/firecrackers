'use client';

import { AuthContextProvider } from '@/contexts/AuthContext';
import { CartContextProvider } from '@/contexts/CartContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      <CartContextProvider>{children}</CartContextProvider>
    </AuthContextProvider>
  );
}
