import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  activeRequests: number;
  startLoading: () => void;
  stopLoading: () => void;
  resetLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  activeRequests: 0,

  startLoading: () =>
    set((state) => {
      const nextCount = state.activeRequests + 1;
      return {
        activeRequests: nextCount,
        isLoading: true,
      };
    }),

  stopLoading: () =>
    set((state) => {
      const nextCount = Math.max(0, state.activeRequests - 1);
      return {
        activeRequests: nextCount,
        isLoading: nextCount > 0,
      };
    }),

  resetLoading: () =>
    set({
      isLoading: false,
      activeRequests: 0,
    }),
}));
