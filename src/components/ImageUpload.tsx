'use client';

import { useState, useRef, useEffect } from 'react';
import { generateProductImagePath, uploadImage, uploadImageWithProgress } from '@/lib/storage';

interface ImageUploadProps {
  category: string;
  subcategory: string;
  onImagesUploaded: (imageUrls: string[]) => void;
  existingImages?: string[];
}

type MediaKind = 'image' | 'video' | 'file';

interface ImageItem {
  url: string;
  fileName: string;
  kind: MediaKind;
  isUploading: boolean;
  isUploaded: boolean;
  uploadProgress?: number;
  uploadError?: string;
}

const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'mpeg', 'mpg'];

const getFileKind = (fileName: string, mimeType?: string): MediaKind => {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'video';

  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  if (imageExtensions.includes(extension)) return 'image';
  if (videoExtensions.includes(extension)) return 'video';
  return 'file';
};

export default function ImageUpload({ category, subcategory, onImagesUploaded, existingImages = [] }: ImageUploadProps) {
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update imageItems when existingImages change (for editing products)
  useEffect(() => {
    if (existingImages.length > 0) {
      // Existing images are already uploaded, so mark them as uploaded
      const existingItems: ImageItem[] = existingImages.map(url => ({
        url,
        fileName: url.split('/').pop() || 'media',
        kind: getFileKind(url),
        isUploading: false,
        isUploaded: true
      }));
      setImageItems(existingItems);
    }
  }, [existingImages]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array and process
    const filesArray = Array.from(files);
    processFiles(filesArray);
  };

  const removeImage = (index: number) => {
    const item = imageItems[index];
    // Revoke object URL if it's a local preview
    if (item && item.url.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }
    
    const newItems = imageItems.filter((_, i) => i !== index);
    setImageItems(newItems);
    
    // Update parent with only uploaded URLs (not blob URLs)
    const uploadedUrls = newItems.filter(item => item.isUploaded && !item.url.startsWith('blob:')).map(item => item.url);
    onImagesUploaded(uploadedUrls);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    if (!category || !subcategory) {
      setIsUploading(false);
      setUploadProgress(0);
      alert('Please select a category and subcategory before uploading.');
      return;
    }

    const currentLength = imageItems.length;
    
    // Step 1: Create immediate previews with object URLs
    const previewItems: ImageItem[] = files.map(file => {
      // Create object URL for immediate preview
      const objectURL = URL.createObjectURL(file);
      return {
        url: objectURL,
        fileName: file.name,
        kind: getFileKind(file.name, file.type),
        isUploading: true,
        isUploaded: false,
        uploadProgress: 0
      };
    });

    // Add preview items to the list immediately
    setImageItems(prev => [...prev, ...previewItems]);

    // Step 2: Upload files and replace preview URLs with Firebase URLs
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewIndex = currentLength + i;
      
      try {
        const fileName = `${Date.now()}_${i}_${file.name}`;
        const path = generateProductImagePath(category, subcategory, fileName);
        const kind = getFileKind(file.name, file.type);
        const firebaseURL = kind === 'video'
          ? await uploadImageWithProgress(file, path, (progress) => {
              setImageItems(prev => {
                const updated = [...prev];
                if (updated[previewIndex]) {
                  updated[previewIndex] = {
                    ...updated[previewIndex],
                    uploadProgress: progress
                  };
                }
                return updated;
              });
            })
          : await uploadImage(file, path);

        // Replace preview URL with Firebase URL
        setImageItems(prev => {
          const updated = [...prev];
          const item = updated[previewIndex];
          if (item) {
            // Revoke the object URL to free memory
            if (item.url.startsWith('blob:')) {
              URL.revokeObjectURL(item.url);
            }
            updated[previewIndex] = {
              ...item,
              url: firebaseURL,
              isUploading: false,
              isUploaded: true,
              uploadProgress: 100
            };

            // Immediately update parent with all uploaded URLs
            const uploadedUrls = updated
              .filter(item => item.isUploaded && !item.url.startsWith('blob:'))
              .map(item => item.url);
            onImagesUploaded(uploadedUrls);
          }
          return updated;
        });

        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error('Upload error:', error);
        // Update error state
        setImageItems(prev => {
          const updated = [...prev];
          if (updated[previewIndex]) {
            updated[previewIndex] = {
              ...updated[previewIndex],
              isUploading: false,
              uploadError: 'Upload failed'
            };
          }
          return updated;
        });
        alert(`Failed to upload ${file.name}`);
      }
    }
    
    setIsUploading(false);
    setUploadProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Media *</h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Add Media'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Progress */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
      >
        <p className="text-gray-600">
          Drag and drop media here, or click "Add Media" to select files
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: images and videos - <strong>At least one file is required</strong>
        </p>
      </div>

      {/* Image Preview */}
      {imageItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imageItems.map((item, index) => (
            <div key={index} className="relative group border border-gray-200 rounded-lg overflow-hidden">
              {item.url && item.kind === 'image' ? (
                <img
                  src={item.url}
                  alt={item.fileName}
                  className="w-full h-32 object-cover"
                />
              ) : item.url && item.kind === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-32 object-cover"
                  controls
                  playsInline
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No preview</span>
                </div>
              )}
              
              {/* Upload Status Overlay */}
              {item.isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-sm font-semibold">
                    Uploading{typeof item.uploadProgress === 'number' ? ` ${item.uploadProgress}%` : '...'}
                  </div>
                </div>
              )}
              
              {item.uploadError && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center">
                  <div className="text-white text-xs text-center px-2">{item.uploadError}</div>
                </div>
              )}
              
              {item.isUploaded && !item.isUploading && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Uploaded
                </div>
              )}
              
              {/* File Name */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 truncate">
                {item.fileName}
              </div>
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove file"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
