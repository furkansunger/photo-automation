/**
 * Image Row Component
 * Single row in the editor table
 */

import { useState, useMemo, useEffect } from 'react';
import { Trash2, Download, Loader2 } from 'lucide-react';
import { useImageStore } from '../store/imageStore';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { ImageObject } from '../types/image';

interface ImageRowProps {
  image: ImageObject;
}

export function ImageRow({ image }: ImageRowProps) {
  const { updateImageDimensions, updateImageName, removeImage } = useImageStore();
  
  const [width, setWidth] = useState(image.dimensions.width.toString());
  const [height, setHeight] = useState(image.dimensions.height.toString());
  const [name, setName] = useState(image.newName);

  // Update local state when image dimensions change (from bulk operations)
  useEffect(() => {
    setWidth(image.dimensions.width.toString());
    setHeight(image.dimensions.height.toString());
  }, [image.dimensions.width, image.dimensions.height]);

  // Create preview URL
  const previewUrl = useMemo(() => {
    if (image.processedBlob) {
      return URL.createObjectURL(image.processedBlob);
    }
    return URL.createObjectURL(image.originalFile);
  }, [image.processedBlob, image.originalFile]);

  const handleDimensionChange = () => {
    const w = parseInt(width);
    const h = parseInt(height);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      updateImageDimensions(image.id, w, h);
    }
  };

  const handleNameBlur = () => {
    if (name.trim()) {
      updateImageName(image.id, name.trim());
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
        const stageText = {
          'removing-bg': 'Arka plan kaldırılıyor',
          'applying-bg': 'Beyaz arka plan ekleniyor',
          'resizing': 'Boyutlandırılıyor',
          'adding-watermark': 'Filigran ekleniyor',
          'finalizing': 'Tamamlanıyor',
        };
        const stage = image.processingStage ? stageText[image.processingStage] : 'İşleniyor';
        
        return (
          <div className="space-y-1">
            <Badge variant="warning" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              İşleniyor
            </Badge>
            {image.progress !== undefined && (
              <>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300 ease-out"
                    style={{ width: `${image.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {stage} ({image.progress}%)
                </p>
              </>
            )}
          </div>
        );
      case 'done':
        return <Badge variant="success">Hazır</Badge>;
      case 'error':
        return <Badge variant="destructive">Hata</Badge>;
      default:
        return <Badge variant="secondary">Bekliyor</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 items-center py-4 border-b">
      {/* Preview */}
      <div className="col-span-2">
        <div className="aspect-square rounded-lg overflow-hidden bg-muted border relative">
          {image.status === 'processing' ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <img
              src={previewUrl}
              alt={image.newName}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Filename */}
      <div className="col-span-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          placeholder="Dosya adı"
          disabled={image.status === 'processing'}
        />
        <p className="text-xs text-muted-foreground mt-1">.jpg</p>
      </div>

      {/* Dimensions */}
      <div className="col-span-3 flex gap-2 items-center">
        <Input
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          onBlur={handleDimensionChange}
          placeholder="Genişlik"
          disabled={image.status === 'processing'}
          min="1"
        />
        <span className="text-muted-foreground">×</span>
        <Input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          onBlur={handleDimensionChange}
          placeholder="Yükseklik"
          disabled={image.status === 'processing'}
          min="1"
        />
      </div>

      {/* Status */}
      <div className="col-span-2">
        {statusBadge()}
        {image.errorMessage && (
          <p className="text-xs text-destructive mt-1">{image.errorMessage}</p>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-2 flex gap-2 justify-end">
        <Button
          size="icon"
          variant="outline"
          onClick={handleDownload}
          disabled={!image.processedBlob || image.status === 'processing'}
          title="İndir"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={() => removeImage(image.id)}
          title="Sil"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
