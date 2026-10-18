import { describe, it, expect } from 'vitest';
import { photosForTrip } from '../services/trip-media';
import type { TravelAlbum, TravelPhoto } from '../types/travel';

describe('wybór mediów podróży', () => {
  const photos = [{ id: 'one', albumId: 'album-one' }, { id: 'two', albumId: 'album-two' }] as TravelPhoto[];
  const albums = [{ id: 'album-one', tripId: 'custom-trip' }, { id: 'album-two', tripId: 'other-trip' }] as TravelAlbum[];
  it('korzysta z relacji albumu zamiast nazw i krajów demonstracyjnych', () => {
    expect(photosForTrip(photos, albums, 'custom-trip').map(photo => photo.id)).toEqual(['one']);
    expect(photosForTrip(photos, albums, 'missing-trip')).toEqual([]);
  });
  it('bez filtra zachowuje pełną bibliotekę i jej kolejność', () => {
    expect(photosForTrip(photos, albums, null)).toBe(photos);
  });
});
