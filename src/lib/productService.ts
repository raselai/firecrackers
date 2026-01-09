import { Product } from '@/types/product';
import {
  addProduct as addProductToFirestore,
  updateProduct as updateProductInFirestore,
  deleteProduct as deleteProductInFirestore
} from '@/lib/firestore';

// Fetch all products from API
export async function fetchProducts(): Promise<Product[]> {
  try {
    console.log('productService: Fetching products from /api/products (Firebase Firestore + Storage)');
    const response = await fetch('/api/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Prevent caching to always get fresh data
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

    const result = await addProductToFirestore(product);
    console.log('productService: Added product directly to Firestore:', result);
    return result as Product;
  } catch (error) {
    console.error('productService: Error adding product:', error);
    throw error; // Re-throw to let the calling code handle it
  }
}

// Update an existing product
export async function updateProduct(id: string, product: Product): Promise<Product | null> {
  try {
    const result = await updateProductInFirestore(id, product);
    return result as Product;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

// Delete a product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    console.log('productService: Deleting product with ID:', id);
    const result = await deleteProductInFirestore(id);
    console.log('productService: Delete success response:', result);
    return true;
  } catch (error) {
    console.error('productService: Error deleting product:', error);
    throw error; // Re-throw to let the calling code handle it
  }
} 
