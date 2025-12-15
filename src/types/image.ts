/**
 * Image Object Type Definition
 * Represents an image in the processing queue
 */
export interface ImageObject {
  id: string;
  originalFile: File;
  processedBlob: Blob | null;
  status: 'idle' | 'processing' | 'done' | 'error';
  dimensions: {
    width: number;
    height: number;
  };
  newName: string;
  errorMessage?: string;
  watermark?: {
    file: File;
    scale: number;
  };
  processingStage?: 'removing-bg' | 'applying-bg' | 'resizing' | 'adding-watermark';
  progress?: number; // 0-100
}

/**
 * Processing Progress Event
 */
export interface ProcessingProgress {
  imageId: string;
  progress: number; // 0-100
  stage: 'loading-model' | 'removing-background' | 'applying-background' | 'resizing' | 'complete';
}
