/**
 * Main App Component
 * Orchestrates the entire application with comparison layout
 */

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useImageStore } from './store/imageStore';
import { Upload } from './components/Upload';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ImageListSidebar } from './components/ImageListSidebar';
import { ComparisonView } from './components/ComparisonView';
import { BulkActions } from './components/BulkActions';

function App() {
  const { isModelLoading, modelLoadError, images } = useImageStore();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Auto-select first image when images are added or when selected image is removed
  useEffect(() => {
    if (images.length > 0) {
      // If no image selected, or selected image no longer exists, select first one
      const selectedExists = images.some(img => img.id === selectedImageId);
      if (!selectedImageId || !selectedExists) {
        setSelectedImageId(images[0].id);
      }
    } else {
      setSelectedImageId(null);
    }
  }, [images, selectedImageId]);

  const selectedImage = images.find((img) => img.id === selectedImageId);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Loading Overlay */}
      {isModelLoading && <LoadingOverlay message="AI Modeli Yükleniyor..." />}

      {/* Header - Minimal & Clean */}
      <header className="flex-shrink-0 sticky top-0 z-10 backdrop-blur-lg bg-white/90 border-b border-gray-100">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-gradient-to-br from-primary to-primary/80 p-2 shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">Fotoğraf İşleme</h1>
                <p className="text-xs text-gray-500">imgly vs Photoroom</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Error Message - Compact */}
        {modelLoadError && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700">
            <p className="font-medium text-xs">Model Yükleme Hatası</p>
            <p className="text-xs mt-0.5 text-red-600">{modelLoadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs font-medium underline hover:no-underline"
            >
              Sayfayı Yenile
            </button>
          </div>
        )}

        {images.length === 0 ? (
          /* Upload Section - Full Screen when no images */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Görsel Yükleme
                </h2>
                <p className="text-sm text-gray-500">
                  İşlemek istediğiniz görselleri yükleyin - Her görsel hem imgly hem de Photoroom ile işlenecek
                </p>
              </div>
              <Upload />
            </div>
          </div>
        ) : (
          /* Sidebar + Comparison View Layout */
          <div className="flex-1 flex min-h-0">
            {/* Left Sidebar - Image List */}
            <aside className="w-72 border-r border-gray-100 bg-white flex flex-col">
              {/* Upload Section in Sidebar - Fixed */}
              <div className="flex-shrink-0 p-3 border-b border-gray-100">
                <Upload />
              </div>
              
              {/* Image List - Scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <ImageListSidebar
                  images={images}
                  selectedImageId={selectedImageId}
                  onSelectImage={setSelectedImageId}
                />
              </div>
            </aside>

            {/* Right Side - Comparison View + Sticky Actions */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Comparison View - Scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {selectedImage ? (
                  <ComparisonView image={selectedImage} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Görsel seçin</p>
                  </div>
                )}
              </div>

              {/* Bulk Actions Bar - Sticky at bottom */}
              <div className="flex-shrink-0 sticky bottom-0 border-t border-gray-200 shadow-lg bg-white z-10">
                <BulkActions />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

