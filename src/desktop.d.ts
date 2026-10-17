export {};
declare global {
  interface Window {
    electronAPI?: {
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
