import SearchClient from '@/components/SearchClient';

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

export default async function SearchPage() {
  const products = await fetchProducts();
  return <SearchClient products={products} />;
}
