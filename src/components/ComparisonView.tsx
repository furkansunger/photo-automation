/**
 * ComparisonView Component
 * Split-screen comparison between imgly and Photoroom results
 * Shows original/processed toggle for each provider
 */

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import type { ImageObject } from '../types/image';
import { imageProcessor } from '../services/imageProcessor';
import { saveAs } from 'file-saver';

interface ComparisonViewProps {
  image: ImageObject;
}

type ViewMode = 'original' | 'processed';

export function ComparisonView({ image }: ComparisonViewProps) {
  const [leftView, setLeftView] = useState<ViewMode>('processed');
  const [rightView, setRightView] = useState<ViewMode>('processed');
  const [previewImage, setPreviewImage] = useState<{ blob: Blob; name: string; type: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Generate URLs for blobs
  const originalUrl = image.originalFile ? URL.createObjectURL(image.originalFile) : null;
  const imglyUrl = image.imglyBlob ? URL.createObjectURL(image.imglyBlob) : null;
  const photoroomUrl = image.photoroomBlob ? URL.createObjectURL(image.photoroomBlob) : null;

  const leftImageUrl = leftView === 'original' ? originalUrl : imglyUrl;
  const rightImageUrl = rightView === 'original' ? originalUrl : photoroomUrl;

  // Handle image click for preview
  const handleLeftImageClick = () => {
    const blob = leftView === 'original' ? image.originalFile : image.imglyBlob;
    if (blob) {
      setPreviewImage({
        blob,
        name: `${image.newName} - imgly ${leftView === 'original' ? '(Orijinal)' : '(İşlenmiş)'}`,
        type: leftView === 'original' ? 'original' : 'imgly',
      });
      setShowPreview(true);
    }
  };

  const handleRightImageClick = () => {
    const blob = rightView === 'original' ? image.originalFile : image.photoroomBlob;
    if (blob) {
      setPreviewImage({
        blob,
        name: `${image.newName} - Photoroom ${rightView === 'original' ? '(Orijinal)' : '(İşlenmiş)'}`,
        type: rightView === 'original' ? 'original' : 'photoroom',
      });
      setShowPreview(true);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewImage(null);
  };

  // ESC key to close preview
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPreview) {
        handleClosePreview();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showPreview]);

  // Download handlers - resize on download
  const handleDownloadImgly = async () => {
    if (image.imglyBlob) {
      try {
        const targetDimensions = {
          width: image.dimensions.width,
          height: image.dimensions.height,
        };
        const resizeMode = image.resizeMode || 'fit';
        
        console.log(`[ComparisonView] Resizing imgly to ${targetDimensions.width}x${targetDimensions.height} (${resizeMode})`);
        const resizedBlob = await imageProcessor.resizeImage(
          image.imglyBlob,
          targetDimensions,
          resizeMode
        );
        saveAs(resizedBlob, `${image.newName}_imgly.jpg`);
      } catch (error) {
        console.error('[ComparisonView] Error resizing imgly:', error);
        // Fallback to original size
        saveAs(image.imglyBlob, `${image.newName}_imgly.jpg`);
      }
    }
  };

  const handleDownloadPhotoroom = async () => {
    if (image.photoroomBlob) {
      try {
        const targetDimensions = {
          width: image.dimensions.width,
          height: image.dimensions.height,
        };
        const resizeMode = image.resizeMode || 'fit';
        
        console.log(`[ComparisonView] Resizing photoroom to ${targetDimensions.width}x${targetDimensions.height} (${resizeMode})`);
        const resizedBlob = await imageProcessor.resizeImage(
          image.photoroomBlob,
          targetDimensions,
          resizeMode
        );
        saveAs(resizedBlob, `${image.newName}_photoroom.jpg`);
      } catch (error) {
        console.error('[ComparisonView] Error resizing photoroom:', error);
        // Fallback to original size
        saveAs(image.photoroomBlob, `${image.newName}_photoroom.jpg`);
      }
    }
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-gray-900 truncate">
              {image.newName || image.originalFile.name}
            </h2>
          </div>
          <div className="ml-4 text-right flex-shrink-0">
            <p className="text-xs font-medium text-gray-900">
              {image.dimensions.width} × {image.dimensions.height}
            </p>
            <p className="text-xs text-gray-500">
              {image.resizeMode === 'fit' && 'Fit'}
              {image.resizeMode === 'fill' && 'Fill'}
              {image.resizeMode === 'stretch' && 'Stretch'}
              {!image.resizeMode && 'Fit'}
            </p>
          </div>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 grid grid-cols-2 gap-px bg-gray-100">
        {/* Left Side - imgly */}
        <div className="bg-white flex flex-col">
          {/* Controls - Compact */}
          <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-700">imgly</h3>
              <div className="flex items-center gap-1.5">
                {image.status === 'processing' && image.imglyProgress !== undefined && (
                  <span className="text-xs text-blue-600 font-medium">
                    {image.imglyProgress}%
                  </span>
                )}
                {image.status === 'done' && image.imglyBlob && (
                  <button
                    onClick={handleDownloadImgly}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title={`İndir (${image.dimensions.width}x${image.dimensions.height})`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Toggle buttons - Compact */}
            <div className="flex gap-1">
              <button
                onClick={() => setLeftView('original')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  leftView === 'original'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Orijinal
              </button>
              <button
                onClick={() => setLeftView('processed')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  leftView === 'processed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                İşlenmiş
              </button>
            </div>
          </div>

          {/* Image Display */}
          <div className="flex-1 relative p-4 overflow-auto">
            {leftImageUrl ? (
              <div className="absolute inset-4 flex items-center justify-center">
                <img
                  src={leftImageUrl}
                  alt="imgly result"
                  onClick={handleLeftImageClick}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                />
              </div>
            ) : (
              <div className="absolute inset-4 flex items-center justify-center">
                <div className="text-center">
                  {image.status === 'processing' ? (
                    <>
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm text-gray-600">İşleniyor...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">Sonuç bekleniyor</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Photoroom */}
        <div className="bg-white flex flex-col">
          {/* Controls - Compact */}
          <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-700">Photoroom</h3>
              <div className="flex items-center gap-1.5">
                {image.status === 'processing' && image.photoroomProgress !== undefined && (
                  <span className="text-xs text-purple-600 font-medium">
                    {image.photoroomProgress}%
                  </span>
                )}
                {image.status === 'done' && image.photoroomBlob && (
                  <button
                    onClick={handleDownloadPhotoroom}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    title={`İndir (${image.dimensions.width}x${image.dimensions.height})`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Toggle buttons - Compact */}
            <div className="flex gap-1">
              <button
                onClick={() => setRightView('original')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  rightView === 'original'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Orijinal
              </button>
              <button
                onClick={() => setRightView('processed')}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  rightView === 'processed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                İşlenmiş
              </button>
            </div>
          </div>

          {/* Image Display */}
          <div className="flex-1 relative p-4 overflow-auto">
            {rightImageUrl ? (
              <div className="absolute inset-4 flex items-center justify-center">
                <img
                  src={rightImageUrl}
                  alt="Photoroom result"
                  onClick={handleRightImageClick}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                />
              </div>
            ) : (
              <div className="absolute inset-4 flex items-center justify-center">
                <div className="text-center">
                  {image.status === 'processing' ? (
                    <>
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm text-gray-600">İşleniyor...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">Sonuç bekleniyor</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {image.status === 'error' && (
        <div className="bg-red-50 border-t border-red-200 p-3">
          <p className="text-sm text-red-800">
            ❌ {image.errorMessage || 'İşlem hatası'}
          </p>
        </div>
      )}
      
      {image.status === 'done' && (
        <div className="bg-green-50 border-t border-green-200 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-800">
              ✓ İşlem tamamlandı
            </p>
            <div className="flex gap-3 text-xs text-gray-600">
              {image.imglyBlob && (
                <span>imgly: {(image.imglyBlob.size / 1024).toFixed(1)} KB</span>
              )}
              {image.photoroomBlob && (
                <span>Photoroom: {(image.photoroomBlob.size / 1024).toFixed(1)} KB</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Preview Modal */}
      {showPreview && previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={handleClosePreview}
        >
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="text-white">
                <h3 className="text-xl font-semibold">{previewImage.name}</h3>
                <p className="text-sm text-gray-300 mt-1">
                  {image.dimensions.width} x {image.dimensions.height} px
                </p>
              </div>
              <button
                onClick={handleClosePreview}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <img
                src={URL.createObjectURL(previewImage.blob)}
                alt={previewImage.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                ESC tuşuna basarak veya dışarı tıklayarak kapatabilirsiniz
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Boyut: {(previewImage.blob.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
