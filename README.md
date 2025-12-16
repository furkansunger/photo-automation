# 📸 Fotoğraf İşleme Otomasyonu# Fotoğraf İşleme Otomasyonu# React + TypeScript + Vite



Tarayıcı tabanlı, AI destekli profesyonel fotoğraf işleme aracı.



## ✨ ÖzelliklerProfessional, client-side Image Operations Automation Tool with AI-powered background removal.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



- 🤖 **İki Seviye AI Arka Plan Kaldırma**

  - **Yüksek Kalite (Photoroom API)**: Gölge tespiti, ince detaylar, profesyonel sonuçlar

  - **Standart (imgly)**: Ücretsiz, lokal işlem, temel arka plan kaldırma## 🚀 FeaturesCurrently, two official plugins are available:

- 🎨 **Beyaz Arka Plan** - Profesyonel ürün fotoğrafları için

- 📐 **Toplu Boyutlandırma** - Tüm görselleri aynı anda yeniden boyutlandır

- 💧 **Filigran Desteği** - Logonuzu görsellere otomatik ekle (80% ölçek)

- 📦 **ZIP İndirme** - İşlenmiş görselleri tek seferde indir- **AI Background Removal**: Uses `@xenova/transformers` with RMBG-1.4 model- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- 🔄 **Otomatik Fallback** - API limiti dolduğunda otomatik lokal işleme geçiş

- 🚀 **İlerleme Göstergeleri** - Her aşamada detaylı geri bildirim- **White Background Injection**: Automatically applies white background to processed images- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh



## 🛠️ Teknolojiler- **Bulk Processing**: Process multiple images simultaneously



- React 19 + TypeScript- **Image Resizing**: Resize images with custom dimensions## React Compiler

- Vite 7

- Tailwind CSS v4- **Batch Rename**: Rename all images with custom names

- Zustand (State Management)

- Photoroom API (Premium kalite)- **ZIP Export**: Download all processed images as a single ZIP fileThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- @imgly/background-removal (Fallback)

- **100% Client-Side**: All processing happens in your browser - no server needed

## 🚀 Kurulum

## Expanding the ESLint configuration

### 1. Projeyi Klonla

```bash## 🛠 Tech Stack

git clone https://github.com/furkansunger/photo-automation.git

cd photo-automationIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

npm install

```- **Frontend**: React 18 + TypeScript



### 2. Photoroom API Key Al (Önerilen)- **Build Tool**: Vite```js

1. [Photoroom API Dashboard](https://app.photoroom.com/api-dashboard)'a git

2. Ücretsiz hesap oluştur (10 kredi/ay ücretsiz)- **UI Framework**: Tailwind CSS + Shadcn/uiexport default defineConfig([

3. API key'ini kopyala

- **Icons**: Lucide React  globalIgnores(['dist']),

### 3. Environment Variables Ayarla

```bash- **State Management**: Zustand  {

cp .env.example .env

```- **AI**: @xenova/transformers (RMBG-1.4 model)    files: ['**/*.{ts,tsx}'],



`.env` dosyasını düzenle:- **File Handling**: react-dropzone, jszip, file-saver    extends: [

```env

VITE_PHOTOROOM_API_KEY=your_api_key_here      // Other configs...

VITE_BG_REMOVAL_PROVIDER=photoroom

```## 📦 Installation



**Not:** API key olmadan da çalışır, sadece standart kalite ile (imgly).      // Remove tseslint.configs.recommended and replace with this



### 4. Development Server Başlat```bash      tseslint.configs.recommendedTypeChecked,

```bash

npm run devnpm install      // Alternatively, use this for stricter rules

```

```      tseslint.configs.strictTypeChecked,

## 🎯 Kullanım

      // Optionally, add this for stylistic rules

1. **Görselleri Yükle**: Sürükle-bırak veya tıklayarak seç

2. **Kalite Seç**: ## 🏃 Development      tseslint.configs.stylisticTypeChecked,

   - **Yüksek Kalite**: Gölgeler dahil profesyonel arka plan kaldırma

   - **Standart**: Hızlı ve ücretsiz işlem

3. **İşlemi Başlat**: Tümünü İşle butonuna tıkla

4. **İsteğe Göre Düzenle**:```bash      // Other configs...

   - Boyut ayarla (toplu veya tekil)

   - Filigran eklenpm run dev    ],

   - Yeniden adlandır

5. **İndir**: ZIP olarak toplu indir veya tekil indir```    languageOptions: {



## 🎨 Photoroom vs imgly Karşılaştırması      parserOptions: {



| Özellik | Photoroom | imgly |Open [http://localhost:5173](http://localhost:5173) in your browser.        project: ['./tsconfig.node.json', './tsconfig.app.json'],

|---------|-----------|-------|

| Kalite | ⭐⭐⭐⭐⭐ Mükemmel | ⭐⭐⭐ İyi |        tsconfigRootDir: import.meta.dirname,

| Gölge Tespiti | ✅ Evet | ❌ Hayır |

| İnce Detaylar | ✅ Mükemmel | ⚠️ Orta |## 🏗 Build      },

| Hız | 🚀 ~1 saniye | 🐌 ~3-5 saniye |

| Maliyet | 💰 Ücretli | ✅ Ücretsiz |      // other options...

| Offline | ❌ Hayır | ✅ Evet |

| İlk Yükleme | ✅ Anında | ⚠️ 24MB WASM |```bash    },



## 📦 Production Deploynpm run build  },



### Build```])

```bash

npm run build```

```

## 📖 Usage

### Hostinger Upload

1. hPanel → File Manager → public_htmlYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

2. dist/ içindeki tüm dosyaları yükle

3. .htaccess dosyasının yüklendiğinden emin ol1. **Upload Images**: Drag and drop images or click to select (JPG, PNG, WEBP)



### ⚠️ API Key Güvenliği2. **Automatic Processing**: Images are automatically processed with AI background removal and white background```js

Production'da API key'i **asla** frontend'de tutma!

3. **Edit**: Rename files and adjust dimensions in the editor table// eslint.config.js

**Çözüm**: Backend proxy kur

```javascript4. **Bulk Operations**: Apply same dimensions to all images at onceimport reactX from 'eslint-plugin-react-x'

// Örnek: Vercel Serverless Function

export default async function handler(req, res) {5. **Download**: Download individual images or all as ZIPimport reactDom from 'eslint-plugin-react-dom'

  const response = await fetch('https://sdk.photoroom.com/v1/segment', {

    method: 'POST',

    headers: { 'X-Api-Key': process.env.PHOTOROOM_API_KEY },

    body: req.body## 🏗 Project Structureexport default defineConfig([

  });

  return response.blob();  globalIgnores(['dist']),

}

``````  {



## 💰 Maliyetsrc/    files: ['**/*.{ts,tsx}'],



### Photoroom API├── components/          # React components    extends: [

- Ücretsiz: 10 kredi/ay

- Starter: $29/ay - 1,000 kredi│   ├── ui/             # Shadcn/ui base components      // Other configs...

- Pro: $199/ay - 10,000 kredi

│   ├── Upload.tsx      # Drag-and-drop upload zone      // Enable lint rules for React

### imgly

- Tamamen ücretsiz, sınırsız│   ├── EditorDashboard.tsx  # Main editor table      reactX.configs['recommended-typescript'],



## 📝 Lisans│   ├── ImageRow.tsx    # Individual image row      // Enable lint rules for React DOM



MIT│   └── LoadingOverlay.tsx   # Loading indicator      reactDom.configs.recommended,



---├── services/           # Business logic    ],



**Geliştirici**: [@furkansunger](https://github.com/furkansunger)│   ├── aiService.ts    # AI model management (Singleton)    languageOptions: {


│   └── imageProcessor.ts    # Canvas operations      parserOptions: {

├── store/              # State management        project: ['./tsconfig.node.json', './tsconfig.app.json'],

│   └── imageStore.ts   # Zustand global store        tsconfigRootDir: import.meta.dirname,

├── types/              # TypeScript definitions      },

│   └── image.ts        # Image object types      // other options...

├── lib/                # Utilities    },

│   └── utils.ts        # Helper functions  },

├── App.tsx             # Main app component])

└── main.tsx            # Entry point```

```

## 🎨 Architecture

### Service-Oriented Design

- **aiService.ts**: Manages AI model loading and inference using Singleton pattern
- **imageProcessor.ts**: Handles all Canvas operations (background injection, resizing)

### State Management

Uses Zustand for lightweight, scalable state management:
- Image queue management
- Processing status tracking
- Bulk operations

### Performance Optimizations

- AI model is loaded once and cached
- Efficient Canvas operations
- Optimized re-rendering with React hooks

## 🌐 Browser Support

Requires a modern browser with:
- WebAssembly support
- Canvas API support
- File API support

Recommended: Chrome, Firefox, Safari (latest versions)

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
