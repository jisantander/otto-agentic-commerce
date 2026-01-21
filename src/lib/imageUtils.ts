/**
 * Compress an image to reduce file size for API calls
 * Vercel serverless functions have a 4.5MB body limit
 */
export async function compressImage(
  dataUrl: string,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Use better image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with compression
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Log compression results
      const originalSize = Math.round(dataUrl.length / 1024);
      const compressedSize = Math.round(compressedDataUrl.length / 1024);
      console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB (${Math.round((1 - compressedSize/originalSize) * 100)}% reduction)`);
      
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = dataUrl;
  });
}

/**
 * Check if an image needs compression based on size
 */
export function needsCompression(dataUrl: string, maxSizeKB: number = 500): boolean {
  const sizeKB = Math.round(dataUrl.length / 1024);
  return sizeKB > maxSizeKB;
}

/**
 * Get the size of a data URL in KB
 */
export function getDataUrlSizeKB(dataUrl: string): number {
  return Math.round(dataUrl.length / 1024);
}
