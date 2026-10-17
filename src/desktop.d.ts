export {};
declare global {
  interface Window {
    electronAPI?: {
      discoverTVs(): Promise<{ id: string; address: string; description: string; protocol: string }[]>;
      importOfflineMap(): Promise<{ name: string; sizeMb: number } | null>;
      removeOfflineMap(): Promise<boolean>;
      systemInfo(): Promise<{ photosPath: string; autoStart: boolean; packaged: boolean; offlineMapAvailable: boolean }>;
      openPhotos(): Promise<boolean>;
      setAutoStart(enabled: boolean): Promise<boolean>;
      storage: {
        get(key: string): string | null;
        set(key: string, value: string): void;
        batch(entries: [string, string][]): void;
      };
      minimize(): Promise<boolean>;
      maximize(): Promise<boolean>;
      close(): Promise<boolean>;
    };
  }
}
