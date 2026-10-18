import type { GeoLocation } from './travel';

export type MediaKind = 'photo' | 'video';
export type VideoContainer = 'mp4' | 'webm';
export type VideoCodecStatus = 'runtime-required' | 'supported' | 'unsupported' | 'unknown';

export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  fileName: string;
  localPath: string;
  mimeType: string;
  sizeBytes: number;
  contentHash: string;
  date: string;
  durationMs?: number;
  width?: number;
  height?: number;
  codec?: string;
  codecStatus?: VideoCodecStatus;
  thumbnailPath?: string;
  thumbnailStatus: 'generated' | 'placeholder' | 'not-applicable';
  location?: GeoLocation;
  albumId?: string;
  tripId?: string;
}
