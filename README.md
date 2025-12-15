# Fotoğraf İşleme Otomasyonu# React + TypeScript + Vite



Professional, client-side Image Operations Automation Tool with AI-powered background removal.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## 🚀 FeaturesCurrently, two official plugins are available:



- **AI Background Removal**: Uses `@xenova/transformers` with RMBG-1.4 model- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- **White Background Injection**: Automatically applies white background to processed images- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- **Bulk Processing**: Process multiple images simultaneously

- **Image Resizing**: Resize images with custom dimensions## React Compiler

- **Batch Rename**: Rename all images with custom names

- **ZIP Export**: Download all processed images as a single ZIP fileThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- **100% Client-Side**: All processing happens in your browser - no server needed

## Expanding the ESLint configuration

## 🛠 Tech Stack

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- **Frontend**: React 18 + TypeScript

- **Build Tool**: Vite```js

- **UI Framework**: Tailwind CSS + Shadcn/uiexport default defineConfig([

- **Icons**: Lucide React  globalIgnores(['dist']),

- **State Management**: Zustand  {

- **AI**: @xenova/transformers (RMBG-1.4 model)    files: ['**/*.{ts,tsx}'],

- **File Handling**: react-dropzone, jszip, file-saver    extends: [

      // Other configs...

## 📦 Installation

      // Remove tseslint.configs.recommended and replace with this

```bash      tseslint.configs.recommendedTypeChecked,

npm install      // Alternatively, use this for stricter rules

```      tseslint.configs.strictTypeChecked,

      // Optionally, add this for stylistic rules

## 🏃 Development      tseslint.configs.stylisticTypeChecked,



```bash      // Other configs...

npm run dev    ],

```    languageOptions: {

      parserOptions: {

Open [http://localhost:5173](http://localhost:5173) in your browser.        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

## 🏗 Build      },

      // other options...

```bash    },

npm run build  },

```])

```

## 📖 Usage

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

1. **Upload Images**: Drag and drop images or click to select (JPG, PNG, WEBP)

2. **Automatic Processing**: Images are automatically processed with AI background removal and white background```js

3. **Edit**: Rename files and adjust dimensions in the editor table// eslint.config.js

4. **Bulk Operations**: Apply same dimensions to all images at onceimport reactX from 'eslint-plugin-react-x'

5. **Download**: Download individual images or all as ZIPimport reactDom from 'eslint-plugin-react-dom'



## 🏗 Project Structureexport default defineConfig([

  globalIgnores(['dist']),

```  {

src/    files: ['**/*.{ts,tsx}'],

├── components/          # React components    extends: [

│   ├── ui/             # Shadcn/ui base components      // Other configs...

│   ├── Upload.tsx      # Drag-and-drop upload zone      // Enable lint rules for React

│   ├── EditorDashboard.tsx  # Main editor table      reactX.configs['recommended-typescript'],

│   ├── ImageRow.tsx    # Individual image row      // Enable lint rules for React DOM

│   └── LoadingOverlay.tsx   # Loading indicator      reactDom.configs.recommended,

├── services/           # Business logic    ],

│   ├── aiService.ts    # AI model management (Singleton)    languageOptions: {

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
