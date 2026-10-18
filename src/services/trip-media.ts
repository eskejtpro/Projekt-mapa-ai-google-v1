import type { TravelAlbum, TravelPhoto } from '../types/travel';

export function photosForTrip(photos: TravelPhoto[], albums: TravelAlbum[], tripId: string | null): TravelPhoto[] {
  if (!tripId) return photos;
  const albumIds = new Set(albums.filter(album => album.tripId === tripId).map(album => album.id));
  return photos.filter(photo => albumIds.has(photo.albumId));
}
