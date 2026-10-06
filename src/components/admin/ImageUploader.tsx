'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { ProductImageItem } from '@/lib/products-db';
import { Upload, X, Star, ArrowLeft, ArrowRight, ImagePlus } from 'lucide-react';

interface ImageUploaderProps {
  images: ProductImageItem[];
  onChange: (updatedImages: ProductImageItem[]) => void;
  disabled?: boolean;
}

export default function ImageUploader({ images, onChange, disabled = false }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const filesArray = Array.from(e.target.files);
    const newItems: ProductImageItem[] = filesArray.map((file, idx) => ({
      image_url: URL.createObjectURL(file),
      file,
      sort_order: images.length + idx,
      is_primary: images.length === 0 && idx === 0, // First image uploaded becomes primary if no images exist
      isNew: true,
    }));

    const updated = [...images, ...newItems];

    // Ensure exactly 1 primary image exists
    const hasPrimary = updated.some((img) => img.is_primary);
    if (!hasPrimary && updated.length > 0) {
      updated[0].is_primary = true;
    }

    onChange(updated);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // Re-index sort order
    const reindexed = updated.map((img, i) => ({ ...img, sort_order: i }));

    // If primary was deleted, assign primary to first item
    if (reindexed.length > 0 && !reindexed.some((img) => img.is_primary)) {
      reindexed[0].is_primary = true;
    }

    onChange(reindexed);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Update sort_order explicitly
    const reindexed = updated.map((img, i) => ({ ...img, sort_order: i }));
    onChange(reindexed);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-sans">
          Product Images ({images.length})
        </label>
        <span className="text-xs text-slate-500 font-sans">
          First image or starred image is primary
        </span>
      </div>

      {/* Grid of Preview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div
            key={img.id || img.image_url || idx}
            className={`relative group rounded-xl overflow-hidden border bg-white shadow-xs transition-all ${
              img.is_primary ? 'border-sky-500 ring-2 ring-sky-400/30' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Aspect Ratio Container */}
            <div className="relative aspect-[4/5] w-full bg-slate-100">
              <Image
                src={img.image_url}
                alt={`Product Image ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized={img.image_url.startsWith('blob:')}
              />

              {/* Primary Badge */}
              {img.is_primary && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-sky-500 text-white text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-white" />
                  <span>Primary</span>
                </div>
              )}

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    disabled={disabled}
                    className="p-1.5 rounded-full bg-white/90 text-slate-700 hover:text-rose-600 hover:bg-white transition-colors"
                    title="Delete Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1">
                  {/* Move Left */}
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'left')}
                    disabled={disabled || idx === 0}
                    className="p-1.5 rounded-full bg-white/90 text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
                    title="Move Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Set Primary Button */}
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      disabled={disabled}
                      className="px-2 py-1 rounded-md bg-white/90 text-slate-900 text-[11px] font-semibold hover:bg-sky-500 hover:text-white transition-colors shadow-xs"
                    >
                      Make Primary
                    </button>
                  )}

                  {/* Move Right */}
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'right')}
                    disabled={disabled || idx === images.length - 1}
                    className="p-1.5 rounded-full bg-white/90 text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
                    title="Move Right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Position footer */}
            <div className="py-1 px-2.5 bg-slate-50 text-[11px] font-sans text-slate-500 flex justify-between items-center border-t border-slate-100">
              <span>Order #{idx + 1}</span>
              {img.isNew && <span className="text-sky-600 font-medium">New</span>}
            </div>
          </div>
        ))}

        {/* Upload Trigger Box */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="aspect-[4/5] flex flex-col items-center justify-center p-4 border-2 border-dashed border-sky-200 rounded-xl bg-sky-50/40 hover:bg-sky-50 hover:border-sky-400 text-sky-700 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform mb-2">
            <ImagePlus className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold font-sans">Upload Images</span>
          <span className="text-[10px] text-slate-400 mt-1 font-sans text-center">
            PNG, JPG, WEBP up to 10MB
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
