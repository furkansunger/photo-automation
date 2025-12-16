/**
 * Upload Component
 * Modern drag-and-drop zone for image uploads
 */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, Image as ImageIcon, Sparkles } from 'lucide-react';
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
        'relative overflow-hidden border-2 border-dashed border-gray-200 cursor-pointer transition-all duration-300',
        'hover:border-primary/60 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5',
        isDragActive && 'border-primary bg-primary/10 shadow-xl shadow-primary/10 scale-[1.01]'
      )}
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      <div className="relative flex flex-col items-center justify-center p-16 text-center">
        <input {...getInputProps()} />
        
        {/* Icon */}
        <div className={cn(
          "mb-6 rounded-2xl p-6 transition-all duration-300",
          isDragActive 
            ? "bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/30" 
            : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-primary/10 hover:to-primary/5"
        )}>
          {isDragActive ? (
            <div className="relative">
              <ImageIcon className="h-10 w-10 text-white animate-bounce" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-white animate-pulse" />
            </div>
          ) : (
            <UploadIcon className="h-10 w-10 text-gray-600" />
          )}
        </div>

        {/* Text */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isDragActive ? 'Dosyaları bırakın' : 'Görselleri sürükleyip bırakın'}
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          veya <span className="text-primary font-medium">buraya tıklayarak</span> seçin
        </p>

        {/* Format Badges */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {['JPG', 'PNG', 'WEBP'].map((format) => (
            <span 
              key={format}
              className="px-4 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-medium shadow-sm"
            >
              {format}
            </span>
          ))}
        </div>

        {/* Additional Info */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Birden fazla dosya yükleyebilirsiniz</span>
        </div>
      </div>
    </Card>
  );
}
