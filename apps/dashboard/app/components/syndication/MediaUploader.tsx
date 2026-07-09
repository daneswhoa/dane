'use client';

import React from 'react';
import { Camera, Trash2, Plus, MoveLeft, MoveRight } from 'lucide-react';

interface MediaUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ photos, onChange }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newUrls: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        // Create local object URL for preview simulation
        const objectUrl = URL.createObjectURL(file);
        newUrls.push(objectUrl);
      }
      onChange([...photos, ...newUrls]);
    }
  };

  const removePhoto = (index: number) => {
    const updated = [...photos];
    updated.splice(index, 1);
    onChange(updated);
  };

  const movePhoto = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === photos.length - 1) return;

    const updated = [...photos];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-coral-500" /> Photo & Media Assets
          </h3>
          <p className="text-xs text-zinc-400">Upload portfolio imagery to present the asset listings online.</p>
        </div>
        <button
          type="button"
          onClick={triggerUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-lg border border-white/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Upload Photo
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*"
        className="hidden"
      />

      {photos.length === 0 ? (
        <div
          onClick={triggerUpload}
          className="border-2 border-dashed border-white/10 hover:border-coral-500/50 rounded-xl p-10 text-center cursor-pointer transition-all bg-zinc-900/30 flex flex-col items-center justify-center space-y-3"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-white/5">
            <Camera className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-white">No images uploaded</p>
            <p className="text-[10px] text-zinc-500">Drag & drop or click here to upload JPG, PNG or WEBP photos.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative group rounded-xl overflow-hidden border border-white/10 bg-zinc-950 aspect-[4/3] shadow-lg"
            >
              <img
                src={photo}
                alt={`Asset thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Cover badge on first image */}
              {index === 0 && (
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-coral-500 text-white uppercase tracking-wider">
                  Primary Cover
                </span>
              )}

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="w-7 h-7 rounded-lg bg-red-500/25 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between items-center bg-zinc-900/80 backdrop-blur border border-white/5 rounded px-1 py-0.5">
                  <span className="text-[9px] font-bold text-zinc-400">Position {index + 1}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => movePhoto(index, 'left')}
                      className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700"
                    >
                      <MoveLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === photos.length - 1}
                      onClick={() => movePhoto(index, 'right')}
                      className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700"
                    >
                      <MoveRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add more photo card */}
          <div
            onClick={triggerUpload}
            className="border border-dashed border-white/10 hover:border-coral-500/30 rounded-xl bg-zinc-900/20 hover:bg-zinc-900/40 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-[4/3] group"
          >
            <Plus className="w-6 h-6 text-zinc-500 group-hover:text-coral-500 transition-colors" />
            <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-400 mt-1 uppercase tracking-wider">
              Add Photo
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
