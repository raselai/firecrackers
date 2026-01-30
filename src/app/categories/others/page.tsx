import CategoryContent from './CategoryContent';

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

export default async function OthersCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categorySlug = decodeURIComponent(category);
  const products = await fetchProducts();
  return <CategoryContent categorySlug={categorySlug} products={products} />;
}
