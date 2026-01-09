'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/contexts/AuthContext';
import { CartItem } from '@/types/cart';
import { updateUserProfile } from '@/lib/userService';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  subtotal: number;
  addItem: (item: CartItem, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateSubtotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

export function CartContextProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser } = useUser();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setItems([]);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', firebaseUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        const data = snapshot.data();
        const nextItems = (data?.cart || []) as CartItem[];
        setItems(nextItems);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading cart:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  const saveCart = async (nextItems: CartItem[]) => {
    if (!firebaseUser) {
      throw new Error('Login required to update cart.');
    }

    setItems(nextItems);
    await updateUserProfile(firebaseUser.uid, { cart: nextItems });
  };

  const addItem = async (item: CartItem, quantity: number = 1) => {
    const existing = items.find((cartItem) => cartItem.productId === item.productId);
    if (existing) {
      const nextItems = items.map((cartItem) =>
        cartItem.productId === item.productId
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      );
      await saveCart(nextItems);
      return;
    }

    await saveCart([...items, { ...item, quantity }]);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      return removeItem(productId);
    }

    const nextItems = items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    await saveCart(nextItems);
  };

  const removeItem = async (productId: string) => {
    const nextItems = items.filter((item) => item.productId !== productId);
    await saveCart(nextItems);
  };

  const clearCart = async () => {
    await saveCart([]);
  };

  const subtotal = useMemo(() => calculateSubtotal(items), [items]);

  const value: CartContextType = {
    items,
    loading,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartContextProvider');
  }
  return context;
}
