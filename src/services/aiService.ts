/**
 * AI Background Removal Service
 * Dual provider system - runs both imgly and Photoroom in parallel
 * Implements Singleton pattern for model caching
 */

import * as backgroundRemoval from '@imgly/background-removal';
import { photoroomService } from './photoroomService';

export interface DualProcessingResult {
  imglyBlob: Blob | null;
  photoroomBlob: Blob | null;
  imglyError?: string;
  photoroomError?: string;
}

class AIService {
  private static instance: AIService;
  private isInitialized = false;
  private isLoading = false;
  private loadingPromise: Promise<void> | null = null;

  // Singleton pattern
  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Check if Photoroom is available
   */
  public isPhotoroomAvailable(): boolean {
    return photoroomService.isReady();
  }

  /**
   * Initialize the model (for imgly)
   */
  public async loadModel(): Promise<void> {
    // If already initialized, return immediately
    if (this.isInitialized) {
      return;
    }

    // If currently loading, wait for the existing load
    if (this.isLoading && this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading
    this.isLoading = true;
    this.loadingPromise = (async () => {
      try {
        console.log('[AIService] Initializing background removal...');
        // The library will download models on first use
        this.isInitialized = true;
        console.log('[AIService] Ready to process images');
      } catch (error) {
        console.error('[AIService] Failed to initialize:', error);
        this.isInitialized = false;
        throw new Error('AI model yüklenemedi. Lütfen sayfayı yenileyin.');
      } finally {
        this.isLoading = false;
      }
    })();

    return this.loadingPromise;
  }

  /**
   * DUAL PROCESSING - Process image with both providers in parallel
   * Returns results from both imgly and Photoroom
   */
  public async removeBackgroundDual(
    imageFile: File,
    onImglyProgress?: (progress: number) => void,
    onPhotoroomProgress?: (progress: number) => void
  ): Promise<DualProcessingResult> {
    console.log('[AIService] Starting dual processing (imgly + Photoroom)');

    // Process both in parallel
    const [imglyResult, photoroomResult] = await Promise.allSettled([
      // imgly processing
      (async () => {
        try {
          console.log('[AIService] imgly: Starting local processing');
          const blob = await backgroundRemoval.removeBackground(imageFile, {
            progress: (key: string, current: number, total: number) => {
              const percentage = Math.round((current / total) * 100);
              onImglyProgress?.(percentage);
              console.log(`[AIService/imgly] ${key}: ${percentage}%`);
            },
          });
          console.log('[AIService] imgly: Success');
          return blob;
        } catch (error) {
          console.error('[AIService] imgly: Failed', error);
          throw error;
        }
      })(),
      
      // Photoroom processing
      (async () => {
        try {
          if (!photoroomService.isReady()) {
            throw new Error('Photoroom API not configured');
          }
          
          console.log('[AIService] Photoroom: Starting API processing');
          const result = await photoroomService.removeBackground(imageFile, {
            removeShadow: true,
            productMode: true,
            format: 'png',
            size: 'full',
            channels: 'rgba',
          });

          if (!result.success || !result.resultBlob) {
            throw new Error(result.error || 'Photoroom processing failed');
          }

          console.log('[AIService] Photoroom: Success');
          onPhotoroomProgress?.(100);
          return result.resultBlob;
        } catch (error) {
          console.error('[AIService] Photoroom: Failed', error);
          throw error;
        }
      })(),
    ]);

    // Prepare results
    const dualResult: DualProcessingResult = {
      imglyBlob: null,
      photoroomBlob: null,
    };

    if (imglyResult.status === 'fulfilled') {
      dualResult.imglyBlob = imglyResult.value;
    } else {
      dualResult.imglyError = imglyResult.reason?.message || 'imgly processing failed';
    }

    if (photoroomResult.status === 'fulfilled') {
      dualResult.photoroomBlob = photoroomResult.value;
    } else {
      dualResult.photoroomError = photoroomResult.reason?.message || 'Photoroom processing failed';
    }

    console.log('[AIService] Dual processing complete:', {
      imgly: !!dualResult.imglyBlob,
      photoroom: !!dualResult.photoroomBlob,
    });

    return dualResult;
  }

  /**
   * LEGACY - Remove background from an image
   * Uses Photoroom API with imgly as fallback
   * @deprecated Use removeBackgroundDual() for comparison feature
   */
  public async removeBackground(imageFile: File): Promise<Blob> {
    try {
      // Photoroom API kullan (öncelikli)
      if (photoroomService.isReady()) {
        console.log('[AIService] Using Photoroom API (high quality, shadow detection)');
        
        const result = await photoroomService.removeBackground(imageFile, {
          removeShadow: true, // Gölge tespiti aktif
          productMode: true, // Ürün modu aktif
          format: 'png',
          size: 'full',
          channels: 'rgba',
        });

        if (result.success && result.resultBlob) {
          console.log('[AIService] Photoroom success');
          return result.resultBlob;
        }

        // Photoroom başarısız, imgly'ye fallback
        console.warn('[AIService] Photoroom failed, falling back to imgly:', result.error);
      } else {
        console.warn('[AIService] Photoroom not configured, using imgly fallback');
      }

      // imgly ile işle (fallback)
      console.log('[AIService] Using imgly (local processing)');
      return await this.removeBackgroundWithImgly(imageFile);
      
    } catch (error) {
      console.error('[AIService] Error removing background:', error);
      
      // Son şans: imgly'yi dene
      console.log('[AIService] Attempting imgly fallback...');
      try {
        return await this.removeBackgroundWithImgly(imageFile);
      } catch (fallbackError) {
        console.error('[AIService] Fallback also failed:', fallbackError);
        throw new Error('Arka plan kaldırma işlemi başarısız oldu');
      }
    }
  }

  /**
   * Remove background using imgly (local processing)
   */
  private async removeBackgroundWithImgly(imageFile: File): Promise<Blob> {
    console.log('[AIService] Processing with imgly:', imageFile.name);
    
    const blob = await backgroundRemoval.removeBackground(imageFile, {
      progress: (key: string, current: number, total: number) => {
        const percentage = Math.round((current / total) * 100);
        console.log(`[AIService/imgly] ${key}: ${percentage}%`);
      },
    });

    console.log('[AIService] imgly background removed successfully');
    return blob;
  }

  /**
   * Check if model is loaded
   */
  public isModelLoaded(): boolean {
    return this.isInitialized;
  }

  /**
   * Get loading status
   */
  public isModelLoading(): boolean {
    return this.isLoading;
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
