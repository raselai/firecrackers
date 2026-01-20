'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/contexts/AuthContext';
import { removeFromWishlist } from '@/lib/userService';
import { getProductById } from '@/lib/firestore';
import { Product } from '@/types/product';

export default function WishlistPage() {
  const { user, firebaseUser, loading, refreshUser } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login?redirect=/account/wishlist');
    }
  }, [firebaseUser, loading, router]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (user && user.wishlist.length > 0) {
        try {
          const productPromises = user.wishlist.map(productId => getProductById(productId));
          const fetchedProducts = await Promise.all(productPromises);
          // Filter out any null results (products that no longer exist)
          setProducts(fetchedProducts.filter(p => p !== null) as Product[]);
        } catch (error) {
          console.error('Error fetching wishlist products:', error);
        } finally {
          setLoadingProducts(false);
        }
      } else {
        setLoadingProducts(false);
      }
    };

    fetchWishlistProducts();
  }, [user]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;

    setRemovingId(productId);
    try {
      await removeFromWishlist(user.uid, productId);
      await refreshUser();
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading || (firebaseUser && !user) || (user && loadingProducts)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-center mt-3 font-semibold text-gray-900">
                  {user.displayName}
                </h3>
                <p className="text-center text-sm text-gray-500">{user.email}</p>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/account/profile"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Orders
                </Link>
                <Link
                  href="/account/notifications"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" />
                  </svg>
                  Notifications
                </Link>
                <Link
                  href="/account/wishlist"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-orange-50 text-orange-600 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                </Link>
                <Link
                  href="/account/referrals"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Referrals
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-600 mt-1">
                  {products.length} {products.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const displayImage = product.mainImage || product.image || product.images?.[0] || '/placeholder.png';
                  const displayPrice = product.offerPrice || product.price;
                  const hasDiscount = product.offerPrice && product.offerPrice < product.price;

                  return (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
                      {/* Product Image */}
                      <div className="relative h-64 overflow-hidden">
                        <Link href={`/products/${product.id}`}>
                          <Image
                            src={displayImage}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                        {hasDiscount && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                            {Math.round(((product.price - product.offerPrice!) / product.price) * 100)}% OFF
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-gray-900">
                            RM{displayPrice.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                              RM{product.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {product.effectType && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {product.effectType}
                            </span>
                            {product.noiseLevel && (
                              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                {product.noiseLevel}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => handleRemoveFromWishlist(product.id)}
                            disabled={removingId === product.id}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            title="Remove from wishlist"
                          >
                            {removingId === product.id ? (
                              <svg className="w-5 h-5 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                <p className="text-gray-600 mb-6">
                  Start adding products you love to your wishlist!
                </p>
                <Link
                  href="/"
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
