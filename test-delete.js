// Test the delete functionality
async function testDelete() {
  try {
    console.log('🧪 Testing delete functionality...');
    
    // First, get all products
    const getResponse = await fetch('http://localhost:3000/api/products-new');
    const products = await getResponse.json();
    
    console.log('📦 Current products:', products.map(p => ({ id: p.id, name: p.name })));
    
    if (products.length === 0) {
      console.log('❌ No products to delete');
      return;
    }
    
    // Try to delete the first product
    const productToDelete = products[0];
    console.log(`🗑️  Attempting to delete: ${productToDelete.name} (ID: ${productToDelete.id})`);
    
    const deleteResponse = await fetch(`http://localhost:3000/api/products-new?id=${productToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Delete response status:', deleteResponse.status);
    console.log('📡 Delete response ok:', deleteResponse.ok);
    
    const deleteResult = await deleteResponse.json();
    console.log('📡 Delete response data:', deleteResult);
    
    if (deleteResponse.ok) {
      console.log('✅ Delete successful!');
      
      // Verify the product was actually deleted
      const verifyResponse = await fetch('http://localhost:3000/api/products-new');
      const remainingProducts = await verifyResponse.json();
      
      console.log('🔍 Remaining products:', remainingProducts.map(p => ({ id: p.id, name: p.name })));
      
      if (remainingProducts.length === products.length - 1) {
        console.log('✅ Product successfully removed from list!');
      } else {
        console.log('❌ Product was not removed from list');
      }
    } else {
      console.log('❌ Delete failed:', deleteResult);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testDelete();
