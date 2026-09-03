'use client';

import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, Trash2, Info, CheckCircle2, 
  X, Loader2 
} from 'lucide-react';

export type ModalVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  description = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger',
  isLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading && !internalLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, internalLoading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setInternalLoading(false);
    }
  };

  const isProcessing = isLoading || internalLoading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="h-5 w-5 text-red-400" />,
          iconBg: 'bg-red-500/10 border-red-500/20',
          confirmBtn: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 border-red-500/50',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
          iconBg: 'bg-amber-500/10 border-amber-500/20',
          confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 border-amber-500/50',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
          iconBg: 'bg-emerald-500/10 border-emerald-500/20',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20 border-emerald-500/50',
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5 text-cyan-400" />,
          iconBg: 'bg-cyan-500/10 border-cyan-500/20',
          confirmBtn: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 border-cyan-500/50',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div 
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0a0d16] p-5 sm:p-6 shadow-2xl relative overflow-hidden animate-card-reveal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Glow Accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          variant === 'danger' ? 'bg-red-500' : variant === 'warning' ? 'bg-amber-500' : variant === 'success' ? 'bg-emerald-500' : 'bg-cyan-500'
        }`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header with Icon */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border shrink-0 ${styles.iconBg}`}>
            {styles.icon}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-base font-bold text-white tracking-wide">
              {title}
            </h3>
            <div className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 transition-all disabled:opacity-40"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 disabled:opacity-40 ${styles.confirmBtn}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
