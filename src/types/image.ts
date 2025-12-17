/**
 * Image Object Type Definition
 * Represents an image in the processing queue with dual provider results
 */

export type ResizeMode = 'fit' | 'fill' | 'stretch';

export interface ImageObject {
  id: string;
  originalFile: File;
  processedBlob: Blob | null; // Legacy - will be deprecated
  // Dual provider results
  imglyBlob: Blob | null;
  photoroomBlob: Blob | null;
  status: 'idle' | 'processing' | 'done' | 'error';
  dimensions: {
    width: number;
    height: number;
  };
  resizeMode?: ResizeMode; // How to handle aspect ratio
  maintainAspectRatio?: boolean; // Lock aspect ratio toggle
  newName: string;
  errorMessage?: string;
  watermark?: {
    file: File;
    scale: number;
  };
  processingStage?: 'removing-bg' | 'applying-bg' | 'resizing' | 'adding-watermark' | 'finalizing';
  progress?: number; // 0-100
  // Provider-specific progress
  imglyProgress?: number;
  photoroomProgress?: number;
}

/**
 * Processing Progress Event
 */
export interface ProcessingProgress {
  imageId: string;
  progress: number; // 0-100
  stage: 'loading-model' | 'removing-background' | 'applying-background' | 'resizing' | 'complete';
}
