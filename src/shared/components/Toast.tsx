'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, isVisible, type = 'success', onClose }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  if (isVisible && !shouldRender) {
    setShouldRender(true);
  }

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // 5 seconds for errors might be better to read
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender && !isVisible) return null;

  const bgClass = type === 'success' ? 'bg-emerald-50 border-emerald-100 shadow-emerald-200/40' : 'bg-red-50 border-red-100 shadow-red-200/40';
  const textClass = type === 'success' ? 'text-emerald-800' : 'text-red-800';

  return (
    <div
      className={`fixed top-8 left-1/2 z-[100] -translate-x-1/2 transform transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
      }`}
      onTransitionEnd={() => {
        if (!isVisible) setShouldRender(false);
      }}
    >
      <div className={`flex items-center justify-center rounded-xl border px-8 py-4 shadow-lg ${bgClass}`}>
        <p className={`text-base font-medium ${textClass}`}>{message}</p>
      </div>
    </div>
  );
}
