/**
 * Image Processor Service
 * Handles canvas operations for:
 * 1. White background injection (replacing transparency)
 * 2. Image resizing
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

class ImageProcessor {
  /**
   * Apply white background to a transparent image
   * @param imageBlob - Transparent PNG blob from AI service
   * @returns Blob with white background
   */
  public async applyWhiteBackground(imageBlob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);

      img.onload = () => {
        try {
          // Create canvas with image dimensions
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Canvas context oluşturulamadı');
          }

          // Fill with white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the transparent image on top
          ctx.drawImage(img, 0, 0);

          // Convert to Blob (JPEG is more efficient for non-transparent images)
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              if (blob) {
                console.log('[ImageProcessor] White background applied');
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob dönüşümü başarısız'));
              }
            },
            'image/jpeg',
            0.95 // High quality
          );
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Görüntü yüklenemedi'));
      };

      img.src = url;
    });
  }

  /**
   * Resize an image to specified dimensions
   * @param imageBlob - Image blob to resize
   * @param dimensions - Target width and height
   * @returns Resized image blob
   */
  public async resizeImage(
    imageBlob: Blob,
    dimensions: ImageDimensions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);

      img.onload = () => {
        try {
          // Create canvas with target dimensions
          const canvas = document.createElement('canvas');
          canvas.width = dimensions.width;
          canvas.height = dimensions.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Canvas context oluşturulamadı');
          }

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw resized image
          ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

          // Convert to Blob
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              if (blob) {
                console.log(
                  `[ImageProcessor] Image resized to ${dimensions.width}x${dimensions.height}`
                );
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob dönüşümü başarısız'));
              }
            },
            'image/jpeg',
            0.95
          );
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Görüntü yüklenemedi'));
      };

      img.src = url;
    });
  }

  /**
   * Get original dimensions of an image file
   * @param file - Image file
   * @returns Width and height
   */
  public async getImageDimensions(file: File): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Görüntü boyutları alınamadı'));
      };

      img.src = url;
    });
  }

  /**
   * Add watermark to image (centered)
   * @param imageBlob - Image blob to add watermark to
   * @param watermarkFile - Watermark image file
   * @param scale - Scale of watermark relative to image (0-1)
   * @returns Image with watermark
   */
  public async addWatermark(
    imageBlob: Blob,
    watermarkFile: File,
    scale: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const watermark = new Image();
      const imageUrl = URL.createObjectURL(imageBlob);
      const watermarkUrl = URL.createObjectURL(watermarkFile);

      let imageLoaded = false;
      let watermarkLoaded = false;

      const tryComposite = () => {
        if (!imageLoaded || !watermarkLoaded) return;

        try {
          // Create canvas with image dimensions
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Canvas context oluşturulamadı');
          }

          // Draw main image
          ctx.drawImage(img, 0, 0);

          // Calculate watermark dimensions (maintain aspect ratio)
          const maxWatermarkWidth = img.width * scale;
          const maxWatermarkHeight = img.height * scale;
          
          let watermarkWidth = watermark.width;
          let watermarkHeight = watermark.height;
          
          // Scale down if needed
          if (watermarkWidth > maxWatermarkWidth || watermarkHeight > maxWatermarkHeight) {
            const scaleRatio = Math.min(
              maxWatermarkWidth / watermarkWidth,
              maxWatermarkHeight / watermarkHeight
            );
            watermarkWidth *= scaleRatio;
            watermarkHeight *= scaleRatio;
          }

          // Calculate center position
          const x = (img.width - watermarkWidth) / 2;
          const y = (img.height - watermarkHeight) / 2;

          // Draw watermark at center
          ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight);

          // Convert to Blob
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(imageUrl);
              URL.revokeObjectURL(watermarkUrl);
              if (blob) {
                console.log('[ImageProcessor] Watermark added');
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob dönüşümü başarısız'));
              }
            },
            'image/jpeg',
            0.95
          );
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          URL.revokeObjectURL(watermarkUrl);
          reject(error);
        }
      };

      img.onload = () => {
        imageLoaded = true;
        tryComposite();
      };

      watermark.onload = () => {
        watermarkLoaded = true;
        tryComposite();
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        URL.revokeObjectURL(watermarkUrl);
        reject(new Error('Ana görüntü yüklenemedi'));
      };

      watermark.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        URL.revokeObjectURL(watermarkUrl);
        reject(new Error('Filigran görüntüsü yüklenemedi'));
      };

      img.src = imageUrl;
      watermark.src = watermarkUrl;
    });
  }

  /**
   * Complete processing pipeline:
   * 1. Remove background (via AI service)
   * 2. Apply white background
   * 3. Resize (optional - if dimensions differ from original)
   * 4. Add watermark (optional)
   */
  public async processImage(
    transparentBlob: Blob,
    targetDimensions?: ImageDimensions,
    watermark?: { file: File; scale: number }
  ): Promise<Blob> {
    // Step 1: Apply white background
    let processedBlob = await this.applyWhiteBackground(transparentBlob);

    // Step 2: Resize if dimensions are provided
    if (targetDimensions) {
      processedBlob = await this.resizeImage(processedBlob, targetDimensions);
    }

    // Step 3: Add watermark if provided
    if (watermark) {
      processedBlob = await this.addWatermark(
        processedBlob,
        watermark.file,
        watermark.scale
      );
    }

    return processedBlob;
  }
}

// Export singleton instance
export const imageProcessor = new ImageProcessor();
