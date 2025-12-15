/**
 * Main App Component
 * Orchestrates the entire application
 */

import { Sparkles } from 'lucide-react';
import { useImageStore } from './store/imageStore';
import { Upload } from './components/Upload';
import { EditorDashboard } from './components/EditorDashboard';
import { LoadingOverlay } from './components/LoadingOverlay';

function App() {
  const { isModelLoading, modelLoadError } = useImageStore();

  // Model will be loaded on-demand when first image is uploaded
  // No need to initialize on app start

  return (
    <div className="min-h-screen bg-background">
      {/* Loading Overlay */}
      {isModelLoading && <LoadingOverlay message="AI Modeli Yükleniyor..." />}

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Fotoğraf İşleme Otomasyonu</h1>
              <p className="text-sm text-muted-foreground">
                AI destekli arka plan kaldırma ve toplu düzenleme
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {modelLoadError && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
            <p className="font-semibold">Model Yükleme Hatası</p>
            <p className="text-sm">{modelLoadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm underline"
            >
              Sayfayı Yenile
            </button>
          </div>
        )}

        <div className="space-y-8">
          {/* Upload Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Görsel Yükleme</h2>
            <Upload />
          </section>

          {/* Editor Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">2. Düzenleme & Dışa Aktarım</h2>
            <EditorDashboard />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Tüm işlemler tarayıcınızda gerçekleştirilir. Görselleriniz hiçbir
            sunucuya gönderilmez.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

