export {};
declare global {
  interface Window {
    electronAPI?: {
      minimize(): Promise<boolean>;
      maximize(): Promise<boolean>;
      close(): Promise<boolean>;
    };
  }
}
