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
  libraryBackup: operation => ipcRenderer.invoke('backup:library', operation),
  setAutoStart: enabled => ipcRenderer.invoke('system:action', 'autostart', enabled),
  importOfflineMap: () => ipcRenderer.invoke('maps:import'),
  removeOfflineMap: () => ipcRenderer.invoke('system:action', 'remove-offline-map'),
  discoverTVs: () => ipcRenderer.invoke('tv:discover'),
  tv: Object.freeze({
    connect: deviceId => ipcRenderer.invoke('tv:connect', deviceId),
    play: media => ipcRenderer.invoke('tv:play', media),
    slideshow: media => ipcRenderer.invoke('tv:slideshow', media),
    control: action => ipcRenderer.invoke('tv:control', action),
    disconnect: () => ipcRenderer.invoke('tv:disconnect'),
  }),
  onBackupError: callback => {
    const listener = () => callback();
    ipcRenderer.on('backup:error', listener);
    return () => ipcRenderer.removeListener('backup:error', listener);
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
    setLocation: (id, location, source = 'user') => ipcRenderer.invoke('video:set-location', id, location, source),
  }),
}));
