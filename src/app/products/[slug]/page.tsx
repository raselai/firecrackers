import ProductContent from './ProductContent';

export const revalidate = 300;

async function fetchProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}/api/products`, {
      next: { revalidate }
    });
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch products on server:', error);
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const products = await fetchProducts();
  return <ProductContent slug={slug} products={products} />;
}
