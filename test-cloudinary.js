const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dbdybplj5',
  api_key: '518731444462476',
  api_secret: '08HGc9DFLew5MmI1K8kd5_pmLF4',
  secure: true
});

async function testCloudinary() {
  try {
    console.log('🧪 Testing Cloudinary connection...');
    
    // Test 1: Upload a sample image from URL (using a working demo image)
    const result = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
      {
        public_id: 'test-product-migration',
        folder: 'lighting-products',
        context: {
          product_name: 'Test Product',
          category: 'Others',
          price: '150'
        }
      }
    );
    
    console.log('✅ Successfully uploaded to Cloudinary!');
    console.log('📸 Image URL:', result.secure_url);
    console.log('🆔 Public ID:', result.public_id);
    
    // Test 2: Generate optimized URL
    const optimizedUrl = cloudinary.url(result.public_id, {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    });
    
    console.log('⚡ Optimized URL:', optimizedUrl);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCloudinary();
