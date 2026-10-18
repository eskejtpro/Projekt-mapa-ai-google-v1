const { contextBridge, ipcRenderer } = require('electron');
function storageCall(operation, ...args) {
  const result = ipcRenderer.sendSync('library:operation', operation, ...args);
  if (!result?.ok) throw new Error(result?.error || 'Błąd lokalnej bazy');
  return result.value;
}
contextBridge.exposeInMainWorld('electronAPI', Object.freeze({
  minimize: () => ipcRenderer.invoke('window:action', 'minimize'),
  maximize: () => ipcRenderer.invoke('window:action', 'maximize'),
  close: () => ipcRenderer.invoke('window:action', 'close'),
  systemInfo: () => ipcRenderer.invoke('system:action', 'info'),
  openPhotos: () => ipcRenderer.invoke('system:action', 'open-photos'),
  openBackups: () => ipcRenderer.invoke('system:action', 'open-backups'),
  setAutoStart: enabled => ipcRenderer.invoke('system:action', 'autostart', enabled),
  importOfflineMap: () => ipcRenderer.invoke('maps:import'),
  removeOfflineMap: () => ipcRenderer.invoke('system:action', 'remove-offline-map'),
  discoverTVs: () => ipcRenderer.invoke('tv:discover'),
  startRemote: () => ipcRenderer.invoke('remote:session', 'start'),
  stopRemote: () => ipcRenderer.invoke('remote:session', 'stop'),
  onBackupError: callback => {
    const listener = () => callback();
    ipcRenderer.on('backup:error', listener);
    return () => ipcRenderer.removeListener('backup:error', listener);
  },
  onRemoteCommand: callback => {
    const listener = (_event, command) => { if (['next', 'previous', 'toggle-play', 'close'].includes(command)) callback(command); };
    ipcRenderer.on('remote:command', listener);
    return () => ipcRenderer.removeListener('remote:command', listener);
  },
  storage: Object.freeze({
    get: key => storageCall('get', key),
    set: (key, value) => storageCall('set', key, value),
    batch: entries => storageCall('batch', entries),
  }),
  video: Object.freeze({
    import: () => ipcRenderer.invoke('video:import'),
    list: () => ipcRenderer.invoke('video:list'),
    setAlbum: (id, albumId) => ipcRenderer.invoke('video:set-album', id, albumId),
  }),
}));
