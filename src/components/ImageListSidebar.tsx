/**
 * ImageListSidebar Component
 * Shows uploaded images as a list in the sidebar
 * Allows selection for comparison view
 */

import type { ImageObject, ResizeMode } from '../types/image';
import { useImageStore } from '../store/imageStore';
import { Settings, Lock, Unlock, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface ImageListSidebarProps {
  images: ImageObject[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
}

export function ImageListSidebar({ images, selectedImageId, onSelectImage }: ImageListSidebarProps) {
  const { removeImage, updateImageDimensions, updateImageName } = useImageStore();
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editWidth, setEditWidth] = useState(0);
  const [editHeight, setEditHeight] = useState(0);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [resizeMode, setResizeMode] = useState<ResizeMode>('fit');
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);

  if (images.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs text-gray-600">Henüz görsel yüklenmedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - Minimal */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-500">{images.length} Görsel</p>
      </div>

      {/* Image List - Compact */}
      <div className="p-2 space-y-1.5">{images.map((image) => {
            const isSelected = image.id === selectedImageId;
            const thumbnailUrl = image.originalFile ? URL.createObjectURL(image.originalFile) : null;

            return (
              <div key={image.id}>
                <button
                  onClick={() => onSelectImage(image.id)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition-all group ${
                    isSelected
                      ? 'bg-blue-50 ring-1 ring-blue-500'
                      : 'bg-white hover:bg-gray-50 ring-1 ring-gray-200 hover:ring-gray-300'
                  }`}
                >
                {/* Thumbnail - Smaller */}
                <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-100 ring-1 ring-gray-200/50">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={image.newName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info - Minimal */}
                <div className="flex-1 text-left min-w-0">
                  {/* Name - Editable */}
                  {editingNameId === image.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => {
                        if (editName.trim()) {
                          updateImageName(image.id, editName.trim());
                        }
                        setEditingNameId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editName.trim()) {
                            updateImageName(image.id, editName.trim());
                          }
                          setEditingNameId(null);
                        } else if (e.key === 'Escape') {
                          setEditingNameId(null);
                        }
                      }}
                      autoFocus
                      className="w-full text-xs font-medium text-gray-900 px-1 py-0.5 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-center gap-1 group/name">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {image.newName || image.originalFile.name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNameId(image.id);
                          setEditName(image.newName || image.originalFile.name);
                        }}
                        className="opacity-0 group-hover/name:opacity-100 p-0.5 text-gray-400 hover:text-blue-600 rounded transition-all"
                        title="İsmi düzenle"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  
                  {/* Status Badge - Compact */}
                  {image.status === 'processing' && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-blue-600">İşleniyor</span>
                    </div>
                  )}
                  {image.status === 'done' && (
                    <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Hazır
                    </span>
                  )}
                  {image.status === 'error' && (
                    <span className="text-xs text-red-600 mt-1 block">Hata</span>
                  )}
                  {image.status === 'idle' && (
                    <span className="text-xs text-gray-400 mt-1 block">Bekliyor</span>
                  )}
                  
                  {/* Dimensions - Show only when done, subtle */}
                  {image.status === 'done' && image.dimensions.width > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {image.dimensions.width} × {image.dimensions.height}
                    </p>
                  )}
                </div>

                {/* Action buttons - Show on hover */}
                <div className="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Settings button */}
                  {image.status === 'done' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingImageId(image.id);
                        setEditWidth(image.dimensions.width);
                        setEditHeight(image.dimensions.height);
                        const aspectRatio = image.dimensions.width / image.dimensions.height;
                        setOriginalAspectRatio(aspectRatio);
                        setAspectRatioLocked(image.maintainAspectRatio ?? true);
                        setResizeMode(image.resizeMode ?? 'fit');
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Boyut ayarla"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Sil"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </button>

              {/* Dimension Edit Panel - Compact */}
              {editingImageId === image.id && (
                <div className="px-2 pb-2 mt-1">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                    <p className="text-xs font-medium text-gray-700 mb-2">Boyut Ayarları</p>
                    
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
                        value={editWidth}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value) || 0;
                          setEditWidth(newWidth);
                          if (aspectRatioLocked && originalAspectRatio > 0) {
                            setEditHeight(Math.round(newWidth / originalAspectRatio));
                          }
                        }}
                        placeholder="W"
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={editHeight}
                        onChange={(e) => {
                          const newHeight = parseInt(e.target.value) || 0;
                          setEditHeight(newHeight);
                          if (aspectRatioLocked && originalAspectRatio > 0) {
                            setEditWidth(Math.round(newHeight * originalAspectRatio));
                          }
                        }}
                        placeholder="H"
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Action Buttons - Compact */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          if (editWidth > 0 && editHeight > 0) {
                            updateImageDimensions(image.id, editWidth, editHeight, resizeMode, aspectRatioLocked);
                            setEditingImageId(null);
                          }
                        }}
                        className="flex-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                      >
                        Uygula
                      </button>
                      <button
                        onClick={() => setEditingImageId(null)}
                        className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

