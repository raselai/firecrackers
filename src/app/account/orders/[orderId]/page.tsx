'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/contexts/AuthContext';
import { getOrderById } from '@/lib/orderService';
import { Order } from '@/types/order';

export default function OrderDetailPage() {
  const { user, firebaseUser, loading } = useUser();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login?redirect=/account/orders');
    }
  }, [firebaseUser, loading, router]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (user && orderId) {
        try {
          const orderData = await getOrderById(orderId);

          if (!orderData) {
            setError('Order not found');
          } else if (orderData.userId !== (user.uid || firebaseUser?.uid)) {
            setError('Unauthorized access to this order');
          } else {
            setOrder(orderData);
          }
        } catch (err) {
          console.error('Error fetching order:', err);
          setError('Failed to load order details');
        } finally {
          setLoadingOrder(false);
        }
      }
    };

    fetchOrder();
  }, [user, orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'approved':
      case 'confirmed':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  };

  if (loading || (firebaseUser && !user) || (user && loadingOrder)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Order Not Found'}</h2>
            <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
            <Link
              href="/account/orders"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/account/orders"
              className="text-orange-600 hover:text-orange-700 font-medium mb-4 inline-block"
            >
              ← Back to Orders
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order #{order.orderId.slice(0, 12).toUpperCase()}
                </h1>
                <p className="text-gray-600 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-MY', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border-2 ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          {order.status !== 'cancelled' && order.status !== 'rejected' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status</h2>
              <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-orange-500 transition-all duration-500"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  ></div>
                </div>
                <div className="relative flex justify-between">
                  {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((status, index) => (
                    <div key={status} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          index <= currentStep
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {index < currentStep ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <p className={`mt-2 text-sm font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                        {status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.productImage || '/placeholder.png'}
                      alt={item.productName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.productName}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Price per unit: RM{item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      RM{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Pricing Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Price Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">RM{order.subtotal.toFixed(2)}</span>
                </div>
                {order.vouchersApplied > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Voucher Discount ({order.vouchersApplied} voucher{order.vouchersApplied !== 1 ? 's' : ''})
                    </span>
                    <span className="font-medium">-RM{order.voucherDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee ({order.deliveryAreaName || 'N/A'})</span>
                  <span className="font-medium">RM{(order.deliveryFee || 0).toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>RM{order.totalAmount.toFixed(2)}</span>
                </div>
                {order.vouchersApplied > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-green-800 font-medium">
                      You saved RM{order.voucherDiscount.toFixed(2)} with vouchers!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Delivery Address</h2>
              <div className="text-gray-700 space-y-1">
                <p className="font-semibold text-gray-900">{order.deliveryAddress.fullName}</p>
                <p>{order.deliveryAddress.phoneNumber}</p>
                <p className="pt-2">{order.deliveryAddress.streetAddress}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                <p>{order.deliveryAddress.postalCode}</p>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          {order.status !== 'cancelled' && order.status !== 'rejected' && order.status !== 'delivered' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about your order, please contact our support team.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/contact"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Contact Support
                </Link>
                {order.status === 'pending' && (
                  <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
