'use client';

interface DashboardOverviewProps {
  products: any[];
}

export default function DashboardOverview({ products }: DashboardOverviewProps) {
  // Calculate statistics
  const totalProducts = products.length;
  const featuredProducts = products.filter(p => p.isFeatured).length;
  const onSaleProducts = products.filter(p => p.isOnSale).length;
  const inStockProducts = products.filter(p => p.availability === 'In Stock').length;

  // Calculate total value
  const totalValue = products.reduce((sum, product) => sum + product.price, 0);

  // Get top categories
  const categoryCounts = products.reduce((acc: any, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCounts)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Dashboard Overview</h2>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          borderLeft: '4px solid #8b5cf6'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {totalProducts}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Total Products
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          borderLeft: '4px solid #059669'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
            {inStockProducts}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            In Stock
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {featuredProducts}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Featured Products
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          borderLeft: '4px solid #dc2626'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
            {onSaleProducts}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            On Sale
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Top Categories */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Top Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topCategories.map(([category, count]: [string, any]) => (
              <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#374151' }}>{category}</span>
                <span style={{
                  background: '#f3f4f6',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#374151'
                }}>
                  {count} products
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Value */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Inventory Value</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.5rem' }}>
            RM {totalValue.toLocaleString()}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Total value of all products
          </div>
        </div>
      </div>
    </div>
  );
}
