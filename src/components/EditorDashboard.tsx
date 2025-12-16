/**
 * Editor Dashboard Component
 * Professional grid view with bulk operations
 */

import { useState, useEffect } from 'react';
import { Download, Settings } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useImageStore } from '../store/imageStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageCard } from './ImageCard';
import { ImagePreviewModal } from './ImagePreviewModal';
import type { ImageObject } from '../types/image';

export function EditorDashboard() {
  const { images, updateBulkDimensions, clearAll } = useImageStore();
  const [bulkWidth, setBulkWidth] = useState('');
  const [bulkHeight, setBulkHeight] = useState('');
  const [previewImage, setPreviewImage] = useState<ImageObject | null>(null);

  const hasImages = images.length > 0;
  const processedImages = images.filter((img) => img.status === 'done');
  const canDownloadAll = processedImages.length > 0;

  // ESC key listener for modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [previewImage]);

  const handleBulkApply = () => {
    const w = parseInt(bulkWidth);
    const h = parseInt(bulkHeight);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      updateBulkDimensions(w, h);
      // Update UI inputs to show applied values
      setBulkWidth(w.toString());
      setBulkHeight(h.toString());
    }
  };

  const handleDownloadAll = async () => {
    if (processedImages.length === 0) return;

    const zip = new JSZip();

    // Add each processed image to the zip
    for (const image of processedImages) {
      if (image.processedBlob) {
        zip.file(`${image.newName}.jpg`, image.processedBlob);
      }
    }

    // Generate and download the zip file
    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `processed-images-${Date.now()}.zip`);
    } catch (error) {
      console.error('ZIP oluşturma hatası:', error);
      alert('ZIP dosyası oluşturulamadı. Lütfen tekrar deneyin.');
    }
  };

  if (!hasImages) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 mb-6">
            <Settings className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz görsel yüklenmedi</h3>
          <p className="text-sm text-gray-500">
            Başlamak için yukarıdan görsel yükleyin
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Preview Modal */}
      <ImagePreviewModal 
        image={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />

      <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">İşleme Paneli</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {images.length} görsel • {processedImages.length} hazır
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearAll}
              disabled={!hasImages}
              className="border-gray-200 hover:bg-gray-50"
            >
              Tümünü Temizle
            </Button>
            <Button
              onClick={handleDownloadAll}
              disabled={!canDownloadAll}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm"
            >
              <Download className="h-4 w-4" />
              Hepsini İndir
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Bulk Operations */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 mb-6">
          <h4 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Toplu İşlemler
          </h4>
          
          {/* Dimensions Section */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-3 block">
              Boyutlar (Tümüne Uygula)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={bulkWidth}
                onChange={(e) => setBulkWidth(e.target.value)}
                placeholder="Genişlik (px)"
                min="1"
                className="flex-1 h-10 border-gray-200 focus:border-primary"
              />
              <Input
                type="number"
                value={bulkHeight}
                onChange={(e) => setBulkHeight(e.target.value)}
                placeholder="Yükseklik (px)"
                min="1"
                className="flex-1 h-10 border-gray-200 focus:border-primary"
              />
              <Button
                onClick={handleBulkApply}
                disabled={!bulkWidth || !bulkHeight}
                className="h-10 bg-primary hover:bg-primary/90 shadow-sm"
              >
                Uygula
              </Button>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {images.map((image) => (
            <ImageCard 
              key={image.id} 
              image={image} 
              onPreviewClick={setPreviewImage}
            />
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
