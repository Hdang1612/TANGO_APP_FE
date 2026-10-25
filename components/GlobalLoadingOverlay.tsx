'use client';

import { useEffect } from 'react';
import { useLoadingStore } from '@/store/useLoadingStore';
import { Loader2 } from 'lucide-react';

export function GlobalLoadingOverlay() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  // Prevent keyboard activation (Enter, Space, Tab) while loading is active
  useEffect(() => {
    if (!isLoading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-label="Đang tải..."
      aria-live="polite"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-xs select-none cursor-wait animate-in fade-in duration-150"
      style={{ pointerEvents: 'auto' }}
    >
      <Loader2 className="w-10 h-10 animate-spin text-white drop-shadow-md" />
    </div>
  );
}
