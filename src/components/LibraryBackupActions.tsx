import { useState } from 'react';
import { Download, Upload } from 'lucide-react';

export function LibraryBackupActions() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [failed, setFailed] = useState(false);
  if (!window.electronAPI) return null;
  const run = async (operation: 'create' | 'restore') => {
    setBusy(true); setStatus(''); setFailed(false);
    try {
      const result = await window.electronAPI!.libraryBackup(operation);
      if (!result) return;
      if (operation === 'restore') window.location.reload();
      else setStatus(`Pełna kopia została sprawdzona i zapisana: ${result.directory}`);
    } catch (error) { setFailed(true); setStatus(error instanceof Error ? error.message : 'Nie udało się wykonać kopii. Spróbuj ponownie.'); }
    finally { setBusy(false); }
  };
  return <section aria-label="Pełna kopia zdjęć i filmów" className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-4">
    <div><h4 className="font-semibold text-white">Pełna kopia zdjęć i filmów</h4><p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-300">Zapisz folder z bazą, zdjęciami i filmami na innym dysku. Pliki są sprawdzane sumami kontrolnymi. Przywracanie dodaje dane i zatrzymuje się w razie konfliktu.</p></div>
    <div className="flex flex-wrap gap-3">
      <button disabled={busy} onClick={() => void run('create')} className="min-h-11 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"><Download className="inline h-4 w-4 mr-2" />Zapisz pełną kopię</button>
      <button disabled={busy} onClick={() => void run('restore')} className="min-h-11 rounded-lg border border-slate-600 px-4 text-sm text-white hover:bg-slate-800 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-amber-400"><Upload className="inline h-4 w-4 mr-2" />Przywróć pełną kopię</button>
    </div>
    {busy && <p role="status" className="text-sm text-amber-200">Kopiowanie dużych filmów może potrwać. Zaczekaj na zakończenie.</p>}
    {status && <p role={failed ? 'alert' : 'status'} className={`break-words text-sm ${failed ? 'text-red-300' : 'text-slate-200'}`}>{status}</p>}
  </section>;
}
