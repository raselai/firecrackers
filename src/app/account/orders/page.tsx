'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import { getUserOrders, getUserOrdersByStatus } from '@/lib/orderService';
import { Order } from '@/types/order';

type OrderStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

const formatTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

export default function OrdersPage() {
  const { user, firebaseUser, loading } = useUser();
  const router = useRouter();
  const { locale, t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login?redirect=/account/orders');
    }
  }, [firebaseUser, loading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = user?.uid || firebaseUser?.uid;
      if (userId) {
        try {
          if (selectedStatus === 'all') {
            const allOrders = await getUserOrders(userId);
            setOrders(allOrders);
          } else {
            const filteredOrders = await getUserOrdersByStatus(userId, selectedStatus);
            setOrders(filteredOrders);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoadingOrders(false);
        }
      }
    };

    fetchOrders();
  }, [user, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusLabelFor = (status: OrderStatus) => {
    if (status === 'all') {
      return t('accountOrders.statusAll');
    }
    const key = `account.status.${status}`;
    const translated = t(key);
    if (translated === key) {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
    return translated;
  };

  if (loading || (firebaseUser && !user) || (user && loadingOrders)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('accountOrders.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const defaultUserName = t('account.defaultUserName');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {(user.displayName || user.email || defaultUserName).charAt(0).toUpperCase()}
                </div>
                <h3 className="text-center mt-3 font-semibold text-gray-900">
                  {user.displayName || user.email || defaultUserName}
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
                  {t('account.dashboard')}
                </Link>
                <Link
                  href="/account/profile"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('account.profile')}
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-orange-50 text-orange-600 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {t('account.orders')}
                </Link>
                <Link
                  href="/account/notifications"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" />
                  </svg>
                  {t('account.notifications')}
                </Link>
                <Link
                  href="/account/wishlist"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {t('account.wishlist')}
                </Link>
                <Link
                  href="/account/referrals"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {t('account.referrals')}
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('accountOrders.title')}</h1>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="flex flex-wrap border-b border-gray-200">
                {(['all', 'pending', 'approved', 'rejected', 'confirmed', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-6 py-4 font-medium transition-colors ${
                      selectedStatus === status
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {statusLabelFor(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {formatTemplate(t('accountOrders.orderNumber'), {
                            id: order.orderId.slice(0, 12).toUpperCase()
                          })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatTemplate(t('accountOrders.placedOn'), {
                            date: new Date(order.createdAt).toLocaleDateString(
                              locale === 'zh-CN' ? 'zh-CN' : 'en-MY',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }
                            )
                          })}
                        </p>
                      </div>
                      <div className="mt-3 md:mt-0 text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          RM{order.totalAmount.toFixed(2)}
                        </p>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {statusLabelFor(order.status)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex flex-wrap gap-4">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.productImage || '/placeholder.png'}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTemplate(t('accountOrders.itemSummary'), {
                                  qty: item.quantity,
                                  price: item.price.toFixed(2)
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex items-center text-sm text-gray-500">
                            {formatTemplate(t('accountOrders.moreItems'), { count: order.items.length - 3 })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-4">
                      <div className="text-sm text-gray-600 mb-3 sm:mb-0">
                        {formatTemplate(
                          order.items.length === 1 ? t('accountOrders.itemCountSingular') : t('accountOrders.itemCountPlural'),
                          { count: order.items.length }
                        )}
                        {order.vouchersApplied > 0 && (
                          <span className="ml-3 text-green-600 font-medium">
                            {formatTemplate(
                              order.vouchersApplied === 1
                                ? t('accountOrders.voucherAppliedSingular')
                                : t('accountOrders.voucherAppliedPlural'),
                              {
                                count: order.vouchersApplied,
                                amount: order.voucherDiscount.toFixed(2)
                              }
                            )}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/account/orders/${order.orderId}`}
                        className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors text-center"
                      >
                        {t('accountOrders.viewDetails')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedStatus === 'all'
                    ? t('accountOrders.noOrdersTitleAll')
                    : formatTemplate(t('accountOrders.noOrdersTitleStatus'), {
                        status: statusLabelFor(selectedStatus)
                      })}
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedStatus === 'all'
                    ? t('accountOrders.noOrdersBodyAll')
                    : formatTemplate(t('accountOrders.noOrdersBodyStatus'), {
                        status: statusLabelFor(selectedStatus)
                      })}
                </p>
                {selectedStatus === 'all' ? (
                  <Link
                    href="/"
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                  >
                    {t('accountOrders.startShopping')}
                  </Link>
                ) : (
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors"
                  >
                    {t('accountOrders.viewAllOrders')}
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
