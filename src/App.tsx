/**
 * Main App Component
 * Orchestrates the entire application
 */

import { Sparkles, Shield } from 'lucide-react';
import { useImageStore } from './store/imageStore';
import { Upload } from './components/Upload';
import { EditorDashboard } from './components/EditorDashboard';
import { LoadingOverlay } from './components/LoadingOverlay';

function App() {
  const { isModelLoading, modelLoadError } = useImageStore();

  return (
    <div className="min-h-screen">
      {/* Loading Overlay */}
      {isModelLoading && <LoadingOverlay message="AI Modeli Yükleniyor..." />}

      {/* Header - Modern & Clean */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 border-b border-gray-200/50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2.5 shadow-lg shadow-primary/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Fotoğraf İşleme Otomasyonu</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Profesyonel görsel düzenleme çözümü
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
              <Shield className="h-3.5 w-3.5" />
              <span>Güvenli & Gizli</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10 max-w-7xl">
        {/* Error Message */}
        {modelLoadError && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <p className="font-medium text-sm">Model Yükleme Hatası</p>
            <p className="text-xs mt-1 text-red-600">{modelLoadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs font-medium underline hover:no-underline"
            >
              Sayfayı Yenile
            </button>
          </div>
        )}

        <div className="space-y-8">
          {/* Upload Section */}
          <section>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold">
                  1
                </span>
                <h2 className="text-lg font-semibold text-gray-900">Görsel Yükleme</h2>
              </div>
              <p className="text-sm text-gray-500 ml-8">
                İşlemek istediğiniz görselleri yükleyin
              </p>
            </div>
            <Upload />
          </section>

          {/* Editor Section */}
          <section>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold">
                  2
                </span>
                <h2 className="text-lg font-semibold text-gray-900">Düzenleme & İşleme</h2>
              </div>
              <p className="text-sm text-gray-500 ml-8">
                Görsellerinizi düzenleyin ve işleyin
              </p>
            </div>
            <EditorDashboard />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Tüm işlemler tarayıcınızda gerçekleştirilir</span>
            </div>
            <p className="text-xs text-gray-400">
              © 2025 Fotoğraf İşleme Otomasyonu
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

