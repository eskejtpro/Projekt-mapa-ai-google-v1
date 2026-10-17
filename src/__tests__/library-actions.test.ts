import { describe, it, expect } from 'vitest';
import { removeAlbum } from '../services/library-actions';
import { DEMO_PHOTOS, DEMO_ALBUMS } from '../data/demoMemories';

describe('usuwanie albumu', () => {
  it('zachowuje zdjęcia bez wiszącej relacji i nie zmienia oryginalnych danych', () => {
    const album = DEMO_ALBUMS[0];
    const result = removeAlbum(DEMO_PHOTOS, DEMO_ALBUMS, album.id, false);
    expect(result.photos).toHaveLength(DEMO_PHOTOS.length);
    expect(result.photos.some(photo => photo.albumId === album.id)).toBe(false);
    expect(result.albums.some(item => item.id === album.id)).toBe(false);
    expect(DEMO_ALBUMS.some(item => item.id === album.id)).toBe(true);
  });
  it('usuwa wyłącznie zdjęcia wskazanego albumu', () => {
    const album = DEMO_ALBUMS[0];
    const result = removeAlbum(DEMO_PHOTOS, DEMO_ALBUMS, album.id, true);
    expect(result.photos.map(photo => photo.id)).toEqual(DEMO_PHOTOS.filter(photo => photo.albumId !== album.id).map(photo => photo.id));
    expect(() => removeAlbum(DEMO_PHOTOS, DEMO_ALBUMS, 'unknown', true)).toThrow();
  });
});
