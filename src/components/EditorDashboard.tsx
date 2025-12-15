/**
 * Editor Dashboard Component
 * Professional table view with bulk operations
 */

import { useState, useRef } from 'react';
import { Download, Settings, Image as ImageIcon } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useImageStore } from '../store/imageStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageRow } from './ImageRow';

export function EditorDashboard() {
  const { images, updateBulkDimensions, setGlobalWatermark, applyWatermarkToAll, clearAll } = useImageStore();
  const [bulkWidth, setBulkWidth] = useState('');
  const [bulkHeight, setBulkHeight] = useState('');
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkScale, setWatermarkScale] = useState('80'); // percentage
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const hasImages = images.length > 0;
  const processedImages = images.filter((img) => img.status === 'done');
  const canDownloadAll = processedImages.length > 0;

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

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setWatermarkFile(file);
    }
  };

  const handleApplyWatermark = () => {
    if (!watermarkFile) return;
    
    const scale = parseFloat(watermarkScale) / 100; // convert percentage to decimal
    if (scale > 0 && scale <= 1) {
      setGlobalWatermark({ file: watermarkFile, scale });
      applyWatermarkToAll();
    }
  };

  const handleRemoveWatermark = () => {
    setWatermarkFile(null);
    setGlobalWatermark(null);
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Settings className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Henüz görsel yüklenmedi</h3>
          <p className="text-muted-foreground">
            Başlamak için yukarıdan görsel yükleyin
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Düzenleme Paneli</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {images.length} görsel • {processedImages.length} hazır
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearAll}
              disabled={!hasImages}
            >
              Tümünü Temizle
            </Button>
            <Button
              onClick={handleDownloadAll}
              disabled={!canDownloadAll}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Hepsini İndir (.ZIP)
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Bulk Operations */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-4">
          <h4 className="font-semibold text-sm">Toplu İşlemler</h4>
          
          {/* Dimensions Section */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Boyutlar (Tümüne Uygula)
            </label>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  type="number"
                  value={bulkWidth}
                  onChange={(e) => setBulkWidth(e.target.value)}
                  placeholder="Genişlik (px)"
                  min="1"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  value={bulkHeight}
                  onChange={(e) => setBulkHeight(e.target.value)}
                  placeholder="Yükseklik (px)"
                  min="1"
                />
              </div>
              <Button
                onClick={handleBulkApply}
                disabled={!bulkWidth || !bulkHeight}
              >
                Boyutları Uygula
              </Button>
            </div>
          </div>

          {/* Watermark Section */}
          <div className="pt-4 border-t">
            <label className="text-xs text-muted-foreground mb-2 block">
              Filigran (Tümüne Uygula)
            </label>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  ref={watermarkInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleWatermarkUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => watermarkInputRef.current?.click()}
                  className="w-full"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {watermarkFile ? watermarkFile.name : 'Filigran Seç'}
                </Button>
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  value={watermarkScale}
                  onChange={(e) => setWatermarkScale(e.target.value)}
                  placeholder="Ölçek %"
                  min="5"
                  max="100"
                />
              </div>
              <Button
                onClick={handleApplyWatermark}
                disabled={!watermarkFile}
              >
                Filigran Uygula
              </Button>
              {watermarkFile && (
                <Button
                  variant="destructive"
                  onClick={handleRemoveWatermark}
                >
                  Kaldır
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Filigran her zaman görselin ortasında görünecektir. Ölçek değeri filigranın genişliğinin görsel genişliğine göre yüzdesini belirler (varsayılan: 80%).
            </p>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 pb-3 border-b font-semibold text-sm text-muted-foreground">
          <div className="col-span-2">Önizleme</div>
          <div className="col-span-3">Dosya Adı</div>
          <div className="col-span-3">Boyutlar (px)</div>
          <div className="col-span-2">Durum</div>
          <div className="col-span-2 text-right">İşlemler</div>
        </div>

        {/* Image Rows */}
        <div>
          {images.map((image) => (
            <ImageRow key={image.id} image={image} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
