import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export { cloudinary };

// Helper function to get optimized image URL
export function getCloudinaryImageUrl(publicId: string, options: any = {}) {
  const defaultOptions = {
    fetch_format: 'auto',
    quality: 'auto',
    crop: 'fill',
    gravity: 'auto',
    width: 400,
    height: 400,
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
}

// Helper function to upload image with metadata
export async function uploadImageWithMetadata(
  imagePath: string, 
  publicId: string, 
  metadata: any = {}
) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      public_id: publicId,
      folder: 'lighting-products',
      context: metadata,
      resource_type: 'auto'
    });
    
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}
