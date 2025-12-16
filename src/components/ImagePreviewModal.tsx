/**
 * Image Preview Modal
 * Full-size image preview in a modal dialog
 */

import { X } from 'lucide-react';
import type { ImageObject } from '../types/image';
import { Button } from './ui/button';

interface ImagePreviewModalProps {
  image: ImageObject | null;
  onClose: () => void;
}

export function ImagePreviewModal({ image, onClose }: ImagePreviewModalProps) {
  if (!image) return null;

  const previewUrl = image.processedBlob
    ? URL.createObjectURL(image.processedBlob)
    : URL.createObjectURL(image.originalFile);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <h3 className="text-xl font-semibold">{image.newName}</h3>
            <p className="text-sm text-gray-300">
              {image.dimensions.width} x {image.dimensions.height} px
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center overflow-hidden rounded-lg">
          <img
            src={previewUrl}
            alt={image.newName}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-gray-400">
          ESC tuşuna basarak veya dışarı tıklayarak kapatabilirsiniz
        </div>
      </div>
    </div>
  );
}
