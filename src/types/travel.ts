export interface GeoLocation {
  lat: number;
  lng: number;
  cityName: string;
  countryName: string;
  countryCode: string; // np. 'IT', 'GR', 'PL', 'JP', 'NO'
  placeName?: string;
}

export interface TravelPhoto {
  id: string;
  url: string; // URL lub DataURL (base64)
  thumbnailUrl?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location: GeoLocation;
  albumId: string;
  notes: string;
  participants: string[]; // np. ['Mama', 'Tata', 'Zosia', 'Kacper']
  tags: string[]; // np. ['Plaża', 'Zachód słońca', 'Góry', 'Kulinaria']
  isFavorite: boolean;
  isDemo?: boolean;
  cameraInfo?: {
    make?: string;
    model?: string;
    focalLength?: string;
    iso?: string;
  };
  fileSize?: string;
  fileName?: string;
  localFilePath?: string; // np. "C:\Prezent\Zdjecia\Santorini_2024.jpg"
}

export interface TravelTrip {
  id: string;
  title: string;
  description: string;
  year: number;
  coverPhotoUrl: string;
  color: string;
  routePoints: {
    lat: number;
    lng: number;
    name: string;
    order: number;
  }[];
  totalDistanceKm?: number;
  transportType?: 'car' | 'plane' | 'train' | 'camper' | 'foot';
}

export interface TravelAlbum {
  id: string;
  name: string;
  tripId?: string;
  description: string;
  coverUrl: string;
  year: number;
  country: string;
  isDemo?: boolean;
}

export type MapTileProvider = 'osm' | 'dark' | 'light' | 'satellite';

export interface OfflineMapPackage {
  id: string;
  name: string;
  region: string;
  estimatedSizeMb: number;
  bounds: [[number, number], [number, number]];
  isDownloaded: boolean;
  downloadProgress?: number;
  downloadDate?: string;
}
