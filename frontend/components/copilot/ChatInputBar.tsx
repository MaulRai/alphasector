'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Paperclip, RefreshCw, Send, X } from 'lucide-react';
import { AttachedImageData } from '@/hooks/useImageUpload';

interface ChatInputBarProps {
  inputQuery: string;
  onInputChange: (val: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  attachedImage: AttachedImageData | null;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  inputQuery,
  onInputChange,
  onSubmit,
  isLoading,
  attachedImage,
  onRemoveImage,
  fileInputRef,
  onImageSelect,
  onPaste,
  textareaRef,
}) => {
  const localTextareaRef = useRef<HTMLTextAreaElement>(null);
  const activeTextareaRef = textareaRef || localTextareaRef;

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
    // Auto expand textarea up to 3 lines (max 84px)
    if (activeTextareaRef.current) {
      activeTextareaRef.current.style.height = 'auto';
      activeTextareaRef.current.style.height = `${Math.min(activeTextareaRef.current.scrollHeight, 84)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-[#080b13]/95 backdrop-blur-md shrink-0">
      {/* Image Preview Chip if attached */}
      {attachedImage && (
        <div className="max-w-4xl mx-auto mb-2 flex items-center justify-between px-3 py-2 rounded-xl bg-[#0d121e] border border-emerald-500/40 text-xs text-slate-200 animate-card-reveal">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachedImage.previewUrl}
              alt="Preview"
              className="h-8 w-8 object-cover rounded-lg border border-slate-700 shrink-0"
            />
            <div className="truncate">
              <span className="font-semibold text-emerald-400 block truncate">{attachedImage.fileName}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveImage}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors shrink-0 ml-2"
            title="Hapus gambar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="max-w-4xl mx-auto relative flex items-end rounded-2xl border border-slate-700/80 bg-[#0d121e] p-2 shadow-2xl focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all glow-emerald"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onImageSelect}
          className="hidden"
        />

        {/* Attach Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title="Lampirkan Chart atau Screenshot Laporan Keuangan (Maks 10MB • Bisa juga langsung Ctrl+V)"
          className="p-2 ml-1 mr-1.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors shrink-0 disabled:opacity-40 mb-0.5"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        {/* Auto-wrapping & Auto-expanding Textarea */}
        <textarea
          ref={activeTextareaRef}
          rows={1}
          value={inputQuery}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
          placeholder={attachedImage ? "Tanyakan analisis gambar ini ke AlphaAgent..." : "Tanyakan analisis emiten ke AlphaAgent..."}
          className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none px-2 py-1.5 resize-none overflow-y-auto max-h-[84px] leading-relaxed my-auto"
          disabled={isLoading}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (!inputQuery.trim() && !attachedImage)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 mb-0.5 ml-1.5"
        >
          {isLoading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline">Kirim</span>
              <Send className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-2 flex-wrap">
        <span>Sesi terenkripsi</span>
        <span className="text-slate-700">•</span>
        <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
          <Image
            src="/images/sectors-icon.png"
            alt="Sectors Logo"
            width={13}
            height={13}
            className="rounded-sm object-contain"
          />
          <span>Terverifikasi Data Resmi Sectors Financial API</span>
        </span>
      </div>
    </div>
  );
};
