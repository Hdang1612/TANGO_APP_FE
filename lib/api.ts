import axios, { InternalAxiosRequestConfig } from "axios";
import { useLoadingStore } from "@/store/useLoadingStore";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipLoading?: boolean;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Activate global loading overlay
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!config.skipLoading) {
      useLoadingStore.getState().startLoading();
    }
    return config;
  },
  (error) => {
    useLoadingStore.getState().stopLoading();
    return Promise.reject(error);
  }
);

// Response Interceptor: Deactivate global loading overlay
api.interceptors.response.use(
  (response) => {
    if (!response.config?.skipLoading) {
      useLoadingStore.getState().stopLoading();
    }
    return response;
  },
  (error) => {
    if (!error.config?.skipLoading) {
      useLoadingStore.getState().stopLoading();
    }
    return Promise.reject(error);
  }
);

export default api;
