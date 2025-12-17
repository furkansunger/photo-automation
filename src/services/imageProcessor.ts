/**
 * Image Processor Service
 * Handles canvas operations for:
 * 1. White background injection (replacing transparency)
 * 2. High-quality image resizing with aspect ratio control
 * 3. Watermark application
 */

import Pica from 'pica';
import type { ResizeMode } from '../types/image';

const pica = Pica();

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
   * Calculate target dimensions based on resize mode and aspect ratio
   */
  private calculateTargetDimensions(
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number,
    mode: ResizeMode = 'fit'
  ): { width: number; height: number; offsetX: number; offsetY: number } {
    const originalRatio = originalWidth / originalHeight;
    const targetRatio = targetWidth / targetHeight;

    let width = targetWidth;
    let height = targetHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (mode === 'stretch') {
      // Stretch mode - use target dimensions as is (may distort)
      return { width: targetWidth, height: targetHeight, offsetX: 0, offsetY: 0 };
    }

    if (mode === 'fit') {
      // Fit mode - scale to fit within target dimensions, maintain aspect ratio
      if (originalRatio > targetRatio) {
        // Image is wider - fit to width
        height = Math.round(targetWidth / originalRatio);
        offsetY = Math.round((targetHeight - height) / 2);
      } else {
        // Image is taller - fit to height
        width = Math.round(targetHeight * originalRatio);
        offsetX = Math.round((targetWidth - width) / 2);
      }
    } else if (mode === 'fill') {
      // Fill mode - scale to cover target dimensions, crop excess
      if (originalRatio > targetRatio) {
        // Image is wider - fit to height and crop sides
        width = Math.round(targetHeight * originalRatio);
        offsetX = Math.round((targetWidth - width) / 2);
      } else {
        // Image is taller - fit to width and crop top/bottom
        height = Math.round(targetWidth / originalRatio);
        offsetY = Math.round((targetHeight - height) / 2);
      }
    }

    return { width, height, offsetX, offsetY };
  }

  /**
   * HIGH-QUALITY RESIZE using Pica library (Lanczos3 algorithm)
   * Supports aspect ratio preservation and different resize modes
   * @param imageBlob - Image blob to resize
   * @param dimensions - Target width and height
   * @param mode - How to handle aspect ratio: 'fit', 'fill', or 'stretch'
   * @returns Resized image blob
   */
  public async resizeImage(
    imageBlob: Blob,
    dimensions: ImageDimensions,
    mode: ResizeMode = 'fit'
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);

      img.onload = async () => {
        try {
          const originalWidth = img.width;
          const originalHeight = img.height;

          // Calculate optimal dimensions based on mode
          const calc = this.calculateTargetDimensions(
            originalWidth,
            originalHeight,
            dimensions.width,
            dimensions.height,
            mode
          );

          // Create source canvas with original image
          const sourceCanvas = document.createElement('canvas');
          sourceCanvas.width = originalWidth;
          sourceCanvas.height = originalHeight;
          const sourceCtx = sourceCanvas.getContext('2d');

          if (!sourceCtx) {
            throw new Error('Source canvas context oluşturulamadı');
          }

          sourceCtx.drawImage(img, 0, 0);

          // Create target canvas
          const targetCanvas = document.createElement('canvas');
          targetCanvas.width = dimensions.width;
          targetCanvas.height = dimensions.height;
          const targetCtx = targetCanvas.getContext('2d');

          if (!targetCtx) {
            throw new Error('Target canvas context oluşturulamadı');
          }

          // Fill with white background first (for fit mode with letterboxing)
          if (mode === 'fit' && (calc.offsetX > 0 || calc.offsetY > 0)) {
            targetCtx.fillStyle = '#FFFFFF';
            targetCtx.fillRect(0, 0, dimensions.width, dimensions.height);
          }

          // Use pica for high-quality resize
          // First resize to calculated dimensions
          const resizedCanvas = document.createElement('canvas');
          resizedCanvas.width = calc.width;
          resizedCanvas.height = calc.height;

          await pica.resize(sourceCanvas, resizedCanvas, {
            quality: 3, // 0-3, 3 is highest (Lanczos3)
            unsharpAmount: 80, // Sharpening amount
            unsharpRadius: 0.6,
            unsharpThreshold: 2,
          });

          // Draw resized image onto target canvas with proper positioning
          if (mode === 'fill') {
            // For fill mode, we need to crop the center
            const sourceX = Math.abs(calc.offsetX);
            const sourceY = Math.abs(calc.offsetY);
            targetCtx.drawImage(
              resizedCanvas,
              sourceX, sourceY,
              dimensions.width, dimensions.height,
              0, 0,
              dimensions.width, dimensions.height
            );
          } else {
            // For fit and stretch modes, draw with offset
            targetCtx.drawImage(resizedCanvas, calc.offsetX, calc.offsetY);
          }

          // Convert to Blob
          targetCanvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
              if (blob) {
                console.log(
                  `[ImageProcessor] High-quality resize to ${dimensions.width}x${dimensions.height} (mode: ${mode})`
                );
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
