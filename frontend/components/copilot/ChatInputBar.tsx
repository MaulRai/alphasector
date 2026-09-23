'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Paperclip, RefreshCw, Send, X, FileText, Plus, 
  Network, Zap, Globe, ChevronRight, ImagePlus, ExternalLink 
} from 'lucide-react';
import { AttachedImageData } from '@/hooks/useImageUpload';
import { PastedContextItem } from '@/lib/contextClipboard';
import { getProtocolPreference, setProtocolPreference } from '@/lib/api';

interface ChatInputBarProps {
  inputQuery: string;
  onInputChange: (val: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  isClarificationPending?: boolean;
  attachedImage: AttachedImageData | null;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  pastedContexts?: PastedContextItem[];
  onRemovePastedContext?: (id: string) => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  inputQuery,
  onInputChange,
  onSubmit,
  isLoading,
  isClarificationPending = false,
  attachedImage,
  onRemoveImage,
  fileInputRef,
  onImageSelect,
  onPaste,
  textareaRef,
  pastedContexts = [],
  onRemovePastedContext,
}) => {
  const localTextareaRef = useRef<HTMLTextAreaElement>(null);
  const activeTextareaRef = textareaRef || localTextareaRef;

  // Action Menu & Protocol Toggle states
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [protocolMode, setProtocolMode] = useState<'rest' | 'mcp'>('rest');
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setProtocolMode(getProtocolPreference());
  }, []);

  const handleSelectProtocol = (mode: 'rest' | 'mcp') => {
    setProtocolMode(mode);
    setProtocolPreference(mode);
  };

  // Close action menu on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        actionMenuRef.current && 
        !actionMenuRef.current.contains(e.target as Node) &&
        actionButtonRef.current &&
        !actionButtonRef.current.contains(e.target as Node)
      ) {
        setIsActionMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActionMenuOpen) {
        setIsActionMenuOpen(false);
      }
    };

    if (isActionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActionMenuOpen]);

  // Auto expand/shrink textarea when inputQuery changes (including initial draft restoration)
  useEffect(() => {
    if (activeTextareaRef.current) {
      activeTextareaRef.current.style.height = 'auto';
      if (inputQuery) {
        activeTextareaRef.current.style.height = `${Math.min(activeTextareaRef.current.scrollHeight, 84)}px`;
      }
    }
  }, [inputQuery, activeTextareaRef]);

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
      {/* Attachments & Pasted Contexts Bar - Horizontal stackable (menyamping) */}
      {(attachedImage || (pastedContexts && pastedContexts.length > 0)) && (
        <div className="max-w-4xl mx-auto mb-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* Attached Image (if any) */}
          {attachedImage && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#0d121e] border border-emerald-500/40 text-xs text-slate-200 animate-card-reveal shrink-0 max-w-[280px] sm:max-w-[320px]">
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
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors shrink-0 ml-2 cursor-pointer"
                title="Hapus gambar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Pasted Contexts (stacked horizontally, wise limit 3) */}
          {pastedContexts.map((ctx) => (
            <div
              key={ctx.id}
              className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#0d121e] border border-emerald-500/40 text-xs text-slate-200 animate-card-reveal shrink-0 max-w-[280px] sm:max-w-[340px] shadow-sm hover:border-emerald-500/60 transition-all"
              title={`${ctx.title}\n${ctx.summary}`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0 mr-1.5">
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  ctx.type === 'INSIDER_FILINGS'
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : ctx.type === 'INSTITUTIONAL_OWNERSHIP'
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}>
                  <FileText className="h-4 w-4" />
                </div>
                <div className="truncate min-w-0">
                  <span className="font-semibold text-emerald-400 block truncate text-xs">
                    Pasted Context: {ctx.title}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {ctx.summary}
                  </span>
                </div>
              </div>
              {onRemovePastedContext && (
                <button
                  type="button"
                  onClick={() => onRemovePastedContext(ctx.id)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors shrink-0 ml-1 cursor-pointer"
                  title="Hapus konteks ini"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className={`max-w-4xl mx-auto relative flex items-end rounded-2xl border transition-all p-2 ${
          isClarificationPending
            ? 'border-slate-800/80 bg-[#090d16]/70 opacity-60 cursor-not-allowed shadow-none'
            : 'border-slate-700/80 bg-[#0d121e] shadow-2xl focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 glow-emerald'
        }`}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onImageSelect}
          className="hidden"
        />

        {/* Plus / Action Menu Button & Popover */}
        <div className="relative shrink-0 mb-0.5 ml-1 mr-1.5">
          <button
            ref={actionButtonRef}
            type="button"
            onClick={() => setIsActionMenuOpen((prev) => !prev)}
            disabled={isLoading || isClarificationPending}
            title={
              isClarificationPending
                ? "Silakan jawab pertanyaan klarifikasi di atas terlebih dahulu"
                : "Menu Tindakan & Protokol Sectors"
            }
            className={`p-2 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isActionMenuOpen
                ? 'bg-slate-700 text-emerald-400 ring-2 ring-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80'
            }`}
          >
            <Plus className={`h-4 w-4 transition-transform duration-200 ${isActionMenuOpen ? 'rotate-45' : ''}`} />
          </button>

          {/* Action Menu Popover */}
          {isActionMenuOpen && (
            <div
              ref={actionMenuRef}
              className="absolute left-0 bottom-full mb-3 w-72 sm:w-80 rounded-2xl border border-slate-700/80 bg-[#0d1322]/98 backdrop-blur-2xl shadow-2xl p-2.5 z-50 space-y-2.5 animate-step-vertical-fade text-xs"
              style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)' }}
            >
              {/* Option 1: Upload File / Gambar */}
              <button
                type="button"
                onClick={() => {
                  setIsActionMenuOpen(false);
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/40 text-left group transition-all duration-200 cursor-pointer shadow-sm hover:shadow-emerald-950/20 active:scale-[0.98]"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all shrink-0">
                  <ImagePlus className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <span className="font-semibold text-slate-100 block group-hover:text-emerald-300 transition-colors text-xs">
                    Upload Gambar / Laporan
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    Chart atau screenshot laporan emiten
                  </span>
                </div>
              </button>

              {/* Divider */}
              <div className="h-px bg-slate-800/80 my-1" />

              {/* Option 2: Protokol Data Sectors (REST <-> MCP) */}
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/70 space-y-2">
                <div className="flex items-center gap-2">
                  <Network className="h-3.5 w-3.5 text-teal-400" />
                  <span className="font-semibold text-slate-200 text-xs">
                    Protokol Data Sectors
                  </span>
                </div>

                {/* Segmented Switch REST <-> MCP */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-slate-950/80 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleSelectProtocol('rest')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      protocolMode === 'rest'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Zap className="h-3 w-3" />
                    <span>REST (Cepat)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectProtocol('mcp')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      protocolMode === 'mcp'
                        ? 'bg-teal-500/20 text-teal-200 border border-teal-500/40 shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Globe className="h-3 w-3" />
                    <span>Sectors MCP</span>
                  </button>
                </div>

                {/* Sub-action: Link to /mcp-tools page in a new tab */}
                <Link
                  href="/mcp-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsActionMenuOpen(false)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-950/60 hover:bg-teal-500/10 border border-slate-800/80 hover:border-teal-500/30 text-teal-300 hover:text-teal-200 text-[11px] font-medium transition-all cursor-pointer group"
                >
                  <span className="truncate group-hover:underline">
                    Katalog Tools Sectors MCP (66 Tools)
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-teal-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Auto-wrapping & Auto-expanding Textarea */}
        <textarea
          ref={activeTextareaRef}
          rows={1}
          value={inputQuery}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
          placeholder={
            isClarificationPending
              ? "Pilih fokus riset pada opsi pertanyaan di atas untuk melanjutkan..."
              : attachedImage
              ? "Tanyakan analisis gambar ini ke AlphaAgent..."
              : pastedContexts.length > 0
              ? `Tanyakan analisis terkait ${pastedContexts.length} konteks tersalin ini ke AlphaAgent...`
              : "Tanyakan analisis emiten ke AlphaAgent..."
          }
          className={`w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none px-2 py-1.5 resize-none overflow-y-auto max-h-[84px] leading-relaxed my-auto ${
            isClarificationPending ? 'cursor-not-allowed placeholder-slate-400 font-medium' : ''
          }`}
          disabled={isLoading || isClarificationPending}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isClarificationPending || (!inputQuery.trim() && !attachedImage && pastedContexts.length === 0)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 mb-0.5 ml-1.5 cursor-pointer"
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
        {protocolMode === 'mcp' && (
          <>
            <span className="text-slate-700">•</span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded border bg-teal-500/10 text-teal-400 border-teal-500/30">
              🌐 MCP Protocol
            </span>
          </>
        )}
      </div>
    </div>
  );
};
