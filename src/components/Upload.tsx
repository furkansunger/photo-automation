/**
 * Upload Component
 * Drag-and-drop zone for image uploads
 * Turkish UI
 */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, Image as ImageIcon } from 'lucide-react';
import { useImageStore } from '../store/imageStore';
import { Card } from './ui/card';
import { cn } from '../lib/utils';

const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export function Upload() {
  const addImages = useImageStore((state) => state.addImages);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        addImages(acceptedFiles);
      }
    },
    [addImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    multiple: true,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/50',
        isDragActive && 'border-primary bg-accent/50 scale-[1.02]'
      )}
    >
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <input {...getInputProps()} />
        
        <div className="mb-4 rounded-full bg-primary/10 p-6">
          {isDragActive ? (
            <ImageIcon className="h-12 w-12 text-primary animate-pulse" />
          ) : (
            <UploadIcon className="h-12 w-12 text-primary" />
          )}
        </div>

        <h3 className="text-xl font-semibold mb-2">
          {isDragActive ? 'Dosyaları bırakın' : 'Dosyaları buraya sürükleyin'}
        </h3>
        
        <p className="text-muted-foreground mb-4">
          veya seçmek için tıklayın
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
            JPG
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
            PNG
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
            WEBP
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Birden fazla dosya seçebilirsiniz
        </p>
      </div>
    </Card>
  );
}
