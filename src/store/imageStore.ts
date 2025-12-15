/**
 * Global Image Store using Zustand
 * Manages the queue of images being processed
 */

import { create } from 'zustand';
import type { ImageObject } from '../types/image';
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
  updateImageDimensions: (id: string, width: number, height: number) => void;
  updateImageName: (id: string, newName: string) => void;
  updateImageWatermark: (id: string, watermark: { file: File; scale: number } | null) => void;
  setGlobalWatermark: (watermark: { file: File; scale: number } | null) => void;
  updateBulkDimensions: (width: number, height: number) => void;
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
  updateImageDimensions: (id: string, width: number, height: number) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? { ...img, dimensions: { width, height } }
          : img
      ),
    }));

    // Trigger reprocessing with new dimensions
    get().reprocessImage(id);
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
  updateBulkDimensions: (width: number, height: number) => {
    set((state) => ({
      images: state.images.map((img) => ({
        ...img,
        dimensions: { width, height },
      })),
    }));

    // Reprocess all images with new dimensions
    const { images } = get();
    images.forEach((img) => {
      get().reprocessImage(img.id);
    });
  },

  // Process a single image (background removal + white background + resize)
  processImage: async (id: string) => {
    const image = get().images.find((img) => img.id === id);
    if (!image) return;

    // Update status to processing
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, status: 'processing' as const, progress: 0 } : img
      ),
    }));

    try {
      // Step 1: Get original dimensions
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, processingStage: 'removing-bg' as const, progress: 10 } : img
        ),
      }));

      const dimensions = await imageProcessor.getImageDimensions(image.originalFile);
      
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, dimensions, progress: 20 } : img
        ),
      }));

      // Step 2: Remove background using AI
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, processingStage: 'removing-bg' as const, progress: 30 } : img
        ),
      }));

      const transparentBlob = await aiService.removeBackground(image.originalFile);

      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, progress: 60 } : img
        ),
      }));

      // Step 3: Apply white background
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, processingStage: 'applying-bg' as const, progress: 70 } : img
        ),
      }));

      // Step 4: Resize and add watermark
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, processingStage: image.watermark ? 'adding-watermark' as const : 'resizing' as const, progress: 80 } : img
        ),
      }));

      const processedBlob = await imageProcessor.processImage(
        transparentBlob,
        dimensions,
        image.watermark
      );

      // Update with processed blob
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id
            ? { ...img, processedBlob, status: 'done' as const, progress: 100, processingStage: undefined }
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
  reprocessImage: async (id: string) => {
    const image = get().images.find((img) => img.id === id);
    if (!image || !image.processedBlob) return;

    // Update status to processing
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, status: 'processing' as const, progress: 0, processingStage: 'removing-bg' as const } : img
      ),
    }));

    try {
      // We need to re-remove background since we don't store the transparent version
      // For optimization, we could cache the transparent blob in the future
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, progress: 30 } : img
        ),
      }));

      const transparentBlob = await aiService.removeBackground(image.originalFile);

      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, progress: 60, processingStage: 'applying-bg' as const } : img
        ),
      }));

      // Apply white background, resize, and add watermark with new settings
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, progress: 80, processingStage: image.watermark ? 'adding-watermark' as const : 'resizing' as const } : img
        ),
      }));

      const processedBlob = await imageProcessor.processImage(
        transparentBlob,
        image.dimensions,
        image.watermark
      );

      // Update with new processed blob
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id
            ? { ...img, processedBlob, status: 'done' as const, progress: 100, processingStage: undefined }
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
