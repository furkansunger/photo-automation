/**
 * Upload Component
 * Modern drag-and-drop zone for image uploads
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
        'relative overflow-hidden border border-dashed border-gray-200 cursor-pointer transition-all duration-200',
        'hover:border-primary/50 hover:bg-primary/5',
        isDragActive && 'border-primary bg-primary/10 scale-[1.01]'
      )}
    >
      <div className="relative flex flex-col items-center justify-center p-6 text-center">
        <input {...getInputProps()} />
        
        {/* Icon - Compact */}
        <div className={cn(
          "mb-3 rounded-lg p-3 transition-all duration-200",
          isDragActive 
            ? "bg-gradient-to-br from-primary to-primary/80" 
            : "bg-gray-50 hover:bg-primary/5"
        )}>
          {isDragActive ? (
            <ImageIcon className="h-6 w-6 text-white" />
          ) : (
            <UploadIcon className="h-6 w-6 text-gray-600" />
          )}
        </div>

        {/* Text - Compact */}
        <p className="text-xs font-medium text-gray-900 mb-1">
          {isDragActive ? 'Bırakın' : 'Sürükle veya tıkla'}
        </p>
        
        {/* Format Badges - Minimal */}
        <div className="flex gap-1">
          {['JPG', 'PNG', 'WEBP'].map((format) => (
            <span 
              key={format}
              className="px-2 py-0.5 rounded text-gray-500 text-xs"
            >
              {format}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
