import {createRoot} from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';
import './index.css';
import { migrateDesktopPersistence } from './services/persistence';

try {
  migrateDesktopPersistence();
  createRoot(document.getElementById('root')!).render(<App />);
} catch {
  document.getElementById('root')!.textContent = 'Nie udało się otworzyć biblioteki. Dane źródłowe zachowano. Uruchom ponownie aplikację lub przywróć kopię bezpieczeństwa.';
}
