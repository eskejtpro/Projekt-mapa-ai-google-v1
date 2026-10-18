export {};
declare global {
  interface Window {
    electronAPI?: {
      onBackupError(callback: () => void): () => void;
      startRemote(): Promise<{ urls: string[]; port: number }>;
      stopRemote(): Promise<void>;
      onRemoteCommand(callback: (command: 'next' | 'previous' | 'toggle-play' | 'close') => void): () => void;
      discoverTVs(): Promise<{ id: string; address: string; description: string; protocol: string }[]>;
      importOfflineMap(): Promise<{ name: string; sizeMb: number } | null>;
      removeOfflineMap(): Promise<{ removedBytes: number }>;
      systemInfo(): Promise<{ photosPath: string; autoStart: boolean; packaged: boolean; offlineMapAvailable: boolean }>;
      openPhotos(): Promise<boolean>;
      openBackups(): Promise<boolean>;
      libraryBackup(operation: 'create' | 'restore'): Promise<{ directory: string; safety?: string } | null>;
      setAutoStart(enabled: boolean): Promise<boolean>;
      storage: {
        get(key: string): string | null;
        set(key: string, value: string): void;
        batch(entries: [string, string][]): void;
      };
      video: {
        import(): Promise<Array<{ duplicate: boolean; item: { id: string; playbackUrl: string; title: string; mimeType: string; sizeBytes: number } }>>;
        list(): Promise<Array<{ id: string; title: string; playbackUrl: string; mimeType: string; sizeBytes: number; thumbnailStatus: string }>>;
        setAlbum(id: string, albumId: string | null): Promise<boolean>;
        setLocation(id: string, location: import('./types/travel').GeoLocation | null, source?: 'user' | 'place'): Promise<boolean>;
      };
      minimize(): Promise<boolean>;
      maximize(): Promise<boolean>;
      close(): Promise<boolean>;
    };
  }
}
