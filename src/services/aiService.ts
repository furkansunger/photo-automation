/**
 * AI Background Removal Service
 * Uses @imgly/background-removal
 * Implements Singleton pattern for model caching
 */

import * as backgroundRemoval from '@imgly/background-removal';

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
   * Initialize the model
   * This is now handled automatically by the library
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
   * Returns a Blob with transparent background (PNG)
   */
  public async removeBackground(imageFile: File): Promise<Blob> {
    try {
      console.log('[AIService] Processing image:', imageFile.name);
      
      // Process the image - library handles everything
      const blob = await backgroundRemoval.removeBackground(imageFile, {
        progress: (key: string, current: number, total: number) => {
          const percentage = Math.round((current / total) * 100);
          console.log(`[AIService] ${key}: ${percentage}%`);
        },
      });

      console.log('[AIService] Background removed successfully');
      return blob;
    } catch (error) {
      console.error('[AIService] Error removing background:', error);
      throw new Error('Arka plan kaldırma işlemi başarısız oldu');
    }
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
