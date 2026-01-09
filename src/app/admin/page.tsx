'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AddProductForm from '@/components/AddProductForm';
import EditProductForm from '@/components/EditProductForm';
import DashboardOverview from '@/components/DashboardOverview';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '@/lib/productService';
import { getAllOrders, getOrdersByStatus, updateOrderStatus } from '@/lib/orderService';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useUser } from '@/contexts/AuthContext';
import { Product } from '@/types/product';
import { Order } from '@/types/order';

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

  // Mock data for admin panel
  const inquiries = [
    {
      id: 1,
      product: 'Crystal Palace Chandelier',
              customer: '+971 50 697 0154',
      message: 'Hi! I\'m interested in the Crystal Palace Chandelier priced at RM 2,850. Can you provide more details?',
      date: '2024-01-15',
      status: 'New'
    },
    {
      id: 2,
      product: 'Modern Gold Chandelier',
              customer: '+971 50 697 0154',
      message: 'Hi! I\'m interested in the Modern Gold Chandelier priced at RM 1,950. Can you provide more details?',
      date: '2024-01-14',
      status: 'Contacted'
    }
  ];

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
            onClick={() => setActiveTab('inquiries')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'inquiries' ? '#8b5cf6' : 'transparent',
              color: activeTab === 'inquiries' ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderBottom: activeTab === 'inquiries' ? '3px solid #8b5cf6' : 'none'
            }}
          >
            Inquiries
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <DashboardOverview products={adminProducts} inquiries={inquiries} />
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
                        <td style={{ padding: '1rem' }}>{product.category}</td>
                        <td style={{ padding: '1rem' }}>RM {product.price.toLocaleString()}</td>
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
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ marginBottom: '0.75rem' }}>Orders</h2>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {(['all', 'pending', 'approved', 'rejected', 'confirmed', 'shipped', 'delivered', 'cancelled'] as AdminOrderStatus[]).map((statusValue) => (
                  <button
                    key={statusValue}
                    onClick={() => setOrdersFilter(statusValue)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: ordersFilter === statusValue ? '1px solid #8b5cf6' : '1px solid #e5e7eb',
                      background: ordersFilter === statusValue ? '#ede9fe' : 'white',
                      color: ordersFilter === statusValue ? '#6d28d9' : '#374151',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}
                  >
                    {statusValue}
                  </button>
                ))}
              </div>
            </div>

            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading orders...</p>
              </div>
            ) : ordersError ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#b91c1c' }}>
                {ordersError}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 60%', minWidth: '320px' }}>
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
                              Order
                            </th>
                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                              Customer
                            </th>
                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                              Total
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
                          {orders.map((order) => {
                            const statusStyle = getOrderStatusStyle(order.status);
                            return (
                              <tr key={order.orderId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '1rem' }}>
                                  <div style={{ fontWeight: 'bold' }}>#{order.orderId}</div>
                                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                    {new Date(order.createdAt).toLocaleDateString('en-MY')}
                                  </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  <div style={{ fontSize: '0.9rem', color: '#111827' }}>{order.deliveryAddress.fullName}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{order.deliveryAddress.phoneNumber}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>RM {order.totalAmount.toFixed(2)}</td>
                                <td style={{ padding: '1rem' }}>
                                  <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    background: statusStyle.background,
                                    color: statusStyle.color
                                  }}>
                                    {order.status}
                                  </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button
                                      onClick={() => setSelectedOrder(order)}
                                      style={{
                                        padding: '0.25rem 0.75rem',
                                        background: '#111827',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleApproveOrder(order)}
                                      disabled={orderActionLoading === order.orderId}
                                      style={{
                                        padding: '0.25rem 0.75rem',
                                        background: '#059669',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        whiteSpace: 'nowrap',
                                        opacity: orderActionLoading === order.orderId ? 0.6 : 1
                                      }}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectOrder(order)}
                                      disabled={orderActionLoading === order.orderId}
                                      style={{
                                        padding: '0.25rem 0.75rem',
                                        background: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        whiteSpace: 'nowrap',
                                        opacity: orderActionLoading === order.orderId ? 0.6 : 1
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                No orders found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div style={{ flex: '1 1 35%', minWidth: '280px' }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    padding: '1.5rem',
                    minHeight: '200px'
                  }}>
                    {selectedOrder ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div>
                            <h3 style={{ marginBottom: '0.25rem' }}>Order #{selectedOrder.orderId}</h3>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                              {new Date(selectedOrder.createdAt).toLocaleString('en-MY')}
                            </p>
                          </div>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            ...getOrderStatusStyle(selectedOrder.status)
                          }}>
                            {selectedOrder.status}
                          </span>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Customer</p>
                          <p style={{ margin: 0 }}>{selectedOrder.deliveryAddress.fullName}</p>
                          <p style={{ margin: 0, color: '#6b7280' }}>{selectedOrder.deliveryAddress.phoneNumber}</p>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Delivery</p>
                          <p style={{ margin: 0 }}>{selectedOrder.deliveryAddress.streetAddress}</p>
                          <p style={{ margin: 0 }}>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}</p>
                          <p style={{ margin: 0 }}>{selectedOrder.deliveryAddress.postalCode}</p>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Payment</p>
                          <p style={{ margin: 0 }}>Method: {selectedOrder.paymentMethod || 'touch_n_go'}</p>
                          {selectedOrder.paymentSubmittedAt && (
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
                              Submitted: {new Date(selectedOrder.paymentSubmittedAt).toLocaleString('en-MY')}
                            </p>
                          )}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Payment Proof</p>
                          {selectedOrder.paymentProofUrl ? (
                            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                              <Image
                                src={selectedOrder.paymentProofUrl}
                                alt={`Payment proof for ${selectedOrder.orderId}`}
                                width={360}
                                height={360}
                                style={{ width: '100%', height: 'auto' }}
                              />
                            </div>
                          ) : (
                            <p style={{ margin: 0, color: '#6b7280' }}>No proof uploaded.</p>
                          )}
                        </div>

                        {selectedOrder.rejectionReason && (
                          <div style={{ marginBottom: '1rem', color: '#b91c1c' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Rejection Reason</p>
                            <p style={{ margin: 0 }}>{selectedOrder.rejectionReason}</p>
                          </div>
                        )}

                        <div>
                          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Items</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selectedOrder.items.map((item, index) => (
                              <div key={`${item.productId}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span>{item.productName} x{item.quantity}</span>
                                <span>RM {(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '0.75rem', paddingTop: '0.75rem', fontWeight: 'bold' }}>
                            Total: RM {selectedOrder.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 1rem' }}>
                        Select an order to view details.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === 'inquiries' && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Customer Inquiries</h2>
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
                        Date
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                        Product
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                        Customer
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                        Message
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem' }}>{inquiry.date}</td>
                        <td style={{ padding: '1rem' }}>{inquiry.product}</td>
                        <td style={{ padding: '1rem' }}>{inquiry.customer}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ maxWidth: '300px' }}>
                            {inquiry.message}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            background: inquiry.status === 'New' ? '#fef3c7' : '#dcfce7',
                            color: inquiry.status === 'New' ? '#d97706' : '#059669'
                          }}>
                            {inquiry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

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
