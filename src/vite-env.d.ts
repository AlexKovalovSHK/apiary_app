/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }): () => void;
}
