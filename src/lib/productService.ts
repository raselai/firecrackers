import { Product } from '@/types/product';

// Fetch all products from API
export async function fetchProducts(): Promise<Product[]> {
  try {
    console.log('productService: Fetching products from /api/products-new');
    const response = await fetch('/api/products-new', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('productService: Response status:', response.status);
    console.log('productService: Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    console.log('productService: Received data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Add a new product
export async function addProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    console.log('productService: Adding product:', product);
    
    const response = await fetch('/api/products-new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    console.log('productService: Response status:', response.status);
    console.log('productService: Response ok:', response.ok);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('productService: Error response:', errorData);
      throw new Error(`Failed to add product: ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log('productService: Success response:', result);
    return result;
  } catch (error) {
    console.error('productService: Error adding product:', error);
    throw error; // Re-throw to let the calling code handle it
  }
}

// Update an existing product
export async function updateProduct(id: string, product: Product): Promise<Product | null> {
  try {
    const response = await fetch('/api/products-new', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

// Delete a product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/products-new?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
} 