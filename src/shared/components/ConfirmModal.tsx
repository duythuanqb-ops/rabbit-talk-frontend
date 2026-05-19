'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colorStyles = {
    danger: {
      bg: 'bg-rose-50',
      icon: 'text-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
    },
    warning: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
    },
    info: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200',
    },
  };

  const style = colorStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${style.bg} ${style.icon}`}>
              <AlertTriangle size={24} />
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-sm transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2.5 text-white font-bold rounded-xl text-sm transition shadow-lg ${style.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
