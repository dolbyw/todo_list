/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistration {
  readonly sync: SyncManager;
}
/// <reference types="vite-plugin-pwa/client" />