import { TravelPhoto, TravelAlbum } from '../types/travel';

export function removeAlbum(photos: TravelPhoto[], albums: TravelAlbum[], id: string, deletePhotos: boolean) {
  if (!albums.some(album => album.id === id)) throw new Error('Album nie istnieje');
  return {
    photos: deletePhotos ? photos.filter(photo => photo.albumId !== id) : photos.map(photo => photo.albumId === id ? { ...photo, albumId: '' } : photo),
    albums: albums.filter(album => album.id !== id),
  };
}
