
import React, { useState, useRef } from 'react';
import { Photo, FamilyMember, Language } from '../types';
import { Translation } from '../utils/i18n';
import { getLocalUserId, uploadPhoto } from '../services/storageService';
import { Plus, Trash2, Image as ImageIcon, X, Loader2, Upload } from 'lucide-react';

interface GalleryViewProps {
  photos: Photo[];
  members: FamilyMember[];
  onAddPhoto: (photo: Photo) => void;
  onDeletePhoto: (id: string) => void;
  t: Translation;
  lang: Language;
}

const GalleryView: React.FC<GalleryViewProps> = ({ photos, members, onAddPhoto, onDeletePhoto, t, lang }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = getLocalUserId();

  // Sort photos by newest first
  const sortedPhotos = [...photos].sort((a, b) => b.timestamp - a.timestamp);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // 1. Get Caption
      const caption = window.prompt(t.gallery.promptCaption, "");
      if (caption === null) {
        setIsUploading(false);
        return;
      }

      // 2. Upload to Firebase
      const downloadUrl = await uploadPhoto(file);

      // 3. Save Record
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: downloadUrl,
        caption: caption || 'Untitled',
        uploadedBy: currentUserId || 'unknown', 
        timestamp: Date.now()
      };

      onAddPhoto(newPhoto);

    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown';
  const getMemberAvatar = (id: string) => members.find(m => m.id === id)?.avatar || 'bg-gray-400';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-800">{t.gallery.title}</h2>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-[1.5rem] hover:bg-primary-600 transition-all shadow-lg shadow-primary-200 font-bold disabled:opacity-50 transform hover:scale-105"
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span>{t.gallery.upload}</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      <div className="columns-1 md:columns-3 lg:columns-4 gap-6 space-y-6">
        {/* Upload Placeholder */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="break-inside-avoid aspect-square rounded-[2rem] border-4 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50 transition-all cursor-pointer group p-4"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-3 transition-colors shadow-sm">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-bold text-sm">{t.gallery.addPhoto}</span>
        </div>

        {sortedPhotos.map(photo => (
          <div 
            key={photo.id} 
            className="break-inside-avoid group relative bg-white p-3 pb-12 rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-2 hover:rotate-1"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="aspect-square rounded-[1.5rem] overflow-hidden bg-gray-100">
               <img 
                src={photo.url} 
                alt={photo.caption} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <p className="font-bold text-gray-700 text-sm truncate max-w-[70%] font-handwriting">{photo.caption}</p>
              <div className={`w-8 h-8 rounded-full ${getMemberAvatar(photo.uploadedBy)} border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                 {getMemberName(photo.uploadedBy)[0]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-candy-cream/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 bg-white p-3 rounded-full shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="max-w-4xl w-full max-h-[90vh] flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-1 bg-gray-50 relative flex items-center justify-center overflow-hidden p-4 md:p-8">
               <img 
                 src={selectedPhoto.url} 
                 alt={selectedPhoto.caption} 
                 className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-lg" 
               />
            </div>
            
            <div className="p-6 md:p-8 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-2xl font-black text-gray-800 mb-1">{selectedPhoto.caption}</h3>
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <span className="text-primary-500 bg-primary-50 px-2 py-0.5 rounded-lg">
                    {getMemberName(selectedPhoto.uploadedBy)}
                  </span>
                  <span>•</span>
                  <span>{new Date(selectedPhoto.timestamp).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'long' })}</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if(window.confirm(t.gallery.deleteConfirm)) {
                    onDeletePhoto(selectedPhoto.id);
                    setSelectedPhoto(null);
                  }
                }}
                className="text-gray-300 hover:text-red-500 p-3 rounded-2xl hover:bg-red-50 transition-colors"
                title="Delete photo"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryView;
