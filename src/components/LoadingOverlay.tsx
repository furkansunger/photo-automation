/**
 * Loading Overlay Component
 * Shows while AI model is loading
 */

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Yükleniyor...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full mx-4 border">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-semibold mb-2">{message}</h2>
          <p className="text-sm text-muted-foreground">
            AI modeli ilk kez yükleniyorsa bu biraz zaman alabilir.
            Lütfen bekleyin...
          </p>
        </div>
      </div>
    </div>
  );
}
