/**
 * BulkActions Component
 * Bulk operations and downloads for processed images
 */

import { Download, Settings, Lock, Unlock, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useImageStore } from '../store/imageStore';
import type { ResizeMode } from '../types/image';
import { imageProcessor } from '../services/imageProcessor';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function BulkActions() {
  const { images, updateBulkDimensions, updateImageName } = useImageStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [bulkWidth, setBulkWidth] = useState(0);
  const [bulkHeight, setBulkHeight] = useState(0);
  const [bulkName, setBulkName] = useState('');
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [resizeMode, setResizeMode] = useState<ResizeMode>('fit');

  const doneImages = images.filter((img) => img.status === 'done');
  const canDownload = doneImages.length > 0;

  // Calculate average aspect ratio from first image
  const firstImage = images[0];
  const defaultAspectRatio = firstImage 
    ? firstImage.dimensions.width / firstImage.dimensions.height 
    : 1;

  const handleDownloadAll = async (provider: 'imgly' | 'photoroom' | 'both') => {
    if (!canDownload) return;

    const zip = new JSZip();
    let fileCount = 0;

    // Show progress indicator
    console.log('[BulkActions] Starting download with resize...');

    for (const image of doneImages) {
      try {
        // Get target dimensions and resize mode from image settings
        const targetDimensions = {
          width: image.dimensions.width,
          height: image.dimensions.height,
        };
        const resizeMode = image.resizeMode || 'fit';

        if (provider === 'imgly' && image.imglyBlob) {
          // Resize on-the-fly before adding to zip
          const resizedBlob = await imageProcessor.resizeImage(
            image.imglyBlob,
            targetDimensions,
            resizeMode
          );
          zip.file(`${image.newName}_imgly.jpg`, resizedBlob);
          fileCount++;
        } else if (provider === 'photoroom' && image.photoroomBlob) {
          const resizedBlob = await imageProcessor.resizeImage(
            image.photoroomBlob,
            targetDimensions,
            resizeMode
          );
          zip.file(`${image.newName}_photoroom.jpg`, resizedBlob);
          fileCount++;
        } else if (provider === 'both') {
          if (image.imglyBlob) {
            const resizedBlob = await imageProcessor.resizeImage(
              image.imglyBlob,
              targetDimensions,
              resizeMode
            );
            zip.file(`${image.newName}_imgly.jpg`, resizedBlob);
            fileCount++;
          }
          if (image.photoroomBlob) {
            const resizedBlob = await imageProcessor.resizeImage(
              image.photoroomBlob,
              targetDimensions,
              resizeMode
            );
            zip.file(`${image.newName}_photoroom.jpg`, resizedBlob);
            fileCount++;
          }
        }
      } catch (error) {
        console.error(`[BulkActions] Error resizing image ${image.id}:`, error);
        // Continue with next image
      }
    }

    if (fileCount === 0) {
      alert('İndirilecek görsel bulunamadı');
      return;
    }

    console.log(`[BulkActions] Creating zip with ${fileCount} resized images...`);
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `processed-images-${provider}-${Date.now()}.zip`);
  };

  const handleApplyDimensions = () => {
    if (bulkWidth > 0 && bulkHeight > 0) {
      updateBulkDimensions(bulkWidth, bulkHeight, resizeMode, aspectRatioLocked);
      setShowSettings(false);
    }
  };

  const handleBulkRename = () => {
    if (!bulkName.trim()) return;
    
    const baseName = bulkName.trim();
    images.forEach((image, index) => {
      const newName = `${baseName}_${index + 1}`;
      updateImageName(image.id, newName);
    });
    
    setBulkName('');
    setShowRename(false);
  };

  return (
    <div className="bg-white">
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
        {/* Settings Button - Compact */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Boyut
          </button>
          <button
            onClick={() => setShowRename(!showRename)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            İsim
          </button>
        </div>

        {/* Download Buttons - Compact */}
        <div className="flex gap-1.5">
          <button
            onClick={() => handleDownloadAll('imgly')}
            disabled={!canDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            imgly ({doneImages.length})
          </button>
          <button
            onClick={() => handleDownloadAll('photoroom')}
            disabled={!canDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Photoroom ({doneImages.length})
          </button>
          <button
            onClick={() => handleDownloadAll('both')}
            disabled={!canDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Tümü ({doneImages.length * 2})
          </button>
        </div>
      </div>

      {/* Settings Panel - Compact */}
      {showSettings && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border-t border-gray-100">
          <p className="text-xs font-medium text-gray-700 mb-2">Toplu Boyut Ayarlama</p>

          {/* Resize Mode - Text Labels */}
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setResizeMode('fit')}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                resizeMode === 'fit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Fit
            </button>
            <button
              onClick={() => setResizeMode('fill')}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                resizeMode === 'fill'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Fill
            </button>
            <button
              onClick={() => setResizeMode('stretch')}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                resizeMode === 'stretch'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Stretch
            </button>
            <button
              onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
              className={`px-2 py-1 rounded transition-colors ${
                aspectRatioLocked
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              title={aspectRatioLocked ? 'Kilidi aç' : 'Kilitle'}
            >
              {aspectRatioLocked ? (
                <Lock className="w-3 h-3" />
              ) : (
                <Unlock className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Dimension Inputs - Compact */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <input
              type="number"
              value={bulkWidth || ''}
              onChange={(e) => {
                const newWidth = parseInt(e.target.value) || 0;
                setBulkWidth(newWidth);
                if (aspectRatioLocked && defaultAspectRatio > 0) {
                  setBulkHeight(Math.round(newWidth / defaultAspectRatio));
                }
              }}
              placeholder="Genişlik"
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              value={bulkHeight || ''}
              onChange={(e) => {
                const newHeight = parseInt(e.target.value) || 0;
                setBulkHeight(newHeight);
                if (aspectRatioLocked && defaultAspectRatio > 0) {
                  setBulkWidth(Math.round(newHeight * defaultAspectRatio));
                }
              }}
              placeholder="Yükseklik"
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleApplyDimensions}
              disabled={!bulkWidth || !bulkHeight}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition-colors"
            >
              Uygula
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Bulk Rename Panel - Compact */}
      {showRename && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border-t border-gray-100">
          <p className="text-xs font-medium text-gray-700 mb-2">Toplu İsim Değiştirme</p>
          <p className="text-xs text-gray-500 mb-2">
            Tüm görseller: <span className="font-medium">{bulkName || 'isim'}_1</span>, <span className="font-medium">{bulkName || 'isim'}_2</span>, ...
          </p>
          <input
            type="text"
            value={bulkName}
            onChange={(e) => setBulkName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBulkRename();
              if (e.key === 'Escape') setShowRename(false);
            }}
            placeholder="Yeni isim girin"
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mb-2"
          />
          <div className="flex gap-1.5">
            <button
              onClick={handleBulkRename}
              disabled={!bulkName.trim()}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition-colors"
            >
              Uygula ({images.length})
            </button>
            <button
              onClick={() => setShowRename(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
