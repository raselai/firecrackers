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

// Sample product data (you'll replace this with your actual product data)
const sampleProducts = [
  {
    id: '0N85np77sKwk9HHTmnbw',
    name: '220V SMD STRIP LIGHT',
    category: 'Others',
    price: 0,
    description: '',
    image: 'https://firebasestorage.googleapis.com/v0/b/nazmul-hoque.firebasestorage.app/o/products%2FOthers%2FUnique%20Designs%2F1758359984733_0_49fce20c-a739-4b0f-987a-a182deb4dec0.jpeg?alt=media&token=d20b1aa1-4087-4724-a8fd-75dce4ff62d2'
  }
  // Add more products here
];

async function migrateProductImages() {
  console.log('🚀 Starting migration to Cloudinary...');
  
  const migratedProducts = [];
  
  for (const product of sampleProducts) {
    try {
      console.log(`📸 Migrating: ${product.name}`);
      
      // Upload image from Firebase URL to Cloudinary
      const result = await cloudinary.uploader.upload(product.image, {
        public_id: `products/${product.id}`,
        folder: 'lighting-products',
        context: {
          product_name: product.name,
          category: product.category,
          price: product.price.toString(),
          description: product.description || ''
        },
        resource_type: 'auto',
        overwrite: true
      });
      
      // Create new product object with Cloudinary URL
      const migratedProduct = {
        ...product,
        image: result.secure_url,
        cloudinary_public_id: result.public_id
      };
      
      migratedProducts.push(migratedProduct);
      
      console.log(`✅ Migrated: ${product.name}`);
      console.log(`   New URL: ${result.secure_url}`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to migrate ${product.name}:`, error.message);
      
      // Add fallback for failed migrations
      const fallbackProduct = {
        ...product,
        image: '/images/categories/ceiling-lights.jpg', // Fallback image
        migration_failed: true
      };
      
      migratedProducts.push(fallbackProduct);
    }
  }
  
  // Save migrated products to file
  fs.writeFileSync(
    'migrated-products.json', 
    JSON.stringify(migratedProducts, null, 2)
  );
  
  console.log(`\n🎉 Migration completed!`);
  console.log(`📊 Successfully migrated: ${migratedProducts.filter(p => !p.migration_failed).length} products`);
  console.log(`❌ Failed migrations: ${migratedProducts.filter(p => p.migration_failed).length} products`);
  console.log(`📄 Results saved to: migrated-products.json`);
}

// Run migration
migrateProductImages().catch(console.error);
