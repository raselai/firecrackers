'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddProductForm from '@/components/AddProductForm';
import EditProductForm from '@/components/EditProductForm';
import DashboardOverview from '@/components/DashboardOverview';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '@/lib/productService';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types/product';

export default function AdminPanel() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for admin panel
  const inquiries = [
    {
      id: 1,
      product: 'Crystal Palace Chandelier',
              customer: '+971 50 697 0154',
      message: 'Hi! I\'m interested in the Crystal Palace Chandelier priced at AED 2,850. Can you provide more details?',
      date: '2024-01-15',
      status: 'New'
    },
    {
      id: 2,
      product: 'Modern Gold Chandelier',
              customer: '+971 50 697 0154',
      message: 'Hi! I\'m interested in the Modern Gold Chandelier priced at AED 1,950. Can you provide more details?',
      date: '2024-01-14',
      status: 'Contacted'
    }
  ];

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated, authLoading, router]);

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

  // Show loading while checking authentication
  if (authLoading) {
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
    return null; // Will redirect in useEffect
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
                        <td style={{ padding: '1rem' }}>AED {product.price.toLocaleString()}</td>
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