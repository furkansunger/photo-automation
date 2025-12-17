/**
 * Image Card Component
 * Modern grid item for displaying image preview and controls
 */

import { useState, useEffect } from 'react';
import { Download, Pencil, Trash2, Loader2, Check } from 'lucide-react';
import { useImageStore } from '../store/imageStore';
import type { ImageObject } from '../types/image';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface ImageCardProps {
  image: ImageObject;
  onPreviewClick: (image: ImageObject) => void;
}

export function ImageCard({ image, onPreviewClick }: ImageCardProps) {
  const { updateImageName, updateImageDimensions, removeImage, reprocessImage } = useImageStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(image.newName);
  const [dimensions, setDimensions] = useState({
    width: image.dimensions.width.toString(),
    height: image.dimensions.height.toString(),
  });

  const previewUrl = image.processedBlob
    ? URL.createObjectURL(image.processedBlob)
    : URL.createObjectURL(image.originalFile);

  // Sync dimensions when image changes (for bulk operations)
  useEffect(() => {
    setDimensions({
      width: image.dimensions.width.toString(),
      height: image.dimensions.height.toString(),
    });
  }, [image.dimensions]);

  const handleNameSave = () => {
    if (tempName.trim() && tempName !== image.newName) {
      updateImageName(image.id, tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleDimensionsChange = () => {
    const w = parseInt(dimensions.width);
    const h = parseInt(dimensions.height);
    if (
      !isNaN(w) &&
      !isNaN(h) &&
      w > 0 &&
      h > 0 &&
      (w !== image.dimensions.width || h !== image.dimensions.height)
    ) {
      updateImageDimensions(image.id, w, h);
      if (image.status === 'done') {
        reprocessImage(image.id);
      }
    }
  };

  const handleDownload = () => {
    if (!image.processedBlob) return;
    const url = URL.createObjectURL(image.processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${image.newName}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const statusBadge = () => {
    switch (image.status) {
      case 'processing':
        const progress = image.progress || 0;
        const stageText = {
          'removing-bg': 'Arka plan kaldırılıyor',
          'applying-bg': 'Beyaz arka plan ekleniyor',
          'resizing': 'Boyutlandırılıyor',
          'adding-watermark': 'Filigran ekleniyor',
          'finalizing': 'Tamamlanıyor',
        };
        const currentStage = image.processingStage 
          ? stageText[image.processingStage] 
          : stageText['removing-bg'];

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-xs font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary/80 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">{currentStage}</p>
          </div>
        );
      case 'done':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Check className="h-3 w-3 mr-1" />
            Hazır
          </Badge>
        );
      case 'error':
        return <Badge variant="destructive">Hata</Badge>;
      default:
        return <Badge variant="secondary">Bekliyor</Badge>;
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-gray-200">
      <CardContent className="p-0">
        {/* Preview */}
        <div
          className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer relative"
          onClick={() => onPreviewClick(image)}
        >
          {image.status === 'processing' ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="text-xs font-medium text-gray-600">İşleniyor...</span>
            </div>
          ) : (
            <>
              <img
                src={previewUrl}
                alt={image.newName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-white text-sm font-medium drop-shadow-lg">Önizleme için tıkla</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Status */}
          {statusBadge()}

          {/* Filename */}
          <div>
            {isEditingName ? (
            <div className="flex gap-2">
              <Input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                onBlur={handleNameSave}
                className="h-9 text-sm border-gray-200 focus:border-primary"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 group/name">
              <span className="text-sm font-medium truncate flex-1 text-gray-900">{image.newName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingName(true)}
                className="h-7 w-7 p-0 opacity-0 group-hover/name:opacity-100 transition-opacity"
              >
                <Pencil className="h-3.5 w-3.5 text-gray-500" />
              </Button>
            </div>
          )}
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            value={dimensions.width}
            onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
            onBlur={handleDimensionsChange}
            placeholder="Genişlik"
            className="h-9 text-sm border-gray-200 focus:border-primary"
            min="1"
          />
          <Input
            type="number"
            value={dimensions.height}
            onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
            onBlur={handleDimensionsChange}
            placeholder="Yükseklik"
            className="h-9 text-sm border-gray-200 focus:border-primary"
            min="1"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={image.status !== 'done'}
            className="flex-1 h-9 bg-primary hover:bg-primary/90 shadow-sm"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            İndir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeImage(image.id)}
            className="h-9 w-9 p-0 border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}