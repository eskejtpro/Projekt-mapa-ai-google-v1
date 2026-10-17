import { TravelPhoto, TravelAlbum } from '../types/travel';

export interface TravelPhotoPack {
  id: string;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  year: number;
  description: string;
  coverUrl: string;
  photos: {
    title: string;
    url: string;
    lat: number;
    lng: number;
    cityName: string;
    placeName: string;
    notes: string;
    date: string;
    tags: string[];
  }[];
}

export const READY_TRAVEL_PACKS: TravelPhotoPack[] = [
  {
    id: 'pack-tatry',
    name: 'Wyprawa na Tatrzańskie Szczyty',
    region: 'Tatry i Podhale',
    country: 'Polska',
    countryCode: 'PL',
    year: 2024,
    description: 'Niezapomniane widoki Morskiego Oka, Kasprowego Wierchu i Doliny Kościeliskiej.',
    coverUrl: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80',
    photos: [
      {
        title: 'Szmaragdowe Morskie Oko o Poranku',
        url: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1200&q=80',
        lat: 49.2005,
        lng: 20.0711,
        cityName: 'Zakopane',
        placeName: 'Morskie Oko',
        notes: 'Cisza i spokój przed nadejściem turystów. Odbicie Rysów w tafli jeziora zapierało dech w piersiach.',
        date: '2024-08-14',
        tags: ['Góry', 'Jezioro', 'Tatry', 'Wędrówka'],
      },
      {
        title: 'Kolejka na Kasprowy Wierch',
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        lat: 49.2325,
        lng: 19.9817,
        cityName: 'Zakopane',
        placeName: 'Kasprowy Wierch',
        notes: 'Wjazd wagonikiem w chmury. Wiatr na grani i widok na polską i słowacką stronę Tatr.',
        date: '2024-08-15',
        tags: ['Kolejka', 'Tatry', 'Szczyty'],
      },
      {
        title: 'Wodospad Siklawa w Dolinie Roztoki',
        url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
        lat: 49.2136,
        lng: 20.0489,
        cityName: 'Zakopane',
        placeName: 'Siklawa',
        notes: 'Największy wodospad w Tatrach, orzeźwiająca bryza po długim podejściu szlakiem.',
        date: '2024-08-16',
        tags: ['Wodospad', 'Przyroda', 'Woda'],
      },
    ],
  },
  {
    id: 'pack-baltic',
    name: 'Bursztynowy Bałtyk – Hel i Trójmiasto',
    region: 'Pomorze',
    country: 'Polska',
    countryCode: 'PL',
    year: 2024,
    description: 'Szerokie piaszczyste plaże, molo w Sopocie, żaglowce i urok gdańskiej Starówki.',
    coverUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    photos: [
      {
        title: 'Cypel Helski – Początek Polski',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        lat: 54.5986,
        lng: 18.8144,
        cityName: 'Hel',
        placeName: 'Plaża na Cyplu Helskim',
        notes: 'Miejsce gdzie morze styka się z Zatoką Pucką. Szum fal i wiatr od otwartego Bałtyku.',
        date: '2024-07-20',
        tags: ['Morze', 'Plaża', 'Polska', 'Wydmy'],
      },
      {
        title: 'Żuraw i Długie Pobrzeże w Gdańsku',
        url: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80',
        lat: 54.3520,
        lng: 18.6466,
        cityName: 'Gdańsk',
        placeName: 'Długie Pobrzeże',
        notes: 'Wieczorny spacer nad Motławą. Podświetlone kamieniczki i zapach smażonej ryby.',
        date: '2024-07-22',
        tags: ['Gdańsk', 'Architektura', 'Zabytki'],
      },
    ],
  },
  {
    id: 'pack-cinqueterre',
    name: 'Kolorowe Wioski Cinque Terre',
    region: 'Liguria',
    country: 'Włochy',
    countryCode: 'IT',
    year: 2024,
    description: 'Kolorowe domy zawieszone na stromych klifach nad Morzem Liguryjskim.',
    coverUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
    photos: [
      {
        title: 'Manarola o Złotej Godzinie',
        url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
        lat: 44.1065,
        lng: 9.7288,
        cityName: 'Manarola',
        placeName: 'Klif widokowy',
        notes: 'Pastele budynków kąpiące się w zachodzącym włoskim słońcu. Degustacja lokalnego wina Sciacchetrà.',
        date: '2024-09-08',
        tags: ['Włochy', 'Morze', 'Zachód Słońca', 'Klify'],
      },
      {
        title: 'Vernazza – Przystań Rybacka',
        url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
        lat: 44.1354,
        lng: 9.6836,
        cityName: 'Vernazza',
        placeName: 'Port w Vernazzie',
        notes: 'Jedyna naturalna przystań w Cinque Terre. Kolorowe łódki kołyszące się na lazurowej wodzie.',
        date: '2024-09-09',
        tags: ['Włochy', 'Przystań', 'Port'],
      },
    ],
  },
  {
    id: 'pack-paris',
    name: 'Romantyczny Paryż i Sekwana',
    region: 'Île-de-France',
    country: 'Francja',
    countryCode: 'FR',
    year: 2023,
    description: 'Wieża Eiffla, Luwr, Montmartre i aromatyczna kawa w paryskich kawiarenkach.',
    coverUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    photos: [
      {
        title: 'Wieża Eiffla z Pól Marsowych',
        url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
        lat: 48.8584,
        lng: 2.2945,
        cityName: 'Paryż',
        placeName: 'Champ de Mars',
        notes: 'Piknik na trawie z chrupiącą bagietką i serem brie z widokiem na Żelazną Damę.',
        date: '2023-05-18',
        tags: ['Paryż', 'Wieża Eiffla', 'Francja'],
      },
      {
        title: 'Luwr – Szklana Piramida o Zmierzchu',
        url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
        lat: 48.8606,
        lng: 2.3376,
        cityName: 'Paryż',
        placeName: 'Musée du Louvre',
        notes: 'Nowoczesna piramida w harmonii ze starym pałacem królewskim.',
        date: '2023-05-19',
        tags: ['Muzeum', 'Sztuka', 'Architektura'],
      },
    ],
  },
  {
    id: 'pack-croatia',
    name: 'Słoneczna Dalmacja – Dubrownik i Split',
    region: 'Dalmacja',
    country: 'Chorwacja',
    countryCode: 'HR',
    year: 2024,
    description: 'Średniowieczne mury obronne, krystaliczny Adriatyk i rzymski pałac Dioklecjana.',
    coverUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    photos: [
      {
        title: 'Mury Obronne Dubrownika',
        url: 'https://images.unsplash.com/photo-1555990538-16e64906d649?auto=format&fit=crop&w=1200&q=80',
        lat: 42.6412,
        lng: 18.1105,
        cityName: 'Dubrownik',
        placeName: 'Mury Miejskie',
        notes: 'Spacer po dwukilometrowych kamiennych murach. W dole czerwone dachy i głęboki błękit morza.',
        date: '2024-06-12',
        tags: ['Chorwacja', 'Adriatyk', 'Historia', 'Zabytki'],
      },
      {
        title: 'Promenada Riva w Splicie',
        url: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
        lat: 43.5081,
        lng: 16.4402,
        cityName: 'Split',
        placeName: 'Riva Promenade',
        notes: 'Palmy wzdłuż nabrzeża, chłodna lemoniada i widok na cumujące promy na wyspy Hvar i Brač.',
        date: '2024-06-14',
        tags: ['Chorwacja', 'Palmy', 'Promenada'],
      },
    ],
  },
];

export function convertPackToPhotosAndAlbum(pack: TravelPhotoPack): { photos: TravelPhoto[]; album: TravelAlbum } {
  const albumId = `album-pack-${pack.id}-${Date.now()}`;
  const album: TravelAlbum = {
    id: albumId,
    name: pack.name,
    description: pack.description,
    coverUrl: pack.coverUrl,
    year: pack.year,
    country: pack.country,
    isDemo: false,
  };

  const photos: TravelPhoto[] = pack.photos.map((p, idx) => ({
    id: `photo-pack-${pack.id}-${Date.now()}-${idx}`,
    url: p.url,
    thumbnailUrl: p.url,
    title: p.title,
    date: p.date,
    location: {
      lat: p.lat,
      lng: p.lng,
      cityName: p.cityName,
      countryName: pack.country,
      countryCode: pack.countryCode,
      placeName: p.placeName,
    },
    albumId: albumId,
    notes: p.notes,
    participants: ['Rodzina', 'Przyjaciele'],
    tags: p.tags,
    isFavorite: idx === 0,
    isDemo: false,
    fileName: `${p.title.replace(/\s+/g, '_')}.jpg`,
    fileSize: '4.2 MB',
    localFilePath: `C:\\Prezent\\Wspomnienia\\${pack.name}\\${p.title}.jpg`,
  }));

  return { photos, album };
}
