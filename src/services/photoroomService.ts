/**
 * Photoroom API Service
 * High-quality background removal with shadow detection
 * Docs: https://docs.photoroom.com/
 */

export interface PhotoroomConfig {
  apiKey: string;
  endpoint?: string;
}

export interface PhotoroomOptions {
  format?: 'png' | 'jpg' | 'webp';
  size?: 'auto' | 'preview' | 'medium' | 'full' | 'hd';
  channels?: 'rgba' | 'alpha';
  // Shadow detection ve removal için özel parametreler
  removeShadow?: boolean;
  // Ürün fotoğrafı için optimize edilmiş ayarlar
  productMode?: boolean;
}

export interface PhotoroomResponse {
  success: boolean;
  resultBlob?: Blob;
  error?: string;
  creditsRemaining?: number;
  processingTime?: number;
}

class PhotoroomService {
  private static instance: PhotoroomService;
  private apiKey: string = '';
  private sandboxKey: string = '';
  private currentKey: string = '';
  private usingSandbox: boolean = false;
  private endpoint: string = 'https://sdk.photoroom.com/v1/segment';
  private isConfigured: boolean = false;
  private creditsUsed: number = 0;
  private lastError: string | null = null;

  private constructor() {
    // API key'leri environment'tan al
    this.apiKey = import.meta.env.VITE_PHOTOROOM_API_KEY || '';
    this.sandboxKey = import.meta.env.VITE_PHOTOROOM_SANDBOX_KEY || '';
    this.currentKey = this.apiKey;
    
    if (this.apiKey) {
      this.isConfigured = true;
      console.log('[PhotoroomService] Configured with production API key');
    } else {
      console.warn('[PhotoroomService] No API key found. Set VITE_PHOTOROOM_API_KEY in .env');
    }
    
    if (this.sandboxKey) {
      console.log('[PhotoroomService] Sandbox key available for fallback');
    }
  }

  public static getInstance(): PhotoroomService {
    if (!PhotoroomService.instance) {
      PhotoroomService.instance = new PhotoroomService();
    }
    return PhotoroomService.instance;
  }

  /**
   * Manuel API key konfigürasyonu (runtime)
   */
  public configure(config: PhotoroomConfig): void {
    this.apiKey = config.apiKey;
    if (config.endpoint) {
      this.endpoint = config.endpoint;
    }
    this.isConfigured = true;
    console.log('[PhotoroomService] Manually configured');
  }

  /**
   * Servisin hazır olup olmadığını kontrol et
   */
  public isReady(): boolean {
    return this.isConfigured && this.apiKey.length > 0;
  }

  /**
   * Sandbox modunda mı?
   */
  public isUsingSandbox(): boolean {
    return this.usingSandbox;
  }

  /**
   * API kredisi bilgisi
   */
  public getCreditsUsed(): number {
    return this.creditsUsed;
  }

  /**
   * Son hatayı al
   */
  public getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Arka plan kaldırma - Yüksek kaliteli, gölge tespiti ile
   */
  public async removeBackground(
    imageFile: File | Blob,
    options: PhotoroomOptions = {}
  ): Promise<PhotoroomResponse> {
    const startTime = performance.now();

    // API key kontrolü
    if (!this.isReady()) {
      this.lastError = 'Photoroom API key not configured';
      return {
        success: false,
        error: 'API key bulunamadı. Lütfen .env dosyasına VITE_PHOTOROOM_API_KEY ekleyin.',
      };
    }

    try {
      console.log('[PhotoroomService] Starting background removal...');

      // FormData hazırla
      const formData = new FormData();
      formData.append('image_file', imageFile);

      // Ürün fotoğrafı için optimize edilmiş ayarlar
      if (options.productMode !== false) {
        // Varsayılan olarak product mode açık
        formData.append('bg.type', 'remove'); // Arka plan tamamen kaldır
        formData.append('shadow', options.removeShadow !== false ? 'remove' : 'keep');
        formData.append('padding', '0'); // Kenar boşluğu yok
      }

      // Format ayarları
      formData.append('format', options.format || 'png');
      formData.append('size', options.size || 'full');
      formData.append('channels', options.channels || 'rgba');

      // API request
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.currentKey,
        },
        body: formData,
      });

      // Rate limit kontrolü
      const remaining = response.headers.get('X-Credits-Remaining');
      if (remaining) {
        const creditsRemaining = parseInt(remaining, 10);
        console.log(`[PhotoroomService] Credits remaining: ${creditsRemaining}`);
        
        if (creditsRemaining < 10) {
          console.warn('[PhotoroomService] Low credits warning!');
        }
      }

      // Hata kontrolü
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Photoroom API error';

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || errorJson.message || errorText;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`;
        }

        // Özel hata mesajları ve sandbox fallback
        if (response.status === 402) {
          // API limiti doldu - sandbox'a geç
          if (!this.usingSandbox && this.sandboxKey) {
            console.warn('[PhotoroomService] Main API limit reached, switching to sandbox...');
            this.currentKey = this.sandboxKey;
            this.usingSandbox = true;
            
            // Sandbox ile tekrar dene
            return this.removeBackground(imageFile, options);
          }
          
          errorMessage = 'API krediniz tükendi. Lütfen Photoroom hesabınızı yükseltin.';
        } else if (response.status === 401) {
          errorMessage = 'API krediniz tükendi. Lütfen Photoroom hesabınızı yükseltin.';
        } else if (response.status === 401) {
          errorMessage = 'Geçersiz API key. Lütfen VITE_PHOTOROOM_API_KEY kontrolü yapın.';
        } else if (response.status === 429) {
          errorMessage = 'Çok fazla istek. Lütfen birkaç saniye bekleyin.';
        }

        this.lastError = errorMessage;
        console.error('[PhotoroomService] API Error:', errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }

      // Başarılı yanıt
      const resultBlob = await response.blob();
      const processingTime = performance.now() - startTime;

      this.creditsUsed++;
      this.lastError = null;

      console.log(`[PhotoroomService] Success! Processed in ${processingTime.toFixed(0)}ms`);

      return {
        success: true,
        resultBlob,
        processingTime,
        creditsRemaining: remaining ? parseInt(remaining, 10) : undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.lastError = errorMessage;
      console.error('[PhotoroomService] Failed:', error);

      return {
        success: false,
        error: `Network hatası: ${errorMessage}`,
      };
    }
  }

  /**
   * Blob'u Canvas'a yükle
   */
  public async blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }
}

// Export singleton instance
export const photoroomService = PhotoroomService.getInstance();
