const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dbdybplj5',
  api_key: '518731444462476',
  api_secret: '08HGc9DFLew5MmI1K8kd5_pmLF4',
  secure: true
});

// Mock product data (replace this with actual API call)
const mockProducts = [
  {
    id: '0N85np77sKwk9HHTmnbw',
    name: '220V SMD STRIP LIGHT',
    category: 'Others',
    subcategory: 'Unique Designs',
    price: 0,
    description: '',
    image: 'https://firebasestorage.googleapis.com/v0/b/nazmul-hoque.firebasestorage.app/o/products%2FOthers%2FUnique%2F1758359984733_0_49fce20c-a739-4b0f-987a-a182deb4dec0.jpeg?alt=media&token=d20b1aa1-4087-4724-a8fd-75dce4ff62d2',
    images: ['https://firebasestorage.googleapis.com/v0/b/nazmul-hoque.firebasestorage.app/o/products%2FOthers%2FUnique%2F1758359984733_0_49fce20c-a739-4b0f-987a-a182deb4dec0.jpeg?alt=media&token=d20b1aa1-4087-4724-a8fd-75dce4ff62d2'],
    wattage: '',
    material: '',
    dimensions: '',
    inStock: true,
    featured: false,
    seasonal: false,
    isOnSale: false
  }
  // Add more products here as needed
];

async function fetchProductsFromAPI() {
  try {
    console.log('📡 Fetching products from API...');
    
    // In a real scenario, you would fetch from your API
    // const response = await fetch('http://localhost:3000/api/products');
    // const products = await response.json();
    
    // For now, using mock data
    console.log(`📦 Found ${mockProducts.length} products`);
    return mockProducts;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
}

async function migrateProductImages() {
  console.log('🚀 Starting product image migration to Cloudinary...');
  
  const products = await fetchProductsFromAPI();
  const migratedProducts = [];
  const failedMigrations = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n📸 [${i + 1}/${products.length}] Migrating: ${product.name}`);
    
    try {
      let migratedImageUrls = [];
      let cloudinaryPublicIds = [];
      
      // Migrate main image
      if (product.image && product.image.includes('firebasestorage')) {
        console.log('   📷 Migrating main image...');
        const mainImageResult = await migrateSingleImage(
          product.image, 
          `products/${product.id}/main`,
          {
            product_name: product.name,
            category: product.category,
            subcategory: product.subcategory,
            price: product.price.toString(),
            description: product.description || '',
            image_type: 'main'
          }
        );
        
        if (mainImageResult) {
          migratedImageUrls.push(mainImageResult.secure_url);
          cloudinaryPublicIds.push(mainImageResult.public_id);
        }
      }
      
      // Migrate gallery images
      if (product.images && Array.isArray(product.images)) {
        console.log(`   🖼️  Migrating ${product.images.length} gallery images...`);
        
        for (let j = 0; j < product.images.length; j++) {
          const imageUrl = product.images[j];
          if (imageUrl && imageUrl.includes('firebasestorage')) {
            const galleryResult = await migrateSingleImage(
              imageUrl,
              `products/${product.id}/gallery-${j + 1}`,
              {
                product_name: product.name,
                category: product.category,
                subcategory: product.subcategory,
                price: product.price.toString(),
                description: product.description || '',
                image_type: 'gallery',
                image_index: j.toString()
              }
            );
            
            if (galleryResult) {
              migratedImageUrls.push(galleryResult.secure_url);
              cloudinaryPublicIds.push(galleryResult.public_id);
            }
          }
        }
      }
      
      // Create migrated product object
      const migratedProduct = {
        ...product,
        image: migratedImageUrls[0] || null, // Main image
        images: migratedImageUrls, // All images
        cloudinary_public_ids: cloudinaryPublicIds,
        migration_status: 'success',
        migrated_at: new Date().toISOString()
      };
      
      migratedProducts.push(migratedProduct);
      console.log(`   ✅ Successfully migrated ${migratedImageUrls.length} images`);
      console.log(`   🔗 Main image: ${migratedProduct.image}`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ Failed to migrate ${product.name}:`, error.message);
      
      // Add fallback for failed migrations
      const fallbackProduct = {
        ...product,
        image: '/images/categories/ceiling-lights.jpg', // Fallback image
        images: ['/images/categories/ceiling-lights.jpg'],
        migration_status: 'failed',
        migration_error: error.message,
        migrated_at: new Date().toISOString()
      };
      
      failedMigrations.push(fallbackProduct);
      migratedProducts.push(fallbackProduct);
    }
  }
  
  // Save results
  const results = {
    total_products: products.length,
    successful_migrations: migratedProducts.filter(p => p.migration_status === 'success').length,
    failed_migrations: failedMigrations.length,
    migrated_products: migratedProducts,
    migration_date: new Date().toISOString()
  };
  
  fs.writeFileSync(
    'migration-results.json', 
    JSON.stringify(results, null, 2)
  );
  
  console.log(`\n🎉 Migration completed!`);
  console.log(`📊 Total products: ${results.total_products}`);
  console.log(`✅ Successful migrations: ${results.successful_migrations}`);
  console.log(`❌ Failed migrations: ${results.failed_migrations}`);
  console.log(`📄 Results saved to: migration-results.json`);
  
  return results;
}

async function migrateSingleImage(imageUrl, publicId, context = {}) {
  try {
    // Skip if not a Firebase Storage URL
    if (!imageUrl || !imageUrl.includes('firebasestorage')) {
      console.log(`   ⏭️  Skipping non-Firebase URL: ${imageUrl}`);
      return null;
    }
    
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: 'lighting-products',
      context: context,
      resource_type: 'auto',
      overwrite: true,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    return result;
  } catch (error) {
    console.error(`   ❌ Failed to upload ${publicId}:`, error.message);
    return null;
  }
}

// Run migration
migrateProductImages().catch(console.error);
