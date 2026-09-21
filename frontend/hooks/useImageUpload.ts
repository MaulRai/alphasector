'use client';

import { useState, useRef, useCallback } from 'react';

export interface AttachedImageData {
  base64: string;
  mimeType: string;
  previewUrl: string;
  fileName: string;
}

export function useImageUpload(initialImage: AttachedImageData | null = null) {
  const [attachedImage, setAttachedImage] = useState<AttachedImageData | null>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    // Max 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran gambar melebihi batas 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setAttachedImage({
        base64,
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file),
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input value so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFile]);

  const handleClearImage = useCallback(() => {
    if (attachedImage?.previewUrl) {
      URL.revokeObjectURL(attachedImage.previewUrl);
    }
    setAttachedImage(null);
  }, [attachedImage]);

  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          break;
        }
      }
    }
  }, [processFile]);

  return {
    attachedImage,
    fileInputRef,
    handleFileChange,
    handleClearImage,
    triggerFilePicker,
    handlePaste,
    setAttachedImage,
  };
}
