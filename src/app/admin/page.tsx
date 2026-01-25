'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AddProductForm from '@/components/AddProductForm';
import EditProductForm from '@/components/EditProductForm';
import DashboardOverview from '@/components/DashboardOverview';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '@/lib/productService';
import { getAllOrders, getOrdersByStatus, updateOrderStatus } from '@/lib/orderService';
import { getPaymentSettings, updatePaymentSettings } from '@/lib/paymentSettingsService';
import { uploadImage, deleteImage } from '@/lib/storage';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useUser } from '@/contexts/AuthContext';
import { Product } from '@/types/product';
import { Order } from '@/types/order';
import { PaymentSettings } from '@/types/paymentSettings';

type AdminOrderStatus = 'all' | Order['status'];

export default function AdminPanel() {
  const { isAuthenticated, loading: authLoading, logout, status, authError } = useAdminAuth();
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersFilter, setOrdersFilter] = useState<AdminOrderStatus>('all');
  const [orderActionLoading, setOrderActionLoading] = useState<string | null>(null);

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    walletName: '',
    walletNumber: '',
    qrImageUrl: '',
    qrImagePath: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentUploading, setPaymentUploading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  
  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      loadProducts();
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && activeTab === 'orders') {
      loadOrders();
    }
  }, [status, activeTab, ordersFilter]);

  useEffect(() => {
    if (status === 'authenticated' && activeTab === 'payment' && !paymentLoading && !paymentSettings) {
      loadPaymentSettings();
    }
  }, [status, activeTab]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const products = await fetchProducts();
      console.log('Admin: Loaded products:', products.map(p => ({ id: p.id, name: p.name })));
      setAdminProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = ordersFilter === 'all'
        ? await getAllOrders()
        : await getOrdersByStatus(ordersFilter);
      setOrders(data);
      if (selectedOrder) {
        const updated = data.find(order => order.orderId === selectedOrder.orderId) || null;
        setSelectedOrder(updated);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrdersError('Failed to load orders.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadPaymentSettings = async () => {
    setPaymentLoading(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    try {
      const settings = await getPaymentSettings();
      if (settings) {
        setPaymentSettings(settings);
        setPaymentForm({
          walletName: settings.walletName || '',
          walletNumber: settings.walletNumber || '',
          qrImageUrl: settings.qrImageUrl || '',
          qrImagePath: settings.qrImagePath || ''
        });
      } else {
        setPaymentSettings(null);
        setPaymentForm({
          walletName: '',
          walletNumber: '',
          qrImageUrl: '',
          qrImagePath: ''
        });
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
      setPaymentError('Failed to load payment settings.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentQrUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPaymentError('Please upload an image file.');
      return;
    }

    setPaymentError(null);
    setPaymentSuccess(null);
    setPaymentUploading(true);

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const path = `settings/payment/${fileName}`;
      const url = await uploadImage(file, path);
      const previousPath = paymentForm.qrImagePath;

      setPaymentForm(prev => ({
        ...prev,
        qrImageUrl: url,
        qrImagePath: path
      }));

      if (previousPath && previousPath !== path) {
        await deleteImage(previousPath);
      }
    } catch (error) {
      console.error('Error uploading QR image:', error);
      setPaymentError('Failed to upload QR image.');
    } finally {
      setPaymentUploading(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    if (!paymentForm.walletName.trim() || !paymentForm.walletNumber.trim() || !paymentForm.qrImageUrl) {
      setPaymentError('Please provide wallet name, wallet number, and QR image.');
      return;
    }

    setPaymentSaving(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    try {
      const updated: PaymentSettings = {
        walletName: paymentForm.walletName.trim(),
        walletNumber: paymentForm.walletNumber.trim(),
        qrImageUrl: paymentForm.qrImageUrl,
        qrImagePath: paymentForm.qrImagePath
      };

      await updatePaymentSettings(updated);
      setPaymentSettings(updated);
      setPaymentSuccess('Payment settings updated.');
    } catch (error) {
      console.error('Error saving payment settings:', error);
      setPaymentError('Failed to update payment settings.');
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      console.log('Admin: Adding product:', newProduct);
      const addedProduct = await addProduct(newProduct);
      if (addedProduct) {
        setAdminProducts(prev => [...prev, addedProduct]);
        setShowAddForm(false);
        alert('Product added successfully to Firebase!');
      } else {
        alert('Failed to add product. Please try again.');
      }
    } catch (error) {
      console.error('Admin: Error adding product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add product. Please try again.';
      alert(errorMessage);
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      const editedProduct = await updateProduct(updatedProduct.id.toString(), updatedProduct);
      if (editedProduct) {
        setAdminProducts(prev => 
          prev.map(product => 
            product.id === updatedProduct.id ? editedProduct : product
          )
        );
        setShowEditForm(false);
        setSelectedProduct(null);
        alert('Product updated successfully!');
      } else {
        alert('Failed to update product. Please try again.');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        console.log('Admin: Attempting to delete product with ID:', productId);
        const success = await deleteProduct(productId);
        if (success) {
          setAdminProducts(prev => prev.filter(product => product.id !== productId));
          alert('Product deleted successfully!');
          // Reload products to ensure consistency
          loadProducts();
        } else {
          alert('Failed to delete product. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete product. Please try again.';
        alert(`Failed to delete product: ${errorMessage}`);
      }
    }
  };

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setShowEditForm(true);
  };

  const getOrderStatusStyle = (statusValue: Order['status']) => {
    switch (statusValue) {
      case 'approved':
        return { background: '#dbeafe', color: '#1d4ed8' };
      case 'rejected':
        return { background: '#fee2e2', color: '#b91c1c' };
      case 'confirmed':
        return { background: '#ffedd5', color: '#9a3412' };
      case 'shipped':
        return { background: '#dbeafe', color: '#1e40af' };
      case 'delivered':
        return { background: '#dcfce7', color: '#166534' };
      case 'cancelled':
        return { background: '#fee2e2', color: '#991b1b' };
      case 'pending':
      default:
        return { background: '#fef3c7', color: '#92400e' };
    }
  };

  const handleApproveOrder = async (order: Order) => {
    if (!confirm(`Approve order ${order.orderId}?`)) {
      return;
    }

    setOrderActionLoading(order.orderId);
    try {
      await updateOrderStatus({
        orderId: order.orderId,
        status: 'approved',
        reviewedBy: user?.displayName || user?.email || 'Admin'
      });
      await loadOrders();
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order. Please try again.');
    } finally {
      setOrderActionLoading(null);
    }
  };

  const handleRejectOrder = async (order: Order) => {
    const reason = window.prompt('Reason for rejection (optional):')?.trim();

    if (!confirm(`Reject order ${order.orderId}?`)) {
      return;
    }

    setOrderActionLoading(order.orderId);
    try {
      await updateOrderStatus({
        orderId: order.orderId,
        status: 'rejected',
        reviewedBy: user?.displayName || user?.email || 'Admin',
        rejectionReason: reason || undefined
      });
      await loadOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    } finally {
      setOrderActionLoading(null);
    }
  };

  // Show loading while checking authentication
  if (authLoading || status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <h2 style={{ color: '#111827', marginBottom: '0.75rem' }}>Admin Access Required</h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            {authError || 'You must sign in with an admin account to access this dashboard.'}
          </p>
          <button
            onClick={() => router.push('/admin/login')}
            style={{
              padding: '0.75rem 1.25rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0'
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ color: '#1f2937' }}>Admin Panel</h1>
            <button
              onClick={logout}
              style={{
                padding: '0.5rem 1rem',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'dashboard' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'dashboard' ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderBottom: activeTab === 'dashboard' ? '3px solid #8b5cf6' : 'none'
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'products' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'products' ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderBottom: activeTab === 'products' ? '3px solid #8b5cf6' : 'none'
            }}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'orders' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'orders' ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderBottom: activeTab === 'orders' ? '3px solid #8b5cf6' : 'none'
            }}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'payment' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'payment' ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderBottom: activeTab === 'payment' ? '3px solid #8b5cf6' : 'none'
            }}
          >
            Payment
          </button>        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <DashboardOverview products={adminProducts} />
          )
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading products...</p>
            </div>
          ) : (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2>Product Management</h2>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                + Add Product
              </button>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                        Product
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                        Product Code
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                        Category
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                        Price
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                        Status
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminProducts.map((product) => (
                      <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                              {product.isFeatured && <span style={{ color: '#8b5cf6', marginRight: '0.5rem' }}>⭐ Featured</span>}
                              {product.isOnSale && <span style={{ color: '#dc2626' }}>🔥 On Sale</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#6b7280' }}>{product.productCode || '-'}</td>
                        <td style={{ padding: '1rem' }}>{product.category}</td>
                        <td style={{ padding: '1rem' }}>RM {(product.price || 0).toLocaleString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            background: product.availability === 'In Stock' ? '#dcfce7' : '#fef2f2',
                            color: product.availability === 'In Stock' ? '#059669' : '#dc2626'
                          }}>
                            {product.availability}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => handleEditClick(product)}
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: '#8b5cf6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 1.5rem'
          }}>
            {/* Header Section */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div>
                <h2 style={{
                  margin: 0,
                  marginBottom: '0.5rem',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  letterSpacing: '-0.025em'
                }}>
                  Order Management
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                  Review and process customer orders
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: '#475569',
                  fontWeight: 500
                }}>
                  <span style={{ color: '#94a3b8' }}>Total:</span> {orders.length} orders
                </div>
                <button
                  onClick={loadOrders}
                  style={{
                    padding: '0.5rem 0.875rem',
                    background: 'white',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.25rem',
              marginBottom: '1.5rem',
              background: '#f8fafc',
              padding: '0.25rem',
              borderRadius: '8px',
              width: 'fit-content'
            }}>
              {(['all', 'pending', 'approved', 'rejected', 'confirmed', 'shipped', 'delivered', 'cancelled'] as AdminOrderStatus[]).map((statusValue) => {
                const isActive = ordersFilter === statusValue;
                const statusColors: Record<string, { active: string; dot: string }> = {
                  all: { active: '#0f172a', dot: '#64748b' },
                  pending: { active: '#d97706', dot: '#fbbf24' },
                  approved: { active: '#2563eb', dot: '#60a5fa' },
                  rejected: { active: '#dc2626', dot: '#f87171' },
                  confirmed: { active: '#ea580c', dot: '#fb923c' },
                  shipped: { active: '#7c3aed', dot: '#a78bfa' },
                  delivered: { active: '#16a34a', dot: '#4ade80' },
                  cancelled: { active: '#6b7280', dot: '#9ca3af' }
                };
                return (
                  <button
                    key={statusValue}
                    onClick={() => setOrdersFilter(statusValue)}
                    style={{
                      padding: '0.5rem 0.875rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: isActive ? 'white' : 'transparent',
                      color: isActive ? statusColors[statusValue].active : '#64748b',
                      cursor: 'pointer',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      textTransform: 'capitalize',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {statusValue !== 'all' && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: statusColors[statusValue].dot
                      }} />
                    )}
                    {statusValue}
                  </button>
                );
              })}
            </div>

            {ordersLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Loading orders...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : ordersError ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                background: '#fef2f2',
                borderRadius: '12px',
                border: '1px solid #fecaca'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#fee2e2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p style={{ margin: 0, color: '#991b1b', fontWeight: 500 }}>{ordersError}</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: selectedOrder ? '1fr 400px' : '1fr',
                gap: '1.5rem',
                transition: 'all 0.2s ease'
              }}>
                {/* Orders Table */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={{
                            padding: '0.875rem 1rem',
                            textAlign: 'left',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Order
                          </th>
                          <th style={{
                            padding: '0.875rem 1rem',
                            textAlign: 'left',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Customer
                          </th>
                          <th style={{
                            padding: '0.875rem 1rem',
                            textAlign: 'left',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Amount
                          </th>
                          <th style={{
                            padding: '0.875rem 1rem',
                            textAlign: 'left',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Status
                          </th>
                          <th style={{
                            padding: '0.875rem 1rem',
                            textAlign: 'right',
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => {
                          const isSelected = selectedOrder?.orderId === order.orderId;
                          const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
                            pending: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
                            approved: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
                            rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
                            confirmed: { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
                            shipped: { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
                            delivered: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
                            cancelled: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
                          };
                          const config = statusConfig[order.status] || statusConfig.pending;

                          return (
                            <tr
                              key={order.orderId}
                              style={{
                                borderBottom: index === orders.length - 1 ? 'none' : '1px solid #f1f5f9',
                                background: isSelected ? '#f8fafc' : 'white',
                                cursor: 'pointer',
                                transition: 'background 0.15s ease'
                              }}
                              onClick={() => setSelectedOrder(order)}
                              onMouseOver={(e) => {
                                if (!isSelected) e.currentTarget.style.background = '#fafafa';
                              }}
                              onMouseOut={(e) => {
                                if (!isSelected) e.currentTarget.style.background = 'white';
                              }}
                            >
                              <td style={{ padding: '1rem' }}>
                                <div style={{
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  fontSize: '0.875rem',
                                  fontFamily: 'ui-monospace, monospace'
                                }}>
                                  #{order.orderId}
                                </div>
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#94a3b8',
                                  marginTop: '0.25rem'
                                }}>
                                  {new Date(order.createdAt).toLocaleDateString('en-MY', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{
                                  fontSize: '0.875rem',
                                  color: '#0f172a',
                                  fontWeight: 500
                                }}>
                                  {order.deliveryAddress.fullName}
                                </div>
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#94a3b8',
                                  marginTop: '0.125rem'
                                }}>
                                  {order.deliveryAddress.phoneNumber}
                                </div>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  fontSize: '0.875rem'
                                }}>
                                  RM {order.totalAmount.toFixed(2)}
                                </div>
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#94a3b8',
                                  marginTop: '0.125rem'
                                }}>
                                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                </div>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '0.25rem 0.625rem',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.025em',
                                  background: config.bg,
                                  color: config.text,
                                  border: `1px solid ${config.border}`
                                }}>
                                  {order.status}
                                </span>
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <div style={{
                                  display: 'flex',
                                  gap: '0.5rem',
                                  justifyContent: 'flex-end'
                                }} onClick={(e) => e.stopPropagation()}>
                                  {order.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApproveOrder(order)}
                                        disabled={orderActionLoading === order.orderId}
                                        style={{
                                          padding: '0.375rem 0.75rem',
                                          background: orderActionLoading === order.orderId ? '#d1d5db' : '#059669',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '5px',
                                          cursor: orderActionLoading === order.orderId ? 'not-allowed' : 'pointer',
                                          fontSize: '0.75rem',
                                          fontWeight: 500,
                                          transition: 'all 0.15s ease'
                                        }}
                                      >
                                        {orderActionLoading === order.orderId ? '...' : 'Approve'}
                                      </button>
                                      <button
                                        onClick={() => handleRejectOrder(order)}
                                        disabled={orderActionLoading === order.orderId}
                                        style={{
                                          padding: '0.375rem 0.75rem',
                                          background: 'white',
                                          color: '#dc2626',
                                          border: '1px solid #fca5a5',
                                          borderRadius: '5px',
                                          cursor: orderActionLoading === order.orderId ? 'not-allowed' : 'pointer',
                                          fontSize: '0.75rem',
                                          fontWeight: 500,
                                          transition: 'all 0.15s ease'
                                        }}
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {order.status !== 'pending' && (
                                    <button
                                      onClick={() => setSelectedOrder(order)}
                                      style={{
                                        padding: '0.375rem 0.75rem',
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: 500
                                      }}
                                    >
                                      Details
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan={5} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                              <div style={{
                                width: '64px',
                                height: '64px',
                                background: '#f1f5f9',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem'
                              }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <p style={{ margin: 0, color: '#64748b', fontWeight: 500 }}>No orders found</p>
                              <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
                                {ordersFilter !== 'all' ? `No ${ordersFilter} orders at the moment` : 'Orders will appear here'}
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Detail Panel */}
                {selectedOrder && (
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    position: 'sticky',
                    top: '1rem',
                    maxHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto'
                  }}>
                    {/* Panel Header */}
                    <div style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          fontFamily: 'ui-monospace, monospace'
                        }}>
                          #{selectedOrder.orderId}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                          {new Date(selectedOrder.createdAt).toLocaleString('en-MY')}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.375rem',
                          borderRadius: '6px',
                          color: '#64748b',
                          display: 'flex'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      {/* Status Badge */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        {(() => {
                          const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
                            pending: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
                            approved: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
                            rejected: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
                            confirmed: { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
                            shipped: { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
                            delivered: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
                            cancelled: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
                          };
                          const config = statusConfig[selectedOrder.status] || statusConfig.pending;
                          return (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              background: config.bg,
                              color: config.text,
                              border: `1px solid ${config.border}`
                            }}>
                              {selectedOrder.status}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Customer Info */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.5rem'
                        }}>
                          Customer
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#0f172a',
                          fontWeight: 500
                        }}>
                          {selectedOrder.deliveryAddress.fullName}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          marginTop: '0.25rem'
                        }}>
                          {selectedOrder.deliveryAddress.phoneNumber}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.5rem'
                        }}>
                          Delivery Address
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#475569',
                          lineHeight: 1.5
                        }}>
                          <div>{selectedOrder.deliveryAddress.streetAddress}</div>
                          <div>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}</div>
                          <div>{selectedOrder.deliveryAddress.postalCode}</div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.5rem'
                        }}>
                          Payment
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#475569'
                        }}>
                          {selectedOrder.paymentMethod === 'touch_n_go' ? "Touch 'n Go" : selectedOrder.paymentMethod || "Touch 'n Go"}
                        </div>
                        {selectedOrder.paymentSubmittedAt && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            marginTop: '0.25rem'
                          }}>
                            Submitted {new Date(selectedOrder.paymentSubmittedAt).toLocaleString('en-MY')}
                          </div>
                        )}
                      </div>

                      {/* Payment Proof */}
                      {selectedOrder.paymentProofUrl && (
                        <div style={{ marginBottom: '1.25rem' }}>
                          <div style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.5rem'
                          }}>
                            Payment Proof
                          </div>
                          <div style={{
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #e2e8f0'
                          }}>
                            <Image
                              src={selectedOrder.paymentProofUrl}
                              alt={`Payment proof for ${selectedOrder.orderId}`}
                              width={360}
                              height={360}
                              style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {selectedOrder.rejectionReason && (
                        <div style={{
                          marginBottom: '1.25rem',
                          padding: '0.75rem',
                          background: '#fef2f2',
                          borderRadius: '8px',
                          border: '1px solid #fecaca'
                        }}>
                          <div style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#991b1b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.375rem'
                          }}>
                            Rejection Reason
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#991b1b' }}>
                            {selectedOrder.rejectionReason}
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.75rem'
                        }}>
                          Items ({selectedOrder.items.length})
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          {selectedOrder.items.map((item, index) => (
                            <div
                              key={`${item.productId}-${index}`}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.625rem 0.75rem',
                                background: '#f8fafc',
                                borderRadius: '6px',
                                fontSize: '0.8rem'
                              }}
                            >
                              <div>
                                <div style={{ color: '#0f172a', fontWeight: 500 }}>
                                  {item.productName}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                                  Qty: {item.quantity} × RM {item.price.toFixed(2)}
                                </div>
                              </div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                RM {(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div style={{
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: '1rem',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          color: '#64748b',
                          marginBottom: '0.375rem'
                        }}>
                          <span>Subtotal</span>
                          <span>RM {selectedOrder.subtotal.toFixed(2)}</span>
                        </div>
                        {selectedOrder.voucherDiscount > 0 && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem',
                            color: '#16a34a',
                            marginBottom: '0.375rem'
                          }}>
                            <span>Voucher ({selectedOrder.vouchersApplied}x)</span>
                            <span>-RM {selectedOrder.voucherDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          color: '#64748b',
                          marginBottom: '0.5rem'
                        }}>
                          <span>Delivery ({selectedOrder.deliveryAreaName || 'N/A'})</span>
                          <span>RM {(selectedOrder.deliveryFee || 0).toFixed(2)}</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#0f172a'
                        }}>
                          <span>Total</span>
                          <span>RM {selectedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Action Buttons for Pending Orders */}
                      {selectedOrder.status === 'pending' && (
                        <div style={{
                          display: 'flex',
                          gap: '0.75rem',
                          marginTop: '1.25rem',
                          paddingTop: '1.25rem',
                          borderTop: '1px solid #e2e8f0'
                        }}>
                          <button
                            onClick={() => handleApproveOrder(selectedOrder)}
                            disabled={orderActionLoading === selectedOrder.orderId}
                            style={{
                              flex: 1,
                              padding: '0.625rem 1rem',
                              background: orderActionLoading === selectedOrder.orderId ? '#d1d5db' : '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: orderActionLoading === selectedOrder.orderId ? 'not-allowed' : 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {orderActionLoading === selectedOrder.orderId ? 'Processing...' : 'Approve Order'}
                          </button>
                          <button
                            onClick={() => handleRejectOrder(selectedOrder)}
                            disabled={orderActionLoading === selectedOrder.orderId}
                            style={{
                              flex: 1,
                              padding: '0.625rem 1rem',
                              background: 'white',
                              color: '#dc2626',
                              border: '1px solid #fca5a5',
                              borderRadius: '8px',
                              cursor: orderActionLoading === selectedOrder.orderId ? 'not-allowed' : 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            Reject Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 1.5rem'
          }}>
            {/* Header Section */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div>
                <h2 style={{
                  margin: 0,
                  marginBottom: '0.5rem',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  letterSpacing: '-0.025em'
                }}>
                  Payment Settings
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                  Configure Touch 'n Go wallet for customer checkout
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button
                  onClick={loadPaymentSettings}
                  style={{
                    padding: '0.5rem 0.875rem',
                    background: 'white',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={handleSavePaymentSettings}
                  disabled={paymentSaving || paymentUploading}
                  style={{
                    padding: '0.5rem 1rem',
                    background: paymentSaving || paymentUploading ? '#94a3b8' : '#0f172a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: paymentSaving || paymentUploading ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {paymentSaving ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17,21 17,13 7,13 7,21" />
                        <polyline points="7,3 7,8 15,8" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {paymentLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Loading payment settings...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {/* Alert Messages */}
                {(paymentError || paymentSuccess) && (
                  <div style={{ display: 'grid', gap: '0.625rem' }}>
                    {paymentError && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: '#fef2f2',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem'
                      }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#fee2e2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </div>
                        <span style={{ color: '#991b1b', fontSize: '0.8rem', fontWeight: 500 }}>{paymentError}</span>
                      </div>
                    )}
                    {paymentSuccess && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: '#f0fdf4',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem'
                      }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#dcfce7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        </div>
                        <span style={{ color: '#166534', fontSize: '0.8rem', fontWeight: 500 }}>{paymentSuccess}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Main Content Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 380px',
                  gap: '1.25rem'
                }}>
                  {/* Left Column - Form */}
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                  }}>
                    {/* Card Header */}
                    <div style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid #e2e8f0',
                      background: '#f8fafc'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#dbeafe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                          </svg>
                        </div>
                        <div>
                          <h3 style={{
                            margin: 0,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#0f172a'
                          }}>
                            Wallet Configuration
                          </h3>
                          <p style={{
                            margin: 0,
                            fontSize: '0.75rem',
                            color: '#64748b'
                          }}>
                            E-wallet details for receiving payments
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'grid', gap: '1.25rem' }}>
                        {/* Wallet Name Field */}
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.5rem'
                          }}>
                            Wallet Name
                          </label>
                          <input
                            type="text"
                            value={paymentForm.walletName}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, walletName: e.target.value }))}
                            placeholder="e.g., John's Touch 'n Go"
                            style={{
                              width: '100%',
                              padding: '0.625rem 0.875rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              color: '#0f172a',
                              background: 'white',
                              transition: 'all 0.15s ease',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#3b82f6';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#e2e8f0';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                          <p style={{
                            margin: '0.375rem 0 0',
                            fontSize: '0.7rem',
                            color: '#94a3b8'
                          }}>
                            Display name shown to customers during checkout
                          </p>
                        </div>

                        {/* Wallet Number Field */}
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.5rem'
                          }}>
                            Wallet Number
                          </label>
                          <input
                            type="text"
                            value={paymentForm.walletNumber}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, walletNumber: e.target.value }))}
                            placeholder="e.g., 012-345-6789"
                            style={{
                              width: '100%',
                              padding: '0.625rem 0.875rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              color: '#0f172a',
                              background: 'white',
                              fontFamily: 'ui-monospace, monospace',
                              transition: 'all 0.15s ease',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#3b82f6';
                              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#e2e8f0';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                          <p style={{
                            margin: '0.375rem 0 0',
                            fontSize: '0.7rem',
                            color: '#94a3b8'
                          }}>
                            Phone number linked to your Touch 'n Go wallet
                          </p>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{
                        height: '1px',
                        background: '#e2e8f0',
                        margin: '1.5rem 0'
                      }} />

                      {/* QR Upload Section */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.625rem'
                        }}>
                          QR Code Image
                        </label>

                        <div
                          style={{
                            border: '2px dashed #e2e8f0',
                            borderRadius: '10px',
                            padding: '1.5rem',
                            textAlign: 'center',
                            background: '#f8fafc',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            position: 'relative'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.background = '#f1f5f9';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = '#f8fafc';
                          }}
                          onClick={() => document.getElementById('qr-upload-input')?.click()}
                        >
                          <input
                            id="qr-upload-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handlePaymentQrUpload(file);
                              }
                            }}
                            style={{ display: 'none' }}
                          />

                          {paymentUploading ? (
                            <div>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                border: '3px solid #e2e8f0',
                                borderTopColor: '#3b82f6',
                                borderRadius: '50%',
                                margin: '0 auto 0.75rem',
                                animation: 'spin 0.8s linear infinite'
                              }} />
                              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Uploading...</p>
                            </div>
                          ) : (
                            <>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 0.75rem'
                              }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                  <polyline points="17,8 12,3 7,8" />
                                  <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                              </div>
                              <p style={{ margin: 0, color: '#0f172a', fontSize: '0.8rem', fontWeight: 500 }}>
                                Click to upload QR code
                              </p>
                              <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.7rem' }}>
                                PNG, JPG up to 5MB
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Preview */}
                  <div style={{ display: 'grid', gap: '1.25rem', alignContent: 'start' }}>
                    {/* QR Preview Card */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid #e2e8f0',
                        background: '#f8fafc'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#fef3c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7" />
                              <rect x="14" y="3" width="7" height="7" />
                              <rect x="14" y="14" width="7" height="7" />
                              <rect x="3" y="14" width="7" height="7" />
                            </svg>
                          </div>
                          <div>
                            <h3 style={{
                              margin: 0,
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: '#0f172a'
                            }}>
                              QR Code Preview
                            </h3>
                            <p style={{
                              margin: 0,
                              fontSize: '0.75rem',
                              color: '#64748b'
                            }}>
                              Customer checkout view
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '1.25rem' }}>
                        <div style={{
                          width: '100%',
                          aspectRatio: '1',
                          maxHeight: '280px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          {paymentForm.qrImageUrl ? (
                            <Image
                              src={paymentForm.qrImageUrl}
                              alt="Payment QR"
                              width={260}
                              height={260}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                              <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 0.75rem'
                              }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21,15 16,10 5,21" />
                                </svg>
                              </div>
                              <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
                                No QR uploaded
                              </p>
                              <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.7rem' }}>
                                Upload a QR code image
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {/* Decorative Pattern */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '120px',
                        height: '120px',
                        background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                        pointerEvents: 'none'
                      }} />

                      <div style={{ padding: '1.25rem', position: 'relative' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#22c55e'
                          }} />
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                          }}>
                            Live Preview
                          </span>
                        </div>

                        <div style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                          <div style={{
                            fontSize: '0.7rem',
                            color: '#64748b',
                            marginBottom: '0.375rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Pay to
                          </div>
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'white',
                            marginBottom: '0.25rem'
                          }}>
                            {paymentForm.walletName || 'Wallet Name'}
                          </div>
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#94a3b8',
                            fontFamily: 'ui-monospace, monospace'
                          }}>
                            {paymentForm.walletNumber || '000-000-0000'}
                          </div>
                        </div>

                        <div style={{
                          marginTop: '0.75rem',
                          padding: '0.625rem 0.875rem',
                          background: 'rgba(59, 130, 246, 0.15)',
                          borderRadius: '8px',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          <span style={{ fontSize: '0.7rem', color: '#93c5fd' }}>
                            This is how customers will see your payment info
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Add Product Form */}
      {showAddForm && (
        <AddProductForm
          onClose={() => setShowAddForm(false)}
          onSave={handleAddProduct}
        />
      )}

      {/* Edit Product Form */}
      {showEditForm && selectedProduct && (
        <EditProductForm
          product={selectedProduct}
          onClose={() => {
            setShowEditForm(false);
            setSelectedProduct(null);
          }}
          onSave={handleEditProduct}
        />
      )}
    </div>
  );
} 
