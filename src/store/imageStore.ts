/**
 * Global Image Store using Zustand
 * Manages the queue of images being processed
 */

import { create } from 'zustand';
import type { ImageObject, ResizeMode } from '../types/image';
import { aiService } from '../services/aiService';
import { imageProcessor } from '../services/imageProcessor';

interface ImageStore {
  images: ImageObject[];
  isModelLoading: boolean;
  modelLoadError: string | null;
  globalWatermark: { file: File; scale: number } | null;

  // Actions
  initializeModel: () => Promise<void>;
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  updateImageDimensions: (
    id: string,
    width: number,
    height: number,
    resizeMode?: ResizeMode,
    maintainAspectRatio?: boolean
  ) => void;
  updateImageName: (id: string, newName: string) => void;
  updateImageWatermark: (id: string, watermark: { file: File; scale: number } | null) => void;
  setGlobalWatermark: (watermark: { file: File; scale: number } | null) => void;
  updateBulkDimensions: (
    width: number,
    height: number,
    resizeMode?: ResizeMode,
    maintainAspectRatio?: boolean
  ) => void;
  applyWatermarkToAll: () => void;
  processImage: (id: string) => Promise<void>;
  reprocessImage: (id: string) => Promise<void>;
  clearAll: () => void;
}

export const useImageStore = create<ImageStore>((set, get) => ({
  images: [],
  isModelLoading: false,
  modelLoadError: null,
  globalWatermark: null,

  // Initialize AI model on app start
  initializeModel: async () => {
    set({ isModelLoading: true, modelLoadError: null });
    try {
      await aiService.loadModel();
      set({ isModelLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Model yüklenemedi';
      set({ isModelLoading: false, modelLoadError: errorMessage });
    }
  },

  // Add new images to the queue
  addImages: (files: File[]) => {
    const newImages: ImageObject[] = files.map((file) => {
      // Generate initial filename without extension
      const originalName = file.name.replace(/\.[^/.]+$/, '');
      
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalFile: file,
        processedBlob: null,
        imglyBlob: null,
        photoroomBlob: null,
        status: 'idle',
        dimensions: { width: 0, height: 0 }, // Will be set during processing
        newName: originalName,
      };
    });

    set((state) => ({
      images: [...state.images, ...newImages],
    }));

    // Initialize model on first image upload (lazy loading)
    const { images } = get();
    if (images.length === newImages.length && !aiService.isModelLoaded() && !aiService.isModelLoading()) {
      // This is the first upload, initialize model
      get().initializeModel().then(() => {
        // After model loads, start processing
        newImages.forEach((img) => {
          get().processImage(img.id);
        });
      }).catch((error) => {
        console.error('[Store] Model initialization failed:', error);
        // Mark images as error
        set((state) => ({
          images: state.images.map((img) =>
            newImages.find(ni => ni.id === img.id)
              ? { ...img, status: 'error' as const, errorMessage: 'Model yüklenemedi' }
              : img
          ),
        }));
      });
    } else if (aiService.isModelLoaded()) {
      // Model already loaded, start processing immediately
      newImages.forEach((img) => {
        get().processImage(img.id);
      });
    }
    // If model is loading, images will be processed once model loads
  },

  // Remove an image from the queue
  removeImage: (id: string) => {
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    }));
  },

  // Update dimensions for a specific image
  // NOTE: This ONLY updates the dimension settings, does NOT trigger reprocessing
  // Resize will be applied during download/export
  updateImageDimensions: (
    id: string,
    width: number,
    height: number,
    resizeMode?: ResizeMode,
    maintainAspectRatio?: boolean
  ) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? {
              ...img,
              dimensions: { width, height },
              resizeMode: resizeMode ?? img.resizeMode ?? 'fit',
              maintainAspectRatio: maintainAspectRatio ?? img.maintainAspectRatio ?? true,
            }
          : img
      ),
    }));

    // NO reprocessing - dimensions are applied only on export
    console.log(`[Store] Dimensions updated for image ${id}: ${width}x${height} (${resizeMode || 'fit'})`);
  },

  // Update filename for a specific image
  updateImageName: (id: string, newName: string) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, newName } : img
      ),
    }));
  },

  // Update watermark for a specific image
  updateImageWatermark: (id: string, watermark: { file: File; scale: number } | null) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, watermark: watermark || undefined } : img
      ),
    }));

    // Trigger reprocessing with new watermark
    get().reprocessImage(id);
  },

  // Set global watermark (to be applied to all)
  setGlobalWatermark: (watermark: { file: File; scale: number } | null) => {
    set({ globalWatermark: watermark });
  },

  // Apply watermark to all images
  applyWatermarkToAll: () => {
    const { globalWatermark } = get();
    if (!globalWatermark) return;

    set((state) => ({
      images: state.images.map((img) => ({
        ...img,
        watermark: globalWatermark,
      })),
    }));

    // Reprocess all images with new watermark
    const { images } = get();
    images.forEach((img) => {
      get().reprocessImage(img.id);
    });
  },

  // Update dimensions for all images
  // NOTE: This ONLY updates dimension settings, does NOT trigger reprocessing
  // Resize will be applied during download/export
  updateBulkDimensions: (
    width: number,
    height: number,
    resizeMode?: ResizeMode,
    maintainAspectRatio?: boolean
  ) => {
    set((state) => ({
      images: state.images.map((img) => ({
        ...img,
        dimensions: { width, height },
        resizeMode: resizeMode ?? img.resizeMode ?? 'fit',
        maintainAspectRatio: maintainAspectRatio ?? img.maintainAspectRatio ?? true,
      })),
    }));

    // NO reprocessing - dimensions are applied only on export
    console.log(`[Store] Bulk dimensions updated: ${width}x${height} (${resizeMode || 'fit'})`);
  },

  // Process a single image - DUAL PROCESSING MODE
  // Runs both imgly and Photoroom in parallel for comparison
  processImage: async (id: string) => {
    const image = get().images.find((img) => img.id === id);
    if (!image) return;

    // Update status to processing
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, status: 'processing' as const, imglyProgress: 0, photoroomProgress: 0 } : img
      ),
    }));

    try {
      // Step 1: Get original dimensions
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, processingStage: 'removing-bg' as const, imglyProgress: 5, photoroomProgress: 5 } : img
        ),
      }));

      const dimensions = await imageProcessor.getImageDimensions(image.originalFile);
      
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, dimensions, imglyProgress: 10, photoroomProgress: 10 } : img
        ),
      }));

      // Step 2: DUAL PROCESSING - Remove background using both providers
      console.log(`[Store] Starting dual processing for image ${id}`);
      
      const dualResult = await aiService.removeBackgroundDual(
        image.originalFile,
        // imgly progress callback
        (progress) => {
          set((state) => ({
            images: state.images.map((img) =>
              img.id === id ? { ...img, imglyProgress: 10 + Math.round(progress * 0.4) } : img
            ),
          }));
        },
        // Photoroom progress callback
        (progress) => {
          set((state) => ({
            images: state.images.map((img) =>
              img.id === id ? { ...img, photoroomProgress: 10 + Math.round(progress * 0.4) } : img
            ),
          }));
        }
      );

      console.log(`[Store] Background removal complete:`, {
        imgly: !!dualResult.imglyBlob,
        photoroom: !!dualResult.photoroomBlob,
      });

      // Step 3: Add white background to both results
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { 
            ...img, 
            processingStage: 'applying-bg' as const,
            imglyProgress: 50, 
            photoroomProgress: 50 
          } : img
        ),
      }));

      let imglyWithBg: Blob | null = null;
      let photoroomWithBg: Blob | null = null;

      if (dualResult.imglyBlob) {
        imglyWithBg = await imageProcessor.applyWhiteBackground(dualResult.imglyBlob);
      }
      if (dualResult.photoroomBlob) {
        photoroomWithBg = await imageProcessor.applyWhiteBackground(dualResult.photoroomBlob);
      }

      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { 
            ...img, 
            imglyProgress: 70, 
            photoroomProgress: 70 
          } : img
        ),
      }));

      // Step 4: Store ORIGINAL SIZE results (no resize yet)
      // Resize will be applied on-demand during download/export
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { 
            ...img, 
            processingStage: 'finalizing' as const,
            imglyBlob: imglyWithBg,
            photoroomBlob: photoroomWithBg,
            imglyProgress: 90, 
            photoroomProgress: 90 
          } : img
        ),
      }));

      console.log(`[Store] Dual processing complete (stored at original size):`, {
        imgly: !!imglyWithBg,
        photoroom: !!photoroomWithBg,
      });

      // Mark as done
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id
            ? { 
                ...img, 
                status: 'done' as const, 
                imglyProgress: 100, 
                photoroomProgress: 100, 
                processingStage: undefined 
              }
            : img
        ),
      }));
    } catch (error) {
      console.error(`[Store] Error processing image ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'İşlem hatası';
      
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id
            ? { ...img, status: 'error' as const, errorMessage }
            : img
        ),
      }));
    }
  },

  // Reprocess an image with updated dimensions (skip background removal)
  // Reprocess an image with updated dimensions - DUAL PROCESSING MODE
  reprocessImage: async (id: string) => {
    const image = get().images.find((img) => img.id === id);
    if (!image) return;

    // Update status to processing
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, status: 'processing' as const, imglyProgress: 0, photoroomProgress: 0 } : img
      ),
    }));

    try {
      // Start background removal directly
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, processingStage: 'removing-bg' as const, imglyProgress: 10, photoroomProgress: 10 } : img
        ),
      }));

      // DUAL PROCESSING - Remove background using both providers
      const dualResult = await aiService.removeBackgroundDual(
        image.originalFile,
        (progress) => {
          set((state) => ({
            images: state.images.map((img) =>
              img.id === id ? { ...img, imglyProgress: 10 + Math.round(progress * 0.4) } : img
            ),
          }));
        },
        (progress) => {
          set((state) => ({
            images: state.images.map((img) =>
              img.id === id ? { ...img, photoroomProgress: 10 + Math.round(progress * 0.4) } : img
            ),
          }));
        }
      );

      // Add white background
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { 
            ...img, 
            processingStage: 'applying-bg' as const,
            imglyProgress: 50, 
            photoroomProgress: 50 
          } : img
        ),
      }));

      let imglyWithBg: Blob | null = null;
      let photoroomWithBg: Blob | null = null;

      if (dualResult.imglyBlob) {
        imglyWithBg = await imageProcessor.applyWhiteBackground(dualResult.imglyBlob);
      }
      if (dualResult.photoroomBlob) {
        photoroomWithBg = await imageProcessor.applyWhiteBackground(dualResult.photoroomBlob);
      }

      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { 
            ...img, 
            imglyProgress: 70, 
            photoroomProgress: 70 
          } : img
        ),
      }));

      // Store ORIGINAL SIZE results (no resize yet)
      // Resize will be applied on-demand during download/export
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id
            ? { 
                ...img, 
                processingStage: 'finalizing' as const,
                imglyBlob: imglyWithBg,
                photoroomBlob: photoroomWithBg,
                status: 'done' as const, 
                imglyProgress: 100, 
                photoroomProgress: 100, 
              }
            : img
        ),
      }));
    } catch (error) {
      console.error(`[Store] Error reprocessing image ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'İşlem hatası';
      
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id
            ? { ...img, status: 'error' as const, errorMessage }
            : img
        ),
      }));
    }
  },

  // Clear all images
  clearAll: () => {
    set({ images: [] });
  },
}));
