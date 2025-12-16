/**
 * AI Background Removal Service
 * Uses Photoroom API (with imgly as hidden fallback)
 * Implements Singleton pattern for model caching
 */

import * as backgroundRemoval from '@imgly/background-removal';
import { photoroomService } from './photoroomService';

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
   * Initialize the model (for imgly fallback)
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
   * Remove background from an image
   * Uses Photoroom API with imgly as fallback
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
