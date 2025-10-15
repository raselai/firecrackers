import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  wattage: string;
  material: string;
  dimensions: string;
  inStock: boolean;
  featured: boolean;
  seasonal: boolean;
  isOnSale: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper function to read products from JSON file
function readProducts(): Product[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

// Helper function to write products to JSON file
function writeProducts(products: Product[]): boolean {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    const dir = path.dirname(filePath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing products:', error);
    return false;
  }
}

// GET - Fetch all products
export async function GET() {
  try {
    console.log('API: Fetching products from local JSON file');
    const products = readProducts();
    console.log(`API: Found ${products.length} products`);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error reading products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - Add a new product
export async function POST(request: NextRequest) {
  try {
    console.log('API: Adding new product to local JSON file');
    const newProductData = await request.json();
    console.log('API: Received product data:', newProductData);
    
    // Validate required fields
    if (!newProductData.name?.trim()) {
      return NextResponse.json({ 
        error: 'Product name is required' 
      }, { status: 400 });
    }
    
    if (!newProductData.category?.trim()) {
      return NextResponse.json({ 
        error: 'Category is required' 
      }, { status: 400 });
    }
    
    if (!newProductData.subcategory?.trim()) {
      return NextResponse.json({ 
        error: 'Subcategory is required' 
      }, { status: 400 });
    }
    
    // Generate unique ID
    const id = `${newProductData.category.toLowerCase().replace(/\s+/g, '-')}-${newProductData.subcategory.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Create new product object
    const newProduct: Product = {
      id,
      name: newProductData.name.trim(),
      category: newProductData.category.trim(),
      subcategory: newProductData.subcategory.trim(),
      price: newProductData.price || 0,
      description: newProductData.description || '',
      image: newProductData.image || '',
      images: newProductData.images || [],
      wattage: newProductData.wattage || '',
      material: newProductData.material || '',
      dimensions: newProductData.dimensions || '',
      inStock: newProductData.inStock !== undefined ? newProductData.inStock : true,
      featured: newProductData.featured || false,
      seasonal: newProductData.seasonal || false,
      isOnSale: newProductData.isOnSale || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Read existing products
    const products = readProducts();
    
    // Add new product
    products.push(newProduct);
    
    // Write back to file
    const success = writeProducts(products);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to save product' 
      }, { status: 500 });
    }
    
    console.log('API: Product added successfully:', newProduct);
    return NextResponse.json(newProduct, { status: 201 });
    
  } catch (error) {
    console.error('API: Error adding product:', error);
    return NextResponse.json({ 
      error: 'Failed to add product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update a product
export async function PUT(request: NextRequest) {
  try {
    console.log('API: Updating product in local JSON file');
    const updateData = await request.json();
    console.log('API: Received update data:', updateData);
    
    if (!updateData.id) {
      return NextResponse.json({ 
        error: 'Product ID is required' 
      }, { status: 400 });
    }
    
    // Read existing products
    const products = readProducts();
    
    // Find product index
    const productIndex = products.findIndex(p => p.id === updateData.id);
    
    if (productIndex === -1) {
      return NextResponse.json({ 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    // Update product
    products[productIndex] = {
      ...products[productIndex],
      ...updateData,
      id: updateData.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    // Write back to file
    const success = writeProducts(products);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to update product' 
      }, { status: 500 });
    }
    
    console.log('API: Product updated successfully:', products[productIndex]);
    return NextResponse.json(products[productIndex]);
    
  } catch (error) {
    console.error('API: Error updating product:', error);
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        error: 'Product ID is required' 
      }, { status: 400 });
    }
    
    console.log('API: Deleting product:', id);
    
    // Read existing products
    const products = readProducts();
    
    // Find product index
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return NextResponse.json({ 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    // Remove product
    products.splice(productIndex, 1);
    
    // Write back to file
    const success = writeProducts(products);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to delete product' 
      }, { status: 500 });
    }
    
    console.log('API: Product deleted successfully:', id);
    return NextResponse.json({ message: 'Product deleted successfully' });
    
  } catch (error) {
    console.error('API: Error deleting product:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
